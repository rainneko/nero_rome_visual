"""Seven reusable water fittings for the Domus Transitoria, without water meshes.

Geometry and slots are local in metres, with +Y north, +Z up and the front
towards -Y. The named parts carry the display-row offset at the object level.
The glTF exporter converts Blender +Z to glTF +Y, including the jet axes.
"""

import argparse
import json
import math
from pathlib import Path
import re
import struct
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rk
from rk import _bk as kit


NAME = "rome_tr_kit_water"
ROOT = Path(__file__).resolve().parents[3]
# The existing East Palace interior reveal colour (plan_interior.py).
kit.PAL.setdefault("int_reveal", ((.20, .15, .10), 0, .94))
FRAME = rk.Frame()
UP = (0, 0, 1)
SOUTH = (0, -1, 0)
STEP_RISE = .182
STEP_RUN = .30
STEP_COUNT = 5
CHANNEL_WIDTH = .76
WALL_BASIN_Y = -.345
RIM_HEIGHT = .75

PREVIEWS = (
    ("cam1-row-front.png", (15, -26, 3.0), (15, 0, .80), 24),
    ("cam2-row-plan.png", (15, -1, 22), (15, -1, 0), 24),
    ("cam3-wall-fountain.png", (1.2, -3.4, 1.66), (0, 0, 1.3), 32),
    ("cam4-basin-tazza.png", (10, -10, 1.66), (10, 0, .9), 24),
)


def slab(cx, y0, y1, z0, z1, width, material="marble"):
    rk.box(FRAME, cx, (y0 + y1) / 2, z0, width, y1 - y0, z1 - z0, material)


def bridge_rings(first, second, material, smooth=False):
    """Wound side faces from one ordered loop to the next, including poles."""
    length = len(first) if len(first) > 1 else len(second)
    for i in range(length):
        j = (i + 1) % length
        if len(first) == 1:
            face = (first[0], second[j], second[i])
        elif len(second) == 1:
            face = (first[i], first[j], second[0])
        else:
            face = (first[i], first[j], second[j], second[i])
        rk.add_poly(material, face, smooth)


def solid_of_revolution(profile, material="marble", seg=16, cx=0, cy=0, inlay=None):
    """Revolve an ordered perimeter. Explicit poles keep closed ends non-degenerate."""
    rings = []
    for radius, z in profile:
        if radius == 0:
            rings.append([(cx, cy, z)])
        else:
            rings.append([(cx + radius * math.cos(math.tau * i / seg),
                           cy + radius * math.sin(math.tau * i / seg), z) for i in range(seg)])
    for i, (first, second) in enumerate(zip(rings, rings[1:])):
        smooth = profile[i][1] != profile[i + 1][1] and radius_nonzero(profile, i)
        bridge_rings(first, second, "porphyry" if i == inlay else material, smooth)


def radius_nonzero(profile, i):
    return profile[i][0] != 0 and profile[i + 1][0] != 0


