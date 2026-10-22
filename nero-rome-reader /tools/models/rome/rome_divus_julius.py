"""Temple of Divus Julius (rome_divus_julius), AD 56. Origin = centre of the podium, z = 0 = ground, front = -Y.
podium_temple builds the temple, the speaker's platform with its two side flights and the pediment. This script then
cuts the half-round rostra niche with its altar into the platform front, sets six bronze ship rams on the platform
front and puts a gilded star in the front pediment."""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
import bl_kit as K
import bpy
from mathutils import Vector

W, L = 24.0, 30.0
POD_H, COL_H = 5.5, 11.0
NICHE_R = 3.0
NICHE_H = POD_H - 0.45        # height of the platform block under its top band


def orient(pts, pt, toward=True):
    """Reverse a planar polygon if needed so that its normal points toward (or away from) the point pt."""
    p = [Vector(q) for q in pts]
    n = (p[1] - p[0]).cross(p[2] - p[0])
    c = sum(p, Vector()) / len(p)
    if ((Vector(pt) - c).dot(n) < 0) == toward:
        return list(reversed(pts))
    return list(pts)


def orient_dir(pts, d):
    """Reverse a planar polygon if needed so that its normal points along the direction d."""
    p = [Vector(q) for q in pts]
    n = (p[1] - p[0]).cross(p[2] - p[0])
    return list(reversed(pts)) if n.dot(Vector(d)) < 0 else list(pts)


def cut_front_rect(mat, y, x0, x1, z0, z1, tol=1e-3):
    """Cut the rectangle x0..x1 by z0..z1 out of the axis-aligned quads of `mat` lying in the plane y = const.
    Each quad that overlaps the hole is replaced by the pieces around it (winding kept), so the solid stays closed."""
    V, Fa, Sm = K._G[mat]
    keep, split = [], []
    for f, s in zip(Fa, Sm):
        pts = [V[i] for i in f]
        if len(pts) != 4 or any(abs(p[1] - y) > tol for p in pts):
            keep.append((f, s)); continue
        xs = sorted(set(round(p[0], 4) for p in pts)); zs = sorted(set(round(p[2], 4) for p in pts))
        if len(xs) != 2 or len(zs) != 2 or not (x0 < xs[1] - tol and x1 > xs[0] + tol and z0 < zs[1] - tol and z1 > zs[0] + tol):
            keep.append((f, s)); continue
        xa, xb = xs; za, zb = zs
        pieces = []
        if xa < x0 - tol: pieces.append((xa, min(xb, x0), za, zb))
        if x1 + tol < xb: pieces.append((max(xa, x1), xb, za, zb))
        lo, hi = max(xa, x0), min(xb, x1)
        if z0 > za + tol: pieces.append((lo, hi, za, min(zb, z0)))
        if z1 < zb - tol: pieces.append((lo, hi, max(za, z1), zb))
        split.append((pts, pieces))
    K._G[mat][1][:] = [f for f, _ in keep]
    K._G[mat][2][:] = [s for _, s in keep]
    for pts, pieces in split:
        n0 = (Vector(pts[1]) - Vector(pts[0])).cross(Vector(pts[2]) - Vector(pts[0]))
        for (ax, bx, az, bz) in pieces:
            if bx - ax < tol or bz - az < tol:
                continue
            q = [(ax, y, az), (bx, y, az), (bx, y, bz), (ax, y, bz)]
            n1 = (Vector(q[1]) - Vector(q[0])).cross(Vector(q[2]) - Vector(q[0]))
            K.add_poly(mat, list(reversed(q)) if n1.dot(n0) < 0 else q)


def drop_faces(mat, pred):
    """Remove the faces of `mat` for which pred(vertices) is true."""
    if mat not in K._G:
        return
    V, Fa, Sm = K._G[mat]
    keep = [(f, s) for f, s in zip(Fa, Sm) if not pred([V[i] for i in f])]
    K._G[mat][1][:] = [f for f, _ in keep]
    K._G[mat][2][:] = [s for _, s in keep]


