# Draws the v3 planning sheets of the East palace (Domus Transitoria) from tools/models/rome/transitoria_plan.json plus the v3
# proposals below (PROPOSALS ONLY: nothing here is read by the model scripts). Run from the project folder:
#   ~/opt/anaconda3/bin/python briefs/rome/transitoria-v3/draw_plans.py
# Writes briefs/rome/transitoria-v3/plan-v3-{old,b1,f1,f2,f3,water}.png. Model axes: x east, y north, metres, origin = centre.
import json, os, math
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
PLAN = json.load(open(os.path.join(ROOT, 'tools/models/rome/transitoria_plan.json')))
S = 13                       # pixels per metre
MX, MY, LEG, GAP = 150, 175, 470, 150  # margins, legend width
W, H = 112 * S + 2 * MX + GAP + LEG, 92 * S + 2 * MY + 60
FONT = '/System/Library/Fonts/PingFang.ttc'
def F(n, bold=False): return ImageFont.truetype(FONT, n, index=1 if bold else 0)
def px(x, y): return (MX + (x + 56) * S, MY + (46 - y) * S)

COL = {'state': (214, 168, 46), 'art': (198, 124, 186), 'work': (176, 138, 78), 'private': (226, 150, 120), 'family': (232, 190, 160),
       'dining': (212, 96, 66), 'service': (154, 136, 114), 'guard': (96, 112, 120), 'bath': (72, 174, 178), 'garden': (118, 184, 98),
       'court': (150, 202, 186), 'portico': (228, 216, 180), 'corridor': (238, 230, 214), 'stair': (170, 170, 170), 'terrace': (236, 226, 190),
       'old': (196, 112, 84), 'void': (250, 250, 250)}
INK, BLUE, RED, GREY = (40, 34, 30), (30, 110, 200), (170, 30, 30), (150, 146, 140)

# ---- v3 proposals (see transitoria-masterplan-v3.md, section B) ----
DROP = {'F1': ['E02a', 'E04a'], 'F2': ['2E02a', '2S01']}
RENAME = {'N01': '门厅（通高两层）', 'E01': '偏殿·旧殿【书】', 'T1': '塔底模型厅【书】\n塔井通顶', 'S01': '水榭餐厅\n（通高两层）',
          'P04': '偏殿回廊\n（旧柱）', 'B05': '水梯', '2S15': '晨间起居\n观景房', '2T': '吊笼站【书】', '2E01': '前室·近卫\n（旧殿上加的一层）',
          '2E04': '寝殿（新）', '2S03': '内侍房\n＋上三层的梯', 'W02': '岩洞厅', '2S16': '露台', 'S09': '大厨房', 'S07': '仆役·试毒', 'S05': '小厨房\n（日常）'}
RETYPE = {'E01': 'old'}
ADD = {'F1': [dict(id='E01n', zh='北耳房\n书记', x0=32, y0=6, x1=38, y1=12, type='old'),
              dict(id='E06', zh='石榴\n小院\n【书】', x0=32, y0=12, x1=38, y1=24, type='court'),
              dict(id='E01s', zh='南耳房\n账房', x0=32, y0=-12, x1=38, y1=-6, type='old'),
              dict(id='E04a', zh='料库', x0=32, y0=-24, x1=38, y1=-12, type='work')],
       'B1': [dict(id='B06', zh='北梯【史】', x0=-8, y0=16.2, x1=0, y1=18, type='stair'), dict(id='B07', zh='南梯【史】', x0=-8, y0=-18, x1=0, y1=-16.2, type='stair'),
              dict(id='B09', zh='大厕所\n【史】', x0=22, y0=8, x1=27, y1=18, type='service'),
              dict(id='B12', zh='水道检修廊（看得见铅管）', x0=-44, y0=-1.5, x1=-16, y1=1.5, type='corridor'),
              dict(id='B13', zh='暗廊\n门厅', x0=-56, y0=24, x1=-44, y1=46, type='state'),
              dict(id='B14', zh='地下通廊（拱顶，斜窗朝庭园采光）', x0=-44, y0=19.5, x1=-10, y1=23.5, type='corridor'),
              dict(id='B15', zh='酒窖\n下层', x0=-32, y0=-46, x1=-16, y1=-36, type='service')],
       'F2': [dict(id='2E02a', zh='文书\n柜间', x0=32, y0=6, x1=38, y1=12, type='private'),
              dict(id='2S01', zh='餐厅上层回廊（一圈，宽 2.4）', x0=-16, y0=-36, x1=16, y1=-24, type='portico')]}
