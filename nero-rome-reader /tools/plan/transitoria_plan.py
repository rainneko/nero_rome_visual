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
r('F1','S05','小厨房','culina',-16,-46,-4,-36,'service','只管日常和冬季小餐室的饭；菜经酒窖进小餐室（v3 B9）')
r('F1','S06','南门厅','',-4,-46,4,-36,'state','通后花园和阿波罗神庙一侧')
r('F1','S07','仆役·试毒','',4,-46,16,-36,'service','试毒的规矩照旧宫')
r('F1','S08','南楼梯','scalae',16,-46,24,-36,'stair')
r('F1','S09','大厨房','culina',24,-46,32,-36,'service','大宴的饭在这里做，菜经备餐间进餐厅；南墙高处出烟（v3 B9）【设】')
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

# ---------------------------------------------------------------- doors and the ways up and down (briefs/rome/transitoria-interior.md, 三-五)
# The door list was laid out route by route (正路, 长廊路, 内路, 工路, 役路) and checked on 2026-11-20 (91 doors + 7 vertical links,
# every room reachable from N01). Plan section 五.1 asks for three doors from the audience hall N09 to the court's north walk:
# the two side doors are added here (N09-P01 three times, 93 doors in all).
# Sizes (五): the main route 2.4 x 3.6 m, the servants' way 1.2 x 2.2 m, the rest 1.6 x 2.6 m; a portico's side toward the court
# (or toward the next portico) is columns, no wall: kind 'open', as wide as the shared side. 'at' = the door's middle along its wall
# (x on an east-west wall, y on a north-south one); without it the middle of the shared side. Heights from the floor slab's top.
SLAB = 0.06                                      # floor slabs: top 0.06 above the level (as tib_plan.floors_and_rooms)
WALL_T = 0.45                                    # partitions
SIZE = {'main': (2.4, 3.6), 'room': (1.6, 2.6), 'service': (1.2, 2.2)}
DOOR_LIST = [   # (room a, room b, size, kind, at)
    # F1: the main route, north gate to south gate (正路)
    ('N01', 'N09', 'main', 'arch', 0.0), ('N09', 'P01', 'main', 'arch', 0.0), ('N09', 'P01', 'room', 'doorway', -8.0), ('N09', 'P01', 'room', 'doorway', 8.0),
    ('S01', 'P02', 'main', 'arch', 0.0), ('S06', 'S01', 'main', 'arch', 0.0),
    ('N01', 'N02', 'room', 'doorway', None), ('N01', 'N03', 'room', 'doorway', None),
    ('N04', 'N02', 'room', 'doorway', 38.4), ('N05', 'N03', 'room', 'doorway', 38.4), ('N06', 'N04', 'room', 'doorway', 38.4), ('N12', 'N05', 'room', 'doorway', 38.4),
    # the gallery way from the Domus Tiberiana (长廊路) and the guards
    ('N06', 'N07', 'room', 'doorway', None), ('N07', 'N08', 'room', 'doorway', None), ('N08', 'W01', 'room', 'doorway', None), ('W01', 'P03', 'room', 'doorway', None),
    ('N10', 'P01', 'room', 'doorway', None), ('N11', 'P01', 'room', 'doorway', None),
    ('W02', 'P03', 'room', 'doorway', None), ('W03', 'W02', 'room', 'doorway', None), ('W04', 'P03', 'room', 'doorway', None),
    # the south range, the bath, the servants' way (役路)
    ('S02', 'P02', 'room', 'doorway', None), ('S12', 'S02', 'room', 'doorway', None), ('S12', 'S11', 'room', 'doorway', None), ('S11', 'S10', 'room', 'doorway', None),
    ('S13', 'S04', 'service', 'doorway', None), ('S04', 'S05', 'service', 'doorway', None), ('S04', 'S02', 'service', 'doorway', -24.0), ('S09', 'S03', 'service', 'doorway', 28.0), ('S07', 'S08', 'service', 'doorway', -44.6),   # v3 B9: the two kitchens serve without crossing the south vestibule (S05-S06 closed)
    ('S07', 'S06', 'service', 'doorway', None), ('S07', 'S01', 'service', 'doorway', None), ('S03', 'S01', 'service', 'doorway', None),
    ('S03', 'S08', 'service', 'doorway', 20.7), ('S09', 'S08', 'service', 'doorway', -40.0), ('S14', 'S03', 'service', 'doorway', -30.0),
    ('S14', 'S15', 'room', 'doorway', -26.2), ('S14', 'S16', 'room', 'doorway', -43.6), ('S15', 'S16', 'room', 'doorway', None),
    # the east range: the tower, the workshops (工路), the music hall
    ('E01', 'P04', 'room', 'doorway', None), ('E01', 'T1', 'room', 'doorway', None), ('T1', 'E04', 'room', 'doorway', None), ('E04', 'E04a', 'room', 'doorway', None),
    ('E04a', 'P04', 'room', 'doorway', None), ('E04', 'E05', 'room', 'doorway', None), ('E02', 'E02a', 'room', 'doorway', None), ('E02a', 'P04', 'room', 'doorway', None),
    ('E02', 'E03', 'room', 'doorway', None), ('N14', 'E03', 'room', 'doorway', None), ('N14', 'N13', 'room', 'doorway', None), ('N13', 'N12', 'room', 'doorway', None),
    # the court: porticoes open to one another and to the garden
    ('P01', 'P03', 'open', 'open', None), ('P01', 'P04', 'open', 'open', None), ('P02', 'P03', 'open', 'open', None), ('P02', 'P04', 'open', 'open', None),
    ('P01', 'P05', 'open', 'open', None), ('P02', 'P05', 'open', 'open', None), ('P03', 'P05', 'open', 'open', None), ('P04', 'P05', 'open', 'open', None),
    # B1: the sunken court and its side rooms (B02-B05 stay solid in the web model until step 3: data only)
    ('B05', 'B01', 'room', 'doorway', None), ('B03', 'B01', 'room', 'doorway', None), ('B04', 'B01', 'room', 'doorway', None), ('B02', 'B01', 'room', 'doorway', None),
    # F2: the private way (内路), the guards, the building office
    ('2E04', '2T', 'room', 'doorway', None), ('2T', '2E02', 'room', 'doorway', None), ('2E04', '2S15', 'room', 'arch', None), ('2E04', '2E04a', 'room', 'doorway', None),
    ('2E04a', '2S14', 'room', 'doorway', 35.0), ('2T', '2E01', 'room', 'doorway', None), ('2E01', '2P04', 'room', 'doorway', None),
    ('2E02', '2E02a', 'room', 'doorway', None), ('2E02a', '2P04', 'room', 'doorway', None), ('2E02', '2E03', 'room', 'doorway', None), ('2E04', '2E05', 'room', 'doorway', None),
    ('2S15', '2S14', 'room', 'doorway', -26.2), ('2S16', '2S14', 'room', 'doorway', -43.6), ('2S15', '2S16', 'room', 'doorway', None),
    ('2S03', '2S14', 'service', 'doorway', -30.0), ('2S03', '2P02', 'service', 'doorway', None),
    ('2S01', '2P02', 'room', 'doorway', 0.0), ('2S01', '2S04', 'room', 'doorway', 0.0), ('2S02', '2P02', 'room', 'doorway', None),
    ('2N09', '2N01', 'room', 'doorway', None), ('2N09', '2P01', 'room', 'doorway', None), ('2N10', '2P01', 'room', 'doorway', None), ('2N11', '2P01', 'room', 'doorway', None),
    ('2N06', '2N01', 'room', 'doorway', None), ('2N06', '2N07', 'room', 'doorway', None), ('2N07', '2N08', 'room', 'doorway', None),
    ('2N12', '2N01', 'room', 'doorway', None), ('2N12', '2N13', 'room', 'doorway', None), ('2N13', '2N14', 'room', 'doorway', None), ('2N14', '2E03', 'room', 'doorway', None),
    ('2P01', '2P04', 'open', 'open', None), ('2P02', '2P04', 'open', 'open', None)]

