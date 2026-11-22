"""Tiberiana v5 south gate extension (work order 11 A).

Palace origin (0, -47, 0). The rear building supplies the northern wall.
+X is east, +Y north and +Z up. All dimensions are in metres.
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


NAME = "rome_tib_gate_s"
ROOT = Path(__file__).resolve().parents[3]
F = rk.Frame()
SOUTH = F.sub(0, -3)
SOUTH_UPPER = F.sub(0, -2.92)
EAST = F.sub(4, 0, rot=90)
WEST = F.sub(-4, 0, rot=-90)
WALL = 0.90
EAVE, RIDGE, PITCH = 12.20, 13.80, 0.40
EAVE_BOTTOM = 11.85
FLOOR_BAND_BOTTOM, FLOOR_BAND_TOP = 6.35, 6.65
STONE = "travertine"
LIMITS = {"shell": 2500, "interior": 300}
# M09g has thirteen rows between its existing verges, palace y -44.30 and -31.70.
REAR_RIB_SPACING = 12.60 / 13
REAR_FIRST_RIB = 2.70 + REAR_RIB_SPACING / 2

# name -> eye, target, ortho width (None for perspective), lens, image dimensions
VIEWS = {
    "front": ((0, -32, 8), (0, 0, 6.7), 21, 50, (1330, 980)),
    "side": ((38, .8, 8), (0, .8, 6.6), 17, 50, (1130, 1000)),
    "three": ((23, 19, 26), (0, 1, 5.7), 25, 50, (1410, 1000)),
    "top": ((0, 1, 35), (0, 1, 0), 23, 50, (1190, 1010)),
    "arch": ((0, -15, 1.7), (0, 0, 2.4), None, 35, (1370, 950)),
    "join": ((20, 17, 22), (0, 2.2, 11.45), None, 57, (1390, 1000)),
}


def slab(x0, x1, y0, y1, z0, z1, material):
    rk.box(F, (x0 + x1) / 2, (y0 + y1) / 2, z0,
           x1 - x0, y1 - y0, z1 - z0, material)


def wall_panel(frame, left, right, near, bottom, top, material, inside=False):
    if right <= left or top <= bottom:
        return
    face = [frame.p(left, near, bottom), frame.p(right, near, bottom),
            frame.p(right, near, top), frame.p(left, near, top)]
    rk.add_poly(material, face[::-1] if inside else face)


def arch(radius, spring, segments=16):
    return [(radius * math.cos(math.pi * i / segments), spring + radius * math.sin(math.pi * i / segments))
            for i in range(segments, -1, -1)]


def courses(frame, a, b, z0, z1, corner_ends, side=False):
    """Paint the stone courses into the wall skin so the cut edges meet."""
    corners = [(edge, direction) for edge, direction in corner_ends
               if a < max(edge, edge + direction * .90) and b > min(edge, edge + direction * .90)]
    changes = {0.90, 2.05, 2.35}
    if corners:
        changes.update((4.8, 6.0))
        changes.update(0.90 + course * 0.45 + offset
                       for course in range(25) for offset in (0, 0.009))
    cuts = sorted({z0, z1, *(z for z in changes if z0 < z < z1)})
    for low, high in zip(cuts, cuts[1:]):
        if high - low < 0.0005:
            continue
        z = (low + high) / 2
        if z < 0.9:
            wall_panel(frame, a, b, 0, low, high, STONE)
        elif 2.05 <= z < 2.35:
            wall_panel(frame, a, b, 0, low, high, "red")
        else:
            course = math.floor((z - 0.90) / 0.45)
            joint = z - (0.90 + course * 0.45) < 0.009
            if joint or (side and 4.8 <= z < 6.0):
                wall_panel(frame, a, b, 0, low, high, "plaster")
                continue
            length = 0.90 if (course % 2 == 0) != side else 0.60
            left, right = a, b
            for position, direction in corners:
                edge = position + direction * length
                if direction == 1:
                    wall_panel(frame, left, min(b, edge), 0, low, high, STONE)
                    left = max(left, edge)
                else:
                    wall_panel(frame, max(a, edge), right, 0, low, high, STONE)
                    right = min(right, edge)
            wall_panel(frame, left, right, 0, low, high, "plaster")


def spandrel(frame, points, near, top, inside=False):
    for (a, za), (b, zb) in zip(points, points[1:]):
        face = [frame.p(a, near, za), frame.p(b, near, zb),
                frame.p(b, near, top), frame.p(a, near, top)]
        rk.add_poly("plaster", face[::-1] if inside else face)


def reveal(frame, profile, depth, material, front=0.0):
    for (u, z), (next_u, next_z) in zip(profile, profile[1:]):
        rk.add_poly(material, [frame.p(next_u, front, next_z), frame.p(u, front, z),
                               frame.p(u, depth, z), frame.p(next_u, depth, next_z)])


def arch_ring(frame, radius, spring, width, projection, keystone=False):
    inner = [(-radius, 0), *arch(radius, spring), (radius, 0)]
    outer = [(-radius - width, 0), *arch(radius + width, spring), (radius + width, 0)]
    for (a, za), (b, zb), (c, zc), (d, zd) in zip(inner, inner[1:], outer, outer[1:]):
        rk.add_poly(STONE, [frame.p(a, -projection, za), frame.p(b, -projection, zb),
                            frame.p(d, -projection, zd), frame.p(c, -projection, zc)])
    reveal(frame, inner, 0, STONE, -projection)
    reveal(frame, outer[::-1], 0, STONE, -projection)
    if keystone:
        crest = spring + radius
        stone = [(-.16, crest), (.16, crest), (.29, crest + .7), (-.29, crest + .7)]
        profile_solid(frame, stone, -projection - .06, .012, STONE)
        for a, b in ((-radius - .90, -radius), (radius, radius + .90)):
            rk.box(frame, (a + b) / 2, -.038, spring - .10, b - a, .084, .20, STONE)


def profile_solid(frame, outline, front, back, material, close_back=True, skip_edge=None):
    """Extrude a counter-clockwise outline in the frame's X/Z plane."""
    pf = [frame.p(u, front, z) for u, z in outline]
    pb = [frame.p(u, back, z) for u, z in outline]
    rk.add_poly(material, pf)
    if close_back:
        rk.add_poly(material, pb[::-1])
    for i, j in enumerate([*range(1, len(outline)), 0]):
        if i != skip_edge:
            rk.add_poly(material, [pf[j], pf[i], pb[i], pb[j]])


