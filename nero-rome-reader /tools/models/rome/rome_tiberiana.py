import os, sys, math, json; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
import bpy
from mathutils import Vector
import bl_kit as _bk
reset()
# tile ribs at 2.4x the kit spacing (keeps the triangle budget; every roof still shows its tile ribs)
_ribs_full = _bk._ribs
def _ribs_sparse(mat, eave_a, eave_b, run_vec, rise, spacing, lens, w=0.17, hgt=0.09):
    _ribs_full(mat, eave_a, eave_b, run_vec, rise, spacing * 2.4, lens, w, hgt)
_bk._ribs = _ribs_sparse

F = Frame()                  # origin = centre of the palace platform, z = 0 = platform level
NAME = 'rome_tiberiana'
GROUND = -47.0               # preview ground = foot of the rock (the north foot reaches about -46 m)

# ---- fills: core under the terraces (-14..-7), platform fill (-7..0), north foot under the terraces (-36..-22)
box(F, 0, 2.5, -14, 140, 115, 7, 'tuff')
box(F, 0, 0.35, -7, 129, 99.7, 7, 'tuff')
box(F, -68, 63, -40, 6, 6, 33, 'tuff')          # NW corner pier
box(F, 68, 63, -40, 6, 6, 33, 'tuff')           # NE corner pier
box(F, -69, 0, -25, 4, 132, 11, 'tuff')         # west foot
box(F, 69, 0, -22, 4, 132, 8, 'tuff')           # east foot
box(F, 0, -56, -22, 140, 4, 8, 'tuff')          # south foot
box(F, 0, 0.35, 0, 129, 99.7, 0.05, 'paving')   # paved platform top, visible between the wings

# ---- hill base: west, east and south have two terrace walls (0..-7 and -7..-14); north: one storey of tuff arches on a plinth (below)
for pts in ([(-65, 60), (-65, -50)], [(-65, -50), (65, -50)], [(65, -50), (65, 60)]):
    retaining_wall(F, pts, 0.0, -7.0, buttress='square', every=10.0, parapet=None, courses=3.5)
retaining_wall(F, [(-71, 66), (-71, -56)], -7.0, -25.0, buttress='square', every=10.0, parapet=None, courses=3.5, coping=True)
for pts in ([(-71, -56), (71, -56)], [(71, -56), (71, 66)]):
    retaining_wall(F, pts, -7.0, -14.0, buttress='square', every=10.0, parapet=None, courses=3.5, coping=True)
for (bx, by) in ((-71.0, -56.0), (-73.5, 57.0)):                   # round corner towers (restored), SW and NW
    cyl(F, bx, by, -25.0, 4.5, 18.6, 'tuff', 24)
    cyl(F, bx, by, -6.85, 4.8, 0.45, 'rock2', 24)
# north face: one storey of tuff arches on a plinth; the upper north face is a plain wall behind the portico
retaining_wall(F, [(65, 60), (-65, 60)], 0.0, -7.0, buttress=None, parapet=None, courses=3.5)
box(F, 0, 55, -7, 130, 10, 7, 'tuff')
box(F, 0, 63.45, -40, 130, 6.9, 21.0, 'tuff')
box(F, 0, 66.45, -19.4, 130.4, 0.9, 0.4, 'travertine')
substructure(F, 65, 66, -65, 66, -19.0, storeys=1, h=12.0, bay=8.0, depth=6.0, mat='tuff', pier_mat='travertine',
             half_cols=False, cornice_mat='travertine', top_parapet=True)
box(F, -68, 5, -7, 6, 122, 0.12, 'paving')      # west terrace-2 strip
box(F, 68, 5, -7, 6, 122, 0.12, 'paving')       # east strip
box(F, 0, -53, -7, 142, 6, 0.12, 'paving')      # south strip
box(F, 0, 63, -7, 130, 6, 0.12, 'paving')       # north mid terrace, on the lower arcade
colonnade(F, -30, 63.0, 30, 63.0, -6.88, 9, 4.6, None, 'marble', 'ionic', ent=True, ent_h=0.9)
def stair_on_base(F, x, ya, za, yb, zb, w=4.0, zbase=-40.0):
    """A straight flight along y at x from (ya, za) up to (yb, zb) on a solid tuff wall down to zbase."""
    stair_flight(F, x, ya, x, yb, za, zb, width=w, mat='travertine', cheek_mat='tuff')
    L = abs(yb - ya); rot = math.degrees(math.atan2(yb - ya, 0.0)); S = F.sub(x, ya, 0, rot); hw = w / 2 + 0.6
    v = [S.p(0, -hw, zbase), S.p(L, -hw, zbase), S.p(L, -hw, zb - 0.5), S.p(0, -hw, za - 0.5),
         S.p(0, hw, zbase), S.p(L, hw, zbase), S.p(L, hw, zb - 0.5), S.p(0, hw, za - 0.5)]
    add_mesh('tuff', v, [(0, 1, 2, 3), (5, 4, 7, 6), (3, 2, 6, 7), (4, 0, 3, 7), (1, 5, 6, 2), (0, 4, 5, 1)])

