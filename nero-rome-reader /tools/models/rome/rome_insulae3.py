"""rome_insulae3 · five more houses for AD 56 (briefs/rome/ground-floor.md, "Second set"):
rome_insula_i (a fuller's workshop with a flat roof terrace for drying cloth), rome_insula_j (an inn with a cart gate
into its yard, a food bar and a gallery of rooms), rome_insula_k (an atrium house with shops let on its street front
and a flat over them with its own stair), rome_insula_l (a narrow smith's house in tuff with brick bands),
rome_insula_m (a tenement with an outside stair to the first floor, a greengrocer and a barber).

Run: /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_insulae3.py"
Origin = centre of the footprint, z = 0 = street level, front = -Y. Slots (monuments.js): i and k in a's 15.3 x 13.7 m,
j and m in b's 14.7 x 13.4 m, l in c's 8.9 x 14.3 m.
"""
import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rome_insulae import *          # noqa: F401,F403
from rome_insulae import _lines, _len, _wins, _skin, _win_arches, _rafters, _pot, _plinth
from rome_insulae2 import _core, _quoins, _upper, _timber
from rome_tabernae import shop_side, programma, shrine, bench, basin, room, q4, CEIL
from rk import _seg_frame
from mathutils import Vector
import math


def _flat_roof(F, w, d, z, parapet=0.95, mat='plaster'):
    """【史】A flat terrace roof (solarium) of crushed-tile concrete behind a low parapet."""
    box(F, 0, 0, z, w - 0.6, d - 0.6, 0.12, 'tile2')
    hw, hd = w / 2 - 0.3, d / 2 - 0.3
    for sx in (-1, 1):
        box(F, sx * (hw - 0.12), 0, z, 0.24, d - 0.6, parapet, mat)
        box(F, 0, sx * (hd - 0.12), z, w - 0.6, 0.24, parapet, mat)
    for sx in (-1, 1):
        box(F, sx * (hw - 0.12), 0, z + parapet, 0.34, d - 0.5, 0.06, 'stone')
        box(F, 0, sx * (hd - 0.12), z + parapet, w - 0.5, 0.34, 0.06, 'stone')


def _drying_lines(F, x0, x1, ys, z, cols):
    """Posts and lines across a roof terrace with cloth hung to dry."""
    k = 0
    for y in ys:
        for x in (x0, x1):
            box(F, x, y, z, 0.09, 0.09, 1.9, 'wood')
        beam(F, x0, y, z + 1.85, x1, y, z + 1.85, 0.03, 0.03, 'wood')
        u = x0 + 0.3
        while u < x1 - 0.7:
            cw = 0.6 + 0.35 * ((k * 5) % 3)
            box(F, u + cw / 2, y, z + 1.85 - 1.1 + 0.15 * (k % 2), cw, 0.02, 1.1 - 0.15 * (k % 2), cols[k % len(cols)])
            u += cw + 0.2; k += 1