def lower_wall(frame, radius, spring, extent, corner_ends, side=False):
    a, b = extent
    points = arch(radius, spring)
    courses(frame, a, -radius, 0, FLOOR_BAND_BOTTOM, corner_ends, side)
    courses(frame, radius, b, 0, FLOOR_BAND_BOTTOM, corner_ends, side)
    spandrel(frame, points, 0, FLOOR_BAND_BOTTOM)
    reveal(frame, [(-radius, 0), *points, (radius, 0)], WALL, "plaster")
    arch_ring(frame, radius, spring, .30 if side else .45, .045 if side else .06, not side)
    wall_panel(frame, a, b, 0, FLOOR_BAND_BOTTOM, FLOOR_BAND_TOP, "red")


def window(frame, centre):
    left, right = centre - .45, centre + .45
    sill, head = 7.70, 9.70
    stone = 0.18
    wall_panel(frame, left, right, .5, sill, head, "doorway")
    rectangle = [(left, sill), (left, head), (right, head), (right, sill), (left, sill)]
    reveal(frame, rectangle, .50, STONE)
    for a, b, z0, z1 in (
        (left - stone, right + stone, sill - stone, sill),
        (left - stone, right + stone, head, head + stone),
        (left - stone, left, sill, head), (right, right + stone, sill, head),
    ):
        rk.box(frame, (a + b) / 2, -.016, z0, b - a, .044, z1 - z0, STONE)
    # Repeated diamonds of round-edged bars connect to the four jambs.
    # Each cell crosses at its midpoints, leaving a physically open grille.
    for i in range(4):
        z = sill + i * .50
        for u0, z0, u1, z1 in ((left, z, right, z + .50), (right, z, left, z + .50)):
            rk.beam(frame, u0, .12, z0, u1, .12, z1, .034, .032, "bronze")


def upper_wall(frame, centres, extent, corner_ends, side=False):
    a, b = extent
    cursor = a
    for centre in centres:
        left, right = centre - .45, centre + .45
        courses(frame, cursor, left, FLOOR_BAND_TOP, EAVE_BOTTOM, corner_ends, side)
        wall_panel(frame, left, right, 0, FLOOR_BAND_TOP, 7.70, "plaster")
        wall_panel(frame, left, right, 0, 9.70, EAVE_BOTTOM, "plaster")
        window(frame, centre)
        cursor = right
    courses(frame, cursor, b, FLOOR_BAND_TOP, EAVE_BOTTOM, corner_ends, side)