stair_on_base(F, -68.0, 104.0, -27.0, 87.0, -16.0)                 # lower flight, from the rock ledge
box(F, -68.0, 85.5, -40.0, 5.2, 3.0, 24.0, 'tuff')                 # landing (top at -16)
box(F, -68.0, 85.5, -16.0, 5.2, 3.0, 0.1, 'travertine')
stair_on_base(F, -68.0, 84.0, -16.0, 66.5, -7.0)                   # upper flight, onto the corner pier and the mid terrace

# ---- forecourt on the upper arcade, low parapet, statues, flower beds; entrance porch on the north door
box(F, 0, 55, 0, 130, 10, 0.12, 'paving')
box(F, 0, 59.6, 0.12, 130, 0.6, 1.0, 'marble')  # solid parapet on the north edge
for x in (-36, -12, 12, 36):
    statue(F, x, 57.0, 0.12, 2.4, 'marble', pedestal=1.0, ped_mat='marble')
flower_bed(F, -58, 54, 0.12, 8, 5)
flower_bed(F, 58, 54, 0.12, 8, 5)
pediment_front(F, 0, 53.9, 0, 14.0, 4, 6.5, order='corinthian', steps=3, rot=180)

# ---- seven wings round a peristyle court, each with its own roof level (2, 3 and 4 storeys), set back from one another
rect_building(F, 0, 36, 130, 28, floors=2, floor_h=5.0, wall_mat='plaster', base_mat='travertine', bay=6.0,
              win_w=1.15, win_h=1.9, roof='hip', doors=(('N', 0.0),), foundation=0)          # north wing, 2 storeys
rect_building(F, -47.5, 0, 35, 40, floors=3, floor_h=4.2, wall_mat='plaster', base_mat='travertine', bay=6.0,
              win_w=1.1, win_h=1.9, roof='hip', doors=(('W', -14.0),), foundation=0)         # west wing, 3 storeys
rect_building(F, 18, -36, 94, 28, floors=2, floor_h=5.0, wall_mat='plaster', base_mat='travertine', bay=6.0,
              win_w=1.15, win_h=1.9, roof='hip', foundation=0)                                # south wing, 2 storeys
rect_building(F, 37, 0, 18, 40, floors=2, floor_h=5.0, wall_mat='plaster', base_mat='travertine', bay=5.0,
              win_w=1.15, win_h=1.9, roof=None, foundation=0)                                 # east-centre wing, flat terrace
box(F, 37, 0, 10.5, 18, 40, 0.25, 'tile')                                                     # terrace deck
box(F, 37, 19.4, 10.75, 18, 0.6, 1.0, 'plaster')                                              # parapets
box(F, 37, -19.4, 10.75, 18, 0.6, 1.0, 'plaster')
box(F, 28.4, 0, 10.75, 0.6, 40, 1.0, 'plaster')
box(F, 45.6, 0, 10.75, 0.6, 40, 1.0, 'plaster')
pergola(F, 30, -16, 44, 16, 10.75, 2.6, 'wood', 'hedge', 3.5)
box(F, 32, -14, 10.75, 2.8, 2.8, 2.4, 'plaster')                                             # stair hut
hip_roof(F, 32, -14, 13.15, 2.8, 2.8, 30.0, 0.3, 'tile')
rect_building(F, 58, 0, 14, 38, floors=4, floor_h=4.5, ground_h=5.0, wall_mat='plaster', base_mat='travertine',
              bay=6.0, win_w=1.2, win_h=2.6, arch_windows=True, roof='gable_y', cornice_mat='gold', foundation=0)   # banquet hall, 4 storeys, 18.5 m
