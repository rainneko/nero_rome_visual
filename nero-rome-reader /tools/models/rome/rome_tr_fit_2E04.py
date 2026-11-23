"""Furnishings for the Domus Transitoria's new second-storey bedroom.

All dimensions are in metres in the palace frame: X east, Y north, Z up.
The two datum heights distinguish the living-room floor from the raised bed.
"""

import math
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from tr_furnishings import deliver, kit, rk, triangles


NAME = "rome_tr_fit_2E04"
ROOM = "2E04"
LIMIT = 9000
FLOOR = 7.06
DAIS = 7.21
BASIN_XY = (38.75, -10.12)
BASIN_TOP = FLOOR + .85 + .12

TINTS = {
    "walnut": ("wood", (.39, .235, .142)),
    "walnut_dark": ("wood", (.258, .149, .091)),
    "walnut_light": ("wood", (.49, .301, .175)),
    "walnut_end": ("wood", (.325, .192, .114)),
    "bronze_pat": ("bronze", (.47, .32, .167)),
    "bronze_worn": ("bronze", (.685, .484, .257)),
    "bronze_rim": ("bronze", (.794, .615, .368)),
    "bronze_inner": ("bronze", (.355, .254, .150)),
    "copper_polished": ("bronze", (.84, .66, .453)),
    "alcove_wine": ("int_plaster", (.435, .127, .228)),
    "alcove_shadow": ("int_plaster", (.307, .077, .151)),
    "alcove_highlight": ("int_plaster", (.522, .167, .273)),
    "throw_wine": ("int_plaster", (.531, .162, .266)),
    "throw_wine_hem": ("int_plaster", (.451, .115, .219)),
    "sitting_blue": ("int_plaster", (.243, .361, .541)),
    "sitting_blue_shade": ("int_plaster", (.147, .229, .382)),
    "sitting_blue_edge": ("int_plaster", (.324, .463, .656)),
    "wool_gold": ("int_plaster", (.758, .535, .245)),
    "wool_gold_dark": ("int_plaster", (.605, .374, .128)),
    "paper": ("int_plaster", (.828, .734, .539)),
    "paper_rolled": ("int_plaster", (.702, .583, .375)),
    "bedroom_linen": ("int_plaster", (.88, .856, .772)),
    "bedroom_linen_fold": ("int_plaster", (.744, .717, .645)),
    "coal": ("int_plaster", (.185, .172, .181)),
    "coal_brown": ("int_plaster", (.241, .209, .197)),
    "coal_red": ("int_plaster", (.374, .171, .145)),
    "almond_marble": ("marble", (.879, .844, .772)),
    "marble_edge": ("marble", (.721, .673, .599)),
    "shadow_panels": ("int_reveal", (.163, .102, .075)),
}

VIEWS = (
    ("cam1-from-north-door.png", (47, -6.8, 8.72), (44.3, -16, 7.9), 25),
    ("cam2-to-alcove.png", (44, -14.6, 8.72), (44, -22.6, 7.9), 32),
    ("cam3-plan.png", (44, -15, 40), (44, -15, 7), 27),
    ("cam4-in-alcove.png", (47.2, -20.7, 8.7), (43.2, -22.6, 7.9), 23),
)

SLOTS = (
    ("slot_water_1", (*BASIN_XY, BASIN_TOP - .03), (0, 0, 1),
     {"shape": "disc", "size": [.218]}),
)

PART_STATS = {}


def loft(frame, rows, materials, smooth=False, closed=True):
    """Skin equally sampled rows, with optional flat end faces."""
    levels = [[frame.p(*p) for p in row] for row in rows]
    for lower, upper, material in zip(levels, levels[1:], materials):
        for i in range(len(lower)):
            j = (i + 1) % len(lower)
            rk.add_poly(material, (lower[i], lower[j], upper[j], upper[i]), smooth)
    if closed:
        rk.add_poly(materials[0], levels[0][::-1])
        rk.add_poly(materials[-1], levels[-1])


