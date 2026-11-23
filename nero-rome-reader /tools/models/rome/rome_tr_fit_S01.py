"""Ground-floor furnishings of the Domus Transitoria water dining hall.

Palace coordinates are metres: X east, Y north, Z up. The stone- and
furniture-only export shares the palace origin with the room shell.
"""

import math
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from tr_furnishings import deliver, kit, rk

from rome_tr_kit_water import bronze_lion


NAME = "rome_tr_fit_S01"
ROOM = "S01"
LIMIT = 9000
FLOOR = 0.06
AXIS = -30.0
WATER_STAIR = -15.75
LION_WALL = -15.718
LION_BASE = -.048
LION_OUTLET = -.177
POOL_WEST = -14.75
CHANNEL_START = -14.20
CHANNEL_END = 11.0
TABLE_TOP = FLOOR + 0.50
F = rk.Frame()

GROUPS = (
    # Move the west set a quarter metre toward the central axis. From the
    # prescribed shrine camera this reveals the outlet beyond its back couch.
    ("wine", -12.35, -9.95, 1),
    ("indigo", -6.6, -4.2, 1),
    ("ochre", 6.6, 4.2, -1),
)
TINTS = {
    "wine_cover": ("int_plaster", (.59, .13, .20)),
    "wine_shadow": ("int_plaster", (.42, .085, .125)),
    "wine_bolster": ("int_plaster", (.70, .24, .29)),
    "indigo_cover": ("int_plaster", (.14, .255, .43)),
    "indigo_shadow": ("int_plaster", (.095, .17, .30)),
    "indigo_bolster": ("int_plaster", (.29, .41, .65)),
    "ochre_cover": ("int_plaster", (.77, .52, .17)),
    "ochre_shadow": ("int_plaster", (.58, .34, .091)),
    "ochre_bolster": ("int_plaster", (.87, .64, .29)),
    "dining_oiled_wood": ("wood", (.32, .175, .101)),
    "dining_silver": ("bronze", (.84, .85, .83)),
    "dining_bronze_light": ("bronze", (.63, .45, .245)),
    "dining_bronze_dark": ("bronze", (.38, .27, .16)),
    "dining_grape": ("int_plaster", (.35, .19, .24)),
    "dining_fig": ("int_plaster", (.54, .28, .22)),
    "dining_pear": ("int_plaster", (.64, .59, .28)),
    "dining_amphora": ("tile", (.67, .38, .253)),
    "dining_mud": ("tile", (.57, .46, .32)),
    "dining_channel_bed": ("marble", (.72, .70, .63)),
    "dining_stair_tread": ("marble", (.81, .79, .72)),
}

VIEWS = (
    ("cam1-from-north-arch.png", (0, -24.6, 1.66), (-6, -30, .8), 30),
    ("cam2-from-south-arch.png", (0, -35.4, 1.66), (4.2, -30, .6), 28),
    ("cam3-plan.png", (0, -30, 30), (0, -30, 0), 24),
    ("cam4-water-stair.png", (-9, -28.2, 1.5), (-15, -30, 1.0), 28),
)

SLOTS = (
    ("slot_jet_1", (LION_WALL + LION_BASE - LION_OUTLET, AXIS, FLOOR + 1.46),
     (1, 0, 0), {"kind": "arc"}),
    *(("slot_fall_" + str(i + 1), (WATER_STAIR + .20 * (i + 1), AXIS,
                                   FLOOR + 1.20 - .20 * i),
       (0, 0, 1), {"size": [1.0, .20]}) for i in range(5)),
    ("slot_water_1", ((POOL_WEST + CHANNEL_START) / 2, AXIS, FLOOR + .20),
     (0, 0, 1), {"shape": "rect", "size": [.55, 1.0]}),
    ("slot_water_2", ((CHANNEL_START + CHANNEL_END) / 2, AXIS, FLOOR + .09),
     (0, 0, 1), {"shape": "rect", "size": [25.2, .40]}),
)


def ranged_box(x0, x1, y0, y1, z0, z1, material):
    rk.box(F, (x0 + x1) / 2, (y0 + y1) / 2, z0,
           x1 - x0, y1 - y0, z1 - z0, material)


def triangle_count():
    """Count faces after removing repeated pole coordinates in lathe quads."""
    return sum(max(0, len({points[i] for i in face}) - 2)
               for points, faces, _ in kit._G.values() for face in faces)


