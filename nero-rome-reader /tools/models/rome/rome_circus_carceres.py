"""Starting gates of the Circus Maximus (rome_circus_carceres), AD 56. Asset front = -Y (the arena side).

Metres; x east, y north, z = 0 arena level. 168 m wide (x -84..84); the street front reaches y = +22.
Arena side (-Y, as before): the central gate (Porta Pompae, rome_circus_carceres_gate.py) with the magistrate's box
on its arena face and a gilded quadriga on the attic; twelve stalls (six each side): 4.4 m arched openings with red
lattice gates on an 8.83 m pitch, marble piers with herm heads; the row is curved so the outer stalls stand 3 m further
back. Above: a 5 m storey, a balustraded terrace and statues.
Street side (+Y, the city front, round 2 after the author's note of 2026-11-02):
* a terrace at z = 0 paved with large red panels framed in marble, three broad steps down to the street (z = -1)
  at y 19.6..22, flaming tripods;
* the central arch block (x -15..15, y 8..15.2, 21.6 m) in front of the gate: one big arch and two statue niches
  between four Corinthian columns on tall pedestals, gilded medallions in the spandrels, chariot reliefs and a bronze
  inscription in the attic, a gilded quadriga between two gilded Victories on top;
* the magistrate's loggia on the gate's top: six columns, red back wall, festoons, a big pedimented tile roof
  (ridge 31.7 m) that reads from far away;
* two flanking gate towers (x 15..24, 23 m): an arch, a gilded medallion, a pedimented window, a bronze quadriga in
  front of a small pedimented pavilion (the two smaller pediments beside the loggia);
* two-storey wings (x 24..68): six arches on red piers with marble half-columns and red festoons, a frieze of painted
  reliefs with racing chariots and horsemen (red ground, gilded figures racing towards the gate), a terrace with a
  bronze lattice rail, statues and torches;
* end towers (x 68..84, 16 x 16 m, walls 23.5 m, pyramid roofs to 27.7 m): arched windows in two storeys, cornices,
  marble quoins, and on the street side a tetrastyle Corinthian porch with a pediment and steps.
【史】Claudius rebuilt the carceres in marble (Suetonius, Claudius 21); the outer front is a reconstruction.
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
from rk import _arch_pts
from mathutils import Vector
import rome_circus_carceres_gate as G
from rome_circus_carceres_gate import build_gate, ST_Z

reset()
F = Frame()

X_GATE = 15.0                                   # gate half-width (gate 30 m)
X_END = 84.0                                    # half-width of the whole asset
TOWER_W = 16.0
PITCH = (X_END - TOWER_W - X_GATE) / 6.0        # 8.83 m: six stalls per side fill x 15..68
STALL_W, STALL_H = 4.4, 7.0                     # stall opening (crown height)
STOREY = 5.0                                    # storey over the stalls
TOP = STALL_H + STOREY                          # 12 m: terrace level
DEPTH = 16.0                                    # stall block depth
ROW_BACK = 3.0                                  # outer stalls stand this far back (+Y)

# ---- street front
Y1 = 15.2                                       # front face of the central arch block
DK = 1.0                                        # depth of its statue niches
WY, WT = 13.0, 1.2                              # wing arcade: front face, wall thickness
XF0, XF1, FY1, FT_H = 15.0, 24.0, 16.0, 23.0    # flanking gate towers: x range, front face, top
XE0 = X_END - TOWER_W                           # 68: inner face of the end towers
NBAY = 6
BAY = (XE0 - XF1) / NBAY                        # 7.33 m
TER_Y = 19.6                                    # front edge of the terrace (z = 0)
CAP, ATT, SPR, AR = G.CAP_Z, G.ATT_Z, G.SPR, G.AR


def front_y(x):
    """Arena-side face of the stall row at x (|x| >= 15): a gentle curve, ROW_BACK m further back at the ends."""
    t = min(1.0, (abs(x) - X_GATE) / (X_END - TOWER_W - X_GATE))
    return -DEPTH / 2 + ROW_BACK * t * t


def cl_y(x):
    """Centre line of a stall block (its arcade wall is DEPTH thick)."""
    return front_y(x) + DEPTH / 2


def seg_frame(x0, y0, x1, y1):
    """Local frame of a wall line p0 -> p1 (same rotation the kit's arcade uses) and its length."""
    rot = math.atan2(y1 - y0, x1 - x0) / D2R
    return F.sub(x0, y0, 0, rot), math.hypot(x1 - x0, y1 - y0)


def lattice_gate(W, uc, ow, zs, yy):
    """Double gate of wooden lattice in an arched opening: red frame and wooden bars (local frame W, centre uc)."""
    a0, a1 = uc - ow / 2, uc + ow / 2
    arch = _arch_pts(a0, a1, zs, 12)
    for p, q in zip(arch[:-1], arch[1:]):
        beam(W, p[0], yy, p[1], q[0], yy, q[1], 0.14, 0.14, 'red')
    for u in (a0, a1):
        beam(W, u, yy, 0.15, u, yy, zs, 0.14, 0.14, 'red')
    for k in (1, 2, 3):
        u = a0 + ow * k / 4
        top = zs + math.sqrt(max(0.0, (ow / 2) ** 2 - (u - uc) ** 2))
        beam(W, u, yy, 0.15, u, yy, top, 0.07, 0.07, 'wood')
    for zb in (1.6, 3.2):
        beam(W, a0, yy, zb, a1, yy, zb, 0.07, 0.07, 'wood')


def stall(i, sd):
    """Stall i (0 = next to the gate) on side sd (-1 west, +1 east). Each stall runs in +x, so its outside
    (the right-hand side of the line) is the arena side."""
    if sd > 0:
        xa, xb = X_GATE + i * PITCH, X_GATE + (i + 1) * PITCH
    else:
        xb, xa = -(X_GATE + i * PITCH), -(X_GATE + (i + 1) * PITCH)
    ya, yb = cl_y(xa), cl_y(xb)
    arcade(F, xa, ya, xb, yb, 0.0, TOP, DEPTH, 1, 'marble', open_w=STALL_W, open_h=STALL_H, back='dark',
           impost_mat='marble')
    wall(F, xa, ya, xb, yb, -1.2, 1.2, DEPTH, 'travertine')          # footing below the arena floor
    W, L = seg_frame(xa, ya, xb, yb)
    lattice_gate(W, L / 2, STALL_W, STALL_H - STALL_W / 2, -DEPTH / 2 + 0.25)
    fa, fb = front_y(xa), front_y(xb)
    band(F, xa, fa, xb, fb, 7.4, 0.3, 0.42, 'red')
    cornice(F, xa, fa, xb, fb, TOP - 0.5, 0.5, 0.55, 'marble')
    balustrade(F, xa, fa - 0.4, xb, fb - 0.4, TOP, 1.0, 'marble', 2.2, 0.28)
    xm = (xa + xb) / 2
    statue(F, xm, front_y(xm) + 1.6, TOP, 2.6, 'marble', pedestal=0.8, ped_mat='marble')


def herm(x, y):
    """A marble pilaster with a herm head, on the front face of the row."""
    box(F, x, y, 0, 0.9, 0.5, TOP - 0.4, 'marble')
    box(F, x, y, 8.3, 0.9, 0.6, 0.25, 'marble')
    cyl(F, x, y, 8.55, 0.18, 0.5, 'marble', 8)
    sphere(F, x, y, 9.25, 0.34, 'marble', 10, 6)


# ================================================================== street-front helpers (world frame, F = identity)
def poly_n(mat, pts, nrm):
    """A polygon turned so that its normal points along nrm."""
    P = [Vector(p) for p in pts]
    n = Vector((0.0, 0.0, 0.0))
    for i in range(len(P)):
        a, b = P[i], P[(i + 1) % len(P)]
        n += Vector(((a.y - b.y) * (a.z + b.z), (a.z - b.z) * (a.x + b.x), (a.x - b.x) * (a.y + b.y)))
    if n.dot(Vector(nrm)) < 0:
        P.reverse()
    add_poly(mat, P)


def _ccw(outline):
    n = len(outline)
    a = sum(outline[i][0] * outline[(i + 1) % n][1] - outline[(i + 1) % n][0] * outline[i][1] for i in range(n))
    return list(outline) if a > 0 else list(outline)[::-1]


def xz_prism(outline, y0, y1, mat):
    """Extrude an (x, z) outline (any winding, may be concave) from y0 to y1 (y0 < y1); faces point outward."""
    P = _ccw(outline); n = len(P)
    A = [Vector((x, y0, z)) for x, z in P]
    B = [Vector((x, y1, z)) for x, z in P]
    add_poly(mat, A)                      # back cap (-y)
    add_poly(mat, B[::-1])                # front cap (+y)
    for i in range(n):
        j = (i + 1) % n
        add_poly(mat, [A[i], B[i], B[j], A[j]])


def yz_prism(outline, x0, x1, mat):
    """Extrude a (y, z) outline from x0 to x1 (x0 < x1); faces point outward."""
    P = _ccw(outline); n = len(P)
    A = [Vector((x0, y, z)) for y, z in P]
    B = [Vector((x1, y, z)) for y, z in P]
    add_poly(mat, A[::-1])                # -x cap
    add_poly(mat, B)                      # +x cap
    for i in range(n):
        j = (i + 1) % n
        add_poly(mat, [A[i], A[j], B[j], B[i]])


def ring_pts(c, zs, r_in, r_out, seg=12):
    """Outline of a semicircular archivolt (u along the face, z up), springing at zs."""
    return _arch_pts(c - r_out, c + r_out, zs, seg) + _arch_pts(c - r_in, c + r_in, zs, seg)[::-1]


def xz_ring(xc, zs, r_in, r_out, y0, y1, mat='marble', seg=12):
    xz_prism(ring_pts(xc, zs, r_in, r_out, seg), y0, y1, mat)


def xz_disc(x, z, r, y0, y1, mat, seg=16):
    xz_prism([(x + r * math.cos(TAU * i / seg), z + r * math.sin(TAU * i / seg)) for i in range(seg)], y0, y1, mat)


def medallion(x, yf, z, r, mat='gold', s=1):
    """A gilded round shield in a marble ring on a face at yf (s = +1 faces +Y, -1 faces -Y)."""
    xz_disc(x, z, r + 0.3, *sorted((yf, yf + s * 0.16)), 'marble')
    xz_disc(x, z, r, *sorted((yf + s * 0.16, yf + s * 0.3)), mat)


def inscription(xc, yf, rows):
    """Bronze letters on a +Y face at yf: rows = [(z, letter height, word lengths)], centred on xc."""
    for (z, lh, words) in rows:
        lw, step, gap = lh * 0.72, lh * 1.05, lh * 0.9
        width = sum(n * step for n in words) + gap * (len(words) - 1)
        x = xc - width / 2
        for n in words:
            for k in range(n):
                box(F, x + step * k + step / 2, yf + 0.03, z, lw, 0.06, lh, 'bronze')
            x += n * step + gap


def festoon(xc, r, zs, yf, drop=2.0, mat='cloth'):
    """A cloth hanging drawn up in the middle, filling the top of an arch (radius r, springing zs), at y yf-0.06..yf."""
    rr = r - 0.05
    top = _arch_pts(xc - rr, xc + rr, zs, 10)
    hem = [(xc + rr - 2 * rr * k / 10.0, zs - drop + (drop + 0.4 * rr) * math.sin(math.pi * k / 10.0))
           for k in range(1, 10)]
    xz_prism([(xc - rr, zs - drop)] + top + [(xc + rr, zs - drop)] + hem, yf - 0.06, yf, mat)


def swag(xa, xb, ztop, sag, yf, mat='cloth'):
    """A festoon of cloth hung between two columns under an entablature (in the x-z plane at y yf-0.06..yf)."""
    pts = [(xa, ztop), (xb, ztop)]
    for k in range(1, 10):
        t = 1.0 - k / 10.0
        pts.append((xa + (xb - xa) * t, ztop - 0.35 - sag * math.sin(math.pi * t)))
    xz_prism(pts, yf - 0.06, yf, mat)


# ---- painted reliefs: racing chariots and horsemen (flat raised figures in the x-z plane, facing +Y)
def fig(xa, za, xb, zb, y0, y1, th, mat):
    """One flat stroke of a relief figure from (xa, za) to (xb, zb), depth y0..y1, in-plane thickness th."""
    if abs(xb - xa) < 2e-3:
        xb += 2e-3
    beam(F, xa, (y0 + y1) / 2, za, xb, (y0 + y1) / 2, zb, y1 - y0, th, mat)


HORSE = (((-0.55, 0.80), (0.42, 0.84), 0.36),    # body
         ((0.30, 0.90), (0.60, 1.20), 0.22),     # neck
         ((0.55, 1.22), (0.86, 1.04), 0.16),     # head
         ((0.34, 0.68), (0.86, 0.40), 0.09),     # forelegs stretched forward (flying gallop)
         ((0.26, 0.68), (0.70, 0.30), 0.09),
         ((-0.42, 0.68), (-0.88, 0.34), 0.09),   # hind legs stretched back
         ((-0.34, 0.68), (-0.72, 0.24), 0.09),
         ((-0.56, 0.90), (-0.82, 0.70), 0.07))   # tail
RIDER = (((-0.02, 1.00), (0.10, 1.52), 0.24),    # torso leaning forward
         ((0.11, 1.56), (0.15, 1.76), 0.19),     # head
         ((0.00, 0.98), (0.20, 0.68), 0.11),     # leg
         ((0.06, 1.42), (0.42, 1.74), 0.07))     # raised arm with a palm
CAR = (((-1.28, 0.62), (-0.78, 0.74), 0.44),     # chariot box
       ((-0.80, 0.68), (0.20, 0.80), 0.06),      # pole
       ((-1.06, 0.92), (-0.92, 1.52), 0.24),     # driver
       ((-0.92, 1.56), (-0.88, 1.76), 0.19),     # his head
       ((-0.96, 1.36), (-0.40, 1.12), 0.06))     # reins


def strokes(spec, x0, z0, s, d, y0, y1, mat, du=0.0, dv=0.0):
    for (a, b, th) in spec:
        fig(x0 + d * (a[0] + du) * s, z0 + (a[1] + dv) * s, x0 + d * (b[0] + du) * s, z0 + (b[1] + dv) * s,
            y0, y1, th * s, mat)


def chariot_group(x0, z0, s, d, y0, y1):
    """A two-horse racing chariot (biga) with its driver, facing d (+1 = +x)."""
    strokes(HORSE, x0, z0, s, d, y0, y1 - 0.035, 'giallo', 0.18, 0.05)       # far horse, a little lower relief
    strokes(HORSE, x0, z0, s, d, y0, y1, 'gold')
    strokes(CAR, x0, z0, s, d, y0, y1, 'giallo')
    xz_disc(x0 + d * -1.02 * s, z0 + 0.42 * s, 0.36 * s, y0, y1 + 0.03, 'gold', 12)


def horseman(x0, z0, s, d, y0, y1):
    strokes(HORSE, x0, z0, s, d, y0, y1, 'gold')
    strokes(RIDER, x0, z0, s, d, y0, y1, 'giallo')


def relief_panel(xc, yf, zc, w, h, d, kind=0):
    """A painted relief panel on a +Y face at yf: marble frame, red field, a chariot and a horseman racing towards d."""
    fw = 0.22
    box(F, xc, yf + 0.05, zc - h / 2, w, 0.1, h, 'red')                                    # field
    box(F, xc, yf + 0.1, zc - h / 2 - fw, w + 2 * fw, 0.2, fw, 'marble')                   # frame
    box(F, xc, yf + 0.1, zc + h / 2, w + 2 * fw, 0.2, fw, 'marble')
    for sx in (-1, 1):
        box(F, xc + sx * (w + fw) / 2, yf + 0.1, zc - h / 2, fw, 0.2, h, 'marble')
    s = (h - 0.12) / 1.8
    z0 = zc - h / 2 + 0.02
    y0, y1 = yf + 0.11, yf + 0.2
    lead, back = xc + d * w * 0.27, xc - d * w * 0.20
    if kind:
        lead, back = xc + d * w * 0.22, xc - d * w * 0.25
        horseman(back, z0, s, d, y0, y1)
        chariot_group(lead + d * 0.1 * s, z0, s, d, y0, y1)
    else:
        chariot_group(back, z0, s, d, y0, y1)
        horseman(lead, z0, s, d, y0, y1)


def clad_box(xa, xb, ya, yb, z0, h, mat, d, ops, frame='marble'):
    """A block with a d-thick skin on all four sides; ops[side] ('S','E','N','W') lists the openings as
    (centre along the side in world x or y, z bottom (from z0), width, height, 'arch'|'rect').
    Arched openings get a marble archivolt and a sill."""
    e = d + 0.01
    box(F, (xa + xb) / 2, (ya + yb) / 2, z0, xb - xa - 2 * e, yb - ya - 2 * e, h, mat)
    lines = {'S': ((xa, ya + e), (xb, ya + e)), 'E': ((xb - e, ya), (xb - e, yb)),
             'N': ((xb, yb - e), (xa, yb - e)), 'W': ((xa + e, yb), (xa + e, ya))}
    out_t = {'S': (ya - 0.14, ya), 'N': (yb, yb + 0.14), 'E': (xb, xb + 0.14), 'W': (xa - 0.14, xa)}
    for side, (p0, p1) in lines.items():
        lst = []
        for (c, zb, w, hh, kind) in ops.get(side, ()):
            lst.append((abs(c - (p0[0] if side in 'NS' else p0[1])), zb, w, hh, kind))
            if kind == 'arch':
                rp = ring_pts(c, z0 + zb + hh - w / 2, w / 2, w / 2 + 0.26, 10)
                (xz_prism if side in 'NS' else yz_prism)(rp, out_t[side][0], out_t[side][1], frame)
        opening_skin(F, p0[0], p0[1], p1[0], p1[1], z0, h, lst, mat, depth=d, frame_mat=frame)


def cornice4(xa, xb, ya, yb, z, h, proj, mat='marble'):
    for (p, q) in (((xa, ya), (xb, ya)), ((xb, ya), (xb, yb)), ((xb, yb), (xa, yb)), ((xa, yb), (xa, ya))):
        cornice(F, p[0], p[1], q[0], q[1], z, h, proj, mat)


def pav(x0, x1, y0, y1, mat='pav_red', z=0.03):
    """A paving panel laid on the terrace (top at z)."""
    add_poly(mat, [Vector((x0, y0, z)), Vector((x1, y0, z)), Vector((x1, y1, z)), Vector((x0, y1, z))])


# ================================================================== street front
def roof_paving():
    """Light panels in thin red frames, giallo centres, on the terrace over the stalls and the wings (z 12)."""
    z = TOP + 0.04
    for sd in (-1, 1):
        spans = [(XF0 + 0.6, XF1 - 0.6, 7.6)] + [(XF1 + (k + 0.5) * BAY - 3.0, XF1 + (k + 0.5) * BAY + 3.0, 12.2)
                                                for k in range(NBAY)]
        for (a, b, y1) in spans:
            y0 = max(front_y(a), front_y(b)) + 3.2
            x0, x1 = sorted((sd * a, sd * b))
            pav(x0, x1, y0, y1, 'pav_red', z)                              # thin red frame ...
            pav(x0 + 0.4, x1 - 0.4, y0 + 0.4, y1 - 0.4, 'travertine', z + 0.03)   # ... round a light field
            xm, ym = (x0 + x1) / 2, (y0 + y1) / 2
            pav(xm - 1.0, xm + 1.0, ym - 1.0, ym + 1.0, 'giallo', z + 0.06)


def platform():
    """Terrace at z = 0 in front of the whole street front, three broad steps down to the street (z = -1)."""
    box(F, 0.0, (8.0 + TER_Y) / 2, -2.0, 2 * X_END, TER_Y - 8.0, 2.0, 'marble')
    for k, ztop in enumerate((-0.25, -0.5, -0.75)):
        box(F, 0.0, TER_Y + 0.4 + 0.8 * k, -2.0, 2 * X_END, 0.8, ztop + 2.0, 'marble')
    # paving: red panels framed by the marble, a giallo lane through the central gate
    pav(-2.9, 2.9, 8.2, 19.0, 'giallo')
    for sd in (-1, 1):
        for a, b in ((3.7, 8.4), (8.9, 13.9)):
            pav(*sorted((sd * a, sd * b)), 17.3, 19.0)
        xc = sd * (XF0 + XF1) / 2
        pav(xc - 3.7, xc + 3.7, 16.9, 19.0)
        for k in range(NBAY):
            xc = sd * (XF1 + (k + 0.5) * BAY)
            pav(xc - 3.0, xc + 3.0, 14.3, 19.0)
            pav(xc - 1.0, xc + 1.0, 15.65, 17.65, 'giallo', 0.06)
    # flaming tripods on the terrace
    for x in (-3.6, 3.6, -(XF1 + 3 * BAY), XF1 + 3 * BAY):
        torch_column(F, x, 18.7, 0.0, 3.0)


def arch_block():
    """Central arch block in front of the gate's street face (x -15..15, y 8..Y1, 21.6 m)."""
    xz_prism(_arch_pts(-AR, AR, SPR, 16) + [(AR, ATT), (-AR, ATT)], 8.0, Y1, 'travertine')      # spandrel / vault
    arc = _arch_pts(-AR + 0.12, AR - 0.12, SPR, 12)
    for y in (10.4, 12.8):                                                                       # vault ribs
        for p, q in zip(arc[:-1], arc[1:]):
            beam(F, p[0], y, p[1], q[0], y, q[1], 0.4, 0.24, 'stone')
    yl = Y1 - DK - 0.01                                  # niche skin line (its face lands on y = Y1)
    for sd in (-1, 1):
        xa, xb = sorted((sd * AR, sd * X_GATE))
        box(F, (xa + xb) / 2, (8.0 + yl) / 2, 0.0, xb - xa, yl - 8.0, ATT, 'travertine')        # pier core
        xn = sd * 10.15                                  # statue niche between the columns
        opening_skin(F, xb, yl, xa, yl, 0.0, ATT, [(xb - xn, 3.2, 3.0, 6.3, 'arch')], 'travertine', depth=DK)
        poly_n('travertine', [(sd * AR, yl, 0), (sd * AR, Y1, 0), (sd * AR, Y1, ATT), (sd * AR, yl, ATT)],
               (-sd, 0, 0))                              # passage side of the skin
        box(F, (sd * AR + sd * X_GATE) / 2, Y1 + 0.15, 0.0, X_GATE - AR, 0.3, 0.6, 'marble')     # plinth moulding
        # niche: archivolt, sill, bronze statue, porphyry panel below, medallion and relief above
        xz_ring(xn, 8.0, 1.5, 1.85, Y1, Y1 + 0.15)
        box(F, xn, Y1 + 0.05, 2.95, 3.6, 0.4, 0.25, 'marble')
        statue(F, xn, Y1 - 0.45, 3.2, 3.6, 'marble', pedestal=0.5, ped_mat='marble')
        box(F, xn, Y1 + 0.02, 0.75, 3.1, 0.05, 2.1, 'marble')
        box(F, xn, Y1 + 0.06, 0.9, 2.8, 0.06, 1.8, 'porphyry')
        medallion(xn, Y1, 11.05, 0.72)
        relief_panel(xn, Y1, 13.4, 4.6, 1.9, -sd, 1)
        # columns on tall pedestals
        for xcol in (sd * 6.3, sd * 14.0):
            box(F, xcol, Y1 + 0.75, 0.0, 2.1, 1.7, 0.45, 'marble')
            box(F, xcol, Y1 + 0.75, 0.45, 1.8, 1.5, 2.3, 'travertine')
            box(F, xcol, Y1 + 0.75, 2.75, 2.1, 1.7, 0.3, 'marble')
            box(F, xcol, Y1 + 1.53, 0.85, 1.2, 0.06, 1.5, 'red')
            column(F, xcol, Y1 + 0.5, 3.05, 11.95, 0.62, 'marble', 'corinthian', 0, 14)
            entablature(F, xcol - 1.0, Y1 + 0.55, xcol + 1.0, Y1 + 0.55, 15.0, 1.6, 1.5, 'marble', 'red')
            box(F, xcol, Y1 + 0.35, ATT, 2.0, 0.7, 4.0, 'travertine')                           # attic ressaut
            box(F, xcol, Y1 + 0.72, 17.2, 1.1, 0.05, 2.9, 'red')
        # big arch: impost, spandrel medallion
        box(F, sd * (AR + 0.45), Y1 + 0.15, SPR - 0.4, 0.9, 0.5, 0.4, 'marble')
        medallion(sd * 4.65, Y1, 13.5, 0.7)
        # attic relief
        relief_panel(xn, Y1, 18.75, 5.4, 2.4, -sd, 0)
    xz_ring(0.0, SPR, AR, AR + 0.7, Y1, Y1 + 0.35, 'marble', 16)                                 # archivolt
    box(F, 0.0, Y1 + 0.3, 11.5, 1.1, 0.8, 1.5, 'marble')                                         # keystone
    xz_disc(0.0, 12.3, 0.32, Y1 + 0.7, Y1 + 0.82, 'gold', 12)
    entablature(F, -X_GATE, Y1 + 0.3, X_GATE, Y1 + 0.3, 15.0, 1.6, 0.9, 'marble', 'red')
    # attic: block, inscription with bronze letters, cornice, cap
    box(F, 0.0, (8.0 + Y1) / 2, ATT, 2 * X_GATE, Y1 - 8.0, 21.25 - ATT, 'travertine')
    box(F, 0.0, Y1 + 0.06, 16.95, 9.4, 0.12, 3.6, 'red')
    box(F, 0.0, Y1 + 0.12, 17.1, 9.0, 0.24, 3.3, 'marble')
    inscription(0.0, Y1 + 0.24, [(19.55, 0.5, (2, 7, 6)), (18.8, 0.4, (8, 3, 6)), (18.15, 0.36, (5, 9)),
                                  (17.55, 0.36, (4, 6, 3))])
    cornice(F, X_GATE, Y1, -X_GATE, Y1, 20.95, 0.7, 0.75, 'marble')
    box(F, 0.0, (8.2 + Y1 + 0.3) / 2, 21.25, 2 * X_GATE + 0.4, Y1 + 0.3 - 8.2, CAP - 21.25, 'marble')
    # on top: gilded quadriga between gilded Victories, bronze trophies at the corners
    box(F, 0.0, 13.3, CAP, 5.2, 3.9, 0.5, 'marble')
    quadriga(F, 0.0, 13.4, CAP + 0.5, 1.05, 'gold', '+Y')
    for sd in (-1, 1):
        G._balcony_victory(sd * 6.3, 14.2, CAP)
        G.trophy(sd * 13.6, 14.4, CAP)


def loggia():
    """Magistrate's loggia on the gate's top (y 2.4..11.4): six Corinthian columns, a red back wall with a bronze
    door, festoons, a big pedimented tile roof; it shows over the gate from the arena too."""
    z0 = CAP
    box(F, 0.0, 6.9, z0, 22.6, 9.0, 0.3, 'marble')                       # floor
    zf = z0 + 0.3
    CH, EH = 5.8, 1.1
    ze = zf + CH
    box(F, 0.0, 3.0, zf, 21.0, 0.8, CH, 'marble')                         # back wall (arena face marble)
    box(F, 0.0, 3.45, zf, 19.6, 0.1, CH - 0.5, 'red')                     # its inner face red
    box(F, 0.0, 3.5, zf, 3.2, 0.06, 4.7, 'marble')                        # door frame
    box(F, 0.0, 3.55, zf, 2.4, 0.08, 4.2, 'bronze')                       # bronze door
    for x in (-6.5, 6.5):                                                 # pilasters on the arena face
        box(F, x, 2.5, zf, 0.9, 0.2, CH, 'marble')
    for x, w in ((-3.9, 3.6), (3.9, 3.6), (-8.25, 2.2), (8.25, 2.2)):      # red panels on the arena face
        box(F, x, 2.57, zf + 0.9, w, 0.06, 3.7, 'red')
    xs = (-10.0, -6.0, -2.0, 2.0, 6.0, 10.0)
    for x in xs:
        column(F, x, 10.7, zf, CH, 0.42, 'marble', 'corinthian', 0, 12)
    for sd in (-1, 1):
        column(F, sd * 10.0, 7.0, zf, CH, 0.42, 'marble', 'corinthian', 0, 12)
        box(F, sd * 10.0, 3.8, zf, 0.9, 0.9, CH, 'marble')                # anta
        for (a, b) in ((3.8, 7.0), (7.0, 10.7)):
            balustrade(F, sd * 10.0, a + 0.5, sd * 10.0, b - 0.5, zf, 1.0, 'marble', 1.5, 0.26)
    for (a, b) in ((-10.0, -6.0), (-6.0, -2.0), (2.0, 6.0), (6.0, 10.0)):
        balustrade(F, a + 0.5, 10.7, b - 0.5, 10.7, zf, 1.0, 'marble', 1.5, 0.26)
    for (a, b) in zip(xs[:-1], xs[1:]):
        swag(a + 0.45, b - 0.45, ze - 0.02, 0.9, 10.66, 'cloth')
    entablature(F, -10.0, 10.7, 10.0, 10.7, ze, EH, 1.1, 'marble', 'red')
    entablature(F, -10.0, 3.0, 10.0, 3.0, ze, EH, 1.1, 'marble', 'red')
    for sd in (-1, 1):
        entablature(F, sd * 10.0, 3.0, sd * 10.0, 10.7, ze, EH, 1.1, 'marble', 'red')
    box(F, 0.0, 6.85, ze, 19.6, 7.4, EH * 0.95, 'marble')                 # ceiling (no see-through)
    ridge = gable_roof(F, 0.0, 6.85, ze + EH, 21.4, 8.9, 15.0, 'y', 0.5, gable_mat='red', pediment=True,
                       tymp_mat='red')
    zt = ze + EH + 1.25
    xz_disc(0.0, zt, 0.62, 11.32, 11.44, 'gold')                          # gilded shields on the red tympana
    xz_disc(0.0, zt, 0.62, 2.26, 2.38, 'gold')
    for yy, s in ((11.45, 1), (2.25, -1)):                                # acroteria
        statue(F, 0.0, yy, ridge - 0.3, 2.6, 'gold', pedestal=0.5, ped_mat='marble')
        for sd in (-1, 1):
            statue(F, sd * 10.4, yy - s * 0.1, ze + EH, 1.9, 'gold', pedestal=0.4, ped_mat='marble')


def flank_tower(sd):
    """Gate tower beside the arch block (x 15..24): arch, gilded medallion, pedimented window, bronze quadriga in front
    of a small pedimented pavilion."""
    xa, xb = sorted((sd * XF0, sd * XF1))
    xc = sd * (XF0 + XF1) / 2
    df, ds = 1.2, 0.35
    yl = FY1 - df - 0.01                                 # front skin line
    xi, xo = sd * XF0, sd * (XF1 - ds - 0.01)            # core: from the gate side to the side skin line
    box(F, (xi + xo) / 2, (8.0 + yl) / 2, 0.0, abs(xo - xi), yl - 8.0, FT_H, 'travertine')
    opening_skin(F, xb, yl, xa, yl, 0.0, FT_H, [(xb - xc, 0.0, 4.4, 8.8, 'arch'), (xb - xc, 16.4, 1.9, 3.8, 'arch')],
                 'travertine', depth=df)
    poly_n('travertine', [(xi, yl, 0), (xi, FY1, 0), (xi, FY1, FT_H), (xi, yl, FT_H)], (-sd, 0, 0))
    p0, p1 = ((xo, 8.0), (xo, FY1)) if sd > 0 else ((xo, FY1), (xo, 8.0))
    opening_skin(F, p0[0], p0[1], p1[0], p1[1], 0.0, FT_H, [(abs(12.0 - p0[1]), 16.4, 1.6, 3.6, 'arch')], 'travertine',
                 depth=ds)
    xs_out = sd * XF1                                    # outer face
    yz_prism(ring_pts(12.0, 16.4 + 3.6 - 0.8, 0.8, 1.05, 10), *sorted((xs_out, xs_out + sd * 0.12)), 'marble')
    # front: plinth, corner pilasters, arch, medallion, pedimented window, red panels, cornices
    box(F, xc, FY1 + 0.1, 0.0, 9.4, 0.4, 0.8, 'marble')
    for x in (sd * 15.6, sd * 23.4):
        box(F, x, FY1 + 0.12, 0.8, 1.1, 0.24, FT_H - 1.6, 'marble')
    xz_ring(xc, 6.6, 2.2, 2.75, FY1, FY1 + 0.16)
    for s2 in (-1, 1):
        box(F, xc + s2 * 2.45, FY1 + 0.15, 6.25, 0.9, 0.5, 0.35, 'marble')
    box(F, xc, FY1 + 0.2, 8.45, 0.9, 0.5, 1.2, 'marble')
    medallion(xc, FY1, 11.7, 0.95)
    for s2 in (-1, 1):
        box(F, xc + s2 * 2.75, FY1 + 0.03, 9.9, 1.2, 0.06, 3.9, 'red')
    xz_ring(xc, 16.4 + 3.8 - 0.95, 0.95, 1.25, FY1, FY1 + 0.12)
    for s2 in (-1, 1):
        box(F, xc + s2 * 1.1, FY1 + 0.06, 16.3, 0.3, 0.12, 2.95, 'marble')
        box(F, xc + s2 * 2.75, FY1 + 0.03, 15.3, 1.2, 0.06, 5.8, 'red')
    box(F, xc, FY1 + 0.1, 16.15, 2.6, 0.3, 0.2, 'marble')
    box(F, xc, FY1 + 0.15, 20.55, 3.8, 0.3, 0.2, 'marble')
    xz_prism([(xc - 1.9, 20.75), (xc + 1.9, 20.75), (xc, 21.6)], FY1, FY1 + 0.3, 'marble')
    cornice(F, xb, FY1, xa, FY1, 14.6, 0.6, 0.5, 'marble')
    band(F, xb, FY1, xa, FY1, 21.75, 0.45, 0.1, 'red')
    cornice(F, xb, FY1, xa, FY1, 22.6, 0.8, 0.7, 'marble')
    q0, q1 = ((sd * XF1, 8.0), (sd * XF1, FY1)) if sd > 0 else ((sd * XF1, FY1), (sd * XF1, 8.0))
    cornice(F, q0[0], q0[1], q1[0], q1[1], 14.6, 0.6, 0.5, 'marble')
    band(F, q0[0], q0[1], q1[0], q1[1], 21.75, 0.45, 0.1, 'red')
    cornice(F, q0[0], q0[1], q1[0], q1[1], 22.6, 0.8, 0.7, 'marble')
    box(F, xc, (8.0 + FY1 + 0.3) / 2, FT_H - 0.1, 9.6, FY1 + 0.3 - 8.0, 0.2, 'paving')
    # arena-side face (y = 8, seen over the stall terrace): the same cornices, red frieze, a medallion, red panels
    cornice(F, xa, 8.0, xb, 8.0, 14.6, 0.6, 0.5, 'marble')
    band(F, xa, 8.0, xb, 8.0, 21.75, 0.45, 0.1, 'red')
    cornice(F, xa, 8.0, xb, 8.0, 22.6, 0.8, 0.7, 'marble')
    medallion(xc, 8.0, 18.2, 0.95, 'gold', -1)
    for s2 in (-1, 1):
        box(F, xc + s2 * 2.75, 7.97, 15.6, 1.2, 0.06, 5.4, 'red')
    # pavilion with a small pediment, bronze quadriga in front of it
    pz = FT_H + 0.1
    box(F, xc, 10.3, pz, 8.2, 4.4, 4.0, 'travertine')
    for s2 in (-1, 1):
        box(F, xc + s2 * 3.75, 12.55, pz, 0.6, 0.2, 4.0, 'marble')
    xz_prism(_arch_pts(xc - 0.8, xc + 0.8, pz + 2.6, 10) + [(xc + 0.8, pz + 0.5), (xc - 0.8, pz + 0.5)], 12.5, 12.53,
             'gallery_wall')
    xz_ring(xc, pz + 2.6, 0.8, 1.05, 12.5, 12.62)
    rg = gable_roof(F, xc, 10.3, pz + 4.0, 8.4, 4.4, 22.0, 'y', 0.4, gable_mat='red', pediment=True,
                    tymp_mat='red')
    xz_disc(xc, pz + 4.0 + 0.62, 0.32, 12.52, 12.62, 'gold', 12)
    statue(F, xc, 12.75, rg - 0.25, 1.5, 'gold', pedestal=0.3, ped_mat='marble')
    box(F, xc, 14.4, FT_H + 0.1, 4.4, 3.2, 1.0, 'marble')
    box(F, xc, 14.4, FT_H + 1.0, 4.7, 3.5, 0.2, 'marble')
    quadriga(F, xc, 14.5, FT_H + 1.2, 0.9, 'bronze', '+Y')


def wing(sd):
    """Two-storey wing x 24..68: arcade on red piers with marble half-columns, chariot-relief frieze, terrace."""
    xa, xb = sorted((sd * XF1, sd * XE0))
    xm, L = (xa + xb) / 2, xb - xa
    yc = WY - WT / 2
    arcade(F, xb, yc, xa, yc, 0.0, 8.0, WT, NBAY, 'red', open_w=4.4, open_h=7.0, back=None, impost_mat='marble')
    # gallery behind the arches
    box(F, xm, 10.85, 0.0, L, 0.5, 8.0, 'gallery_wall')
    add_poly('gallery_floor', [Vector((xa, 11.1, 0.03)), Vector((xb, 11.1, 0.03)), Vector((xb, 12.95, 0.03)),
                               Vector((xa, 12.95, 0.03))])
    box(F, xm, 11.45, 7.2, L, 0.7, 0.8, 'gallery_wall')
    zs = 7.0 - 2.2
    for k in range(NBAY):
        xc = xa + (k + 0.5) * BAY
        kg = k if sd > 0 else NBAY - 1 - k               # bay counted from the gate
        xz_ring(xc, zs, 2.2, 2.62, WY, WY + 0.14)
        box(F, xc, 11.12, 0.0, 2.0, 0.04, 3.6, 'dark')    # door in the gallery wall
        if kg % 2 == 0:
            festoon(xc, 2.2, zs, WY - 0.25, 2.2)
        relief_panel(xc, WY, 10.3, 5.4, 1.7, -sd, kg % 2)
    piers = [xa + k * BAY for k in range(1, NBAY)]
    for x in piers + [xa + 0.8, xb - 0.8]:
        box(F, x, WY + 0.3, 0.0, 1.15, 1.0, 1.0, 'marble')
        column(F, x, WY + 0.25, 1.0, 7.0, 0.4, 'marble', 'ionic', 0, 12)
    entablature(F, xa, WY + 0.25, xb, WY + 0.25, 8.0, 1.1, 1.15, 'marble', 'marble')
    box(F, xm, yc, 8.0, L, WT, 3.75, 'travertine')                                     # frieze storey
    for x in piers:
        medallion(x, WY, 10.3, 0.38)
    cornice(F, xb, WY, xa, WY, 11.75, 0.6, 0.6, 'marble')
    box(F, xm, (7.9 + WY) / 2, 11.6, L, WY - 7.9, TOP - 11.6, 'marble')               # terrace slab, flush with the stall top
    lattice_rail(F, xa + 0.2, WY - 0.35, xb - 0.2, WY - 0.35, TOP, 1.1)
    for x in piers:
        statue(F, x, WY - 0.35, TOP, 2.4, 'marble', pedestal=1.3, ped_mat='marble')
    for kk in (1, 4):
        x = sd * (XF1 + (kk + 0.5) * BAY)
        torch_column(F, x, WY - 1.5, TOP, 3.2)


def end_tower(sd):
    """End tower (16 x 16 m at x = +-76): arched windows in two storeys, cornices, quoins, pyramid roof, and a
    tetrastyle pedimented porch on the street side."""
    xa, xb = sorted((sd * XE0, sd * X_END))
    cx, cy = sd * (XE0 + X_END) / 2, 2.0
    ya, yb = cy - TOWER_W / 2, cy + TOWER_W / 2
    H = 23.5
    inner, outer = ('W', 'E') if sd > 0 else ('E', 'W')
    box(F, cx, cy, -8.0, TOWER_W + 0.8, TOWER_W + 0.8, 8.0, 'tuff')                  # foundation
    s2, s3 = (10.8, 1.8, 3.4), (17.0, 1.8, 3.6)
    xs, ys = (cx - 4.8, cx, cx + 4.8), (cy - 4.8, cy, cy + 4.8)
    ops = {'S': [(x,) + s2 + ('arch',) for x in xs] + [(x,) + s3 + ('arch',) for x in xs],
           'N': [(x,) + s3 + ('arch',) for x in xs] + [(cx, 1.0, 3.2, 6.6, 'arch')],
           outer: [(y,) + s2 + ('arch',) for y in ys] + [(y,) + s3 + ('arch',) for y in ys] + [(cy, 0.0, 3.4, 6.2, 'arch')],
           inner: [(y,) + s3 + ('arch',) for y in ys]}
    clad_box(xa, xb, ya, yb, 0.0, H, 'travertine', 0.4, ops)
    box(F, cx, yb - 0.38, 1.0, 3.0, 0.06, 5.0, 'bronze')                               # bronze door behind the porch
    box(F, cx, cy, 0.0, TOWER_W + 0.5, TOWER_W + 0.5, 1.0, 'marble')                   # plinth
    for x in (xa + 0.45, xb - 0.45):
        for y in (ya + 0.45, yb - 0.45):
            box(F, x, y, 1.0, 1.1, 1.1, H - 1.4, 'marble')                             # quoins
    cornice4(xa, xb, ya, yb, 9.8, 0.5, 0.4)
    cornice4(xa, xb, ya, yb, 16.0, 0.5, 0.4)
    for (p, q) in (((xa, ya), (xb, ya)), ((xb, ya), (xb, yb)), ((xb, yb), (xa, yb)), ((xa, yb), (xa, ya))):
        band(F, p[0], p[1], q[0], q[1], 21.7, 0.6, 0.08, 'red')
    cornice4(xa, xb, ya, yb, 23.15, 0.8, 0.75)
    apex = hip_roof(F, cx, cy, H, TOWER_W, TOWER_W, 26.0, 0.7)
    sphere(F, cx, cy, apex + 0.3, 0.4, 'gold', 8, 6)
    medallion(cx, yb, 15.0, 0.85)
    # porch
    pw, yp = 12.0, 17.0
    box(F, cx, (yb + yp) / 2, 0.0, pw, yp - yb, 1.0, 'marble')
    box(F, cx, yp - 0.2, 0.75, pw + 0.3, 0.5, 0.25, 'marble')
    box(F, cx, yp + 0.3, 0.0, pw, 0.6, 0.667, 'marble')
    box(F, cx, yp + 0.9, 0.0, pw, 0.6, 0.333, 'marble')
    for dx in (-4.95, -1.65, 1.65, 4.95):
        column(F, cx + dx, 16.2, 1.0, 9.0, 0.5, 'marble', 'corinthian', 0, 12)
    for s2_ in (-1, 1):
        box(F, cx + s2_ * 5.45, (yb + 13.6) / 2, 1.0, 0.9, 13.6 - yb, 9.0, 'travertine')   # antae
        entablature(F, cx + s2_ * 5.45, yb, cx + s2_ * 5.45, 16.2, 10.0, 1.6, 1.0, 'marble', 'red')
    entablature(F, cx - 5.9, 16.2, cx + 5.9, 16.2, 10.0, 1.6, 1.3, 'marble', 'red')
    box(F, cx, (yb + 16.2) / 2, 10.0, 10.4, 16.2 - yb, 1.5, 'marble')                  # ceiling
    rp = gable_roof(F, cx, 13.35, 11.6, 12.4, 7.3, 16.0, 'y', 0.5, gable_mat='red', pediment=True, tymp_mat='red')
    xz_disc(cx, 12.3, 0.45, 17.02, 17.12, 'gold', 12)
    statue(F, cx, 17.15, rp - 0.2, 1.8, 'gold', pedestal=0.35, ped_mat='marble')
    for s2_ in (-1, 1):
        statue(F, cx + s2_ * 6.0, 17.0, 11.6, 1.5, 'marble', pedestal=0.3, ped_mat='marble')
    # shoulder between the wing and the porch
    fa, fb = sorted((sd * XE0, sd * (cx * sd - pw / 2)))
    box(F, (fa + fb) / 2, (yb + WY) / 2, 0.0, fb - fa, WY - yb, TOP, 'travertine')
    cornice(F, fb, WY, fa, WY, 11.75, 0.6, 0.6, 'marble')
    box(F, (fa + fb) / 2, WY - 0.1, 0.0, fb - fa, 0.5, 1.0, 'marble')


# ------------------------------------------------------------------ central gate (arena side; detailed, own module)
build_gate(F, street=False)

# ------------------------------------------------------------------ stall rows and herms (arena side)
for sd in (-1, 1):
    for i in range(6):
        stall(i, sd)
    for i in range(1, 6):
        x = sd * (X_GATE + i * PITCH)
        herm(x, front_y(x) - 0.2)

# ------------------------------------------------------------------ street front
platform()
roof_paving()
arch_block()
loggia()
for sd in (-1, 1):
    flank_tower(sd)
    wing(sd)
    end_tower(sd)

human(F, 8.0, 18.0, 0.0)
preview_ground(ST_Z)
import bpy
bpy.context.scene.eevee.taa_render_samples = 16      # low-sample previews
STREET_CAMS = [('street', Vector((0, 1, 0)), 30), ('street34', Vector((0.8, 1, 0)).normalized(), 24),
               ('street_low', Vector((0, 1, 0)), 8)]
finish('rome_circus_carceres', front='-Y', extra_cams=STREET_CAMS + [('arena', Vector((0, -1, 0)), 24)])

# ------------------------------------------------------------------ street views again with the sun on the street side,
# plus close-ups (previews only; the GLB is already written)
from bl_kit import _look
sc = bpy.context.scene
sun = bpy.data.objects['sun']
sun.rotation_euler = Vector((-0.4, -0.7, -0.9)).normalized().to_track_quat('-Z', 'Y').to_euler()   # sun over +X+Y
ob = bpy.data.objects['rome_circus_carceres']
cam = sc.camera
cam.data.type = 'PERSP'; cam.data.lens = 35
bb = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
mn = Vector((min(v.x for v in bb), min(v.y for v in bb), max(ST_Z - 0.45, min(v.z for v in bb))))
mx = Vector((max(v.x for v in bb), max(v.y for v in bb), max(v.z for v in bb)))
ctr = (mn + mx) / 2
th = math.tan(math.atan(0.5 * 36 / 35) * 0.9); tv = math.tan(math.atan(0.5 * 36 * 9 / 16 / 35) * 0.9)
corners = [Vector((x, y, z)) for x in (mn.x, mx.x) for y in (mn.y, mx.y) for z in (mn.z, mx.z)]
OUT = os.path.join(ROOT, 'renders', 'rome_circus_carceres')


def shot(nm):
    sc.render.filepath = os.path.join(OUT, nm + '.png')
    bpy.ops.render.render(write_still=True)


for nm, dvec, el in STREET_CAMS:
    e = math.radians(el); dv = Vector((dvec.x * math.cos(e), dvec.y * math.cos(e), math.sin(e))).normalized()
    rt = dv.cross(Vector((0, 0, 1))).normalized(); up = rt.cross(dv).normalized()
    dist = max(max((c - ctr).dot(dv) + abs((c - ctr).dot(rt)) / th, (c - ctr).dot(dv) + abs((c - ctr).dot(up)) / tv)
               for c in corners)
    cam.location = ctr + dv * dist; _look(cam, ctr)
    shot(nm)
for nm, pos, tgt in (('close_centre', (16.0, 66.0, 17.0), (0.0, 12.0, 14.0)),
                     ('close_wing', (28.0, 40.0, 7.5), (48.0, 13.0, 7.0)),
                     ('close_end', (50.0, 46.0, 9.0), (76.0, 12.0, 10.0)),
                     ('close_low', (-11.0, 34.0, 0.7), (2.0, 14.0, 10.0))):
    cam.location = Vector(pos); _look(cam, Vector(tgt))
    shot(nm)
sun.rotation_euler = Vector((-0.25, 0.7, -0.9)).normalized().to_track_quat('-Z', 'Y').to_euler()    # sun over +X-Y
cam.location = Vector((14.0, -60.0, 19.0)); _look(cam, Vector((0.0, -4.0, 15.0)))
shot('close_arena')
