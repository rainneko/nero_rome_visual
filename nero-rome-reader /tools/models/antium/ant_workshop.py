"""ant_workshop · 悬崖工坊, the cliff workshop on the lower south terrace above the harbour.

World metres: +X = the main door (the door faces +X), +Y = north, the cliff lies to the south (-Y).
  main hall   36 x 15 m, floor 1 m above the ground on a plinth, eaves at z = 8, gabled tiled roof (ridge along X)
  lantern     ventilation lantern on the ridge, 16 m long, louvred sides, small gable on top
  door        4.5 x 5.5 m arch in the middle of the +X end, brick arch head, timber leaves with iron straps;
              five stone steps 8 m wide in front of it
  windows     high arched clerestory windows (seven per long side, minus those the annex hides)
  quoins      brick corner blocks
  chimneys    two brick furnace chimneys 2.2 x 2.2 m, up to 18 m, against the -X end
  mill annex  12 x 8 m, 5 m high, lean-to roof, on the -Y (cliff) side; closed block with a big wooden shutter
  shaft       tuff tower 2.6 x 2.6 m on the annex's outer face, down to z = -24, pyramid cap
  yard        beam stacks and a pile of squared stone beside the door
  foundation  down to z = -6
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_kit import *

reset()

FLOOR, EAVES = 1.0, 8.0            # floor level on the plinth, eaves height
HALL_H = EAVES - FLOOR
T = 0.34                           # skin depth; outer faces sit 0.35 m outside the core lines
CX, CY = 17.65, 7.15               # core lines: outer faces at X = +-18.0 and Y = +-7.5
L_X, L_Y = 2 * CX, 2 * CY
OUT_N = CY + 0.39                  # brick arch heads stand 4 cm proud of the outer faces (Y)
OUT_E = CX + 0.39                  # ... and on the +X end (X)

# ---------------------------------------------------------------- foundation, plinth, core
box(None, 0, 0, -6.0, 37.0, 16.0, 6.0, 'tuff')                 # foundation down to z = -6
box(None, 0, 0, 0.0, 37.0, 16.0, FLOOR, 'stone')               # plinth: the floor is 1 m above the ground
box(None, 0, 0, FLOOR, L_X, L_Y, HALL_H, 'tuff')              # core of the hall (faces on the skin lines)

# ---------------------------------------------------------------- wall skins with real recesses
WIN_Z, WIN_H = 3.6, 2.8                                        # clerestory: sill 4.6 m, arch crown 7.4 m
US = [L_X / 2 + (k - 3) * 4.9 for k in range(7)]               # seven bays along each long side
win_n = [(u, WIN_Z, 1.5, WIN_H, 'arch') for u in US]
# the south side: skip the bays that the mill annex (X -2..10) hides
win_s = [(u, WIN_Z, 1.5, WIN_H, 'arch') for u in US if not (-2.9 < (-CX + u) < 10.9)]
DOOR = (L_Y / 2, 0.0, 4.5, 5.5, 'arch')                        # the middle of the +X end, 4.5 m wide, 5.5 m high

opening_skin(None, CX, CY, -CX, CY, FLOOR, HALL_H, win_n, mat='tuff', depth=T)        # north
opening_skin(None, -CX, -CY, CX, -CY, FLOOR, HALL_H, win_s, mat='tuff', depth=T)      # south
opening_skin(None, CX, -CY, CX, CY, FLOOR, HALL_H, [DOOR], mat='tuff', depth=T)       # east: the door
opening_skin(None, -CX, CY, -CX, -CY, FLOOR, HALL_H, [], mat='tuff', depth=T)         # west: plain end


# ---------------------------------------------------------------- brick arch heads and quoins
def head_band(pts, w, h, mat='brick'):
    """Voussoir band following an arc: one beam per segment (w across the wall, h radial)."""
    for k in range(len(pts) - 1):
        a, b = pts[k], pts[k + 1]
        beam(None, a[0], a[1], a[2], b[0], b[1], b[2], w, h, mat)


R_W = WIN_H / 2 + 0.2                                          # windows: opening radius 0.75 + band
ZS_W = FLOOR + WIN_Z + WIN_H - WIN_H / 2                       # springing of the window arches
for u in US:                                                   # north windows
    xc = CX - u
    head_band([(xc + R_W * math.cos(math.pi * k / 6), OUT_N, ZS_W + R_W * math.sin(math.pi * k / 6))
               for k in range(7)], 0.08, 0.4)
for u in US:                                                   # south windows (only the ones that exist)
    if not (-2.9 < (-CX + u) < 10.9):
        xc = -CX + u
        head_band([(xc + R_W * math.cos(math.pi * k / 6), -OUT_N, ZS_W + R_W * math.sin(math.pi * k / 6))
                   for k in range(7)], 0.08, 0.4)

R_D = 2.25 + 0.2                                               # door arch head
ZS_D = FLOOR + 5.5 - 2.25                                      # springing of the door arch (4.25 m)
head_band([(OUT_E, R_D * math.cos(math.pi * k / 8), ZS_D + R_D * math.sin(math.pi * k / 8)) for k in range(9)],
          0.08, 0.4)
for ys in (-R_D, R_D):                                         # brick jambs down to the threshold
    beam(None, OUT_E, ys, FLOOR, OUT_E, ys, ZS_D, 0.08, 0.4, 'brick')

for sx in (-1, 1):                                             # brick quoins at the four corners
    for sy in (-1, 1):
        box(None, sx * (CX - 0.02), sy * (CY - 0.02), FLOOR, 0.76, 0.76, HALL_H, 'brick')


# ---------------------------------------------------------------- door leaves (closed, inside the recess)
def arch_profile(hw, z0, zs, n=12):
    """(y, z) outline of a door leaf: square bottom, semicircular head; counter-clockwise seen from +X."""
    pts = [(-hw, z0), (hw, z0), (hw, zs)]
    pts += [(hw * math.cos(math.pi * k / n), zs + hw * math.sin(math.pi * k / n)) for k in range(1, n)]
    pts.append((-hw, zs))
    return pts


LEAF = arch_profile(2.15, FLOOR, ZS_D)
add_poly('wood', [(17.84, y, z) for y, z in LEAF])                 # outer face (normal +X)
add_poly('wood', [(17.76, y, z) for y, z in reversed(LEAF)])       # inner face (normal -X)
for zs_iron in (2.2, 3.6, 5.0):                                    # iron straps across the leaves
    hw = 2.15 if zs_iron <= ZS_D else math.sqrt(max(0.0, 2.15 ** 2 - (zs_iron - ZS_D) ** 2))
    box(None, 17.80, 0.0, zs_iron, 0.1, 2 * hw - 0.1, 0.12, 'iron')

# ---------------------------------------------------------------- roof: gabled, ridge along X
RIDGE = gable_roof(None, 0, 0, EAVES, 36.0, 15.0, pitch=22.0, axis='x', overhang=0.5, mat='tile', tiles=True,
                   rib_mat='tile2', gable_mat='tuff')

# ---------------------------------------------------------------- ventilation lantern on the ridge
LX, LY = 8.0, 1.35                                             # 16 m long, 2.7 m wide
LH = 2.9                                                       # lantern body height, under the lantern roof eave
LZ0 = RIDGE - 0.8                                              # starts inside the roof
box(None, 0, 0, LZ0, 2 * LX, 2 * LY, LH, 'plaster')           # lantern body, top 2.1 m above the ridge
LOUV = [(LX + (k - 3) * 2.2, 1.4, 1.0, 1.4, 'rect') for k in range(7)]   # seven louvre slots per side
opening_skin(None, LX, LY, -LX, LY, LZ0, LH, LOUV, mat='plaster', depth=0.15)     # +Y side
opening_skin(None, -LX, -LY, LX, -LY, LZ0, LH, LOUV, mat='plaster', depth=0.15)   # -Y side
gable_roof(None, 0, 0, LZ0 + LH, 2 * LX, 3.0, 25.0, 'x', 0.3, 'tile', True, 'tile2', 'plaster')

# ---------------------------------------------------------------- door steps (five, 8 m wide, to the floor)
# rot 180: the flight climbs toward -X, its top tread against the plinth at X = 18.5
stairs(None, 20.5, 0.0, 0.0, 8.0, 5, rise=0.2, run=0.4, rot=180.0, mat='stone', cheeks=False)

# ---------------------------------------------------------------- two brick furnace chimneys at the -X end
for ys in (-4.0, 4.0):
    box(None, -19.1, ys, -6.0, 2.6, 2.6, 6.0, 'tuff')          # foundation
    box(None, -19.1, ys, 0.0, 2.2, 2.2, 17.4, 'brick')         # shaft, 2.2 x 2.2 m
    box(None, -19.1, ys, 17.4, 2.6, 2.6, 0.6, 'stone')         # cap; top at 18 m

# ---------------------------------------------------------------- mill annex on the cliff side (-Y)
box(None, 4.0, -11.5, -6.0, 12.0, 8.0, 10.0, 'tuff')          # closed block, foundation to z = -6, top at z = 4
# triangles closing the wedge under the lean-to at both ends (the lean-to meets the hall wall at z = 5)
add_poly('tuff', [(-2.0, -7.5, 4.0), (-2.0, -15.5, 4.0), (-2.0, -7.5, 5.0)])
add_poly('tuff', [(10.0, -7.5, 4.0), (10.0, -7.5, 5.0), (10.0, -15.5, 4.0)])
lean_roof(None, -2.0, -7.5, 10.0, -7.5, 5.0, 8.0, 1.0, mat='tile', tiles=True, rib_mat='tile2')
# big shuttered window in wood on the outer (-Y) wall: dark surround, two leaves, iron straps
box(None, 4.0, -15.52, 0.8, 4.0, 0.08, 2.8, 'dark')
for xs in (3.0, 5.0):
    box(None, xs, -15.6, 0.8, 1.9, 0.08, 2.8, 'wood')
for zs in (1.5, 2.9):
    box(None, 4.0, -15.66, zs, 4.2, 0.06, 0.1, 'iron')

# ---------------------------------------------------------------- timber yard and stone pile beside the door
def beam_stack(x, y, length, layers, per, along):
    """Stacked squared timbers, 0.3 m square, side by side."""
    for l in range(layers):
        for k in range(per):
            off = (k - (per - 1) / 2.0) * 0.35
            z = l * 0.3
            if along == 'x':
                box(None, x, y + off, z, length, 0.3, 0.3, 'wood')
            else:
                box(None, x + off, y, z, 0.3, length, 0.3, 'wood')


beam_stack(24.0, -7.2, 4.5, 3, 3, 'x')
beam_stack(28.6, -5.5, 4.0, 2, 3, 'y')
for (x, y, z) in [(22.6, 6.6, 0.0), (23.7, 6.6, 0.0), (22.6, 7.7, 0.0), (23.7, 7.7, 0.0), (23.15, 7.15, 0.5)]:
    box(None, x, y, z, 1.0, 0.6, 0.5, 'stone')                  # squared stone blocks

# ---------------------------------------------------------------- water-wheel shaft housing on the annex's outer face
# Narrow tuff tower 2.6 x 2.6 m. Its north face stands on the outer (-Y) wall of the mill annex (Y = -15.5). It runs
# down to z = -24, where the wheel shaft drops to the water wheel at the cliff foot. Its top sits at the annex roof level
# (z = 4 at the outer wall) and carries a small tiled pyramid cap. Three slit windows: west, east and south faces.
SH_HALF = 1.3                                              # half of 2.6 m
SH_Y_OUT, SH_Y_IN = -18.1, -15.5                           # south (outer) face; north face against the annex
SH_Z0, SH_TOP = -24.0, 4.0
SH_H = SH_TOP - SH_Z0
SH_CY = (SH_Y_OUT + SH_Y_IN) / 2.0
CORE_X = SH_HALF - (T + 0.01)                              # core lines of the skins: the 0.35 m skins reach +-1.3
CORE_Y0 = SH_Y_OUT + (T + 0.01)                            # south core line
box(None, 0, (CORE_Y0 + SH_Y_IN) / 2.0, SH_Z0, 2 * CORE_X, SH_Y_IN - CORE_Y0, SH_H, 'tuff')
SLIT_Z, SLIT_W, SLIT_H = 1.5 - SH_Z0, 0.3, 1.1             # slit sills at z = 1.5 m (relative to the skin base)
MID_W = (SH_Y_IN - CORE_Y0) / 2.0                          # middle of the west and east faces
opening_skin(None, -CORE_X, SH_Y_IN, -CORE_X, CORE_Y0, SH_Z0, SH_H,
             [(MID_W, SLIT_Z, SLIT_W, SLIT_H, 'arch')], mat='tuff', depth=T)          # west face
opening_skin(None, CORE_X, CORE_Y0, CORE_X, SH_Y_IN, SH_Z0, SH_H,
             [(MID_W, SLIT_Z, SLIT_W, SLIT_H, 'arch')], mat='tuff', depth=T)          # east face
opening_skin(None, -SH_HALF, CORE_Y0, SH_HALF, CORE_Y0, SH_Z0, SH_H,
             [(SH_HALF, SLIT_Z, SLIT_W, SLIT_H, 'arch')], mat='tuff', depth=T)        # south face
hip_roof(None, 0, SH_CY, SH_TOP, 2 * SH_HALF, 2 * SH_HALF, pitch=35.0, overhang=0.25, mat='tile', tiles=True,
         rib_mat='tile2')                                                              # small pyramid cap

# ---------------------------------------------------------------- scale figure (preview only)
human(None, 13.0, -12.0)

finish('ant_workshop', front='+X')
