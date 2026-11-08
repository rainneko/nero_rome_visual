"""rome_tabernae · the ground floor of a Roman apartment block: shops (tabernae) with real rooms behind their doors.

Evidence and sources: briefs/rome/ground-floor.md. Used by rome_insulae2.py (rome_insula_d ... rome_insula_h).
Frames: S = _seg_frame on a wall line, local x (u) along the line, local -y = the street, z up. A shop room lies BEHIND
the line (0 < y < D) and must not be filled by the building's core box (build the ground core inset by D on that side).
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *            # noqa: F401,F403
from rk import _seg_frame
from mathutils import Vector

AMPH = [(0.012, 0.0), (0.095, 0.13), (0.150, 0.42), (0.158, 0.54), (0.114, 0.79), (0.074, 0.89), (0.058, 1.0),
        (0.068, 1.05), (0.012, 1.06)]
JAR = {'jar': [(0.01, 0.0), (0.7, 0.02), (1.0, 0.45), (0.85, 0.8), (0.5, 0.92), (0.62, 1.0), (0.01, 1.0)],
       'dolium': [(0.01, 0.0), (0.7, 0.05), (1.0, 0.5), (0.82, 0.9), (0.62, 1.0), (0.01, 1.0)],
       'jug': [(0.01, 0.0), (0.8, 0.02), (1.0, 0.35), (0.55, 0.72), (0.35, 0.86), (0.45, 1.0), (0.01, 1.0)]}
CEIL = 2.85                 # underside of the loft (pergula) floor in every shop
OH = 2.7                    # height of a shop door


def q4(mat, pts, ref, sign=1.0):
    """A polygon facing away from point ref (sign 1) or towards it (sign -1), whatever the order of pts."""
    a, b, c = pts[0], pts[1], pts[2]
    mid = sum(pts, Vector((0, 0, 0))) / len(pts)
    if (b - a).cross(c - a).dot((mid - ref) * sign) < 0:
        pts = list(reversed(pts))
    add_poly(mat, pts)


def arch(S, u, z, span, rise, yf, t=0.26, proj=0.07, mat='tile2', seg=6):
    """A segmental brick relieving arch on a wall face (y = yf in frame S, street = -y), springing at z."""
    R = (span * span / 4 + rise * rise) / (2 * rise); zc = z + rise - R
    phi = math.asin(min(1.0, span / 2 / R))
    angs = [math.pi / 2 + phi - 2 * phi * i / seg for i in range(seg + 1)]
    yb, yo = yf + 0.02, yf - proj
    pt = lambda r, a, y: S.p(u + r * math.cos(a), y, zc + r * math.sin(a))
    ctr, back = S.p(u, yf, zc), S.p(u, yf + 10.0, zc)
    for i in range(seg):
        a0, a1 = angs[i], angs[i + 1]
        q4(mat, [pt(R, a0, yo), pt(R, a1, yo), pt(R + t, a1, yo), pt(R + t, a0, yo)], back)
        q4(mat, [pt(R + t, a0, yo), pt(R + t, a1, yo), pt(R + t, a1, yb), pt(R + t, a0, yb)], ctr)
        q4(mat, [pt(R, a0, yo), pt(R, a1, yo), pt(R, a1, yb), pt(R, a0, yb)], ctr, -1.0)


def jar(S, x, y, z0, h, r, mat='tile', seg=7, kind='jar'):
    lathe(S, x, y, [(rr * r, z0 + zz * h) for rr, zz in JAR[kind]], mat, seg, smooth=True)


def amphora(S, x, y, z0, s=0.9, lean=(0.0, 0.0), mat='tile', seg=6):
    """A transport amphora standing on its toe at (x, y, z0), leaning by (dx, dy) per metre of height."""
    base = S.p(x, y, z0); a = (S.p(x + lean[0], y + lean[1], z0 + 1.0) - base).normalized()
    u = (Vector((1.0, 0.0, 0.0)) - a * a.x).normalized(); v = a.cross(u); V = []
    for (r, t) in AMPH:
        for j in range(seg):
            ph = TAU * j / seg
            V.append(base + a * (t * s) + (u * math.cos(ph) + v * math.sin(ph)) * (r * s))
    n = len(AMPH); Fc = []
    for i in range(n - 1):
        for j in range(seg):
            a0 = i * seg + j; a1 = i * seg + (j + 1) % seg
            Fc.append((a0, a1, (i + 1) * seg + (j + 1) % seg, (i + 1) * seg + j))
    Fc.append(tuple(reversed(range(seg)))); Fc.append(tuple(range((n - 1) * seg, n * seg)))
    add_mesh(mat, V, Fc, smooth=True)


def loaf(S, x, y, z, r=0.11):
    """A round loaf (panis quadratus): a low domed disc."""
    cyl(S, x, y, z, r, 0.05, 'ochre', 7, r_top=r * 0.8)


def room(S, u0, u1, D, h=CEIL, wall='plaster', floor='paving', ceil='wood', sides=(True, True), joists=True, back=True):
    """The inside of a shop behind the line: floor, back wall, side walls, timber ceiling (the loft floor) and joists."""
    P = lambda u, y, z: S.p(u, y, z)
    c = P((u0 + u1) / 2, D / 2, h / 2)
    q4(floor, [P(u0, 0, 0), P(u1, 0, 0), P(u1, D, 0), P(u0, D, 0)], c, -1)
    if ceil:
        q4(ceil, [P(u0, 0, h), P(u1, 0, h), P(u1, D, h), P(u0, D, h)], c, -1)
    if back:
        q4(wall, [P(u0, D, 0), P(u1, D, 0), P(u1, D, h), P(u0, D, h)], c, -1)
    for k, uu in enumerate((u0, u1)):
        if sides[k]:
            q4(wall, [P(uu, 0, 0), P(uu, D, 0), P(uu, D, h), P(uu, 0, h)], c, -1)
    if joists:
        for t in (0.3, 0.65):
            box(S, (u0 + u1) / 2, D * t, h - 0.16, u1 - u0, 0.14, 0.16, 'wood')


def loft_stair(S, ux, D, h=CEIL, toward=1):
    """【史】A brick stair of four steps in a back corner and a wooden ladder up to a hatch in the loft floor."""
    for k in range(4):
        box(S, ux, D - 1.2 + 0.28 * k + 0.14, 0.0, 0.7, 0.28, 0.22 * (k + 1), 'brick')
    for dx in (-0.22, 0.22):
        beam(S, ux + dx, D - 0.55, 0.88, ux + dx, D - 0.18, h, 0.05, 0.06, 'wood')
    for k in range(1, 4):
        t = k / 4.0
        beam(S, ux - 0.22, D - 0.55 + 0.37 * t, 0.88 + (h - 0.88) * t, ux + 0.22, D - 0.55 + 0.37 * t,
             0.88 + (h - 0.88) * t, 0.04, 0.04, 'wood')
    q4('dark', [S.p(ux - 0.35, D - 0.75, h - 0.01), S.p(ux + 0.35, D - 0.75, h - 0.01),
                S.p(ux + 0.35, D - 0.05, h - 0.01), S.p(ux - 0.35, D - 0.05, h - 0.01)], S.p(ux, D / 2, 0.0))


def dark_panel(S, u, zb, w, h, y=-0.004):
    """A dark back panel behind an opening that has no room behind it (inner=None skins), just in front of the core."""
    q4('dark', [S.p(u - w / 2, y, zb), S.p(u + w / 2, y, zb), S.p(u + w / 2, y, zb + h), S.p(u - w / 2, y, zb + h)],
       S.p(u, y - 5.0, zb + h / 2))


def threshold(S, u, ow, yf):
    """【史】Travertine threshold with the long groove for the night boards."""
    box(S, u, yf + 0.2, -0.02, ow + 0.1, 0.5, 0.06, 'travertine')
    box(S, u, yf + 0.12, 0.035, ow - 0.1, 0.05, 0.01, 'dark')


def boards(S, u, ow, oh, yf, mode='stack'):
    """The shutter boards: 'stack' = three leaning inside by the jamb (shop open), 'closed' = standing in the groove."""
    if mode == 'closed':
        n = max(3, int(ow / 0.34)); bw = ow / n
        for k in range(n):
            box(S, u - ow / 2 + (k + 0.5) * bw, yf + 0.12, 0.03, bw - 0.025, 0.05, oh - 0.05, 'wood')
        box(S, u, yf + 0.06, 1.1, ow, 0.05, 0.08, 'wood')                                  # the bar across them
        return
    for k in range(3):
        box(S, u - ow / 2 + 0.22, 0.12 + k * 0.07, 0.0, 0.32, 0.05, oh * 0.92, 'wood', rot=-4 + 4 * k)


def trim(S, u, ow, oh, yf, pw, frame='travertine', lintel='travertine'):
    """Jambs, lintel, the loft window's sill and a brick relieving arch over lintel and window."""
    if frame:
        for sd in (-1, 1):
            box(S, u + sd * (ow / 2 + 0.1), yf + 0.03, 0.0, 0.24, 0.16, oh, frame)
    box(S, u, yf + 0.03, oh, ow + 0.44, 0.16, 0.3, lintel)
    arch(S, u, oh + 0.3, ow + 0.44, min(0.75, (ow + 0.44) / 2), yf)
    if pw > 0:
        box(S, u, yf + 0.03, oh + 0.36, pw + 0.12, 0.12, 0.06, 'wood')


