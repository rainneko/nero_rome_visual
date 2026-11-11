#!/usr/bin/env python3
"""The Palatine as one designed base: draws the hill as it is built now (six rings that follow the contours) and the plan
(three named levels, straight wall runs with a pier at every angle, a stair network), on the real ground of the page.
Reads briefs/rome/plans/palatine-survey-20261111.json, writes briefs/rome/plans/palatine-masterplan.html and
src-ready numbers in briefs/rome/plans/palatine-plan.json (the wall traces in the hill's own grid: palW(lx, lz)).
Hill grid: +x east-south-east (along the Circus), +z south-south-west (the Circus side); angles from +x toward +z.
Run: python3 tools/plan/palatine_plan.py   (standard library only)"""
import json, os, math, html
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
D = json.load(open(os.path.join(ROOT, 'briefs', 'rome', 'plans', 'palatine-survey-20261111.json')))
G = D['grid']; H = G['H']; GX0, GZ0, ST = G['X0'], G['Z0'], G['ST']; NX, NZ = len(H[0]), len(H)
def h(lx, lz):
    fx = (lx - GX0) / ST; fz = (lz - GZ0) / ST; ix = max(0, min(NX - 2, int(fx))); iz = max(0, min(NZ - 2, int(fz))); tx = min(1, max(0, fx - ix)); tz = min(1, max(0, fz - iz))
    return (H[iz][ix] * (1 - tx) + H[iz][ix + 1] * tx) * (1 - tz) + (H[iz + 1][ix] * (1 - tx) + H[iz + 1][ix + 1] * tx) * tz
LEVELS = dict(summit=56.4, saddle=51.4, belt=42.0, foot=26.0)      # the named floors of the hill
C = (0.0, 10.0)
def trace(ground, step=2.0):
    """Where the ground is `ground` on each ray from the hill's centre (the outermost crossing), then straightened: runs with angles between them."""
    P = []
    for a in range(0, 360, 2):
        t = math.radians(a); dx, dz = math.cos(t), math.sin(t); r = 330.0; hit = None
        while r > 30:
            x, z = C[0] + dx * r, C[1] + dz * r
            if GX0 <= x <= G['X1'] and -188 <= z <= G['Z1'] and h(x, z) >= ground: hit = (x, z); break
            r -= step
        if hit: P.append(hit)
    return P
def dp(P, tol):
    if len(P) < 3: return P
    a, b = P[0], P[-1]; L = math.hypot(b[0] - a[0], b[1] - a[1]) or 1e-9; best, bi = 0, 0
    for i in range(1, len(P) - 1):
        dd = abs((P[i][0] - a[0]) * (b[1] - a[1]) - (P[i][1] - a[1]) * (b[0] - a[0])) / L
        if dd > best: best, bi = dd, i
    if best <= tol: return [a, b]
    return dp(P[:bi + 1], tol)[:-1] + dp(P[bi:], tol)
def closed(P, tol):
    n = len(P); k = max(range(n), key=lambda i: P[i][0]); Q = P[k:] + P[:k]; m = len(Q) // 2
    return dp(Q[:m + 1], tol)[:-1] + dp(Q[m:] + [Q[0]], tol)[:-1]
T = {'summit': closed(trace(48.0), 6.0), 'belt': closed(trace(37.0), 7.0), 'foot': closed(trace(21.0), 8.0)}
def runs(P): return [math.hypot(P[(i + 1) % len(P)][0] - P[i][0], P[(i + 1) % len(P)][1] - P[i][1]) for i in range(len(P))]
def at(P, a):
    """The point of a closed trace on the ray at angle a (degrees)."""
    t = math.radians(a); dx, dz = math.cos(t), math.sin(t); best = None
    for i in range(len(P)):
        p, q = P[i], P[(i + 1) % len(P)]; ex, ez = q[0] - p[0], q[1] - p[1]; den = dx * ez - dz * ex
        if abs(den) < 1e-9: continue
        s = ((p[0] - C[0]) * ez - (p[1] - C[1]) * ex) / den; u = ((p[0] - C[0]) * dz - (p[1] - C[1]) * dx) / den
        if s > 0 and 0 <= u <= 1 and (best is None or s > best): best = s
    return (C[0] + dx * best, C[1] + dz * best) if best else None
def spts(a):
    b = at(T['belt'], a[1]); t0 = math.radians(a[0]); f = at(T['foot'], a[2]); t3 = math.radians(a[3])
    return [(b[0] - math.cos(t0) * 22, b[1] - math.sin(t0) * 22), b, f, (f[0] + math.cos(t3) * 26, f[1] + math.sin(t3) * 26)]
