"""rome_pons_fabricius · Pons Fabricius, 62 BC: two arches of 22 m, a flood arch in the central pier, visible ridge.

Brief: briefs/rome/bridges.md, section 1. Axes: deck along X (-33 .. +33), width along Y (+-3 between the parapets),
upstream = +Y (cutwater pointed to +Y, rounded to -Y). z = 0 is the deck surface at the ends.
Run: /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_pons_fabricius.py"
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *            # reset, box, prism, add_poly, preview_ground, finish, PAL (kit + Rome palette)

# ---------------------------------------------------------------- levels and deck
Z_W = -5.0                  # river level (reference only; no water modelled)
Z_B = Z_W - 5.5             # riverbed -10.5
Z_FOOT = Z_B - 1.0          # footings bottom -11.5
HALF_W = 3.0                # deck half width, outer faces of the parapets


def D(x):
    """Deck profile: the ridge. z(x) = 3.4 (1 - (x/33)^2)."""
    return 3.4 * (1.0 - (x / 33.0) ** 2)


# ---------------------------------------------------------------- arches (segmental, intrados circle)
SPAN, RISE, Z_S, T_R = 22.0, 5.6, -4.4, 1.0
XC = (-14.0, 14.0)
RI = (SPAN * SPAN / 4.0 + RISE * RISE) / (2.0 * RISE)      # intrados radius 13.61
RO = RI + T_R                                                # extrados radius
ZC = Z_S + RISE - RI                                         # centre height -12.41
TH0 = math.atan2(Z_S - ZC, SPAN / 2.0)                       # springing angle from +X (about 36 deg)
NV = 19                                                      # voussoirs per arch
GAP = 0.035                                                  # joint gap, metres


# ---------------------------------------------------------------- helpers (orientation-safe solids)
def _newell(pts):
    nx = ny = nz = 0.0
    n = len(pts)
    for i in range(n):
        x1, y1, z1 = pts[i]
        x2, y2, z2 = pts[(i + 1) % n]
        nx += (y1 - y2) * (z1 + z2)
        ny += (z1 - z2) * (x1 + x2)
        nz += (x1 - x2) * (y1 + y2)
    return nx, ny, nz


def face_dir(mat, pts, d):
    """Add a planar polygon, flipped so that its normal points along d."""
    nx, ny, nz = _newell(pts)
    if nx * d[0] + ny * d[1] + nz * d[2] < 0:
        pts = list(reversed(pts))
    add_poly(mat, [tuple(p) for p in pts])


def face_away(mat, pts, c):
    """Add a planar polygon, flipped so that its normal points away from the point c (inside a convex solid)."""
    nx, ny, nz = _newell(pts)
    mx = sum(p[0] for p in pts) / len(pts) - c[0]
    my = sum(p[1] for p in pts) / len(pts) - c[1]
    mz = sum(p[2] for p in pts) / len(pts) - c[2]
    if nx * mx + ny * my + nz * mz < 0:
        pts = list(reversed(pts))
    add_poly(mat, [tuple(p) for p in pts])


def xz_prism(mat, poly, y0, y1):
    """Extrude a simple polygon given as (x, z) points along Y from y0 to y1 (any winding)."""
    n = len(poly)
    area = sum(poly[i][0] * poly[(i + 1) % n][1] - poly[(i + 1) % n][0] * poly[i][1] for i in range(n)) / 2.0
    face_dir(mat, [(x, y0, z) for x, z in poly], (0, -1, 0))
    face_dir(mat, [(x, y1, z) for x, z in poly], (0, 1, 0))
    for i in range(n):
        (xa, za), (xb, zb) = poly[i], poly[(i + 1) % n]
        dx, dz = xb - xa, zb - za
        if abs(dx) < 1e-9 and abs(dz) < 1e-9:
            continue
        ox, oz = (dz, -dx) if area > 0 else (-dz, dx)
        face_dir(mat, [(xa, y0, za), (xb, y0, zb), (xb, y1, zb), (xa, y1, za)], (ox, 0, oz))


_HEX = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]


def hexa(mat, P):
    """A convex hexahedron given by 8 points in box order (bottom 0-3, top 4-7)."""
    c = [sum(p[i] for p in P) / 8.0 for i in range(3)]
    for f in _HEX:
        face_away(mat, [P[i] for i in f], c)


def deck_pts(off_top, off_bot, xs=None):
    """Polyline strip along the deck profile: top at D(x)+off_top, bottom at D(x)+off_bot (xz points, closed)."""
    xs = xs or DECK_XS
    return [(x, D(x) + off_top) for x in xs] + [(x, D(x) + off_bot) for x in reversed(xs)]


DECK_XS = [-33.0 + 66.0 * i / 33 for i in range(34)]        # every 2 m, enough for D(x)


# ---------------------------------------------------------------- build
reset()
preview_ground(Z_W)

# 1. Footings and pier (central, x -3..3). Plinth peperino, body tuff.
xz_prism('peperino', [(-3.8, Z_FOOT), (3.8, Z_FOOT), (3.8, Z_B), (-3.8, Z_B)], -3.8, 3.8)
xz_prism('tuff', [(-3.0, Z_B), (3.0, Z_B), (3.0, -1.0), (-3.0, -1.0)], -HALF_W, HALF_W)

# 1b. Flood arch through the pier along Y: round-headed, 2.6 m wide, sill -1.0. Masonry above it up to the deck.
FR, FZ = 1.3, 0.3                                            # radius, springing height (sill + radius)
arc = [(FR * math.cos(math.pi * (1 - j / 12.0)), FZ + FR * math.sin(math.pi * (1 - j / 12.0))) for j in range(13)]
upper = [(-3.0, -1.0), (-FR, -1.0)] + arc + [(FR, -1.0), (3.0, -1.0), (3.0, D(3.0) - 0.3), (-3.0, D(-3.0) - 0.3)]
xz_prism('tuff', upper, -HALF_W, HALF_W)

# 1c. Cutwaters. Upstream (+Y): triangular in plan, sloped top meeting the pier face at z = -2.5.
A, B, C = (-3.0, 3.0, Z_FOOT), (3.0, 3.0, Z_FOOT), (0.0, 4.8, Z_FOOT)
A2, B2, C2 = (-3.0, 3.0, -2.5), (3.0, 3.0, -2.5), (0.0, 4.8, -3.5)
cen = [sum(p[i] for p in (A, B, C, A2, B2, C2)) / 6.0 for i in range(3)]
for tri in ([A, B, C], [A2, B2, C2], [B, C, C2, B2], [C, A, A2, C2]):
    face_away('tuff', tri, cen)
# Downstream (-Y): rounded, a half-disc of radius 3 centred at (0, -3), with a conical cap rising to z = -2.5.
semi = [(3.0 * math.cos(math.radians(180 + 180 * j / 8.0)), -3.0 + 3.0 * math.sin(math.radians(180 + 180 * j / 8.0)))
        for j in range(9)]
prism(None, semi, Z_FOOT, -3.0, 'tuff')
apex = (0.0, -3.0, -2.5)
rim = [(3.0 * math.cos(math.radians(180 + 180 * j / 8.0)), -3.0 + 3.0 * math.sin(math.radians(180 + 180 * j / 8.0)), -3.0)
       for j in range(9)]
for j in range(8):
    face_away('tuff', [apex, rim[j], rim[j + 1]], (0.0, -3.0, -3.2))

# 2. Two arches: voussoir rings (travertine, full width, 3.5 cm joints), spandrels (tuff) up to the deck.
for xc in XC:
    for i in range(NV):
        ga = GAP / 2.0 / RI
        a = TH0 + (math.pi - 2 * TH0) * i / NV + ga
        b = TH0 + (math.pi - 2 * TH0) * (i + 1) / NV - ga
        quad = [(xc + RI * math.cos(a), ZC + RI * math.sin(a)), (xc + RI * math.cos(b), ZC + RI * math.sin(b)),
                (xc + RO * math.cos(b), ZC + RO * math.sin(b)), (xc + RO * math.cos(a), ZC + RO * math.sin(a))]
        xz_prism('travertine', quad, -HALF_W, HALF_W)

    xl, xr = xc - RO * math.cos(TH0), xc + RO * math.cos(TH0)
    n_top = 14
    top = [(x, D(x) - 0.3) for x in [xl + (xr - xl) * k / (n_top - 1) for k in range(n_top)]]   # under the roadway slab
    m = 24
    arc_ext = [(xc + RO * math.cos(TH0 + (math.pi - 2 * TH0) * j / m), ZC + RO * math.sin(TH0 + (math.pi - 2 * TH0) * j / m))
               for j in range(m + 1)]                                     # right springing -> over the top -> left
    xz_prism('tuff', top + arc_ext, -HALF_W, HALF_W)

# 3. Abutments (x 25..33 and -33..-25): battered 1:10 below deck level down to z = -9, solid masonry.
for xa, xb in ((25.0, 33.0), (-33.0, -25.0)):
    yn, yt = 4.5, 3.6                                              # half widths at z = -9 and at z = 0
    zt = -0.3                                                      # top of the battered part, under the roadway slab
    P = [(xa, -yn, -9.0), (xb, -yn, -9.0), (xb, yn, -9.0), (xa, yn, -9.0),
         (xa, -yt, zt), (xb, -yt, zt), (xb, yt, zt), (xa, yt, zt)]
    hexa('tuff', P)
    pts = [(xa, zt), (xb, zt)]
    for x in [xb + (xa - xb) * k / 12.0 for k in range(13)]:
        if D(x) > 1e-6:
            pts.append((x, D(x) - 0.3))
    xz_prism('tuff', pts, -yt, yt)

# 4. Deck: basalt roadway, raised travertine footways, stone parapets, travertine coping, string course.
xz_prism('basalt', deck_pts(0.0, -0.3), -1.45, 1.45)
for s in (-1, 1):
    y0, y1 = sorted((s * 1.45, s * 2.55))
    xz_prism('travertine', deck_pts(0.2, -0.3), y0, y1)                # footway, 0.2 high
    y0, y1 = sorted((s * 2.55, s * 3.0))
    xz_prism('stone', deck_pts(1.05, -0.3), y0, y1)                    # parapet 1.05 above deck, 0.45 thick
    y0, y1 = sorted((s * 2.50, s * 3.05))
    xz_prism('travertine', deck_pts(1.20, 1.05), y0, y1)               # coping 0.15 high, 0.05 proud
    y0, y1 = sorted((s * 3.0, s * 3.25))
    xz_prism('travertine', deck_pts(-0.2, -0.6), y0, y1)               # string course, 0.4 high, 0.25 proud

# 5. Bridgehead posts at the four corners (1.4 m square, 2.2 m above the deck), travertine caps.
for sx in (-1, 1):
    for sy in (-1, 1):
        cx, cy = sx * 32.3, sy * 2.3
        zt = D(32.3) + 2.2
        box(None, cx, cy, -0.2, 1.4, 1.4, zt + 0.2, 'travertine')
        box(None, cx, cy, zt, 1.6, 1.6, 0.2, 'travertine')

# 6. Inscription panels on both faces above each arch crown: 7 x 1.0 m, 0.08 m proud, middle at D(x) - 1.5.
for xc in XC:
    zc_p = D(xc) - 1.5
    for s in (-1, 1):
        box(None, xc, s * 3.04, zc_p - 0.5, 7.0, 0.08, 1.0, 'travertine')

finish('rome_pons_fabricius', front='-Y')