def programma(S, u, z, yf, w=0.9, lines=3):
    """【史】A painted election notice: red letters (read as strokes from the street) on a whitewashed panel."""
    box(S, u, yf - 0.005, z, w, 0.01, 0.16 + lines * 0.16, 'linen')
    for k in range(lines):
        lw = w * (0.86 if k == 0 else 0.55 + 0.12 * ((k * 7) % 3))
        box(S, u, yf - 0.012, z + 0.1 + (lines - 1 - k) * 0.16, lw, 0.01, 0.1 if k == 0 else 0.07, 'red')


def shrine(S, u, z, yf):
    """【史】A painted shrine by a door: red panel, a stone shelf for offerings and a clay lamp on it."""
    box(S, u, yf - 0.005, z, 0.8, 0.01, 0.95, 'red')
    box(S, u, yf - 0.009, z + 0.12, 0.56, 0.01, 0.62, 'ochre')
    for dx in (-0.12, 0.12):
        box(S, u + dx, yf - 0.013, z + 0.18, 0.05, 0.01, 0.5, 'hedge')                    # the two painted snakes
    box(S, u, yf - 0.12, z - 0.06, 0.6, 0.24, 0.06, 'stone')
    box(S, u, yf - 0.12, z, 0.12, 0.07, 0.05, 'tile')


def bench(S, u, yf, w=1.5):
    """A masonry bench against the front wall in the street."""
    box(S, u, yf - 0.22, 0.0, w, 0.42, 0.45, 'stone')


# ---------------------------------------------------------------- trades (inside a room u0..u1, 0..D, door width ow)
def counter_L(S, u, ow, top='marble', body='stone', paint=False, jars=0):
    """【史】An L-shaped masonry counter at the front of the shop, a gap on the right to walk in."""
    x0, x1 = u - ow / 2 + 0.05, u + ow * 0.12
    box(S, (x0 + x1) / 2, 0.38, 0.0, x1 - x0, 0.55, 0.92, body)
    box(S, (x0 + x1) / 2, 0.38, 0.92, x1 - x0 + 0.06, 0.61, 0.07, top)
    box(S, x0 + 0.3, 1.15, 0.0, 0.55, 1.0, 0.92, body)
    box(S, x0 + 0.3, 1.15, 0.92, 0.61, 1.0, 0.07, top)
    if paint:                                                     # painted counter front: red panels on ochre
        box(S, (x0 + x1) / 2, 0.095, 0.0, x1 - x0, 0.01, 0.92, 'plaster2')
        n = max(2, int((x1 - x0) / 0.7))
        for k in range(n):
            box(S, x0 + (k + 0.5) * (x1 - x0) / n, 0.088, 0.14, (x1 - x0) / n - 0.16, 0.01, 0.62, 'red')
    for k in range(jars):                                         # dolia set into the counter: dark mouths, marble rims
        hx = x0 + 0.35 + k * (x1 - x0 - 0.5) / max(1, jars - 1)
        cyl(S, hx, 0.38, 0.995, 0.17, 0.004, 'dark', 10)
        cyl(S, hx, 0.38, 0.99, 0.21, 0.02, 'marble', 10, r_top=0.2)
    return x0, x1


