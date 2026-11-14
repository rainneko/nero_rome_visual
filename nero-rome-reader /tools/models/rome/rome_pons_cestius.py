"""rome_pons_cestius · the Pons Cestius, AD 56 (briefs/rome/bridges.md, section 2).

One large central arch (span 20, rise 5.2) and one small semicircular arch each side, under a ridged deck.
L = 74 m along X, width 8 m along Y, upstream +Y (pointed cutwaters), downstream -Y (rounded cutwaters).
z = 0 is the deck at both ends. The solid body is one XZ silhouette extruded across the width; arch rings are
travertine voussoirs set 3 cm proud of the void; roadway, footways, parapets and copings sit on the body.
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                 # noqa: F401,F403  reset, box, add_poly, add_mesh, preview_ground, finish, ...
from rk import preview_ground, finish, reset
from mathutils import Vector

# ---------------------------------------------------------------- dimensions (brief section 2 and common rules)
HX = 37.0                        # deck from x = -37 to +37 (L = 74)
HW = 4.0                         # deck half width (width 8)
HA = HW + 0.6                    # abutments are the deck width plus 0.6 each side
ZW = -4.0                        # water level (reference only; no water is modelled)
ZB = ZW - 5.5                    # riverbed -9.5
ZF = ZB - 1.0                    # footings to -10.5
ZA = -9.0                        # abutments down to -9
BATTER = 0.9                     # 1:10 batter over 9 m

def deck(x):
    """Ridged deck profile: z = 3.6 (1 - (x/37)^2)."""
    return 3.6 * (1.0 - (x / HX) ** 2)

def top(x):
    """Top of the solid masonry: 0.3 m below the deck, hidden under the roadway slab."""
    return deck(x) - 0.3

# central arch: clear span 20, springing -3.4, rise 5.2, ring 1.0
SC, ZS_C, FC, TR_C = 20.0, -3.4, 5.2, 1.0
RC = (SC * SC / 4 + FC * FC) / (2 * FC)          # intrados radius (about 12.2)
ZC_C = (ZS_C + FC) - RC                          # intrados centre, below the axis
PHI_C = math.asin((SC / 2) / RC)                 # half angle of the arc, measured from the apex

# side arches: clear span 5 (semicircle), springing -3.0, ring 0.7; centres at x = +/-17.5
XS, RS, ZS_S, TR_S = 17.5, 2.5, -3.0, 0.7

# piers x = +/-10 .. +/-15 (cutwaters centred at x = +/-12.5); abutments from x = +/-20 outwards
PIER_IN, PIER_OUT, ABUT_IN = 10.0, 15.0, 20.0
ZW_CUT = ZW + 2.5                                # cutwater tops at -1.5

def intr_z(ax):
    """Intrados height of the central arch at |x| <= 10."""
    return ZC_C + math.sqrt(RC * RC - ax * ax)

def side_arc_z(ax):
    """Intrados height of a side arch at 15 < |x| < 20."""
    return ZS_S + math.sqrt(RS * RS - (ax - XS) ** 2)

def solid_at(x, z):
    """True where the masonry is solid (outside the two kinds of void open to the riverbed)."""
    ax = abs(x)
    if ax >= ABUT_IN:
        return z >= ZA
    if ax > PIER_OUT:
        return z >= side_arc_z(ax)
    if ax > PIER_IN:
        return z >= ZF
    return z >= intr_z(ax)

# ---------------------------------------------------------------- helpers (kit style: world coordinates)
def _newell(P):
    n = [0.0, 0.0, 0.0]
    for i in range(len(P)):
        a = P[i]; b = P[(i + 1) % len(P)]
        n[0] += (a[1] - b[1]) * (a[2] + b[2])
        n[1] += (a[2] - b[2]) * (a[0] + b[0])
        n[2] += (a[0] - b[0]) * (a[1] + b[1])
    return Vector(n)

def _face(mat, P, want):
    """Polygon P, wound so that its normal points along want."""
    P = [tuple(p) for p in P]
    if _newell(P).dot(want) < 0:
        P = P[::-1]
    add_poly(mat, P)

def _solid(mat, V, faces):
    """Convex solid from vertices V and face index lists; every face is wound outwards from the centroid."""
    c = sum((Vector(v) for v in V), Vector()) / len(V)
    out = []
    for f in faces:
        P = [V[i] for i in f]
        fc = sum((Vector(p) for p in P), Vector()) / len(P)
        if _newell(P).dot(fc - c) < 0:
            f = tuple(f)[::-1]
        out.append(tuple(f))
    add_mesh(mat, V, out)

def _box(mat, x0, x1, y0, y1, z0, z1):
    V = [(x, y, z) for z in (z0, z1) for y in (y0, y1) for x in (x0, x1)]
    _solid(mat, V, [(0, 1, 3, 2), (4, 6, 7, 5), (0, 1, 5, 4), (2, 3, 7, 6), (0, 2, 6, 4), (1, 3, 7, 5)])

def _extrude(mat, pts, y0, y1):
    """Simple polygon in the x-z plane (list of (x, z)) extruded from y0 to y1."""
    q = []
    for p in pts:                                 # drop repeated points
        if not q or abs(p[0] - q[-1][0]) + abs(p[1] - q[-1][1]) > 1e-6:
            q.append(p)
    if abs(q[0][0] - q[-1][0]) + abs(q[0][1] - q[-1][1]) < 1e-6:
        q.pop()
    area = sum(q[i][0] * q[(i + 1) % len(q)][1] - q[(i + 1) % len(q)][0] * q[i][1] for i in range(len(q)))
    if area < 0:
        q = q[::-1]                               # counter-clockwise in (x, z): outside is on the right of each edge
    n = len(q)
    _face(mat, [(x, y0, z) for x, z in q], Vector((0, -1, 0)))
    _face(mat, [(x, y1, z) for x, z in q], Vector((0, 1, 0)))
    for i in range(n):
        (xa, za), (xb, zb) = q[i], q[(i + 1) % n]
        _face(mat, [(xa, y0, za), (xb, y0, zb), (xb, y1, zb), (xa, y1, za)], Vector((zb - za, 0, -(xb - xa))))

def _arc(cx, cz, r, a0, a1, n):
    return [(cx + r * math.cos(a0 + (a1 - a0) * i / n), cz + r * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]

def _ring(mat, cx, cz, r1, r2, a0, a1, n, gap, y0, y1):
    """n travertine voussoirs along an arch ring from angle a0 to a1 (standard angle about (cx, cz)), gap in metres."""
    w = (a1 - a0) / n; g = gap / ((r1 + r2) / 2)
    for k in range(n):
        s0 = a0 + k * w + g / 2; s1 = a0 + (k + 1) * w - g / 2
        V = []
        for y in (y0, y1):
            for r, a in ((r1, s0), (r1, s1), (r2, s1), (r2, s0)):
                V.append((cx + r * math.cos(a), y, cz + r * math.sin(a)))
        _solid(mat, V, [(0, 1, 2, 3), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])

def _deck_band(off_lo, off_hi, xs=None):
    """Closed profile between deck(x) + off_lo (top side) and deck(x) + off_hi (bottom side), x from -37 to 37."""
    xs = xs or [-HX + 0.5 * i for i in range(int(2 * HX / 0.5) + 1)]
    return [(x, deck(x) + off_hi) for x in xs] + [(x, deck(x) + off_lo) for x in xs[::-1]]

# ---------------------------------------------------------------- build
reset()

MID_X = [-ABUT_IN + 0.5 * i for i in range(int(2 * ABUT_IN / 0.5) + 1)]     # -20 .. 20
ABU_X = [ABUT_IN + 0.5 * i for i in range(int((HX - ABUT_IN) / 0.5) + 1)]   # 20 .. 37

# 1. solid body between the abutments: piers, spandrels, arch springers (width 8)
mid = [(-ABUT_IN, -3.0)]
mid += [(x, top(x)) for x in MID_X]
mid += _arc(XS, ZS_S, RS, 0.0, math.pi, 12)                       # right side arch, from (20,-3) over the top
mid += [(PIER_OUT, ZF), (PIER_IN, ZF)]                           # right pier, down to the footing
mid += _arc(0.0, ZC_C, RC, math.pi / 2 - PHI_C, math.pi / 2 + PHI_C, 40)[1:-1]   # central intrados, 10 -> -10
mid += [(-PIER_IN, ZF), (-PIER_OUT, ZF), (-PIER_OUT, -3.0)]
mid += _arc(-XS, ZS_S, RS, 0.0, math.pi, 12)[1:-1]              # left side arch, from (-15,-3) to (-20,-3)
_extrude('tuff', mid, -HW, HW)

# abutments: wider (deck + 0.6 each side), battered outer ends down to -9
for sgn in (1, -1):
    ab = [(ABUT_IN, ZA)] + [(x, top(x)) for x in ABU_X] + [(HX + BATTER, ZA)]
    ab = [(sgn * x, z) for x, z in ab]
    _extrude('tuff', ab, -HA, HA)

# 2. arch rings: 19 voussoirs under the central arch, 15 under each side arch (3 cm proud of the void)
PROUD = 0.02
_ring('travertine', 0.0, ZC_C, RC - 0.03, RC + TR_C, math.pi / 2 - PHI_C, math.pi / 2 + PHI_C, 19, 0.04, -HW - PROUD, HW + PROUD)
for sgn in (1, -1):
    _ring('travertine', sgn * XS, ZS_S, RS - 0.03, RS + TR_S, 0.0, math.pi, 15, 0.04, -HW - PROUD, HW + PROUD)

# 3. cutwaters: upstream (+Y) pointed triangles with a sloped half-pyramid cap; downstream (-Y) half-round with a cone cap
for sgn in (1, -1):
    xc = sgn * 12.5
    # upstream: triangle A(10,4) B(15,4) C(12.5,6) from the footing to -1.5, cap apex on the pier face
    A = (xc - 2.5, HW, ZF); B = (xc + 2.5, HW, ZF); C = (xc, HW + 2.0, ZF)
    A2 = (A[0], HW, ZW_CUT); B2 = (B[0], HW, ZW_CUT); C2 = (C[0], HW + 2.0, ZW_CUT)
    _solid('tuff', [A, B, C, A2, B2, C2], [(0, 1, 2), (3, 4, 5), (0, 1, 4, 3), (1, 2, 5, 4), (2, 0, 3, 5)])
    P = (xc, HW, ZW_CUT + 1.2)
    _solid('tuff', [A2, B2, C2, P], [(0, 1, 2), (0, 1, 3), (1, 2, 3), (2, 0, 3)])
    # downstream: half-round on the -Y side, radius 2.5, centred on the pier face at y = -4
    N = 12
    half = [(xc + 2.5 * math.cos(-math.pi * i / N), -HW + 2.5 * math.sin(-math.pi * i / N)) for i in range(N + 1)]
    bot = [(x, y, ZF) for x, y in half]; top_r = [(x, y, ZW_CUT) for x, y in half]
    V = bot + top_r; m = len(half)
    faces = [tuple(range(m)), tuple(range(m, 2 * m))] + [(i, (i + 1) % m, m + (i + 1) % m, m + i) for i in range(m)]
    _solid('tuff', V, faces)
    apex = (xc, -HW, ZW_CUT + 1.2)
    V = top_r + [apex]
    faces = [tuple(range(m))] + [(i, i + 1, m) for i in range(m - 1)]
    _solid('tuff', V, faces)

# 4. roadway (basalt), footways (travertine), parapets, copings and the string course
_extrude('basalt', _deck_band(-0.3, 0.0), -2.45, 2.45)
for sgn in (1, -1):
    _extrude('travertine', _deck_band(-0.3, 0.2), sgn * 2.45, sgn * 3.55) if sgn > 0 else \
        _extrude('travertine', _deck_band(-0.3, 0.2), -3.55, -2.45)
    if sgn > 0:
        _extrude('tuff', _deck_band(-0.3, 1.05), 3.55, 4.0)
        _extrude('marble', _deck_band(1.05, 1.2), 3.5, 4.05)
    else:
        _extrude('tuff', _deck_band(-0.3, 1.05), -4.0, -3.55)
        _extrude('marble', _deck_band(1.05, 1.2), -4.05, -3.5)
    # string course: 0.4 high, 0.6 below the deck line, projecting 0.25 from the faces
    s_mid = [(x, deck(x) - 0.2) for x in MID_X] + [(x, deck(x) - 0.6) for x in MID_X[::-1]]
    s_abu = [(x, deck(x) - 0.2) for x in ABU_X[:-1]] + [(x, deck(x) - 0.6) for x in ABU_X[:-1][::-1]]
    if sgn > 0:
        _extrude('travertine', s_mid, HW, HW + 0.25)
        _extrude('travertine', s_abu, HA, HA + 0.25)
    else:
        _extrude('travertine', s_mid, -HW - 0.25, -HW)
        _extrude('travertine', s_abu, -HA - 0.25, -HA)

# 5. square bridgehead posts at the four corners, 2.2 m above the deck, with travertine caps
for sx in (-35.9, 35.9):
    for sy in (-3.25, 3.25):
        ptop = deck(abs(sx)) + 2.2
        _box('travertine', sx - 0.7, sx + 0.7, sy - 0.7, sy + 0.7, -1.0, ptop)
        _box('travertine', sx - 0.8, sx + 0.8, sy - 0.8, sy + 0.8, ptop, ptop + 0.2)

# 6. peperino bands ("one dark course every 1.8 m") on the spandrel faces; each run of solid masonry gets a band
def _band_runs(zb):
    runs = []; cur = None
    x = -36.8
    while x <= 36.8 + 1e-9:
        ok = solid_at(x, zb) and solid_at(x, zb + 0.25) and zb + 0.25 <= deck(x) - 0.5
        if ok and cur is None:
            cur = [x, x]
        elif ok:
            cur[1] = x
        elif cur is not None:
            runs.append(cur); cur = None
        x += 0.05
    if cur is not None:
        runs.append(cur)
    return runs

for k in range(7):
    zb = -7.2 + 1.8 * k
    for xa, xb in _band_runs(zb):
        cuts = [xa] + [c for c in (-ABUT_IN, ABUT_IN) if xa < c < xb] + [xb]
        for p, q in zip(cuts[:-1], cuts[1:]):
            if q - p < 0.2:
                continue
            f = HW if abs((p + q) / 2) < ABUT_IN else HA
            for sgn in (1, -1):
                y0, y1 = (f - 0.02, f + 0.03) if sgn > 0 else (-f - 0.03, -f + 0.02)
                _box('peperino', p, q, y0, y1, zb, zb + 0.25)

# ---------------------------------------------------------------- ground and export
preview_ground(ZW)
finish('rome_pons_cestius', front='-Y')
