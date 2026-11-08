"""rome_insulae2 · five more apartment blocks for AD 56, each with a living ground floor (briefs/rome/ground-floor.md):
rome_insula_d (a row of shops with lofts: bread, fish, oil, pottery), rome_insula_e (a corner food bar and a wine shop,
a closed timber room hanging over the street), rome_insula_f (a bakery with lava mills and an oven), rome_insula_g (a
Herculaneum timber house whose upper floor stands out over the pavement on brick columns), rome_insula_h (a tall narrow
Subura tenement with a dyer's shop).

Run: /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_insulae2.py"
Origin = centre of the footprint, z = 0 = street level, front = -Y. Each block fits the placement slot of an older one
(monuments.js): d and f in a's 15.3 x 13.7 m, e in b's 14.7 x 13.4 m, g and h in c's 8.9 x 14.3 m.
"""
import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rome_insulae import *          # noqa: F401,F403  (helpers, SKIN, and the low-sample preview patch)
from rome_insulae import _lines, _len, _wins, _skin, _win_arches, _rafters, _pot, _plinth
from rome_tabernae import shop_side, programma, shrine, bench, arch, amphora, jar, CEIL
from rk import _seg_frame
import math


def _core(F, w, d, z0, z1, mat, inS=0.0, inE=0.0, inN=0.0, inW=0.0):
    """The solid core between the wall lines, inset on sides whose shop rooms lie behind the line."""
    hw, hd = w / 2 - SKIN, d / 2 - SKIN
    x0, x1, y0, y1 = -hw + inW, hw - inE, -hd + inS, hd - inN
    box(F, (x0 + x1) / 2, (y0 + y1) / 2, z0, x1 - x0, y1 - y0, z1 - z0, mat)


def _quoins(F, w, d, h, mat='brick'):
    """Fill the small re-entrant corner where two facade skins meet: a masonry quoin up the ground floor."""
    hw, hd = w / 2 - SKIN, d / 2 - SKIN
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(F, sx * (hw + SKIN / 2), sy * (hd + SKIN / 2), 0.0, SKIN + 0.02, SKIN + 0.02, h, mat)


def _upper(F, ln, z, H_f, mat, n=3, ww=0.9, wh=1.2, zb=0.9, frame=None, sides='SENW', arches=False):
    for key in sides:
        p0, p1 = ln[key]
        L = _len(p0, p1)
        _skin(F, p0, p1, z, H_f, _wins(L, n if key in 'SN' else max(2, n - 1), zb, ww, wh), mat, frame=frame)
        if arches:
            _win_arches(F, p0, p1, z + zb + wh, n if key in 'SN' else max(2, n - 1), ww)


def _timber(F, ln, z, H_f, windows=3, sides='SENW'):
    for key in sides:
        p0, p1 = ln[key]
        timber_skin(F, p0[0], p0[1], p1[0], p1[1], z, H_f, floors=1, mat='mud', frame='wood',
                    windows=windows if key in 'SN' else max(2, windows - 1))


