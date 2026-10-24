"""ant_tower - observation tower on the summit of the Antium headland (Nero's villa, AD 54-68).

Brief: briefs/antium/tower.md. Square white marble shaft 12 x 12 m from z = 0 to z = 40 on a battered tuff plinth
(foundation down to z = -12). On top a Roman belvedere open to the sky: the platform at z = 40 is carried 0.9 m past the
shaft on a marble ledge and ringed by an Ionic colonnade (20 fluted columns, an entablature with a red frieze, a
balustrade between the columns). In the middle a four-step plinth (treads alternate marble and stone) carries a 10 m
iron spear with a silver tip (tip at z = 51.25); a copper conductor runs from the spear base across the floor, through
the open middle bay of the west colonnade and down the west (sea) face with ochre insulator sleeves; a tiled stair-head
hut stands in the NE corner of the platform. Front = +X (the door).
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_kit import *

reset()

HALF = 5.65            # core and skin line; the shaft is 12 m across outside
OUT = 6.0              # outer face of the shaft
TOP = 40.0             # top of the shaft
FLOOR = 40.05          # platform floor (paving slab on top of the shaft)
SPEAR_BASE = 41.25     # top of the stepped plinth
L = 2 * HALF           # 11.3 m along each face line
PL_H = 2.5             # height of the battered tuff plinth
PL_B = 0.4             # batter: how far the plinth foot stands out beyond the shaft face
FOOT = OUT + PL_B      # half width of the plinth foot (6.4 m)

# foundation: tuff block from z = -12 up to z = 0 (same width as the plinth foot)
box(None, 0, 0, -12.0, 2 * FOOT, 2 * FOOT, 12.0, 'tuff')

# shaft core and marble corner quoins (fill the 0.35 m corner squares)
box(None, 0, 0, 0, L, L, TOP, 'marble')
for sx in (-1, 1):
    for sy in (-1, 1):
        box(None, sx * (HALF + 0.175), sy * (HALF + 0.175), 0, 0.35, 0.35, TOP, 'marble')

# wall lines, counter-clockwise: the outside is on the right of p0 -> p1
SIDES = {
    'S': ((-HALF, -HALF), (HALF, -HALF)),
    'E': ((HALF, -HALF), (HALF, HALF)),
    'N': ((HALF, HALF), (-HALF, HALF)),
    'W': ((-HALF, HALF), (-HALF, -HALF)),
}
OUTLINE = {            # the same sides on the outer face (string courses, red band and cornice)
    'S': ((-OUT, -OUT), (OUT, -OUT)),
    'E': ((OUT, -OUT), (OUT, OUT)),
    'N': ((OUT, OUT), (-OUT, OUT)),
    'W': ((-OUT, OUT), (-OUT, -OUT)),
}

# marble skin with recessed arched windows (two per face per storey) and the ground-level door on the east face
for key, (p0, p1) in SIDES.items():
    ops = []
    for k in range(1, 8):                              # storeys above the string courses at z = 5, 10 ... 35
        zb = 5.0 * k + 1.2                             # windows from z = 6.2 up to 38.6
        ops += [(0.3 * L, zb, 1.0, 2.4, 'arch'), (0.7 * L, zb, 1.0, 2.4, 'arch')]
    if key == 'E':
        ops.append((L / 2, 0.0, 2.2, 4.2, 'arch'))     # door, centred on the east face, ground level
    opening_skin(None, p0[0], p0[1], p1[0], p1[1], 0.0, TOP, ops, 'marble', depth=0.34)

# thin marble string courses every 5 m (0.2 m high, 0.08 m proud of the wall), one red band just under the top
# cornice (z ~ 38.7, above the top windows) and the marble cornice under the platform (z ~ 39.5); on the west face
# the bands and cornice stop either side of the copper conductor, which runs down the middle of that face
for key, (p0, p1) in OUTLINE.items():
    segs = [(p0, p1)]
    if key == 'W':
        segs = [((-OUT, OUT), (-OUT, 0.9)), ((-OUT, -0.9), (-OUT, -OUT))]
    for a, b in segs:
        for k in range(1, 8):
            band(None, a[0], a[1], b[0], b[1], 5.0 * k, 0.2, 0.08, 'marble')
        band(None, a[0], a[1], b[0], b[1], 38.68, 0.28, 0.36, 'red')
        cornice(None, a[0], a[1], b[0], b[1], 39.5, 0.9, 0.6, 'marble')


# battered tuff plinth, z = 0 to PL_H: PL_B out at the ground, flush with the shaft at z = PL_H
def _pl(n, t, u, z):
    r = OUT + PL_B * (1.0 - z / PL_H)
    return (n[0] * r + t[0] * u, n[1] * r + t[1] * u, z)


def _pl_quad(n, t, lo0, hi0, lo_top, hi_top):
    add_poly('tuff', [_pl(n, t, lo0, 0.0), _pl(n, t, hi0, 0.0), _pl(n, t, hi_top, PL_H), _pl(n, t, lo_top, PL_H)])


DOOR_HW = 1.1          # half width of the door notch in the plinth (door is 2.2 m wide)
_pl_quad((0, 1), (-1, 0), -FOOT, FOOT, -OUT, OUT)                    # N face
_pl_quad((0, -1), (1, 0), -FOOT, FOOT, -OUT, OUT)                    # S face
_pl_quad((-1, 0), (0, -1), -FOOT, FOOT, -OUT, OUT)                   # W face
_pl_quad((1, 0), (0, 1), -FOOT, -DOOR_HW, -OUT, -DOOR_HW)            # E face, left of the door
_pl_quad((1, 0), (0, 1), DOOR_HW, FOOT, DOOR_HW, OUT)                # E face, right of the door
for s in (-1, 1):                                                    # side walls of the door notch
    add_poly('tuff', [(OUT, s * DOOR_HW, 0.0), (OUT + PL_B, s * DOOR_HW, 0.0), (OUT, s * DOOR_HW, PL_H)])

# Roman belvedere (book: Nero and the narrator watch the stars from the top; the spear stands on the platform): the
# floor slab, a ledge 0.9 m wider than the shaft that rests on the cornice, and an Ionic colonnade round it, open to the sky
PW = 6.9               # half width of the ledge
RC = 6.35              # centre line of the colonnade
COL_H = 4.3            # column height (base to capital)
LD0 = 39.9             # underside of the ledge (it sits on the cornice, whose top is at 39.905)
box(None, 0, 0, TOP, L, L, FLOOR - TOP, 'paving')


def ledge(x0, y0, x1, y1):
    box(None, (x0 + x1) / 2, (y0 + y1) / 2, LD0, x1 - x0, y1 - y0, FLOOR - LD0, 'paving')


ledge(HALF, -PW, PW, PW)                     # east strip
ledge(-HALF, HALF, HALF, PW)                 # north strip
ledge(-HALF, -PW, HALF, -HALF)               # south strip
ledge(-PW, -PW, -HALF, -0.55)                # west strip, split so that the copper conductor passes at y = 0
ledge(-PW, 0.55, -HALF, PW)

STEP = 2 * RC / 5                            # six columns per side, the corner columns shared: 20 in all
cols = [-RC + k * STEP for k in range(6)]
pts = [(u, -RC) for u in cols] + [(u, RC) for u in cols] + [(-RC, u) for u in cols[1:5]] + [(RC, u) for u in cols[1:5]]
for (px, py) in pts:
    column(None, px, py, FLOOR, COL_H, 0.26, 'marble', 'ionic', flutes=10, seg=12)
ring = [(-RC, -RC), (RC, -RC), (RC, RC), (-RC, RC)]       # counter-clockwise: S, E, N, W side
for i in range(4):
    a, b = ring[i], ring[(i + 1) % 4]
    entablature(None, a[0], a[1], b[0], b[1], FLOOR + COL_H, 0.9, 0.7, 'marble', frieze_mat='red')
INS = 0.36                                   # a balustrade panel between the columns, one per bay
for i in range(4):
    a, b = ring[i], ring[(i + 1) % 4]
    dx, dy = (b[0] - a[0]) / (2 * RC), (b[1] - a[1]) / (2 * RC)
    for k in range(5):
        if i == 3 and k == 2:                # the middle bay of the west side stays open: the conductor goes through it
            continue
        s0, s1 = k * STEP + INS, (k + 1) * STEP - INS
        balustrade(None, a[0] + dx * s0, a[1] + dy * s0, a[0] + dx * s1, a[1] + dy * s1, FLOOR, 1.0, 'marble', 1.9, 0.22)

# stepped plinth in the middle of the platform: four steps, 5.0 m down to 2.6 m, 0.3 m each;
# the treads alternate marble and stone so that the four steps read from above
for i in range(4):
    w = 5.0 - 0.8 * i
    box(None, 0, 0, FLOOR, w, w, 0.3 * (i + 1), 'marble' if i % 2 == 0 else 'stone')

# iron spear on the plinth, 10 m tall, with a silver tip over its top 0.8 m (radius 0.09 m)
cyl(None, 0, 0, SPEAR_BASE, 0.09, 9.2, 'iron', seg=8, r_top=0.09)
cyl(None, 0, 0, SPEAR_BASE + 9.2, 0.09, 0.8, 'silver', seg=8, r_top=0.0)

# copper conductor: from the spear base down the stepped plinth, along the platform floor through the open west bay,
# then down the west face to z = -12. It rests on every tread and the floor (nothing hangs in the air).
CU = 0.12                                # braid size (radius ~0.06 m)
C = CU / 2
XW = -OUT - C                            # braid just off the west face, x = -6.06
XP = -HALF + 0.06                        # braid on the floor near the west edge of the slab, x = -5.59
route = [(0.0, SPEAR_BASE + C)]
for i in (3, 2, 1, 0):                   # treads of the four steps, top down
    Ti = FLOOR + 0.3 * (i + 1)           # tread height of step i
    Hi = 1.3 + 0.4 * (3 - i)             # half width of step i
    Tn = FLOOR + 0.3 * i                 # tread below (the floor for i = 0)
    route.append((-(Hi + C), Ti + C))
    route.append((-(Hi + C), Tn + C))
# down the west face to the top of the plinth, along the batter (offset 0.06 m from it), then down to z = -12
route += [(XP, FLOOR + C), (XW, FLOOR + C), (XW, PL_H), (XW - PL_B, 0.0), (XW - PL_B, -12.0)]
for a, b in zip(route, route[1:]):
    beam(None, a[0], 0, a[1], b[0], 0, b[1], CU, CU, 'copper')
for j in range(12):                                                     # ochre insulator sleeves every 3 m
    cyl(None, XW, 0, 37.6 - 3.0 * j, 0.13, 0.25, 'ochre', seg=8, r_top=0.13, caps=False)

# stair-head hut in the NE corner of the platform: 2.6 m square, 2.6 m high, tiled gable roof, door to the west
HX, HY = 3.8, 3.8
HF = Frame(HX, HY, FLOOR, 0.0)
box(HF, 0, 0, 0, 1.9, 1.9, 2.6, 'plaster')
opening_skin(HF, -0.95, 0.95, -0.95, -0.95, 0.0, 2.6, [(0.95, 0.0, 1.0, 2.0, 'rect')], 'plaster', depth=0.35)   # W, door
opening_skin(HF, 0.95, -0.95, 0.95, 0.95, 0.0, 2.6, [], 'plaster', depth=0.35)                                     # E
opening_skin(HF, 0.95, 0.95, -0.95, 0.95, 0.0, 2.6, [], 'plaster', depth=0.35)                                     # N
opening_skin(HF, -0.95, -0.95, 0.95, -0.95, 0.0, 2.6, [], 'plaster', depth=0.35)                                   # S
gable_roof(None, HX, HY, FLOOR + 2.6, 2.6, 2.6, pitch=22.0, axis='x', overhang=0.4, mat='tile', tiles=True,
           rib_mat='tile2', gable_mat='plaster')

human(None, 10, -8)                      # 1.8 m scale figure in the previews only
finish('ant_tower', front='+X', extra_cams=[('west', Vector((-1, 0, 0)), 6)])   # extra west view: copper line and sleeves