def trade_bread(S, u, ow, u0, u1, D, yf):
    counter_L(S, u, ow)
    x0 = u - ow / 2
    for k in range(5):
        loaf(S, x0 + 0.3 + k * 0.26, 0.38, 0.99)
    for z in (1.15, 1.65):                                        # shelves of loaves on the back wall
        box(S, (u0 + u1) / 2 - 0.4, D - 0.2, z, u1 - u0 - 1.4, 0.36, 0.05, 'wood')
        for k in range(int((u1 - u0 - 1.6) / 0.3)):
            loaf(S, u0 + 0.4 + k * 0.3, D - 0.2, z + 0.05, 0.12)
    for dx in (-0.55, 0.55):                                      # baskets of bread in the street
        cyl(S, u + dx, yf - 0.45, 0.0, 0.27, 0.32, 'wood', 8, r_top=0.32)
        for a in range(3):
            loaf(S, u + dx + 0.12 * math.cos(a * 2.1), yf - 0.45 + 0.12 * math.sin(a * 2.1), 0.32, 0.1)


def trade_fish(S, u, ow, u0, u1, D, yf):
    """【史】Ostia's fishmongers: a marble table in the middle, a basin on the back wall."""
    box(S, u, D * 0.45, 0.0, 0.9, 0.5, 0.78, 'stone')
    box(S, u, D * 0.45, 0.78, 1.5, 0.85, 0.08, 'marble')
    for k in range(6):
        box(S, u - 0.55 + k * 0.22, D * 0.45 + (0.12 if k % 2 else -0.12), 0.86, 0.38, 0.09, 0.05, 'grey',
            rot=70 + 25 * (k % 3))
    box(S, u, D - 0.32, 0.0, 1.7, 0.6, 0.72, 'marble')
    box(S, u, D - 0.32, 0.6, 1.5, 0.46, 0.1, 'blue')
    cyl(S, u - 0.6, yf - 0.4, 0.0, 0.3, 0.28, 'wood', 8, r_top=0.34)
    for k in range(3):
        box(S, u - 0.6 + (k - 1) * 0.12, yf - 0.4, 0.28, 0.34, 0.08, 0.05, 'grey', rot=80 + 30 * k)


def trade_oil(S, u, ow, u0, u1, D, yf):
    """【史】Amphorae on a wooden rack against the back wall (Herculaneum), oil jars by the door."""
    for x in (u0 + 0.3, u1 - 0.3):
        box(S, x, D - 0.25, 0.0, 0.1, 0.1, 1.3, 'wood')
    box(S, (u0 + u1) / 2, D - 0.25, 1.0, u1 - u0 - 0.5, 0.08, 0.08, 'wood')
    n = int((u1 - u0 - 0.8) / 0.42)
    for k in range(n):
        amphora(S, u0 + 0.6 + k * 0.42, D - 0.45, 0.0, 0.95, (0.0, 0.12))
    jar(S, u - ow / 2 + 0.5, 0.75, 0.0, 0.9, 0.4, 'tile', 8, 'dolium')
    jar(S, u + ow / 2 - 0.45, 1.0, 0.0, 0.8, 0.36, 'tile', 8, 'dolium')
    for dx in (-0.35, 0.0):
        jar(S, u - ow / 2 + 0.3 + dx, yf - 0.35, 0.0, 0.42, 0.13, 'tile2', 6, 'jug')
    amphora(S, u + ow / 2 + 0.45, yf - 0.25, 0.0, 0.9, (0.0, 0.18))


def trade_pottery(S, u, ow, u0, u1, D, yf):
    for z in (0.6, 1.2, 1.8):                                     # shelves of jars and dishes
        box(S, (u0 + u1) / 2, D - 0.22, z, u1 - u0 - 0.3, 0.4, 0.05, 'wood')
        k = 0; x = u0 + 0.35
        while x < u1 - 0.35:
            if k % 3 == 2:
                cyl(S, x, D - 0.22, z + 0.05, 0.15, 0.14, 'tile2', 8, r_top=0.17)       # a stack of dishes
            else:
                jar(S, x, D - 0.22, z + 0.05, 0.36, 0.12, 'tile', 6, 'jar' if k % 2 else 'jug')
            x += 0.34; k += 1
    for k, (dx, h, r) in enumerate(((-0.9, 0.75, 0.28), (-0.35, 0.55, 0.2), (0.45, 0.85, 0.3), (0.95, 0.4, 0.16))):
        jar(S, u + dx, yf - 0.45 - 0.1 * (k % 2), 0.0, h, r, 'tile' if k % 2 else 'tile2', 7)
    for k in range(3):
        cyl(S, u + 0.05, yf - 0.4, 0.12 * k, 0.17, 0.12, 'tile', 8, r_top=0.19)


def trade_bar(S, u, ow, u0, u1, D, yf, lararium=True):
    """【史】A food bar (thermopolium): painted L-counter with dolia, a stepped shelf for jugs, a lararium painting."""
    x0, x1 = counter_L(S, u, ow, paint=True, jars=3)
    for k, (yc, top) in enumerate(((1.75, 1.15), (2.0, 1.4), (2.25, 1.65))):
        box(S, x0 + 0.3, yc, 0.0, 0.55, 0.25, top, 'plaster2')
        jar(S, x0 + 0.3, yc, top, 0.3, 0.1, 'tile2', 6, 'jug')
    if lararium:
        shrine(S, (u0 + u1) / 2 + 0.3, 1.3, D)
    amphora(S, u1 - 0.35, D - 0.3, 0.0, 0.9, (0.0, 0.15))
    amphora(S, u1 - 0.75, D - 0.3, 0.0, 0.9, (0.0, 0.15))


