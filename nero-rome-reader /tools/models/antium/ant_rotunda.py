"""ant_rotunda - round double colonnade with a garden inside (lower garden of the Antium villa). Front = -Y.

Levels: ground z = 0, stepped stylobate (4 steps all round) up to the platform at z = 1.2.
Outer ring: 28 places at R 24 m, inner ring: 24 places at R 19 m, Ionic columns 6 m high. Each ring leaves its four
axis places open (N, S, E, W entrances: 24 outer and 20 inner columns stand; the entablature spans each gap and a
short flight of steps leads in from outside).
Annular tiled roof between the rings (high at the inner ring, low at the outer). Inside: round pool R 8 m with a
bronze statue, a lawn with 8 flower beds and gravel paths; the covered walk between the rings is paved.
Belvedere: half ring R 27 -> 31 m on the -Y side at platform level,
with a marble balustrade and two statues.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_kit import *

reset()

D = math.radians
SEG = 12                     # column facets (kit default); lower to 8 if over budget
H_TOP = 1.2                  # platform (stylobate top) height
R_PLAT = 27.0                # platform radius
R_BASE = 28.5                # bottom of the 4-step stylobate
R_POOL = 8.0                 # basin radius; rim 0.5 m wide outside it
R_OUT, R_IN = 24.0, 19.0     # column rings
H_COL = 6.0
R_COL = H_COL / 18.0         # Ionic column radius
Z_ENT = H_TOP + H_COL        # entablature bottom
EH = H_COL * 0.2             # entablature height
DEP = R_COL * 2.6            # entablature depth
R_BEL_OUT = 31.0             # belvedere outer edge
FLIGHT_IN, FLIGHT_OUT = 26.5, (29.625, 28.75, 27.875)


def ring_columns(R, n):
    """(angle, x, y) of the columns on a ring of n places; the four axis places (entrances) are left out."""
    out = []
    for i in range(n):
        a = i * 360.0 / n
        if min(a % 90.0, 90.0 - a % 90.0) < 1e-6:
            continue
        out.append((a, R * math.cos(D(a)), R * math.sin(D(a))))
    return out


def ring_entablature(pts):
    """Entablature on every chord between neighbouring standing columns (the chord across a gap is the lintel)."""
    for k in range(len(pts)):
        _, x0, y0 = pts[k]
        _, x1, y1 = pts[(k + 1) % len(pts)]
        entablature(None, x0, y0, x1, y1, Z_ENT, EH, DEP, 'marble')


def rail(x0, y0, x1, y1, z0, h, mat='marble'):
    """Balustrade piece between two points: plinth, top rail, posts at the ends, round balusters."""
    L = math.hypot(x1 - x0, y1 - y0)
    W = Frame(x0, y0, z0, math.degrees(math.atan2(y1 - y0, x1 - x0)))
    box(W, L / 2, 0, 0, L, 0.34, 0.18, mat)
    box(W, L / 2, 0, h - 0.14, L + 0.1, 0.38, 0.14, mat)
    for u in (0.0, L):
        box(W, u, 0, 0, 0.34, 0.34, h, mat)
    nb = max(1, int(L / 0.55))
    for i in range(nb):
        cyl(W, (i + 0.5) * L / nb, 0, 0.18, 0.06, h - 0.32, mat, 6, r_top=0.045, caps=False)


def annulus(mat, r_in, r_out, z0, z1, seg=48):
    """Closed flat ring (a slab with its edges) between two radii, from z0 to z1."""
    P = lambda r, j, z: (r * math.cos(TAU * j / seg), r * math.sin(TAU * j / seg), z)
    for j in range(seg):
        k = (j + 1) % seg
        add_poly(mat, [P(r_out, j, z1), P(r_out, k, z1), P(r_in, k, z1), P(r_in, j, z1)])     # top
        add_poly(mat, [P(r_in, j, z0), P(r_in, k, z0), P(r_out, k, z0), P(r_out, j, z0)])     # bottom
        add_poly(mat, [P(r_out, j, z0), P(r_out, k, z0), P(r_out, k, z1), P(r_out, j, z1)])   # outer edge
        add_poly(mat, [P(r_in, j, z0), P(r_in, j, z1), P(r_in, k, z1), P(r_in, k, z0)])       # inner edge


# ---------------------------------------------------------------- stylobate, pool, garden
# closed profile of the stepped ring (r, z): bottom at -0.6 (foundation), four 0.3 m steps, platform top at 1.2
prof = [(R_POOL, -0.6), (R_BASE, -0.6), (R_BASE, 0.3), (28.0, 0.3), (28.0, 0.6), (27.5, 0.6), (27.5, 0.9),
        (R_PLAT, 0.9), (R_PLAT, H_TOP), (R_POOL, H_TOP), (R_POOL, -0.6)]
lathe(None, 0, 0, prof, 'marble', seg=48, smooth=False)
cyl(None, 0, 0, -0.6, R_POOL, H_TOP - 0.5 + 0.6, 'marble', seg=48, smooth=False)     # basin floor (closes the hole)

round_pool(None, 0, 0, H_TOP, R_POOL, 'water', 'marble', 0.5, seg=32)
statue(None, 0, 0, H_TOP - 0.5, h=2.2, mat='bronze', pedestal=1.5, ped_mat='marble')

# garden floors: gravel ring path round the pool (2 m wide), lawn inside the inner ring, paving on the covered walk
R_RING = R_POOL + 2.5                                         # outer edge of the gravel ring (10.5 m)
annulus('gravel', R_POOL + 0.5, R_RING, H_TOP, H_TOP + 0.08)
annulus('grass', R_RING, R_IN, H_TOP, H_TOP + 0.04)
annulus('paving', R_IN, R_OUT, H_TOP, H_TOP + 0.04)

# four gravel paths on the axes, from the entrances (platform edge) to the pool ring
for a in (0, 90, 180, 270):
    rc = (R_PLAT + R_RING) / 2
    box(None, rc * math.cos(D(a)), rc * math.sin(D(a)), H_TOP, R_PLAT - R_RING, 2.4, 0.08, 'gravel', rot=a)

# eight flower beds, two per lawn quarter: 6 m radial x 3 m, hedge border, mixed flower rows
FLOWERS = ('flowerR', 'flowerY', 'flowerW', 'flowerP')
for k in range(8):
    phi = 45.0 + 90.0 * (k // 2) + (-13.0 if k % 2 == 0 else 13.0)
    flower_bed(None, 14.0 * math.cos(D(phi)), 14.0 * math.sin(D(phi)), H_TOP + 0.04, 3.0, 6.0,
               flowers=FLOWERS, rot=phi - 90.0)

# ---------------------------------------------------------------- colonnades and roof
outer = ring_columns(R_OUT, 28)
inner = ring_columns(R_IN, 24)
for _, x, y in outer + inner:
    column(None, x, y, H_TOP, H_COL, R_COL, 'marble', 'ionic', 0, SEG)
ring_entablature(outer)
ring_entablature(inner)
ring_roof(None, 0, 0, Z_ENT, R_IN, R_OUT, EH, mat='tile', seg=40, tiles=True, rib_mat='tile2')

# ---------------------------------------------------------------- entrances (flights of steps)
# each flight: three solid blocks climbing from the ground (z = -0.6) up to the platform, 3 m wide
for a in (0, 90, 180, 270):
    for top, ro in zip((0.3, 0.6, 0.9), FLIGHT_OUT):
        L = ro - FLIGHT_IN
        rc = (FLIGHT_IN + ro) / 2
        box(None, rc * math.cos(D(a)), rc * math.sin(D(a)), -0.6, L, 3.0, top + 0.6, 'marble', rot=a)

# ---------------------------------------------------------------- belvedere on the -Y (cliff) side
for i in range(40):
    if i in (0, 19, 20, 39):           # notches at E/W (flights land here) and the gap for the south entrance
        continue
    a0 = D(180.0 + 4.5 * i)
    a1 = D(180.0 + 4.5 * (i + 1))
    pts = [(R_BEL_OUT * math.cos(a0), R_BEL_OUT * math.sin(a0)), (R_BEL_OUT * math.cos(a1), R_BEL_OUT * math.sin(a1)),
           (R_PLAT * math.cos(a1), R_PLAT * math.sin(a1)), (R_PLAT * math.cos(a0), R_PLAT * math.sin(a0))]
    prism(None, pts, -0.6, H_TOP, 'marble')

for a0, a1 in ((184.5, 265.5), (274.5, 355.5)):
    n = 8
    pts = [(30.6 * math.cos(D(a0 + (a1 - a0) * k / n)), 30.6 * math.sin(D(a0 + (a1 - a0) * k / n))) for k in range(n + 1)]
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        rail(x0, y0, x1, y1, H_TOP, 1.0)

for a in (225.0, 315.0):
    statue(None, 29.0 * math.cos(D(a)), 29.0 * math.sin(D(a)), H_TOP, h=2.0, mat='marble', pedestal=1.1, ped_mat='stone')

human(None, 34, -14)
finish('ant_rotunda', front='-Y')
