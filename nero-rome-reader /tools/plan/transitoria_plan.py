#!/usr/bin/env python3
"""Nero's east palace (Domus Transitoria) v2: rooms per floor and roof blocks as DATA, checked, then written as
   tools/models/rome/transitoria_plan.json   (the model script and, later, Unity read this)
   briefs/rome/plans/transitoria-plan.html   (the drawings: each floor, the roofs, and the floors taken apart)
Model axes as rome_transitoria.py: x east (the Velia), y north (the gate, Forum side), z up; origin = the centre of the
footprint, z 0 = the ground floor (page: 56.7 m). Envelope 112 x 92 m: x -56..56, y -46..46 (unchanged from v1, so the
terraces and the bake stay). Drawing code shared in spirit with tiberiana_plan.py. Run: python3 tools/plan/transitoria_plan.py"""
import json, os, html
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
X0, X1, Y0, Y1 = -56.0, 56.0, -46.0, 46.0
WW, DD = X1 - X0, Y1 - Y0
Z = {'B1': -4.5, 'F1': 0.0, 'F2': 7.0, 'F3': 12.0}            # floor levels
HT = {'B1': 4.0, 'F1': 7.0, 'F2': 5.0, 'F3': 4.2}             # floor to floor
PITCH = 0.40
TYPES = {  # key: (label, colour)
    'state': ('接待·厅堂', '#d4a72c'), 'art': ('乐·画·书', '#c77dbb'), 'work': ('营造署·工坊', '#b08a4a'), 'private': ('皇帝私邸', '#8e63b0'),
    'family': ('客房', '#d48aa6'), 'dining': ('宴饮', '#d0603f'), 'service': ('厨房·仓储·仆役', '#9a8a74'),
    'guard': ('卫兵', '#5f7078'), 'bath': ('浴室', '#45aeb0'),
    'garden': ('花园（露天）', '#74b860'), 'court': ('水庭（露天）', '#9fd0d8'), 'portico': ('柱廊·敞廊', '#e3d6b4'),
    'corridor': ('走廊·过道', '#efe8d6'), 'stair': ('楼梯', '#a9a9a9'), 'terrace': ('屋顶露台', '#f0c48c')}
R = []
def r(fl, i, zh, la, x0, y0, x1, y1, t, note=''):
    R.append(dict(floor=fl, id=i, zh=zh, la=la, x0=x0, y0=y0, x1=x1, y1=y1, type=t, note=note))

