"""Arch of Augustus (rome_arch_augustus), 19 BC. Origin = centre of the arch, z = 0 = ground, passages along Y,
front = -Y. Three real through-passages: a central barrel vault 5 m wide and 9 m high and two side vaults 3 m wide
and 6.5 m high, each running the full depth of the arch over one continuous pavement, with coffered soffits
(transverse ribs). Travertine piers with marble facings, marble spandrels and marble archivolts; two Corinthian
columns and a small pediment with a bronze figure over each side passage (both faces); an attic with a marble
inscription panel and the gilded quadriga on top at 14 m."""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
import bl_kit as K
import bpy
from mathutils import Vector

HW, HD = 8.75, 3.0            # half width (x) and half depth (y): 17.5 m x 6 m
BLOCK_H = 9.6                 # top of the block, under the entablature
SKIN = 0.6                    # marble facade in front of the core: also the depth of the recesses
YF = HD + SKIN                # facade plane, 3.6 m from the centre line
ARCH = 0.45                   # archivolt width
SIDE_X = 6.0                  # centre of each side passage
PASSAGES = [(0.0, 2.5, 6.5), (-SIDE_X, 1.5, 5.0), (SIDE_X, 1.5, 5.0)]   # (centre x, radius, springing z)
RIB_T = 0.3                   # depth of the coffer ribs on each vault soffit
RIB_Y = (-2.4, 0.0, 2.4)      # positions of the ribs along each vault


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


def outline(xc, zs, R, n=12):
    """Arched outline in the XZ plane: bottom left, springing, arc over the top, bottom right (n+3 points)."""
    pts = [(xc - R, 0.0)]
    for k in range(n + 1):
        t = math.pi - math.pi * k / n
        pts.append((xc + R * math.cos(t), zs + R * math.sin(t)))
    pts.append((xc + R, 0.0))
    return pts


def archivolt(xc, zs, r_in, sgn, n=12):
    """Marble archivolt of width ARCH round an arched opening (radius r_in, springing zs), standing 0.25 m out of
    the facade on the side sgn (-1 = front, +1 = back) and lining the reveal."""
    yF, yR = sgn * (YF + 0.25), sgn * YF
    A = outline(xc, zs, r_in, n)
    B = outline(xc, zs, r_in + ARCH, n)
    axis = (xc, (yF + yR) / 2, zs)
    for i in range(len(A) - 1):
        a0, a1, b0, b1 = A[i], A[i + 1], B[i], B[i + 1]
        front = [(a0[0], yF, a0[1]), (a1[0], yF, a1[1]), (b1[0], yF, b1[1]), (b0[0], yF, b0[1])]
        K.add_poly('marble', orient_dir(front, (0, sgn, 0)))
        inner = [(a0[0], yF, a0[1]), (a1[0], yF, a1[1]), (a1[0], yR, a1[1]), (a0[0], yR, a0[1])]
        K.add_poly('marble', orient(inner, axis, toward=True))
        outer = [(b0[0], yF, b0[1]), (b1[0], yF, b1[1]), (b1[0], yR, b1[1]), (b0[0], yR, b0[1])]
        K.add_poly('marble', orient(outer, axis, toward=False))


def tri_prism_xz(x0, x1, z0, h, y0, y1, mat):
    """Triangular prism (a small pediment): base x0..x1 at z0, apex over the middle, height h, from y0 to y1."""
    xm = (x0 + x1) / 2
    A = [(x0, y0, z0), (x1, y0, z0), (xm, y0, z0 + h)]
    B = [(x0, y1, z0), (x1, y1, z0), (xm, y1, z0 + h)]
    c = (xm, (y0 + y1) / 2, z0 + h / 3)
    for f in (A, B[::-1], [A[0], A[1], B[1], B[0]], [A[1], A[2], B[2], B[1]], [A[2], A[0], B[0], B[2]]):
        K.add_poly(mat, orient(f, c, toward=False))


def arc_pts(xc, zs, R, a0, a1, n):
    """n+1 points on the circle of radius R about (xc, zs) in the XZ plane, from angle a0 to a1 (radians)."""
    return [(xc + R * math.cos(a0 + (a1 - a0) * k / n), zs + R * math.sin(a0 + (a1 - a0) * k / n)) for k in range(n + 1)]


