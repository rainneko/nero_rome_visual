"""Aristocratic terrace house A on the Palatine, AD 56. Garden front = Blender -Y.
The house and both terraces retain their original datums (0, -6 and -12).
B adds its existing rear belvedere. The belt variants omit the modelled rock and lowest wall.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
from rk import _arch_pts
from domus_garden_front import ENTRY_HALF, FLOOR, PAVILION_INNER_X, PAVILION_Y, PORCH_EDGE, front

NB = 8.82        # eave height of the two-storey blocks (ground storey 4.62 + floor 4.2)
TOP = -0.15      # top of the platform; the floors are laid on it (z -0.15..0)
GROUND = -24.0   # lowest level of the model: everything rests on it

# Levels. The cut variant (the Palatine's belt) follows the hill's rule R10: no wall of the house's own shows more than
# 0.75 of a storey (4.5 m x 0.75 = 3.38 m), so its garden terrace T1 lies 3.4 m under the house floor and the model stops
# at BASE. The full variant (used elsewhere in the city) keeps T1 at -6 over its own T2 and rock. _set_levels() sets
# everything that depends on T1; house() calls it.
BASE = -6.0      # lowest level of the cut model: the hill's own terrace (36 on the Palatine) carries it from there
T2 = -12.0       # lower terrace T2 of the full variant (the cut model has none)
BOX_FACES = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]


def pond(F, cx, cy, z0, w, d, rim=0.45, h=0.3):
    """Rectangular fish pond: four marble rim strips round a water surface at z0 + 0.08."""
    box(F, cx, cy + (d + rim) / 2, z0, w + 2 * rim, rim, h, 'marble')
    box(F, cx, cy - (d + rim) / 2, z0, w + 2 * rim, rim, h, 'marble')
    box(F, cx - (w + rim) / 2, cy, z0, rim, d, h, 'marble')
    box(F, cx + (w + rim) / 2, cy, z0, rim, d, h, 'marble')
    box(F, cx, cy, z0 - 0.5, w, d, 0.58, 'water')


def fountain(F, cx, cy, z0, r=2.3, angles=(90, 210, 330)):
    """Round basin with a statue group: a central statue on a giallo pedestal, three statues round the rim."""
    lathe(F, cx, cy, [(r, z0), (r, z0 + 0.4), (r - 0.4, z0 + 0.4), (r - 0.4, z0)], 'marble', 28, smooth=False)
    cyl(F, cx, cy, z0, r - 0.4, 0.22, 'water', 24)
    statue(F, cx, cy, z0 + 0.22, 2.6, 'marble', pedestal=1.1, ped_mat='giallo')
    for a in angles:
        t = math.radians(a)
        statue(F, cx + (r + 0.6) * math.cos(t), cy + (r + 0.6) * math.sin(t), z0, 1.9, 'marble', pedestal=0.7, ped_mat='porphyry')


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


ENTRY_STEPS = 6                                       # risers on the axis, from the landing to the central bay
ENTRY_TREAD = 0.34
ENTRY_FOOT = PORCH_EDGE - (ENTRY_STEPS - 1) * ENTRY_TREAD
# The garden stair: from T1 two mirrored dog-leg flights climb to that landing. Seen from the garden, each side has a
# lower flight in the front band (it starts beside the central niche and rises outward), a half-landing at the outer
# end, and an upper flight in the back band rising inward to the landing. Everything under the treads is solid masonry.
STAIR_TREAD = 0.30
CORE_X = 2.30                                         # half width of the central block (landing above, niche in its face)
BAND_A = (-5.55, -4.30)                               # upper flights, y (1.25 m clear)
BAND_B = (-7.10, -5.85)                               # lower flights, y; the spine wall stands between the bands
STAIR_FRONT = BAND_B[0] - 0.30                        # outer face of the front cheek, y -7.40


def _set_levels(cut):
    """cut: T1 -3.4, 2 x 6 + 6 = 18 risers of 0.192 m, landing -1.10, half-landings -2.25, stair block x +-5.4.
    full: T1 -6.0, 2 x 13 + 6 = 32 risers (six of 0.18, 26 of 0.191), landing -1.03, half-landings -3.515, x +-7.5."""
    global CUT, T1, T1W, STAIR_RISERS, ENTRY_RISE, LANDING_Z, STAIR_RISE, STAIR_MID, STAIR_TURN, STAIR_END, STAIR_BOT
    CUT = cut
    T1 = -3.4 if cut else -6.0
    T1W = T1 - 0.35                                   # z_top of T1's retaining walls: coping flush with the T1 floor
    STAIR_RISERS = 6 if cut else 13                   # per flight
    ENTRY_RISE = (FLOOR - T1) / (2 * STAIR_RISERS + ENTRY_STEPS) if cut else 0.18
    LANDING_Z = FLOOR - ENTRY_STEPS * ENTRY_RISE      # the landing before the central bay
    STAIR_RISE = (LANDING_Z - T1) / (2 * STAIR_RISERS)
    STAIR_MID = LANDING_Z - STAIR_RISERS * STAIR_RISE
    STAIR_TURN = CORE_X + (STAIR_RISERS - 1) * STAIR_TREAD   # x where the flights meet the half-landing
    STAIR_END = STAIR_TURN + 1.30                     # outer edge of the half-landing
    STAIR_BOT = T1 - 0.12


_set_levels(True)


def _south_foundation(F, zbot):
    # Top coping finishes below the entrance threshold and extends behind the new rooms.
    y = -2.22
    face_top = -0.35
    upper_y = y + 0.03 * (face_top - zbot)
    half = 14.97
    outline = [(-half,y),(half,y),(half,-0.02),(-half,-0.02),
               (-half,upper_y),(half,upper_y),(half,-0.02),(-half,-0.02)]
    vertices = [F.p(x,v,zbot if i < 4 else face_top) for i,(x,v) in enumerate(outline)]
    add_mesh('stone', vertices, BOX_FACES)
    _block(F,-15.0,15.0,upper_y-0.23,-0.01,-0.35,0.0,'travertine')      # inside the plot's side edges
    for z in range(int(zbot)+2,-1,2):
        edge = y + 0.03 * (z - zbot)
        _block(F,-15,15,edge-0.22,edge+0.09,z,z+0.21,'travertine')
    if not CUT:                                                      # square buttresses only on the 6 m wall (R7)
        for x in (-11.5, 11.5):
            _sq_buttress(F, x, -2.25, -0.25, zbot)
    for side in (-1, 1):
        a, b = sorted((side * PAVILION_INNER_X, side * 14.99))
        _block(F, a, b, PAVILION_Y - 0.09, -2.09, T1 - 0.18, -0.14, 'stone')
        for z in ((-1.75,) if CUT else (-4.5, -2.4)):
            _block(F, a, b, PAVILION_Y - 0.12, PAVILION_Y - 0.06, z, z + 0.13, 'travertine')


def _landing_guard(F, x0, x1, y0, y1, z):
    """A solid parapet with the profile of _cheek: 1 m of stone, a travertine coping."""
    _block(F, x0, x1, y0, y1, z, z + 1.0, 'stone')
    _block(F, x0 - 0.05, x1 + 0.05, y0 - 0.05, y1 + 0.05, z + 1.0, z + 1.12, 'travertine')


def _niche(F, y_face, y_back, z0, z_top, half, spring, seg=10):
    """The face of the central block (x -CORE_X..CORE_X, y y_face..y_back) with a shallow round-headed niche in it,
    and a basin on a foot in the niche. The block behind it closes the niche's back."""
    zs = z0 + spring
    for side in (-1, 1):
        a, b = sorted((side * half, side * CORE_X))
        _block(F, a, b, y_face, y_back, STAIR_BOT, z_top, 'stone')                        # the jambs
        box(F, side * (half + 0.20), (y_face + y_back) / 2 - 0.03, zs - 0.22, 0.52, y_back - y_face + 0.06, 0.22,
            'travertine')                                                                  # imposts
    arch = _arch_pts(-half, half, zs, seg)
    face = [(half, zs), (half, z_top), (-half, z_top), (-half, zs)] + arch[1:-1]
    add_mesh('stone', [F.p(u, y_face, z) for u, z in face], [tuple(range(len(face)))])
    add_mesh('stone', [F.p(-half, y_back, z_top), F.p(half, y_back, z_top), F.p(half, y_face, z_top),
                       F.p(-half, y_face, z_top)], [(0, 1, 2, 3)])                         # top, under the parapet
    for (ua, za), (ub, zb) in zip(arch, arch[1:]):                                         # the soffit of the arch
        add_mesh('stone', [F.p(ua, y_face, za), F.p(ua, y_back, za), F.p(ub, y_back, zb), F.p(ub, y_face, zb)],
                 [(0, 1, 2, 3)])
    k = half / 1.10                                                                        # 1 for the tall niche
    box(F, 0, y_face - 0.03, zs + half - 0.12 * k, 0.42 * k, 0.10, 0.62 * k, 'travertine')             # keystone
    box(F, 0, y_back - 0.03, z0, 2 * half, 0.06, spring, 'wallred')                        # painted back, to the springing
    yb = y_back - 0.50                                                                     # basin: a labrum on a foot
    h = 0.99 if spring > 1.5 else 0.83                                                     # rim height
    lathe(F, 0, yb, [(0.24, z0), (0.24, z0 + 0.10), (0.13, z0 + 0.16), (0.11, z0 + h - 0.25), (0.30, z0 + h - 0.19),
                     (0.62 * h, z0 + h - 0.05), (0.62 * h, z0 + h), (0.52 * h, z0 + h)], 'marble', 12)
    cyl(F, 0, yb, z0 + h - 0.09, 0.52 * h, 0.06, 'water', 12)
    box(F, 0, y_back - 0.09, z0 + h + 0.27, 0.22, 0.10, 0.22, 'bronze')                    # the spout's mask


