"""rome_apollo · Temple of Apollo Palatinus and its precinct, Rome AD 56 (brief: briefs/rome/apollo.md).

Terrace 94 x 94 m on the south edge of the Palatine, z = 0 at the terrace floor. The temple faces south (-Y) on a
podium with a front stair and a gilded Sun quadriga on the pediment. The Danaid portico (giallo Ionic) runs along the
south, east and west sides, with a viewing exedra in the middle of the south side. The altar with four bronze oxen
stands on the axis of a checkered plaza with torch columns and a bronze lattice rail. Two libraries flank the back of
the temple and the propylon closes the east side.
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *

H = 47.0                                    # terrace half-side (terrace 94 x 94 m)
SQ = [(-H, -H), (H, -H), (H, H), (-H, H)]   # counter-clockwise
TEMPLE_Y = 16.0                             # temple centre (y)
ALTAR = (0.0, -20.0)
BACK = 45.0                                # portico back line (centre of its 1.5 m wall)
DEPTH = 7.0                                 # portico depth: back line to column line
COL_H = 6.5                                 # giallo Ionic columns
WALL_H = 9.2                               # solid back wall of the portico
ENT_H = 0.9                                 # portico entablature height
COL_X = [-38.0 + i * 76.0 / 21 for i in range(22)]   # portico column positions, 3.62 m apart
# south access: two doors in the portico back wall, each reached from the lower terrace by a stair along the upper wall
DOOR_X, DOOR_W, DOOR_H = 18.0, 3.0, 4.5     # door centres at x = +-18 (between the columns at 16.29 and 19.90)
LAND_IN, LAND_OUT = 16.5, 19.5              # top landing |x| range (= the door opening)
ST_FOOT, ST_N = 35.5, 36                    # stair foot |x| on the lower floor; 36 risers of 1/6 m up to the landing
ST_Y0, ST_Y1 = -50.05, -46.6                # stair band (y): south face of its parapet wall .. buried in the battered wall
ST_RAIL_Y = -49.835                         # centre line of the stair and landing balustrades
GATE_X0, GATE_X1 = 7.5, 11.5                # opening in the lower balustrade (a scene stair arrives here from below)


def P(side, u, v):
    """World point of a portico position: u along the row, v = depth from the back wall toward the court."""
    if side == 'S':
        return (u, -BACK + v)
    if side == 'E':
        return (BACK - v, u)
    return (-BACK + v, u)                   # 'W'


def ox(F, x, y, z0, rot):
    """A bronze ox on z0: body 2.2 m long, four legs, neck, head, horns; the head points along local +x."""
    S = F.sub(x, y, z0, rot)
    box(S, 0, 0, 0.9, 2.2, 0.8, 0.9, 'bronze')                          # body
    for lx in (0.7, -0.7):
        for ly in (0.25, -0.25):
            beam(S, lx, ly, 0.92, lx, ly, 0.0, 0.16, 0.16, 'bronze')    # legs
    beam(S, 1.0, 0, 1.6, 1.45, 0, 2.15, 0.45, 0.5, 'bronze')            # neck
    box(S, 1.75, 0, 1.95, 0.75, 0.5, 0.5, 'bronze')                     # head
    box(S, 2.1, 0, 1.8, 0.3, 0.42, 0.4, 'bronze')                       # muzzle
    for sy in (-1, 1):
        beam(S, 1.6, 0.2 * sy, 2.45, 1.75, 0.4 * sy, 2.8, 0.07, 0.07, 'bronze')   # horns
    beam(S, -1.1, 0, 1.65, -1.4, 0, 1.25, 0.08, 0.08, 'bronze')         # tail


def statue_lo(F, x, y, z0, h, mat, pedestal):
    """The kit's statue() with fewer facets (the portico has 56 of them)."""
    S = F.sub(x, y, z0, 0.0)
    if pedestal > 0:
        box(S, 0, 0, 0, h * 0.42, h * 0.42, pedestal * 0.12, 'marble')
        box(S, 0, 0, pedestal * 0.12, h * 0.34, h * 0.34, pedestal * 0.76, 'marble')
        box(S, 0, 0, pedestal * 0.88, h * 0.42, h * 0.42, pedestal * 0.12, 'marble')
    zb = pedestal
    cyl(S, 0, 0, zb, h * 0.17, h * 0.55, mat, 8, r_top=h * 0.11)                 # robe
    cyl(S, 0, 0, zb + h * 0.55, h * 0.11, h * 0.25, mat, 8, r_top=h * 0.13)      # torso
    sphere(S, 0, 0, zb + h * 0.88, h * 0.075, mat, 8, 5)                         # head
    beam(S, 0, h * 0.1, zb + h * 0.74, h * 0.12, h * 0.2, zb + h * 0.98, h * 0.06, h * 0.06, mat)   # arm