def xz_prism(poly, y0, y1, mat):
    """A convex polygon given in XZ, extruded from y0 to y1 into a closed solid."""
    n = len(poly)
    A = [(x, y0, z) for x, z in poly]
    B = [(x, y1, z) for x, z in poly]
    c = (sum(p[0] for p in poly) / n, (y0 + y1) / 2, sum(p[1] for p in poly) / n)
    faces = [A, B[::-1]] + [[A[i], A[(i + 1) % n], B[(i + 1) % n], B[i]] for i in range(n)]
    for f in faces:
        K.add_poly(mat, orient(f, c, toward=False))


def pier(x0, x1, z0, z1):
    """A pier beside or between the passages: travertine core with a marble facing on the front and the back."""
    xc = (x0 + x1) / 2
    box(F, xc, 0, z0, x1 - x0, 2 * HD, z1 - z0, 'travertine')
    for sy in (-1, 1):
        box(F, xc, sy * (HD + SKIN / 2), z0, x1 - x0, SKIN, z1 - z0, 'marble')


def spandrel(xc, r, zs, zt, n=12):
    """Solid above one vault, full depth of the arch: the box over the crown and two fans of triangles filling the
    corners between the arc and the crown level. The arc is the vault soffit."""
    crown = zs + r
    box(F, xc, 0, crown, 2 * r, 2 * YF, zt - crown, 'marble')
    for a0, a1, cx in ((math.pi, math.pi / 2, xc - r), (math.pi / 2, 0.0, xc + r)):
        arc = arc_pts(xc, zs, r, a0, a1, n)
        for i in range(n):
            xz_prism([(cx, crown), arc[i], arc[i + 1]], -YF, YF, 'marble')


def coffers(xc, r, zs, n=12):
    """Transverse ribs across the vault soffit; the panels between them are the coffers."""
    out = arc_pts(xc, zs, r + 0.05, math.pi, 0.0, n)
    inn = arc_pts(xc, zs, r - RIB_T, math.pi, 0.0, n)
    for yc in RIB_Y:
        for i in range(n):
            xz_prism([out[i], out[i + 1], inn[i + 1], inn[i]], yc - 0.25, yc + 0.25, 'marble')


reset()
bpy.context.scene.eevee.taa_render_samples = 16          # low samples: previews only
F = Frame()

# piers beside and between the passages, then the solid above each vault with its coffered soffit
for x0, x1 in ((-HW, -7.5), (-4.5, -2.5), (2.5, 4.5), (7.5, HW)):
    pier(x0, x1, 0.0, BLOCK_H)
for xc, r, zs in PASSAGES:
    spandrel(xc, r, zs, BLOCK_H)
    coffers(xc, r, zs)
# one continuous pavement under and beyond the passages
box(F, 0, 0, -0.25, 2 * HW, 2 * (YF + 0.9), 0.25, 'paving')

# entablature, archivolts
box(F, 0, 0, BLOCK_H, 18.0, 8.0, 0.7, 'marble')
for sgn in (-1, 1):
    archivolt(0.0, 6.5, 2.5, sgn)
    for xc in (-SIDE_X, SIDE_X):
        archivolt(xc, 5.0, 1.5, sgn)

# side passages: two Corinthian columns on each face, an entablature, a small pediment and a bronze figure
for sy in (-1, 1):
    yc = sy * (YF + 0.36)
    for x in (-8.36, -3.64, 3.64, 8.36):
        column(F, x, yc, 0.0, 7.0, 0.36, 'marble', 'corinthian', 0, 12)
    for xs in (-SIDE_X, SIDE_X):
        box(F, xs, yc, 7.0, 5.44, 0.8, 0.5, 'marble')
        tri_prism_xz(xs - 2.72, xs + 2.72, 7.5, 0.7, yc - 0.4, yc + 0.4, 'marble')
        statue(F, xs, yc, 8.0, 1.5, 'bronze', pedestal=0.0)

# attic with the inscription panel, cornice, and the gilded quadriga at 14 m
box(F, 0, 0, 10.3, 14.0, 5.6, 3.4, 'travertine')
box(F, 0, -2.84, 11.0, 4.8, 0.08, 1.8, 'marble')
box(F, 0, 0, 13.7, 15.4, 6.2, 0.3, 'marble')
quadriga(F, 0.0, 0.0, 14.0, s=1.3, mat='gold', front='-Y')

human(F, -12.5, -6.0, 0.0)
finish('rome_arch_augustus', front='-Y')