VOID = {'F2': [(-7, 38.4, 7, 46, '下空\n门厅'), (-13.6, -33.6, 13.6, -26.4, '下空 · 水榭餐厅'), (32, 12, 38, 24, '下空\n小院'), (46.5, -3.5, 53.5, 3.5, '塔井')],
        'F3': [(46.5, -3.5, 53.5, 3.5, '塔井')]}
STAIRS = {'F1': [('S-a', -26, 43.5, '↑二层'), ('S-b', 26, 43.5, '↑二层'), ('S-c', 20, -41, '南楼梯\n↑二层'), ('S-d', 35, -35, '过道梯\n↑二层'),
                 ('S-f', 16, 0, '水梯 ↓水庭'), ('S-g', 47, 4.5, '塔内木梯↑')],
          'F2': [('S-a', -26, 43.5, '西楼梯 ↓'), ('S-b', 26, 43.5, '东楼梯 ↓'), ('S-c', 20, -41, '南楼梯↓'), ('S-d', 35, -35, '过道梯↓'),
                 ('S-e', 17.2, -30, '↑三层'), ('S-g', 47, 4.5, '木梯'), ('笼', 53.6, -3.6, '吊笼↑塔顶')],
          'F3': [('S-e', 17.2, -30, '梯口 ↓二层'), ('S-g', 47, 4.5, '木梯'), ('笼', 53.6, -3.6, '吊笼')],
          'B1': [('S-f', 16, 0, '水梯 ↑庭园'), ('S-h', -50, 42, '↑长廊口门厅'), ('S-i', -4, 17.1, ''), ('S-j', -4, -17.1, ''), ('S-k', -19, -43.5, '')]}
# fountains and water: (no, floor, x, y, name)
WATER = [(1, 'F1', -50, 0, '水柜（铅箱，抬高 5 m）'), (2, 'F1', -38, 0, '岩洞厅：浮石水墙＋池'), (3, 'B1', -9.2, 0, '喷泉墙：两层壁龛跌水【史】'),
         (4, 'B1', -6.5, 9, '墙脚长水池'), (5, 'B1', 5, 0, '十二柱亭水盘'), (6, 'B1', 16, 2.6, '水梯两侧跌水（阶梯水景）'),
         (7, 'F1', -19, 11, '庭园圆水盆（现有）'), (8, 'F1', -19, -11, '庭园圆水盆（现有）'), (9, 'F1', 19, 11, '庭园圆水盆（新）'), (10, 'F1', 19, -11, '庭园圆水盆（新）'),
         (11, 'F1', 0, -34.5, '餐厅水阶＋榻间水槽'), (12, 'F1', -10, 25, '壁龛喷泉（引见厅门侧）'), (13, 'F1', 10, 25, '壁龛喷泉（引见厅门侧）'),
         (14, 'F1', -50, -40, '浴室：热水池'), (15, 'F1', -50, -29, '浴室：温水池＋圆水盘'), (16, 'F1', -38, -30, '浴室：冷水池'),
         (17, 'F1', -10, -41, '厨房水槽'), (18, 'F1', 35, 21, '石榴小院井口（旧蓄水池）'), (19, 'B1', 16, 10, '凉室水盘'), (20, 'B1', 16, -10, '凉室水盘'),
         (21, 'F1', 59, -15, '东台地墙出水口（溢流）'), (22, 'F2', 50, 0, '吊笼配重水箱【书】'), (23, 'B1', 24.5, 13, '大厕所的冲水沟（用长水池的溢流）')]