def trade_cloth(S, u, ow, u0, u1, D, yf, cols=('linen', 'red', 'blue', 'awning', 'ochre')):
    """A dyer's shop: two vats inside, dyed cloth hung on a pole over the street."""
    for k, m in enumerate(('red', 'blue')):
        x = u - 0.6 + k * 1.2
        cyl(S, x, D * 0.55, 0.0, 0.45, 0.7, 'stone', 10)
        cyl(S, x, D * 0.55, 0.62, 0.38, 0.03, m, 10)
    beam(S, u - ow / 2 - 0.4, yf - 0.85, 2.55, u + ow / 2 + 0.4, yf - 0.85, 2.55, 0.05, 0.05, 'wood')
    for sd in (-1, 1):
        beam(S, u + sd * (ow / 2 + 0.4), yf + 0.02, 2.75, u + sd * (ow / 2 + 0.4), yf - 0.85, 2.55, 0.05, 0.05, 'wood')
    n = len(cols); w = (ow + 0.6) / n
    for k, m in enumerate(cols):
        hh = 1.1 + 0.25 * ((k * 5) % 3) / 2
        box(S, u - ow / 2 - 0.3 + (k + 0.5) * w, yf - 0.85, 2.53 - hh, w - 0.08, 0.02, hh, m)


def trade_mill(S, u, ow, u0, u1, D, yf):
    """【史】A bakery: hourglass lava mills (meta and catillus) with their wooden arms, a brick oven at the back."""
    for k, x in enumerate((u0 + 1.1, u0 + 2.9)):
        y = D * 0.42
        cyl(S, x, y, 0.0, 0.75, 0.28, 'stone', 12)
        lathe(S, x, y, [(0.46, 0.28), (0.4, 0.55), (0.06, 1.25), (0.01, 1.27)], 'basalt', 10, smooth=True)
        lathe(S, x, y, [(0.01, 0.62), (0.44, 0.62), (0.26, 1.02), (0.44, 1.45), (0.01, 1.45)], 'basalt', 10, smooth=True)
        beam(S, x - 0.85, y, 1.02, x + 0.85, y, 1.02, 0.1, 0.12, 'wood')
    ox = u1 - 1.3
    box(S, ox, D - 0.95, 0.0, 1.9, 1.7, 0.95, 'brick')
    sphere(S, ox, D - 0.95, 0.95, 0.85, 'brick', 10, 5, z_scale=0.75)
    box(S, ox, D - 1.82, 0.95, 0.6, 0.06, 0.45, 'dark')
    box(S, ox, D - 1.85, 0.9, 0.9, 0.12, 0.08, 'stone')
    for k in range(4):                                            # sacks of flour by the wall
        cyl(S, u0 + 0.35 + 0.42 * k, D - 0.3, 0.0, 0.2, 0.55, 'linen', 7, r_top=0.14)


def basin(S, x, y, w, d, h=0.62, mat='stone', water='water', rim=0.1):
    """A masonry tank: a solid base, four low rim walls and a water surface 12 cm under the rim."""
    box(S, x, y, 0.0, w, d, h - 0.2, mat)
    box(S, x, y, h - 0.2, w - 2 * rim, d - 2 * rim, 0.08, water)
    for sx in (-1, 1):
        box(S, x + sx * (w - rim) / 2, y, h - 0.2, rim, d, 0.2, mat)
        box(S, x, y + sx * (d - rim) / 2, h - 0.2, w - 2 * rim, rim, 0.2, mat)


def trade_fuller(S, u, ow, u0, u1, D, yf):
    """【史】A fullonica (Stephanus, Pompeii I.6.7): treading stalls (saltus) along the back wall, a large rinsing tank,
    the cloth press against the left wall by the door, a wicker frame for bleaching cloth over sulphur, folded cloth."""
    n = max(2, int((u1 - u0 - 1.6) / 0.95))
    for k in range(n):
        basin(S, u1 - 0.6 - k * 0.95, D - 0.5, 0.9, 0.85, 0.7, water='mud')        # cloth trodden in fuller's earth
    basin(S, u + 0.3, D * 0.42, 2.0, 1.1, 0.75)
    px, py = u0 + 0.45, 1.0                                       # the press (pressa): two posts, a screw, boards of cloth
    for dy in (-0.42, 0.42):
        box(S, px, py + dy, 0.0, 0.14, 0.14, 2.0, 'wood')
    box(S, px, py, 1.9, 0.18, 1.0, 0.14, 'wood')
    cyl(S, px, py, 1.2, 0.05, 0.7, 'wood', 6)
    box(S, px, py, 0.55, 0.5, 0.75, 0.06, 'wood')
    for k in range(4):
        box(S, px, py, 0.61 + k * 0.1, 0.42, 0.66, 0.09, 'linen' if k % 2 else 'awning')
    box(S, px, py, 1.1, 0.5, 0.75, 0.06, 'wood')
    box(S, px, py, 0.0, 0.5, 0.75, 0.55, 'stone')
    sphere(S, u - ow / 2 + 0.9, 0.7, 0.0, 0.55, 'linen', 8, 4, z_scale=1.2)      # cloth over the wicker bleaching frame
    for k, m in enumerate(('linen', 'red', 'linen')):
        box(S, u + ow / 2 - 0.5, yf - 0.35, 0.0 + 0.12 * k, 0.6, 0.45, 0.11, m)       # folded cloth for collection


