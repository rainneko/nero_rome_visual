"""rome_theatre_scaena · stage building, stage and main entrances shared by the three stone theatres of Rome.

Brief: briefs/rome/theatre_scaena.md (model at the size of the Theatre of Marcellus, R = 62, h = 32).
Frame: origin = centre of the orchestra, z = 0 = orchestra floor. The cavea (drawn by the page, not here) lies toward
+Y: a half ring r 18.6 .. 62 with its straight end walls on y = 0. The stage building lies toward -Y; its back facade
(the main entrance) faces -Y.

  stage (pulpitum)   x +-41, y -3 .. +6.8, top z 1.6: wooden floor, niched front wall, two inset stairs, aulaeum slot
  scaenae frons      on y -3, x +-43: two storeys of coloured columns on projecting pedestals, central door in a
                     curved recess, two guest doors, three upper openings, statues, red curtains
  stage roof         x +-44, underside from z 21 at y -3 down to z 19 at y +6.6, coffered (wood) below, tiled above
  scaena             x +-58, y -3 .. -15, walls to z 28, hip tile roof; versurae x +-43 .. +-58 project to y -0.15
                     with a door onto the stage and a tribunal box (z 9) above it
  aditus maximi      vaulted passages from the gateways (x +-58 .. +-62, y -7.5 .. -0.15, arch 4 x 7 m, pilasters,
                     pediment, outer face on x +-62) through the base of the versurae to the stage ends
  back facade        y -15: three storeys of arches and pilasters; central half-round porch of 8 red columns on a
                     stepped podium with a half-conical tile roof (to y -24) before a bronze double door; pedimented
                     wings at x +-30 (to y -21.5) with three arched doors and a flight of steps; lions at the porch

The preview-only cavea stand-in (half ring r 18.6 .. 62, seats from z 1.2 to 30, outer wall to 32) is built after the
export as a separate object and is never in the GLB.
"""
import os, sys, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                     # noqa: F401,F403
import bl_kit as _bk
import bpy
from mathutils import Vector

NAME = 'rome_theatre_scaena'
F = Frame()
PI = math.pi

# ---------------------------------------------------------------- key dimensions
XS, YSB, YSF, ZS = 41.0, -3.0, 6.8, 1.6        # stage half width, back, front, top
YF = -3.0                                      # face of the scaenae frons
YL = -3.8                                      # back of the frons layer = front of the scaena core
XV = 43.0                                      # inner face of the versurae (= ends of the frons)
XC = 57.5                                      # scaena core half width (skins to 58.0)
YB = -14.5                                     # back face of the core (skin to -15.0)
YV = -0.15                                     # front of the versurae (just behind the cavea end walls on y 0)
ZW = 28.0                                      # wall top
XG = 62.0                                      # outer face of the aditus gateways
# scaenae frons orders
Z_PED1, Z_COL1, H_COL1, R_COL1 = 1.6, 2.6, 8.6, 0.42
Z_ENT1, H_ENT1 = 11.2, 1.0
Z_PED2, Z_COL2, H_COL2, R_COL2 = 12.2, 12.8, 6.6, 0.32
Z_ENT2, H_ENT2 = 19.4, 0.75
ROOF_LO, ROOF_HI, ROOF_T = 19.0, 21.0, 0.35    # stage roof underside at y +6.6 / y -3, slab thickness
AED = (4.5, 12.0, 20.0, 28.0, 36.0)            # aediculae axes (x > 0, mirrored)
HOSP = 16.0                                    # guest doors axis


# ---------------------------------------------------------------- helpers
_ribs_kit = _bk._ribs


def _ribs_sparse(mat, eave_a, eave_b, run_vec, rise, spacing, lens, w=0.17, hgt=0.09):
    """Tile ribs every ~1 m instead of 0.62 m (keeps the model in its triangle budget)."""
    return _ribs_kit(mat, eave_a, eave_b, run_vec, rise, spacing * 1.6, lens, w * 1.3, hgt)


_bk._ribs = _ribs_sparse


def fig(x, y, z0, h=2.0, mat='marble', pedestal=0.0, ped_mat='marble'):
    """A light standing statue (robe, torso, head, raised arm) on an optional pedestal."""
    if pedestal > 0:
        box(F, x, y, z0, h * 0.42, h * 0.42, pedestal * 0.15, ped_mat)
        box(F, x, y, z0 + pedestal * 0.15, h * 0.34, h * 0.34, pedestal * 0.85, ped_mat)
    zb = z0 + pedestal
    cyl(F, x, y, zb, h * 0.17, h * 0.55, mat, 8, r_top=h * 0.11)
    cyl(F, x, y, zb + h * 0.55, h * 0.11, h * 0.25, mat, 8, r_top=h * 0.13)
    sphere(F, x, y, zb + h * 0.88, h * 0.075, mat, 6, 4)
    beam(F, x, y + h * 0.1, zb + h * 0.74, x + h * 0.12, y + h * 0.2, zb + h * 0.98, h * 0.06, h * 0.06, mat)


def opoly(mat, pts, out):
    """Polygon whose normal points along `out` (Newell normal, order flipped if needed)."""
    P = [Vector(p) for p in pts]
    n = Vector((0.0, 0.0, 0.0))
    for i in range(len(P)):
        a, b = P[i], P[(i + 1) % len(P)]
        n.x += (a.y - b.y) * (a.z + b.z); n.y += (a.z - b.z) * (a.x + b.x); n.z += (a.x - b.x) * (a.y + b.y)
    if n.dot(Vector(out)) < 0:
        P.reverse()
    add_poly(mat, P)


def mark():
    return {m: (len(V), len(Fa)) for m, (V, Fa, Sm) in _bk._G.items()}


def mirror_from(mk):
    """Add a copy (x -> -x, winding reversed) of every face added since the mark mk."""
    for m, (V, Fa, Sm) in list(_bk._G.items()):
        v0, f0 = mk.get(m, (0, 0))
        nv, nf, ns = V[v0:], Fa[f0:], Sm[f0:]
        if not nf:
            continue
        o = len(V)
        V.extend([(-x, y, z) for (x, y, z) in nv])
        for f, s in zip(nf, ns):
            Fa.append(tuple(o + (i - v0) for i in reversed(f))); Sm.append(s)


def skin(x0, y0, x1, y1, z0, h, ops, mat='travertine', depth=0.5, caps=(True, True)):
    """opening_skin on the outside (right) of the line p0 -> p1, with its two ends closed."""
    opening_skin(F, x0, y0, x1, y1, z0, h, ops, mat, depth=depth)
    L = math.hypot(x1 - x0, y1 - y0); ux, uy = (x1 - x0) / L, (y1 - y0) / L
    nx, ny = uy, -ux; dd = depth + 0.01
    for (px, py, sg), cp in zip(((x0, y0, -1.0), (x1, y1, 1.0)), caps):
        if cp:
            opoly(mat, [(px, py, z0), (px + nx * dd, py + ny * dd, z0), (px + nx * dd, py + ny * dd, z0 + h), (px, py, z0 + h)],
                  (ux * sg, uy * sg, 0.0))