def rounded_outline(sx, sy, bevel):
    x, y = sx / 2, sy / 2
    return [(-x + bevel, -y), (x - bevel, -y),
            (x, -y + bevel), (x, y - bevel), (x - bevel, y),
            (-x + bevel, y), (-x, y - bevel), (-x, -y + bevel)]


def upholstered_rings(base, top, material, side, cap_bottom=False):
    rk.add_poly(material, top)
    if cap_bottom:
        rk.add_poly(side, base[::-1])
    for i in range(len(base)):
        j = (i + 1) % len(base)
        rk.add_poly(side, [base[i], base[j], top[j], top[i]])


def seat_height(y):
    return FLOOR + .50 + y / 12


def head_rest(frame, sign, cover, shade):
    profile = ((.73, -.02), (1.17, -.02), (1.18, .18),
               (1.14, .30), (1.015, .266), (.92, .118))
    front, rear = [
        [frame.p(sign * x, y, seat_height(y) + rise) for x, rise in profile]
        for y in (-.586, .586)
    ]
    rk.add_poly(shade, front[::sign])
    rk.add_poly(shade, rear[::-sign])
    for i in range(len(profile)):
        j = (i + 1) % len(profile)
        face = [front[i], rear[i], rear[j], front[j]]
        rk.add_poly(cover, face[::sign])


def couch(x, y, rotation, head, palette):
    before = triangle_count()
    frame = F.sub(x, y, rot=rotation)
    cover, shade, bolster = (palette + suffix for suffix in ("_cover", "_shadow", "_bolster"))

    # The long boards bridge over the water; none of the legs stands in it.
    rk.box(frame, 0, 0, FLOOR + .315, 2.35, 1.143, .073, "dining_oiled_wood")
    profile = ((.055, FLOOR), (.039, FLOOR + .052), (.065, FLOOR + .115),
               (.064, FLOOR + .147), (.046, FLOOR + .326))
    for a in (-.985, .985):
        for b in (-.425, .425):
            for start, end, material in (
                (0, 3, "wood"), (2, 4, "dining_bronze_light"), (3, 5, "wood"),
            ):
                rk.lathe(frame, a, b, profile[start:end], material, seg=6)
    base = [frame.p(a, b, FLOOR + .381) for a, b in rounded_outline(2.35, 1.14, .05)]
    top = [frame.p(a, b, seat_height(b)) for a, b in rounded_outline(2.40, 1.20, .067)]
    upholstered_rings(base, top, cover, shade, cap_bottom=True)
    head_rest(frame, head, cover, shade)

    for i, center in enumerate((-.58, -.02, .53)):
        center *= head
        base = [frame.p(center + a, b + .071, seat_height(b + .071) - .009)
                for a, b in rounded_outline(.39, .765, .060)]
        top = [frame.p(center + .80 * a, .071 + .91 * b, seat_height(.071 + .91 * b) + .076)
               for a, b in rounded_outline(.39, .765, .060)]
        upholstered_rings(base, top, bolster if i != 1 else cover, cover)
    count = triangle_count() - before
    if count > 320:
        raise ValueError(f"{palette} couch uses {count} triangles, above 320")


def seating():
    for palette, back, _, opening in GROUPS:
        couch(back + opening * .60, AXIS, opening * 90, -1, palette)
        outer = back + opening * 2.40
        couch(outer, AXIS - 1.80, 180, opening, palette)
        couch(outer, AXIS + 1.80, 0, -opening, palette)


def bronze_foot(frame, x, y, foot_width=.045, h=.42):
    """A curled leg and three hammered claw tips spread away from the channel."""
    away = 1 if y > 0 else -1
    rings = (
        (1.00, 1.00, FLOOR + .027, foot_width),
        (.96, .96, FLOOR + .098, foot_width * .62),
        (.77, .83, FLOOR + .195, foot_width * .69),
        (.38, .52, FLOOR + h, foot_width * 1.32),
    )
    for j, (first, second) in enumerate(zip(rings, rings[1:])):
        alloy = "dining_bronze_light" if j == 2 else "bronze"
        a, b = [[frame.p(x * sx + r * math.cos(i * math.tau / 6),
                         y * sy + r * math.sin(i * math.tau / 6), z)
                 for i in range(6)] for sx, sy, z, r in (first, second)]
        for i in range(6):
            k = (i + 1) % 6
            rk.add_poly(alloy, [a[i], a[k], b[k], b[i]], True)
    for offset in (-.036, 0, .036):
        yt = y + away * (.055 + (.017 if offset == 0 else 0))
        triangle = [frame.p(x + offset - .012, yt, FLOOR),
                    frame.p(x + offset + .012, yt, FLOOR),
                    frame.p(x + offset * .65, y - away * .013, FLOOR + .046)]
        rk.add_poly("dining_bronze_light", triangle[::away])