def garden_entry(F):
    """The way up from the garden terrace T1 to the house, on the axis.
    Six risers lead from the landing (z -1.10) to the central bay, between two piers. Below the landing the central
    block has a niche with a basin in its face. Either side of the niche a lower flight rises outward to a half-landing
    and an upper flight returns to the landing (see STAIR_*). Behind the upper flights a raised planting bed fills the
    space to the house's foundation wall, so that no part of the stair spans a void."""
    walk_w = ENTRY_HALF + 0.13
    _stair(F, 'y', PORCH_EDGE, -1, -walk_w, walk_w, FLOOR, (ENTRY_STEPS,),
           LANDING_Z - 0.42, rise=ENTRY_RISE, tread=ENTRY_TREAD, mat='travertine')
    for side in (-1, 1):
        a, b = sorted((side * walk_w, side * 2.14))
        run = (PORCH_EDGE, ENTRY_FOOT, FLOOR, LANDING_Z)
        _cheek(F, 'y', run, a, b, LANDING_Z - 0.42, h=0.82)
        x = side * 1.99
        box(F, x, ENTRY_FOOT + 0.14, LANDING_Z, 0.52, 0.60, 1.09, 'travertine')
        box(F, x, ENTRY_FOOT + 0.14, LANDING_Z + 1.09, 0.62, 0.70, 0.16, 'marble')

    # central block: under the entry steps, under the landing, and its face with the niche
    spine_s, spine_n = BAND_B[1], BAND_A[0]                      # the spine wall, y -5.85..-5.55
    niche_back = spine_n + 0.25                                  # y -5.30
    _block(F, -CORE_X, CORE_X, ENTRY_FOOT, -2.13, STAIR_BOT, LANDING_Z - 0.42, 'stone')
    _block(F, -CORE_X, CORE_X, niche_back, ENTRY_FOOT, STAIR_BOT, LANDING_Z - 0.08, 'stone')
    _niche(F, spine_s, niche_back, T1, LANDING_Z, *((0.80, 0.90) if CUT else (1.10, 1.90)))
    _block(F, -CORE_X, CORE_X, niche_back, ENTRY_FOOT, LANDING_Z - 0.08, LANDING_Z, 'paving')
    _landing_guard(F, -CORE_X, CORE_X, spine_s, spine_n, LANDING_Z)      # the landing's parapet over the niche

    for side in (-1, 1):
        # upper flight (back band): from the landing outward and down to the half-landing
        _, _, up = _stair(F, 'x', side * CORE_X, side, BAND_A[0], BAND_A[1], LANDING_Z, (STAIR_RISERS,), STAIR_BOT,
                          rise=STAIR_RISE, tread=STAIR_TREAD, mat='travertine')
        # lower flight (front band): from the half-landing inward and down to T1 beside the niche
        _, _, low = _stair(F, 'x', side * STAIR_TURN, -side, BAND_B[0], BAND_B[1], STAIR_MID, (STAIR_RISERS,), STAIR_BOT,
                           rise=STAIR_RISE, tread=STAIR_TREAD, mat='travertine')
        _cheek(F, 'x', up[0], spine_s, spine_n, STAIR_BOT)       # spine: retains the upper flight, parapet on its edge
        _cheek(F, 'x', low[0], STAIR_FRONT, BAND_B[0], STAIR_BOT)
        box(F, side * (CORE_X - 0.30), (STAIR_FRONT + BAND_B[0]) / 2, T1, 0.50, 0.50, 1.22, 'travertine')   # newel
        box(F, side * (CORE_X - 0.30), (STAIR_FRONT + BAND_B[0]) / 2, T1 + 1.22, 0.58, 0.58, 0.14, 'marble')
        # half-landing across both bands, parapets on its two open sides
        a, b = sorted((side * STAIR_TURN, side * STAIR_END))
        _block(F, a, b, BAND_B[0], BAND_A[1], STAIR_BOT, STAIR_MID - 0.08, 'stone')
        _block(F, a, b, BAND_B[0], BAND_A[1], STAIR_MID - 0.08, STAIR_MID, 'paving')
        a, b = sorted((side * STAIR_TURN, side * (STAIR_END + 0.30)))
        _landing_guard(F, a, b, STAIR_FRONT, BAND_B[0], z=STAIR_MID)
        _block(F, a, b, STAIR_FRONT, BAND_B[0], STAIR_BOT, STAIR_MID, 'stone')
        a, b = sorted((side * STAIR_END, side * (STAIR_END + 0.30)))
        _block(F, a, b, BAND_B[0], BAND_A[1], STAIR_MID, STAIR_MID + 1.0, 'stone')
        _block(F, a - 0.05, b + 0.05, BAND_B[0] + 0.05, BAND_A[1], STAIR_MID + 1.0, STAIR_MID + 1.12, 'travertine')
        _block(F, a, b, BAND_B[0], BAND_A[1], STAIR_BOT, STAIR_MID, 'stone')
        # raised planting bed between the upper flight and the foundation wall, beside the entry steps
        a, b = sorted((side * 2.14, side * (STAIR_END + 0.30)))
        _block(F, a, b, BAND_A[1], -2.13, STAIR_BOT, LANDING_Z + 0.30, 'stone')
        _block(F, a - 0.04, b + 0.04, BAND_A[1] - 0.04, -2.13, LANDING_Z + 0.30, LANDING_Z + 0.40, 'travertine')
        hedge_bed(F, side * (2.14 + STAIR_END + 0.30) / 2, (BAND_A[1] - 2.13) / 2 - 0.05, LANDING_Z + 0.40,
                  STAIR_END + 0.30 - 2.14 - 0.50, 1.60, 'flowerR' if side < 0 else 'flowerY')
        # a statue in the recess between the stair's end and the end room's plinth
        if not CUT:
            statue(F, side * 8.45, -3.25, T1, 2.4, 'marble', pedestal=1.0, ped_mat='porphyry')


