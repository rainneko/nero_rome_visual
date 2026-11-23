"""Shared geometry delivery for the East Palace's room furnishing assets.

The Rome kit generates the same triangles for the Blender and plain Python
entry points. Blender can additionally render the furnished rooms.
"""

import argparse
from collections import defaultdict
import json
import math
from pathlib import Path
import struct
import sys
from types import ModuleType


# The kit's geometry needs vector arithmetic, but no Blender scene.
class GeometryVector:
    def __init__(self, values):
        self.x, self.y, self.z = values

    def __iter__(self):
        return iter((self.x, self.y, self.z))

    def __getitem__(self, index):
        return (self.x, self.y, self.z)[index]

    def __len__(self):
        return 3

    def __add__(self, other):
        return GeometryVector(a + b for a, b in zip(self, other))

    def __sub__(self, other):
        return GeometryVector(a - b for a, b in zip(self, other))

    def __mul__(self, factor):
        return GeometryVector(v * factor for v in self)

    __rmul__ = __mul__

    def __truediv__(self, factor):
        return self * (1 / factor)

    def __neg__(self):
        return self * -1

    def dot(self, other):
        return sum(a * b for a, b in zip(self, other))

    def cross(self, other):
        x, y, z = self
        a, b, c = other
        return GeometryVector((y * c - z * b, z * a - x * c, x * b - y * a))

    @property
    def length_squared(self):
        return self.dot(self)

    @property
    def length(self):
        return math.sqrt(self.length_squared)

    def copy(self):
        return GeometryVector(self)

    def normalized(self):
        return self / self.length if self.length else self.copy()

    def normalize(self):
        self.x, self.y, self.z = self.normalized()

    def lerp(self, other, amount):
        return self + (other - self) * amount


try:
    import bpy
except ModuleNotFoundError:
    bpy = None
    mathutils = ModuleType("mathutils")
    mathutils.Vector = GeometryVector
    mathutils.Matrix = None
    sys.modules.update(bpy=ModuleType("bpy"), mathutils=mathutils)
else:
    from mathutils import Vector as BlenderVector

import rk
from plan_interior import MATS as INTERIOR_MATERIALS

kit = rk._bk
# Real mathutils uses float32; geometry uses the same precision in both runners.
kit.Vector = rk.Vector = GeometryVector
kit.F0 = rk.F0 = rk.Frame()
ROOT = Path(__file__).resolve().parents[3]
UP_GLB = (0, 1, 0)
ROOM_CONTEXT = {
    "S01": ((-16, 16, -36, -24), {"N": ((0, 2.4, 3.6),),
            "S": ((0, 2.4, 3.6), (10, 1.2, 2.2)), "E": ((-30, 1.2, 2.2),)}),
    "S09": ((24, 32, -46, -36), {"N": ((28, 1.2, 2.2),), "W": ((-40, 1.2, 2.2),)}),
    # The two eastern openings in this preview stand in for the future balcony doors.
    "2E04": ((38, 50, -24, -6), {"N": ((47, 1.6, 2.6),), "W": ((-15, 1.6, 2.6),),
             "E": ((-15, 2.3, 3.45), (-9.6, 2.3, 3.45))}),
}
PREVIEW_WIDTH = {"S01": 35, "S09": 11, "2E04": 20}


def srgb(linear):
    return 12.92 * linear if linear <= .0031308 else 1.055 * linear**(1 / 2.4) - .055


def to_gltf(v):
    return v[0], v[2], -v[1]


def cross(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0])


def unit(v):
    length = math.sqrt(sum(x * x for x in v))
    return tuple(x / length for x in v) if length else tuple(v)


def face_triangles(points, normal):
    """Triangulate a kit polygon, including concave ones, in its dominant plane."""
    axis = max(range(3), key=lambda i: abs(normal[i]))
    axes = (axis + 1) % 3, (axis + 2) % 3
    plane = [(p[axes[0]], p[axes[1]]) for p in points]
    sign = 1 if normal[axis] > 0 else -1

    def turn(a, b, c):
        p, q, r = plane[a], plane[b], plane[c]
        return sign * ((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]))

    remaining = list(range(len(points)))
    while len(remaining) > 3:
        for i, b in enumerate(remaining):
            a, c = remaining[i - 1], remaining[(i + 1) % len(remaining)]
            area = turn(a, b, c)
            if abs(area) < 1e-10:
                remaining.pop(i)
                break
            if area < 0:
                continue
            if any(min(turn(a, b, p), turn(b, c, p), turn(c, a, p)) > 1e-9
                   for p in remaining if p not in (a, b, c)):
                continue
            yield a, b, c
            remaining.pop(i)
            break
        else:
            raise ValueError(f"Cannot triangulate a furnishing face: {points}")
    if len(remaining) == 3 and abs(turn(*remaining)) >= 1e-10:
        yield tuple(remaining)


