"""rome_pons_aemilius · the old stone bridge of AD 56 (briefs/rome/bridges.md, section 3).

Eight segmental arches (clear span 14, rise 4.6, ring 0.9, 19 travertine voussoirs each, full width), seven tuff piers
5 m wide with a round-headed flood opening through each, pointed cutwaters upstream (+Y) and rounded ones downstream
(-Y), tuff abutments with a 1:10 batter, a deck profile with straight end ramps, basalt roadway with raised travertine
footways, solid stone parapets with travertine copings, string courses and four bridgehead posts.
z = 0 at the deck ends, z_w = -4.5, riverbed z_b = -10, footings to -11.
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *            # noqa: F401,F403  reset, box, add_poly, finish, preview_ground ...
import bmesh
from mathutils import Vector

reset()

HW = 4.5                    # half width of the deck (width 9.0)
ZW = -4.5                   # water level, reference only
ZB = ZW - 5.5               # riverbed -10
ZF = ZB - 1.0               # footing bottom -11
ABUT_IN, ABUT_OUT = 73.5, 98.0
PIERS = [0.0, -19.0, 19.0, -38.0, 38.0, -57.0, 57.0]
ARCH_C = [-66.5 + 19.0 * k for k in range(8)]


# ---------------------------------------------------------------- helpers
def emit(mat, pts, want):
    """One planar polygon, oriented so its normal points along `want` (outward)."""
    pts = [tuple(p) for p in pts]
    n = len(pts); nx = ny = nz = 0.0
    for i in range(n):
        ax, ay, az = pts[i]; bx, by, bz = pts[(i + 1) % n]
        nx += (ay - by) * (az + bz); ny += (az - bz) * (ax + bx); nz += (ax - bx) * (ay + by)
    if nx * want[0] + ny * want[1] + nz * want[2] < 0:
        pts.reverse()
    add_poly(mat, pts)


def interp(ch, x):
    """z of a polyline chain [(x, z), ...] (x ascending) at x."""
    for (x0, z0), (x1, z1) in zip(ch, ch[1:]):
        if x0 - 1e-9 <= x <= x1 + 1e-9:
            t = 0.0 if x1 - x0 < 1e-12 else (x - x0) / (x1 - x0)
            return z0 + t * (z1 - z0)
    raise ValueError('x %.3f outside chain' % x)


def clip_chain(ch, xa, xb):
    """The chain restricted to [xa, xb] with exact end points."""
    return [(xa, interp(ch, xa))] + [(x, z) for x, z in ch if xa + 1e-6 < x < xb - 1e-6] + [(xb, interp(ch, xb))]


def off(ch, dz):
    return [(x, z + dz) for x, z in ch]


def band(mat, bot, top, ya, yb):
    """Solid between two x-ascending chains (bottom below top) over the y range [ya, yb]."""
    xs = sorted(set([x for x, _ in bot] + [x for x, _ in top]))
    B = [(x, interp(bot, x)) for x in xs]
    T = [(x, interp(top, x)) for x in xs]
    for i in range(len(xs) - 1):
        q = [B[i], B[i + 1], T[i + 1], T[i]]
        for y, w in ((ya, (0, -1, 0)), (yb, (0, 1, 0))):
            emit(mat, [(x, y, z) for x, z in q], w)
        p, r = B[i], B[i + 1]
        emit(mat, [(p[0], ya, p[1]), (r[0], ya, r[1]), (r[0], yb, r[1]), (p[0], yb, p[1])],
             (r[1] - p[1], 0, -(r[0] - p[0])))
        p, r = T[i], T[i + 1]
        emit(mat, [(p[0], ya, p[1]), (r[0], ya, r[1]), (r[0], yb, r[1]), (p[0], yb, p[1])],
             (-(r[1] - p[1]), 0, r[0] - p[0]))
    for p, q, w in ((B[0], T[0], (-1, 0, 0)), (B[-1], T[-1], (1, 0, 0))):
        emit(mat, [(p[0], ya, p[1]), (p[0], yb, p[1]), (q[0], yb, q[1]), (q[0], ya, q[1])], w)


def prism_xz(mat, poly, ya, yb):
    """A convex polygon in the XZ plane extruded over y in [ya, yb]."""
    n = len(poly)
    cx = sum(p[0] for p in poly) / n; cz = sum(p[1] for p in poly) / n
    for y, w in ((ya, (0, -1, 0)), (yb, (0, 1, 0))):
        emit(mat, [(x, y, z) for x, z in poly], w)
    for i in range(n):
        p = poly[i]; q = poly[(i + 1) % n]
        nx, nz = q[1] - p[1], -(q[0] - p[0])
        mx = (p[0] + q[0]) / 2 - cx; mz = (p[1] + q[1]) / 2 - cz
        if nx * mx + nz * mz < 0:
            nx, nz = -nx, -nz
        emit(mat, [(p[0], ya, p[1]), (q[0], ya, q[1]), (q[0], yb, q[1]), (p[0], yb, p[1])], (nx, 0, nz))


def hull(mat, pts):
    """Convex solid from a point cloud."""
    bm = bmesh.new()
    vs = [bm.verts.new(Vector(p)) for p in pts]
    bm.verts.ensure_lookup_table()
    bmesh.ops.convex_hull(bm, input=vs)
    c = sum((Vector(p) for p in pts), Vector((0, 0, 0))) / len(pts)
    for f in bm.faces:
        w = f.calc_center_median() - c
        emit(mat, [tuple(v.co) for v in f.verts], (w.x, w.y, w.z))
    bm.free()


def clip_x(poly, xl, keep_right):
    """Sutherland-Hodgman clip of a polygon by the half-plane x >= xl (keep_right) or x <= xl."""
    out = []; n = len(poly)
    for i in range(n):
        p = poly[i]; q = poly[(i + 1) % n]
        sp = (p[0] - xl) if keep_right else (xl - p[0])
        sq = (q[0] - xl) if keep_right else (xl - q[0])
        if sp >= 0:
            out.append(p)
        if (sp >= 0) != (sq >= 0):
            t = (xl - p[0]) / (q[0] - p[0])
            out.append((xl, p[1] + t * (q[1] - p[1])))
    return out


# ---------------------------------------------------------------- deck profile
def deck_z(x):
    a = abs(x)
    if a <= ABUT_IN:
        return 2.3 + 0.5 * (1 - (x / ABUT_IN) ** 2)
    return 2.3 * (ABUT_OUT - a) / (ABUT_OUT - ABUT_IN)


DX = sorted(set([-98.0, -73.5, 73.5, 98.0] + [-98.0 + 196.0 * i / 26 for i in range(27)]))
DECK = [(x, deck_z(x)) for x in DX]          # deck surface (roadway top)
DECK_F = off(DECK, -0.3)                      # top of the masonry fill, underside of the roadway

# ---------------------------------------------------------------- arches
SPAN, ZS, RISE, RING_T = 14.0, -3.8, 4.6, 0.9
R0 = ((SPAN / 2) ** 2 + RISE ** 2) / (2 * RISE)     # intrados radius 7.63
R1 = R0 + RING_T                                    # extrados radius
ZC = ZS + RISE - R0                                 # arc centre height
ANG_R = math.atan2(ZS - ZC, SPAN / 2)
ANG_L = math.atan2(ZS - ZC, -SPAN / 2)
NB, GAP = 19, 0.035                                 # voussoirs per arch, joint width


def pt(c, R, t):
    return (c + R * math.cos(t), ZC + R * math.sin(t))


for c in ARCH_C:
    d = (ANG_L - ANG_R) / NB; h = (GAP / R0) / 2
    ext = []
    for k in range(NB):
        a = ANG_R + k * d + h; b = ANG_R + (k + 1) * d - h
        poly = [pt(c, R0, a), pt(c, R0, b), pt(c, R1, b), pt(c, R1, a)]
        poly = clip_x(clip_x(poly, c - SPAN / 2, True), c + SPAN / 2, False)   # stay between the pier faces
        if len(poly) >= 3:
            prism_xz('travertine', poly, -HW, HW)
        ext += [pt(c, R1, a), pt(c, R1, b)]
    ext_chain = clip_chain(sorted(set(ext)), c - SPAN / 2, c + SPAN / 2)
    band('tuff', ext_chain, clip_chain(DECK_F, c - SPAN / 2, c + SPAN / 2), -HW, HW)   # spandrel fill

# ---------------------------------------------------------------- piers
for c in PIERS:
    box(None, c, 0.0, ZF, 7.0, 10.0, 1.0, 'peperino')                                   # footing
    band('peperino', [(c - 2.5, ZB), (c + 2.5, ZB)], [(c - 2.5, ZB + 1.5), (c + 2.5, ZB + 1.5)], -HW, HW)
    band('tuff', [(c - 2.5, ZB + 1.5), (c + 2.5, ZB + 1.5)], [(c - 2.5, -1.6), (c + 2.5, -1.6)], -HW, HW)
    # the flood opening: 1.6 wide, sill -1.6, round head (springing -0.8, crown 0.0), through the pier
    band('tuff', [(c - 2.5, -1.6), (c - 0.8, -1.6)], clip_chain(DECK_F, c - 2.5, c - 0.8), -HW, HW)
    band('tuff', [(c + 0.8, -1.6), (c + 2.5, -1.6)], clip_chain(DECK_F, c + 0.8, c + 2.5), -HW, HW)
    arc = [(c + 0.8 * math.cos(math.pi * (1 - i / 10)), -0.8 + 0.8 * math.sin(math.pi * (1 - i / 10)))
           for i in range(11)]
    band('tuff', arc, clip_chain(DECK_F, c - 0.8, c + 0.8), -HW, HW)
    # pointed cutwater upstream (+Y), from the riverbed to z_w + 2.5 at the face, sloping down to the nose
    hull('stone', [(c - 2.5, HW, ZB), (c + 2.5, HW, ZB), (c, HW + 2.5, ZB),
                   (c - 2.5, HW, -2.0), (c + 2.5, HW, -2.0), (c, HW + 2.5, -3.5)])
    # rounded cutwater downstream (-Y): half-round plan, sloping sloped top
    ring = []
    for i in range(9):
        ph = math.pi * i / 8
        x = c + 2.5 * math.cos(ph); y = -HW - 2.5 * math.sin(ph)
        ring += [(x, y, ZB), (x, y, -2.0 - 1.5 * math.sin(ph))]
    hull('stone', ring)

# ---------------------------------------------------------------- abutments (batter 1:10) and bridgehead posts
for s in (-1, 1):
    xi, xo = s * ABUT_IN, s * ABUT_OUT
    zi, zo = deck_z(xi) - 0.3, deck_z(xo) - 0.3
    hull('tuff', [(xi, -6.2, -9.0), (xi, 6.2, -9.0), (xo, -6.2, -9.0), (xo, 6.2, -9.0),
                  (xi, -5.1, zi), (xi, 5.1, zi), (xo, -5.1, zo), (xo, 5.1, zo)])
    for sy in (-1, 1):
        px, py = s * 96.9, sy * 3.6
        box(None, px, py, -0.3, 1.4, 1.4, 2.5, 'travertine')
        box(None, px, py, 2.2, 1.6, 1.6, 0.2, 'travertine')

# ---------------------------------------------------------------- deck: roadway, footways, parapets, copings, string courses
DECK_TOP = DECK
band('basalt', DECK_F, DECK_TOP, -2.95, 2.95)
for ya, yb in ((2.95, 4.05), (-4.05, -2.95)):
    band('travertine', DECK_F, off(DECK, 0.2), ya, yb)
for ya, yb in ((4.05, 4.5), (-4.5, -4.05)):
    band('stone', DECK_F, off(DECK, 1.05), ya, yb)
for ya, yb in ((4.05, 4.55), (-4.55, -4.05)):
    band('travertine', off(DECK, 1.05), off(DECK, 1.2), ya, yb)
for ya, yb in ((4.5, 4.75), (-4.75, -4.5)):
    band('travertine', off(DECK, -1.0), off(DECK, -0.6), ya, yb)

preview_ground(ZW)
finish('rome_pons_aemilius', front='-Y')
