"""rome_circus_gate_e · the gate in the middle of the curved (east) end of the Circus Maximus.

A solid gate block that cuts through the curved stands on the track axis: a triumphal-gate front toward the arena,
a two-storey pavilion with a loggia above the stands, a monumental entrance between two stair towers on the street.
【史】 The curved end had a gate on the axis of the track (the Arch of Titus of AD 81 later stood there and does NOT
exist in AD 56-58: no triumphal-arch inscription, no Flavian arch). The look of this gate is a reconstruction.

FRAME (the same as rome_cavea_c; the page places it with the same origin and rotation as the joint between the two
middle wedges): origin = centre of the curve, Blender +Z up, z = 0 = arena level; the gate sits on the +Y axis
(phi = 0), arena toward the origin. Footprint x -13..13, y 37..90 (mouldings, steps and roofs included).
  Arena face: wall face y 38.0, podium (z 0..3.2, the arena wall's height) and columns project to y 37.0.
      Central arch 7 x 12 m (x -3.5..3.5, crown z 12), side arches 3.5 x 7 m (centres x -+7.75, crown z 7);
      wooden doors with bronze studs 1.5 m back in the central arch (y 39.5), 0.75 m back in the side arches
      (y 38.75: the arena wall's curve, r 40, passes y 38.86 at the outer jamb x 9.5).
      Four engaged red Corinthian columns (x -+4.875, -+11.375) z 3.2..15.6, entablature z 15.6..17.6,
      attic z 17.6..20.5 with a blank marble panel, gallery of five arched windows z 20.5..27.
  Block: core x -12.5..12.5 (sides with string courses at z 8.3 / 15.3 / 21.3 like the stands' street facade,
      red panels, top cornice); roof terrace z 27.0 with parapets (side parapets top z 28.15).
  Pavilion: x -11..11, y 41..57 on the terrace. Loggia z 27..33 (6 red ionic columns at y 41.5, balustrade);
      upper storey z 33..36.6 with arched windows; hip roof eaves z 36.7, ridge z ~40.1.
      Gilt two-horse chariots on pedestals (top z 28.5) at the two front corners of the terrace (x -+11.975, y 39.35).
  Street face: central entrance x -6.5..6.5, face y 87.4, three-step plinth to y 90 (top z 0.6), arch 7 x 13 m
      (z 0.6..13.6), door 1.5 m back (y 85.9), paired engaged red columns on pedestals, entablature z 15..16.9,
      attic to z 21.6, windows above; stair towers x -+(6.5..12.5), y 82.5..89.5, walls to z 31.5, hip roofs apex
      z ~33.3, a side door in each tower's street face.
The stands (rome_cavea_c wedges, section from rome_cavea_s.CAP_PTS) top out at z 25; every side of the block is at
least z 27 high, so the wedges that run into the block never show their section.

Run:  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_circus_gate_e.py"
  -> assets/models/rome/rome_circus_gate_e.glb, renders/rome_circus_gate_e/{front,side,three,top,street}.png and
     *_wedges.png and arches_close.png (with two preview rome_cavea_c wedges at -+11.25 deg, never exported).
"""
import os, sys, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                          # noqa: F401,F403  box, cyl, column, cornice, band, opening_skin, hip_roof, ...
import bl_kit as _bk
import rome_cavea_s as CS                 # the stands' straight section (CAP_PTS) and build_module()
import rome_cavea_c as CC                 # the curved wedge: R_MID, WEDGE, bend_object()
import bpy

_arch_pts = _bk._arch_pts
NAME = 'rome_circus_gate_e'

# ---------------------------------------------------------------- alignment numbers
R_ARENA = CC.R_MID - 21.0                  # 40: arena wall outer face of the wedge
R_STREET = CC.R_MID + 21.0                 # 82: street facade outer face of the wedge
STAND_TOP = max(z for _, z in CS.CAP_PTS)  # 25: top of the stands' section
HXG = 13.0                                 # half width of the footprint (mouldings included)
HXC = 12.5                                 # half width of the core walls (string courses project to 13.0)
Y_FOOT = 37.0                              # arena edge of the footprint (podium, columns, cornices)
Y_AF = 38.0                                # arena wall face of the gate
Y_AB = 40.0                                # back of the arena front slab = front of the core
Y_TOW = 82.5                               # stair towers y 82.5 .. 89.5
Y_TOWF = 89.5
Y_SF = 87.4                                # street face of the central entrance
Y_END = 90.0                               # street edge of the footprint (bottom step)
Z_TERR = 27.0                              # roof terrace
Z_TOWER = 31.5                             # stair tower walls
assert R_ARENA == 40.0 and R_STREET == 82.0