def triangles(buffers):
    """Yield triangles and corner normals from the Rome kit's geometry buffers."""
    vertices, faces, flags = buffers
    averaged = defaultdict(lambda: [0.0, 0.0, 0.0])
    prepared = []
    for face, smooth in zip(faces, flags):
        points = list(dict.fromkeys(tuple(round(c, 6) for c in vertices[i]) for i in face))
        if len(points) < 3:
            continue
        edges = [tuple(c - d for c, d in zip(p, points[0])) for p in points]
        area = [0.0, 0.0, 0.0]
        for a, b in zip(edges, edges[1:] + edges[:1]):
            for i, value in enumerate(cross(a, b)):
                area[i] += value
        if sum(x * x for x in area) <= 1e-18:
            continue
        normal = unit(area)
        if smooth:
            for p in points:
                for i, value in enumerate(area):
                    averaged[p][i] += value
        prepared.append((points, normal, smooth))
    for points, normal, smooth in prepared:
        for indices in face_triangles(points, normal):
            corners = [points[i] for i in indices]
            normals = [unit(averaged[p]) if smooth and any(averaged[p]) else normal for p in corners]
            yield corners, normals


def collect(furnish, tints):
    for material in ("int_plaster", "int_reveal"):
        kit.PAL.setdefault(material, (tuple(map(srgb, INTERIOR_MATERIALS[material])), 0, .92))
    for alias, (material, color) in tints.items():
        _, metallic, roughness = kit.PAL[material]
        if alias in kit.PAL or len(color) != 3 or not all(0 <= v <= 1 for v in color):
            raise ValueError(f"Invalid or conflicting vertex color {alias}")
        kit.PAL[alias] = color, metallic, roughness
    kit._G.clear()
    try:
        furnish()
        geometry = {}
        tinted = {canonical for alias, (canonical, _) in tints.items() if alias in kit._G}
        for alias, geom in kit._G.items():
            material = tints[alias][0] if alias in tints else alias
            color = kit._lin(kit.PAL[alias][0]) if material in tinted else None
            positions, normals, colors, indices, cache = geometry.setdefault(
                material, ([], [], [], [], {}))
            for points, face_normals in triangles(geom):
                for point, normal in zip(points, face_normals):
                    normal = tuple(round(x, 6) for x in normal)
                    key = point, normal, color
                    if key not in cache:
                        cache[key] = len(positions)
                        positions.append(point)
                        normals.append(normal)
                        if color is not None:
                            colors.append(color)
                    indices.append(cache[key])
        return {material: (p, n, c, i) for material, (p, n, c, i, _) in geometry.items() if i}
    finally:
        kit._G.clear()
        for alias in tints:
            kit.PAL.pop(alias, None)


def glb_slot(name, position, direction, extras):
    forward = unit(to_gltf(direction))
    if not any(forward):
        raise ValueError(f"Zero direction on {name}")
    node = {"name": name, "translation": to_gltf(position), "extras": extras}
    if forward == (0, -1, 0):
        node["rotation"] = (1, 0, 0, 0)
    elif forward != UP_GLB:
        node["rotation"] = unit((*cross(UP_GLB, forward), 1 + forward[1]))
    return node