# The ways up and down (四). A flight: its plan rectangle, the side it climbs toward ('up'), its first and last height, risers, tread.
# The two flights of a stair stand side by side, never one over the other; under each flight it is solid, and the landing is a solid
# block at half height. 'hole': the opening in the floor above, over the upper flight; 'rails': the solid parapets (1.5 m high,
# standing on the upper floor) on the opening's open sides, each x0, y0, x1, y1.
RISE_MAX, TREAD, RAIL_H, RAIL_T = 0.185, 0.30, 1.5, 0.2
IN = WALL_T / 2; F1 = Z['F1'] + SLAB; F2 = Z['F2'] + SLAB; F3 = Z['F3'] + SLAB
def _flight(x0, y0, x1, y1, up, z0, z1, n):
    return dict(x0=round(x0, 4), y0=round(y0, 4), x1=round(x1, 4), y1=round(y1, 4), up=up, z0=round(z0, 4), z1=round(z1, 4), risers=n, riser=round((z1 - z0) / n, 5), tread=TREAD)
def _two(sid, zh, room, to, foot, side0, width, landing, up, s):
    """A two-flight stair from F1 to F2, 19 + 19 risers: flight A has its foot at `foot` (x for up E/W, y for up N/S) and its side
    at `side0`..`side0 + width`; it climbs toward `up` over 18 treads to a landing `landing` deep; flight B, beside it on side s
    (+1 higher x / y, -1 lower), climbs back to the upper floor and ends over A's foot."""
    zm = (F1 + F2) / 2; run = 18 * TREAD; d = 1 if up in 'EN' else -1; back = {'E': 'W', 'W': 'E', 'N': 'S', 'S': 'N'}[up]
    t = foot + d * run; l = t + d * landing; b0 = side0 + width if s > 0 else side0 - width
    lo, hi = min(foot, t), max(foot, t); l0, l1 = min(t, l), max(t, l); s0, s1 = min(side0, b0), max(side0, b0) + width
    if up in 'EW':
        A = _flight(lo, side0, hi, side0 + width, up, F1, zm, 19); B = _flight(lo, b0, hi, b0 + width, back, zm, F2, 19)
        L = dict(x0=round(l0, 4), y0=round(s0, 4), x1=round(l1, 4), y1=round(s1, 4), z=round(zm, 4))
        ext = (RAIL_T, 0) if up == 'W' else (0, RAIL_T)       # the long rails reach over the landing end
        rails = [(B['x0'] - ext[0], B['y0'] - RAIL_T, B['x1'] + ext[1], B['y0']), (B['x0'] - ext[0], B['y1'], B['x1'] + ext[1], B['y1'] + RAIL_T),
                 (t - RAIL_T, B['y0'], t, B['y1']) if up == 'W' else (t, B['y0'], t + RAIL_T, B['y1'])]
    else:
        A = _flight(side0, lo, side0 + width, hi, up, F1, zm, 19); B = _flight(b0, lo, b0 + width, hi, back, zm, F2, 19)
        L = dict(x0=round(s0, 4), y0=round(l0, 4), x1=round(s1, 4), y1=round(l1, 4), z=round(zm, 4))
        ext = (RAIL_T, 0) if up == 'S' else (0, RAIL_T)
        rails = [(B['x0'] - RAIL_T, B['y0'] - ext[0], B['x0'], B['y1'] + ext[1]), (B['x1'], B['y0'] - ext[0], B['x1'] + RAIL_T, B['y1'] + ext[1]),
                 (B['x0'], t - RAIL_T, B['x1'], t) if up == 'S' else (B['x0'], t, B['x1'], t + RAIL_T)]
    return dict(id=sid, zh=zh, room=room, to=to, kind='stair', width=width, flights=[A, B], landings=[L],
                hole=dict(x0=B['x0'], y0=B['y0'], x1=B['x1'], y1=B['y1']), rails=[[round(v, 4) for v in q] for q in rails])
