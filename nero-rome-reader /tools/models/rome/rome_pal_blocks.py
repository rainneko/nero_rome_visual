"""rome_pal_block_a..d · crowded split-level court offices of the Palatine saddle, AD 56.

Four blocks, one script. Each block calls reset(), builds, then finish(). Origin = plot centre, front = -Y = the low side.
High part at z 0, low part at z -5 (block C also drops to z -10 on its garden side).
Run all four:  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_pal_blocks.py"
Run one:       ... -P "tools/models/rome/rome_pal_blocks.py" -- a      (a | b | c | d)
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
import bpy

NB = 8.8          # eave of the two-storey high ranges (ground 4.62 + floor 4.2)
GROUND = -10.0    # everything rests on this level (preview ground)


def samples(n=16):
    try:
        bpy.context.scene.eevee.taa_render_samples = n
    except Exception:
        pass


def wins(L, n, zbs, w=1.1, hh=1.9, skip=(), kind='rect'):
    """Window openings along a wall of length L: n per storey at each zb, skipping centres in `skip`."""
    ops = []
    for zb in zbs:
        for k in range(n):
            u = (k + 0.5) * L / n
            if any(abs(u - s) < 1.6 for s in skip):
                continue
            ops.append((u, zb, w, hh, kind))
    return ops


def facade(F, x0, y0, x1, y1, z0, h, mat, ops, t=3.0, depth=0.35):
    """A solid core (thickness t, inside the line) with a windowed skin on the OUTSIDE (right of p0 -> p1)."""
    dx, dy = x1 - x0, y1 - y0; L = math.hypot(dx, dy); ang = math.atan2(dy, dx) / D2R
    nx, ny = -dy / L, dx / L                       # inward normal (left of p0 -> p1)
    cx = (x0 + x1) / 2 + nx * t / 2; cy = (y0 + y1) / 2 + ny * t / 2
    box(F, cx, cy, z0, L, t, h, mat, ang)
    opening_skin(F, x0, y0, x1, y1, z0, h, ops, mat, depth=depth)


def court_portico(F, x0, y0, x1, y1, z, h=3.6, mat='stone', order='doric'):
    """Colonnade round a rectangular court (inset 0.8 m from its walls) with an entablature, on z."""
    xa, xb, ya, yb = x0 + 0.8, x1 - 0.8, y0 + 0.8, y1 - 0.8
    nx = max(2, int((xb - xa) / 3.2) + 1); ny = max(2, int((yb - ya) / 3.2) + 1)
    for (a, b, n) in (((xa, ya), (xb, ya), nx), ((xb, ya), (xb, yb), ny), ((xb, yb), (xa, yb), nx), ((xa, yb), (xa, ya), ny)):
        for i in range(n):
            t = i / (n - 1)
            column(F, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, z, h, 0.24, mat, order, 0, 10)
        entablature(F, a[0], a[1], b[0], b[1], z + h, 0.5, 0.5, mat)


def well_head(F, x, y, z0, r=0.9, mat='travertine'):
    """A round well head with a low curb and two bronze uprights and a bar."""
    lathe(F, x, y, [(r, z0), (r, z0 + 0.9), (r - 0.2, z0 + 0.9), (r - 0.2, z0 + 0.2)], mat, 16, smooth=False)
    cyl(F, x, y, z0 + 0.2, r - 0.25, 0.1, 'water', 14)
    for sd in (-1, 1):
        beam(F, x + sd * (r - 0.1), y, z0 + 0.9, x + sd * (r - 0.1), y, z0 + 2.6, 0.12, 0.12, 'wood')
    beam(F, x - r, y, z0 + 2.6, x + r, y, z0 + 2.6, 0.14, 0.14, 'wood')


def block_a():
    """Secretariat court, 36 x 30 m. High part y 0..15 (z 0): a two-storey range round a portico court 10 x 8.
    Low part y -15..-3 (z -5): a three-storey front range, arcade of 7 bays on the street, top floor level with the court.
    Lane y -3..0 at z -5 along the foot of the high part's retaining wall. External stair up the west gap to a landing
    at z 0 and an arched gate in the high south wall."""
    reset(); preview_ground(GROUND); samples(16)
    F = Frame()
    PL, PL2, RED = 'plaster2', 'plaster3', 'red'

    # ---- foundations and retaining wall (buttressed, between the levels) ----
    box(F, 0, 7.5, GROUND, 36, 15, -GROUND, 'tuff')                             # core under the high part (top at z 0)
    box(F, 3, -9, GROUND, 30, 12, -GROUND - 4.8, 'tuff')                        # core under the low range
    retaining_wall(F, [(-12, 0), (18, 0)], 0.0, GROUND, t=2.2, buttress='round', every=9.0, parapet=None, courses=2.5,
                   coping=True)
    retaining_wall(F, [(-18, 0), (-12, 0)], 0.0, GROUND, t=2.2, buttress='square', every=9.0, parapet=None, courses=2.5,
                   coping=True)
    foot_rocks(F, [(-9, 0), (15, 0)], (GROUND, GROUND + 1.0), seed=3, blocks=8)   # wall feet sit on rock
    box(F, 3, -1.5, -10, 30, 3, 5, 'tuff')                                      # lane fill
    box(F, 3, -1.5, -5.2, 30, 3, 0.2, 'paving')                                 # lane paving at z -5

    # ---- low range: front y = -15, back y = -3, x -12..18, z -5..3.4 ----
    box(F, 3, -8.8, -5, 30, 11.6, 8.4, PL2)                                    # core, front at y -14.6 (arcade stays open)
    arcade(F, -12, -15, 18, -15, -5, 2.6, 0.8, 7, PL2, open_w=3.2, open_h=2.6, back='dark', impost_mat='travertine')
    facade(F, -12, -15, 18, -15, -2.4, 5.8, PL2,
           wins(30, 7, [1.6, 3.6], w=1.1, hh=1.6, skip=()), t=0.4)
    band(F, -12, -15, 18, -15, -2.4, 0.3, 0.4, RED)
    balcony(F, -10, -15, 16, -15, 0.0, depth=1.1, mat='wood', roof=True)       # top-floor balcony, floor at z 0
    hip_roof(F, 3, -9.0, 3.4, 30.6, 12.0, 20, 0.7)                             # low range roof

    # ---- high part: ring round the court x -5..5, y 4..12; z 0..NB ----
    # south strip (outer line y = 0, outside to -y, faces the lane)
    facade(F, -18, 0, 18, 0, 0, NB, PL,
           wins(36, 9, [1.2, 5.4], w=1.1, hh=1.9, skip=(-15.0 + 18,)) +
           [(3.0, 0.0, 3.0, 4.0, 'arch')], t=4.0)                             # arched gate, west end
    band(F, -18, 0, 18, 0, 4.2, 0.3, 0.4, RED)
    # north strip (outer line y = 15, outside to +y)
    facade(F, 18, 15, -18, 15, 0, NB, PL, wins(36, 9, [1.2, 5.4], skip=()), t=3.0)
    band(F, 18, 15, -18, 15, 4.2, 0.3, 0.4, RED)
    # west and east blocks (outer lines x = -18 / x = 18, between y 12 and 4)
    facade(F, -18, 12, -18, 4, 0, NB, PL2, wins(8, 2, [1.2, 5.4], skip=()), t=13.0)
    facade(F, 18, 4, 18, 12, 0, NB, PL2, wins(8, 2, [1.2, 5.4], skip=()), t=13.0)
    # court floor (paving), well head, portico
    box(F, 0, 8, 0.0, 10, 8, 0.15, 'paving')
    court_portico(F, -5, 4, 5, 12, 0.0, 3.6, 'stone', 'doric')
    well_head(F, 0, 8, 0.0)
    lean_roof(F, 5, 4, -5, 4, 3.8, 1.2, 0.5)                                    # portico walk, south side
    lean_roof(F, -5, 12, 5, 12, 3.8, 1.2, 0.5)                                  # portico walk, north side
    # balconies on the upper floor overlooking the court
    balcony(F, 5, 4, -5, 4, 4.2, depth=1.0, mat='wood', roof=False)
    balcony(F, -5, 12, 5, 12, 4.2, depth=1.0, mat='wood', roof=False)
    # roofs: strips and wings (court kept open to the sky)
    gable_roof(F, 0, 2.0, NB, 36, 4.4, 22, 'x', 0.6)
    gable_roof(F, 0, 13.5, NB, 36, 3.4, 22, 'x', 0.6)
    hip_roof(F, -11.5, 8, NB, 13, 8, 22, 0.6)
    hip_roof(F, 11.5, 8, NB, 13, 8, 22, 0.6)
    # ---- external stair from the low street (z -5, y -17) up the west gap to the landing at z 0 ----
    box(F, -15, -10.0, GROUND, 6.0, 14.0, 4.5, 'tuff')                          # fill under the stair
    stair_flight(F, -15, -17, -15, -3.0, -5.0, 0.0, width=3.0, mat='stone', cheek_mat='tuff', cheeks=True)
    box(F, -15, -1.5, GROUND, 6.0, 3.0, -GROUND, 'paving')                      # landing at z 0 (solid below)

    human(F, 0, -22, -5)
    finish('rome_pal_block_a', front='-Y')


def block_b():
    """Long portico with shops and offices, 60 x 16 m. Low range y -8..0 (z -5): a two-storey range with a 15-bay
    arcaded portico on the street (y -8), shops behind with wooden shutters, an upper gallery of small columns.
    High side y 0..8 (z 0): five small offices, each with its own lean roof, stepping up along the range.
    Blank end walls so blocks can join end to end."""
    reset(); preview_ground(GROUND); samples(16)
    F = Frame()
    PL2, RED = 'plaster2', 'red'
    # foundations and the retaining wall between the levels
    box(F, 0, -4, GROUND, 60, 8, -GROUND - 5, 'tuff')                         # low range foundation, top z -5
    retaining_wall(F, [(-30, 0), (30, 0)], 0.0, GROUND, t=2.2, buttress='round', every=10.0, parapet=None, courses=2.5,
                   coping=True)
    foot_rocks(F, [(-27, 0), (27, 0)], (GROUND, GROUND + 1.0), seed=4, blocks=10)  # wall feet sit on rock
    # low range core (front at y -7.5 so the portico arcade stays open) and the shop shutters
    box(F, 0, -3.75, -5, 60, 7.5, 8.6, PL2)
    arcade(F, -30, -8, 30, -8, -5, 4.6, 1.0, 15, PL2, open_w=2.6, open_h=3.8, back='dark', impost_mat='travertine')
    for k in range(15):
        u = -30 + (k + 0.5) * 4.0
        box(F, u - 1.0, -7.4, -4.8, 0.16, 0.12, 2.6, 'wood')                 # shutter pair, shop side
        box(F, u + 1.0, -7.4, -4.8, 0.16, 0.12, 2.6, 'wood')
    band(F, -30, -8, 30, -8, -0.5, 0.3, 0.4, RED)                             # floor line over the arcade
    # upper gallery: floor at z -0.4 and small tuscan columns on the outer edge, lean roof above
    box(F, 0, -8.2, -0.6, 60, 1.2, 0.2, 'paving')
    colonnade(F, -29.5, -8.6, 29.5, -8.6, -0.4, 16, 3.0, 0.18, 'marble', 'tuscan', ent=True, ent_h=0.4)
    lean_roof(F, -30, -8.6, 30, -8.6, 3.4, 1.6, 0.5)
    # low range roof over the whole range (hip ends)
    gable_roof(F, 0, -4, 3.6, 60, 8.0, 22, 'x', 0.6)
    # high side: five offices (y 0..8), each with a north facade, a lean roof of its own and a step up
    for k in range(5):
        x0 = -30 + 12 * k; x1 = x0 + 12
        zh = 3.8 + 0.6 * k
        facade(F, x1, 8, x0, 8, 0, zh, PL2, wins(12, 2, [1.2], w=1.0, hh=1.5, skip=()), t=8.0)
        band(F, x1, 8, x0, 8, zh - 0.6, 0.3, 0.4, RED)
        lean_roof(F, x0, 8, x1, 8, zh, 8.0, 1.6)
        if k > 0:                                                              # party wall between offices, capped
            box(F, x0, 4.0, 0.0, 0.7, 8.0, zh + 0.5, 'plaster2')
            box(F, x0, 4.0, zh + 0.5, 0.9, 8.2, 0.14, 'red')
    # blank end walls: the core already closes both ends
    human(F, 0, -14, -5)
    finish('rome_pal_block_b', front='-Y')


def pond_on_lawn(F, cx, cy, z0, w, d, rim=0.4):
    """A raised marble-rimmed fish pond sitting on the lawn (water surface just above it)."""
    box(F, cx, cy + (d + rim) / 2, z0, w + 2 * rim, rim, 0.35, 'marble')
    box(F, cx, cy - (d + rim) / 2, z0, w + 2 * rim, rim, 0.35, 'marble')
    box(F, cx - (w + rim) / 2, cy, z0, rim, d, 0.35, 'marble')
    box(F, cx + (w + rim) / 2, cy, z0, rim, d, 0.35, 'marble')
    box(F, cx, cy, z0 - 0.1, w, d, 0.3, 'water')


def block_c():
    """Guest house and garden, 30 x 30 m. An L of two- and three-storey rooms on the high level (z 0) round a garden
    (lawn, pergola, fish pond, two statues). A three-storey corner tower 7 x 7 with an open loggia on top (NE).
    The garden side (west and south) drops to z -10: a buttressed retaining wall with a balustrade, and a covered
    stair climbing down inside the wall to the lower terrace."""
    reset(); preview_ground(GROUND); samples(16)
    F = Frame()
    # platform and foundation (top z 0)
    box(F, 0, 2.5, GROUND, 30, 25, -GROUND, 'tuff')
    # the L: north range (two storeys) and east range (three storeys), hip roofs
    rect_building(F, 0, 10.5, 30, 9, floors=2, floor_h=4.2, wall_mat='plaster3', base_mat='stone', roof='hip',
                  foundation=0, quoins=True)
    rect_building(F, 10, -2.0, 10, 16, floors=3, floor_h=4.2, wall_mat='plaster2', base_mat='stone', roof='hip',
                  foundation=0, skip_sides=('N',))
    # corner tower NE, three storeys of rooms and an open loggia on top
    square_tower(F, 11.5, 11.5, 7, 17.6, wall_mat='plaster3', roof='pyramid', pitch=30.0, battered=False,
                 foundation=0.0, top_loggia=True)
    # garden: lawn at z -0.1..0, pond, pergola, two statues, planting beds
    box(F, -5, -2, -0.1, 20, 16, 0.1, 'grass')
    pond_on_lawn(F, -3, -3, 0.0, 4.6, 2.6)
    pergola(F, -13, 1.5, -8.0, 5.0, 0.0, h=2.6, mat='wood', vine='hedge')
    statue(F, -12, -6, 0.0, 2.6, 'marble', pedestal=1.0, ped_mat='giallo')
    statue(F, 3, 3, 0.0, 2.6, 'marble', pedestal=1.0, ped_mat='porphyry')
    flower_bed(F, -8, -6, 0.0, 3.0, 4.0)
    flower_bed(F, 1.0, -6.5, 0.0, 3.0, 4.0)
    hedge(F, -15, 6, -15, -10, 0, 0.6, 0.5)
    # drop to the lower terrace: buttressed retaining walls on the west and south (gap for the covered stair)
    retaining_wall(F, [(-15, 6), (-15, -10)], 0.0, GROUND, t=2.2, bastion='d', b_size=6.0, b_rise=0.8, coping=True, every=14.0, parapet='balustrade',
                   courses=2.5)
    retaining_wall(F, [(-15, -10), (-8.3, -10)], 0.0, GROUND, t=2.2, bastion='d', b_size=6.0, b_rise=0.8, coping=True, every=14.0, parapet='balustrade',
                   courses=2.5)
    retaining_wall(F, [(-5.7, -10), (5, -10)], 0.0, GROUND, t=2.2, bastion='d', b_size=6.0, b_rise=0.8, coping=True, every=14.0, parapet='balustrade',
                   courses=2.5)
    # rock at the foot of the drop walls, so they rise from the rock
    foot_rocks(F, [(-15, 4), (-15, -8)], (GROUND - 0.5, GROUND + 0.5), seed=5, blocks=4)
    foot_rocks(F, [(-14, -10), (-9.3, -10)], (GROUND - 0.5, GROUND + 0.5), seed=6, blocks=3)
    foot_rocks(F, [(-4.7, -10), (3.5, -10)], (GROUND - 0.5, GROUND + 0.5), seed=7, blocks=4)
    # lower terrace (z -10) and the covered stair down inside the wall gap
    box(F, -5, -12.5, GROUND, 20, 5, 0.1, 'paving')
    box(F, -8.5, -10.2, -0.0, 0.4, 0.8, 3.2, 'tuff')                            # covering posts
    box(F, -5.5, -10.2, -0.0, 0.4, 0.8, 3.2, 'tuff')
    lean_roof(F, -8.6, -10.0, -5.4, -10.0, 3.2, 1.8, 0.6)                       # covered stair roof
    stair_flight(F, -7.0, -15.0, -7.0, -1.0, -10.0, 0.0, width=2.6, mat='stone', cheek_mat='tuff', cheeks=True)
    human(F, 12, -16, -10)
    finish('rome_pal_block_c', front='-Y')


def block_d():
    """Guard court and archive, 34 x 26 m. A plain, heavy court 14 x 10 (z 0) with stone piers, a well, arms racks and
    benches. Low side (y -13..-3, z -5): a two-storey archive of brick, a vaulted arcade on the street and small high
    slit windows above. A stair ramp with a wall alongside climbs from the low street (z -5) to the landing at z 0."""
    reset(); preview_ground(GROUND); samples(16)
    F = Frame()
    # high part foundation (y -3..13, top z 0) and the low archive foundation (y -13..-3, top z -5)
    box(F, 0, 5, GROUND, 34, 16, -GROUND, 'tuff')
    box(F, -4, -8, GROUND, 22, 10, -GROUND - 5, 'tuff')
    retaining_wall(F, [(-17, -3), (17, -3)], 0.0, GROUND, t=2.2, buttress='square', every=8.0, parapet=None, courses=2.5,
                   coping=True)
    # archive: core y -12..-3, arcade on the street (y -13), slit windows above, hip roof
    box(F, -4, -7.5, -5, 22, 9.0, 8.0, 'brick')
    arcade(F, -15, -13, 7, -13, -5, 3.6, 1.0, 6, 'brick', open_w=2.4, open_h=3.0, back='dark', impost_mat='stone')
    facade(F, -15, -13, 7, -13, -1.4, 4.4, 'brick', [(u, 1.0, 0.35, 1.3, 'rect') for u in range(1, 22, 2)], t=1.0)
    hip_roof(F, -4, -7.5, 3.0, 22, 9.0, 22, 0.6)
    box(F, -4, -14.0, GROUND, 22, 2.4, -GROUND - 5, 'tuff')                     # rock fill under the street foot
    foot_rocks(F, [(-12, -13), (4, -13)], (-5.5, -4.5), seed=8, blocks=3)     # archive street foot on rock
    # court (z 0): paving, stone piers round it, well, arms racks, benches
    box(F, 0, 2, 0.0, 14, 10, 0.15, 'paving')
    for (x, y) in [(-7, -3), (-3.5, -3), (0, -3), (3.5, -3), (7, -3), (-7, 7), (-3.5, 7), (0, 7), (3.5, 7), (7, 7)]:
        box(F, x, y, 0.0, 0.8, 0.8, 4.0, 'stone')
    well_head(F, -4.0, 2.0, 0.15, 0.9, 'stone')
    for x in (3.0, 5.0):
        box(F, x, 0.5, 0.15, 0.4, 3.0, 0.6, 'wood')                             # arms rack uprights
    box(F, 4.0, 0.5, 0.75, 2.2, 0.2, 0.2, 'wood')
    box(F, 4.0, 3.5, 0.15, 3.0, 0.5, 0.45, 'wood')                               # benches
    box(F, -1.0, 4.5, 0.15, 3.0, 0.5, 0.45, 'wood')
    # guard range (north, y 7..13, two storeys) and wings (west x -17..-7, east x 7..17 at y -1..7)
    rect_building(F, 0, 10.0, 34, 6.0, floors=2, floor_h=4.2, wall_mat='brick', base_mat='stone', roof='flat',
                  foundation=0, skip_sides=('S',))
    rect_building(F, -12.0, 2.0, 10.0, 10.0, floors=2, floor_h=4.2, wall_mat='plaster3', base_mat='stone', roof='hip',
                  foundation=0, skip_sides=('E',))
    rect_building(F, 12.0, 3.0, 10.0, 8.0, floors=2, floor_h=4.2, wall_mat='plaster3', base_mat='stone', roof='hip',
                  foundation=0, skip_sides=('W',))
    # stair ramp (x 9..12) from the street (y -14, z -5) up to the landing (y -3..-1, z 0); wall alongside (x 13..15)
    box(F, 10.5, -9.5, GROUND, 3.0, 11.0, 4.5, 'tuff')                            # fill under the ramp
    stair_flight(F, 10.5, -14.0, 10.5, -3.0, -5.0, 0.0, width=3.0, mat='stone', cheek_mat='tuff', cheeks=True)
    box(F, 14.0, -8.5, GROUND, 2.0, 11.0, -GROUND, 'brick')                       # wall alongside the ramp
    box(F, 10.5, -2.0, GROUND, 4.0, 2.0, -GROUND, 'stone')                        # landing at z 0 (solid below)
    human(F, -12, -17, -5)
    finish('rome_pal_block_d', front='-Y')


def main():
    argv = sys.argv
    which = argv[argv.index('--') + 1] if '--' in argv else 'all'
    builders = {'a': block_a, 'b': block_b, 'c': block_c, 'd': block_d}
    for k, fn in builders.items():
        if which in ('all', k):
            fn()


if __name__ == '__main__':
    main()