PIPES = [[(62, -49), (40, -21.5), (-38, -21.5), (-50, -8), (-50, 0)],           # supply: from the south-east under the south walk to the tank
         [(-50, 0), (-38, 0), (-10, 0)], [(-50, -8), (-50, -29), (-50, -40)], [(-38, -21.5), (-38, -30)], [(-10, -21.5), (-10, -41)],
         [(0, -21.5), (0, -34.5)], [(-29.5, 0), (-29.5, 21.5), (10, 21.5), (10, 25)], [(-10, 21.5), (-10, 25)],
         [(-29.5, 11), (-19, 11)], [(-29.5, -11), (-19, -11)], [(10, 21.5), (19, 21.5), (19, 11)], [(19, -21.5), (19, -11)]]
DRAIN = [[(-6.5, 0), (5, 0), (10, -16), (30, -21.5), (59, -21.5), (59, -15)], [(-50, -40), (-50, -49), (-30, -49)]]
VIEWS = {'F2': [(0, 46, 0, 1, '北敞廊 → 门前大阶、圣道、韦利亚坡'), (56, 15, 1, 0, '东上层廊 →\n山谷、凯利安山；\n左：韦利亚、\n埃斯奎利诺'), (56, -15, 1, 0, '寝殿外阳台 →\n同上'),
                (0, -46, 0, -1, '南敞廊 → 阿波罗神庙、大竞技场、阿文丁'), (50, -46, 0.5, -1, '露台 → 东南两面'), (56, 21, 1, 0.25, '')],
         'F3': [(0, -36, 0, -1, '观景厅南窗 → 大竞技场、阿文丁'), (50, 6, 0, 1, ''), (56, 0, 1, 0, ''), (50, -6, 0, -1, ''), (44, 0, -1, 0, '')]}

def rooms(fl):
    R = [dict(r) for r in PLAN['rooms'] if r['floor'] == fl and r['id'] not in DROP.get(fl, [])] + [dict(r) for r in ADD.get(fl, [])]
    for r in R:
        if r['id'] in RENAME: r['zh'] = RENAME[r['id']]
        if r['id'] in RETYPE: r['type'] = RETYPE[r['id']]
    return R

def text_c(d, x, y, s, f, fill=INK):
    lines = s.split('\n'); hs = [d.textbbox((0, 0), l, font=f) for l in lines]; lh = f.size + 3; y0 = y - lh * len(lines) / 2
    for i, l in enumerate(lines): w = hs[i][2] - hs[i][0]; d.text((x - w / 2, y0 + i * lh), l, font=f, fill=fill)

def hatch(d, x0, y0, x1, y1, col, step=9):
    a, b = px(x0, y1), px(x1, y0); w, h = b[0] - a[0], b[1] - a[1]; k = -h
    while k < w:
        p0 = (a[0] + max(k, 0), a[1] + max(-k, 0)); p1 = (a[0] + min(k + h, w), a[1] + min(h, w - k)); d.line([p0, p1], fill=col, width=1); k += step

def arrow(d, p, q, col, w=3, head=11):
    d.line([p, q], fill=col, width=w); a = math.atan2(q[1] - p[1], q[0] - p[0])
    d.polygon([q, (q[0] - head * math.cos(a - .45), q[1] - head * math.sin(a - .45)), (q[0] - head * math.cos(a + .45), q[1] - head * math.sin(a + .45))], fill=col)

def sheet(title, sub):
    im = Image.new('RGB', (W, H), (252, 249, 242)); d = ImageDraw.Draw(im)
    d.text((MX, 22), title, font=F(30, True), fill=INK); d.text((MX, 64), sub, font=F(17), fill=(90, 84, 78))
    d.rectangle([px(-56, 46), px(56, -46)], outline=GREY, width=1)
    for (x, y, s) in [(-30, 49.5, '北（图上北＝实际北偏东 30°）：正门、门前大阶、圣道'), (-30, -52.5, '南：阿波罗神庙、大竞技场、阿文丁')]:
        text_c(d, px(x, y)[0], px(x, y)[1], s, F(16), (110, 60, 50))
    for (x, s) in [(-62, '西\n提\n比\n略\n宫'), (62.5, '东\n山\n谷\n·\n凯\n利\n安\n山')]: text_c(d, px(x, 0)[0], px(x, 0)[1], s, F(16), (110, 60, 50))
    x0, y0 = px(-56, -46); y0 += 46; d.rectangle([x0, y0, x0 + 10 * S, y0 + 7], fill=INK); d.rectangle([x0 + 10 * S, y0, x0 + 20 * S, y0 + 7], outline=INK)
    d.text((x0, y0 + 10), '0        10        20 m', font=F(14), fill=INK)
    return im, d

