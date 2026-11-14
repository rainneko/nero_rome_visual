import os, sys, math, json; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
import bpy
from mathutils import Vector
import bl_kit as _bk
reset()
import tib_plan as TP
# the kit's own roofs (the porch): tile ribs at 1.6x the kit spacing = 1.0 m, as on the palace roofs (tib_plan.RIB)
_ribs_full = _bk._ribs
def _ribs_sparse(mat, eave_a, eave_b, run_vec, rise, spacing, lens, w=0.17, hgt=0.09):
    _ribs_full(mat, eave_a, eave_b, run_vec, rise, spacing * 1.6, lens, w, hgt)
_bk._ribs = _ribs_sparse
ROUND = int(os.environ.get('TIB_ROUND', '3'))   # 1 massing and roofs, 2 the outside finished, 3 parts and rooms

TP.part('tib_base')         # the hill base, the forecourt, the terrace garden, the cliff (accepted 2026-11-08: unchanged)
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

stair_on_base(F, -68.0, 102.1, -25.77, 87.0, -16.0)                # lower flight, from the first landing of the lower part (it used to end on the rock ledge at -27: see NW_STAIR below)
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
# the porch of the north frontispiece (M02): 12 m wide, 4 columns, standing on the forecourt; its entablature ends at the
# first-floor level (6.5), under the loggia
pediment_front(F, 0, 53.9, 0.12, 12.0, 4, 5.23, order='corinthian', steps=0, rot=180)

# ---- the palace above the platform (v2, 2026-11): built from tools/models/rome/tiberiana_plan.json by tib_plan.py.
#      141 rooms on three floors and a basement, 35 roof blocks, six open courts; storeys 6.5 / 4.5 / 3.8 m; nothing over three storeys.
#      What the plan only notes in words is given here.
EXTRA = [  # parts that stand over a roof block of the plan (review of round 1: no ridge runs more than 45 m at one height)
    dict(id='M01m', over='M01', x0=-27, y0=44, x1=27, y1=50, storeys=2, eaves=11.6, roof='gable', ridge='EW'),   # behind the loggia, 0.6 m over the flanks
    dict(id='M06m', over='M06', x0=-10, y0=22, x1=10, y1=30, storeys=2, eaves=11.8, roof='gable', ridge='EW'),   # the council room, 0.8 m higher
    dict(id='M07m', over='M07', x0=-8, y0=-27, x1=8, y1=-16, storeys=2, eaves=11.8, roof='gable', ridge='EW'),   # the inner hall, 0.8 m higher
    dict(id='M09g', over='M09', x0=-4, y0=-44, x1=4, y1=-32, storeys=2, eaves=12.2, roof='gable', ridge='NS'),   # the south gate pavilion, 1.2 m over the eaves
    dict(id='M10g', over='M10', x0=-4, y0=-50, x1=4, y1=-44, storeys=1, eaves=5.6, roof='gable', ridge='NS'),    # the gate porch through the portico's lean-to
]
OPTS = {
    'M01': {'hip_ends': 'E',                        # 北立面一排，东端收成四坡
            'doors': [('S', 46.6, 2.4, 3.0, 0.0, 'rect'), ('S', 50.3, 1.4, 1.5, 0.9, 'arch')]},     # E16b 甜酒工坊 (plan revision 2026-11-14): a wide door and the hearth's mouth to the kitchen court
    'M16': {'hip_ends': 'S'},                       # 南端收成四坡
    'M02': {'over': 'M01m', 'pediment': 'N',        # the frontispiece: three arched openings on F3, a pediment on its north gable
            'windows': {(3, 'N'): (1.8, 2.6, 11.6, 'arch', 3.6)}},
    'M08': {'gaps': [('N', -53.0, -51.0)]},         # the way from the solarium over the corridor's roof to the eagle
    'M09g': {'pediment': 'S'}, 'M10g': {'pediment': 'S'},
    'M11': {'open': [(1, 'E', -42.5, -33.5)], 'recess': 4.0},        # the Hermaeum opens to the fish-pond garden with four columns
    'M12': {'open': [(3, 'W', -43.5, -34.5)],                        # the tower: a three-bay loggia in front of the study on F3
            'doors': [('N', -59.0, 1.4, 2.4, 6.5, 'rect'),            # ... the door from 2T1 onto the solarium
                      ('E', -42.6, 1.8, 2.6, 0.0, 'rect'), ('E', -39.7, 1.8, 2.6, 0.0, 'rect')]},     # ... and W02b 暗阁's two solid bolted doors to the court W03 (【书】“那两扇实心的厚门”)
    'M14': {'deck': 'paving'},                      # the solarium is a terrace people use: stone slabs
    'M17': {'doors': [('E', 9.7, 1.8, 3.4, 0.0, 'rect'), ('E', 17.0, 1.8, 3.4, 0.0, 'rect'), ('E', 24.3, 1.8, 3.4, 0.0, 'rect')]},   # west side hall: three doors to the pomegranate court
    'M22': {'cross_walls': [-16.0, 22.0]}, 'M23': {'cross_walls': [-16.0, 22.0]},      # parapet gables at the corners of the peristyle
    'M25': {'pediment': 'NS', 'gold': True,         # the banquet hall: clerestory, a gilt band under the cornice, a pediment on each gable
            'windows': {(2, 'W'): (1.2, 2.8, 9.0, 'arch'), (2, 'E'): (1.2, 2.8, 9.0, 'arch'), 2: None}},
}
DOORS = {'doorN': (2.6, 4.6, 'arch'), 'doorW': (1.8, 3.0, 'rect'), 'doorE': (2.2, 3.4, 'arch'), 'doorNW': (1.6, 2.6, 'rect'),
         'doorC': (2.2, 3.4, 'arch')}     # the cryptoporticus door at y 35.3: inside the page's gallery (PAL_CRYPTO: axis y 34.7, 5.8 m wide) and inside its room E10