def bronze_handle(frame, x, y, z, direction, scale=1.0, material="dining_silver"):
    """An open metal loop with a low-polygon outline."""
    outer = ((.041, .000), (.071, .003), (.069, .037), (.042, .033))
    inner = ((.040, .008), (.059, .011), (.057, .029), (.041, .026))
    for k in range(3):
        profile = (outer[k], outer[k + 1], inner[k + 1], inner[k])
        face = [frame.p(x + direction * a * scale, y, z + b * scale) for a, b in profile]
        rk.add_poly(material, face[::direction])


def small_cup(frame, x, y, z):
    rk.lathe(frame, x, y, [(0, z), (.029, z), (.053, z + .039),
                           (.043, z + .039), (0, z + .015)],
             "dining_silver", seg=6)
    for sign in (-1, 1):
        bronze_handle(frame, x, y, z + .009, sign, .90)


def jug(frame, x, y, z, scale=1.0, material="dining_bronze_light"):
    shape = ((.032, 0), (.070, .048), (.067, .096), (.025, .139),
             (.022, .185), (.034, .201), (0, .191))
    rk.lathe(frame, x, y, [(r * scale, z + h * scale) for r, h in shape], material, seg=6)
    bronze_handle(frame, x - .015 * scale, y, z + .095 * scale, -1, 1.3 * scale, material)


def fruit(frame, x, y, z, radius, material):
    middle = [frame.p(x - radius, y, z), frame.p(x, y - .90 * radius, z),
              frame.p(x + radius, y, z), frame.p(x, y + .90 * radius, z)]
    top, bottom = frame.p(x, y, z + radius), frame.p(x, y, z - .75 * radius)
    for i in range(4):
        j = (i + 1) % 4
        rk.add_poly(material, [middle[i], middle[j], top])
        rk.add_poly(material, [middle[j], middle[i], bottom])


def tabletop(frame):
    before = triangle_count()
    z = TABLE_TOP
    rk.lathe(frame, 0, .018, [(.079, z), (.031, z + .062),
             (.138, z + .099), (.162, z + .132),
             (.146, z + .132), (0, z + .119)], "dining_silver", seg=6)
    for x, y, r, material in (
        (-.058, .020, .045, "dining_pear"), (.044, .002, .051, "dining_fig"),
        (.018, .077, .038, "dining_grape"), (-.016, -.020, .027, "dining_grape"),
    ):
        fruit(frame, x, y, z + .145 + r / 3, r, material)
    for x, y in ((-.23, -.21), (.235, -.20), (-.225, .23), (.22, .21)):
        small_cup(frame, x, y, z)
    jug(frame, -.32, .019, z)
    for x, y in ((.30, .033), (.01, -.30)):
        rk.lathe(frame, x, y, [(.029, z), (.061, z + .018), (0, z + .009)],
                 "dining_silver", seg=6)
    count = triangle_count() - before
    if count > 400:
        raise ValueError(f"One table uses {count} triangles of tableware, above 400")


def tables():
    for _, _, x, _ in GROUPS:
        frame = F.sub(x, AXIS)
        for dx, dy in ((-.26, .388), (.26, .388), (0, -.427)):
            bronze_foot(frame, dx, dy)
        profile = ((0, FLOOR + .418), (.456, FLOOR + .418), (.50, FLOOR + .45),
                   (.50, TABLE_TOP), (.444, TABLE_TOP), (0, TABLE_TOP))
        rk.lathe(frame, 0, 0, profile[:3], "marble", seg=16)
        rk.lathe(frame, 0, 0, profile[2:5], "porphyry", seg=16)
        rk.lathe(frame, 0, 0, profile[4:], "marble", seg=16)
        tabletop(frame)


def eastward_solid(x0, x1, outline, material):
    """Extrude a counterclockwise YZ profile from x0 to x1."""
    back = [(x0, y, z) for y, z in outline]
    front = [(x1, y, z) for y, z in outline]
    rk.add_poly(material, back[::-1])
    rk.add_poly(material, front)
    for i in range(len(outline)):
        j = (i + 1) % len(outline)
        rk.add_poly(material, [back[i], back[j], front[j], front[i]])


