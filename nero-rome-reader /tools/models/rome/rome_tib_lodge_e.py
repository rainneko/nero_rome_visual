"""Tiberiana v5 east gate lodge (work order 11 B).

Local origin is palace (62.5, -26.5, 0). Blender axes: +X east, +Y north,
+Z up. The actual stair and exterior platform belong to the site model.
"""

import argparse
import math
from pathlib import Path
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rk
from rk import _bk as kit


NAME = "rome_tib_lodge_e"
ROOT = Path(__file__).resolve().parents[3]
LIMITS = {"shell": 1500, "interior": 400}
F = rk.Frame()
EAST = F.sub(2.5, 0, rot=90)
NORTH = F.sub(0, 5.5, rot=180)
WEST = F.sub(-2.5, 0, rot=-90)
SOUTH = F.sub(0, -5.5)
WALL = .75
EAVE, RIDGE, PITCH = 9.60, 10.60, .40
EAVE_EXTRA = .60
WALL_HEAD = EAVE - .30
STONE = "travertine"
PORTAL, SPRING, RADIUS = -3.0, 2.3, 1.1
ARCH_STEPS = 12

# Camera, target, horizontal orthographic width, lens, output size.
VIEWS = {
    "front": ((27, 0, 6), (0, 0, 6), 17.4, 50, (1430, 1020)),
    "side": ((0, -30, 6), (0, 0, 5.3), 16.0, 50, (1360, 1040)),
    "three": ((20, 22, 25.4), (0, 0, 4.6), 21.0, 50, (1390, 1040)),
    "top": ((0, 0, 35), (0, 0, 0), 20.0, 50, (1320, 1060)),
    "gate": ((9.5, -3, 1.7), (2.5, -3, 1.8), None, 42, (1280, 970)),
}
# Face frame, extent, upper windows, low openings (left, right, sill, head).
FACES = {
    "east": (EAST, 5.5, (-3.5, 0, 3.5), ((-4.1, -1.9, 0, 3.4),)),
    "south": (SOUTH, 2.5, (0,), ()),
    "west": (WEST, 5.5, (-2.5, 3), ((1.1, 4.9, 0, 5),)),
    "north": (NORTH, 2.5, (0,), ((-.6, .6, 0, 2.4),)),
}


def slab(x0, x1, y0, y1, z0, z1, mat):
    rk.box(F, (x0 + x1) / 2, (y0 + y1) / 2, z0,
           x1 - x0, y1 - y0, z1 - z0, mat)


def panel(frame, a, b, depth, z0, z1, mat, back=False):
    if b - a < 1e-6 or z1 - z0 < 1e-6:
        return
    points = [frame.p(a, depth, z0), frame.p(b, depth, z0),
              frame.p(b, depth, z1), frame.p(a, depth, z1)]
    rk.add_poly(mat, points[::-1] if back else points)


def rect_outline(a, b, sill, head):
    return [(a, sill), (a, head), (b, head), (b, sill), (a, sill)]


def reveals(frame, outline, front, back, mat):
    for (a, za), (b, zb) in zip(outline, outline[1:]):
        rk.add_poly(mat, [frame.p(b, front, zb), frame.p(a, front, za),
                         frame.p(a, back, za), frame.p(b, back, zb)])


def surround(frame, opening, width, projection):
    a, b, sill, head = opening
    # Ring, not four blocks. Its inside corners join into the reveal.
    panel(frame, a - width, a, -projection, sill, head, STONE)
    panel(frame, b, b + width, -projection, sill, head, STONE)
    panel(frame, a - width, b + width, -projection, head, head + width, STONE)
    outline = rect_outline(a, b, sill, head)
    if sill:
        panel(frame, a - width, b + width, -projection, sill - width, sill, STONE)
        outer = rect_outline(a - width, b + width, sill - width, head + width)
    else:
        outline = outline[:-1]
        outer = rect_outline(a - width, b + width, sill, head + width)[:-1]
    if projection:
        reveals(frame, outer[::-1], -projection, 0, STONE)
    return outline


