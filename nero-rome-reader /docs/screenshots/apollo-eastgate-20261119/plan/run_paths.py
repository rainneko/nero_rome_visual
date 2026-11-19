#!/usr/bin/env python
"""Runs the repo's tools/plan/palatine_paths.py unchanged on the apE part (ape_input.json), which is not in PAL_PLAN.
Usage: python run_paths.py DUMP OUTDIR     (DUMP: palatine_paths.mjs output, made with inject.mjs and PART=apE)
- PAL_PLAN as the file has it, plus PAL_PLAN.apE = ape_input.json (sumE as it is now: apE does not change it) and beltE's corner (90.5, 57)
  replaced by the outer faces of the two planted tiers;
- the dump's Apollo probe with the three east buttresses the stair and forecourt need removed (model y 0, +-10.44) set to the wall face;
- each sheet stamped 草图，未建."""
import sys, os, json, subprocess, runpy
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
TOOL = os.path.join(ROOT, 'tools', 'plan', 'palatine_paths.py')
A = json.load(open(os.path.join(HERE, 'ape_input.json')))
dump_in, OUT = sys.argv[1], sys.argv[2]
D = json.load(open(dump_in))
for P in D.get('probes', []):
    if P.get('m') != 'rome_apollo': continue
    y0 = str(P['y'][0]) if str(P['y'][0]) in P['hits'] else list(P['hits'].keys())[0]
    face = min(v for s, v in P['hits'][y0] if v is not None)
    for h in P['hits'][y0]:
        if h[1] is not None and h[1] > face+.3 and any(a <= h[0] <= b for a, b in A['remove_buttress_lz']): h[1] = face
dump_p = os.path.join(OUT, '_dump_patched.json'); os.makedirs(OUT, exist_ok=True); json.dump(D, open(dump_p, 'w'))
_co = subprocess.check_output
def co(args, *a, **k):
    out = _co(args, *a, **k)
    if isinstance(args, list) and args and args[0] == 'node' and any(str(x).endswith('palatine-plan.js') for x in args):
        PL = json.loads(out); part = {k_: v for k_, v in A.items() if not k_.startswith('_') and k_ not in ('beltE_replace', 'deco', 'remove_buttress_lz')}
        sumE = next(p for p in PL['plats'] if p['id'] == 'sumE'); part['sumE'] = {k_: sumE[k_] for k_ in ('pts', 'edge', 'foot')}
        R = A['beltE_replace']; bE = next(p for p in PL['plats'] if p['id'] == 'beltE'); i = next(j for j, q in enumerate(bE['pts']) if abs(q[0]-R['old'][0]) < 1e-6 and abs(q[1]-R['old'][1]) < 1e-6)
        bE['pts'] = bE['pts'][:i]+R['new']+bE['pts'][i+1:]; bE['edge'] = bE['edge'][:i]+R['edges']+bE['edge'][i+1:]; bE['foot'] = bE['foot'][:i]+[None]*len(R['new'])+bE['foot'][i+1:]
        PL['apE'] = part; out = json.dumps(PL).encode()
    return out
subprocess.check_output = co
import numpy as _np
_jd = json.JSONEncoder.default
def _jdef(self, o):   # numpy scalars in checks.json (e.g. a pier's 'big' from a numpy height): written as plain values
    if isinstance(o, _np.generic): return o.item()
    return _jd(self, o)
json.JSONEncoder.default = _jdef
sys.argv = [TOOL, dump_p, OUT, 'apE']
KPX = int(os.environ.get('PALK', '16'))   # the tool's plan scale (px per m, 7 in the tool) raised for this 36 m box: the source is run unchanged except this one number
src = open(TOOL, encoding='utf-8').read(); assert 'K, M = 7, 50' in src
try: exec(compile(src.replace('K, M = 7, 50', f'K, M = {KPX}, 50'), TOOL, 'exec'), {'__name__': '__main__', '__file__': TOOL})
finally: subprocess.check_output = _co
FONT = '/System/Library/Fonts/STHeiti Medium.ttc'
for f in sorted(os.listdir(OUT)):
    if not f.endswith('.png') or f[:2].isdigit(): continue
    p = os.path.join(OUT, f); im = Image.open(p).convert('RGB'); W_, H_ = im.size; top = 64
    o = Image.new('RGB', (W_, H_+top), (255, 255, 255)); o.paste(im, (0, top)); d = ImageDraw.Draw(o)
    d.text((14, 6), '草图，未建 · 阿波罗东门前庭 · ' + f[:-4], font=ImageFont.truetype(FONT, 24), fill=(190, 20, 20))
    d.text((14, 36), f'palatine_paths.py 运行（比例 {KPX} px/m），apE 数据见 ape_input.json', font=ImageFont.truetype(FONT, 16), fill=(120, 30, 30))
    o.save(p)
os.remove(dump_p)
