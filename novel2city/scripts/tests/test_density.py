#!/usr/bin/env python3
"""python scripts/tests/test_density.py — synthetic aerial: dense terracotta core, sparse edge; the measured core must be denser."""
import json, os, random, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw
here = os.path.dirname(os.path.abspath(__file__)); tmp = tempfile.mkdtemp()
random.seed(3); W, H = 900, 600; im = Image.new('RGB', (W, H), (196, 184, 150)); d = ImageDraw.Draw(im)
for _ in range(2600):
    r = abs(random.gauss(0, 170)); a = random.random() * 6.283; x = 450 + r * np.cos(a) * 1.3; y = 300 + r * np.sin(a)
    if 0 < x < W and 0 < y < H:
        d.rectangle([x, y, x + 9, y + 7], fill=(176, 92, 58) if random.random() < .82 else (232, 228, 214))
img = os.path.join(tmp, 'aerial.png'); im.save(img)
ctl = {"points": [[0, 0, -1800, -1200], [900, 0, 1800, -1200], [900, 600, 1800, 1200], [0, 600, -1800, 1200], [450, 300, 0, 0]],
       "extent": [-1800, -1200, 1800, 1200], "grid": 32, "blend": 0.6,
       "falloff": [[0, 0.73], [400, 0.66], [800, 0.56], [1200, 0.36], [1600, 0.18], [2200, 0.06]]}
c = os.path.join(tmp, 'ctl.json'); json.dump(ctl, open(c, 'w')); out = os.path.join(tmp, 'out.json')
subprocess.check_call([sys.executable, os.path.join(here, '..', 'density_from_reference.py'), img, c, out])
g = np.array(json.load(open(out))['density']); n = g.shape[0]
core = g[n//2-2:n//2+2, n//2-2:n//2+2].mean(); edge = np.concatenate([g[0], g[-1], g[:, 0], g[:, -1]]).mean()
print(f'core {core:.2f} edge {edge:.2f}'); sys.exit(0 if core > edge + .25 else 1)
