"""rome_apollo · Temple of Apollo Palatinus and its precinct, Rome AD 56 (brief: briefs/rome/apollo.md).

Terrace 94 x 94 m on the south edge of the Palatine, z = 0 at the terrace floor. The temple faces south (-Y) on a
podium with a front stair and a gilded Sun quadriga on the pediment. The Danaid portico (giallo Ionic) runs along the
south, east and west sides, with a viewing exedra in the middle of the south side. The altar with four bronze oxen
stands on the axis of a checkered plaza with torch columns and a bronze lattice rail. Two libraries flank the back of
the temple and the propylon closes the east side.
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *

H = 47.0                                    # terrace half-side (terrace 94 x 94 m)
SQ = [(-H, -H), (H, -H), (H, H), (-H, H)]   # counter-clockwise
TEMPLE_Y = 16.0                             # temple centre (y)
ALTAR = (0.0, -20.0)
BACK = 45.0                                # portico back line (centre of its 1.5 m wall)
DEPTH = 7.0                                 # portico depth: back line to column line
COL_H = 6.5                                 # giallo Ionic columns
WALL_H = 9.2                               # solid back wall of the portico
ENT_H = 0.9                                 # portico entablature height
COL_X = [-38.0 + i * 76.0 / 21 for i in range(22)]   # portico column positions, 3.62 m apart


def P(side, u, v):
    """World point of a portico position: u along the row, v = depth from the back wall toward the court."""
    if side == 'S':
        return (u, -BACK + v)
    if side == 'E':
        return (BACK - v, u)
    return (-BACK + v, u)                   # 'W'


def ox(F, x, y, z0, rot):
    """A bronze ox on z0: body 2.2 m long, four legs, neck, head, horns; the head points along local +x."""
    S = F.sub(x, y, z0, rot)
    box(S, 0, 0, 0.9, 2.2, 0.8, 0.9, 'bronze')                          # body
    for lx in (0.7, -0.7):
        for ly in (0.25, -0.25):
            beam(S, lx, ly, 0.92, lx, ly, 0.0, 0.16, 0.16, 'bronze')    # legs
    beam(S, 1.0, 0, 1.6, 1.45, 0, 2.15, 0.45, 0.5, 'bronze')            # neck
    box(S, 1.75, 0, 1.95, 0.75, 0.5, 0.5, 'bronze')                     # head
    box(S, 2.1, 0, 1.8, 0.3, 0.42, 0.4, 'bronze')                       # muzzle
    for sy in (-1, 1):
        beam(S, 1.6, 0.2 * sy, 2.45, 1.75, 0.4 * sy, 2.8, 0.07, 0.07, 'bronze')   # horns
    beam(S, -1.1, 0, 1.65, -1.4, 0, 1.25, 0.08, 0.08, 'bronze')         # tail


def statue_lo(F, x, y, z0, h, mat, pedestal):
    """The kit's statue() with fewer facets (the portico has 56 of them)."""
    S = F.sub(x, y, z0, 0.0)
    if pedestal > 0:
        box(S, 0, 0, 0, h * 0.42, h * 0.42, pedestal * 0.12, 'marble')
        box(S, 0, 0, pedestal * 0.12, h * 0.34, h * 0.34, pedestal * 0.76, 'marble')
        box(S, 0, 0, pedestal * 0.88, h * 0.42, h * 0.42, pedestal * 0.12, 'marble')
    zb = pedestal
    cyl(S, 0, 0, zb, h * 0.17, h * 0.55, mat, 8, r_top=h * 0.11)                 # robe
    cyl(S, 0, 0, zb + h * 0.55, h * 0.11, h * 0.25, mat, 8, r_top=h * 0.13)      # torso
    sphere(S, 0, 0, zb + h * 0.88, h * 0.075, mat, 8, 5)                         # head
    beam(S, 0, h * 0.1, zb + h * 0.74, h * 0.12, h * 0.2, zb + h * 0.98, h * 0.06, h * 0.06, mat)   # arm


