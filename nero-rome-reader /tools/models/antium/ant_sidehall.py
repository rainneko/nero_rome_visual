"""ant_sidehall · the side hall on the rock: Nero's quarters and the dark room (z = 0 = ground floor).

Main block 34 x 15 m, two storeys (5.2 + 4.4 m), white plaster, red band, hipped tiled roof with ribs, foundation
down to z -8. Front = -Y: a ground-floor gallery 4 m deep with 12 Tuscan columns and a lean-to tiled roof; three doors
in its back wall with small bronze lamp brackets between them. West end (-X), last 9 m, both floors = the dark room:
every window there is a black felt panel with thin wood battens. Entrance door at the east end (+X). Paved terrace
34 x 10 m in front of the gallery with a 1 m parapet on three sides.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_kit import *  # bpy, box, beam, cyl, wall, band, cornice, hip_roof, lean_roof, colonnade, opening_skin, reset, finish, ...

HW, HD = 16.65, 7.15          # inner wall lines; the skins sit 0.36 m outside them (outer faces at x = +-17, y = +-7.5)
GH, FH = 5.2, 4.4             # storey heights
H = GH + FH                   # eaves at z = 9.6
WIN_W, WIN_H = 1.15, 1.9
ZB0 = 0.3 * GH                # ground-floor window sill (same rule as the kit: 30 % of the storey)
ZB1 = GH + 0.3 * FH           # upper-floor window sill
FELT_X = -8.0                 # the dark room: x < -8 on both long sides, and the whole west end
GALLERY_WALL_Y = -7.5         # outer face of the -Y wall (gallery back wall)


def _frame(p0, p1):
    """Local frame of a wall line p0 -> p1 (same convention as the kit: outside is the right-hand side)."""
    return Frame(p0[0], p0[1], 0.0, math.atan2(p1[1] - p0[1], p1[0] - p0[0]) / D2R)


def _win(u, zb):
    return (u, zb, WIN_W, WIN_H, 'rect')


def _skin(p0, p1, openings, felt):
    """Facade skin on the outside of p0 -> p1, full height. Felt openings get three horizontal and two vertical battens."""
    opening_skin(None, p0[0], p0[1], p1[0], p1[1], 0.0, H, openings, 'plaster', depth=0.35,
                 inner='felt' if felt else 'dark', frame_mat=None if felt else 'marble')
    if felt:
        W = _frame(p0, p1)
        for (u, zb, w, hh, kind) in openings:
            for f in (0.15, 0.5, 0.85):
                box(W, u, -0.13, zb + f * hh - 0.03, w + 0.1, 0.05, 0.06, 'wood')
            for f in (0.2, 0.8):
                box(W, u - w / 2 + f * w, -0.13, zb, 0.06, 0.05, hh, 'wood')


def _main_block():
    box(None, 0.0, 0.0, -8.0, 34.8, 15.8, 8.6, 'tuff')                  # foundation down to z -8
    box(None, 0.0, 0.0, 0.0, 2 * HW, 2 * HD, H, 'plaster')              # core
    S0, S1 = (-HW, -HD), (HW, -HD)
    E0, E1 = (HW, -HD), (HW, HD)
    N0, N1 = (HW, HD), (-HW, HD)
    W0, W1 = (-HW, HD), (-HW, -HD)
    # south (-Y, facing the gallery): dark room part, then the normal part with three doors on the ground floor
    _skin(S0, (FELT_X, -HD), [_win(u, zb) for u in (1.65, 4.65, 7.65) for zb in (ZB0, ZB1)], felt=True)
    _skin((FELT_X, -HD), S1,
          [(2.0, 0.0, 2.4, 4.2, 'arch'), (8.0, 0.0, 2.4, 4.2, 'arch'), (14.0, 0.0, 2.4, 4.2, 'arch')]
          + [_win(u, ZB1) for u in (3.5, 6.5, 9.5, 12.5, 15.5, 18.5, 21.5)], felt=False)
    # east (+X, bridge landing): entrance door on the axis, windows either side
    _skin(E0, E1, [(7.15, 0.0, 2.4, 4.2, 'arch')]
          + [_win(u, ZB0) for u in (2.65, 11.65)] + [_win(u, ZB1) for u in (2.65, 7.15, 11.65)], felt=False)
    # north (+Y): normal part, then the dark room part
    _skin(N0, (FELT_X, HD), [_win(u, zb) for u in (3.15, 6.15, 9.15, 12.15, 15.15, 18.15, 21.15) for zb in (ZB0, ZB1)],
          felt=False)
    _skin((FELT_X, HD), N1, [_win(u, zb) for u in (1.0, 4.0, 7.0) for zb in (ZB0, ZB1)], felt=True)
    # west end (-X): the whole end is the dark room
    _skin(W0, W1, [_win(u, zb) for u in (2.65, 7.15, 11.65) for zb in (ZB0, ZB1)], felt=True)
    # bands, plinth, cornice, quoins
    for p0, p1 in ((S0, S1), (E0, E1), (N0, N1), (W0, W1)):
        band(None, p0[0], p0[1], p1[0], p1[1], GH - 0.2, 0.3, 0.42, 'red')          # red floor band
        cornice(None, p0[0], p0[1], p1[0], p1[1], H - 0.5, 0.5, 0.6, 'stone')
    for p0, p1 in ((E0, E1), (N0, N1), (W0, W1)):                                 # plinth; the gallery floor is the base on -Y
        band(None, p0[0], p0[1], p1[0], p1[1], 0.0, 0.9, 0.44, 'stone')
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(None, sx * (34.0 / 2 - 0.25), sy * (15.0 / 2 - 0.25), 0.0, 0.9, 0.9, H - 0.4, 'stone')
    hip_roof(None, 0.0, 0.0, H, 34.0, 15.0, 22.0, 0.6)                           # hipped tiled roof, ridge along X


def _gallery():
    # 12 Tuscan columns 4 m in front of the wall (y = -10.9), entablature on top (top z ~ 4.3)
    colonnade(None, -16.5, -10.9, 16.5, -10.9, 0.0, 12, 3.6, r=0.26, mat='marble', order='tuscan', ent=True,
              ent_h=0.72, ent_depth=0.68, seg=10)
    # lean-to tiled roof: high at the wall (z 4.9), resting on the entablature at the columns
    lean_roof(None, -17.0, GALLERY_WALL_Y, 17.0, GALLERY_WALL_Y, 4.9, 4.0, 0.766)
    # small bronze lamp brackets on the back wall between the doors (doors at x = -6, 0, 6)
    for x in (-3.0, 3.0):
        beam(None, x, -7.4, 3.0, x, -8.0, 3.0, 0.08, 0.08, 'bronze')
        cyl(None, x, -8.0, 2.84, 0.09, 0.16, 'bronze', seg=8, r_top=0.14)


def _terrace():
    box(None, 0.0, -14.5, -3.0, 34.0, 14.0, 3.0, 'paving')              # terrace 34 x 10 m, and the gallery floor (top z 0)
    wall(None, -17.0, -21.25, 17.0, -21.25, 0.0, 1.0, 0.5, 'stone')     # low parapet, 1 m, three sides
    wall(None, -16.75, -21.25, -16.75, -11.5, 0.0, 1.0, 0.5, 'stone')
    wall(None, 16.75, -21.25, 16.75, -11.5, 0.0, 1.0, 0.5, 'stone')


reset()
_main_block()
_gallery()
_terrace()
human(None, 10.0, -15.0, 0.0)           # preview-only 1.8 m figure on the terrace, for scale
finish('ant_sidehall', front='-Y')
