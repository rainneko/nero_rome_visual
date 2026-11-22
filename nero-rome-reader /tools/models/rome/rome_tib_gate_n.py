"""North gateway for Domus Tiberiana v5, at palace coordinates (0, 54, 0)."""

import math
from pathlib import Path
import sys

import bpy
from mathutils import Matrix, Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rk


NAME = "rome_tib_gate_n"
ROOT = Path(__file__).resolve().parents[3]
MODELS = ROOT / "assets" / "models" / "rome"
RENDERS = ROOT / "renders" / NAME
FRAME = rk.Frame(0, -54, 0)
COLUMN_X = (-5.1, -1.7, 1.7, 5.1)
PLATFORM = 0.45
EAVE = 6.5
RUN = 6.2
ROOF_PITCH = math.tan(math.radians(15))
RIDGE = EAVE + RUN * ROOF_PITCH
SPRING, RADIUS = 3.3, 1.3
SLOTS = {
    "slot_door_L": ((-0.65, 50.1, PLATFORM), "door_bronze"),
    "slot_door_R": ((0.65, 50.1, PLATFORM), "door_bronze"),
    "slot_dioscuri_L": ((-6.9, 56.3, 1.35), "dioscuri_l"),
    "slot_dioscuri_R": ((6.9, 56.3, 1.35), "dioscuri_r"),
}
VIEWS = {
    "front": ((0, 32, 3), (0, 1.9, 4.24), 52, None),
    "side": ((-29, 0.35, 4.35), (0, 0.35, 4.10), 54, None),
    "three": ((22, 28, 29), (0, 0, 3.45), 51, None),
    "top": ((0, 0.45, 30), (0, 0.45, 0), 50, 20.0),
    "from_below": ((0, 64, -19), (0, 2.5, 5.03), 109, None),
}
VIEWS["shell_only"] = VIEWS["three"]
VIEWS["with_kit"] = VIEWS["front"]


def block(x0, x1, y0, y1, z0, z1, mat):
    rk.box(FRAME, (x0 + x1) / 2, (y0 + y1) / 2, z0, x1 - x0, y1 - y0, z1 - z0, mat)


def face(mat, points, smooth=False):
    rk.add_poly(mat, [FRAME.p(*p) for p in points], smooth)


def north_solid(points, y0, y1, mat):
    """Extrude a counter-clockwise profile in the x/z plane."""
    area = sum(x * q - u * z for (x, z), (u, q) in zip(points, points[1:] + points[:1]))
    if area < 0:
        points = list(reversed(points))
    near = [FRAME.p(x, y0, z) for x, z in points]
    far = [FRAME.p(x, y1, z) for x, z in points]
    rk.add_poly(mat, near)
    rk.add_poly(mat, list(reversed(far)))
    for i in range(len(points)):
        j = (i + 1) % len(points)
        rk.add_poly(mat, [near[i], far[i], far[j], near[j]])


def level_floor(mat, points):
    face(mat, [(x, y, PLATFORM) for x, y in points])


def rect_floor(mat, x0, x1, y0, y1):
    level_floor(mat, [(x0, y0), (x1, y0), (x1, y1), (x0, y1)])


def flooring():
    """Flat paving without coplanar overlays, grouped by stone."""
    x0, x1 = -5.2, 5.2
    for xa, xb, ya, yb in ((-5.8, x0, 50, 57.1), (x1, 5.8, 50, 57.1),
                           (x0, x1, 50, 50.6), (x0, x1, 56.5, 57.1)):
        rect_floor("paving", xa, xb, ya, yb)
    rect_floor("pavonazzetto", x0, x1, 50.6, 52.6)
    rect_floor("pavonazzetto", x0, x1, 54.4, 56.5)
    cursor = x0
    for x in (-3.4, -1.13, 1.13, 3.4):
        y = 53.5
        rect_floor("pavonazzetto", cursor, x - 0.9, 52.6, 54.4)
        square = [(x - 0.9, y - 0.9), (x + 0.9, y - 0.9),
                  (x + 0.9, y + 0.9), (x - 0.9, y + 0.9)]
        s = 0.9 / math.sqrt(2)
        diamond = [(x, y - s), (x + s, y), (x, y + s), (x - s, y)]
        level_floor("porphyry", diamond)
        for i in range(4):
            j = (i + 1) % 4
            level_floor("giallo", [square[i], square[j], diamond[i]])
            level_floor("giallo", [square[j], diamond[j], diamond[i]])
        cursor = x + 0.9
    rect_floor("pavonazzetto", cursor, x1, 52.6, 54.4)