# ---------------------------------------------------------------- rome_insula_d
def build_insula_d():
    """14 x 12 m, four storeys (eaves 13.2 m). The book's street: on the front four shops with their lofts, a bakery's
    shop, a fishmonger, an oil seller and a potter, and between them a stair door to the flats with an election notice
    over it. Whitewashed ground floor, lime first floor (the better flats, larger framed windows) with a timber
    maenianum and laundry, ochre second floor, timber-framed top floor, low hipped roof."""
    w, d = 14.0, 12.0
    F = Frame(); ln = _lines(w, d)
    _plinth(F, w, d)
    H_g, H_f = 4.2, 3.0
    eave = H_g + H_f * 3
    D = 3.2
    _core(F, w, d, 0.0, H_g, 'mud', inS=D, inE=D)
    _core(F, w, d, H_g, eave, 'mud')
    # front: bread, fish, (stair door), oil, pottery
    S, Ls = shop_side(F, *ln['S'], H_g, 'plaster', [
        dict(kind='shop', u=1.6, w=2.2, rw=2.6, trade='bread'),
        dict(kind='shop', u=4.45, w=2.2, rw=2.6, trade='fish', stair_side=-1),
        dict(kind='door', u=6.65, w=1.0),
        dict(kind='shop', u=8.85, w=2.2, rw=2.6, trade='oil'),
        dict(kind='shop', u=11.7, w=2.2, rw=2.6, trade='pottery', stair_side=-1)], D=D)
    programma(S, 6.65, 2.78, -SKIN - 0.01, w=1.1, lines=3)
    # right side: one shop shut with its boards, windows
    E, Le = shop_side(F, *ln['E'], H_g, 'plaster', [
        dict(kind='shop', u=5.0, w=2.0, rw=2.4, boards='closed'),
        dict(kind='win', u=8.0, zb=2.2, w=0.8, h=0.9), dict(kind='win', u=10.2, zb=2.2, w=0.8, h=0.9)], D=D)
    shrine(E, 2.2, 1.25, -SKIN - 0.01)
    Lw = _len(*ln['W'])
    _skin(F, *ln['W'], 0.0, H_g, _wins(Lw, 2, 2.2, 0.8, 0.9) + [(Lw / 2, 0.0, 1.3, 2.4, 'arch')], 'plaster')
    _skin(F, *ln['N'], 0.0, H_g, _wins(_len(*ln['N']), 3, 2.2, 0.8, 0.9), 'plaster')
    _quoins(F, w, d, H_g, 'travertine')
    for key in 'SENW':
        band(F, *ln[key][0], *ln[key][1], H_g - 0.24, 0.2, 0.5, 'brick')
    _upper(F, ln, H_g, H_f, 'plaster', n=4, ww=1.0, wh=1.5, zb=0.7, frame='stone')
    _upper(F, ln, H_g + H_f, H_f, 'plaster2', n=4, ww=0.75, wh=1.0, zb=1.0, arches=True)
    _timber(F, ln, H_g + 2 * H_f, H_f, windows=4)
    balcony(F, *ln['S'][0], *ln['S'][1], H_g + 0.12, depth=1.0, mat='wood', roof=True, laundry=True)
    for u in (0.7, Ls - 0.7):
        _pot(S, u, -0.55, H_g + 0.12)
    for key in 'SN':
        _rafters(F, *ln[key], eave, 0.85, every=0.9)
    hip_roof(F, 0, 0, eave, w, d, 20.0, 0.5, 'tile')
    return eave


# ---------------------------------------------------------------- rome_insula_e
def _hanging_room(F, p0, p1, u0, u1, z, out=1.2, h=2.6):
    """【史】A closed timber room hanging over the street on beam ends (Pompeii, Casa del Balcone Pensile): floor on
    joists with diagonal braces, daubed walls between corner posts, small windows, a tile pent roof."""
    S, L = _seg_frame(F, p0[0], p0[1], p1[0], p1[1], 0)
    yo = -SKIN - out
    box(S, (u0 + u1) / 2, -SKIN - out / 2, z - 0.14, u1 - u0, out, 0.14, 'wood')
    for u in [u0 + 0.15 + k * (u1 - u0 - 0.3) / 4 for k in range(5)]:
        beam(S, u, 0.0, z - 0.3, u, yo - 0.12, z - 0.3, 0.14, 0.18, 'wood')
        beam(S, u, -SKIN, z - 1.0, u, yo + 0.25, z - 0.3, 0.1, 0.1, 'wood')
    wins = [((k + 0.5) * (u1 - u0) / 3, 1.0, 0.6, 0.6, 'rect') for k in range(3)]
    opening_skin(S, u0, yo + 0.25, u1, yo + 0.25, z, h, wins, 'mud', depth=0.25)
    for su, e in ((u0, -1), (u1, 1)):
        box(S, su - e * 0.06, -SKIN - out / 2, z, 0.12, out, h, 'mud')
        box(S, su - e * 0.06, yo + 0.06, z, 0.14, 0.14, h, 'wood')
    box(S, (u0 + u1) / 2, yo + 0.06, z + h - 0.12, u1 - u0, 0.14, 0.12, 'wood')
    box(S, (u0 + u1) / 2, -SKIN - out / 2 + 0.1, z + h - 0.04, u1 - u0, out - 0.1, 0.04, 'wood')   # lid over the walls
    lean_roof(S, u0 - 0.2, 0.0, u1 + 0.2, 0.0, z + h + 0.55, out + SKIN + 0.3, 0.6)


