"""Export the four architectural props for the Domus Tiberiana. Dimensions are in metres."""

import argparse
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rk
from rk import _bk as kit


ROOT = Path(__file__).resolve().parents[3]
MODELS = ROOT / "assets" / "models" / "rome"
RENDERS = ROOT / "renders" / "rome_tib_kit"
FRAME = rk.Frame()
STONE = "marble"
BRONZE = "bronze"
BUDGETS = {
    "door_bronze": 200, "balustrade": 150, "pot_large": 120, "tub_cypress": 60,
}
PEDESTAL_HEIGHT = 1.0
GREY = (0.42, 0.42, 0.42)


def loft(rings, material=STONE, smooth=True, closure=True, soft_ends=False):
    """Join equal-sided, counter-clockwise outlines taken along an axis."""
    size = len(rings[0])
    faces = [(row * size + i, row * size + (i + 1) % size,
              (row + 1) * size + (i + 1) % size, (row + 1) * size + i)
             for row in range(len(rings) - 1) for i in range(size)]
    rk.add_mesh(material, [p for ring in rings for p in ring], faces, smooth)
    if closure:
        rk.add_poly(material, rings[0][::-1], soft_ends)
        rk.add_poly(material, rings[-1], soft_ends)


def ellipse_z(x, y, z, rx, ry, n):
    return [(x + rx * math.cos(math.tau * i / n),
             y + ry * math.sin(math.tau * i / n), z) for i in range(n)]


def ellipse_y(x, y, z, rx, rz, n):
    return [(x + rx * math.cos(math.tau * i / n), y,
             z - rz * math.sin(math.tau * i / n)) for i in range(n)]


def stack_z(rows, n=8, material=STONE, smooth=True):
    loft([ellipse_z(*row, n) for row in rows], material, smooth)


def square(radius, z):
    return [(x, y, z) for x, y in ((-radius,-radius),(radius,-radius),
                                   (radius,radius),(-radius,radius))]


def pedestal():
    # One solid stepped base, rather than several boxes with coincident faces.
    loft([square(r, z) for r, z in (
        (.40, 0), (.40, .115), (.34, .175), (.34, .86), (.40, .92), (.40, PEDESTAL_HEIGHT)
    )], smooth=False)


def door_bronze():
    half_width, height, row_height = .65, 3.30, .825
    front, recess, back = -.017, .013, .040

    def panel(x0, x1, z0, z1, y):
        return [(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)]

    rim = panel(-half_width, half_width, 0, height, front)
    rear = panel(-half_width, half_width, 0, height, back)
    rk.add_poly(BRONZE, rear[::-1])
    for i in range(4):
        j = (i + 1) % 4
        rk.add_poly(BRONZE, [rim[j], rim[i], rear[i], rear[j]])
    for index in range(4):
        z0 = index * row_height
        z1 = z0 + row_height
        outer = panel(-half_width, half_width, z0, z1, front)
        inner = panel(-half_width + .06, half_width - .06, z0 + .06, z1 - .06, recess)
        for i in range(4):
            j = (i + 1) % 4
            rk.add_poly(BRONZE, [outer[i], outer[j], inner[j], inner[i]])
        rk.add_poly(BRONZE, inner)
        for x in (-.515, .515):
            for z in (z0 + .13, z1 - .13):
                base = panel(x - .030, x + .030, z - .030, z + .030, recess)
                for i in range(4):
                    rk.add_poly(BRONZE, [base[i], base[(i + 1) % 4], (x, -.040, z)])
    # Ring is part of the 80 mm depth envelope. Its upper loop meets the hinge pad.
    rings = []
    for i in range(8):
        a = math.tau * i / 8
        rings.append([((.066 + .011 * math.cos(b)) * math.cos(a),
                       -.029 + .011 * math.sin(b),
                       1.60 + (.066 + .011 * math.cos(b)) * math.sin(a))
                      for b in (0.0, math.pi / 2, math.pi, 1.5 * math.pi)])
    for i, ring in enumerate(rings):
        following = rings[(i + 1) % len(rings)]
        for j in range(4):
            k = (j + 1) % 4
            rk.add_poly(BRONZE, [ring[k], following[k], following[j], ring[j]], True)
    rk.box(FRAME, 0, -.002, 1.654, .050, .048, .032, BRONZE)


