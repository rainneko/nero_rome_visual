#!/usr/bin/env python3
"""A STAND-IN for the great kitchen's furnishings (briefs/rome/transitoria-v3/tr-fit-kitchen-workorder.md), so the zone packs
(palace-interior.js: load near, release far) can be built and measured before the real model arrives. Plain boxes at the work
order's places: the hearth bench K1, the oven's base K3, the trough K4, the table K5. The real rome_tr_fit_S09.glb (GPT, Blender)
replaces this file's output under the same name; delete this script then. Axes as the interior: x east, y north, z up, origin the
palace's centre. Structure as the packs want it: a top object `interior`, the room's things under `room_S09`.
Run: python3 tools/models/rome/rome_tr_fit_S09_standin.py"""
import os, json, struct
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
MATS = {'brick': (0.52, 0.27, 0.17), 'stone': (0.62, 0.59, 0.52), 'wood': (0.36, 0.24, 0.13)}
BOX = [('brick', 24.4, -45.7, 31.6, -44.8, 0.06, 0.91), ('brick', 29.8, -38.2, 31.6, -36.4, 0.06, 0.96), ('brick', 30.1, -37.9, 31.3, -36.7, 0.96, 1.7),
       ('stone', 31.0, -43.0, 31.7, -41.2, 0.06, 0.86), ('wood', 26.5, -41.6, 29.5, -40.4, 0.81, 0.91)] + \
      [('wood', x, y, x + 0.12, y + 0.12, 0.06, 0.81) for x in (26.6, 29.28) for y in (-41.5, -40.62)]
G = {m: ([], []) for m in MATS}
for m, x0, y0, x1, y1, z0, z1 in BOX:
    c = [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
    for q, n in (((4, 5, 6, 7), (0, 0, 1)), ((0, 1, 5, 4), (0, -1, 0)), ((1, 2, 6, 5), (1, 0, 0)), ((2, 3, 7, 6), (0, 1, 0)), ((3, 0, 4, 7), (-1, 0, 0))):
        for k in (0, 1, 2, 0, 2, 3): G[m][0].append(c[q[k]]); G[m][1].append(n)
bin_, acc, views, prims = bytearray(), [], [], []
def put(a, target):
    o = len(bin_); bin_.extend(a.tobytes()); views.append(dict(buffer=0, byteOffset=o, byteLength=a.nbytes, target=target)); return len(views) - 1
for i, m in enumerate(MATS):
    P = np.array(G[m][0], dtype=np.float64); N = np.array(G[m][1], dtype=np.float64)
    Pg = np.stack([P[:, 0], P[:, 2], -P[:, 1]], axis=1).astype(np.float32); Ng = np.stack([N[:, 0], N[:, 2], -N[:, 1]], axis=1).astype(np.float32)   # glTF: y up
    acc.append(dict(bufferView=put(Pg, 34962), componentType=5126, count=len(Pg), type='VEC3', min=Pg.min(axis=0).tolist(), max=Pg.max(axis=0).tolist()))
    acc.append(dict(bufferView=put(Ng, 34962), componentType=5126, count=len(Ng), type='VEC3'))
    acc.append(dict(bufferView=put(np.arange(len(Pg), dtype=np.uint32), 34963), componentType=5125, count=len(Pg), type='SCALAR'))
    prims.append(dict(attributes=dict(POSITION=len(acc) - 3, NORMAL=len(acc) - 2), indices=len(acc) - 1, material=i))
j = dict(asset=dict(version='2.0', generator='rome_tr_fit_S09_standin.py'), scene=0, scenes=[dict(nodes=[0])],
         nodes=[dict(name='interior', children=[1]), dict(name='room_S09', mesh=0)], meshes=[dict(name='room_S09', primitives=prims)],
         materials=[dict(name=m, pbrMetallicRoughness=dict(baseColorFactor=list(c) + [1.0], metallicFactor=0.0, roughnessFactor=0.9)) for m, c in MATS.items()],
         accessors=acc, bufferViews=views, buffers=[dict(byteLength=len(bin_))])
js = json.dumps(j, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4)
out = os.path.join(ROOT, 'assets', 'models', 'rome', 'rome_tr_fit_S09.glb')
open(out, 'wb').write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(bin_)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(bin_), 0x004E4942) + bytes(bin_))
print('wrote', os.path.relpath(out, ROOT), sum(len(G[m][0]) for m in MATS) // 3, 'triangles (stand-in)')
