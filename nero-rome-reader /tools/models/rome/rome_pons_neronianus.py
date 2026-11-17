"""rome_pons_neronianus · the imperial bridge of AD 56 (brief section 5, bridges.md).

L = 172, width 10 (x along the deck, +Y upstream). z = 0 at the deck ends; river level z_w = -7.6, riverbed -13.1.
Seven round arches, clear span 15, springing z = -7, rise 7 (near semicircular), ring 1 m, 17 travertine voussoirs each.
Six piers 5.5 m thick at x = +-10.25, +-30.75, +-51.25 (the arches are centred on x = 0, +-20.5, +-41, +-61.5),
pointed cutwaters on +Y and rounded ones on -Y. Brick spandrels, piers, abutments and parapets; travertine rings,
string course, cornice at the springing line, coping, footways and end posts; basalt roadway.
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *

reset()

Z_W = -7.6                 # river level (reference only: no water is modelled)
Z_B = Z_W - 5.5            # riverbed -13.1
Z_FOOT = Z_B - 1.0         # footings -14.1
W2 = 5.0                   # half width of the deck
L2 = 86.0                  # end of the bridge (deck z = 0)
ABUT = 69.0                # abutments run from |x| = 69 to 86
SPAN2 = 7.5                # half clear span
ZS = -7.0                  # springing
RISE = 7.0                 # rise of the intrados
R = (SPAN2 ** 2 + RISE ** 2) / (2 * RISE)     # intrados radius (7.518)
ZC = ZS + RISE - R                             # arch centre height (-7.518)
RING = 1.0                 # ring thickness
N_VOU = 17                 # voussoirs per arch ring
GAP = 0.0025               # half joint angle (rad), joints about 3.7 cm
PIER_HALF = 2.75           # half pier thickness (5.5 m)
CUT_P = 1.8                # cutwater projection beyond the pier face
ARCH_CX = [20.5 * k for k in range(-3, 4)]
PIER_CX = [s * d for d in (10.25, 30.75, 51.25) for s in (1, -1)]


def deck(x):
    """Deck top: 1.5 + 0.3 (1 - (x/69)^2) over the arches, then a straight ramp down to 0 at |x| = 86."""
    ax = abs(x)
    if ax <= ABUT:
        return 1.5 + 0.3 * (1 - (x / ABUT) ** 2)
    return 1.5 * max(0.0, (L2 - ax) / (L2 - ABUT))


XS = sorted(set([-L2 + 2.0 * k for k in range(int(2 * L2 / 2) + 1)] + [-ABUT, ABUT]))


def _newell(P):
    nx = ny = nz = 0.0
    n = len(P)
    for i in range(n):
        ax, ay, az = P[i]; bx, by, bz = P[(i + 1) % n]
        nx += (ay - by) * (az + bz); ny += (az - bz) * (ax + bx); nz += (ax - bx) * (ay + by)
    return (nx, ny, nz)


def face(mat, P, n):
    """Polygon P with outward normal hint n; wound so that its Newell normal agrees with n."""
    if sum(a * b for a, b in zip(_newell(P), n)) < 0:
        P = list(reversed(P))
    add_poly(mat, P)


def xz_prism(mat, poly, y0, y1):
    """Simple polygon given as (x, z) extruded from y0 to y1 (any orientation)."""
    n = len(poly)
    area = sum(poly[i][0] * poly[(i + 1) % n][1] - poly[(i + 1) % n][0] * poly[i][1] for i in range(n))
    if area < 0:
        poly = list(reversed(poly)); n = len(poly)
    a = [(x, y0, z) for x, z in poly]; b = [(x, y1, z) for x, z in poly]
    face(mat, a, (0, -1, 0)); face(mat, b, (0, 1, 0))
    for i in range(n):
        j = (i + 1) % n
        dx = poly[j][0] - poly[i][0]; dz = poly[j][1] - poly[i][1]
        face(mat, [a[i], a[j], b[j], b[i]], (dz, 0, -dx))


def xy_prism(mat, poly, z0, z1):
    """Simple plan polygon (x, y) extruded from z0 to z1 with a flat top."""
    n = len(poly)
    area = sum(poly[i][0] * poly[(i + 1) % n][1] - poly[(i + 1) % n][0] * poly[i][1] for i in range(n))
    if area < 0:
        poly = list(reversed(poly))
    bot = [(x, y, z0) for x, y in poly]; top = [(x, y, z1) for x, y in poly]
    face(mat, bot, (0, 0, -1)); face(mat, top, (0, 0, 1))
    for i in range(n):
        j = (i + 1) % n
        dx = poly[j][0] - poly[i][0]; dy = poly[j][1] - poly[i][1]
        face(mat, [bot[i], bot[j], top[j], top[i]], (dy, -dx, 0))


def ribbon(mat, ztop, zbot, y0, y1):
    """Band along the bridge: top profile ztop(x), bottom profile zbot(x), from x = -86 to 86, between y0 and y1."""
    poly = [(x, ztop(x)) for x in XS] + [(x, zbot(x)) for x in reversed(XS)]
    xz_prism(mat, poly, y0, y1)


# ---------------------------------------------------------------- abutments (brick), 1:10 batter, down to z = -9
for s in (1, -1):
    prof = [(69.0, -9.0), (86.9, -9.0), (86.0, deck(86.0) - 0.3), (69.0, deck(69.0) - 0.3)]
    xz_prism('brick', [(s * x, z) for x, z in prof], -(W2 + 0.6), W2 + 0.6)

# ---------------------------------------------------------------- piers (brick): footing -14.1 up to the deck
for pc in PIER_CX:
    xz_prism('brick', [(pc - PIER_HALF, Z_FOOT), (pc + PIER_HALF, Z_FOOT),
                       (pc + PIER_HALF, deck(pc + PIER_HALF) - 0.3), (pc - PIER_HALF, deck(pc - PIER_HALF) - 0.3)],
             -W2, W2)

# ---------------------------------------------------------------- spandrel fill above each extrados (brick)
EXT_R = R + RING
for c in ARCH_CX:
    bottom = [(c + dx, ZC + math.sqrt(EXT_R ** 2 - dx * dx))
              for dx in [-SPAN2 + 2 * SPAN2 * k / 24 for k in range(25)]]
    top = [(c + SPAN2, deck(c + SPAN2) - 0.3), (c - SPAN2, deck(c - SPAN2) - 0.3)]
    xz_prism('brick', bottom + top, -W2, W2)

# ---------------------------------------------------------------- arch rings: travertine voussoirs
th0 = math.acos(SPAN2 / R)
dth = (math.pi - 2 * th0) / N_VOU
for c in ARCH_CX:
    for i in range(N_VOU):
        a = th0 + i * dth + GAP; b = th0 + (i + 1) * dth - GAP
        poly = [(c + R * math.cos(a), ZC + R * math.sin(a)), (c + R * math.cos(b), ZC + R * math.sin(b)),
                (c + EXT_R * math.cos(b), ZC + EXT_R * math.sin(b)), (c + EXT_R * math.cos(a), ZC + EXT_R * math.sin(a))]
        xz_prism('travertine', poly, -W2, W2)

# ---------------------------------------------------------------- cutwaters
for pc in PIER_CX:
    # upstream (+Y): pointed wedge, base on the pier face, top sloping down to the point
    A = (pc - PIER_HALF, W2, Z_B); B = (pc + PIER_HALF, W2, Z_B); T = (pc, W2 + CUT_P, Z_B)
    A2 = (pc - PIER_HALF, W2, -5.1); B2 = (pc + PIER_HALF, W2, -5.1); T2 = (pc, W2 + CUT_P, -6.5)
    face('brick', [A, T, B], (0, 0, -1))
    face('brick', [A2, B2, T2], (0, 0.6, 0.8))
    face('brick', [A, T, T2, A2], (-1.8, 2.75, 0))
    face('brick', [T, B, B2, T2], (1.8, 2.75, 0))
    # downstream (-Y): rounded (half-ellipse) with a sloping cap falling from the pier face
    NS = 8; ea, eb = PIER_HALF, CUT_P
    ring = []
    for i in range(NS + 1):
        ph = math.pi * i / NS
        ring.append((pc + ea * math.cos(ph), -W2 - eb * math.sin(ph), ph))
    Cb = (pc, -W2, Z_B); Ct = (pc, -W2, -5.1)
    for i in range(NS):
        p0, p1 = ring[i], ring[i + 1]
        b0 = (p0[0], p0[1], Z_B); b1 = (p1[0], p1[1], Z_B)
        t0 = (p0[0], p0[1], -5.1 - 1.4 * math.sin(p0[2])); t1 = (p1[0], p1[1], -5.1 - 1.4 * math.sin(p1[2]))
        pm = (p0[2] + p1[2]) / 2
        hint = (math.cos(pm) / ea, -math.sin(pm) / eb, 0)
        face('brick', [b0, b1, t1], hint)
        face('brick', [b0, t1, t0], hint)
        face('brick', [Cb, b1, b0], (0, 0, -1))
        face('brick', [Ct, t0, t1], (0, -0.6, 0.8))

# ---------------------------------------------------------------- springing cornice (travertine), both faces
CORNICE = [(-ABUT, -7.4), (ABUT, -7.4), (ABUT, -6.6), (-ABUT, -6.6)]
xz_prism('travertine', CORNICE, W2, W2 + 0.3)
xz_prism('travertine', CORNICE, -W2 - 0.3, -W2)

# ---------------------------------------------------------------- string course: 0.4 high, 0.25 proud, 0.6 under the deck
ribbon('travertine', lambda x: deck(x) - 0.6, lambda x: deck(x) - 1.0, W2, W2 + 0.25)
ribbon('travertine', lambda x: deck(x) - 0.6, lambda x: deck(x) - 1.0, -W2 - 0.25, -W2)

# ---------------------------------------------------------------- deck: basalt roadway, travertine footways
ribbon('basalt', lambda x: deck(x), lambda x: deck(x) - 0.3, -3.45, 3.45)
ribbon('travertine', lambda x: deck(x) + 0.2, lambda x: deck(x) - 0.3, 3.45, 4.55)
ribbon('travertine', lambda x: deck(x) + 0.2, lambda x: deck(x) - 0.3, -4.55, -3.45)

# ---------------------------------------------------------------- parapets (brick, 1.05 above the deck) and coping
ribbon('brick', lambda x: deck(x) + 1.05, lambda x: deck(x) - 0.4, 4.55, 5.0)
ribbon('brick', lambda x: deck(x) + 1.05, lambda x: deck(x) - 0.4, -5.0, -4.55)
ribbon('travertine', lambda x: deck(x) + 1.2, lambda x: deck(x) + 1.05, 4.5, 5.05)
ribbon('travertine', lambda x: deck(x) + 1.2, lambda x: deck(x) + 1.05, -5.05, -4.5)

# ---------------------------------------------------------------- end posts (travertine) with caps, 2.2 above the deck
for sx in (1, -1):
    for sy in (1, -1):
        px = sx * (L2 - 1.0); py = sy * 4.3
        z0 = deck(px) - 0.3
        box(None, px, py, z0, 1.4, 1.4, (deck(px) + 2.2) - z0, 'travertine')
        box(None, px, py, deck(px) + 2.2, 1.6, 1.6, 0.2, 'travertine')

finish('rome_pons_neronianus', front='-Y')

# Close-up elevation of the western arches (the fixed cameras frame the whole 174 m length).
import bpy, bl_kit as _bk
from mathutils import Vector
_sc = bpy.context.scene
_cam = bpy.data.objects.new('cam_arches', bpy.data.cameras.new('cam_arches'))
_sc.collection.objects.link(_cam); _sc.camera = _cam
_cam.data.type = 'ORTHO'; _cam.data.ortho_scale = 36.0; _cam.data.clip_end = 2000
_cam.location = Vector((-40.0, -120.0, -3.0)); _bk._look(_cam, Vector((-40.0, 0.0, -3.0)))
_sc.render.filepath = os.path.join(_bk.ROOT, 'renders', 'rome_pons_neronianus', 'arches_close.png')
bpy.ops.render.render(write_still=True)
