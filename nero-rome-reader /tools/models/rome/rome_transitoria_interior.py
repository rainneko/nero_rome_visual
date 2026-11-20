#!/usr/bin/env python3
"""rome_transitoria_interior · the walkable inside of Nero's east palace (briefs/rome/transitoria-interior.md, step 2).

Built from the plan (tools/models/rome/transitoria_plan.json: rooms, roof blocks, doors, vertical, written and checked by
tools/plan/transitoria_plan.py) by plan_interior.py; reads the palace's web model rome_transitoria.glb and never writes it.
Writes assets/models/rome/rome_transitoria_interior.glb: floors F1-F3 (B1 is the shell's: the sunken court and its stair are in
rome_transitoria.glb, the cool rooms B03/B04 stay solid until step 3, the lift is step 4). The page loads it as its own pack
(transitoria-interior.js, build.config.json) when a reader walks near the palace, and shows it only on foot.
Placement: the shell's (palatine.js PAL_ASSETS: hill-local lx 73.3, lz -63.1, y 56.7, turn 0). Run:
    python3 tools/models/rome/rome_transitoria_interior.py
"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import plan_interior as PI

ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
plan = json.load(open(os.path.join(HERE, 'transitoria_plan.json'), encoding='utf-8'))
LOW = {'MPn': 10.6, 'MPs': 10.6, 'MPe': 10.6, 'MPw': 5.6}          # rome_transitoria.py OPTS 'low' (the court's lean-to roofs)
OUTER = {'doorN': 2.8, 'doorW': 2.0, 'doorS': 2.4}                  # rome_transitoria.py DOORS (widths)
KEEP = ('2P01', '2P02', '2P04', '2E03', '2E05')                     # upper porticoes whose floor is the shell's (tib_plan.shells); 2N01 and 2S04 get
                                                                    # this file's floor, with the stair openings (the shell's floor is cut there)
I = PI.Interior(plan, os.path.join(ROOT, 'assets', 'models', 'rome', 'rome_transitoria.glb'), low=LOW, outer_doors=OUTER,
                keep_shell_floor=KEEP, no_slab=('2S16',), skip_rooms=())
I.build()
I.poke_check()
# the shell's own floors of the two loggias the stairs come up into: cut, this file's slab (with the opening) takes their place
for rid in ('2N01', '2S04'):
    r = I.R[rid]; z = plan['levels'][r['floor']]
    lo, hi = [r['x0'] - 0.03, r['y0'] - 0.03, z - 0.01], [r['x1'] + 0.03, r['y1'] + 0.03, z + 0.05]
    gone = I.inside_box(lo, hi)
    I.cuts.append(dict(fl=r['floor'], line='floor ' + rid, u=None, box=[round(v, 3) for v in lo + hi], tris=len(gone), mats=sorted({I.TMAT[i] for i in gone})))
# roof tiles of a neighbouring block's eave or cresting that hang inside a room (under its own roof or ceiling): cut, nothing in their place.
# These boxes carry a material: the page takes out only that material's faces wholly inside the box.
import numpy as np
for r in plan['rooms']:
    if r['floor'] not in I.FLN or r['type'] in ('garden', 'court', 'terrace') or r['id'] in I.OPEN: continue
    k = I.kfl(r['floor']); z0 = I.FLZ[k - 1] + 0.3
    m = (I.TLO[:, 0] > r['x0'] + 0.3) & (I.THI[:, 0] < r['x1'] - 0.3) & (I.TLO[:, 1] > r['y0'] + 0.3) & (I.THI[:, 1] < r['y1'] - 0.3) & (I.TLO[:, 2] > z0)
    idx = [int(i) for i in np.where(m)[0] if I.TMAT[i] == 'tile' and I.THI[i, 2] < I.ceil(k, float(I.TRI[i][:, 0].mean()), float(I.TRI[i][:, 1].mean())) - 0.1]
    if not idx: continue
    for i in idx:                                  # a box per tile face, so no tile outside the room goes with it
        lo, hi = (I.TLO[i] - 0.01).tolist(), (I.THI[i] + 0.01).tolist()
        took = [j for j in I.inside_box(lo, hi) if I.TMAT[j] == 'tile']
        I.cuts.append(dict(fl=r['floor'], line='tile in ' + r['id'], u=None, box=[round(v, 3) for v in lo + hi] + ['tile'], tris=len(took), mats=['tile']))
# a tile face that reaches into a room only in part (the eave of a neighbouring roof whose slope runs on over the wall, as the E01
# block's into 2E04, the red toothed strip at the top of its north wall) cannot leave the index without opening that roof: the strip
# inside the room (under 0.8 m deep, over head height) is boxed in plaster instead, a cornice along the wall.
def clip(poly, ax, c, keep_hi):
    out = []
    for i in range(len(poly)):
        p, q = poly[i], poly[(i + 1) % len(poly)]
        pin, qin = (p[ax] >= c) == keep_hi, (q[ax] >= c) == keep_hi
        if pin: out.append(p)
        if pin != qin:
            t = (c - p[ax]) / (q[ax] - p[ax]); out.append([p[j] + t * (q[j] - p[j]) for j in range(3)])
    return out
for r in plan['rooms']:
    if r['floor'] not in I.FLN or r['type'] in ('garden', 'court', 'terrace') or r['id'] in I.OPEN: continue
    k = I.kfl(r['floor']); z0 = I.FLZ[k - 1] + 0.3; h = PI.WALL_T / 2
    X0, Y0, X1, Y1 = r['x0'] + h, r['y0'] + h, r['x1'] - h, r['y1'] - h
    m = (I.THI[:, 0] > X0) & (I.TLO[:, 0] < X1) & (I.THI[:, 1] > Y0) & (I.TLO[:, 1] < Y1) & (I.TLO[:, 2] > z0)
    for i in np.where(m)[0]:
        if I.TMAT[i] != 'tile': continue
        if I.TLO[i, 0] > r['x0'] + 0.3 and I.THI[i, 0] < r['x1'] - 0.3 and I.TLO[i, 1] > r['y0'] + 0.3 and I.THI[i, 1] < r['y1'] - 0.3: continue  # cut above
        own = I.block_at((r['x0'] + r['x1']) / 2, (r['y0'] + r['y1']) / 2); cx, cy = float(I.TRI[i][:, 0].mean()), float(I.TRI[i][:, 1].mean())
        if I.block_at(cx, cy) is own: continue                                    # the room's own roof, seen from inside: it stays
        poly = [list(map(float, v)) for v in I.TRI[i]]
        for ax, c, keep_hi in ((0, X0, True), (0, X1, False), (1, Y0, True), (1, Y1, False)):
            if poly: poly = clip(poly, ax, c, keep_hi)
        if len(poly) < 3: continue
        P = np.array(poly); lo, hi = P.min(0), P.max(0)
        if max(hi[0] - lo[0], hi[1] - lo[1]) < 0.05: continue
        over = I.TLO[i, 0] < X0 - 1 or I.THI[i, 0] > X1 + 1 or I.TLO[i, 1] < Y0 - 1 or I.THI[i, 1] > Y1 + 1
        if not (over and min(hi[0] - lo[0], hi[1] - lo[1]) < 0.8): continue    # an eave (its slope or its upright edge): a strip along the wall, not a roof over the room
        if not (hi[0] - lo[0] < 0.8 and (lo[0] < X0 + 0.8 or hi[0] > X1 - 0.8) or hi[1] - lo[1] < 0.8 and (lo[1] < Y0 + 0.8 or hi[1] > Y1 - 0.8)): continue  # along a wall, not a ridge
        lo[:2] = np.maximum(lo[:2] - 0.03, [X0, Y0]); hi[:2] = np.minimum(hi[:2] + 0.03, [X1, Y1])   # an upright edge gets some thickness
        if lo[2] >= I.ceil(k, float(P[:, 0].mean()), float(P[:, 1].mean())) - 0.1: continue      # above the room's ceiling: not seen
        if lo[2] < I.FLZ[k - 1] + 2.2: continue                                    # low down (an eave at a portico's floor): a box there would trip the walker
        I.box('int_plaster', lo[0], lo[1], hi[0], hi[1], lo[2] - 0.08, hi[2] + 0.04, faces='tbnsew')
        I.report.setdefault('cornice', []).append([r['id']] + [round(float(v), 2) for v in list(lo) + list(hi)])
# 2N01: the gatehouse block (MNF, x -7..7) stands 2 m higher than the north range (MN1); the shell's step between the two roofs, a
# plaster face at x = +-7 from 12 m to 14 m, hangs inside the open loggia as two triangles under MN1's slope. A lintel of this file's
# under each (0.6 m deep, the partition's thickness, its top along MN1's roof) makes it a cross wall over a wide opening, and hides
# the face's part below that roof; the part above, the gable step seen from outside, stays the shell's.
BL = {b['id']: b for b in plan['roof_blocks']}; r = I.R['2N01']; h = PI.WALL_T / 2
for c in (-7.0, 7.0):
    xo = c + (0.3 if c > 0 else -0.3)                                   # just inside MN1, beside the gatehouse
    top = lambda u, xo=xo: PI.Interior.surf(I, BL['MN1'], xo, u) - 0.03
    y0, y1 = r['y0'] + h, r['y1'] - h
    I.wall('x', c, y0, 41.0, 11.4, top, ends=(False, False)); I.wall('x', c, 41.0, y1, 11.4, top, ends=(False, False))
    I.hrect('int_plaster', c - h, y0, c + h, y1, 11.4, up=False)
    I.report.setdefault('lintel', []).append(['2N01', c])
print(json.dumps(I.report))
for c in I.cuts: print('cut', c['fl'], c['line'], c['u'], c['tris'], 'tris', c['mats'])
if I.report.get('blocked'): print('BLOCKED doors:', I.report['blocked'])
out = os.path.join(ROOT, 'assets', 'models', 'rome', 'rome_transitoria_interior.glb')
n = I.write(out, 'rome_transitoria_interior', extras=dict(cuts=[c['box'] for c in I.cuts], cutInfo=[c['fl'] + ' ' + c['line'] for c in I.cuts]))
print('wrote', os.path.relpath(out, ROOT), n, 'bytes,', I.tris(), 'triangles,', len([m for m in PI.MATS if I.G[m][0]]), 'materials')
print('by material', {m: len(I.G[m][0]) // 3 for m in PI.MATS})
if I.report.get('blocked') or I.report.get('uncovered') or I.report.get('through_floor'):
    sys.exit(1)