def slab(frame, x, y, bottom, length, width, height, bevel, colors):
    """A low rectangular slab with clipped corners and bevelled bedding."""
    bevel = min(bevel, height / 2)

    def corners(half_x, half_y):
        trim = min(bevel * 1.7, half_x / 2, half_y / 2)
        return (
            (x - half_x + trim, y - half_y), (x + half_x - trim, y - half_y),
            (x + half_x, y - half_y + trim), (x + half_x, y + half_y - trim),
            (x + half_x - trim, y + half_y), (x - half_x + trim, y + half_y),
            (x - half_x, y + half_y - trim), (x - half_x, y - half_y + trim),
        )

    half_x, half_y = length / 2, width / 2
    rows = [
        [(u, v, z) for u, v in corners(half_x - trim, half_y - trim)]
        for z, trim in (
            (bottom, bevel * .6), (bottom + bevel * .8, 0),
            (bottom + height - bevel, 0), (bottom + height, bevel),
        )
    ]
    loft(frame, rows, colors)


def painted_profile(frame, x, y, z, profile, sides=12):
    for (r0, h0, mat), (r1, h1, _) in zip(profile, profile[1:]):
        rk.lathe(frame, x, y, [(r0, z + h0), (r1, z + h1)], mat, seg=sides)


def tube(frame, points, radii, material, *, sides=8, normal=(0, 1, 0), loop=False):
    """Sweep a small planar bronze rod with open space through any loop."""
    array = [kit.Vector(p) for p in points]
    across = kit.Vector(normal)
    rows = []
    for i, (p, radius) in enumerate(zip(array, radii)):
        prev = array[(i - 1) % len(array)] if loop else array[max(0, i - 1)]
        next_point = array[(i + 1) % len(array)] if loop else array[min(len(array) - 1, i + 1)]
        side = across.cross((next_point - prev).normalized()).normalized()
        rows.append([
            tuple(p + radius * (math.cos(k * math.tau / sides) * side
                                + math.sin(k * math.tau / sides) * across))
            for k in range(sides)
        ])
    if loop:
        rows.append(rows[0])
    loft(frame, rows, [material] * (len(rows) - 1), smooth=True, closed=not loop)


def ring(frame, center, radius_x, radius_z, section=.010, sides=9,
         material="bronze_worn"):
    x, y, z = center
    points = [(x + radius_x * math.cos(i * math.tau / sides), y,
               z + radius_z * math.sin(i * math.tau / sides))
              for i in range(sides)]
    tube(frame, points, [section] * sides, material, sides=5, loop=True)


def turned_leg(frame, x, y, height, radius, copper=True):
    profile = (
        (0, 0, "bronze_pat" if copper else "walnut_dark"),
        (.78 * radius, 0, "bronze_pat" if copper else "walnut_dark"),
        (.86 * radius, .10 * height, "walnut_dark"),
        (radius, .28 * height, "walnut_light"),
        (.64 * radius, .55 * height, "bronze_worn" if copper else "walnut"),
        (.74 * radius, .68 * height, "walnut"),
        (1.04 * radius, height, "walnut"),
    )
    painted_profile(frame, x, y, 0, profile, sides=7)


def bronze_legs(frame, height, reach, breadth):
    for angle in (16, 136, 256):
        leg = frame.sub(0, 0, rot=angle)
        tube(leg, ((reach * .43, 0, height), (reach * .56, 0, height * .67),
                   (reach, 0, breadth * .65)),
             (breadth, breadth * .84, breadth * .66), "bronze_pat", sides=6)
        # A small crest joins the three pointed toes to the bowed shaft.
        for offset in (-breadth * .57, 0, breadth * .57):
            tip = leg.p(reach + breadth * (.68 if offset == 0 else .42), offset, 0)
            heel_a = leg.p(reach - breadth * .58, offset - breadth * .21, 0)
            heel_b = leg.p(reach - breadth * .58, offset + breadth * .21, 0)
            crest = leg.p(reach - breadth * .16, offset * .71, breadth * .83)
            rk.add_poly("bronze_worn", (heel_a, tip, crest))
            rk.add_poly("bronze_worn", (tip, heel_b, crest))


def wooden_board(frame, x, thick, width, bottom, crest):
    """A shaped end board, swept across the bed's width."""
    half = width / 2
    outline = [(-half, bottom), (half, bottom), *[
        (half * t, z) for t, z in reversed(crest)
    ]]
    outside = [frame.p(x - thick / 2, y, z) for y, z in outline]
    inside = [frame.p(x + thick / 2, y, z) for y, z in outline]
    rk.add_poly("walnut_dark", outside[::-1])
    rk.add_poly("walnut", inside)
    for i, _ in enumerate(outside):
        j = (i + 1) % len(outside)
        rk.add_poly("walnut_light", (outside[i], outside[j], inside[j], inside[i]))


