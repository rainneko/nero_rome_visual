"""ant_barracks - the barracks of the German guard just inside the gate at the land neck, Antium (AD 54-68).

A plain two-storey courtyard block 34 m (x) by 22 m (y), eaves at 8.4 m, walls of stone with one red band at the
floor line. Central court 20 x 9 m: gravel floor, a wooden gallery round the upper floor on all four sides (lean-to
tiled roofs), a small shrine on the west side and a stone water trough. Main gate in the middle of the south side
(-Y): an arched passage 3.2 m wide with open wooden doors and a small tiled porch roof. A square watch tower on the
east end (+X), 4 m above the roofs, pyramid roof. Foundations go down to z = -6.
Brief: briefs/antium/barracks.md
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_kit import *

reset()

# ---------------------------------------------------------------- dimensions (m)
BX, BY = 17.0, 11.0          # block: x from -17 to 17, y from -11 to 11 (south side = -Y = the gate side)
CXH, CYH = 10.0, 4.5         # court: x from -10 to 10, y from -4.5 to 4.5 (20 x 9 m)
GH, UH = 4.6, 3.8            # ground floor and upper floor heights
EAVE = GH + UH               # 8.4
PITCH, OH = 22.0, 0.6        # roof pitch and overhang
SHIFT = 0.3                  # north/south roofs sit 0.3 m outwards, east/west 0.3 m outwards: gallery shows from above
GD = 1.5                     # gallery depth into the court
GZ = GH + 0.12               # top of the gallery floor boards

# ---------------------------------------------------------------- foundation and court floor
box(None, 0, 0, -6.0, 2 * BX + 0.8, 2 * BY + 0.8, 6.0, 'tuff')        # foundation down to z = -6 (top at z = 0)
box(None, 0, 0, 0.0, 2 * CXH, 2 * CYH, 0.12, 'gravel')                 # court floor

# ---------------------------------------------------------------- ranges (rect_building; roofs are added below)
RB = dict(floors=2, floor_h=UH, ground_h=GH, wall_mat='stone', base_mat='stone', win_w=0.8, win_h=1.1,
          roof=None, foundation=0, band_mat='red', cornice_mat='stone', quoins=True)
rect_building(None, 0, 7.75, 34, 6.5, bay=6.0, doors=(('S', -6.8),), **RB)                 # north range (court face = S)
rect_building(None, -10.5, -7.75, 13, 6.5, bay=12.5, skip_sides=('E',), doors=(('N', -3.5),), **RB)   # south-west
rect_building(None, 10.5, -7.75, 13, 6.5, bay=12.5, skip_sides=('W',), doors=(('N', 3.5),), **RB)     # south-east
rect_building(None, 13.5, 0, 7, 9.8, bay=9.8, skip_sides=('N', 'S'), doors=(('W', 0.0),), **RB)       # east range
rect_building(None, -13.5, 0, 7, 9.8, bay=9.8, skip_sides=('N', 'S'), doors=(('E', 0.0),), **RB)      # west range


# ---------------------------------------------------------------- gate: solid block with a through passage along y
def passage_block(x0, x1, y0, y1, h, ow, oh, mat='stone', seg=12):
    """Solid block x0..x1 by y0..y1 (y0 = front, -Y side) of height h, with a through passage of width ow and crown
    height oh running along y. Plain stone: the same construction as kit gate_block, without the marble trim."""
    r = ow / 2; sp = oh - r; cx = (x0 + x1) / 2; w = x1 - x0
    arch = [(r * math.cos(math.pi * (1 - i / seg)), sp + r * math.sin(math.pi * (1 - i / seg))) for i in range(seg + 1)]
    outline = [(-w / 2, 0), (-r, 0), (-r, sp)] + arch[1:-1] + [(r, sp), (r, 0), (w / 2, 0), (w / 2, h), (-w / 2, h)]
    add_poly(mat, [(cx + u, y0, z) for u, z in outline])                    # front face, normal -Y
    add_poly(mat, [(cx + u, y1, z) for u, z in reversed(outline)])          # back face, normal +Y
    rim = [(-r, 0), (-r, sp)] + arch[1:-1] + [(r, sp), (r, 0)]              # passage vault and jambs
    for (ua, za), (ub, zb) in zip(rim[:-1], rim[1:]):
        add_poly(mat, [(cx + ua, y0, za), (cx + ub, y0, zb), (cx + ub, y1, zb), (cx + ua, y1, za)][::-1])
    add_poly(mat, [(x1, y0, 0), (x1, y1, 0), (x1, y1, h), (x1, y0, h)])    # east end, normal +X
    add_poly(mat, [(x0, y1, 0), (x0, y0, 0), (x0, y0, h), (x0, y1, h)])    # west end, normal -X
    add_poly(mat, [(x0, y0, h), (x1, y0, h), (x1, y1, h), (x0, y1, h)])    # top


passage_block(-4.4, 4.4, -11.0, -4.5, EAVE, 3.2, 4.0)                    # gate, arch 3.2 m wide, crown 4.0 m

# ---------------------------------------------------------------- terracotta hip roofs (eave at 8.4 m)
hip_roof(None, 0, 7.75 + SHIFT, EAVE, 34, 6.5, PITCH, OH)                  # north range
hip_roof(None, 0, -7.75 - SHIFT, EAVE, 34, 6.5, PITCH, OH)                 # south range (over the gate block)
# east and west ranges: eaves run out exactly at the north/south roof eaves (y = +-4.2), so the roofs meet in a valley
hip_roof(None, 13.5 + SHIFT, 0, EAVE, 7, 7.2, PITCH, OH)                   # east range
hip_roof(None, -13.5 - SHIFT, 0, EAVE, 7, 7.2, PITCH, OH)                  # west range

# ---------------------------------------------------------------- gate: open wooden double doors, small tiled porch
for sx in (-1, 1):
    box(None, sx * 1.52, -10.25, 0.0, 0.12, 1.5, 2.6, 'wood')             # leaves folded back against the jambs
lean_roof(None, -2.4, -11.0, 2.4, -11.0, 5.0, 2.2, 0.9, 'tile')            # porch roof, outer edge at y = -13.2
for sx in (-1, 1):
    yp = -12.8
    zp = 5.0 - 0.9 * ((-11.0 - yp) / 2.2)                                   # roof underside above the post
    box(None, sx * 2.2, yp, 0.0, 0.24, 0.24, zp, 'wood')                   # porch posts

# ---------------------------------------------------------------- court gallery: wooden floor, posts, rail, lean-to roof
# north side (court wall at y = 4.5)
box(None, 0, 4.5 - GD / 2, GH, 17.0, GD, 0.12, 'wood')
lean_roof(None, -8.5, 4.5, 8.5, 4.5, 7.2, GD, 0.9)
for x in [-8.12 + i * 4.06 for i in range(5)]:
    box(None, x, 4.5 - GD + 0.12, 0.0, 0.24, 0.24, 6.3, 'wood')
box(None, 0, 4.5 - GD + 0.12, 5.5, 17.0, 0.1, 0.12, 'wood')
# south side (court wall at y = -4.5)
box(None, 0, -(4.5 - GD / 2), GH, 17.0, GD, 0.12, 'wood')
lean_roof(None, 8.5, -4.5, -8.5, -4.5, 7.2, GD, 0.9)
for x in [-8.12 + i * 4.06 for i in range(5)]:
    box(None, x, -(4.5 - GD + 0.12), 0.0, 0.24, 0.24, 6.3, 'wood')
box(None, 0, -(4.5 - GD + 0.12), 5.5, 17.0, 0.1, 0.12, 'wood')
# east side (court wall at x = 10)
box(None, 10.0 - GD / 2, 0, GH, GD, 9.0, 0.12, 'wood')
lean_roof(None, 10.0, 4.5, 10.0, -4.5, 7.2, GD, 0.9)
for y in [-3.3, 0.0, 3.3]:
    box(None, 10.0 - GD + 0.12, y, 0.0, 0.24, 0.24, 6.3, 'wood')
box(None, 10.0 - GD + 0.12, 0, 5.5, 0.1, 9.0, 0.12, 'wood')
# west side (court wall at x = -10)
box(None, -(10.0 - GD / 2), 0, GH, GD, 9.0, 0.12, 'wood')
lean_roof(None, -10.0, -4.5, -10.0, 4.5, 7.2, GD, 0.9)
for y in [-3.3, 0.0, 3.3]:
    box(None, -(10.0 - GD + 0.12), y, 0.0, 0.24, 0.24, 6.3, 'wood')
box(None, -(10.0 - GD + 0.12), 0, 5.5, 0.1, 9.0, 0.12, 'wood')

# ---------------------------------------------------------------- shrine (sacellum) on the court's west side, 3 x 3 m
SF = Frame(-6.5, 0.0, 0.0, 90.0)            # local -y (front) points east, into the court
box(SF, 0, 0, 0.0, 3.0, 3.0, 0.25, 'stone')                                # podium
box(SF, 0, 1.3, 0.25, 3.0, 0.4, 2.65, 'stone')                             # back wall (local +y)
box(SF, 0, 1.06, 1.0, 1.0, 0.04, 1.2, 'dark')                              # niche in the back wall
colonnade(SF, -1.05, -1.2, 1.05, -1.2, 0.25, 2, 2.25, r=0.14, mat='marble', order='tuscan', ent=True, ent_h=0.4,
          seg=8)
gable_roof(SF, 0, 0, 2.9, 3.0, 3.0, 18.0, axis='y', overhang=0.25, mat='tile', tiles=True, rib_mat='tile2',
           gable_mat='stone', pediment=True, tymp_mat='plaster')

# ---------------------------------------------------------------- stone water trough in the court
TX, TY, TZ = 4.6, -1.6, 0.12
TL, TW, TH = 2.4, 0.8, 0.5
box(None, TX, TY - TW / 2 + 0.07, TZ, TL, 0.14, TH, 'stone')              # walls
box(None, TX, TY + TW / 2 - 0.07, TZ, TL, 0.14, TH, 'stone')
box(None, TX - TL / 2 + 0.07, TY, TZ, 0.14, TW, TH, 'stone')
box(None, TX + TL / 2 - 0.07, TY, TZ, 0.14, TW, TH, 'stone')
box(None, TX, TY, TZ, TL - 0.14, TW - 0.14, 0.1, 'stone')                # inner floor
box(None, TX, TY, TZ + 0.1, TL - 0.28, TW - 0.28, 0.2, 'water')          # water, z 0.22 .. 0.42

# ---------------------------------------------------------------- watch tower on the east end, 4 m above the roofs
square_tower(None, 17.0, 0.0, 5.0, 14.0, wall_mat='stone', roof='pyramid', pitch=30.0, slit_rows=3, battered=True,
             foundation=6.0, cornice_mat='stone', band_mat=None)

human(None, 24.0, -6.0)                     # preview only: 1.8 m figure for scale
finish('ant_barracks', front='-Y')