TP.load(opts=OPTS, extra=EXTRA, doors=DOORS, no_window=('W02b',))     # W02b 暗阁（密室）: thick stone walls, no window (N10 is the 文书库 now and has its windows again)
TP.massing(order='column' if ROUND > 1 else 'pier', detail=ROUND > 1, court_mats={'P05': 'gravel'})
TP.part('tib_roof')
_e = TP.FEAT['eagle']                               # the broken eagle on the west apex of M15's gable
eagle(F, _e['x'] + 0.45, _e['y'], _e['z'] + 0.1, s=1.3, mat='tile', broken=True, rot=90)
PALACE_PLANTS = []                                  # trees and shrubs of the courts (x, y, z, kind, scale): the page plants them
if ROUND > 1:
    # ---- roofs: the solarium's awning posts, the kitchen's ridge vent
    _s = TP.BLOCK['M14']; _zp = _s['eaves'] + TP.PARAPET_H + 0.1
    for _x, _ys in ((_s['x0'] + 0.22, (-30.0, -25.0, -20.0)), (_s['x1'] - 0.22, (-25.6, -22.5, -19.4))):     # three on the west parapet, three on the east
        for _y in _ys:
            cyl(F, _x, _y, _zp, 0.06, 3.0, 'bronze', 6); sphere(F, _x, _y, _zp + 3.06, 0.11, 'bronze', 6, 4)
    _k = TP.BLOCK['M26']; _yr = (_k['y0'] + _k['y1']) / 2; _xm = (_k['x0'] + _k['x1']) / 2; _zr = _k['ridge_z']
    box(F, _xm, _yr, _zr - 0.25, 8.0, 0.9, 0.85, 'wood')                                    # louvre strip along the middle 8 m of the ridge (no chimney)
    for _sd in (-1, 1):
        add_poly('tile', [F.p(_xm - 4.2, _yr + _sd * 0.75, _zr + 0.5), F.p(_xm + 4.2, _yr + _sd * 0.75, _zr + 0.5), F.p(_xm + 4.2, _yr, _zr + 0.8), F.p(_xm - 4.2, _yr, _zr + 0.8)][::_sd])
    beam(F, _xm - 4.2, _yr, _zr + 0.84, _xm + 4.2, _yr, _zr + 0.84, 0.3, 0.2, 'tile')

    # ---- the south door behind the gate porch (plan feature doorS: the door is in the portico's back wall)
    TP.part('tib_f1'); _d = TP.FEAT['doorS']; _yb = TP.BLOCK['M10']['y1']
    add_poly('wood', [F.p(_d['x'] - 1.3, _yb - 0.05, 0.05), F.p(_d['x'] + 1.3, _yb - 0.05, 0.05), F.p(_d['x'] + 1.3, _yb - 0.05, 4.1), F.p(_d['x'] - 1.3, _yb - 0.05, 4.1)])
    for _sd in (-1, 1):
        box(F, _d['x'] + _sd * 1.5, _yb - 0.12, 0.05, 0.4, 0.24, 4.25, 'marble')
    box(F, _d['x'], _yb - 0.14, 4.1, 3.6, 0.28, 0.45, 'marble')

    # ---- the two impluvia under the atrium roofs, for the web file only: one sees them from above, through the roof openings.
    #      They are a water sheet in a flat marble frame 0.55 m up, with no sides: the state atrium's lies over a cell of the page's
    #      ground grid that has no support under it, and anything lower than 0.5 m there would move the terrain (see the ground
    #      anchors below). The parts file gets the real basins with the rooms.
    TP.part('tib_f1w')
    for _k in ('impluvium', 'impluvium2'):
        _f = TP.FEAT[_k]; _zw = 0.55
        add_poly('water', [F.p(_f['x0'], _f['y0'], _zw), F.p(_f['x1'], _f['y0'], _zw), F.p(_f['x1'], _f['y1'], _zw), F.p(_f['x0'], _f['y1'], _zw)])
        for (_a, _b, _c, _d) in ((_f['x0'] - 0.4, _f['y0'] - 0.4, _f['x1'] + 0.4, _f['y0']), (_f['x0'] - 0.4, _f['y1'], _f['x1'] + 0.4, _f['y1'] + 0.4),
                                 (_f['x0'] - 0.4, _f['y0'], _f['x0'], _f['y1']), (_f['x1'], _f['y0'], _f['x1'] + 0.4, _f['y1'])):
            add_poly('marble', [F.p(_a, _b, _zw + 0.02), F.p(_c, _b, _zw + 0.02), F.p(_c, _d, _zw + 0.02), F.p(_a, _d, _zw + 0.02)])

    # ---- the courts (part tib_garden). Nothing here reaches below z = 0 (see the ground anchors below).
    TP.part('tib_garden')
    # peristyle garden P05, 45 x 29 m: gravel walks, the niched pool, the book's pavilion, the round basin, statues
    _p = TP.FEAT['pool']; NICHES = TP.niche_pool(_p['x0'], _p['y0'], _p['x1'], _p['y1'])      # 【史】 inner wall with rectangular and semicircular niches in turn
    for _x in (_p['x0'] - 1.6, _p['x1'] + 1.6):
        for _y in (_p['y0'] + 1.2, _p['y1'] - 1.2):
            TP.figure(_x, _y, 0.1, 2.1)
    arcade(F, -9.0, 15.6, 9.0, 15.6, 0.1, 3.4, 0.8, 3, 'porphyry', open_w=2.6, open_h=2.9, back='dark')    # the wall fountain north of the pool
    for _x in (-6.0, 0.0, 6.0):
        TP.figure(_x, 15.5, 0.1, 1.9, ped=0.35)
    box(F, 0, 14.6, 0.1, 17.0, 0.9, 0.3, 'marble'); add_poly('water', [F.p(-8.2, 14.25, 0.42), F.p(8.2, 14.25, 0.42), F.p(8.2, 14.95, 0.42), F.p(-8.2, 14.95, 0.42)])
    _t = TP.FEAT['tholos']; TP.tholos(_t['x'], _t['y'], 0.1, R=_t['r'] - 0.5, n=8)           # 【书】“尼禄正斜躺在阴凉的柱廊凉亭里”
    _b = TP.FEAT['basin']
    round_pool(F, _b['x'], _b['y'], 0.7, _b['r'] - 0.5, 'water', 'marble', 0.5, 16); cyl(F, _b['x'], _b['y'], 0.1, 0.5, 1.1, 'marble', 8); TP.figure(_b['x'], _b['y'], 1.2, 1.7, ped=0.0)
    for (_x0, _y0, _x1, _y1) in ((-21.0, -10.0, -6.5, 1.5), (6.5, -10.0, 21.0, 1.5), (-21.0, 4.0, -17.5, 16.0), (17.5, 4.0, 21.0, 16.0)):
        if _x0 < _b['x'] < _x1 and _y0 < _b['y'] < _y1:                                        # the basin stands in the south-west bed: leave it a gravel round
            TP.bed(_x0, _y0, _x1, _y1, 0.1, 'grass', hedge_h=0.5)
            cyl(F, _b['x'], _b['y'], 0.1, _b['r'] + 1.3, 0.07, 'gravel', 16, smooth=False)
        else:
            TP.bed(_x0, _y0, _x1, _y1, 0.1, 'grass', hedge_h=0.5)
    PALACE_PLANTS += [(-9.5, -2.0, 0.15, 'pomegr', 0.8), (-12.0, -8.0, 0.15, 'flower', 0.6), (-8.5, -8.0, 0.15, 'shrub', 0.6), (-19.5, 0.0, 0.15, 'flower', 0.6),
                      (9.5, -2.0, 0.15, 'pomegr', 0.8), (12.0, -8.0, 0.15, 'flower', 0.6), (8.5, -8.0, 0.15, 'shrub', 0.6), (19.0, -5.0, 0.15, 'broad', 0.45),
                      (19.5, 0.0, 0.15, 'flower', 0.6), (-19.2, 6.0, 0.15, 'cyp', 0.4), (-19.2, 14.0, 0.15, 'cyp', 0.4), (19.2, 6.0, 0.15, 'cyp', 0.4), (19.2, 14.0, 0.15, 'cyp', 0.4)]
    # fig court W03: the old fig tree's soil bed in the paved court; pomegranate court W14: the tree's bed (the page plants both)
    _f = TP.FEAT['fig']; TP.bed(_f['x0'] + 0.3, _f['y0'] + 0.3, _f['x1'] - 0.3, _f['y1'] - 0.3, 0.1, 'grass', kerb='travertine')
    PALACE_PLANTS.append(((_f['x0'] + _f['x1']) / 2, (_f['y0'] + _f['y1']) / 2, 0.15, 'fig', 1.3))        # 8-9 m: its crown reaches the bedroom's window
    _f = TP.FEAT['pome']; TP.bed(_f['x0'], _f['y0'], _f['x1'], _f['y1'], 0.1, 'grass', kerb='travertine')
    for (_x, _y) in ((-46.0, 39.0), (52.0, 38.0)):                                              # a well in the service court and in the kitchen court
        cyl(F, _x, _y, 0.1, 0.9, 0.9, 'travertine', 10, smooth=False); cyl(F, _x, _y, 0.92, 0.6, 0.1, 'dark', 10, smooth=False)
    # fish-pond garden E18: 【史】 the oval pond, open to the sky, with herms along the path round it; a wall on the east and south
    _o = TP.FEAT['fishpond']; _g = TP.ROOM['E18']; TP.oval_pond(_o['x'], _o['y'], _o['rx'], _o['ry'])
    _ring = lambda a, b, z: [F.p(_o['x'] + a * math.cos(TAU * i / 24), _o['y'] + b * math.sin(TAU * i / 24), z) for i in range(24)]
    _r0, _r1 = _ring(_o['rx'] + 0.6, _o['ry'] + 0.6, 0.14), _ring(_o['rx'] + 2.4, _o['ry'] + 2.4, 0.14)
    for i in range(24):
        add_poly('gravel', [_r0[i], _r0[(i + 1) % 24], _r1[(i + 1) % 24], _r1[i]])
    for i in range(8):
        _a = TAU * (i + 0.5) / 8
        TP.herm(_o['x'] + (_o['rx'] + 2.7) * math.cos(_a), _o['y'] + (_o['ry'] + 2.7) * math.sin(_a), 0.1, rot=math.degrees(_a) + 90)
    box(F, _g['x1'] - 0.35, (_g['y0'] + _g['y1']) / 2, 0.35, 0.5, _g['y1'] - _g['y0'], 1.8, 'plaster'); box(F, _g['x1'] - 0.35, (_g['y0'] + _g['y1']) / 2, 2.15, 0.7, _g['y1'] - _g['y0'], 0.14, 'travertine')
    box(F, (_g['x0'] + _g['x1']) / 2, _g['y0'] + 0.35, 0.35, _g['x1'] - _g['x0'], 0.5, 1.8, 'plaster'); box(F, (_g['x0'] + _g['x1']) / 2, _g['y0'] + 0.35, 2.15, _g['x1'] - _g['x0'], 0.7, 0.14, 'travertine')
    PALACE_PLANTS += [(46.5, -34.5, 0.15, 'cyp', 0.45), (62.5, -34.5, 0.15, 'cyp', 0.45), (46.5, -47.5, 0.15, 'shrub', 0.7), (62.5, -47.5, 0.15, 'shrub', 0.7)]

    # ---- below the platform top (part tib_base): the side door's stair and the underground bath's windows
    TP.part('tib_base')
    # The side door is at the west end of the broad corridor (plan feature doorW). 【书】"我们从宫殿的侧门出去，沿着山坡往下走":
    # a landing in front of the door, and a flight descending NORTH along the west platform wall, outside its buttresses, to the
    # -7 strip. From its foot one walks north along the strip to the north-west corner, where the north-west stair goes down to
    # the street. The strip's south end, which led nowhere, is closed with a parapet.
    _d = TP.FEAT['doorW']; _yd = _d['y']; _xs = -68.1
    box(F, -67.35, _yd, -7.0, 5.3, 3.0, 6.98, 'tuff'); box(F, -67.35, _yd, -0.02, 5.4, 3.1, 0.14, 'stone')
    box(F, -69.8, _yd, 0.12, 0.4, 3.1, 0.9, 'tuff'); box(F, -67.35, _yd - 1.35, 0.12, 5.3, 0.4, 0.9, 'tuff')                  # parapets on the west and south
    _run = (17.5 - 2 * 1.5) / 3                                     # three flights of 13 risers with two landings 1.5 m long (it was one flight of 39)
    for k in range(3):
        ya = _yd + 1.5 + k * (_run + 1.5); zt, zb = -7.0 * k / 3, -7.0 * (k + 1) / 3
        stair_flight(F, _xs, ya + _run, _xs, ya, zb, zt, width=3.0, mat='stone', cheek_mat='tuff')
        if k < 2:                                                   # the upper flights and the landings stand on a solid base
            box(F, _xs, ya + _run / 2, -7.0, 4.2, _run, 6.52 + zb, 'tuff'); yl = ya + _run + 0.75
            box(F, _xs, yl, -7.0, 3.0, 1.5, 6.9 + zb, 'tuff'); box(F, _xs, yl, zb - 0.1, 3.0, 1.52, 0.1, 'stone')
            for sd in (-1, 1):
                box(F, _xs + sd * 1.8, yl, -7.0, 0.6, 1.5, 7.9 + zb, 'tuff')
    box(F, -68.0, _yd - 3.2, -6.88, 6.0, 0.5, 1.0, 'tuff'); box(F, -68.0, _yd - 3.2, -5.88, 6.1, 0.62, 0.14, 'travertine')    # the strip closed south of the landing
    # 【书】地下浴室: three arched windows of the bath under the west side hall, in the upper west platform wall between its
    # buttresses, and the furnace's smoke opening. The wall leans back 0.06 m per metre, so each is a dark panel in a
    # travertine frame standing just proud of the face.
    def _wall_window(y, z, w, h, arch=True):
        x = -65.0 + 0.06 * (z + 7.0) - 0.05; hw = w / 2; zs = z + h - (hw if arch else 0.0)
        pts = [(y - hw, z), (y + hw, z), (y + hw, zs)] + ([(y + hw * math.cos(math.pi * q / 8), zs + hw * math.sin(math.pi * q / 8)) for q in range(1, 8)] if arch else []) + [(y - hw, zs)]
        add_poly('dark', [F.p(x, yy, zz) for yy, zz in pts][::-1])
        fo = [(y - hw - 0.22, z - 0.22), (y + hw + 0.22, z - 0.22), (y + hw + 0.22, zs)] + ([(y + (hw + 0.22) * math.cos(math.pi * q / 8), zs + (hw + 0.22) * math.sin(math.pi * q / 8)) for q in range(1, 8)] if arch else [(y + hw + 0.22, zs + 0.22), (y - hw - 0.22, zs + 0.22)]) + [(y - hw - 0.22, zs)]
        add_poly('travertine', [F.p(x + 0.02, yy, zz) for yy, zz in fo][::-1])
    for _y in (8.5, 17.0, 22.5):          # the brief's y 16.5 and 24 run into the buttresses at y 15 and 25: moved 0.5 and 1.5 m
        _wall_window(_y, -3.6, 1.2, 1.8)
    _wall_window(31.0, -1.8, 0.6, 0.6, arch=False)