def bronze_lion(base_y, outlet_y, mouth_z, scale=1.0):
    """A faceted bronze mane, face, twin muzzle lobes and a hollow spout."""
    def feature(x, depth, z):
        return x * scale, base_y - depth * scale, mouth_z + z * scale

    angles = [math.tau * n / 12 for n in range(12)]
    mane_edge = []
    mane_ridge = []
    image_edge = []
    for i, angle in enumerate(angles):
        x, z = math.cos(angle), math.sin(angle)
        flare = 1.0 if i % 2 == 0 else .92
        mane_edge.append(feature(.15 * x * flare, 0, .15 * z * flare + .028))
        mane_ridge.append(feature(.123 * x, .018 if i % 2 else .028, .125 * z + .028))
        image_edge.append(feature(.089 * x, .032 if z < -.3 else .042, .098 * z + .022))
    for first, second in ((mane_edge, mane_ridge), (mane_ridge, image_edge)):
        for i in range(12):
            j = (i + 1) % 12
            rk.add_poly("bronze", (first[i], first[j], second[j], second[i]))
    for i in range(12):
        j = (i + 1) % 12
        rk.add_poly("bronze", (image_edge[i], image_edge[j], feature(0, .047, .016)))

    # The brows and the two whisker pads catch light at different angles.
    for sign in (-1, 1):
        for outline, ridge in (
            (((.012, .040, .047), (.076, .031, .057), (.070, .033, .088),
              (.030, .043, .078)), (.039, .066, .067)),
            (((.008, .041, -.022), (.060, .037, -.026), (.079, .032, .003),
              (.040, .043, .035)), (.042, .078, .006)),
        ):
            ring = [feature(sign * x, depth, z) for x, depth, z in outline][::sign]
            crest = feature(sign * ridge[0], ridge[1], ridge[2])
            for i in range(len(ring)):
                rk.add_poly("bronze", (ring[i], ring[(i + 1) % len(ring)], crest))
    rk.add_poly("bronze", (feature(-.025, .065, .032), feature(.025, .065, .032),
                           feature(0, .062, .054)))
    # The local coordinates of the nose bore exactly match the jet slot.
    pipe = ((.025, base_y - .055 * scale), (.021, outlet_y + .008),
            (.023, outlet_y), (.014, outlet_y), (.014, outlet_y + .024))
    rings = [[(radius * scale * math.cos(math.tau * i / 8), y,
               mouth_z + radius * scale * math.sin(math.tau * i / 8))
              for i in range(8)] for radius, y in pipe]
    for first, second in zip(rings, rings[1:]):
        bridge_rings(first, second, "bronze", True)


def semi_elliptic_outline(width, back_y, south_y, angles):
    """A straight-backed semicircle seen from the basin's circular well."""
    depth = back_y - south_y
    offset = WALL_BASIN_Y - back_y
    points = []
    for angle in angles:
        dx, dy = math.cos(angle), math.sin(angle)
        a = (dx / width) ** 2 + (dy / depth) ** 2
        b = 2 * offset * dy / depth ** 2
        c = (offset / depth) ** 2 - 1
        radius = (-b + math.sqrt(b * b - 4 * a * c)) / (2 * a)
        if dy > 0:
            radius = min(radius, -offset / dy)
        points.append((radius * dx, WALL_BASIN_Y + radius * dy))
    return points


def wall_basin():
    angles = [math.tau * i / 16 for i in range(16)]
    center = (0, WALL_BASIN_Y)
    rings = [[(*center, .27)]]
    profile = ((.53, -.016, -.56, .27), (.61, -.012, -.63, .48),
               (.68, -.009, -.70, .69),
               (.68, -.009, -.70, RIM_HEIGHT))
    for width, back_y, south_y, z in profile:
        rings.append([(x, y, z) for x, y in semi_elliptic_outline(width, back_y, south_y, angles)])
    for radius, z in ((.279, RIM_HEIGHT), (.263, .69), (.212, .56)):
        rings.append([(radius * math.cos(a), WALL_BASIN_Y + radius * math.sin(a), z)
                      for a in angles])
    rings.append([(*center, .546)])
    for first, second in zip(rings, rings[1:]):
        bridge_rings(first, second, "marble")


def stone_arch():
    spring = 1.66
    inside = .435
    outside = .557
    steps = 10

    def point(radius, i, y):
        a = math.pi * i / steps
        return radius * math.cos(a), y, spring + radius * math.sin(a)

    # Single recessed back plane behind the lion, an inward-facing vault,
    # and a narrow band in front. The adjoining jambs run down to the basin.
    back = [(-inside, -.06, .765), (inside, -.06, .765)]
    back.extend(point(inside, i, -.06) for i in range(steps + 1))
    rk.add_poly("marble", back)
    for i in range(steps):
        j = i + 1
        for r1, y1, r2, y2 in ((inside, -.06, inside + .025, -.285),
                               (inside + .025, -.285, outside, -.285),
                               (outside, -.285, outside, -.018)):
            rk.add_poly("marble", (point(r1, j, y1), point(r1, i, y1),
                                   point(r2, i, y2), point(r2, j, y2)))
    for sign in (-1, 1):
        slab(sign * (inside + outside) / 2, -.285, -.018, .765, spring, outside - inside)
        slab(sign * (inside + outside) / 2, -.305, -.018, spring - .057, spring, .155)


