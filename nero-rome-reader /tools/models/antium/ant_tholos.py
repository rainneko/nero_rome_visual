"""ant_tholos - round shrine (tholos) by the summit of the Antium headland (Nero's villa, AD 54-68).

Brief: briefs/antium/tower.md. Round marble podium R 8.5 m, 1.6 m high, on a tuff foundation down to z = -6, with an
eight-step flight 3 m wide on the east side. Sixteen Corinthian columns, 7.5 m tall, on a ring R 7.2 m with a segmented
entablature. Round cella wall R 5.4 m (plaster with a red dado) with a bronze double door facing east. Conical tiled
roof, rise 3.5 m, tile ribs and a bronze finial. Front = +X.
The column ring is turned by half a bay (11.25 deg) so that the east intercolumniation is open and the door shows.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_kit import *

reset()

PODIUM_R = 8.5         # podium radius
PODIUM_H = 1.6         # podium height (column bases stand on its top)
COL_R = 7.2            # column ring radius
COL_H = 7.5            # column height, base to capital
ENT_H = 1.0            # ring entablature height
CELLA_R = 5.4          # cella wall outer radius
CELLA_IN = 5.0         # cella wall inner radius
DOOR_HALF = 1.0        # door 2.0 m wide
DOOR_H = 3.0           # door 3.0 m high, measured from the podium top
CELLA_TOP = PODIUM_H + COL_H + ENT_H      # 10.1 m: top of the entablature and of the cella wall


def sector_ring(mat, ro, ri, z0, z1, a0, a1, seg=36):
    """Curved wall sector (an annulus between radii ri and ro) from angle a0 to a1 in degrees, z0 to z1, closed on all faces."""
    n = max(2, int(round(seg * (a1 - a0) / 360.0)) + 1)
    angs = [math.radians(a0 + (a1 - a0) * i / (n - 1)) for i in range(n)]

    def p(r, a, z):
        return (r * math.cos(a), r * math.sin(a), z)

    for i in range(n - 1):
        a, b = angs[i], angs[i + 1]
        add_poly(mat, [p(ro, a, z0), p(ro, b, z0), p(ro, b, z1), p(ro, a, z1)])      # outer face
        add_poly(mat, [p(ri, b, z0), p(ri, a, z0), p(ri, a, z1), p(ri, b, z1)])      # inner face
        add_poly(mat, [p(ri, a, z1), p(ro, a, z1), p(ro, b, z1), p(ri, b, z1)])      # top
        add_poly(mat, [p(ri, a, z0), p(ri, b, z0), p(ro, b, z0), p(ro, a, z0)])      # bottom
    for a in (angs[0], angs[-1]):                                                    # end caps
        add_poly(mat, [p(ri, a, z0), p(ro, a, z0), p(ro, a, z1), p(ri, a, z1)])


# foundation below the podium, down to z = -6
cyl(None, 0, 0, -6.0, PODIUM_R, 6.0, 'tuff', seg=32, smooth=False)

# round podium with marble facing
cyl(None, 0, 0, 0.0, PODIUM_R, PODIUM_H, 'marble', seg=32, smooth=False)

# flight of eight steps on the east side, 3 m wide, rising toward the podium (block tops end at z = 1.6)
stairs(None, 11.2, 0, 0.0, 3.0, 8, rise=0.2, run=0.4, rot=180.0, mat='marble', cheeks=False)

# sixteen Corinthian columns on the ring, turned by half a bay so the east front is open to the door
ring_colonnade(None, 0, 0, PODIUM_H, COL_R, 16, COL_H, order='corinthian', ent_h=ENT_H,
               a0=11.25, a1=371.25, seg=14)

# round cella wall: red dado to 1 m, plaster above, and a door opening facing east (cut between -DA and +DA)
DA = math.degrees(math.asin(DOOR_HALF / CELLA_R))         # half angle of the door opening, about 10.7 deg
sector_ring('red', CELLA_R, CELLA_IN, PODIUM_H, PODIUM_H + 1.0, DA, 360.0 - DA)          # dado
sector_ring('plaster', CELLA_R, CELLA_IN, PODIUM_H + 1.0, CELLA_TOP, DA, 360.0 - DA)     # wall above the dado
sector_ring('plaster', CELLA_R, CELLA_IN, PODIUM_H + DOOR_H, CELLA_TOP, -DA, DA)         # lintel over the door

# bronze double door in the east opening: two leaves, 0.95 m each, set in the wall thickness
for yc in (-0.475, 0.475):
    box(None, 5.2, yc, PODIUM_H, 0.14, 0.95, DOOR_H, 'bronze')

# conical tiled roof on the entablature, rise 3.5 m, tile ribs, bronze finial
cone_roof(None, 0, 0, CELLA_TOP, 8.0, 3.5, mat='tile', seg=28, tiles=True, rib_mat='tile2', finial='bronze')

human(None, 12, -9)                      # 1.8 m scale figure in the previews only
finish('ant_tholos', front='+X')
