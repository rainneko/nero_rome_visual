"""rome_transitoria · Nero's east palace (Domus Transitoria), AD 56. Asset front = +X (east, toward the Velia).

v2 (briefs/rome/transitoria-v2.md): the palace above z = 0 is built from the plan (tools/models/rome/transitoria_plan.json,
written and checked by tools/plan/transitoria_plan.py) by tib_plan.py, the module the Domus Tiberiana is built with:
82 rooms, 26 roof blocks, envelope 112 x 92 m, storeys 7.0 / 5.0 / 4.2 m, the east tower with its terrace at 30 m.
Below z = 0 (two stepped terraces on all four sides, the hill base down to z -14) nothing changed.
"""
import os, sys, math, random, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                     # noqa: F401,F403  (box, wall, column, statue, rect_building, ...)
import bpy
import bl_kit as _bk
from mathutils import Vector
import tib_plan as TP

reset()
F = Frame()                          # origin = centre of the palace footprint, z = 0 = ground floor
NAME = 'rome_transitoria'
ROUND = int(os.environ.get('TR_ROUND', '3'))     # 1 massing and roofs, 2 the outside finished, 3 parts and rooms

# ---------------------------------------------------------------- the palace above z = 0, from the plan
# What the plan only notes in words (briefs/rome/transitoria-v2.md, "What is particular to this palace"; the GPT work
# order's section 三). The lean-to roofs give one height (their high edge); they fall 0.24 per metre as the plan's drawings
# show them (tib_plan.LEAN_FALL). Rules that differ from the Tiberiana's: the lower order is 5.6 m, the ground-floor
# windows sit higher in a 7 m storey.
_PAV = {(1, s): (2.0, 3.4, 2.4, 'arch', 12.5) for s in 'NESW'}; _PAV.update({(2, s): (2.0, 2.8, 8.3, 'arch', 12.5) for s in 'NESW'})   # corner pavilions: one large window per storey on each outer face
OPTS = {
    'MT': {'wall_top': 31.0, 'roof': 'own', 'windows': {1: (0.9, 1.7, 3.6, 'rect', 4.0), 2: (0.9, 1.7, 8.4, 'rect', 4.0), 3: (0.9, 1.7, 13.2, 'rect', 4.0)}},        # the tower: shaft to the terrace floor at 30 and its parapet; the terrace and the copper roof are below
    'MNF': {'pediment': 'N', 'gold': True},         # the gate block
    'MNW': {'windows': _PAV, 'gold': True}, 'MNE': {'windows': _PAV, 'gold': True}, 'MSE1': {'windows': _PAV, 'gold': True},
    'MN1': {'open': [(2, 'N', -32.0, -7.0), (2, 'N', 7.0, 32.0)], 'gold': True, 'col_mat': 'grey'},      # 2N01 北敞廊, either side of the gate block
    'MS2': {'open': [(2, 'S', -32.0, 32.0)], 'gold': True, 'col_mat': 'grey'},                          # 2S04 南敞廊
    'MS1': {'windows': {(3, 'S'): (1.2, 2.4, 13.0, 'arch'), (3, 'N'): (1.2, 2.4, 13.0, 'arch')}, 'gold': True},   # the south block's third storey: a row of arched windows
    'MSE2': {'open': [(1, 'S', 38.0, 56.0), (1, 'E', -46.0, -36.0)], 'deck': 'paving'},   # S16 南敞廊 under the terrace 2S16
    'MSW1': {'vault_mat': 'stone', 'windows': {(1, 'W'): (1.6, 2.8, 3.4, 'arch', 7.0)}}, 'MSW2': {'vault_mat': 'stone'},   # the bath: warm grey vaults (the kit has no grey plaster), three arched windows to the west
    # East front (ME3, ME5: flat roofs at 11.6 since the review of round 2): lower order Ionic in pavonazzetto, upper order
    # Corinthian in white marble, 3.8 m, standing on the floor with a stone balustrade between; a beam 0.8 m up to the roof,
    # a stone balustrade round the roof with figures on its piers (below).
    'ME3': {'open': [(1, 'E', 6.0, 24.0), (2, 'E', 6.0, 24.0)], 'col_mat': 'pavonazzetto', 'col_mat2': 'marble', 'order1': 'ionic', 'order': 'corinthian', 'on_floor': True, 'arch2': 0.8, 'rail': 'marble', 'parapet': False, 'deck': 'paving'},
    'ME5': {'open': [(1, 'E', -24.0, -6.0), (2, 'E', -24.0, -6.0)], 'col_mat': 'pavonazzetto', 'col_mat2': 'marble', 'order1': 'ionic', 'order': 'corinthian', 'on_floor': True, 'arch2': 0.8, 'rail': 'marble', 'parapet': False, 'deck': 'paving'},
    # The court's walks keep lean-to roofs: 11.2 at the wall behind, 10.6 at the eaves; the upper order is 3.3 m.
    'MPn': {'col_mat': 'giallo', 'low': 10.6}, 'MPs': {'col_mat': 'giallo', 'low': 10.6}, 'MPe': {'col_mat': 'giallo', 'low': 10.6}, 'MPw': {'col_mat': 'giallo', 'low': 5.6},   # the court: yellow columns
    'ME1': {'gold': True}, 'ME4': {'gold': True},
}
DOORS = {'doorN': (2.8, 4.8, 'arch'), 'doorW': (2.0, 3.2, 'rect'), 'doorS': (2.4, 3.8, 'arch')}
TP.load(os.path.join(TP.HERE, 'transitoria_plan.json'), opts=OPTS, doors=DOORS, prefix='tr',
        rules={'COL1': 5.6, 'WIN1': (0.8, 1.6, 4.2, 'rect'), 'BACK_MAT': 'painted'})     # painted walls behind the colonnades: red dado, an ochre panel per bay