VERTICAL = [
    # 西楼梯 / 东楼梯: flight A along the north wall climbs toward the palace's end, the landing against the room's end wall, flight B
    # beside it (south) climbs back and comes out on the loggia 2N01. The doors (from N02 / N03 and the guards' N06 / the office N12)
    # open onto the free strip along the south wall; the foot of A is reached past the head of B.
    _two('N04~2N01', '西楼梯', 'N04', '2N01', -22.6, 43.0, 2.4, 3.775, 'W', -1),
    _two('N05~2N01', '东楼梯', 'N05', '2N01', 22.6, 43.0, 2.4, 3.775, 'E', -1),
    # 南楼梯: two flights along y, 3 m wide. Flight A climbs south from the door of the serving room S03, the landing against the south
    # wall, flight B (west of A) climbs back north to the south loggia 2S04. A 1.55 m strip along the east wall leads from the servants'
    # room S09 to the foot.
    _two('S08~2S04', '南楼梯', 'S08', '2S04', -37.225, 19.225, 3.0, 3.015, 'S', -1),
    # 过道楼梯: one straight run of 38 risers against the east wall with a landing half way; the 3 m passage beside it (west) joins the
    # serving room, the morning room and the south portico. Out at the top (north) to the wardrobe 2E04a, the study 2S15, the
    # chamberlains' room 2S03; the terrace door is reached along the west side of the opening.
    dict(id='S14~2S14', zh='过道楼梯', room='S14', to='2S14', kind='stair', width=2.4,
         flights=[_flight(35.375, -41.5, 37.775, -36.1, 'N', F1, (F1 + F2) / 2, 19), _flight(35.375, -33.7, 37.775, -28.3, 'N', (F1 + F2) / 2, F2, 19)],
         landings=[dict(x0=35.375, y0=-36.1, x1=37.775, y1=-33.7, z=round((F1 + F2) / 2, 4))], hole=dict(x0=35.375, y0=-33.7, x1=37.775, y1=-28.3),
         rails=[[35.175, -33.9, 35.375, -28.3], [35.375, -33.9, 37.775, -33.7]], passage=[32.225, -45.64, 35.375, -24.225]),
    # 观景厅的梯 (new): one run of 28 risers, 1.5 m wide, against the inside of the upper dining room's east wall, up to the belvedere.
    dict(id='2S01~3S1', zh='观景厅的梯', room='2S01', to='3S1', kind='stair', width=1.5,
         flights=[_flight(16 - IN - 1.5, -34.5, 16 - IN, -34.5 + 27 * TREAD, 'N', F2, F3, 28)], landings=[],
         hole=dict(x0=round(16 - IN - 1.5, 4), y0=-34.5, x1=round(16 - IN, 4), y1=round(-34.5 + 27 * TREAD, 4)),
         rails=[[round(16 - IN - 1.5 - RAIL_T, 4), -34.7, round(16 - IN - 1.5, 4), round(-34.5 + 27 * TREAD, 4)], [round(16 - IN - 1.5, 4), -34.7, round(16 - IN, 4), -34.5]]),
    # 下水庭的楼梯: one run from the garden (0.1) down to the sunken court's floor (-4.45). Plan 四 says 24 risers: 4.55 m in 24 is
    # 0.19 a riser, over the 0.185 limit, so 25. Data only: B05 lies in the web model's solid fill; the web model's own stair inside the
    # sunken court (rome_transitoria.py: 26 risers of 0.177 on 0.4 m, 2.2 m wide, along x 8.9) is the way down until step 3.
    dict(id='P05~B05', zh='下水庭的楼梯', room='B05', to='P05', kind='stair', width=3.4, built=False,
         flights=[_flight(12.0, -1.7, 12.0 + 24 * TREAD, 1.7, 'W', Z['B1'] + 0.05, 0.1, 25)], landings=[], hole=None, rails=[]),
    # 吊笼: from the bedroom floor (2T) to the tower top (+30). Not walked: a click, step 4.
    dict(id='2T~3T', zh='吊笼', room='2T', to='3T', kind='lift', built=False, stops=[Z['F2'], 30.0], flights=[], landings=[], hole=None, rails=[])]

