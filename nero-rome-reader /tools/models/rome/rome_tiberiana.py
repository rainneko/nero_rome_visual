import os, sys, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
import bpy
import bl_kit as _bk
reset()
# tile ribs at 2.4x the kit spacing (keeps the triangle budget; every roof still shows its tile ribs)
_ribs_full = _bk._ribs
def _ribs_sparse(mat, eave_a, eave_b, run_vec, rise, spacing, lens, w=0.17, hgt=0.09):
    _ribs_full(mat, eave_a, eave_b, run_vec, rise, spacing * 2.4, lens, w, hgt)
_bk._ribs = _ribs_sparse

F = Frame()                  # origin = centre of the palace platform, z = 0 = platform level
NAME = 'rome_tiberiana'
GROUND = -41.0               # preview ground = foot of the rock (the benches dip to about -41 m)

# ---- fills: core under the terraces (-14..-7), platform fill (-7..0), north foot under the terraces (-36..-22)
box(F, 0, 2.5, -14, 140, 115, 7, 'tuff')
box(F, 0, 0.35, -7, 129, 99.7, 7, 'tuff')
box(F, 0, 72, -36, 130, 24, 14, 'tuff')         # y 60..84
box(F, -67, 75, -36, 4, 18, 14, 'tuff')         # west end of the Forum street
box(F, -68, 63, -36, 6, 6, 29, 'tuff')          # NW corner pier
box(F, 68, 63, -36, 6, 6, 29, 'tuff')           # NE corner pier
box(F, -69, 0, -22, 4, 132, 8, 'tuff')          # west foot
box(F, 69, 0, -22, 4, 132, 8, 'tuff')           # east foot
box(F, 0, -56, -22, 140, 4, 8, 'tuff')          # south foot
box(F, 0, 0.35, 0, 129, 99.7, 0.05, 'paving')   # paved platform top, visible between the wings

# ---- hill base: west, east and south have two terrace walls (0..-7 and -7..-14); north has brick arcades in 3 levels
for pts in ([(-65, 60), (-65, -50)], [(-65, -50), (65, -50)], [(65, -50), (65, 60)]):
    retaining_wall(F, pts, 0.0, -7.0, buttress='square', every=10.0, parapet=None, courses=3.5)
for pts in ([(-71, 66), (-71, -56)], [(-71, -56), (71, -56)], [(71, -56), (71, 66)]):
    retaining_wall(F, pts, -7.0, -14.0, bastion='d', b_size=8.0, b_rise=0.8, coping=True, every=30.0, buttress=None, parapet=None, courses=3.5)
substructure(F, 65, 60, -65, 60, -7, storeys=1, h=7.0, bay=5.0, depth=10.0, mat='brick', pier_mat='travertine', top_parapet=False)
substructure(F, 65, 66, -65, 66, -22, storeys=2, h=7.5, bay=5.0, depth=6.0, mat='brick', pier_mat='travertine',
             half_cols=False, top_parapet=False)
box(F, -68, 5, -7, 6, 122, 0.12, 'paving')      # west terrace-2 strip
box(F, 68, 5, -7, 6, 122, 0.12, 'paving')       # east strip
box(F, 0, -53, -7, 142, 6, 0.12, 'paving')      # south strip
box(F, 0, 63, -7, 130, 6, 0.12, 'paving')       # north mid terrace, on the lower arcade
colonnade(F, -30, 63.0, 30, 63.0, -6.88, 9, 4.6, None, 'marble', 'ionic', ent=True, ent_h=0.9)
beam(F, -68.0, 83.0, -23.4, -68.0, 62.0, -8.4, 6.5, 3.0, 'stone')   # monumental ramp up the west side

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

# ---- the Forum-side foot: paved street, portico with shops behind it, brick back wall with dark arches
box(F, 0, 75, -22, 130, 18, 0.12, 'paving')
box(F, 0, 87, -36, 130, 6, 18.8, 'brick')
arcade(F, 65, 90, -65, 90, -36, 18.8, 1.2, 13, 'brick', open_w=2.8, open_h=7.5, back='dark')
taberna_front(F, -65, 84, 65, 84, -22, 13, h=4.8, mat='plaster2')
colonnade(F, -58, 80.5, 58, 80.5, -22, 7, 3.6, None, 'marble', 'tuscan', ent=True, ent_h=0.6)
lean_roof(F, -60, 84, 60, 84, -17.0, 5.0, 1.6)

# ---- upper arcaded loggia over the north wing: arcade with dark bays, Ionic columns, tile lean-to
arcade(F, 30, 49.9, -30, 49.9, 10.5, 5.5, 0.6, 10, 'plaster', open_w=2.6, open_h=3.8, back='dark')
box(F, 0, 51.4, 10.5, 60, 3.6, 0.5, 'marble')
colonnade(F, -28.8, 52.0, 28.8, 52.0, 11.0, 11, 3.4, None, 'marble', 'ionic', ent=True, ent_h=0.7)
box(F, 0, 53.0, 11.0, 60, 0.5, 1.0, 'marble')
lean_roof(F, 30, 50.2, -30, 50.2, 16.0, 5.0, 1.3)

# ---- rock at the foot of the hill base (the lowest walls rise out of it)
tN = rock_mass(F, [(-80, 84), (80, 84), (80, 112), (-80, 112)], -36, -21, seed=3, strata=3, step=10.0, boulders=3, grid=7.0)
tW = rock_mass(F, [(-82, -66), (-66, -66), (-66, 84), (-82, 84)], -36, -13.5, seed=5, strata=4, step=10.0, band=5.0, boulders=3, grid=7.0)
tE = rock_mass(F, [(66, -72), (82, -72), (82, 72), (66, 72)], -36, -13.5, seed=6, strata=4, step=10.0, band=5.0, boulders=3, grid=7.0)
tS = rock_mass(F, [(-76, -72), (76, -72), (76, -50), (-76, -50)], -36, -13.5, seed=7, strata=4, step=10.0, band=5.0, boulders=3, grid=7.0)
foot_rocks(F, [(-71, 66), (-71, -56)], (-14.5, -13.0), top_z=tW, seed=11, blocks=3)     # chunks along the west foot
foot_rocks(F, [(-71, -56), (71, -56)], (-14.5, -13.0), top_z=tS, seed=12, blocks=4)     # ... south foot
foot_rocks(F, [(71, -56), (71, 66)], (-14.5, -13.0), top_z=tE, seed=13, blocks=3)       # ... east foot

# ---- every roof surface uses the 'tile' material: fold the darker rib material into it
_t = _bk._G.setdefault('tile', [[], [], []])
_t2 = _bk._G.pop('tile2', None)
if _t2:
    _o = len(_t[0]); _t[0].extend(_t2[0]); _t[1].extend(tuple(_o + i for i in f) for f in _t2[1]); _t[2].extend(_t2[2])

preview_ground(GROUND)
human(F, 20, 110, GROUND)
if os.environ.get('ROME_DRY'):
    ob = _bk._build_object(NAME)
    print('DRY_TRIS', sum(len(p.vertices) - 2 for p in ob.data.polygons), 'verts', len(ob.data.vertices))
else:
    bpy.context.scene.eevee.taa_render_samples = 8
    finish(NAME, front='+Y')
