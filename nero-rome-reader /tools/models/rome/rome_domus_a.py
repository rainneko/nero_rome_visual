"""rome_domus_a · aristocratic terrace house A, Palatine, AD 56. Front = -Y (the garden side).

Plot x -15..15, y -23..23. Upper part (y -2.4..23, z 0): entrance on the north wall between two Doric half-columns,
an atrium with impluvium and compluvium, a tablinum, a peristyle garden (court 14 x 10, stone Doric columns, hedges,
small round fountain) and a two-storey loggia on the south edge: Doric columns below, Ionic columns and a balustrade
above, each storey with its entablature, before a back wall painted dark red with doors (loggia()). Below it the hill steps down to the south in
three levels: garden terrace T1 (z -6) with a fountain statue group, statues, a pergola and a fish pond, and a portico
on its south edge stacked under the loggia; lower terrace T2 (z -12) with statues; the foot of the lowest wall (z -18)
stands on ledge rock. Ledge rock hugs the platform and terrace sides; square buttresses on the two lower walls (R7).
Footprint about 34 x 49 m (rock reaches 2-4 m beyond the plot).
rome_domus_b.py imports house() from this file and builds house B.

house(..., cut=True) is the cut-down variant for a house on the hill's terraced belt (rome_domus_a_belt.py,
rome_domus_b_belt.py): no rock, no fills down to GROUND, no wall W2; T2 (z -12) is a paved strip and the lowest level.
The belt floor surrounds the house at z 0, so only the south face at y -2.4 is built under it (z -12..0). T1 keeps its
side walls and W1 (square buttresses, travertine copings flush with the gravel floor), has box-hedge beds instead of a
lawn, and two stair flights: house level down to T1 along T1's east side, T1 down to T2 along the outer face of W1.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *

NB = 8.82        # eave height of the two-storey blocks (ground storey 4.62 + floor 4.2)
TOP = -0.15      # top of the platform; the floors are laid on it (z -0.15..0)
GROUND = -24.0   # lowest level of the model: everything rests on it

# cut variant (house(..., cut=True)): levels and the tops of T1's walls (their copings end flush with the T1 floor)
T1 = -6.0        # garden terrace T1
T2 = -12.0       # lower terrace T2: a paved strip z -12.3..-12, the lowest level of the cut model
T1W = -6.35      # z_top of T1's retaining walls: coping z -6.4..-6.0
BOX_FACES = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]


def pond(F, cx, cy, z0, w, d, rim=0.45, h=0.3):
    """Rectangular fish pond: four marble rim strips round a water surface at z0 + 0.08."""
    box(F, cx, cy + (d + rim) / 2, z0, w + 2 * rim, rim, h, 'marble')
    box(F, cx, cy - (d + rim) / 2, z0, w + 2 * rim, rim, h, 'marble')
    box(F, cx - (w + rim) / 2, cy, z0, rim, d, h, 'marble')
    box(F, cx + (w + rim) / 2, cy, z0, rim, d, h, 'marble')
    box(F, cx, cy, z0 - 0.5, w, d, 0.58, 'water')


def fountain(F, cx, cy, z0, r=2.3):
    """Round basin with a statue group: a central statue on a giallo pedestal, three statues round the rim."""
    lathe(F, cx, cy, [(r, z0), (r, z0 + 0.4), (r - 0.4, z0 + 0.4), (r - 0.4, z0)], 'marble', 28, smooth=False)
    cyl(F, cx, cy, z0, r - 0.4, 0.22, 'water', 24)
    statue(F, cx, cy, z0 + 0.22, 2.6, 'marble', pedestal=1.1, ped_mat='giallo')
    for a in (90, 210, 330):
        t = math.radians(a)
        statue(F, cx + 2.9 * math.cos(t), cy + 2.9 * math.sin(t), z0, 1.9, 'marble', pedestal=0.7, ped_mat='porphyry')


def belvedere(F, cx, cy, w, h, wall):
    """Three-storey belvedere tower, w x w m and h m high (house B): a plaster shaft with two windows per face and
    storey and a red band at each floor, an open loggia of slender columns on top, a tiled pyramid roof.
    Written here (not square_tower) to keep the triangle budget."""
    hw = w / 2
    ho = hw + 0.03                       # windows stand 3 cm proud of the faces
    zl = h - 5.0                         # the shaft stops here; the loggia stands above it
    box(F, cx, cy, 0.0, w, w, zl, wall)
    for z in (3.2, 6.4):                 # red bands at the floors
        box(F, cx, cy, z, w + 0.3, w + 0.3, 0.3, 'red')
    for z in (1.0, 4.2, 7.4):            # window rows
        for u in (-w / 4, w / 4):
            box(F, cx + u, cy - ho, z, 0.7, 0.06, 1.4, 'dark')
            box(F, cx + u, cy + ho, z, 0.7, 0.06, 1.4, 'dark')
            box(F, cx - ho, cy + u, z, 0.06, 0.7, 1.4, 'dark')
            box(F, cx + ho, cy + u, z, 0.06, 0.7, 1.4, 'dark')
    box(F, cx, cy, zl, w + 0.5, w + 0.5, 0.4, 'marble')                      # loggia floor
    c = hw - 0.6
    for (x, y) in ((-c, -c), (c, -c), (c, c), (-c, c), (0, -c), (0, c), (-c, 0), (c, 0)):
        cyl(F, cx + x, cy + y, zl + 0.4, 0.25, 4.2, 'marble', 8)             # slender columns
    for (x, y, sx, sy) in ((0, -c, w - 1.2, 0.5), (0, c, w - 1.2, 0.5), (-c, 0, 0.5, w - 1.2), (c, 0, 0.5, w - 1.2)):
        box(F, cx + x, cy + y, zl + 0.4, sx, sy, 0.9, 'marble')              # low parapets of the loggia
    box(F, cx, cy, zl + 4.6, w + 0.6, w + 0.6, 0.35, 'marble')               # architrave ring
    hip_roof(F, cx, cy, zl + 4.95, w, w, 30.0, 0.7)                          # pyramid roof, tiled


# ---------------------------------------------------------------- cut variant (house on the belt)
def _slab(F, axis, sa, sb, ca, cb, zlo, zhi, mat):
    """A solid over sa..sb along `axis` ('x' or 'y') and ca..cb across it. zlo, zhi: its bottom and top, each a number
    or a pair (z at sa, z at sb) for a plane sloping along the axis (stair cheeks and their copings)."""
    def lin(z, s):
        return z[0] + (z[1] - z[0]) * (s - sa) / (sb - sa) if isinstance(z, tuple) else z
    x0, x1, y0, y1 = (sa, sb, ca, cb) if axis == 'x' else (ca, cb, sa, sb)
    xa, xb, ya, yb = min(x0, x1), max(x0, x1), min(y0, y1), max(y0, y1)
    corners = [(xa, ya), (xb, ya), (xb, yb), (xa, yb)]
    s_of = (lambda x, y: x) if axis == 'x' else (lambda x, y: y)
    v = [F.p(x, y, lin(zlo, s_of(x, y))) for x, y in corners] + [F.p(x, y, lin(zhi, s_of(x, y))) for x, y in corners]
    add_mesh(mat, v, BOX_FACES)


def _block(F, x0, x1, y0, y1, z0, z1, mat):
    """Axis box between two corners."""
    box(F, (x0 + x1) / 2, (y0 + y1) / 2, min(z0, z1), abs(x1 - x0), abs(y1 - y0), abs(z1 - z0), mat)


def _sq_buttress(F, x, y, z_top, z_bot, b=1.8):
    """A square buttress on a wall along x whose outer face is at y (outside -y), as retaining_wall(buttress='square')
    draws it, with its travertine cap. Placed by hand where the stairs leave no room for retaining_wall's even spacing."""
    box(F, x, y - b / 2 + 0.3, z_bot, b * 1.1, b + 0.6, z_top - z_bot - 0.4, 'stone')
    box(F, x, y - b / 2 + 0.3, z_top - 0.45, b * 1.1 + 0.3, b + 0.9, 0.35, 'travertine')


