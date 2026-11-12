"""rome_insulae4 · five more houses for AD 56, each with a different shop front and ground-floor plan
(briefs/rome/ground-floor.md, "Third set"):
rome_insula_n (a row of arched shops in tuff and travertine, timber grilles in the lunettes light the lofts; a bookseller
with titles on his doorposts), rome_insula_o (an open market front: loftless stalls with cloth awnings on poles and
trestle tables in the street; butcher, greengrocer, fishmonger), rome_insula_p (timber booths, pergulae, built out into
the street in front of the shops; a schoolmaster teaching in one), rome_insula_q (a wine merchant: a tall shop with
dolia sunk in the floor, a painted price list of wines like Ad Cucumas, a hot-food hatch), rome_insula_r (a narrow house
on a raised pavement, a hatch counter, and a passage through to an inner court with workshops and a cistern mouth).

Run: /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_insulae4.py"
Origin = centre of the footprint, z = 0 = street level, front = -Y. Slots (monuments.js): n and p in a's 15.3 x 13.7 m,
o and q in b's 14.7 x 13.4 m, r in c's 8.9 x 14.3 m.
"""
import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rome_insulae import *          # noqa: F401,F403
from rome_insulae import _lines, _len, _wins, _skin, _win_arches, _rafters, _pot, _plinth
from rome_insulae2 import _core, _quoins, _upper, _timber
from rome_tabernae import (shop_side, programma, shrine, bench, basin, room, q4, CEIL, jar, amphora, loaf,
                           doorpost_titles, ad_cucumas, awning, well_head, cart)
from rk import _seg_frame
import math

YF = -SKIN - 0.01


# ---------------------------------------------------------------- rome_insula_n
def build_insula_n():
    """14 x 12 m, three storeys (eaves 10.6 m). 【史】A row of arched shops like the tabernae along the Forum of Caesar:
    tuff walls with travertine arches, imposts and keystones; a timber lintel across each arch at the loft floor and a
    timber grille in the lunette above it, lighting the loft. A bookseller (his doorposts written over with titles, as
    Martial says of the Argiletum), a cloth shop, a pottery and a food bar; a stair door in the middle. Plaster above
    with the windows over the arches, a gable roof along the street."""
    w, d = 14.0, 12.0
    F = Frame(); ln = _lines(w, d)
    _plinth(F, w, d)
    H_g, H_f = 4.6, 3.0
    eave = H_g + H_f * 2
    D = 3.4
    _core(F, w, d, 0.0, H_g, 'tuff', inS=D)
    _core(F, w, d, H_g, eave, 'brick')
    us = (1.65, 4.55, 6.9, 9.25, 11.75)
    S, Ls = shop_side(F, *ln['S'], H_g, 'tuff', [
        dict(kind='archshop', u=us[0], w=2.2, rw=2.8, trade='books'),
        dict(kind='archshop', u=us[1], w=2.2, rw=2.8, trade='cloth', stair_side=-1),
        dict(kind='door', u=us[2], w=1.0),
        dict(kind='archshop', u=us[3], w=2.2, rw=2.6, trade='pottery'),
        dict(kind='archshop', u=us[4], w=2.2, rw=2.6, trade='bar', stair_side=-1)], D=D, frame='travertine')
    doorpost_titles(S, us[0], 2.2 + 0.5, YF, h=2.5)
    programma(S, us[2], 2.78, YF, w=1.0, lines=2)
    for key in 'ENW':
        p0, p1 = ln[key]
        _skin(F, p0, p1, 0.0, H_g, _wins(_len(p0, p1), 2, 2.4, 0.6, 0.7), 'tuff', frame='travertine')
    _quoins(F, w, d, H_g, 'travertine')
    for key in 'SENW':
        band(F, *ln[key][0], *ln[key][1], H_g - 0.26, 0.26, 0.5, 'travertine')
        band(F, *ln[key][0], *ln[key][1], eave - 0.2, 0.2, 0.45, 'stone')
    _skin(F, *ln['S'], H_g, H_f, [(u, 0.8, 0.9, 1.3, 'rect') for u in us], 'plaster2', frame='stone')
    _upper(F, ln, H_g, H_f, 'plaster2', n=4, ww=0.9, wh=1.3, zb=0.8, frame='stone', sides='ENW')
    _skin(F, *ln['S'], H_g + H_f, H_f, [(u, 1.0, 0.75, 1.0, 'rect') for u in us], 'plaster')
    _upper(F, ln, H_g + H_f, H_f, 'plaster', n=4, ww=0.75, wh=1.0, zb=1.0, sides='ENW')
    for key in 'SN':
        _rafters(F, *ln[key], eave, 0.85, every=0.9)
    gable_roof(F, 0, 0, eave, w, d, pitch=20.0, axis='x', overhang=0.5, gable_mat='plaster')
    return eave