def niche(xc, yf, R, H, n=18):
    """Half-round niche cut into the platform front (plane y = yf): a hollow half-cylinder, 2R wide, R deep, H high.
    Its curved walls are peperino; the sector behind the altar is dark."""
    axis = (xc, yf, H / 2)
    for k in range(n):
        t0, t1 = math.pi * k / n, math.pi * (k + 1) / n
        p0 = (xc + R * math.cos(t0), yf + R * math.sin(t0))
        p1 = (xc + R * math.cos(t1), yf + R * math.sin(t1))
        q = [(p0[0], p0[1], 0.0), (p1[0], p1[1], 0.0), (p1[0], p1[1], H), (p0[0], p0[1], H)]
        mat = 'dark' if abs((t0 + t1) / 2 - math.pi / 2) < 0.45 else 'peperino'
        K.add_poly(mat, orient(q, axis, toward=True))


def ram(x, yf, zc=2.5, length=2.5, h=0.8, w=0.5, tip=0.07):
    """Bronze ship ram (rostrum): a tapering beak, 2.5 m long and 0.8 m high, from the platform front at height zc."""
    yb, yt = yf + 0.35, yf - length
    B = [(x - w / 2, yb, zc - h / 2), (x + w / 2, yb, zc - h / 2), (x + w / 2, yb, zc + h / 2), (x - w / 2, yb, zc + h / 2)]
    T = [(x - tip, yt, zc - tip), (x + tip, yt, zc - tip), (x + tip, yt, zc + tip), (x - tip, yt, zc + tip)]
    c = (x, (yb + yt) / 2, zc)
    faces = [B, T] + [[B[i], B[(i + 1) % 4], T[(i + 1) % 4], T[i]] for i in range(4)]
    for f in faces:
        K.add_poly('bronze', orient(f, c, toward=False))


def star(x, y, z, r=1.1, rays=8, r_in=1.15, r_out=1.75, seg=24):
    """Gilded star medallion in the plane y = const, facing -Y: a disc of radius r with short rays."""
    C = (x, y, z)
    ring = [(x + r * math.cos(TAU * i / seg), y, z + r * math.sin(TAU * i / seg)) for i in range(seg)]
    for i in range(seg):
        K.add_poly('gold', [C, ring[i], ring[(i + 1) % seg]])
    for k in range(rays):
        a = TAU * k / rays
        beam(None, x + r_in * math.cos(a), y, z + r_in * math.sin(a),
             x + r_out * math.cos(a), y, z + r_out * math.sin(a), 0.12, 0.22, 'gold')


reset()
bpy.context.scene.eevee.taa_render_samples = 16          # low samples: previews only
F = Frame()
r = COL_H / 20.0
m = r * 1.6 + 0.35                  # column line inset from the podium edge (kit)
ed = r * 2.9                        # entablature depth (kit)
T = podium_temple(F, 0.0, 0.0, W=W, L=L, pod_h=POD_H, col_h=COL_H, nf=6, kind='prostyle', porch=2,
                  order='corinthian', front='-Y', stair='sides', flutes=12)
yf0 = T['front_y']                  # front face of the speaker's platform (kit depth varies)
# the kit puts a marble rostra panel and its lintel across the platform front: the real niche replaces them
drop_faces('marble', lambda pts: all(yf0 - 0.25 <= p[1] <= yf0 + 0.01 and abs(p[0]) <= 5.6 and 1.2 <= p[2] <= 4.5
                                     for p in pts))
cut_front_rect('marble', yf0, -NICHE_R, NICHE_R, 0.0, NICHE_H)
niche(0.0, yf0, NICHE_R, NICHE_H)
lathe(F, 0.0, yf0 + 1.4, [(0.01, 0.0), (1.2, 0.0), (1.2, 0.12), (1.0, 0.22), (1.0, 1.1), (1.15, 1.2),
                          (1.15, 1.3), (1.2, 1.4), (0.01, 1.4)], 'marble', 28)
for x in (-7.2, -5.6, -4.0, 4.0, 5.6, 7.2):
    ram(x, yf0)
y_gable = -((L / 2 - m) + ed / 2)   # front plane of the pediment triangle
star(0.0, y_gable - 0.06, T['eave'] + 1.3)
human(F, -14.0, -22.0, 0.0)
finish('rome_divus_julius', front='-Y')