def trade_smith(S, u, ow, u0, u1, D, yf):
    """【史】A smith's shop (faber ferrarius; Tyrsus, Pompeii I.6.1): a raised brick hearth with a hood and glowing coals,
    an anvil on a block of wood, a quenching tub, tools on the wall, iron and bronze goods set out by the door."""
    hx = u1 - 0.95
    box(S, hx, D - 0.6, 0.0, 1.3, 1.0, 0.8, 'brick')
    box(S, hx, D - 0.65, 0.8, 0.8, 0.55, 0.05, 'flame')
    box(S, hx, D - 0.55, 1.75, 1.5, 1.1, 0.22, 'brick')
    box(S, hx, D - 0.3, 1.97, 0.6, 0.6, CEIL - 1.97, 'brick')
    cyl(S, u - 0.2, D * 0.45, 0.0, 0.24, 0.55, 'wood', 8)
    box(S, u - 0.2, D * 0.45, 0.55, 0.42, 0.16, 0.16, 'iron')
    cyl(S, hx - 1.1, D - 0.45, 0.0, 0.3, 0.5, 'wood', 8)
    cyl(S, hx - 1.1, D - 0.45, 0.46, 0.26, 0.02, 'water', 8)
    for k in range(5):
        box(S, u0 + 0.5 + k * 0.28, D - 0.03, 1.3, 0.05, 0.03, 0.5 + 0.12 * (k % 2), 'iron')
    cyl(S, u - 0.75, yf - 0.4, 0.0, 0.28, 0.32, 'bronze', 10, r_top=0.33)            # a cauldron
    box(S, u + 0.55, yf - 0.35, 0.0, 0.7, 0.4, 0.3, 'wood')
    for k in range(4):                                            # sickles, hoe blades and nails on a low crate
        box(S, u + 0.3 + k * 0.17, yf - 0.35, 0.3, 0.12, 0.3, 0.03, 'iron', rot=10 * k)


PRODUCE = ('hedge', 'red', 'flowerY', 'ochre', 'flowerP', 'hedge', 'flowerR')


def trade_green(S, u, ow, u0, u1, D, yf):
    """【史】A fruit and vegetable seller (pomarius; the fruit-sellers signed election notices at Pompeii, CIL IV 202):
    a stepped stand of baskets in the street, sacks and strings of onions inside."""
    n = max(3, int((ow + 0.2) / 0.45))
    for k in range(3):
        y = yf - 0.95 + k * 0.32
        box(S, u, y, 0.0, ow + 0.2, 0.34, 0.3 + 0.24 * k, 'wood')
        for j in range(n):
            x = u - (ow + 0.2) / 2 + (j + 0.5) * (ow + 0.2) / n
            cyl(S, x, y, 0.3 + 0.24 * k, 0.17, 0.1, 'wood', 7, r_top=0.2)
            sphere(S, x, y, 0.4 + 0.24 * k, 0.15, PRODUCE[(j + 3 * k) % len(PRODUCE)], 6, 3, z_scale=0.6)
    for k in range(3):
        cyl(S, u0 + 0.4 + 0.45 * k, D - 0.3, 0.0, 0.22, 0.6, 'linen', 7, r_top=0.15)
    for k in range(4):                                            # strings of onions and garlic from a pole
        box(S, u - 0.6 + k * 0.4, D * 0.5, CEIL - 0.95, 0.12, 0.12, 0.75, 'ochre' if k % 2 else 'linen')
    beam(S, u0 + 0.2, D * 0.5, CEIL - 0.18, u1 - 0.2, D * 0.5, CEIL - 0.18, 0.06, 0.06, 'wood')


def trade_barber(S, u, ow, u0, u1, D, yf):
    """【史】A barber (tonstrina): a bench along the wall for those waiting, a stool, a basin on a stand, a bronze mirror;
    before Domitian's edict barbers also shaved in the street (Martial 7.61), so a second stool stands outside."""
    box(S, (u0 + u1) / 2, D - 0.25, 0.0, u1 - u0 - 0.3, 0.4, 0.45, 'wood')
    for x, y in ((u - 0.2, D * 0.45), (u + 0.6, yf - 0.6)):
        box(S, x, y, 0.42, 0.42, 0.42, 0.05, 'wood')
        for dx in (-0.16, 0.16):
            for dy in (-0.16, 0.16):
                box(S, x + dx, y + dy, 0.0, 0.05, 0.05, 0.42, 'wood')
    cyl(S, u + 0.55, D * 0.45, 0.0, 0.08, 0.8, 'stone', 6)
    cyl(S, u + 0.55, D * 0.45, 0.8, 0.25, 0.12, 'bronze', 10, r_top=0.3)
    box(S, u, D - 0.03, 1.2, 0.36, 0.02, 0.45, 'bronze')
    bench(S, u - ow / 2 - 0.9, yf, w=1.2)


def cart(S, x, y, rot=0.0):
    """A two-wheeled cart (carrus) with its shafts on the ground, body along local y (shafts towards -y)."""
    C = S.sub(x, y, 0.0, rot)
    box(C, 0, 0.2, 0.75, 1.2, 1.8, 0.12, 'wood')
    for sx in (-1, 1):
        box(C, sx * 0.57, 0.2, 0.87, 0.06, 1.8, 0.35, 'wood')
        vdisc(C, sx * 0.72, 0.3, 0.55, 0.55, 0.1, 'wood', 10)
        beam(C, sx * 0.35, -0.7, 0.75, sx * 0.3, -1.9, 0.08, 0.08, 0.1, 'wood')
    box(C, 0, 0.3, 0.5, 1.6, 0.1, 0.1, 'wood')
    box(C, 0, 1.12, 0.87, 1.2, 0.06, 0.35, 'wood')


def trade_butcher(S, u, ow, u0, u1, D, yf):
    """【史】A butcher (lanius): joints on hooks from a rail across the door, a chopping block, a steelyard; in the street a
    trestle table with more meat (Martial 7.61 names the butcher among those who worked in the street before Domitian)."""
    beam(S, u - ow / 2 + 0.1, 0.45, 2.35, u + ow / 2 - 0.1, 0.45, 2.35, 0.06, 0.06, 'iron')
    for k in range(int(ow / 0.38)):
        x = u - ow / 2 + 0.3 + k * 0.38
        box(S, x, 0.45, 2.3, 0.02, 0.02, 0.06, 'iron')
        box(S, x, 0.45, 1.75 - 0.12 * (k % 2), 0.2 + 0.04 * (k % 3), 0.13, 0.55 + 0.12 * (k % 2), 'red' if k % 3 else 'flowerR')
    cyl(S, u + 0.5, D * 0.55, 0.0, 0.36, 0.82, 'wood', 10)
    box(S, u + 0.5, D * 0.55, 0.82, 0.3, 0.05, 0.03, 'iron', rot=30)
    beam(S, u0 + 0.4, D - 0.4, 1.9, u0 + 1.1, D - 0.4, 1.9, 0.04, 0.04, 'bronze')
    box(S, u0 + 0.5, D - 0.4, 1.5, 0.22, 0.22, 0.04, 'bronze')
    box(S, u, yf - 0.55, 0.78, 1.9, 0.6, 0.05, 'wood')
    for dx in (-0.8, 0.8):
        for dy in (-0.2, 0.2):
            beam(S, u + dx, yf - 0.55 + dy, 0.0, u + dx * 0.9, yf - 0.55 - dy, 0.78, 0.05, 0.05, 'wood')
    for k in range(5):
        box(S, u - 0.7 + k * 0.35, yf - 0.55, 0.83, 0.24, 0.3, 0.08, 'red' if k % 2 else 'flowerR', rot=12 * k)