# ---------------------------------------------------------------- rome_insula_o
def _fish_table(S, u, yf):
    box(S, u, yf - 0.45, 0.0, 0.7, 0.4, 0.72, 'stone')
    box(S, u, yf - 0.45, 0.72, 1.3, 0.7, 0.07, 'marble')
    for k in range(7):
        box(S, u - 0.48 + k * 0.16, yf - 0.45 + (0.13 if k % 2 else -0.13), 0.79, 0.34, 0.08, 0.05, 'grey',
            rot=70 + 25 * (k % 3))
    cyl(S, u + 0.95, yf - 0.5, 0.0, 0.27, 0.26, 'wood', 8, r_top=0.31)


def _green_stand(S, u, yf):
    """Baskets of produce on the ground and strings of onions and garlic hung from the awning's front bar."""
    for k, m in enumerate(('flowerR', 'hedge', 'ochre', 'moss', 'flowerR')):
        x = u - 0.9 + k * 0.45
        cyl(S, x, yf - 0.5 - 0.15 * (k % 2), 0.0, 0.2, 0.32, 'wood', 8, r_top=0.24)
        sphere(S, x, yf - 0.5 - 0.15 * (k % 2), 0.32, 0.19, m, 6, 4, z_scale=0.45)


def _strings(S, u0, u1, y, z, mat='linen', n=5):
    for k in range(n):
        x = u0 + (k + 0.5) * (u1 - u0) / n
        for j in range(4):
            sphere(S, x, y, z - 0.12 - j * 0.13, 0.06, mat if (k + j) % 3 else 'ochre', 5, 3)


def build_insula_o():
    """12 x 12 m, four storeys (eaves 13.2 m). An open market front: three wide loftless stalls (no loft window, the
    shutter boards stacked aside all day), each under a cloth awning on two poles, with trestle tables and baskets
    set out under it in the street, as traders did before Domitian's edict (Martial 7.61: the barber, the innkeeper,
    the cook and the butcher kept to their thresholds only after it). A butcher with joints on hooks, a greengrocer
    with strings of onions, a fishmonger at a marble table. The stair door to the flats is on the side street."""
    w, d = 12.0, 12.0
    F = Frame(); ln = _lines(w, d)
    _plinth(F, w, d)
    H_g, H_f = 4.2, 3.0
    eave = H_g + H_f * 3
    D = 3.6
    _core(F, w, d, 0.0, H_g, 'mud', inS=D)
    _core(F, w, d, H_g, eave, 'mud')
    S, Ls = shop_side(F, *ln['S'], H_g, 'plaster3', [
        dict(kind='shop', u=1.85, w=2.8, rw=3.3, trade='butcher', loft=False, stair=False, ceil=3.4),
        dict(kind='shop', u=5.65, w=2.8, rw=3.4, trade='green', loft=False, stair=False, ceil=3.4),
        dict(kind='shop', u=9.45, w=2.8, rw=3.3, trade='fish', loft=False, stair=False, ceil=3.4)], D=D)
    for u0, u1 in ((0.3, 3.4), (4.1, 7.2), (7.9, 11.0)):
        awning(S, u0, u1, 3.04, out=1.25, drop=0.45, mat='linen' if u0 > 4 and u0 < 5 else 'awning')
    _green_stand(S, 5.65, YF)
    _strings(S, 4.4, 6.9, -0.38 - 1.25 + 0.05, 2.5, 'linen', 5)
    _fish_table(S, 9.2, YF)
    programma(S, 3.75, 1.4, YF, w=0.6, lines=3)
    programma(S, 7.55, 1.4, YF, w=0.6, lines=3)
    E, Le = shop_side(F, *ln['E'], H_g, 'plaster3', [dict(kind='door', u=6.0, w=1.0),
                                                     dict(kind='win', u=9.5, zb=2.2, w=0.8, h=0.9)], D=1.6)
    for key in 'NW':
        _skin(F, *ln[key], 0.0, H_g, _wins(_len(*ln[key]), 2, 2.2, 0.8, 0.9), 'plaster3')
    _quoins(F, w, d, H_g, 'brick')
    for key in 'SENW':
        band(F, *ln[key][0], *ln[key][1], H_g - 0.24, 0.2, 0.5, 'brick')
    _upper(F, ln, H_g, H_f, 'plaster3', n=3, ww=0.85, wh=1.2, zb=0.9, frame='stone')
    _upper(F, ln, H_g + H_f, H_f, 'plaster', n=3, ww=0.75, wh=1.0, zb=1.0)
    _timber(F, ln, H_g + 2 * H_f, H_f, windows=3)
    balcony(F, *ln['S'][0], *ln['S'][1], H_g + 0.12, depth=0.9, mat='wood', roof=False, laundry=True)
    for key in 'SENW':
        _rafters(F, *ln[key], eave, 0.85, every=0.9)
    hip_roof(F, 0, 0, eave, w, d, 20.0, 0.5, 'tile')
    return eave


