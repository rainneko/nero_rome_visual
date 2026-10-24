"""Central gate (Porta Pompae) of rome_circus_carceres, in detail (brief: 'Detail emphasis - 正门').

build_gate(F) adds the gate to the scene. It is a triumphal-arch front on BOTH faces: the arena side (y = -8, the asset
front) and the street side (y = +8). Per face: a 7 x 12 m arch with a semicircular archivolt, two pairs of Corinthian
half-columns on tall pedestals, an entablature that breaks forward over the pairs, flat gilded Victories in the
spandrels and a keystone. Inside: a coffered barrel vault in the passage (dark ribs on marble) and bronze lattice gates
standing open against the jambs. Attic: inscription panel, two relief panels, bronze trophies at the corners, a gilded
quadriga flanked by two gilded Victories. Arena side: the magistrate's loggia above the arch (4 columns, balustrade,
purple drape, small pediment with a gilded disc). Street side: a flight of 5 steps and two statues on pedestals.
Metres; z = 0 = arena floor; the street ground outside the back face is z = ST_Z = -1.0.
No reset() and no finish() here: the asset script and the close-up test script call them.
"""
import math
from rk import *
from rk import _arch_pts
from mathutils import Vector

F = None                  # set by build_gate()
GW = 15.0                 # half width of the gate (30 m)
GD = 8.0                  # half depth (y -8 .. 8)
AR = 3.5                  # passage half width (opening 7 m)
SPR = 8.5                 # springing of the arch (crown at 12 m)
RA = AR + 0.6             # archivolt outer radius
COL_Z = 2.5               # foot of the columns (top of the pedestals' cornice)
ENT_Z, ENT_H = 15.0, 1.6  # entablature bottom and height
ATT_Z, ATT_TOP = 16.6, 20.6
CAP_Z = 21.6              # top of the gate: the quadriga stands here
ST_Z = -1.0               # street ground (outside the back face); arena floor z = 0
RR = AR - 0.12            # radius of the vault ribs (set into the soffit, a little proud of it)


def _oriented(mat, pts, hint):
    """Add a polygon whose normal points away from the interior point hint (faces are seen from outside)."""
    P = [Vector(p) for p in pts]
    n = Vector((0.0, 0.0, 0.0)); c = Vector((0.0, 0.0, 0.0))
    for i in range(len(P)):
        n = n + P[i].cross(P[(i + 1) % len(P)]); c = c + P[i]
    if n.dot(c / len(P) - Vector(hint)) < 0:
        P.reverse()
    add_poly(mat, P)


def _prism_xz(outline, y0, y1, mat, hint):
    """Extrude a closed (x, z) outline from y0 to y1; every face is oriented away from the interior point hint."""
    n = len(outline)
    A = [(x, y0, z) for x, z in outline]
    B = [(x, y1, z) for x, z in outline]
    _oriented(mat, A, hint)
    _oriented(mat, B, hint)
    for i in range(n):
        j = (i + 1) % n
        _oriented(mat, [A[i], A[j], B[j], B[i]], hint)


def _archivolt(yf, s):
    """Half-ring moulding round the arch on the face y = yf, projecting 0.45 m outward (s = -1 front, +1 back)."""
    outline = _arch_pts(-RA, RA, SPR, 14) + _arch_pts(-AR, AR, SPR, 14)[::-1]
    _prism_xz(outline, min(yf, yf + s * 0.45), max(yf, yf + s * 0.45), 'marble', (0.0, yf + s * 0.2, SPR + 3.8))


def _spandrel():
    """Solid above the arch (x -3.5..3.5, up to the attic); its underside is the barrel vault of the passage."""
    outline = _arch_pts(-AR, AR, SPR, 16) + [(AR, ATT_Z), (-AR, ATT_Z)]
    _prism_xz(outline, -GD, GD, 'marble', (0.0, 0.0, 14.0))


def _vault():
    """Coffered barrel vault of the passage: five transverse ribs set into the soffit, in stone colour."""
    arc = _arch_pts(-RR, RR, SPR, 12)
    for y in (-4.8, -2.4, 0.0, 2.4, 4.8):
        for p, q in zip(arc[:-1], arc[1:]):
            beam(F, p[0], y, p[1], q[0], y, q[1], 0.4, 0.24, 'stone')