rect_building(F, -52, -38, 20, 24, floors=3, floor_h=4.2, wall_mat='plaster', base_mat='travertine', bay=5.0,
              win_w=1.1, win_h=1.9, roof='hip', cornice_mat='stone', foundation=0)           # Nero's apartment, 3 storeys
eagle(F, -52, -36.0, 17.4, s=1.3, mat='tile', broken=True)                                    # broken eagle on the north ridge end
rect_building(F, -35, -28, 12, 12, floors=2, floor_h=5.0, wall_mat='plaster', base_mat='travertine', bay=5.0,
              win_w=1.1, win_h=1.9, roof=None, foundation=0)                                  # service wing, flat terrace
box(F, -35, -28, 10.5, 12, 12, 0.25, 'tile')
box(F, -35, -22.4, 10.75, 12, 0.6, 1.0, 'plaster')
box(F, -35, -33.6, 10.75, 12, 0.6, 1.0, 'plaster')
box(F, -41.4, -28, 10.75, 0.6, 12, 1.0, 'plaster')
box(F, -28.6, -28, 10.75, 0.6, 12, 1.0, 'plaster')
pergola(F, -40.0, -33.0, -30.0, -24.0, 10.75, 2.4, 'wood', 'hedge', 2.4)
box(F, -31, -31, 10.75, 2.6, 2.6, 2.4, 'plaster')
hip_roof(F, -31, -31, 13.15, 2.6, 2.6, 30.0, 0.3, 'tile')
square_tower(F, -58, 44, 7.0, 19.0, wall_mat='plaster', roof='pyramid', top_loggia=True, foundation=10.0)   # belvedere, NW corner

# ---- garden court with a portico, between the apartment, the service wing and the south wing
box(F, -35.5, -40.5, 0.05, 11, 13, 0.07, 'paving')
box(F, -38.25, -35.5, 0.12, 4.5, 3.0, 0.3, 'grass')                                           # fig soil bed
box(F, -35.5, -47.5, 0.12, 12, 0.5, 1.0, 'plaster')
colonnade(F, -31.0, -46.0, -31.0, -35.5, 0.12, 3, 6.28, None, 'marble', 'tuscan', ent=True, ent_h=0.6)
lean_roof(F, -29, -35.5, -29, -46.0, 7.5, 4.0, 1.0)
box(F, -63.5, -38, 0.12, 3, 24, 0.1, 'grass')                                                 # garden strip west of the apartment

# ---- peristyle court with its long pool, colonnaded walks and lean-to roofs on the west and east
box(F, 0, 0, 0.05, 52, 36, 0.1, 'paving')
box(F, 0, 0, 0.05, 46, 30, 0.22, 'grass')
pool(F, 0, 0, 0.27, 30, 9)
box(F, 0, 0, 0.2, 29.2, 8.2, 0.08, 'water')
colonnade(F, -26, -18, -26, 18, 0.15, 7, 5.95, None, 'marble', 'ionic', ent=True, ent_h=0.7)
colonnade(F, 26, -18, 26, 18, 0.15, 7, 6.55, None, 'marble', 'ionic', ent=True, ent_h=0.7)
colonnade(F, -24, 18, 24, 18, 0.15, 7, 5.0, None, 'marble', 'ionic', ent=True, ent_h=0.7)
colonnade(F, -24, -18, 24, -18, 0.15, 7, 5.0, None, 'marble', 'ionic', ent=True, ent_h=0.7)
lean_roof(F, -30, -19, -30, 19, 8.0, 4.0, 1.2)
lean_roof(F, 28, 19, 28, -19, 8.0, 4.0, 1.2)

# ---- peristyle garden: round fountain with a statue group, wall fountain with niches, rows of statues by the pool
cx, cy = -19.0, 9.0
round_pool(F, cx, cy, 0.77, 4.0, 'water', 'marble', 0.5, 28)
cyl(F, cx, cy, 0.27, 0.6, 1.4, 'marble', 12)
for a in (90, 210, 330):
    statue(F, cx + 0.8 * math.cos(math.radians(a)), cy + 0.8 * math.sin(math.radians(a)), 1.67, 2.2, 'marble', pedestal=0.0)
arcade(F, -12, 15.0, 12, 15.0, 0.27, 3.6, 1.0, 3, 'porphyry', open_w=2.6, open_h=3.0, back='dark')
for x in (-8, 0, 8):
    statue(F, x, 15.0, 0.27, 2.2, 'marble', pedestal=0.0)
