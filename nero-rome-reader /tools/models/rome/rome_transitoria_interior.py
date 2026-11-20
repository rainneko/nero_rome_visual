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
print(json.dumps(I.report))
for c in I.cuts: print('cut', c['fl'], c['line'], c['u'], c['tris'], 'tris', c['mats'])
if I.report.get('blocked'): print('BLOCKED doors:', I.report['blocked'])
out = os.path.join(ROOT, 'assets', 'models', 'rome', 'rome_transitoria_interior.glb')
n = I.write(out, 'rome_transitoria_interior', extras=dict(cuts=[c['box'] for c in I.cuts], cutInfo=[c['fl'] + ' ' + c['line'] for c in I.cuts]))
print('wrote', os.path.relpath(out, ROOT), n, 'bytes,', I.tris(), 'triangles,', len([m for m in PI.MATS if I.G[m][0]]), 'materials')
print('by material', {m: len(I.G[m][0]) // 3 for m in PI.MATS})
if I.report.get('blocked') or I.report.get('uncovered') or I.report.get('through_floor'):
    sys.exit(1)