def arch(radius):
    return [(PORTAL + radius * math.cos(math.pi * i / ARCH_STEPS),
             SPRING + radius * math.sin(math.pi * i / ARCH_STEPS))
            for i in range(ARCH_STEPS, -1, -1)]


def arch_spandrel(depth, back=False):
    points = arch(RADIUS)
    for (a, za), (b, zb) in zip(points, points[1:]):
        face = [EAST.p(a, depth, za), EAST.p(b, depth, zb),
                EAST.p(b, depth, 3.4), EAST.p(a, depth, 3.4)]
        rk.add_poly("plaster", face[::-1] if back else face)


def arch_surround():
    points, outer = arch(RADIUS), arch(RADIUS + .35)
    inner = [(-4.1, 0), *points, (-1.9, 0)]
    outer = [(-4.45, 0), *outer, (-1.55, 0)]
    pairs = zip(inner, inner[1:], outer, outer[1:])
    for (a, za), (b, zb), (c, zc), (d, zd) in pairs:
        rk.add_poly(STONE, [EAST.p(a, -.06, za), EAST.p(b, -.06, zb),
                            EAST.p(d, -.06, zd), EAST.p(c, -.06, zc)])
    reveals(EAST, inner, -.06, WALL, STONE)
    reveals(EAST, outer[::-1], -.06, 0, STONE)


def skin(frame, lo, hi, z0, z1, holes, depth, back=False):
    """Lay out a plain face, subtracting the rectangular opening envelopes."""
    levels = sorted({z0, z1, *(z for hole in holes for z in hole[2:] if z0 < z < z1)})
    for low, high in zip(levels, levels[1:]):
        middle = (low + high) / 2
        active = sorted((max(lo, a), min(hi, b)) for a, b, sill, head in holes
                        if sill < middle < head and lo < b and a < hi)
        cursor = lo
        for a, b in active:
            panel(frame, cursor, a, depth, low, high, "plaster", back)
            cursor = b
        panel(frame, cursor, hi, depth, low, high, "plaster", back)


def quoin_start(side, left):
    return .9 if side == "east" or side == "south" and not left or side == "north" and left else 6.9


def face_finish(side, height):
    if side == "west" or side == "north" and 4.8 <= height < 6.5:
        return "plaster"
    if height < .9:
        return STONE
    floor_band_start = 6.5 if side == "north" else 6.35
    if 2.05 < height < 2.35 or floor_band_start <= height < 6.65:
        return "red"
    return "plaster"


def exterior_wall(side, frame, extent, holes):
    """Use shared elevations at the corners; the stonework is flush with the plaster."""
    first, last = quoin_start(side, True), quoin_start(side, False)
    levels = {0, 6.9, WALL_HEAD, *(z for hole in holes for z in hole[2:])}
    if side != "west":
        levels.update((.9, 2.05, 2.35, 6.65))
        levels.update((4.8, 6.5) if side == "north" else (6.35,))
    levels.update(z for i in range(1, 14) if (z := .9 + i * .60) > min(first, last))
    bands = sorted(levels)
    for low, high in zip(bands, bands[1:]):
        middle = (low + high) / 2
        course = math.floor((middle - .9) / .60 + 1e-6)
        near_long = (course % 2 == 0) == (side in ("east", "west"))
        length = .46 if near_long else .31
        finish = face_finish(side, middle)
        marks = []
        if finish == "plaster" and not (side == "north" and 4.8 <= middle < 6.5):
            if middle >= first:
                marks.append((-extent, -extent + length))
            if middle >= last:
                marks.append((extent - length, extent))
        clear = [(a, b) for a, b, sill, head in holes if sill < middle < head]
        xs = sorted({-extent, extent, *(u for ab in marks + clear for u in ab)})
        for a, b in zip(xs, xs[1:]):
            u = (a + b) / 2
            if any(left < u < right for left, right in clear):
                continue
            mat = STONE if any(left < u < right for left, right in marks) else finish
            panel(frame, a, b, 0, low, high, mat)