def channel():
    # The shaped shoulders are continuous until the bronze floor drain.
    for sign in (-1, 1):
        shape = ((.199, FLOOR), (.300, FLOOR), (.300, FLOOR + .105),
                 (.283, FLOOR + .12), (.210, FLOOR + .12), (.199, FLOOR + .109))
        polygon = [(AXIS + sign * y, z) for y, z in shape][::sign]
        eastward_solid(CHANNEL_START, CHANNEL_END, polygon, "marble")
    ranged_box(CHANNEL_START, 10.70, AXIS - .20, AXIS + .20, FLOOR, FLOOR + .04,
               "dining_channel_bed")

    # Top of all grid bars at 90 mm on palace datum, 30 mm above floor.
    for x in (10.7225, 11.2775):
        rk.box(F, x, AXIS, FLOOR, .045, .60, .03, "dining_bronze_dark")
    for y in (AXIS - .2775, AXIS + .2775):
        rk.box(F, CHANNEL_END, y, FLOOR, .51, .045, .03, "dining_bronze_dark")
    for i in range(6):
        rk.box(F, 10.766 + i * .0936, AXIS, FLOOR + .003, .022, .510, .026,
               "dining_bronze_dark")


def stair_temple():
    left, right = AXIS - .50, AXIS + .50
    # Floors and risers are a continuous stepped section, including the small
    # basin and the open .40 m throat where the two heights hand off.
    profile = [(WATER_STAIR, FLOOR), (CHANNEL_START, FLOOR), (CHANNEL_START, FLOOR + .04),
               (POOL_WEST, FLOOR + .067)]
    for i in reversed(range(5)):
        x = WATER_STAIR + .20 * (i + 1)
        h = FLOOR + 1.20 - .20 * i
        profile.extend(((x, h), (x - .20, h)))
    raw = [[(x, y, z) for x, z in profile] for y in (left, right)]
    near, far = raw
    rk.add_poly("marble", near)
    rk.add_poly("marble", far[::-1])
    for i in range(len(profile)):
        j = (i + 1) % len(profile)
        face = [near[i], far[i], far[j], near[j]]
        if i == 2:
            material = "dining_channel_bed"
        elif near[i][0] > near[j][0] and near[i][2] == near[j][2]:
            material = "dining_stair_tread"
        else:
            material = "marble"
        rk.add_poly(material, face)

    for sign in (-1, 1):
        y = AXIS + sign * .65
        for i in range(5):
            x0 = WATER_STAIR + i * .20
            z0 = FLOOR + 1.20 - .20 * i
            rk.box(F, x0 + .10, AXIS + sign * .557, FLOOR, .20, .112,
                   z0 + .075 - FLOOR, "marble")
        rk.box(F, -14.475, AXIS + sign * .565, FLOOR, .55, .13, .266, "marble")
        rk.box(F, -14.234, AXIS + sign * .355, FLOOR, .068, .310, .266, "marble")
        rk.box(F, -14.632, y, FLOOR, .607, .30, .314, "marble")
        rk.column(F, -14.68, y, FLOOR + .314, 1.60, r=.08, seg=10,
                  order="doric", mat="giallo", cap_mat="marble")

    # Recessed dark backing above the highest tread and projecting pale frame.
    ranged_box(-15.749, LION_WALL, left, right, FLOOR + 1.20, FLOOR + 2.12, "int_reveal")
    for sign in (-1, 1):
        rk.box(F, -15.545, AXIS + sign * .633, FLOOR + 1.12,
               .404, .226, 1.03, "marble")
    ranged_box(-15.75, -14.46, AXIS - .765, AXIS + .765,
               FLOOR + 1.914, FLOOR + 2.107, "marble")
    ranged_box(-15.75, -14.40, AXIS - .80, AXIS + .80,
               FLOOR + 2.107, FLOOR + 2.18, "marble")
    edge, ridge = FLOOR + 2.18, FLOOR + 2.80
    eastward_solid(-15.75, -14.56,
                   [(AXIS - .762, edge), (AXIS + .762, edge), (AXIS, ridge - .05)],
                   "marble")
    for sign in (-1, 1):
        sloping = [(AXIS, ridge - .073), (AXIS + sign * .80, edge - .02),
                   (AXIS + sign * .80, edge + .062), (AXIS, ridge)][::-sign]
        eastward_solid(-15.75, -14.44, sloping, "marble")

    # Same cast head as the portable spout, turned toward the east axis.
    first = len(kit._G.get("bronze", ((),))[0])
    tip = SLOTS[0][1]
    bronze_lion(LION_BASE, LION_OUTLET, tip[2], scale=1.07)
    verts = kit._G["bronze"][0]
    for i in range(first, len(verts)):
        x, y, z = verts[i]
        verts[i] = (LION_WALL + LION_BASE - y, AXIS + x, z)