def cornice():
    # The inboard top follows z12.2. Above the projection the top follows the tile slope.
    outline = [(0, 11.85), (.08, 11.85), (.08, 11.95), (.22, 11.95),
               (.22, EAVE - PITCH * .22), (0, EAVE)]
    for sign in (-1, 1):
        edge = [(sign * (4 + offset), z) for offset, z in outline]
        profile_solid(F, edge[::sign], -3, 3, STONE, skip_edge=4 if sign > 0 else 0)
    # The horizontal member on the south facade stays inside the platform edge.
    slab(-4, 4, -3, -2.74, EAVE_BOTTOM, EAVE, STONE)


def roof_z(x):
    return RIDGE - PITCH * abs(x)


def gable():
    rk.add_poly("plaster", [SOUTH.p(-4, .15, EAVE), SOUTH.p(4, .15, EAVE),
                            SOUTH.p(0, .15, RIDGE)])
    # The inside face is on the inner side of the upper south wall.
    rk.add_poly("plaster", [SOUTH_UPPER.p(0, WALL, RIDGE - .09),
                            SOUTH_UPPER.p(4, WALL, EAVE - .09),
                            SOUTH_UPPER.p(-4, WALL, EAVE - .09)])
    for sign in (-1, 1):
        a, b = sorted((0, sign * 4.32))
        bevel = [(a, roof_z(a) - .30), (b, roof_z(b) - .30),
                 (b, roof_z(b)), (a, roof_z(a))]
        profile_solid(SOUTH, bevel, -.25, .15, STONE, close_back=False, skip_edge=2)
    # Recessed centre and slightly raised 0.12 m rim, the same plain stone.
    centre = 12.855
    profile = ((.65, .090), (.65, .060), (.53, .050), (.53, .086))
    rings = [[SOUTH.p(r * math.cos(math.tau * i / 32), v,
                      centre + r * math.sin(math.tau * i / 32)) for i in range(32)]
             for r, v in profile]
    for a, b in zip(rings, rings[1:]):
        for i in range(32):
            j = (i + 1) % 32
            rk.add_poly(STONE, [a[i], a[j], b[j], b[i]])
    rk.add_poly(STONE, rings[-1])


def roof(y0, y1, with_ribs, material="tile"):
    for x0, x1 in ((-4.6, 0), (0, 4.6)):
        face = [(x, y, roof_z(x)) for x, y in ((x0, y0), (x1, y0), (x1, y1), (x0, y1))]
        rk.add_poly(material, face)
        rk.add_poly(material, [(x, y, z - .10) for x, y, z in face[::-1]])
        rk.add_poly(material, [face[1], face[0], (x0, y0, roof_z(x0) - .10),
                               (x1, y0, roof_z(x1) - .10)])
        edge = x0 if x0 < 0 else x1
        fascia = [(edge, y0, roof_z(edge) - .10), (edge, y1, roof_z(edge) - .10),
                  (edge, y1, roof_z(edge)), (edge, y0, roof_z(edge))]
        rk.add_poly(material, fascia[::-1] if edge < 0 else fascia)
    if with_ribs:
        # Exact one-metre pitch. x = 0.30 keeps the raised ribs below the hard ridge.
        # One metre continues into the first rib of the existing north roof.
        for row in range(6, 0, -1):
            y = REAR_FIRST_RIB - row
            for sign in (-1, 1):
                points = [(sign * x, y + offset, roof_z(x) + height)
                          for x in (.30, 4.60) for offset, height in ((-.12, 0), (.12, 0), (0, .11))]
                faces = ((2, 1, 0), (3, 4, 5), (0, 3, 5, 2), (1, 2, 5, 4))
                rk.add_mesh(material, points, [face[::sign] for face in faces])