def windows(frame, centers):
    for center in centers:
        a, b, sill, head = center - .4, center + .4, 7.5, 8.9
        outline = surround(frame, (a, b, sill, head), .12, 0)
        reveals(frame, outline, 0, .50, STONE)
        panel(frame, a, b, .50, sill, head, "doorway")
        # Three disjoint strips avoid overlapping faces where the bars meet.
        left, right = center - .017, center + .017
        depth, rear = .095, .126
        middle = (sill + head) / 2
        panel(frame, left, right, depth, sill, head, "bronze")
        for a0, b0 in ((a, left), (right, b)):
            panel(frame, a0, b0, depth, middle - .017, middle + .017, "bronze")
            for z in (middle - .017, middle + .017):
                reveals(frame, [(a0, z), (b0, z)], depth, rear, "bronze")
        for u in (left, right):
            for low, high in ((sill, middle - .017), (middle + .017, head)):
                reveals(frame, [(u, low), (u, high)], depth, rear, "bronze")


def stud(center, z, face):
    radius = .018
    points = [EAST.p(center + radius * math.cos(i * math.tau / 6), face,
                     z + radius * math.sin(i * math.tau / 6)) for i in range(6)]
    tip = EAST.p(center, face - .014, z)
    for i, point in enumerate(points):
        rk.add_poly("bronze", [point, points[(i + 1) % len(points)], tip])


def batten(left, right, middle):
    edges = [(left, middle - .052), (right, middle - .052),
             (right, middle + .052), (left, middle + .052)]
    panel(EAST, left, right, .4375, middle - .052, middle + .052, "wood")
    reveals(EAST, [*edges, edges[0]], .4375, .45, "wood")


def closed_gate():
    for a, b in ((-4.095, -3.008), (-2.992, -1.905)):
        rk.box(EAST, (a + b) / 2, .50, .050, b - a, .10, 2.25, "wood")
        for z in (.42, 1.15, 1.88):
            batten(a + .0275, b - .0275, z)
            for i in range(1, 5):
                stud(a + (b - a) * i / 5, z, .437)
    # A recessed meeting rebate closes the gap behind the visible hairline.
    rk.box(EAST, PORTAL, .495, .050, .054, .024, 2.25, "wood")
    cap = arch(RADIUS)
    rk.add_poly("wood", [EAST.p(u, .45, z) for u, z in reversed(cap)])
    rk.add_poly("wood", [EAST.p(u, .55, z) for u, z in cap])


def roof_height(x, y):
    return RIDGE - PITCH * max(abs(x), abs(y) - 3)


def profile_rib(a, b, tangent, height, half_width):
    """A raised, low-profile imbrex over one roof slope or hip."""
    section = []
    tx, ty = tangent
    for x, y in (a, b):
        lo, hi = (x - tx * half_width, y - ty * half_width), (x + tx * half_width, y + ty * half_width)
        section.extend(((*lo, roof_height(*lo) - .007), (*hi, roof_height(*hi) - .007),
                        (x, y, roof_height(x, y) + height)))
    rk.add_mesh("tile", section, [(0, 2, 5, 3), (2, 1, 4, 5), (3, 5, 4)])


def cornice():
    profile = [(0, WALL_HEAD), (-.06, WALL_HEAD), (-.06, EAVE - .23),
               (-.11, EAVE - .23), (-.11, EAVE - PITCH * .11)]
    for frame, half in ((EAST, 5.5), (WEST, 5.5), (NORTH, 2.5), (SOUTH, 2.5)):
        # Each profile band meets its neighbour at a 45 degree mitre.
        for (d0, low), (d1, high) in zip(profile, profile[1:]):
            rk.add_poly(STONE, [frame.p(-half + d0, d0, low), frame.p(half - d0, d0, low),
                                frame.p(half - d1, d1, high), frame.p(-half + d1, d1, high)])
        # The tile plane already covers the sloped top. Close the back at the
        # wall datum and leave that exposed roof as a single material surface.
        panel(frame, -half, half, 0, WALL_HEAD, EAVE, STONE, back=True)