SUNK = TP.FEAT['sunk']; SZ = TP.PLAN['levels']['B1']      # the sunken water court, floor at -4.5
SX0, SY0, SX1, SY1 = SUNK['x0'], SUNK['y0'], SUNK['x1'], SUNK['y1']
TP.massing(order='column' if ROUND > 1 else 'pier', detail=ROUND > 1, court_mats={'P05': 'gravel'}, court_holes={'P05': (SX0, SY0, SX1, SY1)})
TP.PARTS['tr_tower'] = TP.PARTS.pop('tr_f6', {})     # the tower above the third floor is its own part (the builder files a block's top storey under its storey count)

# ---- the court (part tr_garden)
TP.part('tr_garden')
add_poly('paving', [F.p(SX0, SY0, SZ + 0.05), F.p(SX1, SY0, SZ + 0.05), F.p(SX1, SY1, SZ + 0.05), F.p(SX0, SY1, SZ + 0.05)])     # the sunken court's floor
for (ax, ay), (bx, by) in (((SX0, SY0), (SX1, SY0)), ((SX1, SY0), (SX1, SY1)), ((SX1, SY1), (SX0, SY1)), ((SX0, SY1), (SX0, SY0))):
    add_poly('marble', [F.p(ax, ay, SZ), F.p(bx, by, SZ), F.p(bx, by, 0.1), F.p(ax, ay, 0.1)])                            # the four faces of the opening
_pv = TP.FEAT['pav']
if ROUND < 2:                                       # round 1: flat shapes
    cyl(F, _pv['x'], _pv['y'], SZ + 0.05, _pv['r'], 0.12, 'marble', 24)
    for _k in ('basinN', 'basinS'):
        _b = TP.FEAT[_k]; cyl(F, _b['x'], _b['y'], 0.1, _b['r'], 0.1, 'water', 24)