if ROUND > 1:
    # ---- plan revision of 2026-11-14
    # the pomegranate court W14: a one-storey colonnade along its west and north sides, 3 m deep, columns 4.0 m, a tiled lean-to
    # falling into the court (【书】“看见我抱着账册从回廊经过”); the north walk stops short of the pomegranate tree's bed
    TP.part('tib_garden'); _c = TP.ROOM['W14']; _pm = TP.FEAT['pome']; _xw, _yn, _xe = _c['x0'] + 3.0, _c['y1'] - 3.0, _pm['x0'] - 1.0
    for _y in [_c['y0'] + 0.5 + i * (_yn - _c['y0'] - 0.5) / 6 for i in range(7)]:
        TP.column(_xw, _y, 0.2, 4.0, 'ionic', 'marble', rot=90.0)
    for _x in [_xw + (i + 1) * (_xe - _xw) / 2 for i in range(2)]:
        TP.column(_x, _yn, 0.2, 4.0, 'ionic', 'marble')
    box(F, _xw, (_c['y0'] + _yn) / 2 + 0.2, 4.2, 0.5, _yn - _c['y0'] + 0.4, 0.35, 'marble'); box(F, (_xw + _xe) / 2, _yn, 4.2, _xe - _xw + 0.5, 0.5, 0.35, 'marble')
    add_poly('tile', [F.p(_c['x0'], _c['y0'], 5.2), F.p(_xw + 0.45, _c['y0'], 4.5), F.p(_xw + 0.45, _yn - 0.45, 4.5), F.p(_c['x0'], _c['y1'], 5.2)])
    add_poly('tile', [F.p(_c['x0'], _c['y1'], 5.2), F.p(_xw + 0.45, _yn - 0.45, 4.5), F.p(_xe + 0.3, _yn - 0.45, 4.5), F.p(_xe + 0.3, _c['y1'], 5.2)])
    for _y in [_c['y0'] + 0.5 + i for i in range(int(_yn - _c['y0']))]:
        beam(F, _c['x0'], _y, 5.25, _xw + 0.45, _y, 4.55, 0.2, 0.1, 'tile')
    for _x in [_xw + 1.0 + i for i in range(int(_xe - _xw))]:
        beam(F, _x, _c['y1'], 5.25, _x, _yn - 0.45, 4.55, 0.2, 0.1, 'tile')
    box(F, _c['x0'] + 1.5, (_c['y0'] + _yn) / 2, 0.1, 3.0, _yn - _c['y0'], 0.1, 'travertine'); box(F, (_xw + _xe) / 2, _c['y1'] - 1.5, 0.1, _xe - _xw, 3.0, 0.1, 'travertine')
    # the service court's north-west door (feature doorNW) in the north front: three steps outside it onto the platform
    TP.part('tib_f1'); _d = TP.FEAT['doorNW']
    for i, (w, dd) in enumerate(((2.8, 0.9), (2.4, 0.6), (2.0, 0.3))):
        box(F, _d['x'], _d['y'] + dd / 2, 0.05 + 0.1 * i, w, dd, 0.1, 'travertine')
    # the sweet-wine workshop's hearth (E16b): a small tiled canopy over its mouth on the kitchen court's side
    _hy = TP.BLOCK['M01']['y0']
    add_poly('tile', [F.p(49.3, _hy, 3.3), F.p(49.3, _hy - 1.1, 2.8), F.p(51.3, _hy - 1.1, 2.8), F.p(51.3, _hy, 3.3)])
    for _x in (49.4, 51.2):
        beam(F, _x, _hy, 2.55, _x, _hy - 1.0, 2.7, 0.1, 0.12, 'wood')
    # the banquet hall's nave (M25): a square opening 3 x 3 m in the middle of its ridge with a kerb 0.3 m high
    # (【书】“屋顶很高，顶上开着一个方口，能看见夜空。”). Drawn as a dark square inside its kerb: the roof under it is not cut.
    TP.part('tib_roof'); _h = TP.BLOCK['M25']; _hx, _hym, _hz = (_h['x0'] + _h['x1']) / 2, (_h['y0'] + _h['y1']) / 2, _h['ridge_z']
    for (cx, cy, sx, sy) in ((_hx, _hym - 1.65, 3.6, 0.3), (_hx, _hym + 1.65, 3.6, 0.3), (_hx - 1.65, _hym, 0.3, 3.0), (_hx + 1.65, _hym, 0.3, 3.0)):
        box(F, cx, cy, _hz - 0.75, sx, sy, 1.05, 'travertine')
    add_poly('dark', [F.p(_hx - 1.5, _hym - 1.5, _hz + 0.24), F.p(_hx + 1.5, _hym - 1.5, _hz + 0.24), F.p(_hx + 1.5, _hym + 1.5, _hz + 0.24), F.p(_hx - 1.5, _hym + 1.5, _hz + 0.24)])

