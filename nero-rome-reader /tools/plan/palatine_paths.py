#!/usr/bin/env python
"""R12 13 (briefs/rome/palatine-path-rules.md): the top view and the sections of a part of the Palatine's path network, drawn from the plan tables.

Usage: python tools/plan/palatine_paths.py DUMP OUTDIR [PART]
  DUMP  the output of tools/plan/palatine_paths.mjs: the ground as drawn, the GLBs (their boxes and what they cover seen from above), the stairs, trees
        and piers built now, and the scene's surface along the section lines.
  PART  the key in PAL_PLAN whose tables are drawn as they will be built (default h51), whether its 'on' is set or not.
The plan tables are read from src/scenes/rome/palatine-plan.js itself (node), so the drawings are of the file as it is. Step counts come only from
the levels of the two terraces a stair joins (R12 15.4), with the generator's sizes (palPlatStairs / edgeStair: treads 0.38, flights of at most
15 with 1.5 m landings between, a 1.6 m head landing; risers equal, the level difference over round(difference / 0.2)).
Writes OUTDIR/plan.png, OUTDIR/section_<name>.png, OUTDIR/checks.json and OUTDIR/index.html.
"""
import sys, os, json, math, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from shapely.geometry import Polygon, LineString, Point, box as sbox
from shapely.ops import unary_union, nearest_points

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
dump = json.load(open(sys.argv[1])); OUT = sys.argv[2]; PART = sys.argv[3] if len(sys.argv) > 3 else 'h51'
os.makedirs(OUT, exist_ok=True)
JS = ("const fs=require('fs'),vm=require('vm');const c=fs.readFileSync(process.argv[1],'utf8');const x={inPolyXZ:()=>false};vm.createContext(x);"
      "vm.runInContext(c+';this.P=PAL_PLAN;',x);process.stdout.write(JSON.stringify(x.P));")
PLAN = json.loads(subprocess.check_output(['node', '-e', JS, os.path.join(ROOT, 'src/scenes/rome/palatine-plan.js')]))
H = PLAN[PART]
# ALT=<key>: a proposal from the part's alt table drawn instead (blocks placed elsewhere, a GLB clipped as it would be changed, a line of the tables moved)
ALT = os.environ.get('ALT'); CLIP = {}
if ALT:
    A_ = H['alt'][ALT]; zf, zt = A_.get('shiftZ', [None, None])
    def shz(v): return zt if zf is not None and abs(v-zf) < 1e-6 else v
    for P in H['plats']: P['pts'] = [[x, shz(z)] for x, z in P['pts']]
    H['sumE']['pts'] = [[x, shz(z)] for x, z in H['sumE']['pts']]
    for p in H['pads']: p['box'] = [p['box'][0], p['box'][1], shz(p['box'][2]), p['box'][3]]
    for f in H['flights']: f['axis'] = [[x, shz(z)] for x, z in f['axis']]
    if H.get('basin'): H['basin']['z1'] = shz(H['basin']['z1'])
    H['blocks']['now'] = A_['blocks']; CLIP = A_.get('clip', {})
    for k_ in ('plats', 'sumE', 'pads', 'flights', 'piers', 'niches', 'basin'):   # a table given whole replaces the part's (b: h51's outline, the rim's edge at lz 30, the fills, its corners; b2: basin null)
        if k_ in A_: H[k_] = A_[k_]
    if 'routes' in A_: H['draw']['routes'] = A_['routes']
    if 'extra' in A_: H['draw']['extra'] = A_['extra']   # ways round drawn dashed (not checked)
    if 'marks' in A_: H['draw']['marks'] = A_['marks']   # steps on a hero model's own edge (drawn, listed in checks.json)
    if 'treesOut' in A_: H['draw']['treesOut'] = A_['treesOut']   # trees the alt takes away outside the checker's rules, by the author's word (R9)
FONT = '/System/Library/Fonts/STHeiti Medium.ttc'
_fc = {}
def F(s):
    if s not in _fc: _fc[s] = ImageFont.truetype(FONT, s)
    return _fc[s]
TREAD, LAND, HEAD, PARA = .38, 1.5, 1.6, .36

# ---------------- the plan as it will be built ----------------
plats = [dict(p) for p in PLAN['plats']]
stairs = [dict(s) for s in PLAN['stairs']]
orig = {p['id']: p for p in PLAN['plats']}
if not H['on']:
    for p in plats:
        if p['id'] == 'sumE': p.update(H['sumE'])
    plats += [dict(p) for p in H['plats']]
    stairs += [dict(s) for s in H['stairs']]
    for s in stairs:
        if s['id'] in H['remap']: s['legs'] = H['remap'][s['id']]
NEW_PLATS = {p['id'] for p in H['plats']}
NEW_STAIRS = {s['id'] for s in H['stairs']}

def edges(P):
    pts = P['pts']; n = len(pts); A = sum(pts[i][0]*pts[(i+1) % n][1]-pts[(i+1) % n][0]*pts[i][1] for i in range(n)); foot = P.get('foot') or [None]*n
    E = []
    for i in range(n):
        a, b = pts[i], pts[(i+1) % n]; L = math.hypot(b[0]-a[0], b[1]-a[1]); ux, uz = (b[0]-a[0])/L, (b[1]-a[1])/L
        nx, nz = (uz, -ux) if A > 0 else (-uz, ux)
        E.append(dict(i=i, a=a, b=b, L=L, ux=ux, uz=uz, nx=nx, nz=nz, k=P['edge'][i], foot=foot[i]))
    return E, A
PL = {}
for P in plats:
    P['E'], P['A'] = edges(P); P['poly'] = Polygon(P['pts']); PL[P['id']] = P
# the edges that are new or changed (not in the outline as it is)
def ekey(e): return (round(e['a'][0], 2), round(e['a'][1], 2), round(e['b'][0], 2), round(e['b'][1], 2), e['k'])
OLD_EDGES = set()
for P in PLAN['plats']:
    E, _ = edges(P); OLD_EDGES |= {(P['id'],)+ekey(e) for e in E}
def is_new_edge(P, e): return P['id'] in NEW_PLATS or (P['id'],)+ekey(e) not in OLD_EDGES

X0, X1, Z0, Z1 = dump['box']; Gd = dump['grid']; GH = np.array(Gd['H'])
def gH(lx, lz):
    fi = min(max(lx-Gd['X0'], 0), Gd['nx']-1.001); fj = min(max(lz-Gd['Z0'], 0), Gd['nz']-1.001); i, j = int(fi), int(fj); a, b = fi-i, fj-j
    return GH[j, i]*(1-a)*(1-b)+GH[j, i+1]*a*(1-b)+GH[j+1, i]*(1-a)*b+GH[j+1, i+1]*a*b
def inbox(lx, lz, m=0): return X0-m <= lx <= X1+m and Z0-m <= lz <= Z1+m
def plat_at(lx, lz):
    best = None
    for P in plats:
        if P['poly'].buffer(1e-6).contains(Point(lx, lz)) and (best is None or P['y'] > best['y']): best = P
    return best
def ept(P, i, s, off):
    e = P['E'][i]; return (e['a'][0]+e['ux']*s+e['nx']*off, e['a'][1]+e['uz']*s+e['nz']*off)

# ---------------- stairs: layout from the two levels ----------------
def strip(P, i, sa, sb, oa, ob):
    return Polygon([ept(P, i, sa, oa), ept(P, i, sb, oa), ept(P, i, sb, ob), ept(P, i, sa, ob)])
def layout(S):
    if 'legs' not in S or S.get('floor') is None: return None
    top, floor, w = S['top'], S['floor'], S['w']; dh = top-floor; n = max(1, round(dh/.2)); rh = dh/n
    out = dict(id=S['id'], w=w, top=top, floor=floor, n=n, rh=rh, segs=[], para=[], cl=[], flights=[], new=S['id'] in NEW_STAIRS, frm=S.get('from'), to=S.get('to'))
    left, y, first = n, top, True
    for li, (pid, i, s0, s1, off) in enumerate(S['legs']):
        P = PL[pid]; d = 1 if s1 >= s0 else -1; gp = abs(off)-w/2; sg = 1 if off >= 0 else -1
        oi = sg*(abs(off)-w/2-(gp+.05 if -.01 < gp < .75 else 0)); oo = sg*(abs(off)+w/2)   # inner side (to the wall), outer side (the parapet's)
        def put(kind, sa, sb, yy):
            out['segs'].append((kind, strip(P, i, sa, sb, oi, oo), yy, (pid, i, sa, sb, off)))
            out['para'].append(strip(P, i, sa, sb, oo, oo+sg*PARA))
        if first: put('head', s0, s0+d*HEAD, top); out['cl'].append(ept(P, i, s0, off)+(top,)); s0 += d*HEAD
        else: put('turn', s0, s0+d*LAND, y); s0 += d*LAND
        first = False; Lleg = abs(s1-s0)
        def march(per):
            s, c, inF, seq = 0., 0, 0, []
            while s < Lleg-.2 and c < left:
                if inF >= per: seq.append(('land', s, s+LAND)); s += LAND; inF = 0; continue
                seq.append(('step', s, s+TREAD)); s += TREAD; c += 1; inF += 1
            return seq, c
        _, n0 = march(15); per = max(1, math.ceil(n0/max(1, math.ceil(n0/15)))); seq, c = march(per)
        fl = []
        for kind, a, b in seq:
            if kind == 'step': y -= rh
            put(kind, s0+d*a, s0+d*b, y); out['cl'].append(ept(P, i, s0+d*b, off)+(y,))
            if kind == 'step': fl.append(1)
            elif fl: out['flights'].append(len(fl)); fl = []
        if fl: out['flights'].append(len(fl))
        left -= c; s_end = s0+d*(seq[-1][2] if seq else 0)
        if left <= 0:
            pc = ept(P, i, s_end+d*.2, sg*(abs(off)+w/2+.18)); out['pier'] = sbox(pc[0]-.42, pc[1]-.42, pc[0]+.42, pc[1]+.42)
            out['foot'] = ept(P, i, s_end, off); out['footLeg'] = (pid, i, s_end, off); break
    out['ok'] = left <= 0; out['left'] = left
    out['poly'] = unary_union([s[1] for s in out['segs']]+out['para']+([out['pier']] if 'pier' in out else []))
    out['run'] = sum(abs(s[3][3]-s[3][2]) for s in out['segs'] if s[0] in ('step', 'land'))
    out['angle'] = math.degrees(math.atan2(rh, TREAD)); out['per'] = max(out['flights']) if out['flights'] else 0
    out['head'] = out['cl'][0][:2]
    return out
def layout_flight(S):   # a straight flight between two walls (palFlight): its head landing on a pad, then down along the axis
    (hx, hz), (fx, fz) = S['axis']; top, floor, w = S['top'], S['floor'], S['w']; dh = top-floor; n = max(1, round(dh/.2)); rh = dh/n
    Lx = math.hypot(fx-hx, fz-hz); ux, uz = (fx-hx)/Lx, (fz-hz)/Lx; nx, nz = -uz, ux
    pt = lambda s, o: (hx+ux*s+nx*o, hz+uz*s+nz*o)
    rect = lambda sa, sb, oa, ob: Polygon([pt(sa, oa), pt(sb, oa), pt(sb, ob), pt(sa, ob)])
    out = dict(id=S['id'], w=w, top=top, floor=floor, n=n, rh=rh, segs=[], para=[], cl=[pt(0, 0)+(top,)], flights=[], new=True, frm=S.get('from'), to=S.get('to'))
    def put(kind, sa, sb, yy):
        out['segs'].append((kind, rect(sa, sb, -w/2, w/2), yy, None))
        for c in S.get('cheeks', [1, -1]): out['para'].append(rect(sa, sb, c*w/2, c*(w/2+PARA)))
    hd = S.get('head', HEAD)
    if hd: put('head', 0, hd, top)
    s, y, inF, fl = hd, top, 0, []
    per = max(1, math.ceil(n/max(1, math.ceil(n/15)))); c = 0
    while c < n:
        if inF >= per: put('land', s, s+LAND, y); s += LAND; inF = 0; out['flights'].append(len(fl)); fl = []; continue
        y -= rh; put('step', s, s+TREAD, y); s += TREAD; c += 1; inF += 1; fl.append(1); out['cl'].append(pt(s, 0)+(y,))
    out['flights'].append(len(fl)); out['ok'] = s <= Lx+.01; out['left'] = 0; out['foot'] = pt(s, 0)
    out['poly'] = unary_union([q[1] for q in out['segs']]+out['para']); out['run'] = s-hd; out['angle'] = math.degrees(math.atan2(rh, TREAD)); out['head'] = (hx, hz)
    return out