def textile_throw(frame, center, width, half_y, top, lower_hem, body, hem):
    """A blanket lying across the surface and falling over its north edge."""
    rows = ((-half_y + .055, top), (-half_y * .39, top + .005),
            (half_y * .40, top + .008), (half_y - .030, top + .005),
            (half_y + .015, top - .032),
            (half_y + .025, .63 * top + .37 * lower_hem),
            (half_y + .015, lower_hem + .031), (half_y + .018, lower_hem))
    mesh = []
    sticks = 7
    for row, (y, z) in enumerate(rows):
        mesh.append([
            frame.p(center + width * (i / (sticks - 1) - .5),
                    y + .009 * math.sin(i * 2.15 + row * .27),
                    z + .010 * math.cos(i * 2.20 + row * .23))
            for i in range(sticks)
        ])
    for j, row in enumerate(mesh[:-1]):
        material = hem if j == len(mesh) - 2 else body
        for i in range(sticks - 1):
            rk.add_poly(material, (row[i], row[i + 1], mesh[j + 1][i + 1], mesh[j + 1][i]),
                        smooth=True)


def build_bed():
    frame = rk.Frame(44, -22.60, DAIS)
    for x in (-1.00, 1.00):
        for y in (-.602, .602):
            turned_leg(frame, x, y, .544, .061)
    slab(frame, 0, 0, .49, 2.20, 1.40, .102, .028,
         ("walnut_dark", "walnut", "walnut_light"))
    rk.box(frame, 0, .694, .519, 1.98, .014, .027, "walnut_light")
    slab(frame, -.015, 0, .579, 2.075, 1.316, .171, .046,
         ("alcove_shadow", "alcove_wine", "alcove_highlight"))

    wooden_board(frame, -1.04, .10, 1.35, .565, (
        (-1, .867), (-.88, 1.047), (-.66, 1.133), (-.38, 1.175),
        (0, 1.20), (.38, 1.175), (.66, 1.133), (.88, 1.047), (1, .867),
    ))
    wooden_board(frame, 1.04, .10, 1.35, .546, (
        (-1, .802), (-.86, .926), (-.58, .985), (0, 1.00),
        (.58, .985), (.86, .926), (1, .802),
    ))
    for x in (-1.02, -.53, 0, .53, 1.02):
        rk.box(frame, x, -.655, .596, .058, .055, .420, "walnut")
    rk.box(frame, 0, -.655, 1.005, 2.10, .059, .045, "walnut_light")
    rk.box(frame, 0, -.655, .802, 2.03, .046, .035, "walnut_dark")
    for y in (-.319, .319):
        slab(frame, -.653, y, .747, .440, .558, .119, .048,
             ("wool_gold_dark", "wool_gold_dark", "wool_gold"))
    textile_throw(frame, .528, .70, .65, .764, .391,
                  "throw_wine", "throw_wine_hem")


def build_footstool():
    frame = rk.Frame(44, -21.6, DAIS)
    for x in (-.503, .503):
        for y in (-.122, .122):
            turned_leg(frame, x, y, .174, .033, copper=False)
    slab(frame, 0, 0, .155, 1.20, .35, .065, .020,
         ("walnut_dark", "walnut", "walnut_light"))