def door_frame(F, xc):
    """A plain marble frame for a door of the portico back wall centred at x = xc: two jambs and a lintel standing
    0.1 m proud of both wall faces, and a low threshold slab on the floor."""
    jw, lh, d = 0.35, 0.45, 1.7
    for s in (-1, 1):
        box(F, xc + s * (DOOR_W / 2 + jw / 2), -BACK, 0.0, jw, d, DOOR_H, 'marble')
    box(F, xc, -BACK, DOOR_H, DOOR_W + 2 * jw, d, lh, 'marble')
    box(F, xc, -BACK, 0.0, DOOR_W, 1.5, 0.03, 'marble')


def xz_prism(F, pts, y0, y1, mat):
    """Extrude a polygon given in the x-z plane (list of (x, z)) from y0 to y1 (y0 < y1); either winding."""
    if sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts))) < 0:
        pts = list(reversed(pts))           # make it counter-clockwise seen from the south (-y)
    A = [F.p(x, y0, z) for x, z in pts]; B = [F.p(x, y1, z) for x, z in pts]
    add_poly(mat, A); add_poly(mat, list(reversed(B)))
    for i in range(len(pts)):
        j = (i + 1) % len(pts)
        add_poly(mat, [A[j], A[i], B[i], B[j]])


def rake_balustrade(F, xa, za, xb, zb, y, h=1.05, mat='marble', post_every=2.2, t=0.28):
    """The kit's balustrade climbing along x at y, from (xa, za) to (xb, zb) (z = the stair's nosing line):
    sloping plinth and rail, vertical posts and balusters."""
    L = abs(xb - xa)
    beam(F, xa, y, za + 0.09, xb, y, zb + 0.09, t + 0.06, 0.18, mat)
    beam(F, xa, y, za + h - 0.07, xb, y, zb + h - 0.07, t + 0.1, 0.14, mat)
    n = max(1, int(L / post_every))
    for i in range(n + 1):
        f = i / n
        box(F, xa + (xb - xa) * f, y, za + (zb - za) * f - 0.06, 0.34, t + 0.06, h + 0.06, mat)
    nb = int(L / 0.32)
    for i in range(nb):
        f = (i + 0.5) / nb
        cyl(F, xa + (xb - xa) * f, y, za + (zb - za) * f + 0.17, 0.07, h - 0.31, mat, 6, r_top=0.05, caps=False)


