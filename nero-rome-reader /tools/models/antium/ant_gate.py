"""ant_gate · the gatehouse at the land neck of Antium (the only way in by land).

World metres: +X = outside (mainland), +Y = north, z = 0 ground level, foundations down to z = -8.
  gate block   X -6..6, Y -8..8, walls 12 m; one 5 x 8 m arch through the passage (the passage runs along X)
  iron grille  in the outer end of the arch, raised two-thirds (bottom edge at 5.33 m)
  gallery      five small arched windows above the arch; attic with marble inscription panel; merlons on top
  towers       10 x 10 m at Y = +-13 attached to the gate block, walls 20 m, slits, red band, cornice, pyramid roofs
  stubs        curtain walls from each tower outward, Y 18..26 and -18..-26, 2.4 m thick, 7 m high, tile coping
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_kit import *

reset()

# ---------------------------------------------------------------- foundation under the gate block (to z = -8)
box(None, 0, 0, -8.0, 13.0, 17.0, 8.0, 'tuff')

# ---------------------------------------------------------------- gate block
# rot 90: the kit's passage (local y) runs along world X, the 16 m width (local x) runs along world Y
gate_block(None, 0, 0, 0.0, 16.0, 12.0, 12.0, 5.0, 8.0, mat='stone', rot=90.0, attic_h=2.6)

# merlons round the top of the attic cap (cap top z = 15.45)
ZT = 15.45
crenels(None, 5.9, -7.9, 5.9, 7.9, ZT, 0.9, 0.6, 0.9, 0.7, 'stone')
crenels(None, -5.9, 7.9, -5.9, -7.9, ZT, 0.9, 0.6, 0.9, 0.7, 'stone')
crenels(None, -5.3, 7.9, 5.3, 7.9, ZT, 0.9, 0.6, 0.9, 0.7, 'stone')
crenels(None, 5.3, -7.9, -5.3, -7.9, ZT, 0.9, 0.6, 0.9, 0.7, 'stone')

# upper gallery: five small arched windows above the arch on both faces (sills 9.1 m, crowns 11.1 m)
GAL = [(u, 0.6, 1.0, 2.0, 'arch') for u in (3.2, 5.6, 8.0, 10.4, 12.8)]
opening_skin(None, 6.0, -8.0, 6.0, 8.0, 8.5, 3.4, GAL, mat='stone', depth=0.25)      # outer (+X) face
opening_skin(None, -6.0, 8.0, -6.0, -8.0, 8.5, 3.4, GAL, mat='stone', depth=0.25)    # inner (-X) face
box(None, 6.13, 0.0, 8.3, 0.26, 16.0, 0.2, 'stone')                                   # string course under it
box(None, -6.13, 0.0, 8.3, 0.26, 16.0, 0.2, 'stone')

# ---------------------------------------------------------------- iron grille (outer end of the passage)
GX = 5.9                       # the grille hangs 10 cm inside the outer face
ZB = 8.0 * 2.0 / 3.0           # raised two-thirds: its bottom edge sits at 5.33 m, the top fills the arch crown


def arch_top(y):
    """Crown of the 5 m arch at lateral position y (springing 5.5 m, radius 2.5 m)."""
    return 5.5 + math.sqrt(max(0.0, 2.5 * 2.5 - y * y))


for i in range(20):                                       # vertical bars 0.08 m, every 0.25 m across 5 m
    y = -2.375 + 0.25 * i
    box(None, GX, y, ZB, 0.08, 0.08, arch_top(y) - 0.04 - ZB, 'iron')
for zc in (5.99, 6.66, 7.33):                              # three cross bars across the arch
    hw = math.sqrt(max(0.0, 2.5 * 2.5 - (zc - 5.5) ** 2))
    box(None, GX, 0.0, zc - 0.04, 0.08, 2 * hw - 0.06, 0.08, 'iron')
ARC = [(GX, -2.5 * math.cos(math.pi * k / 12), 5.5 + 2.5 * math.sin(math.pi * k / 12)) for k in range(13)]
for k in range(12):                                        # arched iron band round the top of the grille
    beam(None, ARC[k][0], ARC[k][1], ARC[k][2], ARC[k + 1][0], ARC[k + 1][1], ARC[k + 1][2], 0.1, 0.1, 'iron')

# ---------------------------------------------------------------- two square towers (attached to the N and S sides)
# The kit's batter spreads 0.9 m over 4 m and reads as a ramp here. Each tower gets its own small tuff foot instead:
# foundation down to z = -8 (0.4 m proud), a tuff batter 2 m high (0.4 m proud at the foot, flush at 2 m), then the wall.
def frustum_sq(cx, cy, z0, z1, h0, h1, mat):
    """Closed square frustum: half-size h0 at z0, tapering to h1 at z1, all faces outward."""
    P = [(cx - h0, cy - h0, z0), (cx + h0, cy - h0, z0), (cx + h0, cy + h0, z0), (cx - h0, cy + h0, z0)]
    Q = [(cx - h1, cy - h1, z1), (cx + h1, cy - h1, z1), (cx + h1, cy + h1, z1), (cx - h1, cy + h1, z1)]
    add_poly(mat, [P[0], P[3], P[2], P[1]])            # bottom, normal -Z
    add_poly(mat, Q)                                   # top, normal +Z
    for i in range(4):
        j = (i + 1) % 4
        add_poly(mat, [P[i], P[j], Q[j], Q[i]])         # sloped sides


TOWER_HALF = 5.0                                       # 10 m tower, faces at +-5 m
for s in (1, -1):
    yc = s * 13.0
    box(None, 0, yc, -8.0, 2 * TOWER_HALF + 0.8, 2 * TOWER_HALF + 0.8, 8.0, 'tuff')          # foundation to z = -8
    frustum_sq(0, yc, 0.0, 2.0, TOWER_HALF + 0.4, TOWER_HALF + 0.01, 'tuff')                  # batter: 0.4 m out, 2 m high
    box(None, 0, yc, 2.0, 2 * TOWER_HALF + 0.02, 2 * TOWER_HALF + 0.02, 2.0, 'stone')        # wall foot 2 to 4 m, flush
    square_tower(None, 0, yc, 10.0, 20.0, wall_mat='stone', roof='pyramid', pitch=30.0, foundation=0,
                 battered=False, cornice_mat='marble', band_mat='red')

# ---------------------------------------------------------------- curtain-wall stubs from each tower outward
for s in (1, -1):
    y0, y1 = s * 18.0, s * 26.0
    ym = (y0 + y1) / 2.0
    box(None, 0, ym, -8.0, 2.4, 8.0, 8.0, 'tuff')                  # foundation to z = -8
    wall(None, 0, y0, 0, y1, 0.0, 7.0, 2.4, 'stone')
    box(None, 0, ym, 7.0, 2.7, 8.0, 0.3, 'tile')                   # red tile coping
    crenels(None, 0, y0 + s * 0.2, 0, y1 - s * 0.2, 7.3, 0.9, 1.2, 0.9, 0.7, 'stone')

# ---------------------------------------------------------------- scale figure (preview only)
human(None, 10, -8)

finish('ant_gate', front='+X')
