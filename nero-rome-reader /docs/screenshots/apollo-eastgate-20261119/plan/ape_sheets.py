"""Apollo east gate forecourt (apE): the four R12 §13 sheets, drawn with PIL (matplotlib is broken in this env).
  python3 ape_sheets.py DUMP OUTDIR
DUMP: the palatine_paths dump for PART=apE (existing ground and sections). The design is read from ape_input.json beside this file.
Writes 01_plan.png, 02_section_A_lz74.png, 03_section_B_lx93.png, 04_elevation_east.png and sheets_checks.json (the clearances
between the forecourt's free-standing items, R12 §4: none between 0 and 2.4 m). Sketch only: nothing here is built."""
import sys, os, json, math
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
DUMP, OUT = sys.argv[1], sys.argv[2]
D = json.load(open(DUMP)); A = json.load(open(os.path.join(HERE, 'ape_input.json')))
PL = {p['id']: p for p in A['plats']}; DE = A['deco']; ST = DE['stair']
FONT = '/System/Library/Fonts/STHeiti Medium.ttc'; _f = {}
def F(s):
    if s not in _f: _f[s] = ImageFont.truetype(FONT, s)
    return _f[s]

# colours
BG = (252, 251, 247); GREY = (150, 148, 142); GREYF = (222, 220, 214); GREYD = (110, 108, 104)
PAVE = (243, 214, 160); LAND = (236, 196, 128); STAIRC = (255, 250, 240); WALLN = (25, 25, 25)
T50 = (196, 222, 176); T46 = (214, 232, 196); BED = (92, 150, 80); CYP = (40, 100, 55)
RIB = (226, 186, 90); BRONZE = (120, 80, 40); RED = (190, 30, 30); DIM = (200, 40, 40); BLUE = (40, 70, 160)
DADO = (168, 52, 40); WATER = (110, 160, 210); FILL = (232, 226, 210); GROUND = (200, 160, 30)

PAVE_Y = 55.06; PAR_T = 0.35; PAR_H = 0.95; PAR_TOP = PAVE_Y + PAR_H
E_X = 93.761; S_Z = 91.30; W_X = 83.38            # forecourt east edge, south edge, west edge (the Apollo wall)
T50_X, T50_Z = 98.20, 96.05; T46_X, T46_Z, T46_N = 102.70, 100.60, 62.0
FACE = 83.36                                         # Apollo east wall face at y 55.3 (battered 0.06)
BUTT = [74 + 10.444 * k for k in range(-4, 4)]       # Apollo buttress centres (lz), 2.42 m wide, face lx 86.20
GONE = [74.0, 63.556, 84.444]                        # the three removed for the forecourt and the niches
BAST = [(87.655, 60.261), (93.761, 59.845), (93.345, 53.739), (87.239, 54.155)]   # sumE@4 corner pier: S face first two
SUMS = D['palStairs'][0]

def stamp(d, W, name, sub):
    d.rectangle([0, 0, W, 66], fill=(255, 255, 255))
    d.text((16, 6), '草图，未建 · 阿波罗东门前庭（apE）· ' + name, font=F(26), fill=RED)
    d.text((16, 40), sub, font=F(15), fill=(110, 40, 40))

def tw(d, s, f): b = d.textbbox((0, 0), s, font=f); return b[2]-b[0], b[3]-b[1]
def label(d, xy, s, size=15, fill=(30, 30, 30), anchor='mm', box=True, bg=(255, 255, 255, 225)):
    f = F(size); w, h = tw(d, s, f); x, y = xy
    if anchor[0] == 'm': x -= w/2
    elif anchor[0] == 'r': x -= w
    if anchor[1] == 'm': y -= h/2
    elif anchor[1] == 'b': y -= h
    if box: d.rectangle([x-3, y-2, x+w+3, y+h+5], fill=bg)
    d.text((x, y-1), s, font=f, fill=fill)

def dimline(d, p, q, s, off=(0, 0), size=14, col=DIM, txt_off=(0, 0)):
    (x0, y0), (x1, y1) = p, q
    d.line([p, q], fill=col, width=1)
    L = math.hypot(x1-x0, y1-y0) or 1; ux, uy = (x1-x0)/L, (y1-y0)/L; nx, ny = -uy, ux
    for (x, y) in (p, q):
        d.line([(x-5*nx-4*ux, y-5*ny-4*uy), (x+5*nx+4*ux, y+5*ny+4*uy)], fill=col, width=2)
    label(d, ((x0+x1)/2+txt_off[0], (y0+y1)/2+txt_off[1]), s, size, col)