LAY = {}
for S in stairs:
    if S['id'] not in NEW_STAIRS: continue
    L_ = layout(S)
    if L_: LAY[S['id']] = L_
for S in H.get('flights', []): LAY[S['id']] = layout_flight(S)
PADS = [dict(p) for p in H.get('pads', [])]

# ---------------- corner piers (palPierPlan and terraceEdge's corners, as the generator places them) ----------------
EX_ST = [dict(id=s['id'], w=s['w'], line=LineString([p[:2] for p in s['pts']])) for s in dump['palStairs'] if len(s['pts']) > 1]
EX_ST += [dict(id='hill', w=h['w'], line=LineString(h['R'])) for h in dump['hillStairs'] if len(h['R']) > 1]
for k, L_ in LAY.items():
    if L_['new']: EX_ST.append(dict(id=k, w=L_['w'], line=LineString([p[:2] for p in L_['cl']])))
def wall_foot(P, e, s):   # the ground or floor at the foot of the wall at s along edge e
    if e['foot'] is not None: return e['foot']
    x, z = e['a'][0]+e['ux']*s+e['nx']*.6, e['a'][1]+e['uz']*s+e['nz']*.6
    Q = plat_at(x, z)
    return Q['y'] if Q and Q is not P else gH(x, z)
PIERS, DROPPED, ABUT = [], [], []
for P in plats:
    E = P['E']; n = len(E)
    for v in range(n):
        lx, lz = P['pts'][v]
        if not inbox(lx, lz, 4): continue
        e0, e1 = E[(v+n-1) % n], E[v]; w0, w1 = e0['k'] == 'w', e1['k'] == 'w'
        if not w0 and not w1: continue
        big = True
        if w0 and w1:
            if math.acos(max(-1, min(1, e0['ux']*e1['ux']+e0['uz']*e1['uz']))) < math.radians(20): big = False
        elif (e1['k'] if w0 else e0['k']) in ('m', 'st', 'o'): big = False
        near = [s['id'] for s in EX_ST if s['line'].distance(Point(lx, lz)) < s['w']/2+.6+4.4]
        gF = min([e0['foot']] if w0 and e0['foot'] is not None else []+[e1['foot']] if w1 and e1['foot'] is not None else []) if (w0 and e0['foot'] is not None) or (w1 and e1['foot'] is not None) else None
        ux = (e0['ux'] if w0 else 0)+(e1['ux'] if w1 else 0); uz = (e0['uz'] if w0 else 0)+(e1['uz'] if w1 else 0); ul = math.hypot(ux, uz) or 1; ux, uz = ux/ul, uz/ul
        if gF is None:
            gF = min(gH(lx+ux*a-uz*b, lz+uz*a+ux*b) for a, b in ((0, 0), (-3, -3), (3, -3), (3, 3), (-3, 3)))
        h = P['y']-gF; new = (w0 and is_new_edge(P, e0)) or (w1 and is_new_edge(P, e1))
        if [P['id'], v] in H.get('piers', {}).get('abut', []): ABUT.append(dict(id=f"{P['id']}@{v}", lx=lx, lz=lz)); continue   # the wall runs into a model's face: no pier
        if [P['id'], v] in H.get('piers', {}).get('drop', []): DROPPED.append(dict(id=f"{P['id']}@{v}", lx=lx, lz=lz, h=h, big=big and not near and h >= 1.5)); continue
        if big and not near and h >= 1.5:
            sq = Polygon([(lx+ux*a-uz*b, lz+uz*a+ux*b) for a, b in ((-3.06, -3.06), (3.06, -3.06), (3.06, 3.06), (-3.06, 3.06))])
            PIERS.append(dict(id=f"{P['id']}@{v}", kind='6 m', P=P['id'], v=v, poly=sq, h=h, new=new, y=P['y']))
        elif w0 and w1:
            cr = e0['ux']*e1['uz']-e0['uz']*e1['ux']
            if cr*(1 if P['A'] > 0 else -1) <= 0 or P['y']-gF < .6: continue
            bx, bz = e0['nx']+e1['nx'], e0['nz']+e1['nz']; bl = math.hypot(bx, bz) or 1; bx, bz = bx/bl, bz/bl; cx, cz = lx+bx*.3, lz+bz*.3
            sq = Polygon([(cx+bx*a+bz*b, cz+bz*a-bx*b) for a, b in ((-.95, -.95), (.95, -.95), (.95, .95), (-.95, .95))])
            PIERS.append(dict(id=f"{P['id']}@{v}", kind='1.9 m', P=P['id'], v=v, poly=sq, h=h, new=new, y=P['y'], near=near))
# a higher pier within 4 m wins (palPierPlan)
PIERS = [c for c in PIERS if not any(d is not c and d['kind'] == '6 m' and c['kind'] == '6 m' and d['y'] > c['y'] and d['poly'].centroid.distance(c['poly'].centroid) < 4 for d in PIERS)]

# ---------------- what stands there: footprints ----------------
BLK = dump['blk']
def blk_name(b): return BLK[b[0]]['n']+('_low' if len(b) > 5 and b[5] else '')
def blk_dr(b): return 3.3 if (len(b) > 5 and b[5]) else BLK[b[0]]['dr']
def blk_rect(b):   # the registered footprint (palPlBuild: nominal sizes with the GLBs' overhangs; the flat c: its model's rect)
    t, lx, lz, tn = b[0], b[1], b[2], b[3]; k = BLK[t]; hw, hd = k['w']/2, k['d']/2
    if t == 'cf':
        q = round(tn/90) % 4; x0, x1, y0, y1 = -15, 15, -10, 15
        P_ = [(lx+x, lz-y) if q == 0 else (lx-y, lz-x) if q == 1 else (lx-x, lz+y) if q == 2 else (lx+y, lz+x) for x, y in ((x0, y0), (x1, y1))]
        return sbox(min(P_[0][0], P_[1][0]), min(P_[0][1], P_[1][1]), max(P_[0][0], P_[1][0]), max(P_[0][1], P_[1][1]))
    return sbox(lx-hw, lz-hd, lx+hw, lz+hd) if round(tn/90) % 2 == 0 else sbox(lx-hd, lz-hw, lx+hd, lz+hw)
BLOC = dump.get('blkLocal', {})
def blk_glb(b):   # the block's GLB as it meets the ground (its band: walls, steps, porch; not its eaves), from its own raster; None if the page had no such GLB
    R = BLOC.get(blk_name(b))
    if not R: return None
    if 'band' in R:   # its walls, steps and porch from 0.05 to 2.5 m over its low floor (not its eaves), on its own 0.1 m grid, the inside filled
        M_ = np.frombuffer(R['band'].encode(), dtype=np.uint8).reshape(R['bnz'], R['bnx']) == ord('1'); st = R['bst']
    else:
        M_ = np.array(R['top']).reshape(R['nz'], R['nx']) > -blk_dr(b)+.3; st = R['st']
    cz = CLIP.get(blk_name(b), {}).get('z1'); cx = (CLIP[blk_name(b)].get('x0'), CLIP[blk_name(b)].get('x1')) if cz is not None else (None, None)
    if cz is not None:   # ALT: the GLB as it would be changed (cut at its local z; only between x0 and x1 when given)
        M_ = M_.copy(); j0_ = max(0, int((cz-R['Z0'])/st)+1)
        if cx[0] is None: M_[j0_:, :] = False
        else: M_[j0_:, max(0, int((cx[0]-R['X0'])/st)):int((cx[1]-R['X0'])/st)+1] = False
    js, is_ = np.nonzero(M_)
    if not len(js): return None
    t = math.radians(b[3]); c, sn = math.cos(t), math.sin(t)
    def tr(x, z): return (b[1]+x*c+z*sn, b[2]-x*sn+z*c)
    cells = []   # runs along each row, one rectangle each
    for j in np.unique(js):
        row = np.sort(is_[js == j]); br = np.nonzero(np.diff(row) > 1)[0]; st_ = np.r_[row[0], row[br+1]]; en_ = np.r_[row[br], row[-1]]
        for i0_, i1_ in zip(st_, en_):
            xa, xb, za, zb = R['X0']+i0_*st, R['X0']+(i1_+1)*st, R['Z0']+j*st, R['Z0']+(j+1)*st
            cells.append(Polygon([tr(xa, za), tr(xb, za), tr(xb, zb), tr(xa, zb)]))
    U = unary_union(cells).buffer(.3, join_style=2).buffer(-.3, join_style=2)
    if 'band' in R: U = unary_union([Polygon(q.exterior) for q in (U.geoms if hasattr(U, 'geoms') else [U]) if q.area > .3])
    if 'bx' in R:   # clipped to the exact extent of the band's geometry (the cells overstate the outer faces by up to one cell)
        x0_, x1_, z0_, z1_ = R['bx']; z1_ = min(z1_, cz) if cz is not None and cx[0] is None else z1_; U = U.intersection(Polygon([tr(x0_, z0_), tr(x1_, z0_), tr(x1_, z1_), tr(x0_, z1_)]))
    return U
was = [tuple(b) for b in H['blocks']['was']]; now = [tuple(b) for b in H['blocks']['now']]
blocks_after = [tuple(b) for b in dump['bl'] if tuple(b[:5]) not in [w[:5] for w in was]]+now
ITEMS = []   # id, kind, geom, new
for b in blocks_after:
    r = blk_rect(b)
    if not r.intersects(sbox(X0, Z0, X1, Z1)): continue
    gl = blk_glb(b)
    ITEMS.append(dict(id=f"{b[0]}@{b[1]:g},{b[2]:g}", kind='block', geom=gl if gl is not None else r, rect=r, new=b in now, b=b, glb=gl is not None))
# the hero models as they cover the ground, less what the new floors bury (their triangles over the floor or the ground there by 0.1 m)
OC = dump['occ']; LAB = np.array(OC['lab']).reshape(OC['nz'], OC['nx']); TOP = np.array(OC['top']).reshape(OC['nz'], OC['nx'])/10.
GLB = dump['glb']
def glb_is_block(g): return g['n'].startswith('rome_pal_block_')
FLOOR_AFTER = np.full(LAB.shape, np.nan)
for P in plats:
    if not P['poly'].intersects(sbox(X0, Z0, X1, Z1)): continue
    x0, z0, x1, z1 = P['poly'].bounds
    for j in range(max(0, int((z0-OC['Z0'])/OC['st'])), min(OC['nz'], int((z1-OC['Z0'])/OC['st'])+1)):
        for i in range(max(0, int((x0-OC['X0'])/OC['st'])), min(OC['nx'], int((x1-OC['X0'])/OC['st'])+1)):
            x, z = OC['X0']+(i+.5)*OC['st'], OC['Z0']+(j+.5)*OC['st']
            if (np.isnan(FLOOR_AFTER[j, i]) or P['y'] > FLOOR_AFTER[j, i]) and P['poly'].contains(Point(x, z)): FLOOR_AFTER[j, i] = P['y']
def occ_poly(gi, after):
    m = LAB == gi+1
    if after: m &= ~(TOP <= np.nan_to_num(FLOOR_AFTER, nan=-1e9)+.1)
    js, is_ = np.nonzero(m)
    if not len(js): return None
    st = OC['st']; cells = [sbox(OC['X0']+i*st, OC['Z0']+j*st, OC['X0']+(i+1)*st, OC['Z0']+(j+1)*st) for j, i in zip(js, is_)]
    return unary_union(cells).buffer(.01).buffer(-.01)
MODELS = []
for gi, g in enumerate(GLB):
    pg = occ_poly(gi, False)
    if pg is None or pg.area < 1: continue
    old = glb_is_block(g) and any(abs(g['lx']-w[1]) < .6 and abs(g['lz']-w[2]) < .6 for w in was)
    pa = occ_poly(gi, True) if not glb_is_block(g) else None
    MODELS.append(dict(gi=gi, n=g['n'], geom=pg, after=pa, old=old, g=g))
    if not glb_is_block(g) and pa is not None and pa.area > .2: ITEMS.append(dict(id=g['n'].replace('rome_', ''), kind='model', geom=pa, new=False))
