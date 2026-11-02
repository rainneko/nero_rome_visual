"""rome_insulae · three apartment blocks for AD 56: rome_insula_a, rome_insula_b, rome_insula_c.

Run: /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_insulae.py"
Origin = centre of the footprint, z = 0 = street level, front = -Y (the street side).
Each block is a solid core box whose faces lie on the wall lines (inset SKIN from the outer walls); facade skins
stand on the outside of those lines, so openings show a dark back panel and nothing is see-through.
"""
import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *            # noqa: F401,F403
from rk import _seg_frame
from mathutils import Vector
import math

SKIN = 0.35                 # depth of a facade skin in front of the core (outer face at w/2)


def _lines(w, d):
    """Wall lines of the core, counter-clockwise (outside on the right): S = street (-Y), E (+X), N (+Y), W (-X)."""
    hw, hd = w / 2 - SKIN, d / 2 - SKIN
    return {'S': ((-hw, -hd), (hw, -hd)), 'E': ((hw, -hd), (hw, hd)),
            'N': ((hw, hd), (-hw, hd)), 'W': ((-hw, hd), (-hw, -hd))}


def _len(p0, p1):
    return math.hypot(p1[0] - p0[0], p1[1] - p0[1])


def _wins(L, n, zb, ww, wh, kind='rect'):
    """n evenly spaced openings on a line of length L, sills at zb (relative to the skin base)."""
    return [((k + 0.5) * L / n, zb, ww, wh, kind) for k in range(n)]


def _skin(F, p0, p1, z0, h, ops, mat, depth=SKIN, frame=None):
    """Facade skin on the outside of line p0 -> p1, z0 to z0 + h; ops = (u, z rel. z0, w, h, kind)."""
    opening_skin(F, p0[0], p0[1], p1[0], p1[1], z0, h, ops, mat, depth=depth, frame_mat=frame)


def _q(mat, pts, ref, sign=1.0):
    """A quad facing away from point ref (sign 1) or towards it (sign -1), whatever the order of pts."""
    a, b, c = pts[0], pts[1], pts[2]
    mid = sum(pts, Vector((0, 0, 0))) / len(pts)
    if (b - a).cross(c - a).dot((mid - ref) * sign) < 0:
        pts = list(reversed(pts))
    add_poly(mat, pts)


def _arch(S, u, z, span, rise, yf, t=0.26, proj=0.07, mat='tile2', seg=6):
    """A segmental brick relieving arch on a wall face (y = yf in frame S, outside = -y), springing at z.
    【史】Ostia and Trajan's Market: a flat lintel over the door, a small window above it, and a brick arch over both
    that carries the wall load past the lintel. Brick-faced concrete like this is in Rome from Tiberius on."""
    R = (span * span / 4 + rise * rise) / (2 * rise); zc = z + rise - R
    phi = math.asin(min(1.0, span / 2 / R))
    angs = [math.pi / 2 + phi - 2 * phi * i / seg for i in range(seg + 1)]
    yb, yo = yf + 0.02, yf - proj
    pt = lambda r, a, y: S.p(u + r * math.cos(a), y, zc + r * math.sin(a))
    ctr, back = S.p(u, yf, zc), S.p(u, yf + 10.0, zc)
    for i in range(seg):
        a0, a1 = angs[i], angs[i + 1]
        _q(mat, [pt(R, a0, yo), pt(R, a1, yo), pt(R + t, a1, yo), pt(R + t, a0, yo)], back)
        _q(mat, [pt(R + t, a0, yo), pt(R + t, a1, yo), pt(R + t, a1, yb), pt(R + t, a0, yb)], ctr)
        _q(mat, [pt(R, a0, yo), pt(R, a1, yo), pt(R, a1, yb), pt(R, a0, yb)], ctr, -1.0)


