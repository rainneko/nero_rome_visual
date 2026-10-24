"""rome_transitoria · Nero's east palace (Domus Transitoria), AD 56. Asset front = +X (east, toward the Velia).

Palace envelope 112 x 92 m, two storeys, central court with a sunken nymphaeum (fountain wall on the west side,
pool at its foot, dining pavilion on the east half), two-storey open arcaded east portico 6 m deep, a 32 m tower
with an open top loggia on the east side, and two stepped terraces on all four sides (hill base down to z -14).
"""
import os, sys, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                     # noqa: F401,F403  (box, wall, column, statue, rect_building, ...)
import bpy
import bl_kit as _bk
from mathutils import Vector

reset()
F = Frame()                          # origin = centre of the palace footprint, z = 0 = ground floor

W, D = 112.0, 92.0                   # palace envelope: x -56..56, y -46..46
FLOOR_H = 5.0
GH = FLOOR_H * 1.1                   # ground storey 5.5 m
H = GH + FLOOR_H                     # eave height 10.5 m
CW, CD = 64.0, 48.0                  # central court: x -32..32, y -24..24
RW = (W - CW) / 2                    # E/W range depth 24
RD = (D - CD) / 2                    # N/S range depth 22
RX = W / 2 - RW / 2                  # E/W range centre x = 44
RY = D / 2 - RD / 2                  # N/S range centre y = 35

# ---------------------------------------------------------------- rooms (the kit's ranges, as court_building builds them)
ROOM = dict(floor_h=FLOOR_H, wall_mat='plaster', base_mat='stone', bay=7.0, roof=None, foundation=0)
# separate wings at different heights: S wing 2 storeys (+ a set-back 3rd storey below), N wing 2, E wing 2, W wing 1
rect_building(F, 0, -RY, W, RD, floors=2, **ROOM)                                              # S range
rect_building(F, 0, RY, W, RD, floors=2, **ROOM)                                               # N range
rect_building(F, RX, 0, RW, CD, floors=2, skip_sides=('S', 'N'), doors=[('E', 0.0)], quoins=False, **ROOM)   # E range
rect_building(F, -RX, 0, RW, CD, floors=1, ground_h=6.6, skip_sides=('S', 'N'), doors=[('W', 0.0)], quoins=False, **ROOM)  # W range
# S wing: top storey set back 6 m from the south face (core y -39..-24.4), open loggia arcade on its south front,
# hip roof at 15.5 (three storeys on the south side)
box(F, 0, -31.7, H, 111.3, 14.6, FLOOR_H, 'plaster')
arcade(F, -55.5, -39.5, 55.5, -39.5, H, FLOOR_H, 2.0, 13, 'marble', back='dark')
hip_roof(F, 0, -31.7, H + FLOOR_H, 111.3, 14.6, 22.0, 0.6)
# S wing roof terrace (on the 2nd storey): paving, parapet on the south edge, pergola over the west part
box(F, 0, -43.0, H, 112.0, 6.0, 0.12, 'paving')
wall(F, -55.5, -45.6, 44.0, -45.6, H + 0.12, 1.0, 0.6, 'plaster')
pergola(F, -48.0, -45.0, -10.0, -41.5, H + 0.12)
# raised entrance block on the N front: 3 storeys above the N wing, hip roof, pedimented porch in front
rect_building(F, 0, 48.0, 14.0, 4.0, floors=3, doors=[('N', 0.0)], **ROOM)
hip_roof(F, 0, 48.0, GH + 2 * FLOOR_H, 14.0, 4.0, 22.0, 0.6)
pediment_front(F, 0.0, 50.5, 0.0, 8.0, 4, 5.0, depth=2.4, order='corinthian', mat='marble', tymp_mat='plaster',
               steps=1, rot=180.0)
