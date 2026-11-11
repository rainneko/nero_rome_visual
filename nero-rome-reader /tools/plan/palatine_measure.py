"""Read what palatine_measure.mjs saved and print the master plan's colour checks (palatine-masterplan.md 2.3 and section 4).

  python3 tools/plan/palatine_measure.py <dir> [<dir before>] [--json out.json]

Per stone grade: the mean sRGB of its sunlit pixels on the Palatine (faces turned to the sun, the brightest half of them so shadows
drop out), as hue, saturation and lightness. Saturation is given both ways: HSV (what the plan's targets fit: all five are 16-21 %)
and HSL (the travertine target #cdc3ab is 25 % there). Then saturated green (HSV hue 80-140, saturation > 35 %) per camera: on the
whole frame and on the Palatine's ground (terrain and the city mesh: floors, walls; not trees or models). With a second directory:
the change, and how much the two other hills' frames moved.
"""
import sys, json, colorsys
import numpy as np
from PIL import Image

TARGET = {'g1 rock': '#8f8571', 'g2 rusticated': '#9c917b', 'g3 ashlar': '#aca08a', 'g4 travertine': '#cdc3ab', 'g5 paving': '#bdb29b'}
CAMS = ['north_bowl', 'tib_roofs', 'tib_north', 'west', 'south_circus', 'east', 'top', 'saddle']
GLB = None


def load(d, n):
    a = np.asarray(Image.open(f'{d}/{n}.png').convert('RGB')).astype(np.float32) / 255
    i = Image.open(f'{d}/{n}_id.png').convert('RGBA')
    if i.size != (a.shape[1], a.shape[0]):
        i = i.resize((a.shape[1], a.shape[0]), Image.NEAREST)
    i = np.asarray(i).astype(np.int32)
    return a, i


def classes(i):
    R, G, B, A = i[..., 0], i[..., 1], i[..., 2], i[..., 3]
    drawn = A > 0
    pal = (B >= 128) & drawn
    nl = (B & 127) / 127.0
    hp, fl = G // 16, G % 16
    g = lambda name: 150 + GLB.index(name)
    c = {
        'g1 rock: wall-foot ledge (city 61)': (R == 61) & (hp == 1),
        'g1 rock: model rock (rock, rock2)': (R == g('rock')) | (R == g('rock2')),
        'g1 rock: steep terrain': (R == 200) & (G > 128),
        'rock3/4: Tiberiana cliff': (R == g('rock3')) | (R == g('rock4')),
        'g2 rusticated (city 60 flag 1)': (R == 60) & (hp == 1) & (fl == 1),
        'g3 ashlar (city 60 flag 0)': (R == 60) & (hp == 1) & (fl == 0),
        'g4 travertine (city 60 flag 2)': (R == 60) & (hp == 1) & (fl == 2),
        'g5 paving (city 60 flag 3)': (R == 60) & (hp == 1) & (fl == 3),
        'g5 gravel (city 60 flag 4)': (R == 60) & (hp == 1) & (fl == 4),
        'old trim: travertine (city 48)': R == 48,
        'old floor: paving (city 11)': R == 11,
        'old floor: gravel path (city 5)': R == 5,
        'lawn (city 23)': (R == 23),
        'model tuff': R == g('tuff'),
        'hill grass (terrain, flat)': (R == 200) & (G < 70),
    }
    return {k: v & pal for k, v in c.items()}, nl, pal, drawn, R, G


def hsx(rgb):
    h, l, s = colorsys.rgb_to_hls(*rgb)
    _, sv, v = colorsys.rgb_to_hsv(*rgb)
    return h * 360, s * 100, l * 100, sv * 100, v * 100


def sunlit_mean(a, m, nl, thr):
    sel = m & (nl > thr)
    if sel.sum() < 40:
        return None, int(sel.sum())
    px = a[sel]
    lum = px @ np.array([.299, .587, .114])
    lo, hi = np.percentile(lum, 50), np.percentile(lum, 97)
    k = (lum >= lo) & (lum <= hi)
    return px[k].mean(0), int(sel.sum())


def green(a):
    mx, mn = a.max(-1), a.min(-1)
    d = mx - mn
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    h = np.zeros_like(mx)
    m = (d > 1e-6) & (mx == g)
    h[m] = 60 * ((b[m] - r[m]) / d[m] + 2)
    return (h >= 80) & (h <= 140) & (s > .35) & (mx > .08)