def slab_holes(xa, xb, ya, yb, z0, z1, holes, mat):
    """A slab x xa..xb, y ya..yb, z z0..z1 built of boxes around rectangular holes (hx0, hx1, hz0, hz1)."""
    xs = sorted(set([xa, xb] + [h[0] for h in holes] + [h[1] for h in holes]))
    for i in range(len(xs) - 1):
        u0, u1 = xs[i], xs[i + 1]
        if u1 - u0 < 1e-4:
            continue
        cov = sorted([(h[2], h[3]) for h in holes if h[0] <= u0 + 1e-6 and h[1] >= u1 - 1e-6])
        z = z0
        for (za, zb) in cov + [(z1, z1)]:
            if za - z > 1e-4:
                box(F, (u0 + u1) / 2, (ya + yb) / 2, z, u1 - u0, yb - ya, za - z, mat)
            z = max(z, zb)


def ocol(x, y, z0, h, r, shaft, cap='marble', order='corinthian', seg=10):
    """Column with a white base and capital and a coloured shaft."""
    ph = r * 0.55
    box(F, x, y, z0, r * 2.5, r * 2.5, ph * 0.5, cap)
    cyl(F, x, y, z0 + ph * 0.5, r * 1.2, ph * 0.5, cap, seg, r_top=r * 1.02)
    column(F, x, y, z0 + ph, h - ph, r, shaft, order, 0, seg, base=False, cap_mat=cap)


def curtain(Fr, xa_t, xb_t, xa_b, xb_b, y, z_top, z_bot, folds=4, amp=0.12, mat='cloth'):
    """A hanging curtain with vertical folds in frame Fr: spread xa_t..xb_t at the top, gathered to xa_b..xb_b at the
    bottom, both faces (the back face 3 cm behind so the two never merge)."""
    n = folds * 2
    for off, flip in ((0.0, False), (0.03, True)):
        T = []; B = []
        for k in range(n + 1):
            t = k / n; dy = (amp if k % 2 else -amp) + off
            T.append(Fr.p(xa_t + (xb_t - xa_t) * t, y + dy, z_top))
            B.append(Fr.p(xa_b + (xb_b - xa_b) * t, y + dy, z_bot))
        for k in range(n):
            q = [B[k], B[k + 1], T[k + 1], T[k]]
            add_poly(mat, q[::-1] if flip else q)


def half_disc_prism(cx, cy, r, z0, z1, mat, seg=24):
    """Half disc on the -Y side of (cx, cy), extruded z0..z1."""
    pts = [(cx + r * math.cos(PI + PI * i / seg), cy + r * math.sin(PI + PI * i / seg)) for i in range(seg + 1)]
    prism(F, pts, z0, z1, mat)


def half_ring(cx, cy, r_in, r_out, z0, z1, mat, seg=16):
    """Half annulus on the -Y side of (cx, cy) from z0 to z1 (outer, inner, top and bottom faces)."""
    for i in range(seg):
        a0, a1 = PI + PI * i / seg, PI + PI * (i + 1) / seg
        o0 = (cx + r_out * math.cos(a0), cy + r_out * math.sin(a0)); o1 = (cx + r_out * math.cos(a1), cy + r_out * math.sin(a1))
        i0 = (cx + r_in * math.cos(a0), cy + r_in * math.sin(a0)); i1 = (cx + r_in * math.cos(a1), cy + r_in * math.sin(a1))
        am = (a0 + a1) / 2; ro = (math.cos(am), math.sin(am), 0.0)
        opoly(mat, [(o0[0], o0[1], z0), (o1[0], o1[1], z0), (o1[0], o1[1], z1), (o0[0], o0[1], z1)], ro)
        opoly(mat, [(i0[0], i0[1], z0), (i1[0], i1[1], z0), (i1[0], i1[1], z1), (i0[0], i0[1], z1)], (-ro[0], -ro[1], 0))
        opoly(mat, [(o0[0], o0[1], z1), (o1[0], o1[1], z1), (i1[0], i1[1], z1), (i0[0], i0[1], z1)], (0, 0, 1))
        opoly(mat, [(o0[0], o0[1], z0), (o1[0], o1[1], z0), (i1[0], i1[1], z0), (i0[0], i0[1], z0)], (0, 0, -1))


def half_cone(cx, cy, z0, r, h, mat='tile', seg=16, rib_mat='tile2', soffit='wood'):
    """Half-conical roof on the -Y side of (cx, cy) (apex at the wall), tile ribs, flat soffit below."""
    ap = Vector((cx, cy, z0 + h))
    ring = [Vector((cx + r * math.cos(PI + PI * i / seg), cy + r * math.sin(PI + PI * i / seg), z0)) for i in range(seg + 1)]
    for i in range(seg):
        m = (ring[i] + ring[i + 1]) / 2
        opoly(mat, [ring[i], ring[i + 1], ap], (m.x - cx, m.y - cy, r / max(h, 0.1)))
    opoly(soffit, ring, (0, 0, -1))
    for i in range(seg * 2):
        a = PI + PI * (i + 0.5) / (seg * 2)
        p = Vector((cx + r * 0.99 * math.cos(a), cy + r * 0.99 * math.sin(a), z0 + 0.06)); q = p + (ap - p) * 0.88
        beam(None, p.x, p.y, p.z, q.x, q.y, q.z + 0.05, 0.16, 0.1, rib_mat)


def lion(x, y, z0, s=1.0, rot=0.0, mat='marble'):
    """A recumbent lion (~2.6 m long at s = 1) facing local -y."""
    S = F.sub(x, y, z0, rot)
    beam(S, 0, 0.85 * s, 0.42 * s, 0, -0.45 * s, 0.5 * s, 0.62 * s, 0.6 * s, mat)               # body
    sphere(S, 0, 0.72 * s, 0.45 * s, 0.42 * s, mat, 7, 4)                                         # haunch
    sphere(S, 0, -0.55 * s, 0.8 * s, 0.47 * s, mat, 7, 5, z_scale=1.1)                            # mane
    box(S, 0, -0.95 * s, 0.9 * s, 0.42 * s, 0.38 * s, 0.42 * s, mat)                               # head
    box(S, 0, -1.2 * s, 0.92 * s, 0.26 * s, 0.2 * s, 0.22 * s, mat)                                # muzzle
    for sd in (-1, 1):
        beam(S, sd * 0.2 * s, -0.5 * s, 0.11 * s, sd * 0.2 * s, -1.4 * s, 0.11 * s, 0.2 * s, 0.22 * s, mat)   # forelegs
        beam(S, sd * 0.3 * s, 0.55 * s, 0.13 * s, sd * 0.3 * s, -0.15 * s, 0.13 * s, 0.22 * s, 0.26 * s, mat)  # hind legs
    beam(S, 0.28 * s, 1.15 * s, 0.1 * s, 0.42 * s, 0.25 * s, 0.07 * s, 0.09 * s, 0.09 * s, mat)               # tail