def draw_rooms(d, fl, faint=False):
    for r in rooms(fl):
        c = COL.get(r['type'], (220, 220, 220))
        if faint: c = tuple(int(235 + (v - 235) * .28) for v in c)
        d.rectangle([px(r['x0'], r['y1']), px(r['x1'], r['y0'])], fill=c, outline=(120, 112, 104) if faint else INK, width=1 if faint else 2)
        if r['type'] == 'stair' and not faint: hatch(d, r['x0'], r['y0'], r['x1'], r['y1'], (90, 90, 90), 7)
        if faint: continue
        w, h = (r['x1'] - r['x0']) * S, (r['y1'] - r['y0']) * S; cx, cy = px((r['x0'] + r['x1']) / 2, (r['y0'] + r['y1']) / 2)
        zh = r['zh']; n = 15 if min(w, h) > 120 else 13 if min(w, h) > 70 else 11
        if w < 80 and '\n' not in zh and len(zh) > 3: zh = '\n'.join(zh)
        text_c(d, cx, cy - 7, zh, F(n, True)); text_c(d, cx, cy + (len(zh.split('\n')) * (n + 3)) / 2 + 3, r['id'], F(10), (70, 64, 60))

def legend(d, items, title='图例'):
    x, y = W - LEG + 10, MY; d.text((x, y), title, font=F(18, True), fill=INK); y += 32
    for it in items:
        k = it[0]
        if k == 'sw': d.rectangle([x, y + 2, x + 26, y + 18], fill=it[1], outline=INK)
        elif k == 'line': d.line([x, y + 10, x + 26, y + 10], fill=it[1], width=it[3] if len(it) > 3 else 3)
        elif k == 'dot': d.ellipse([x + 4, y + 1, x + 22, y + 19], fill=it[1], outline=INK)
        elif k == 'hat': d.rectangle([x, y + 2, x + 26, y + 18], fill=(250, 250, 250), outline=it[1]); [d.line([x + i, y + 18, x + i + 14, y + 2], fill=it[1]) for i in (0, 6, 12)]
        tx = x + 36 if k != 'txt' else x; lines = it[2].split('\n')
        for l in lines: d.text((tx, y), l, font=F(14), fill=INK); y += 20
        y += 5

def marks(d, fl):
    for (x0, y0, x1, y1, s) in VOID.get(fl, []):
        d.rectangle([px(x0, y1), px(x1, y0)], fill=(250, 250, 250), outline=RED, width=2); hatch(d, x0, y0, x1, y1, (225, 150, 150), 9)
        cx, cy = px((x0 + x1) / 2, (y0 + y1) / 2); text_c(d, cx, cy, s, F(12, True), RED)
    for (i, x, y, s) in STAIRS.get(fl, []):
        p = px(x, y); d.ellipse([p[0] - 13, p[1] - 13, p[0] + 13, p[1] + 13], fill=(255, 235, 120), outline=INK, width=2); text_c(d, p[0], p[1], i.replace('S-', ''), F(12, True))
        text_c(d, p[0], p[1] + 24 + 8 * s.count('\n'), s, F(11, True), (60, 50, 20))
    for (x, y, dx, dy, s) in VIEWS.get(fl, []):
        p = px(x, y); q = (p[0] + dx * 60, p[1] - dy * 60); arrow(d, p, q, (20, 130, 60), 4, 14)
        if s: text_c(d, q[0] + dx * (62 if dx else 0), q[1] - dy * 16 + (0 if dy else 0), s, F(13, True), (15, 100, 45))

def save(im, name): im.save(os.path.join(HERE, name)); print('saved', name)