ROOMS_N = {}
if ROUND > 2:
    # ---- the rooms, for the parts file only (step 8 of the brief): a slab per room (room_<id>), partitions, doors, stairs
    ROOMS_N = TP.floors_and_rooms()
    # 2W04 (“我”的屋子) and the bedroom 2T2: a small arch hung with a purple curtain in the wall between them (parts file only)
    TP.part('tib_f2r'); _za = TP.PLAN['levels']['F2']
    for _sd in (-1, 1):
        _xa = TP.ROOM['2W04']['x0'] + _sd * 0.24
        add_poly('porphyry', [F.p(_xa, -45.6, _za + 0.06), F.p(_xa, -44.4, _za + 0.06), F.p(_xa, -44.4, _za + 1.9), F.p(_xa, -44.7, _za + 2.25), F.p(_xa, -45.3, _za + 2.25), F.p(_xa, -45.6, _za + 1.9)][::_sd])
    TP.part('tib_f1r')
    # the state atrium is Corinthian (Vitruvius 6.3.1): ten columns round the impluvium, four on each long side counting the
    # corners and one more in the middle of each short side; they carry the roof's inner edge. The real basins are here too.
    _f = TP.FEAT['impluvium']; _a = TP.BLOCK['M03']; _hc = _a['eaves'] - TP.DROP - 0.5
    for _x in [_f['x0'] + (_f['x1'] - _f['x0']) * i / 3 for i in range(4)]:
        for _y in (_f['y0'], _f['y1']):
            TP.column(_x, _y, 0.06, _hc, 'corinthian', 'marble')
    for _x in (_f['x0'], _f['x1']):
        TP.column(_x, (_f['y0'] + _f['y1']) / 2, 0.06, _hc, 'corinthian', 'marble', rot=90)
    for _b in ((_f['x0'], _f['y0'], _f['x1'], _f['y0']), (_f['x0'], _f['y1'], _f['x1'], _f['y1']), (_f['x0'], _f['y0'], _f['x0'], _f['y1']), (_f['x1'], _f['y0'], _f['x1'], _f['y1'])):
        beam(F, _b[0], _b[1], 0.06 + _hc + 0.22, _b[2], _b[3], 0.06 + _hc + 0.22, 0.7, 0.44, 'marble')
    for _k in ('impluvium', 'impluvium2'):
        _f = TP.FEAT[_k]; _i = 0.9 if _k == 'impluvium' else 0.5
        TP.bed(_f['x0'] + _i, _f['y0'] + _i, _f['x1'] - _i, _f['y1'] - _i, 0.06, 'water', kerb='marble')
    # the banquet hall: two rows of 13 columns between the nave and the aisles, a gilt band wound round the lower third of each.
    # 【书】"屋子很长，两边一排一排的柱子，柱子上缠着金箔"
    _h = TP.ROOM['E07']; _n = TP.BLOCK['M25']; _hh = 7.4
    for _x in (_n['x0'], _n['x1']):
        for i in range(13):
            _y = _h['y0'] + (i + 0.5) * (_h['y1'] - _h['y0']) / 13
            TP.column(_x, _y, 0.06, _hh, 'corinthian', 'marble', rot=90)
            cyl(F, _x, _y, 0.5, _hh / 17 * 1.07, _hh / 3, 'gold', 8, r_top=_hh / 17 * 1.03, caps=False)
        box(F, _x, (_h['y0'] + _h['y1']) / 2, 0.06 + _hh, 0.9, _h['y1'] - _h['y0'], 0.45, 'marble')
    HALL_COLS = 26
    # ---- the basement (part tib_b1): the secret corridor under the peristyle walks with its link to the underground bath
    BASEMENT_N = TP.basement()
    TP.part('tib_b1')
    stair_flight(F, 24.75, -5.0, 24.75, -12.5, -4.0, 0.0, width=1.6, mat='travertine', cheek_mat='plaster', cheeks=False)     # up to the south-east corner of the peristyle walk
    stair_flight(F, -63.5, 26.6, -54.6, 26.6, -5.5, 0.0, width=1.4, mat='travertine', cheek_mat='plaster', cheeks=False)      # down from the west side hall's anteroom (W09) into the bath