def ped(x, y, z0, w, d, h, mat='marble', die='marble'):
    """A pedestal: base, die, cap."""
    box(F, x, y, z0, w + 0.2, d + 0.2, 0.18, mat)
    box(F, x, y, z0 + 0.18, w, d, h - 0.36, die)
    box(F, x, y, z0 + h - 0.18, w + 0.2, d + 0.2, 0.18, mat)


# ================================================================ 1. stage (pulpitum)
def build_stage():
    # body of the stage with a wooden top; two inset stairs at x +-12 (slots 11.1 .. 12.9) reach back to y 4.0
    SX0, SX1, YST = 11.1, 12.9, 4.0
    for (a, b) in ((-XS, -SX1), (-SX0, SX0), (SX1, XS)):
        box(F, (a + b) / 2, (YSB + 6.0) / 2, 0, b - a, 6.0 - YSB, ZS, 'wood')
    for sd in (-1, 1):
        box(F, sd * (SX0 + SX1) / 2, (YSB + YST) / 2, 0, SX1 - SX0, YST - YSB, ZS, 'wood')
        for i in range(8):                                     # 8 steps, rise 0.2, run 0.35, y 6.8 -> 4.0
            yf = YSF - 0.35 * i
            box(F, sd * (SX0 + SX1) / 2, (YST + yf) / 2, 0, SX1 - SX0, yf - YST, 0.2 * (i + 1), 'marble')
    # landings at the stage ends in front of the versura doors (x 41 .. 43, y -3 .. -0.15)
    for sd in (-1, 1):
        box(F, sd * (XS + XV) / 2, (YSB + YV) / 2, 0, XV - XS + 0.02, YV - YSB, ZS, 'wood')
    # proscaenium front wall y 6.0 .. 6.8, z 0 .. 1.3 with alternating curved and rectangular niches
    NICHES = [(0.0, 'c', 0.8), (3.0, 'r', 0.65), (6.2, 'c', 0.8), (9.0, 'r', 0.6), (15.0, 'c', 0.8)]
    N = []
    for (c, k, a) in NICHES:
        N.append((c, k, a))
        if c > 0:
            N.append((-c, k, a))
    edges = sorted(set([-XS, XS, -SX1, -SX0, SX0, SX1] + [c - a for c, k, a in N] + [c + a for c, k, a in N]))
    zb, zt, ztop = 0.25, 1.25, 1.3
    for i in range(len(edges) - 1):
        u0, u1 = edges[i], edges[i + 1]
        um = (u0 + u1) / 2
        if SX0 <= abs(um) <= SX1:
            continue                                            # stair slot
        nn = [n for n in N if n[0] - n[2] - 1e-6 <= u0 and u1 <= n[0] + n[2] + 1e-6]
        if not nn:
            box(F, um, 6.4, 0, u1 - u0, 0.8, ztop, 'marble')
            continue
        c, k, a = nn[0]
        box(F, um, 6.4, 0, u1 - u0, 0.8, zb, 'marble')
        box(F, um, 6.4, zt, u1 - u0, 0.8, ztop - zt, 'marble')
        if k == 'r':
            box(F, um, 6.175, zb, u1 - u0, 0.35, zt - zb, 'red')                # niche back (0.45 deep)
        else:
            seg = 8
            pts = [(c + a * math.cos(PI + PI * j / seg), YSF + a * math.sin(PI + PI * j / seg)) for j in range(seg + 1)]
            for j in range(seg):
                (ax, ay), (bx, by) = pts[j], pts[j + 1]
                opoly('red', [(ax, ay, zb), (bx, by, zb), (bx, by, zt), (ax, ay, zt)], (c - (ax + bx) / 2, YSF - (ay + by) / 2, 0))
            opoly('marble', [(x, y, zb) for x, y in pts], (0, 0, 1))
            opoly('marble', [(x, y, zt) for x, y in pts], (0, 0, -1))
    # base moulding, coping and the aulaeum slot (a dark strip 0.4 m wide behind the coping), all cut at the stairs
    for (a, b) in ((-XS, -SX1), (-SX0, SX0), (SX1, XS)):
        box(F, (a + b) / 2, 6.875, 0, b - a, 0.15, 0.2, 'marble')
        box(F, (a + b) / 2, 6.62, ztop, b - a, 0.62, ZS - ztop, 'marble')       # coping y 6.31 .. 6.93
        box(F, (a + b) / 2, 6.155, ztop, b - a, 0.31, 0.22, 'dark')             # slot y 6.0 .. 6.31, top 1.52