def _leaf(xs, y0, y1):
    """A bronze lattice leaf folded open against the passage wall at x = xs, spanning y0..y1 (z 0.2 .. 8)."""
    z0, z1 = 0.2, 8.0
    beam(F, xs, y0, z0, xs, y1, z0, 0.12, 0.12, 'bronze')
    beam(F, xs, y0, z1, xs, y1, z1, 0.12, 0.12, 'bronze')
    for yy in (y0, y1):
        beam(F, xs, yy, z0, xs, yy, z1, 0.12, 0.12, 'bronze')
    for k in (1, 2, 3):
        yy = y0 + (y1 - y0) * k / 4.0
        beam(F, xs, yy, z0, xs, yy, z1, 0.06, 0.06, 'bronze')
    for k in range(1, 8):
        zz = z0 + (z1 - z0) * k / 8.0
        beam(F, xs, y0, zz, xs, y1, zz, 0.06, 0.06, 'bronze')


def _balcony_victory(x, y, z0=12.0):
    """A gilded Victory on a small pedestal on the loggia floor: a draped standing figure (kit statue) with two
    wings made of thin swept panels."""
    box(F, x, y, z0, 1.0, 0.8, 0.6, 'marble')                              # small pedestal
    zb = z0 + 0.6
    statue(F, x, y, zb, 1.7, 'gold', pedestal=0.0)
    for s in (-1, 1):                                                       # swept wing panels (0.06 m thick)
        outline = [(x + 0.1 * s, zb + 1.1), (x + 0.85 * s, zb + 2.0), (x + 0.92 * s, zb + 1.3), (x + 0.15 * s, zb + 0.4)]
        _prism_xz(outline, y + 0.12, y + 0.18, 'gold', (x + 0.5 * s, y + 0.15, zb + 1.1))


def trophy(x, y, z0):
    """A bronze trophy on an attic corner: round shield with a spear and a sword crossed behind it."""
    vdisc(F.sub(x, y, z0, 90.0), 0.0, 0.0, 0.9, 0.45, 0.12, 'bronze', 12)
    beam(F, x, y, z0, x, y, z0 + 2.0, 0.08, 0.08, 'bronze')
    beam(F, x - 0.5, y, z0 + 0.3, x + 0.5, y, z0 + 1.5, 0.08, 0.08, 'bronze')


def _face(yf, s):
    """One triumphal-arch face at y = yf (s = -1 arena side, +1 street side)."""
    xa, xb = (-GW, GW) if s < 0 else (GW, -GW)     # wall line direction: the outside is on its right
    entablature(F, -GW, yf, GW, yf, ENT_Z, ENT_H, 0.8, 'marble', 'red')
    for a, b in ((-8.9, -4.9), (4.9, 8.9)):        # entablature breaking forward over the column pairs
        entablature(F, a, yf + s * 0.4, b, yf + s * 0.4, ENT_Z, ENT_H, 1.2, 'marble', 'red')
    cornice(F, xa, yf, xb, yf, 20.95, 0.7, 0.7, 'marble')                   # attic cornice
    _archivolt(yf, s)
    box(F, 0.0, yf + s * 0.25, 11.9, 1.0, 0.9, 1.0, 'marble')               # keystone
    for sx in (-1, 1):
        box(F, sx * (AR + 0.2), yf + s * 0.25, SPR - 0.3, 0.7, 0.9, 0.6, 'marble')          # impost block
        box(F, sx * 6.9, yf + s * 0.7, ST_Z, 4.0, 1.4, COL_Z - 0.2 - ST_Z, 'marble')         # tall pedestal
        box(F, sx * 6.9, yf + s * 0.75, COL_Z - 0.2, 4.4, 1.6, 0.2, 'marble')               # pedestal cornice
        for xx in (sx * 5.9, sx * 7.9):                                                     # half-columns
            column(F, xx, yf, COL_Z, ENT_Z - COL_Z, 0.55, 'marble', 'corinthian', 12)
        box(F, sx * 12.0, yf + s * 0.1, 2.5, 3.4, 0.15, 7.8, 'marble')                      # pier panel frame
        box(F, sx * 12.0, yf + s * 0.2, 3.0, 2.8, 0.1, 6.8, 'porphyry')                     # pier panel field
    box(F, 0.0, yf + s * 0.12, 17.1, 6.4, 0.24, 1.9, 'marble')              # attic inscription panel
    for row in (18.75, 18.4, 18.05):                                        # bronze lettering, three lines (above the pediment)
        for k in range(14):
            box(F, -2.6 + k * 0.4, yf + s * 0.27, row, 0.26, 0.06, 0.22, 'bronze')
    for sx in (-1, 1):
        box(F, sx * 9.0, yf + s * 0.12, 17.0, 4.2, 0.24, 2.8, 'marble')     # relief panel frame
        box(F, sx * 9.0, yf + s * 0.26, 17.3, 3.4, 0.08, 2.2, 'porphyry')   # relief field
        trophy(sx * 13.2, yf + s * 0.7, CAP_Z)