def wall_fountain():
    slab(0, -.28, 0, 0, .075, 1.40)
    slab(0, -.29, -.015, .075, .30, .86)
    slab(0, -.067, 0, .29, .77, 1.45)
    wall_basin()
    stone_arch()
    for x in (-.625, .625):
        slab(x, -.28, -.045, .075, .77, .214)
        slab(x, -.365, -.135, .77, .825, .239)
        solid_of_revolution(((0, .825), (.114, .825), (.114, .855),
                             (.091, .89)), seg=8, cx=x, cy=-.25)
        solid_of_revolution(((.091, .89), (.099, 1.04), (.073, 2.22)),
                            "giallo", 12, x, -.25)
        solid_of_revolution(((.073, 2.22), (.108, 2.27), (.108, 2.306)),
                            seg=8, cx=x, cy=-.25)
        slab(x, -.365, -.134, 2.306, 2.353, .229)
    slab(0, -.311, 0, 2.220, 2.36, 1.13)
    slab(0, -.345, 0, 2.353, 2.475, 1.47)
    slab(0, -.383, 0, 2.475, 2.526, 1.55)
    slab(0, -.419, 0, 2.526, 2.60, 1.60)
    bronze_lion(-.055, -.24, 1.35, 1.19)


def round_basin():
    solid_of_revolution(((0, 0), (2.43, 0), (2.47, .055), (2.50, .405),
                         (2.50, .45), (2.20, .45), (2.20, .37), (0, .04)), seg=16)
    solid_of_revolution(((0, .04), (.32, .04), (.32, .13), (.19, .29),
                         (.19, .64), (.30, .70), (.69, .84), (.80, 1.032),
                         (.80, 1.10), (.703, 1.10), (.69, 1.045),
                         (0, .92)), seg=16)
    solid_of_revolution(((0, .920), (.060, .920), (.055, 1.01), (.030, 1.225),
                         (.037, 1.25), (.020, 1.25), (.020, 1.213)), "bronze", seg=8)


def labrum():
    slab(0, -.265, .265, 0, .075, .53)
    solid_of_revolution(((0, .075), (.20, .075), (.20, .12), (.144, .18),
                         (.104, .39), (.14, .62), (.23, .674), (.56, .72),
                         (.67, .79), (.75, .882), (.75, .95), (.664, .95),
                         (.65, .878), (.52, .795), (0, .782)),
                        "porphyry", seg=16)


def great_tazza():
    profile = ((0, 0), (1.90, 0), (1.90, .15), (1.60, .15), (1.60, .30),
               (1.30, .30), (1.30, .45), (.43, .45), (.43, .49), (.31, .54),
               (.245, .68), (.34, .82), (.57, .87), (1.12, 1.02), (1.27, 1.15),
               (1.30, 1.24), (1.30, 1.30), (1.22, 1.30), (1.15, 1.24),
               (1.08, 1.14), (0, 1.08))
    # A single 80 mm annulus atop the marble lip, with no coplanar backing.
    inlay = profile.index((1.30, 1.30))
    solid_of_revolution(profile, seg=22, inlay=inlay)


def spout():
    slab(0, -.068, 0, -.25, .25, .50)
    slab(0, -.080, -.068, -.231, .231, .462)
    bronze_lion(-.077, -.180, 0)