# dining rotunda where the S and E wings meet: colonnade drum and a tile dome rising above the roofs
ring_colonnade(F, 50.5, -43.5, H + 0.12, 2.8, 8, 5.0, 0.28, 'marble', 'corinthian', ent=True, ent_h=0.8)
dome(F, 50.5, -43.5, H + 0.12 + 5.0 + 0.8, 3.6, 'tile', 16, 5)
hip_roof(F, 0, RY, H, W, RD, 22.0, 0.6)
hip_roof(F, RX, 0, H, RW, CD, 22.0, 0.6)
hip_roof(F, -RX, 0, 6.6, RW, CD, 22.0, 0.6)

# ---------------------------------------------------------------- court floor: paving, with the sunken garden opening
# court_building's court is one solid slab, which would hide the nymphaeum, so the court floor is four strips.
PX, PY = 10.3, 18.3                  # outer edge of the garden walls (x +-10, y +-18, t 0.6)


def slab(x0, x1, y0, y1, z0, t, mat):
    checker_paving(F, x0, y0, x1, y1, z=z0 + t, tile=2.4)              # marble checks with red/blue bands


slab(-32, 32, PY, 24, 0, 0.15, 'paving')
slab(-32, 32, -24, -PY, 0, 0.15, 'paving')
slab(-32, -PX, -PY, PY, 0, 0.15, 'paving')
slab(PX, 32, -PY, PY, 0, 0.15, 'paving')

# inner peristyle (court_building's colonnades and lean-to roofs), hedges
ch = min(GH * 0.85, 5.2)
m = 3.2
x0, x1, y0, y1 = -CW / 2 + m, CW / 2 - m, -CD / 2 + m, CD / 2 - m
nx = max(2, int((x1 - x0) / 5.0) + 1)
ny = max(2, int((y1 - y0) / 5.0) + 1)
for (a, b, nn) in (((x0, y0), (x1, y0), nx), ((x1, y0), (x1, y1), ny),
                   ((x1, y1), (x0, y1), nx), ((x0, y1), (x0, y0), ny)):
    colonnade(F, a[0], a[1], b[0], b[1], 0.15, nn, ch, ch / 16, 'marble', 'corinthian', seg=8)
for (a, b) in (((-CW / 2, -CD / 2), (CW / 2, -CD / 2)), ((CW / 2, -CD / 2), (CW / 2, CD / 2)),
               ((CW / 2, CD / 2), (-CW / 2, CD / 2)), ((-CW / 2, CD / 2), (-CW / 2, -CD / 2))):
    lean_roof(F, b[0], b[1], a[0], a[1], 6.6 if a[0] == b[0] == -CW / 2 else 0.15 + ch * 1.2 + 1.3, m, 1.1)
for sx in (-1, 1):
    hedge(F, sx * 17.3, -19.3, sx * 17.3, 19.3, 0.15, 0.6, 0.5)
for (bx, by) in ((-22.0, 11.0), (-22.0, -11.0), (22.0, 11.0), (22.0, -11.0)):     # peristyle gardens
    flower_bed(F, bx, by, 0.15, 7.0, 5.0)

# ---------------------------------------------------------------- sunken nymphaeum: garden x +-10, y +-18, floor z -3
PZ, PTOP = -3.0, 0.15
box(F, 0, 0, PZ, 20.0, 36.0, 0.1, 'grass')                          # garden floor: grass, box hedges, flower beds
box(F, -0.8, 0, PZ + 0.1, 6.8, 1.8, 0.03, 'paving')                # path from the pool to the pavilion
flower_bed(F, -1.0, 11.0, PZ + 0.1, 6.0, 4.5)
flower_bed(F, -1.0, -11.0, PZ + 0.1, 6.0, 4.5)
flower_bed(F, 6.5, 9.0, PZ + 0.1, 5.0, 4.0)
flower_bed(F, 6.5, -9.0, PZ + 0.1, 5.0, 4.0)                                    # garden floor
wall(F, -10, 18, 10, 18, PZ, PTOP - PZ, 0.6, 'marble')                         # north wall
wall(F, -10, -18, 10, -18, PZ, PTOP - PZ, 0.6, 'marble')                       # south wall
for (ya, yb) in ((-18, -16.5), (-14.3, 14.3), (16.5, 18)):                    # east wall, two gaps for the stairs
    wall(F, 10, ya, 10, yb, PZ, PTOP - PZ, 0.6, 'marble')