# ---------------------------------------------------------------- rome_insula_i
def build_insula_i():
    """14 x 12 m, three storeys (eaves 10.2 m) and a flat roof terrace. After the Fullonica of Stephanus (Pompeii
    I.6.7): a wide door onto the workshop, the treading stalls and a rinsing tank inside, the cloth press by the door;
    election notices on the front (Stephanus is known from the notices painted on his); a cloth shop and a stair door.
    On the roof the cloth dries on lines; a small stair house with a pent roof in one corner."""
    w, d = 14.0, 12.0
    F = Frame(); ln = _lines(w, d)
    _plinth(F, w, d)
    H_g, H_f = 4.2, 3.0
    eave = H_g + H_f * 2
    D = 4.4
    _core(F, w, d, 0.0, H_g, 'brick', inS=D)
    _core(F, w, d, H_g, eave, 'brick')
    S, Ls = shop_side(F, *ln['S'], H_g, 'plaster', [
        dict(kind='shop', u=4.0, w=3.2, rw=6.4, trade='fuller', stair=False),
        dict(kind='door', u=8.3, w=1.0),
        dict(kind='shop', u=11.2, w=2.2, rw=2.8, trade='cloth', stair_side=-1)], D=D)
    programma(S, 6.7, 1.25, -SKIN - 0.01, w=1.4, lines=4)
    programma(S, 8.3, 2.78, -SKIN - 0.01, w=1.0, lines=2)
    for key in 'ENW':
        p0, p1 = ln[key]
        L = _len(p0, p1)
        _skin(F, p0, p1, 0.0, H_g, _wins(L, 2, 2.2, 0.8, 0.9), 'plaster', frame='stone')
    _quoins(F, w, d, H_g, 'brick')
    for key in 'SENW':
        band(F, *ln[key][0], *ln[key][1], H_g - 0.24, 0.2, 0.5, 'brick')
        band(F, *ln[key][0], *ln[key][1], eave - 0.2, 0.2, 0.45, 'stone')
    _upper(F, ln, H_g, H_f, 'plaster2', n=4, ww=0.9, wh=1.3, zb=0.8, frame='stone')
    _upper(F, ln, H_g + H_f, H_f, 'plaster', n=4, ww=0.75, wh=1.0, zb=1.0, arches=True)
    _flat_roof(F, w + 0.1, d + 0.1, eave)
    _drying_lines(F, -5.6, 2.6, (-4.0, -2.2, -0.4, 1.4), eave + 0.12,
                  ('linen', 'linen', 'red', 'linen', 'awning', 'linen', 'blue', 'linen', 'ochre'))
    box(F, 4.6, 3.5, eave + 0.12, 2.6, 2.8, 2.3, 'plaster')                         # the stair house
    _skin(F, (3.3, 2.1), (5.9, 2.1), eave + 0.12, 2.3, [(1.3, 0.0, 0.8, 1.9, 'rect')], 'plaster', depth=0.05)
    lean_roof(F, 3.1, 5.05, 6.1, 5.05, eave + 2.95, 3.2, 0.45)
    for u in (0.6, 2.0):
        _pot(F, -5.2 + u * 4, 4.6, eave + 0.12)
    return eave


# ---------------------------------------------------------------- rome_insula_j
def _inn_sign(S, u, z, yf):
    """【史】A painted inn sign: an elephant on a white board, as on the inn of Sittius at Pompeii (VII.1.44, CIL IV 806)."""
    box(S, u, yf - 0.005, z, 1.0, 0.01, 0.7, 'linen')
    box(S, u, yf - 0.01, z + 0.66, 1.0, 0.012, 0.05, 'red')
    box(S, u, yf - 0.01, z, 1.0, 0.012, 0.05, 'red')
    box(S, u - 0.02, yf - 0.012, z + 0.24, 0.5, 0.01, 0.24, 'grey')                  # body
    box(S, u + 0.28, yf - 0.012, z + 0.32, 0.18, 0.01, 0.2, 'grey')                  # head
    beam(S, u + 0.36, yf - 0.013, z + 0.34, u + 0.42, yf - 0.013, z + 0.12, 0.04, 0.01, 'grey')   # trunk
    for dx in (-0.2, -0.08, 0.08, 0.18):
        box(S, u + dx, yf - 0.012, z + 0.1, 0.06, 0.01, 0.15, 'grey')