def belt_base(F):
    """The hill part of the cut variant, z BASE..0: the core under the floors, the garden terrace T1 (z -3.4) with its
    side walls and W1 (2.6 m, a solid parapet on W1). No lower terrace and no stair down: below BASE the hill's own
    terraces and stairs take over."""
    box(F, 0, 11.35, BASE, 30, 23.3, TOP - BASE, 'tuff')
    _south_foundation(F, BASE)
    _block(F, -14.5, 14.5, -14.0, -2.4, BASE, T1 - 0.3, 'tuff')              # fill, behind the wall faces
    _block(F, -12.63, 12.63, -12.13, -2.22, T1 - 0.3, T1, 'gravel')          # floor, up to the copings
    for a, b in (((15, -14.5), (15, -2.4)), ((-15, -2.4), (-15, -14.5)), ((-15, -14.5), (15, -14.5))):
        retaining_wall(F, [a, b], T1W, BASE, buttress=None, batter=0.03, parapet=None, courses=0, mat='stone')
    # W1's edge: a stone balustrade between piers 4.35 m apart, four of them carrying a small statue; a 3 m opening on
    # the axis (the way down to the hill's terrace, when the scene builds it) with a paved landing inside it
    yb, piers = -14.08, (1.80, 6.15, 10.50, 14.70)
    for side in (-1, 1):
        for i, x in enumerate(piers):
            box(F, side * x, yb, T1, 0.60, 0.60, 1.10, 'travertine')
            box(F, side * x, yb, T1 + 1.10, 0.72, 0.72, 0.14, 'marble')
            if i in (1, 2):
                statue(F, side * x, yb, T1 + 1.24, 1.5, 'marble', pedestal=0)
        for a, b in zip(piers, piers[1:]):
            x0, x1 = sorted((side * (a + 0.30), side * (b - 0.30)))
            balustrade(F, x0, yb, x1, yb, T1, h=1.0, mat='travertine', post_every=5.0, t=0.24)
    _block(F, -1.50, 1.50, -14.45, -12.60, T1, T1 + 0.03, 'paving')
    for x, y, w, d, fl in ((-4.6,-10.3,2.4,2.4,'flowerR'),(4.6,-10.3,2.4,2.4,'flowerY'),   # either side of the fountain
                           (-7.0,-6.0,2.0,2.4,'flowerY'),(7.0,-6.0,2.0,2.4,'flowerR')):     # at the stair's two ends
        hedge_bed(F, x, y, T1, w, d, fl)