def _stair(F, axis, s0, sgn, ca, cb, z0, flights, zbot, rise=0.2, tread=0.38, landing=1.5, mat='stone'):
    """A straight stair going down from the floor z0 at s0 along `axis` in the direction sgn (+1 or -1), ca..cb across.
    flights: risers per flight (a `landing` m landing between flights; the last riser of a flight drops onto it).
    Every tread and landing is solid down to zbot. Returns the foot (s, z) and the runs [(s_a, s_b, z_a, z_b)] (sloping
    flights and flat landings) for the cheeks."""
    s, z, runs = s0, z0, []
    for i, n in enumerate(flights):
        sa, za = s, z
        for k in range(1, n):
            _slab(F, axis, s + sgn * (k - 1) * tread, s + sgn * k * tread, ca, cb, zbot, z - k * rise, mat)
        s, z = s + sgn * (n - 1) * tread, z - n * rise
        runs.append((sa, s, za, z))
        if i < len(flights) - 1:
            _slab(F, axis, s, s + sgn * landing, ca, cb, zbot, z, mat)
            runs.append((s, s + sgn * landing, z, z))
            s += sgn * landing
    return s, z, runs


def _cheek(F, axis, run, ca, cb, zbot, h=1.0):
    """A cheek wall (parapet) beside one run of _stair: its top h m above the stair line, a travertine coping on it."""
    sa, sb, za, zb = run
    _slab(F, axis, sa, sb, ca, cb, zbot, (za + h, zb + h), 'stone')
    _slab(F, axis, sa, sb, ca - 0.05, cb + 0.05, (za + h, zb + h), (za + h + 0.12, zb + h + 0.12), 'travertine')