def build_insula_e():
    """Corner block 12 x 12 m, four storeys (eaves 13.2 m). At the corner a food bar open on both streets: a painted
    counter with three dolia, a stepped shelf for jugs, a lararium on the back wall, benches outside; on the front a
    wine shop with amphorae on a rack, a stair door to the flats with a street shrine and an election notice beside it.
    Over the wine shop a closed timber room hangs out over the street. Ochre ground floor, lime upper floors, timber top
    floor; a wooden balcony with laundry on the right side; low hipped roof."""
    w, d = 12.0, 12.0
    F = Frame(); ln = _lines(w, d)
    _plinth(F, w, d)
    H_g, H_f = 4.2, 3.0
    eave = H_g + H_f * 3
    D = 3.2
    _core(F, w, d, 0.0, H_g, 'brick', inS=D, inE=D)
    _core(F, w, d, H_g, eave, 'brick')
    S, Ls = shop_side(F, *ln['S'], H_g, 'plaster2', [
        dict(kind='shop', u=2.0, w=2.2, rw=2.8, trade='oil'),
        dict(kind='door', u=4.4, w=1.0),
        dict(kind='shop', u=9.6, w=2.4, rw=3.4, trade='bar', sides=(True, False), stair_side=-1)], D=D)
    shrine(S, 6.0, 1.3, -SKIN - 0.01)
    programma(S, 7.2, 1.55, -SKIN - 0.01, w=0.8, lines=2)
    bench(S, 7.4, -SKIN - 0.01, w=1.1)
    # right side: the bar's second door (into the same room), then a pottery shop
    E, Le = shop_side(F, *ln['E'], H_g, 'plaster2', [
        dict(kind='open', u=1.6, w=1.8),
        dict(kind='shop', u=6.0, w=2.2, rw=2.8, trade='pottery'),
        dict(kind='win', u=9.6, zb=2.2, w=0.8, h=0.9)], D=D)
    # the bar's side door: an opening in the E skin into the corner room (no room of its own)
    bench(E, 3.6, -SKIN - 0.01, w=1.0)
    Lw = _len(*ln['W'])
    _skin(F, *ln['W'], 0.0, H_g, _wins(Lw, 2, 2.2, 0.8, 0.9) + [(Lw / 2, 0.0, 1.3, 2.4, 'arch')], 'plaster2')
    _skin(F, *ln['N'], 0.0, H_g, _wins(_len(*ln['N']), 3, 2.2, 0.8, 0.9), 'plaster2')
    _quoins(F, w, d, H_g, 'brick')
    for key in 'SENW':
        band(F, *ln[key][0], *ln[key][1], H_g - 0.24, 0.2, 0.5, 'brick')
    _upper(F, ln, H_g, H_f, 'plaster', n=3, ww=0.9, wh=1.3, zb=0.9, frame='stone')
    _upper(F, ln, H_g + H_f, H_f, 'plaster', n=3, ww=0.8, wh=1.1, zb=1.0)
    _timber(F, ln, H_g + 2 * H_f, H_f, windows=3)
    _hanging_room(F, *ln['S'], 0.4, 5.4, H_g + 0.15, out=0.9)
    balcony(F, *ln['E'][0], *ln['E'][1], H_g + H_f + 0.12, depth=0.9, mat='wood', roof=False, laundry=True)
    for key in 'SENW':
        _rafters(F, *ln[key], eave, 0.85, every=0.9)
    hip_roof(F, 0, 0, eave, w, d, 20.0, 0.5, 'tile')
    return eave