TP.part('tib_base')
# ---- ground anchors. The page's terrain under the hill models is the lowest model height in each 4 m cell (tools/pal_rock.mjs
#      -> src/scenes/rome/palrock.js), and the baked street fabric is keyed to that ground. In 27 cells under the platform that
#      lowest point was a piece of the old palace: the floor of a wing (0), the long pool's bottom (-0.33), the belvedere's
#      foundation (-10). A hidden 0.2 m triangle in each keeps the cell at its old height, so the terrain and the bakes stay
#      exactly as they were (check: node tools/test/bake-roads.mjs --check). Drop them at the next re-bake of the fabric.
#      For the same reason nothing of the palace may reach below z = 0.
for _z, _pts in ((0.0, [(-58, y) for y in (34, 26, 22, 18, 14, 10, 6, 2, -6, -14, -18, -26, -34, -42)] + [(-2, y) for y in (42, 30, 26, -10, -22, -26, -30)]),
                 (0.27 - 0.6, [(-2, 6), (-2, 2)]), (-10.0, [(-58, 50), (-58, 46), (-54, 42), (-58, 38)])):
    for _x, _y in _pts:
        add_poly('tuff', [F.p(_x - 0.1, _y - 0.1, _z), F.p(_x + 0.1, _y - 0.1, _z), F.p(_x, _y + 0.1, _z)])

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
PLANTS.extend(PALACE_PLANTS)
NW_STAIR = ROUND > 1
tE = rock_mass(F, [(66, -72), (82, -72), (82, 72), (66, 72)], -36, -13.5, seed=6, strata=4, step=10.0, band=5.0, boulders=3, grid=7.0, mat='rock3')
tS = rock_mass(F, [(-76, -72), (76, -72), (76, -50), (-76, -50)], -36, -13.5, seed=7, strata=4, step=10.0, band=5.0, boulders=3, grid=7.0, mat='rock3')
foot_rocks(F, [(-71, 66), (-71, -56)], (-14.5, -13.0), top_z=CB['top'], seed=11, blocks=3, mat='rock3')   # all the base rock in the darker stain (round 3)     # chunks along the west foot
foot_rocks(F, [(-71, -56), (71, -56)], (-14.5, -13.0), top_z=tS, seed=12, blocks=4, mat='rock3')     # ... south foot
foot_rocks(F, [(71, -56), (71, 66)], (-14.5, -13.0), top_z=tE, seed=13, blocks=3, mat='rock3')       # ... east foot