# ---------------------------------------------------------------- F1 (z 0, 7 m floor to floor)
# north range: the gate, reception, the picture gallery and the library; the building office in the north-east pavilion
r('F1','N01','门厅','vestibulum',-7,36,7,46,'state','北门，门外是四柱山花门廊，正对门前平台和大阶')
r('F1','N02','唱名·候见','',-20,36,-7,46,'state')
r('F1','N03','衣帽·礼宾','',7,36,20,46,'service')
r('F1','N04','西楼梯','scalae',-32,36,-20,46,'stair')
r('F1','N05','东楼梯','scalae',20,36,32,46,'stair')
r('F1','N06','近卫值房','statio',-44,36,-32,46,'guard')
r('F1','N07','兵器·夜值','',-44,24,-32,36,'guard')
r('F1','N08','长廊口门厅','ostium cryptoporticus',-56,24,-44,46,'corridor','西北角亭。【史】尼禄长廊（cryptoporticus）从提比略宫过来，在这里进东宫；凯撒不出门就能在两座宫之间来往')
r('F1','N09','引见厅','aula',-14,24,14,36,'state','南面三道门开向水庭北廊。彩色大理石拼花地面')
r('F1','N10','画廊','pinacotheca',-32,24,-14,36,'art','【史】维特鲁威 6.4.2：画廊朝北，光线匀')
r('F1','N11','藏书室','bibliotheca',14,24,32,36,'art','希腊文、拉丁文各一半的壁龛书柜')
r('F1','N12','营造署文书房','',32,36,44,46,'work')
r('F1','N13','图纸库','',32,24,44,36,'work')
r('F1','N14','营造署图房','',44,24,56,46,'work','东北角亭。塞维鲁和塞勒画图的地方，北窗和东窗。【书】“在帕拉蒂尼山的东塔底下，我和塞勒一根柱子一根柱子画的”')
# east range: the tower in the middle of the east front, the music hall north of it, the workshop south of it
r('F1','T1','塔底模型厅','',44,-6,56,6,'work','东塔底层，12×12 m。屋子正中是塞勒的泥模；东北角是吊笼的井道。【书】“那个泥模，搁在东塔底下”“宫里东边那座塔，塔里装了一只吊笼”')
r('F1','E01','塔前厅','',32,-6,44,6,'state','从水庭东廊进塔')
r('F1','E02','乐厅','odeum',38,6,50,24,'art','12×18 m，木格天花，一头是低台。设计安排，原文没有这间（书里的击弦琴在旧宫“寝殿的外间”）。【史】尼禄即位后就请琴师特尔普努斯教习（苏维托尼乌斯《尼禄传》20）')
r('F1','E02a','乐器·乐谱室','',32,6,38,24,'art')
r('F1','E03','东柱廊（北段）','porticus',50,6,56,24,'portico','东立面：两层柱廊夹在东塔和角亭之间，不用连拱')
r('F1','E04','模型作坊','officina',38,-24,50,-6,'work','营造署做泥模和木样的地方：长案、泥槽、木工台，北墙一排图板。设计安排（书里“我”的工坊不在宫里）')
r('F1','E04a','料库','',32,-24,38,-6,'work')
r('F1','E05','东柱廊（南段）','porticus',50,-24,56,-6,'portico')
# south range: dining on the court side, service behind; the private bath in the south-west; the morning room in the south-east
r('F1','S01','水榭餐厅','cenatio aestiva',-16,-36,16,-24,'dining','朝北向水庭敞开，对着下沉水庭的喷泉墙。【史】维特鲁威 6.4.2：夏季餐厅朝北')
r('F1','S02','冬季小餐室','triclinium hibernum',-32,-36,-16,-24,'dining')
r('F1','S03','备餐间','',16,-36,32,-24,'service')
r('F1','S04','酒窖·冰窖','apotheca',-32,-46,-16,-36,'service')
r('F1','S05','小厨房','culina',-16,-46,-4,-36,'service','只供这座宫；大宴仍在提比略宫的大餐厅')
r('F1','S06','南门厅','',-4,-46,4,-36,'state','通后花园和阿波罗神庙一侧')
r('F1','S07','试毒·侍者','',4,-46,16,-36,'service','试毒的规矩照旧宫')
r('F1','S08','南楼梯','scalae',16,-46,24,-36,'stair')
r('F1','S09','仆役房','',24,-46,32,-36,'service')
r('F1','S10','热水厅','caldarium',-56,-46,-44,-35,'bath','筒拱顶，西窗')
r('F1','S11','温水池厅','tepidarium',-56,-35,-44,-24,'bath','设计安排，新宫自己的小浴室')
r('F1','S12','更衣·冷水池','apodyterium',-44,-36,-32,-24,'bath')
r('F1','S13','炉房','praefurnium',-44,-46,-32,-36,'service')
r('F1','S14','过道·楼梯','',32,-46,38,-24,'stair','上二层私邸')
r('F1','S15','晨间小餐室','',38,-36,56,-24,'dining','东南角亭底层，东窗和南窗')
r('F1','S16','南敞廊','porticus',38,-46,56,-36,'portico','单层，对着后花园；平顶就是二层的露台')
# west range: one tall storey behind the fountain wall
r('F1','W01','雕塑廊','',-56,8,-32,24,'art')
r('F1','W02','岩洞厅','specus',-44,-8,-32,8,'state','喷泉墙背后的凉厅，墙面嵌浮石和贝壳，水从这里流进水庭')
r('F1','W03','水柜·水机房','castellum',-56,-8,-44,8,'service','供喷泉墙和各处水池')
r('F1','W04','排练厅','',-56,-24,-32,-8,'art','练声、排戏；东门直通水庭')
# the court: porticoes on four sides, the garden, the sunken water court in its middle
r('F1','P01','水庭北廊','porticus',-32,19,32,24,'portico','两层')
r('F1','P02','水庭南廊','porticus',-32,-24,32,-19,'portico','两层')
r('F1','P03','水庭西廊','porticus',-32,-19,-27,19,'portico','单层')
r('F1','P04','水庭东廊','porticus',27,-19,32,19,'portico','两层')
r('F1','P05','庭园','viridarium',-27,-19,27,19,'garden','正中 20×36 m 是下沉 4.5 m 的水庭，四周栏杆。【史】过渡宫的遗存是一处下沉的水庭：一面喷泉墙做成舞台正面的样子，对面是柱子围着的亭，两侧各一间小餐室；彩色大理石拼花地面，拱顶有彩画和贴金灰塑（弗拉维宫餐厅下面，旧称“利维娅浴室”）')
# ---------------------------------------------------------------- F2 (z 7, 5 m): the private floor on the east and south-east
r('F2','2N01','北敞廊','loggia',-32,36,32,46,'portico','俯瞰广场一侧的坡和门前大阶')
r('F2','2N09','地图厅','',-14,24,14,36,'state','设计安排。书里挂世界地图的书房在旧宫')
r('F2','2N10','客房','hospitium',-32,24,-14,36,'family')
r('F2','2N11','藏书上层','',14,24,32,36,'art')
r('F2','2N06','近卫宿舍','',-44,36,-32,46,'guard')
r('F2','2N07','近卫宿舍','',-44,24,-32,36,'guard')
r('F2','2N08','长廊口上层','',-56,24,-44,46,'guard')
r('F2','2N12','誊图室','',32,36,44,46,'work')
r('F2','2N13','誊图室','',32,24,44,36,'work')
r('F2','2N14','营造官居室','',44,24,56,46,'work')
r('F2','2T','吊笼站','',44,-6,56,6,'private','【书】“他从寝殿那一层直接升到塔顶。”')
r('F2','2E01','前室·近卫','',32,-6,44,6,'guard','寝殿和大书房的门都开在这里，近卫守在这里')
r('F2','2E02','大书房','',38,6,50,24,'private','宽大的石案，东窗')
r('F2','2E02a','文书柜间','',32,6,38,24,'private')
r('F2','2E03','东上层廊（北段）','pergula',50,6,56,24,'portico','架空廊子从这一层的东北端出去，往韦利亚。【书】“廊子架在拱上，从街和神龛的头顶跨过去”；这一年只动工了山上这一头')
r('F2','2E04','寝殿','cubiculum',38,-24,50,-6,'private','新寝殿，12×18 m，东窗望韦利亚和埃斯奎利诺山。放在二层是设计安排：原文只写“他从寝殿那一层直接升到塔顶”。旧寝殿（无花果树、陶鹰）仍在提比略宫')
r('F2','2E04a','寝侍·衣帽','',32,-24,38,-6,'private')
r('F2','2E05','东上层廊（南段）','pergula',50,-24,56,-6,'portico')
r('F2','2S15','“我”的书房','',38,-36,56,-24,'private','东南角亭上层。设计安排，原文没有；北墙一道挂帷幔的小拱门通寝殿，照旧宫的样子')
r('F2','2S16','露台','solarium',38,-46,56,-36,'terrace','南敞廊的平顶，矮墙，可张遮阳篷')
r('F2','2S14','过道·楼梯','',32,-46,38,-24,'stair')
r('F2','2S01','上层餐室','cenatio superior',-16,-36,16,-24,'dining')
r('F2','2S02','客房','',-32,-36,-16,-24,'family')
r('F2','2S03','内侍房','',16,-36,32,-24,'service')
r('F2','2S04','南敞廊','loggia',-32,-46,32,-36,'portico','朝南望阿波罗神庙和大竞技场')
r('F2','2P01','水庭北上层廊','pergula',-32,19,32,24,'portico','大理石栏杆')
r('F2','2P02','水庭南上层廊','pergula',-32,-24,32,-19,'portico')
r('F2','2P04','水庭东上层廊','pergula',27,-19,32,19,'portico','寝殿门→前室→这条廊')
# ---------------------------------------------------------------- F3 (z 12, 4.2 m): the tower and the south belvedere
r('F3','3T','塔身','',44,-6,56,6,'private','塔身往上还有三层空筒，只有吊笼井道和一道木梯；塔顶露台地面 +30 m，四面装平板玻璃。【书】“塔顶的露台装上了平板玻璃。”')
r('F3','3S1','南楼观景厅','',-16,-36,16,-24,'state','南窗俯瞰大竞技场')
# ---------------------------------------------------------------- B1 (z -4.5): the sunken water court
r('B1','B01','下沉水庭','',-10,-18,10,18,'court','露天。西墙是喷泉墙（舞台正面式，两层壁龛、小柱、跌水），墙脚一条长水池；东头是十二柱的亭')
r('B1','B02','喷泉墙后水道','',-16,-18,-10,18,'service')
r('B1','B03','凉室（北）','',10,2,22,18,'dining','【史】水庭两侧各一间小餐室')
r('B1','B04','凉室（南）','',10,-18,22,-2,'dining')
r('B1','B05','下水庭的楼梯','scalae',10,-2,22,2,'stair')