def measure(d):
    res = {'grades': {}, 'green': {}}
    acc = {}
    for n in CAMS:
        try:
            a, i = load(d, n)
        except FileNotFoundError:
            continue
        c, nl, pal, drawn, R, G = classes(i)
        for k, m in c.items():
            thr = .55 if ('terrain' in k or 'lawn' in k or 'paving' in k or 'gravel' in k) else .3
            sel = m & (nl > thr)
            if sel.sum():
                acc.setdefault(k, []).append(a[sel])
        gr = green(a)
        ground = pal & ((R == 200) | (R < 100))
        res['green'][n] = {'frame': int(gr.sum()), 'palatine_ground': int((gr & ground).sum()), 'palatine_all': int((gr & pal).sum())}
    for k, L in acc.items():
        px = np.concatenate(L)
        if len(px) < 40:
            continue
        lum = px @ np.array([.299, .587, .114])
        lo, hi = np.percentile(lum, 50), np.percentile(lum, 97)
        mean = px[(lum >= lo) & (lum <= hi)].mean(0)
        h, sl, l, sv, v = hsx(tuple(float(x) for x in mean))
        res['grades'][k] = {'n': int(len(px)), 'rgb': [int(round(float(x) * 255)) for x in mean], 'hex': '#%02x%02x%02x' % tuple(int(round(float(x) * 255)) for x in mean),
                            'H': round(h, 1), 'S_hsv': round(sv, 1), 'S_hsl': round(sl, 1), 'L': round(l, 1), 'V': round(v, 1)}
    return res


def diff_hills(d0, d1):
    out = {}
    for n in ['x_capitol', 'x_aventine']:
        try:
            a0 = np.asarray(Image.open(f'{d0}/{n}.png').convert('RGB')).astype(np.int32)
            a1 = np.asarray(Image.open(f'{d1}/{n}.png').convert('RGB')).astype(np.int32)
        except FileNotFoundError:
            continue
        dd = np.abs(a0 - a1).max(-1)
        i1 = np.asarray(Image.open(f'{d1}/{n}_id.png').convert('RGBA')).astype(np.int32)
        R, A = i1[..., 0], i1[..., 3]
        built = (A > 0) & ((R < 100) | (R == 200) | ((R >= 150) & (R < 200)))   # city mesh, terrain, model materials (not trees, people, smoke, sky)
        stone = (A > 0) & ((R == 60) | (R == 61) | (R == 62) | (R == 48))
        out[n] = {'mean_abs': round(float(np.abs(a0 - a1).mean()), 3), 'px_over_8': int((dd > 8).sum()), 'px_over_24': int((dd > 24).sum()),
                  'built_px_over_8': int(((dd > 8) & built).sum()), 'built_px': int(built.sum()),
                  'hill_stone_px_over_8': int(((dd > 8) & stone).sum()), 'hill_stone_px': int(stone.sum()), 'px': int(dd.size)}
    return out


def show(res, title):
    print(f'== {title}')
    print('  target grades (sunlit, sRGB):')
    for k, hx in TARGET.items():
        rgb = tuple(int(hx[j:j + 2], 16) / 255 for j in (1, 3, 5))
        h, sl, l, sv, v = hsx(rgb)
        print(f'    {k:16s} {hx}  H {h:5.1f}  S(hsv) {sv:4.1f}  S(hsl) {sl:4.1f}  L {l:4.1f}')
    print('  measured:')
    for k, g in res['grades'].items():
        print(f"    {k:38s} {g['hex']}  H {g['H']:5.1f}  S(hsv) {g['S_hsv']:4.1f}  S(hsl) {g['S_hsl']:4.1f}  L {g['L']:4.1f}   n={g['n']}")
    print('  saturated green pixels (frame / Palatine ground / Palatine incl. trees+models):')
    for n, g in res['green'].items():
        print(f"    {n:13s} {g['frame']:8d} {g['palatine_ground']:8d} {g['palatine_all']:8d}")


if __name__ == '__main__':
    av = sys.argv[1:]
    if '--json' in av:
        k = av.index('--json'); av = av[:k] + av[k + 2:]
    args = [a for a in av if not a.startswith('--')]
    GLB = json.load(open(f'{args[0]}/meta.json'))['glb']
    now = measure(args[0])
    show(now, args[0])
    out = {'now': now}
    if len(args) > 1:
        before = measure(args[1])
        show(before, args[1] + ' (before)')
        print('== change in saturated green on the Palatine ground')
        for n in ['east', 'south_circus', 'west']:
            if n in now['green'] and n in before['green']:
                b, a = before['green'][n]['palatine_ground'], now['green'][n]['palatine_ground']
                print(f'    {n:13s} {b:8d} -> {a:8d}  ({(a - b) / max(b, 1) * 100:+.0f} %)')
        out['before'] = before
        out['hills'] = diff_hills(args[1], args[0])
        print('== other hills, frame difference before/after:', json.dumps(out['hills']))
    if '--json' in sys.argv:
        json.dump(out, open(sys.argv[sys.argv.index('--json') + 1], 'w'), indent=1)