def balustrade():
    for z in (0.0, .78):
        rk.box(FRAME, 0, 0, z, 2.80, .12, .12, STONE)
    for x, width in ((-1.35, .10), (-.44, .068), (.44, .068), (1.35, .10)):
        rk.box(FRAME, x, 0, .12, width, .12, .66, STONE)
    for center in (-.87, 0, .87):
        for sign, depth in ((-1, .093), (1, .107)):
            rk.beam(FRAME, center - .44 * sign, 0, .131, center + .44 * sign, 0, .769,
                    depth, .08, STONE)


def pot_large():
    profile = [(.224, 0), (.49, .43), (.372, .704), (.45, .80), (.397, .75)]
    rings = [ellipse_z(0, 0, z, r, r, 12) for r, z in profile]
    loft(rings, "tile", closure=False)
    rk.add_poly("tile", rings[0][::-1])
    rk.add_poly("grass", rings[-1])


def tub_cypress():
    rings = [square(r, z) for r, z in (
        (.361, 0), (.361, .49), (.40, .52), (.40, .60), (.316, .60), (.316, .50)
    )]
    loft(rings, "travertine", smooth=False, closure=False)
    rk.add_poly("travertine", rings[0][::-1])
    rk.add_poly("grass", rings[-1])


def fold_weight(angle, center, breadth):
    distance = math.remainder(angle - center, math.tau) / breadth
    if abs(distance) >= 1:
        return 0.0
    return math.cos(math.pi * distance / 2) ** 2


def robe_section(section, woman):
    """A contour of the full garment, including the shoulders and arm folds."""
    x, y, z, width, depth, spiral, pleat, mantle = section
    edge = []
    for i in range(20):
        angle = i * math.tau / 20
        # Beds and crests do not repeat at the same depth all around the stone.
        ridge = (1 if i % 2 == 0 else -.74) * (1 + .32 * math.cos(2 * angle - .4))
        angle += spiral * (1 + .40 * math.cos(angle))
        px = x + width * math.cos(angle) * (1 + pleat * ridge)
        py = y + depth * math.sin(angle) * (1 + pleat * ridge)
        if woman:
            # Two wide raised folds of the palla, gathered around the arms.
            left_center = -2.22 - 1.38 * (z - 1.27)
            right_center = -.51 + .58 * (z - 1.27)
            left = fold_weight(angle, left_center, .53)
            right = fold_weight(angle, right_center, .57)
            groove = (fold_weight(angle, left_center + .45, .31)
                      + fold_weight(angle, right_center - .50, .34))
            px += mantle * (.076 * right - .046 * left)
            py -= mantle * (.075 * left + .068 * right - .030 * groove)
        else:
            # One forearm crosses the abdomen under a diagonal fold. The
            # other sleeve travels down the side and terminates at the hip.
            tucked_center = -1.29 - 2.84 * (z - 1.11)
            falling_center = -.41 + .55 * (z - 1.30)
            tucked = fold_weight(angle, tucked_center, .69)
            falling = fold_weight(angle, falling_center, .53)
            groove = (fold_weight(angle, tucked_center + .53, .33)
                      + fold_weight(angle, falling_center + .39, .34))
            px += mantle * (.108 * falling - .032 * tucked)
            py -= mantle * (.080 * tucked + .072 * falling - .034 * groove)
        edge.append((px, py, z))
    return edge