def hip_roof():
    x, y = 2.5 + EAVE_EXTRA, 5.5 + EAVE_EXTRA
    sw, se, ne, nw = [(*p, roof_height(*p)) for p in ((-x, -y), (x, -y), (x, y), (-x, y))]
    sr, nr = (0, -3, RIDGE), (0, 3, RIDGE)
    for face in ((sw, se, sr), (se, ne, nr, sr), (ne, nw, nr), (nw, sw, sr, nr)):
        rk.add_poly("tile", face)
        rk.add_poly("tile", [(a, b, c - .10) for a, b, c in reversed(face)])
        a, b = face[:2]
        rk.add_poly("tile", [b, a, (a[0], a[1], a[2] - .10), (b[0], b[1], b[2] - .10)])
    for sign in (-1, 1):
        for yy in range(-5, 6):
            start = max(.30, abs(yy) - 3 + .18)
            profile_rib((sign * start, yy), (sign * x, yy), (0, sign), .11, .12)
        for xx in range(-2, 3):
            start = 3 + max(.30, abs(xx) + .18)
            profile_rib((xx, sign * start), (xx, sign * y), (-sign, 0), .11, .12)
    tangent_scale = math.sqrt(.5)
    for sx, sy in ((-1, -1), (-1, 1), (1, -1), (1, 1)):
        profile_rib((sx * .24, sy * 3.24), (sx * 3.02, sy * 6.02),
                    (-sy * tangent_scale, sx * tangent_scale), .085, .094)


def shell():
    slab(-2.5, -1.75, -5.5, 5.5, -.6, 0, STONE)
    slab(1.75, 2.5, -5.5, 5.5, -.6, 0, STONE)
    slab(-1.75, 1.75, -5.5, -4.75, -.6, 0, STONE)
    slab(-1.75, 1.75, 4.75, 5.5, -.6, 0, STONE)
    for side, (frame, extent, centers, doors) in FACES.items():
        high = tuple((u - .52, u + .52, 7.38, 9.02) for u in centers)
        exterior_wall(side, frame, extent, doors + high)
        windows(frame, centers)
    arch_spandrel(0)
    arch_surround()
    closed_gate()
    slab(1.75, 2.5, -4.1, -1.9, 0, .05, STONE)
    opening = FACES["north"][3][0]
    reveals(NORTH, surround(NORTH, opening, .12, .024), -.024, WALL, STONE)
    # The west opening is flush masonry, without a trim frame.
    reveals(WEST, rect_outline(*FACES["west"][3][0])[:-1], 0, WALL, "plaster")
    cornice()
    hip_roof()


def partition():
    south = F.sub(0, -.75)
    door, hatch = (-.50, .50, 0, 2.20), (1.10, 1.70, 1.10, 1.70)
    for depth, facing in ((0, False), (.50, True)):
        skin(south, -1.75, 1.75, 0, 6.2, (door, hatch), depth, facing)
    reveals(south, rect_outline(*door)[:-1], 0, .50, "plaster")
    reveals(south, rect_outline(*hatch), 0, .50, "plaster")


def interior():
    for side, (frame, extent, _, doors) in FACES.items():
        hi = extent - WALL
        # At the southwest jamb the 3.8 m opening outwards extends 0.15 m into
        # the standard south lining. Return the lining immediately after it.
        if side == "south":
            panel(frame, -1.55, hi, WALL, 0, 5.0, "plaster", True)
            rk.add_poly("plaster", [(-1.75, -4.9, 0), (-1.55, -4.75, 0),
                                    (-1.55, -4.75, 5), (-1.75, -4.9, 5)])
            rk.add_poly("plaster", [(-1.75, -4.9, 5), (-1.75, -4.75, 5), (-1.55, -4.75, 5)])
            panel(frame, -hi, hi, WALL, 5, 6.2, "plaster", True)
        else:
            skin(frame, -hi, hi, 0, 6.2, doors, WALL, True)
        panel(frame, -hi, hi, WALL, 6.50, EAVE, "plaster", True)
    arch_spandrel(WALL, True)
    partition()