def build_insula_j():
    """12 x 12 m, three storeys (eaves 10.2 m). An inn (stabulum): an arched cart gate into the yard with a cart, a
    manger and a trough in the passage; a food bar with dolia and a painted sign; a stair door up to the rooms. Over
    the street a long timber gallery in front of the guest rooms (many small windows); laundry on it; a hipped roof.
    On the right side the stable's high small windows and a tethering stone by the gate."""
    w, d = 12.0, 12.0
    F = Frame(); ln = _lines(w, d)
    _plinth(F, w, d)
    H_g, H_f = 4.2, 3.0
    eave = H_g + H_f * 2
    hw, hd = w / 2 - SKIN, d / 2 - SKIN
    D, Dg, gw = 3.2, 7.2, 2.8
    gu = 2.1
    # the ground core: inset D on the front, and a slot Dg deep for the passage behind the gate
    g0, g1 = -hw + gu - gw / 2 - 0.1, -hw + gu + gw / 2 + 0.1
    box(F, (hw + g1) / 2, (-hd + D + hd) / 2, 0.0, hw - g1, 2 * hd - D, H_g, 'brick')
    box(F, (-hw + g0) / 2, (-hd + D + hd) / 2, 0.0, g0 + hw, 2 * hd - D, H_g, 'brick')
    box(F, (g0 + g1) / 2, (-hd + Dg + hd) / 2, 0.0, g1 - g0, 2 * hd - Dg, H_g, 'brick')
    _core(F, w, d, H_g, eave, 'brick')
    S, Ls = shop_side(F, *ln['S'], H_g, 'plaster2', [
        dict(kind='gate', u=gu, w=gw, h=3.5, D=Dg),
        dict(kind='shop', u=6.2, w=2.4, rw=3.2, trade='bar'),
        dict(kind='door', u=9.6, w=1.0)], D=D)
    _inn_sign(S, 8.45, 1.55, -SKIN - 0.01)
    programma(S, 9.6, 2.78, -SKIN - 0.01, w=1.0, lines=2)
    bench(S, 8.1, -SKIN - 0.01, w=0.9)
    bench(S, 10.9, -SKIN - 0.01, w=0.7)
    cyl(S, 3.9, -SKIN - 0.35, 0.0, 0.16, 0.7, 'stone', 8, r_top=0.13)               # tethering stone
    E, Le = shop_side(F, *ln['E'], H_g, 'plaster2', [
        dict(kind='win', u=4.5, zb=2.6, w=0.6, h=0.5), dict(kind='win', u=6.3, zb=2.6, w=0.6, h=0.5),
        dict(kind='win', u=8.1, zb=2.6, w=0.6, h=0.5), dict(kind='win', u=10.2, zb=2.2, w=0.8, h=0.9)], D=D)
    shrine(E, 1.6, 1.25, -SKIN - 0.01)
    for key in 'NW':
        _skin(F, *ln[key], 0.0, H_g, _wins(_len(*ln[key]), 2, 2.2, 0.8, 0.9), 'plaster2')
    _quoins(F, w, d, H_g, 'brick')
    for key in 'SENW':
        band(F, *ln[key][0], *ln[key][1], H_g - 0.24, 0.2, 0.5, 'brick')
    _upper(F, ln, H_g, H_f, 'plaster', n=5, ww=0.7, wh=1.0, zb=1.0, frame='stone')
    _upper(F, ln, H_g + H_f, H_f, 'plaster', n=5, ww=0.65, wh=0.9, zb=1.0)
    balcony(F, *ln['S'][0], *ln['S'][1], H_g + 0.12, depth=1.0, mat='wood', roof=True, laundry=True)
    for key in 'SENW':
        _rafters(F, *ln[key], eave, 0.85, every=0.9)
    hip_roof(F, 0, 0, eave, w, d, 20.0, 0.5, 'tile')
    return eave


# ---------------------------------------------------------------- rome_insula_k
def _up(mat, pts):
    """A roof polygon with its normal up."""
    q4(mat, pts, Vector((sum(p.x for p in pts) / len(pts), sum(p.y for p in pts) / len(pts), -100.0)))