box(F, 0, 13.4, 0.27, 22, 1.2, 0.12, 'water')
for x in (-9.0, 9.0):
    for y in (-7.0, 7.0):
        statue(F, x, y, 0.27, 2.2, 'marble', pedestal=0.9, ped_mat='marble')

# ---- garden pavilion at the south end of the pool: 6 giallo Corinthian columns on a round platform, gilt cone roof
cyl(F, 0, -12, 0, 4.4, 0.6, 'marble', 24)
ze = ring_colonnade(F, 0, -12, 0.6, 3.6, 6, 4.5, None, 'giallo', 'corinthian', ent=True, ent_h=0.9)
cone_roof(F, 0, -12, ze, 4.4, 2.4, 'tile', 28, finial='gold')

# ---- side door in the west wing with a stair running south down the slope to the terrace-2 strip
stair_flight(F, -66.0, -5.5, -66.0, 14.0, -7.0, 0.0, width=3.0, mat='stone', cheek_mat='tuff')

# ---- upper arcaded loggia over the north wing: arcade with dark bays, Ionic columns, tile lean-to
arcade(F, 30, 49.9, -30, 49.9, 10.5, 5.5, 0.6, 10, 'plaster', open_w=2.6, open_h=3.8, back='dark')
box(F, 0, 51.4, 10.5, 60, 3.6, 0.5, 'marble')
colonnade(F, -28.8, 52.0, 28.8, 52.0, 11.0, 11, 3.4, None, 'marble', 'ionic', ent=True, ent_h=0.7)
box(F, 0, 53.0, 11.0, 60, 0.5, 1.0, 'marble')
lean_roof(F, 30, 50.2, -30, 50.2, 16.0, 5.0, 1.3)

# ---- the north ledge: the palace's terrace garden (round 3, 2026-11-08; Livia's garden room at Prima Porta and the
#      Pompeian peristyle gardens: box-framed beds, gravel walks, a fountain basin, statues on pedestals, a pergola,
#      trees behind the parapet). It lies at the arcade floor, so the arches open onto it as a portico.
ZG = -19.6                                                         # garden walks (the arcade floor is -19.0)
PLANTS = []                                                        # (x, y, z, kind, scale): planted by the page
box(F, 4.3, 81.0, -22.0, 139.4, 28.2, 2.4, 'gravel')               # gravel over the whole terrace, x -65.4..74, y 66.9..95.1
box(F, 4.6, 95.5, -26.5, 140.0, 0.8, ZG + 1.0 + 26.5, 'tuff')      # terrace wall on the cliff edge, 1 m parapet
box(F, 4.6, 95.5, ZG + 1.0, 140.4, 1.0, 0.18, 'travertine')
box(F, 74.4, 85.1, -26.5, 0.8, 21.6, ZG + 1.0 + 26.5, 'tuff')      # east end
box(F, 74.4, 85.1, ZG + 1.0, 1.0, 21.8, 0.18, 'travertine')
box(F, 71.55, 73.3, -26.0, 14.1, 2.0, 12.9, 'tuff')                # retaining wall against the higher east rock (tE)
box(F, 71.55, 73.3, -13.1, 14.3, 2.2, 0.25, 'travertine')
box(F, 0, 67.3, ZG, 32.5, 0.8, 0.3, 'travertine')                  # a step up into the four middle bays: the portico
box(F, 0, 63.0, -19.0, 32.4, 5.8, 0.06, 'paving')
for (bx0, bx1) in ((-59.0, -38.2), (-34.6, -12.0), (12.0, 34.6), (38.2, 59.0)):
    for r, (by0, by1) in enumerate(((72.4, 81.2), (84.2, 91.0))):
        box(F, (bx0 + bx1) / 2, (by0 + by1) / 2, ZG, bx1 - bx0 - 0.6, by1 - by0 - 0.6, 0.18, 'turf')
        for (ax, ay, cx_, cy_) in ((bx0, by0, bx1, by0), (bx1, by0, bx1, by1), (bx1, by1, bx0, by1), (bx0, by1, bx0, by0)):
            hedge(F, ax, ay, cx_, cy_, ZG, 0.7, 0.55)               # clipped box round each bed
        mx_, my_ = (bx0 + bx1) / 2, (by0 + by1) / 2
        PLANTS.append((mx_, my_, ZG + 0.18, 'pomegr' if r == 0 else 'fig', 0.8))
        for (px, py) in ((bx0 + 2.6, by0 + 2.2), (bx1 - 2.6, by0 + 2.2), (bx0 + 2.6, by1 - 2.2), (bx1 - 2.6, by1 - 2.2)):
            PLANTS.append((px, py, ZG + 0.18, 'flower' if (px + py) % 3 < 1.0 else 'shrub', 0.6))