else:
    # the garden round the opening: gravel walks, four lawns in clipped box, the two round basins in the west lawns, tree pits
    # with clipped cypresses (the page plants no trees here yet), statues at the corners of the opening
    _c = TP.ROOM['P05']
    for (x0, y0, x1, y1) in ((_c['x0'] + 1.5, 1.5, SX0 - 2.5, _c['y1'] - 1.5), (_c['x0'] + 1.5, _c['y0'] + 1.5, SX0 - 2.5, -1.5),
                             (SX1 + 2.5, 3.5, _c['x1'] - 1.5, _c['y1'] - 1.5), (SX1 + 2.5, _c['y0'] + 1.5, _c['x1'] - 1.5, -3.5)):
        TP.bed(x0, y0, x1, y1, mat='grass', hedge_h=0.45)
    for _k in ('basinN', 'basinS'):
        _b = TP.FEAT[_k]; cyl(F, _b['x'], _b['y'], 0.12, _b['r'] + 1.2, 0.06, 'gravel', 24); round_pool(F, _b['x'], _b['y'], 0.15, _b['r'], 'water', 'marble', 0.45, 24)
        TP.figure(_b['x'], _b['y'], 0.15, 1.6, ped=0.8)
    for _x in (-23.5, -14.5, 14.5, 23.5):
        for _y in (-15.5, -5.5, 5.5, 15.5):
            if abs(_x) < 20 and abs(abs(_y) - 11.0) < 6.5 and _x < 0:
                continue                             # (the basins stand there)
            TP.bed(_x - 0.9, _y - 0.9, _x + 0.9, _y + 0.9, z0=0.15, mat='turf', kerb='travertine')
            cyl(F, _x, _y, 0.2, 0.75, 4.2, 'hedge', 8, r_top=0.12)
    for _x, _y in ((SX0 - 1.2, SY0 - 0.0), (SX0 - 1.2, SY1), (SX1 + 1.2, SY0), (SX1 + 1.2, SY1)):
        TP.figure(_x, _y - 0.6 * (1 if _y > 0 else -1), 0.1, 2.0)
    # a balustrade round the opening on the north, east and south (the fountain wall closes the west); a gap at the stair's head
    balustrade(F, SX0, SY1, SX1, SY1, 0.1); balustrade(F, SX0 + 1.0, SY0, SX1, SY0, 0.1)
    balustrade(F, SX1, SY0, SX1, 13.6, 0.1); balustrade(F, SX1, 17.0, SX1, SY1, 0.1)
    # the stair down, inside the opening against its east wall: 26 risers from the landing at the north-east corner.
    # (The plan's stair room B05 runs under the garden east of the opening: that needs a cut in the hill base's fill.)
    box(F, 8.9, 15.7, SZ, 2.2, 4.6, 0.1 - SZ, 'travertine')                           # the landing, level with the garden
    stairs(F, 8.9, 13.4 - 26 * 0.4, SZ, 2.2, 26, rise=(0.1 - SZ) / 26, run=0.4, rot=90.0, mat='travertine', cheeks=True, cheek_mat='marble', cheek_h=0.9)
    # the fountain wall on the west: 【史】 a stage front of two tiers of niches with small columns, 36 m long; the lower
    # tier stands in the sunken court, the upper tier rises 3.6 m over the garden; water sheets fall into a long pool at its foot
    _zl, _zu, _zt = SZ + 0.8, 0.0, 3.6
    box(F, SX0 + 0.5, 0, SZ, 1.0, 36.0, _zt - SZ, 'travertine')                       # core
    box(F, SX0 + 1.3, 0, SZ, 1.4, 36.0, 0.8, 'marble')                                # basin ledge
    box(F, SX0 + 1.3, 0, _zu - 0.35, 1.3, 36.0, 0.35, 'marble')                       # band between the tiers
    box(F, SX0 + 0.7, 0, _zt, 1.7, 36.2, 0.4, 'marble'); box(F, SX0 + 0.7, 0, _zt - 0.45, 1.5, 36.0, 0.06, 'gold')     # cornice with a gilt line
    add_poly('water', [F.p(SX0 + 2.0, -17.2, SZ + 0.4), F.p(SX0 + 5.0, -17.2, SZ + 0.4), F.p(SX0 + 5.0, 17.2, SZ + 0.4), F.p(SX0 + 2.0, 17.2, SZ + 0.4)])   # the long pool
    box(F, SX0 + 5.3, 0, SZ, 0.6, 35.0, 0.6, 'marble')                                # its rim
    for i in range(8):                               # eight bays of 4.5 m
        yc = -15.75 + 4.5 * i; lo, hi = ('porphyry', 'giallo') if i % 2 == 0 else ('giallo', 'porphyry')
        for (zb, hc, m) in ((_zl, _zu - 0.35 - _zl - 0.3, lo), (_zu, _zt - 0.45 - _zu - 0.3, hi)):
            for sd in (-1, 1):
                TP.column(SX0 + 1.5, yc + sd * 1.1, zb, hc, 'corinthian', m, rot=90.0)
            box(F, SX0 + 1.4, yc, zb + hc, 0.8, 2.9, 0.3, 'marble')                   # the aedicula's lintel
            add_poly('dark', [F.p(SX0 + 1.02, yc - 0.85, zb), F.p(SX0 + 1.02, yc + 0.85, zb), F.p(SX0 + 1.02, yc + 0.85, zb + hc - 0.2), F.p(SX0 + 1.02, yc - 0.85, zb + hc - 0.2)][::-1])   # the niche
            if i % 2 == 0:
                TP.figure(SX0 + 1.55, yc, zb, hc * 0.62, ped=0.0)
            else:
                add_poly('water', [F.p(SX0 + 1.06, yc - 0.45, zb if zb < 0 else SZ + 0.8), F.p(SX0 + 1.06, yc + 0.45, zb if zb < 0 else SZ + 0.8), F.p(SX0 + 1.06, yc + 0.45, zb + hc - 0.5), F.p(SX0 + 1.06, yc - 0.45, zb + hc - 0.5)][::-1])
    # the twelve-column pavilion on the east half, and a shallow water channel from the pool to it
    TP.tholos(_pv['x'], _pv['y'], SZ + 0.05, R=_pv['r'], n=12, col_h=4.4, plat=0.4, mat='giallo')
    add_poly('water', [F.p(SX0 + 5.6, -0.7, SZ + 0.12), F.p(_pv['x'] - _pv['r'] - 0.6, -0.7, SZ + 0.12), F.p(_pv['x'] - _pv['r'] - 0.6, 0.7, SZ + 0.12), F.p(SX0 + 5.6, 0.7, SZ + 0.12)])
    for _y in (-11.0, 11.0):                         # two beds on the court's floor
        TP.bed(-2.5, _y - 3.0, 4.5, _y + 3.0, z0=SZ + 0.05, mat='grass', hedge_h=0.4)