# ---------- F1 ----------
im, d = sheet('东宫 v3 · 一层平面（规划稿）', '橙红粗框＝旧偏殿留下的老墙；黄圆＝楼梯编号（见规划 B4 节）；红斜线＝通高。只是规划，模型未改。')
draw_rooms(d, 'F1')
s = [f for f in PLAN['features'] if f['id'] == 'sunk'][0]; d.rectangle([px(s['x0'], s['y1']), px(s['x1'], s['y0'])], fill=(150, 202, 196), outline=BLUE, width=2)
text_c(d, *px(0, 8), '下沉水庭 −4.5\n（露天，四周栏杆，\n从庭园往下看）', F(13, True), (20, 70, 110))
for (x, y) in [(-19, 11), (-19, -11), (19, 11), (19, -11)]: p = px(x, y); d.ellipse([p[0] - 2.5 * S, p[1] - 2.5 * S, p[0] + 2.5 * S, p[1] + 2.5 * S], fill=(120, 190, 235), outline=BLUE)
for (x0, y0, x1, y1) in [(-7, 36, 7, 46), (-16, -36, 16, -24)]: hatch(d, x0, y0, x1, y1, (200, 60, 60), 14)
for seg in [[(32, -12), (38, -12), (38, -6), (44, -6), (44, 6), (38, 6), (38, 24), (32, 24), (32, -12)], [(32, 12), (38, 12)], [(27, -19), (27, 19)], [(32, -19), (32, 24)]]:
    d.line([px(*p) for p in seg], fill=(190, 40, 20), width=6)
d.line([px(32, -12), px(32, 12)], fill=(190, 40, 20), width=6)
text_c(d, px(38, -1.5)[0], px(38, -1.5)[1] + 34, '地面低两级', F(11), (120, 30, 20))
for L in [[(30.5, -44), (30.5, -34), (16, -34), (13, -34)], [(30.5, -34), (35, -34), (40, -34)], [(-10, -44.5), (-27.5, -44.5), (-27.5, -33.5)]]:   # serving routes (B9)
    for a_, b_ in zip(L, L[1:]):
        pa, pb = px(*a_), px(*b_); n = max(2, int(math.hypot(pb[0] - pa[0], pb[1] - pa[1]) / 12))
        for i in range(0, n, 2): d.line([(pa[0] + (pb[0] - pa[0]) * i / n, pa[1] + (pb[1] - pa[1]) * i / n), (pa[0] + (pb[0] - pa[0]) * (i + 1) / n, pa[1] + (pb[1] - pa[1]) * (i + 1) / n)], fill=(235, 120, 0), width=4)
    arrow(d, px(*L[-2]), px(*L[-1]), (235, 120, 0), 4, 12)
marks(d, 'F1')
for (x, y, dx, dy, s2) in [(0, 46, 0, -1, '北门（正门）'), (-56, 34.5, 1, 0, '长廊口'), (0, -46, 0, 1, '南门')]:
    p = px(x, y); arrow(d, (p[0] - dx * 46, p[1] + dy * 46), p, RED, 4, 13)
legend(d, [('sw', COL['old'], '旧偏殿（状态 0–5 就在）'), ('line', (190, 40, 20), '老墙：扩建时留下的', 6), ('hat', (200, 60, 60), '通高：门厅、水榭餐厅、塔井'),
           ('dot', (255, 235, 120), '楼梯：a 西 b 东 c 南 d 过道\nf 水梯 g 塔内木梯'), ('sw', COL['dining'], '餐室'), ('sw', COL['service'], '厨房、备餐、仆役'), ('line', (235, 120, 0), '上菜的路（不经过客人走的廊）', 4),
           ('sw', COL['bath'], '浴室'), ('sw', COL['state'], '礼仪'), ('sw', COL['art'], '画廊、藏书、乐厅'), ('sw', COL['work'], '营造署'), ('sw', COL['guard'], '近卫'),
           ('sw', COL['portico'], '廊'), ('sw', COL['garden'], '庭园'),
           ('txt', 0, '和 v2 平面的不同：\n1 塔前厅 → 偏殿（旧殿），带南北耳房\n2 乐器室 → 石榴小院（露天，改屋顶，\n  要先给作者看前后对比）\n3 门厅、水榭餐厅改通高\n4 塔底看得到塔井、吊笼和木梯\n5 庭园东侧加两只水盆\n6 水梯两侧加跌水\n7 仆役房 → 大厨房；小厨房只管小餐室')])
save(im, 'plan-v3-f1.png')