def robe_skin(rings):
    """Retain edges along the pleat crests below the rounded shoulder mantle."""
    vertices = [point for ring in rings for point in ring]
    width = len(rings[0])
    creases, rounded = [], []
    for row in range(len(rings)-1):
        for i in range(width):
            j = (i+1) % width
            face = (row*width+i, row*width+j, (row+1)*width+j, (row+1)*width+i)
            # Keep a hard facet on one side of the deep pleats. Shoulder and
            # sleeve surfaces read as cloth without a separate mesh edge.
            faces = creases if row < 6 and i % 2 == 0 else rounded
            faces.append(face)
    rk.add_mesh(STONE, vertices, creases)
    rk.add_mesh(STONE, vertices, rounded, True)
    rk.add_poly(STONE, rings[0][::-1])
    rk.add_poly(STONE, rings[-1])


def blind_face(x, y, start, height, width, depth, nose, sides=12):
    """A face with a chin, frontal ridge, nose and hairline, carved without eyes."""
    profile = [
        (.00, .57, .68, -.025, .015),
        (.12, .68, .87, -.044, .025),
        (.29, .88, .94, -.018, .25),
        (.48, .96, 1.01, 0.00, 1.0),
        (.62, 1.0, .97, .013, .51),
        (.77, .95, .94, .024, .09),
        (.91, .77, .82, .035, 0.0),
        (1.0, .29, .39, .049, 0.0),
    ]
    rings = []
    front = 3 * sides // 4
    for i, (zp, xr, yr, shift, ridge) in enumerate(profile):
        ring = []
        for j, (px, py, z) in enumerate(ellipse_z(x, y + shift * depth, start + zp * height,
                                                  width * xr, depth * yr, sides)):
            py -= nose * ridge * (1 if j == front else .12 if abs(j - front) == 1 else 0)
            if i in (3, 4) and j in (0, sides // 2):
                px += .009 if j == 0 else -.009
            ring.append((px, py, z))
        rings.append(ring)
    loft(rings)


def standing_figure(woman):
    if woman:
        shoes = ((-.095, -.048), (.088, -.071))
        garment = [
            (.005, .012, .030, .244, .145, -.09, .17, 0),
            (.023, .012, .33, .204, .137, -.02, .18, 0),
            (.046, .008, .68, .170, .125, .14, .16, .18),
            (.043, .001, .925, .171, .116, .22, .12, .62),
            (.032, .001, 1.145, .175, .112, .17, .095, .95),
            (.000, .005, 1.360, .184, .118, .10, .084, 1),
            (-.021, .011, 1.535, .191, .113, .00, .065, .85),
            (-.030, .014, 1.642, .136, .093, -.055, .025, .28),
            (-.038, .014, 1.741, .063, .060, -.03, 0, 0),
        ]
    else:
        shoes = ((-.102, -.021), (.084, -.078))
        garment = [
            (.008, .008, .035, .227, .146, -.07, .19, 0),
            (.018, .010, .30, .211, .141, -.04, .20, 0),
            (.042, .007, .66, .181, .125, .125, .17, .05),
            (.049, .004, .918, .181, .118, .20, .13, .76),
            (.031, .005, 1.134, .180, .117, .11, .090, 1),
            (.004, .008, 1.357, .196, .116, .025, .075, 1),
            (-.017, .013, 1.542, .216, .111, -.050, .060, .72),
            (-.023, .013, 1.655, .141, .093, -.080, .025, .27),
            (-.030, .013, 1.737, .066, .063, -.03, 0, 0),
        ]
    robe_skin([robe_section(row, woman) for row in garment])
    for x, y in shoes:
        stack_z([(x, y, 0, .068, .106), (x, y + .023, .122, .060, .081)])
    if woman:
        blind_face(-.039, -.003, 1.715, .285, .096, .087, .027)
        stack_z([(-.039, .076, 1.897, .053, .041),
                 (-.035, .092, 1.950, .064, .052),
                 (-.033, .076, 1.976, .041, .038)], n=6)
    else:
        blind_face(-.030, -.003, 1.719, .281, .105, .092, .029)


def skin_with_sockets(rings, sockets, smooth_ends=True):
    """Return the outward boundary of each rectangular patch cut from a loft."""
    sides = len(rings[0])
    faces = []
    for row in range(len(rings) - 1):
        for j in range(sides):
            if any(lo <= row < hi and (j - a) % sides < b-a for lo, hi, a, b in sockets):
                continue
            k = (j+1) % sides
            faces.append((row*sides+j, row*sides+k, (row+1)*sides+k, (row+1)*sides+j))
    rk.add_mesh(STONE, [v for ring in rings for v in ring], faces, True)
    rk.add_poly(STONE, rings[0][::-1], smooth_ends)
    rk.add_poly(STONE, rings[-1], smooth_ends)

    def boundary(lo, hi, a, b):
        perimeter = ([(lo, j) for j in range(a, b+1)]
                     + [(row, b) for row in range(lo+1, hi+1)]
                     + [(hi, j) for j in range(b-1, a-1, -1)]
                     + [(row, a) for row in range(hi-1, lo, -1)])
        return [rings[row][j % sides] for row, j in perimeter]

    return [boundary(*socket) for socket in sockets]


def socket_angles(loop, axes):
    """Sample branch sections at the same azimuths as their shared base edge."""
    def project(point, axis):
        return sum(a * b for a, b in zip(point, axis))

    spans = []
    for axis in axes:
        values = [project(v, axis) for v in loop]
        mid = (min(values) + max(values)) * .5
        radius = (max(values) - min(values)) * .5
        spans.append([(v-mid) / radius for v in values])
    return [math.atan2(y, x) for x, y in zip(*spans)]


def join_branch(base, rings, smooth_tip=True):
    """The first section shares all vertices with the original skin aperture."""
    loft([base, *rings], closure=False)
    rk.add_poly(STONE, rings[-1], smooth_tip)


def horse_neck(base):
    angles = socket_angles(base, ((1, 0, 0), (0, 1, 0)))
    stations = [
        # x, y, z, width, depth, section tilt, crest relief
        (.405, -.462, 2.105, .222, .311, 15, .015),
        (.433, -.552, 2.292, .196, .274, 29, .037),
        (.486, -.641, 2.486, .159, .228, 43, .040),
        (.553, -.733, 2.690, .131, .165, 60, .031),
        (.605, -.883, 2.695, .148, .176, 100, .014),
        (.632, -1.035, 2.555, .130, .146, 116, 0),
        (.654, -1.210, 2.385, .128, .126, 102, 0),
        (.639, -1.300, 2.358, .094, .081, 90, 0),
    ]
    rings = []
    for x, y, z, width, depth, pitch, crest in stations:
        vy, vz = math.cos(math.radians(pitch)), math.sin(math.radians(pitch))
        ring = []
        for angle in angles:
            s = math.sin(angle)
            r = depth * s + crest * max(0.0, s) ** 12
            ring.append((x + width * math.cos(angle), y + r * vy, z + r * vz))
        rings.append(ring)
    join_branch(base, rings)
    for sign in (-1, 1):
        x = .589 + sign * .085
        stack_z([(x, -.805, 2.777, .050, .056),
                 (x + sign * .010, -.790, 2.900, .038, .044),
                 (x + sign * .026, -.799, 3.000 if sign == 1 else 2.971, .012, .014)],
                n=6)


def horse_leg(base, sign, rear):
    angles = socket_angles(base, ((1, 0, 0), (0, -1, 0)))
    ankle_x = .365 + sign * .166
    if rear:
        hoof_y = .875 + sign * .071
        stations = [
            (ankle_x + sign*.100, .831 + sign*.041, 1.600, .144, .221),
            (ankle_x + sign*.059, .656 + sign*.041, 1.316, .131, .185),
            (ankle_x + sign*.021, .679 + sign*.052, 1.065, .088, .128),
            (ankle_x, .981 + sign*.071, .733, .066, .098),
            (ankle_x - sign*.006, .957 + sign*.071, .621, .043, .061),
            (ankle_x, hoof_y + .052, .238, .045, .065),
            (ankle_x, hoof_y + .013, .106, .069, .102),
            (ankle_x, hoof_y, 0, .077, .105),
        ]
    else:
        hoof_y = -.654 + sign * .062
        stations = [
            (ankle_x + sign*.103, -.433 + sign*.024, 1.546, .145, .171),
            (ankle_x + sign*.054, -.455 + sign*.032, 1.280, .102, .123),
            (ankle_x + sign*.011, hoof_y + .028, .940, .068, .098),
            (ankle_x, hoof_y + .021, .798, .049, .071),
            (ankle_x, hoof_y + .058, .228, .043, .064),
            (ankle_x, hoof_y + .010, .107, .068, .105),
            (ankle_x, hoof_y, 0, .073, .107),
        ]
    rings = [[(x + w * math.cos(a), y - d * math.sin(a), z) for a in angles]
             for x, y, z, w, d in stations]
    join_branch(base, rings, smooth_tip=False)


def horse():
    trunk = [
        (.372, -.845, 1.623, .128, .179),
        (.368, -.696, 1.695, .321, .408),
        (.386, -.449, 1.765, .377, .473),
        (.405, -.151, 1.721, .395, .502),
        (.395, .227, 1.717, .387, .488),
        (.390, .565, 1.739, .348, .453),
        (.398, .842, 1.757, .389, .459),
        (.396, 1.063, 1.789, .338, .371),
        (.392, 1.190, 1.805, .163, .231),
    ]
    patch = [(0, 2, 7, 11),
             (1, 3, 0, 2), (1, 3, 4, 6),
             (5, 7, 0, 2), (5, 7, 4, 6)]
    neck, right_fore, left_fore, right_hind, left_hind = skin_with_sockets(
        [ellipse_y(*row, 12) for row in trunk], patch,
    )
    horse_neck(neck)
    for loop, sign, rear in ((right_fore, 1, False), (left_fore, -1, False),
                             (right_hind, 1, True), (left_hind, -1, True)):
        horse_leg(loop, sign, rear)
    stack_z([(.358, 1.239, .244, .020, .025),
             (.384, 1.300 - .058 * math.sin(math.pi / 3), .870, .065, .058),
             (.386, 1.210, 1.573, .083, .083),
             (.389, 1.117, 1.987, .082, .074)], n=6)
    # An applied muzzle band. Its ends stay embedded in the nostril and cheek shell.
    loft([ellipse_y(.651, -1.186, 2.414, .135, .101, 8),
          ellipse_y(.649, -1.155, 2.440, .135, .106, 8)], closure=False)


def youth_sleeve(base):
    angles = socket_angles(base, ((0, 1, 0), (0, 0, 1)))
    sleeve = [
        # Swept from a hole in the cloak, through its bend to the fingers.
        (-.179, -.790, 1.806, .094, .118),
        (-.100, -.880, 1.741, .079, .091),
        (-.039, -.955, 1.866, .068, .071),
        (.007, -.971, 1.940, .053, .058),
        (.042, -.976, 1.942, .040, .037),
    ]
    rings = [[(x, y + w * math.cos(a), z + h * math.sin(a)) for a in angles]
             for x, y, z, w, h in sleeve]
    join_branch(base, rings)


def horse_handler():
    x, y = -.435, -.705
    for sign in (-1, 1):
        px, py = x + sign * .102, y + sign * .076
        stack_z([
            (px, py - .059, 0, .075, .123),
            (px, py - .013, .113, .064, .107),
            (px, py + .039, .248, .056, .069),
            (px - sign*.007, py + .014, .632, .071, .068),
            (px - sign*.020, py + .024, .812, .093, .086),
            (px - sign*.031, py + .017, 1.084, .107, .117),
        ], n=6)
    stations = [
        (-.423, -.691, .958, .218, .135, .013),
        (-.434, -.697, 1.220, .213, .130, .110),
        (-.420, -.715, 1.512, .198, .116, .160),
        (-.422, -.702, 1.789, .232, .130, .140),
        (-.433, -.700, 2.035, .242, .117, .057),
        (-.423, -.702, 2.145, .090, .073, 0),
    ]
    garment = []
    for x, y, z, width, depth, cape in stations:
        ring = []
        for i in range(12):
            a = i * math.tau / 12
            fold = 1 + .085 * math.cos(6 * a + 1.4 * z)
            outer = fold_weight(a, math.pi - .06, .72)
            outer_x = x + width * math.cos(a) * fold - cape * outer
            if z == 1.512 and i == 6:
                outer_x = -.800
            ring.append((max(-.800, outer_x), y + depth * math.sin(a) * fold + cape*.16*outer, z))
        garment.append(ring)
    sleeve, = skin_with_sockets(garment, [(2, 4, 11, 13)])
    youth_sleeve(sleeve)
    face = [
        (-.419, -.705, 2.097, .068, .062),
        (-.419, -.727, 2.204, .059, .055),
        (-.420, -.737, 2.265, .085, .082),
        (-.418, -.740, 2.389, .102, .088),
        (-.417, -.730, 2.477, .112, .104),
        (-.406, -.711, 2.566, .089, .086),
        (-.403, -.710, 2.633, .027, .025),
    ]
    rings = [ellipse_z(*row, 8) for row in face]
    x, y, z = rings[3][6]
    rings[3][6] = (x, y - .025, z)
    loft(rings)
    lead = [(.021, -.974, 1.945), (.161, -.989, 1.922),
            (.339, -1.092, 2.064), (.535, -1.172, 2.377)]
    for a, b in zip(lead, lead[1:]):
        rk.beam(FRAME, *a, *b, .020, .021, STONE)


def dioscurus(mirrored):
    horse()
    horse_handler()
    if mirrored:
        # Reflect baking the geometry and winding. Exported transforms stay at identity.
        for vertices, faces, _ in kit._G.values():
            vertices[:] = [(-x, y, z) for x, y, z in vertices]
            faces[:] = [tuple(reversed(f)) for f in faces]


def dict_of_buffers():
    return dict(kit._G)


def build_geometry(name):
    """Return named explicit meshes. Figure vertices start at their own z=0."""
    kit._G.clear()
    if name in ("statue_a", "statue_b"):
        standing_figure(name == "statue_b")
        figure = dict_of_buffers()
        kit._G.clear()
        pedestal()
        return {"figure": figure, "pedestal": dict_of_buffers()}
    builders = {
        "dioscuri_l": lambda: dioscurus(False), "dioscuri_r": lambda: dioscurus(True),
        "door_bronze": door_bronze, "balustrade": balustrade,
        "pot_large": pot_large, "tub_cypress": tub_cypress,
    }
    builders[name]()
    return {"shell": dict_of_buffers()}


def build_objects(name):
    objects = {}
    buffers = build_geometry(name)
    for piece, data in buffers.items():
        kit._G.clear()
        kit._G.update(data)
        objects[piece] = kit._build_object(piece)
    if "figure" in objects:
        shell = bpy.data.objects.new("shell", None)
        bpy.context.scene.collection.objects.link(shell)
        for obj in objects.values():
            obj.parent = shell
        objects["figure"].location.z = PEDESTAL_HEIGHT
        objects["shell"] = shell
    return objects


def export_item(name, objects):
    limit = BUDGETS[name]
    triangles = 0
    for obj in objects.values():
        if obj.type == "MESH":
            obj.data.calc_loop_triangles()
            triangles += len(obj.data.loop_triangles)
    if triangles > limit:
        raise ValueError(f"{name} over its triangle budget: {triangles} > {limit}")
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects.values():
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects["shell"]
    MODELS.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(MODELS / f"rome_tibkit_{name}.glb"), export_format="GLB",
        use_selection=True, export_yup=True, export_apply=True
    )
    return triangles