def south_stairs(F):
    """Two stairs against the upper south wall (face at y -47), mirrored about the axis: the foot on the lower terrace
    (z -6) at x = +-35.5, climbing toward the centre in 36 risers of 1/6 m (treads 0.44 m) to z 0 at x = +-19.5, then a
    top landing x +-16.5..19.5 from the portico back wall to y -50 in front of each door. Every tread and the landing are
    solid down to the lower floor; a tuff parapet wall on the open south side carries a marble balustrade, which turns
    along the landing's south and inner sides."""
    run, rise = (ST_FOOT - LAND_OUT) / ST_N, (0.0 - ZM) / ST_N
    yc, yw = (-49.62 + ST_Y1) / 2, ST_Y1 + 49.62
    u_top = ST_FOOT - (ST_N - 1) * run                         # nosing of the last tread (z 0), x = 19.94
    for sd in (-1, 1):
        for i in range(ST_N):                                  # treads, each a block from the lower floor
            box(F, sd * (ST_FOOT - (i + 0.5) * run), yc, ZM, run + 0.02, yw, (i + 1) * rise, 'travertine')
        # parapet wall on the open south side: its top follows the nosing line, then the flat top tread
        xz_prism(F, [(sd * LAND_OUT, ZM), (sd * ST_FOOT, ZM), (sd * ST_FOOT, ZM + rise), (sd * u_top, 0.0),
                     (sd * LAND_OUT, 0.0)], ST_Y0, -49.62, 'tuff')
        # landing: solid block, paved a centimetre above the terrace floor (which runs under it to y -47)
        x0, x1 = sorted((sd * LAND_IN, sd * LAND_OUT))
        box(F, (x0 + x1) / 2, (ST_Y0 + ST_Y1) / 2, ZM, x1 - x0, ST_Y1 - ST_Y0, -ZM - 0.02, 'tuff')
        add_poly('paving', [F.p(x0, ST_Y0, 0.01), F.p(x1, ST_Y0, 0.01), F.p(x1, -BACK - 0.75, 0.01), F.p(x0, -BACK - 0.75, 0.01)])
        # balustrades: up the stair, along the landing's south side, back along its inner side to the portico wall
        xi = sd * (LAND_IN + 0.17)
        rake_balustrade(F, sd * ST_FOOT, ZM + rise, sd * u_top, 0.0, ST_RAIL_Y)
        balustrade(F, sd * u_top, ST_RAIL_Y, xi, ST_RAIL_Y, 0.0, 1.05, 'marble', 2.2, 0.28)
        balustrade(F, xi, ST_RAIL_Y, xi, -BACK - 0.75, 0.0, 1.05, 'marble', 2.2, 0.28)


def upper_south_wall(F):
    """The upper south retaining wall exactly as retaining_wall(F, [(-H, -H), (H, -H)], 0, z_bot=ZM, buttress='square',
    every=10, b_size=2.2, parapet=None) built it, except that its coping is cut where the two stair landings cross it
    to the portico doors, and only the two outer square buttresses (x = +-41.8) are kept: the stairs bury those at
    +-20.9 and +-31.3, and the ones at +-10.4 and 0 would stand in or beside the recess under the exedra."""
    t, bt, zb, zt, bs = 2.2, 0.06, ZM, 0.0, 2.2
    Hh = zt - zb; bb = bt * Hh; L = 2 * H
    S = F.sub(-H, -H, 0.0, 0.0)
    v = [S.p(0, 0, zb), S.p(L, 0, zb), S.p(L, t, zb), S.p(0, t, zb),
         S.p(0, bb, zt), S.p(L, bb, zt), S.p(L, t, zt), S.p(0, t, zt)]
    add_mesh('tuff', v, [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])
    box(S, L / 2, bt * 4.0 - 0.08, zb + 4.0, L, 0.3, 0.28, 'travertine')           # string course at z -2
    cuts = [(-L / 2 - 0.1, -LAND_OUT), (-LAND_IN, LAND_IN), (LAND_OUT, L / 2 + 0.1)]
    for a, b in cuts:                                                             # coping, open at the landings
        box(S, H + (a + b) / 2, bb + t / 2 - 0.2, zt - 0.05, b - a, t + 0.4 - bb, 0.4, 'travertine')
    nb = int(L / 10.0)
    for j in range(nb):
        u = (j + 0.5) * L / nb
        if abs(u - H) < 37.0:                                 # only x = +-41.8 (review of 2026-11-19)
            continue
        box(S, u, -bs / 2 + 0.3, zb, bs * 1.1, bs + 0.6, Hh - 0.4, 'tuff')
        box(S, u, -bs / 2 + 0.3, zt - 0.45, bs * 1.1 + 0.3, bs + 0.9, 0.35, 'travertine')
    for x in (-H, H):                                                             # corner piers
        box(F, x, -H, zb, t + 0.6, t + 0.6, Hh + 0.35, 'tuff')