def inset_face(a, b, vertex):
    """Stone panel with a recessed centre, along an outward-facing pedestal face."""
    lo, hi = a + 0.16, b - 0.16
    bottom, top = 0.28, 0.96

    def panel(x0, x1, z0, z1, inset=0.0):
        face("travertine", [vertex(x0, z0, inset), vertex(x1, z0, inset),
                            vertex(x1, z1, inset), vertex(x0, z1, inset)])

    panel(a, b, 0, bottom)
    panel(a, b, top, 1.2)
    panel(a, lo, bottom, top)
    panel(hi, b, bottom, top)
    panel(lo, hi, bottom, top, 0.04)
    border = ((lo, bottom), (lo, top), (hi, top), (hi, bottom))
    for i in range(4):
        u, v = border[i]
        x, z = border[(i + 1) % 4]
        face("travertine", [vertex(u, v, 0), vertex(x, z, 0),
                            vertex(x, z, 0.04), vertex(u, v, 0.04)])


def plinths():
    block(-8, 8, 50, 58, -0.6, 0, "travertine")
    # The top of the central terrace is the patterned stone itself.
    face("travertine", [(-5.8, 50, 0), (5.8, 50, 0),
                        (5.8, 50, PLATFORM), (-5.8, 50, PLATFORM)])
    for x, sign in ((-5.8, -1), (5.8, 1)):
        edge = [(x, 50, 0), (x, 57.1, 0), (x, 57.1, PLATFORM), (x, 50, PLATFORM)]
        face("travertine", edge if sign > 0 else list(reversed(edge)))
    flooring()
    for y, h in ((57.1, 0.45), (57.4, 0.30), (57.7, 0.15)):
        block(-5.8, 5.8, y, y + 0.3, 0, h, "travertine")
    for x0, x1 in ((-8, -5.8), (5.8, 8)):
        block(x0, x1, 50, 54.6, 0, PLATFORM, "travertine")
        a, b = x0 + 0.05, x1 - 0.05
        c, d = 54.65, 57.95
        inset_face(-b, -a, lambda u, z, inset: (-u, d - inset, z))
        inset_face(-d, -c, lambda u, z, inset: (a + inset, -u, z))
        inset_face(c, d, lambda u, z, inset: (b - inset, u, z))
        face("travertine", [(a, c, 0), (b, c, 0), (b, c, 1.2), (a, c, 1.2)])
        block(x0, x1, 54.6, 58, 1.2, 1.35, "marble")


def corinthian_column(x):
    y = 56.4
    block(x - 0.36, x + 0.36, y - 0.36, y + 0.36, 0.45, 0.54, "marble")
    rk.lathe(FRAME, x, y, [(0.34, 0.54), (0.34, 0.60), (0.29, 0.64),
                           (0.29, 0.69), (0.32, 0.72), (0.29, 0.75)], "marble", seg=14)
    rk.cyl(FRAME, x, y, 0.75, 0.29, 4.0, "giallo", seg=14, r_top=0.25, caps=False)
    rk.lathe(FRAME, x, y, [(0.25, 4.75), (0.28, 4.80), (0.25, 4.86),
                           (0.28, 5.10), (0.37, 5.23)], "marble", seg=12)
    # Three low-relief courses of leaves with raised central ribs.
    for row, (base, top, foot, tip) in enumerate(((4.81, 4.98, 0.251, 0.322),
                                                   (4.91, 5.12, 0.256, 0.356),
                                                   (5.04, 5.226, 0.279, 0.405))):
        for i in range(6):
            angle = (i + 0.5 * (row % 2)) * math.tau / 6
            def leaf_point(da, radius, z):
                return x + radius * math.cos(angle + da), y + radius * math.sin(angle + da), z
            root = leaf_point(0, foot, base)
            left = leaf_point(0.30, foot + 0.016, (base + top) / 2)
            right = leaf_point(-0.30, foot + 0.016, (base + top) / 2)
            apex = leaf_point(0, tip, top)
            ridge = leaf_point(0, tip - 0.009, (base + top) / 2)
            for a, b in ((root, right), (right, apex), (apex, left), (left, root)):
                face("marble", [b, a, ridge])
    block(x - 0.37, x + 0.37, y - 0.37, y + 0.37, 5.23, 5.30, "marble")