def doorpost_titles(S, u, ow, yf, h=2.5):
    """【史】A bookseller's doorposts written all over with the titles on sale (Martial 1.117, the Argiletum)."""
    for sd in (-1, 1):
        x = u + sd * (ow / 2 + 0.1)
        box(S, x, yf - 0.005, 0.3, 0.26, 0.012, h - 0.4, 'linen')
        for k in range(9):
            box(S, x, yf - 0.012, 0.45 + k * 0.22, 0.16 - 0.05 * (k % 3), 0.01, 0.05, 'dark' if k % 4 else 'red')


def trade_books(S, u, ow, u0, u1, D, yf):
    """【史】A bookseller (librarius): pigeonholes of scrolls on the back wall, scrolls in a bucket (capsa), a reading desk."""
    rows, cols = 5, int((u1 - u0 - 0.5) / 0.32)
    x0 = u0 + 0.25 + 0.16
    box(S, (u0 + u1) / 2, D - 0.2, 0.3, u1 - u0 - 0.4, 0.36, 0.04, 'wood')
    for r in range(rows):
        z = 0.34 + r * 0.38
        box(S, (u0 + u1) / 2, D - 0.2, z + 0.34, u1 - u0 - 0.4, 0.36, 0.03, 'wood')
        for c in range(cols):
            for j in range(2):
                cyl(S, x0 + c * 0.32 + (j - 0.5) * 0.11, D - 0.22, z + 0.02 + 0.08 * j, 0.045, 0.3, 'linen', 6)
    for c in range(cols + 1):
        box(S, u0 + 0.25 + c * 0.32, D - 0.2, 0.3, 0.03, 0.36, rows * 0.38 + 0.04, 'wood')
    cyl(S, u - 0.5, 0.9, 0.0, 0.22, 0.5, 'wood', 10)
    for k in range(5):
        cyl(S, u - 0.5 + 0.08 * math.cos(k * 1.3), 0.9 + 0.08 * math.sin(k * 1.3), 0.3, 0.04, 0.42, 'linen', 6)
    box(S, u + 0.5, 1.2, 0.0, 0.7, 0.45, 0.95, 'wood')
    box(S, u + 0.5, 1.2, 0.95, 0.4, 0.3, 0.03, 'linen')


def trade_school(S, u, ow, u0, u1, D, yf):
    """【史】A school in a pergula open to the street (Suetonius: "in pergula docuit"): the master's chair on a low dais, rows
    of benches, wax tablets, a scroll on a stand."""
    box(S, u, D - 0.75, 0.0, 1.6, 1.1, 0.25, 'wood')
    box(S, u, D - 0.75, 0.25, 0.55, 0.5, 0.45, 'wood')
    box(S, u, D - 0.48, 0.25, 0.55, 0.06, 1.1, 'wood')
    for r in range(2):
        for side in (-1, 1):
            x = u + side * (ow / 4 + 0.15)
            y = 0.9 + r * 0.85
            box(S, x, y, 0.0, ow / 2 - 0.6, 0.3, 0.42, 'wood')
            for k in range(3):
                box(S, x - ow / 4 + 0.6 + k * 0.45, y, 0.42, 0.2, 0.14, 0.03, 'dark')
    box(S, u0 + 0.4, D - 0.25, 1.0, 0.5, 0.04, 0.7, 'linen')