def build_insula_k():
    """14 x 12 m. A house with its own atrium (domus) whose street front is let as shops, as the owners of large houses
    did at Pompeii (Casa di Pansa, VI.6) and on the Sacra Via in Rome (the houses on the north slope of the Palatine).
    On the front: the tall house door with its pilasters and pediment in the middle, two shops each side (bread,
    greengrocer, oil, a food bar); over the shops a flat (cenaculum) with a balcony and laundry, reached by its own stair
    door on the side street. Behind, the atrium wing is one tall storey with a compluviate roof sloping in to the
    opening over the rain basin (impluvium). Plain walls with few small windows on the other sides."""
    w, d = 14.0, 12.0
    F = Frame(); ln = _lines(w, d)
    _plinth(F, w, d)
    hw, hd = w / 2 - SKIN, d / 2 - SKIN
    H_g, H_f, H_a = 4.4, 3.0, 5.6
    D, yw = 3.2, -1.65                       # shop depth; the back wall of the front wing
    eave_f = H_g + H_f
    # front wing core (behind the shops) up to the flat's eaves
    box(F, 0, (-hd + D + yw) / 2, 0.0, 2 * hw, yw + hd - D, H_g, 'plaster')
    box(F, 0, (-hd + yw) / 2, H_g, 2 * hw, yw + hd, H_f, 'plaster')
    # atrium wing with the shaft under the compluvium
    cx0, cx1, cy0, cy1 = -1.7, 1.7, 0.4, 2.9
    box(F, (-hw + cx0) / 2, (yw + hd) / 2, 0.0, cx0 + hw, hd - yw, H_a, 'plaster')
    box(F, (hw + cx1) / 2, (yw + hd) / 2, 0.0, hw - cx1, hd - yw, H_a, 'plaster')
    box(F, 0, (yw + cy0) / 2, 0.0, cx1 - cx0, cy0 - yw, H_a, 'plaster')
    box(F, 0, (cy1 + hd) / 2, 0.0, cx1 - cx0, hd - cy1, H_a, 'plaster')
    box(F, 0, (cy0 + cy1) / 2, 0.0, cx1 - cx0, cy1 - cy0, 0.12, 'paving')           # the atrium floor seen from above
    for sx in (-1, 1):                                                                # red dado round the shaft
        box(F, sx * (cx1 - 0.01), (cy0 + cy1) / 2, 0.12, 0.02, cy1 - cy0, 1.2, 'red')
        box(F, 0, (cy0 + 0.01) if sx < 0 else (cy1 - 0.01), 0.12, cx1 - cx0, 0.02, 1.2, 'red')
    box(F, 0, (cy0 + cy1) / 2, 0.12, 2.2, 1.5, 0.2, 'marble')                         # impluvium
    box(F, 0, (cy0 + cy1) / 2, 0.2, 1.9, 1.2, 0.13, 'water')
    S, Ls = shop_side(F, *ln['S'], H_g, 'plaster', [
        dict(kind='shop', u=1.5, w=2.1, rw=2.6, trade='bread'),
        dict(kind='shop', u=4.2, w=2.0, rw=2.4, trade='green', stair_side=-1),
        dict(kind='open', u=6.65, w=1.5),
        dict(kind='shop', u=9.1, w=2.0, rw=2.4, trade='oil'),
        dict(kind='shop', u=11.75, w=2.3, rw=2.8, trade='bar', stair_side=-1)], D=D, frame=None)
    # the house door: fauces with leaves open, painted walls and a mosaic threshold, a dressed portal
    room(S, 5.75, 7.55, D, 3.4, wall='red', floor='marble', joists=False)
    box(S, 6.65, D - 0.02, 0.0, 1.0, 0.02, 2.6, 'dark')
    for sd in (-1, 1):
        box(S, 6.65 + sd * 0.78, 0.65, 0.0, 0.06, 0.8, 2.6, 'wood')
        box(S, 6.65 + sd * 0.98, -SKIN - 0.08, 0.0, 0.28, 0.2, 3.0, 'travertine')
    box(S, 6.65, -SKIN - 0.1, 2.7, 2.4, 0.26, 0.3, 'travertine')
    q4('travertine', [S.p(5.45, -SKIN - 0.2, 3.0), S.p(7.85, -SKIN - 0.2, 3.0), S.p(6.65, -SKIN - 0.2, 3.65)],
       S.p(6.65, 5.0, 3.2))
    box(S, 6.65, -SKIN - 0.15, 3.0, 2.5, 0.3, 0.08, 'travertine')
    programma(S, 3.0, 2.95, -SKIN - 0.01, w=0.9, lines=2)
    # the other sides: plain, few small windows; the flat's stair door on the side street
    E, Le = shop_side(F, *ln['E'], H_g, 'plaster', [
        dict(kind='win', u=1.6, zb=0.0, w=0.9, h=2.3),
        dict(kind='win', u=6.0, zb=2.8, w=0.6, h=0.6), dict(kind='win', u=9.0, zb=2.8, w=0.6, h=0.6)], D=1.6, frame=None)
    for key in 'NW':
        _skin(F, *ln[key], 0.0, H_g, _wins(_len(*ln[key]), 2, 2.8, 0.6, 0.6), 'plaster')
    box(E, 1.6, -SKIN - 0.05, 2.3, 1.3, 0.16, 0.22, 'travertine')                   # the flat's own stair door
    box(E, 1.6, -SKIN + 0.2, -0.02, 1.0, 0.5, 0.06, 'travertine')
    for key in 'NW':
        band(F, *ln[key][0], *ln[key][1], 0.0, 0.9, 0.38, 'red')                      # a red socle
    # the flat over the shops, and the atrium wing's attic
    _skin(F, *ln['S'], H_g, H_f, _wins(Ls, 5, 0.8, 0.85, 1.2), 'plaster2', frame='stone')
    for p0, p1 in (((hw, -hd), (hw, yw)), ((-hw, yw), (-hw, -hd))):
        _skin(F, p0, p1, H_g, H_f, _wins(_len(p0, p1), 1, 0.8, 0.8, 1.0), 'plaster2')
    _skin(F, (hw, yw), (hw, hd), H_g, H_a - H_g, [], 'plaster')
    _skin(F, (hw, hd), (-hw, hd), H_g, H_a - H_g, [], 'plaster')
    _skin(F, (-hw, hd), (-hw, yw), H_g, H_a - H_g, [], 'plaster')
    band(F, *ln['S'][0], *ln['S'][1], H_g - 0.2, 0.2, 0.5, 'brick')
    balcony(F, *ln['S'][0], *ln['S'][1], H_g + 0.12, depth=0.9, mat='wood', roof=False, laundry=True)
    _rafters(F, *ln['S'], eave_f, 0.85, every=0.9)
    gable_roof(F, 0, (-d / 2 + yw) / 2, eave_f, w, yw + d / 2 + 0.2, pitch=22.0, axis='x', overhang=0.5,
               gable_mat='plaster2')
    # compluviate roof: out from a ridge ring down to the eaves, and in from it down to the opening
    o = 0.45
    X0, X1, Y0, Y1 = -w / 2 - o, w / 2 + o, yw + 0.1, d / 2 + o
    zr, ze, zi = H_a + 1.25, H_a - 0.15, H_a + 0.35
    rx0, rx1, ry0, ry1 = (X0 + cx0) / 2, (X1 + cx1) / 2, (Y0 + cy0) / 2, (Y1 + cy1) / 2
    P = lambda x, y, z: F.p(x, y, z)
    outer = [(X0, Y0), (X1, Y0), (X1, Y1), (X0, Y1)]
    ring = [(rx0, Y0), (rx1, Y0), (rx1, ry1), (rx0, ry1)]       # the ridge runs along the front wing's back wall
    hole = [(cx0, cy0), (cx1, cy0), (cx1, cy1), (cx0, cy1)]
    for i in range(4):
        j = (i + 1) % 4
        if i:                                         # no outer slope against the front wing
            _up('tile', [P(*outer[i], ze), P(*outer[j], ze), P(*ring[j], zr), P(*ring[i], zr)])
        _up('tile2', [P(*ring[i], zr), P(*ring[j], zr), P(*hole[j], zi), P(*hole[i], zi)])
    for i in range(4):                                # the rim of the opening
        j = (i + 1) % 4
        beam(F, *hole[i], zi - 0.05, *hole[j], zi - 0.05, 0.16, 0.12, 'wood')
    for (x, y) in hole:                               # antefix-like spouts at the corners
        box(F, x, y, zi - 0.25, 0.16, 0.16, 0.25, 'tile')
    return eave_f