# ---------------------------------------------------------------- rome_insula_p
def _pergula(S, u0, u1, yf, depth=1.1, z=2.95, drop=0.5, counter=True):
    """【史】A pergula: a timber booth built out from a shop front into the street, for selling (or teaching) in. Corner
    posts, a boarded floor, lattice sides, a counter across the front, a tiled pent roof against the wall."""
    yb = yf - depth
    box(S, (u0 + u1) / 2, yf - depth / 2, 0.0, u1 - u0, depth, 0.1, 'wood')
    posts = [u0 + 0.06, u1 - 0.06] + ([(u0 + u1) / 2] if u1 - u0 > 3.2 else [])
    for x in posts:
        box(S, x, yb + 0.06, 0.0, 0.11, 0.11, z - drop, 'wood')
    box(S, (u0 + u1) / 2, yb + 0.06, z - drop - 0.14, u1 - u0 + 0.1, 0.13, 0.14, 'wood')
    for x in (u0 + 0.04, u1 - 0.04):                                  # the sides: boarded low, lattice above
        box(S, x, yf - depth / 2, 0.1, 0.05, depth, 0.85, 'wood')
        for k in range(5):
            y = yf - 0.1 - k * (depth - 0.2) / 4
            box(S, x, y, 0.95, 0.04, 0.04, z - drop - 1.05 - (yf - y) * drop / depth, 'wood')
        beam(S, x, yf, 1.6, x, yb + 0.1, 1.6, 0.04, 0.04, 'wood')
    if counter:
        box(S, (u0 + u1) / 2, yb + 0.1, 0.1, u1 - u0 - 0.2, 0.08, 0.85, 'wood')
        box(S, (u0 + u1) / 2, yb + 0.22, 0.95, u1 - u0, 0.42, 0.05, 'wood')
    else:
        beam(S, u0 + 0.1, yb + 0.1, 0.55, u1 - 0.1, yb + 0.1, 0.55, 0.05, 0.05, 'wood')
    lean_roof(S, u0 - 0.12, yf + 0.02, u1 + 0.12, yf + 0.02, z, depth + 0.15, drop, mat='tile', tiles=True)