def write_glb(path, room, geometry, slots):
    room_name = "room_" + room
    document = {
        "asset": {"version": "2.0", "generator": "Rome furnishing geometry"},
        # Pre-quantized normals keep the color data intact through the game's
        # GLB optimizer, which only rewrites plain position and normal meshes.
        "extensionsUsed": ["KHR_mesh_quantization"],
        "extensionsRequired": ["KHR_mesh_quantization"],
        "scene": 0, "scenes": [{"nodes": [0]}],
        "nodes": [{"name": "interior", "children": [1]}, {"name": room_name, "mesh": 0}],
        "meshes": [{"name": room_name, "primitives": []}], "materials": [],
        "bufferViews": [], "accessors": [],
    }
    if slots:
        document["nodes"][1]["children"] = list(range(2, 2 + len(slots)))
        document["nodes"].extend(glb_slot(*slot) for slot in slots)
    binary = bytearray()

    def accessor(values, layout, bound=False, quantized_normal=False):
        is_index = layout == "SCALAR"
        code = ("H" if max(values) < 65536 else "I") if is_index else "f"
        if quantized_normal:
            code = "b"
            values = [[round(v * 127) for v in normal] + [0] for normal in values]
        flat = values if is_index else [v for point in values for v in point]
        raw = struct.pack(f"<{len(flat)}{code}", *flat)
        binary.extend(b"\0" * (-len(binary) % 4))
        offset = len(binary)
        binary.extend(raw)
        views = document["bufferViews"]
        encoding = {"b": 5120, "f": 5126, "H": 5123, "I": 5125}
        spec = {"bufferView": len(views), "componentType": encoding[code],
                "count": len(values), "type": layout}
        if bound:
            axes = list(zip(*struct.iter_unpack("<3f", raw)))
            spec.update(min=[min(axis) for axis in axes], max=[max(axis) for axis in axes])
        view = {"buffer": 0, "byteOffset": offset, "byteLength": len(raw),
                "target": 34963 if is_index else 34962}
        if quantized_normal:
            spec["normalized"] = True
            view["byteStride"] = 4
        views.append(view)
        ident = len(document["accessors"])
        document["accessors"].append(spec)
        return ident

    for material, (positions, normals, colors, indices) in geometry.items():
        palette, metallic, roughness = kit.PAL[material]
        base = (1, 1, 1) if colors else kit._lin(palette)
        attrs = {
            "POSITION": accessor([to_gltf(v) for v in positions], "VEC3", bound=True),
            "NORMAL": accessor([to_gltf(v) for v in normals], "VEC3", quantized_normal=True),
        }
        if colors:
            attrs["COLOR_0"] = accessor(colors, "VEC3")
        document["meshes"][0]["primitives"].append({
            "attributes": attrs, "indices": accessor(indices, "SCALAR"),
            "material": len(document["materials"]), "mode": 4,
        })
        document["materials"].append({
            "name": material, "doubleSided": True,
            "pbrMetallicRoughness": {"baseColorFactor": [*base, 1],
                                     "metallicFactor": metallic, "roughnessFactor": roughness},
        })
    binary.extend(b"\0" * (-len(binary) % 4))
    document["buffers"] = [{"byteLength": len(binary)}]
    meta = json.dumps(document, separators=(",", ":"), allow_nan=False).encode()
    meta += b" " * (-len(meta) % 4)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(struct.pack("<4sIII4s", b"glTF", 2, 28 + len(meta) + len(binary), len(meta), b"JSON")
                     + meta + struct.pack("<I4s", len(binary), b"BIN\0") + binary)


def bedroom_alcove(west, east, south, floor, head):
    """Temporary arch, raised platform, side returns and removable ceiling."""
    near, far = -19.85, -20.15
    left, right = 42.5, 45.5
    spring = floor + 1.30
    arch = [(44 - 1.5 * math.cos(math.pi * i / 20), spring + 1.5 * math.sin(math.pi * i / 20))
            for i in range(21)]
    for side in (near, far):
        for a, b in ((west, left), (right, east)):
            face = [(a, side, floor), (a, side, head), (b, side, head), (b, side, floor)]
            rk.add_poly("preview_wall", face if side == near else face[::-1])
        for (a, z_a), (b, z_b) in zip(arch, arch[1:]):
            face = [(a, side, z_a), (a, side, head), (b, side, head), (b, side, z_b)]
            rk.add_poly("preview_wall", face if side == near else face[::-1])
    reveal = [(left, floor), *arch, (right, floor)]
    for (a, z_a), (b, z_b) in zip(reveal, reveal[1:]):
        rk.add_poly("preview_wall", [(a, near, z_a), (a, far, z_a), (b, far, z_b), (b, near, z_b)])
    depth = far - south
    center = (far + south) / 2
    rk.box(None, 44, center, floor, 7.60, depth, 7.208 - floor, "preview_floor")
    for a, b in ((west, 40.2), (47.8, east)):
        rk.box(None, (a + b) / 2, center, floor, b - a, depth, 10.26 - floor, "preview_wall")
    rk.box(None, 44, center, 10.26, 7.6, depth, .14, "preview_alcove_ceiling")