def lower_south_wall(F):
    """The lower south retaining wall exactly as retaining_wall(F, [(-H, LOW), (H, LOW)], ZM, z_bot=-12, mat='stone',
    every=10, parapet=None, buttress=None, coping=True) built it, except that its coping stops at the balustrade opening
    (x GATE_X0..GATE_X1): R11 (the review of 2026-11-14), the way out onto the scene stair is level with the lower floor,
    no sill to step up onto (gate_and_paths paves the wall top there)."""
    t, bt, zb, zt = 2.2, 0.06, -12.0, ZM
    Hh = zt - zb; bb = bt * Hh; L = 2 * H
    S = F.sub(-H, LOW, 0.0, 0.0)
    v = [S.p(0, 0, zb), S.p(L, 0, zb), S.p(L, t, zb), S.p(0, t, zb),
         S.p(0, bb, zt), S.p(L, bb, zt), S.p(L, t, zt), S.p(0, t, zt)]
    add_mesh('stone', v, [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])
    k = 1
    while zb + k * 4.0 < zt - 0.8:                                                # string courses, as retaining_wall
        zz = zb + k * 4.0
        box(S, L / 2, bt * (zz - zb) - 0.08, zz, L, 0.3, 0.28, 'travertine'); k += 1
    for a, b in ((-0.1, H + GATE_X0), (H + GATE_X1, L + 0.1)):                    # coping, open at the opening
        box(S, (a + b) / 2, bb + t / 2 - 0.2, zt - 0.05, b - a, t + 0.4 - bb, 0.4, 'rock2')
    for x in (-H, H):                                                             # corner piers
        box(F, x, LOW, zb, t + 0.6, t + 0.6, Hh + 0.35, 'stone')


def gate_and_paths(F):
    """The opening in the lower balustrade (x 7.5..11.5) with a marble pier at each side, each carrying the statue
    that stood next to it; dark peperino guide paving: across the wall top in the opening, level with the lower floor
    (R11: the coping stops there, lower_south_wall), and a band along the lower terrace from stair foot to stair foot,
    in two pieces that stop at x +-3.4: the guide band enters the recess under the exedra through the bay beside the
    axis on one side, crosses its peperino floor (exedra) and leaves through the bay on the other side."""
    zc = ZM + 0.35                                         # top of the lower wall's coping (it runs y -54.86..-52.62)
    for xp in (GATE_X0 - 0.5, GATE_X1 + 0.5):
        box(F, xp, YL, zc, 1.0, 1.0, 0.15, 'marble')
        box(F, xp, YL, zc + 0.15, 0.9, 0.9, 1.1, 'marble')
        box(F, xp, YL, zc + 1.25, 1.04, 1.04, 0.15, 'marble')
        statue(F, xp, YL, zc + 1.4, 1.9, 'marble', pedestal=0.0)
    g0, g1 = GATE_X0, GATE_X1
    box(F, (g0 + g1) / 2, (-54.86 - 52.62) / 2, ZM - 0.11, g1 - g0, 2.24, 0.12, 'peperino')   # over the wall top, the floor's level
    zf = ZM + 0.01
    for x0, y0, x1, y1 in ((-ST_FOOT, -52.6, -3.4, -51.0), (3.4, -52.6, ST_FOOT, -51.0),   # the band, in two pieces
                           (ST_FOOT, -52.6, ST_FOOT + 1.5, -47.0),                     # pads in front of the stair feet
                           (-ST_FOOT - 1.5, -52.6, -ST_FOOT, -47.0)):
        add_poly('peperino', [F.p(x0, y0, zf), F.p(x1, y0, zf), F.p(x1, y1, zf), F.p(x0, y1, zf)])