# ---------------------------------------------------------------- small helpers (world frame, rot 0)
def V(x, y, z):
    return Vector((x, y, z))


def poly_out(mat, pts, d):
    """add_poly with the winding chosen so the face normal points along d."""
    n = Vector((0, 0, 0))
    for i in range(len(pts)):
        a, b = pts[i], pts[(i + 1) % len(pts)]
        n.x += (a.y - b.y) * (a.z + b.z); n.y += (a.z - b.z) * (a.x + b.x); n.z += (a.x - b.x) * (a.y + b.y)
    add_poly(mat, pts if n.dot(Vector(d)) >= 0 else list(reversed(pts)))


def orient(x0, y0, x1, y1, out):
    """Order a wall line so that `out` (the outside) is on its right (the kit convention)."""
    dx, dy = x1 - x0, y1 - y0
    if dy * out[0] - dx * out[1] < 0:
        return x1, y1, x0, y0
    return x0, y0, x1, y1


def cor(x0, y0, x1, y1, z, out, h=0.6, proj=0.5, mat='marble', inset=True):
    """Kit cornice on an axis line with the outside `out`; inset=True keeps its ends within the line."""
    a = orient(x0, y0, x1, y1, out)
    if inset:
        L = math.hypot(a[2] - a[0], a[3] - a[1]); ux, uy = (a[2] - a[0]) / L, (a[3] - a[1]) / L
        a = (a[0] + ux * proj, a[1] + uy * proj, a[2] - ux * proj, a[3] - uy * proj)
    cornice(None, a[0], a[1], a[2], a[3], z, h, proj, mat)


def skin(x0, y0, x1, y1, z0, h, ops, out, mat='travertine', depth=0.4, caps=True, inner='dark'):
    """opening_skin on an axis line (outside `out`), plus end caps that close the skin's open ends."""
    a = orient(x0, y0, x1, y1, out)
    opening_skin(None, a[0], a[1], a[2], a[3], z0, h, ops, mat, depth=depth, inner=inner)
    if caps:
        ox, oy = out[0] * (depth + 0.01), out[1] * (depth + 0.01)
        L = math.hypot(a[2] - a[0], a[3] - a[1]); ux, uy = (a[2] - a[0]) / L, (a[3] - a[1]) / L
        for (px, py, s) in ((a[0], a[1], -1), (a[2], a[3], 1)):
            poly_out(mat, [V(px, py, z0), V(px + ox, py + oy, z0), V(px + ox, py + oy, z0 + h), V(px, py, z0 + h)],
                     (ux * s, uy * s, 0))


def red_column(x, y, z0, h, r, order='corinthian', shaft='red', trim='marble', seg=12):
    """Column with a red shaft and a marble base and capital."""
    ph = r * 0.5
    box(None, x, y, z0, r * 2.5, r * 2.5, ph * 0.55, trim)
    cyl(None, x, y, z0 + ph * 0.55, r * 1.18, ph * 0.45, trim, seg, r_top=r * 1.02)
    column(None, x, y, z0 + ph, h - ph, r, shaft, order, 0, seg, base=False, cap_mat=trim)


def stud(x, y, z, out_y, s=0.075):
    """A bronze door stud: a low four-sided pyramid on the door plane y, pointing to out_y (-1 or +1)."""
    b = [V(x - s, y, z - s), V(x + s, y, z - s), V(x + s, y, z + s), V(x - s, y, z + s)]
    ap = V(x, y + out_y * 0.06, z)
    for i in range(4):
        tri = [b[i], b[(i + 1) % 4], ap]
        c = (tri[0] + tri[1] + tri[2]) / 3
        poly_out('bronze', tri, (c - V(x, y, z)) + V(0, out_y * 0.02, 0))