def portico(F):
    """Danaid portico on three sides: solid 9.2 m back wall on the terrace edge, giallo Ionic columns on the inner line,
    marble entablature, a lean-to tile roof falling toward the court, one dark basalt statue between every two columns.
    The south back wall is open for 16 m (the exedra); the east back wall is open for 14 m (the propylon)."""
    rows = {'S': [COL_X], 'E': [COL_X[1:9], COL_X[13:]], 'W': [COL_X[1:]]}   # runs of columns per side
    spans = {'S': [(-BACK, -8.0), (8.0, BACK)], 'E': [(7.0, BACK), (-BACK, -7.0)], 'W': [(-BACK, BACK)]}
    for side, segs in spans.items():
        for u0, u1 in segs:
            (x0, y0), (x1, y1) = P(side, u0, 0.0), P(side, u1, 0.0)
            wall(F, x0, y0, x1, y1, 0.0, WALL_H, 1.5, 'plaster')
    # lean-to roofs: high edge on the back wall, falling 1.8 m over 7.6 m toward the court (right of p0 -> p1)
    for side, u0, u1 in (('S', BACK, -BACK), ('E', BACK, 7.0), ('E', -7.0, -BACK), ('W', -BACK, BACK)):
        (x0, y0), (x1, y1) = P(side, u0, 0.0), P(side, u1, 0.0)
        lean_roof(F, x0, y0, x1, y1, WALL_H, 7.6, 1.8)
    for side, runs in rows.items():
        for run in runs:
            for u in run:
                x, y = P(side, u, DEPTH)
                column(F, x, y, 0.0, COL_H, None, 'giallo', 'ionic', 0, 8)
            (xa, ya), (xb, yb) = P(side, run[0], DEPTH), P(side, run[-1], DEPTH)
            entablature(F, xa, ya, xb, yb, COL_H, ENT_H, 0.9, 'marble')
            for a, b in zip(run, run[1:]):
                x, y = P(side, (a + b) / 2, DEPTH - 0.9)                 # statue between two columns, toward the wall
                statue_lo(F, x, y, 0.0, 1.9, 'basalt', 0.6)              # the Danaids were black


def exedra(F):
    """Viewing exedra in the middle of the south side: a half-round bay of radius 8 m projecting over the slope.
    Paved floor (z 0) on a 0.6 m slab carried by a ring of piers down to z -6, with open bays between the piers
    so the lower colonnade shows through. Balustrade on the rim."""
    R = 8.0; RI = 7.0; cy = -BACK; N = 17
    ang = [math.pi + math.pi * i / N for i in range(N + 1)]
    arc = [(R * math.cos(a), cy + R * math.sin(a)) for a in ang]
    prism(F, arc, -0.6, -0.02, 'tuff')                       # floor slab, carried by the piers below
    for i in range(0, N, 2):                                 # piers on every other segment, open bays between them
        p = [(R * math.cos(ang[i]), cy + R * math.sin(ang[i])), (R * math.cos(ang[i + 1]), cy + R * math.sin(ang[i + 1])),
             (RI * math.cos(ang[i + 1]), cy + RI * math.sin(ang[i + 1])), (RI * math.cos(ang[i]), cy + RI * math.sin(ang[i]))]
        prism(F, p, -6.0, -0.6, 'tuff')
    add_poly('paving', [F.p(x, y, 0.0) for x, y in arc])
    for (x0, y0), (x1, y1) in zip(arc, arc[1:]):
        balustrade(F, x0, y0, x1, y1, 0.0, 1.05, 'marble', 2.2, 0.28)


def propylon(F):
    """Propylon on the east at (42, 0) facing +X: 14 m wide, 9 m deep, four Ionic columns in front and four behind,
    entablature, pediments front and back, tile roof, a 3.5 m passage through the middle."""
    S = F.sub(42.0, 0.0, 0.0, ROT['+X'])
    base = 0.3
    box(S, 0, 0, 0, 14.0, 9.0, base, 'marble')
    xs = (-5.25, -1.75, 1.75, 5.25)
    for y in (-4.0, 4.0):
        for x in xs:
            column(S, x, y, base, COL_H, None, 'giallo', 'ionic', 0, 8)
        entablature(S, xs[0], y, xs[-1], y, base + COL_H, ENT_H, 0.9, 'marble')
    for x in (xs[0], xs[-1]):
        entablature(S, x, -4.0, x, 4.0, base + COL_H, ENT_H, 0.9, 'marble')
    gable_roof(S, 0, 0, base + COL_H + ENT_H, 14.0, 9.0, pitch=15.0, axis='y', overhang=0.5,
               gable_mat='marble', pediment=True, tymp_mat='plaster')