def amphora(x, y):
    profile = ((.045, 0), (.071, .07), (.140, .22), (.147, .40),
               (.103, .54), (.050, .574), (.044, .646), (.062, .662))
    rk.lathe(F, x, y, [(r, FLOOR + h) for r, h in profile], "dining_amphora", seg=10)
    rk.cyl(F, x, y, FLOOR + .655, .059, .032, "dining_mud", seg=10, r_top=.051)
    for sign in (-1, 1):
        attachment = ((x + sign * .088, y, FLOOR + .526),
                      (x + sign * .143, y, FLOOR + .572),
                      (x + sign * .131, y, FLOOR + .626),
                      (x + sign * .051, y, FLOOR + .638))
        for a, b in zip(attachment, attachment[1:]):
            rk.beam(F, *a, *b, .030, .027, "dining_amphora")


def serving_table():
    cx, cy = 10.20, -27.20
    rk.box(F, cx, cy, FLOOR + .809, 2.40, .80, .091, "marble")
    for x in (cx - .825, cx + .825):
        # Deep stone trestles taper like a bent animal limb, flaring at the paw.
        silhouette = [
            (cy - .303, FLOOR), (cy + .242, FLOOR), (cy + .244, FLOOR + .14),
            (cy + .130, FLOOR + .35), (cy + .192, FLOOR + .64),
            (cy + .269, FLOOR + .825), (cy - .299, FLOOR + .825),
            (cy - .278, FLOOR + .60), (cy - .131, FLOOR + .48),
            (cy - .199, FLOOR + .22), (cy - .290, FLOOR + .085),
        ]
        eastward_solid(x - .163, x + .163, silhouette, "marble")
        for i in range(3):
            rk.box(F, x - .105 + i * .105, cy - .276, FLOOR,
                   .068, .13, .048, "marble")
    z = FLOOR + .90
    rk.lathe(F, 9.65, cy, [(0, z), (.21, z), (.28, z + .061), (.35, z + .181),
                          (.350, z + .214), (.324, z + .214), (.267, z + .061),
                          (0, z + .036)], "bronze", seg=14)
    for x, y, scale in ((10.28, -27.32, 1.44), (10.66, -27.13, 1.62), (11.05, -27.25, 1.32)):
        jug(F, x, y, z, scale)
    rk.beam(F, 10.40, -26.923, z + .031, 10.98, -26.942, z + .013, .019, .018,
            "dining_bronze_light")
    rk.lathe(F, 11.015, -26.942, [(.024, z + .002), (.046, z + .019),
                                 (.038, z + .019), (0, z + .006)],
             "dining_bronze_light", seg=8)
    amphora(9.884, -27.457)
    amphora(10.57, -27.435)


def lampstands():
    for x in (-3.4, 3.4):
        for y in (-33.0, -27.0):
            frame = F.sub(x, y, rot=16)
            for index in range(3):
                foot = frame.sub(rot=120 * index)
                rk.beam(foot, .035, 0, FLOOR + .073, .202, 0, FLOOR + .041,
                        .047, .034, "bronze")
                rk.beam(foot, .202, 0, FLOOR + .041, .246, 0, FLOOR + .015,
                        .037, .025, "dining_bronze_light")
            h = FLOOR
            profile = ((.072, h + .030), (.068, h + .077), (.037, h + .115),
                       (.027, h + .25), (.024, h + 1.26), (.060, h + 1.335),
                       (.157, h + 1.368), (.163, h + 1.400),
                       (.139, h + 1.400), (0, h + 1.387))
            rk.lathe(frame, 0, 0, profile, "bronze", seg=8)
            rk.lathe(frame, 0, 0, [(.044, h + 1.385), (.070, h + 1.419),
                                  (.053, h + 1.480), (.026, h + 1.496),
                                  (0, h + 1.482)], "dining_bronze_light", seg=8)
            rk.beam(frame, .045, 0, h + 1.433, .117, 0, h + 1.477,
                    .037, .022, "dining_bronze_light")


def furnish():
    seating()
    channel()
    stair_temple()
    tables()
    serving_table()
    lampstands()


if __name__ == "__main__":
    deliver(NAME, ROOM, LIMIT, furnish, TINTS, SLOTS, VIEWS)