def door_leaves(c, w, z0, zs, yd, out_y, rows=1.05, cols=0.78):
    """Seam, bronze bands and studs on a door of width w whose plane is y = yd (arched top: springing zs)."""
    r = w / 2; top = zs + r
    yo = yd + out_y * 0.015
    box(None, c, yd + out_y * 0.03, z0, 0.1, 0.06, top - z0 - 0.08, 'dark')                 # meeting stiles
    nb = max(2, int(round((zs - z0) / 2.6)))
    zb = [z0 + (k + 0.5) * (zs - z0) / nb for k in range(nb)]
    for z in zb:                                                                             # bronze straps
        box(None, c, yd + out_y * 0.03, z - 0.09, w - 0.12, 0.06, 0.18, 'bronze')
    nx = max(2, int(round((w - 0.5) / cols)))
    for k in range(nx):
        x = c - w / 2 + 0.25 + (k + 0.5) * (w - 0.5) / nx
        if abs(x - c) < 0.18:
            continue
        z = z0 + 0.55
        while z < top - 0.4:
            if any(abs(z - q) < 0.3 for q in zb):
                z += rows; continue
            if z > zs and abs(x - c) > math.sqrt(max(0.0, r * r - (z - zs) ** 2)) - 0.35:
                z += rows; continue
            stud(x, yo, z, out_y)
            z += rows


def archivolt(c, w, zs, yf, out_y, aw=0.5, proud=0.12, seg=12, mat='marble'):
    """A moulded arch frame on the face plane yf around an arch of width w springing at zs."""
    r0 = w / 2; r1 = r0 + aw; y1 = yf + out_y * proud
    P = lambda r, t, y: V(c - r * math.cos(t), y, zs + r * math.sin(t))
    for i in range(seg):
        t0, t1 = math.pi * i / seg, math.pi * (i + 1) / seg
        tm = (t0 + t1) / 2
        poly_out(mat, [P(r0, t0, y1), P(r1, t0, y1), P(r1, t1, y1), P(r0, t1, y1)], (0, out_y, 0))
        poly_out(mat, [P(r1, t0, yf), P(r1, t1, yf), P(r1, t1, y1), P(r1, t0, y1)], (-math.cos(tm), 0, math.sin(tm)))
        poly_out(mat, [P(r0, t0, yf), P(r0, t1, yf), P(r0, t1, y1), P(r0, t0, y1)], (math.cos(tm), 0, -math.sin(tm)))
    for t in (0.0, math.pi):
        poly_out(mat, [P(r0, t, yf), P(r1, t, yf), P(r1, t, y1), P(r0, t, y1)], (0, 0, -1))
    # imposts and keystone
    for xx in (c - r0, c + r0):
        sgn = -1 if xx < c else 1
        box(None, xx + sgn * 0.12, yf + out_y * 0.05, zs - 0.35, 0.75, 0.5, 0.35, mat)
    box(None, c, yf + out_y * 0.1, zs + r0 - 0.25, 0.7, 0.4, 1.05, mat)


def arch_face(x0, x1, yf, yb, z0, z1, arches, out_y, mat='travertine', seg=12):
    """A wall slab x0..x1 with its face on y = yf (facing out_y), back on yb, from z0 to z1, with arched openings
    from z0: arches = [(xc, w, crown above z0, recess)]. Each opening has reveals `recess` deep, a passage floor
    and a closed wooden door with bronze studs at the back of the recess."""
    ops = sorted(arches)
    cuts = [x0] + [((ops[i][0] + ops[i][1] / 2) + (ops[i + 1][0] - ops[i + 1][1] / 2)) / 2 for i in range(len(ops) - 1)] + [x1]
    for k, (xc, w, h, rec) in enumerate(ops):
        u0, u1 = cuts[k], cuts[k + 1]
        a, b = xc - w / 2, xc + w / 2; zs = z0 + h - w / 2
        yd = yf - out_y * rec
        arch = _arch_pts(a, b, zs, seg)
        p2 = [(u0, z0), (a, z0), (a, zs)] + arch[1:-1] + [(b, zs), (b, z0), (u1, z0), (u1, z1), (u0, z1)]
        poly_out(mat, [V(u, yf, z) for u, z in p2], (0, out_y, 0))
        rim = [(a, z0), (a, zs)] + arch[1:-1] + [(b, zs), (b, z0)]
        for i in range(len(rim) - 1):
            (ua, za), (ub, zb) = rim[i], rim[i + 1]
            xm, zm = (ua + ub) / 2, (za + zb) / 2
            poly_out(mat, [V(ua, yf, za), V(ub, yf, zb), V(ub, yd, zb), V(ua, yd, za)], (xc - xm, 0, min(zm, zs) - zm))
        poly_out('wood', [V(u, yd, z) for u, z in rim], (0, out_y, 0))
        poly_out('paving', [V(a, yf, z0 + 0.01), V(b, yf, z0 + 0.01), V(b, yd, z0 + 0.01), V(a, yd, z0 + 0.01)], (0, 0, 1))
        door_leaves(xc, w, z0, zs, yd, out_y)
    poly_out(mat, [V(x0, yf, z1), V(x1, yf, z1), V(x1, yb, z1), V(x0, yb, z1)], (0, 0, 1))
    poly_out(mat, [V(x0, yf, z0), V(x0, yb, z0), V(x0, yb, z1), V(x0, yf, z1)], (-1, 0, 0))
    poly_out(mat, [V(x1, yf, z0), V(x1, yb, z0), V(x1, yb, z1), V(x1, yf, z1)], (1, 0, 0))
    poly_out(mat, [V(x0, yb, z0), V(x1, yb, z0), V(x1, yb, z1), V(x0, yb, z1)], (0, -out_y, 0))


