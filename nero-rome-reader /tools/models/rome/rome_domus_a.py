"""rome_domus_a · aristocratic terrace house A, Palatine, AD 56. Front = -Y (the garden side).

Plot x -15..15, y -23..23. Upper part (y -2.4..23, z 0): entrance on the north wall between two Doric half-columns,
an atrium with impluvium and compluvium, a tablinum, a peristyle garden (court 14 x 10, stone Doric columns, hedges,
small round fountain) and a two-storey arcaded loggia on the south edge. Below it the hill steps down to the south in
three levels: garden terrace T1 (z -6) with a fountain statue group, statues, a pergola and a fish pond, and a portico
on its south edge stacked under the loggia; lower terrace T2 (z -12) with statues; the foot of the lowest wall (z -18)
stands on ledge rock. Ledge rock hugs the platform and terrace sides; D bastions on the two lower walls.
Footprint about 34 x 49 m (rock and bastions reach 2-4 m beyond the plot).
rome_domus_b.py imports house() from this file and builds house B.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *

NB = 8.82        # eave height of the two-storey blocks (ground storey 4.62 + floor 4.2)
TOP = -0.15      # top of the platform; the floors are laid on it (z -0.15..0)
GROUND = -24.0   # lowest level of the model: everything rests on it


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


def house(name, wall, belvedere_on):
    """One terrace house. wall: facing material ('plaster2' or 'plaster3'). belvedere_on: tower and roof terrace (B)."""
    reset()
    preview_ground(GROUND)
    F = Frame()

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

    # garden terrace T1 (z -6): fill, lawn, side walls, wall W1 (z -12..-6) with D bastions on its south edge
    box(F, 0, -8.45, GROUND, 30, 12.1, -6.3 - GROUND, 'tuff')                # fill, y -14.5..-2.4
    box(F, 0, -8.45, -6.3, 30, 12.1, 0.3, 'grass')                           # lawn, z -6.3..-6
    retaining_wall(F, [(15, -14.5), (15, -2.4)], -6.0, -13.2, buttress='square', every=9.0, parapet=None, courses=2.0, mat='stone')
    retaining_wall(F, [(-15, -2.4), (-15, -14.5)], -6.0, -13.2, buttress='square', every=9.0, parapet=None, courses=2.0, mat='stone')
    retaining_wall(F, [(-15, -14.5), (15, -14.5)], -6.0, -12.0, bastion='d', b_size=7.5, every=15.0, b_rise=0.8,
                   coping=True, parapet=None, courses=2.0, mat='stone')

    # lower terrace T2 (z -12): fill, planting strip, wall W2 (z -18..-12) with D bastions and a solid parapet
    box(F, 0, -17.5, GROUND, 30, 6.0, -12.3 - GROUND, 'tuff')                # fill, y -20.5..-14.5
    box(F, 0, -17.5, -12.3, 30, 6.0, 0.3, 'grass')                           # planting strip, z -12.3..-12
    retaining_wall(F, [(-15, -20.5), (15, -20.5)], -12.0, -18.0, bastion='d', b_size=7.5, every=15.0, b_rise=0.8,
                   coping=True, parapet='wall', courses=2.0, mat='stone')

    # garden T1: fountain statue group, fish pond, pergola, a row of statues, the portico on W1 (stacked under the loggia)
    fountain(F, 0, -8.0, -6.0)
    pond(F, 7.0, -10.0, -6.0, 4.6, 2.6)
    pergola(F, -13.0, -12.0, -7.5, -4.5, -6.0, h=2.6, mat='wood', vine='hedge')
    for x in (-3.0, 3.0):
        statue(F, x, -4.0, -6.0, 2.4, 'marble', pedestal=1.0, ped_mat='porphyry')
    for i in range(8):
        column(F, -13.5 + 27.0 / 7 * i, -13.4, -6.0, 3.4, 0.22, 'stone', 'doric', 0, 10, cap_mat='gold')
    entablature(F, -13.5, -13.4, 13.5, -13.4, -2.6, 0.5, 0.5, 'stone')
    lean_roof(F, 14.0, -13.4, -14.0, -13.4, -2.1, 2.0, 0.8)                  # lean-to roof over the portico walk
    # garden T2: statues on the planting strip, clear of the bastions of W1 (x 3.75..11.25)
    for x in (-13.0, 13.0):
        statue(F, x, -17.5, -12.0, 2.2, 'marble', pedestal=0.9, ped_mat='giallo')

    # loggia on the south edge: front y -2.0, back y 2.5, two storeys of arches, travertine piers
    bay = 30 / 7.0
    arcade(F, -15, 0.25, 15, 0.25, 0.0, 4.6, 4.5, 7, 'plaster', open_w=bay * 0.62, open_h=3.7, back='dark')
    arcade(F, -15, 0.25, 15, 0.25, 4.6, 4.2, 4.5, 7, 'plaster', open_w=bay * 0.5, open_h=3.3, back='dark')
    for k in range(1, 7):
        x = -15 + k * bay
        box(F, x, 0.25, 0.0, bay * 0.38, 4.6, 4.6, 'travertine')
        box(F, x, 0.25, 4.6, bay * 0.5, 4.6, 4.2, 'travertine')
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

    human(F, 0.0, -32.0, GROUND)                                             # preview scale figure only
    import bpy
    bpy.context.scene.eevee.taa_render_samples = 16                          # low samples for the previews
    finish(name, front='-Y')


if __name__ == '__main__':
    house('rome_domus_a', 'plaster2', belvedere_on=False)
