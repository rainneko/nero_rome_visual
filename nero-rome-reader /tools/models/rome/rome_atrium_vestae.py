"""House of the Vestals before AD 64 (rome_atrium_vestae): the older two-storey house round a long colonnaded court.
Origin = centre of the footprint; z = 0 = court paving and ground floor; front = -X (entrance porch on the west).
  outer skin 64 x 26 m; court 50 x 12 m (x -25..25, y -6..6); N and S ranges full width, E and W ranges between them;
  floors 5 m + 4 m (eaves at 9 m); foundation 1 m below z = 0.
  court: Ionic marble colonnade (3.4 m) on the N, S and W sides with lean roofs; on the E side a shrine facing west;
  three pools on the axis; six statues; low hedges. Entrance porch with two columns on the W range.
Run: /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_atrium_vestae.py"
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                      # noqa: F401,F403  (bl_kit parts and the Rome kit)
import bpy
from mathutils import Vector

GH, FH, H = 5.0, 4.0, 9.0             # ground floor, upper floor, eaves (m)
BAY = 3.4                             # outer window bay (m)
SK = 0.35                             # opening_skin depth: its face stands 0.36 m in front of the line
LX_OUT, LX_IN = 31.64, 25.36          # E/W range lines (outer face x = 32.0, court face x = 25.0)
LY_OUT, LY_IN = 12.64, 6.36           # N/S range lines (outer face y = 13.0, court face y = 6.0)
COL_H, ENT_H, ENT_D = 3.4, 0.68, 0.49 # court colonnade: column height, entablature height and depth
CXC, CYC = 22.2, 4.2                  # colonnade lines (x for the E/W columns, y for the N/S columns)


def range_block(x0, x1, y0, y1, modes, door=None, court_x=None, quoins=()):
    """One range: a solid core whose faces lie on the lines x0..x1, y0..y1, faced by opening skins.
    modes: side -> 'out' (small windows, plinth, cornice) or 'court' (wide openings toward the court);
    a side left out is an internal wall (no skin). door: the side with the entrance arch.
    court_x: only court openings with |x| <= court_x (keeps the N/S ranges clear of the corners)."""
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    hw, hd = (x1 - x0) / 2, (y1 - y0) / 2
    box(None, cx, cy, 0, 2 * hw, 2 * hd, H, 'plaster')
    segs = {'S': ((cx - hw, cy - hd), (cx + hw, cy - hd)), 'E': ((cx + hw, cy - hd), (cx + hw, cy + hd)),
            'N': ((cx + hw, cy + hd), (cx - hw, cy + hd)), 'W': ((cx - hw, cy + hd), (cx - hw, cy - hd))}
    for k, (p0, p1) in segs.items():          # the skin lies on the right of p0 -> p1 (outside of the block)
        mode = modes.get(k)
        if not mode:
            continue
        L = math.hypot(p1[0] - p0[0], p1[1] - p0[1])
        ux, uy = (p1[0] - p0[0]) / L, (p1[1] - p0[1]) / L
        nb = max(1, int(L / BAY)); ops = []
        for b in range(nb):
            u = (b + 0.5) * L / nb
            if mode == 'court':
                if court_x is not None and abs(p0[0] + ux * u) > court_x:
                    continue
                ops.append((u, 0.0, 2.2, 3.6, 'arch'))     # wide doorways toward the court
                ops.append((u, 6.0, 2.0, 2.2, 'rect'))
            else:
                if door == k and abs(u - L / 2) < 1.6:
                    continue
                ops.append((u, 1.5, 1.15, 1.9, 'rect'))    # small windows outside
                ops.append((u, 6.2, 1.15, 1.9, 'rect'))
        if mode == 'out' and door == k:
            ops.append((L / 2, 0.0, 2.4, 4.2, 'arch'))
        opening_skin(None, p0[0], p0[1], p1[0], p1[1], 0.0, H, ops, 'plaster', depth=SK, inner='dark')
        band(None, p0[0], p0[1], p1[0], p1[1], GH - 0.2, 0.3, 0.42, 'red')
        if mode == 'out':
            band(None, p0[0], p0[1], p1[0], p1[1], 0.0, 0.9, 0.44, 'stone')          # plinth
            cornice(None, p0[0], p0[1], p1[0], p1[1], H - 0.5, 0.6, 0.62, 'stone')
    for qx, qy in quoins:
        box(None, qx, qy, 0, 0.9, 0.9, H - 0.4, 'stone')


def pool_block(cx, cy, w, d, rim=0.45, rim_h=0.35):
    """A rectangular pool in the paving: marble rim blocks round water 0.08 m above the paving."""
    box(None, cx, cy, -0.25, w, d, 0.33, 'water')
    box(None, cx, cy + d / 2 + rim / 2, 0, w + 2 * rim, rim, rim_h, 'marble')
    box(None, cx, cy - d / 2 - rim / 2, 0, w + 2 * rim, rim, rim_h, 'marble')
    box(None, cx - w / 2 - rim / 2, cy, 0, rim, d, rim_h, 'marble')
    box(None, cx + w / 2 + rim / 2, cy, 0, rim, d, rim_h, 'marble')


# ---------------------------------------------------------------- the house
reset()
try:
    bpy.context.scene.eevee.taa_render_samples = 16      # low sample count (memory is tight)
except Exception:
    pass
# foundations 1 m below z = 0 (the court paving covers the middle)
box(None, 0, 9.7, -1.0, 64.8, 7.4, 1.0, 'tuff')
box(None, 0, -9.7, -1.0, 64.8, 7.4, 1.0, 'tuff')
box(None, 28.7, 0, -1.0, 7.4, 12.0, 1.0, 'tuff')
box(None, -28.7, 0, -1.0, 7.4, 12.0, 1.0, 'tuff')
# four ranges: N and S full width, E and W between them
range_block(-LX_OUT, LX_OUT, LY_IN, LY_OUT, {'N': 'out', 'E': 'out', 'W': 'out', 'S': 'court'}, court_x=23.0,
            quoins=[(-LX_OUT, LY_OUT), (LX_OUT, LY_OUT)])
range_block(-LX_OUT, LX_OUT, -LY_OUT, -LY_IN, {'S': 'out', 'E': 'out', 'W': 'out', 'N': 'court'}, court_x=23.0,
            quoins=[(-LX_OUT, -LY_OUT), (LX_OUT, -LY_OUT)])
range_block(LX_IN, LX_OUT, -LY_IN, LY_IN, {'E': 'out', 'W': 'court'})
range_block(-LX_OUT, -LX_IN, -LY_IN, LY_IN, {'W': 'out', 'E': 'court'}, door='W')
# tiled hip roofs over the four ranges
hip_roof(None, 0, 9.5, H, 64.0, 7.0)
hip_roof(None, 0, -9.5, H, 64.0, 7.0)
hip_roof(None, 28.5, 0, H, 7.0, 13.44)
hip_roof(None, -28.5, 0, H, 7.0, 13.44)

# ---------------------------------------------------------------- the court: portico, shrine, garden, pools, statues
checker_paving(None, -25.0, -6.0, 25.0, 6.0, z=0.0)                   # marble floor of the court (top z = 0)
# lean roofs over the portico: z 4.9 at the range wall, falling to the colonnade line at z ~4.08 and out
lean_roof(None, -25.36, 6.36, 25.36, 6.36, 4.9, 3.36, 1.28)           # N side
lean_roof(None, 25.36, -6.36, -25.36, -6.36, 4.9, 3.36, 1.28)         # S side
lean_roof(None, -25.36, -6.36, -25.36, 6.36, 4.9, 3.36, 1.28)         # W side
lean_roof(None, 25.36, 6.36, 25.36, 2.6, 4.9, 3.36, 1.28)             # E side, north of the shrine
lean_roof(None, 25.36, -2.6, 25.36, -6.36, 4.9, 3.36, 1.28)           # E side, south of the shrine
# Ionic portico: N and S lines of 12 columns, W middle column, E line with the shrine's front columns
colonnade(None, -CXC, CYC, CXC, CYC, 0.0, 12, COL_H, ent_h=ENT_H, ent_depth=ENT_D)
colonnade(None, -CXC, -CYC, CXC, -CYC, 0.0, 12, COL_H, ent_h=ENT_H, ent_depth=ENT_D)
column(None, -CXC, 0.0, 0.0, COL_H)
entablature(None, -CXC, -CYC, -CXC, CYC, COL_H, ENT_H, ENT_D, 'marble')
entablature(None, CXC, -CYC, CXC, CYC, COL_H, ENT_H, ENT_D, 'marble')
for y in (-1.25, 1.25):
    column(None, CXC, y, 0.0, COL_H)                                  # shrine front
    column(None, CXC + 2.0, y, 0.0, COL_H)                            # shrine back
    entablature(None, CXC, y, CXC + 2.0, y, COL_H, ENT_H, ENT_D, 'marble')
entablature(None, CXC + 2.0, -1.25, CXC + 2.0, 1.25, COL_H, ENT_H, ENT_D, 'marble')
# shrine (aedicula) at the east end, facing west down the court: platform, pediment, cult statue
box(None, 23.3, 0.0, 0.0, 3.4, 3.4, 0.3, 'marble')
gable_roof(None, 23.6, 0.0, COL_H + ENT_H, 3.2, 3.3, pitch=25.0, axis='x', overhang=0.5, gable_mat='plaster')
statue(None, 23.2, 0.0, 0.3, 1.6, 'marble', 0.6, 0.0, 'marble')
# three pools on the axis
for x in (-15.0, 0.0, 15.0):
    pool_block(x, 0.0, 6.0, 2.6)
# six statues of the chief Vestals along the long sides
for x in (-17.0, 0.0, 17.0):
    for y in (-3.4, 3.4):
        statue(None, x, y, 0.0, 2.0, 'marble', 1.1, 0.0, 'marble')
# garden: low box hedges along the long sides, flower beds between the pools
hedge(None, -21.0, 2.4, 21.0, 2.4, 0.0, 0.6, 0.5)
hedge(None, -21.0, -2.4, 21.0, -2.4, 0.0, 0.6, 0.5)
for x in (-7.5, 7.5):
    flower_bed(None, x, 0.0, 0.0, 6.0, 3.6)
# entrance porch on the W range: two columns, pediment, faces -X
box(None, -33.2, 0.0, -1.0, 2.4, 3.6, 1.0, 'tuff')
box(None, -33.2, 0.0, 0.0, 2.4, 3.6, 0.3, 'marble')
for y in (-1.2, 1.2):
    column(None, -33.6, y, 0.3, COL_H)
entablature(None, -33.6, -1.2, -33.6, 1.2, 0.3 + COL_H, ENT_H, ENT_D, 'marble')
gable_roof(None, -32.9, 0.0, 0.3 + COL_H + ENT_H, 2.8, 3.4, pitch=25.0, axis='x', overhang=0.4, gable_mat='plaster')
# the Palatine slope behind (east of) the house: a rock heightfield rising from the ground (z -1.6 at x 50) to z 4.5
# against the back wall (x 32), tapering to the ground at |y| 18; the back of the house steps into it
def palatine_height(x, y):
    base = 4.5 - (x - 32.0) * (6.1 / 18.0)
    g = min(1.0, max(0.0, (18.0 - abs(y)) / 6.0))
    return -1.6 + max(0.0, base + 1.6) * g


X0, DX, Y0, DY = 31.0, 1.25, -18.0, 2.0
NX, NY = 17, 19                                   # grid points: x 31..51, y -18..18
grid = [[(X0 + i * DX, Y0 + j * DY, palatine_height(X0 + i * DX, Y0 + j * DY)) for j in range(NY)] for i in range(NX)]
for i in range(NX - 1):
    for j in range(NY - 1):
        q = [grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]]
        if max(p[2] for p in q) > -1.4:           # only the cells that show above the ground
            add_poly('rock', q)

human(None, -39.5, -4.0, 0.0)
preview_ground(-1.05)
finish('rome_atrium_vestae', front='-X', extra_cams=[('court', Vector((-0.3, -1.0, 0.0)), 55)])