def hedge_bed(F, cx, cy, z0, w, d, flower='flowerR'):
    """A box-hedge bed: a travertine kerb, a clipped box hedge round its edge, flowers inside."""
    box(F, cx, cy, z0, w, d, 0.2, 'travertine')                              # kerb
    t, h, zh, wi, di = 0.4, 0.5, z0 + 0.2, w - 0.2, d - 0.2
    box(F, cx, cy - (di - t) / 2, zh, wi, t, h, 'hedge')
    box(F, cx, cy + (di - t) / 2, zh, wi, t, h, 'hedge')
    box(F, cx - (wi - t) / 2, cy, zh, t, di - 2 * t, h, 'hedge')
    box(F, cx + (wi - t) / 2, cy, zh, t, di - 2 * t, h, 'hedge')
    box(F, cx, cy, zh, wi - 2 * t, di - 2 * t, 0.25, flower)


def belt_base(F):
    """The hill part of the cut variant, z -12.3..0 (the belt and the scene's wall at y -20.5 do the rest).
    House level: a core under the floors (y -0.3..23, z -12..TOP) and the south face at y -2.4 (z -12..0, square
    buttresses), which stops at x 11 for the head of flight a. T1 (z -6, y -14.5..-2.4): fill, gravel floor, side walls
    and W1 (z -12..-6, square buttresses, copings flush with the floor), a solid parapet on W1, four box-hedge beds.
    T2 (z -12, y -20.5..-14.5): a paved strip. Flight a: house level down to T1 along T1's east side (x 12.7..14.5).
    Flight b: from a landing at the south-east corner of W1 down to T2 along W1's outer face (y -16.1..-14.1)."""
    # house level: core (the floors are laid on it), the south face at y -2.4 down to T2 with its square buttresses
    box(F, 0, 11.35, T2, 30, 23.3, TOP - T2, 'tuff')                         # core, y -0.3..23 behind the south face (hidden
                                                                             # in the belt; down to T2 so nothing floats)
    retaining_wall(F, [(-15, -2.4), (11.0, -2.4)], 0.0, T2, batter=0.03, buttress=None, parapet=None, courses=2.0,
                   mat='stone')                                              # end pier x 9.6..12.4 = newel of flight a
    for x in (-10.0, 0.0):
        _sq_buttress(F, x, -2.4, 0.0, T2)
    _block(F, 12.4, 15.0, -2.4, -0.2, T2, 0.0, 'stone')                      # head of flight a, in the south face

    # garden terrace T1: fill, gravel floor inside the copings, side walls, W1 with a buttress and a parapet
    _block(F, -14.5, 14.5, -14.0, -2.4, T2, -6.3, 'tuff')                    # fill, behind the battered wall faces
    _block(F, -12.63, 12.4, -12.13, -2.22, -6.3, T1, 'gravel')               # floor, up to the copings and flight a
    retaining_wall(F, [(15, -14.5), (15, -2.4)], T1W, T2, buttress='square', every=9.0, parapet=None, courses=2.0, mat='stone')
    retaining_wall(F, [(-15, -2.4), (-15, -14.5)], T1W, T2, buttress='square', every=9.0, parapet=None, courses=2.0, mat='stone')
    retaining_wall(F, [(-15, -14.5), (15, -14.5)], T1W, T2, buttress=None, parapet=None, courses=2.0, mat='stone')
    _sq_buttress(F, -7.5, -14.5, T1W, T2)                                    # flight b buttresses the east half
    _block(F, -15.0, 10.6, -14.3, -13.85, T1, T1 + 1.0, 'stone')             # parapet on W1's coping, open at x 10.6..12.4
    _block(F, -15.05, 10.6, -14.35, -13.8, T1 + 1.0, T1 + 1.12, 'travertine')
    for (x, y, fl) in ((-5.35, -6.0, 'flowerR'), (-5.35, -10.4, 'flowerY'), (5.6, -6.0, 'flowerY'), (9.8, -6.0, 'flowerR')):
        hedge_bed(F, x, y, T1, 2.4, 2.4, fl)

    # lower terrace T2: paved strip (the scene builds the wall on its outer edge)
    box(F, 0, -17.5, T2 - 0.3, 30, 6.0, 0.3, 'paving')                       # z -12.3..-12, y -20.5..-14.5

    # flight a: z 0 at y -2.4 down to T1 at y -14.54, 1.8 m wide, cheeks on both sides (T1 west, the drop east)
    _, _, runs = _stair(F, 'y', -2.4, -1, 12.7, 14.5, 0.0, (15, 15), -6.3)
    for r in runs:
        _cheek(F, 'y', r, 12.4, 12.7, -6.3)
        _cheek(F, 'y', r, 14.5, 14.9, -6.3)
    # landing at the foot of flight a, outside W1 (its top stops at W1's coping), parapets south and east
    _block(F, 10.6, 14.9, -16.4, -14.1, T2 - 0.3, -6.4, 'stone')
    _block(F, 10.6, 14.9, -16.4, -14.39, -6.4, T1, 'stone')
    _block(F, 10.6, 14.9, -16.4, -16.1, T1, T1 + 1.0, 'stone')
    _block(F, 10.6, 14.95, -16.45, -16.05, T1 + 1.0, T1 + 1.12, 'travertine')
    _block(F, 14.5, 14.9, -16.1, -14.54, T1, T1 + 1.0, 'stone')
    _block(F, 14.45, 14.95, -16.1, -14.54, T1 + 1.0, T1 + 1.12, 'travertine')
    # flight b: from the landing (x 10.6) west to T2 at x -1.54, 1.6 m clear, a cheek on the open (south) side
    _, _, runs = _stair(F, 'x', 10.6, -1, -16.1, -14.1, T1, (15, 15), T2 - 0.3)
    for r in runs:
        _cheek(F, 'x', r, -16.4, -16.1, T2 - 0.3)