def build_curtains():
    frame = rk.Frame(44, -19.79, FLOOR)
    tube(frame, ((-1.75, 0, 2.913), (1.75, 0, 2.913)),
         (.016, .016), "bronze_worn", sides=12)
    for sign in (-1, 1):
        end = rk.Frame(44 + sign * 1.749, -19.79, FLOOR + 2.903, rot=0)
        rk.sphere(end, 0, 0, 0, .041, "bronze_rim", seg=8, rings=4, z_scale=.83)
        # Keep the finials within x42.2–45.8, and the wall attachments behind the fabric.
        tube(frame, ((1.67 * sign, -.111, 2.903), (1.67 * sign, 0, 2.903)),
             (.024, .020), "bronze_pat", sides=6, normal=(0, 0, 1))

    # The curtain edge retreats next to the lower part of the tie, so the
    # fixed centre camera can see the nearer end of the chest beyond it.
    profile = (
        (.112, 1.096, 1.497, .031), (.139, 1.106, 1.494, .038),
        (.203, 1.142, 1.478, .041), (.480, 1.327, 1.480, .044),
        (.745, 1.383, 1.478, .046), (1.095, 1.403, 1.484, .043),
        (1.271, 1.401, 1.485, .042), (1.315, 1.389, 1.485, .040),
        (1.525, 1.320, 1.483, .042), (1.860, 1.216, 1.490, .039),
        (2.259, 1.144, 1.490, .034), (2.610, 1.113, 1.484, .024),
        (2.893, 1.112, 1.501, .006), (2.914, 1.112, 1.501, 0),
    )
    divisions = 11
    for sign in (-1, 1):
        skin = []
        for j, (z, within, outer, pleat) in enumerate(profile):
            row = []
            for i in range(divisions + 1):
                t = i / divisions
                x = sign * (within * (1 - t) + outer * t)
                fold = math.sin(math.pi * i * 2 / 3.6 + j * .155)
                y = pleat * (.25 + .36 * fold) - .005 * t * t
                hem = .012 * math.sin(t * math.tau + .23 * sign) if j < 3 else 0
                row.append(frame.p(x, y, z + hem))
            skin.append(row)
        for j, row in enumerate(skin[:-1]):
            for i in range(divisions):
                face = (row[i], row[i + 1], skin[j + 1][i + 1], skin[j + 1][i])
                if j == 1:
                    color = "wool_gold" if i % 3 else "wool_gold_dark"
                else:
                    color = ("alcove_shadow", "alcove_wine", "alcove_highlight")[i % 3]
                rk.add_poly(color, face[::-sign], smooth=True)
        tie = frame.sub(1.445 * sign, .008, 1.30)
        # Two taut strands wrap round the folds and return to a wall hook.
        for z in (-.009, .010):
            tube(tie, ((-.048, -.009, z), (-.034, .034, z + .002), (0, .053, z),
                       (.041, .039, z - .003), (.056, .001, z)),
                 (.007,) * 5, "wool_gold_dark", sides=5, normal=(0, 0, 1))
        tube(frame, ((sign * 1.53, -.110, 1.311), (sign * 1.53, -.018, 1.282),
                     (sign * 1.505, .018, 1.289), (sign * 1.485, .026, 1.302)),
             (.012, .012, .010, .009), "bronze_worn", sides=5, normal=(0, 0, 1))


def build_chest():
    frame = rk.Frame(46.30, -22.60, DAIS)
    rk.box(frame, 0, 0, .022, .561, 1.055, .505, "walnut")
    rk.box(frame, 0, 0, 0, .562, 1.06, .044, "shadow_panels")
    slab(frame, 0, 0, .516, .60, 1.10, .084, .018,
         ("walnut_dark", "walnut", "walnut_light"))
    for x in (-.278, .278):
        rk.box(frame, x, 0, .201, .014, 1.055, .048, "bronze_worn")
        for y in (-.500, .500):
            rk.box(frame, x, y, .022, .016, .058, .507, "bronze_worn")
    for y in (-.528, .528):
        rk.box(frame, 0, y, .201, .559, .015, .048, "bronze_worn")
        for x in (-.251, .251):
            rk.box(frame, x, y, .023, .059, .015, .506, "bronze_worn")
        face = frame.sub(0, y + (.019 if y > 0 else -.019), .303)
        rk.box(face, 0, 0, 0, .087, .020, .059, "bronze_pat")
        ring(face, (0, 0, -.025), .055, .041, .010)
    lock = frame.sub(-.287, 0, .411, rot=90)
    rk.box(lock, 0, 0, 0, .149, .019, .108, "bronze_rim")
    rk.box(lock, 0, .012, .034, .029, .005, .023, "shadow_panels")
    for x in (-.054, .054):
        rk.sphere(lock, x, .014, .061, .009, "bronze_worn", seg=6, rings=4)