# stairs down into the garden at the SE and NE corners: 18 steps, rise 0.175 (3.15 m), run 0.3
for yc in (-15.4, 15.4):
    stairs(F, 4.6, yc, PZ, 2.2, 18, rise=(PTOP - PZ) / 18, run=0.3, rot=0.0, mat='marble',
           cheeks=True, cheek_mat='stone', cheek_h=0.9)

# fountain wall on the west side: x -11..-9, 36 m long, z -3 to 5 (8 m), two storeys of aediculae on the east face
box(F, -10.0, 0, PZ, 2.0, 36.0, 8.0, 'stone')                                  # core
box(F, -8.7, 0, PZ, 1.4, 36.0, 0.8, 'marble')                                  # basin ledge (x -9.4..-8.0)
box(F, -8.6, 0, 1.4, 1.2, 36.0, 0.3, 'marble')                                 # storey band
box(F, -8.7, 0, 5.0, 1.4, 36.0, 0.4, 'marble')                                 # top cornice
box(F, -6.5, 0, PZ, 3.0, 34.0, 0.35, 'water')                                  # long pool at the foot (surface z -2.65)
box(F, -4.6, 0, PZ, 0.8, 34.4, 0.6, 'marble')                                  # pool rim
for k in range(7):                                                              # water sheets falling down the face
    box(F, -8.9, -13.5 + 4.5 * k, -2.2, 0.08, 0.9, 6.8, 'water')
for i in range(8):                                                              # 8 bays of 4.5 m
    yc = -15.75 + 4.5 * i
    lo, hi = ('porphyry', 'giallo') if i % 2 == 0 else ('giallo', 'porphyry')
    # lower storey: pair of small columns, dark niche, statue on the ledge
    column(F, -8.8, yc - 1.0, -2.2, 3.1, 0.2, lo, 'ionic', 0, 10)
    column(F, -8.8, yc + 1.0, -2.2, 3.1, 0.2, hi, 'ionic', 0, 10)
    box(F, -8.8, yc, 0.9, 0.7, 2.6, 0.35, 'marble')
    box(F, -8.97, yc, -2.2, 0.04, 1.8, 3.1, 'dark')
    statue(F, -8.45, yc, -2.2, 2.0, 'marble', pedestal=0.0)
    # upper storey: smaller columns, niche, statue on the band
    column(F, -8.8, yc - 1.0, 1.7, 2.6, 0.17, hi, 'ionic', 0, 10)
    column(F, -8.8, yc + 1.0, 1.7, 2.6, 0.17, lo, 'ionic', 0, 10)
    box(F, -8.8, yc, 4.3, 0.7, 2.6, 0.3, 'marble')
    box(F, -8.97, yc, 1.7, 0.04, 1.8, 2.6, 'dark')
    pass  # upper niches stay plain dark (statues cut to hold the triangle cap)

# open dining pavilion on the east half of the garden: 6 porphyry columns, gilded capitals, tile roof
PXC, PYC, PRC = 6.0, 0.0, 3.6
for k in range(6):
    a = math.radians(60 * k)
    column(F, PXC + PRC * math.cos(a), PYC + PRC * math.sin(a), -2.9, 4.0, 0.3, 'porphyry', 'corinthian', 0, 12,
           True, 'gold')
for k in range(6):
    a = math.radians(60 * k)
    b = math.radians(60 * (k + 1))
    entablature(F, PXC + PRC * math.cos(a), PYC + PRC * math.sin(a), PXC + PRC * math.cos(b), PYC + PRC * math.sin(b),
                1.1, 0.8, 0.6, 'marble')
cyl(F, PXC, PYC, -2.9, 3.4, 0.12, 'marble', 20)                                 # floor disc
cone_roof(F, PXC, PYC, 1.9, 4.5, 2.2, 'tile', 24, True, 'tile2', 'gold')