def lower_colonnade(F):
    """Layering on the lower terrace (z -6): a 30 m Ionic colonnade, one storey, its lean tile roof against the upper
    south wall. It stands in the middle under the exedra; the exedra's piers and open bays let it show through."""
    YC, ZC = -50.0, -6.0
    xs = [-15.0 + i * 3.75 for i in range(9)]
    for x in xs:
        column(F, x, YC, ZC, 3.2, None, 'giallo', 'ionic', 0, 8)
    entablature(F, xs[0], YC, xs[-1], YC, ZC + 3.2, 0.6, 0.7, 'marble')
    lean_roof(F, xs[0], -46.5, xs[-1], -46.5, -1.2, 4.3, 1.0)


def lower_statues(F):
    """A row of marble statues on pedestals every 6 m, inboard of the lower balustrade, standing on its coping."""
    for x in range(-42, 43, 6):
        if x:
            statue(F, float(x), -53.4, -5.65, 1.9, 'marble', pedestal=0.8, ped_mat='marble')


# ---- main build: upper terrace wall 0 -> -6, lower terrace wall -6 -> -12 rising out of rock, exedra on the upper level
reset()
F = Frame()

ZM = -6.0                                   # lower terrace level: foot of the upper south wall
LOW = -H - 8.0                              # south line of the lower terrace wall (y = -55)
YU = -H + 0.66                              # balustrade on the upper south wall, inside its top (batter 0.36 + 0.3)
YL = LOW + 0.66                             # balustrade on the lower south wall, same offset
BUT = dict(buttress='round', every=10.0, b_size=2.2, parapet=None)

# upper terrace (floor z 0): south wall 0 -> -6 standing on the lower terrace; east, north, west walls 0 -> -12
retaining_wall(F, [(-H, -H), (H, -H)], 0.0, z_bot=ZM, **BUT)
retaining_wall(F, [(H, -H), (H, H)], 0.0, z_bot=-12.0, **BUT)
retaining_wall(F, [(H, H), (-H, H)], 0.0, z_bot=-3.0, **BUT)
retaining_wall(F, [(-H, H), (-H, -H)], 0.0, z_bot=-12.0, **BUT)
terrace_floor(F, SQ, 0.0, 'paving')

# lower terrace (floor z -6): a strip of paving, a 6 m south wall rising out of rock, short returns at the corners
terrace_floor(F, [(-H, LOW), (H, LOW), (H, -H), (-H, -H)], ZM, 'paving')
# the lower walls stand on rock: D bastions (7 m across, 0.8 m proud, own coping), pale 'stone' ashlar
BAST = dict(parapet=None, bastion='d', b_size=7.0, b_rise=0.8, coping=True)
retaining_wall(F, [(-H, LOW), (H, LOW)], ZM, z_bot=-12.0, mat='stone', every=16.0, **BAST)
retaining_wall(F, [(H, LOW), (H, -H)], ZM, z_bot=-12.0, mat='stone', every=8.0, **BAST)
retaining_wall(F, [(-H, -H), (-H, LOW)], ZM, z_bot=-12.0, mat='stone', every=8.0, **BAST)
# ledge rock under the lower walls: footprint reaches under the lower terrace; top kept above the wall foot (-12)
rock_top = rock_mass(F, [(-62.0, -66.0), (62.0, -66.0), (62.0, -42.0), (-62.0, -42.0)], -20.0, -9.0,
                     seed=3, step=2.5, jitter=2.0, strata=5, dip=3.0)
# chunks of rock juts out in front of the walls' feet, each seated on the ledge at its own height
foot_rocks(F, [(-H, LOW), (H, LOW)], (-11.5, -9.0), seed=4, blocks=18, top_z=rock_top)
foot_rocks(F, [(H, LOW), (H, -H)], (-11.5, -9.0), seed=6, blocks=4, top_z=rock_top)
foot_rocks(F, [(-H, -H), (-H, LOW)], (-11.5, -9.0), seed=7, blocks=4, top_z=rock_top)