round_pool(F, 0, 82.7, ZG, 3.6, 'water', 'marble', 0.45, 24)       # the fountain basin on the axis
cyl(F, 0, 82.7, ZG - 0.1, 0.45, 1.5, 'marble', 10)
statue(F, 0, 82.7, ZG + 1.4, 1.9, 'marble', pedestal=0.0)
for (sx, sy) in ((-10.0, 73.6), (10.0, 73.6), (-10.0, 89.8), (10.0, 89.8), (-36.4, 82.7), (36.4, 82.7)):
    statue(F, sx, sy, ZG, 2.2, 'marble', pedestal=1.0, ped_mat='marble')
pergola(F, 63.0, 76.0, 72.6, 93.0, ZG, 2.7, 'wood', 'hedge', 2.4)  # vine pergola at the east end, a bench under it
box(F, 71.4, 84.5, ZG, 0.8, 11.0, 0.5, 'marble')
for (tx0, tx1) in ((-60.5, -4.0), (4.0, 62.0)):                     # a strip of grass behind the parapet with the trees
    box(F, (tx0 + tx1) / 2, 93.4, ZG, tx1 - tx0, 2.6, 0.12, 'turf')
for k, tx in enumerate((-57, -50, -43, -36, -29, -22, -15, -8, 8, 15, 22, 29, 36, 43, 50, 57)):
    PLANTS.append((tx, 93.4, ZG + 0.12, 'pine' if abs(tx) in (22, 50) else 'broad' if abs(tx) == 36 else 'cyp', 0.75))
stair_flight(F, -59.4, 85.5, -65.4, 85.5, ZG, -16.0, width=2.6, mat='travertine', cheek_mat='tuff')   # garden up to the NW stair landing

# ---- rock: the north and west sides are one natural cliff round the garden and the west terrace (cliff_band); its toe
#      sits on the old foot outline (palrock.js), so the footprint the page places before the houses stays as it was
TOE = [(-82.7, -75.2), (-82.7, -91.5), (-82.7, -96.6), (-82.0, -107.6), (-80.5, -110.3), (-4.9, -112.7), (0.0, -112.7),
       (15.2, -112.4), (76.4, -110.4), (81.6, -108.0), (82.6, -103.5), (82.6, -99.6), (82.7, -80.0), (82.4, 12.6),
       (82.0, 69.4), (80.3, 72.7), (65.9, 72.7), (-5.4, 72.7), (-76.7, 72.1), (-79.5, 48.4), (-79.8, 44.3),
       (-82.1, -11.8), (-82.6, -52.6), (-82.7, -71.8)]
TOE = [(x, -z) for x, z in TOE]                                     # palrock.js gives glTF (x, z); model y = -z
RIM = [(-76.6, -66), (-76.4, -54), (-76.0, -42), (-76.5, -28), (-75.9, -14), (-76.6, 2), (-75.8, 18), (-76.4, 32),
       (-77.6, 44), (-79.0, 51), (-79.4, 58), (-78.2, 64), (-76.3, 72), (-76.6, 82), (-75.8, 90),          # west, round both towers
       (-74.2, 95.6), (-71.0, 98.4), (-67.0, 99.2), (-62.5, 98.2),                                         # NW: the stair goes down here
       (-52, 98.9), (-41, 97.6), (-30, 98.7), (-19, 97.7), (-8, 98.9), (3, 97.8), (14, 98.8), (25, 97.6), (36, 98.7),
       (47, 97.8), (58, 98.6), (67, 97.9), (73.0, 96.4), (76.4, 92.5), (77.6, 86), (77.2, 79), (77.8, 72), (78.0, 66)]
z_west = lambda y: -14.1 - 0.07 * (y + 56.0)                         # the old west ledge's fall to the north
zN = lambda x: -20.6 + 0.5 * math.sin(0.21 * x + 0.7) + 0.35 * math.sin(0.53 * x)   # 0.15-1.9 m under the garden