def _shops(F, p0, p1, n, h, mat, oh=2.7, depth=0.7, counters=True, shutters=True, frame='travertine',
           lintel='travertine', u0=0.0, u1=None):
    """n shops (tabernae) on the outside of a wall line, between u0 and u1 along it (default: the whole line).
    Each: a square-headed opening with travertine jambs, lintel and threshold, a small window over the lintel that lights
    the pergula (the loft where the shopkeeper slept) and a brick relieving arch over both; a wooden shutter board at
    one side and a masonry counter in every other shop.
    【史】Trajan's Market (about AD 110) and the Ostia shop rows; the same door is in Herculaneum before AD 79."""
    S, L = _seg_frame(F, p0[0], p0[1], p1[0], p1[1], 0)
    u1 = L if u1 is None else u1
    bay = (u1 - u0) / n; ow = min(bay * 0.66, 3.0)
    pw, ph, pz = min(ow * 0.36, 1.0), 0.55, oh + 0.38
    ops = []
    for k in range(n):
        u = u0 + (k + 0.5) * bay
        ops += [(u, 0.0, ow, oh, 'rect'), (u, pz, pw, ph, 'rect')]
    return S, bay, ow, ops, (lambda: _shop_trim(S, u0, bay, n, ow, oh, pw, depth, counters, shutters, frame, lintel))


def _shop_trim(S, u0, bay, n, ow, oh, pw, depth, counters, shutters, frame, lintel):
    yf = -depth - 0.01
    for k in range(n):
        u = u0 + (k + 0.5) * bay
        if frame:
            for sd in (-1, 1):
                box(S, u + sd * (ow / 2 + 0.1), yf + 0.03, 0.0, 0.24, 0.16, oh, frame)        # jambs
            box(S, u, yf + 0.05, -0.02, ow, 0.5, 0.08, frame)                                   # threshold
        box(S, u, yf + 0.03, oh, ow + 0.44, 0.16, 0.3, lintel)                                  # lintel
        _arch(S, u, oh + 0.3, ow + 0.44, min(0.75, (ow + 0.44) / 2), yf)                         # relieving arch
        box(S, u, yf + 0.03, oh + 0.36, pw + 0.12, 0.12, 0.06, 'wood')                          # loft window sill
        if shutters:
            box(S, u - ow / 2 + 0.25, -depth * 0.55, 0.0, 0.35, 0.18, oh * 0.95, 'wood')
        if counters and k % 2 == 0:
            box(S, u + ow * 0.12, -depth - 0.3 + 0.6, 0.0, ow * 0.55, 0.6, 1.0, 'stone')


def _shop_side(F, p0, p1, n, h, mat, extra=(), **kw):
    """A whole ground-floor side: n shops (see _shops) plus any extra openings (doors, windows) in one skin."""
    S, bay, ow, ops, trim = _shops(F, p0, p1, n, h, mat, **kw)
    _skin(F, p0, p1, 0.0, h, ops + list(extra), mat, depth=kw.get('depth', 0.7))
    trim()
    return S, bay


def _win_arches(F, p0, p1, z, n, ww, depth=SKIN):
    """Flat brick relieving arches over n evenly spaced windows whose heads are at z (see _wins)."""
    S, L = _seg_frame(F, p0[0], p0[1], p1[0], p1[1], 0)
    for k in range(n):
        _arch(S, (k + 0.5) * L / n, z + 0.04, ww + 0.3, 0.22, -depth - 0.01, t=0.2, proj=0.06, seg=4)


def _rafters(F, p0, p1, z, out, every=0.8):
    """Rafter ends under the eaves: small timber beams out from the wall face to the roof edge (out m from the line)."""
    S, L = _seg_frame(F, p0[0], p0[1], p1[0], p1[1], 0)
    n = max(1, int(L / every))
    for k in range(n):
        box(S, (k + 0.5) * L / n, -(0.2 + out) / 2, z - 0.15, 0.13, out - 0.2, 0.14, 'wood')


def _pot(F, x, y, z, r=0.18, hh=0.34):
    """A terracotta flower pot with a clipped 'hedge' top; z = the surface it stands on."""
    cyl(F, x, y, z, r, hh, 'tile', 8, r_top=r * 0.8)
    sphere(F, x, y, z + hh + r * 0.4, r * 0.95, 'hedge', 6, 4, z_scale=0.8)


