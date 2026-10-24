"""ant_portico - straight garden portico along a garden wall (lower garden of the Antium villa). Front = -Y.

48 m (x) x 6.5 m (y). Paving floor raised 0.5 m with two steps along the front. Seventeen Tuscan columns, 5 m, on
the front line with an entablature; a lean-to tiled roof sloping down to the front; closed end walls. Solid back
wall (7 m above the paving, plaster with a red dado) with seven round-arched niches, a statue in each; stone benches
along the back wall inside.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_kit import *

reset()

X0, X1 = -24.0, 24.0
Y_CORE = 2.65                 # interior face of the back wall (core)
Y_BACK = 3.25                 # outer face of the back wall
Y_FRONT = -3.25               # front eave line (6.5 m deep)
Y_STEP = -3.7                 # edge of the paving at the upper step
Y_STEP2 = -4.15               # outer edge of the lower step
FLOOR = 0.5                   # paving level
H_WALL = 7.0                  # back wall height above the paving (raised 1 m for the roof)
Z_TOP = FLOOR + H_WALL        # 7.5, top of the wall = high edge of the roof
Y_COL = -2.4                  # column line
N_COL = 17
H_COL = 5.0
EH = 1.0
Z_ENT = FLOOR + H_COL + EH    # 6.5, entablature top
Z_FRONT = Z_ENT + 0.15        # 6.65, front eave sits 0.15 m above the entablature (entablature stays under the roof)
DROP = Z_TOP - Z_FRONT        # 0.85, fall from the wall top to the eave
Y_RIB_END = Y_CORE - 0.62     # tile ribs stop at the front face of the wall's top cap (y = 2.03)
NICHE_X = [X0 + 2.0 + k * (44.0 / 6.0) for k in range(7)]    # -22 ... 22, seven niches


def _face(mat, pts, cen):
    """One planar polygon, wound so that its normal points away from the solid's centre cen."""
    pts = [Vector(p) for p in pts]
    n = Vector((0.0, 0.0, 0.0))
    for i in range(len(pts)):
        p = pts[i]; q = pts[(i + 1) % len(pts)]
        n.x += (p.y - q.y) * (p.z + q.z)
        n.y += (p.z - q.z) * (p.x + q.x)
        n.z += (p.x - q.x) * (p.y + q.y)
    c = sum(pts, Vector((0.0, 0.0, 0.0))) / len(pts)
    if n.dot(c - cen) < 0:
        pts = pts[::-1]
    add_poly(mat, pts)


def slab_x(mat, poly_yz, xa, xb):
    """Convex (y, z) polygon extruded along x from xa to xb (an end wall)."""
    A = [(xa, y, z) for y, z in poly_yz]
    B = [(xb, y, z) for y, z in poly_yz]
    n = len(poly_yz)
    cen = Vector(((xa + xb) / 2.0, sum(p[0] for p in poly_yz) / n, sum(p[1] for p in poly_yz) / n))
    _face(mat, A, cen); _face(mat, B, cen)
    for i in range(n):
        j = (i + 1) % n
        _face(mat, [A[i], A[j], B[j], B[i]], cen)


def roof_ribs(spacing=0.62, w=0.17, h=0.09):
    """Cover-tile ribs lying on the lean-to roof, from the front eave back to the front face of the wall's top cap
    (Y_RIB_END). Each rib is a box standing on the roof plane; its top is clipped at the roof's high edge, so no rib
    stands above the roof or runs past the wall."""
    slope = DROP / (Y_CORE - Y_FRONT)
    nrm = Vector((0.0, -slope, 1.0)).normalized() * h
    sw = Vector((w / 2.0, 0.0, 0.0))
    n = int((X1 - X0) / spacing)
    top = lambda p: Vector((p.x, p.y, min(p.z, Z_TOP)))
    for i in range(n):
        x = X0 + (i + 0.5) * (X1 - X0) / n
        a = Vector((x, Y_FRONT, Z_FRONT))
        b = Vector((x, Y_RIB_END, Z_FRONT + slope * (Y_RIB_END - Y_FRONT)))
        v = [a - sw, a + sw, top(a + sw + nrm), top(a - sw + nrm), b - sw, b + sw, top(b + sw + nrm), top(b - sw + nrm)]
        add_mesh('tile2', [tuple(p) for p in v],
                 [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)])


# ---------------------------------------------------------------- floor, steps, back wall
box(None, 0, (Y_STEP + Y_BACK) / 2, -0.6, X1 - X0, Y_BACK - Y_STEP, FLOOR + 0.6, 'paving')      # paving, foundation below
box(None, 0, (Y_STEP2 + Y_STEP) / 2, -0.6, X1 - X0, Y_STEP - Y_STEP2, 0.25 + 0.6, 'stone')      # lower step (0.25)

box(None, 0, (Y_CORE + Y_BACK) / 2, -0.6, X1 - X0, Y_BACK - Y_CORE, Z_TOP + 0.6, 'plaster')     # back wall core
ops = [(x - X0, 1.4, 1.5, 3.0, 'arch') for x in NICHE_X]                                         # niche bottoms 1.9 m up
opening_skin(None, X0, Y_CORE, X1, Y_CORE, FLOOR, H_WALL, ops, 'plaster', depth=0.6, inner='red')   # red niche backs
box(None, 0, 2.0, FLOOR, X1 - X0, 0.12, 1.2, 'red')                                              # red dado

for k in range(6):                                                                               # benches between niches
    xa = NICHE_X[k] + 1.1
    xb = NICHE_X[k + 1] - 1.1
    box(None, (xa + xb) / 2, 1.69, FLOOR, xb - xa, 0.5, 0.45, 'stone')

for x in NICHE_X:                                                                                # statues in the niches
    statue(None, x, 2.36, FLOOR + 1.4, h=1.5, mat='marble', pedestal=0.3, rot=180.0, ped_mat='stone')

# ---------------------------------------------------------------- colonnade, roof, end walls
colonnade(None, -22.0, Y_COL, 22.0, Y_COL, FLOOR, N_COL, H_COL, r=None, mat='marble', order='tuscan', ent=True,
          ent_h=EH, ent_depth=None, flutes=0, seg=12)
lean_roof(None, X0, Y_CORE, X1, Y_CORE, Z_TOP, Y_CORE - Y_FRONT, DROP, mat='tile', tiles=False)     # roof sheet
roof_ribs()

end_poly = [(Y_FRONT, -0.6), (Y_CORE, -0.6), (Y_CORE, Z_TOP), (Y_FRONT, Z_FRONT)]     # (y, z)
slab_x('plaster', end_poly, X0, X0 + 0.6)
slab_x('plaster', end_poly, X1 - 0.6, X1)

human(None, 28, -6)
finish('ant_portico', front='-Y')