def dashed(d, pts, col, w=1, on=6, off=4):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        L = math.hypot(x1-x0, y1-y0); n = int(L // (on+off)) + 1
        for i in range(n):
            a = i*(on+off)/L; b = min(1, (i*(on+off)+on)/L)
            if a >= 1: break
            d.line([(x0+(x1-x0)*a, y0+(y1-y0)*a), (x0+(x1-x0)*b, y0+(y1-y0)*b)], fill=col, width=w)

# ======================================================================= 01 plan
K = 20; MX, MT, MB = 90, 120, 330
X0, X1, Z0, Z1 = 76, 112, 28, 104
W = int((X1-X0)*K) + 2*MX; H = int((Z1-Z0)*K) + MT + MB
def P(lx, lz): return (MX + (lx-X0)*K, MT + (lz-Z0)*K)
def poly(pts): return [P(*p) for p in pts]

im = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(im, 'RGBA')
# existing ground contours from the dump's 1 m grid (grey, every 1 m; 42/46/50/55 labelled)
G = D['grid']; GH = G['H']
d.rectangle([P(X0, Z0), P(X1, Z1)], fill=(240, 238, 230))
for j in range(len(GH)-1):
    for i in range(len(GH[0])-1):
        lx, lz = G['X0']+i, G['Z0']+j
        if not (X0 <= lx < X1 and Z0 <= lz < Z1): continue
        h = GH[j][i]
        for (di, dj) in ((1, 0), (0, 1)):
            h2 = GH[j+dj][i+di]
            if h is None or h2 is None: continue
            if math.floor(h) != math.floor(h2):
                if di: d.line([P(lx+1, lz), P(lx+1, lz+1)], fill=(205, 200, 186), width=1)
                else: d.line([P(lx, lz+1), P(lx+1, lz+1)], fill=(205, 200, 186), width=1)
# existing: sumE (grey) with its corner pier, the Apollo court and wall with buttresses, sumS's last run
sumE = [p for p in D['plan']['plats'] if p['id'] == 'sumE'][0]
d.polygon(poly(sumE['pts']), fill=GREYF, outline=GREY)
d.polygon(poly(BAST), fill=(205, 203, 197), outline=GREYD)
d.rectangle([P(X0, Z0), P(FACE, Z1)], fill=(214, 211, 204))                 # Apollo court and porticoes (beyond the box: grey)
d.line([P(82.75, Z0), P(82.75, Z1)], fill=GREYD, width=1)                    # portico back wall face
d.line([P(FACE, Z0), P(FACE, Z1)], fill=GREYD, width=2)
for c in BUTT:
    z0, z1 = c-1.21, c+1.21
    if z1 < Z0 or z0 > Z1: continue
    if any(abs(c-g) < .1 for g in GONE): continue   # drawn over the paving below
    else:
        d.rectangle([P(FACE, z0), P(86.20, z1)], fill=(198, 195, 188), outline=GREYD)
# propylon (front columns at lx 83, base front lx 83.50)
d.rectangle([P(74.5, 67), P(83.5, 81)], fill=(204, 200, 192), outline=GREYD)
for cz in (68.75, 72.25, 75.75, 79.25):
    for cx in (83.0, 75.0):
        x, y = P(cx, cz); d.ellipse([x-8, y-8, x+8, y+8], fill=(170, 166, 158), outline=GREYD)
sp = [(p[0], p[1]) for p in SUMS['pts']]
for (a, b) in zip(sp, sp[1:]):
    d.line([P(*a), P(*b)], fill=(170, 168, 160), width=int(SUMS['w']*K))
d.line([P(*a) for a in sp], fill=GREYD, width=1)

# new: tiers (planted, not walkable)
d.polygon(poly(PL['apE46']['pts']), fill=T46)
d.polygon(poly(PL['apE50']['pts']), fill=T50)
# cypresses on tier 46 (pitch 3.1, 1.5 in from the outer walls), box beds on tier 50 (3 x 1.2, pitch 4)
cyp = []
z = T46_N + 1.5
while z <= T46_Z - 1.5 + 1e-6: cyp.append((T46_X-1.5, z)); z += 3.1
x = T46_X - 1.5 - 3.1
while x >= 86.2 + 1.0: cyp.append((x, T46_Z-1.5)); x -= 3.1
for (cx, cz) in cyp:
    X, Y = P(cx, cz); d.ellipse([X-9, Y-9, X+9, Y+9], fill=CYP)
beds = []
cx = (E_X + T50_X)/2; z = 62.0 + .5
while z + 3 <= S_Z + .2: beds.append((cx-.6, z, cx+.6, z+3)); z += 4
cz = (S_Z + T50_Z)/2; x = T50_X - 1.0 - 3
while x >= 86.2 + .6: beds.append((x, cz-.6, x+3, cz+.6)); x -= 4
for b in beds: d.rectangle([P(b[0], b[1]), P(b[2], b[3])], fill=BED)
# forecourt paving, landing, stair
d.polygon(poly(PL['apE']['pts']), fill=PAVE)
d.rectangle([P(ST['landing'][0], ST['lz0']), P(ST['landing'][1], ST['lz1'])], fill=LAND)
for f0 in (ST['x0'], ST['landing'][1]):
    d.rectangle([P(f0, ST['lz0']), P(f0+4*ST['tread'], ST['lz1'])], fill=STAIRC)
    for k in range(5):
        x = f0 + k*ST['tread']; d.line([P(x, ST['lz0']), P(x, ST['lz1'])], fill=(60, 60, 60), width=2 if k == 0 else 1)
# down arrows on the flights
for f0 in (ST['x0'], ST['landing'][1]):
    a, b = P(f0+.15, 74), P(f0+1.4, 74); d.line([a, b], fill=(40, 40, 40), width=2); d.polygon([b, (b[0]-9, b[1]-6), (b[0]-9, b[1]+6)], fill=(40, 40, 40))
for c in DE['cheeks']: d.rectangle([P(c[0], c[2]), P(c[1], c[3])], fill=(190, 182, 168), outline=(60, 60, 60))
# wreath (laurel ring inlaid in the landing)
X, Y = P(DE['wreath']['lx'], DE['wreath']['lz']); r0, r1 = DE['wreath']['r0']*K, DE['wreath']['r1']*K
d.ellipse([X-r1, Y-r1, X+r1, Y+r1], outline=(70, 120, 60), width=int(r1-r0))
# ribbon (paving band, flush) to sumE through the pier's opened south side
rp = DE['ribbon'][0]; d.line([P(*p) for p in rp], fill=RIB+(255,), width=int(DE['ribbonW']*K), joint='curve')
dashed(d, [P(*p) for p in rp], (150, 110, 30), 1)
# parapets (0.35) on the forecourt's three free edges
def par_strip(a, b, inward):
    (x0, z0), (x1, z1) = a, b; L = math.hypot(x1-x0, z1-z0); nx, nz = inward
    q = [a, b, (x1+nx*PAR_T, z1+nz*PAR_T), (x0+nx*PAR_T, z0+nz*PAR_T)]
    d.polygon(poly(q), fill=(120, 110, 96))
par_strip((E_X, 59.845), (E_X, S_Z), (-1, 0))
par_strip((E_X, S_Z), (W_X, S_Z), (0, -1))
par_strip((W_X, 60.551), (87.655, 60.261), (0, 1))
# corner pier: the south parapet opened (dashed red), E and W kept
d.line([P(*BAST[1]), P(*BAST[2])], fill=(120, 110, 96), width=int(PAR_T*K))
d.line([P(*BAST[3]), P(*BAST[0])], fill=(120, 110, 96), width=int(PAR_T*K))
dashed(d, [P(*BAST[0]), P(*BAST[1])], RED, 3, 8, 5)
# new walls (black, heavy)
for pid in ('apE', 'apE50', 'apE46'):
    p = PL[pid]; pts = p['pts']
    for i, k in enumerate(p['edge']):
        if k == 'w': d.line([P(*pts[i]), P(*pts[(i+1) % len(pts)])], fill=WALLN, width=4)
# piers: forecourt SE corner 2.4 m square (open detail) and the tier corners (none: tool drops them, ends 0.56)
x0, z0 = P(E_X-1.2, S_Z-1.2); x1, z1 = P(E_X+1.2, S_Z+1.2); d.rectangle([x0, z0, x1, z1], outline=(60, 60, 60), width=2)
# niches, dado, lion and basin on the Apollo face
d.line([P(83.45, 60.551), P(83.45, S_Z)], fill=DADO, width=3)
for n in DE['niches']:
    d.rectangle([P(FACE-.45, n['lz']-n['w']/2), P(FACE, n['lz']+n['w']/2)], fill=(255, 255, 255), outline=DADO, width=2)
b = DE['basin']; d.rectangle([P(b['lx0'], b['lz0']), P(b['lx1'], b['lz1'])], fill=WATER, outline=BLUE)
X, Y = P(FACE, DE['lion']['lz']); d.polygon([(X, Y-6), (X+9, Y), (X, Y+6)], fill=BRONZE)
# the three removed buttresses (red outline, crossed), over the new paving
for c in GONE:
    z0, z1 = c-1.21, c+1.21
    if c == 74.0: dashed(d, [P(FACE, z0), P(86.2, z0), P(86.2, z1), P(FACE, z1)], RED, 2); continue   # under the stair head
    d.rectangle([P(FACE, z0), P(86.20, z1)], outline=RED, width=2)
    d.line([P(FACE, z0), P(86.2, z1)], fill=RED, width=1); d.line([P(FACE, z1), P(86.2, z0)], fill=RED, width=1)
# statues on free pedestals
for s in DE['pedestals']:
    h = s['s']/2; d.rectangle([P(s['lx']-h, s['lz']-h), P(s['lx']+h, s['lz']+h)], fill=(232, 226, 214), outline=(60, 60, 60), width=2)
    X, Y = P(s['lx'], s['lz']); d.ellipse([X-6, Y-6, X+6, Y+6], fill=BRONZE)

# axis lines of the sections
for (nm, a, b) in (('A', (X0, 74), (X1, 74)), ('B', (93, X0 and 48), (93, Z1))):
    pa, pb = P(*a), P(*b)
    if nm == 'B': pa = P(93, Z0)
    dashed(d, [pa, pb], (200, 0, 200), 1, 10, 6)
label(d, (P(X1, 74)[0]+18, P(X1, 74)[1]), 'A', 18, (200, 0, 200), box=False)
label(d, (P(93, Z0)[0], P(93, Z0)[1]-14), 'B', 18, (200, 0, 200), box=False)

# frame and grid ticks
d.rectangle([P(X0, Z0), P(X1, Z1)], outline=(90, 90, 90))
for lx in range(80, 112, 5):
    x, _ = P(lx, Z1); d.line([(x, P(0, Z1)[1]), (x, P(0, Z1)[1]+6)], fill=(90, 90, 90)); label(d, (x, P(0, Z1)[1]+16), f'lx {lx}', 13, (90, 90, 90), box=False)
for lz in range(30, 105, 10):
    _, y = P(X0, lz); d.line([(MX-6, y), (MX, y)], fill=(90, 90, 90)); label(d, (MX-10, y), f'lz {lz}', 13, (90, 90, 90), 'rm', box=False)
# north arrow (hill frame: -lz)
nx_, ny_ = W-50, MT+60
d.line([(nx_, ny_+30), (nx_, ny_-20)], fill=(30, 30, 30), width=2); d.polygon([(nx_, ny_-30), (nx_-7, ny_-14), (nx_+7, ny_-14)], fill=(30, 30, 30))
label(d, (nx_, ny_+46), '−lz', 13, box=False)

# names and levels
label(d, P(95, 40), 'sumE 顶台 55.00（现状）', 15, GREYD)
label(d, (P(90.5, 56.9)[0], P(90.5, 56.9)[1]-2), '角墩 sumE@4 顶 55.09', 13, GREYD)
label(d, P(79, 50), '阿波罗院 56.60', 15, GREYD)
label(d, P(79, 88), '门廊（现状）', 13, GREYD)
label(d, P(78.6, 70.4), '门楼 56.90', 13, GREYD)
label(d, P(108, 80), '草坪 beltE 42.06', 14, GREYD)
label(d, P(119.5 if False else 110.5, 57.6), 'sumS 梯脚 42.20', 13, GREYD, 'rm')
label(d, P(90.6, 89.7), '前庭铺地 55.06', 15, (120, 70, 0))
label(d, P(86.52, 70.0), '平台 55.98', 13, (120, 70, 0))
label(d, P(86.52, 78.1), '月桂花环', 12, (60, 100, 50))
label(d, P(96.0, 77.0), '50 种植台', 14, (40, 90, 40))
label(d, P(96.0, 79.0), '（不可走）', 12, (40, 90, 40))
label(d, P(100.45, 84.0), '46 柏树台', 14, (30, 80, 40))
label(d, P(100.45, 86.0), '（不可走）', 12, (30, 80, 40))
label(d, P(92, 69.0), '铺地带 1.2', 12, (140, 100, 20))
label(d, P(88.3, 65.9), '雕像', 12, BRONZE)
label(d, P(90.2, 85.1), '雕像', 12, BRONZE)
label(d, (P(84.45, 87.4)[0]+6, P(84.45, 87.4)[1]), '狮口泉 + 水池', 12, BLUE, 'lm')
label(d, (P(FACE, 63.4)[0]+8, P(FACE, 63.4)[1]+16), '龛', 12, DADO, 'lm')
label(d, (P(FACE, 84.6)[0]+8, P(FACE, 84.6)[1]-14), '龛', 12, DADO, 'lm')
label(d, P(90.6, 58.6), '南侧胸墙打开', 12, RED)
label(d, P(E_X+1.4, 92.25), '2.4 方墩（待定）', 11, (60, 60, 60), 'lm')

# wall heights (red numbers, as the tool)
def wh(lx, lz, s): label(d, P(lx, lz), s, 13, RED)
wh(E_X+.9, 84.5, '5.0'); wh(88.5, S_Z+.75, '5.0'); wh(85.5, 59.6, '5.9–8.4')
wh(T50_X+.8, 59.5, '8.0'); wh(T50_X+.8, 72, '4.0'); wh(92, T50_Z+.8, '4.0')
wh(T46_X+.9, 72, '4.0'); wh(100.2, T46_N-.75, '4.0'); wh(94.0, T46_Z+.8, '4.0→挡土 2.0')

# dimensions
y = P(0, 65.6)[1]
dimline(d, P(W_X, 102.9), P(E_X, 102.9), '前庭 10.38', txt_off=(0, 0))
dimline(d, P(E_X, 102.9), P(T50_X, 102.9), '4.44')
dimline(d, P(T50_X, 102.9), P(T46_X, 102.9), '4.50')
dimline(d, P(ST['x1'], 76.6), P(E_X-PAR_T, 76.6), '3.87', txt_off=(0, 0))
dimline(d, P(ST['x0'], 81.3), P(ST['x1'], 81.3), '梯 6.04', size=13)
dimline(d, P(ST['landing'][0], 67.0), P(ST['landing'][1], 67.0), '平台 3.00', size=12)
dimline(d, P(81.2, ST['lz0']), P(81.2, ST['lz1']), '宽 10.5', size=13)
dimline(d, P(E_X+3.0, 59.845), P(E_X+3.0, S_Z), '前庭 31.45', txt_off=(0, 0)) if False else None
dimline(d, P(90.2, 60.9), P(90.2, 64.2), '3.30', size=12)
dimline(d, P(90.2, 65.4), P(90.2, 67.85), '2.45', size=12)
dimline(d, P(90.8, 63.6), P(E_X-PAR_T, 63.6), '2.61', size=12)
dimline(d, P(90.2, 80.15), P(90.2, 82.6), '2.45', size=12)
dimline(d, P(84.0, 88.4), P(84.0, S_Z-PAR_T), '2.55', size=12)
dimline(d, P(T46_X+1.6, T46_N), P(T46_X+1.6, 59.46), '距 sumS 2.54', size=12)
dimline(d, P(T50_X+1.0, S_Z), P(T50_X+1.0, T50_Z), '4.75', size=12) if False else None
dimline(d, P(105.2, S_Z), P(105.2, T50_Z), '4.75', size=12)
dimline(d, P(105.2, T50_Z), P(105.2, T46_Z), '4.55', size=12)

stamp(d, W, '01 平面 lx 76–112，lz 28–104', '比例 20 px/m；灰 = 现状，彩 = 新做；红数字 = 墙高（m）；标高为绝对标高（m）；台阶 10 级（5+5），踢 0.184，踏 0.38')
# legend
ly = H - MB + 40; lx0 = MX
items = [((214, 211, 204), '现状（阿波罗院、sumE、门楼）'), (PAVE, '前庭铺地 55.06'), (LAND, '平台 55.98'), (STAIRC, '台阶（三角 = 下坡）'),
         (T50, '50 种植台（黄杨方畦）'), (T46, '46 柏树台'), (RIB, '铺地带（与地面平）'), (WATER, '水池')]
for i, (c, s) in enumerate(items):
    x = lx0 + (i % 2)*420; yy = ly + (i // 2)*30
    d.rectangle([x, yy, x+28, yy+18], fill=c, outline=(80, 80, 80)); label(d, (x+38, yy+9), s, 14, anchor='lm', box=False)
yy = ly + 4*30
d.line([(lx0, yy+9), (lx0+28, yy+9)], fill=WALLN, width=4); label(d, (lx0+38, yy+9), '新挡墙', 14, anchor='lm', box=False)
d.line([(lx0+420, yy+9), (lx0+448, yy+9)], fill=(120, 110, 96), width=7); label(d, (lx0+458, yy+9), '胸墙 0.95 × 0.35', 14, anchor='lm', box=False)
yy += 30
d.rectangle([lx0, yy, lx0+28, yy+18], outline=RED, width=2); d.line([(lx0, yy), (lx0+28, yy+18)], fill=RED); label(d, (lx0+38, yy+9), '拆除的扶壁（3 个）', 14, anchor='lm', box=False)
dashed(d, [(lx0+420, yy+9), (lx0+448, yy+9)], RED, 3, 6, 3); label(d, (lx0+458, yy+9), '打开的胸墙（角墩南侧）', 14, anchor='lm', box=False)
yy += 30
X, Y = lx0+14, yy+9; d.ellipse([X-6, Y-6, X+6, Y+6], fill=BRONZE); label(d, (lx0+38, yy+9), '雕像（独立基座 1.2 方，高 1.6）', 14, anchor='lm', box=False)
X, Y = lx0+434, yy+9; d.ellipse([X-8, Y-8, X+8, Y+8], fill=CYP); label(d, (lx0+458, yy+9), '柏树（间距 3.1）', 14, anchor='lm', box=False)
im.save(os.path.join(OUT, '01_plan.png'))

# ======================================================================= sections
SEC = {s['name']: s for s in D['sections']}
def section(name, title, sub, s0, s1, along, profile, extras, fn):
    CUR['sec'] = name
    KS = 20; Y0, Y1 = 39, 68; ML, MR, MT_, MB_ = 80, 40, 110, 70
    Wd = int((s1-s0)*KS) + ML + MR; Ht = int((Y1-Y0)*KS) + MT_ + MB_
    I = Image.new('RGB', (Wd, Ht), BG); g = ImageDraw.Draw(I, 'RGBA')
    Q = lambda s, y: (ML + (s-s0)*KS, MT_ + (Y1-y)*KS)
    for yy in range(40, 69, 2):
        g.line([Q(s0, yy), Q(s1, yy)], fill=(232, 230, 224)); label(g, (ML-8, Q(s0, yy)[1]), f'{yy}', 12, (120, 120, 120), 'rm', box=False)
    for ss in range(int(math.ceil(s0/2)*2), int(s1)+1, 2):
        g.line([Q(ss, Y0), (Q(ss, Y0)[0], Q(ss, Y0)[1]+5)], fill=(120, 120, 120))
        if ss % 4 == 0: label(g, (Q(ss, Y0)[0], Q(ss, Y0)[1]+16), f'{along} {ss}', 12, (120, 120, 120), box=False)
    profile(g, Q)
    # existing ground (yellow) and existing tops (grey thin) from the dump
    S = SEC[name]['S']; a = SEC[name]['a']; b = SEC[name]['b']
    def sval(r): return (a[0] + r[0] if along == 'lx' else a[1] + r[0])
    gp = [Q(sval(r), r[1]) for r in S if r[1] is not None and s0 <= sval(r) <= s1]
    g.line(gp, fill=GROUND, width=3)
    extras(g, Q)
    stamp(g, Wd, title, sub)
    I.save(os.path.join(OUT, fn))

CUR = {'sec': 'A'}
def gnd(s):   # existing ground along the current section at s (lx for A, lz for B), from the dump's 0.5 m samples
    S = SEC[CUR['sec']]; a = S['a']; o = a[0] if CUR['sec'] == 'A' else a[1]
    rows = [(o + r[0], r[1]) for r in S['S'] if r[1] is not None]
    for (s0, y0), (s1, y1) in zip(rows, rows[1:]):
        if s0 <= s <= s1: return y0 + (y1-y0)*(s-s0)/((s1-s0) or 1)
    return rows[0][1] if s < rows[0][0] else rows[-1][1]
def soil(g, Q, s0, s1, ytop, yb=None, col=None):   # fill between the new top and the existing ground
    n = max(2, int((s1-s0)/.25)); xs = [s0 + (s1-s0)*i/n for i in range(n+1)]
    g.polygon([Q(s0, ytop), Q(s1, ytop)] + [Q(x, min(ytop, gnd(x))) for x in reversed(xs)], fill=col or FILL)
def wall(g, Q, s, y0, y1, t=0.6, side=1):
    a, b = (s, s+side*t) if side > 0 else (s+side*t, s)
    g.rectangle([Q(min(a, b), y1), Q(max(a, b), y0)], fill=WALLN)
def parapet(g, Q, s0, s1, ybase):
    g.rectangle([Q(s0, ybase+PAR_H), Q(s1, ybase)], fill=(120, 110, 96))

# ---- A: along lz 74 (lx 70 -> 112)
def profA(g, Q):
    # existing Apollo (grey): court 56.60, propylon 74.5-83.5 base 56.90, columns, roof 66.38; east wall face battered from 56.95
    soil(g, Q, 70, FACE, 56.6, col=(218, 215, 208))                                  # the court's fill and the porticoes
    n = 40; g.polygon([Q(FACE, 56.95)] + [Q(FACE + .06*(56.95-gnd(FACE)) * i/n, 56.95 - (56.95-gnd(FACE))*i/n) for i in range(n+1)] + [Q(FACE-1.2, gnd(FACE)), Q(FACE-1.2, 56.95)], fill=(176, 172, 164))   # battered east wall
    g.rectangle([Q(74.5, 56.9), Q(83.5, 56.6)], fill=(190, 186, 178))
    for cx in (75.0, 83.0): g.rectangle([Q(cx-.45, 64.6), Q(cx+.45, 56.9)], fill=(205, 202, 195), outline=GREYD)
    g.polygon([Q(74.3, 64.6), Q(83.7, 64.6), Q(83.7, 65.5), Q(79, 66.38), Q(74.3, 65.5)], fill=(205, 202, 195), outline=GREYD)
    # fill under the forecourt and tiers (hatched beige), new walls black
    soil(g, Q, FACE+.3, E_X, PAVE_Y); soil(g, Q, E_X, T50_X, 50); soil(g, Q, T50_X, T46_X, 46)
    # paving
    g.rectangle([Q(ST['x1'], PAVE_Y), Q(E_X-PAR_T, PAVE_Y-.3)], fill=PAVE)
    # stair: flight 1 from 83.50 (56.90) to the landing 55.98, flight 2 to 55.06
    y = 56.90; pts = [Q(83.5, y)]
    x = 83.5
    for k in range(5): y -= ST['rh']; pts += [Q(x, y)]; x += ST['tread'] if k < 4 else 0; pts += [Q(x, y)]
    pts += [Q(ST['landing'][1], y)]; x = ST['landing'][1]
    for k in range(5): y -= ST['rh']; pts += [Q(x, y)]; x += ST['tread'] if k < 4 else 0; pts += [Q(x, y)]
    pts += [Q(ST['x1'], PAVE_Y-.6), Q(83.5, PAVE_Y-.6)]
    g.polygon(pts, fill=STAIRC, outline=(60, 60, 60))
    g.rectangle([Q(ST['landing'][0], 55.98), Q(ST['landing'][1], 55.68)], fill=LAND)
    # walls: east 55 -> 50 with parapet, tier walls
    wall(g, Q, E_X, 50, PAVE_Y, side=-1); parapet(g, Q, E_X-PAR_T, E_X, PAVE_Y)
    wall(g, Q, T50_X, 46, 50, side=-1); wall(g, Q, T46_X, 42.06, 46, side=-1)
    g.rectangle([Q(E_X, 50), Q(T50_X-.6, 49.6)], fill=(150, 120, 80)); g.rectangle([Q(T50_X, 46), Q(T46_X-.6, 45.6)], fill=(150, 120, 80))
    # planting: box beds on 50, a cypress on 46
    g.rectangle([Q(95.4, 50.7), Q(96.6, 50)], fill=BED)
    X, Y = Q(T46_X-1.5, 46); g.ellipse([X-10, Y-7*20, X+10, Y], fill=CYP)
    g.rectangle([Q(T46_X, 42.06), Q(112, 41.7)], fill=(205, 222, 180))
def exA(g, Q):
    # beyond: statue (lz 64.8, 9.2 m north of the axis) and the cheek at lz 68.75, dashed
    X0_, Yb = Q(89.6, PAVE_Y); X1_, Yt = Q(90.8, PAVE_Y+1.6)
    dashed(g, [(X0_, Yb), (X0_, Yt), (X1_, Yt), (X1_, Yb)], BRONZE, 1)
    Xc, Ys = Q(90.2, PAVE_Y+1.6+2.2); dashed(g, [(Xc-8, Yt), (Xc-10, Ys+20), (Xc, Ys), (Xc+10, Ys+20), (Xc+8, Yt)], BRONZE, 1)
    dashed(g, [Q(83.5, 57.85), Q(85.02, 56.93), Q(88.02, 56.93), Q(89.54, 56.01), Q(89.54, PAVE_Y)], (90, 90, 90), 1)
    label(g, Q(95.5, 58.6), '后方雕像 lz 64.8（虚线）', 12, BRONZE)
    label(g, Q(86.5, 58.3), '梯侧栏墙（虚线）', 12, (90, 90, 90))
    # levels
    for (s, y, t, an) in ((72, 56.6, '院 56.60', 'mb'), (82.2, 56.9, '门楼台基 56.90', 'mb'), (86.52, 55.98, '平台 55.98', 'mt'),
                          (91.6, PAVE_Y, '铺地 55.06', 'mt'), (96.0, 50, '50', 'mt'), (100.45, 46, '46', 'mt'), (107, 42.06, '草坪 42.06', 'mt')):
        X, Y = Q(s, y); label(g, (X, Y+(-6 if an == 'mb' else 10)), t, 13, (120, 70, 0) if y > 55 and s > 84 else GREYD)
    for (s, y0, y1, t) in ((E_X+.25, 50, PAVE_Y, '5.0'), (T50_X+.25, 46, 50, '4.0'), (T46_X+.25, 42.06, 46, '4.0'), (E_X-PAR_T/2, PAVE_Y, PAR_TOP, '')):
        if t: X, Y = Q(s, (y0+y1)/2); label(g, (X+16, Y), t, 13, RED)
    label(g, (Q(E_X, PAR_TOP)[0], Q(E_X, PAR_TOP)[1]-12), '胸墙 0.95', 12, (100, 90, 80))
    # stair dims
    X0_, Y_ = Q(83.5, 59.6); X1_, _ = Q(ST['x1'], 59.6); dimline(g, (X0_, Y_), (X1_, Y_), '6.04', size=12)
    dimline(g, Q(85.02, 54.4), Q(88.02, 54.4), '平台 3.00', size=12)
    dimline(g, Q(ST['x1'], 53.4), Q(E_X-PAR_T, 53.4), '3.87', size=12)
    label(g, Q(86.5, 61.2), '10 级（5+5），踢 0.184，踏 0.38', 13, (40, 40, 40))
    label(g, Q(77.5, 52.0), '阿波罗院（现状）', 13, GREYD)
    label(g, Q(88.7, 45.5), '填土', 13, (150, 130, 90))
    label(g, Q(88.0, 49.9), '现地面（黄）', 12, GROUND)
section('A', '02 剖面 A：沿门轴 lz 74（院 → 草坪）', '比例 20 px/m，竖向不放大；看向北（+lz 在纸后）；黄 = 现地面，灰 = 现状，黑 = 新墙，米色 = 填土',
        70, 112, 'lx', profA, exA, '02_section_A_lz74.png')

# ---- B: along lx 93 (lz 48 -> 104), looking west
BZ = lambda lx: 59.845 + (60.261-59.845)*(93.761-lx)/(93.761-87.655)   # the pier's south face at lx
E3 = lambda lx: 57 - (lx-90.5)*5/73.5                                   # sumE edge 3 at lx
def profB(g, Q):
    zs, ze = BZ(93), E3(93)
    soil(g, Q, 48, ze, 55.06, col=(214, 211, 204))                                 # sumE (existing fill)
    g.rectangle([Q(ze-.6, 55.0), Q(ze, gnd(ze))], fill=(140, 138, 132))              # its edge-3 wall (existing, 13 m)
    soil(g, Q, ze, zs, 55.09, col=(198, 195, 188))                                 # corner pier
    g.rectangle([Q(ze-.35, 56.10), Q(ze, 55.09)], fill=(150, 146, 138)) if False else None
    dashed(g, [Q(zs-PAR_T, 55.09), Q(zs-PAR_T, 56.10), Q(zs, 56.10), Q(zs, 55.09)], RED, 2)   # removed south parapet
    soil(g, Q, zs, S_Z, PAVE_Y); soil(g, Q, S_Z, T50_Z, 50); soil(g, Q, T50_Z, T46_Z, 46)
    g.rectangle([Q(zs, PAVE_Y), Q(S_Z-PAR_T, PAVE_Y-.3)], fill=PAVE)
    wall(g, Q, S_Z, 50, PAVE_Y, side=-1); parapet(g, Q, S_Z-PAR_T, S_Z, PAVE_Y)
    wall(g, Q, T50_Z, 46, 50, side=-1); wall(g, Q, T46_Z, gnd(T46_Z), 46, side=-1)
    g.rectangle([Q(S_Z, 50), Q(T50_Z-.6, 49.6)], fill=(150, 120, 80)); g.rectangle([Q(T50_Z, 46), Q(T46_Z-.6, 45.6)], fill=(150, 120, 80))
    for z in (92.4, 94.4): g.rectangle([Q(z, 50.7), Q(z+1.2, 50)], fill=BED)
    X, Y = Q(T46_Z-1.5, 46); g.ellipse([X-10, Y-7*20, X+10, Y], fill=CYP)
def exB(g, Q):
    # beyond (west): the pedestals and statues at lx 90.2, the stair foot and cheeks, the Apollo face, dashed
    for s in DE['pedestals']:
        X0_, Yb = Q(s['lz']-.6, PAVE_Y); X1_, Yt = Q(s['lz']+.6, PAVE_Y+1.6)
        dashed(g, [(X0_, Yb), (X0_, Yt), (X1_, Yt), (X1_, Yb)], BRONZE, 1)
        Xc, Ys = Q(s['lz'], PAVE_Y+3.8); dashed(g, [(Xc-8, Yt), (Xc-10, Ys+20), (Xc, Ys), (Xc+10, Ys+20), (Xc+8, Yt)], BRONZE, 1)
    dashed(g, [Q(67.85, PAVE_Y), Q(67.85, 56.01), Q(80.15, 56.01), Q(80.15, PAVE_Y)], (90, 90, 90), 1)
    dashed(g, [Q(60.55, 66.38), Q(91.3, 66.38)], (170, 170, 170), 1)
    label(g, Q(74, 56.6), '梯脚 + 栏墙（后方）', 12, (90, 90, 90))
    label(g, Q(74, 66.9), '阿波罗门廊檐口 66.38（后方）', 12, (150, 150, 150))
    zs, ze = BZ(93), E3(93)
    label(g, Q(52, 55.6), 'sumE 55.00（现状）', 13, GREYD)
    label(g, (Q(zs-1.5, 57.6)[0], Q(zs-1.5, 57.6)[1]), '角墩 55.09，南胸墙打开（红虚线）', 12, RED)
    label(g, Q(75.5, 54.6), '前庭铺地 55.06', 13, (120, 70, 0))
    label(g, (Q(S_Z, PAR_TOP)[0]-4, Q(S_Z, PAR_TOP)[1]-12), '胸墙 0.95', 12, (100, 90, 80))
    label(g, Q(93.7, 50.9), '50', 13, (40, 90, 40)); label(g, Q(97.3, 46.8), '46', 13, (30, 80, 40))
    for (z, y0, y1, t) in ((S_Z, 50, PAVE_Y, '5.0'), (T50_Z, 46, 50, '4.0'), (T46_Z, 43.8, 46, '2.2')):
        X, Y = Q(z, (y0+y1)/2); label(g, (X+16, Y), t, 13, RED)
    X, Y = Q(ze, 48.0); label(g, (X-30, Y), '13.0（现状墙）', 12, RED, 'rm')
    dimline(g, Q(zs, 58.9), Q(S_Z, 58.9), f'前庭 {S_Z-zs:.2f}（lx 93）', size=12)
    dimline(g, Q(S_Z, 48.4), Q(T50_Z, 48.4), '4.75', size=12)
    dimline(g, Q(T50_Z, 44.9), Q(T46_Z, 44.9), '4.55', size=12)
    label(g, Q(70, 46.0), '填土', 13, (150, 130, 90))
    label(g, Q(101.5, 42.0), '现地面（黄）', 12, GROUND)
section('B', '03 剖面 B：lx 93 南北（sumE → 前庭 → 两级南台 → 草坪）', '比例 20 px/m，竖向不放大；看向西（阿波罗在纸后）；左 = 北，右 = 南',
        48, 104, 'lz', profB, exB, '03_section_B_lx93.png')

# ======================================================================= 04 elevation from the east (cut at lx 92, looking west)
KE = 30; Z_N, Z_S = 54, 95; YB, YT = 53.5, 67.5; ML, MR, MT_, MB_ = 70, 40, 110, 90
We = int((Z_S-Z_N)*KE) + ML + MR; He = int((YT-YB)*KE) + MT_ + MB_
I = Image.new('RGB', (We, He), BG); g = ImageDraw.Draw(I, 'RGBA')
E = lambda lz, y: (ML + (Z_S-lz)*KE, MT_ + (YT-y)*KE)     # looking west: north (small lz) on the right
for yy in range(54, 68):
    g.line([E(Z_S, yy), (E(Z_S, yy)[0]-6, E(Z_S, yy)[1])], fill=(120, 120, 120)); label(g, (ML-10, E(Z_S, yy)[1]), f'{yy}', 12, (120, 120, 120), 'rm', box=False)
for z in range(56, 95, 4):
    label(g, (E(z, YB)[0], E(z, YB)[1]+16), f'lz {z}', 12, (120, 120, 120), box=False)
# the Apollo east wall (portico back wall) between the forecourt's north stub and south parapet
zN, zS = 60.551, S_Z
g.rectangle([E(zS, 66.38), E(zN, PAVE_Y)], fill=(232, 228, 218), outline=GREYD)
g.rectangle([E(zS, DE['dado']['y1']), E(zN, PAVE_Y)], fill=DADO)                       # Pompeian red dado
g.rectangle([E(zS, 66.38), E(zN, 65.80)], fill=(214, 208, 196), outline=GREYD)          # cornice
z = zN + .3
while z + DE['panels']['pitch'] <= zS + .01:                                            # panels (pitch 3.62)
    a, b = z + .25, z + DE['panels']['pitch'] - .25
    if not (b > 66.6 and a < 81.4):
        g.rectangle([E(b, 65.5), E(a, 58.15)], outline=(180, 168, 150), width=2)
    z += DE['panels']['pitch']
for n in DE['niches']:                                                                  # niches: sill 57.85, arched crown 60.60
    a, b = n['lz']-n['w']/2, n['lz']+n['w']/2; r = n['w']/2
    g.rectangle([E(b, n['crown']-r), E(a, n['sill'])], fill=(120, 110, 100))
    g.pieslice([E(b, n['crown'])[0], E(b, n['crown'])[1], E(a, n['crown']-2*r)[0], E(a, n['crown']-2*r)[1]], 180, 360, fill=(120, 110, 100))
    g.rectangle([E(b+.15, n['sill']), E(a-.15, n['sill']-.18)], fill=(214, 208, 196))
    X, Y = E(n['lz'], n['sill']+.9); g.ellipse([X-7, Y-20, X+7, Y+14], fill=BRONZE)  # a small bronze in each niche
# lion spout and basin
b = DE['basin']; g.rectangle([E(b['lz1'], b['top']), E(b['lz0'], PAVE_Y)], fill=(214, 208, 196), outline=GREYD)
g.rectangle([E(b['lz1']-.08, b['top']-.06), E(b['lz0']+.08, b['top']-.25)], fill=WATER)
X, Y = E(DE['lion']['lz'], DE['lion']['y']+.25); g.ellipse([X-14, Y-14, X+14, Y+14], fill=BRONZE)
g.line([E(DE['lion']['lz'], DE['lion']['y']), E(DE['lion']['lz'], b['top'])], fill=WATER, width=3)
# propylon front: four columns at lz 68.75..79.25, base 56.90, entablature, pediment to 66.38 (over the wall top)
g.rectangle([E(81.0, 56.90), E(67.0, 56.60)], fill=(205, 202, 195), outline=GREYD)
for cz in (68.75, 72.25, 75.75, 79.25):
    g.rectangle([E(cz+.45, 63.6), E(cz-.45, 56.90)], fill=(240, 237, 230), outline=GREYD)
    g.rectangle([E(cz+.6, 63.9), E(cz-.6, 63.6)], fill=(230, 226, 218), outline=GREYD)
g.rectangle([E(81.2, 64.8), E(66.8, 63.9)], fill=(226, 222, 212), outline=GREYD)
g.polygon([E(81.4, 64.8), E(74, 66.38), E(66.6, 64.8)], fill=(226, 222, 212), outline=GREYD)
g.rectangle([E(79.25-.45, 63.6), E(68.75+.45, 56.9)], fill=(150, 140, 124))              # the open doorway behind the columns (dark)
for cz in (68.75, 72.25, 75.75, 79.25):
    g.rectangle([E(cz+.45, 63.6), E(cz-.45, 56.90)], fill=(240, 237, 230), outline=GREYD)
# stair: step nosings 56.90 .. 55.06, landing 55.98 with the wreath
y = 56.90
for k in range(10):
    y2 = y - ST['rh']
    g.rectangle([E(ST['lz1'], y), E(ST['lz0'], y2)], fill=STAIRC, outline=(90, 90, 90))
    y = y2
X0_, Yl = E(74+1.1, 55.98); X1_, _ = E(74-1.1, 55.98); g.ellipse([X0_, Yl-6, X1_, Yl+6], outline=(70, 120, 60), width=3)
# cheeks (top: tread + 0.95; at the head 57.85)
for c in DE['cheeks']:
    g.rectangle([E(c[3], 57.85), E(c[2], PAVE_Y)], fill=(200, 192, 178), outline=(60, 60, 60))
# statues on free pedestals
for s in DE['pedestals']:
    g.rectangle([E(s['lz']+.6, PAVE_Y+1.6), E(s['lz']-.6, PAVE_Y)], fill=(232, 226, 214), outline=(60, 60, 60))
    g.rectangle([E(s['lz']+.7, PAVE_Y+1.6), E(s['lz']-.7, PAVE_Y+1.45)], fill=(214, 208, 196), outline=(60, 60, 60))
    xb, yb = E(s['lz'], PAVE_Y+1.6); xt, yt = E(s['lz'], PAVE_Y+1.6+2.2)
    g.polygon([(xb-13, yb), (xb-10, yt+28), (xb-16, yt+22), (xb-6, yt+12), (xt, yt), (xb+6, yt+12), (xb+16, yt+30), (xb+10, yt+28), (xb+13, yb)], fill=BRONZE)
    g.ellipse([xt-7, yt-4, xt+7, yt+10], fill=BRONZE)
# the forecourt's north stub and south parapet (seen end-on) and the corner pier on the right
g.rectangle([E(zS, PAR_TOP), E(zS-PAR_T, PAVE_Y)], fill=(120, 110, 96))
g.rectangle([E(zN+PAR_T, PAR_TOP), E(zN, PAVE_Y)], fill=(120, 110, 96))
g.rectangle([E(Z_S, PAVE_Y), E(Z_N, YB)], fill=FILL)
g.line([E(Z_S, PAVE_Y), E(Z_N, PAVE_Y)], fill=(80, 80, 80), width=2)
g.rectangle([E(BZ(92), 55.09), E(Z_N, YB)], fill=(198, 195, 188), outline=GREYD)
dashed(g, [E(BZ(92), 55.09), E(BZ(92), 56.10), E(BZ(92)-.35, 56.10)], RED, 2)
# labels
label(g, E(74, 66.9), '门楼山花顶 66.38', 12, GREYD)
label(g, E(86.0, 62.5), '粉刷墙板（间距 3.62）', 13, (120, 100, 80))
label(g, E(62.2, 62.5), '粉刷墙板', 13, (120, 100, 80))
for n in DE['niches']: label(g, E(n['lz'], 61.4), '龛（铜像）', 12, (90, 70, 60))
label(g, E(87.4, 54.6) if False else E(90.2, 58.2), '狮口泉 + 水池', 12, BLUE)
label(g, E(76.6 if False else 74, 54.75), '台阶 10 级，宽 10.5', 13, (40, 40, 40), bg=(255, 255, 255, 235))
label(g, E(74, 57.25), '平台 55.98 · 月桂花环', 12, (60, 100, 50), bg=(255, 255, 255, 200))
for s in DE['pedestals']: label(g, E(s['lz'], 59.35), '雕像 2.2', 12, BRONZE)
label(g, E(64.8, 54.75), '基座 1.6', 11, (60, 60, 60)); label(g, E(83.2, 54.75), '基座 1.6', 11, (60, 60, 60))
label(g, E(61.6, 57.35), '红色墙裙 55.06–57.85', 12, (255, 255, 255), bg=(168, 52, 40, 255))
label(g, (E(Z_N, 56.4)[0]-8, E(Z_N, 56.4)[1]), '角墩 55.09（剖到）', 12, GREYD, 'rm')
label(g, E(S_Z-.2, 56.55), '南胸墙', 11, (100, 90, 80))
label(g, E(65.8, 66.0), '檐口 65.80–66.38', 12, GREYD)
stamp(g, We, '04 东立面（自东看，剖于 lx 92，东胸墙未画）', '比例 30 px/m；左 = 南，右 = 北；示意，细部按 R12 §14 部件目录')
I.save(os.path.join(OUT, '04_elevation_east.png'))

# ======================================================================= clearances between the forecourt's free items (R12 §4)
def box(a, b, c, e): return (min(a, b), max(a, b), min(c, e), max(c, e))
def bd(p, q):
    dx = max(0, max(p[0], q[0]) - min(p[1], q[1])); dz = max(0, max(p[2], q[2]) - min(p[3], q[3])); return math.hypot(dx, dz)
items = {'梯+栏墙': box(83.45, 89.54, 67.85, 80.15),
         '北雕像基座': box(89.6, 90.8, 64.2, 65.4), '南雕像基座': box(89.6, 90.8, 82.6, 83.8), '水池': box(83.45, 84.45, 86.4, 88.4),
         '东胸墙': box(E_X-PAR_T, E_X, 59.845, S_Z), '南胸墙': box(W_X, E_X, S_Z-PAR_T, S_Z), '北短墙胸墙': box(W_X, 87.655, 60.55, 60.90),
         '阿波罗墙面': box(80, 83.45, 60.55, S_Z), '东南方墩（待定 2.4）': box(E_X-1.2, E_X+1.2, S_Z-1.2, S_Z+1.2)}
pairs = []; keys = list(items)
for i in range(len(keys)):
    for j in range(i+1, len(keys)):
        dd = bd(items[keys[i]], items[keys[j]]); pairs.append({'a': keys[i], 'b': keys[j], 'd': round(dd, 2), 'bad': 0 < dd < 2.4})
bad = [p for p in pairs if p['bad']]
rib = {'铺地带净宽（北基座—东胸墙）': round(items['东胸墙'][0]-items['北雕像基座'][1], 2)}
json.dump({'pairs': sorted(pairs, key=lambda p: p['d']), 'bad': bad, 'ribbon': rib}, open(os.path.join(OUT, 'sheets_checks.json'), 'w'), ensure_ascii=False, indent=1)
print('bad', bad); print(rib)