# draw.probes: hero models' exact faces next to the new work (rays every 0.25 m): the foot height's faces replace the 0.5 m raster in the strip probed
PFACE, PUP = [], []   # foot faces (checked), faces higher up (clear width only)
def runs(P, hs):
    out, cur = [], []
    for s_, v in hs:
        if v is None or (cur and abs(v-cur[-1][1]) > .3):
            if len(cur) > 1: out.append(cur)
            cur = [] if v is None else [(s_, v)]
        else: cur.append((s_, v))
    if len(cur) > 1: out.append(cur)
    return [LineString([(a, b) if P['along'] == 'x' else (b, a) for a, b in r]) for r in out]
for P in dump.get('probes', []):
    if P.get('err'): print('probe', P['id'], P['err']); continue
    HT = {float(k): v for k, v in P['hits'].items()}
    P['y'] = [y for y in next((q['y'] for q in H['draw'].get('probes', []) if q['id'] == P['id']), P['y']) if float(y) in HT]   # the heights the tables ask for now
    for k, y in enumerate(P['y']):
        g_ = unary_union(runs(P, HT[float(y)]))
        if g_.is_empty: continue
        (PFACE if k == 0 else PUP).append(dict(id=P['id']+(f" @{y:g}" if k else ''), m=P['m'], y=y, geom=g_))
    # in the strip the rays swept the model's footprint is theirs: each hit a column from the face to the strip's far side (sides within half a step)
    hs_ = P.get('step', .25)/2; ef = P['at']+P['dir']*P['far']; a_, b_ = sorted([P['at'], ef]); band_ = sbox(P['s'][0]-hs_, a_, P['s'][1]+hs_, b_) if P['along'] == 'x' else sbox(a_, P['s'][0]-hs_, b_, P['s'][1]+hs_)
    cols = []
    for s_, v in HT[float(P['y'][0])]:
        if v is None: continue
        c0, c1 = sorted([v, ef]); cols.append(sbox(s_-hs_, c0, s_+hs_, c1) if P['along'] == 'x' else sbox(c0, s_-hs_, c1, s_+hs_))
    cols = unary_union(cols)
    for it in ITEMS:
        if it['kind'] == 'model' and 'rome_'+it['id'] == P['m']: it['geom'] = it['geom'].difference(band_).union(cols)
for f in PFACE: ITEMS.append(dict(id=f['id'], kind='face', geom=f['geom'], new=False))
ITEMS = [it for it in ITEMS if not it['geom'].is_empty]
TEMPLES = []
for t in dump['temples']:
    q = round(t['turn']/90) % 4; hw, hl = t['W']/2, t['L']/2
    pod = sbox(t['lx']-hw, t['lz']-hl, t['lx']+hw, t['lz']+hl) if q % 2 == 0 else sbox(t['lx']-hl, t['lz']-hw, t['lx']+hl, t['lz']+hw)
    stp = sbox(t['lx']-hw+1, t['lz']+hl, t['lx']+hw-1, t['lz']+hl+t['run']) if q == 0 else None   # the front stair (temple(): on the +z side at turn 0)
    TEMPLES.append(dict(t=t, pod=pod, stp=stp))
    ITEMS.append(dict(id='temple JV', kind='temple', geom=unary_union([pod]+([stp] if stp else [])), new=False))
for k, L_ in LAY.items():
    ITEMS.append(dict(id='stair '+k, kind='stair', geom=L_['poly'], new=L_['new'], stair=k))
for s_ in dump['palStairs']:
    if s_['id'] in LAY or len(s_['pts']) < 2: continue
    ITEMS.append(dict(id='stair '+s_['id'], kind='stair', geom=LineString([p[:2] for p in s_['pts']]).buffer(s_['w']/2+PARA, cap_style=2), new=False, stair=s_['id']))
for p in PADS: ITEMS.append(dict(id='pad '+p['id'], kind='pad', geom=sbox(p['box'][0], p['box'][2], p['box'][1], p['box'][3]), new=True))
EW = H.get('end'); BED = H.get('bed')
if EW: ITEMS.append(dict(id='end wall', kind='wall', geom=sbox(EW['x0'], EW['z0'], EW['x1'], EW['z1']), new=True))
if BED: ITEMS.append(dict(id='planting bed', kind='bed', geom=sbox(BED['x0'], BED['z0'], BED['x1'], BED['z1']), new=True))
for c in PIERS: ITEMS.append(dict(id='pier '+c['id'], kind='pier', geom=c['poly'], new=c['new']))
for c in dump['piers']:   # the piers built now that the part keeps (palPierPlan as the page has it)
    if not any(p['id'] == f"{c['id']}@{c['v']}" for p in PIERS) and inbox(c['lx'], c['lz']): pass
WALLS = []
for P in plats:
    for e in P['E']:
        if e['k'] != 'w': continue
        ln = LineString([e['a'], e['b']])
        if not ln.intersects(sbox(X0-2, Z0-2, X1+2, Z1+2)): continue
        hs = [P['y']-wall_foot(P, e, s) for s in np.linspace(.3, e['L']-.3, max(2, int(e['L'])))]
        WALLS.append(dict(id=f"{P['id']}:{e['i']}", P=P['id'], e=e, geom=ln, new=is_new_edge(P, e), hmin=min(hs), hmax=max(hs), y=P['y']))
        ITEMS.append(dict(id='wall '+f"{P['id']}:{e['i']}", kind='wallline', geom=ln, new=is_new_edge(P, e), P=P['id'], ei=e['i']))

# ---------------- checks: overlaps (R12 12) and gaps (R12 4: 0 or >= 2.4 m) ----------------
def own_wall(a, b):   # a stair and the wall it runs along / leaves from; a pier and its own walls
    for x, y in ((a, b), (b, a)):
        if x['kind'] == 'stair' and y['kind'] == 'wallline' and x.get('stair') in LAY:
            if any(sg[3] and sg[3][0] == y['P'] and sg[3][1] == y['ei'] for sg in LAY[x['stair']]['segs']): return True
        if x['kind'] == 'pier' and y['kind'] == 'wallline' and x['id'].split(' ')[1].split('@')[0] == y['P']: return True
    return False
def tol(a, b):   # two areas: a block's footprint is a 0.1 m raster (its outer faces exact), so it may stand out of its walls by one cell; otherwise 5 cm
    return .11 if any(x['kind'] == 'block' and x.get('glb') for x in (a, b)) else .05
def _flat(g):   # a geometry's simple pieces (collections opened, nested ones too)
    return [] if g.is_empty else [q for h in g.geoms for q in _flat(h)] if hasattr(g, 'geoms') else [g]
def depth(ln, pg):   # how far a line inside a polygon runs from its boundary (the overlap's depth)
    pts = [q.interpolate(t) for q in _flat(ln) if q.geom_type in ('LineString', 'LinearRing') and q.length for t in np.arange(0, q.length+1e-9, .05)]   # a multi-line: each piece
    return max([pg.boundary.distance(q) for q in pts] or [0])
overl, gaps = [], []
POLYS = [it for it in ITEMS if it['kind'] not in ('wallline', 'face')]
for i, a in enumerate(ITEMS):
    for b in ITEMS[i+1:]:
        if not (a['new'] or b['new']) or own_wall(a, b): continue
        LINE = ('wallline', 'face')
        if a['kind'] in LINE and b['kind'] in LINE and (a['kind'] == b['kind'] or a['geom'].distance(b['geom']) < .05): continue
        ga, gb = a['geom'], b['geom']
        if ga.distance(gb) > 2.4: continue
        if a['kind'] in LINE and b['kind'] in LINE: pass
        elif a['kind'] in LINE or b['kind'] in LINE:
            ln, pg = (ga, gb) if a['kind'] in LINE else (gb, ga)
            inter = ln.intersection(pg); m = inter.length; unit = 'm'
            if m > .1 and depth(inter, pg) <= .05: m = 0   # a face or wall line: 5 cm (a block's raster may show it up to 0.1 m deep; such a line is listed)
        else:
            inter = ga.intersection(gb); m = inter.area; unit = 'm²'
            if m > .05 and 2*m/max(inter.length, 1e-9) <= tol(a, b): m = 0   # thinner than the tolerance: a raster's cell, not an overlap
        if a['kind'] in LINE and b['kind'] in LINE: m, unit = 0, 'm'
        if (unit == 'm' and m > .1) or (unit == 'm²' and m > .05):
            c = inter.centroid; overl.append(dict(a=a['id'], b=b['id'], amount=round(m, 2), unit=unit, at=[round(c.x, 1), round(c.y, 1)],
                                                  depth=round(depth(inter, pg) if unit == 'm' else 2*m/max(inter.length, 1e-9), 3)))
            continue
        d = ga.distance(gb)
        if .05 < d < 2.4:
            p, q = nearest_points(ga, gb); seg = LineString([p, q])
            others = [it['geom'] for it in POLYS if it is not a and it is not b and it['geom'].distance(seg) < .05]
            if others and seg.difference(unary_union(others).buffer(.06)).length < .05: continue   # filled by something else (an end wall, a pad)
            gaps.append(dict(a=a['id'], b=b['id'], d=round(d, 2), at=[round((p.x+q.x)/2, 1), round((p.y+q.y)/2, 1)], p=[p.x, p.y], q=[q.x, q.y]))

FACE_M = {f['id']: f['m'].replace('rome_', '') for f in PFACE}
def dkey(o): return tuple(sorted(FACE_M.get(x, x) for x in (o['a'], o['b'])))
_seen = {}
for o in sorted(overl, key=lambda o: o['unit'] != 'm'): _seen.setdefault(dkey(o), o)   # the face's line first
overl = list(_seen.values()); _seen = {}
for q in sorted(gaps, key=lambda q: q['d']): _seen.setdefault(dkey(q), q)
gaps = list(_seen.values())

CLR = []   # clear width higher up (a buttress's cap over the foot): the new blocks, pads and stairs against the probes' upper faces
for f in PUP:
    for it in ITEMS:
        top_ = it['b'][4]+9 if it['kind'] == 'block' else max([p['y'] for p in PADS if 'pad '+p['id'] == it['id']]+[LAY[it['stair']]['top'] if it.get('stair') in LAY else -1])
        if it['new'] and it['kind'] in ('block', 'pad', 'stair') and top_ >= f['y'] and it['geom'].distance(f['geom']) < 3:   # only what rises to the face's height
            dd = it['geom'].distance(f['geom']); CLR.append(dict(a=it['id'], b=f['id'], d=round(dd, 2), ok=dd < .05 or dd >= 2.4))

# ---------------- top view ----------------
K, M = 7, 50
Wp, Hp = int((X1-X0)*K)+2*M, int((Z1-Z0)*K)+2*M
def P_(lx, lz): return (M+(lx-X0)*K, M+(lz-Z0)*K)
def lvl_col(y, a=255):
    t = max(0, min(1, (y-50)/7))
    return (int(120+t*125), int(170+t*30-abs(t-.5)*40), int(235-t*135), a)
px = X0+(np.arange(int((X1-X0)*K))+.5)/K; pz = Z0+(np.arange(int((Z1-Z0)*K))+.5)/K
gi_ = np.clip(px-Gd['X0'], 0, Gd['nx']-1.001); gj_ = np.clip(pz-Gd['Z0'], 0, Gd['nz']-1.001); i0 = gi_.astype(int); j0 = gj_.astype(int); fa = gi_-i0; fb = gj_-j0
G = (GH[j0][:, i0]*(1-fa)[None, :]*(1-fb)[:, None]+GH[j0][:, i0+1]*fa[None, :]*(1-fb)[:, None]+GH[j0+1][:, i0]*(1-fa)[None, :]*fb[:, None]+GH[j0+1][:, i0+1]*fa[None, :]*fb[:, None])
sh = np.clip((G-44)/16, 0, 1); base = np.stack([228+sh*14, 226+sh*12, 214+sh*8], -1)
lev = np.floor(G); ed = np.zeros_like(G, bool); ed[:, 1:] |= lev[:, 1:] != lev[:, :-1]; ed[1:, :] |= lev[1:, :] != lev[:-1, :]
base[ed] *= .86
im = Image.new('RGBA', (Wp, Hp), (250, 250, 247, 255)); im.paste(Image.fromarray(base.astype(np.uint8)), (M, M))
def layer(): return Image.new('RGBA', im.size, (0, 0, 0, 0))
def comp(L):
    global im; im = Image.alpha_composite(im, L)