def portico(F):
    """Danaid portico on three sides: solid 9.2 m back wall on the terrace edge, giallo Ionic columns on the inner line,
    marble entablature, a lean-to tile roof falling toward the court, one dark basalt statue between every two columns.
    The south back wall is open for 16 m (the exedra); the east back wall is open for 14 m (the propylon)."""
    rows = {'S': [COL_X], 'E': [COL_X[1:9], COL_X[13:]], 'W': [COL_X[1:]]}   # runs of columns per side
    d0, d1 = DOOR_X - DOOR_W / 2, DOOR_X + DOOR_W / 2
    spans = {'S': [(-BACK, -d1), (-d0, -8.0), (8.0, d0), (d1, BACK)], 'E': [(7.0, BACK), (-BACK, -7.0)], 'W': [(-BACK, BACK)]}
    for side, segs in spans.items():
        for u0, u1 in segs:
            (x0, y0), (x1, y1) = P(side, u0, 0.0), P(side, u1, 0.0)
            wall(F, x0, y0, x1, y1, 0.0, WALL_H, 1.5, 'plaster')
    for sd in (-1, 1):                      # the two south doors: wall over the opening, marble frame, threshold
        wall(F, sd * d0, -BACK, sd * d1, -BACK, DOOR_H, WALL_H - DOOR_H, 1.5, 'plaster')
        door_frame(F, sd * DOOR_X)
    # lean-to roofs: high edge on the back wall, falling 1.8 m over 7.6 m toward the court (right of p0 -> p1)
    for side, u0, u1 in (('S', BACK, -BACK), ('E', BACK, 7.0), ('E', -7.0, -BACK), ('W', -BACK, BACK)):
        (x0, y0), (x1, y1) = P(side, u0, 0.0), P(side, u1, 0.0)
        lean_roof(F, x0, y0, x1, y1, WALL_H, 7.6, 1.8)
    for side, runs in rows.items():
        for run in runs:
            for u in run:
                x, y = P(side, u, DEPTH)
                column(F, x, y, 0.0, COL_H, None, 'giallo', 'ionic', 0, 8)
            (xa, ya), (xb, yb) = P(side, run[0], DEPTH), P(side, run[-1], DEPTH)
            entablature(F, xa, ya, xb, yb, COL_H, ENT_H, 0.9, 'marble')
            for a, b in zip(run, run[1:]):
                x, y = P(side, (a + b) / 2, DEPTH - 0.9)                 # statue between two columns, toward the wall
                statue_lo(F, x, y, 0.0, 1.9, 'basalt', 0.6)              # the Danaids were black


def clip_y(pts, yc):
    """Clip a polygon (list of (x, y)) to the half-plane y <= yc (Sutherland-Hodgman); keeps the winding."""
    out = []
    for i in range(len(pts)):
        (x0, y0), (x1, y1) = pts[i - 1], pts[i]
        if (y0 <= yc) != (y1 <= yc):
            f = (yc - y0) / (y1 - y0); out.append((x0 + (x1 - x0) * f, yc))
        if y1 <= yc:
            out.append((x1, y1))
    return out


def pier(F, x, y, rot, w, d, z1):
    """A square ashlar pier from the lower floor (z -6) to z1: travertine plinth 0.25 and step 0.15, tuff shaft
    w x d, travertine step 0.2 and abacus 0.28 at the top. Base and cap project 0.1 / 0.2 m past the shaft."""
    S = F.sub(x, y, ZM, rot); h = z1 - ZM
    box(S, 0, 0, 0.0, w + 0.4, d + 0.4, 0.25, 'travertine')          # plinth
    box(S, 0, 0, 0.25, w + 0.2, d + 0.2, 0.15, 'travertine')         # step
    box(S, 0, 0, 0.38, w, d, h - 0.84, 'tuff')                       # shaft
    box(S, 0, 0, h - 0.48, w + 0.2, d + 0.2, 0.2, 'travertine')      # cap step
    box(S, 0, 0, h - 0.28, w + 0.4, d + 0.4, 0.28, 'travertine')     # abacus, its top under the beam