def lamp(x, y, base):
    frame = rk.Frame(x, y, base)
    bronze_legs(frame, .147, .173, .028)
    painted_profile(frame, 0, 0, .12, (
        (.036, 0, "bronze_pat"), (.042, .058, "bronze_worn"),
        (.024, .127, "bronze_pat"), (.017, .455, "bronze_worn"),
        (.019, .506, "bronze_pat"), (.015, 1.059, "bronze_worn"),
        (.047, 1.115, "bronze_pat"), (.103, 1.144, "bronze_rim"),
        (.104, 1.168, "bronze_pat"), (.092, 1.169, "bronze_pat"),
        (0, 1.166, "bronze_pat"),
    ), sides=7)
    z = 1.282
    painted_profile(frame, 0, 0, z, (
        (.045, 0, "bronze_worn"), (.060, .034, "bronze_pat"),
        (.046, .076, "bronze_worn"), (.020, .090, "bronze_inner"),
        (0, .086, "bronze_inner"),
    ), sides=8)
    tube(frame, ((0, .034, z + .043), (0, .088, z + .039)),
         (.029, .015), "bronze_worn", sides=6, normal=(1, 0, 0))
    ring(frame.sub(0, 0, z, rot=90), (-.055, 0, .081), .019, .029, .006, sides=7)


def build_bed_lamp():
    lamp(41.70, -21.4, DAIS)


def build_chaise():
    frame = rk.Frame(45, -12.8, FLOOR)
    for x in (-.89, .89):
        for y in (-.307, .307):
            turned_leg(frame, x, y, .309, .044)
    slab(frame, 0, 0, .279, 2.00, .80, .074, .020,
         ("walnut_dark", "walnut", "walnut_light"))
    slab(frame, .015, 0, .34, 1.91, .735, .110, .031,
         ("sitting_blue_shade", "sitting_blue", "sitting_blue_edge"))
    head = [
        (-.984, .313), (-.942, .725), (-.889, .80), (-.813, .782),
        (-.729, .639), (-.579, .494), (-.506, .394),
    ]
    rows = [[(x, y, z) for x, z in head] for y in (-.336, .336)]
    loft(frame, rows, ["sitting_blue_shade"])
    for x in (-.963, -.899):
        rk.box(frame, x, 0, .301, .038, .68, .119, "walnut_light")
    pillow = rk.Frame(44.374, -12.80, FLOOR, rot=90)
    tube(pillow, ((-.252, 0, .504), (-.221, 0, .504),
                  (.22, 0, .504), (.262, 0, .504)),
         (.063, .087, .088, .055), "sitting_blue_edge", sides=12)
    textile_throw(frame, .51, .52, .37, .466, .20,
                  "wool_gold", "wool_gold_dark")


def cup(frame, x, y, z):
    painted_profile(frame, x, y, z, (
        (0, 0, "bronze_pat"), (.031, 0, "bronze_worn"),
        (.035, .025, "bronze_pat"), (.052, .051, "bronze_rim"),
        (.047, .056, "bronze_inner"), (.041, .043, "bronze_inner"),
        (0, .023, "bronze_inner"),
    ))
    for sign in (-1, 1):
        handle = frame.sub(x, y, z)
        ring(handle, (.053 * sign, 0, .043), .018, .015, .005, sides=6)


def jug(frame, x, y, z, scale):
    profile = (
        (0, 0, "bronze_pat"), (.036, 0, "bronze_worn"),
        (.051, .021, "bronze_worn"), (.056, .063, "bronze_pat"),
        (.041, .094, "bronze_worn"), (.025, .108, "bronze_worn"),
        (.024, .136, "bronze_rim"), (.035, .153, "bronze_rim"),
        (.027, .154, "bronze_inner"), (.022, .122, "bronze_inner"),
        (0, .121, "bronze_inner"),
    )
    painted_profile(frame, x, y, z, [(r * scale, h * scale, c) for r, h, c in profile])
    shape = ((.050, .047), (.071, .059), (.083, .082),
             (.074, .113), (.055, .129), (.030, .132))
    tube(frame, [(x + u * scale, y, z + h * scale) for u, h in shape],
         [.008 * scale] * len(shape), "bronze_worn", sides=6)


def build_table():
    frame = rk.Frame(45.20, -11.90, FLOOR)
    bronze_legs(frame, .445, .171, .028)
    painted_profile(frame, 0, 0, 0, (
        (0, .407, "marble_edge"), (.158, .407, "marble_edge"),
        (.238, .448, "almond_marble"), (.25, .468, "almond_marble"),
        (.25, .487, "marble_edge"), (.229, .50, "almond_marble"),
        (0, .50, "almond_marble"),
    ), sides=20)
    cup(frame, -.125, -.021, .50)
    jug(frame.sub(.03, .114, rot=145), 0, 0, .50, .92)
    scroll = frame.sub(.066, -.087, .50, rot=22)
    rk.add_poly("paper", [scroll.p(x, y, z) for x, y, z in
                          ((-.077, -.101, .003), (.070, -.101, .004),
                           (.073, .083, .017), (-.077, .087, .024))])
    tube(scroll, ((-.092, .081, .029), (.088, .081, .025)), (.026, .021),
         "paper_rolled", sides=9)
    tube(scroll, ((-.087, -.09, .012), (.081, -.092, .010)), (.010, .009),
         "paper_rolled", sides=7)