def geoms(g):
    if g.is_empty: return []
    return list(g.geoms) if hasattr(g, 'geoms') else [g]
def fill(g, col, outline=None, w=1, L=None):
    own = L is None; L = L or layer(); d = ImageDraw.Draw(L)
    for p in geoms(g):
        if p.geom_type == 'Polygon':
            d.polygon([P_(*c) for c in p.exterior.coords], fill=col, outline=None)
            for h in p.interiors: d.polygon([P_(*c) for c in h.coords], fill=(0, 0, 0, 0))
            if outline: d.line([P_(*c) for c in p.exterior.coords], fill=outline, width=w)
        elif p.geom_type == 'LineString' and outline: d.line([P_(*c) for c in p.coords], fill=outline, width=w)
    if own: comp(L)
def hatch(g, col=(210, 30, 30, 200), sp=7, w=2):
    mk = Image.new('L', im.size, 0); d = ImageDraw.Draw(mk)
    for p in geoms(g):
        if p.geom_type == 'Polygon': d.polygon([P_(*c) for c in p.exterior.coords], fill=255)
    hl = layer(); dh = ImageDraw.Draw(hl)
    for c in range(-Hp, Wp, sp): dh.line([(c, 0), (c+Hp, Hp)], fill=col, width=w)
    a = np.array(hl); a[..., 3] = (a[..., 3].astype(int)*(np.array(mk) > 0)).astype(np.uint8); comp(Image.fromarray(a))
    fill(g, (0, 0, 0, 0), outline=(200, 20, 20, 255), w=2)
# terraces by level
for P in plats:
    if not P['poly'].intersects(sbox(X0, Z0, X1, Z1)): continue
    fill(P['poly'], lvl_col(P['y'], 120 if P['id'] in NEW_PLATS or P['id'] == 'sumE' else 70))
# models now (grey), the blocks: removed / moved (red hatching), as built (brown; new: orange outline)
for m_ in MODELS:
    if m_['old'] or glb_is_block(m_['g']): continue
    fill(m_['geom'], (190, 182, 170, 110), outline=(150, 140, 128, 255))   # now
    if m_['after'] is not None: fill(m_['after'], (140, 130, 118, 150), outline=(90, 80, 70, 255))   # what still shows over the new floors
for m_ in MODELS:
    if m_['old']: hatch(m_['geom'])
for it in ITEMS:
    if it['kind'] == 'block':
        fill(it['geom'], (125, 88, 62, 170) if not it['new'] else (160, 105, 60, 190), outline=(240, 130, 0, 255) if it['new'] else (70, 45, 30, 255), w=3 if it['new'] else 1)
for T in TEMPLES:
    fill(T['pod'], (180, 50, 45, 200), outline=(110, 20, 20, 255))
    if T['stp'] is not None: fill(T['stp'], (220, 130, 120, 200), outline=(110, 20, 20, 255))
for p in PADS: fill(sbox(p['box'][0], p['box'][2], p['box'][1], p['box'][3]), lvl_col(p['y'], 200), outline=(240, 130, 0, 255), w=2)
if BED: fill(sbox(BED['x0'], BED['z0'], BED['x1'], BED['z1']), (80, 160, 70, 230), outline=(240, 130, 0, 255), w=2)
if EW:
    fill(sbox(EW['x0'], EW['z0'], EW['x1'], EW['z1']), (70, 70, 75, 255), outline=(240, 130, 0, 255), w=2)
    nc = EW['niche']; fill(sbox(EW['x0'], nc['z']-nc['w']/2, EW['x0']+nc['d'], nc['z']+nc['w']/2), (250, 250, 247, 255))
NICHES = H.get('niches', [])   # a niche in a wall's face at (x, z), going dir (+1: towards +z) d m into the wall, w wide (the court's end, alt b)
for nc in NICHES: fill(sbox(nc['x']-nc['w']/2, min(nc['z'], nc['z']+nc['dir']*nc['d']), nc['x']+nc['w']/2, max(nc['z'], nc['z']+nc['dir']*nc['d'])), (250, 250, 247, 255), outline=(240, 130, 0, 255), w=2)
# piers
for c in PIERS: fill(c['poly'], (120, 120, 125, 230) if not c['new'] else (200, 120, 50, 220), outline=(40, 40, 40, 255))
# existing stairs (from the page)
for s in dump['palStairs']:
    if s['id'] in LAY and LAY[s['id']]['new']: continue
    if len(s['pts']) > 1: fill(LineString([p[:2] for p in s['pts']]).buffer(s['w']/2, cap_style=2), (215, 215, 220, 230), outline=(60, 60, 60, 255))
im = im.convert('RGB'); g = ImageDraw.Draw(im)
def line(a, b, col, w): g.line([P_(*a), P_(*b)], fill=col, width=w)
def lab(x, z, s, f=12, col=(0, 0, 0), bg=True, anchor='l'):
    X, Y = P_(x, z); bb = g.textbbox((0, 0), s, font=F(f)); tw, th = bb[2], bb[3]
    if anchor == 'c': X -= tw/2; Y -= th/2
    X = min(X, im.size[0]-tw-4)   # keep a label near the right edge on the sheet
    if bg: g.rectangle([X-2, Y-1, X+tw+2, Y+th+2], fill=(255, 255, 255))
    g.text((X, Y), s, font=F(f), fill=col)
# walls (black; new: orange under), edges of other kinds
for P in plats:
    if not P['poly'].intersects(sbox(X0-2, Z0-2, X1+2, Z1+2)): continue
    for e in P['E']:
        a, b = e['a'], e['b']
        if e['k'] == 'w':
            if is_new_edge(P, e): line(a, b, (245, 140, 20), 9)
            line(a, b, (25, 25, 25), 5)
        elif e['k'] == 'o': line(a, b, (30, 120, 220), 3)
        elif e['k'] == 's': line(a, b, (90, 110, 160), 1)
# new stairs: treads, arrow at the lower end pointing down
for k, L_ in LAY.items():
    for kind, poly, y, _leg in L_['segs']:
        cs = list(poly.exterior.coords)
        g.polygon([P_(*c) for c in cs], fill=(238, 238, 240) if kind == 'step' else (205, 205, 210), outline=(0, 0, 0))
    for pp in L_['para']: g.polygon([P_(*c) for c in pp.exterior.coords], fill=(150, 150, 155))
    if 'pier' in L_: g.polygon([P_(*c) for c in L_['pier'].exterior.coords], fill=(90, 90, 95))
    if L_['new']:
        for p in geoms(L_['poly']): g.line([P_(*c) for c in p.exterior.coords], fill=(240, 130, 0), width=2)
    if 'foot' in L_:
        fx, fz = L_['foot']; hx, hz = L_['cl'][-2][:2]; dx, dz = fx-hx, fz-hz; dl = math.hypot(dx, dz) or 1; dx, dz = dx/dl, dz/dl
        A_, B_ = P_(fx, fz), P_(fx-dx*2.2, fz-dz*2.2); qx, qz = -(B_[1]-A_[1])*.45, (B_[0]-A_[0])*.45
        g.polygon([A_, (B_[0]+qx, B_[1]+qz), (B_[0]-qx, B_[1]-qz)], fill=(0, 0, 0))
def dashed(pts, col, w=1, on=5, off=4):
    for a_, b_ in zip(pts, pts[1:]):
        (ax, az), (bx, bz) = P_(*a_), P_(*b_); L = math.hypot(bx-ax, bz-az); n = int(L/(on+off))+1
        for k in range(n):
            t0, t1 = k*(on+off)/max(L, 1e-6), min(1, (k*(on+off)+on)/max(L, 1e-6))
            if t0 < 1: g.line([(ax+(bx-ax)*t0, az+(bz-az)*t0), (ax+(bx-ax)*t1, az+(bz-az)*t1)], fill=col, width=w)
for it in ITEMS:
    if it['kind'] == 'block' and it.get('glb'): dashed(list(it['rect'].exterior.coords), (70, 45, 30) if not it['new'] else (240, 130, 0), 1)
for c in DROPPED:   # no 6 m pier here; a 0.56 m square pier ends the wall (the coping and parapet run into it)
    X, Y = P_(c['lx'], c['lz']); g.rectangle([X-8, Y-8, X+8, Y+8], outline=(200, 20, 20), width=1); g.polygon([P_(*q) for q in sbox(c['lx']-.28, c['lz']-.28, c['lx']+.28, c['lz']+.28).exterior.coords], fill=(90, 90, 95), outline=(0, 0, 0))
for c in ABUT:
    X, Y = P_(c['lx'], c['lz']); g.ellipse([X-6, Y-6, X+6, Y+6], outline=(120, 60, 160), width=2)
# trees: kept (green), in a new terrace's footprint or under new work (red cross: they go)
NEWG = unary_union([PL[i]['poly'] for i in NEW_PLATS]+[it['geom'] for it in ITEMS if it['new'] and it['kind'] != 'wallline']+
                   [Polygon(H['sumE']['pts']).difference(Polygon(orig['sumE']['pts']))])
# the reviewer, 11-15: a tree goes only where new work stands: a new block, a new wall (its body and batter 1 m round its line; inside the floor its slab
# band, 1.86 m), a new stair, a pad or fill, a new pier, the end wall, the bed, the temple, or a walk (each route on the new floors, 3.2 m wide); one
# on ground whose level only changes (a new floor, the rim's new part) and stays earth or garden is set again at the new level (orange ring)
WALK = unary_union([LineString(r_['pts']).buffer(1.6) for r_ in H['draw'].get('routes', [])]).intersection(NEWG)
GOK = [('块', unary_union([it['geom'] for it in ITEMS if it['new'] and it['kind'] == 'block'])),
       ('墙', unary_union([Wl['geom'].buffer(1.0) for Wl in WALLS if Wl['new']]+[Wl['geom'].buffer(1.86).intersection(NEWG) for Wl in WALLS if Wl['new']])),
       ('梯', unary_union([L_['poly'].buffer(.3) for L_ in LAY.values() if L_.get('new', True)])),
       ('填 / 落脚铺地', unary_union([sbox(p_['box'][0], p_['box'][2], p_['box'][1], p_['box'][3]) for p_ in PADS])),
       ('墩 / 尽端墙 / 种植台 / 神庙', unary_union([it['geom'] for it in ITEMS if it['new'] and it['kind'] in ('wall', 'pier', 'bed', 'temple')])),
       ('路（巷）', WALK),
       ('巷（整条铺地）', unary_union([PL[i]['poly'].intersection(sbox(-1e3, -1e3, 1e3, H['draw'].get('lane', {}).get('z1', .5))) for i in NEW_PLATS if i == 'h51']))]   # the reviewer 11-16: the lane (h51 north of lz 0.5) is paved wall to wall
def new_lv(x, z):   # the level a tree is set again at: the new floor it stands on
    for i in NEW_PLATS:
        if PL[i]['poly'].contains(Point(x, z)): return PL[i]['y']
    return H['levels']['summitE'] if 'levels' in H and 'summitE' in H['levels'] else 55
TREES_GO, TREES_RESEAT, TREES_OUT = [], [], []
TO_ = H['draw'].get('treesOut', {})
for t in dump['trees']:
    x, z = t[0], t[1]; X, Y = P_(x, z); P0_ = Point(x, z)
    if any(math.hypot(x-a_, z-b_) < .3 for a_, b_ in TO_.get('at', [])):   # the author 11-16: listed and drawn apart (purple square); they go with the build, by these points
        TREES_OUT.append(list(t)+[TO_.get('why', '')]); g.rectangle([X-6, Y-6, X+6, Y+6], outline=(150, 40, 190), width=2); g.line([X-4, Y-4, X+4, Y+4], fill=(150, 40, 190), width=1); g.line([X-4, Y+4, X+4, Y-4], fill=(150, 40, 190), width=1); continue
    why = next((k_ for k_, G_ in GOK if not G_.is_empty and G_.contains(P0_)), None)
    if why: TREES_GO.append(list(t)+[why]); g.line([X-4, Y-4, X+4, Y+4], fill=(210, 20, 20), width=2); g.line([X-4, Y+4, X+4, Y-4], fill=(210, 20, 20), width=2)
    elif NEWG.contains(P0_): TREES_RESEAT.append(list(t)+[new_lv(x, z)]); g.ellipse([X-5, Y-5, X+5, Y+5], outline=(240, 130, 0), width=2)
    else: g.ellipse([X-3, Y-3, X+3, Y+3], fill=(60, 140, 60))