def shell():
    slab(-4, 4, -3, -2.1, -.60, 0, STONE)
    slab(-4, -3.1, -2.1, 3, -.60, 0, STONE)
    slab(3.1, 4, -2.1, 3, -.60, 0, STONE)
    lower_wall(SOUTH, 1.7, 3.5, (-4, 4), ((-4, 1), (4, -1)))
    lower_wall(EAST, 1.2, 3.0, (-3, 3), ((-3, 1),), side=True)
    lower_wall(WEST, 1.2, 3.0, (-3, 3), ((3, -1),), side=True)
    # The top of the floor string closes the 0.08 m setback over the lower wall.
    rk.add_poly("red", [(-4, -3, FLOOR_BAND_TOP), (4, -3, FLOOR_BAND_TOP),
                        (4, -2.92, FLOOR_BAND_TOP), (-4, -2.92, FLOOR_BAND_TOP)])
    upper_wall(SOUTH_UPPER, (-2.2, 0, 2.2), (-4, 4), ((-4, 1), (4, -1)))
    upper_wall(EAST, (0,), (-2.92, 3), ((-2.92, 1),), side=True)
    upper_wall(WEST, (0,), (-3, 2.92), ((2.92, -1),), side=True)
    rk.box(SOUTH_UPPER, 0, -.04, 7.55, 6.4, .08, .15, STONE)
    cornice()
    gable()
    roof(-3.60, 3, True)


def inner_wall(frame, radius, spring, extent):
    a, b = extent
    for left, right in ((a, -radius), (radius, b)):
        wall_panel(frame, left, right, WALL, .05, 1.25, "dado", inside=True)
        wall_panel(frame, left, right, WALL, 1.25, 6.20, "plaster", inside=True)
    spandrel(frame, arch(radius, spring), WALL, 6.20, inside=True)


def interior():
    inner_wall(SOUTH, 1.7, 3.5, (-3.1, 3.1))
    inner_wall(EAST, 1.2, 3.0, (-2.1, 3))
    inner_wall(WEST, 1.2, 3.0, (-3, 2.1))
    wall_panel(SOUTH_UPPER, -3.1, 3.1, WALL, 6.5, EAVE - .09, "plaster", inside=True)
    for frame, extent in ((EAST, (-2.02, 3)), (WEST, (-3, 2.02))):
        wall_panel(frame, *extent, WALL, 6.5, roof_z(3.1) - .10, "plaster", inside=True)
    # No wall spans the open north section. Reveal only the wall thicknesses.
    for a, b in ((-4, -3.1), (3.1, 4)):
        rk.add_poly("plaster", [(b, 3, 0), (a, 3, 0),
                                (a, 3, roof_z(a) - .10), (b, 3, roof_z(b) - .10)])
    rk.add_poly("wood", [(-3.1, -2.1, 6.20), (-3.1, 3, 6.20),
                         (3.1, 3, 6.20), (3.1, -2.1, 6.20)])
    for y in (-1.50, -.20, 1.10, 2.40):
        slab(-3.1, 3.1, y - .15, y + .15, 5.90, 6.20, "wood")


def lower_floor():
    # y = 2.7 is palace y = -44.3. Keep the existing rear portal's bay empty.
    outline = [(-3.1, -2.1), (-1.7, -2.1), (-1.7, -3), (1.7, -3), (1.7, -2.1),
               (3.1, -2.1), (3.1, -1.2), (4, -1.2), (4, 1.2), (3.1, 1.2),
               (3.1, 3), (1.9, 3), (1.9, 2.7), (-1.9, 2.7), (-1.9, 3), (-3.1, 3),
               (-3.1, 1.2), (-4, 1.2), (-4, -1.2), (-3.1, -1.2)]
    rk.prism(F, outline, 0, .05, "paving")


def upper_floor():
    top = [(-3.1, -2.02, 6.50), (3.1, -2.02, 6.50), (3.1, 3, 6.50), (-3.1, 3, 6.50)]
    rk.add_poly("paving", top)
    for a, b in zip(top, top[1:] + top[:1]):
        rk.add_poly("paving", [b, a, (a[0], a[1], 6.20), (b[0], b[1], 6.20)])


MESHES = {"shell": shell, "interior": interior, "room_S06": lower_floor, "room_2S06": upper_floor}


def assemble():
    model = {}
    for name, generate in MESHES.items():
        kit._G.clear()
        generate()
        model[name] = kit._build_object(name)
        if name.startswith("room_"):
            model[name].parent = model["interior"]
    for group in LIMITS:
        parts = [obj for name, obj in model.items() if name == group or obj.parent == model[group]]
        for obj in parts:
            obj.data.calc_loop_triangles()
        count = sum(len(obj.data.loop_triangles) for obj in parts)
        print(f"{group} {count}/{LIMITS[group]} triangles")
        if count > LIMITS[group]:
            raise ValueError(f"{group} exceeds its triangle budget")
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