def staircase():
    # The downstream step begins with its exposed riser. Omit the upstream
    # cap, so the next part owns the shared riser when repeated at (+1.50,+.91).
    half_channel = CHANNEL_WIDTH / 2
    for i in range(STEP_COUNT):
        y0, y1 = i * STEP_RUN, (i + 1) * STEP_RUN
        base, tread = i * STEP_RISE, (i + 1) * STEP_RISE
        profiles = ((y0, base), (y0, tread - .045),
                    (y0 + .013, tread - .028), (y0 + .013, tread - .016),
                    (y0, tread))
        for (y_a, z_a), (y_b, z_b) in zip(profiles, profiles[1:]):
            rk.add_poly("marble", ((-half_channel, y_a, z_a), (half_channel, y_a, z_a),
                                   (half_channel, y_b, z_b), (-half_channel, y_b, z_b)))
        rk.add_poly("marble", ((-half_channel, y0, tread), (half_channel, y0, tread),
                               (half_channel, y1, tread), (-half_channel, y1, tread)))
        for sign in (-1, 1):
            inner, outer = sign * half_channel, sign * .50
            rail_top = tread + .15
            rail_base = base + .15 if i else 0
            for quad in (
                ((inner, y0, rail_top), (outer, y0, rail_top),
                 (outer, y1, rail_top), (inner, y1, rail_top)),
                ((outer, y0, 0), (outer, y1, 0),
                 (outer, y1, rail_top), (outer, y0, rail_top)),
                ((inner, y0, rail_top), (inner, y1, rail_top),
                 (inner, y1, tread), (inner, y0, tread)),
                ((inner, y0, rail_base), (outer, y0, rail_base),
                 (outer, y0, rail_top), (inner, y0, rail_top)),
            ):
                rk.add_poly("marble", quad[::sign])
    length = STEP_COUNT * STEP_RUN
    rk.add_poly("marble", ((-.50, 0, 0), (-.50, length, 0),
                           (.50, length, 0), (.50, 0, 0)))


def puteal():
    # Alternating radii carve eight broad, shadowed vertical channels.
    segment_count = 16
    profiles = ((.43, .43, 0), (.445, .445, .06), (.424, .394, .13),
                (.424, .394, .69), (.45, .45, .765), (.45, .45, .80),
                (.404, .404, .80), (.394, .394, .789), (.384, .384, .80),
                (.33, .33, .80), (.33, .33, .16), (0, 0, .16))

    def ring(outer, inner, z):
        if not outer:
            return [(0, 0, z)]
        result = []
        for i in range(segment_count):
            a = math.tau * i / segment_count
            radius = outer if i % 2 == 0 else inner
            result.append((radius * math.cos(a), radius * math.sin(a), z))
        return result

    rings = [ring(*profile) for profile in profiles]
    for first, second in zip(rings, rings[1:]):
        material = "int_reveal" if first[0][0] == .33 else "travertine"
        bridge_rings(first, second, material)
    # Bronze hook laid from the rear coping into the opening, no suspended rope.
    outline = ((.407, .803), (.383, .831), (.34, .829), (.315, .80),
               (.306, .748), (.286, .743), (.271, .761), (.259, .751),
               (.28, .728), (.316, .732), (.332, .789), (.350, .815),
               (.378, .817), (.395, .795))
    front = [(.015, y, z) for y, z in outline]
    back = [(.032, y, z) for y, z in outline]
    rk.add_poly("bronze", front)
    rk.add_poly("bronze", back[::-1])
    for i in range(len(outline)):
        j = (i + 1) % len(outline)
        rk.add_poly("bronze", (front[i], back[i], back[j], front[j]))


PARTS = (
    ("kit_wall_fountain", 0, wall_fountain),
    ("kit_round_basin", 5, round_basin),
    ("kit_labrum", 10, labrum),
    ("kit_great_tazza", 15, great_tazza),
    ("kit_spout", 20, spout),
    ("kit_cascade", 25, staircase),
    ("kit_puteal", 30, puteal),
)
LIMITS = dict(zip((name for name, _, _ in PARTS), (900, 600, 500, 900, 300, 400, 400)))


def jet(position, direction, kind):
    return "slot_jet_1", position, direction, {"kind": kind}