def biga(x, y, z0, s=1.0, mat='gold'):
    """A stylised two-horse chariot with its driver, facing -y (toward the arena). ~1.6 x 3.25 m at s = 1."""
    T = Frame(x, y, z0, 0.0)
    for hx in (-0.42, 0.42):
        hx *= s
        beam(T, hx, 0.5 * s, 1.15 * s, hx, -1.0 * s, 1.15 * s, 0.42 * s, 0.5 * s, mat)               # body
        beam(T, hx, -0.9 * s, 1.25 * s, hx, -1.25 * s, 1.85 * s, 0.24 * s, 0.32 * s, mat)            # neck
        beam(T, hx, -1.2 * s, 1.85 * s, hx, -1.55 * s, 1.6 * s, 0.2 * s, 0.24 * s, mat)              # head
        for (ly, lx) in ((0.35, -0.12), (0.35, 0.12), (-0.85, -0.12), (-0.85, 0.12)):
            beam(T, hx + lx * s, ly * s, 0.95 * s, hx + lx * s, ly * s, 0.0, 0.1 * s, 0.1 * s, mat)
    beam(T, 0, 0.75 * s, 0.85 * s, 0, -0.6 * s, 1.0 * s, 0.1 * s, 0.1 * s, mat)                       # pole
    box(T, 0, 1.25 * s, 0.45 * s, 1.25 * s, 0.9 * s, 0.85 * s, mat)                                    # car
    for sd in (-1, 1):
        vdisc(T, sd * 0.72 * s, 1.35 * s, 0.55 * s, 0.55 * s, 0.12 * s, mat, 12)
    statue(T, 0, 1.3 * s, 0.6 * s, 1.9 * s, mat, pedestal=0.0)


# ---------------------------------------------------------------- the gate
def arena_front():
    # slab with the three arches (face y 38, back y 40), z 0 .. 20.5
    arch_face(-HXG, HXG, Y_AF, Y_AB, 0.0, 20.5,
              [(-7.75, 3.5, 7.0, 0.75), (0.0, 7.0, 12.0, 1.5), (7.75, 3.5, 7.0, 0.75)], -1)
    archivolt(0.0, 7.0, 8.5, Y_AF, -1, aw=0.6)
    for sx in (-1, 1):
        archivolt(sx * 7.75, 3.5, 5.25, Y_AF, -1, aw=0.4)
    # podium z 0 .. 3.2 (the arena wall's height) on the piers, projecting to y 37.0
    for xa, xb in ((-HXG, -9.5), (-6.0, -3.5), (3.5, 6.0), (9.5, HXG)):
        box(None, (xa + xb) / 2, 37.575, 0.0, xb - xa, 0.85, 3.2, 'marble')
        box(None, (xa + xb) / 2, 37.5, 0.0, xb - xa, 1.0, 0.4, 'marble')            # base moulding
        box(None, (xa + xb) / 2, 37.5, 2.85, xb - xa, 1.0, 0.35, 'marble')          # crown moulding
    # four engaged red columns on the podium, entablature, attic
    for x in (-11.375, -4.875, 4.875, 11.375):
        red_column(x, 37.84, 3.2, 12.4, 0.62)
    box(None, 0.0, 37.725, 15.6, 2 * HXG, 0.55, 0.85, 'marble')                     # architrave
    box(None, 0.0, 37.75, 16.45, 2 * HXG, 0.5, 0.6, 'marble')                       # frieze
    box(None, 0.0, 37.5, 17.05, 2 * HXG, 1.0, 0.55, 'marble')                       # cornice (to y 37.0)
    box(None, 0.0, 37.97, 17.85, 9.8, 0.06, 2.0, 'marble')                          # attic: blank panel frame
    box(None, 0.0, 37.93, 18.0, 9.2, 0.06, 1.7, 'travertine')                       # ... and the blank field
    for sx in (-1, 1):
        box(None, sx * 8.6, 37.96, 18.0, 4.6, 0.08, 1.7, 'red')                     # attic side panels
        box(None, sx * 7.75, 37.96, 9.6, 2.6, 0.08, 4.4, 'red')                     # panels over the side arches
    box(None, 0.0, 37.8, 20.1, 2 * HXG, 0.4, 0.4, 'marble')                         # attic cornice
    # gallery of five arched windows z 20.5 .. 27 (core y 38.42 .. 40, skin face y 38.01)
    box(None, 0.0, (38.42 + Y_AB) / 2, 20.5, 2 * HXG, Y_AB - 38.42, Z_TERR - 20.5, 'travertine')
    skin(-HXG, 38.42, HXG, 38.42, 20.5, 6.1,
         [(13.0 + x, 1.0, 2.0, 3.6, 'arch') for x in (-9.2, -4.6, 0.0, 4.6, 9.2)], (0, -1))
    for x in (-11.4, -6.9, -2.3, 2.3, 6.9, 11.4):
        box(None, x, 37.98, 21.6, 0.9, 0.06, 3.3, 'red')
    cor(-HXG, Y_AF, HXG, Y_AF, 26.73, (0, -1), 0.6, 0.5)