# the stair network: class, name, the angles it passes at (summit wall, belt wall, foot wall, street)
STAIRS = [
    ('B', '东阶（半圆花园中轴）', (2, 2, 2, 2)), ('B', '南阶（竞技场—阿波罗神庙）', (84, 86, 88, 88)),
    ('B', '卡库斯台阶 Scalae Caci【史】', (128, 133, 140, 143)), ('B', '北阶（广场—提比略宫西北角）', (232, 236, 238, 238)),
    ('B', '东北阶（圣道—宅带—东宫）', (300, 300, 302, 302)),
    ('A', '胜利坡 Clivus Victoriae【史】', (150, 176, 206, 214)), ('A', '帕拉蒂尼坡 Clivus Palatinus【史】', (318, 332, 346, 350)),
    ('C', '', (38, 44, 50, 50)), ('C', '', (62, 56, 50, 50)), ('C', '', (108, 113, 118, 118)), ('C', '', (190, 196, 200, 200)), ('C', '', (275, 270, 266, 266)), ('C', '', (342, 20, 24, 24))]
FOUNT = [('belt', 2, '半圆壁泉'), ('belt', 70, '壁泉'), ('belt', 112, '壁泉'), ('belt', 300, '宅带水槽'), ('foot', 40, '街泉'), ('foot', 150, '卢佩卡尔泉【史】'), ('foot', 262, '街泉')]
ZONES = [  # which line, angle, metres outside (+) or inside (-) of it, text
    ('foot', 14, 44, '东坡 · 半圆花园\n悬铃木列、黄杨花坛、壁泉'), ('foot', 46, 34, '东南坡 · 葡萄架与果园'),
    ('foot', 112, 30, '南坡 · 观赛长廊，俯瞰大竞技场\n脚台朝竞技场开商铺拱'), ('foot', 152, 34, '西南坡 · 圣林\n冬青栎、月桂、石松'), ('foot', 200, 34, '西坡 · 露山岩，少砌墙'),
    ('foot', 250, 28, '提比略宫的崖壁和台地花园\n已经做好，不动'), ('foot', 292, 26, '北坡 · 元老宅带：宅地排在同一级台上\n脚台朝圣道开商铺拱'), ('foot', 336, 34, '东北坡 · 宅带延伸')]
plan = dict(note='Palatine master plan, draft of 2026-11-11: wall traces fitted to the page ground (the hill grid, palW(lx, lz)); to be adjusted by +-5 m on site.',
            centre=C, levels=LEVELS, trace_ground=dict(summit=48, belt=37, foot=21),
            traces={k: [[round(p[0], 1), round(p[1], 1)] for p in v] for k, v in T.items()},
            stairs=[dict(cls=c, name=n, pts=[[round(v, 1) for v in q] for q in spts(a)]) for c, n, a in STAIRS],
            fountains=[dict(level=l, name=n, at=[round(v, 1) for v in at(T[l], a)]) for l, a, n in FOUNT])