def water(number, position, radius):
    return f"slot_water_{number}", position, UP, {"shape": "disc", "size": [radius]}


def fall(number, position, width, drop):
    return f"slot_fall_{number}", position, UP, {"size": [width, drop]}


SLOTS = {
    "kit_wall_fountain": (jet((0, -.24, 1.35), SOUTH, "arc"),
                          water(1, (0, WALL_BASIN_Y, .69), .257)),
    "kit_round_basin": (jet((0, 0, 1.25), UP, "up"),
                        water(1, (0, 0, 1.06), .677), water(2, (0, 0, .37), 2.152),
                        fall(1, (0, 0, 1.1), math.tau * .8, .73)),
    "kit_labrum": (water(1, (0, 0, .91), .636),),
    "kit_great_tazza": (water(1, (0, 0, 1.26), 1.16),),
    "kit_spout": (jet((0, -.18, 0), SOUTH, "arc"),),
    "kit_cascade": tuple(fall(i + 1, (0, i * STEP_RUN, (i + 1) * STEP_RISE),
                              CHANNEL_WIDTH, STEP_RISE) for i in range(STEP_COUNT)),
    "kit_puteal": (water(1, (0, 0, .20), .32),),
}


def make_empty(name, parent=None, position=(0, 0, 0)):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.empty_display_type = "PLAIN_AXES"
    obj.empty_display_size = .12
    obj.parent = parent
    obj.location = position
    return obj


def assemble():
    root = make_empty("kit")
    triangles = {}
    for name, offset, builder in PARTS:
        kit._G.clear()
        builder()
        part = kit._build_object(name)
        part.parent = root
        part.location = (offset, 0, 0)
        part.data.calc_loop_triangles()
        triangles[name] = len(part.data.loop_triangles)
        if not 0 < triangles[name] <= LIMITS[name]:
            raise ValueError(f"{name}: {triangles[name]} triangles, budget {LIMITS[name]}")
        for slot_name, position, direction, data in SLOTS[name]:
            slot = make_empty(slot_name, part, position)
            if direction == SOUTH:
                slot.rotation_euler.x = math.pi / 2
            for key, value in data.items():
                slot[key] = value
    if sum(triangles.values()) > 4000:
        raise ValueError(f"Water kit exceeds its 4,000 triangle budget: {triangles}")
    for name, count in triangles.items():
        print(f"{name}: {count} triangles")
    return root


