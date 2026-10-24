#!/usr/bin/env python3
"""Measure city density from an aerial/model reference image.
Steps: classify pixels (roof / wall / tree) -> grid coverage -> blur -> register to map metres with control points
(homography, DLT) -> sample a world grid -> blend with a distance prior.
Usage: python density_from_reference.py ref.jpg control.json out.json
control.json: {"points": [[px, py, x_m, z_m], ...] (>= 4, spread over the image), "mask": [[x0,y0,x1,y1], ...],
               "extent": [x0, z0, x1, z1], "grid": 64, "blend": 0.6, "falloff": [[0,0.73],[400,0.66],[800,0.56],[1200,0.36],[1600,0.18],[2200,0.06]]}
"""
import sys, json
import numpy as np
from PIL import Image, ImageFilter

def classify(img):
    a = np.asarray(img.convert('RGB')).astype(np.float32) / 255
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    sat = (mx - mn) / (mx + 1e-6)
    roof = (r > g * 1.12) & (r > b * 1.25) & (sat > .22)          # terracotta
    tree = (g > r * 1.02) & (g > b * 1.05) & (mx < .6)             # dark green
    wall = (mx > .62) & (sat < .2)                                  # light plaster
    return roof, wall, tree

def homography(src, dst):
    A = []
    for (x, y), (u, v) in zip(src, dst):
        A += [[-x, -y, -1, 0, 0, 0, u * x, u * y, u], [0, 0, 0, -x, -y, -1, v * x, v * y, v]]
    _, _, vt = np.linalg.svd(np.asarray(A))
    H = vt[-1].reshape(3, 3)
    return H / H[2, 2]

def main(ref, ctl, out):
    c = json.load(open(ctl))
    img = Image.open(ref)
    roof, wall, tree = classify(img)
    m = np.ones(roof.shape, bool)
    for x0, y0, x1, y1 in c.get('mask', []):
        m[y0:y1, x0:x1] = False
    cell = 12
    h, w = roof.shape
    gh, gw = h // cell, w // cell
    cov = roof[:gh * cell, :gw * cell].reshape(gh, cell, gw, cell).mean((1, 3))
    cov = np.asarray(Image.fromarray((cov * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))) / 255
    pts = np.asarray(c['points'], float)
    Hinv = homography(pts[:, 2:4], pts[:, 0:2])            # map metres -> image pixels
    x0, z0, x1, z1 = c['extent']; n = c.get('grid', 64)
    fall = np.asarray(c.get('falloff', [[0, .7], [3000, 0]]), float)
    out_grid = np.zeros((n, n))
    for j in range(n):
        for i in range(n):
            X = x0 + (i + .5) / n * (x1 - x0); Z = z0 + (j + .5) / n * (z1 - z0)
            p = Hinv @ np.array([X, Z, 1.0]); px, py = p[0] / p[2], p[1] / p[2]
            gi, gj = int(px // cell), int(py // cell)
            meas = cov[gj, gi] if 0 <= gi < gw and 0 <= gj < gh and m[min(h - 1, int(py)), min(w - 1, int(px))] else np.nan
            prior = np.interp(np.hypot(X, Z), fall[:, 0], fall[:, 1])
            k = c.get('blend', .6)
            out_grid[j, i] = prior if np.isnan(meas) else k * meas + (1 - k) * prior
    json.dump({'extent': c['extent'], 'n': n, 'density': np.round(out_grid, 3).tolist()}, open(out, 'w'))
    print('wrote', out, 'mean density', round(float(out_grid.mean()), 3))

if __name__ == '__main__':
    main(*sys.argv[1:4])