# the south loggia: columns on y LOG_Y, the painted face of its back wall at y LOG_BACK (the wall itself y LOG_BACK..2.5)
LOG_Y = -1.75
LOG_BACK = 2.0
LOG_X = 14.4     # inner faces of the two end walls (antae, x 14.4..15)
FL = 0.05        # loggia floor (paving z 0..0.05, a step up from the platform's edge)
G_TOP = 4.6      # ground storey: Doric columns FL..3.9, entablature 3.9..4.6; the upper floor is laid on it
U_TOP = 8.2      # upper storey: Ionic columns 4.6..7.55, entablature 7.55..8.2, under the lean-to roof (8.22 at its eave)


def _painted_face(F, z0, h, doors, dado=0.9):
    """One storey of the loggia's back wall face, y LOG_BACK - 0.12..LOG_BACK, x -LOG_X..LOG_X: dark red fields over a
    darker dado, an ochre band on the dado and an ochre frieze under the ceiling (Pompeian, as in the houses of the
    period), and doors (x centre, width, height) as dark openings with travertine frames, so that the loggia reads
    as open from far away."""
    t, yc = 0.12, LOG_BACK - 0.06
    cuts = sorted((xc - w / 2, xc + w / 2, hd) for xc, w, hd in doors)
    free, a = [], -LOG_X
    for (d0, d1, hd) in cuts:
        free.append((a, d0))
        a = d1
    free.append((a, LOG_X))
    for (u0, u1) in free:                                                     # wall between the doors
        if u1 - u0 < 0.01:
            continue
        box(F, (u0 + u1) / 2, yc, z0, u1 - u0, t, dado, 'dado')
        box(F, (u0 + u1) / 2, yc - 0.01, z0 + dado, u1 - u0, t + 0.02, 0.12, 'ochre')
        box(F, (u0 + u1) / 2, yc, z0 + dado + 0.12, u1 - u0, t, h - dado - 0.12, 'wallred')
    for (d0, d1, hd) in cuts:                                                 # over the doors, and the doors themselves
        xc, w = (d0 + d1) / 2, d1 - d0
        box(F, xc, yc, z0 + hd, w, t, h - hd, 'wallred')
        box(F, xc, LOG_BACK - 0.01, z0, w, 0.02, hd, 'doorway')               # the dark of the room behind
        for sx in (-1, 1):
            box(F, xc + sx * (w / 2 + 0.09), yc - 0.03, z0, 0.18, t + 0.06, hd + 0.18, 'travertine')   # jambs
        box(F, xc, yc - 0.04, z0 + hd, w + 0.36, t + 0.08, 0.2, 'travertine')                           # lintel
    box(F, 0, yc - 0.015, z0 + h - 0.5, 2 * LOG_X, t + 0.03, 0.22, 'ochre')   # frieze band under the ceiling