def render_setup():
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 24
    scene.cycles.use_denoising = True
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    world = bpy.data.worlds.new("Preview studio")
    world.use_nodes = True
    world.node_tree.nodes.get("Background").inputs[0].default_value = (.55, .56, .58, 1)
    world.node_tree.nodes.get("Background").inputs[1].default_value = .65
    scene.world = world
    sun_data = bpy.data.lights.new("Key light", "SUN")
    sun_data.energy = 2.4
    sun_data.angle = math.radians(6)
    sun = bpy.data.objects.new("Key light", sun_data)
    scene.collection.objects.link(sun)
    sun.rotation_euler = Vector((.60, .65, -1)).to_track_quat("-Z", "Y").to_euler()
    grey = bpy.data.materials.new("Preview grey")
    grey.diffuse_color = (*GREY, 1)
    bpy.ops.mesh.primitive_plane_add(size=120, location=(0, 0, -.002))
    bpy.context.object.data.materials.append(grey)
    camera = bpy.data.cameras.new("Preview camera")
    obj = bpy.data.objects.new("Preview camera", camera)
    scene.collection.objects.link(obj)
    scene.camera = obj
    return obj, grey


def single_shot(bounds):
    lo, hi = bounds
    target = (0.30, 0, max(hi[2], 1.7) * .49)
    scale = max(3.75, max(hi[2], 1.7) * 1.53, (hi[0] - lo[0] + hi[1] - lo[1]) * 1.15)
    # Direction is 30 degrees off the front.
    return (target[0] + 4.5, -4.5 * math.sqrt(3), target[2] + 2.25), target, scale