def z_rim(x, y):
    if x < -70.5 and y < 93.0:
        return z_west(y) + 0.6 * math.sin(0.17 * y + 1.0) * min(1.0, (93.0 - y) / 6.0)
    if x < -64.0:
        return -24.4                                                   # the NW stair passes the rim here, on the rock
    if x < -56.0:
        return -24.4 + (zN(x) + 24.4) * (x + 64.0) / 8.0
    return zN(x)


def z_toe(x, y):                                                       # the old feet: valley floor north, the west slope
    zn = -41.0 - 0.14 * max(0.0, y - 66.0); zw = -32.3 - 0.07 * (y + 56.0)
    return max(-47.1, zn if x > -77.0 else (min(zw, zn) if y > 66.0 else zw))


def z_mid(x, y):                                                       # the mid bench rises and falls along the cliff
    if x < -70.5 and y < 93.0:
        return z_west(y) - 5.5 - 4.0 * (0.5 + 0.5 * math.sin(0.09 * y + 2.0)) + 1.2 * math.sin(0.31 * y)
    zm = -28.2 + 2.6 * math.sin(0.071 * x + 1.3) + 1.3 * math.sin(0.23 * x + 0.4)
    if x <= -59.0:
        return -27.3                                                   # the stair's foot
    if x < -54.0:
        return -27.3 + (zm + 27.3) * (x + 59.0) / 5.0
    return zm


CB = cliff_band(F, RIM, z_rim, z_toe, TOE, z_mid=z_mid, seed=21, fissures=14, tongues=6, ivy=12, boulders=10, bench=(-2.5, 6.0),
                mat='rock3', alt='rock2', dark='rock4',         # the faces a stain darker than the other hills: darker than the arcade's tuff
                keep=((-76.0, -59.0, 92.0, 113.0),), min_bench=lambda x, y: 6.5 if (-73.5 < x < -61.0 and y > 95.0) else 0.0)
PLANTS.extend(CB['plants'])
tE = rock_mass(F, [(66, -72), (82, -72), (82, 72), (66, 72)], -36, -13.5, seed=6, strata=4, step=10.0, band=5.0, boulders=3, grid=7.0, mat='rock3')
tS = rock_mass(F, [(-76, -72), (76, -72), (76, -50), (-76, -50)], -36, -13.5, seed=7, strata=4, step=10.0, band=5.0, boulders=3, grid=7.0, mat='rock3')
foot_rocks(F, [(-71, 66), (-71, -56)], (-14.5, -13.0), top_z=CB['top'], seed=11, blocks=3, mat='rock3')   # all the base rock in the darker stain (round 3)     # chunks along the west foot
foot_rocks(F, [(-71, -56), (71, -56)], (-14.5, -13.0), top_z=tS, seed=12, blocks=4, mat='rock3')     # ... south foot
foot_rocks(F, [(71, -56), (71, 66)], (-14.5, -13.0), top_z=tE, seed=13, blocks=3, mat='rock3')       # ... east foot

# ---- every roof surface uses the 'tile' material: fold the darker rib material into it
_t = _bk._G.setdefault('tile', [[], [], []])
_t2 = _bk._G.pop('tile2', None)
if _t2:
    _o = len(_t[0]); _t[0].extend(_t2[0]); _t[1].extend(tuple(_o + i for i in f) for f in _t2[1]); _t[2].extend(_t2[2])

print('CLIFF', CB['stations'], 'stations', CB['tris'], 'tris')
print('TIB_PLANTS', json.dumps([[round(p[0], 1), round(p[1], 1), round(p[2], 2), p[3], p[4]] for p in PLANTS], separators=(',', ':')))
preview_ground(GROUND)
human(F, 20, 110, GROUND)
if os.environ.get('ROME_DRY'):
    ob = _bk._build_object(NAME)
    print('DRY_TRIS', sum(len(p.vertices) - 2 for p in ob.data.polygons), 'verts', len(ob.data.vertices))
else:
    bpy.context.scene.eevee.taa_render_samples = 8
    finish(NAME, front='+Y', extra_cams=[('north_low', Vector((0.0, 1.0, 0.0)), 6),
           ('west_low', Vector((-1.0, 0.0, 0.0)), 6), ('nw', Vector((-0.7, 0.7, 0.0)), 22)])