def exedra(F):
    """Viewing exedra in the middle of the south side: a half-round bay of radius 8 m about (0, -45) projecting over
    the lower terrace. Paved floor (z 0) on a 0.6 m slab with a balustrade on the rim. Under the slab a curved
    travertine beam (radius 6.45..8, z -1.25..-0.6, a small moulding along its top outer edge) runs from the
    retaining wall round to the wall again; it rests on four square tuff piers on the ring (centre radius 7.25, at
    228, 256, 284 and 312 degrees, the axis bay open) and on a wall pier at each end (x +-7.25), all with travertine
    bases and caps. Behind the piers a shaded recess against the retaining wall, with two stone benches with low
    backs. The recess floor is paved in dark peperino (a half disc of radius 6.45, with a threshold strip in each of
    the two bays beside the axis): the guide band along the lower terrace enters the recess through the bay between
    the 228 and 256 degree piers and leaves through the bay between 284 and 312 (gate_and_paths stops it there)."""
    R = 8.0; RB = 6.45; RP = 7.25; cy = -BACK; N = 17
    ZB0, ZB1 = -1.25, -0.6                                   # beam under the slab
    YW = -46.4                                               # beam ends: wall face (~-46.7 at that height) + 0.3
    ang = [math.pi + math.pi * i / N for i in range(N + 1)]
    ring = lambda r, a: (r * math.cos(a), cy + r * math.sin(a))
    arc = [ring(R, a) for a in ang]
    prism(F, arc, ZB1, -0.02, 'tuff')                        # floor slab
    RM = R + 0.12 / math.cos(math.pi / (2 * N))              # moulding: 0.12 m out from the beam's chord faces
    for a0, a1 in zip(ang, ang[1:]):                         # beam and moulding, segment by segment, cut at the wall
        q = clip_y([ring(R, a0), ring(R, a1), ring(RB, a1), ring(RB, a0)], YW)
        if len(q) > 2:
            prism(F, q, ZB0, ZB1, 'travertine')
        q = clip_y([ring(RM, a0), ring(RM, a1), ring(R, a1), ring(R, a0)], YW)
        if len(q) > 2:
            prism(F, q, ZB1 - 0.15, ZB1, 'travertine')
    for deg in (228, 256, 284, 312):                         # free piers, one face looking radially outward
        a = math.radians(deg); x, y = ring(RP, a)
        pier(F, x, y, deg, 1.5, 1.5, ZB0)
    for sd in (-1, 1):                                       # wall piers: 0.6 proud at the foot, back buried in the
        pier(F, sd * RP, -47.1, 0.0, 1.5, 1.0, ZB0)          # battered wall (y -47.6..-46.6)
        bx = sd * 3.3                                        # stone bench against the wall: seat top z -5.52
        box(F, bx, -47.25, ZM + 0.36, 2.4, 0.5, 0.12, 'travertine')
        box(F, bx, -47.05, ZM + 0.48, 2.4, 0.1, 0.45, 'travertine')   # low back slab against the wall
        for s in (-0.85, 0.85):
            box(F, bx + s, -47.25, ZM, 0.3, 0.44, 0.36, 'travertine')
        a = math.radians(270 + sd * 28)                      # threshold strip in the bay (242 / 298 degrees), 1.6 m
        ca, sa = math.cos(a), math.sin(a)                    # wide (between the plinths), r 6.3..8.2, joining the band
        q = [(r * ca - t * sa, cy + r * sa + t * ca) for r, t in ((6.3, -0.8), (8.2, -0.8), (8.2, 0.8), (6.3, 0.8))]
        add_poly('peperino', [F.p(x, y, ZM + 0.011) for x, y in q])
    # recess floor: dark peperino half disc r 6.45 on the slab's polyline, cut at the wall foot (y -47)
    add_poly('peperino', [F.p(x, y, ZM + 0.012) for x, y in clip_y([ring(RB, a) for a in ang], -47.0)])
    add_poly('paving', [F.p(x, y, 0.0) for x, y in arc])
    for (x0, y0), (x1, y1) in zip(arc, arc[1:]):
        balustrade(F, x0, y0, x1, y1, 0.0, 1.05, 'marble', 2.2, 0.28)


def propylon(F):
    """Propylon on the east at (42, 0) facing +X: 14 m wide, 9 m deep, four Ionic columns in front and four behind,
    entablature, pediments front and back, tile roof, a 3.5 m passage through the middle."""
    S = F.sub(42.0, 0.0, 0.0, ROT['+X'])
    base = 0.3
    box(S, 0, 0, 0, 14.0, 9.0, base, 'marble')
    xs = (-5.25, -1.75, 1.75, 5.25)
    for y in (-4.0, 4.0):
        for x in xs:
            column(S, x, y, base, COL_H, None, 'giallo', 'ionic', 0, 8)
        entablature(S, xs[0], y, xs[-1], y, base + COL_H, ENT_H, 0.9, 'marble')
    for x in (xs[0], xs[-1]):
        entablature(S, x, -4.0, x, 4.0, base + COL_H, ENT_H, 0.9, 'marble')
    gable_roof(S, 0, 0, base + COL_H + ENT_H, 14.0, 9.0, pitch=15.0, axis='y', overhang=0.5,
               gable_mat='marble', pediment=True, tymp_mat='plaster')