def _loggia():
    """Magistrate's box over the arch on the arena side: floor at z 12, four columns, balustrade, purple drape,
    small pediment with a gilded disc. It projects 3.5 m in front of the gate."""
    yc = -10.6
    box(F, 0.0, -9.75, 11.8, 12.0, 3.5, 0.2, 'marble')                      # floor
    for x in (-4.5, -1.5, 1.5, 4.5):
        column(F, x, yc, 12.0, 3.0, 0.3, 'marble', 'tuscan')
    entablature(F, -6.0, yc, 6.0, yc, 15.0, 0.7, 0.8, 'marble')
    balustrade(F, -6.0, -11.5, 6.0, -11.5, 12.0, 1.0, 'marble', 2.0, 0.28)
    box(F, 0.0, -10.45, 12.4, 2.2, 0.08, 2.6, 'flowerP')                    # purple drape (cloth) between the columns
    for sx in (-1, 1):                                                       # two gilded Victories on the balcony
        _balcony_victory(sx * 3.0, -9.3)
    tri = [F.p(-4.6, yc, 15.7), F.p(4.6, yc, 15.7), F.p(0.0, yc, 17.7)]     # small pediment
    _oriented('marble', tri, (0.0, -9.0, 16.0))
    vdisc(F.sub(0.0, yc, 16.7, 90.0), 0.0, 0.0, 0.0, 0.5, 0.12, 'gold', 16)  # gilded disc in the tympanum


def _street():
    """Street side (y > 8): a flight of 5 steps up to the gate threshold, two statues on pedestals flanking it."""
    for k in range(1, 6):
        y0 = GD + (5 - k) * 0.4
        box(F, 0.0, y0 + 0.2, ST_Z, 9.6, 0.4, 0.2 * k, 'marble')
    for sx in (-1, 1):
        box(F, sx * 11.5, 9.2, ST_Z, 2.0, 2.0, 1.6, 'marble')
        statue(F, sx * 11.5, 9.2, ST_Z + 1.6, 2.8, 'bronze', pedestal=0.0)     # bronze: reads against the white wall


def build_gate(F_in):
    """Add the whole central gate to the scene (Frame F_in is the asset frame)."""
    global F
    F = F_in
    box(F, 0.0, 0.0, ST_Z, 2 * AR, 2 * GD, -ST_Z, 'marble')                # passage floor (z -1 .. 0)
    for sx in (-1, 1):                                                       # piers
        box(F, sx * (AR + GW) / 2, 0.0, ST_Z, GW - AR, 2 * GD, ATT_Z - ST_Z, 'marble')
    _spandrel()
    box(F, 0.0, 0.0, ATT_Z, 2 * GW, 2 * GD, ATT_TOP - ATT_Z, 'marble')     # attic block
    box(F, 0.0, 0.0, 21.25, 2 * GW + 0.4, 2 * GD + 0.4, CAP_Z - 21.25, 'marble')   # attic cap
    _vault()
    for x in (-3.3, 3.3):                                                    # bronze lattice gates standing open
        _leaf(x, -7.9, -5.9)
        _leaf(x, 5.9, 7.9)
    for yf, s in ((-GD, -1.0), (GD, 1.0)):
        _face(yf, s)
    for sx in (-1, 1):                                                       # gilded Victories on the attic
        box(F, sx * 6.2, 0.0, CAP_Z, 1.4, 1.4, 1.0, 'marble')
        statue(F, sx * 6.2, 0.0, CAP_Z + 1.0, 2.4, 'gold', pedestal=0.0)
    quadriga(F, 0.0, 0.0, CAP_Z, 1.0, 'gold', '-Y')
    _loggia()
    _street()