def shared(a, b):
    """The wall two rooms of one floor share: ('x', x, lo, hi) for a north-south wall, ('y', y, lo, hi) for an east-west one, or None."""
    if a['floor'] != b['floor']:
        return None
    for x in (a['x1'], a['x0']):
        if x == (b['x0'] if x == a['x1'] else b['x1']):
            lo, hi = max(a['y0'], b['y0']), min(a['y1'], b['y1'])
            if hi > lo: return ('x', x, lo, hi)
    for y in (a['y1'], a['y0']):
        if y == (b['y0'] if y == a['y1'] else b['y1']):
            lo, hi = max(a['x0'], b['x0']), min(a['x1'], b['x1'])
            if hi > lo: return ('y', y, lo, hi)
    return None
DOORS = []; derr = []; _span = {}
for a, b, size, kind, at in DOOR_LIST:
    if a not in byid or b not in byid:
        derr.append('door %s-%s: unknown room' % (a, b)); continue
    s = shared(byid[a], byid[b])
    if not s:
        derr.append('door %s-%s: the two rooms share no wall' % (a, b)); continue
    ax, c, lo, hi = s; L = hi - lo; fl = byid[a]['floor']
    if kind == 'open':
        w, h, u = L, HT[fl], (lo + hi) / 2
    else:
        w, h = SIZE[size]; u = (lo + hi) / 2 if at is None else at
        if L < w + 0.6 - 1e-6: derr.append('door %s-%s: they share %.2f m of wall, the door needs %.2f' % (a, b, L, w + 0.6))
        if u - w / 2 < lo + 0.3 - 1e-6 or u + w / 2 > hi - 0.3 + 1e-6: derr.append('door %s-%s: %.2f m wide at %.2f is not within %g..%g with 0.3 m to spare' % (a, b, w, u, lo, hi))
    n = sum(1 for d in DOORS if d['a'] == a and d['b'] == b); x, y = (c, u) if ax == 'x' else (u, c)
    DOORS.append(dict(id='%s-%s' % (a, b) + ('#%d' % (n + 1) if n else ''), a=a, b=b, floor=fl, z=round(Z[fl] + (SLAB if fl != 'B1' else 0.05), 3), wall=ax,
                      x=round(x, 3), y=round(y, 3), w=w, h=h, kind=kind, route={'main': 'main', 'service': 'service'}.get(size, '')))
    _span[DOORS[-1]['id']] = (lo, hi)