def lineup_position(widths):
    gap = .63
    left = -(sum(widths) + gap * (len(widths) - 1)) / 2
    positions = []
    for width in widths:
        positions.append(left + width / 2)
        left += width + gap
    return positions, left - gap


def camera_shot(camera, eye, target, scale, size, name):
    camera.location = eye
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = scale
    scene = bpy.context.scene
    scene.render.resolution_x, scene.render.resolution_y = size
    scene.render.filepath = str(RENDERS / f"{name}.png")
    bpy.ops.render.render(write_still=True)


def object_bounds(objects):
    bpy.context.view_layer.update()
    points = [obj.matrix_world @ Vector(corner)
              for obj in objects.values() if obj.type == "MESH" for corner in obj.bound_box]
    return tuple(tuple(reduce(p[i] for p in points) for i in range(3)) for reduce in (min, max))


def render_single(name, objects):
    bounds = object_bounds(objects)
    camera, grey = render_setup()
    bpy.ops.mesh.primitive_cube_add(size=1, location=(bounds[1][0] + .38, 0, .85))
    pole = bpy.context.object
    pole.scale = (.20, .20, 1.70)
    pole.data.materials.append(grey)
    camera_shot(camera, *single_shot(bounds), (1000, 1000), name)


def render_lineup():
    rk.reset()
    editions = []
    for name in BUDGETS:
        objects = build_objects(name)
        for obj in objects.values():
            obj.name = f"{name}_{obj.name}"
        lo, hi = object_bounds(objects)
        editions.append((objects["shell"], hi[0] - lo[0], (hi[0] + lo[0]) / 2))
    centers, last = lineup_position([width for _, width, _ in editions])
    for (shell, _, offset), center in zip(editions, centers):
        shell.location.x = center - offset
    camera, _ = render_setup()
    camera_shot(camera, (0, -35, 7.0), (0, 0, 1.65), 2 * last + 1.65, (1600, 700), "all")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-renders", action="store_true")
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
    if not args.skip_renders:
        RENDERS.mkdir(parents=True, exist_ok=True)
    total = 0
    for name in BUDGETS:
        rk.reset()
        objects = build_objects(name)
        total += export_item(name, objects)
        if not args.skip_renders:
            render_single(name, objects)
    total_limit = sum(BUDGETS.values())
    if total > total_limit:
        raise ValueError(f"Kit over its triangle budget: {total} > {total_limit}")
    if not args.skip_renders:
        render_lineup()


if __name__ == "__main__":
    main()
