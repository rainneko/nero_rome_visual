"""rome_pons_agrippae · Pons Agrippae: eight plain travertine arches, double-pointed piers, slab parapet.
Brief: briefs/rome/bridges.md section 4. z = 0 at the deck ends; upstream = +Y (pointed cutwaters at +-Y).
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *

reset()
F = Frame()

ZW = -4.9                  # river level (reference only, not modelled)
ZB = ZW - 5.5              # riverbed
ZF = ZB - 1.0              # footing bottom
ZP = ZW + 2.5              # pier and cutwater top
HW = 4.5                   # half deck width (Y)
HL = 96.0                  # half length, deck ends
XA = 73.5                  # end of the arched deck profile
SPAN_H = 7.0               # half clear span (span 14)
RISE = 4.6                 # arch rise f
ZS = -4.2                  # springing
TR = 0.9                   # ring thickness
NV = 18                    # voussoirs per ring
PIERS = [-57.0, -38.0, -19.0, 0.0, 19.0, 38.0, 57.0]
ARCHES = [-66.5 + 19.0 * k for k in range(8)]

R_ARC = (SPAN_H ** 2 + RISE ** 2) / (2 * RISE)     # intrados radius (segmental arch)
ZC = ZS + RISE - R_ARC                             # centre of the arch circles
PHI0 = math.asin(SPAN_H / R_ARC)                   # half angle at the springing
RE = R_ARC + TR                                    # extrados radius
XE = RE * math.sin(PHI0)                           # extrados at the springing (x offset)
ZE = ZC + RE * math.cos(PHI0)                      # extrados at the springing (z)


def zdeck(x):
    """Deck top profile: arched crown for |x| <= 73.5, then a straight ramp to 0 at the ends."""
    a = abs(x)
    if a <= XA:
        return 1.9 + 0.4 * (1 - (x / XA) ** 2)
    return 1.9 * max(0.0, HL - a) / (HL - XA)


def arc_pt(c, R, phi):
    return (c + R * math.sin(phi), ZC + R * math.cos(phi))


def xz_prism(mat, pts, y0, y1):
    """Closed polygon in the XZ plane (list of (x, z)), extruded from y0 to y1."""
    n = len(pts)
    verts = [(x, y0, z) for x, z in pts] + [(x, y1, z) for x, z in pts]
    faces = [tuple(range(n)), tuple(n + i for i in reversed(range(n)))]
    for i in range(n):
        j = (i + 1) % n
        faces.append((i, j, n + j, n + i))
    add_mesh(mat, verts, faces)


def deck_xs():
    xs = [-HL + 2 * HL * i / 48 for i in range(49)] + [-XA, XA]
    return sorted(set(round(x, 6) for x in xs))


def pier(p):
    box(F, p, 0.0, ZF, 5.0, 9.0, ZP - ZF, 'tuff')
    for sy in (-1, 1):                       # pointed cutwater on both sides
        y0 = sy * HW; y1 = sy * 6.0
        A0 = (p - 2.5, y0, ZF); B0 = (p + 2.5, y0, ZF); C0 = (p, y1, ZF)
        A1 = (p - 2.5, y0, ZP); B1 = (p + 2.5, y0, ZP); C1 = (p, y1, ZP - 1.0)
        add_mesh('tuff', [A0, B0, C0, A1, B1, C1],
                 [(0, 2, 1), (3, 4, 5), (0, 1, 4, 3), (1, 2, 5, 4), (2, 0, 3, 5)])


def ring(c):
    """Travertine voussoirs of one arch, full width, 3.5 cm joints."""
    g = 0.0175 / R_ARC
    for i in range(NV):
        a = -PHI0 + 2 * PHI0 * i / NV + g
        b = -PHI0 + 2 * PHI0 * (i + 1) / NV - g
        pts = [arc_pt(c, R_ARC, a), arc_pt(c, R_ARC, b), arc_pt(c, RE, b), arc_pt(c, RE, a)]
        xz_prism('stone', pts, -HW, HW)


def spandrel(c):
    """Tuff fill from the arch extrados (and the pier tops at z = ZP) up to the deck, one bay between pier centres."""
    pts = [(c - 9.5, ZP), (c - XE, ZP)]
    for i in range(NV + 1):
        phi = -PHI0 + 2 * PHI0 * i / NV
        pts.append(arc_pt(c, RE, phi))
    pts += [(c + XE, ZP), (c + 9.5, ZP)]
    for i in range(7):
        x = c + 9.5 - 19.0 * i / 6
        pts.append((x, zdeck(x) - 0.25))
    xz_prism('tuff', pts, -HW, HW)


def abutment(s):
    """Solid tuff abutment over the bank, battered 1:10 down to z = -9, 0.6 m wider than the deck each side."""
    xi = s * XA; xb = s * (HL + 0.9); xo = s * HL
    pts = [(xi, -9.0), (xb, -9.0), (xo, -0.25), (xi, zdeck(XA) - 0.25)]
    xz_prism('tuff', pts, -5.1, 5.1)


preview_ground(ZW)

# piers and arches
for p in PIERS:
    pier(p)
for c in ARCHES:
    ring(c)
    spandrel(c)
abutment(-1)
abutment(1)

# deck: basalt roadway, travertine footways, slab parapets, coping, string courses
xs = deck_xs()
road = [(x, zdeck(x)) for x in xs] + [(x, zdeck(x) - 0.25) for x in reversed(xs)]
xz_prism('basalt', road, -2.95, 2.95)
for s in (-1, 1):
    foot = [(x, zdeck(x) + 0.2) for x in xs] + [(x, zdeck(x) - 0.25) for x in reversed(xs)]
    y0, y1 = sorted((s * 2.95, s * 4.05))
    xz_prism('stone', foot, y0, y1)
    cop = [(x, zdeck(x) + 1.20) for x in xs] + [(x, zdeck(x) + 1.05) for x in reversed(xs)]
    y0, y1 = sorted((s * 4.0, s * 4.55))
    xz_prism('stone', cop, y0, y1)
    sc = [(x, zdeck(x) - 0.6) for x in xs] + [(x, zdeck(x) - 1.0) for x in reversed(xs)]
    y0, y1 = sorted((s * 4.5, s * 4.75))
    xz_prism('stone', sc, y0, y1)

# parapet: upright travertine slabs 1.8 m long, 0.1 m gaps, 0.45 thick, 1.05 above the deck
for i in range(101):
    xa = -HL + 1.9 * i; xb = xa + 1.8
    if xb > HL + 1e-6:
        break
    sx = [xa, (xa + xb) / 2, xb]
    slab = [(x, zdeck(x) - 0.25) for x in sx] + [(x, zdeck(x) + 1.05) for x in reversed(sx)]
    xz_prism('stone', slab, 4.05, 4.5)
    xz_prism('stone', slab, -4.5, -4.05)

# square bridgehead posts with travertine caps, 2.2 m high, at the four corners
for sx in (-1, 1):
    for sy in (-1, 1):
        cx = sx * (HL - 0.7); cy = sy * (HW - 0.7)
        box(F, cx, cy, -0.25, 1.4, 1.4, 2.2 + 0.25, 'stone')
        box(F, cx, cy, 2.2, 1.7, 1.7, 0.2, 'stone')

finish('rome_pons_agrippae', front='-Y')