# hero models' faces as probed (solid: at the foot; dashed: higher up)
for f in PFACE:
    for q in geoms(f['geom']): g.line([P_(*c_) for c_ in q.coords], fill=(110, 60, 20), width=3)
for f in PUP:
    for q in geoms(f['geom']): dashed(list(q.coords), (110, 60, 20), 2, 3, 3)
# gaps and overlaps found by the check
for o in overl:
    X, Y = P_(*o['at']); g.ellipse([X-9, Y-9, X+9, Y+9], outline=(230, 0, 0), width=3)
for q in gaps:
    line(q['p'], q['q'], (230, 0, 200), 3); X, Y = P_(*q['at']); g.ellipse([X-6, Y-6, X+6, Y+6], outline=(230, 0, 200), width=2)
# labels: levels, wall heights, stairs, blocks
for P in plats:
    if not P['poly'].intersects(sbox(X0, Z0, X1, Z1)): continue
    c = P['poly'].intersection(sbox(X0+3, Z0+3, X1-3, Z1-3)).representative_point()
    lab(c.x, c.y, f"{P['id']} {P['y']:g}", 15, (20, 50, 140))
for Wl in WALLS:
    e = Wl['e']; mx, mz = (e['a'][0]+e['b'][0])/2+e['nx']*1.2, (e['a'][1]+e['b'][1])/2+e['nz']*1.2
    if not inbox(mx, mz, -2): continue
    s = f"{Wl['hmin']:.2f}" if Wl['hmax']-Wl['hmin'] < .15 else f"{Wl['hmin']:.1f}–{Wl['hmax']:.1f}"
    lab(mx, mz, s, 11, (180, 20, 20))
for k, L_ in LAY.items():
    hx, hz = L_['head']; fx, fz = L_.get('foot', L_['head'])
    lab((hx+fx)/2+2.2, (hz+fz)/2+1.2, f"{k}  宽 {L_['w']:g}  {L_['n']} 级（{'+'.join(map(str, L_['flights']))}）↓", 12, (0, 0, 0))
for it in ITEMS:
    if it['kind'] == 'block':
        b = it['b']; c = it['geom'].centroid; dr = 3.3 if (len(b) > 5 and b[5]) else BLK[b[0]]['dr']
        lab(c.x, c.y-1.6, f"{it['id']}{'（新位置）' if it['new'] else ''}", 11, (255, 255, 255), False, 'c')
        lab(c.x, c.y+1.6, f"低 {b[4]-dr:.2f} / 高 {b[4]:.2f}" if dr else f"楼面 {b[4]:g}", 11, (255, 255, 255), False, 'c')
for m_ in MODELS:
    if m_['old']:
        c = m_['geom'].centroid; lab(c.x, c.y+5, f"{m_['n'].replace('rome_pal_block_', '')} 原位（拆/移）", 11, (200, 20, 20), True, 'c')
    elif not glb_is_block(m_['g']):
        gq = m_['geom'].intersection(sbox(X0+2, Z0+2, X1-2, Z1-2))
        if not gq.is_empty: c = gq.representative_point(); lab(c.x, c.y, m_['n'].replace('rome_', ''), 11, (60, 50, 40))
for T in TEMPLES: lab(T['pod'].bounds[0], T['pod'].bounds[1]-2.2, '朱庇特胜利者 台基 '+f"{H['jv']['y']:g}（现 {T['t']['y']:.2f}）", 11, (150, 20, 20))
if EW: lab(EW['x1']+.4, EW['z0']-2.4, '尽端墙 + 壁龛', 11)
for nc in NICHES: lab(nc['x']-nc['w']/2-3, nc['z']-1.6*nc['dir'], f"{nc['id']}（宽 {nc['w']:g}、深 {nc['d']:g}、台 {nc['sill']:g}、高 {nc['h']:g}，同 h51L 尽端墙）", 10, (150, 70, 0))
if BED: lab(BED['x0'], BED['z0']-2.4, f"种植台 顶 {PL[BED['on']]['y']+BED['h']:.2f}", 11, (30, 110, 30))
for c in PIERS:
    ce = c['poly'].centroid; lab(ce.x+1, ce.y+1, f"墩 {c['id']} {c['kind']}", 10, (90, 60, 20))
for c in DROPPED: lab(c['lx']+1.2, c['lz']+1.2, f"{c['id']} 不做 6 m 墩，0.56 方墩收头", 10, (200, 20, 20))
for c in ABUT: lab(c['lx']+1.2, c['lz']+1.2, f"{c['id']} 墙收进阿波罗面，不做墩", 10, (120, 60, 160))
for p in PADS: lab(p['box'][0], p['box'][3]+.4, f"{'实心填' if p.get('fill') else '落脚铺地'} {p['y']:g}", 10, (150, 70, 0))
for name, a, b in H['draw']['sections']:
    line(a, b, (200, 0, 160), 1); lab(a[0]+.5, a[1]+.3, name, 13, (200, 0, 160))
# R12 4 along the ways: the clear width across each route every 1 m, between whatever stands beside it at the route's level (the blocks' bands, the hero
# models at their foot (draw.probes where probed), pads of another level, piers, the end wall, the bed, the temple, walls); where the way runs on a stair
# the stair's own width counts (not measured); a point inside something is blocked (0)
def obst_for(lv):
    ob = [it['geom'] for it in ITEMS if it['kind'] in ('block', 'model', 'pier', 'temple', 'wall', 'bed')]
    ob += [sbox(p_['box'][0], p_['box'][2], p_['box'][1], p_['box'][3]) for p_ in PADS if abs(p_['y']-lv) > .1]
    ob += [Wl['geom'].buffer(.03) for Wl in WALLS]
    return unary_union(ob)
STAIRG = unary_union([L_['poly'] for L_ in LAY.values()]) if LAY else None
for w_ in filter(None, os.environ.get('WHO', '').split(';')):   # debugging: WHO='x,z;x,z' lists what stands at those points
    x_, z_ = map(float, w_.split(',')); P0 = Point(x_, z_)
    print('WHO', x_, z_, [(it['id'], it['kind']) for it in ITEMS if it['geom'].distance(P0) < .05], [p_['id'] for p_ in PADS if sbox(p_['box'][0], p_['box'][2], p_['box'][1], p_['box'][3]).contains(P0)],
          [Wl['id'] for Wl in WALLS if Wl['geom'].distance(P0) < .05], [k for k, L_ in LAY.items() if L_['poly'].buffer(.05).contains(P0)])
RW = []
# R12 12's register (draw.exc, the reviewer 11-15): inside a box a run under 2.4 m passes if it is shorter than len and at least min wide, sampled every
# 0.1 m there (EXCRUNS); a route whose end is a house door (its last point inside a block) passes through that block's wall (k 'door')
EXC = H['draw'].get('exc', []); EXCRUNS = []
def wid(O_, x, z, nx_, nz_):
    p_ = Point(x, z)
    if O_.contains(p_): return 0.0, None
    fr = LineString([(x-nx_*25, z-nz_*25), (x+nx_*25, z+nz_*25)]).difference(O_); sg = next((q for q in geoms(fr) if q.distance(p_) < 1e-6), None)
    return (round(sg.length, 2) if sg is not None else 0.0), sg
for ri, r in enumerate(H['draw'].get('routes', [])):
    O_ = obst_for(r['lv']); pts = r['pts']
    for li, (a_, b_) in enumerate(zip(pts, pts[1:])):
        Lsg = math.hypot(b_[0]-a_[0], b_[1]-a_[1]); ux, uz = (b_[0]-a_[0])/Lsg, (b_[1]-a_[1])/Lsg; nx_, nz_ = -uz, ux
        for s_ in np.arange(0, Lsg, 1.0):
            x, z = a_[0]+ux*s_, a_[1]+uz*s_; p_ = Point(x, z)
            if not inbox(x, z, -1): continue
            if STAIRG is not None and STAIRG.buffer(.05).contains(p_): RW.append(dict(r=ri, lv=r['lv'], x=round(x, 2), z=round(z, 2), w=None, k='stair', li=li)); continue
            if O_.contains(p_): RW.append(dict(r=ri, lv=r['lv'], x=round(x, 2), z=round(z, 2), w=0.0, k='blocked', li=li)); continue
            fr = LineString([(x-nx_*25, z-nz_*25), (x+nx_*25, z+nz_*25)]).difference(O_)
            sg = next((q for q in geoms(fr) if q.distance(p_) < 1e-6), None)
            RW.append(dict(r=ri, lv=r['lv'], x=round(x, 2), z=round(z, 2), w=round(sg.length, 2) if sg is not None else 0.0, k='ok', li=li, seg=[list(c) for c in sg.coords] if sg is not None else None))
        for E_ in EXC:   # the exception's box: every 0.1 m along this leg inside it, the narrow runs
            bx_ = sbox(E_['box'][0], E_['box'][2], E_['box'][1], E_['box'][3]); seg_ = LineString([a_, b_]).intersection(bx_)
            if seg_.is_empty or seg_.length < .2: continue
            c0_ = min(((c[0]-a_[0])*ux+(c[1]-a_[1])*uz) for c in seg_.coords); c1_ = max(((c[0]-a_[0])*ux+(c[1]-a_[1])*uz) for c in seg_.coords); cur = None
            for s2 in np.arange(c0_, c1_+1e-6, .1):
                w2, _ = wid(O_, a_[0]+ux*s2, a_[1]+uz*s2, nx_, nz_)
                if w2 < 2.4:
                    if cur and s2-cur['s1'] < .15: cur['s1'] = s2; cur['min'] = min(cur['min'], w2)
                    else: cur = dict(id=E_['id'], r=ri, li=li, s0=s2, s1=s2, min=w2); EXCRUNS.append(cur)
            for q in EXCRUNS:
                if q['r'] != ri or q['li'] != li or 'len' in q: continue
                q['len'] = round(q['s1']-q['s0']+.1, 2); q['ok'] = q['len'] < E_['len'] and q['min'] >= E_['min']; q['a'] = [round(a_[0]+ux*q['s0'], 2), round(a_[1]+uz*q['s0'], 2)]
                for ry in E_.get('rays', []):   # R12 12 (the reviewer 11-16): where the raster reads a hero model's corner into the run, the rays' width (at the feet and higher up) stands
                    zs_ = (a_[1]+uz*q['s0'], a_[1]+uz*q['s1']); xs_ = (a_[0]+ux*q['s0'], a_[0]+ux*q['s1'])
                    if ry['box'][0] <= min(xs_) and max(xs_) <= ry['box'][1] and ry['box'][2] <= min(zs_) and max(zs_) <= ry['box'][3]:
                        q['raster'] = q['min']; q['ray'] = ry['w']; q['src'] = ry['src']; q['min'] = max(q['min'], ry['w']); q['ok'] = q['len'] < E_['len'] and q['min'] >= E_['min']
                q['b'] = [round(a_[0]+ux*q['s1'], 2), round(a_[1]+uz*q['s1'], 2)]; q['rule'] = E_['rule']
                for m_ in RW:   # the 1 m samples in an excepted run
                    if m_['r'] == ri and m_['li'] == li and m_['k'] in ('ok', 'blocked') and m_['w'] < 2.4 and q['ok']:
                        sm = (m_['x']-a_[0])*ux+(m_['z']-a_[1])*uz
                        if q['s0']-.06 <= sm <= q['s1']+.06: m_['k'] = 'exc'
    eb = next((it for it in ITEMS if it['kind'] == 'block' and it['geom'].buffer(.05).contains(Point(*pts[-1]))), None)
    if eb is not None:
        for m_ in RW:
            if m_['r'] == ri and m_['li'] == len(pts)-2 and m_['k'] == 'blocked' and eb['geom'].buffer(.05).contains(Point(m_['x'], m_['z'])): m_['k'] = 'door'; m_['door'] = eb['id']