def core_and_sides():
    # the solid core that swallows the stands' section, roof terrace on top
    box(None, 0.0, (Y_AB + Y_TOW) / 2, 0.0, 2 * HXC, Y_TOW - Y_AB, 26.8, 'travertine')
    box(None, 0.0, (Y_TOW + 85.4) / 2, 0.0, 13.0, 85.4 - Y_TOW, 26.8, 'travertine')     # behind the street arch
    box(None, 0.0, (Y_AB + 87.0) / 2, 26.8, 2 * HXC, 87.0 - Y_AB, 0.2, 'paving')
    for sx in (-1, 1):
        out = (sx, 0)
        x = sx * HXC
        # string courses at the stands' street-facade floors, continuing over the tower sides; top cornice
        for z in (8.3, 15.3, 21.3, 26.73):
            cor(x, Y_AB, x, Y_TOWF, z, out, 0.6, 0.5)
        # red panels in the two upper zones (the zones below are behind the seats)
        for y in (44.0, 50.0, 56.0, 62.0, 68.0, 74.0, 80.0):
            box(None, x + sx * 0.03, y, 16.3, 0.08, 2.6, 4.0, 'red')
            box(None, x + sx * 0.03, y, 22.3, 0.08, 2.6, 3.4, 'red')
        # parapet along the side of the terrace
        box(None, sx * 12.25, (40.8 + Y_TOW) / 2, Z_TERR, 0.5, Y_TOW - 40.8, 1.0, 'travertine')
        box(None, sx * 12.25, (40.8 + Y_TOW) / 2, Z_TERR + 1.0, 0.7, Y_TOW - 40.8, 0.15, 'marble')
        # corner pedestals with the gilt two-horse chariots, front corners of the terrace
        cx = sx * 11.975
        box(None, cx, 39.25, Z_TERR, 1.95, 3.3, 0.25, 'marble')
        box(None, cx, 39.25, Z_TERR + 0.25, 1.75, 3.1, 1.0, 'travertine')
        box(None, cx, 39.25, Z_TERR + 1.25, 1.95, 3.3, 0.25, 'marble')
        biga(cx, 39.35, Z_TERR + 1.5, 1.1)
    balustrade(None, -11.0, 38.75, 11.0, 38.75, Z_TERR, 1.1, 'marble', 2.2, 0.3)


