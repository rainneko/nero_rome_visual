"""rome_domus_augusti: several older houses pressed together on the Palatine, AD 56. Front = -Y (south).
Lower south half z = -5: a row of houses against the south wall, a service court with a well, a library wing with a
loggia, two more houses and one small garden. Upper north half z = 0: Livia's tablinum wing and Augustus' upper house
stand 0.6 m higher on plinths, each joined to the level below by a short stair; a second storey over the Augustus north
range makes the roofs step. Flanks drop only 1 m (north to z -1, south half to z -6). The south edge steps down in two
buttressed walls with a rock foot to z = -20. Houses face inward: outer walls get 2 small high windows per storey.
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
import bpy

reset()
try:
    bpy.context.scene.eevee.taa_render_samples = 8      # low samples for the previews
except Exception:
    pass
UP, LOW, PAVE = 0.0, -5.0, 0.12     # upper floor z, lower floor z, paving thickness
Z_LOW = LOW + PAVE                  # top of the lower paving
RAISE = 0.6                         # raised houses: Livia's tablinum wing and Augustus' upper house
RZ = RAISE + PAVE                   # top of their paving
GH, FH = 4.0, 3.4                   # ground storey and upper storey heights
PORCH = 3.7                         # porch roof high edge above its floor (colonnade 2.4 + entablature 0.45 + drop 0.8)


def block(cx, cy, w, d, floors=1, z=UP, inner=(), doors=(), skip=(), door_h=GH * 0.82, tiles=True):
    """Plaster block with a red dado and a cornice under a tile hip roof, standing at z. Outer walls get 2 small high
    windows per storey; inner walls (facing a court or the atrium) get 3 larger ones. doors: [(side, u)] arched doors."""
    S = Frame(0, 0, z).sub(cx, cy, 0, 0)
    H = GH + FH * (floors - 1)
    hw, hd = w / 2 - 0.35, d / 2 - 0.35
    sides = {'S': ((-hw, -hd), (hw, -hd)), 'E': ((hw, -hd), (hw, hd)),
             'N': ((hw, hd), (-hw, hd)), 'W': ((-hw, hd), (-hw, -hd))}
    box(S, 0, 0, 0, w - 0.7, d - 0.7, H, 'plaster')
    for key, (p0, p1) in sides.items():
        if key in skip:
            add_poly('plaster', [S.p(p0[0], p0[1], 0), S.p(p1[0], p1[1], 0), S.p(p1[0], p1[1], H), S.p(p0[0], p0[1], H)])
            continue
        L = math.hypot(p1[0] - p0[0], p1[1] - p0[1])
        dv = [L / 2 + u for (k, u) in doors if k == key]          # door centres, measured from p0
        ops = []
        for fl in range(floors):
            z0 = 0.0 if fl == 0 else GH + (fl - 1) * FH
            fh = GH if fl == 0 else FH
            if key in inner:
                fr, ww, hh, zz = ([0.12, 0.88] if dv else [1 / 6, 0.5, 5 / 6]), 1.0, 1.4, z0 + fh * 0.3
            else:
                fr, ww, hh, zz = ([0.12, 0.88] if dv else [0.25, 0.75]), 0.8, 0.9, z0 + fh * 0.55
            ops += [(f * L, zz, ww, hh, 'rect') for f in fr]
        ops += [(du, 0.0, 2.4, door_h, 'arch') for du in dv]
        opening_skin(S, p0[0], p0[1], p1[0], p1[1], 0, H, ops, 'plaster', depth=0.35, inner='dark')
        band(S, p0[0], p0[1], p1[0], p1[1], 0, 0.9, 0.44, 'red')            # red dado
        cornice(S, p0[0], p0[1], p1[0], p1[1], H - 0.5, 0.6, 0.62, 'stone')
    hip_roof(S, 0, 0, H, w, d, 22.0, 0.6, tiles=tiles)


def court_colonnade(x0, y0, x1, y1, z0, n):
    """Stone Doric colonnade, 2.4 m high, with its entablature."""
    colonnade(None, x0, y0, x1, y1, z0, n, 2.4, 0.2, 'stone', 'doric', True, 0.45)


def porch_roof(x0, y0, x1, y1, z0):
    """Lean-to porch roof from a court wall line (court on the right of x0,y0 -> x1,y1) down over the colonnade."""
    lean_roof(None, x0, y0, x1, y1, z0 + PORCH, 3.0, 0.8)


def loggia(x0, y0, x1, z0):
    """Stone Tuscan loggia 2 m in front of a wall on the line y = y0 (columns to the south), with entablature and roof."""
    colonnade(None, x0, y0 - 2.0, x1, y0 - 2.0, z0, 4, 2.4, 0.2, 'stone', 'tuscan', True, 0.45)
    lean_roof(None, x0, y0, x1, y0, z0 + PORCH, 2.0, 0.6, tiles=False)


def ramp_z(y):
    return y * 5.0 / 27.0                     # top of the east ramp: -5 at y = -27, 0 at y = 0


# ---- terrain: the north and the south (lower) half drop only 1 m at the flanks; the south edge steps down
box(None, 0, 14.5, -1, 72, 29, 1, 'tuff')                   # north half: flank drops only to z -1
box(None, 0, -14.5, -6, 72, 29, 1, 'tuff')                  # south half: flank drops only to z -6
box(None, 0, -14.5, LOW, 72, 29, PAVE, 'paving')            # lower terrace floor
box(None, 0, 14.5, UP, 72, 29, PAVE, 'paving')              # upper terrace floor
retaining_wall(None, [(-36.0, 0.0), (4.0, 0.0)], z_top=0.0, z_bot=-5.0, buttress='square', parapet='wall')
retaining_wall(None, [(11.0, 0.0), (30.6, 0.0)], z_top=0.0, z_bot=-5.0, buttress='square', parapet='wall')

# ---- south edge: two steps down (4 m, then 5 m) with round buttresses, a paved and planted ledge, rock at the foot
retaining_wall(None, [(-36.0, -29.0), (36.0, -29.0)], z_top=-5.0, z_bot=-9.0, buttress='round', b_size=1.2,
               every=8.0, parapet='wall')
box(None, 0, -32, -16, 72, 6, 7, 'tuff')                    # ledge body, z -16..-9
box(None, 0, -32, -9, 72, 6, PAVE, 'paving')                # ledge paving at -9
box(None, 0, -31.8, -8.88, 72, 2.0, 0.06, 'grass')          # planted strip
# the wall that faces the slope: pale stone, D bastions (7.5 m across, every 16 m, 0.8 m taller), coping band
retaining_wall(None, [(-36.0, -35.0), (36.0, -35.0)], z_top=-9.0, z_bot=-14.0, t=2.2, mat='stone', buttress=None,
               bastion='d', b_size=7.5, every=16.0, b_rise=0.8, coping=True, parapet='wall')
# ledge rock below it, its top just above the wall foot; rock chunks seated along the foot
rock_top = rock_mass(None, [(-36.0, -44.0), (36.0, -44.0), (36.0, -30.0), (-36.0, -30.0)], -20.0, -13.0,
                     seed=7, band=3.0, boulders=6)
foot_rocks(None, [(-36.0, -35.0), (36.0, -35.0)], (-14.0, -13.0), seed=3, blocks=10, top_z=rock_top)
preview_ground(-20.0)

# ---- stair through the terrace wall (lower court up to the upper forecourt) and the east ramp
stair_flight(None, 7.5, -9.0, 7.5, 3.0, LOW, UP, width=2.4, mat='stone', cheek_mat='tuff')
X0, X1 = 32.0, 36.0
RAMP = [(X0, -27.0, -6.0), (X1, -27.0, -6.0), (X1, 0.0, -1.0), (X0, 0.0, -1.0),
        (X0, -27.0, -5.0), (X1, -27.0, -5.0), (X1, 0.0, 0.0), (X0, 0.0, 0.0)]
add_mesh('stone', RAMP, [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])
# covered ramp: a stone Tuscan portico on both edges, with architrave, frieze and cornice, and a stepped roof
ys = [-25.5 + 3.0 * i for i in range(9)]
for x in (32.3, 35.7):
    for y in ys:
        column(None, x, y, ramp_z(y), 2.6, 0.2, 'stone', 'tuscan', 0, 8)
    for (dz, bw, bh) in ((2.6, 0.5, 0.35), (2.95, 0.5, 0.3), (3.25, 0.7, 0.2)):
        beam(None, x, ys[0], ramp_z(ys[0]) + dz, x, ys[-1], ramp_z(ys[-1]) + dz, bw, bh, 'stone')
for k in range(9):
    ya, yb = -27.0 + 3.0 * k, -24.0 + 3.0 * k
    lean_roof(None, 31.6, ya, 31.6, yb, ramp_z((ya + yb) / 2) + 3.8, 4.5, 0.5, tiles=False)

# ---- House of Livia, front part (level 0): entrance range, atrium with compluvium and impluvium, side rooms
block(-22, 2, 26, 4, inner=('N',), doors=[('S', 0.0)])                  # entrance range
block(-31, 11, 8, 14, inner=('E',), skip=('S', 'N'))                    # west rooms round the atrium
block(-13, 11, 8, 14, inner=('W',), skip=('S', 'N'))                    # east rooms round the atrium
lean_roof(None, -27, 14, -17, 14, 3.6, 3.0, 1.0)            # atrium roof sloping in to a 4 x 4 m compluvium
lean_roof(None, -17, 14, -17, 4, 3.6, 3.0, 1.0)
lean_roof(None, -17, 4, -27, 4, 3.6, 3.0, 1.0)
lean_roof(None, -27, 4, -27, 14, 3.6, 3.0, 1.0)
box(None, -23.55, 9, PAVE, 0.5, 2.6, 0.25, 'marble')        # impluvium rim
box(None, -20.45, 9, PAVE, 0.5, 2.6, 0.25, 'marble')
box(None, -22, 10.55, PAVE, 3.6, 0.5, 0.25, 'marble')
box(None, -22, 7.45, PAVE, 3.6, 0.5, 0.25, 'marble')
box(None, -22, 9, PAVE, 2.6, 2.6, 0.1, 'water')

# ---- House of Livia, back wing raised 0.6 m: tablinum (two storeys) and garden court 12 x 10 with Doric columns
box(None, -22, 21, UP, 26, 14, RAISE, 'stone')              # plinth of the raised wing
stair_flight(None, -22, 12.8, -22, 14.0, UP, RAISE, width=2.4, mat='stone', cheek_mat='tuff')   # tablinum steps
block(-22, 16, 12, 4, floors=2, z=RAISE, inner=('S', 'N'), doors=[('S', 0.0)], skip=('E', 'W'), door_h=2.6)
block(-31.5, 23, 7, 10, z=RAISE, inner=('E',), skip=('S',))
block(-12.5, 23, 7, 10, z=RAISE, inner=('W',), skip=('S',))
wall(None, -28, 27.6, -16, 27.6, RAISE, 3.6, 0.8, 'plaster')
box(None, -22, 23, RAISE, 12, 10, PAVE, 'paving')          # garden court floor
court_colonnade(-26.5, 19.5, -17.5, 19.5, RZ, 4)
court_colonnade(-26.5, 26.5, -17.5, 26.5, RZ, 4)
box(None, -22, 23, RZ, 6, 4, 0.1, 'grass')

# ---- House of Augustus, upper house raised 0.6 m: peristyle 24 x 18; a stair from the forecourt; rooms over the north
box(None, 13, 17, UP, 30, 24, RAISE, 'stone')               # plinth of the raised house
stair_flight(None, 18, 3.8, 18, 5.0, UP, RAISE, width=2.4, mat='stone', cheek_mat='tuff')      # entrance steps
block(3.5, 27.5, 11, 3, z=RAISE, inner=('S',), skip=('E',))              # north range, one storey
block(18.5, 27.5, 19, 3, floors=2, z=RAISE, inner=('S',), skip=('W',))   # north range, rooms over it
block(13, 6.5, 30, 3, z=RAISE, inner=('N',), doors=[('S', 5.0)])        # south range, door on the steps
block(-0.5, 17, 3, 18, z=RAISE, inner=('E',), skip=('S', 'N'))          # west range
block(26.5, 17, 3, 18, z=RAISE, inner=('W',), skip=('S', 'N'))          # east range
box(None, 13, 17, RAISE, 24, 18, PAVE, 'paving')            # peristyle court floor
court_colonnade(4, 11, 22, 11, RZ, 7)
court_colonnade(22, 23, 4, 23, RZ, 7)
court_colonnade(4, 23, 4, 11, RZ, 5)
court_colonnade(22, 11, 22, 23, RZ, 5)
porch_roof(25, 8, 1, 8, RZ)
porch_roof(1, 26, 25, 26, RZ)
porch_roof(1, 8, 1, 26, RZ)
porch_roof(25, 26, 25, 8, RZ)
box(None, 13, 17, RZ, 8, 8, 0.1, 'grass')

# ---- House of Augustus, lower peristyle 26 x 20 (z = -5), linked to the upper house by the stair
block(15, -25.7, 32, 2, floors=2, inner=('N',), z=LOW)                 # south range, the only two-storey range
block(15, -3.7, 32, 2, inner=('S',), doors=[('N', 7.5)], z=LOW)        # north range, door on the stair
block(0.5, -14.7, 3, 20, inner=('E',), skip=('S', 'N'), z=LOW)         # west range
block(28.5, -14.7, 3, 20, inner=('W',), skip=('S', 'N'), z=LOW)        # east range
court_colonnade(5, -21.7, 25, -21.7, Z_LOW, 5)
court_colonnade(5, -7.7, 25, -7.7, Z_LOW, 5)                # the stair passes between the first two columns
court_colonnade(5, -7.7, 5, -21.7, Z_LOW, 5)
court_colonnade(25, -21.7, 25, -7.7, Z_LOW, 5)
porch_roof(28, -24.7, 2, -24.7, Z_LOW)
porch_roof(2, -24.7, 2, -4.7, Z_LOW)
porch_roof(28, -4.7, 28, -24.7, Z_LOW)
box(None, 15, -14.7, Z_LOW, 8, 8, 0.1, 'grass')

# ---- the lower west terrace, built up: a row of houses against the south wall, a service court with a well,
# a library wing with a loggia, two more houses, and one small garden
for cx, w, fl, sk in ((-31.5, 7, 1, ('S', 'E')), (-24.5, 7, 2, ('S', 'W', 'E')), (-17.5, 7, 1, ('S', 'W', 'E')),
                      (-10.5, 7, 2, ('S', 'W', 'E')), (-4.75, 4.5, 1, ('S', 'W'))):
    block(cx, -24.5, w, 4, floors=fl, z=LOW, inner=('N',), skip=sk, tiles=False)           # row against the south wall
block(-32.5, -16.75, 5, 11.5, z=LOW, inner=('E', 'N'), skip=('S',), tiles=False)            # service range, west
block(-14, -16, 10, 6, floors=2, z=LOW, inner=('S',), skip=('N',), tiles=False)             # library, two storeys
loggia(-18, -19, -10, Z_LOW)                                                                 # its Tuscan loggia
block(-16.5, -7.5, 11, 5, floors=2, z=LOW, inner=('S',), skip=('N',), tiles=False)          # house by the garden
block(-7.5, -7.5, 6, 5, z=LOW, inner=('W',), skip=('N',), tiles=False)                       # small house
flower_bed(None, -31, -7, Z_LOW, 8, 6)                                                       # the one small garden
cyl(None, -25.5, -16.5, Z_LOW, 0.7, 0.9, 'stone', 12)                                        # service court well
cyl(None, -25.5, -16.5, Z_LOW + 0.9, 0.5, 0.03, 'dark', 12)                                  # well mouth

# ---- the preview figure
human(None, 14.0, 3.5, UP)                                  # preview only
finish('rome_domus_augusti', front='-Y')