# ---------------------------------------------------------------- roof blocks
M = []
def m(i, x0, y0, x1, y1, st, eaves, roof, ridge='', note='', over=''):
    M.append(dict(id=i, x0=x0, y0=y0, x1=x1, y1=y1, storeys=st, eaves=eaves, roof=roof, ridge=ridge, note=note, over=over))
m('MN1',-44,36,44,46,2,12.0,'gable','EW','北立面一排')
m('MNF',-7,36,7,46,2,14.0,'gable','NS','门楼高出 2 m，北面山花',over='MN1')
m('MN2',-44,24,44,36,2,12.0,'gable','EW')
m('MNW',-56,24,-44,46,2,14.0,'hip','NS','西北角亭，檐口高出 2 m')
m('MNE',44,24,56,46,2,14.0,'hip','NS','东北角亭')
m('MT',44,-6,56,6,6,34.0,'pyramid','','东塔：露台地面 30 m，檐口 34 m，四坡铜瓦顶')
m('ME0',32,-6,44,6,2,12.0,'gable','EW')
m('ME1',38,6,50,24,2,12.0,'gable','NS')
m('ME1a',32,6,38,24,2,12.0,'lean','W')
m('ME3',50,6,56,24,2,11.6,'flat','','东立面两层柱廊：平顶，石栏杆，栏杆墩上立像')
m('ME4',38,-24,50,-6,2,12.0,'gable','NS')
m('ME4a',32,-24,38,-6,2,12.0,'lean','W')
m('ME5',50,-24,56,-6,2,11.6,'flat','','同 ME3')
m('MS1',-32,-36,32,-24,3,16.2,'gable','EW','南楼三层')
m('MS2',-32,-46,32,-36,2,12.0,'gable','EW')
m('MSE1',38,-36,56,-24,2,14.0,'hip','EW','东南角亭')
m('MSE2',38,-46,56,-36,1,7.0,'flat','','露台')
m('MSE0',32,-46,38,-24,2,12.0,'lean','W')
m('MSW1',-56,-46,-44,-24,1,8.0,'vault','','浴室筒拱')
m('MSW2',-44,-46,-32,-24,1,8.0,'vault','')
m('MW1',-56,-24,-44,24,1,7.6,'gable','NS','西楼单层高厅')
m('MW2',-44,-24,-32,24,1,7.6,'gable','NS')
m('MPn',-32,19,32,24,2,11.2,'lean','S')
m('MPs',-32,-24,32,-19,2,11.2,'lean','N')
m('MPe',27,-19,32,19,2,11.2,'lean','W')
m('MPw',-32,-19,-27,19,1,6.2,'lean','E')
OPEN = ['P05']
FEATURES = [
    dict(id='sunk', zh='下沉水庭（−4.5 m）', kind='rect', x0=-10, y0=-18, x1=10, y1=18),
    dict(id='pav', zh='十二柱亭', kind='circle', x=5, y=0, r=3.5),
    dict(id='basinN', zh='圆水盆', kind='circle', x=-19, y=11, r=2.5),
    dict(id='basinS', zh='圆水盆', kind='circle', x=-19, y=-11, r=2.5),
    dict(id='lift', zh='吊笼井道', kind='point', x=53, y=3, z=30),
    dict(id='doorN', zh='北门（正门）', kind='door', x=0, y=46, side='N'),
    dict(id='doorW', zh='尼禄长廊口（通提比略宫）', short='长廊口', kind='door', x=-56, y=34.5, side='W'),
    dict(id='doorS', zh='南门（后花园）', kind='door', x=0, y=-46, side='S'),
    dict(id='doorE', zh='架空廊起点（二层，往韦利亚）', short='架空廊', kind='door', x=56, y=21, side='E')]

# ---------------------------------------------------------------- checks
def area(a): return (a['x1'] - a['x0']) * (a['y1'] - a['y0'])
def inter(a, b): return max(0.0, min(a['x1'], b['x1']) - max(a['x0'], b['x0'])) * max(0.0, min(a['y1'], b['y1']) - max(a['y0'], b['y0']))
def inside(a, b): return a['x0'] >= b['x0'] - 1e-6 and a['x1'] <= b['x1'] + 1e-6 and a['y0'] >= b['y0'] - 1e-6 and a['y1'] <= b['y1'] + 1e-6
errs = []; byid = {q['id']: q for q in R}
assert len(byid) == len(R), 'duplicate room id'
for q in R:
    if not (X0 <= q['x0'] < q['x1'] <= X1 and Y0 <= q['y0'] < q['y1'] <= Y1): errs.append('out of bounds: ' + q['id'])
    if q['type'] not in TYPES: errs.append('unknown type: ' + q['id'])
for fl in Z:
    L = [q for q in R if q['floor'] == fl]
    for i, a in enumerate(L):
        for b in L[i + 1:]:
            if inter(a, b) > 0.01: errs.append('overlap on %s: %s / %s' % (fl, a['id'], b['id']))