for q in RW:   # the width across, thin, only where it is under 6 m (wider is open ground; its number is in the labels); red under 2.4; a red cross where blocked
    if q['k'] == 'ok' and q['seg'] and q['w'] < 6: line(q['seg'][0], q['seg'][1], (230, 30, 30) if q['w'] < 2.4 else (90, 150, 220), 1)
    elif q['k'] == 'exc' and q.get('seg'): line(q['seg'][0], q['seg'][1], (150, 40, 190), 2)
    elif q['k'] == 'blocked':
        X, Y = P_(q['x'], q['z']); g.line([X-4, Y-4, X+4, Y+4], fill=(230, 0, 0), width=2); g.line([X-4, Y+4, X+4, Y-4], fill=(230, 0, 0), width=2)
RWS = []   # per route: the narrowest point, how much of it is under 2.4, how much blocked
for ri, r in enumerate(H['draw'].get('routes', [])):
    Q = [q for q in RW if q['r'] == ri and q['k'] != 'stair']
    if not Q: continue
    Qm = [q for q in Q if q['k'] in ('ok', 'blocked')] or Q   # the narrowest of the points not excepted (exc, door)
    mn = min(Qm, key=lambda q: q['w']); RWS.append(dict(r=ri, lv=r['lv'], pts=r['pts'], n=len(Q), min=mn['w'], at=[mn['x'], mn['z']], under=sum(1 for q in Q if q['k'] == 'ok' and 0 < q['w'] < 2.4), blocked=sum(1 for q in Q if q['k'] == 'blocked'),
                                exc=sum(1 for q in Q if q['k'] == 'exc'), door=sum(1 for q in Q if q['k'] == 'door')))
    RWS[-1]['legs'] = []   # the same, leg by leg (a route's legs can be different questions)
    for li in sorted(set(q['li'] for q in Q)):
        Ql = [q for q in Q if q['li'] == li]; ml = min([q for q in Ql if q['k'] in ('ok', 'blocked')] or Ql, key=lambda q: q['w'])
        RWS[-1]['legs'].append(dict(a=r['pts'][li], b=r['pts'][li+1], n=len(Ql), min=ml['w'], at=[ml['x'], ml['z']], under=sum(1 for q in Ql if q['k'] == 'ok' and 0 < q['w'] < 2.4), blocked=sum(1 for q in Ql if q['k'] == 'blocked'),
                                    exc=sum(1 for q in Ql if q['k'] == 'exc'), door=sum(1 for q in Ql if q['k'] == 'door')))
    ok_ = [q for q in Q if q['k'] == 'ok' and q['w'] < 49]
    for q in ok_[::12]: lab(q['x']+.3, q['z']+.3, f"{q['w']:.2f}", 9, (40, 90, 170) if q['w'] >= 2.4 else (200, 0, 0))
    if mn['k'] == 'ok' and mn['seg']: line(mn['seg'][0], mn['seg'][1], (200, 0, 0) if mn['w'] < 2.4 else (20, 90, 40), 3)
    lab(mn['x']+.4, mn['z']-1.6, f"最窄 {mn['w']:.2f}" if mn['k'] == 'ok' else '走不通', 12, (200, 0, 0) if mn['w'] < 2.4 else (20, 90, 40))
for ex in H['draw'].get('extra', []):   # ways round (an alt's alternatives): dashed, with their label; not in the tables
    col = (210, 0, 0) if ex.get('c') == 'r' else (150, 40, 190)
    for a_, b_ in zip(ex['pts'], ex['pts'][1:]): dashed([a_, b_], col, 3, 8, 5)
    lab(ex['pts'][0][0]+.5, ex['pts'][0][1]+ex.get('dy', -1.4), ex['label'], 11, col)
for mk in H['draw'].get('marks', []):   # the reviewer 11-16: steps a route takes on a hero model's own edge, drawn where they are
    col = (150, 40, 190)
    if 'line' in mk: dashed(mk['line'], col, 3, 6, 4); lab(mk['line'][0][0]+.4, mk['line'][0][1]+mk.get('dy', -1.2), mk['label'], 11, col)
    else:
        X, Y = P_(*mk['at']); lab(mk['at'][0]+.6, mk['at'][1]+mk.get('dy', .9), mk['label'], 11, col); g.rectangle([X-5, Y-5, X+5, Y+5], fill=(255, 255, 255), outline=col, width=3)   # the square over its label when the label is pulled back from the sheet's edge
# the ways (R12 13: each route at its level), arrows at the far end
for r in H['draw'].get('routes', []):
    col = (0, 140, 60) if r['lv'] < 52 else (220, 110, 0) if r['lv'] >= 55 else (150, 60, 170); pts = r['pts']
    for a_, b_ in zip(pts, pts[1:]): line(a_, b_, col, 3)
    (ax, az), (bx, bz) = pts[-2], pts[-1]; Lr = math.hypot(bx-ax, bz-az); ux, uz = (bx-ax)/Lr, (bz-az)/Lr
    A_, B_ = P_(bx, bz), P_(bx-ux*2, bz-uz*2); qx, qz = -(B_[1]-A_[1])*.5, (B_[0]-A_[0])*.5; g.polygon([A_, (B_[0]+qx, B_[1]+qz), (B_[0]-qx, B_[1]-qz)], fill=col)
if H.get('basin'):
    bq = H['basin']; lab(bq['x']-12.5, (bq['z0']+bq['z1'])/2, f"两级 {(bq['top']-bq['floor'])/2:.2f} 下鞍部 {bq['floor']:g}", 11, (30, 100, 200))
for x in range(int(math.ceil(X0/10))*10, int(X1)+1, 10):
    X, Y = P_(x, Z1); g.line([X, Y, X, Y+5], fill=(0, 0, 0)); g.text((X-10, Y+6), str(x), font=F(11), fill=(0, 0, 0))
for z in range(int(math.ceil(Z0/10))*10, int(Z1)+1, 10):
    X, Y = P_(X0, z); g.line([X-5, Y, X, Y], fill=(0, 0, 0)); g.text((X-34, Y-8), str(z), font=F(11), fill=(0, 0, 0))
g.text((M, 10), f"{PART} 俯视（R12 第 13 节，由 PAL_PLAN.{PART} 生成；{'已建' if H['on'] else '未建'}）  lx→东  lz↓南"+(f"   方案 {ALT}：{H['alt'][ALT]['note']}" if ALT else ''), font=F(18), fill=(0, 0, 0))
# legend (R12 13; materials from the masterplan 2.3 "一套石头，五级", each taken from the terrace it joins)
STONE = [('1 山岩', '墙与墙之间的陡坡、墙脚岩台', '#8f8571'), ('2 粗面石', '每道墙最下面 2.4 m、梯基、墩台下半', '#9c917b'), ('3 方石', '墙身（含 h51 的新墙、尽端墙）', '#aca08a'),
         ('4 石灰华', '踏步、压顶、胸墙帽（栏墙 0.95：墙石 + 石灰华帽）', '#cdc3ab'), ('5 铺地', '台面 51.76 / 55、梯中平台、梯顶平台、落脚铺地', '#bdb29b')]
LH = 365; im2 = Image.new('RGBA', (Wp, Hp+LH), (250, 250, 247, 255)); im2.paste(im, (0, 0)); im = im2; g = ImageDraw.Draw(im)
y0 = Hp+8; x = M
for k in range(71):
    yv = 50+k*.1; g.rectangle([x+k*4, y0, x+k*4+4, y0+16], fill=lvl_col(yv))
for yv in (50, 51.76, 54.3, 55, 57):
    X = x+(yv-50)*40; g.line([X, y0+16, X, y0+22], fill=(0, 0, 0)); g.text((X-12, y0+23), f"{yv:g}", font=F(11), fill=(0, 0, 0))
g.text((x, y0+40), '台面标高（色）', font=F(12), fill=(0, 0, 0))
L1 = [('wall', '挡墙（红字墙高；负数：外侧地面高，挖方挡土）'), ('wallnew', '新墙（黑线 + 橙边）'), ('open', '开口边（蓝）'), ('stair', '台阶：踏面，三角在梯脚（下坡方向）'),
      ('old', '拆 / 移走（红斜线）'), ('new', '新位置的块（橙框；虚线为名义框）'), ('model', '已有模型（灰）'), ('pad', '落脚铺地（橙）')]
L2 = [('r51', '下层路线 51.76（绿）'), ('r54', '阿波罗台前 54.3（紫）'), ('r55', '上层路线 55（橙）'), ('ov', '重叠（红圈）'), ('gap', '缝 0.05–2.4 m（品红）'),
      ('tree', '树：留（绿点）/ 去（红叉：落在新块、墙、梯、填、路上）/ 按新标高重新落位（橙圈）/ 作者批准去掉、建时一起去（紫框）'), ('drop', '不做 6 m 墩的转角：0.56 m 方墩（红框）'), ('sec', '剖面线（品红细线）'), ('face', '模型实测面（射线每 0.25 m；虚线：高处的帽）')]
def sym(kind, X, Y):
    if kind == 'wall': g.line([X, Y, X+30, Y], fill=(0, 0, 0), width=4)
    elif kind == 'wallnew': g.line([X, Y, X+30, Y], fill=(255, 150, 30), width=9); g.line([X, Y, X+30, Y], fill=(0, 0, 0), width=4)
    elif kind == 'open': g.line([X, Y, X+30, Y], fill=(30, 90, 220), width=3)
    elif kind == 'stair':
        g.rectangle([X, Y-7, X+30, Y+7], fill=(205, 195, 171), outline=(90, 80, 60))
        for t in range(5): g.line([X+t*6, Y-7, X+t*6, Y+7], fill=(90, 80, 60))
        g.polygon([(X+30, Y), (X+24, Y-5), (X+24, Y+5)], fill=(0, 0, 0))
    elif kind == 'old':
        g.rectangle([X, Y-7, X+30, Y+7], outline=(210, 30, 30), width=2)
        for t in range(0, 40, 7): g.line([X+max(0, t-14), Y+7-max(0, 14-t) if t < 14 else Y+7, X+min(30, t), Y-7 if t <= 30 else Y-7], fill=(210, 30, 30), width=2)
    elif kind == 'new': g.rectangle([X, Y-7, X+30, Y+7], outline=(240, 130, 0), width=3)
    elif kind == 'model': g.rectangle([X, Y-7, X+30, Y+7], fill=(150, 145, 135))
    elif kind == 'pad': g.rectangle([X, Y-7, X+30, Y+7], fill=(250, 200, 140), outline=(200, 110, 20))
    elif kind in ('r51', 'r54', 'r55'): g.line([X, Y, X+30, Y], fill={'r51': (0, 140, 60), 'r54': (150, 60, 170), 'r55': (220, 110, 0)}[kind], width=3)
    elif kind == 'ov': g.ellipse([X+6, Y-9, X+24, Y+9], outline=(230, 0, 0), width=3)
    elif kind == 'gap': g.line([X, Y, X+30, Y], fill=(230, 0, 200), width=3)
    elif kind == 'tree': g.ellipse([X+3, Y-3, X+9, Y+3], fill=(60, 140, 60)); g.line([X+18, Y-4, X+26, Y+4], fill=(210, 20, 20), width=2); g.line([X+18, Y+4, X+26, Y-4], fill=(210, 20, 20), width=2)
    elif kind == 'drop': g.rectangle([X+7, Y-8, X+23, Y+8], outline=(200, 20, 20), width=1); g.rectangle([X+12, Y-3, X+18, Y+3], fill=(90, 90, 95), outline=(0, 0, 0))
    elif kind == 'sec': g.line([X, Y, X+30, Y], fill=(200, 0, 160), width=1)
    elif kind == 'face': g.line([X, Y-4, X+30, Y-4], fill=(110, 60, 20), width=3); [g.line([X+t, Y+4, X+t+3, Y+4], fill=(110, 60, 20), width=2) for t in range(0, 30, 6)]
for col, LL in ((330, L1), (690, L2)):
    for r, (kind, txt) in enumerate(LL):
        Y = y0+8+r*22; sym(kind, x+col, Y); g.text((x+col+38, Y-8), txt, font=F(12), fill=(0, 0, 0))
cx = x
g.text((cx, y0+212), '材质（总纲 2.3：一套石头，五级；各取所接的台）', font=F(12), fill=(0, 0, 0))
for r, (nm, use, hx) in enumerate(STONE):
    Y = y0+234+r*24; cc = tuple(int(hx[i:i+2], 16) for i in (1, 3, 5)); g.rectangle([cx, Y, cx+26, Y+16], fill=cc, outline=(80, 70, 60))
    g.text((cx+34, Y), f"{nm} {hx}  {use}", font=F(12), fill=(0, 0, 0))