# ---------- F2 ----------
im, d = sheet('东宫 v3 · 二层平面（规划稿）', '绿箭头＝能站出去看景的地方和看到什么；红框斜线＝下面是通高厅，从回廊往下看。')
draw_rooms(d, 'F2')
d.rectangle([px(-27, 19), px(27, -19)], fill=(232, 242, 226), outline=GREY); text_c(d, *px(0, 0), '（庭园上空，从三面上层廊往下看）', F(14), (90, 120, 80))
d.rectangle([px(-56, 24), px(-32, -46)], fill=(236, 232, 226), outline=GREY); d.rectangle([px(-32, 19), px(-27, -19)], fill=(236, 232, 226), outline=GREY); text_c(d, *px(-44, -8), '西楼和浴室\n是一层高，\n这里是屋顶', F(13), (120, 112, 104))
d.rectangle([px(40, -24), px(48, -20)], outline=RED, width=3); text_c(d, px(44, -22)[0], px(44, -22)[1], '床龛', F(11, True), RED)
marks(d, 'F2')
legend(d, [('line', (20, 130, 60), '观景方向', 4), ('hat', (225, 150, 150), '下空（通高厅的上半截）'), ('dot', (255, 235, 120), '楼梯和吊笼'),
           ('sw', COL['private'], '尼禄自己的房间'), ('sw', COL['family'], '客房'), ('sw', COL['dining'], '餐室'), ('sw', COL['portico'], '敞廊、上层廊（都能站人）'),
           ('sw', COL['terrace'], '露台（露天）'), ('sw', COL['work'], '营造署'), ('sw', COL['guard'], '近卫'),
           ('txt', 0, '和 v2 平面的不同：\n1 上层餐室 → 水榭餐厅的上层回廊\n2 北敞廊正中开洞，俯看门厅\n3 “我”的书房 → 晨间起居（书房留在\n  提比略宫，作者 11-21 定）\n4 寝殿南头做床龛\n5 上三层的梯挪到内侍房西边\n6 吊笼站改成绕塔井的回廊')])
save(im, 'plan-v3-f2.png')

# ---------- F3 + tower ----------
im, d = sheet('东宫 v3 · 三层和塔（规划稿）', '三层只有南楼观景厅和东塔。灰色＝二层的屋顶。')
for b in PLAN['roof_blocks']:
    d.rectangle([px(b['x0'], b['y1']), px(b['x1'], b['y0'])], fill=(236, 232, 226), outline=(190, 186, 180))
draw_rooms(d, 'F3'); marks(d, 'F3')
for b in PLAN['roof_blocks']:
    if b['roof'] == 'flat': d.rectangle([px(b['x0'], b['y1']), px(b['x1'], b['y0'])], fill=COL['terrace'], outline=INK); text_c(d, *px((b['x0'] + b['x1']) / 2, (b['y0'] + b['y1']) / 2), '平顶\n' + ('+7 露台' if b['eaves'] < 8 else '+11.6\n不上人'), F(11))
legend(d, [('line', (20, 130, 60), '观景方向', 4), ('hat', (225, 150, 150), '塔井（从塔底一直通到露台下）'), ('dot', (255, 235, 120), '楼梯和吊笼'),
           ('txt', 0, '绿箭头：塔顶露台（+30 m）四面都能看，\n【书】韦利亚的街、两座神龛\n\n塔：12×12 m。\n一层 模型厅【书】\n二层 吊笼站【书】（+7）\n往上 空筒、木梯、吊笼井道\n+30 露台【书】，四面平板玻璃\n\n吊笼只停二层和塔顶【书】\n“他从寝殿那一层直接升到塔顶。”\n木梯从一层走到塔顶（约 160 级），\n是给不坐吊笼的人走的【设】')])
save(im, 'plan-v3-f3.png')