A1 = sum(area(q) for q in R if q['floor'] == 'F1')
if abs(A1 - WW * DD) > 0.01: errs.append('F1 does not fill the envelope: %.1f' % A1)
for i, a in enumerate(M):
    for b in M[i + 1:]:
        if inter(a, b) > 0.01 and b['over'] != a['id'] and a['over'] != b['id']: errs.append('roof blocks overlap: %s / %s' % (a['id'], b['id']))
AO = sum(area(byid[k]) for k in OPEN); AM = sum(area(q) for q in M if not q['over'])
if abs(AO + AM - WW * DD) > 0.01: errs.append('roofs + open courts do not fill the plan: %.1f + %.1f' % (AM, AO))
for q in M:
    w, d = q['x1'] - q['x0'], q['y1'] - q['y0']
    span = d if q['ridge'] == 'EW' else w if q['ridge'] == 'NS' else min(w, d)
    lim = {'gable': 14, 'hip': 14, 'lean': 7, 'pyramid': 12, 'compluviate': 99, 'flat': 99, 'vault': 12}[q['roof']]
    if q['roof'] == 'lean': span = d if q['ridge'] in 'NS' else w
    if span > lim + 1e-6: errs.append('roof span %.1f over %d m: %s' % (span, lim, q['id']))
    q['span'] = span
    q['ridge_z'] = round(q['eaves'] + (span / 2 * PITCH if q['roof'] in ('gable', 'hip', 'pyramid') else 0), 2)
for q in R:      # an upper room must stand on a block that is tall enough
    if q['floor'] in ('F2', 'F3'):
        need = 2 if q['floor'] == 'F2' else 3
        ok = any(inside(q, b) and (b['storeys'] >= need or (q['type'] == 'terrace' and b['roof'] == 'flat')) for b in M)
        if not ok: errs.append('%s room %s has no block of %d storeys under it' % (q['floor'], q['id'], need))
if errs:
    print('\n'.join(errs)); raise SystemExit(1)
print('checks pass: %d rooms (F1 %d, F2 %d, F3 %d, B1 %d), %d roof blocks, roofed %.0f m2, open %.0f m2' % (
    len(R), *[sum(1 for q in R if q['floor'] == f) for f in ('F1', 'F2', 'F3', 'B1')], len(M), AM, AO))

plan = dict(name='rome_transitoria', version=2, units='m', axes='x east (Velia), y north (gate), z up; origin = centre of the footprint, z 0 = ground floor',
            size=[WW, DD], levels=Z, floor_heights=HT, roof_pitch=PITCH,
            types={k: dict(zh=v[0], colour=v[1]) for k, v in TYPES.items()}, rooms=R, roof_blocks=M, open_courts=OPEN, features=FEATURES)