# balustrades: upper south wall (not across the exedra mouth), lower south wall and its returns
balustrade(F, -46.34, YU, -8.0, YU, 0.35, 1.05, 'marble', 2.2, 0.28)
balustrade(F, 8.0, YU, 46.34, YU, 0.35, 1.05, 'marble', 2.2, 0.28)
balustrade(F, -46.34, YL, 46.34, YL, ZM + 0.35, 1.05, 'marble', 2.2, 0.28)
balustrade(F, 46.34, YL, 46.34, -H, ZM + 0.35, 1.05, 'marble', 2.2, 0.28)
balustrade(F, -46.34, -H, -46.34, YL, ZM + 0.35, 1.05, 'marble', 2.2, 0.28)

exedra(F)
portico(F)
lower_colonnade(F)
lower_statues(F)

# temple: podium, front stair, columns; the Sun's quadriga replaces the front acroterion on the apex
TW, TL = 24.0, 40.0
T = podium_temple(F, 0.0, TEMPLE_Y, W=TW, L=TL, pod_h=5.0, col_h=14.0, nf=6, kind='pseudo', porch=3,
                  order='corinthian', front='-Y', stair='front', flutes=12, door_mat='giallo', acroteria=None, seg=10)
rc = 14.0 / 20.0; m = rc * 1.6 + 0.35; ed = rc * 2.9
Le = (TL - 2 * m) + ed                      # roof length, front pediment to back pediment
We = 2 * (TW / 2 - m) + ed                  # roof width
apex_y = TEMPLE_Y - Le / 2                  # front pediment apex (y)
ridge, eave = T['ridge'], T['eave']
statue(F, 0.0, TEMPLE_Y + Le / 2 + 0.25, ridge - 0.25, 3.0, 'marble', pedestal=0.5, ped_mat='marble')   # back apex
for sd in (-1, 1):
    statue(F, sd * (We / 2 - 0.4), apex_y - 0.25, eave, 2.4, 'marble', pedestal=0.4, ped_mat='marble')
box(F, 0.0, apex_y + 1.7, ridge - 1.0, 3.0, 3.0, 1.0, 'marble')          # plinth on the apex
quadriga(F, 0.0, apex_y + 1.7, ridge - 0.9, s=1.5, mat='gold', front='-Y')

# altar on the axis with four bronze oxen, checkered plaza, torch columns, bronze lattice rail
altar(F, ALTAR[0], ALTAR[1], 0.03, 6.0, 4.0, 2.2, fire=True)
for sx, sy in ((1, 1), (-1, 1), (-1, -1), (1, -1)):
    ox(F, ALTAR[0] + sx * 4.9, ALTAR[1] + sy * 3.3, 0.03, math.degrees(math.atan2(sy, sx)))
checker_paving(F, -32.0, -40.0, 32.0, -8.0, 0.03, tile=1.5)
for x in (-24.0, -16.0, 16.0, 24.0):
    torch_column(F, x, -9.5, 0.03)
    torch_column(F, x, -41.5, 0.0)
lattice_rail(F, -32.0, -40.0, -3.0, -40.0, 0.03, 1.05)
lattice_rail(F, 3.0, -40.0, 32.0, -40.0, 0.03, 1.05)

# two libraries flank the back of the temple, each with a tetrastyle porch facing south into the court
for sx in (-1, 1):
    cx, cy = sx * 26.5, 33.5                    # the north corners of the court, beside the back of the temple
    rect_building(F, cx, cy, 20.0, 18.0, floors=2, floor_h=5.5, ground_h=5.5, wall_mat='plaster', base_mat='stone',
                  doors=[('S', 0.0)], roof='hip', foundation=0.0)
    dp = 9.0 * 0.35
    pediment_front(F, cx, cy - 9.0 - 0.9 * dp, 0.0, 9.0, 4, 7.0, depth=dp, order='corinthian', mat='marble',
                   tymp_mat='plaster', steps=3, rot=0.0, roof_mat='tile')

propylon(F)
preview_ground(-20.0)
import bpy
try:
    bpy.context.scene.eevee.taa_render_samples = 16          # low samples for the previews
except Exception:
    pass
finish('rome_apollo', front='-Y')