# ================================================================ 2. scaena core, frons layer, royal exedra
def build_core():
    # core: x +-57.5, y -14.5 .. -3.8, z 0 .. 28, with the royal exedra hole x +-2.5, y -5.5 .. -3.8, z 1.6 .. 10.6
    box(F, -(XC + 2.5) / 2, (YB + YL) / 2, 0, XC - 2.5, YL - YB, ZW, 'travertine')
    box(F, (XC + 2.5) / 2, (YB + YL) / 2, 0, XC - 2.5, YL - YB, ZW, 'travertine')
    box(F, 0, (YB - 5.5) / 2, 0, 5.0, -5.5 - YB, ZW, 'travertine')
    box(F, 0, (-5.5 + YL) / 2, 0, 5.0, YL + 5.5, ZS, 'travertine')
    box(F, 0, (-5.5 + YL) / 2, 10.6, 5.0, YL + 5.5, ZW - 10.6, 'travertine')
    # frons layer y -3.8 .. -3.0 with door and window holes
    holes = [(-2.5, 2.5, ZS, 10.6),                                       # royal exedra (arched)
             (-1.6, 1.6, 13.2, 18.4)]                                     # central upper opening
    for sd in (-1, 1):
        holes.append(tuple(sorted((sd * (HOSP - 1.5), sd * (HOSP + 1.5)))) + (ZS, 7.2))     # guest doors
        holes.append(tuple(sorted((sd * (HOSP - 1.0), sd * (HOSP + 1.0)))) + (13.2, 17.6))  # upper side openings
    slab_holes(-XV - 0.6, XV + 0.6, YL, YF, 0.0, ZW, holes, 'marble')
    for (a, b, za, zb2) in holes[1:]:
        box(F, (a + b) / 2, YL + 0.03, za, b - a, 0.04, zb2 - za, 'dark')
    # royal door: spandrels above the arch (springing 8.1, crown 10.6) on the frons face
    zs, r = 8.1, 2.5
    for sd in (-1, 1):
        corner = (sd * r, YF, 10.6)
        arc = [(sd * r * math.cos(PI / 2 * j / 8), YF, zs + r * math.sin(PI / 2 * j / 8)) for j in range(9)]
        for j in range(8):
            opoly('marble', [corner, arc[j], arc[j + 1]], (0, 1, 0))
    # exedra: half cylinder r 2.5 centred (0, -3), z 1.6 .. 8.1, quarter dome to 10.6, floor
    seg = 12
    pts = [(r * math.cos(PI + PI * i / seg), YF + r * math.sin(PI + PI * i / seg)) for i in range(seg + 1)]
    for i in range(seg):
        (ax, ay), (bx, by) = pts[i], pts[i + 1]
        opoly('marble', [(ax, ay, ZS), (bx, by, ZS), (bx, by, zs), (ax, ay, zs)], (-(ax + bx) / 2, YF - (ay + by) / 2, 0))
    J = 5
    for j in range(J):
        p0, p1 = PI / 2 * j / J, PI / 2 * (j + 1) / J
        r0, r1 = r * math.cos(p0), r * math.cos(p1); z0, z1 = zs + r * math.sin(p0), zs + r * math.sin(p1)
        for i in range(seg):
            a0, a1 = PI + PI * i / seg, PI + PI * (i + 1) / seg
            A = (r0 * math.cos(a0), YF + r0 * math.sin(a0), z0); B = (r0 * math.cos(a1), YF + r0 * math.sin(a1), z0)
            C = (r1 * math.cos(a1), YF + r1 * math.sin(a1), z1); D = (r1 * math.cos(a0), YF + r1 * math.sin(a0), z1)
            mid = ((A[0] + C[0]) / 2, (A[1] + C[1]) / 2, (A[2] + C[2]) / 2)
            out = (-mid[0], YF - mid[1], zs - mid[2])
            opoly('giallo' if j >= 3 else 'marble', [A, B, D] if r1 < 1e-3 else [A, B, C, D], out)
    opoly('marble', [(x, y, ZS + 0.01) for x, y in pts], (0, 0, 1))
    # royal door at the back of the exedra: dark panel, marble frame, bronze leaves ajar, curtains in the mouth
    box(F, 0, -5.2, ZS, 2.4, 0.04, 6.2, 'dark')
    for sd in (-1, 1):
        box(F, sd * 1.35, -5.15, ZS, 0.3, 0.2, 6.5, 'marble')
        box(F, sd * 0.78, -4.73, ZS, 0.08, 1.2, 6.1, 'bronze', rot=sd * 45.0)            # leaves standing open
    box(F, 0, -5.15, ZS + 6.2, 3.0, 0.2, 0.35, 'marble')
    curtain(F, -2.45, -0.7, -2.45, -1.75, -3.4, zs, ZS + 0.02, 4, 0.11)
    curtain(F, 0.7, 2.45, 1.75, 2.45, -3.4, zs, ZS + 0.02, 4, 0.11)
    curtain(F, -2.45, 2.45, -2.45, 2.45, -3.25, zs, zs - 0.7, 8, 0.08)          # valance under the arch
    # guest doors and upper openings: marble frames and red curtains
    mk = mark()
    x0, x1 = HOSP - 1.5, HOSP + 1.5
    for xx in (x0 - 0.15, x1 + 0.15):
        box(F, xx, YF + 0.1, ZS, 0.3, 0.2, 5.6, 'marble')
    box(F, HOSP, YF + 0.1, 7.2, 3.6, 0.2, 0.5, 'marble')
    curtain(F, x0 + 0.05, HOSP - 0.15, x0 + 0.05, x0 + 0.6, -3.35, 7.15, ZS + 0.02, 4, 0.1)
    curtain(F, HOSP + 0.15, x1 - 0.05, x1 - 0.6, x1 - 0.05, -3.35, 7.15, ZS + 0.02, 4, 0.1)
    curtain(F, x0 + 0.05, x1 - 0.05, x0 + 0.05, x1 - 0.05, -3.2, 7.15, 6.55, 6, 0.07)
    curtain(F, HOSP - 0.95, HOSP + 0.95, HOSP - 0.95, HOSP - 0.45, -3.4, 17.55, 13.25, 4, 0.08)
    box(F, HOSP, YF + 0.15, 13.0, 2.4, 0.3, 0.2, 'marble')
    mirror_from(mk)
    curtain(F, -1.55, 1.55, 1.0, 1.55, -3.4, 18.35, 13.25, 5, 0.09)
    box(F, 0, YF + 0.15, 13.0, 3.6, 0.3, 0.2, 'marble')