def _sign(F, p0, p1, u, z, sw=0.8, sh=0.6, depth=0.75):
    """A painted shop sign (red board with a marble cap) on a pier between two shops, centred at u."""
    S, _ = _seg_frame(F, p0[0], p0[1], p1[0], p1[1], 0)
    box(S, u, -depth, z, sw, 0.08, sh, 'red')
    box(S, u, -depth, z + sh, sw + 0.1, 0.12, 0.06, 'marble')


# ---------------------------------------------------------------- rome_insula_a
def build_insula_a():
    """14 x 12 m, five storeys (ground 4.2 m, upper 3.0 m; eaves 16.2 m).
    Ground floor in exposed brick-faced concrete (opus testaceum): three shops on the street and one on each side, each
    with travertine jambs and lintel, a loft window and a brick relieving arch; a projecting brick string course over it.
    First floor in lime plaster with stone-framed windows and a long wooden maenianum with a tile pent roof and laundry.
    Floors 2-3 in ochre plaster with deep windows under brick arches; floor 4 timber-framed and daubed (opus craticium);
    rafter ends under a low hipped tile roof."""
    w, d = 14.0, 12.0
    F = Frame()
    ln = _lines(w, d)
    H_g, H_f = 4.2, 3.0
    eave = H_g + H_f * 4                                        # 16.2 m
    box(F, 0, 0, 0, w - 0.7, d - 0.7, eave, 'mud')              # core: nothing see-through behind the skins
    # ground floor: three shops on the street, one shop on each side, plain back with a door
    _shop_side(F, *ln['S'], 3, H_g, 'brick')
    Ls = _len(*ln['S'])
    _sign(F, *ln['S'], Ls / 3, 1.7)                             # painted sign on the pier left of the middle shop
    _shop_side(F, *ln['E'], 1, H_g, 'brick')
    _shop_side(F, *ln['W'], 1, H_g, 'brick', counters=False)
    Ln = _len(*ln['N'])
    _skin(F, *ln['N'], 0.0, H_g, _wins(Ln, 2, 2.2, 0.9, 1.0) + [(Ln / 2, 0.0, 1.6, 2.6, 'arch')], 'brick')
    for key in 'SENW':
        band(F, *ln[key][0], *ln[key][1], H_g - 0.24, 0.2, 0.84, 'brick')   # brick string course over the shops
    # first floor: lime plaster with framed windows
    for key in 'SENW':
        p0, p1 = ln[key]
        _skin(F, p0, p1, H_g, H_f, _wins(_len(p0, p1), 3, 1.2, 0.9, 0.9), 'plaster', frame='stone')
    # wooden maenianum with a tile pent roof and laundry across the street front, pots on it and on the middle sill
    balcony(F, *ln['S'][0], *ln['S'][1], H_g + 0.12, depth=1.1, mat='wood', roof=True, laundry=True)
    S, _ = _seg_frame(F, *ln['S'][0], *ln['S'][1], 0)
    for u in (0.6, Ls / 2, Ls - 0.6):
        _pot(S, u, -0.6, H_g + 0.12)
    _pot(S, Ls / 2, -0.42, H_g + 1.22)                          # on the sill (top at 5.42)
    # floors 2-3: ochre plaster, deep windows with brick arches over them
    for fl in (1, 2):
        z = H_g + H_f * fl
        for key in 'SENW':
            p0, p1 = ln[key]
            L = _len(p0, p1)
            _skin(F, p0, p1, z, H_f, _wins(L, 3, 0.9, 0.8, 1.1), 'plaster2')
            _win_arches(F, p0, p1, z + 2.0, 3, 0.8)
    # floor 4: timber-framed, daubed over (only the corner posts and the floor-beam line show)
    for key in 'SENW':
        p0, p1 = ln[key]
        timber_skin(F, p0[0], p0[1], p1[0], p1[1], H_g + H_f * 3, H_f, floors=1, mat='mud', frame='wood', windows=3)
    for key in 'SENW':
        _rafters(F, *ln[key], eave, 0.85)
    hip_roof(F, 0, 0, eave, w, d, 22.0, 0.5, 'tile')
    return eave