for i, d in enumerate(DOORS):           # two doors on one wall must not run into each other
    for e in DOORS[i + 1:]:
        if d['floor'] == e['floor'] and d['wall'] == e['wall'] and 'open' not in (d['kind'], e['kind']):
            if ((d['x'] == e['x']) if d['wall'] == 'x' else (d['y'] == e['y'])):
                u, v = (d['y'], e['y']) if d['wall'] == 'x' else (d['x'], e['x'])
                if abs(u - v) < (d['w'] + e['w']) / 2 + 0.6: derr.append('doors %s and %s run into each other' % (d['id'], e['id']))

def _clear(r):
    """A room's clear floor: the partitions take WALL_T / 2 on each side, the outer wall's skin 0.36 (tib_plan.SKIN)."""
    return (r['x0'] + (0.36 if r['x0'] <= X0 else IN), r['y0'] + (0.36 if r['y0'] <= Y0 else IN), r['x1'] - (0.36 if r['x1'] >= X1 else IN), r['y1'] - (0.36 if r['y1'] >= Y1 else IN))
def _within(q, box, tol=1e-6): return q[0] >= box[0] - tol and q[1] >= box[1] - tol and q[2] <= box[2] + tol and q[3] <= box[3] + tol
def _over(p, q): return min(p[2], q[2]) - max(p[0], q[0]) > 1e-6 and min(p[3], q[3]) - max(p[1], q[1]) > 1e-6
WANT = {'N04~2N01': (2, 19, 2.4), 'N05~2N01': (2, 19, 2.4), 'S08~2S04': (2, 19, 3.0), 'S14~2S14': (2, 19, 2.4), '2S01~3S1': (1, 28, 1.5), 'P05~B05': (1, 25, 3.4)}
for v in VERTICAL:
    if v['room'] not in byid or v['to'] not in byid:
        derr.append('%s: unknown room' % v['id']); continue
    if v['kind'] != 'stair':
        continue
    r = byid[v['room']]; up = byid[v['to']]; box = _clear(r); n, nr, wd = WANT[v['id']]; built = v.get('built', True)
    if len(v['flights']) != n: derr.append('%s: %d flights, the plan has %d' % (v['id'], len(v['flights']), n))
    for f in v['flights']:
        fb = (f['x0'], f['y0'], f['x1'], f['y1']); ew = f['up'] in 'EW'; width = (f['y1'] - f['y0']) if ew else (f['x1'] - f['x0']); run = (f['x1'] - f['x0']) if ew else (f['y1'] - f['y0'])
        if f['riser'] > RISE_MAX + 1e-9: derr.append('%s: riser %.4f m, over %.3f' % (v['id'], f['riser'], RISE_MAX))
        if abs(f['tread'] - TREAD) > 1e-9 or abs(run - (f['risers'] - 1) * TREAD) > 1e-3: derr.append('%s: a run of %.3f m is not %d treads of %.2f' % (v['id'], run, f['risers'] - 1, TREAD))
        if f['risers'] != nr: derr.append('%s: %d risers a flight, the plan has %d' % (v['id'], f['risers'], nr))
        if abs(width - wd) > 1e-6: derr.append('%s: %.2f m wide, the plan has %.2f' % (v['id'], width, wd))
        if built and not _within(fb, box): derr.append('%s: flight %s leaves the stair room\'s clear floor %s' % (v['id'], fb, box))
        for d in DOORS:                 # a door into the stair room opens onto floor, not onto a flight (0.6 m in front of it)
            if d['floor'] != r['floor'] or v['room'] not in (d['a'], d['b']) or d['kind'] == 'open': continue
            hw = d['w'] / 2; db = (d['x'] - (0.6 if d['wall'] == 'x' else hw), d['y'] - (hw if d['wall'] == 'x' else 0.6), d['x'] + (0.6 if d['wall'] == 'x' else hw), d['y'] + (hw if d['wall'] == 'x' else 0.6))
            if built and _over(db, fb): derr.append('%s: door %s opens onto a flight' % (v['id'], d['id']))
    for L in v['landings']:
        if built and not _within((L['x0'], L['y0'], L['x1'], L['y1']), box): derr.append('%s: the landing leaves the stair room' % v['id'])
    for i, f in enumerate(v['flights']):        # side by side, never stacked
        for g in v['flights'][i + 1:]:
            if _over((f['x0'], f['y0'], f['x1'], f['y1']), (g['x0'], g['y0'], g['x1'], g['y1'])): derr.append('%s: two flights overlap in plan' % v['id'])
    z_a = Z[r['floor']] + (SLAB if r['floor'] != 'B1' else 0.05); z_b = 0.1 if v['to'] == 'P05' else Z[up['floor']] + SLAB
    zs = sorted([f['z0'] for f in v['flights']] + [f['z1'] for f in v['flights']])
    if abs(zs[0] - min(z_a, z_b)) > 1e-3 or abs(zs[-1] - max(z_a, z_b)) > 1e-3: derr.append('%s: the flights run %.3f..%.3f, the floors are at %.3f and %.3f' % (v['id'], zs[0], zs[-1], z_a, z_b))
    if not built:
        continue
    h = v['hole']; zc = Z[up['floor']] + SLAB - 0.3              # the underside of the floor above
    if not _within((h['x0'], h['y0'], h['x1'], h['y1']), (up['x0'], up['y0'], up['x1'], up['y1'])): derr.append('%s: the opening leaves the room above' % v['id'])
    for f in v['flights']:                      # 2.1 m of headroom over every tread, or the opening over it
        for i in range(f['risers'] - 1):
            t = (i + 0.5) / (f['risers'] - 1); zt = f['z0'] + f['riser'] * (i + 1)
            if f['up'] in 'EW':
                px = f['x0'] + (f['x1'] - f['x0']) * (t if f['up'] == 'E' else 1 - t); pts = [(px, f['y0'] + 0.05), (px, f['y1'] - 0.05)]
            else:
                py = f['y0'] + (f['y1'] - f['y0']) * (t if f['up'] == 'N' else 1 - t); pts = [(f['x0'] + 0.05, py), (f['x1'] - 0.05, py)]
            if any(not (h['x0'] - 1e-6 <= px <= h['x1'] + 1e-6 and h['y0'] - 1e-6 <= py <= h['y1'] + 1e-6) and zc - zt < 2.1 for px, py in pts):
                derr.append('%s: %.2f m of headroom over tread %d' % (v['id'], zc - zt, i + 1)); break
    for q in v['rails']:
        if _over(q, (h['x0'], h['y0'], h['x1'], h['y1'])): derr.append('%s: a parapet stands in the opening' % v['id'])
    if 'passage' in v and v['passage'][2] - v['passage'][0] < 3.0 - 1e-6: derr.append('%s: the passage beside the stair is under 3 m' % v['id'])