def pilaster_moulding(x, profile):
    """Return a shallow marble profile to the north wall at y=50."""
    rings = [[FRAME.p(x + u, 50 + v, z) for u, v in
              ((-width, 0), (width, 0), (width, depth), (-width, depth))]
             for z, width, depth in profile]
    for lower, upper in zip(rings, rings[1:]):
        first_face = 1 if lower[0][2] == upper[0][2] else 0
        for i in range(first_face, 4):
            j = (i + 1) % 4
            rk.add_poly("marble", [lower[i], lower[j], upper[j], upper[i]])
    rk.add_poly("marble", list(reversed(rings[0])))
    rk.add_poly("marble", rings[-1])


def corinthian_pilaster(x):
    """Keep the 0.15 m wall projection and align the orders front to back."""
    base = (
        (0.45, 0.36, 0.15), (0.54, 0.36, 0.15), (0.54, 0.33, 0.14),
        (0.59, 0.34, 0.15), (0.64, 0.303, 0.124), (0.69, 0.30, 0.123),
        (0.72, 0.326, 0.145), (0.75, 0.29, 0.15),
    )
    capital = (
        (4.75, 0.29, 0.15), (4.79, 0.31, 0.15), (4.82, 0.31, 0.143),
        (4.86, 0.278, 0.125), (5.05, 0.298, 0.113),
        (5.16, 0.336, 0.121), (5.23, 0.358, 0.145),
        (5.23, 0.37, 0.15), (5.30, 0.37, 0.15),
    )
    pilaster_moulding(x, base)
    block(x - 0.29, x + 0.29, 50, 50.15, 0.75, 4.75, "giallo")
    pilaster_moulding(x, capital)

    def leaf_edge(z):
        for (low, _, rear), (high, _, front) in zip(capital, capital[1:]):
            if low <= z < high:
                return 50 + rear + (front - rear) * (z - low) / (high - low)
        raise ValueError("Leaf edge is outside the capital")

    # The ribs stand proud of the bell. Their edges meet the surface of the capital.
    for lower, upper, offsets in ((4.835, 4.988, (-0.17, 0, 0.17)),
                                   (4.943, 5.107, (-0.219, -0.073, 0.073, 0.219)),
                                   (5.059, 5.225, (-0.184, 0, 0.184))):
        middle = (lower + upper) / 2
        for offset in offsets:
            u = x + offset
            root = (u, leaf_edge(lower), lower)
            left = (u - 0.069, leaf_edge(middle), middle)
            right = (u + 0.069, leaf_edge(middle), middle)
            tip = (u, 50.15, upper)
            rib = (u, 50.149, middle)
            for a, b in ((root, left), (left, tip), (tip, right), (right, root)):
                face("marble", [a, b, rib])


def columns():
    for x in COLUMN_X:
        corinthian_column(x)
    for x in (-5.1, 5.1):
        corinthian_pilaster(x)


def fascia(x, y, bottom, top, mat):
    """Three faces of the lintel; rear returns meet the existing wall."""
    edge = 56.0
    inner = 5.30
    block(-x, x, edge, y, bottom, top, mat)
    block(-x, -inner, 50, edge, bottom, top, mat)
    block(inner, x, 50, edge, bottom, top, mat)