def pavilion():
    # loggia storey z 27 .. 33: end piers, back wall with three doors, 6 red ionic columns, balustrade
    for sx in (-1, 1):
        box(None, sx * 10.2, (41.0 + 45.8) / 2, Z_TERR, 1.6, 4.8, 6.0, 'travertine')
        box(None, sx * 10.2, 40.97, 28.0, 0.9, 0.06, 3.6, 'red')
    box(None, 0.0, (45.8 + 57.0) / 2, Z_TERR, 22.0, 57.0 - 45.8, 6.0, 'travertine')
    skin(-9.4, 45.8, 9.4, 45.8, Z_TERR, 6.0,
         [(9.4, 0.0, 2.4, 3.8, 'arch'), (4.0, 0.0, 1.6, 3.0, 'arch'), (14.8, 0.0, 1.6, 3.0, 'arch')], (0, -1),
         caps=False)
    for x in (-6.7, 6.7, -1.75, 1.75):
        box(None, x, 45.36, 28.0, 1.0, 0.06, 2.8, 'red')
    for x in (-8.0, -4.8, -1.6, 1.6, 4.8, 8.0):
        red_column(x, 41.5, Z_TERR, 5.2, 0.3, order='ionic', seg=10)
    balustrade(None, -9.4, 41.5, 9.4, 41.5, Z_TERR, 1.05, 'marble', 3.2, 0.26)
    box(None, 0.0, 41.5, 32.2, 22.0, 1.0, 0.45, 'marble')                         # architrave
    box(None, 0.0, 41.5, 32.65, 22.0, 0.9, 0.35, 'red')                           # frieze
    for sx in (-1, 1):                                                            # side and back bands of storey 1
        box(None, sx * 11.0, 49.0, 32.4, 0.3, 16.0, 0.4, 'marble')
        for y in (49.0, 54.0):
            box(None, sx * 11.03, y, 28.2, 0.06, 2.6, 3.2, 'red')
    box(None, 0.0, 57.0, 32.4, 22.3, 0.3, 0.4, 'marble')
    # upper storey z 33 .. 36.6 with arched windows on all four sides
    box(None, 0.0, 49.0, 33.0, 21.2, 15.2, 3.6, 'travertine')
    win = lambda us: [(u, 0.45, 1.5, 2.6, 'arch') for u in us]
    skin(-11.0, 41.4, 11.0, 41.4, 33.0, 3.6, win((3.0, 7.0, 11.0, 15.0, 19.0)), (0, -1))
    skin(-11.0, 56.6, 11.0, 56.6, 33.0, 3.6, win((3.0, 7.0, 11.0, 15.0, 19.0)), (0, 1))
    for sx in (-1, 1):
        skin(sx * 10.6, 41.4, sx * 10.6, 56.6, 33.0, 3.6, win((3.6, 7.6, 11.6)), (sx, 0), caps=False)
    for (x0, y0, x1, y1, out) in ((-11.0, 41.0, 11.0, 41.0, (0, -1)), (-11.0, 57.0, 11.0, 57.0, (0, 1)),
                                  (11.0, 41.0, 11.0, 57.0, (1, 0)), (-11.0, 41.0, -11.0, 57.0, (-1, 0))):
        band(None, *orient(x0, y0, x1, y1, out), 35.95, 0.3, 0.1, 'red')
        cor(x0, y0, x1, y1, 36.6, out, 0.5, 0.4, inset=False)
    return hip_roof(None, 0.0, 49.0, 36.7, 22.0, 16.0, pitch=21.5, overhang=0.6, mat='tile')


def street_front():
    # three-step plinth between the towers (top step z 0.6 runs back under the face)
    for (y0, y1, z) in ((85.4, 88.8, 0.6), (88.8, 89.4, 0.4), (89.4, Y_END, 0.2)):
        box(None, 0.0, (y0 + y1) / 2, 0.0, 13.0, y1 - y0, z, 'marble')
    # face slab y 85.4 .. 87.4 with the big arch (7 x 13 m from z 0.6), door 1.5 m back
    arch_face(-6.5, 6.5, Y_SF, 85.4, 0.6, 21.6, [(0.0, 7.0, 13.0, 1.5)], 1)
    archivolt(0.0, 7.0, 10.1, Y_SF, 1, aw=0.6)
    for sx in (-1, 1):
        # pedestal under each pair of engaged columns, then the columns
        box(None, sx * 5.0, 88.0, 0.6, 2.9, 1.2, 2.2, 'marble')
        box(None, sx * 5.0, 88.0, 2.5, 3.0, 1.3, 0.3, 'marble')
        for x in (4.25, 5.75):
            red_column(sx * x, 87.85, 2.8, 12.2, 0.55)
    box(None, 0.0, 87.92, 15.0, 13.0, 1.05, 0.7, 'marble')                        # architrave
    box(None, 0.0, 87.87, 15.7, 13.0, 0.95, 0.6, 'marble')                        # frieze
    box(None, 0.0, 88.15, 16.3, 13.0, 1.5, 0.6, 'marble')                         # cornice (to y 88.9)
    box(None, 0.0, 87.43, 17.5, 11.4, 0.06, 2.9, 'marble')                        # attic: panel frame
    for x in (-3.7, 3.7):
        box(None, x, 87.47, 17.7, 3.2, 0.06, 2.5, 'red')                          # two red fields
    box(None, 0.0, 87.46, 17.7, 3.6, 0.06, 2.5, 'travertine')                     # blank middle field
    cor(-6.5, Y_SF, 6.5, Y_SF, 21.3, (0, 1), 0.6, 0.5)
    # windows above the attic (core y 85.4 .. 86.99, skin face 87.4)
    box(None, 0.0, (85.4 + 86.99) / 2, 21.6, 13.0, 86.99 - 85.4, 5.2, 'travertine')
    skin(-6.5, 86.99, 6.5, 86.99, 21.6, 5.0, [(u, 0.8, 1.6, 3.0, 'arch') for u in (2.5, 6.5, 10.5)], (0, 1))
    cor(-6.5, Y_SF, 6.5, Y_SF, 26.73, (0, 1), 0.6, 0.5)
    box(None, 0.0, 86.8, Z_TERR, 13.0, 0.5, 1.0, 'travertine')                    # terrace parapet
    box(None, 0.0, 86.8, Z_TERR + 1.0, 13.0, 0.7, 0.15, 'marble')


