"""rome_insulae · three apartment blocks for AD 56: rome_insula_a, rome_insula_b, rome_insula_c.

Run: /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_insulae.py"
Origin = centre of the footprint, z = 0 = street level, front = -Y (the street side).
Each block is a solid core box whose faces lie on the wall lines (inset SKIN from the outer walls); facade skins
stand on the outside of those lines, so openings show a dark back panel and nothing is see-through.
"""
import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *            # noqa: F401,F403
from rk import _seg_frame
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


def _sign(F, p0, p1, u, z, sw=2.2, sh=0.34, depth=0.7):
    """A painted shop sign board (red with a marble cap) on the street face of a shop front, centred at u."""
    S, _ = _seg_frame(F, p0[0], p0[1], p1[0], p1[1], 0)
    box(S, u, -depth, z, sw, 0.12, sh, 'red')
    box(S, u, -depth, z + sh, sw + 0.16, 0.16, 0.07, 'marble')


def _ground_shop(F, p0, p1, h, mat, ow=3.2, oh=3.0, depth=0.7):
    """A ground-floor side with ONE shop in the middle: opening, lintel, shutter board and counter."""
    L = _len(p0, p1)
    _skin(F, p0, p1, 0.0, h, [(L / 2, 0.0, ow, oh, 'rect')], mat, depth=depth)
    S, _ = _seg_frame(F, p0[0], p0[1], p1[0], p1[1], 0)
    u = L / 2
    box(S, u, -depth + 0.1, oh, ow + 0.3, 0.3, 0.28, 'wood')                       # lintel beam
    box(S, u - ow / 2 + 0.25, -depth * 0.55, 0.0, 0.35, 0.18, oh * 0.95, 'wood')   # shutter board
    box(S, u + ow * 0.12, -depth + 0.3, 0.0, ow * 0.55, 0.6, 1.0, 'stone')         # counter


def _pot(F, x, y, z, r=0.18, hh=0.34):
    """A terracotta flower pot with a clipped 'hedge' top; z = the surface it stands on."""
    cyl(F, x, y, z, r, hh, 'tile', 8, r_top=r * 0.8)
    sphere(F, x, y, z + hh + r * 0.4, r * 0.95, 'hedge', 6, 4, z_scale=0.8)


def _zigzag(F, p0, p1, zlo, zhi, mat, s=0.6, t=0.12, y=-0.40):
    """A painted zigzag strip of small sloping boxes on the street face of a wall line, between zlo and zhi."""
    S, L = _seg_frame(F, p0[0], p0[1], p1[0], p1[1], 0)
    u = 0.3; k = 0
    while u + s <= L - 0.3:
        za, zb = (zlo, zhi) if k % 2 == 0 else (zhi, zlo)
        beam(S, u, y, za, u + s, y, zb, t, 0.14, mat)
        u += s; k += 1


# ---------------------------------------------------------------- rome_insula_a
def build_insula_a():
    """14 x 12 m, five storeys (ground 4.2 m, upper 3.0 m; eaves 16.2 m): masonry ground floor with three shops on
    the street (one with a painted sign) and one on each side, masonry first floor with framed windows, pots on
    the sill and the balcony, and a long wooden balcony with laundry; timber-framed mud floors 2-4 with small
    square windows on all four sides; hipped tile roof."""
    w, d = 14.0, 12.0
    F = Frame()
    ln = _lines(w, d)
    H_g, H_f = 4.2, 3.0
    eave = H_g + H_f * 4                                        # 16.2 m
    box(F, 0, 0, 0, w - 0.7, d - 0.7, eave, 'mud')              # core: nothing see-through behind the skins
    # ground floor: three shops on the street, one shop on each side, plain back with a door
    taberna_front(F, *ln['S'][0], *ln['S'][1], 0.0, 3, h=H_g, mat='plaster2', shutters=True, counters=True, depth=0.7)
    _sign(F, *ln['S'], _len(*ln['S']) / 2, 3.64)                # painted sign over the middle shop
    _ground_shop(F, *ln['E'], H_g, 'plaster2')
    _ground_shop(F, *ln['W'], H_g, 'plaster2')
    Ln = _len(*ln['N'])
    _skin(F, *ln['N'], 0.0, H_g, _wins(Ln, 2, 2.2, 0.9, 1.0) + [(Ln / 2, 0.0, 1.6, 2.6, 'arch')], 'plaster2')
    band(F, *ln['N'][0], *ln['N'][1], 0.0, 0.9, 0.42, 'brick')  # brick plinth on the back
    # first floor: masonry with framed windows
    for key in 'SENW':
        p0, p1 = ln[key]
        _skin(F, p0, p1, H_g, H_f, _wins(_len(p0, p1), 3, 1.2, 0.9, 0.9), 'plaster', frame='stone')
    # wooden balcony with laundry across the street front, flower pots on it and on the middle sill
    Ls = _len(*ln['S'])
    balcony(F, *ln['S'][0], *ln['S'][1], H_g + 0.12, depth=1.1, mat='wood', roof=True, laundry=True)
    S, _ = _seg_frame(F, *ln['S'][0], *ln['S'][1], 0)
    for u in (0.6, Ls / 2, Ls - 0.6):
        _pot(S, u, -0.6, H_g + 0.12)
    _pot(S, Ls / 2, -0.42, H_g + 1.22)                          # on the sill (top at 5.42)
    # floors 2-4: timber-framed mud infill, small square windows on all four sides
    for key in 'SENW':
        p0, p1 = ln[key]
        timber_skin(F, p0[0], p0[1], p1[0], p1[1], H_g + H_f, H_f * 3, floors=3, mat='mud', frame='wood',
                    post_every=1.5, windows=2, braces=True)
    hip_roof(F, 0, 0, eave, w, d, 24.0, 0.5, 'tile')
    return eave