def loggia(F, wall):
    """The two-storey loggia on the south edge, x -15..15: a columnar portico like the front of a peristyle.
    Ground storey: eight Doric columns on y LOG_Y with a travertine entablature (frieze in the wall's plaster).
    Upper storey: eight Ionic columns over them, a low balustrade between them, an entablature; the lean-to roof
    (house()) covers both. Behind the columns the back wall (y LOG_BACK..2.5) is painted dark red over a darker dado,
    with doors; a timber ceiling under the upper floor. End walls (antae) in the facing plaster at x +-(14.4..15).
    Nine bays of 3.2 m between the antae, the middle one on the axis. No arches here: they belong to the substructures."""
    n_bay = 9
    sp = 2 * LOG_X / n_bay
    xs = [-LOG_X + k * sp for k in range(1, n_bay)]
    depth = 2.5 - (LOG_Y - 0.35)
    # floor, back wall, end walls, the timber ceiling under the upper floor and that floor
    box(F, 0, (LOG_Y - 0.55 + LOG_BACK) / 2, 0.0, 2 * LOG_X, LOG_BACK - (LOG_Y - 0.55), FL, 'paving')
    box(F, 0, (LOG_BACK + 2.5) / 2, 0.0, 30, 2.5 - LOG_BACK, NB, wall)
    for sx in (-1, 1):
        _slab(F, 'y', LOG_Y - 0.35, 2.5, sx * LOG_X, sx * 15.0, 0.0, (U_TOP, NB - 0.01), wall)   # top just under the roof
        box(F, sx * (LOG_X + 0.3), 2.5 - depth / 2, 0.0, 0.72, depth + 0.12, 0.45, 'travertine')   # anta bases
        box(F, sx * (LOG_X + 0.3), 2.5 - depth / 2, G_TOP - 0.7, 0.66, depth + 0.06, 0.25, 'travertine')   # anta capitals
    box(F, 0, (LOG_Y + 0.3 + LOG_BACK) / 2, G_TOP - 0.4, 2 * LOG_X, LOG_BACK - (LOG_Y + 0.3), 0.4, 'wood')
    box(F, 0, (LOG_Y + 0.3 + LOG_BACK) / 2, G_TOP, 2 * LOG_X, LOG_BACK - (LOG_Y + 0.3), 0.04, 'paving')
    # the painted back wall: doors to the court walk below, to the upper rooms above
    _painted_face(F, FL, G_TOP - 0.4 - FL, [(x, 1.6, 2.9) for x in (-12.8, -6.4, 0.0, 6.4, 12.8)])
    _painted_face(F, G_TOP + 0.04, U_TOP - 0.1 - G_TOP - 0.04, [(x, 1.3, 2.4) for x in (-12.8, -6.4, 0.0, 6.4, 12.8)], dado=0.75)
    # ground storey: Doric, then the entablature (its cornice top is the upper floor's edge)
    for x in xs:
        column(F, x, LOG_Y, FL, 3.9 - FL, 0.25, 'travertine', 'doric', 0, 12)
    entablature(F, -LOG_X - 0.3, LOG_Y, LOG_X + 0.3, LOG_Y, 3.9, G_TOP - 3.9, 0.62, 'travertine', frieze_mat=wall)
    # upper storey: Ionic over the Doric, a balustrade in each bay, the entablature under the roof
    for x in xs:
        column(F, x, LOG_Y, G_TOP, 7.55 - G_TOP, 0.18, 'travertine', 'ionic', 0, 12)
    for k in range(n_bay):
        a, b = -LOG_X + k * sp, -LOG_X + (k + 1) * sp
        balustrade(F, a + (0.02 if k == 0 else 0.25), LOG_Y, b - (0.02 if k == n_bay - 1 else 0.25), LOG_Y, G_TOP,
                   h=0.95, mat='travertine', post_every=3.0, t=0.22)
    entablature(F, -LOG_X - 0.3, LOG_Y, LOG_X + 0.3, LOG_Y, 7.55, U_TOP - 7.55, 0.5, 'travertine', frieze_mat=wall,
                cornice_proj=0.1)