G = {q['id']: set() for q in R}         # every room reachable from the north gate's hall through the doors and the ways up and down
for d in DOORS: G[d['a']].add(d['b']); G[d['b']].add(d['a'])
for v in VERTICAL: G[v['room']].add(v['to']); G[v['to']].add(v['room'])
seen, st = set(), ['N01']
while st:
    k = st.pop()
    if k not in seen: seen.add(k); st += list(G[k])
miss = [q['id'] for q in R if q['id'] not in seen]
if miss: derr.append('not reachable from N01: ' + ' '.join(miss))
if derr:
    print('\n'.join(derr)); raise SystemExit(1)
print('door checks pass: %d doors (%d main, %d service, %d open), %d ways up and down; %d/%d rooms reachable from N01' % (
    len(DOORS), sum(d['route'] == 'main' for d in DOORS), sum(d['route'] == 'service' for d in DOORS), sum(d['kind'] == 'open' for d in DOORS), len(VERTICAL), len(seen), len(R)))

plan = dict(name='rome_transitoria', version=2, units='m', axes='x east (Velia), y north (gate), z up; origin = centre of the footprint, z 0 = ground floor',
            size=[WW, DD], levels=Z, floor_heights=HT, roof_pitch=PITCH,
            types={k: dict(zh=v[0], colour=v[1]) for k, v in TYPES.items()}, rooms=R, roof_blocks=M, open_courts=OPEN, features=FEATURES,
            doors=DOORS, vertical=VERTICAL)
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
    o.append(feat(fl)); o.append(ways(fl)); o.append(doors_svg(fl))
    return frame(''.join(o), {'F1': '一层', 'F2': '二层', 'F3': '三层', 'B1': '地下'}[fl])