# ---- the gate's porch in front of the gate block (four columns, a pediment); gilt acroteria
TP.part('tr_f1')
pediment_front(F, 0.0, 46.5, 0.0, 8.0, 4, 6.0, depth=2.4, order='corinthian', mat='marble', tymp_mat='plaster', steps=1, rot=180.0)
if ROUND > 1:
    for _x in (-4.2, 0.0, 4.2):
        sphere(F, _x, 48.6, 8.4 if _x else 9.6, 0.3, 'gold', 8, 5)

    # ---- the tower's top (MT): cornice at the terrace floor (30.0), the terrace open on four sides between corner piers and
    #      bronze posts (the page draws the plate glass and its mullions between them by story state: domus-aurea.js, glaze),
    #      a four-sided copper roof, eaves at 34.0. 【书】 the tower and the lift; nothing of the lift shows outside.
    TP.part('tr_tower'); _t = TP.BLOCK['MT']; _cx, _cy = (_t['x0'] + _t['x1']) / 2, (_t['y0'] + _t['y1']) / 2; _hw = (_t['x1'] - _t['x0']) / 2; ZT, ZE = 30.0, _t['eaves']
    box(F, _cx, _cy, ZT - 0.5, 2 * _hw + 0.7, 2 * _hw + 0.7, 0.5, 'travertine'); box(F, _cx, _cy, ZT - 0.95, 2 * _hw + 0.14, 2 * _hw + 0.14, 0.4, 'gold')     # cornice and the gilt band under it
    add_poly('paving', [F.p(_cx - _hw, _cy - _hw, ZT + 0.02), F.p(_cx + _hw, _cy - _hw, ZT + 0.02), F.p(_cx + _hw, _cy + _hw, ZT + 0.02), F.p(_cx - _hw, _cy + _hw, ZT + 0.02)])
    box(F, _cx, _cy, 31.0, 2 * _hw + 0.2, 2 * _hw + 0.2, 0.1, 'travertine')           # coping of the parapet (the shaft's walls run up to 31.0)
    box(F, _cx, _cy, 30.9, 2 * _hw - 0.9, 2 * _hw - 0.9, 0.22, 'paving')              # (the terrace floor seen through the coping's ring)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(F, _cx + sx * (_hw - 0.35), _cy + sy * (_hw - 0.35), 31.0, 0.7, 0.7, ZE - 0.4 - 31.0, 'travertine')        # corner piers
    box(F, _cx, _cy, ZE - 0.4, 2 * _hw + 0.3, 2 * _hw + 0.3, 0.4, 'bronze'); box(F, _cx, _cy, ZE - 0.46, 2 * _hw + 0.36, 2 * _hw + 0.36, 0.06, 'gold')   # the beam under the eaves, gilt bronze
    _o = _hw + 0.7; _ap = F.p(_cx, _cy, _t['ridge_z'] + 0.3); _ring = [F.p(_cx - _o, _cy - _o, ZE), F.p(_cx + _o, _cy - _o, ZE), F.p(_cx + _o, _cy + _o, ZE), F.p(_cx - _o, _cy + _o, ZE)]
    for k in range(4):
        add_poly('copper', [_ring[k], _ring[(k + 1) % 4], _ap])
        beam(F, _ring[k].x, _ring[k].y, ZE + 0.04, _cx, _cy, _t['ridge_z'] + 0.34, 0.22, 0.12, 'copper')                     # hip rolls
    add_poly('copper', _ring[::-1]); sphere(F, _cx, _cy, _t['ridge_z'] + 0.75, 0.45, 'gold', 8, 6); cyl(F, _cx, _cy, _t['ridge_z'] + 0.2, 0.12, 0.5, 'gold', 6)
    for k in range(4):                               # the shaft, face by face: quoin pilasters, a string course at each landing, three windows a level in travertine frames, brackets under the cornice
        S = F.sub(_cx, _cy, 0, 90.0 * k)
        for sd in (-1, 1):
            box(S, _hw + 0.06, sd * (_hw - 0.45), 0.9, 0.12, 0.9, ZT - 0.95 - 0.9, 'travertine')
        for _z in (7.0, 12.0, 16.6, 21.2, 25.8):
            box(S, _hw + 0.07, 0, _z - 0.18, 0.14, 2 * _hw + 0.14, 0.36, 'travertine')
        for _z in (17.6, 22.2, 26.6):
            for _u in (-4.0, 0.0, 4.0):
                add_poly('dark', [S.p(_hw + 0.03, _u - 0.45, _z), S.p(_hw + 0.03, _u + 0.45, _z), S.p(_hw + 0.03, _u + 0.45, _z + 1.7), S.p(_hw + 0.03, _u - 0.45, _z + 1.7)])
                box(S, _hw + 0.06, _u, _z - 0.16, 0.14, 1.3, 0.16, 'travertine'); box(S, _hw + 0.06, _u, _z + 1.7, 0.14, 1.3, 0.16, 'travertine')
                for sd in (-1, 1):
                    box(S, _hw + 0.06, _u + sd * 0.55, _z, 0.12, 0.2, 1.7, 'travertine')
        for i in range(11):
            box(S, _hw + 0.22, -_hw + 0.6 + i * (2 * _hw - 1.2) / 10, ZT - 1.5, 0.44, 0.3, 0.55, 'travertine')
        for _u in (-1.77, 1.77):                     # the terrace: two bronze posts a side between the corner piers (three lights; the page glazes them)
            box(S, _hw - 0.2, _u, 31.1, 0.12, 0.12, ZE - 0.4 - 31.1, 'bronze')

    # ---- the corner pavilions: a travertine belt between the two windows and quoin strips at the outer corners
    TP.part('tr_f2')
    for _id in ('MNW', 'MNE', 'MSE1'):
        _b = TP.BLOCK[_id]
        for (_s, _x0, _y0, _x1, _y1) in (('W', _b['x0'], _b['y0'], _b['x0'], _b['y1']), ('E', _b['x1'], _b['y0'], _b['x1'], _b['y1']), ('S', _b['x0'], _b['y0'], _b['x1'], _b['y0']), ('N', _b['x0'], _b['y1'], _b['x1'], _b['y1'])):
            if not ((_s == 'W' and _x0 <= -56) or (_s == 'E' and _x0 >= 56) or (_s == 'S' and _y0 <= -46 and False) or (_s == 'N' and _y0 >= 46) or (_id == 'MSE1' and _s == 'E')):
                continue
            ox, oy = TP.OUT[_s]; cx, cy = (_x0 + _x1) / 2 + ox * 0.07, (_y0 + _y1) / 2 + oy * 0.07; L = abs(_x1 - _x0) + abs(_y1 - _y0)
            box(F, cx, cy, 6.7, (L + 0.14) if oy else 0.14, 0.14 if oy else (L + 0.14), 0.5, 'travertine')
            for t in (0.45, L - 0.45):
                px, py = (_x0 + (t if oy else 0.0) + ox * 0.06, _y0 + (0.0 if oy else t) + oy * 0.06)
                box(F, px, py, 0.9, 0.9 if oy else 0.12, 0.12 if oy else 0.9, _b['eaves'] - 1.5 - 0.9, 'travertine')

    # ---- the east colonnade's roof: a stone balustrade with a figure on every second pier
    TP.part('tr_roof')
    for _id in ('ME3', 'ME5'):
        _b = TP.BLOCK[_id]; _e = _b['eaves']
        balustrade(F, _b['x1'] - 0.2, _b['y0'], _b['x1'] - 0.2, _b['y1'], _e, post_every=3.0)
        for _y in range(int(_b['y0']), int(_b['y1']) + 1, 6):
            TP.figure(_b['x1'] - 0.2, _y, _e + 1.0, 1.8, ped=0.0)

    # ---- the raised gallery stub: from the upper colonnade's north-east end (feature doorE) a walkway 3.6 m wide on arches,
    #      three bays to the east, ending in scaffolding. 【书】"廊子架在拱上，从街和神龛的头顶跨过去": only this end was begun.
    TP.part('tr_f2'); _d = TP.FEAT['doorE']; GX0, GX1, GY = _d['x'], _d['x'] + 12.0, _d['y']
    arcade(F, GX0, GY, GX1, GY, 0.0, 6.5, 3.6, 3, 'travertine')
    for _x in (GX0 + 8.0, GX1):                     # the two outer piers stand on the lower terrace
        box(F, _x - 0.5 if _x == GX1 else _x, GY, -5.0 + 0.12, 1.1, 3.6, 5.0 - 0.12, 'travertine')
    box(F, (GX0 + GX1) / 2, GY, 6.5, GX1 - GX0, 3.8, 0.5, 'travertine')               # the deck, level with the upper colonnade's floor (7.0)
    for sd in (-1, 1):
        box(F, (GX0 + GX1) / 2, GY + sd * 1.7, 7.0, GX1 - GX0, 0.3, 0.9, 'plaster')
    for _x in (GX1 + 0.5, GX1 + 2.3):                # scaffolding at the unfinished end: poles, ledgers, a plank deck
        for sd in (-1, 1):
            cyl(F, _x, GY + sd * 1.9, -5.0 + 0.12, 0.09, 13.6, 'wood', 6)
        for _z in (1.5, 4.5, 7.4):
            beam(F, _x, GY - 1.9, _z, _x, GY + 1.9, _z, 0.1, 0.1, 'wood')
    for sd in (-1, 1):
        for _z in (1.5, 4.5, 7.4):
            beam(F, GX1 + 0.5, GY + sd * 1.9, _z, GX1 + 2.3, GY + sd * 1.9, _z, 0.1, 0.1, 'wood')
    box(F, GX1 + 1.4, GY, 7.45, 2.0, 3.6, 0.06, 'wood')

    # ---- the bath vaults: a coping round their springing
    TP.part('tr_roof'); _v1, _v2 = TP.BLOCK['MSW1'], TP.BLOCK['MSW2']; _e = _v1['eaves']
    box(F, _v1['x0'] - 0.05, (_v1['y0'] + _v1['y1']) / 2, _e - 0.1, 0.5, _v1['y1'] - _v1['y0'] + 0.5, 0.3, 'travertine')
    box(F, (_v1['x1'] + _v2['x0']) / 2, (_v1['y0'] + _v1['y1']) / 2, _e - 0.1, 0.6, _v1['y1'] - _v1['y0'], 0.3, 'travertine')
