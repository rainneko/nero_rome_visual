"""Clivus Palatinus B: write the page's data block (CLV_B) into src/scenes/rome/clivus-b.js from the plan and the connections.
Run after rome_clivus_palatinus_b_blender.py: python3 tools/models/rome/clivus_b_page_data.py
All points are Palatine local (lx, lz) and absolute y, rounded to the cm.
  cut:   the cuts in the hill's own meshes (connections native_cutters): [polygon, above_y, below_y or null]
  terr:  the cuts in the terrain mesh: the solid podiums (podium_contacts, above solid_top - 0.02), the B5 terrain cutters, and every target of the
         model's ground (treads, courts, paths, beds...) above its own surface - 0.02, so the walk, which reads the meshes and not the ground mask,
         cannot stand on ground the mask hides. Convex pieces only (the cutter clips by half-planes): targets are split into triangles.
  mask:  the index in terr where the targets start: those pieces (convex quads and triangles) also go into the ground mask (groundMaskQuad).
  route: the walk's centre lines [ax, az, ay, bx, bz, by, width]: trees standing in a route's clear space are taken out.
  foot:  the new solids' footprints (podium contacts and terrain cutters): no tree of the city's planting inside.
  plants: the design's planting [lx, lz, y, page tree kind, scale]: the laurels, the urn shrubs and the beds (plan 'plants', 'beds')."""
import json, math, re
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
plan = json.loads((HERE/'clivus_palatinus_b_plan.json').read_text())
conn = json.loads((HERE/'clivus_palatinus_b_connections.json').read_text())
R = lambda v: round(v + 0.0, 2)
P = lambda poly: [[R(x), R(z)] for x, z in poly]

def area2(p):
    return sum(p[i][0]*p[(i+1) % len(p)][1]-p[(i+1) % len(p)][0]*p[i][1] for i in range(len(p)))

def convex(p):
    s = 0
    for i in range(len(p)):
        a, b, c = p[i], p[(i+1) % len(p)], p[(i+2) % len(p)]
        cr = (b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0])
        if abs(cr) < 1e-9: continue
        if s and (cr > 0) != (s > 0): return False
        s = cr
    return True

def ears(p):
    p = list(p)
    if area2(p) < 0: p = p[::-1]
    out = []
    while len(p) > 3:
        for i in range(len(p)):
            a, b, c = p[i-1], p[i], p[(i+1) % len(p)]
            if (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]) <= 1e-12: continue
            def ins(q):
                d1 = (b[0]-a[0])*(q[1]-a[1])-(b[1]-a[1])*(q[0]-a[0]); d2 = (c[0]-b[0])*(q[1]-b[1])-(c[1]-b[1])*(q[0]-b[0]); d3 = (a[0]-c[0])*(q[1]-c[1])-(a[1]-c[1])*(q[0]-c[0])
                return d1 > 0 and d2 > 0 and d3 > 0
            if any(ins(q) for q in p if q not in (a, b, c)): continue
            out.append([a, b, c]); del p[i]; break
        else:
            break
    out.append(p)
    return out

def surface(t):
    pl = t.get('plane')
    if pl: return min(pl['slope']*z+pl['intercept'] for x, z in t['polygon_lx_lz'])
    return t['surface_y'] if t.get('surface_y') is not None else t['y']

cut = [[P(c['polygon_lx_lz']), R(c['above_y']), R(c['below_y']) if c.get('below_y') is not None else None] for c in conn['native_cutters']]
terr = [[P(q['polygon_lx_lz']), R(q['solid_top_y']-.02)] for q in plan['podium_contacts']]
terr += [[P(c['polygon_lx_lz']), R(c['above_y'])] for c in conn['terrain_cutters']]
mask = len(terr)
for t in plan['targets']:
    poly = P(t['polygon_lx_lz']); y = R(surface(t)-.02)
    tris = [poly] if convex(poly) and len(poly) <= 4 else ears(poly)
    for tr in tris:
        terr.append([tr, y])
route = [[R(r['from'][0]), R(r['from'][1]), R(r['from'][2]), R(r['to'][0]), R(r['to'][1]), R(r['to'][2]), r.get('net_width_m') or 3] for r in plan['route']]
foot = [P(q['polygon_lx_lz']) for q in plan['podium_contacts']] + [P(c['polygon_lx_lz']) for c in conn['terrain_cutters']]
plants = []
for p in plan['plants']:
    if p['kind'] == 'tree': plants.append([R(p['lx']), R(p['lz']), R(p['y']), 'broadD', R(p['height_m']/9.3)])   # laurel: the page's dark broadleaf, ~9.3 m at scale 1
    elif p['kind'] == 'shrub' and p['id'].startswith('urn'): plants.append([R(p['lx']), R(p['lz']), R(p['y']+.23), 'shrub', R(p['crown_radius_m']/1.25)])
for b in plan['beds']:
    xs = [q[0] for q in b['poly']]; zs = [q[1] for q in b['poly']]; x0, x1, z0, z1 = min(xs), max(xs), min(zs), max(zs)
    n = max(2, int((x1-x0)/.75))
    for j in range(n):
        x = x0+.35+(x1-x0-.7)*j/max(1, n-1)
        plants.append([R(x), R((z0+z1)/2), R(b['y']), 'shrub' if j % 3 else 'flower', R(min(.42, (z1-z0)*.3))])
data = {'origin': [plan['origin']['lx'], plan['origin']['lz'], plan['origin']['y']], 'box': [51, 103, 144, 244], 'street': [53, 100, 144, 236],
        'cut': cut, 'terr': terr, 'mask': mask, 'route': route, 'foot': foot, 'plants': plants}
js = ROOT/'src/scenes/rome/clivus-b.js'
src = js.read_text()
block = 'const CLV_B=' + json.dumps(data, separators=(',', ':')) + ';'
new, n = re.subn(r'const CLV_B=.*?;\n', lambda m: block+'\n', src, count=1, flags=re.S)
assert n == 1, 'CLV_B line not found in clivus-b.js'
js.write_text(new)
print('CLV_B', len(cut), 'hill cuts,', len(terr), 'terrain cuts,', len(terr)-mask, 'masked pieces,', len(route), 'route legs,', len(plants), 'plants,', len(block), 'bytes')