# ---------- B1 ----------
im, d = sheet('东宫 v3 · 地下一层（−4.5 m）', '下沉水庭、凉室、通廊、暗廊门厅，全在台基里面，外轮廓不变。浅色＝上面一层的轮廓。橙色小三角＝采光口。')
draw_rooms(d, 'F1', faint=True); draw_rooms(d, 'B1'); marks(d, 'B1')
d.line([px(-10, -18), px(-10, 18)], fill=BLUE, width=7); d.rectangle([px(-8.5, 16), px(-5, -16)], fill=(120, 190, 235), outline=BLUE)
p = px(5, 0); d.ellipse([p[0] - 3.5 * S, p[1] - 3.5 * S, p[0] + 3.5 * S, p[1] + 3.5 * S], outline=INK, width=2)
for yy in (2.6, -2.6): d.rectangle([px(10, yy + .5), px(22, yy - .5)], fill=(120, 190, 235), outline=BLUE)
arrow(d, (px(-56, 34.5)[0] - 70, px(-56, 34.5)[1]), px(-56, 34.5), RED, 4, 13); text_c(d, px(-56, 34.5)[0] - 62, px(-56, 34.5)[1] - 30, '尼禄暗廊\n下层【史】', F(12, True), RED)
for (x, y, t) in [(-56, 28, '高窗'), (-56, 40, '高窗'), (-36, 19.5, '斜窗'), (-28, 19.5, '斜窗'), (-20, 19.5, '斜窗'), (-30, 0, '地漏栅'), (24.5, 16, '天井'), (16, 14, '门＋高窗'), (16, -14, '门＋高窗'), (-24, -46, '高窗')]:
    q = px(x, y); d.polygon([(q[0], q[1] - 9), (q[0] - 8, q[1] + 6), (q[0] + 8, q[1] + 6)], fill=(240, 150, 30), outline=INK); d.text((q[0] + 10, q[1] - 8), t, font=F(11, True), fill=(150, 80, 0))
legend(d, [('line', BLUE, '喷泉墙（西墙，两层壁龛）【史】', 7), ('sw', (120, 190, 235), '水面'), ('sw', COL['dining'], '凉室（彩绘拱顶的小间）【史】'), ('sw', COL['court'], '露天的水庭地面'),
           ('sw', COL['corridor'], '通廊、检修廊'), ('sw', COL['state'], '暗廊门厅：从提比略宫走地下过来'), ('sw', COL['service'], '厕所、酒窖下层、水道'), ('sw', (240, 150, 30), '采光口（高窗、斜窗、天井、地漏栅）'),
           ('dot', (255, 235, 120), '楼梯：f 水梯（已有）h 暗廊门厅梯\ni、j 喷泉墙两头的梯【史】 k 酒窖梯'),
           ('txt', 0, '现在只有水庭和水梯是通的，\n凉室是实心的（interior-34 第三步），\n其余都是 v3 新加的【设】。\n\n地下的房间都在台基里面，离外墙面\n至少 2 m，只有高窗穿到外面。')])
save(im, 'plan-v3-b1.png')

# ---------- old hall, states 0-5 ----------
im, d = sheet('东宫地块 · 扩建以前（故事状态 0–5，公元 54–57 年）', '只有山东缘这座旧偏殿。浅灰＝后来东宫的轮廓。位置是【设】，书里只说“山上那一头，就是我办公的那座偏殿”。')
draw_rooms(d, 'F1', faint=True)
OLD = [dict(zh='偏殿【书】\n正堂 12×12', x0=32, y0=-6, x1=44, y1=6, t='old'), dict(zh='北耳房', x0=32, y0=6, x1=38, y1=12, t='old'), dict(zh='南耳房', x0=32, y0=-12, x1=38, y1=-6, t='old'),
       dict(zh='石榴\n小院\n【书】', x0=32, y0=12, x1=38, y1=24, t='court'), dict(zh='偏\n殿\n回\n廊\n【书】', x0=27, y0=-19, x1=32, y1=24, t='portico'),
       dict(zh='旧观景\n露台【书】\n（后来起塔）', x0=44, y0=-6, x1=56, y1=6, t='terrace'), dict(zh='殿前空地', x0=10, y0=-19, x1=27, y1=24, t='garden')]
for r in OLD:
    d.rectangle([px(r['x0'], r['y1']), px(r['x1'], r['y0'])], fill=COL[r['t']], outline=(190, 40, 20) if r['t'] != 'garden' else GREY, width=5 if r['t'] in ('old', 'court') else 2)
    text_c(d, *px((r['x0'] + r['x1']) / 2, (r['y0'] + r['y1']) / 2), r['zh'], F(13, True))