# ---------------------------------------------------------------- east portico: two open arcades, 6 m deep, marble
# arcade line at x 59; the outside (east) face is at x 62, the back at x 56 against the palace. 11 bays put an
# arch centred on y = 0, in front of the east door.
arcade(F, 59.0, -46.0, 59.0, 46.0, 0.0, FLOOR_H, 6.0, 11, 'marble')
arcade(F, 59.0, -46.0, 59.0, 46.0, FLOOR_H, FLOOR_H, 6.0, 11, 'marble')
box(F, 59.0, 0, 2 * FLOOR_H, 6.0, 92.0, 0.15, 'paving')                        # roof walk on top of the portico
box(F, 61.6, 0, 2 * FLOOR_H + 0.15, 0.6, 92.0, 0.9, 'plaster')                 # parapet

# ---------------------------------------------------------------- belvedere tower, 32 m, on the east side (highest point)
square_tower(F, 49.5, 0.0, 12.0, 32.0, wall_mat='stone', roof='pyramid', foundation=6.0, top_loggia=True)

# ---------------------------------------------------------------- helpers for the hill base
def gcol(x0, y0, x1, y1, z0, n, h, r, mat, seg=8):
    """Colonnade with gilded capitals: n columns from (x0, y0) to (x1, y1), entablature on top."""
    for i in range(n):
        t = i / (n - 1) if n > 1 else 0.5
        column(F, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, z0, h, r, mat, 'corinthian', 0, seg, True, 'gold')
    entablature(F, x0, y0, x1, y1, z0 + h, h * 0.2, r * 2.6, mat)


def _quad_up(mat, a, b, c, d):
    """Quad a-b-c-d wound so that its normal points up."""
    add_poly(mat, [a, b, c, d] if (b - a).cross(c - a).z >= 0 else [d, c, b, a])


def apron(p0, p1, z_in, z_out, w, seed, step=3.5):
    """Rock apron at the foot of a wall p0 -> p1 (outside = right side): rises from the ground (z_out, w m out)
    to z_in against the wall foot. Craggy: jittered rows. Top surface only; the ground hides the rest."""
    rnd = random.Random(seed)
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    L = math.hypot(dx, dy)
    nx, ny = dy / L, -dx / L
    k = max(2, int(L / step))
    rows = []
    for j in range(k + 1):
        bx, by = p0[0] + dx * j / k, p0[1] + dy * j / k
        row = []
        for off, z in ((0.0, z_in), (w * 0.45, (z_in + z_out) / 2), (w, z_out)):
            o = off + (rnd.uniform(-0.6, 0.6) if 0 < off < w else 0.0)
            zz = z + (rnd.uniform(-0.6, 0.6) if 0 < off < w else 0.0)
            row.append(F.p(bx + nx * o, by + ny * o, zz))
        rows.append(row)
    for j in range(k):
        for i in range(2):
            _quad_up('rock', rows[j][i], rows[j][i + 1], rows[j + 1][i + 1], rows[j + 1][i])


# ---------------------------------------------------------------- hill base: two terraces on all four sides
# Terrace A (top z 0, palace level): x -62..62, y -52..52, walls 5 m high. Terrace B (top z -5): a 6 m ring,
# x -68..68, y -58..58, walls 9 m high down to the ground (z -14), with a rock apron at the foot.
ZB, ZG = -5.0, -14.0
box(F, 0, 0, ZG, 134.4, 114.4, ZB - ZG, 'tuff')                     # fill B, inside walls B (x +-67.2, y +-57.2)
box(F, 0, -34.75, ZB, 122.4, 32.9, -ZB, 'tuff')                     # fill A south (y -51.2..-18.3), z -5..0
box(F, 0, 34.75, ZB, 122.4, 32.9, -ZB, 'tuff')                      # fill A north (y 18.3..51.2)
box(F, -35.75, 0, ZB, 50.9, 36.6, -ZB, 'tuff')                      # fill A west (x -61.2..-10.3)
box(F, 35.75, 0, ZB, 50.9, 36.6, -ZB, 'tuff')                       # fill A east (x 10.3..61.2)
box(F, 0, 0, ZB, 20.6, 36.6, 2.0, 'tuff')                           # under the sunken garden (floor z -3)
retaining_wall(F, [(62.0, -52.0), (62.0, 52.0)], 0.0, z_bot=ZB, t=2.2, mat='tuff', buttress='square', every=9.0,
               parapet=None, course_mat='grey', coping_mat='grey')                 # terrace A east (under the portico)