def build_living_lamp():
    lamp(43.50, -12.2, FLOOR)


def build_brazier():
    frame = rk.Frame(41.60, -10.80, FLOOR)
    bronze_legs(frame, .356, .211, .034)
    painted_profile(frame, 0, 0, 0, (
        (0, .304, "bronze_pat"), (.141, .304, "bronze_pat"),
        (.203, .311, "bronze_worn"), (.241, .36, "bronze_pat"),
        (.284, .466, "bronze_rim"), (.30, .487, "bronze_rim"),
        (.294, .50, "bronze_worn"), (.277, .50, "bronze_inner"),
        (.254, .467, "bronze_inner"), (.194, .356, "bronze_inner"),
        (0, .351, "bronze_inner"),
    ), sides=24)
    for y in (-.281, .281):
        ring(frame, (0, y, .434), .053, .050, .010)
    for i in range(19):
        phi = i * math.tau * .382
        r = .047 + .155 * (i % 8) / 7
        x, y = r * math.cos(phi), r * math.sin(phi)
        piece = frame.sub(x, y, .365 + .027 * ((i * 3) % 5) / 4,
                          rot=23 * i)
        color = ("coal_red" if i in (2, 9, 13) else "coal_brown"
                 if i % 4 == 0 else "coal")
        rock = .028 + .016 * (i % 5) / 4
        rk.sphere(piece, 0, 0, 0, rock, color, seg=6, rings=4, z_scale=.67)


def build_washstand():
    frame = rk.Frame(38.75, -10.00, FLOOR)
    # Two stone end slabs carry the narrow top, with clear space underneath.
    for y in (-.325, .325):
        slab(frame, -.013, y, 0, .354, .104, .784, .018,
             ("marble_edge", "almond_marble", "marble_edge"))
        slab(frame, -.013, y, 0, .433, .147, .051, .013,
             ("marble_edge", "almond_marble", "marble_edge"))
    slab(frame, 0, 0, .772, .50, .90, .078, .016,
         ("marble_edge", "almond_marble", "almond_marble"))

    profile = (
        (0, 0, "bronze_pat"), (.098, 0, "bronze_pat"),
        (.151, .010, "bronze_worn"), (.195, .038, "bronze_pat"),
        (.229, .089, "bronze_worn"), (.249, .113, "bronze_rim"),
        (.25, .120, "bronze_rim"), (.237, .120, "bronze_inner"),
        (.225, .104, "bronze_inner"), (.2145, .083, "bronze_worn"),
        (.161, .035, "bronze_inner"), (0, .029, "bronze_inner"),
    )
    painted_profile(frame, 0, BASIN_XY[1] + 10, .85, profile, sides=24)
    jug(frame.sub(-.143, .274, 0, rot=150), 0, 0, .85, 1.23)

    # Flat, polished bronze face, with the underside distinct from its rim.
    mirror = frame.sub(.099, .269, 0, rot=20)
    painted_profile(mirror, 0, 0, .85, (
        (0, 0, "bronze_inner"), (.077, 0, "bronze_rim"),
        (.08, .007, "bronze_worn"), (.075, .010, "copper_polished"),
        (0, .010, "copper_polished"),
    ), sides=20)
    tube(mirror, ((0, -.068, .857), (0, -.156, .854)),
         (.010, .009), "bronze_worn", normal=(0, 0, 1))

    painted_profile(frame, .119, -.407, .85, (
        (0, 0, "bronze_pat"), (.037, 0, "bronze_worn"),
        (.034, .045, "bronze_rim"), (.029, .052, "bronze_pat"),
        (.033, .059, "bronze_rim"), (.021, .069, "bronze_worn"),
        (0, .072, "bronze_worn"),
    ), sides=10)

    towel = frame.sub(.025, .382, rot=-90)
    textile_throw(towel, 0, .121, .225, .860, .583,
                  "bedroom_linen", "bedroom_linen_fold")