def towers():
    tops = []
    for sx in (-1, 1):
        xi, xo = sx * 6.5, sx * HXC                       # inner and outer face of the tower
        xc = sx * 9.5
        # core: x 6.5 .. 12.1, y 82.5 .. 89.1; skins on the street face and the outer side
        box(None, sx * (6.5 + 12.1) / 2, (Y_TOW + 89.1) / 2, 0.0, 5.6, 89.1 - Y_TOW, Z_TOWER, 'travertine')
        ops_st = [(3.0, 0.0, 2.0, 4.0, 'rect'), (3.0, 9.6, 1.1, 2.4, 'arch'), (3.0, 16.6, 1.1, 2.4, 'arch'),
                  (3.0, 22.3, 1.1, 2.4, 'arch'), (3.0, 26.4, 1.6, 3.0, 'arch')]
        skin(xo, 89.1, xi, 89.1, 0.0, Z_TOWER, ops_st, (0, 1))
        ops_sd = [(3.3, 9.6, 1.1, 2.4, 'arch'), (3.3, 16.6, 1.1, 2.4, 'arch'), (3.3, 22.3, 1.1, 2.4, 'arch'),
                  (3.3, 26.4, 1.6, 3.0, 'arch')]
        skin(sx * 12.1, Y_TOW, sx * 12.1, 89.1, 0.0, Z_TOWER, ops_sd, (sx, 0))
        # the side door in the street face: wooden leaves with studs, marble lintel and jambs
        box(None, xc, 89.17, 0.0, 2.0, 0.05, 4.0, 'wood')
        box(None, xc, 89.22, 0.0, 0.08, 0.04, 4.0, 'dark')
        for z in (1.0, 2.9):
            box(None, xc, 89.22, z, 1.9, 0.04, 0.16, 'bronze')
            for x in (-0.65, -0.3, 0.3, 0.65):
                stud(xc + x, 89.2, z + 0.5, 1)
        box(None, xc, 89.62, 4.0, 2.9, 0.24, 0.45, 'marble')
        for s2 in (-1, 1):
            box(None, xc + s2 * 1.15, 89.6, 0.0, 0.3, 0.2, 4.0, 'marble')
        # mouldings: street face string courses (the side ones run on from the core), red band, top cornice
        for z in (8.3, 15.3, 21.3):                       # outer end runs to x 13 to meet the side course
            cor(xo, Y_TOWF, xi + sx * 0.5, Y_TOWF, z, (0, 1), 0.6, 0.5, inset=False)
        for (x0, y0, x1, y1, out) in ((xo, Y_TOWF, xi, Y_TOWF, (0, 1)), (xo, Y_TOW, xo, Y_TOWF, (sx, 0)),
                                      (xi, Y_TOW, xo, Y_TOW, (0, -1)), (xi, Y_TOW, xi, Y_TOWF, (-sx, 0))):
            a = orient(x0, y0, x1, y1, out)
            band(None, *a, 29.6, 0.3, 0.12, 'red')
            cor(x0, y0, x1, y1, 31.2, out, 0.6, 0.5, inset=False)
        # door onto the terrace in the tower's back face
        box(None, xc, Y_TOW - 0.03, Z_TERR, 1.6, 0.06, 2.3, 'dark')
        box(None, xc, Y_TOW - 0.08, Z_TERR + 2.3, 2.2, 0.16, 0.25, 'marble')
        tops.append(hip_roof(None, xc, (Y_TOW + Y_TOWF) / 2, Z_TOWER, 6.0, 7.0, pitch=28.0, overhang=0.36, mat='tile'))
    return max(tops)