def build_insula_p():
    """14 x 12 m, three storeys (eaves 10.4 m). Timber booths (pergulae) built out into the street in front of the
    shops, the encroachments Domitian later cleared (Martial 7.61). In the widest a schoolmaster teaches: his chair on a
    dais at the back of a tall open room, benches with wax tablets running out into the booth (Suetonius, De gramm. 18:
    "in pergula docuit"). An oil seller with jugs on his counter, a stair door, a baker with loaves on his. Ochre
    plaster above, a timber top floor, a hipped roof."""
    w, d = 14.0, 12.0
    F = Frame(); ln = _lines(w, d)
    _plinth(F, w, d)
    H_g, H_f = 4.4, 3.0
    eave = H_g + H_f * 2
    D = 3.6
    _core(F, w, d, 0.0, H_g, 'brick', inS=D)
    _core(F, w, d, H_g, eave, 'brick')
    S, Ls = shop_side(F, *ln['S'], H_g, 'plaster2', [
        dict(kind='shop', u=2.6, w=3.2, rw=4.4, trade='school', loft=False, stair=False, ceil=3.9),
        dict(kind='shop', u=7.0, w=2.4, rw=3.2, trade='oil'),
        dict(kind='door', u=9.6, w=1.0),
        dict(kind='shop', u=11.9, w=2.2, rw=2.6, trade='bread', stair_side=-1)], D=D)
    _pergula(S, 0.5, 4.7, YF, counter=False)
    for k in range(2):                                                 # the front benches run out into the booth
        box(S, 1.7 + k * 1.8, YF - 0.6, 0.1, 1.3, 0.3, 0.38, 'wood')
        for j in range(2):
            box(S, 1.45 + k * 1.8 + j * 0.5, YF - 0.6, 0.48, 0.2, 0.14, 0.03, 'dark')
    _pergula(S, 5.6, 8.4, YF)
    for k in range(4):
        jar(S, 6.0 + k * 0.6, YF - 0.88, 1.0, 0.32, 0.1, 'tile2' if k % 2 else 'tile', 6, 'jug')
    _pergula(S, 10.7, 13.1, YF)
    for k in range(8):
        loaf(S, 11.0 + (k % 4) * 0.55, YF - 0.8 - 0.18 * (k // 4), 1.05, 0.11)
    programma(S, 9.6, 2.78, YF, w=1.0, lines=2)
    for key in 'ENW':
        p0, p1 = ln[key]
        _skin(F, p0, p1, 0.0, H_g, _wins(_len(p0, p1), 2, 2.2, 0.8, 0.9), 'plaster2', frame='stone')
    _quoins(F, w, d, H_g, 'brick')
    for key in 'SENW':
        band(F, *ln[key][0], *ln[key][1], H_g - 0.24, 0.2, 0.5, 'brick')
    _upper(F, ln, H_g, H_f, 'plaster2', n=4, ww=0.9, wh=1.2, zb=0.9, frame='stone', arches=True)
    _timber(F, ln, H_g + H_f, H_f, windows=4)
    for key in 'SENW':
        _rafters(F, *ln[key], eave, 0.85, every=0.9)
    hip_roof(F, 0, 0, eave, w, d, 20.0, 0.5, 'tile')
    return eave


# ---------------------------------------------------------------- rome_insula_q
def build_insula_q():
    """12 x 12 m, four storeys (eaves 13.6 m). A wine merchant's front: a tall shop without a loft, dolia sunk to their
    necks in the floor and amphorae racked on two tiers (the wine shops of Ostia and Pompeii); on the pier beside it a
    painted price list of four wines with a coloured jug over each price, as at Ad Cucumas in Herculaneum (VI.14). A
    hot-food seller serves through a hatch over a masonry counter; a stair door. Red socle, brick bands, a timber top
    floor and a balcony, a gable roof along the street."""
    w, d = 12.0, 12.0
    F = Frame(); ln = _lines(w, d)
    _plinth(F, w, d)
    H_g, H_f = 4.6, 3.0
    eave = H_g + H_f * 3
    D = 4.2
    _core(F, w, d, 0.0, H_g, 'brick', inS=D)
    _core(F, w, d, H_g, eave, 'brick')
    S, Ls = shop_side(F, *ln['S'], H_g, 'plaster', [
        dict(kind='shop', u=3.0, w=2.8, rw=5.0, trade='wine', loft=False, stair=False, ceil=4.2),
        dict(kind='hatch', u=7.6, w=1.2, zb=0.9, h=1.2, rw=2.2, trade='hatchfood'),
        dict(kind='door', u=10.0, w=1.0)], D=D)
    ad_cucumas(S, 5.7, 1.35, YF - 0.005)
    band(F, *ln['S'][0], *ln['S'][1], 0.0, 0.85, 0.38, 'red')
    for k in range(2):                                                   # amphorae leant against the wall outside
        amphora(S, 0.45 + k * 0.42, YF - 0.25, 0.0, 0.9, (0.0, 0.18), 'tile2' if k % 2 else 'tile', 5)
    programma(S, 10.0, 2.78, YF, w=1.0, lines=2)
    for key in 'ENW':
        p0, p1 = ln[key]
        _skin(F, p0, p1, 0.0, H_g, _wins(_len(p0, p1), 2, 2.4, 0.7, 0.8), 'plaster', frame='stone')
        band(F, *p0, *p1, 0.0, 0.85, 0.38, 'red')
    _quoins(F, w, d, H_g, 'brick')
    for key in 'SENW':
        band(F, *ln[key][0], *ln[key][1], H_g - 0.24, 0.2, 0.5, 'brick')
        band(F, *ln[key][0], *ln[key][1], H_g + H_f - 0.2, 0.18, 0.42, 'brick')
    _upper(F, ln, H_g, H_f, 'plaster', n=3, ww=0.85, wh=1.2, zb=0.9, frame='stone')
    _upper(F, ln, H_g + H_f, H_f, 'plaster2', n=3, ww=0.75, wh=1.0, zb=1.0, arches=True)
    _timber(F, ln, H_g + 2 * H_f, H_f, windows=3)
    balcony(F, *ln['S'][0], *ln['S'][1], H_g + H_f + 0.12, depth=0.9, mat='wood', roof=True, laundry=True)
    for key in 'SN':
        _rafters(F, *ln[key], eave, 0.85, every=0.9)
    gable_roof(F, 0, 0, eave, w, d, pitch=20.0, axis='x', overhang=0.5, gable_mat='mud')
    return eave


# ---------------------------------------------------------------- rome_insula_r
def build_insula_r():
    """8 x 12 m, four storeys (eaves 13.2 m), on a raised pavement (crepido) 0.3 m above the street with a tuff kerb
    and a step at each end, as along Pompeii's streets. On the front a hot-food hatch over a counter on the pavement,
    a passage through the block, and a potter's shop with its loft. The passage leads into an inner court (a light
    well) with workshop doors round it, a cistern mouth (puteal) with a bucket, a handcart, a timber gallery to the
    first-floor rooms and laundry across; the roofs slope round the opening."""
    w, d = 8.0, 12.0
    LIFT = 0.3
    F = Frame(0.0, 0.0, LIFT); ln = _lines(w, d)
    _plinth(F, w, d)
    H_g, H_f = 4.2, 3.0
    eave = H_g + H_f * 3
    hw, hd = w / 2 - SKIN, d / 2 - SKIN
    D, Dp = 3.4, 4.4
    cx0, cx1, cy0, cy1 = -2.3, 2.4, -hd + Dp, 2.6           # the court's wall lines
    pu = 3.7; px = -hw + pu; pw = 1.5
    # the raised pavement in front
    box(F, 0, -d / 2 - 0.47, -LIFT, w + 0.06, 0.94, LIFT - 0.02, 'tile2')
    box(F, 0, -d / 2 - 0.88, -LIFT, w + 0.06, 0.2, LIFT, 'tuff')
    for sx in (-1, 1):
        box(F, sx * (w / 2 + 0.24), -d / 2 - 0.5, -LIFT, 0.46, 0.94, LIFT / 2, 'tuff')
    # the core: ground front strip with the passage slot, wings beside the court, back block, upper front block
    box(F, (-hw + px - pw / 2 - 0.1) / 2, (-hd + D + cy0) / 2, 0.0, px - pw / 2 - 0.1 + hw, cy0 + hd - D, H_g, 'mud')
    box(F, (hw + px + pw / 2 + 0.1) / 2, (-hd + D + cy0) / 2, 0.0, hw - px - pw / 2 - 0.1, cy0 + hd - D, H_g, 'mud')
    box(F, 0, (-hd + cy0) / 2, H_g, 2 * hw, cy0 + hd, eave - H_g, 'mud')
    box(F, (-hw + cx0) / 2, (cy0 + cy1) / 2, 0.0, cx0 + hw, cy1 - cy0, eave, 'mud')
    box(F, (hw + cx1) / 2, (cy0 + cy1) / 2, 0.0, hw - cx1, cy1 - cy0, eave, 'mud')
    box(F, 0, (cy1 + hd) / 2, 0.0, 2 * hw, hd - cy1, eave, 'mud')
    S, Ls = shop_side(F, *ln['S'], H_g, 'plaster2', [
        dict(kind='hatch', u=1.4, w=1.1, zb=0.95, h=1.2, rw=2.4, trade='hatchfood'),
        dict(kind='passage', u=pu, w=pw, h=2.8, D=Dp),
        dict(kind='shop', u=5.95, w=2.0, rw=2.4, trade='pottery', stair_side=-1)], D=D)
    programma(S, pu, 3.2, YF, w=1.0, lines=2)
    for key in 'ENW':
        p0, p1 = ln[key]
        _skin(F, p0, p1, 0.0, H_g, _wins(_len(p0, p1), 1 if key == 'N' else 2, 2.2, 0.6, 0.7), 'plaster2', frame='stone')
    _quoins(F, w, d, H_g, 'tuff')
    for key in 'SENW':
        band(F, *ln[key][0], *ln[key][1], H_g - 0.24, 0.2, 0.5, 'brick')
    _upper(F, ln, H_g, H_f, 'plaster2', n=2, ww=0.85, wh=1.2, zb=0.9, frame='stone')
    _upper(F, ln, H_g + H_f, H_f, 'plaster', n=2, ww=0.75, wh=1.0, zb=1.0)
    _timber(F, ln, H_g + 2 * H_f, H_f, windows=2)
    balcony(F, *ln['S'][0], *ln['S'][1], H_g + 0.12, depth=0.8, mat='wood', roof=False, laundry=True)
    # the court: walls facing in (lines run clockwise so the outside is the court)
    cS = ((cx1, cy0), (cx0, cy0)); cW = ((cx0, cy0), (cx0, cy1)); cN = ((cx0, cy1), (cx1, cy1)); cE = ((cx1, cy1), (cx1, cy0))
    opening_skin(F, *cS[0], *cS[1], 0.0, H_g, [(cx1 - px, 0.0, pw, 2.8, 'rect')], 'plaster', depth=SKIN, inner=None)
    _skin(F, *cW, 0.0, H_g, [(1.1, 0.0, 1.0, 2.2, 'rect'), (2.95, 1.3, 0.6, 0.7, 'rect')], 'plaster', frame='wood')
    _skin(F, *cN, 0.0, H_g, [(1.2, 0.0, 1.1, 2.3, 'rect'), (3.4, 0.0, 1.0, 2.2, 'rect')], 'plaster', frame='wood')
    _skin(F, *cE, 0.0, H_g, [(1.2, 0.0, 0.9, 2.2, 'rect'), (3.0, 1.3, 0.6, 0.7, 'rect')], 'plaster', frame='wood')
    for k in range(3):
        z = H_g + k * H_f
        for p0, p1 in (cS, cW, cN, cE):
            L = _len(p0, p1)
            _skin(F, p0, p1, z, H_f, _wins(L, 2 if L > 4.2 else 1, 0.9, 0.7, 1.0), 'plaster' if k < 2 else 'mud')
    box(F, (cx0 + cx1) / 2, (cy0 + cy1) / 2, 0.0, cx1 - cx0, cy1 - cy0, 0.03, 'paving')
    box(F, px, cy0 + SKIN + 0.4, 0.0, pw + 0.2, 0.8, 0.02, 'travertine')
    well_head(F, 1.0, cy1 - SKIN - 0.8)
    cart(F, -1.2, (cy0 + cy1) / 2 + 0.2, 90.0)
    basin(F, cx1 - SKIN - 0.4, cy0 + SKIN + 0.55, 0.6, 0.9, 0.55)
    for k in range(3):
        amphora(F, cx0 + SKIN + 0.25, cy1 - SKIN - 0.4 - k * 0.38, 0.0, 0.85, (0.15, 0.0), 'tile' if k % 2 else 'tile2', 5)
    balcony(F, *cN[0], *cN[1], H_g + 0.12, depth=0.85, mat='wood', roof=False, laundry=False)
    beam(F, cx0 + SKIN, (cy0 + cy1) / 2, H_g + H_f + 1.8, cx1 - SKIN, (cy0 + cy1) / 2, H_g + H_f + 1.8, 0.02, 0.02, 'wood')
    for k, m in enumerate(('linen', 'red', 'linen', 'blue')):
        box(F, cx0 + SKIN + 0.6 + k * 0.9, (cy0 + cy1) / 2, H_g + H_f + 0.95, 0.6, 0.02, 0.85, m)
    # the roofs round the opening
    for key in 'EW':
        _rafters(F, *ln[key], eave, 0.6, every=0.9)
    yi0, yi1 = cy0 + SKIN, cy1 - SKIN
    gable_roof(F, 0, (-d / 2 + yi0) / 2, eave, w, yi0 + d / 2, pitch=22.0, axis='x', overhang=0.4, gable_mat='mud')
    gable_roof(F, 0, (yi1 + d / 2) / 2, eave, w, d / 2 - yi1, pitch=22.0, axis='x', overhang=0.4, gable_mat='mud')
    o = 0.4
    lean_roof(F, -w / 2 - o, yi0, -w / 2 - o, yi1, eave + 0.75, (cx0 + SKIN) + w / 2 + o + 0.3, 0.9)
    lean_roof(F, w / 2 + o, yi1, w / 2 + o, yi0, eave + 0.75, w / 2 + o - (cx1 - SKIN) + 0.3, 0.9)
    return eave


if __name__ == '__main__':
    for name, fn in (('rome_insula_n', build_insula_n), ('rome_insula_o', build_insula_o),
                     ('rome_insula_p', build_insula_p), ('rome_insula_q', build_insula_q),
                     ('rome_insula_r', build_insula_r)):
        if len(sys.argv) > 1 and sys.argv[-1].startswith('rome_') and sys.argv[-1] != name:
            continue
        reset()
        fn()
        finish(name, front='-Y')