# ================================================================ 3. scaenae frons orders
def build_frons():
    mk = mark()
    for c in AED:
        # lower storey: pedestal (red die), two porphyry columns, entablature breaking forward
        ped(c, -1.95, Z_PED1, 3.5, 2.1, Z_COL1 - Z_PED1, 'marble', 'red')
        for dx in (-1.1, 1.1):
            ocol(c + dx, -1.7, Z_COL1, H_COL1, R_COL1, 'porphyry', 'marble', 'corinthian', 8)
            box(F, c + dx, YF + 0.15, Z_COL1, 0.75, 0.3, H_COL1, 'marble')                 # pilaster behind
        entablature(F, c - 1.75, -1.95, c + 1.75, -1.95, Z_ENT1, H_ENT1, 2.1, 'marble', 'red')
        # upper storey: pedestal, two giallo columns, a statue between them, entablature
        ped(c, -2.2, Z_PED2, 3.0, 1.6, Z_COL2 - Z_PED2, 'marble', 'marble')
        for dx in (-0.9, 0.9):
            ocol(c + dx, -2.15, Z_COL2, H_COL2, R_COL2, 'giallo', 'marble', 'corinthian', 8)
        fig(c, -2.15, Z_COL2, 2.4, 'marble', 0.3)
        box(F, c, YF + 0.04, Z_COL2 + 0.1, 1.0, 0.08, 4.6, 'porphyry')                  # dark ground behind the statue
        entablature(F, c - 1.45, -2.2, c + 1.45, -2.2, Z_ENT2, H_ENT2, 1.6, 'marble', 'giallo')
    # painted panels between the aediculae (giallo frame, red field)
    for (xc, w) in ((8.25, 2.6), (24.0, 2.8), (32.0, 2.8), (40.3, 2.6)):
        box(F, xc, YF + 0.03, 3.2, w + 0.3, 0.06, 6.9, 'giallo')
        box(F, xc, YF + 0.07, 3.35, w, 0.06, 6.6, 'red')
    for (xc, w) in ((8.25, 3.0), (24.0, 3.4), (32.0, 3.4), (40.3, 2.6)):
        box(F, xc, YF + 0.03, 13.4, w + 0.3, 0.06, 5.2, 'giallo')
        box(F, xc, YF + 0.07, 13.55, w, 0.06, 4.9, 'porphyry')
    # attic above the stage roof (z 21 .. 28): pilasters on the aedicula axes and red panels between
    for xp in (0.0,) + AED + (XV - 0.4,):
        if xp == 0.0:
            continue
        box(F, xp, YF + 0.15, 20.6, 0.8, 0.3, 6.6, 'marble')
    for (a, b) in ((0.4, 4.1), (4.9, 11.6), (12.4, 19.6), (20.4, 27.6), (28.4, 35.6), (36.4, 42.2)):
        box(F, (a + b) / 2, YF + 0.03, 22.4, b - a - 0.6, 0.06, 4.0, 'red')
    mirror_from(mk)
    box(F, 0.0, YF + 0.15, 20.6, 0.8, 0.3, 6.6, 'marble')
    # continuous wall entablatures and the top cornice
    entablature(F, -XV - 0.6, -2.7, XV + 0.6, -2.7, Z_ENT1, H_ENT1, 0.6, 'marble', 'red')
    entablature(F, -XV - 0.6, -2.75, XV + 0.6, -2.75, Z_ENT2, H_ENT2, 0.5, 'marble', 'giallo')
    cornice(F, XV + 0.6, YF, -XV - 0.6, YF, 27.64, 0.8, 0.8, 'marble')
    band(F, XV + 0.6, YF, -XV - 0.6, YF, 21.4, 0.3, 0.25, 'marble')
    # statues on the roof line: two lions and a gilt figure
    for sd in (-1, 1):
        ped(sd * 22.0, -2.5, 27.96, 1.3, 1.6, 1.1, 'marble', 'marble')
        lion(sd * 22.0, -2.6, 29.06, 0.9, 180.0, 'marble')
    ped(0.0, -2.5, 27.96, 1.4, 1.4, 1.2, 'marble', 'marble')
    fig(0.0, -2.5, 29.16, 3.4, 'gold')


# ================================================================ 4. stage roof
def build_stage_roof():
    X = 44.0; y0, y1 = YF, 6.6
    lo = [Vector((-X, y0, ROOF_HI)), Vector((X, y0, ROOF_HI)), Vector((X, y1, ROOF_LO)), Vector((-X, y1, ROOF_LO))]
    hi = [v + Vector((0, 0, ROOF_T)) for v in lo]
    opoly('tile', hi, (0, 0, 1))
    opoly('wood', lo, (0, 0, -1))
    for i in range(4):
        a, b = lo[i], lo[(i + 1) % 4]; A, B = hi[i], hi[(i + 1) % 4]
        mid = (a + b) / 2
        opoly('wood', [a, b, B, A], (mid.x / max(abs(mid.x), 1e-3) if abs(mid.x) > 1 else 0, (mid.y - 1.8), 0))
    # tile ribs (every 0.9 m) and a lead flashing against the frons
    _bk._ribs('tile2', hi[3], hi[2], Vector((0, -1, 0)) * (y1 - y0), ROOF_HI - ROOF_LO, 0.62, lambda u: (y1 - y0) * 0.97)
    beam(F, -X, y0 + 0.15, ROOF_HI + ROOF_T + 0.05, X, y0 + 0.15, ROOF_HI + ROOF_T + 0.05, 0.3, 0.12, 'lead')
    # coffers below: joists along y, cross beams along x, a fascia beam at the front
    sl = (ROOF_HI - ROOF_LO) / (y1 - y0)
    k = 0
    while -X + 2.0 + k * 4.0 <= X - 1.9:
        x = -X + 2.0 + k * 4.0
        beam(F, x, y0, ROOF_HI - 0.15, x, y1, ROOF_LO - 0.15, 0.28, 0.3, 'wood'); k += 1
    for yy in (-0.6, 1.8, 4.2):
        z = ROOF_HI - sl * (yy - y0)
        beam(F, -X + 0.3, yy, z - 0.11, X - 0.3, yy, z - 0.11, 0.22, 0.22, 'wood')
    beam(F, -X, y1 - 0.15, ROOF_LO - 0.05, X, y1 - 0.15, ROOF_LO - 0.05, 0.3, 0.55, 'wood')