def hall_floor():
    # Follow the clear corridor throat to both west jambs.
    outline = [(-1.75, -.75), (-1.75, -1.1), (-2.50, -1.1), (-2.50, -4.9),
               (-1.75, -4.9), (-1.55, -4.75), (1.75, -4.75), (1.75, -.75)]
    rk.prism(F, outline, 0, .05, "paving")


def guard_floor():
    outline = [(-1.75, -.25), (-.50, -.25), (-.50, -.75), (.50, -.75),
               (.50, -.25), (1.75, -.25), (1.75, 4.75), (.60, 4.75),
               (.60, 5.50), (-.60, 5.50), (-.60, 4.75), (-1.75, 4.75)]
    rk.prism(F, outline, 0, .05, "paving")


def attic_floor():
    xy = [(-1.75, -4.75), (1.75, -4.75), (1.75, 4.75), (-1.75, 4.75)]
    rk.add_poly("paving", [(x, y, 6.5) for x, y in xy])
    for a, b in zip(xy, xy[1:] + xy[:1]):
        rk.add_poly("paving", [(*b, 6.5), (*a, 6.5), (*a, 6.2), (*b, 6.2)])
    for south, north, material in ((-4.75, -.25, "wood"), (-.25, 4.75, "plaster")):
        rk.add_poly(material, [(-1.75, north, 6.2), (1.75, north, 6.2),
                               (1.75, south, 6.2), (-1.75, south, 6.2)])


MESHES = {"shell": shell, "interior": interior, "room_mendao": hall_floor,
          "room_zhifang": guard_floor, "room_gelou": attic_floor}


def assemble():
    model = {}
    for name, generate in MESHES.items():
        kit._G.clear()
        generate()
        model[name] = kit._build_object(name)
        if name.startswith("room_"):
            model[name].parent = model["interior"]
    for group, limit in LIMITS.items():
        parts = [obj for name, obj in model.items() if name == group or obj.parent == model[group]]
        for obj in parts:
            obj.data.calc_loop_triangles()
        count = sum(len(obj.data.loop_triangles) for obj in parts)
        print(f"{group} {count}/{limit} triangles")
        if count > limit:
            raise ValueError(f"{group} exceeds the triangle budget")
    return model