im.save(os.path.join(OUT, 'plan.png'))

# ---------------- sections ----------------
BL_H = {}   # a block's roof over its high floor, from its GLB (the low variant's box)
for gg in GLB:
    if glb_is_block(gg): BL_H[gg['n']] = gg['box'][3]
def blk_name(b): return BLK[b[0]]['n']+('_low' if len(b) > 5 and b[5] else '')
SEC = {s['name']: s for s in dump['sections']}
def section(name, a, b):
    D = SEC[name]; S = np.array([[r[0], r[1], r[2] if r[2] is not None else np.nan] for r in D['S']]); Ls = math.hypot(b[0]-a[0], b[1]-a[1])
    ux, uz = (b[0]-a[0])/Ls, (b[1]-a[1])/Ls; at = lambda s: (a[0]+ux*s, a[1]+uz*s)
    ss = np.arange(0, Ls+.01, .25); flo = []
    for s in ss:
        Q = plat_at(*at(s)); flo.append(Q['y'] if Q else np.nan)
    flo = np.array(flo)
    ylo = math.floor(min(np.nanmin(S[:, 1]), np.nanmin(flo) if np.isfinite(flo).any() else 99)-2); yhi = math.ceil(max(np.nanmax(S[:, 2]), 60)+2)
    for it in ITEMS:   # room for the roofs of the blocks the line crosses
        if it['kind'] == 'block' and it['geom'].intersects(LineString([a, b])): yhi = max(yhi, math.ceil(it['b'][4]+BL_H.get(blk_name(it['b']), 8)+2))
    kk = max(5, min(14, int(1500/Ls))); Wd = int(Ls*kk)+150; Ht = int((yhi-ylo)*kk)+150
    I = Image.new('RGB', (Wd, Ht), (252, 252, 250)); d = ImageDraw.Draw(I)
    Q_ = lambda s, y: (70+s*kk, 70+(yhi-y)*kk)
    for y in range(int(ylo), int(yhi)+1):
        if y % 2 == 0: d.line([Q_(0, y), Q_(Ls, y)], fill=(234, 234, 234)); d.text((10, Q_(0, y)[1]-7), str(y), font=F(11), fill=(120, 120, 120))
    for s in range(0, int(Ls)+1, 10):
        sx, sz = at(s); d.line([Q_(s, ylo), Q_(s, ylo-.5)], fill=(0, 0, 0)); d.text((Q_(s, ylo)[0]-14, Q_(s, ylo)[1]+4), f"{sx:.0f},{sz:.0f}", font=F(10), fill=(0, 0, 0))
    # the terraces as built (solid to the bottom), new ones light orange
    for j in range(len(ss)-1):
        if np.isfinite(flo[j]):
            Q = plat_at(*at(ss[j]+.125)); col = (250, 214, 170) if Q and (Q['id'] in NEW_PLATS or (Q['id'] == 'sumE' and not Polygon(orig['sumE']['pts']).contains(Point(*at(ss[j]+.125))))) else (205, 205, 210)
            d.rectangle([Q_(ss[j], flo[j]), Q_(ss[j+1], ylo)], fill=col)
    # the blocks as built (from their registered rect, the floors from their y and drop, the roof from the GLB)
    ln = LineString([a, b])
    for it in ITEMS:
        if it['kind'] != 'block' or not it['geom'].intersects(ln): continue
        bb = it['b']; seg = it['geom'].intersection(ln); cs_ = [Point(a).distance(Point(c)) for gq in geoms(seg) for c in gq.coords]; s0, s1 = min(cs_), max(cs_)
        dr = blk_dr(bb); R = BLOC.get(blk_name(bb)); q = math.radians(bb[3]); c_, s_ = math.cos(q), math.sin(q); prof = []
        for s in np.arange(s0, s1+.01, .25):
            x, z = at(s); dx, dz = x-bb[1], z-bb[2]; xl, zl = dx*c_-dz*s_, dx*s_+dz*c_
            if R:
                i, j = int((xl-R['X0'])/R['st']), int((zl-R['Z0'])/R['st']); tv = R['top'][j*R['nx']+i] if 0 <= i < R['nx'] and 0 <= j < R['nz'] else -99
                ck = CLIP.get(blk_name(bb), {})
                if 'z1' in ck and zl > ck['z1'] and ('x0' not in ck or ck['x0'] <= xl <= ck['x1']): tv = -dr   # cut away (ALT)
            else: tv = 8
            if tv > -dr+.3: prof.append((s, bb[4]+tv))
        if not prof: continue
        fl = min(bb[4]-dr, np.nanmin(flo) if np.isfinite(flo).any() else bb[4]-dr)
        for k in range(len(prof)-1):
            d.rectangle([Q_(prof[k][0], prof[k][1]), Q_(prof[k+1][0], bb[4]-dr)], fill=(236, 222, 200) if not it['new'] else (246, 214, 176))
        d.line([Q_(sx, sy) for sx, sy in prof], fill=(240, 130, 0) if it['new'] else (90, 70, 50), width=2)
        mx = max(p[1] for p in prof); d.text((Q_(prof[0][0], mx)[0]+4, Q_(prof[0][0], mx)[1]-16), f"{it['id']}{'（新）' if it['new'] else ''}  低 {bb[4]-dr:.2f} 高 {bb[4]:.2f}", font=F(11), fill=(0, 0, 0))
    # the end wall and its niche, the planting bed
    if EW:
        r = sbox(EW['x0'], EW['z0'], EW['x1'], EW['z1'])
        if r.intersects(ln):
            seg = r.intersection(ln); s0, s1 = sorted(Point(a).distance(Point(c)) for c in seg.coords)[::len(seg.coords)-1]
            yb = PL['h51']['y'] if 'h51' in PL else 51.76
            d.rectangle([Q_(s0, EW['top']+.95), Q_(s1, yb)], fill=(150, 150, 155), outline=(60, 60, 60)); d.text((Q_(s1, EW['top']+.95)[0]+4, Q_(s1, EW['top']+.95)[1]), '尽端墙（顶 55 + 栏板 0.95）', font=F(11), fill=(0, 0, 0))
            nc = EW['niche']; z_ = at((s0+s1)/2)[1]
            if abs(z_-nc['z']) < nc['w']/2:
                d.rectangle([Q_(s0, yb+nc['sill']+nc['h']), Q_(s0+nc['d'], yb+nc['sill'])], fill=(252, 252, 250), outline=(60, 60, 60)); d.text((Q_(s0, yb+nc['sill'])[0]-60, Q_(s0, yb+nc['sill'])[1]+2), '壁龛 2×1', font=F(10), fill=(0, 0, 0))
    if BED:
        r = sbox(BED['x0'], BED['z0'], BED['x1'], BED['z1'])
        if r.intersects(ln):
            seg = r.intersection(ln); cs = [Point(a).distance(Point(c)) for c in seg.coords]; yb = PL[BED['on']]['y']
            d.rectangle([Q_(min(cs), yb+BED['h']), Q_(max(cs), yb)], fill=(110, 170, 90), outline=(30, 90, 30)); d.text((Q_(min(cs), yb+BED['h'])[0]-10, Q_(min(cs), yb+BED['h'])[1]-16), f"种植台 {yb+BED['h']:.2f}", font=F(10), fill=(30, 100, 30))
    for p in PADS:
        r = sbox(p['box'][0], p['box'][2], p['box'][1], p['box'][3])
        if r.intersects(ln):
            seg = r.intersection(ln); cs = [Point(a).distance(Point(c)) for c in seg.coords]
            d.rectangle([Q_(min(cs), p['y']), Q_(max(cs), ylo)], fill=(250, 214, 170), outline=(200, 100, 0)); d.text((Q_(min(cs), p['y'])[0], Q_(min(cs), p['y'])[1]-15), f"{'实心填' if p.get('fill') else '落脚铺地'} {p['y']:g}", font=F(10), fill=(150, 70, 0))
    # walls: where the line crosses a wall, its height; the parapet where the drop is over 0.9
    for Wl in WALLS:
        if not Wl['geom'].intersects(ln): continue
        p = Wl['geom'].intersection(ln)
        if p.geom_type != 'Point': continue
        s = Point(a).distance(p); e = Wl['e']; lo = wall_foot(PL[Wl['P']], e, ((p.x-e['a'][0])*e['ux']+(p.y-e['a'][1])*e['uz']))
        top, bot = max(Wl['y'], lo), min(Wl['y'], lo)
        d.line([Q_(s, bot), Q_(s, top)], fill=(20, 20, 20), width=5)
        if top-bot > .9: d.rectangle([Q_(s-.3, top+.95), Q_(s+.3, top)], fill=(140, 140, 145))
        d.text((Q_(s, top)[0]+5, Q_(s, (top+bot)/2)[1]-7), f"{top-bot:.2f}", font=F(11), fill=(180, 20, 20))
    # stairs: along the line, their profile; across it, the tread there
    for k, L_ in LAY.items():
        for kind, poly, y, leg in L_['segs']:
            if not poly.intersects(ln.buffer(1.5)): continue
            pr = [Point(a).distance(Point(c)) for c in poly.exterior.coords]; pr2 = [((c[0]-a[0])*ux+(c[1]-a[1])*uz) for c in poly.exterior.coords]
            s0, s1 = max(0, min(pr2)), min(Ls, max(pr2))
            if s1-s0 < .05: continue
            d.rectangle([Q_(s0, y), Q_(s1, y-.12)], fill=(90, 90, 90) if not L_['new'] else (220, 110, 0))
            d.line([Q_(s0, y), Q_(s0, y-.4)], fill=(120, 120, 120))
        ys = [s[2] for s in L_['segs']]
        cs = [((c[0]-a[0])*ux+(c[1]-a[1])*uz) for c in L_['cl']]
        if L_['cl'] and ln.buffer(1.5).intersects(LineString([c[:2] for c in L_['cl']])):
            sm = max(0, min(Ls, (min(cs)+max(cs))/2))
            d.text((Q_(sm, min(ys))[0]-30, Q_(sm, min(ys))[1]+10), f"{k} {L_['n']} 级 {'+'.join(map(str, L_['flights']))}  踢 {L_['rh']:.4f} 踏 {TREAD}  {L_['angle']:.1f}°", font=F(11), fill=(0, 0, 0))
    # the temple: its podium as it is now, lifted to the new level
    for T in TEMPLES:
        if not T['pod'].intersects(ln): continue
        seg = T['pod'].intersection(ln); cs = sorted(Point(a).distance(Point(c)) for c in seg.coords); y0 = H['jv']['y']; t = T['t']
        d.rectangle([Q_(cs[0], y0+t['podH']), Q_(cs[-1], y0)], fill=(225, 205, 190), outline=(110, 20, 20)); d.text((Q_(cs[0], y0+t['podH'])[0]+3, Q_(cs[0], y0+t['podH'])[1]-16), f"朱庇特胜利者 台基 {y0:g}（现 {t['y']:.2f}），台基高 {t['podH']:.1f}", font=F(11), fill=(150, 20, 20))
    # now: the ground (yellow) and the scene's surface (grey; red where it goes)
    gl = [Q_(r[0], r[1]) for r in S]; d.line(gl, fill=(205, 155, 0), width=3)
    OLDG = unary_union([m_['geom'] for m_ in MODELS if m_['old']]) if any(m_['old'] for m_ in MODELS) else None
    prev = None
    for r in S:
        if np.isfinite(r[2]) and r[2] > r[1]+.3:
            x, z = at(r[0]); old = OLDG is not None and OLDG.buffer(.3).contains(Point(x, z))
            q = Q_(r[0], r[2])
            if prev and prev[2] == old: d.line([prev[:2], q], fill=(220, 30, 30) if old else (140, 140, 140), width=2)
            prev = (q[0], q[1], old)
        else: prev = None
    # level labels
    done = set()
    for j in range(0, len(ss), 8):
        Q = plat_at(*at(ss[j]))
        if Q and Q['id'] not in done: done.add(Q['id']); d.text((Q_(ss[j], Q['y'])[0]+2, Q_(ss[j], Q['y'])[1]+3), f"{Q['id']} {Q['y']:g}", font=F(11), fill=(20, 50, 140))
    # the route along this line (R12 4): a strip at its level, green where the way is 2.4 m wide or more, orange under, red where blocked,
    # grey on a stair; the width every 5 m above it, the blocked runs named below it
    ax = 0 if abs(ux) >= abs(uz) else 1
    RL = sorted([(((q['x']-a[0])*ux+(q['z']-a[1])*uz), q) for q in RW if abs(-(q['x']-a[0])*uz+(q['z']-a[1])*ux) < .25], key=lambda t: t[0])
    RL = [(s, q) for s, q in RL if -.5 <= s <= Ls+.5]
    runs = []
    for s, q in RL:
        col = (150, 150, 150) if q['k'] == 'stair' else (220, 0, 0) if q['k'] == 'blocked' else (150, 40, 190) if q['k'] == 'exc' else (20, 150, 60) if q['k'] == 'door' else (240, 140, 0) if q['w'] < 2.4 else (20, 150, 60)
        d.rectangle([Q_(s-.5, q['lv']+.3), Q_(s+.5, q['lv']+.05)], fill=col)
        if q['k'] == 'ok' and round(s) % 5 == 0: d.text((Q_(s, q['lv'])[0]-10, Q_(s, q['lv']+.3)[1]-15), f"{q['w']:.1f}" if q['w'] < 49 else '开敞', font=F(10), fill=(20, 110, 50) if q['w'] >= 2.4 else (200, 90, 0))
        if q['k'] in ('blocked', 'under') or (q['k'] == 'ok' and q['w'] < 2.4):
            if runs and s-runs[-1][1] <= 1.01 and runs[-1][3] == (q['k'] == 'blocked'): runs[-1][1] = s
            else: runs.append([s, s, q['lv'], q['k'] == 'blocked'])
    for k_, (s0, s1, lv, bl) in enumerate(runs):
        c0, c1 = at(s0)[ax], at(s1)[ax]
        d.text((Q_(s0, lv)[0], Q_(s0, lv)[1]+6+14*(k_ % 2)), f"{'走不通' if bl else '窄于 2.4'} {'lx' if ax == 0 else 'lz'} {c0:.0f}–{c1:.0f}", font=F(11), fill=(200, 0, 0))
    if RL:
        Qs = [q for s, q in RL if q['k'] != 'stair']
        if Qs:
            mn = min(Qs, key=lambda q: q['w']); d.text((Wd-420, 36+18), f"沿线路线 {RL[0][1]['lv']:g}：{len(Qs)} 个米点，走不通 {sum(1 for q in Qs if q['k'] == 'blocked')}，窄于 2.4 {sum(1 for q in Qs if q['k'] == 'ok' and 0 < q['w'] < 2.4)}，例外 {sum(1 for q in Qs if q['k'] == 'exc')}，宅门 {sum(1 for q in Qs if q['k'] == 'door')}，最窄 {mn['w']:.2f}（{mn['x']:g},{mn['z']:g}）", font=F(12), fill=(200, 0, 0) if mn['w'] < 2.4 else (20, 110, 50))
    d.text((70, 12), f"{name} 剖面：{a[0]:g},{a[1]:g} → {b[0]:g},{b[1]:g}（竖向不放大，1:1）", font=F(16), fill=(0, 0, 0))
    d.text((70, 36), '黄线 = 现在的地面；灰细线 = 现在的建筑和墙顶（红 = 要拆或要移的）；灰块 = 系统台（橙 = 新台）；黑竖线 = 墙高（红字）；灰帽 = 0.95 栏板；梯段画每级踏面', font=F(11), fill=(80, 80, 80))
    I.save(os.path.join(OUT, f'section_{name}.png'))