# ---------------------------------------------------------------- rome_insula_b
def build_insula_b():
    """Corner block 12 x 12 m, four storeys (eaves 13.2 m): ochre-washed ground floor, lime-plastered upper floors.
    Street front with a door at the west end and two shops; two shops on the right (+X) side, a painted sign between
    them; every shop with travertine jambs, a loft window and a brick relieving arch. A brick string course over the
    shops and a stepped brick cornice under the roof (as at Ostia and Trajan's Market). Framed windows; a wooden
    balcony wrapping round the S-E corner on the first floor; a timber loggia across the top floor of the street front.
    The S half of the roof is hipped tile, the N half a paved terrace with a pergola and parapets; a water jar by the door."""
    w, d = 12.0, 12.0
    F = Frame()
    ln = _lines(w, d)
    H_g, H_f = 4.2, 3.0
    H = H_g + H_f * 3                                           # 13.2
    hw, hd = w / 2 - SKIN, d / 2 - SKIN
    box(F, 0, 0, 0, w - 0.7, d - 0.7, H, 'brick')               # core
    # ground floor, street front S: a door at the west end, then two shops
    xs = 3.2
    _shop_side(F, *ln['S'], 2, H_g, 'plaster2', u0=xs, extra=[(1.6, 0.0, 1.4, 2.4, 'arch')])
    Sg, _ = _seg_frame(F, *ln['S'][0], *ln['S'][1], 0)
    _arch(Sg, 1.6, 1.7, 1.4 + 0.5, 0.95, -0.71, t=0.24)          # brick ring round the arched door
    box(Sg, 1.6, -0.66, -0.02, 1.5, 0.5, 0.1, 'travertine')    # door step
    # ground floor, right side E: two shops, sign on the pier between them
    _shop_side(F, *ln['E'], 2, H_g, 'plaster2')
    _sign(F, *ln['E'], _len(*ln['E']) / 2, 1.7)
    # ground floor, back: windows and a back door (W), windows (N)
    Lw = _len(*ln['W'])
    _skin(F, *ln['W'], 0.0, H_g, _wins(Lw, 2, 2.2, 0.8, 0.9) + [(Lw / 2, 0.0, 1.4, 2.4, 'arch')], 'plaster2')
    _skin(F, *ln['N'], 0.0, H_g, _wins(_len(*ln['N']), 3, 2.2, 0.8, 0.9), 'plaster2')
    # floors 1-3 (above the shops): framed windows; the top floor of the street front is an open timber loggia
    for fl in range(3):
        z = H_g + H_f * fl
        for key in 'SENW':
            p0, p1 = ln[key]
            L = _len(p0, p1)
            if fl == 2 and key == 'S':
                n = 4; bay = L / n
                _skin(F, p0, p1, z, H_f, [((k + 0.5) * bay, 0.0, bay - 0.5, 2.45, 'rect') for k in range(n)], 'plaster')
                Sl, _ = _seg_frame(F, p0[0], p0[1], p1[0], p1[1], 0)
                for k in range(n + 1):
                    box(Sl, min(L - 0.12, max(0.12, k * bay)), -0.4, z, 0.22, 0.14, 2.45, 'wood')   # posts
                box(Sl, L / 2, -0.42, z + 2.45, L, 0.18, 0.22, 'wood')                              # head beam
                beam(Sl, 0.1, -0.44, z + 1.0, L - 0.1, -0.44, z + 1.0, 0.08, 0.1, 'wood')            # rail
                beam(Sl, 0.1, -0.44, z + 0.5, L - 0.1, -0.44, z + 0.5, 0.05, 0.05, 'wood')
                continue
            _skin(F, p0, p1, z, H_f, _wins(L, 3, 0.9, 0.9, 1.4), 'plaster', frame='stone')
    # brick string course over the shops; a red painted band at the second floor; stepped brick cornice under the roof
    for key in 'SENW':
        band(F, *ln[key][0], *ln[key][1], H_g - 0.24, 0.2, 0.84, 'brick')
        band(F, *ln[key][0], *ln[key][1], H_g + H_f - 0.2, 0.3, 0.4, 'red')
        cornice(F, *ln[key][0], *ln[key][1], H - 0.5, 0.6, 0.62, 'brick')
    # wooden balcony on the first floor, wrapping round the S-E corner, with corbel braces under the corner
    zb = H_g + 0.12
    balcony(F, -hw, -hd, hw + 1.1, -hd, zb, depth=1.1, mat='wood', roof=True, laundry=False)
    balcony(F, hw, -hd, hw, hd, zb, depth=1.1, mat='wood', roof=True, laundry=False)
    beam(F, hw - 0.3, -hd + 0.3, zb - 0.9, hw + 1.0, -hd - 1.0, zb - 0.25, 0.16, 0.2, 'wood')
    Sb, Lb = _seg_frame(F, -hw, -hd, hw + 1.1, -hd, 0)
    for u in (0.6, 5.9, Lb - 0.6):
        _pot(Sb, u, -0.6, zb)
    Eb, Le = _seg_frame(F, hw, -hd, hw, hd, 0)
    for u in (0.6, Le - 0.6):
        _pot(Eb, u, -0.6, zb)
    Sc, Lc = _seg_frame(F, -hw, -hd, hw, -hd, 0)
    _pot(Sc, Lc / 2, -0.42, H_g + 0.9 + 0.02)                   # on the middle first-floor window sill
    # water jar on the street by the door
    lathe(F, -hw + 0.5, -hd - 1.0, [(0.01, 0.0), (0.2, 0.0), (0.26, 0.12), (0.31, 0.4), (0.27, 0.7), (0.18, 0.9),
                                    (0.2, 0.98), (0.14, 1.02), (0.01, 1.02)], 'ochre', 10, smooth=True)
    # roof: S half hipped tile roof; N half paved terrace with parapets and a pergola
    hip_roof(F, 0, -3.2, H, 13.6, 5.6, 22.0, 0.4, 'tile')
    box(F, 0, hd / 2, H - 0.2, w - 0.7, hd, 0.25, 'paving')     # terrace floor (top at H + 0.05)
    box(F, 0, hd - 0.2, H + 0.05, w - 0.7, 0.7, 1.0, 'plaster')
    box(F, 0, hd - 0.2, H + 1.05, w - 0.5, 0.9, 0.12, 'brick')
    for sx in (-1, 1):
        box(F, sx * (hw - 0.2), hd / 2, H + 0.05, 0.7, hd, 1.0, 'plaster')
    pergola(F, -4.0, 0.9, 4.0, 4.9, H + 0.05, h=2.4, mat='wood', vine='hedge', step=2.4)
    return H