# ================================================================ 5. versurae, tribunals, aditus gateways, side walls
def build_east_side():
    """East (x > 0) end; mirrored to the west by the caller."""
    # versura projecting toward the cavea (x 43 .. 58, y -3.8 .. -0.15), core and inner face toward the stage
    box(F, (XV + 0.6 + XC) / 2, (YL + YV) / 2, 0, XC - XV - 0.6, YV - YL, ZW, 'travertine')
    skin(XV + 0.6, YV, XV + 0.6, YF, 0, ZW,
         [(1.4, ZS, 1.8, 4.2, 'rect'), (1.4, 9.0, 1.2, 2.6, 'rect'), (1.4, 14.8, 1.3, 3.0, 'arch'), (1.4, 22.4, 1.2, 2.8, 'arch')],
         'marble', depth=0.6, caps=(True, False))
    yd = YV - 1.4                                              # door axis y -1.55
    for yy in (yd - 1.05, yd + 1.05):
        box(F, XV - 0.1, yy, ZS, 0.2, 0.3, 4.4, 'marble')
    box(F, XV - 0.1, yd, ZS + 4.2, 0.2, 2.4, 0.4, 'marble')
    S = F.sub(XV + 0.3, yd, 0, 90.0)                           # local x = world +y, local -y = world +x
    curtain(S, -0.88, -0.1, -0.88, -0.55, 0.0, ZS + 4.15, ZS + 0.02, 3, 0.08)
    curtain(S, 0.1, 0.88, 0.55, 0.88, 0.0, ZS + 4.15, ZS + 0.02, 3, 0.08)
    for z in (Z_ENT1 + 0.4, Z_ENT2 + 0.3):
        band(F, XV, YV, XV, YF, z, 0.35, 0.25, 'marble')
    cornice(F, XV, YV, XV, YF + 0.02, 27.64, 0.8, 0.8, 'marble')
    band(F, XC + 0.5, YV, XV, YV, 27.4, 0.6, 0.12, 'marble')          # top band on the face toward the cavea
    band(F, XC + 0.5, YV, XV, YV, Z_ENT2 + 0.3, 0.35, 0.12, 'marble')
    box(F, (XC + 0.5 + XG) / 2, -3.825, -1.5, XG - XC - 0.5, 7.35, 1.5, 'tuff')           # foundation of the gateway
    hip_roof(F, (XV + XC + 0.5) / 2, (YL + YV) / 2, ZW, XC + 0.5 - XV, YV - YL, 25.0, 0.3)

    # tribunal box above the passage (floor z 9), facing the orchestra
    xf, xb, ya, yb, zf = 40.0, XV - 0.01, -2.95, -0.3, 9.0
    box(F, (xf + xb) / 2, (ya + yb) / 2, zf - 0.3, xb - xf, yb - ya, 0.3, 'marble')
    for yy in (ya + 0.4, yb - 0.4):
        beam(F, xb, yy, 7.75, 40.85, yy, 8.55, 0.3, 0.32, 'marble')                    # consoles
    for yy in (ya + 0.22, yb - 0.22):
        ocol(xf + 0.22, yy, zf, 3.6, 0.17, 'red', 'marble', 'ionic', 8)
    balustrade(F, xf + 0.22, ya + 0.5, xf + 0.22, yb - 0.5, zf, 1.0, 'marble', 1.2, 0.2)
    balustrade(F, xb, ya + 0.12, xf + 0.5, ya + 0.12, zf, 1.0, 'marble', 1.2, 0.2)
    balustrade(F, xf + 0.5, yb - 0.12, xb, yb - 0.12, zf, 1.0, 'marble', 1.2, 0.2)
    box(F, xf + 0.08, (ya + yb) / 2, zf + 0.2, 0.04, yb - ya - 1.1, 0.75, 'cloth')        # drape over the front
    beam(F, xf + 0.22, ya, zf + 3.72, xf + 0.22, yb, zf + 3.72, 0.32, 0.25, 'marble')
    for yy in (ya + 0.05, yb - 0.05):
        beam(F, xf + 0.22, yy, zf + 3.72, xb, yy, zf + 3.72, 0.12, 0.25, 'marble')
    lean_roof(F, xb, yb + 0.12, xb, ya - 0.12, zf + 4.45, xb - xf + 0.4, 0.75, 'tile')

    # side wall x 58 (skins on the core face x 57.5): lower part behind y -7.5, upper part above the gateway
    skin(XC, -15.0, XC, -7.5, 0, 9.7, [(3.75, 0.6, 2.6, 6.0, 'arch')], 'travertine', 0.5, caps=(True, False))
    skin(XC, -15.0, XC, YV, 9.7, ZW - 9.7,
         [(2.48, 1.9, 2.2, 4.2, 'arch'), (7.43, 1.9, 2.2, 4.2, 'arch'), (12.38, 1.9, 2.2, 4.2, 'arch'),
          (2.48, 11.0, 2.0, 3.8, 'arch'), (7.43, 11.0, 2.0, 3.8, 'arch'), (12.38, 11.0, 2.0, 3.8, 'arch')],
         'travertine', 0.5)
    cornice(F, XC + 0.5, -15.0, XC + 0.5, -7.5, 9.5, 0.8, 0.6, 'marble')
    cornice(F, XC + 0.5, -15.0, XC + 0.5, YV - 0.6, 19.0, 0.8, 0.6, 'marble')
    cornice(F, XC + 0.5, -15.0, XC + 0.5, YV - 0.8, 27.64, 0.8, 0.8, 'marble')
    box(F, XC + 0.8, -11.25, 0, 0.6, 7.5, 0.6, 'travertine')                           # plinth

    # aditus gateway: x 57.5 .. 62, y -7.5 .. -0.15, arch 4 x 7 m (a deep vaulted mouth), pilasters, pediment
    yc = -3.8; ya, yb = -7.5, YV
    skin(XC, ya, XC, yb, 0, 9.7, [(yc - ya, 0.0, 4.0, 7.0, 'arch')], 'travertine', depth=XG - XC - 0.01)
    box(F, (XC + XG) / 2, yc, 0, XG - XC - 0.02, 3.96, 0.03, 'paving')
    arch_in = [(yc - 1.5, 0.0), (yc - 1.5, 4.4)] + [(yc - 1.5 * math.cos(PI * j / 10), 4.4 + 1.5 * math.sin(PI * j / 10)) for j in range(1, 10)] + [(yc + 1.5, 4.4), (yc + 1.5, 0.0)]
    opoly('dark', [(XC + 0.04, y, z) for y, z in arch_in], (1, 0, 0))
    for (a, b) in ((ya, yc - 2.0), (yc + 2.0, yb)):
        box(F, XG + 0.12, (a + b) / 2, 0, 0.26, b - a, 0.5, 'marble')                   # plinth
    for yy in (yc - 2.85, yc + 2.85):
        box(F, XG + 0.18, yy, 0.5, 0.36, 0.75, 7.7, 'marble')                          # pilasters
        box(F, XG + 0.2, yy, 8.2, 0.42, 0.95, 0.3, 'marble')
        box(F, XG + 0.2, yy, 0.5, 0.42, 0.95, 0.35, 'marble')
    for yy in (yc - 2.15, yc + 2.15):
        box(F, XG + 0.06, yy, 4.75, 0.14, 0.45, 0.3, 'marble')                         # imposts
    box(F, XG + 0.06, yc, 6.45, 0.14, 0.6, 0.85, 'marble')                              # keystone
    # archivolt (a thin marble ring round the arch)
    seg = 10
    for j in range(seg):
        t0, t1 = PI * j / seg, PI * (j + 1) / seg
        p = [(yc - 2.0 * math.cos(t0), 5.0 + 2.0 * math.sin(t0)), (yc - 2.0 * math.cos(t1), 5.0 + 2.0 * math.sin(t1)),
             (yc - 2.4 * math.cos(t1), 5.0 + 2.4 * math.sin(t1)), (yc - 2.4 * math.cos(t0), 5.0 + 2.4 * math.sin(t0))]
        opoly('marble', [(XG + 0.05, y, z) for y, z in p], (1, 0, 0))
    entablature(F, XG + 0.1, ya + 0.17, XG + 0.1, yb - 0.17, 8.5, 1.2, 0.8, 'marble', 'travertine')
    box(F, XG + 0.49, yc, 9.0, 0.04, 3.4, 0.35, 'bronze')                               # inscription letters
    gable_roof(F, (XC + XG + 0.45) / 2, (ya + yb) / 2, 9.7, XG + 0.45 - XC, (yb - ya) - 0.5, 20.0, 'x', 0.25, 'tile',
               gable_mat='travertine', pediment=True, tymp_mat='marble')
    fig(XG + 0.1, yc, 11.0, 2.2, 'gold', 0.4)