def preview_geometry(room):
    """Append the neutral walls, door openings and floor used only by the cameras."""
    (west, east, south, north), openings = ROOM_CONTEXT[room]
    west, east, south, north = west + .245, east - .245, south + .245, north - .245
    kit.PAL.update({"preview_wall": ((.67, .65, .61), 0, .92),
                    "preview_floor": ((.57, .54, .49), 0, .92),
                    "preview_column": ((.75, .73, .70), 0, .92),
                    "preview_alcove_ceiling": ((.63, .61, .57), 0, .92)})
    kit._G.clear()
    floor = 7.06 if room == "2E04" else .06
    head = 12.0 if room == "2E04" else 6.70
    ground = floor - .002
    rk.add_poly("preview_floor", [(west, south, ground), (east, south, ground),
                                  (east, north, ground), (west, north, ground)])
    for side, fixed, start, end in (("N", north, west, east), ("S", south, west, east),
                                     ("E", east, south, north), ("W", west, south, north)):
        def panel(a, b, low, high):
            if b - a < 1e-5:
                return
            points = [(u, fixed, z) if side in ("N", "S") else (fixed, u, z)
                      for u, z in ((a, low), (b, low), (b, high), (a, high))]
            rk.add_poly("preview_wall", points[::-1] if side in ("S", "E") else points)

        cursor = start
        for center, width, height in openings.get(side, ()):
            left, right = center - width / 2, center + width / 2
            panel(cursor, left, ground, head)
            panel(left, right, height + floor, head)
            cursor = right
        panel(cursor, end, ground, head)
    if room == "S01":
        centers = [(x, y) for x in (-13.6, -8.5, -3.6, 3.6, 8.5, 13.6)
                   for y in (-33.6, -26.4)]
        centers.extend((x, y) for x in (-13.6, 13.6) for y in (-32, -28))
        for x, y in centers:
            rk.cyl(None, x, y, .06, .30, 6.70, "preview_column", seg=12)
    elif room == "2E04":
        bedroom_alcove(west, east, south, floor, head)


def render_previews(path, room, views, directory):
    rk.reset()
    bpy.ops.import_scene.gltf(filepath=str(path))
    for obj in bpy.data.objects:
        if obj.type == "EMPTY" and obj.name.startswith("slot_"):
            obj.empty_display_type = "PLAIN_AXES"
    preview_geometry(room)
    ceiling_geometry = kit._G.pop("preview_alcove_ceiling", None)
    kit._build_object("preview_context")
    ceiling = None
    if ceiling_geometry:
        kit._G.clear()
        kit._G["preview_alcove_ceiling"] = ceiling_geometry
        ceiling = kit._build_object("preview_alcove_ceiling")
    directory.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 24
    scene.cycles.use_denoising = True
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.world = bpy.data.worlds.new("Neutral room")
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (.83, .83, .85, 1)
    bg.inputs[1].default_value = .65
    scene.view_settings.view_transform = "AgX"
    key = bpy.data.lights.new("Daylight", "SUN")
    key.energy = 2.25
    key.angle = math.radians(18)
    key_obj = bpy.data.objects.new(key.name, key)
    scene.collection.objects.link(key_obj)
    view = bpy.data.cameras.new("Inspection camera")
    camera = bpy.data.objects.new(view.name, view)
    scene.collection.objects.link(camera)
    scene.camera = camera
    for filename, eye, target, lens, *sensor in views:
        plan = "plan" in filename
        if ceiling is not None:
            ceiling.hide_render = plan
        light_direction = (-.91, .30, -.34) if room == "2E04" and not plan else (.18, .24, -1)
        key_obj.rotation_euler = BlenderVector(light_direction).to_track_quat("-Z", "Y").to_euler()
        camera.location = eye
        camera.rotation_euler = (0, 0, 0) if plan else (
            BlenderVector(target) - BlenderVector(eye)).to_track_quat("-Z", "Y").to_euler()
        view.type = "ORTHO" if plan else "PERSP"
        view.ortho_scale = PREVIEW_WIDTH[room]
        view.sensor_width = sensor[0] if sensor else 36
        view.lens = lens
        view.clip_start = .05
        scene.render.resolution_x, scene.render.resolution_y = (
            ((1580, 720) if room == "S01" else (1250, 1250))
            if plan else (1500, 1000))
        scene.render.filepath = str(directory / filename)
        bpy.ops.render.render(write_still=True)


def deliver(name, room, limit, furnish, tints, slots, views):
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-root", type=Path, default=ROOT)
    parser.add_argument("--skip-renders", action="store_true")
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else
                             sys.argv[1:] if bpy is None else [])
    model = collect(furnish, tints)
    count = sum(len(geometry[3]) // 3 for geometry in model.values())
    if not 0 < count <= limit:
        raise ValueError(f"{name}: {count} triangles (budget {limit})")
    path = args.output_root / "assets/models/rome" / f"{name}.glb"
    write_glb(path, room, model, slots)
    print(f"{name}: {count}/{limit} triangles. {path}")
    if not args.skip_renders and bpy is not None:
        render_previews(path, room, views, args.output_root / "renders" / name)
