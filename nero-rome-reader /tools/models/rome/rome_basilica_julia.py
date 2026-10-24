"""Basilica Julia (Forum Romanum, south side), AD 56 · brief briefs/rome/basilica_julia.md.

Run from the project root:
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_basilica_julia.py"
Outputs: assets/models/rome/rome_basilica_julia.glb and renders/rome_basilica_julia/*.png
Conventions: metres, +X east, +Y north, z = 0 = basilica floor; asset front = -Y (the Forum side).
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                    # noqa: F401,F403  Frame, box, column, arcade, opening_skin, lean_roof, ...
import bpy
from mathutils import Vector

reset()
F = Frame()                         # origin = centre of the footprint, z = 0 = basilica floor

# ---------------------------------------------------------------- dimensions (m)
HX, HY = 50.5, 24.5                 # outer faces of the outer arcade: 101 x 49 m
TA = 3.0                            # arcade wall thickness (inner faces at 47.5 and 21.5)
LX, LY = HX - TA, HY - TA           # inner faces of the arcade
H1 = 8.0                            # storey height: two storeys of arcade
ZF = -1.3                           # Forum level, foot of the steps
ZT = 2 * H1                         # top of the outer arcade (16 m)
NXH, NYH = 42.0, 10.0               # nave outer faces: 82 x 18 m inside, 1 m walls
ZN = 24.0                           # nave wall top (eaves of the gable roof)
ZH = 21.0                           # lean roofs start at this height on the nave walls
NST = 7                             # steps
RISE = -ZF / NST                    # 1.3 m in all
RUN = 0.65                          # tread depth (wide enough to carry the column bases)
RUN_T = NST * RUN                   # flight projection, 4.55 m
DROP = ZH - ZT                      # lean roof fall
D_LONG = LY - NYH                   # aisle depth on the long sides (11.5 m)
D_END = LX - NXH                    # aisle depth at the short ends (5.5 m)

# ---------------------------------------------------------------- base and steps
ZFOOT = -2.0                        # foundation runs 0.7 m below the Forum pavement (z -1.3): no gap if the pavement is lower
box(F, 0, 0, ZFOOT, 2 * (HX + RUN_T), 2 * (HY + RUN_T), ZF - ZFOOT, 'stone')   # buried foundation under the whole stair ring
box(F, 0, 0, ZF, 2 * HX, 2 * HY, -ZF, 'stone')          # solid base from the Forum level up to the floor
stairs(F, 0.0, -HY - RUN_T, ZF, 2 * (HX + RUN_T), NST, rise=RISE, run=RUN, rot=90.0, mat='marble', cheeks=False)   # Forum side
stairs(F, HX + RUN_T, 0.0, ZF, 2 * HY, NST, rise=RISE, run=RUN, rot=180.0, mat='marble', cheeks=False)            # east side
stairs(F, -HX - RUN_T, 0.0, ZF, 2 * HY, NST, rise=RISE, run=RUN, rot=0.0, mat='marble', cheeks=False)             # west side
stairs(F, 0.0, HY + RUN_T, ZF, 2 * (HX + RUN_T), NST, rise=RISE, run=RUN, rot=-90.0, mat='marble', cheeks=False)  # back: no bare plinth on the street side

# ---------------------------------------------------------------- outer arcade, two storeys
# Wall lines run counter-clockwise with the outside on the right of p0 -> p1.
FL = -(HY - TA / 2)                 # Forum-side wall centre line (y = -23)
BK = HY - TA / 2                    # back wall centre line (y = +23)
WE = -(HX - TA / 2)                 # west wall centre line (x = -49)
EA = HX - TA / 2                    # east wall centre line (x = +49)
for z0 in (0.0, H1):
    arcade(F, -LX, FL, LX, FL, z0, H1, TA, 18, mat='marble', impost_mat='travertine')      # Forum side (-Y)
    arcade(F, EA, -HY, EA, HY, z0, H1, TA, 8, mat='marble', impost_mat='travertine')       # east end
    arcade(F, WE, HY, WE, -HY, z0, H1, TA, 8, mat='marble', impost_mat='travertine')       # west end
arcade(F, LX, BK, -LX, BK, H1, H1, TA, 18, mat='marble', impost_mat='travertine')          # back, upper storey only

# back (+Y): the ground storey is a row of shops on a solid wall
box(F, 0, BK, 0, 2 * LX, TA, H1, 'plaster2')
taberna_front(F, LX, HY, -LX, HY, 0.0, 18, h=5.0, mat='plaster2', depth=0.6)   # shop front sits on the top back tread (y 24.5..25.15)

# engaged Tuscan half-columns on the piers, centred on the outer face
def tuscan(x, y, z0):
    column(F, x, y, z0, H1, 0.5, mat='marble', order='tuscan', seg=8)

BAY_L, BAY_S = 2 * LX / 18, 2 * HY / 8
for z0 in (0.0, H1):
    for k in range(1, 18):
        x = -LX + k * BAY_L
        tuscan(x, -HY, z0)                  # Forum side
        if z0 > 0:
            tuscan(x, HY, z0)               # back: upper storey only (shops below)
    for k in range(1, 8):
        y = -HY + k * BAY_S
        tuscan(HX, y, z0)
        tuscan(-HX, y, z0)

# cornice between the storeys, shop fascia on the back
cornice(F, -HX, -HY, HX, -HY, H1, 0.5, 0.6, 'travertine')
cornice(F, HX, HY, -HX, HY, H1, 0.5, 0.6, 'travertine')
cornice(F, HX, -HY, HX, HY, H1, 0.5, 0.6, 'travertine')
cornice(F, -HX, HY, -HX, -HY, H1, 0.5, 0.6, 'travertine')
cornice(F, HX, HY, -HX, HY, 5.0, 0.4, 0.5, 'travertine')

# ---------------------------------------------------------------- nave, aisle roofs, gable
box(F, 0, 0, 0, 2 * NXH, 2 * NYH, ZN, 'plaster')        # nave walls (solid core, roofed over)
WIN = [(3.0 + 6.0 * k, 21.6, 1.9, 2.2, 'arch') for k in range(14)]                     # clerestory, long walls
EWIN = [(4.0, 21.6, 1.9, 2.2, 'arch'), (10.0, 21.6, 1.9, 2.2, 'arch'), (16.0, 21.6, 1.9, 2.2, 'arch')]
opening_skin(F, -NXH, -NYH, NXH, -NYH, 0.0, ZN, WIN, 'plaster', depth=0.35)   # south wall (outside = -Y)
opening_skin(F, NXH, NYH, -NXH, NYH, 0.0, ZN, WIN, 'plaster', depth=0.35)     # north wall
opening_skin(F, NXH, -NYH, NXH, NYH, 0.0, ZN, EWIN, 'plaster', depth=0.35)    # east end wall
opening_skin(F, -NXH, NYH, -NXH, -NYH, 0.0, ZN, EWIN, 'plaster', depth=0.35)  # west end wall
gable_roof(F, 0, 0, ZN, 2 * NXH, 2 * NYH - 1.0, pitch=28.0, axis='x', overhang=0.5, mat='tile',
           tiles=True, gable_mat='plaster')
lean_roof(F, -LX, -NYH, LX, -NYH, ZH, D_LONG, DROP, mat='tile')    # aisles, Forum side
lean_roof(F, LX, NYH, -LX, NYH, ZH, D_LONG, DROP, mat='tile')      # aisles, back
lean_roof(F, NXH, -NYH, NXH, NYH, ZH, D_END, DROP, mat='tile')     # east end aisle
lean_roof(F, -NXH, NYH, -NXH, -NYH, ZH, D_END, DROP, mat='tile')   # west end aisle

def closure(pts, mat='plaster'):
    """A double-sided triangle that closes an open roof end or valley (the kit's roofs have no end faces)."""
    add_poly(mat, pts); add_poly(mat, list(reversed(pts)))

for xs in (-1, 1):
    for ys in (-1, 1):
        # gable-like end of each long aisle, rising from the outer arcade top to the roof
        closure([Vector((xs * LX, ys * LY, ZT)), Vector((xs * LX, ys * NYH, ZT)), Vector((xs * LX, ys * NYH, ZH))])
        # valley between the long aisle roof and the end aisle roof
        closure([Vector((xs * NXH, ys * NYH, ZH)), Vector((xs * LX, ys * NYH, ZT)), Vector((xs * LX, ys * NYH, ZH))])

# ---------------------------------------------------------------- balustrade on the outer arcade
def light_rail(x0, y0, x1, y1, z0, h=1.0, t=0.26, mat='marble', bal=1.5, post=4.0):
    """A light balustrade: plinth course, top rail, posts and square balusters (fewer than the kit's)."""
    L = math.hypot(x1 - x0, y1 - y0)
    S = Frame(x0, y0, z0, math.degrees(math.atan2(y1 - y0, x1 - x0)))
    box(S, L / 2, 0, 0, L, t + 0.06, 0.18, mat)
    box(S, L / 2, 0, h - 0.14, L + 0.1, t + 0.12, 0.14, mat)
    npst = max(1, int(round(L / post)))
    for i in range(npst + 1):
        box(S, L * i / npst, 0, 0, 0.36, t + 0.1, h, mat)
    nb = max(1, int(round(L / bal)))
    for i in range(nb):
        box(S, (i + 0.5) * L / nb, 0, 0.18, 0.12, 0.12, h - 0.32, mat)

light_rail(-50.0, -24.2, 50.0, -24.2, ZT)      # Forum side
light_rail(50.0, 24.2, -50.0, 24.2, ZT)        # back
light_rail(50.2, -24.0, 50.2, 24.0, ZT)        # east
light_rail(-50.2, 24.0, -50.2, -24.0, ZT)      # west

# ---------------------------------------------------------------- preview and export
human(F, 0.0, -33.0, ZF)                       # 1.8 m scale figure on the Forum, previews only
preview_ground(ZF)
try:                                           # low render samples (memory is tight on this Mac)
    bpy.context.scene.eevee.taa_render_samples = 16
except Exception:
    pass
finish('rome_basilica_julia', front='-Y',
       extra_cams=[('back', Vector((0.0, 1.0, 0.0)), 12), ('back_east', Vector((1.0, 1.0, 0.0)), 14),
                   ('corner', Vector((-1.0, -1.0, 0.0)), 18)])