for name, a, b in H['draw']['sections']:
    if name in SEC: section(name, a, b)
    else: print('section', name, 'not in the dump (re-run palatine_paths.mjs after npm run build:test)')

# ---------------- tables and checks ----------------
ST_T = []
for k, L_ in LAY.items():
    ST_T.append(dict(id=k, new=L_['new'], frm=L_['frm'], to=L_['to'], top=L_['top'], floor=L_['floor'], n=L_['n'], flights=L_['flights'], riser=round(L_['rh'], 4), tread=TREAD,
                     angle=round(L_['angle'], 1), w=L_['w'], head=[round(v, 2) for v in L_['head']], foot=[round(v, 2) for v in L_.get('foot', (0, 0))], run=round(L_['run'], 2), ok=L_['ok']))
WL_T = [dict(id=w['id'], new=w['new'], top=w['y'], h=[round(w['hmin'], 2), round(w['hmax'], 2)], a=w['e']['a'], b=w['e']['b'], foot=w['e']['foot']) for w in WALLS]
FP_T = []
for it in ITEMS:
    if it['kind'] == 'wallline': continue
    b_ = it['geom'].bounds; FP_T.append(dict(id=it['id'], kind=it['kind'], new=it['new'], box=[round(v, 2) for v in b_], area=round(it['geom'].area, 1)))
PI_T = [dict(id=c['id'], kind=c['kind'], new=c['new'], h=round(c['h'], 2), box=[round(v, 2) for v in c['poly'].bounds]) for c in PIERS]
res = dict(part=PART, on=H['on'], dropped=DROPPED, pads=PADS, stairs=ST_T, walls=WL_T, footprints=FP_T, piers=PI_T, overlaps=overl, gaps=gaps, clear=CLR, routeWidth=RWS, alt=ALT, probes=[dict(id=f['id'], m=f['m'], y=f['y']) for f in PFACE+PUP], treesGo=len(TREES_GO), treesGoList=TREES_GO, treesReseat=len(TREES_RESEAT), treesReseatList=TREES_RESEAT, treesOut=len(TREES_OUT), treesOutList=TREES_OUT, excRuns=EXCRUNS, marks=H['draw'].get('marks', []))
json.dump(res, open(os.path.join(OUT, 'checks.json'), 'w'), ensure_ascii=False, indent=1)
def tr(cells, th=False): return '<tr>'+''.join(f"<{'th' if th else 'td'}>{c}</{'th' if th else 'td'}>" for c in cells)+'</tr>'
html = [f"<!doctype html><meta charset=utf-8><title>{PART} 出图</title><style>body{{font:14px sans-serif;margin:20px}}table{{border-collapse:collapse;margin:10px 0}}td,th{{border:1px solid #bbb;padding:3px 7px}}img{{max-width:100%;border:1px solid #ccc}}.n{{color:#d06000}}</style>",
        f"<h1>{PART}：俯视和剖面（R12 第 13 节，由数据生成）{'— 方案 '+ALT if ALT else ''}</h1>"+(f"<p><b>方案 {ALT}</b>：{H['alt'][ALT]['note']}（<code>PAL_PLAN.{PART}.alt.{ALT}</code>）</p>" if ALT else '')+"<p>数据：<code>PAL_PLAN.{PART}</code>（src/scenes/rome/palatine-plan.js），地面、模型、已建的台阶和树来自页面（tools/plan/palatine_paths.mjs）。级数只由两头的台面标高算，踏面 0.38，一跑最多 15 级，中间平台 1.5，梯顶平台 1.6。</p>",
        "<h2>俯视</h2><img src=plan.png>", "<h2>材质</h2><table>"+tr(['级', '用在哪里', '目标色'], True)+''.join(tr([nm, use, f"<span style='display:inline-block;width:2em;background:{hx}'>&nbsp;</span> {hx}"]) for nm, use, hx in STONE)+"</table>", "<h2>剖面</h2>"]+[f"<h3>{n}</h3><img src=section_{n}.png>" for n, _, _ in H['draw']['sections']]
html += ['<h2>台阶</h2><table>', tr(['id', '新', '从 → 到', '标高', '级数', '每跑', '踢面', '踏面', '角度', '宽', '梯顶', '梯脚', '水平长'], True)]
html += [tr([s['id'], '新' if s['new'] else '', f"{s['frm']} → {s['to']}", f"{s['top']:g} → {s['floor']:g}", s['n'], '+'.join(map(str, s['flights'])), s['riser'], s['tread'], f"{s['angle']}°", s['w'], s['head'], s['foot'], s['run']]) for s in ST_T]
html += ['</table><h2>墙</h2><table>', tr(['边', '新', '台面', '墙高', '从', '到'], True)]+[tr([w['id'], '新' if w['new'] else '', w['top'], f"{w['h'][0]}–{w['h'][1]}", w['a'], w['b']]) for w in WL_T]
html += ['</table><h2>占地框</h2><table>', tr(['名字', '类', '新', 'lx0, lz0, lx1, lz1', '面积'], True)]+[tr([f['id'], f['kind'], '新' if f['new'] else '', f['box'], f['area']]) for f in FP_T]
html += ['</table><h2>墙角墩（按生成器的规则）</h2><table>', tr(['墩', '类', '新', '墙高', '框'], True)]+[tr([c['id'], c['kind'], '新' if c['new'] else '', c['h'], c['box']]) for c in PI_T]
html += [f"</table><h2>检查</h2><p>重叠（面积 &gt; 0.05 m² 且厚 &gt; 0.05 m（块的占地是 0.1 m 栅格，块和面之间 &gt; 0.11 m）；线穿进面 &gt; 0.1 m 长、&gt; 0.05 m 深）：{len(overl)}</p><table>", tr(['甲', '乙', '量', '深 / 厚', '在'], True)]+[tr([o['a'], o['b'], f"{o['amount']} {o['unit']}", o['depth'], o['at']]) for o in overl]
html += [f"</table><p>缝（0.05–2.4 m）：{len(gaps)}</p><table>", tr(['甲', '乙', '缝', '在'], True)]+[tr([q['a'], q['b'], q['d'], q['at']]) for q in gaps]+['</table>']
html += ['<p>路线净宽（R12 第 4 节，沿每条路线每 1 m 量横向净宽；梯段上不量）：</p><table>', tr(['路线', '标高', '点数', '最窄', '在', '&lt; 2.4 的点', '挡住的点', '登记例外的点', '终点宅门的点'], True)]
html += [r_ for q in RWS for r_ in [tr([' → '.join(f"{a:g},{b:g}" for a, b in q['pts']), q['lv'], q['n'], q['min'], q['at'], q['under'], q['blocked'], q['exc'], q['door']])] +
         [tr([f"　段 {l_['a'][0]:g},{l_['a'][1]:g} → {l_['b'][0]:g},{l_['b'][1]:g}", '', l_['n'], l_['min'], l_['at'], l_['under'], l_['blocked'], l_['exc'], l_['door']]) for l_ in q['legs']]]+['</table>']+\
        ([f"<p>登记的例外（R12 第 12 节）：每 0.1 m 量的窄段</p><table>", tr(['例外', '从', '到', '长', '最窄', '栅格', '射线', '合']), *[tr([q['id'], q['a'], q['b'], q['len'], q['min'], q.get('raster', q['min']), q.get('ray', '—'), '合' if q['ok'] else '不合']) for q in EXCRUNS], '</table>'] if EXCRUNS else [])
html += [f"<p>高处净宽（模型实测的帽、檐，对新块、落脚铺地、台阶）：</p><table>", tr(['甲', '乙', '净宽', '合 0 / ≥ 2.4'], True)]+[tr([q['a'], q['b'], q['d'], '是' if q['ok'] else '<b>否</b>']) for q in CLR]+['</table>']
if TREES_OUT: html += [f"<p>作者批准去掉的树（{TO_.get('ok', '')}；{TO_.get('why', '')}）：{len(TREES_OUT)}</p><table>", tr(['lx', 'lz', '地面', '种类'], True)]+[tr(t[:4]) for t in TREES_OUT]+['</table>']
open(os.path.join(OUT, 'index.html'), 'w').write('\n'.join(html))
print(json.dumps(dict(stairs=[(s['id'], s['n'], s['flights'], s['riser'], s['angle'], s['ok']) for s in ST_T], piers=[(c['id'], c['kind'], c['new']) for c in PI_T],
                      overlaps=len(overl), gaps=len(gaps), clearBad=sum(1 for q in CLR if not q['ok']), treesGo=len(TREES_GO), treesReseat=len(TREES_RESEAT), treesOut=len(TREES_OUT), routes=[(q['lv'], q['min'], q['at'], q['under'], q['blocked'], q['exc'], q['door']) for q in RWS], exc=[(q['a'], q['b'], q['len'], q['min'], q['ok']) for q in EXCRUNS]), ensure_ascii=False))