def house(name, wall, belvedere_on, cut=False):
    """One terrace house. wall: facing material ('plaster2' or 'plaster3'). belvedere_on: tower and roof terrace (B).
    cut: the variant for the hill's belt (belt_base instead of the rock, fills, T1/T2 walls and W2; see the top)."""
    reset()
    preview_ground(T2 - 0.3 if cut else GROUND)
    F = Frame()

    if cut:
        belt_base(F)
    else:
        # hill base: platform core (hidden inside the rock), ledge rock hugging the platform and terrace sides,
        # the foot rock under the lowest wall W2 (its top function seats the foot rocks at their own heights)
        box(F, 0, 10.3, GROUND, 30, 25.4, TOP - GROUND, 'tuff')                  # platform core, y -2.4..23
        rock_mass(F, [(12, -2.0), (16, -2.0), (16, 23.5), (12, 23.5)], GROUND, -6.5, seed=3, band=1.5, boulders=0)
        rock_mass(F, [(-16, -2.0), (-12, -2.0), (-12, 23.5), (-16, 23.5)], GROUND, -6.5, seed=4, band=1.5, boulders=0)
        rock_mass(F, [(12, -20.5), (16, -20.5), (16, -2.0), (12, -2.0)], GROUND, -13.0, seed=5, band=1.5, strata=3, boulders=0)
        rock_mass(F, [(-16, -20.5), (-12, -20.5), (-12, -2.0), (-16, -2.0)], GROUND, -13.0, seed=6, band=1.5, strata=3, boulders=0)
        top_s = rock_mass(F, [(-16, -24.5), (16, -24.5), (16, -19.0), (-16, -19.0)], GROUND, -16.5, seed=7, band=1.5,
                          strata=3, boulders=0)
        foot_rocks(F, [(-15, -20.5), (15, -20.5)], (-18.0, -16.5), top_z=top_s, seed=8, blocks=3)

        # platform walls: inner (south) face and both sides, square piers, z -6..0
        retaining_wall(F, [(15, -2.4), (15, 23)], 0.0, -6.0, buttress='square', every=9.0, parapet=None, courses=2.0, mat='stone')
        retaining_wall(F, [(-15, 23), (-15, -2.4)], 0.0, -6.0, buttress='square', every=9.0, parapet=None, courses=2.0, mat='stone')
        retaining_wall(F, [(-15, -2.4), (15, -2.4)], 0.0, -6.0, buttress='square', every=9.0, parapet=None, courses=2.0, mat='stone')

        # garden terrace T1 (z -6): fill, lawn, side walls, wall W1 (z -12..-6) with square buttresses on its south edge (R7)
        box(F, 0, -8.45, GROUND, 30, 12.1, -6.3 - GROUND, 'tuff')                # fill, y -14.5..-2.4
        box(F, 0, -8.45, -6.3, 30, 12.1, 0.3, 'grass')                           # lawn, z -6.3..-6
        retaining_wall(F, [(15, -14.5), (15, -2.4)], -6.0, -13.2, buttress='square', every=9.0, parapet=None, courses=2.0, mat='stone')
        retaining_wall(F, [(-15, -2.4), (-15, -14.5)], -6.0, -13.2, buttress='square', every=9.0, parapet=None, courses=2.0, mat='stone')
        retaining_wall(F, [(-15, -14.5), (15, -14.5)], -6.0, -12.0, buttress='square', every=10.0,
                       coping=True, parapet=None, courses=2.0, mat='stone')

        # lower terrace T2 (z -12): fill, planting strip, wall W2 (z -18..-12) with square buttresses and a solid parapet (R7)
        box(F, 0, -17.5, GROUND, 30, 6.0, -12.3 - GROUND, 'tuff')                # fill, y -20.5..-14.5
        box(F, 0, -17.5, -12.3, 30, 6.0, 0.3, 'grass')                           # planting strip, z -12.3..-12
        retaining_wall(F, [(-15, -20.5), (15, -20.5)], -12.0, -18.0, buttress='square', every=10.0,
                       coping=True, parapet='wall', courses=2.0, mat='stone')

    # garden T1: fountain statue group, fish pond, pergola, a row of statues, the portico on W1 (stacked under the loggia)
    fountain(F, 0, -8.0, -6.0)
    pond(F, 7.0, -10.0, -6.0, 4.6, 2.6)
    pergola(F, -13.0, -12.0, -7.5, -4.5, -6.0, h=2.6, mat='wood', vine='hedge')
    for x in (-3.0, 3.0):
        statue(F, x, -4.0, -6.0, 2.4, 'marble', pedestal=1.0, ped_mat='porphyry')
    n_col, x_end = (7, -13.5 + 27.0 / 7 * 6) if cut else (8, 13.5)           # cut: the east column gives way to flight a
    for i in range(n_col):
        column(F, -13.5 + 27.0 / 7 * i, -13.4, -6.0, 3.4, 0.22, 'stone', 'doric', 0, 10, cap_mat='gold')
    entablature(F, -13.5, -13.4, x_end, -13.4, -2.6, 0.5, 0.5, 'stone')
    lean_roof(F, x_end + 0.5, -13.4, -14.0, -13.4, -2.1, 2.0, 0.8)           # lean-to roof over the portico walk
    # garden T2: statues on the planting strip, clear of the buttresses of W1
    for x in (-13.0, 13.0):
        statue(F, x, -17.5, -12.0, 2.2, 'marble', pedestal=0.9, ped_mat='giallo')

    # loggia on the south edge: a two-storey colonnade (Doric below, Ionic and a balustrade above) before a painted wall
    loggia(F, wall)
    lean_roof(F, -15, 2.5, 15, 2.5, NB, 4.5, 0.6)

    # peristyle court x -7..7, y 4.5..14.5 (open to the sky), roofed walks, stone Doric colonnade, fountain
    box(F, 0, 9.5, -0.15, 16.7, 14.0, 0.15, 'paving')                        # court and walks, x +-8.35, y 2.5..16.5
    cols = [(x, 4.5) for x in (-7, -3.5, 0, 3.5, 7)] + [(x, 14.5) for x in (-7, -3.5, 3.5, 7)]
    cols += [(sx * 7, y) for sx in (-1, 1) for y in (7.83, 11.17)]
    for (x, y) in cols:
        column(F, x, y, 0.0, 3.6, 0.24, 'stone', 'doric', 0, 10)
    for (x0, y0, x1, y1) in ((-7, 4.5, 7, 4.5), (-7, 14.5, 7, 14.5), (-7, 4.5, -7, 14.5), (7, 4.5, 7, 14.5)):
        entablature(F, x0, y0, x1, y1, 3.6, 0.6, 0.5, 'stone')
    lathe(F, 0, 9.5, [(1.85, 0.0), (1.85, 0.42), (1.4, 0.42), (1.4, 0.0)], 'marble', 28, smooth=False)
    cyl(F, 0, 9.5, 0.0, 1.4, 0.3, 'water', 24)                               # small round fountain
    flower_bed(F, -4.6, 9.5, 0.0, 2.6, 6.0)
    flower_bed(F, 4.6, 9.5, 0.0, 2.6, 6.0)
    lean_roof(F, 8.35, 2.5, -8.35, 2.5, 5.6, 2.0, 1.2)                       # walk under the loggia
    lean_roof(F, -8.35, 16.5, 8.35, 16.5, 6.4, 2.0, 1.6)                     # north walk, over the tablinum
    lean_roof(F, 8.35, 14.5, 8.35, 4.5, 5.6, 1.35, 1.0)                      # east walk
    lean_roof(F, -8.35, 4.5, -8.35, 14.5, 5.6, 1.35, 1.0)                    # west walk

    # atrium x -5.35..5.35, y 16.5..22.65: impluvium under a compluvium (light well x +-2.85, y 18.5..20.65)
    box(F, 0, 19.575, -0.15, 10.7, 6.15, 0.15, 'paving')
    box(F, 0, 19.575, 0.0, 3.6, 1.6, 0.25, 'marble')                         # impluvium basin
    box(F, 0, 19.575, 0.25, 3.0, 1.0, 0.02, 'water')
    box(F, -4.1, 16.5, 0.0, 2.5, 0.5, NB, wall)                              # atrium south wall, tablinum opening between
    box(F, 4.1, 16.5, 0.0, 2.5, 0.5, NB, wall)
    lean_roof(F, -2.85, 22.65, 2.85, 22.65, 6.4, 2.0, 1.6)                   # four roofs sloping into the light well
    lean_roof(F, 2.85, 16.5, -2.85, 16.5, 6.4, 2.0, 1.6)
    lean_roof(F, 5.35, 22.65, 5.35, 16.5, 6.4, 2.5, 1.6)
    lean_roof(F, -5.35, 16.5, -5.35, 22.65, 6.4, 2.5, 1.6)

    # entrance: north wall with the door between two Doric half-columns
    box(F, 0, 22.83, 0.0, 10.7, 0.36, NB, wall)                              # north wall, y 22.65..23.01
    box(F, 0, 23.05, 0.0, 2.4, 0.1, 3.9, 'wood')                             # door leaves
    for sx in (-1, 1):
        column(F, sx * 1.75, 23.25, 0.0, 4.0, 0.24, 'stone', 'doric', 0, 10)
    entablature(F, -1.75, 23.25, 1.75, 23.25, 4.0, 0.5, 0.6, 'stone')

    # rooms round the court and beside the atrium (facing walls, red band, stone base and cornice, hip roofs)
    rect_building(F, -11.5, 9.5, 7.0, 14.7, wall_mat=wall, foundation=0, skip_sides=('E', 'S', 'N'),
                  roof='flat' if belvedere_on else 'hip')
    rect_building(F, 11.5, 9.5, 7.0, 14.7, wall_mat=wall, foundation=0, skip_sides=('W', 'S', 'N'))
    rect_building(F, -10.0, 19.575, 10.0, 6.85, wall_mat=wall, foundation=0, skip_sides=('E', 'S'))
    rect_building(F, 10.0, 19.575, 10.0, 6.85, wall_mat=wall, foundation=0, skip_sides=('W', 'S'))
    if belvedere_on:
        pergola(F, -14.6, 3.0, -8.9, 15.9, NB + 0.25, h=2.6, mat='wood', vine='hedge')      # roof terrace pergola
        belvedere(F, 10.9, 18.9, 8.0, 15.0, wall)                                            # belvedere, NE corner

    if cut:
        human(F, -4.0, -18.0, T2)                                            # preview scale figure only
    else:
        human(F, 0.0, -32.0, GROUND)                                         # preview scale figure only
    import bpy
    bpy.context.scene.eevee.taa_render_samples = 16                          # low samples for the previews
    finish(name, front='-Y')


if __name__ == '__main__':
    house('rome_domus_a', 'plaster2', belvedere_on=False)