retaining_wall(F, [(62.0, 52.0), (-62.0, 52.0)], 0.0, z_bot=ZB, t=2.2, mat='tuff', buttress='square', every=9.0,
               parapet=None, course_mat='grey', coping_mat='grey')                 # terrace A north
retaining_wall(F, [(-62.0, 52.0), (-62.0, -52.0)], 0.0, z_bot=ZB, t=2.2, mat='tuff', buttress='square', every=9.0,
               parapet=None, course_mat='grey', coping_mat='grey')                 # terrace A west
retaining_wall(F, [(-62.0, -52.0), (62.0, -52.0)], 0.0, z_bot=ZB, t=2.2, mat='tuff', buttress='square', every=9.0,
               parapet='wall', course_mat='grey', coping_mat='grey')               # terrace A south
retaining_wall(F, [(68.0, -58.0), (68.0, 58.0)], ZB, z_bot=ZG, t=2.2, mat='tuff', bastion='d', every=20.0, b_size=7.5, b_rise=0.8, coping=True,
               parapet=None, course_mat='grey', coping_mat='grey')                 # terrace B east
retaining_wall(F, [(68.0, 58.0), (-68.0, 58.0)], ZB, z_bot=ZG, t=2.2, mat='tuff', bastion='d', every=20.0, b_size=7.5, b_rise=0.8, coping=True,
               parapet='wall', course_mat='grey', coping_mat='grey')               # terrace B north
retaining_wall(F, [(-68.0, 58.0), (-68.0, -58.0)], ZB, z_bot=ZG, t=2.2, mat='tuff', bastion='d', every=20.0, b_size=7.5, b_rise=0.8, coping=True,
               parapet='wall', course_mat='grey', coping_mat='grey')               # terrace B west
retaining_wall(F, [(-68.0, -58.0), (68.0, -58.0)], ZB, z_bot=ZG, t=2.2, mat='tuff', bastion='d', every=20.0, b_size=7.5, b_rise=0.8, coping=True,
               parapet=None, course_mat='grey', coping_mat='grey')                 # terrace B south
# paving of the terrace tops (A at z 0, B at z -5)
checker_paving(F, -62.0, -52.0, -56.0, 52.0, z=0.12, tile=2.4)                   # A west strip
checker_paving(F, 56.0, -52.0, 62.0, 52.0, z=0.12, tile=2.4)                    # A east strip under the portico
checker_paving(F, -56.0, -52.0, 56.0, -46.0, z=0.12, tile=2.4)                   # A south strip (colonnade)
checker_paving(F, -56.0, 46.0, 56.0, 52.0, z=0.12, tile=2.4)                    # A north strip
checker_paving(F, 62.0, -58.0, 68.0, 58.0, z=ZB + 0.12, tile=2.4)                     # B east strip
checker_paving(F, -68.0, -58.0, -62.0, 58.0, z=ZB + 0.12, tile=2.4)                    # B west strip
checker_paving(F, -62.0, -58.0, 62.0, -52.0, z=ZB + 0.12, tile=2.4)                    # B south strip
checker_paving(F, -62.0, 52.0, 62.0, 58.0, z=ZB + 0.12, tile=2.4)                     # B north strip