p = px(37, 23); d.ellipse([p[0] - 14, p[1] - 14, p[0] + 14, p[1] + 14], fill=(60, 130, 50), outline=INK); text_c(d, p[0] + 60, p[1] - 4, '石榴树', F(12, True), (40, 90, 30))
arrow(d, px(56, 0), (px(56, 0)[0] + 70, px(56, 0)[1] - 20), (20, 130, 60), 4, 14); text_c(d, px(56, 0)[0] + 215, px(56, 0)[1] - 110, '【书】“隔着半座黑暗的罗马城，\n遥遥望着埃斯奎利诺山脚下的方向。”', F(13, True), (15, 100, 45))
legend(d, [('sw', COL['old'], '旧殿的屋子（老砖墙）'), ('sw', COL['court'], '石榴小院，比回廊低三级'), ('sw', COL['portico'], '回廊（大理石柱）'), ('sw', COL['terrace'], '山缘的旧露台，垫高约 4 m'),
           ('txt', 0, '扩建时【书·第 11 份改写稿】：\n“墙是老的，好砖，不用拆。\n往两头接出去，再往东起一座塔。”\n\n对应到东宫：\n· 正堂 → 一层的偏殿，上面加一层\n· 往两头接 → 东翼的北段、南段\n· 往东起塔 → 旧露台的位置\n· 回廊 → 水庭东廊\n· 小院 → 原样留着'),
           ('txt', 0, '要作者定：状态 0–5 网页上是否改成\n这个样子（现在各状态都是整座东宫）。\n见规划 F 节问题 2。')], '说明')
save(im, 'plan-v3-old.png')

# ---------- water ----------
im, d = sheet('东宫 v3 · 水从哪来、到哪去（规划稿）', '蓝线＝供水铅管（走廊地下），虚线＝排水。数字＝喷泉水池编号，右边是表。底图是一层，B 开头的在下沉水庭里。')
draw_rooms(d, 'F1', faint=True)
d.rectangle([px(-10, 18), px(10, -18)], fill=(214, 236, 236), outline=GREY)
for L in PIPES: d.line([px(*p) for p in L], fill=BLUE, width=4)
for L in DRAIN:
    for a, b in zip(L, L[1:]):
        pa, pb = px(*a), px(*b); n = max(2, int(math.hypot(pb[0] - pa[0], pb[1] - pa[1]) / 14))
        for i in range(0, n, 2): d.line([(pa[0] + (pb[0] - pa[0]) * i / n, pa[1] + (pb[1] - pa[1]) * i / n), (pa[0] + (pb[0] - pa[0]) * (i + 1) / n, pa[1] + (pb[1] - pa[1]) * (i + 1) / n)], fill=(60, 130, 160), width=3)
arrow(d, (px(62, -49)[0] + 40, px(62, -49)[1] + 26), px(62, -49), BLUE, 5, 15)
text_c(d, px(56, -50)[0] + 30, px(56, -50)[1] + 50, '来水：配水塔在东南约 46 m 外\n（网页里状态 7 起才有）', F(13, True), BLUE)
for (n, fl, x, y, name) in WATER:
    p = px(x, y); d.ellipse([p[0] - 12, p[1] - 12, p[0] + 12, p[1] + 12], fill=(120, 200, 245) if fl != 'B1' else (60, 150, 215), outline=INK, width=2); text_c(d, p[0], p[1] - 1, str(n), F(12, True))
x, y = W - LEG + 10, MY; d.text((x, y), '喷泉和水池（23 处）', font=F(18, True), fill=INK); y += 32
for (n, fl, _, _, name) in WATER: d.text((x, y), '%2d  %s  %s' % (n, {'F1': '一层', 'F2': '二层', 'B1': '水庭'}[fl], name), font=F(13), fill=INK); y += 21
y += 10
for l in ['主线：水柜 1 → 岩洞厅 2 → 喷泉墙 3 → 长水池 4', '→ 亭 5 → 排水 → 东台地墙出水口 21', '支线：庭园四盆 7–10、餐厅 11、引见厅门侧', '12–13、浴室 14–16、厨房 17、凉室 19–20', '旧井 18 不接水道，是旧殿自己的蓄水池']: d.text((x, y), l, font=F(13), fill=(20, 70, 110)); y += 21
save(im, 'plan-v3-water.png')