out = os.path.join(ROOT, 'tools', 'models', 'rome', 'transitoria_plan.json')
json.dump(plan, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('wrote', os.path.relpath(out, ROOT))

# ================================================================ drawings
S = 6.0; MG = 52
def px(x): return MG + (x - X0) * S
def py(y): return MG + (Y1 - y) * S
def esc(s): return html.escape(s, quote=True)
def frame(inner, title):
    w, h = WW * S + 2 * MG, DD * S + 2 * MG
    edge = ('<text x="%g" y="20" class="edge" text-anchor="middle">北 · 门前平台、大阶、罗马广场一侧（正面）</text><text x="%g" y="%g" class="edge" text-anchor="middle">南 · 后花园、阿波罗神庙、大竞技场</text>'
            '<text transform="translate(18,%g) rotate(-90)" class="edge" text-anchor="middle">西 · 提比略宫（经尼禄长廊）</text><text transform="translate(%g,%g) rotate(90)" class="edge" text-anchor="middle">东 · 韦利亚、埃斯奎利诺山</text>'
            % (w / 2, w / 2, h - 10, h / 2, w - 18, h / 2))
    bar = '<g transform="translate(%g,%g)"><path d="M0 0h%gv-5h-%gz" fill="#333"/><path d="M%g 0h%gv-5h-%gz" fill="#fff" stroke="#333"/><text x="0" y="13" class="tiny">0</text><text x="%g" y="13" class="tiny">10</text><text x="%g" y="13" class="tiny">20 m</text></g>' % (
        MG, h - 30, 10 * S, 10 * S, 10 * S, 10 * S, 10 * S, 10 * S - 6, 20 * S - 6)
    return '<svg viewBox="0 0 %g %g" role="img" aria-label="%s"><rect x="%g" y="%g" width="%g" height="%g" class="plate"/>%s%s%s</svg>' % (w, h, esc(title), px(X0), py(Y1), WW * S, DD * S, inner, edge, bar)
def label(q, cls=''):
    w, h = (q['x1'] - q['x0']) * S, (q['y1'] - q['y0']) * S; cx, cy = px((q['x0'] + q['x1']) / 2), py((q['y0'] + q['y1']) / 2); n = len(q['zh'])
    if q['id'] in ('P05',): cy = py(q['y1']) + 17
    if w >= n * 11.5 + 6 and h >= 30: return '<text x="%g" y="%g" class="nm %s">%s</text><text x="%g" y="%g" class="rid %s">%s</text>' % (cx, cy - 1, cls, esc(q['zh']), cx, cy + 12, cls, q['id'])
    if h >= n * 11.5 + 18 and w >= 16: return '<text transform="translate(%g,%g)" class="nm vert %s">%s</text><text x="%g" y="%g" class="rid %s">%s</text>' % (cx, cy - 8, cls, esc(q['zh']), cx, py(q['y0']) - 5, cls, q['id'])
    if w >= 22 and h >= 13: return '<text x="%g" y="%g" class="rid %s">%s</text>' % (cx, cy + 4, cls, q['id'])
    return ''
def room_rect(q, extra=''):
    tip = '%s %s%s｜%s｜%g × %g m%s' % (q['id'], q['zh'], ('（' + q['la'] + '）') if q['la'] else '', TYPES[q['type']][0], q['x1'] - q['x0'], q['y1'] - q['y0'], ('｜' + q['note']) if q['note'] else '')
    return '<g class="room" data-id="%s"><title>%s</title><rect x="%g" y="%g" width="%g" height="%g" fill="%s" %s/>%s</g>' % (
        q['id'], esc(tip), px(q['x0']), py(q['y1']), (q['x1'] - q['x0']) * S, (q['y1'] - q['y0']) * S, TYPES[q['type']][1], extra, label(q))
def feat(fl):
    o = []
    for f in FEATURES:
        if f['kind'] == 'door':
            if fl != 'F1': continue
            x, y = px(f['x']), py(f['y']); dx, dy = {'N': (0, -1), 'S': (0, 1), 'W': (-1, 0), 'E': (1, 0)}[f['side']]
            o.append('<path d="M%g %gL%g %gL%g %gZ" class="door"><title>%s</title></path>' % (x + dx * 16, y + dy * 16, x - dy * 8 + dx * 2, y + dx * 8 + dy * 2, x + dy * 8 + dx * 2, y - dx * 8 + dy * 2, esc(f['zh'])))
            if dx: o.append('<text x="%g" y="%g" class="tiny" text-anchor="middle">%s</text>' % (x + dx * 26, y - 12, esc(f.get('short', f['zh']))))
        elif fl == 'F1' and f['kind'] == 'rect':
            cls = 'sunk' if f['id'] == 'sunk' else 'water'
            o.append('<rect x="%g" y="%g" width="%g" height="%g" class="%s"><title>%s</title></rect>' % (px(f['x0']), py(f['y1']), (f['x1'] - f['x0']) * S, (f['y1'] - f['y0']) * S, cls, esc(f['zh'])))
        elif fl == 'F1' and f['kind'] == 'circle':
            o.append('<circle cx="%g" cy="%g" r="%g" class="%s"><title>%s</title></circle>' % (px(f['x']), py(f['y']), f['r'] * S, 'water' if f['id'].startswith('basin') else 'pav', esc(f['zh'])))
        elif fl == 'F1' and f['kind'] == 'ellipse':
            o.append('<ellipse cx="%g" cy="%g" rx="%g" ry="%g" class="water"><title>%s</title></ellipse>' % (px(f['x']), py(f['y']), f['rx'] * S, f['ry'] * S, esc(f['zh'])))
        elif f['kind'] == 'point' and fl in ('F2', 'ROOF'):
            o.append('<path d="M%g %gl6 10h-12z" class="eagle"><title>%s</title></path><text x="%g" y="%g" class="tiny">吊笼</text>' % (px(f['x']), py(f['y']) - 6, esc(f['zh']), px(f['x']) + 8, py(f['y']) + 4))
    return ''.join(o)
def floor_svg(fl):
    o = []
    if fl != 'F1':   # what is below, faint: the lower roofs you look down on
        for q in R:
            if q['floor'] == 'F1': o.append('<rect x="%g" y="%g" width="%g" height="%g" class="%s"/>' % (px(q['x0']), py(q['y1']), (q['x1'] - q['x0']) * S, (q['y1'] - q['y0']) * S, 'ghost open' if q['id'] in OPEN else 'ghost'))
    for q in R:
        if q['floor'] == fl: o.append(room_rect(q, 'class="open"' if q['id'] in OPEN else ''))
    o.append(feat(fl))
    return frame(''.join(o), {'F1': '一层', 'F2': '二层', 'F3': '三层', 'B1': '地下'}[fl])
ROOFCOL = {'gable': '#c8623f', 'hip': '#c8623f', 'lean': '#d17a55', 'pyramid': '#c8623f', 'compluviate': '#bd5a3a', 'flat': '#dccba6', 'vault': '#cdbda6'}
ROOFZH = {'gable': '人字顶', 'hip': '四坡顶', 'lean': '单坡披檐', 'pyramid': '攒尖顶', 'compluviate': '内坡天井顶', 'flat': '平顶', 'vault': '筒拱顶'}
def roof_svg():
    o = []
    for k in OPEN:
        q = byid[k]; o.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s" class="open"><title>%s（露天）</title></rect>' % (px(q['x0']), py(q['y1']), (q['x1'] - q['x0']) * S, (q['y1'] - q['y0']) * S, TYPES[q['type']][1], esc(q['zh'])))
    for b in sorted(M, key=lambda b: b['eaves']):
        x0, y0, x1, y1 = px(b['x0']), py(b['y1']), px(b['x1']), py(b['y0']); cx, cy = (x0 + x1) / 2, (y0 + y1) / 2; w, h = x1 - x0, y1 - y0
        tip = '%s｜%s｜%d 层｜檐口 %.1f m%s｜%s' % (b['id'], ROOFZH[b['roof']], b['storeys'], b['eaves'], ('，屋脊 %.1f m' % b['ridge_z']) if b['ridge_z'] > b['eaves'] else '', b['note'])
        g = ['<g class="rb"><title>%s</title><rect x="%g" y="%g" width="%g" height="%g" fill="%s"/>' % (esc(tip), x0, y0, w, h, ROOFCOL[b['roof']])]
        if b['roof'] == 'gable': g.append('<path class="ridge" d="M%g %gL%g %g"/>' % ((x0, cy, x1, cy) if b['ridge'] == 'EW' else (cx, y0, cx, y1)))
        elif b['roof'] == 'hip':
            if b['ridge'] == 'EW': k = h / 2; g.append('<path class="ridge" d="M%g %gL%g %gM%g %gL%g %gL%g %gM%g %gL%g %gL%g %g"/>' % (x0 + k, cy, x1 - k, cy, x0, y0, x0 + k, cy, x0, y1, x1, y0, x1 - k, cy, x1, y1))
            else: k = w / 2; g.append('<path class="ridge" d="M%g %gL%g %gM%g %gL%g %gL%g %gM%g %gL%g %gL%g %g"/>' % (cx, y0 + k, cx, y1 - k, x0, y0, cx, y0 + k, x1, y0, x0, y1, cx, y1 - k, x1, y1))
        elif b['roof'] == 'pyramid': g.append('<path class="ridge" d="M%g %gL%g %gM%g %gL%g %g"/>' % (x0, y0, x1, y1, x1, y0, x0, y1))
        elif b['roof'] == 'compluviate':
            ow, oh = min(8 * S, w * .34), min(5 * S, h * .36); g.append('<rect x="%g" y="%g" width="%g" height="%g" class="hole"/><path class="ridge" d="M%g %gL%g %gM%g %gL%g %gM%g %gL%g %gM%g %gL%g %g"/>' % (
                cx - ow / 2, cy - oh / 2, ow, oh, x0, y0, cx - ow / 2, cy - oh / 2, x1, y0, cx + ow / 2, cy - oh / 2, x0, y1, cx - ow / 2, cy + oh / 2, x1, y1, cx + ow / 2, cy + oh / 2))
        elif b['roof'] == 'lean':
            dx, dy = {'N': (0, -1), 'S': (0, 1), 'W': (-1, 0), 'E': (1, 0)}[b['ridge']]; n = max(1, int((w if dy else h) / 70))
            for i in range(n):
                t = (i + .5) / n; ax, ay = (x0 + w * t, cy) if dy else (cx, y0 + h * t); L = min(9, (h if dy else w) * .32)
                g.append('<path class="arrow" d="M%g %gL%g %gM%g %gL%g %gL%g %g"/>' % (ax - dx * L, ay - dy * L, ax + dx * L, ay + dy * L, ax + dx * L - dx * 4 - dy * 3, ay + dy * L - dy * 4 + dx * 3, ax + dx * L, ay + dy * L, ax + dx * L - dx * 4 + dy * 3, ay + dy * L - dy * 4 - dx * 3))
        elif b['roof'] == 'vault':
            for i in range(1, 6): g.append('<path class="ridge thin" d="M%g %gL%g %g"/>' % (x0, y0 + h * i / 6, x1, y0 + h * i / 6))
        if w > 44 and h > 16: g.append('<text x="%g" y="%g" class="rid">%s %.4g</text>' % (cx, cy + (14 if b['roof'] in ('gable', 'hip') and b['ridge'] == 'EW' else 4), b['id'], b['eaves']))
        elif h > 60 and w > 14: g.append('<text transform="translate(%g,%g) rotate(-90)" class="rid">%s %.4g</text>' % (cx + (11 if b['ridge'] == 'NS' and b['roof'] in ('gable', 'hip') else 4), cy, b['id'], b['eaves']))
        o.append(''.join(g) + '</g>')
    o.append(feat('ROOF'))
    return frame(''.join(o), '屋顶')
# ---- the floors taken apart: a view from the south-east, each level its own group
AS = 4.3
def ap(x, y, z): return (0.866 * (x + y) * AS, -(0.5 * (y - x) + z) * AS)
def poly(P, cls, fill=None, tip=None): return '<polygon points="%s" class="%s"%s>%s</polygon>' % (' '.join('%.1f,%.1f' % p for p in P), cls, (' fill="%s"' % fill) if fill else '', ('<title>%s</title>' % esc(tip)) if tip else '')
def shade(c, k):
    v = [int(c[i:i + 2], 16) for i in (1, 3, 5)]; return '#%02x%02x%02x' % tuple(max(0, min(255, int(a * k))) for a in v)
def axo_floor(fl):
    z = Z[fl]; o = []; wh = 1.7
    for q in sorted((q for q in R if q['floor'] == fl), key=lambda q: -((q['y0'] + q['y1']) / 2 - (q['x0'] + q['x1']) / 2)):
        c = TYPES[q['type']][1]; x0, y0, x1, y1 = q['x0'], q['y0'], q['x1'], q['y1']
        o.append(poly([ap(x0, y0, z), ap(x1, y0, z), ap(x1, y1, z), ap(x0, y1, z)], 'pl', c, '%s %s' % (q['id'], q['zh'])))
        if q['id'] not in OPEN and q['type'] not in ('terrace',):
            o.append(poly([ap(x0, y1, z), ap(x1, y1, z), ap(x1, y1, z + wh), ap(x0, y1, z + wh)], 'wl', shade('#f3ead8', .97)))
            o.append(poly([ap(x0, y0, z), ap(x0, y1, z), ap(x0, y1, z + wh), ap(x0, y0, z + wh)], 'wl', shade('#f3ead8', .86)))
    return ''.join(o)
def axo_roof():
    o = []
    for b in sorted(M, key=lambda b: (-((b['y0'] + b['y1']) / 2 - (b['x0'] + b['x1']) / 2), b['eaves'])):
        x0, y0, x1, y1, e, rz = b['x0'], b['y0'], b['x1'], b['y1'], b['eaves'], b['ridge_z']; c = ROOFCOL[b['roof']]; xc, yc = (x0 + x1) / 2, (y0 + y1) / 2; t = '%s %s' % (b['id'], ROOFZH[b['roof']])
        if b['roof'] in ('gable', 'hip'):
            k = (min(x1 - x0, y1 - y0) / 2) if b['roof'] == 'hip' else 0
            if b['ridge'] == 'EW':
                a, d = (x0 + k, yc, rz), (x1 - k, yc, rz)
                o.append(poly([ap(x0, y1, e), ap(x1, y1, e), ap(*d), ap(*a)], 'rf', shade(c, .8), t)); o.append(poly([ap(x0, y0, e), ap(x1, y0, e), ap(*d), ap(*a)], 'rf', c, t))
                o.append(poly([ap(x1, y0, e), ap(x1, y1, e), ap(*d)], 'rf', shade(c if k else '#f3ead8', .9), t))
            else:
                a, d = (xc, y0 + k, rz), (xc, y1 - k, rz)
                o.append(poly([ap(x0, y0, e), ap(x0, y1, e), ap(*d), ap(*a)], 'rf', shade(c, .8), t)); o.append(poly([ap(x1, y0, e), ap(x1, y1, e), ap(*d), ap(*a)], 'rf', c, t))
                o.append(poly([ap(x0, y0, e), ap(x1, y0, e), ap(*a)], 'rf', shade(c if k else '#f3ead8', .9), t))
        elif b['roof'] == 'pyramid':
            top = (xc, yc, rz)
            for P, kk in (([(x0, y1, e), (x1, y1, e), top], .8), ([(x0, y0, e), (x0, y1, e), top], .75), ([(x1, y0, e), (x1, y1, e), top], 1), ([(x0, y0, e), (x1, y0, e), top], .92)): o.append(poly([ap(*p) for p in P], 'rf', shade(c, kk), t))
        elif b['roof'] == 'lean':
            lo = e - (b['span'] * 0.24); zz = {'S': (lo, lo, e, e), 'N': (e, e, lo, lo), 'E': (e, lo, lo, e), 'W': (lo, e, e, lo)}[b['ridge']]
            o.append(poly([ap(x0, y0, zz[0]), ap(x1, y0, zz[1]), ap(x1, y1, zz[2]), ap(x0, y1, zz[3])], 'rf', shade(c, .95), t))
        elif b['roof'] == 'compluviate':
            hx, hy = min(4, (x1 - x0) * .17), min(2.5, (y1 - y0) * .18); lo = e - 1.4
            I = [(xc - hx, yc - hy, lo), (xc + hx, yc - hy, lo), (xc + hx, yc + hy, lo), (xc - hx, yc + hy, lo)]; O = [(x0, y0, e), (x1, y0, e), (x1, y1, e), (x0, y1, e)]
            for i, kk in ((2, .8), (3, .75), (1, 1), (0, .92)): j = (i + 1) % 4; o.append(poly([ap(*O[i]), ap(*O[j]), ap(*I[j]), ap(*I[i])], 'rf', shade(c, kk), t))
        else:
            o.append(poly([ap(x0, y0, e), ap(x1, y0, e), ap(x1, y1, e), ap(x0, y1, e)], 'rf', c, t))
    return ''.join(o)
def axo_svg():
    gap = 24.0; lv = [('F1', 1), ('F2', 2), ('F3', 3)]
    w = 0.866 * (WW + DD) * AS + 40; top = (0.5 * (WW + DD) / 2 + 40 + 3 * gap) * AS + 12; bot = 0.5 * (WW + DD) / 2 * AS + 12
    g = ['<g class="lv" style="--i:%d" data-fl="%s">%s</g>' % (i - 1, fl, axo_floor(fl)) for fl, i in lv]
    g.append('<g class="lv" style="--i:3" data-fl="ROOF">%s</g>' % axo_roof())
    return '<svg id="axo" viewBox="%g %g %g %g" style="--gap:%gpx" role="img" aria-label="分层拆开图">%s</svg>' % (-w / 2, -top, w, top + bot, gap * AS, ''.join(g))

def table():
    o = ['<table><thead><tr><th>编号</th><th>名称</th><th>拉丁名</th><th>功能</th><th>尺寸 (m)</th><th>依据与备注</th></tr></thead><tbody>']
    for fl, zh in (('F1', '一层（地面 0，层高 7 m）'), ('F2', '二层（地面 +7，层高 5 m）'), ('F3', '三层（地面 +12，层高 4.2 m）'), ('B1', '下沉水庭（-4.5）')):
        o.append('<tr class="fl"><td colspan="6">%s</td></tr>' % zh)
        for q in R:
            if q['floor'] == fl: o.append('<tr><td>%s</td><td><i style="background:%s"></i>%s</td><td class="la">%s</td><td>%s</td><td>%g × %g</td><td>%s</td></tr>' % (
                q['id'], TYPES[q['type']][1], esc(q['zh']), esc(q['la']), TYPES[q['type']][0], q['x1'] - q['x0'], q['y1'] - q['y0'], esc(q['note'])))
    return ''.join(o) + '</tbody></table>'
legend = ''.join('<span><i style="background:%s"></i>%s</span>' % (v[1], v[0]) for v in TYPES.values())
PAGE = '''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>尼禄东宫 · 分层功能平面</title><style>
:root{--ink:#2b2622;--mut:#6f665c;--line:#3a322b;--bg:#faf7f1;--card:#fff;--acc:#8a2f1d}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 -apple-system,"PingFang SC","Hiragino Sans GB","Noto Sans SC",sans-serif}
main{max-width:1060px;margin:0 auto;padding:20px 16px 60px}h1{font-size:22px;margin:4px 0 2px}p.sub{color:var(--mut);margin:0 0 14px}
.tabs{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.tabs button{font:inherit;padding:6px 14px;border:1px solid #cfc6b8;background:var(--card);border-radius:999px;cursor:pointer;color:var(--ink)}
.tabs button[aria-selected=true]{background:var(--acc);border-color:var(--acc);color:#fff}
.pane{display:none;background:var(--card);border:1px solid #e2dacd;border-radius:10px;padding:8px}.pane.on{display:block}svg{width:100%;height:auto;display:block}
.plate{fill:#f4efe6;stroke:var(--line);stroke-width:2.4}.room rect{stroke:var(--line);stroke-width:1.1}.room:hover rect{stroke:#000;stroke-width:2.6}.open{stroke-dasharray:5 3}
.ghost{fill:#e9e2d6;stroke:#d5ccbd;stroke-width:.6}.ghost.open{fill:#e3ecd9}
text{font:11px -apple-system,"PingFang SC","Hiragino Sans GB",sans-serif;fill:#1d1916;pointer-events:none}.nm{text-anchor:middle;font-size:11.5px;font-weight:600}.rid{text-anchor:middle;font-size:9.5px;fill:#3d362f}
.vert{writing-mode:vertical-rl;text-anchor:middle}.edge{font-size:12.5px;fill:var(--mut)}.tiny{font-size:10px;fill:var(--mut)}
.water{fill:#7fc4e8;stroke:#2e7fa8;stroke-width:1}.pav{fill:#e9b9a0;stroke:#8a2f1d;stroke-width:1.2}.sunk{fill:#9fd0d8;stroke:#2e7fa8;stroke-width:1.4;stroke-dasharray:4 2;fill-opacity:.75}.door{fill:var(--acc)}.eagle{fill:#5a2d14}
.rb rect{stroke:var(--line);stroke-width:1.1}.ridge{stroke:#5e2414;stroke-width:1.6;fill:none}.ridge.thin{stroke-width:.7}.arrow{stroke:#5e2414;stroke-width:1.2;fill:none}.hole{fill:#f4efe6;stroke:#5e2414}
.pl{stroke:#3a322b;stroke-width:.5}.wl{stroke:#b9ad9a;stroke-width:.4}.rf{stroke:#6b2a18;stroke-width:.5}
#axo .lv{transform:translateY(calc(var(--i) * var(--k,1) * var(--gap) * -1));transition:transform .15s}
.ctl{display:flex;flex-wrap:wrap;gap:14px;align-items:center;padding:6px 8px;color:var(--mut)}.ctl input[type=range]{width:240px}.ctl label{display:flex;gap:5px;align-items:center}
.legend{display:flex;flex-wrap:wrap;gap:4px 14px;margin:12px 2px;font-size:13px}i{display:inline-block;width:12px;height:12px;border:1px solid #0003;border-radius:2px;margin-right:5px;vertical-align:-1px}
.note{background:#fff;border:1px solid #e2dacd;border-left:4px solid var(--acc);border-radius:6px;padding:10px 14px;margin:12px 0}.note ul{margin:4px 0;padding-left:20px}
table{border-collapse:collapse;width:100%;font-size:13px;background:#fff}th,td{border-bottom:1px solid #ebe4d8;padding:5px 8px;text-align:left;vertical-align:top}th{position:sticky;top:0;background:#f1ebe0}
tr.fl td{background:#f6f0e4;font-weight:700}td.la{font-style:italic;color:var(--mut)}.wrap{overflow-x:auto;border:1px solid #e2dacd;border-radius:10px}
</style></head><body><main>
<h1>尼禄东宫（过渡宫）· 分层功能平面</h1>
<p class="sub">方案 v2 草案，2026-11-14。占地 112 × 92 m（不变），正门朝北。把鼠标放到房间上看名称、尺寸和依据。数据文件：<code>tools/models/rome/transitoria_plan.json</code></p>
<div class="note"><b>这座宫是干什么的</b><ul>
<li>提比略宫是继承来的官邸：朝会、宴会、文书、卫队、内眷都在那里，旧寝殿（无花果树、陶鹰屋顶）也在那里。东宫不重复这些。</li>
<li>东宫是尼禄自己要的那一座：东塔和吊笼、营造署（塞勒的泥模、图房和模型作坊）、乐厅和排练厅、画廊和藏书室、水庭和夏天的餐厅、新寝殿。没有朝会殿，没有大宴会厅，没有内眷区，卫兵只守门和寝殿前室。</li>
<li>【史】苏维托尼乌斯《尼禄传》31：他造了一座从帕拉蒂尼山一直到埃斯奎利诺山的宅子，起先叫“过渡宫”。塔西佗《编年史》15.39：64 年大火烧掉了他用来把帕拉蒂尼山和梅塞纳斯花园连起来的那座宅子。【书】小说里没有“过渡宫”这个名字，写的是“宫里东边那座塔”和从山上这一头起的架空廊子。</li>
<li>只有东塔、吊笼、塔底泥模、塔底画图是书里写的；其余房间是设计安排。待作者定：东宫二层是不是另有一间新寝殿（依据“他从寝殿那一层直接升到塔顶”）。</li></ul></div>
<div class="note"><b>形制</b><ul>
<li>两层为主：一层 7 m，二层 5 m。只有东塔（露台地面 30 m）和南楼正中一段到三层。四个角各一座角亭，檐口高出 2 m。</li>
<li>东立面：两层柱廊夹在东塔和两座角亭之间，原来的两层连拱去掉。</li>
<li>正中是庭园，庭园正中下沉 4.5 m 的水庭：西面喷泉墙，东头柱亭，两侧凉室。</li>
<li>每条屋脊跨度不超过 14 m；没有烟囱和老虎窗。</li></ul></div>
<div class="tabs" role="tablist">__TABS__</div>
__PANES__
<div class="legend">__LEGEND__</div>
<h2 style="font-size:17px;margin:22px 0 8px">房间表</h2><div class="wrap">__TABLE__</div>
</main><script>
const tabs=[...document.querySelectorAll('.tabs button')],panes=[...document.querySelectorAll('.pane')];
tabs.forEach((b,i)=>b.onclick=()=>{tabs.forEach((t,j)=>t.setAttribute('aria-selected',i===j));panes.forEach((p,j)=>p.classList.toggle('on',i===j));});
const ax=document.getElementById('axo'),k=document.getElementById('k');if(k){const f=()=>ax.style.setProperty('--k',k.value);k.oninput=f;f();}
document.querySelectorAll('.ctl input[type=checkbox]').forEach(c=>c.onchange=()=>{ax.querySelector('[data-fl="'+c.value+'"]').style.display=c.checked?'':'none';});
</script></body></html>'''
names = [('拆开看', None), ('一层', 'F1'), ('二层', 'F2'), ('三层', 'F3'), ('屋顶', 'ROOF'), ('下沉水庭', 'B1')]
tabs = ''.join('<button role="tab" aria-selected="%s">%s</button>' % ('true' if i == 0 else 'false', n) for i, (n, _) in enumerate(names))
ctl = '<div class="ctl"><label>拆开 <input id="k" type="range" min="0" max="1" step="0.01" value="1"> 合上</label>' + ''.join(
    '<label><input type="checkbox" value="%s" checked>%s</label>' % (v, n) for n, v in (('屋顶', 'ROOF'), ('三层', 'F3'), ('二层', 'F2'), ('一层', 'F1'))) + '<span>从东南往西北看；房间只画了后面两道矮墙</span></div>'
ctl = ctl.replace('拆开 <input', '合上 <input').replace('> 合上</label>', '> 拆开</label>')
panes = ''.join('<div class="pane%s">%s</div>' % (' on' if i == 0 else '', (ctl + axo_svg()) if v is None else roof_svg() if v == 'ROOF' else floor_svg(v)) for i, (n, v) in enumerate(names))
page = PAGE.replace('__TABS__', tabs).replace('__PANES__', panes).replace('__LEGEND__', legend).replace('__TABLE__', table())
out2 = os.path.join(ROOT, 'briefs', 'rome', 'plans', 'transitoria-plan.html'); open(out2, 'w', encoding='utf-8').write(page); print('wrote', os.path.relpath(out2, ROOT), len(page), 'bytes')