def normalize_slot_names(path):
    """Remove the global Blender suffix from the named children of each part."""
    with path.open("rb") as stream:
        magic, version, _ = struct.unpack("<4sII", stream.read(12))
        length, chunk = struct.unpack("<I4s", stream.read(8))
        if (magic, version, chunk) != (b"glTF", 2, b"JSON"):
            raise ValueError(f"Invalid GLB: {path}")
        metadata = json.loads(stream.read(length))
        remaining = stream.read()
    for node in metadata["nodes"]:
        name = node.get("name", "")
        if name.startswith("slot_"):
            node["name"] = re.sub(r"\.\d+$", "", name)
    encoded = json.dumps(metadata, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    encoded += b" " * (-len(encoded) % 4)
    with path.open("wb") as stream:
        stream.write(struct.pack("<4sIII4s", magic, version, 20 + len(encoded) + len(remaining),
                                 len(encoded), b"JSON"))
        stream.write(encoded)
        stream.write(remaining)


def export(root, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for obj in (root, *root.children_recursive):
        obj.select_set(True)
    bpy.context.view_layer.objects.active = root
    bpy.ops.export_scene.gltf(filepath=str(path), export_format="GLB", use_selection=True,
                              export_extras=True, export_yup=True, export_apply=False,
                              export_texcoords=False, export_normals=True,
                              export_cameras=False, export_lights=False)
    normalize_slot_names(path)


def preview_markers():
    # Render proxies for the empties. Height levels project to a common plan
    # position, so concentric bands distinguish the slots that share an axis.
    kit.PAL.update({
        "preview_origin": ((.13, .13, .15), 0, .65),
        "preview_jet": ((.72, .27, .16), 0, .65),
        "preview_water": ((.15, .41, .58), 0, .65),
        "preview_fall": ((.16, .48, .28), 0, .65),
    })
    kit._G.clear()
    for name, offset, _ in PARTS:
        for x0, y0, x1, y1 in ((-.17, 0, .17, 0), (0, -.17, 0, .17)):
            rk.beam(FRAME, offset + x0, y0, 3.0, offset + x1, y1, 3.0, .024, .009,
                    "preview_origin")
        count_at_position = {}
        for slot_name, (x, y, _z), _direction, _extra in SLOTS[name]:
            key = (x, y)
            index = count_at_position.get(key, 0)
            count_at_position[key] = index + 1
            radius = .087 + .047 * index
            kind = slot_name.split("_")[1]
            z = 3.06 + .02 * index
            solid_of_revolution(((radius, z), (radius + .025, z)),
                                f"preview_{kind}", 16, offset + x, y)
    return kit._build_object("preview_markers")


def render_previews(directory):
    directory.mkdir(parents=True, exist_ok=True)
    kit.PAL.update({
        "preview_ground": ((.67, .65, .61), 0, .88),
        "preview_wall": ((.52, .51, .48), 0, .88),
    })
    kit._G.clear()
    rk.add_poly("preview_ground", ((-200, -200, -.004), (200, -200, -.004),
                                    (200, 200, -.004), (-200, 200, -.004)))
    kit._build_object("preview_ground")
    kit._G.clear()
    for x, width, height in ((0, 2.75, 3.20), (20, 1.03, 1.12)):
        slab(x, .002, .16, -.005, height, width, "preview_wall")
    walls = kit._build_object("preview_walls")
    markers = preview_markers()
    bpy.data.objects["kit_spout"].location.z = .72

    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 24
    scene.cycles.use_denoising = True
    scene.render.image_settings.file_format = "PNG"
    scene.world = bpy.data.worlds.new("Preview background")
    scene.world.use_nodes = True
    ambient = scene.world.node_tree.nodes["Background"]
    ambient.inputs[0].default_value = (.74, .77, .81, 1)
    ambient.inputs[1].default_value = .55
    scene.view_settings.view_transform = "AgX"
    sun = bpy.data.objects.new("Preview sun", bpy.data.lights.new("Preview sun", "SUN"))
    bpy.context.collection.objects.link(sun)
    sun.data.energy = 2.8
    sun.data.angle = math.radians(8)
    sun.rotation_euler = Vector((.53, .72, -1)).to_track_quat("-Z", "Y").to_euler()
    camera = bpy.data.objects.new("Preview camera", bpy.data.cameras.new("Preview camera"))
    bpy.context.collection.objects.link(camera)
    scene.camera = camera
    for filename, eye, target, lens in PREVIEWS:
        plan = filename == "cam2-row-plan.png"
        markers.hide_render = not plan
        walls.hide_render = plan
        camera.location = eye
        camera.rotation_euler = (0, 0, 0) if plan else (Vector(target) - Vector(eye)).to_track_quat("-Z", "Y").to_euler()
        camera.data.type = "ORTHO" if plan else "PERSP"
        camera.data.ortho_scale = 34
        camera.data.sensor_width = 42 if filename == "cam4-basin-tazza.png" else 36
        camera.data.lens = lens
        scene.render.resolution_x = 1600
        scene.render.resolution_y = 1200 if filename == "cam3-wall-fountain.png" else (620 if plan else 850)
        scene.render.filepath = str(directory / filename)
        bpy.ops.render.render(write_still=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-root", type=Path, default=ROOT)
    parser.add_argument("--skip-renders", action="store_true")
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
    rk.reset()
    root = assemble()
    export(root, args.output_root / "assets" / "models" / "rome" / f"{NAME}.glb")
    if not args.skip_renders:
        render_previews(args.output_root / "renders" / NAME)


if __name__ == "__main__":
    main()