# ---------------------------------------------------------------- rome_insula_f
def build_insula_f():
    """14 x 12 m, four storeys (eaves 13.2 m). A bakery (pistrinum): through a wide door two hourglass lava mills with
    their wooden arms and a domed brick oven; next door the bread shop with a counter and shelves of loaves; a stair
    door; a shop shut with its boards. Brick ground floor, ochre and
    lime floors above, a timber top floor; the roof is a low gable along the street."""
    w, d = 14.0, 12.0
    F = Frame(); ln = _lines(w, d)
    _plinth(F, w, d)
    H_g, H_f = 4.2, 3.0
    eave = H_g + H_f * 3
    D = 4.2
    _core(F, w, d, 0.0, H_g, 'brick', inS=D)
    _core(F, w, d, H_g, eave, 'brick')
    S, Ls = shop_side(F, *ln['S'], H_g, 'brick', [
        dict(kind='shop', u=3.1, w=3.4, rw=5.6, trade='mill', stair=False),
        dict(kind='shop', u=7.6, w=2.2, rw=2.8, trade='bread'),
        dict(kind='door', u=9.95, w=1.0),
        dict(kind='shop', u=11.95, w=1.6, rw=2.1, boards='closed', stair=False)], D=D)
    programma(S, 9.95, 2.78, -SKIN - 0.01, w=1.0, lines=2)
    for key in 'ENW':
        p0, p1 = ln[key]
        L = _len(p0, p1)
        _skin(F, p0, p1, 0.0, H_g, _wins(L, 2, 2.2, 0.8, 0.9) + ([(L / 2, 0.0, 1.3, 2.4, 'arch')] if key == 'N' else []),
              'brick', frame='stone')
    _quoins(F, w, d, H_g, 'travertine')
    for key in 'SENW':
        band(F, *ln[key][0], *ln[key][1], H_g - 0.24, 0.2, 0.5, 'brick')
    _upper(F, ln, H_g, H_f, 'plaster2', n=4, ww=0.85, wh=1.2, zb=0.9, frame='stone')
    _upper(F, ln, H_g + H_f, H_f, 'plaster', n=4, ww=0.7, wh=0.9, zb=1.1)
    _timber(F, ln, H_g + 2 * H_f, H_f, windows=4)
    balcony(F, ln['S'][0][0] + 7.0, ln['S'][0][1], ln['S'][1][0], ln['S'][1][1], H_g + H_f + 0.12, depth=0.9,
            mat='wood', roof=True, laundry=True)
    for key in 'SN':
        _rafters(F, *ln[key], eave, 0.85, every=0.9)
    gable_roof(F, 0, 0, eave, w, d, pitch=20.0, axis='x', overhang=0.5, gable_mat='mud')
    return eave


# ---------------------------------------------------------------- rome_insula_g
def build_insula_g():
    """8 x 11 m, three storeys (ground 4.0 m, upper 2.9 m; eaves 9.8 m), after Herculaneum's Casa a Graticcio: a brick
    ground floor with a potter's shop spilling onto the street and a separate door up to the flat; the first floor,
    timber-framed and daubed, stands 1.3 m out over the pavement on two brick columns, under its own tile pent roof;
    the top floor sits back on the wall line; a low gable roof with the gable to the street; laundry on a pole."""
    w, d = 8.0, 11.0
    F = Frame(); ln = _lines(w, d)
    _plinth(F, w, d)
    H_g, H_f = 4.0, 2.9
    eave = H_g + H_f * 2
    hw, hd = w / 2 - SKIN, d / 2 - SKIN
    D = 3.0
    _core(F, w, d, 0.0, H_g, 'brick', inS=D)
    _core(F, w, d, H_g, eave, 'brick')
    S, Ls = shop_side(F, *ln['S'], H_g, 'brick', [
        dict(kind='shop', u=2.3, w=2.6, rw=3.6, trade='pottery'),
        dict(kind='door', u=5.6, w=1.0)], D=D)
    for key in 'ENW':
        p0, p1 = ln[key]
        _skin(F, p0, p1, 0.0, H_g, _wins(_len(p0, p1), 1 if key == 'N' else 2, 2.0, 0.6, 0.7), 'brick', frame='stone')
    _quoins(F, w, d, H_g, 'brick')
    # the projecting first floor on two brick columns over the pavement
    out = 1.3
    yo = -d / 2 - out
    for x in (-2.7, 2.7):
        cyl(F, x, yo + 0.25, 0.0, 0.22, H_g - 0.25, 'brick', 10)
        box(F, x, yo + 0.25, H_g - 0.3, 0.5, 0.5, 0.12, 'travertine')
    box(F, 0, yo + 0.35, H_g - 0.3, w + 0.2, 0.3, 0.3, 'wood')                          # the beam on the columns
    for x in (-3.6, -1.8, 0.0, 1.8, 3.6):
        beam(F, x, -hd, H_g - 0.15, x, yo + 0.1, H_g - 0.15, 0.14, 0.18, 'wood')         # joists out from the wall
    box(F, 0, -d / 2 - out / 2 + 0.17, H_g - 0.02, w + 0.2, out + 0.35, 0.14, 'wood')    # floor (its soffit is seen)
    timber_skin(F, -w / 2 - 0.1, yo + 0.25, w / 2 + 0.1, yo + 0.25, H_g + 0.12, H_f, floors=1, mat='mud',
                frame='wood', windows=3)
    for sx in (-1, 1):                                                                   # side walls of the overhang
        box(F, sx * (w / 2 - 0.01), -d / 2 + (SKIN - out - 0.01) / 2, H_g + 0.12, 0.22, out + SKIN + 0.01, H_f, 'mud')
    box(F, 0, -d / 2 + (SKIN - out - 0.01) / 2, H_g + 0.08 + H_f, w + 0.2, out + SKIN + 0.01, 0.04, 'wood')   # lid
    lean_roof(F, -w / 2 - 0.3, -hd, w / 2 + 0.3, -hd, H_g + H_f + 0.55, out + SKIN + 0.4, 0.55)
    for key in 'ENW':
        p0, p1 = ln[key]
        timber_skin(F, p0[0], p0[1], p1[0], p1[1], H_g, H_f, floors=1, mat='mud', frame='wood', windows=2)
    _upper(F, ln, H_g + H_f, H_f, 'plaster', n=2, ww=0.7, wh=0.9, zb=1.0)
    gable_roof(F, 0.0, 0.0, eave, w, d, pitch=22.0, axis='y', overhang=0.4, gable_mat='plaster')
    beam(F, 2.4, -hd + 0.3, H_g + H_f + 1.6, 2.4, -hd - 2.0, H_g + H_f + 1.6, 0.07, 0.07, 'wood')
    for k, m in enumerate(('linen', 'blue', 'linen')):
        box(F, 2.4, -hd - 0.8 - 0.5 * k, H_g + H_f + 0.95, 0.02, 0.4, 0.62, m)
    return eave