# ---------------------------------------------------------------- rome_insula_c
def build_insula_c():
    """Narrow block 8 x 12 m, four storeys (eaves 13.2 m), the poorest: brick ground floor with a wide workshop
    (anvil and hearth inside) under a timber lintel, a loft window and a brick relieving arch, and an arched door with
    a brick ring and a street altar beside it; timber-framed upper floors that jut 0.5 m further over the street at
    each floor (jetties on joists), small windows with wooden shutters; a gabled roof with the gable to the street,
    rafter ends along the sides; a laundry pole with a cloth from the third floor."""
    w, d = 8.0, 12.0
    F = Frame()
    ln = _lines(w, d)
    H_g, H_f = 4.2, 3.0
    H = H_g + H_f * 3                                           # 13.2
    hw, hd = w / 2 - SKIN, d / 2 - SKIN
    box(F, 0, 0, 0, w - 0.7, d - 0.7, H, 'brick')               # core
    # ground floor (brick): street front with the workshop (2.4 m from the west end) and the door (5.4 m)
    _skin(F, *ln['S'], 0.0, H_g, [(2.4, 0.0, 3.4, 2.7, 'rect'), (2.4, 3.06, 0.7, 0.5, 'rect'),
                                  (5.4, 0.0, 1.0, 2.2, 'arch')], 'brick')
    S, _ = _seg_frame(F, *ln['S'][0], *ln['S'][1], 0)
    box(S, 2.4, -0.3, 2.7, 3.8, 0.16, 0.3, 'wood')              # timber lintel over the workshop
    _arch(S, 2.4, 3.0, 3.8, 0.6, -0.36, t=0.24)                 # brick relieving arch over lintel and loft window
    _arch(S, 5.4, 1.7, 1.0 + 0.48, 0.74, -0.36, t=0.22)         # brick ring round the arched door
    box(S, 1.9, -0.16, 0.0, 0.5, 0.24, 0.6, 'iron')             # anvil block inside the workshop
    box(S, 2.9, -0.18, 0.0, 0.9, 0.3, 0.55, 'brick')            # hearth box at the back
    cyl(S, 2.9, -0.18, 0.55, 0.12, 0.25, 'flame', 6, r_top=0.0) # fire on the hearth
    box(S, 5.4, -0.5, 0.0, 1.2, 0.3, 0.15, 'stone')             # door step
    for key in 'ENW':
        p0, p1 = ln[key]
        _skin(F, p0, p1, 0.0, H_g, _wins(_len(p0, p1), 1, 2.2, 0.6, 0.7), 'brick', frame='stone')
    # upper floors over one 0.5 m maenianum on joists (stepped jetties, one per floor, read as a medieval house)
    for k in range(3):
        z = H_g + H_f * k
        off = 0.5
        yf = -hd - off
        box(F, 0, -hd - off / 2, z, 2 * hw + 2 * SKIN, off, H_f, 'mud')          # jetty fill: nothing see-through
        for x in (-3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0):
            beam(F, x, -hd + 0.3, z - 0.25, x, yf - 0.45, z - 0.25, 0.2, 0.3, 'wood')   # jetty joists
        p0, p1 = (-hw - SKIN, yf), (hw + SKIN, yf)
        timber_skin(F, p0[0], p0[1], p1[0], p1[1], z, H_f, floors=1, mat='mud', frame='wood', post_every=1.5,
                    windows=2, braces=True)
        Sf, Lf = _seg_frame(F, p0[0], p0[1], p1[0], p1[1], 0)
        for uc in (Lf / 4, 3 * Lf / 4):
            for du in (-0.5, 0.5):
                box(Sf, uc + du, -0.3, z + 1.2, 0.22, 0.05, 0.8, 'wood')            # wooden shutters
        if k == 0:
            box(Sf, Lf / 4, -0.42, z + 1.1, 0.9, 0.22, 0.12, 'stone')               # sill
            _pot(Sf, Lf / 4, -0.42, z + 1.22)
        for key in 'ENW':
            p0, p1 = ln[key]
            timber_skin(F, p0[0], p0[1], p1[0], p1[1], z, H_f, floors=1, mat='mud', frame='wood', post_every=1.5,
                        windows=1, braces=True)
    # gabled roof with the gable to the street, low Roman pitch, out over the maenianum
    gable_roof(F, 0.0, -0.25, H, 8.0, 12.5, pitch=22.0, axis='y', overhang=0.4, gable_mat='mud')
    for key in 'EW':
        _rafters(F, *ln[key], H, 0.6, every=0.9)
    # laundry pole sticking out from the third floor, with a cloth on it
    beam(F, 3.0, -hd + 0.3, 9.0, 3.0, -hd - 2.4, 9.0, 0.08, 0.08, 'wood')
    box(F, 3.0, -hd - 2.3, 8.4, 0.5, 0.02, 0.6, 'linen')
    # street altar beside the door
    altar(F, 2.95, -hd - 1.05, 0.0, w=0.8, d=0.6, h=1.0, mat='stone', steps=0, bolsters=False, fire=False)
    return H


import bpy
import bl_kit as _bk

_orig_preview = _bk._preview_scene


def _low_sample_preview(ob, front):
    """The kit's preview scene, rendered with few samples (memory and time are tight on the Mac)."""
    out = _orig_preview(ob, front)
    try:
        bpy.context.scene.eevee.taa_render_samples = 16
    except Exception:
        pass
    return out


_bk._preview_scene = _low_sample_preview

if __name__ == '__main__':
    reset()
    build_insula_a()
    finish('rome_insula_a', front='-Y')
    reset()
    build_insula_b()
    finish('rome_insula_b', front='-Y')
    reset()
    build_insula_c()
    finish('rome_insula_c', front='-Y')