# ---- round 3: the rooms, for the parts file only: a slab per room (room_<id>), partitions, doors, stairs; the rooms under the
#      garden (B02-B05) as part tr_b1; the sunken court B01 is open to the sky and has its floor in tr_garden
ROOMS_N = {}
if ROUND > 2:
    ROOMS_N = TP.floors_and_rooms()
    ROOMS_N['basement'] = TP.basement(skip=('B01',))
    TP.SLABS.append(('tr_garden', 'B01', 'paving', SX0, SY0, SX1, SY1, SZ + 0.04, 0.25))
TP.PART_NAMES = ('tr_base', 'tr_b1', 'tr_garden', 'tr_f1', 'tr_f2', 'tr_f3', 'tr_tower', 'tr_roof')
print('TR_ROOMS', json.dumps(ROOMS_N))
print('TR_BLOCKS', json.dumps([[b['x0'], b['y0'], b['x1'], b['y1'], b.get('low', b['eaves']), b['storeys'], b['roof'], b['ridge']] for b in TP.BL], separators=(',', ':')))
print(TP.report())
print('TR_STATS', json.dumps({k: (round(v, 2) if isinstance(v, float) else v) for k, v in TP.STATS.items()}), 'tower: walls to', TP.wtop(TP.BLOCK['MT'], 'E'), 'eaves', TP.BLOCK['MT']['eaves'], 'apex', TP.BLOCK['MT']['ridge_z'])