# ================================================================ 6. back facade and the main entrance
def build_back():
    # facade skin on the core face y -14.5 -> face y -15.0, three storeys (0 .. 9.5 .. 19 .. 28)
    outer = (39.6, 44.9, 50.1, 55.4); mid = (12.9, 19.6); wing = (25.8, 30.0, 34.2)
    ops = []
    for sd in (-1, 1):
        for x in outer + mid:
            ops += [(58 + sd * x, 0.6, 2.8, 6.4, 'arch'), (58 + sd * x, 11.2, 2.4, 4.6, 'arch'), (58 + sd * x, 20.8, 2.2, 4.2, 'arch')]
        for x in wing:
            ops.append((58 + sd * x, 20.8, 2.2, 4.2, 'arch'))
        ops.append((58 + sd * 4.75, 21.6, 2.0, 3.4, 'arch'))
    ops.append((58.0, 1.5, 4.4, 7.4, 'rect'))                                              # main door (porch)
    skin(-XC - 0.5, YB, XC + 0.5, YB, 0, ZW, ops, 'travertine', 0.5, caps=(False, False))
    box(F, 0, -15.3, 0, 2 * XC + 1.0, 0.6, 0.6, 'travertine')                              # plinth
    # pilasters and storey cornices
    mk = mark()
    for x in (9.5, 16.25, 22.6, 37.4, 42.25, 47.5, 52.75, 57.6):
        for (z0, z1) in ((0.6, 9.06), (9.86, 18.56)):
            if x in (22.6, 37.4) and z0 > 5:
                continue
            box(F, x, -15.17, z0, 0.8, 0.34, z1 - z0 - 0.3, 'marble'); box(F, x, -15.2, z1 - 0.3, 1.0, 0.4, 0.3, 'marble')
    for x in (9.5, 16.25, 22.6, 27.9, 32.1, 37.4, 42.25, 47.5, 52.75, 57.6):
        box(F, x, -15.17, 19.36, 0.8, 0.34, 7.5, 'marble'); box(F, x, -15.2, 26.86, 1.0, 0.4, 0.3, 'marble')
    cornice(F, 7.6, -15.0, XC + 0.5, -15.0, 9.5, 0.8, 0.6, 'marble')
    mirror_from(mk)
    cornice(F, -XC - 0.5, -15.0, XC + 0.5, -15.0, 19.0, 0.8, 0.6, 'marble')
    cornice(F, -XC - 0.5, -15.0, XC + 0.5, -15.0, 27.64, 0.8, 0.8, 'marble')
    # central half-round porch: stepped podium, 8 red columns, ring entablature, half-conical tile roof
    PCY = -14.8
    for k in range(5):
        half_disc_prism(0.0, PCY, 9.0 - 0.36 * k, 0.0, 0.3 * (k + 1), 'marble', 20)
    half_disc_prism(0.0, PCY, 9.0, -1.5, 0.0, 'tuff', 20)
    for k in range(8):
        a = PI + PI * (k + 0.5) / 8
        ocol(6.4 * math.cos(a), PCY + 6.4 * math.sin(a), 1.5, 10.4, 0.52, 'red', 'marble', 'corinthian', 12)
    half_ring(0.0, PCY, 5.8, 7.0, 11.9, 12.55, 'marble', 16)
    half_ring(0.0, PCY, 5.85, 6.95, 12.55, 13.0, 'red', 16)
    half_ring(0.0, PCY, 5.6, 7.35, 13.0, 13.35, 'marble', 16)
    half_cone(0.0, PCY, 13.35, 7.45, 4.9, 'tile', 16)
    cyl(F, 0.0, -16.3, 16.9, 0.6, 1.1, 'marble', 12)
    fig(0.0, -16.3, 18.0, 3.4, 'gold')
    # the big double door: marble frame, bronze leaves, red curtains drawn to the sides
    for sd in (-1, 1):
        box(F, sd * 2.5, -15.12, 1.5, 0.6, 0.24, 7.4, 'marble')
        box(F, sd * 1.12, -14.59, 1.5, 2.16, 0.06, 7.4, 'bronze')
        for zz in (3.0, 6.2):
            box(F, sd * 1.12, -14.64, zz, 1.7, 0.05, 1.4, 'bronze')                    # door panels
    box(F, 0, -15.15, 8.9, 5.8, 0.3, 0.6, 'marble')
    curtain(F, -5.3, -2.85, -5.3, -4.5, -15.45, 11.6, 1.52, 4, 0.12)
    curtain(F, 2.85, 5.3, 4.5, 5.3, -15.45, 11.6, 1.52, 4, 0.12)
    for sd in (-1, 1):
        ped(sd * 10.8, -20.3, 0.0, 1.8, 3.6, 1.3, 'marble', 'travertine')
        lion(sd * 10.8, -20.1, 1.3, 1.25, 0.0, 'marble')
    # pedimented wings at x +-30: two storeys, giant red half-columns, three arched doors, a flight of steps
    mk = mark()
    box(F, 30.0, (-14.6 - 17.5) / 2, 0, 14.0, 2.9, 17.0, 'travertine')
    skin(23.0, -17.5, 37.0, -17.5, 0, 17.0,
         [(2.8, 1.5, 2.4, 5.2, 'arch'), (7.0, 1.5, 2.4, 5.2, 'arch'), (11.2, 1.5, 2.4, 5.2, 'arch'),
          (2.8, 9.6, 1.8, 3.4, 'arch'), (7.0, 9.6, 1.8, 3.4, 'arch'), (11.2, 9.6, 1.8, 3.4, 'arch')], 'travertine', 0.5)
    box(F, 30.0, -18.6, 0, 14.0, 1.2, 1.5, 'travertine')                                 # podium y -18 .. -19.2
    box(F, 30.0, -18.6, 1.42, 14.2, 1.3, 0.08, 'marble')
    stairs(F, 30.0, -21.45, 0.0, 11.0, 5, 0.3, 0.45, rot=90.0, mat='marble', cheeks=True, cheek_mat='travertine')
    for x in (23.7, 27.9, 32.1, 36.3):
        ocol(x, -18.25, 1.5, 14.3, 0.62, 'red', 'marble', 'corinthian', 10)
    entablature(F, 23.0, -18.2, 37.0, -18.2, 15.8, 1.2, 1.3, 'marble', 'red')
    band(F, 23.0, -18.0, 37.0, -18.0, 8.6, 0.35, 0.25, 'marble')
    for x in (25.8, 30.0, 34.2):
        box(F, x, -18.08, 6.9, 2.9, 0.16, 0.35, 'marble')                               # door hoods
    gable_roof(F, 30.0, (-18.85 - 14.6) / 2, 17.0, 14.6, -14.6 + 18.85, 16.0, 'y', 0.4, 'tile',
               gable_mat='travertine', pediment=True, tymp_mat='travertine')
    fig(30.0, -19.0, 19.0, 2.4, 'gold', 0.4)
    for sd in (-1, 1):
        fig(30.0 + sd * 5.8, -21.1, 0.9, 2.3, 'marble', 0.5)                               # Muses on the stair cheeks
    mirror_from(mk)