# ---------------------------------------------------------------- rome_insula_l
def build_insula_l():
    """8 x 12 m, four storeys (eaves 13.2 m). A narrow house built in tuff with brick bands and brick quoins (Rome's
    usual walling in Nero's time), a smith's shop with a hearth, an anvil and iron goods in the street, a stair door; pink plaster on the second floor, a timber top floor, a balcony with laundry."""
    w, d = 8.0, 12.0
    F = Frame(); ln = _lines(w, d)
    _plinth(F, w, d)
    H_g, H_f = 4.2, 3.0
    eave = H_g + H_f * 3
    D = 3.4
    _core(F, w, d, 0.0, H_g, 'tuff', inS=D)
    _core(F, w, d, H_g, eave, 'tuff')
    S, Ls = shop_side(F, *ln['S'], H_g, 'tuff', [
        dict(kind='shop', u=2.55, w=2.8, rw=3.9, trade='smith', stair_side=-1),
        dict(kind='door', u=5.95, w=1.0)], D=D, frame='brick')
    programma(S, 5.95, 2.78, -SKIN - 0.01, w=0.9, lines=2)
    for key in 'ENW':
        p0, p1 = ln[key]
        _skin(F, p0, p1, 0.0, H_g, _wins(_len(p0, p1), 1 if key == 'N' else 2, 2.2, 0.6, 0.7), 'tuff', frame='brick')
    _upper(F, ln, H_g, H_f, 'tuff', n=2, ww=0.8, wh=1.2, zb=0.8, frame='brick', arches=True)
    _upper(F, ln, H_g + H_f, H_f, 'plaster3', n=2, ww=0.7, wh=1.0, zb=1.0)
    _timber(F, ln, H_g + 2 * H_f, H_f, windows=2)
    hw, hd = w / 2 - SKIN, d / 2 - SKIN
    for sx in (-1, 1):                                                               # brick quoins up two floors
        for sy in (-1, 1):
            for k in range(8):
                box(F, sx * (hw + SKIN / 2), sy * (hd + SKIN / 2), k * (H_g + H_f) / 8, SKIN + 0.06 + 0.25 * (k % 2),
                    SKIN + 0.06 + 0.25 * ((k + 1) % 2), (H_g + H_f) / 8 - 0.02, 'brick')
    for key in 'SENW':
        for z in (H_g - 0.24, H_g + 1.5, H_g + H_f - 0.2):
            band(F, *ln[key][0], *ln[key][1], z, 0.22, 0.42, 'brick')
    balcony(F, *ln['S'][0], *ln['S'][1], H_g + H_f + 0.12, depth=0.8, mat='wood', roof=False, laundry=True)
    for key in 'EW':
        _rafters(F, *ln[key], eave, 0.6, every=0.9)
    gable_roof(F, 0.0, 0.0, eave, w, d + 0.3, pitch=22.0, axis='y', overhang=0.4, gable_mat='mud')
    return eave