def trade_wine(S, u, ow, u0, u1, D, yf):
    """【史】A wine shop (taberna vinaria) without a loft: dolia sunk to their necks in the floor, amphorae in racks on two
    tiers along the walls, a counter with jugs."""
    for k in range(6):
        x = u0 + 0.8 + (k % 3) * ((u1 - u0 - 1.6) / 2)
        y = D * 0.42 + (k // 3) * 1.0
        cyl(S, x, y, 0.0, 0.32, 0.06, 'tile', 10, r_top=0.26)
        cyl(S, x, y, 0.06, 0.2, 0.005, 'dark', 10)
        cyl(S, x, y, 0.065, 0.24, 0.03, 'wood', 10)
    for z in (0.0, 1.25):
        box(S, (u0 + u1) / 2, D - 0.3, z + 1.05, u1 - u0 - 0.4, 0.08, 0.06, 'wood')
        for k in range(int((u1 - u0 - 0.8) / 0.4)):
            amphora(S, u0 + 0.6 + k * 0.4, D - 0.45, z, 0.95, (0.0, 0.15), 'tile' if k % 2 else 'tile2', 5)
    box(S, u - ow / 2 + 0.5, 0.6, 0.0, 0.9, 0.5, 0.95, 'stone')
    box(S, u - ow / 2 + 0.5, 0.6, 0.95, 0.96, 0.56, 0.06, 'marble')
    for k in range(3):
        jar(S, u - ow / 2 + 0.25 + k * 0.25, 0.6, 1.01, 0.3, 0.1, 'tile2', 6, 'jug')


def trade_hatchfood(S, u, ow, u0, u1, D, yf):
    """A hot-food seller behind a hatch: a hearth with a pot on the back wall, jars and bowls on a shelf."""
    box(S, (u0 + u1) / 2, D - 0.45, 0.0, 1.4, 0.8, 0.85, 'brick')
    box(S, (u0 + u1) / 2, D - 0.45, 0.85, 0.7, 0.5, 0.04, 'flame')
    cyl(S, (u0 + u1) / 2, D - 0.45, 0.89, 0.22, 0.28, 'bronze', 10, r_top=0.25)
    box(S, (u0 + u1) / 2, D - 0.15, 1.55, u1 - u0 - 0.3, 0.3, 0.04, 'wood')
    for k in range(int((u1 - u0 - 0.6) / 0.28)):
        jar(S, u0 + 0.4 + k * 0.28, D - 0.15, 1.59, 0.26, 0.09, 'tile', 6, 'jug' if k % 2 else 'jar')


def ad_cucumas(S, u, z, yf, cols=('red', 'blue', 'ochre', 'grey')):
    """【史】A painted price list of wines: four coloured jugs, each with its price under it, under the shop's name
    (Herculaneum VI.14, "Ad Cucumas")."""
    box(S, u, yf - 0.005, z, 1.0, 0.01, 0.95, 'linen')
    box(S, u, yf - 0.01, z + 0.78, 0.8, 0.01, 0.08, 'red')
    for k, m in enumerate(cols):
        x = u - 0.36 + k * 0.24
        box(S, x, yf - 0.012, z + 0.3, 0.13, 0.01, 0.2, m)
        box(S, x, yf - 0.012, z + 0.5, 0.05, 0.01, 0.1, m)
        box(S, x + 0.06, yf - 0.012, z + 0.42, 0.04, 0.01, 0.08, m)
        box(S, x, yf - 0.012, z + 0.12, 0.12, 0.01, 0.06, 'dark')
    box(S, u, yf - 0.01, z, 1.0, 0.012, 0.04, 'red')


def awning(S, u0, u1, z, out=1.0, drop=0.35, mat='awning'):
    """A cloth awning over a shop front: sloping from the wall at z, out `out` m, on two poles."""
    lean_roof(S, u0, -0.38, u1, -0.38, z, out, drop, mat=mat, tiles=False)
    for x in (u0 + 0.08, u1 - 0.08):
        box(S, x, -0.38 - out + 0.05, 0.0, 0.06, 0.06, z - drop, 'wood')
    box(S, (u0 + u1) / 2, -0.38 - out + 0.05, z - drop - 0.06, u1 - u0, 0.05, 0.06, 'wood')


def well_head(S, x, y):
    """【史】A cistern mouth (puteal): a stone drum with a rope groove and a bucket."""
    cyl(S, x, y, 0.0, 0.42, 0.75, 'stone', 12)
    cyl(S, x, y, 0.74, 0.3, 0.005, 'dark', 12)
    cyl(S, x + 0.6, y, 0.0, 0.16, 0.25, 'wood', 8, r_top=0.19)


TRADES = {'bread': trade_bread, 'fish': trade_fish, 'oil': trade_oil, 'pottery': trade_pottery, 'bar': trade_bar,
          'cloth': trade_cloth, 'mill': trade_mill, 'fuller': trade_fuller, 'smith': trade_smith, 'green': trade_green,
          'barber': trade_barber, 'butcher': trade_butcher, 'books': trade_books, 'school': trade_school,
          'wine': trade_wine, 'hatchfood': trade_hatchfood}


def shop_side(F, p0, p1, h, mat, items, D=3.2, depth=0.35, frame='travertine', ceil=CEIL):
    """A ground-floor side as ONE facade skin without back panels; behind each shop door a room D deep.
    items: dicts with kind 'shop' (u, w, trade, boards='stack'|'closed', stair=True, sides=(l, r), rw), 'door' (a stair
    door to the upper flats: u, w), 'win' (u, zb, w, h) or 'gap' (nothing, wall). Returns the frame S and its length.
    Build the ground core inset by D on this side, or the rooms are filled."""
    S, L = _seg_frame(F, p0[0], p0[1], p1[0], p1[1], 0)
    yf = -depth - 0.01
    ops = []
    for it in items:
        k = it['kind']; u = it['u']
        if k == 'shop':
            ow = it.get('w', 2.6); pw = min(ow * 0.36, 1.0)
            ops.append((u, 0.0, ow, OH, 'rect'))
            if it.get('loft', True):
                ops.append((u, OH + 0.38, pw, 0.55, 'rect'))
        elif k == 'archshop':
            ow = it.get('w', 2.4); ops.append((u, 0.0, ow, OH + 0.1 + ow / 2, 'arch'))
        elif k == 'hatch':
            ops.append((u, it.get('zb', 0.9), it.get('w', 1.3), it.get('h', 1.2), 'rect'))
        elif k == 'passage':
            ops.append((u, 0.0, it.get('w', 1.6), it.get('h', 2.8), 'rect'))
        elif k == 'door':
            ops.append((u, 0.0, it.get('w', 1.1), 2.4, 'rect'))
        elif k == 'open':
            ow = it.get('w', 1.8); ops.append((u, 0.0, ow, OH, 'rect'))
        elif k == 'win':
            ops.append((u, it['zb'], it['w'], it['h'], 'rect'))
        elif k == 'gate':
            ops.append((u, 0.0, it.get('w', 2.8), it.get('h', 3.5), 'arch'))
    opening_skin(S, 0, 0, L, 0, 0.0, h, ops, mat, depth=depth, inner=None)
    for it in items:
        k = it['kind']; u = it['u']
        if k == 'shop':
            ow = it.get('w', 2.6); pw = min(ow * 0.36, 1.0); rw = it.get('rw', ow + 0.8)
            u0, u1 = u - rw / 2, u + rw / 2
            loft = it.get('loft', True)
            room(S, u0, u1, D, it.get('ceil', ceil), sides=it.get('sides', (True, True)), joists=loft)
            if loft:
                dark_panel(S, u, OH + 0.38, pw, 0.55)
            trim(S, u, ow, OH, yf, pw if loft else 0.0, frame=frame)
            threshold(S, u, ow, yf)
            if it.get('stair', True):
                loft_stair(S, u1 - 0.5 if it.get('stair_side', 1) > 0 else u0 + 0.5, D, ceil)
            boards(S, u, ow, OH, yf, it.get('boards', 'stack'))
            if it.get('trade') and it.get('boards') != 'closed':
                TRADES[it['trade']](S, u, ow, u0, u1, D, yf)
        elif k == 'door':
            w = it.get('w', 1.1)
            room(S, u - w / 2 - 0.15, u + w / 2 + 0.15, D, 2.4, joists=False)
            for s in range(6):                                    # a straight stair up to the flats
                box(S, u, 0.9 + 0.28 * s + 0.14, 0.0, w + 0.2, 0.28, 0.24 * (s + 1), 'stone')
            box(S, u, yf + 0.03, 2.4, w + 0.4, 0.16, 0.24, 'travertine')
            box(S, u, yf + 0.2, -0.02, w + 0.1, 0.5, 0.06, 'travertine')
        elif k == 'open':                                         # a second door into a room built from another side
            ow = it.get('w', 1.8)
            if frame:
                for sd in (-1, 1):
                    box(S, u + sd * (ow / 2 + 0.1), yf + 0.03, 0.0, 0.24, 0.16, OH, frame)
            box(S, u, yf + 0.03, OH, ow + 0.44, 0.16, 0.3, frame or 'wood')
            threshold(S, u, ow, yf)
        elif k == 'win':
            dark_panel(S, u, it['zb'], it['w'], it['h'])
        elif k == 'archshop':                                     # 【史】an arched shop door, a timber grille in the lunette lights the loft
            ow = it.get('w', 2.4); rw = it.get('rw', ow + 0.6); zs = OH + 0.1
            u0, u1 = u - rw / 2, u + rw / 2
            room(S, u0, u1, D, ceil, sides=it.get('sides', (True, True)))
            dark_panel(S, u, OH, ow, zs + ow / 2 - OH, y=0.2)
            box(S, u, yf + 0.22, OH, ow, 0.16, 0.12, 'wood')                                      # the timber lintel
            r = ow / 2
            for k2 in range(1, 8):
                x = -r + k2 * ow / 8; top = zs + math.sqrt(max(0.0, r * r - x * x))
                box(S, u + x, yf + 0.25, OH + 0.12, 0.04, 0.05, top - OH - 0.12, 'wood')
            box(S, u, yf + 0.25, zs + r * 0.45, ow, 0.05, 0.04, 'wood')
            arch(S, u, zs, ow + 0.04, r + 0.02, yf, t=0.34, proj=0.06, mat=frame or 'travertine', seg=8)
            for sd in (-1, 1):
                box(S, u + sd * (ow / 2 + 0.12), yf + 0.02, zs - 0.18, 0.3, 0.14, 0.18, frame or 'travertine')   # imposts
            box(S, u, yf - 0.02, zs + r + 0.02, 0.22, 0.12, 0.36, frame or 'travertine')                       # keystone
            threshold(S, u, ow, yf)
            if it.get('stair', True):
                loft_stair(S, u1 - 0.5 if it.get('stair_side', 1) > 0 else u0 + 0.5, D, ceil)
            boards(S, u, ow, OH, yf, it.get('boards', 'stack'))
            if it.get('trade') and it.get('boards') != 'closed':
                TRADES[it['trade']](S, u, ow, u0, u1, D, yf)
        elif k == 'hatch':                                        # a sales hatch over a masonry counter in the street
            hw_, zb, hh = it.get('w', 1.3), it.get('zb', 0.9), it.get('h', 1.2); rw = it.get('rw', 2.4)
            u0, u1 = u - rw / 2, u + rw / 2
            room(S, u0, u1, D, CEIL, joists=False)
            box(S, u, yf - 0.22, 0.0, hw_ + 0.4, 0.5, zb - 0.06, 'stone')
            box(S, u, yf - 0.2, zb - 0.06, hw_ + 0.5, 0.62, 0.07, 'marble')
            box(S, u, yf + 0.03, zb + hh, hw_ + 0.4, 0.16, 0.24, frame or 'wood')
            for k2 in range(3):
                jar(S, u - 0.35 + k2 * 0.35, yf - 0.2, zb + 0.01, 0.24, 0.1, 'tile2', 6, 'jug' if k2 % 2 else 'jar')
            if it.get('trade'):
                TRADES[it['trade']](S, u, hw_, u0, u1, D, yf)
        elif k == 'passage':                                      # a passage through the block to an inner court
            pw_, ph, Dp = it.get('w', 1.6), it.get('h', 2.8), it.get('D', 4.6)
            room(S, u - pw_ / 2 - 0.1, u + pw_ / 2 + 0.1, Dp, ph, wall='plaster', floor='paving', ceil='wood', joists=False, back=False)
            box(S, u, yf + 0.2, -0.02, pw_ + 0.1, 0.5, 0.06, 'travertine')
            box(S, u, yf + 0.03, ph, pw_ + 0.4, 0.16, 0.26, frame or 'travertine')
            box(S, u, yf + 0.03, ph + 0.26, pw_ + 0.6, 0.2, 0.08, frame or 'travertine')
        elif k == 'gate':                                         # 【史】a cart entrance into an inn's yard (stabulum)
            gw, gh, Dg = it.get('w', 2.8), it.get('h', 3.5), it.get('D', 7.0)
            room(S, u - gw / 2 - 0.1, u + gw / 2 + 0.1, Dg, gh, floor='basalt', joists=False)
            box(S, u, yf + 0.2, -0.02, gw + 0.1, 0.5, 0.06, 'travertine')
            for sd in (-1, 1):
                box(S, u + sd * (gw / 2 - 0.05), 0.75, 0.0, 0.07, 1.4, gh - gw / 2 - 0.05, 'wood')   # the leaves, open
                box(S, u + sd * gw * 0.28, yf + 0.2, 0.035, 0.12, 0.5, 0.01, 'dark')                  # wheel ruts
            if it.get('cart', True):
                cart(S, u - 0.2, Dg * 0.5)
            basin(S, u + gw / 2 - 0.45, Dg - 0.4, 0.7, 0.6, 0.6)                                    # a trough
            box(S, u - gw / 2 + 0.45, Dg - 0.35, 1.0, 0.7, 0.6, 0.4, 'wood')                        # a manger with hay
            box(S, u - gw / 2 + 0.45, Dg - 0.35, 1.38, 0.6, 0.5, 0.12, 'awning')
    return S, L