def doors_svg(fl):
    """The doors of a floor: a gap in the wall (white, dark jambs), the main route's red, the servants' grey; an open side dotted."""
    o = []
    for d in DOORS:
        if d['floor'] != fl: continue
        hw = d['w'] / 2; (x0, y0, x1, y1) = (d['x'], d['y'] - hw, d['x'], d['y'] + hw) if d['wall'] == 'x' else (d['x'] - hw, d['y'], d['x'] + hw, d['y'])
        tip = esc('%s ↔ %s｜%s %.1f × %.1f m' % (byid[d['a']]['zh'], byid[d['b']]['zh'], {'arch': '拱门', 'doorway': '门洞', 'open': '敞开（柱子）'}[d['kind']], d['w'], d['h']))
        if d['kind'] == 'open':
            o.append('<path d="M%g %gL%g %g" class="dopen"><title>%s</title></path>' % (px(x0), py(y0), px(x1), py(y1), tip)); continue
        cls = 'dmain' if d['route'] == 'main' else 'dserv' if d['route'] == 'service' else 'dgap'
        nx, ny = (4, 0) if d['wall'] == 'x' else (0, 4)
        o.append('<g class="dr"><title>%s</title><path d="M%g %gL%g %g" class="%s"/><path d="M%g %gL%g %gM%g %gL%g %g" class="djamb"/></g>' % (
            tip, px(x0), py(y0), px(x1), py(y1), cls, px(x0) - nx, py(y0) - ny, px(x0) + nx, py(y0) + ny, px(x1) - nx, py(y1) - ny, px(x1) + nx, py(y1) + ny))
    return ''.join(o)