TP.part('tr_base')
# Ground anchors, as in rome_tiberiana.py: the page's terrain under a hill model comes from the lowest model height in each
# 4 m cell (tools/pal_rock.mjs) and the street fabric's bake is keyed to it. In two cells under the court's north walk the
# lowest point was a piece of the old palace: two hidden 0.2 m triangles keep those heights. Drop them at the next re-bake.
for _x, _y, _z in ((-2.0, 26.0, -0.102), (-2.0, 22.0, -0.150)):
    add_poly('tuff', [F.p(_x - 0.1, _y - 0.1, _z), F.p(_x + 0.1, _y - 0.1, _z), F.p(_x, _y + 0.1, _z)])

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
box(F, 0, 0, ZB, 20.6, 36.6, 0.5, 'tuff')                           # under the sunken water court (floor z -4.5: transitoria-v2, review of round 1)
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

_bk._G = TP.merged(skip=TP.WEB_SKIP)                # the web file: one mesh per material
print('TR_PARTS', json.dumps({k: TP.tris(v) for k, v in TP.PARTS.items()}), 'total', TP.tris(_bk._G))
if os.environ.get('ROME_DRY'):
    sys.exit(0)
bpy.context.scene.eevee.taa_render_samples = 8      # low-sample previews (memory is tight on the worker Mac)
finish(NAME, front='+X', extra_cams=[('court', Vector((0.6, -0.8, 0.0)), 52), ('south', Vector((-0.3, -1.0, 0.0)), 14)])
out = os.path.join(_bk.ROOT, 'renders', NAME); lo, hi = (-56.0, -46.0, 0.0), (56.0, 46.0, 36.5)
TP.shot('top', out, (0, 1), 90, lo, hi, sun=(-0.45, -0.5, 0.75))                  # straight down: the roof plan
TP.shot('se_high', out, (1, -1), 35, lo, hi, sun=(0.25, -0.7, 0.65))
TP.shot('ne_high', out, (1, 1), 35, lo, hi, sun=(0.7, 0.25, 0.65))
for z in filter(None, os.environ.get('TR_ZOOM', '').split(';')):                  # close-ups: name:dx,dy,elevation,x0,y0,z0,x1,y1,z1[,sx,sy,sz]
    nm, v = z.split(':'); v = [float(t) for t in v.split(',')]
    TP.shot(nm, os.path.join(out, 'zoom'), (v[0], v[1]), v[2], v[3:6], v[6:9], sun=tuple(v[9:12]) if len(v) > 9 else None)