# ---------------------------------------------------------------- rome_insula_h
def build_insula_h():
    """8 x 12 m, six storeys (ground 4.0 m, upper 2.95 m; eaves 18.75 m, inside Augustus's limit of about 70 feet):
    a tall narrow Subura tenement. A dyer's shop with dyed cloth hung on a pole over the street and vats inside, a
    stair door with an election notice over it and a bench; rough lime plaster on floors 1-3 with small windows, two
    timber-framed floors at the top, a narrow balcony with laundry on the third floor, a low gable to the street."""
    w, d = 8.0, 12.0
    F = Frame(); ln = _lines(w, d)
    _plinth(F, w, d)
    H_g, H_f = 4.0, 2.95
    eave = H_g + H_f * 5
    D = 3.2
    _core(F, w, d, 0.0, H_g, 'mud', inS=D)
    _core(F, w, d, H_g, eave, 'mud')
    S, Ls = shop_side(F, *ln['S'], H_g, 'plaster', [
        dict(kind='shop', u=2.05, w=2.5, rw=3.4, trade='cloth'),
        dict(kind='door', u=4.7, w=1.0)], D=D)
    programma(S, 4.7, 2.72, -SKIN - 0.01, w=1.0, lines=3)
    bench(S, 6.4, -SKIN - 0.01, w=1.2)
    for key in 'ENW':
        p0, p1 = ln[key]
        _skin(F, p0, p1, 0.0, H_g, _wins(_len(p0, p1), 1 if key == 'N' else 2, 2.1, 0.6, 0.7), 'plaster')
    _quoins(F, w, d, H_g, 'brick')
    for fl in range(3):
        _upper(F, ln, H_g + H_f * fl, H_f, 'plaster', n=2, ww=0.7, wh=0.85 + (0.25 if fl == 0 else 0), zb=1.0,
               frame='stone' if fl == 0 else None)
    for fl in (3, 4):
        _timber(F, ln, H_g + H_f * fl, H_f, windows=2)
    balcony(F, *ln['S'][0], *ln['S'][1], H_g + 2 * H_f + 0.12, depth=0.8, mat='wood', roof=False, laundry=True)
    for key in 'EW':
        _rafters(F, *ln[key], eave, 0.6, every=0.9)
    gable_roof(F, 0.0, 0.0, eave, w, d + 0.3, pitch=22.0, axis='y', overhang=0.4, gable_mat='mud')
    return eave


if __name__ == '__main__':
    for name, fn in (('rome_insula_d', build_insula_d), ('rome_insula_e', build_insula_e),
                     ('rome_insula_f', build_insula_f), ('rome_insula_g', build_insula_g),
                     ('rome_insula_h', build_insula_h)):
        if len(sys.argv) > 1 and sys.argv[-1].startswith('rome_') and sys.argv[-1] != name:
            continue
        reset()
        fn()
        finish(name, front='-Y')