def lower_statues(F):
    """A row of marble statues on pedestals every 6 m, inboard of the lower balustrade, standing on its coping."""
    for x in range(-42, 43, 6):
        if x and x not in (6, 12):          # the two beside the opening stand on its piers (gate_and_paths)
            statue(F, float(x), -53.4, -5.65, 1.9, 'marble', pedestal=0.8, ped_mat='marble')


# ---- main build: upper terrace wall 0 -> -6, lower terrace wall -6 -> -12 rising out of rock, exedra on the upper level
reset()
F = Frame()

ZM = -6.0                                   # lower terrace level: foot of the upper south wall
LOW = -H - 8.0                              # south line of the lower terrace wall (y = -55)
YU = -H + 0.66                              # balustrade on the upper south wall, inside its top (batter 0.36 + 0.3)
YL = LOW + 0.66                             # balustrade on the lower south wall, same offset
BUT = dict(buttress='square', every=10.0, b_size=2.2, parapet=None)

# upper terrace (floor z 0): south wall 0 -> -6 standing on the lower terrace; east, north, west walls 0 -> -12
upper_south_wall(F)                         # = retaining_wall(F, [(-H, -H), (H, -H)], 0.0, z_bot=ZM, **BUT), coping cut at the landings
retaining_wall(F, [(H, -H), (H, H)], 0.0, z_bot=-12.0, **BUT)
retaining_wall(F, [(H, H), (-H, H)], 0.0, z_bot=-3.0, **BUT)
retaining_wall(F, [(-H, H), (-H, -H)], 0.0, z_bot=-12.0, **BUT)
terrace_floor(F, SQ, 0.0, 'paving')

# lower terrace (floor z -6): a strip of paving, a 6 m south wall rising out of rock, short returns at the corners
terrace_floor(F, [(-H, LOW), (H, LOW), (H, -H), (-H, -H)], ZM, 'paving')
# the lower walls stand on rock: square buttresses (R7, as on the Tiberiana), pale 'stone' ashlar
BAST = dict(parapet=None, buttress='square', coping=True)
# south wall: its own square buttresses (same as buttress='square', b_size 1.8), except the one at x 10.4 that would
# stand in front of the balustrade opening where the scene stair arrives
lower_south_wall(F)                         # = retaining_wall(F, [(-H, LOW), (H, LOW)], ZM, z_bot=-12, mat='stone', every=10, **dict(BAST, buttress=None)), coping open at the gate
for j in range(9):
    xb = -H + (j + 0.5) * 2 * H / 9
    if GATE_X0 - 1.0 < xb < GATE_X1 + 1.0:
        continue
    box(F, xb, LOW - 0.6, -12.0, 1.98, 2.4, 5.6, 'stone')
    box(F, xb, LOW - 0.6, ZM - 0.45, 2.28, 2.7, 0.35, 'rock2')
retaining_wall(F, [(H, LOW), (H, -H)], ZM, z_bot=-12.0, mat='stone', every=10.0, **BAST)
retaining_wall(F, [(-H, -H), (-H, LOW)], ZM, z_bot=-12.0, mat='stone', every=10.0, **BAST)
# ledge rock under the lower walls: footprint reaches under the lower terrace; top kept above the wall foot (-12)
rock_top = rock_mass(F, [(-62.0, -66.0), (62.0, -66.0), (62.0, -42.0), (-62.0, -42.0)], -20.0, -9.0,
                     seed=3, step=2.5, jitter=2.0, strata=5, dip=3.0)
# chunks of rock juts out in front of the walls' feet, each seated on the ledge at its own height
foot_rocks(F, [(-H, LOW), (H, LOW)], (-11.5, -9.0), seed=4, blocks=18, top_z=rock_top)
foot_rocks(F, [(H, LOW), (H, -H)], (-11.5, -9.0), seed=6, blocks=4, top_z=rock_top)
foot_rocks(F, [(-H, -H), (-H, LOW)], (-11.5, -9.0), seed=7, blocks=4, top_z=rock_top)

# balustrades: upper south wall (not across the exedra mouth nor the two stair landings), lower south wall (open at
# x 7.5..11.5 between two piers) and its returns
for sd in (-1, 1):
    balustrade(F, sd * 8.0, YU, sd * (LAND_IN - 0.17), YU, 0.35, 1.05, 'marble', 2.2, 0.28)
    balustrade(F, sd * (LAND_OUT + 0.17), YU, sd * 46.34, YU, 0.35, 1.05, 'marble', 2.2, 0.28)