# colonnades on the terraces: lower ones stack under the palace-level ones (giallo / porphyry / marble shafts)
gcol(65.0, -52.0, 65.0, 52.0, ZB, 13, 4.0, 0.28, 'giallo')                  # terrace B east, under the portico
gcol(-6.0, -55.0, -62.0, -55.0, ZB, 10, 4.0, 0.28, 'porphyry')              # terrace B south, west run
gcol(6.0, -55.0, 62.0, -55.0, ZB, 10, 4.0, 0.28, 'porphyry')                # terrace B south, east run
gcol(-52.0, -49.0, 52.0, -49.0, 0.0, 12, 4.6, 0.3, 'marble')                # terrace A south, under the palace

# statue rows on pedestals along the terrace edges
for yy in (-40.0, -20.0, 0.0, 20.0, 40.0):
    statue(F, -59.0, yy, 0.12, 2.0, 'marble', pedestal=1.0, ped_mat='marble')
for xx in (-24.0, 24.0):
    statue(F, xx, 49.0, 0.12, 2.0, 'marble', pedestal=1.0, ped_mat='marble')
for yy in (-36.0, 0.0, 36.0):
    statue(F, -65.0, yy, ZB + 0.12, 2.0, 'marble', pedestal=1.0, ped_mat='marble')
for xx in (-36.0, 0.0, 36.0):
    statue(F, xx, 55.0, ZB + 0.12, 2.0, 'marble', pedestal=1.0, ped_mat='marble')

# round basin with a statue group, raised on the south terrace B (between the two colonnade runs)
FY = -55.0
lathe(F, 0.0, FY, [(3.1, ZB + 0.12), (3.1, ZB + 0.72), (2.55, ZB + 0.72), (2.55, ZB + 0.3)], 'marble', 24,
      smooth=False)
cyl(F, 0.0, FY, ZB + 0.12, 2.55, 0.18, 'water', 24)
statue(F, 0.0, FY, ZB + 0.12, 2.6, 'marble', pedestal=0.9, ped_mat='marble')
for ang in (0, 180):
    a = math.radians(ang)
    statue(F, 2.8 * math.cos(a), FY + 2.8 * math.sin(a), ZB + 0.72, 1.2, 'marble', pedestal=0.0)

# rock at the foot of the lower walls, on the ground
top_e = rock_mass(F, [(62.0, -62.0), (78.0, -62.0), (78.0, 62.0), (62.0, 62.0)], -17.0, -10.5, seed=21,
                  strata=3, step=5.5, boulders=2, grid=6.0, ground=-14.0)                   # ledge band under the east wall
foot_rocks(F, [(68.0, -58.0), (68.0, 58.0)], (-14.6, -14.0), width=4.0, seed=11, blocks=4, top_z=top_e)     # east foot
foot_rocks(F, [(68.0, 58.0), (-68.0, 58.0)], (-14.6, -14.0), width=4.0, seed=12, blocks=6)     # north foot
foot_rocks(F, [(-68.0, 58.0), (-68.0, -58.0)], (-14.6, -14.0), width=4.0, seed=13, blocks=6)   # west foot
top_s = rock_mass(F, [(-66.0, -70.0), (63.0, -70.0), (63.0, -56.0), (-66.0, -56.0)], -17.0, -10.5, seed=22,
                  strata=3, step=5.5, boulders=2, grid=6.0, ground=-14.0)                   # ledge band under the south wall
foot_rocks(F, [(-68.0, -58.0), (68.0, -58.0)], (-14.6, -14.0), width=4.0, seed=14, blocks=4, top_z=top_s)   # south foot
preview_ground(ZG)

# low-sample previews (memory is tight on the worker Mac): EEVEE samples 8 instead of the kit default
_orig_preview = _bk._preview_scene


def _low_samples_preview(ob, front):
    out = _orig_preview(ob, front)
    bpy.context.scene.eevee.taa_render_samples = 8
    return out


_bk._preview_scene = _low_samples_preview

finish('rome_transitoria', front='+X', extra_cams=[('court', Vector((0.6, -0.8, 0.0)), 52),
                                                    ('south', Vector((-0.3, -1.0, 0.0)), 14)])