def entablature():
    for z0, z1, step in ((5.30, 5.43, 0.0), (5.43, 5.46, -0.026),
                          (5.46, 5.59, 0.018), (5.59, 5.62, -0.026),
                          (5.62, 5.75, 0.036)):
        fascia(5.764 + step, 57.064 + step, z0, z1, "marble")
    fascia(5.8, 57.1, 5.75, 6.15, "pavonazzetto")
    fascia(5.86, 57.16, 6.15, 6.30, "marble")
    fascia(6.02, 57.32, 6.30, 6.40, "marble")
    block(-6.2, 6.2, 50, 57.5, 6.40, EAVE, "marble")
    for i in range(12):
        x = -5.35 + i * 10.7 / 11
        block(x - 0.105, x + 0.105, 57.105, 57.348, 6.19, 6.30, "marble")
    for i in range(7):
        y = 50.41 + i * 0.94
        block(-6.03, -5.86, y - 0.105, y + 0.105, 6.19, 6.30, "marble")
        block(5.86, 6.03, y - 0.105, y + 0.105, 6.19, 6.30, "marble")
    block(-5.30, 5.30, 50, 56.0, 5.30, 5.41, "wood")
    for y in (51.5, 53.0, 54.5):
        block(-5.38, 5.38, y - 0.115, y + 0.115, 5.08, 5.3, "wood")


def ornamental_leaf(x, y, z0, width):
    """A small terracotta palmette on the pediment, in low relief."""
    profile = [(-0.18, 0), (0.18, 0), (0.25, 0.13), (0.50, 0.31),
               (0.26, 0.27), (0.33, 0.43), (0.12, 0.36), (0, 0.5),
               (-0.12, 0.36), (-0.33, 0.43), (-0.26, 0.27), (-0.50, 0.31),
               (-0.25, 0.13)]
    north_solid([(x + dx * width, z0 + dz) for dx, dz in profile], y - 0.12, y, "tile")


def shield():
    yc = 57.47
    zc = 7.215
    rings = [(0.70, yc), (0.70, yc + 0.023), (0.655, yc + 0.034),
             (0.143, yc + 0.042), (0.105, yc + 0.080)]
    vertices = [FRAME.p(r * math.cos(i * math.tau / 12), y, zc + r * math.sin(i * math.tau / 12))
                for r, y in rings for i in range(12)]
    for k in range(len(rings) - 1):
        for i in range(12):
            j = (i + 1) % 12
            n = k * 12
            rk.add_poly("bronze", [vertices[n + j], vertices[n + i], vertices[n + i + 12], vertices[n + j + 12]])
    rk.add_poly("bronze", list(reversed(vertices[-12:])))


def roof():
    north_solid([(-RUN, EAVE), (RUN, EAVE), (0, RIDGE)], 57.22, 57.47, "marble")
    north_solid([(-RUN, EAVE), (0, RIDGE), (-0.39, RIDGE - 0.25), (-RUN, EAVE - 0.148)],
                57.44, 57.57, "marble")
    north_solid([(0, RIDGE), (RUN, EAVE), (RUN, EAVE - 0.148), (0.39, RIDGE - 0.25)][::-1],
                57.44, 57.57, "marble")
    shield()
    # Separate the tile lip from the stone cornice; the surfaces share only their edge.
    tile_eave, tile_ridge = EAVE + 0.036, RIDGE + 0.036
    for side in (-1, 1):
        x = side * RUN
        coords = [(x, 50, tile_eave), (x, 57.22, tile_eave),
                  (0, 57.22, tile_ridge), (0, 50, tile_ridge)]
        if side < 0:
            coords.reverse()
        face("tile", coords)
        # Tile thickness is shown on exposed eaves only; the front is behind the angled cornice.
        face("tile", [(x, 50, tile_eave), (x, 50, EAVE),
                      (x, 57.22, EAVE), (x, 57.22, tile_eave)][::side])
        panel = [(x, 57.22, EAVE), (x, 57.22, tile_eave),
                 (0, 57.22, tile_ridge), (0, 57.22, RIDGE)]
        face("tile", panel if side < 0 else list(reversed(panel)))
        for i in range(7):
            y = 50.36 + i
            eave = [(x, y - 0.081, tile_eave), (x, y, tile_eave + 0.060),
                    (x, y + 0.081, tile_eave)]
            peak = [(side * 0.025, v, tile_ridge - 0.025 * ROOF_PITCH + z - tile_eave)
                    for _, v, z in eave]
            for j in range(2):
                quad = [eave[j], eave[j + 1], peak[j + 1], peak[j]]
                face("tile", quad if side > 0 else list(reversed(quad)), True)
            face("tile", list(reversed(eave)) if side > 0 else eave)
    rk.beam(FRAME, 0, 50, tile_ridge + 0.012, 0, 57.22, tile_ridge + 0.012, 0.16, 0.089, "tile")
    ornamental_leaf(0, 57.49, 7.9, 0.46)
    for sign in (-1, 1):
        ornamental_leaf(sign * 5.96, 57.62, 6.49, 0.42)