# ---------------------------------------------------------------- rome_insula_m
def build_insula_m():
    """12 x 12 m, four storeys (eaves 13.2 m). A masonry stair climbs the outside of the side wall to the first-floor
    flat's own door (Pompeii: separate stairs from the street to rented upper floors, e.g. IX.12.2). On the front a
    greengrocer with a stepped stand of baskets, a barber with a stool outside, an oil shop; pink plaster below, lime
    above, a timber top floor, a balcony with laundry, a gable roof along the street."""
    w, d = 12.0, 12.0
    F = Frame(); ln = _lines(w, d)
    _plinth(F, w, d)
    H_g, H_f = 4.2, 3.0
    eave = H_g + H_f * 3
    hw, hd = w / 2 - SKIN, d / 2 - SKIN
    D = 3.2
    _core(F, w, d, 0.0, H_g, 'mud', inS=D)
    _core(F, w, d, H_g, eave, 'mud')
    S, Ls = shop_side(F, *ln['S'], H_g, 'plaster3', [
        dict(kind='shop', u=2.0, w=2.4, rw=3.0, trade='green'),
        dict(kind='shop', u=5.5, w=2.0, rw=2.6, trade='barber', stair=False),
        dict(kind='shop', u=9.3, w=2.2, rw=2.8, trade='oil', stair_side=-1)], D=D)
    programma(S, 3.75, 1.3, -SKIN - 0.01, w=0.8, lines=3)
    lean_roof(S, 4.2, -0.4, 6.8, -0.4, 2.95, 0.9, 0.35, mat='awning', tiles=False)   # the barber's awning
    for x in (4.3, 6.7):
        box(S, x, -1.25, 0.0, 0.07, 0.07, 2.6, 'wood')
    E, Le = shop_side(F, *ln['E'], H_g, 'plaster3', [
        dict(kind='win', u=10.4, zb=2.2, w=0.8, h=0.9)], D=D)
    for key in 'NW':
        _skin(F, *ln[key], 0.0, H_g, _wins(_len(*ln[key]), 2, 2.2, 0.8, 0.9), 'plaster3')
    _quoins(F, w, d, H_g, 'brick')
    for key in 'SENW':
        band(F, *ln[key][0], *ln[key][1], H_g - 0.24, 0.2, 0.5, 'brick')
    # the outside stair along the east wall up to a landing and the flat's door
    xs = hw + SKIN + 0.5
    stair_flight(F, xs, -hd + 0.6, xs, 2.6, 0.0, H_g, width=0.95, mat='stone', cheek_mat='plaster3', cheeks=False)
    box(F, xs, 3.45, -0.5, 0.95, 1.7, H_g + 0.5, 'stone')                            # the landing on a solid pier
    beam(F, xs + 0.5, -hd + 0.6, 1.0, xs + 0.5, 2.6, H_g + 1.0, 0.1, 0.12, 'wood')   # the hand rail
    for y, z in ((-hd + 0.6, 0.0), (-1.0, 1.75), (1.0, 3.2), (2.6, H_g)):
        box(F, xs + 0.5, y, z, 0.08, 0.08, 1.0, 'wood')
    box(F, xs + 0.5, 3.45, H_g, 0.08, 1.7, 1.0, 'plaster3')
    for key in 'SNW':
        _upper(F, ln, H_g, H_f, 'plaster3', n=3, ww=0.85, wh=1.2, zb=0.9, frame='stone', sides=key)
    _skin(F, *ln['E'], H_g, H_f, [(hd + 3.45, 0.0, 0.9, 2.2, 'rect'), (3.0, 0.9, 0.85, 1.2, 'rect'),
                                   (6.2, 0.9, 0.85, 1.2, 'rect')], 'plaster3', frame='stone')
    _upper(F, ln, H_g + H_f, H_f, 'plaster', n=3, ww=0.75, wh=1.0, zb=1.0)
    _timber(F, ln, H_g + 2 * H_f, H_f, windows=3)
    balcony(F, *ln['S'][0], *ln['S'][1], H_g + H_f + 0.12, depth=0.9, mat='wood', roof=True, laundry=True)
    for key in 'SN':
        _rafters(F, *ln[key], eave, 0.85, every=0.9)
    gable_roof(F, 0, 0, eave, w, d, pitch=20.0, axis='x', overhang=0.5, gable_mat='mud')
    return eave


if __name__ == '__main__':
    for name, fn in (('rome_insula_i', build_insula_i), ('rome_insula_j', build_insula_j),
                     ('rome_insula_k', build_insula_k), ('rome_insula_l', build_insula_l),
                     ('rome_insula_m', build_insula_m)):
        if len(sys.argv) > 1 and sys.argv[-1].startswith('rome_') and sys.argv[-1] != name:
            continue
        reset()
        fn()
        finish(name, front='-Y')
