"""rome_pons_sublicius: the wooden bridge of Ancus Marcius, no iron, on trestle bents (brief section 6)."""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
from mathutils import Vector

TAU = 2 * math.pi
reset()

ZW = -5.8                 # water level (reference only)
ZB = ZW - 5.5             # riverbed -11.3
ZPILE = ZB - 1.0          # pile feet -12.3
ZWEATH = ZW + 1.0         # weathered (dark) piles below this
HALF = 92.0               # half length including abutments
HW = 3.5                  # half deck width
BENT_X = [-84 + 8 * k for k in range(22)]
FENDER_X = [x for x in BENT_X if abs(x) <= 70]


def zd(x):
    """Deck surface profile: z = 0.6 (1 - (x/92)^2)."""
    return 0.6 * (1 - (x / HALF) ** 2)


def sloped(off):
    return lambda x: zd(x) + off


def slab(x0, x1, step, top_fn, thick, y0, y1, mat):
    """A strip along X from x0 to x1 (stations every `step`), top surface from top_fn(x) down by `thick`."""
    n = int(round((x1 - x0) / step))
    xs = [x0 + i * (x1 - x0) / n for i in range(n + 1)]
    zt = [top_fn(x) for x in xs]
    zb = [t - thick for t in zt]
    for i in range(n):
        a, b = xs[i], xs[i + 1]
        ta, tb, ba, bb = zt[i], zt[i + 1], zb[i], zb[i + 1]
        add_poly(mat, [(a, y0, ta), (b, y0, tb), (b, y1, tb), (a, y1, ta)])        # top
        add_poly(mat, [(a, y1, ba), (b, y1, bb), (b, y0, bb), (a, y0, ba)])        # bottom
        add_poly(mat, [(a, y0, ba), (b, y0, bb), (b, y0, tb), (a, y0, ta)])        # side -Y
        add_poly(mat, [(a, y1, ta), (b, y1, tb), (b, y1, bb), (a, y1, ba)])        # side +Y


def pile_seg(mat, p0, p1, r, seg=8, cap0=True, cap1=True):
    """Round pile (seg-sided prism) from p0 to p1; caps optional (omitted where two parts meet)."""
    d = p1 - p0
    ax = d.normalized()
    tmp = Vector((1, 0, 0)) if abs(ax.x) < 0.9 else Vector((0, 1, 0))
    u = ax.cross(tmp).normalized()
    v = ax.cross(u)
    A = [p0 + (u * math.cos(TAU * i / seg) + v * math.sin(TAU * i / seg)) * r for i in range(seg)]
    B = [p1 + (u * math.cos(TAU * i / seg) + v * math.sin(TAU * i / seg)) * r for i in range(seg)]
    for i in range(seg):
        j = (i + 1) % seg
        add_poly(mat, [A[i], A[j], B[j], B[i]])
    if cap1:
        add_poly(mat, B)
    if cap0:
        add_poly(mat, list(reversed(A)))


def pile(p0, p1, r=0.22):
    """Pile from the riverbed (p0, lower) to p1; dark (weathered) below ZWEATH, wood above."""
    if p1.z <= ZWEATH:
        pile_seg('dark', p0, p1, r)
    elif p0.z >= ZWEATH:
        pile_seg('wood', p0, p1, r)
    else:
        t = (ZWEATH - p0.z) / (p1.z - p0.z)
        pm = p0 + (p1 - p0) * t
        pile_seg('dark', p0, pm, r, cap1=False)
        pile_seg('wood', pm, p1, r, cap0=False)


def crib(sx):
    """Log cribwork abutment on the +X (sx=+1) or -X end: squared logs, alternate layers, filled with gravel."""
    x0, x1 = (84.0, 92.0) if sx > 0 else (-92.0, -84.0)
    xc = (x0 + x1) / 2
    for k in range(12):                     # z = -6 .. 0, 0.5 m logs
        z0 = -6.0 + 0.5 * k
        if k % 2 == 0:                      # logs along X, outside faces
            for yc in (-3.25, 3.25):
                box(None, xc, yc, z0, x1 - x0, 0.5, 0.5, 'wood')
        else:                               # logs along Y, end faces
            for xe in (x0 + 0.25, x1 - 0.25):
                box(None, xe, 0.0, z0, 0.5, 2 * HW, 0.5, 'wood')
    box(None, xc, 0.0, -6.0, (x1 - x0) - 0.5, 6.0, 6.0, 'gravel')


# ---------------------------------------------------------------- deck structure
# deck planks, width 7, z = profile
slab(-HALF, HALF, 4.0, zd, 0.12, -HW, HW, 'wood')
# wheel guards 0.25 high at each edge
for s in (-1, 1):
    y0, y1 = (3.25, 3.5) if s > 0 else (-3.5, -3.25)
    slab(-HALF, HALF, 4.0, sloped(0.25), 0.25, y0, y1, 'wood')
# four longitudinal stringers 0.4 wide x 0.5 high, under the planks
for yc in (-2.7, -0.9, 0.9, 2.7):
    slab(-HALF, HALF, 4.0, sloped(-0.12), 0.5, yc - 0.2, yc + 0.2, 'wood')
# railings: posts every 2 m, two rails
for s in (-1, 1):
    yc = 3.4 * s
    for x in range(-92, 93, 2):
        box(None, float(x), yc, zd(x), 0.14, 0.14, 1.1, 'wood')
    slab(-HALF, HALF, 4.0, sloped(0.55), 0.1, yc - 0.05, yc + 0.05, 'wood')
    slab(-HALF, HALF, 4.0, sloped(1.0), 0.1, yc - 0.05, yc + 0.05, 'wood')

# ---------------------------------------------------------------- trestle bents
for xk in BENT_X:
    zcb = zd(xk) - 1.12                       # cap bottom; stringer and planks sit on top
    box(None, xk, 0.0, zcb, 0.45, 6.6, 0.5, 'wood')          # cap beam
    for yp in (-2.7, -1.35, 0.0, 1.35, 2.7):                  # five piles
        pile(Vector((xk, yp, ZPILE)), Vector((xk, yp, zcb)))
    zlo, zhi = zcb - 4.5, zcb - 0.5
    for sd in (-1, 1):                                        # X brace on both faces
        xc = xk + sd * 0.25
        beam(None, xc, -2.7, zlo, xc, 2.7, zhi, 0.1, 0.3, 'wood')
        beam(None, xc, -2.7, zhi, xc, 2.7, zlo, 0.1, 0.3, 'wood')

# ---------------------------------------------------------------- fenders upstream (+Y)
for xk in FENDER_X:
    apex = Vector((xk, 5.0, -4.0))
    for dx in (-1.0, 0.0, 1.0):
        pile(Vector((xk + dx, 3.5, ZPILE)), apex)
    prism(None, [(xk - 1.0, 3.5), (xk + 1.0, 3.5), (xk, 5.0)], -4.0, -3.8, 'wood')

# ---------------------------------------------------------------- crib abutments
crib(+1)
crib(-1)

preview_ground(ZW)
finish('rome_pons_sublicius', front='-Y')