def arch_strips(radius, outer, y0, y1, mat, z_min, count=14):
    # Use the same angles for inner and outer faces, cutting the bronze fan at the transom.
    a_min = math.asin(max(0, (z_min - SPRING) / radius))
    angles = [a_min + (math.pi - 2 * a_min) * i / count for i in range(count + 1)]
    inner = [(radius * math.cos(a), SPRING + radius * math.sin(a)) for a in angles]
    outside = [(outer * math.cos(a), SPRING + outer * math.sin(a)) for a in angles]
    for k in (0, -1):
        outside[k] = (outside[k][0], inner[k][1])
    for i in range(count):
        j = i + 1
        near = [inner[i], outside[i], outside[j], inner[j]]
        front = [(x, y1, z) for x, z in reversed(near)]
        back = [(x, y0, z) for x, z in near]
        face(mat, front)
        face(mat, back)
        for a, b in ((inner[j], inner[i]), (outside[i], outside[j])):
            face(mat, [(a[0], y0, a[1]), (a[0], y1, a[1]), (b[0], y1, b[1]), (b[0], y0, b[1])])
    return inner


def portal():
    for a, b in ((-1.8, -1.3), (1.3, 1.8)):
        block(a, b, 50, 50.15, PLATFORM, SPRING, "marble")
    arch_strips(RADIUS, RADIUS + 0.5, 50, 50.15, "marble", SPRING)
    # The keystone follows the outer arch so its crown does not overlap the roof.
    north_solid([(-0.19, 4.55), (0.19, 4.55), (0.25, 5.15), (-0.25, 5.15)], 50.13, 50.25, "marble")
    bar_z = 3.75
    fan_sill = bar_z + 0.15
    half_sill = math.sqrt(RADIUS ** 2 - (bar_z - SPRING) ** 2)
    block(-half_sill, half_sill, 50.01, 50.175, bar_z, fan_sill, "bronze")
    arch_strips(RADIUS - 0.056, RADIUS, 50.025, 50.095, "bronze", fan_sill)
    for k in range(1, 8):
        theta = math.pi * k / 8
        dz = fan_sill - SPRING
        distance = -dz * math.sin(theta) + math.sqrt((RADIUS - 0.024) ** 2 - (dz * math.cos(theta)) ** 2)
        rk.beam(FRAME, 0, 50.057, fan_sill - 0.022,
                distance * math.cos(theta), 50.057, fan_sill + distance * math.sin(theta),
                0.053, 0.048, "bronze")


def build_geometry():
    """Build the fixed parts only, in the Rome kit geometry buffers."""
    plinths()
    columns()
    entablature()
    roof()
    portal()