def build():
    arena_front()
    core_and_sides()
    ridge = pavilion()
    street_front()
    tower_apex = towers()
    return ridge, tower_apex


# ---------------------------------------------------------------- checks
def stand_profile(r):
    """Top z of the stands' section (rome_cavea_s.CAP_PTS) at radius r (0 outside the ring)."""
    y = r - CC.R_MID
    if y < -21.0 or y > 21.0:
        return 0.0
    best = 0.0; P = CS.CAP_PTS
    for i in range(len(P)):
        (y0, z0), (y1, z1) = P[i], P[(i + 1) % len(P)]
        if min(y0, y1) - 1e-9 <= y <= max(y0, y1) + 1e-9:
            best = max(best, max(z0, z1) if abs(y1 - y0) < 1e-9 else z0 + (z1 - z0) * (y - y0) / (y1 - y0))
    return best


def side_check():
    """The stands' section along the gate's side planes vs the gate's side height (terrace z 27, frontispiece 27)."""
    worst = 99.0; where = None
    y = Y_FOOT
    while y <= Y_END:
        for x in (HXC, HXG):
            p = stand_profile(math.hypot(x, y)) + 1.15          # + lattice rail / roof ribs allowance
            gate_h = Z_TOWER if y >= Y_TOW else Z_TERR
            if gate_h - p < worst:
                worst, where = gate_h - p, (x, round(y, 2))
        y += 0.25
    return round(worst, 2), where


# ---------------------------------------------------------------- preview wedges and extra renders
def add_preview_wedges():
    _bk._G.clear()
    CS.build_module()
    w1 = _bk._build_object('preview_wedge_a')
    CC.bend_object(w1)
    w2 = w1.copy(); w2.data = w1.data.copy(); w2.name = 'preview_wedge_b'
    bpy.context.scene.collection.objects.link(w2)
    w1.rotation_euler = (0.0, 0.0, CC.WEDGE)
    w2.rotation_euler = (0.0, 0.0, -CC.WEDGE)
    bpy.context.view_layer.update()
    return w1, w2


def shoot(cam, name, loc, target, lens=35):
    sc = bpy.context.scene
    cam.data.type = 'PERSP'; cam.data.lens = lens
    cam.location = Vector(loc); _bk._look(cam, Vector(target))
    out = os.path.join(_bk.ROOT, 'renders', NAME, name + '.png')
    sc.render.filepath = out; bpy.ops.render.render(write_still=True)
    return out


def main():
    reset()
    preview_ground(-0.05)
    ridge, tower_apex = build()
    ob = _bk._build_object(NAME)
    tris = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    bb = [Vector(c) for c in ob.bound_box]
    rng = [[round(min(v[i] for v in bb), 2), round(max(v[i] for v in bb), 2)] for i in range(3)]
    glb = os.path.join(_bk.ROOT, 'assets', 'models', 'rome', NAME + '.glb')
    CS.export_glb(ob, glb)
    try:
        bpy.context.scene.eevee.taa_render_samples = 16      # low samples: previews only, memory is tight
    except Exception:
        pass
    files = render_previews(ob, NAME, '-Y', extra=(('street', Vector((0.0, 1.0, 0.0)), 12),))
    # two preview wedges of the stands at -+11.25 deg (render only, never exported)
    add_preview_wedges()
    cam = bpy.context.scene.camera
    files.append(shoot(cam, 'arena_wedges', (0.0, -48.0, 30.0), (0.0, 56.0, 17.0), 35))
    files.append(shoot(cam, 'side_wedges', (62.0, 22.0, 46.0), (6.0, 64.0, 14.0), 32))
    files.append(shoot(cam, 'street_wedges', (34.0, 138.0, 24.0), (0.0, 80.0, 15.0), 35))
    files.append(shoot(cam, 'corner_wedges', (26.0, 26.0, 9.0), (10.0, 42.0, 9.0), 28))
    files.append(shoot(cam, 'arches_close', (4.0, 22.0, 5.0), (5.5, 39.0, 5.5), 28))
    info = {'asset': NAME, 'triangles': tris, 'bbox_xyz_m': rng, 'pavilion_ridge_z': round(ridge, 2),
            'tower_apex_z': round(tower_apex, 2), 'stand_top_z': STAND_TOP,
            'side_margin_min_m_(gate_side - stands_profile - 1.15)': side_check(),
            'glb': glb, 'glb_kb': round(os.path.getsize(glb) / 1024), 'renders': files}
    print('ASSET_REPORT ' + json.dumps(info, ensure_ascii=False))


if __name__ == '__main__':
    main()