def build_cabinet():
    frame = rk.Frame(38.65, -18.2, FLOOR, rot=90)
    # The doors use the local -Y side, facing the room to the east.
    for x in (-.544, .544):
        for y in (-.171, .171):
            rk.box(frame, x, y, 0, .097, .089, .193, "walnut_dark")
    rk.box(frame, 0, .027, .165, 1.272, .378, 1.664, "walnut")
    rk.box(frame, 0, -.019, .157, 1.315, .430, .114, "walnut_end")
    slab(frame, 0, 0, 1.804, 1.40, .50, .096, .019,
         ("walnut_dark", "walnut_light", "walnut_end"))
    for sign in (-1, 1):
        x = .319 * sign
        rk.box(frame, x, -.178, .266, .612, .086, 1.505, "shadow_panels")
        for stile in (x - .267, x + .267):
            rk.box(frame, stile, -.216, .256, .073, .053, 1.53, "walnut_light")
        for z in (.257, .744, 1.167, 1.726):
            rk.box(frame, x, -.216, z, .481, .053, .058, "walnut_end")
        for origin, height in ((.343, .357), (.836, .286), (1.259, .404)):
            # Recessed solid field with chamfered inside corners.
            points = [frame.p(x + u, -.222, z) for u, z in (
                (-.192, origin), (.192, origin), (.211, origin + .021),
                (.211, origin + height - .021), (.192, origin + height),
                (-.192, origin + height), (-.211, origin + height - .021),
                (-.211, origin + .021),
            )]
            rk.add_poly("walnut", points)
        hinge = .583 * sign
        for z in (.456, 1.534):
            rk.add_poly("bronze_pat", (
                frame.p(hinge - .031, -.258, z),
                frame.p(hinge + .031, -.258, z),
                frame.p(hinge + .031, -.258, z + .069),
                frame.p(hinge - .031, -.258, z + .069),
            ))
        handle_x = .099 * sign
        rk.box(frame, handle_x, -.251, .945, .062, .016, .072, "bronze_worn")
        ring(frame, (handle_x, -.266, .929), .028, .038, .007, sides=6)


def build_folding_stool():
    frame = rk.Frame(44.30, -11.00, FLOOR)
    for y in (-.153, .153):
        for sign in (-1, 1):
            rk.beam(frame, .191 * sign, y, .021, -.200 * sign, y, .366,
                    .038, .041, "bronze_pat")
            rk.box(frame, .191 * sign, y, 0, .080, .047, .025, "bronze_worn")
        rk.box(frame, 0, y, .348, .455, .044, .033, "bronze_worn")
        rk.sphere(frame, 0, y + math.copysign(.026, y), .19, .023,
                  "bronze_worn", seg=8, rings=4)
    for x in (-.19, .19):
        rk.beam(frame, x, -.164, .343, x, .164, .343, .034, .025, "bronze_worn")
    slab(frame, 0, 0, .369, .50, .40, .081, .023,
         ("wool_gold_dark", "wool_gold", "wool_gold"))


PARTS = (
    ("B1", build_bed, 900), ("B2", build_footstool, None),
    ("B3", build_curtains, 1200), ("B4", build_chest, None),
    ("B5", build_bed_lamp, 400), ("B6", build_chaise, None),
    ("B7", build_table, None), ("B8", build_living_lamp, 400),
    ("B9", build_brazier, None), ("B10", build_washstand, None),
    ("B11", build_cabinet, 500), ("B12", build_folding_stool, None),
)


def furnish():
    PART_STATS.clear()
    for name, build, limit in PARTS:
        starts = {material: len(faces) for material, (_, faces, _) in kit._G.items()}
        build()
        count = 0
        bounds = [[math.inf] * 3, [-math.inf] * 3]
        for material, (verts, faces, smooth_flags) in kit._G.items():
            start = starts.get(material, 0)
            for points, _ in triangles((verts, faces[start:], smooth_flags[start:])):
                count += 1
                for point in points:
                    for axis, value in enumerate(point):
                        bounds[0][axis] = min(value, bounds[0][axis])
                        bounds[1][axis] = max(value, bounds[1][axis])
        if count == 0 or (limit and count > limit):
            raise ValueError(f"{name} uses {count} triangles; cap {limit}")
        PART_STATS[name] = {"triangles": count, "bounds": bounds}


if __name__ == "__main__":
    deliver(NAME, ROOM, LIMIT, furnish, TINTS, SLOTS, VIEWS)