# ================================================================ 7. roofs of the main block
def build_foundations():
    """Footings below z 0 so nothing floats where the ground is uneven (hidden on flat ground)."""
    box(F, 0, (-15.6 + YV) / 2, -1.5, 2 * XC + 1.2, YV + 15.6, 1.5, 'tuff')                 # scaena and versurae
    box(F, 0, (YSB + YSF) / 2, -1.5, 2 * XS, YSF - YSB, 1.5, 'tuff')                        # stage
    for sd in (-1, 1):
        box(F, sd * 30.0, -18.4, -1.5, 14.4, 6.6, 1.5, 'tuff')                              # wings and their steps


def build_roofs():
    hip_roof(F, 0.0, (-15.0 + YF) / 2, ZW, 2 * XC + 1.0, YF + 15.0, 25.0, 0.8)


def build():
    reset()
    preview_ground(-0.05)
    build_stage()
    build_core()
    build_frons()
    build_stage_roof()
    mk = mark(); build_east_side(); mirror_from(mk)
    build_back()
    build_roofs()
    build_foundations()


# ================================================================ preview only: the cavea stand-in
def cavea_standin():
    r0, z0, r1, z1, R, H = 18.6, 1.2, 59.0, 30.0, 62.0, 32.0
    seg = 36
    P = lambda r, a, z: (r * math.cos(a), r * math.sin(a), z)
    for i in range(seg):
        a0, a1 = PI * i / seg, PI * (i + 1) / seg; am = (a0 + a1) / 2
        opoly('grey', [P(r0, a0, z0), P(r1, a0, z1), P(r1, a1, z1), P(r0, a1, z0)], (-math.cos(am), -math.sin(am), 1.4))
        opoly('grey', [P(r1, a0, z1), P(r1, a0, H), P(r1, a1, H), P(r1, a1, z1)], (-math.cos(am), -math.sin(am), 0))
        opoly('grey', [P(r1, a0, H), P(R, a0, H), P(R, a1, H), P(r1, a1, H)], (0, 0, 1))
        opoly('stone', [P(R, a0, 0), P(R, a1, 0), P(R, a1, H), P(R, a0, H)], (math.cos(am), math.sin(am), 0))
        opoly('paving', [(0, 0, 0.02), P(r0, a0, 0.02), P(r0, a1, 0.02)], (0, 0, 1))
        opoly('grey', [P(r0, a0, 0), P(r0, a1, 0), P(r0, a1, z0), P(r0, a0, z0)], (-math.cos(am), -math.sin(am), 0))
        for k in range(1, 3):                                   # two walkways (praecinctiones) as dark lines
            t = k / 3.0; rr = r0 + (r1 - r0) * t; zz = z0 + (z1 - z0) * t
            opoly('dark', [P(rr, a0, zz + 0.05), P(rr + 1.2, a0, zz + 0.05 + 0.86), P(rr + 1.2, a1, zz + 0.91), P(rr, a1, zz + 0.05)],
                  (-math.cos(am), -math.sin(am), 1.4))
    for sx in (-1, 1):                                          # end walls on y 0
        pts = [(sx * r0, 0, 0), (sx * R, 0, 0), (sx * R, 0, H), (sx * r1, 0, H), (sx * r1, 0, z1), (sx * r0, 0, z0)]
        opoly('stone', pts, (0, -1, 0))


def export_glb(ob, glb):
    os.makedirs(os.path.dirname(glb), exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active = ob
    bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB', use_selection=True, export_yup=True,
                              export_apply=True, export_normals=True, export_texcoords=False, export_materials='EXPORT',
                              export_cameras=False, export_lights=False)


OUT = os.path.join(_bk.ROOT, 'renders', NAME)


def shot(name, eye, target, lens=35.0, hide=()):
    sc = bpy.context.scene
    for o in bpy.data.objects:
        o.hide_render = o.name in hide
    cam = bpy.data.objects.new(name, bpy.data.cameras.new(name)); sc.collection.objects.link(cam)
    cam.data.lens = lens; cam.data.clip_end = 3000.0
    cam.location = Vector(eye); cam.rotation_euler = (Vector(target) - Vector(eye)).to_track_quat('-Z', 'Y').to_euler()
    sc.camera = cam
    sc.render.filepath = os.path.join(OUT, name + '.png'); bpy.ops.render.render(write_still=True)
    return sc.render.filepath


def main():
    build()
    human(F, 0.0, 2.0, ZS)
    human(F, 64.0, -9.0, 0.0)
    ob = _bk._build_object(NAME)
    tris = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    bb = [Vector(c) for c in ob.bound_box]
    mn = [round(min(v[i] for v in bb), 2) for i in range(3)]; mx = [round(max(v[i] for v in bb), 2) for i in range(3)]
    glb = os.path.join(_bk.ROOT, 'assets', 'models', 'rome', NAME + '.glb')
    export_glb(ob, glb)
    mats = sorted(_bk._G.keys())
    _bk._G.clear()
    cavea_standin()
    _bk._build_object(NAME + '_cavea_standin')                  # preview only, never exported
    bpy.context.scene.eevee.taa_render_samples = 8
    files = render_previews(ob, NAME, '-Y', extra=(('cavea', Vector((0.0, 1.0, 0.0)), 34),
                                                    ('back', Vector((0.0, -1.0, 0.0)), 14)))
    files += [shot('stage_seats', (0.0, 44.0, 22.0), (0.0, -3.0, 9.0), 26.0),
              shot('aditus_east', (92.0, -22.0, 9.0), (60.0, -3.8, 5.0), 35.0),
              shot('tribunal_east', (22.0, 13.0, 8.0), (42.0, -1.5, 9.5), 30.0, hide=(NAME + '_cavea_standin',)),
              shot('orchestra', (0.0, 17.0, 2.2), (0.0, -3.0, 8.0), 18.0),
              shot('porch', (16.0, -52.0, 9.0), (0.0, -16.0, 9.0), 35.0)]
    info = {'asset': NAME, 'triangles': tris, 'bbox_min': mn, 'bbox_max': mx, 'materials': mats,
            'glb': glb, 'glb_kb': round(os.path.getsize(glb) / 1024), 'renders': files}
    print('ASSET_REPORT ' + json.dumps(info, ensure_ascii=False))


main()