def rear_roof_details(material):
    # The join view shows the existing M09g tile profile in grey, using the
    # same row spacing, normal offset and ridge cap as the palace generator.
    normal_height = .11 / math.hypot(1, PITCH)
    for row in range(13):
        y = REAR_FIRST_RIB + row * REAR_RIB_SPACING
        for sign in (-1, 1):
            points = []
            for x in (.12, 4.60):
                z = roof_z(x)
                points.extend(((sign * x, y - .12, z),
                               (sign * x, y + .12, z),
                               (sign * (x + PITCH * normal_height), y, z + normal_height)))
            faces = ((0, 3, 5, 2), (2, 5, 4, 1), (3, 4, 5))
            rk.add_mesh(material, points, [face[::sign] for face in faces])
    slab(-.17, .17, 3, 15, RIDGE - .08, RIDGE + .18, material)


def context_geometry(section):
    kit.PAL.update({"preview_grey": ((.49, .49, .49), 0, .91),
                    "preview_grey_roof": ((.59, .59, .59), 0, .82),
                    "preview_plaza": ((.52, .51, .49), 0, .91)})
    grey, grey_roof = "preview_grey", "preview_grey_roof"
    slab(-39, -4, 3, 15, 0, 11, grey)
    if section != "cutaway":
        slab(4, 32, 3, 15, 0, 11, grey)
        slab(-4, 4, 3, 15, 0, 12.2, grey)
        roof(3, 15, False, grey_roof)
        if section == "join":
            rear_roof_details(grey_roof)
        # The existing timber leaves are a proxy for the arch view.
        for a, b in ((-1.57, -1.3), (1.3, 1.57)):
            slab(a, b, 2.72, 3.01, .04, 4.10, grey_roof)
        slab(-1.57, 1.57, 2.72, 3.01, 4.10, 4.55, grey_roof)
        for a, b in ((-1.3, -.016), (.016, 1.3)):
            slab(a, b, 2.95, 2.99, .05, 4.10, "wood")
    for a, b in ((-39, -4), (4, 44)):
        if section in ("east", "cutaway") and a == 4:
            continue
        rk.add_poly(grey_roof, [(a, -3, 4.8), (b, -3, 4.8), (b, 3, 6.0), (a, 3, 6.0)])
        wall_panel(SOUTH, a, b, 0, 4.53, 4.8, grey)
        # Light grey supports suggest the covered space without obscuring the passage.
        if section == "east":
            continue
        for i in range(math.ceil((a + .8) / 3), math.floor((b - .8) / 3) + 1):
            x = i * 3
            slab(x - .20, x + .20, -2.81, -2.49, .04, 4.63, grey)
    rk.add_poly("preview_plaza", [(-200, -200, .04), (200, -200, .04),
                                 (200, 200, .04), (-200, 200, .04)])


def preview_section(name):
    return {"side": "east", "three": "cutaway", "join": "join"}.get(name, "full")


def render_previews(directory):
    directory.mkdir(parents=True, exist_ok=True)
    previews = {}
    for section in ("full", "east", "cutaway", "join"):
        kit._G.clear()
        context_geometry(section)
        previews[section] = kit._build_object(f"preview_neighbours_{section}")
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 24
    scene.cycles.use_denoising = True
    scene.render.image_settings.file_format = "PNG"
    scene.world = bpy.data.worlds.new("Neutral daylight")
    scene.world.use_nodes = True
    ambient = scene.world.node_tree.nodes.get("Background")
    ambient.inputs[0].default_value = (.79, .82, .87, 1)
    ambient.inputs[1].default_value = .40
    scene.view_settings.view_transform = "AgX"

    sunlight = bpy.data.lights.new("Sunlight", "SUN")
    sunlight.energy = 2.4
    sunlight.angle = math.radians(8)
    sun = bpy.data.objects.new("Sun", sunlight)
    scene.collection.objects.link(sun)
    sun.rotation_euler = Vector((-.52, .68, -1.0)).to_track_quat("-Z", "Y").to_euler()
    view = bpy.data.cameras.new("Camera")
    camera = bpy.data.objects.new("Camera", view)
    scene.collection.objects.link(camera)
    scene.camera = camera
    for name, (eye, target, width, lens, size) in VIEWS.items():
        for section, context in previews.items():
            context.hide_render = section != preview_section(name)
        camera.location = eye
        if name == "top":
            camera.rotation_euler = (0, 0, 0)
        else:
            camera.rotation_euler = (Vector(target) - Vector(eye)).to_track_quat("-Z", "Y").to_euler()
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
