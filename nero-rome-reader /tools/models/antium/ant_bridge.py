"""ant_bridge · the narrow marble bridge from the mainland to the side hall at Antium.

Z = 0 is SEA LEVEL for this asset (not a floor). Book: no railings, only a thin marble kerb on each edge.
Deck x -38..+38 at z 50, 2.7 m wide. One semicircular arch: clear span 48 m, springing at x = +-24, z 20,
intrados crown z 44; ring 1.8 m deep and 3.4 m wide in 40 voussoirs alternating marble and stone.
Solid ashlar spandrels (3 m thick) from the arch up to the deck, marble cornice under the deck edge.
Battered abutments (3.4 m wide at the deck, 7 m at the base) down to z -3. Gatehouse at +X: x 38..46,
y +-3.75, floor z 50, eaves 57.5, tiled gable roof (ridge along X), 2.8 m arched passage with a closed iron
gate and a stone guard bench. Two statues on pedestals at each bridgehead, beside the deck ends.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_kit import *  # bpy, Vector, box, beam, arcade, gable_roof, statue, human, reset, finish, add_mesh, add_poly

DECK_Z = 50.0               # deck top
DECK_HW = 1.35              # half width: 2.7 m deck
SLAB_BOT = 47.0             # underside of the 3 m deck slab
ARC_Z = 20.0                # arch springing line
R_IN, R_OUT = 24.0, 25.8    # intrados (clear span 48 m) and extrados (ring 1.8 m deep)
RING_HW = 1.7               # ring 3.4 m wide
SPAND_HW = 1.5              # spandrel walls 3 m thick
N_VOU = 40                  # voussoirs (4.5 degrees each)
JOINT = 0.0012              # half joint angle in radians (keeps a visible joint line)
ABUT_BASE_Z = -3.0          # abutments reach down to the sea
ABUT_HW_BASE, ABUT_HW_TOP = 3.5, 1.7   # 7 m at the base, 3.4 m at the deck


def _arc_pt(r, a, y):
    """Point on the arch circle: radius r, angle a (0 = +X springing, pi/2 = crown), at width y."""
    return Vector((r * math.cos(a), y, ARC_Z + r * math.sin(a)))


def _convex(mat, V, quads):
    """A closed convex solid from 8 points and six quad faces; faces are written with outward normals."""
    inside = sum(V, Vector((0.0, 0.0, 0.0))) / len(V)
    out = []
    for f in quads:
        P = [Vector(V[i]) for i in f]
        n = Vector((0.0, 0.0, 0.0))
        for i in range(len(P)):
            a, b = P[i], P[(i + 1) % len(P)]
            n.x += (a.y - b.y) * (a.z + b.z)
            n.y += (a.z - b.z) * (a.x + b.x)
            n.z += (a.x - b.x) * (a.y + b.y)
        c = sum(P, Vector((0.0, 0.0, 0.0))) / len(P)
        out.append(tuple(f) if n.dot(c - inside) >= 0 else tuple(reversed(f)))
    add_mesh(mat, V, out)


def _prism_xz(mat, poly, y0, y1):
    """Extrude a simple polygon given as (x, z) points from y = y0 to y = y1 (non-convex shapes are fine)."""
    n = len(poly)
    area = sum(poly[i][0] * poly[(i + 1) % n][1] - poly[(i + 1) % n][0] * poly[i][1] for i in range(n))
    if area < 0:
        poly = poly[::-1]                          # counter-clockwise in (x, z)
    A = [(x, y0, z) for x, z in poly]
    B = [(x, y1, z) for x, z in poly]
    add_poly(mat, A)                               # normal -Y (the y0 side)
    add_poly(mat, B[::-1])                         # normal +Y (the y1 side)
    for i in range(n):
        j = (i + 1) % n
        add_poly(mat, [A[i], B[i], B[j], A[j]])    # outward side faces


def _abutment(x0, x1):
    """Battered abutment: trapezoid in (y, z), 7 m wide at z -3 and 3.4 m at the deck, running along X from x0 to x1."""
    V = [Vector((x0, -ABUT_HW_BASE, ABUT_BASE_Z)), Vector((x0, ABUT_HW_BASE, ABUT_BASE_Z)),
         Vector((x0, ABUT_HW_TOP, DECK_Z)), Vector((x0, -ABUT_HW_TOP, DECK_Z)),
         Vector((x1, -ABUT_HW_BASE, ABUT_BASE_Z)), Vector((x1, ABUT_HW_BASE, ABUT_BASE_Z)),
         Vector((x1, ABUT_HW_TOP, DECK_Z)), Vector((x1, -ABUT_HW_TOP, DECK_Z))]
    _convex('stone', V, [(0, 1, 2, 3), (4, 5, 6, 7), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)])


def _deck():
    box(None, 0.0, 0.0, SLAB_BOT, 76.0, 2 * DECK_HW, DECK_Z - SLAB_BOT, 'marble')            # deck slab
    for s in (-1, 1):
        box(None, 0.0, s * (DECK_HW - 0.06), DECK_Z, 76.0, 0.12, 0.12, 'marble')            # 0.12 m kerb, no railings
        box(None, 0.0, s * 1.46, 46.0, 76.0, 0.52, 1.0, 'marble')                            # cornice under the deck edge
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(None, sx * 35.0, sy * 2.25, 44.0, 6.0, 1.8, 6.0, 'stone')                     # bridgehead spur (statue ground)
            statue(None, sx * 36.2, sy * 2.25, DECK_Z, h=2.0, mat='marble', pedestal=1.1, ped_mat='stone')


def _voussoirs():
    for k in range(N_VOU):
        a0 = math.pi * k / N_VOU + JOINT
        a1 = math.pi * (k + 1) / N_VOU - JOINT
        V = [_arc_pt(R_IN, a0, -RING_HW), _arc_pt(R_IN, a1, -RING_HW),
             _arc_pt(R_OUT, a1, -RING_HW), _arc_pt(R_OUT, a0, -RING_HW),
             _arc_pt(R_IN, a0, RING_HW), _arc_pt(R_IN, a1, RING_HW),
             _arc_pt(R_OUT, a1, RING_HW), _arc_pt(R_OUT, a0, RING_HW)]
        _convex('marble' if k % 2 == 0 else 'stone', V,
                [(0, 1, 2, 3), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])


def _spandrels():
    """Solid ashlar from the extrados of the ring up to the underside of the deck slab, 3 m thick in Y."""
    poly = [(R_OUT * math.cos(math.pi * k / N_VOU), ARC_Z + R_OUT * math.sin(math.pi * k / N_VOU))
            for k in range(N_VOU + 1)]
    poly += [(-R_OUT, SLAB_BOT), (R_OUT, SLAB_BOT)]
    _prism_xz('stone', poly, -SPAND_HW, SPAND_HW)


def _gatehouse():
    box(None, 42.0, 0.0, ABUT_BASE_Z, 8.0, 7.5, DECK_Z - ABUT_BASE_Z, 'stone')                 # masonry block down to the sea
    arcade(None, 42.0, -3.75, 42.0, 3.75, DECK_Z, 7.5, 8.0, 1, mat='plaster', open_w=2.8, open_h=4.2,
           impost_mat='marble')                                                                  # walls, passage on the bridge axis
    gable_roof(None, 42.0, 0.0, DECK_Z + 7.5, 8.0, 7.5, pitch=22.0, axis='x', overhang=0.5,
               mat='tile', gable_mat='plaster')                                                  # tiled gable, ridge along X
    # closed iron gate in the passage: two leaves of vertical bars meeting at a centre stile, arched top
    GX, RG, SPR = 42.0, 1.4, DECK_Z + 2.8
    for k in range(5):
        for s in (-1, 1):
            yy = s * (0.14 + 0.28 * k)
            top = SPR + math.sqrt(RG * RG - yy * yy) - 0.04
            beam(None, GX, yy, DECK_Z, GX, yy, top, 0.07, 0.07, 'iron')
    hoop = [(RG * math.cos(math.pi * i / 12), SPR + RG * math.sin(math.pi * i / 12)) for i in range(13)]
    for (y0, z0), (y1, z1) in zip(hoop[:-1], hoop[1:]):
        beam(None, GX, y0, z0, GX, y1, z1, 0.08, 0.08, 'iron')
    for zr in (DECK_Z + 1.2, DECK_Z + 3.0):
        beam(None, GX, -1.3, zr, GX, 1.3, zr, 0.08, 0.08, 'iron')
    beam(None, GX, 0.0, DECK_Z, GX, 0.0, SPR + RG - 0.02, 0.08, 0.08, 'iron')
    # stone guard bench inside the passage, on the palace side of the gate, against the -Y wall
    box(None, 44.5, -1.1, DECK_Z, 1.8, 0.6, 0.45, 'stone')


reset()
_deck()
_voussoirs()
_spandrels()
_abutment(24.0, 38.0)
_abutment(-38.0, -24.0)
_gatehouse()
human(None, 0.0, 0.0, DECK_Z)           # preview-only 1.8 m figure on the deck, for scale
finish('ant_bridge', front='+X')