# ---------------------------------------------------------------- rome_insula_b
def build_insula_b():
    """Corner block 12 x 12 m, four storeys (eaves 13.2 m): plaster3 with red bands; street front with a door at
    the west end and two shops; two shops on the right (+X) side (one with a painted sign); framed windows; a
    wooden balcony wrapping round the S-E corner on the first floor; the S half of the roof is hipped tile, the N
    half a paved terrace with a pergola and parapets; a red zigzag under the eaves; a water jar by the door."""
    w, d = 12.0, 12.0
    F = Frame()
    ln = _lines(w, d)
    H_g, H_f = 4.2, 3.0
    H = H_g + H_f * 3                                           # 13.2
    hw, hd = w / 2 - SKIN, d / 2 - SKIN
    box(F, 0, 0, 0, w - 0.7, d - 0.7, H, 'brick')               # core
    # ground floor, street front S: a door segment at the west end, then two shops
    xs = -hw + 3.2
    _skin(F, ln['S'][0], (xs, -hd), 0.0, H_g, [(1.6, 0.0, 1.4, 2.4, 'arch')], 'plaster3', depth=0.7)
    taberna_front(F, xs, -hd, hw, -hd, 0.0, 2, h=H_g, mat='plaster3', shutters=True, counters=True, depth=0.7)
    # ground floor, right side E: two shops, sign over the first
    taberna_front(F, *ln['E'][0], *ln['E'][1], 0.0, 2, h=H_g, mat='plaster3', shutters=True, counters=True, depth=0.7)
    _sign(F, *ln['E'], _len(*ln['E']) / 4, 3.64)
    # ground floor, back: windows and a back door (W), windows (N)
    Lw = _len(*ln['W'])
    _skin(F, *ln['W'], 0.0, H_g, _wins(Lw, 2, 2.2, 0.8, 0.9) + [(Lw / 2, 0.0, 1.4, 2.4, 'arch')], 'plaster3')
    _skin(F, *ln['N'], 0.0, H_g, _wins(_len(*ln['N']), 3, 2.2, 0.8, 0.9), 'plaster3')
    # floors 2-4 (floor 1 is the first floor above the shops): framed windows on all four sides
    for fl in range(3):
        z = H_g + H_f * fl
        for key in 'SENW':
            p0, p1 = ln[key]
            _skin(F, p0, p1, z, H_f, _wins(_len(p0, p1), 3, 0.9, 0.9, 1.4), 'plaster3', frame='stone')
    # red string bands at the lines of floors 2 and 3, a cornice under the roof, and the red zigzag beneath it
    for z in (H_g + H_f - 0.2, H_g + 2 * H_f - 0.2):
        for key in 'SENW':
            band(F, *ln[key][0], *ln[key][1], z, 0.3, 0.42, 'red')
    for key in 'SENW':
        cornice(F, *ln[key][0], *ln[key][1], H - 0.5, 0.6, 0.62, 'stone')
        _zigzag(F, *ln[key], H - 1.25, H - 1.0, 'ochre')
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
    hip_roof(F, 0, -3.2, H, 13.6, 5.6, 24.0, 0.4, 'tile')
    box(F, 0, hd / 2, H - 0.2, w - 0.7, hd, 0.25, 'paving')     # terrace floor (top at H + 0.05)
    box(F, 0, hd - 0.2, H + 0.05, w - 0.7, 0.7, 1.0, 'plaster3')
    box(F, 0, hd - 0.2, H + 1.05, w - 0.5, 0.9, 0.12, 'stone')
    for sx in (-1, 1):
        box(F, sx * (hw - 0.2), hd / 2, H + 0.05, 0.7, hd, 1.0, 'plaster3')
    pergola(F, -4.0, 0.9, 4.0, 4.9, H + 0.05, h=2.4, mat='wood', vine='hedge', step=2.4)
    return H


# ---------------------------------------------------------------- rome_insula_c
def build_insula_c():
    """Narrow block 8 x 12 m, four storeys (eaves 13.2 m), the poorest: brick ground floor with a wide workshop
    (anvil and hearth inside) and a door with a street altar beside it; timber-framed upper floors that jut 0.5 m
    further over the street at each floor (jetties on joists), small windows with wooden shutters; a gabled roof
    with the gable to the street; a laundry pole with a cloth from the third floor."""
    w, d = 8.0, 12.0
    F = Frame()
    ln = _lines(w, d)
    H_g, H_f = 4.2, 3.0
    H = H_g + H_f * 3                                           # 13.2
    hw, hd = w / 2 - SKIN, d / 2 - SKIN
    box(F, 0, 0, 0, w - 0.7, d - 0.7, H, 'brick')               # core
    # ground floor (brick): street front with the workshop (2.4 m from the west end) and the door (5.4 m)
    _skin(F, *ln['S'], 0.0, H_g, [(2.4, 0.0, 3.4, 3.0, 'rect'), (5.4, 0.0, 1.0, 2.2, 'arch')], 'brick')
    S, _ = _seg_frame(F, *ln['S'][0], *ln['S'][1], 0)
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