# ---- the north-west stair carried down to the street (the author, 2026-11-12: "有一个台阶 走到尽头路断了"; briefs/rome/tiberiana-v2-stairs.md).
#      It used to stop on the rock ledge at -27, 20 m above the street. The lower part stays inside the rock's foot outline: two
#      lanes along the north face. The inner one goes east from the old flight's foot, level along the cliff's bench (over the foot
#      of a soil tongue that comes over the rim), then down to a turning landing; the outer one comes back west down the scree
#      to the valley floor at the north-west corner, 6 m from the Vicus Tuscus. Flights as steep as the stair above (0.18 m
#      risers, 0.28 m treads), 3.6 m wide, at most 15 risers, travertine treads on a solid tuff base, a solid parapet with a
#      coping on the open side, buttresses on the outer wall. (A straight flight on, as the upper flights run, would need 38 m
#      to the north; the outline ends 5 m north of the ledge.) At the west end the last flight turns north, down the bank at
#      the rock's foot, to the hem.
#      The page's terrain under this model is the lowest model height in each 4 m cell (tools/pal_rock.mjs) and the street
#      fabric's bake is keyed to it, so nothing here may reach lower than what already stood in its cell: every base goes down
#      to its cell's lowest point and no further (_solid), and where the rock is cut back every face is checked cell by cell (_carve).
#      NW_FLOOR: those lowest points, as pal_rock.mjs sampled them on the hill base accepted on 2026-11-08 (rows: model y of the
#      cell's south edge; columns: cells from x -84 eastward, 4 m each). The check is still the bake: bake-roads.mjs --check.
NW_FLOOR = {
    96: [-45.66, -43.34, -41.70, -40.00, -40.00, -27.27, -28.33, -39.59, -36.74, -23.23, -31.40, -35.13, -38.11, -38.33],
    100: [-46.33, -45.03, -43.45, -42.78, -42.65, -41.65, -41.86, -42.40, -42.40, -29.36, -41.61, -41.43, -41.93, -41.79],
    104: [-47.09, -46.71, -45.39, -45.39, -45.33, -44.91, -44.92, -44.95, -44.28, -44.07, -43.91, -44.27, -44.51, -44.58],
    108: [-47.09, -47.09, -47.09, -47.09, -47.09, -47.09, -47.09, -47.09, -47.09, -47.09, -47.09, -47.09, -47.09, -47.09],
}
if NW_STAIR:
    TP.part('tib_base'); _fl = math.floor
    CELLMIN = {(-21 + k, (-y0 - 4) // 4): z for y0, row in NW_FLOOR.items() for k, z in enumerate(row)}      # keyed as pal_rock.mjs keys its cells: (floor(x / 4), floor(-y / 4))
    _cells = lambda x0, y0, x1, y1: [(i, j) for i in range(_fl(x0 / 4.0), _fl(x1 / 4.0) + 1) for j in range(_fl(-y1 / 4.0), _fl(-y0 / 4.0) + 1)]

    def _solid(x0, y0, x1, y1, ztop, mat='tuff', xs=()):
        """A block from the lowest point of each 4 m cell under it up to ztop (a height or f(x, y)); xs: where the top's slope breaks.
        It is cut at the cells' edges. A piece stops 2 mm short of an edge, so that none of its points is counted in the next cell,
        unless the cell across is at least as deep as its own: then it laps 4 mm over the edge and no joint shows in the wall."""
        zt = ztop if callable(ztop) else (lambda x, y: ztop)
        gx = set(4.0 * i for i in range(_fl(x0 / 4.0) + 1, _fl((x1 - 1e-6) / 4.0) + 1)); cx = sorted(gx | set(x for x in xs if x0 + 0.02 < x < x1 - 0.02) | {x0, x1})
        gy = set(4.0 * j for j in range(_fl(y0 / 4.0) + 1, _fl((y1 - 1e-6) / 4.0) + 1)); cy = sorted(gy | {y0, y1})
        on = lambda v: abs(v / 4.0 - round(v / 4.0)) < 1e-9
        for xa, xb in zip(cx, cx[1:]):
            for ya, yb in zip(cy, cy[1:]):
                (ki, kj), = _cells((xa + xb) / 2, (ya + yb) / 2, (xa + xb) / 2, (ya + yb) / 2); own = CELLMIN[(ki, kj)]
                def edge(v, d, inner, nb):                          # v: the piece's edge, d: +1 if the piece lies on its + side, nb: the cell across
                    return v if not on(v) else v - d * 0.004 if inner and CELLMIN.get(nb, 1e9) <= own else v + d * 0.002
                a, c = edge(xa, 1, xa in gx, (ki - 1, kj)), edge(xb, -1, xb in gx, (ki + 1, kj))
                b, d = edge(ya, 1, ya in gy, (ki, kj + 1)), edge(yb, -1, yb in gy, (ki, kj - 1))
                if max(CELLMIN.get(q, 1e9) for q in _cells(a, b, c, d)) > own:      # (a corner that would lap into a shallower cell: stay inside)
                    a, c, b, d = max(a, xa + 0.002) if on(xa) else a, min(c, xb - 0.002) if on(xb) else c, max(b, ya + 0.002) if on(ya) else b, min(d, yb - 0.002) if on(yb) else d
                if c - a < 0.02 or d - b < 0.02:
                    continue
                zb = own + 0.03; Z = [max(zb, zt(x, y)) for x, y in ((a, b), (c, b), (c, d), (a, d))]
                if max(Z) - zb < 0.05:
                    continue
                v = [F.p(a, b, zb), F.p(c, b, zb), F.p(c, d, zb), F.p(a, d, zb), F.p(a, b, Z[0]), F.p(c, b, Z[1]), F.p(c, d, Z[2]), F.p(a, d, Z[3])]
                add_mesh(mat, v, [(4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])

    def _clip(T, rect):
        """The part of a triangle [(x, y, z)] * 3 inside the rectangle (x0, y0, x1, y1), as a polygon ([] if it does not reach in)."""
        P = T
        for ax, lim, keep_ge in ((0, rect[0], True), (0, rect[2], False), (1, rect[1], True), (1, rect[3], False)):
            Q = []
            for k in range(len(P)):
                a, b = P[k], P[(k + 1) % len(P)]; ia = (a[ax] >= lim) if keep_ge else (a[ax] <= lim); ib = (b[ax] >= lim) if keep_ge else (b[ax] <= lim)
                if ia:
                    Q.append(a)
                if ia != ib:
                    t = (lim - a[ax]) / (b[ax] - a[ax]); Q.append(tuple(a[m] + (b[m] - a[m]) * t for m in range(3)))
            P = Q
            if len(P) < 3:
                return []
        return P

    def _tri_low(T, rect):
        """Lowest z of a triangle inside the rectangle, or None."""
        P = _clip(T, rect); return min(q[2] for q in P) if P else None

    def _carve(boxes, margin=0.15):
        """Cut the rock back where it stands above the stair. boxes: [(x0, y0, x1, y1, f(x, y) -> stair height[, y of the wall
        behind])]. A rock point inside a box comes down to the stair height less the margin. Then every face that moved is checked in every cell it
        reaches (both ways a four-sided face can be split): where its lowest point would lie under the cell's old lowest point,
        the face's points go back where they were. Returns (points moved, [(height left above the stair, x, y)])."""
        MATS = ('rock3', 'rock2', 'rock4', 'turf', 'moss'); key = lambda v: (round(v[0], 3), round(v[1], 3), round(v[2], 3))
        new = {}
        for mat in MATS:
            for v in _bk._G.get(mat, [[]])[0]:
                for bx in boxes:
                    x0, y0, x1, y1, zf = bx[:5]
                    if x0 <= v[0] <= x1 and y0 <= v[1] <= y1 and v[2] > zf(v[0], v[1]) - margin and (key(v) not in new or zf(v[0], v[1]) - margin < new[key(v)][2]):
                        new[key(v)] = [v[0], v[1], zf(v[0], v[1]) - margin, bx[5] if len(bx) > 5 else None]
        for mat in MATS:                                            # a cut point that hangs on a point more than 1 m higher behind the wall goes back into the wall
            V, Fa = _bk._G.get(mat, [[], []])[:2]
            for f in Fa:
                ks = [key(V[k]) for k in f]
                for kk in ks:
                    if kk in new and new[kk][3] is not None and any(k2 not in new and V[k][2] > new[kk][2] + 1.0 and V[k][1] < new[kk][3] for k, k2 in zip(f, ks)):
                        new[kk][1] = new[kk][3]
        frozen = set(); again = True
        fan = lambda Q: [(Q[0], Q[m], Q[m + 1]) for m in range(1, len(Q) - 1)] + ([(Q[1], Q[m], Q[m + 1]) for m in range(2, len(Q) - 1)] + [(Q[1], Q[-1], Q[0])] if len(Q) > 3 else [])
        while again:
            again = False
            for mat in MATS:
                V, Fa = _bk._G.get(mat, [[], []])[:2]
                for f in Fa:
                    ks = [key(V[k]) for k in f]
                    if not any(k in new and k not in frozen for k in ks):
                        continue
                    P0 = [tuple(V[k]) for k in f]; P = [tuple(new[kk][:3]) if (kk in new and kk not in frozen) else q for q, kk in zip(P0, ks)]
                    bad = False
                    for (ci, cj) in _cells(min(p[0] for p in P + P0), min(p[1] for p in P + P0), max(p[0] for p in P + P0), max(p[1] for p in P + P0)):
                        rect = (4.0 * ci, -4.0 * cj - 4.0, 4.0 * ci + 4.0, -4.0 * cj)
                        lows = [z for z in (_tri_low(t, rect) for t in fan(P)) if z is not None]; was = [z for z in (_tri_low(t, rect) for t in fan(P0)) if z is not None]
                        if lows and min(lows) < CELLMIN.get((ci, cj), -47.09) + 0.02 and (not was or min(lows) < min(was) - 1e-4):      # lower than it was, and under the cell's old lowest point
                            bad = True; break
                    if bad:
                        for kk in ks:
                            if kk in new and kk not in frozen:
                                frozen.add(kk); again = True
        moved = 0; left = set()
        for mat in MATS:
            V = _bk._G.get(mat, [[]])[0]
            for k, v in enumerate(V):
                kk = key(v)
                if kk in new:
                    if kk not in frozen:
                        V[k] = tuple(new[kk][:3]); moved += 1
                    else:
                        left.add((round(v[2] - new[kk][2] - margin, 2), round(v[0], 1), round(v[1], 1)))
        iv = _bk._G.get('ivy')                                      # no ivy hanging over the steps
        if iv:
            keep = [(f, sm) for f, sm in zip(iv[1], iv[2]) if not any(x0 <= iv[0][k][0] <= x1 and y0 <= iv[0][k][1] <= y1 for k in f for x0, y0, x1, y1 in (bx[:4] for bx in boxes))]
            iv[1][:] = [f for f, sm in keep]; iv[2][:] = [sm for f, sm in keep]
        return moved, sorted(left, reverse=True)

    def _lin(pts):
        """Piecewise linear z along a lane through [(x, z), ...]."""
        def f(t):
            for (ta, za), (tb, zb) in zip(pts, pts[1:]):
                if min(ta, tb) - 1e-9 <= t <= max(ta, tb) + 1e-9:
                    return za + (zb - za) * (t - ta) / ((tb - ta) or 1e-9)
            return pts[0][1] if abs(t - pts[0][0]) < abs(t - pts[-1][0]) else pts[-1][1]
        return f

    # The page's ground under this model is not those lowest points themselves. pal_rock.mjs lifts each cell toward its neighbours'
    # (at most 2.5 m), the page (palShape, palatine.js) puts the terrain 0.25 m under that, and the Palatine's terrain patch
    # (buildPatch, terrain-roads.js: 3 m cells, 4.7 m on the low tier) is smoothed three times. What is drawn along the north face
    # is a bank that covers whatever lies under it: a first version with its last landing at -44.85 had half the landing and six
    # steps under earth. Measured on the page (W0.gy, model z; desktop tier / low tier):
    #   lane's south edge, y 106.1:   x -66: -42.55 / -42.11   x -70: -43.13 / -42.74   x -71.3: -43.29 / -43.07   x -74.1: -43.72 / -43.64
    #   the hem, y 110.1:             x -74.1: -45.32 / -44.99   x -75.9: -45.48 / -45.21   x -77.7: -45.71 / -45.43
    #   x -74.1, y 109.3 / 109.6 / 109.8:   -45.04, -45.14, -45.22  /  -44.74, -44.83, -44.91
    # So the outer lane stops on a landing just over the bank's top (ZP), and the last flight turns north and goes down the bank
    # to the hem (ZL: its lowest tread; on the desktop tier the ground at its front is 0.2 to 0.6 m lower, on the low tier the east
    # ends of the three lowest treads lie under up to 0.24 m of earth). Check after any change of these numbers or of the page's
    # ground: node tools/plan/tiberiana_stair_ground.mjs <this script's log> [low]   (it reads the NW_TREADS line below).
    YI0, YI1, YO0, YO1 = 102.1, 105.7, 106.1, 109.7                 # the inner lane, the outer lane (3.6 m each, a 0.4 m wall between them)
    YN = YO1 + 0.4                                                  # the outer wall's face: the hem
    Z0, ZW, ZT, ZP, ZL = -25.77, -26.6, -29.3, -43.0, -45.15        # the old flight's foot, the walk along the bench, the turning landing, the last landing, the lowest tread
    XT0, XT1 = -39.1, -35.1                                         # the turning landing
    XP0, XP1 = -74.1, -71.3                                         # the last landing of the outer lane
    XF0 = XP0 - 3.6                                                 # west of it the last flight, going north (its west wall's corner is at the outline's chamfer)
    YF = YO0 + 1.0; NF = 11; RUN = (YN - YF) / NF                   # that flight: a head strip 1 m deep level with the landing, then 11 risers; the lowest tread ends at the hem
    LI = [(-70.6, Z0), (-65.4, Z0), (-64.0, ZW), (XT0 - 4.2, ZW), (XT0, ZT), (XT1, ZT)]                                             # inner lane, going east: 5 risers, the walk, 15 risers
    LO = [(XT1, ZT), (XT0, ZT)] + [q for k in range(5) for q in ((XT0 - 4.2 - 7.0 * k, ZT + (ZP - ZT) * (k + 1) / 5), (XT0 - 7.0 * (k + 1), ZT + (ZP - ZT) * (k + 1) / 5))]   # outer lane, coming back west: five flights of 15 risers, landings 2.8 m
    assert abs(LO[-1][0] - XP0) < 1e-6 and abs(LO[-2][0] - XP1) < 1e-6
    zI, zO = _lin(LI), _lin(LO)
    zF = lambda y: ZP if y <= YF else ZP - (ZP - ZL) * min(NF, math.ceil((y - YF) / RUN - 1e-9)) / NF      # the last flight's treads
    zL = lambda x, y: zO(x) if x >= XP0 else zF(y)
    CUT = _carve([(-70.8, YI0 - 0.2, XT1 + 0.4, YI1 + 0.2, lambda x, y: zI(x)), (XF0 - 0.4, YO0 - 0.2, XT1 + 0.4, YN + 0.2, zL, YO0 - 0.2)])
    LANES = (((-70.4, YI0 + 0.1, XT1 - 0.1, YI1 - 0.1), lambda x, y: zI(x)), ((XF0 + 0.1, YO0 + 0.1, XT1 - 0.1, YO1 - 0.1), zL))
    STANDING = 0                                                    # faces of the hill still more than 0.25 m above the treads inside the lanes (must be 0)
    for mat in ('rock3', 'rock2', 'rock4', 'turf', 'moss'):
        V, Fa = _bk._G.get(mat, [[], []])[:2]
        for f in Fa:
            P = [tuple(V[k]) for k in f]
            STANDING += any(q[2] - zf(q[0], q[1]) > 0.25 for rect, zf in LANES for m in range(1, len(P) - 1) for q in _clip([P[0], P[m], P[m + 1]], rect))
    RISERS = []; TREADS = []                                        # TREADS: every tread and landing [x0, y0, x1, y1, top], for the check against the page's ground

    def _tread(x0, y0, x1, y1, top, foot):                          # a step: solid 0.5 m under the flight's foot, or to its cells' lowest point if that is higher
        bot = max(foot - 0.5, max(CELLMIN[q] for q in _cells(x0, y0, x1, y1)) + 0.03); assert top - bot > 0.1, ('a tread under the ground grid', x0, y0, top, bot)
        box(F, (x0 + x1) / 2, (y0 + y1) / 2, bot, x1 - x0, y1 - y0, top - bot, 'travertine'); TREADS.append([round(t, 3) for t in (x0, y0, x1, y1, top)])

    def _landing(x0, y0, x1, y1, z):
        _solid(x0, y0, x1, y1, z - 0.12); box(F, (x0 + x1) / 2, (y0 + y1) / 2, z - 0.12, x1 - x0, y1 - y0, 0.12, 'travertine'); TREADS.append([round(t, 3) for t in (x0, y0, x1, y1, z)])
    for pts, y0, y1 in ((LI, YI0, YI1), (LO, YO0, YO1)):
        for (xa, za), (xb, zb) in zip(pts, pts[1:]):
            lo, hi = min(xa, xb), max(xa, xb)
            if abs(za - zb) < 1e-6:                                 # a landing: a travertine slab on the base
                if lo < XT0 - 1e-6:                                 # (the turning landing is laid once, below, across both lanes)
                    _landing(lo, y0, hi, y1, za)
            else:                                                   # a flight, the base below it
                xf, zf, xh, zh = (xa, za, xb, zb) if za < zb else (xb, zb, xa, za); n = max(2, int(round((zh - zf) / 0.18))); RISERS.append(n)
                for k in range(n):
                    sa, sb = sorted((xf + (xh - xf) * k / n, xf + (xh - xf) * (k + 1) / n)); _tread(sa, y0, sb, y1, zf + (zh - zf) * (k + 1) / n, zf)
                _solid(lo, y0, hi, y1, zf - 0.5)
    _landing(XT0, YI0, XT1, YO1, ZT)                                # the turning landing, across both lanes
    _landing(XF0, YO0, XP0, YF, ZP)                                 # the last flight's head strip, then its treads; nothing closes its foot
    for k in range(1, NF + 1):
        _tread(XF0, YF + RUN * (k - 1), XP0, YF + RUN * k, ZP - (ZP - ZL) * k / NF, ZL)
    _solid(XF0, YF, XP0, YN, ZL - 0.5); RISERS.append(NF)
    # walls, each a solid block up to 1 m over the treads beside it, with a travertine coping that follows the flights: between the
    # lanes (the inner lane's base and parapet; west of the old flight a parapet against the bank), the outer parapet, the inner
    # lane's cheek against the cliff, the turning landing's end, and the two sides of the last flight
    XI, XO = [q[0] for q in LI], [q[0] for q in LO]

    def _wall(x0, y0, x1, y1, zl, xs, along='x'):
        """A wall 1 m over the lane beside it; zl: the lane's height along the wall (at x, or at y for a wall that runs north), xs: where it breaks."""
        cs = sorted(set(t for t in xs if (x0 if along == 'x' else y0) < t < (x1 if along == 'x' else y1)) | ({x0, x1} if along == 'x' else {y0, y1}))
        if along == 'x':
            _solid(x0, y0, x1, y1, lambda x, y: zl(x) + 1.0, xs=xs)
        for a, c in zip(cs, cs[1:]):
            if along == 'x':
                v = [F.p(x, y, zl(x) + 1.0 + dz) for dz in (0.0, 0.14) for x, y in ((a, y0 - 0.06), (c, y0 - 0.06), (c, y1 + 0.06), (a, y1 + 0.06))]
            else:                                                   # stepped with the treads: level pieces
                z = zl((a + c) / 2) + 1.0; _solid(x0, a, x1, c, z); v = [F.p(x, y, z + dz) for dz in (0.0, 0.14) for x, y in ((x0 - 0.06, a), (x1 + 0.06, a), (x1 + 0.06, c), (x0 - 0.06, c))]
            add_mesh('travertine', v, [(4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7), (3, 2, 1, 0)])
    _wall(-70.6, YI1, XT0, YO0, zI, XI); _wall(XF0 - 0.4, YI1, -70.6, YO0, zO, XO)
    _wall(XP0, YO1, XT1 + 0.4, YN, zO, XO); _wall(-65.4, YI0 - 0.4, XT1 + 0.4, YI0, zI, XI)
    _solid(XT1, YI0, XT1 + 0.4, YO1, ZT + 1.0); box(F, XT1 + 0.2, (YI0 + YO1) / 2, ZT + 1.0, 0.52, YO1 - YI0, 0.14, 'travertine')
    YS = [YF + RUN * k for k in range(0, NF, 3)]                    # the side walls of the last flight step down every third tread
    _wall(XF0 - 0.4, YO0, XF0, YN, lambda y: zF(y + 0.01), YS, along='y')
    _wall(XP0, YF + RUN, XP0 + 0.4, YO1, lambda y: ZP, [], along='y')    # between the last flight and the landing beside it (the landing's edge is the riser onto the first tread: the turn is 1.3 m wide)
    for xb in (-66.0, -58.0, -50.0, -42.0):                         # the outer wall's buttresses, like the platform walls' (0.3 m proud: the rock's foot outline is 0.5 m away at the west one)
        zb = min(zO(xb - 0.7), zO(xb + 0.7)) - 0.25
        _solid(xb - 0.7, YN, xb + 0.7, YN + 0.3, zb); box(F, xb, YN + 0.15, zb, 1.6, 0.4, 0.2, 'travertine')
    PLANTS[:] = [q for q in PLANTS if not (XF0 - 1.2 < q[0] < XT1 + 0.8 and YI0 - 0.6 < q[1] < YN + 0.8)]       # no shrubs on the stair
    FOOT = ((XF0 + XP0) / 2, YN, ZL)                                # the foot: the middle of the lowest tread's front edge, at the hem
    print('NW_STAIR', json.dumps({'flights': len(RISERS), 'risers': RISERS, 'rock points cut back, [height left above the stair, x, y]': CUT, 'hill faces left standing in the lanes': STANDING,
                                   'riser outer lane, last flight': [round((ZT - ZP) / 75, 3), round((ZP - ZL) / NF, 3)], 'last flight tread': round(RUN, 3),
                                   'foot model': [round(t, 2) for t in FOOT], 'foot hill grid lx, lz': [round(-138.4 + FOOT[0], 1), round(-29.8 - FOOT[1], 1)], 'foot page y': round(54.8 + FOOT[2], 2)}))
    print('NW_TREADS', json.dumps(TREADS, separators=(',', ':')))

print('CLIFF', CB['stations'], 'stations', CB['tris'], 'tris')
print('TIB_PLANTS', json.dumps([[round(p[0], 1), round(p[1], 1), round(p[2], 2), p[3], p[4]] for p in PLANTS], separators=(',', ':')))
# the page's stand-in until this file arrives (monuments.js): one box per roof block: x0, y0, x1, y1, wall top, storeys,
# roof (0 flat, 1 ridge east-west, 2 ridge north-south, 3 hipped). Paste it there again when the plan changes.
print('TIB_BLOCKS', json.dumps([[b['x0'], b['y0'], b['x1'], b['y1'], b.get('low', b['eaves']), b['storeys'],
      0 if b['roof'] in ('flat', 'vault', 'compluviate') else 3 if b['roof'] in ('hip', 'pyramid') else
      (1 if b['ridge'] in 'NS' else 2) if b['roof'] == 'lean' else (1 if b['ridge'] == 'EW' else 2)]
      for b in sorted(TP.BL, key=lambda q: q['_depth'])], separators=(',', ':')))
print(TP.report())
print('TIB_PARTS', json.dumps({k: TP.tris(v) for k, v in TP.PARTS.items()}), 'rooms', json.dumps(ROOMS_N))
print('TIB_STATS', json.dumps({k: (round(v, 2) if isinstance(v, float) else v) for k, v in TP.STATS.items()}),
      'highest', max(TP.ridge_z(b) for b in TP.BL), 'openings', len(TP.OPENINGS))
_bk._G = TP.merged(skip=TP.WEB_SKIP)                # the web file: one mesh per material, without the rooms and the basement; the tile ribs' material folded into 'tile'
preview_ground(GROUND)
human(F, 20, 110, GROUND)
if os.environ.get('ROME_DRY'):
    ob = _bk._build_object(NAME)
    print('DRY_TRIS', sum(len(p.vertices) - 2 for p in ob.data.polygons), 'verts', len(ob.data.vertices))
else:
    bpy.context.scene.eevee.taa_render_samples = 8
    finish(NAME, front='+Y', extra_cams=[('north_low', Vector((0.0, 1.0, 0.0)), 6),
           ('west_low', Vector((-1.0, 0.0, 0.0)), 6), ('nw', Vector((-0.7, 0.7, 0.0)), 22)])
    out = os.path.join(_bk.ROOT, 'renders', NAME); lo, hi = (-66.0, -51.0, 0.0), (66.0, 61.0, 17.5)
    TP.shot('top_palace', out, (0, 1), 90, lo, hi, sun=(-0.45, -0.5, 0.75))          # straight down: the roof plan
    TP.shot('se_high', out, (1, -1), 35, lo, hi, sun=(0.25, -0.7, 0.65))              # from the south-east, 35 degrees down
    TP.shot('sw_high', out, (-1, -1), 35, lo, hi, sun=(-0.25, -0.7, 0.65))
    TP.shot('ne_high', out, (1, 1), 35, lo, hi, sun=(0.7, 0.25, 0.65))
    for z in filter(None, os.environ.get('TIB_ZOOM', '').split(';')):      # close-ups: name:dx,dy,elevation,x0,y0,z0,x1,y1,z1[,sx,sy,sz]
        nm, v = z.split(':'); v = [float(t) for t in v.split(',')]
        TP.shot(nm, os.path.join(out, 'zoom'), (v[0], v[1]), v[2], v[3:6], v[6:9], sun=tuple(v[9:12]) if len(v) > 9 else None)
    # the same model with its parts kept apart and the rooms in them (briefs/rome/tiberiana-v2.md, steps 5 and 8)
    web = bpy.data.objects[NAME]
    objs, counts, nroom = TP.export_parts(os.path.join(_bk.ROOT, 'assets', 'models', 'rome', 'parts', NAME + '_parts.glb'), rooms=ROUND > 2)
    print('TIB_PARTS_FILE', json.dumps(counts), 'total', sum(counts.values()), 'room objects', nroom)
    web.hide_render = True
    by = {ob.name: ob for ob in objs}
    def _show(names):
        for ob in bpy.data.objects:
            if ob.name in by or ob.name.startswith('room_'):
                top = ob.parent or ob; ob.hide_render = top.name not in names
    # the ground floor with everything above it lifted off, from the south-east: the rooms against the plan drawing
    # (in these three renders the slabs take the drawing's colours by room type; the file keeps its stone materials)
    TP.tint_rooms()
    _show(('tib_base', 'tib_garden', 'tib_f1'))
    TP.shot('f1_rooms', out, (1, -1), 50, (-66.0, -51.0, 0.0), (66.0, 51.0, 9.0), res=(2000, 1400), sun=(0.25, -0.6, 0.75))
    _show(('tib_base', 'tib_garden', 'tib_f1', 'tib_f2'))
    TP.shot('f2_rooms', out, (1, -1), 50, (-66.0, -51.0, 0.0), (66.0, 51.0, 12.0), res=(2000, 1400), sun=(0.25, -0.6, 0.75))
    _show(('tib_b1',))
    TP.shot('b1_rooms', out, (1, -1), 50, (-66.0, -20.0, -6.0), (30.0, 36.0, 0.0), res=(2000, 1200), sun=(0.25, -0.6, 0.75))
    # the parts 14 m apart in z
    _show(tuple(by))
    for i, ob in enumerate(objs):
        ob.location.z = 14.0 * i
    TP.shot('apart', out, (1, -1), 35, lo, (hi[0], hi[1], hi[2] + 14.0 * (len(objs) - 1)), res=(1600, 1500), sun=(0.25, -0.7, 0.65))
    # the light stand-in the page has inline and shows until this model arrives (assets/models/tiberiana.glb, DT_GLB in build.config.json)
    print('TIB_STANDIN', TP.standin(os.path.join(_bk.ROOT, 'assets', 'models', 'tiberiana.glb'), base=(0.0, 5.0, 130.0, 110.0, 14.0)))