def ways(fl):
    """The stairs on the floor they start from: each flight with its treads and an arrow up; the landing; on the floor above, the
    opening (hatched) and its parapets."""
    o = []
    for v in VERTICAL:
        lo, hi = byid[v['room']]['floor'], byid[v['to']]['floor']
        if v['kind'] == 'lift':
            if fl in (lo, 'F1'):
                f = next(f for f in FEATURES if f['id'] == 'lift'); o.append('<rect x="%g" y="%g" width="%g" height="%g" class="lift"><title>%s（%s，第 4 步）</title></rect>' % (px(f['x'] - 1.5), py(f['y'] + 1.5), 3 * S, 3 * S, esc(v['zh']), '二层 ↔ 塔顶 +30 m'))
            continue
        tag = '' if v.get('built', True) else '（只有数据，网页模型里暂用下沉水庭里原有的梯）'
        if fl == lo or (v['id'] == 'P05~B05' and fl == 'B1'):
            for L in v['landings']:
                o.append('<rect x="%g" y="%g" width="%g" height="%g" class="landing"><title>平台 +%.2f m</title></rect>' % (px(L['x0']), py(L['y1']), (L['x1'] - L['x0']) * S, (L['y1'] - L['y0']) * S, L['z']))
            for f in v['flights']:
                g = ['<g class="flight"><title>%s：%d 级，踢面 %.3f m，踏面 %.2f m，宽 %.1f m，%.2f → %.2f m%s</title><rect x="%g" y="%g" width="%g" height="%g"/>' % (
                    esc(v['zh']), f['risers'], f['riser'], f['tread'], v['width'], f['z0'], f['z1'], tag, px(f['x0']), py(f['y1']), (f['x1'] - f['x0']) * S, (f['y1'] - f['y0']) * S)]
                ew = f['up'] in 'EW'; n = f['risers'] - 1
                for i in range(1, n + 1):
                    if ew: xx = f['x0'] + i * TREAD; g.append('<path d="M%g %gL%g %g" class="tread"/>' % (px(xx), py(f['y0']), px(xx), py(f['y1'])))
                    else: yy = f['y0'] + i * TREAD; g.append('<path d="M%g %gL%g %g" class="tread"/>' % (px(f['x0']), py(yy), px(f['x1']), py(yy)))
                cx, cy = (f['x0'] + f['x1']) / 2, (f['y0'] + f['y1']) / 2; d = {'E': (1, 0), 'W': (-1, 0), 'N': (0, 1), 'S': (0, -1)}[f['up']]
                half = ((f['x1'] - f['x0']) if ew else (f['y1'] - f['y0'])) / 2 - 0.4
                ax, ay, bx, by = px(cx - d[0] * half), py(cy - d[1] * half), px(cx + d[0] * half), py(cy + d[1] * half); ux, uy = d[0], -d[1]
                g.append('<path d="M%g %gL%g %gM%g %gL%g %gL%g %g" class="up"/>' % (ax, ay, bx, by, bx - ux * 7 - uy * 4, by - uy * 7 + ux * 4, bx, by, bx - ux * 7 + uy * 4, by - uy * 7 - ux * 4))
                g.append('<text x="%g" y="%g" class="upt">上</text></g>' % (bx + ux * 8 + (0 if ux else 7), by + uy * 8 + (4 if ux else 0)))
                o.append(''.join(g))
        if fl == hi and v.get('hole'):
            h = v['hole']; a0, b0, a1, b1 = px(h['x0']), py(h['y1']), px(h['x1']), py(h['y0'])
            o.append('<g class="hole2"><title>%s的梯口（楼板在这里开洞，下面是梯）</title><rect x="%g" y="%g" width="%g" height="%g"/><path d="M%g %gL%g %gM%g %gL%g %g"/></g>' % (esc(v['zh']), a0, b0, a1 - a0, b1 - b0, a0, b0, a1, b1, a0, b1, a1, b0))
            for q in v['rails']:
                o.append('<rect x="%g" y="%g" width="%g" height="%g" class="rail"><title>栏板 1.5 m</title></rect>' % (px(q[0]), py(q[3]), max(1.2, (q[2] - q[0]) * S), max(1.2, (q[3] - q[1]) * S)))
    return ''.join(o)
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
.water{fill:#7fc4e8;stroke:#2e7fa8;stroke-width:1}.pav{fill:#e9b9a0;stroke:#8a2f1d;stroke-width:1.2}.sunk{fill:#9fd0d8;stroke:#2e7fa8;stroke-width:1.4;stroke-dasharray:4 2;fill-opacity:.75}.door{fill:var(--acc)}.dgap{stroke:#fff;stroke-width:4.5}.dmain{stroke:#fff;stroke-width:6}.dserv{stroke:#fff;stroke-width:3.2}.djamb{stroke:#2b2622;stroke-width:1.6}.dr:hover .djamb{stroke:#c00}.dopen{stroke:#fff;stroke-width:2;stroke-dasharray:2 3}
.flight rect{fill:#d9d4cb;stroke:#4a4038;stroke-width:1}.tread{stroke:#7d7368;stroke-width:.5}.up{stroke:#8a2f1d;stroke-width:1.6;fill:none}.upt{font-size:9px;fill:#8a2f1d;font-weight:700}.landing{fill:#cbc4b8;stroke:#4a4038;stroke-width:1}.hole2 rect{fill:#f7f3ea;stroke:#4a4038;stroke-width:1}.hole2 path{stroke:#8a7f70;stroke-width:.8}.rail{fill:#3a322b}.lift{fill:#5a2d14;opacity:.75}.eagle{fill:#5a2d14}
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
<div class="note"><b>门和楼梯（2026-11-20）</b><ul><li>门：墙上的白色缺口，两头一道黑线。宽的是正路（2.4 × 3.6 m），中等的是一般的门（1.6 × 2.6 m），窄的是仆役走的门（1.2 × 2.2 m）；白色虚线是廊子朝院子、朝另一条廊子的一面，只有柱子没有墙。鼠标放上去看是哪两间房。</li><li>楼梯画在它出发的那一层：一条条踏步线，红箭头指向上楼的方向；灰块是中间平台。上一层画梯口（白框打叉）和梯口三面 1.5 m 高的栏板。吊笼（深棕方块）这一轮不做。</li><li>__NDOORS__ 道门，__NWAYS__ 处上下楼；82 间房从北门全部走得到（平面脚本自己检查）。</li></ul></div>\n<div class="tabs" role="tablist">__TABS__</div>
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
page = PAGE.replace('__TABS__', tabs).replace('__PANES__', panes).replace('__LEGEND__', legend).replace('__TABLE__', table()).replace('__NDOORS__', str(len(DOORS))).replace('__NWAYS__', str(len(VERTICAL)))
out2 = os.path.join(ROOT, 'briefs', 'rome', 'plans', 'transitoria-plan.html'); open(out2, 'w', encoding='utf-8').write(page); print('wrote', os.path.relpath(out2, ROOT), len(page), 'bytes')