def stage_geometry(low):
    """Preview context only: the palace wall, arch reveal and forecourt."""
    wall_y = 49.98
    block(-15, -1.3, 49.35, wall_y, -0.18, 15, "plaster")
    block(1.3, 15, 49.35, wall_y, -0.18, 15, "plaster")
    for i in range(14):
        a = math.pi - math.pi * i / 14
        b = math.pi - math.pi * (i + 1) / 14
        first = RADIUS * math.cos(a), SPRING + RADIUS * math.sin(a)
        second = RADIUS * math.cos(b), SPRING + RADIUS * math.sin(b)
        north_solid([first, second, (second[0], 15), (first[0], 15)], 49.35, wall_y, "plaster")
    block(-1.3, 1.3, 49.32, 49.34, 0, 4.61, "doorway")
    if low:
        block(-15, 15, 48, 60, -19.5, -0.002, "travertine")
        block(-15, 15, 59.3, 59.9, 0, 1.0, "paving")
        block(-45, 45, 32, 125, -19.55, -19.50, "paving")
    else:
        block(-45, 45, 28, 98, -0.12, -0.002, "paving")


def slot_nodes():
    slots = []
    for name, (position, _) in SLOTS.items():
        slot = bpy.data.objects.new(name, None)
        slot.empty_display_type = "PLAIN_AXES"
        slot.location = FRAME.p(*position)
        slot.rotation_euler.z = math.pi
        bpy.context.scene.collection.objects.link(slot)
        slots.append(slot)
    return slots


def place_preview_kit():
    objects = []
    for position, kind in SLOTS.values():
        known = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=str(MODELS / f"rome_tibkit_{kind}.glb"))
        imported = set(bpy.data.objects) - known
        placement = Matrix.Translation(FRAME.p(*position)) @ Matrix.Rotation(math.pi, 4, 'Z')
        for obj in imported:
            if obj.parent not in imported:
                obj.matrix_world = placement @ obj.matrix_world
        objects.extend(imported)
    return objects


def previews():
    kit = rk._bk
    stages = []
    for low in (False, True):
        kit._G.clear()
        stage_geometry(low)
        stages.append(kit._build_object("Preview forecourt" if low else "Preview wall"))
    imported = place_preview_kit()
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 32
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1440
    scene.render.resolution_y = 1030
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    world = bpy.data.worlds.new("Neutral daylight")
    scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.75, 0.78, 0.82, 1.0)
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.55
    sun = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", "SUN"))
    scene.collection.objects.link(sun)
    sun.data.energy, sun.data.angle = 2.4, math.radians(8)
    sun.rotation_euler = Vector((0.48, -0.67, -0.71)).to_track_quat("-Z", "Y").to_euler()
    camera = bpy.data.objects.new("Preview camera", bpy.data.cameras.new("Preview camera"))
    scene.collection.objects.link(camera)
    scene.camera = camera
    camera.data.clip_end = 350
    RENDERS.mkdir(parents=True, exist_ok=True)
    for name, (eye, target, lens, ortho) in VIEWS.items():
        low = name == "from_below"
        stages[0].hide_render = low
        stages[1].hide_render = not low
        for obj in imported:
            obj.hide_render = name != "with_kit"
        camera.location = eye
        camera.rotation_euler = (0, 0, 0) if ortho else (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()
        camera.data.type = "ORTHO" if ortho else "PERSP"
        camera.data.ortho_scale = ortho or 20.0
        camera.data.lens = lens
        scene.render.filepath = str(RENDERS / f"{name}.png")
        bpy.ops.render.render(write_still=True)


def main():
    rk.reset()
    build_geometry()
    shell = rk._bk._build_object("shell")
    shell.data.calc_loop_triangles()
    assert len(shell.data.loop_triangles) <= 4000
    assert len(shell.data.materials) <= 10
    slots = slot_nodes()
    bpy.ops.object.select_all(action="DESELECT")
    for obj in [shell] + slots:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = shell
    MODELS.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(MODELS / f"{NAME}.glb"), export_format="GLB",
                              use_selection=True, export_yup=True, export_apply=False)
    if "--skip-renders" not in sys.argv:
        previews()


if __name__ == "__main__":
    main()