balustrade(F, -46.34, YL, GATE_X0 - 0.5, YL, ZM + 0.35, 1.05, 'marble', 2.2, 0.28)
balustrade(F, GATE_X1 + 0.5, YL, 46.34, YL, ZM + 0.35, 1.05, 'marble', 2.2, 0.28)
balustrade(F, 46.34, YL, 46.34, -H, ZM + 0.35, 1.05, 'marble', 2.2, 0.28)
balustrade(F, -46.34, -H, -46.34, YL, ZM + 0.35, 1.05, 'marble', 2.2, 0.28)

exedra(F)
portico(F)
lower_statues(F)
south_stairs(F)
gate_and_paths(F)

# temple: podium, front stair, columns; the Sun's quadriga replaces the front acroterion on the apex
TW, TL = 24.0, 40.0
T = podium_temple(F, 0.0, TEMPLE_Y, W=TW, L=TL, pod_h=5.0, col_h=14.0, nf=6, kind='pseudo', porch=3,
                  order='corinthian', front='-Y', stair='front', flutes=12, door_mat='giallo', acroteria=None, seg=10)
rc = 14.0 / 20.0; m = rc * 1.6 + 0.35; ed = rc * 2.9
Le = (TL - 2 * m) + ed                      # roof length, front pediment to back pediment
We = 2 * (TW / 2 - m) + ed                  # roof width
apex_y = TEMPLE_Y - Le / 2                  # front pediment apex (y)
ridge, eave = T['ridge'], T['eave']
statue(F, 0.0, TEMPLE_Y + Le / 2 + 0.25, ridge - 0.25, 3.0, 'marble', pedestal=0.5, ped_mat='marble')   # back apex
for sd in (-1, 1):
    statue(F, sd * (We / 2 - 0.4), apex_y - 0.25, eave, 2.4, 'marble', pedestal=0.4, ped_mat='marble')
box(F, 0.0, apex_y + 1.7, ridge - 1.0, 3.0, 3.0, 1.0, 'marble')          # plinth on the apex
quadriga(F, 0.0, apex_y + 1.7, ridge - 0.9, s=1.5, mat='gold', front='-Y')

# altar on the axis with four bronze oxen, checkered plaza, torch columns, bronze lattice rail
altar(F, ALTAR[0], ALTAR[1], 0.03, 6.0, 4.0, 2.2, fire=True)
for sx, sy in ((1, 1), (-1, 1), (-1, -1), (1, -1)):
    ox(F, ALTAR[0] + sx * 4.9, ALTAR[1] + sy * 3.3, 0.03, math.degrees(math.atan2(sy, sx)))
checker_paving(F, -32.0, -40.0, 32.0, -8.0, 0.03, tile=1.5)
for x in (-24.0, -16.0, 16.0, 24.0):
    torch_column(F, x, -9.5, 0.03)
    torch_column(F, x, -41.5, 0.0)
lattice_rail(F, -32.0, -40.0, -3.0, -40.0, 0.03, 1.05)
lattice_rail(F, 3.0, -40.0, 32.0, -40.0, 0.03, 1.05)

# two libraries flank the back of the temple, each with a tetrastyle porch facing south into the court
for sx in (-1, 1):
    cx, cy = sx * 26.5, 33.5                    # the north corners of the court, beside the back of the temple
    rect_building(F, cx, cy, 20.0, 18.0, floors=2, floor_h=5.5, ground_h=5.5, wall_mat='plaster', base_mat='stone',
                  doors=[('S', 0.0)], roof='hip', foundation=0.0)
    dp = 9.0 * 0.35
    pediment_front(F, cx, cy - 9.0 - 0.9 * dp, 0.0, 9.0, 4, 7.0, depth=dp, order='corinthian', mat='marble',
                   tymp_mat='plaster', steps=3, rot=0.0, roof_mat='tile')

propylon(F)
preview_ground(-20.0)
import bpy
try:
    bpy.context.scene.eevee.taa_render_samples = 16          # low samples for the previews
except Exception:
    pass
finish('rome_apollo', front='-Y')