def export(model, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for obj in model.values():
        obj.select_set(True)
    bpy.context.view_layer.objects.active = model["shell"]
    bpy.ops.export_scene.gltf(filepath=str(path), export_format="GLB", use_selection=True,
                              export_yup=True, export_apply=True, export_texcoords=False,
                              export_normals=True, export_cameras=False, export_lights=False)


def context_geometry(section):
    kit.PAL.update({"preview_grey": ((.49, .49, .49), 0, .91),
                    "preview_grey_roof": ((.59, .59, .59), 0, .82),
                    "preview_plaza": ((.52, .51, .49), 0, .91)})
    grey, roof = "preview_grey", "preview_grey_roof"
    # The single-pitch portico runs north. Keep its passage open at the door.
    rk.add_poly(roof, [(-2.5, 5.5, 6.5), (2.5, 5.5, 4.8),
                       (2.5, 60.5, 4.8), (-2.5, 60.5, 6.5)])
    slab(2.28, 2.5, 5.5, 60.5, 4.50, 4.80, grey)
    for i in range(1, 19):
        y = 5.5 + 3 * i
        slab(1.97, 2.33, y - .18, y + .18, 0, 4.50, grey)
    # Banquet aisle and main gallery stop flush at the west cheek.
    slab(-6, -2.5, -.5, 41.5, 0, 6.5, grey)
    rk.add_poly(roof, [(-6, -.5, 7.9), (-2.5, -.5, 6.5),
                       (-2.5, 41.5, 6.5), (-6, 41.5, 7.9)])
    slab(-18.5, -2.5, -5.5, -4.9, 0, 5.0, grey)
    slab(-18.5, -2.5, -1.1, -.5, 0, 5.0, grey)
    slab(-18.5, -2.5, -5.5, -.5, 5.0, 6.9, grey)
    # Neutral cutaway ground. The landing plane at the gate is level with its
    # 50 mm threshold. Only this proxy slopes to the lower saddle.
    rk.add_poly(grey, [(-150, -140, 0), (2.5, -140, 0), (2.5, 140, 0), (-150, 140, 0)])
    rk.add_poly(grey, [(2.5, -140, -3.28), (150, -140, -3.28),
                       (150, 140, -3.28), (2.5, 140, -3.28)])
    for y0, y1 in ((-140, -4.1), (-1.9, 140)):
        rk.add_poly(grey, [(2.496, y0, -3.28), (2.496, y1, -3.28),
                           (2.496, y1, 0), (2.496, y0, 0)])
    x0, x1, x2 = 2.50, 3.10, 8.1
    y0, y1 = -4.1, -1.9
    rk.add_poly(roof, [(x0, y0, .05), (x1, y0, .05), (x1, y1, .05), (x0, y1, .05)])
    rk.add_poly(roof, [(x1, y0, .05), (x2, y0, -3.28), (x2, y1, -3.28), (x1, y1, .05)])
    for yy in (y0, y1):
        rk.add_poly(grey, [(x0, yy, -3.28), (x2, yy, -3.28),
                            (x1, yy, .05), (x0, yy, .05)])


def preview_section(name):
    return "full"


def render_previews(directory):
    directory.mkdir(parents=True, exist_ok=True)
    kit._G.clear()
    context_geometry("full")
    kit._build_object("preview_neighbours")
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 24
    scene.cycles.use_denoising = True
    scene.render.image_settings.file_format = "PNG"
    scene.world = bpy.data.worlds.new("Neutral daylight")
    scene.world.use_nodes = True
    ambient = scene.world.node_tree.nodes.get("Background")
    ambient.inputs[0].default_value = (.80, .83, .87, 1)
    ambient.inputs[1].default_value = .50
    scene.view_settings.view_transform = "AgX"

    sunlight = bpy.data.lights.new("Sunlight", "SUN")
    sunlight.energy = 2.3
    sunlight.angle = math.radians(10)
    sun = bpy.data.objects.new("Sun", sunlight)
    scene.collection.objects.link(sun)
    sun.rotation_euler = Vector((-.65, .47, -1)).to_track_quat("-Z", "Y").to_euler()
    view = bpy.data.cameras.new("Camera")
    camera = bpy.data.objects.new("Camera", view)
    scene.collection.objects.link(camera)
    scene.camera = camera
    for name, (eye, target, width, lens, size) in VIEWS.items():
        camera.location = eye
        camera.rotation_euler = (0, 0, 0) if name == "top" else (
            Vector(target) - Vector(eye)).to_track_quat("-Z", "Y").to_euler()
        view.type = "ORTHO" if width else "PERSP"
        if width:
            view.ortho_scale = width
        view.lens = lens
        scene.render.resolution_x, scene.render.resolution_y = size
        scene.render.filepath = str(directory / f"{name}.png")
        bpy.ops.render.render(write_still=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-root", type=Path, default=ROOT)
    parser.add_argument("--skip-renders", action="store_true")
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
    rk.reset()
    model = assemble()
    export(model, args.output_root / "assets" / "models" / "rome" / f"{NAME}.glb")
    if not args.skip_renders:
        render_previews(args.output_root / "renders" / NAME)


if __name__ == "__main__":
    main()