json.dump(plan, open(os.path.join(ROOT, 'briefs', 'rome', 'plans', 'palatine-plan.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for k, v in T.items():
    R = runs(v); print('%-6s %2d runs, %4.0f m in all, run %3.0f-%3.0f m (median %2.0f)' % (k, len(v), sum(R), min(R), max(R), sorted(R)[len(R) // 2]))
print('now: %d wall segments on %d levels' % (len(D['segs']), len(D['lv'])))

# ---------------------------------------------------------------- drawing
S = 1.62; MX, MZ = 12, 12; VX0, VX1, VZ0, VZ1 = -350, 425, -215, 262
def X(x): return MX + (x - VX0) * S
def Y(z): return MZ + (z - VZ0) * S
def esc(s): return html.escape(s, quote=True)
def path(P, close=True): return 'M' + 'L'.join('%.1f %.1f' % (X(p[0]), Y(p[1])) for p in P) + ('Z' if close else '')
def contours():
    o = []
    for lv in range(12, 57, 4):
        seg = []
        for iz in range(NZ - 1):
            for ix in range(NX - 1):
                v = [H[iz][ix], H[iz][ix + 1], H[iz + 1][ix + 1], H[iz + 1][ix]]; c = [(ix, iz), (ix + 1, iz), (ix + 1, iz + 1), (ix, iz + 1)]; pts = []
                for k in range(4):
                    a, b = v[k], v[(k + 1) % 4]
                    if (a < lv) != (b < lv):
                        t = (lv - a) / (b - a); pa, pb = c[k], c[(k + 1) % 4]; pts.append((GX0 + (pa[0] + (pb[0] - pa[0]) * t) * ST, GZ0 + (pa[1] + (pb[1] - pa[1]) * t) * ST))
                if len(pts) >= 2: seg.append('M%.1f %.1fL%.1f %.1f' % (X(pts[0][0]), Y(pts[0][1]), X(pts[1][0]), Y(pts[1][1])))
        o.append('<path d="%s" class="ct%s"/>' % (''.join(seg), ' ct5' if lv % 20 == 0 else ''))
    return ''.join(o)
CT = contours()
ANAME = {'rome_tiberiana': '提比略宫', 'rome_transitoria': '尼禄东宫', 'rome_apollo': '阿波罗神庙', 'rome_domus_augusti': '奥古斯都宅', 'rome_magna_mater': '众神之母庙', 'rome_victoria': '胜利女神庙', 'rome_domus_a': '宅', 'rome_domus_b': '宅'}
def assets(cls='as'):
    o = []
    for a in D['assets']:
        hw, hd = (a['hd'], a['hw']) if a['turn'] in (90, 270) else (a['hw'], a['hd'])
        if a['n'] == 'rome_tiberiana': hw, hd = 65, 50
        o.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" class="%s"/><text x="%.1f" y="%.1f" class="an">%s</text>' % (X(a['lx'] - hw), Y(a['lz'] - hd), 2 * hw * S, 2 * hd * S, cls, X(a['lx']), Y(a['lz']) + 4, ANAME[a['n']]))
    for t, lx, lz, tn, y in D['blocks']:
        k = D['blk'][t]; w, d = (k['d'], k['w']) if tn in (90, 270) else (k['w'], k['d']); o.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" class="bk"/>' % (X(lx - w / 2), Y(lz - d / 2), w * S, d * S))
    return ''.join(o)
W_, H_ = MX * 2 + (VX1 - VX0) * S, MZ * 2 + (VZ1 - VZ0) * S
def svg(inner, title): return '<svg viewBox="0 0 %.0f %.0f" role="img" aria-label="%s"><rect width="100%%" height="100%%" class="bg"/>%s%s<g transform="translate(%.0f,%.0f)"><path d="M0 0h%.1fv-5h-%.1fz" fill="#333"/><text x="0" y="13" class="tiny">0</text><text x="%.1f" y="13" class="tiny">100 m</text></g><text x="%.0f" y="26" class="edge">北 · 罗马广场、圣道</text><text x="%.0f" y="%.0f" class="edge">南 · 大竞技场</text><text transform="translate(22,%.0f) rotate(-90)" class="edge">西 · 韦拉布鲁姆</text><text transform="translate(%.0f,%.0f) rotate(90)" class="edge">东 · 谷地</text></svg>' % (
    W_, H_, esc(title), CT, inner, MX + 8, H_ - 22, 100 * S, 100 * S, 100 * S - 14, W_ / 2, W_ / 2, H_ - 12, H_ / 2, W_ - 22, H_ / 2)
LC = {51: '#7a1f1f', 44: '#b23a2a', 37: '#d06a2c', 30: '#d99a2b', 23: '#9aa23a', 16: '#4f8f6a'}
def now():
    o = []
    for yk, gap, a, b in D['segs']:
        o.append('<path d="M%.1f %.1fL%.1f %.1f" stroke="%s" class="%s"/>' % (X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), LC[yk], 'gp' if gap else 'ws'))
    for s in D['stairs']:
        if all(abs(p[0]) < 300 and -250 < p[1] < 300 for p in s['R']): o.append('<path d="%s" class="st0"/>' % path(s['R'], False))
    o.append(assets()); lg = ''.join('<g transform="translate(%d,%d)"><path d="M0 0h22" stroke="%s" class="ws"/><text x="28" y="4" class="tiny">%d m</text></g>' % (W_ - 110, 60 + i * 16, LC[k], k) for i, k in enumerate(sorted(LC, reverse=True)))
    o.append(lg + '<text x="%d" y="48" class="tiny">现在的六圈墙顶标高</text>' % (W_ - 130))
    return svg(''.join(o), '现状')
def planned():
    o = ['<defs><clipPath id="cb"><path d="%s"/></clipPath><clipPath id="cf"><path d="%s"/></clipPath></defs>' % (path(T['belt']), path(T['foot']))]
    o.append('<path d="%s" class="band f" clip-path="url(#cf)"/><path d="%s" class="band b" clip-path="url(#cb)"/><path d="%s" class="top"/>' % (path(T['foot']), path(T['belt']), path(T['summit'])))
    o.append('<path d="%s" class="wl summit"/>' % path(T['summit']))
    o.append(assets('as2'))
    for k in ('foot', 'belt'):
        P = T[k]
        for i in range(len(P)):
            a, b = P[i], P[(i + 1) % len(P)]; ang = math.degrees(math.atan2((a[1] + b[1]) / 2 - C[1], (a[0] + b[0]) / 2 - C[0])) % 360; rock = 168 <= ang <= 262
            o.append('<path d="%s" class="wl %s%s"/>' % (path([a, b], False), k, ' rock' if rock else ''))
            if not rock: o.append('<rect x="%.1f" y="%.1f" width="7" height="7" class="pier"/>' % (X(a[0]) - 3.5, Y(a[1]) - 3.5))
    for cls, name, a in STAIRS:
        P = spts(a); t = math.radians(a[3])
        o.append('<path d="%s" class="st st%s"/>' % (path(P, False), cls))
        if name: o.append('<text x="%.1f" y="%.1f" class="sn" text-anchor="%s">%s</text>' % (X(P[3][0]) + (6 if math.cos(t) >= 0 else -6), Y(P[3][1]) + (14 if math.sin(t) > .3 else -4 if math.sin(t) < -.3 else 4), 'start' if math.cos(t) >= 0 else 'end', esc(name)))
    for l, a, n in FOUNT:
        p = at(T[l], a); t = math.radians(a); p = (p[0] - math.cos(t) * 5, p[1] - math.sin(t) * 5); o.append('<circle cx="%.1f" cy="%.1f" r="4.5" class="fo"><title>%s</title></circle>' % (X(p[0]), Y(p[1]), esc(n)))
    for l, a, k, txt in ZONES:
        p = at(T[l], a); t = math.radians(a); p = (p[0] + math.cos(t) * k, p[1] + math.sin(t) * k)
        for i, line in enumerate(txt.split('\n')): o.append('<text x="%.1f" y="%.1f" class="zn%s">%s</text>' % (X(p[0]), Y(p[1]) + i * 12, ' z2' if i else '', esc(line)))
    LX, LY = W_ - 236, H_ - 180
    lg = [('wl summit', '山顶边墙（顶 51–56 m）'), ('wl belt', '腰台外墙（台面 42 m）'), ('wl foot', '脚台外墙（台面 26 m）'), ('wl belt rock', '这一段不砌墙，露山岩'), ('st stB', '大阶（5–6 m 宽，在轴线上）'), ('st stA', '坡道（6–7 m，车马）'), ('st stC', '墙梯（2.4–3 m，贴墙）')]
    o.append(''.join('<g transform="translate(%d,%d)"><path d="M0 0h26" class="%s"/><text x="32" y="4" class="tiny">%s</text></g>' % (LX, LY + i * 16, c, t) for i, (c, t) in enumerate(lg)))
    o.append('<g transform="translate(%d,%d)"><rect x="9" y="-4" width="7" height="7" class="pier"/><text x="32" y="4" class="tiny">墩台（每个转折一个）</text></g><g transform="translate(%d,%d)"><circle cx="13" cy="0" r="4.5" class="fo"/><text x="32" y="4" class="tiny">壁泉（水从墙里出来）</text></g>' % (LX, LY + 7 * 16, LX, LY + 8 * 16))
    return svg(''.join(o), '方案')
PAGE = '''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>帕拉蒂尼山 · 整体地基方案</title><style>
:root{--ink:#2b2622;--mut:#6f665c;--bg:#faf7f1;--acc:#8a2f1d}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 -apple-system,"PingFang SC","Hiragino Sans GB","Noto Sans SC",sans-serif}
main{max-width:1060px;margin:0 auto;padding:20px 16px 60px}h1{font-size:22px;margin:4px 0 2px}p.sub{color:var(--mut);margin:0 0 12px}
.tabs{display:flex;gap:6px;margin:10px 0}.tabs button{font:inherit;padding:6px 14px;border:1px solid #cfc6b8;background:#fff;border-radius:999px;cursor:pointer;color:var(--ink)}.tabs button[aria-selected=true]{background:var(--acc);border-color:var(--acc);color:#fff}
.pane{display:none;background:#fff;border:1px solid #e2dacd;border-radius:10px;padding:6px}.pane.on{display:block}svg{width:100%;height:auto;display:block}
.bg{fill:#f6f2e9}.ct{stroke:#cbbfa9;stroke-width:.6;fill:none}.ct5{stroke:#a8997e;stroke-width:1}
text{font:11px -apple-system,"PingFang SC","Hiragino Sans GB",sans-serif;fill:#1d1916}.tiny{font-size:10.5px;fill:var(--mut)}.edge{font-size:12.5px;fill:var(--mut);text-anchor:middle}
.as{fill:#e9d9c4;stroke:#7b6a55;stroke-width:1}.as2{fill:#f3e7d6;stroke:#7b6a55;stroke-width:1}.bk{fill:#d8cfc0;stroke:#a09280;stroke-width:.6}.an{text-anchor:middle;font-size:10.5px;fill:#4a3f33}
.ws{stroke-width:2.6;fill:none}.gp{stroke-width:1;stroke-dasharray:2 3;fill:none}.st0{stroke:#555;stroke-width:2;stroke-dasharray:5 3;fill:none}
.band{fill:none;stroke-width:%(bw).1fpx}.band.b{stroke:#e2c58c;opacity:.85}.band.f{stroke:#ead9b5;opacity:.85}.top{fill:#f7edd9;stroke:none;opacity:.7}
.wl{fill:none;stroke:#5a4632;stroke-linejoin:miter}.wl.summit{stroke-width:2.2}.wl.belt{stroke-width:3.2}.wl.foot{stroke-width:2.4}.pier{fill:#5a4632}.wl.rock{stroke:#9a8a72;stroke-dasharray:3 4}
.st{fill:none;stroke-linecap:round}.stB{stroke:#b0281a;stroke-width:4}.stA{stroke:#b0281a;stroke-width:2.6;stroke-dasharray:9 4}.stC{stroke:#d0603f;stroke-width:1.8}
.sn{font-size:11px;fill:#8a2f1d;font-weight:600}.fo{fill:#5fb3e0;stroke:#1f6f9c;stroke-width:1.2}.zn{text-anchor:middle;font-size:11px;font-weight:600;fill:#3a2f24;paint-order:stroke;stroke:#fff8;stroke-width:3px}.zn.z2{font-weight:400;font-size:10px}
.note{background:#fff;border:1px solid #e2dacd;border-left:4px solid var(--acc);border-radius:6px;padding:10px 14px;margin:12px 0}.note ul{margin:4px 0;padding-left:20px}
</style></head><body><main><h1>帕拉蒂尼山 · 整体地基方案（草案）</h1>
<p class="sub">2026-11-11。底图是网页现在的真实地面（等高线每 4 m，粗线每 20 m）。墙线按地面拟合成直段，实施时可在 ±5 m 内调整。说明见 <code>briefs/rome/palatine-masterplan.md</code></p>
<div class="tabs" role="tablist"><button role="tab" aria-selected="true">方案：三级台、直墙、墩台、阶梯网</button><button role="tab" aria-selected="false">现状：六圈等高墙</button></div>
<div class="pane on">%(plan)s</div><div class="pane">%(now)s</div>
<div class="note"><b>怎么读这张图</b><ul>
<li>现状：墙是沿等高线“扫”出来的，每 7 m 一圈，共 6 圈、%(nseg)d 段，从上面看就是等高线，没有主次。</li>
<li>方案：全山只有三条墙线。山顶边墙托着宫殿和神庙；腰台（42 m）是一圈 16 m 宽的花园、宅地和长廊；脚台（26 m）朝街开商铺拱。三条线之间露出山岩。</li>
<li>墙走直线，每 %(r0).0f–%(r1).0f m 一个转折，转折处一个方墩台。阶梯只在墩台和折角处起落，分三等。</li>
<li>各坡的用途、材质和水景位置都标在图上；提比略宫北面的崖壁和台地花园不动。</li></ul></div>
</main><script>const t=[...document.querySelectorAll('.tabs button')],p=[...document.querySelectorAll('.pane')];t.forEach((b,i)=>b.onclick=()=>{t.forEach((x,j)=>x.setAttribute('aria-selected',i===j));p.forEach((x,j)=>x.classList.toggle('on',i===j));});</script></body></html>'''
Rb = runs(T['belt'])
page = PAGE
for k, v in (('%(bw).1f', '%.1f' % (32 * S)), ('%(plan)s', planned()), ('%(now)s', now()), ('%(nseg)d', str(len(D['segs']))),
             ('%(r0).0f', '%.0f' % sorted(Rb)[len(Rb) // 5]), ('%(r1).0f', '%.0f' % sorted(Rb)[len(Rb) * 4 // 5])): page = page.replace(k, v)
out = os.path.join(ROOT, 'briefs', 'rome', 'plans', 'palatine-masterplan.html'); open(out, 'w', encoding='utf-8').write(page); print('wrote', os.path.relpath(out, ROOT), len(page), 'bytes')