def house(name, wall, belvedere_on, cut=False):
    """One terrace house. wall: facing material ('plaster2' or 'plaster3'). belvedere_on: tower and roof terrace (B).
    cut: the variant for the hill's belt (belt_base instead of the rock, fills, T1/T2 walls and W2; see the top)."""
    reset()
    _set_levels(cut)
    preview_ground(BASE if cut else GROUND)
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
        _south_foundation(F, T1)

        # garden terrace T1 (z -6): fill, lawn, side walls, wall W1 (z -12..-6) with square buttresses on its south edge (R7)
        box(F, 0, -8.45, GROUND, 30, 12.1, T1 - 0.3 - GROUND, 'tuff')            # fill, y -14.5..-2.4
        box(F, 0, -8.45, T1 - 0.3, 30, 12.1, 0.3, 'grass')                       # lawn
        retaining_wall(F, [(15, -14.5), (15, -2.4)], T1W, -13.2, buttress='square', every=9.0, parapet=None, courses=2.0, mat='stone')
        retaining_wall(F, [(-15, -2.4), (-15, -14.5)], T1W, -13.2, buttress='square', every=9.0, parapet=None, courses=2.0, mat='stone')
        retaining_wall(F, [(-15, -14.5), (15, -14.5)], T1W, -12.0, buttress='square', every=10.0,
                       coping=True, parapet=None, courses=2.0, mat='stone')

        # lower terrace T2 (z -12): fill, planting strip, wall W2 (z -18..-12) with square buttresses and a solid parapet (R7)
        box(F, 0, -17.5, GROUND, 30, 6.0, -12.3 - GROUND, 'tuff')                # fill, y -20.5..-14.5
        box(F, 0, -17.5, -12.3, 30, 6.0, 0.3, 'grass')                           # planting strip, z -12.3..-12
        retaining_wall(F, [(-15, -20.5), (15, -20.5)], -12.0, -18.0, buttress='square', every=10.0,
                       coping=True, parapet='wall', courses=2.0, mat='stone')

    garden_entry(F)

    # garden T1
    if cut:   # the fountain south of the stair's foot, a fish pond east, a pergola west; its statues stand on W1's piers
        fountain(F, 0, -10.3, T1, r=1.8, angles=())
        pond(F, 9.2, -9.4, T1, 4.6, 2.6)
        pergola(F, -12.6, -9.4, -8.4, -4.6, T1, h=2.4, mat='wood', vine='hedge')
    else:     # fountain statue group, fish pond, pergola, the portico on W1; statues on the planting strip T2
        fountain(F, 0, -10.3, T1, r=1.8, angles=(270, 30, 150))
        pond(F, 7.0, -10.0, T1, 4.6, 2.6)
        pergola(F, -13.0, -12.0, -7.5, -4.5, T1, h=2.6, mat='wood', vine='hedge')
        for i in range(8):
            column(F, -13.5 + 27.0 / 7 * i, -13.4, T1, 3.4, 0.22, 'stone', 'doric', 0, 10, cap_mat='travertine')
        entablature(F, -13.5, -13.4, 13.5, -13.4, T1 + 3.4, 0.5, 0.5, 'stone')
        lean_roof(F, 14.0, -13.4, -14.0, -13.4, T1 + 3.9, 2.0, 0.8)          # lean-to roof over the portico walk
        for x in (-13.0, 13.0):
            statue(F, x, -17.5, T2, 2.2, 'marble', pedestal=0.9, ped_mat='giallo')

    front(F, wall)

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
    for a, b in ((-5.35, -1.20), (1.20, 5.35)):
        _block(F, a, b, 22.65, 23.01, 0.0, NB, wall)
    _block(F, -1.20, 1.20, 22.65, 23.01, 3.9, NB, wall)
    for x in (-0.60, 0.60):
        box(F, x, 22.85, 0.0, 1.19, 0.14, 3.9, 'wood')
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
        human(F, -3.6, -8.6, T1)                                            # preview scale figure only
    else:
        human(F, 0.0, -32.0, GROUND)                                         # preview scale figure only
    return finish(name, front='-Y')


if __name__ == '__main__':
    house('rome_domus_a', 'plaster2', belvedere_on=False)