# the same model with its parts kept apart and the rooms in them (briefs/rome/transitoria-v2.md, "Parts")
web = bpy.data.objects[NAME]
objs, counts, nroom = TP.export_parts(os.path.join(_bk.ROOT, 'assets', 'models', 'rome', 'parts', NAME + '_parts.glb'), rooms=ROUND > 2)
print('TR_PARTS_FILE', json.dumps(counts), 'total', sum(counts.values()), 'room objects', nroom)
web.hide_render = True; by = {ob.name: ob for ob in objs}


def _show(names):
    for ob in bpy.data.objects:
        if ob.name in by or ob.name.startswith('room_'):
            top = ob.parent or ob; ob.hide_render = top.name not in names


TP.tint_rooms()                                     # in these renders the slabs take the plan drawing's colours by room type
_show(('tr_base', 'tr_garden', 'tr_f1'))
TP.shot('f1_rooms', out, (1, -1), 50, (-56.0, -46.0, 0.0), (56.0, 46.0, 9.0), res=(2000, 1400), sun=(0.25, -0.6, 0.75))
_show(('tr_base', 'tr_garden', 'tr_f1', 'tr_f2'))
TP.shot('f2_rooms', out, (1, -1), 50, (-56.0, -46.0, 0.0), (56.0, 46.0, 13.0), res=(2000, 1400), sun=(0.25, -0.6, 0.75))
_show(tuple(by))
for i, ob in enumerate(objs):
    ob.location.z = 14.0 * i
TP.shot('apart', out, (1, -1), 35, lo, (hi[0], hi[1], hi[2] + 14.0 * (len(objs) - 1)), res=(1600, 1700), sun=(0.25, -0.7, 0.65))
