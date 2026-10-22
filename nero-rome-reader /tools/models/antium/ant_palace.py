"""ant_palace · upper palace (行宫主殿) of Nero at Antium. Front = +X (east temple-front portico).

Quadrangle 84 x 62 m on a stone podium (1.5 m all round, foundation to z = -8). Ground floor 5.2 m, upper 4.4 m.
Central peristyle court 58 x 36 m with the bronze altar exactly at the centre.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_kit import *

reset()

GF, UF = 5.2, 4.4          # ground and upper floor heights
EAVE = GF + UF             # 9.6, eaves of the ranges

# ---------------------------------------------------------------- podium and foundations
box(None, 0, 0, -8.0, 87.0, 65.0, 8.0, 'stone')          # 1.5 m podium all round, top at z = 0

# ---------------------------------------------------------------- outer ranges (13 m deep)
# north range (faces the side-hall rock; the terrace door), south range (side door)
rect_building(None, 0, 24.5, 84, 13, floors=2, floor_h=UF, ground_h=GF, doors=[('N', 0.0)],
              roof='hip', foundation=0, quoins=True)
rect_building(None, 0, -24.5, 84, 13, floors=2, floor_h=UF, ground_h=GF, doors=[('S', -24.0)],
              roof='hip', foundation=0, quoins=True)
# east range between them (inner faces at y = +-18); carries the portico on its east face
rect_building(None, 35.5, 0, 13, 36.7, floors=2, floor_h=UF, ground_h=GF, skip_sides=('N', 'S'),
              roof='hip', foundation=0, quoins=False)
# west range body: solid back wall of the sea loggia, court windows on its inner face
rect_building(None, -33.5, 0, 9, 36.7, floors=2, floor_h=UF, ground_h=GF, skip_sides=('N', 'S', 'W'),
              roof=None, foundation=0, quoins=False)
# one roof over the whole west range, so the loggia sits under its outer slope
hip_roof(None, -35.5, 0, EAVE, 13, 36.7, pitch=22.0, overhang=0.6)

# ---------------------------------------------------------------- four corner towers
for sx in (-1, 1):
    for sy in (-1, 1):
        square_tower(None, sx * 37.0, sy * 26.0, 11, 16, wall_mat='plaster', roof='pyramid', pitch=30.0,
                     battered=False, foundation=0.0, cornice_mat='marble', band_mat='red')

# ---------------------------------------------------------------- central peristyle court (58 x 36 m)
box(None, 0, 0, 0, 58, 36, 0.15, 'paving')
CH = 5.0                                       # Ionic columns, 5 m
X0, X1, Y0, Y1 = -25.8, 25.8, -14.8, 14.8      # column lines, 3.2 m inside the range faces
for (a, b, nn) in (((X0, Y0), (X1, Y0), 18), ((X1, Y0), (X1, Y1), 10),
                   ((X1, Y1), (X0, Y1), 18), ((X0, Y1), (X0, Y0), 10)):
    colonnade(None, a[0], a[1], b[0], b[1], 0.15, nn, CH, CH / 16, 'marble', 'ionic')
ZP = 0.15 + CH + CH * 0.2                      # top of the peristyle entablature (6.15)
for (p0, p1) in (((29, -18), (-29, -18)), ((29, 18), (29, -18)), ((-29, 18), (29, 18)), ((-29, -18), (-29, 18))):
    lean_roof(None, p0[0], p0[1], p1[0], p1[1], ZP + 1.0, 3.2, 1.0)   # lean-to roofs, sloping into the court
# garden: four lawn quarters in a cross of 3 m gravel paths meeting at the altar, low hedges round each quarter,
# two water pools on the east-west axis (the E-W path ends at their rims); the walks stay paving (court floor)
GZ = 0.27                                                  # garden surface; walks are at 0.15
for (qx, qy) in ((12.15, 6.65), (-12.15, 6.65), (12.15, -6.65), (-12.15, -6.65)):
    box(None, qx, qy, 0.15, 21.3, 10.3, 0.12, 'grass')
box(None, 0, 0, 0.15, 14.9, 3.0, 0.12, 'gravel')           # E-W path through the altar
for sx in (-1, 1):
    box(None, sx * 20.575, 0, 0.15, 4.45, 3.0, 0.12, 'gravel')      # E-W path beyond the pools
    box(None, 0, sx * 6.65, 0.15, 3.0, 10.3, 0.12, 'gravel')        # N-S path, north and south of the altar
for sx in (-1, 1):                                         # pools, centred at x = +-12.9 (halfway to the colonnades)
    px = sx * 12.9
    box(None, px, 0, 0.15, 10.0, 4.0, 0.15, 'water')       # water surface at z = 0.30
    box(None, px, 2.225, GZ, 10.9, 0.45, 0.35, 'marble')   # marble rims
    box(None, px, -2.225, GZ, 10.9, 0.45, 0.35, 'marble')
    box(None, px + 5.225, 0, GZ, 0.45, 4.0, 0.35, 'marble')
    box(None, px - 5.225, 0, GZ, 0.45, 4.0, 0.35, 'marble')
    statue(None, px, 0, 0.30, 1.6, 'bronze', 0.9)          # small bronze statue on a pedestal in each pool
HZ, HH, HT = GZ, 0.55, 0.45                                # low hedges
hedge(None, 22.8, -11.8, 22.8, -1.725, HZ, HH, HT)         # outer boundary, open at the path entrances
hedge(None, 22.8, 1.725, 22.8, 11.8, HZ, HH, HT)
hedge(None, -22.8, -11.8, -22.8, -1.725, HZ, HH, HT)
hedge(None, -22.8, 1.725, -22.8, 11.8, HZ, HH, HT)
hedge(None, -22.8, 11.8, -1.725, 11.8, HZ, HH, HT)
hedge(None, 1.725, 11.8, 22.8, 11.8, HZ, HH, HT)
hedge(None, -22.8, -11.8, -1.725, -11.8, HZ, HH, HT)
hedge(None, 1.725, -11.8, 22.8, -11.8, HZ, HH, HT)
for sx in (-1, 1):                                         # quarter edges along the paths
    for sy in (-1, 1):
        hedge(None, sx * 1.725, sy * 1.725, sx * 1.725, sy * 11.8, HZ, HH, HT)    # N-S path edges
        hedge(None, sx * 1.725, sy * 1.725, sx * 7.0, sy * 1.725, HZ, HH, HT)     # E-W path edges, by the altar
        hedge(None, sx * 18.8, sy * 1.725, sx * 22.8, sy * 1.725, HZ, HH, HT)     # E-W path edges, outer
for sx in (-1, 1):                                         # marble statues at the inner corners of the quarters
    for sy in (-1, 1):
        statue(None, sx * 4.0, sy * 4.0, GZ, 1.8, 'marble', 1.0)

# bronze altar, exactly central: 3-step marble base 4 x 4 m, bronze block, two copper spheres on thin posts
box(None, 0, 0, GZ, 4.0, 4.0, 0.2, 'marble')
box(None, 0, 0, GZ + 0.2, 3.2, 3.2, 0.2, 'marble')
box(None, 0, 0, GZ + 0.4, 2.4, 2.4, 0.2, 'marble')
box(None, 0, 0, GZ + 0.6, 1.6, 1.2, 1.1, 'bronze')
for sx in (-1, 1):
    cyl(None, sx * 1.1, 0, GZ + 0.6, 0.05, 1.3, 'bronze', 8)
    sphere(None, sx * 1.1, 0, GZ + 0.6 + 1.3 + 0.2, 0.2, 'copper', 12, 8)

# ---------------------------------------------------------------- east: temple-front portico
PLAT = 1.08                                    # portico floor = 6 steps x 0.18
box(None, 45.5, 0, -8.0, 7.0, 19.0, PLAT + 8.0, 'stone')            # stylobate x 42..49, y +-9.5
stairs(None, 51.4, 0, 0, 19.0, 6, rise=0.18, run=0.40, rot=180, mat='marble', cheeks=False)   # 6 steps, east
box(None, 43.75, 0, PLAT, 3.5, 15.8, 9.6, 'plaster')                # cella, x 42..45.5, top 10.68
box(None, 45.52, 0, PLAT, 0.04, 2.4, 4.22, 'dark')                  # entrance door (dark, not see-through)
for i in range(6):                                                  # 6 Corinthian columns, 8 m
    column(None, 47.2, -7.5 + 3.0 * i, PLAT, 8.0, mat='marble', order='corinthian')
entablature(None, 47.2, -8.3, 47.2, 8.3, PLAT + 8.0, 1.6, 1.2, 'marble')
gable_roof(None, 44.6, 0, PLAT + 8.0 + 1.6, 5.2, 16.8, pitch=15.0, axis='x', overhang=0.4, mat='tile',
           tiles=True, rib_mat='tile2', gable_mat='marble', pediment=True, tymp_mat='plaster')

# ---------------------------------------------------------------- north terrace (40 x 8 m, ground level)
box(None, 0, 35.0, -8.0, 40.0, 8.0, 8.0, 'tuff')
box(None, 0, 35.0, 0.0, 40.0, 8.0, 0.12, 'paving')
balustrade(None, -20.0, 38.7, 20.0, 38.7, 0.12, 1.0, 'marble', 1.8, 0.28)
balustrade(None, 19.7, 31.5, 19.7, 38.7, 0.12, 1.0, 'marble', 1.8, 0.28)
balustrade(None, -19.7, 38.7, -19.7, 31.5, 0.12, 1.0, 'marble', 1.8, 0.28)

# ---------------------------------------------------------------- west: sea loggia
# ground floor: arcade through a 1.0 m wall on the outer line x = -41.5 (outer face at -42)
arcade(None, -41.5, 18.0, -41.5, -18.0, 0.0, GF, 1.0, 8, mat='stone', open_w=2.8, open_h=4.6)
band(None, -41.5, 18.0, -41.5, -18.0, 4.9, 0.3, 0.9, 'red')          # floor band
box(None, -39.8, 0, 0.0, 4.4, 36.0, 0.15, 'paving')                  # ground loggia floor
box(None, -39.3, 0, 5.0, 3.7, 36.0, 0.2, 'paving')                   # upper loggia floor (top at 5.2)
# upper floor: marble balustrade on the arcade top, colonnade behind it, entablature to 9.64
balustrade(None, -41.5, 18.0, -41.5, -18.0, GF, 1.0, 'marble', 1.8, 0.28)
colonnade(None, -40.8, 16.8, -40.8, -16.8, GF, 11, 3.7, mat='marble', order='ionic', ent_h=0.74, ent_depth=0.6)


def bronze_window(xw, yc, zb, w, h):
    """Bedchamber window on a wall face at x = xw (outside is -x): dark pane in a bronze frame."""
    box(None, xw - 0.03, yc, zb, 0.06, w, h, 'dark')
    box(None, xw - 0.09, yc, zb - 0.16, 0.18, w + 0.36, 0.16, 'bronze')
    box(None, xw - 0.09, yc, zb + h, 0.18, w + 0.36, 0.16, 'bronze')
    for s in (-1, 1):
        box(None, xw - 0.09, yc + s * (w / 2 + 0.1), zb, 0.18, 0.2, h, 'bronze')


# bedchamber (寝殿): two larger windows in the upper floor of the back wall, behind the colonnade
for yc in (-5.2, 5.2):
    bronze_window(-37.65, yc, 6.0, 2.2, 2.6)

# ---------------------------------------------------------------- scale figure and export
human(None, 56.0, -6.0)
finish('ant_palace', front='+X', extra_cams=[('west', Vector((-1, 0, 0)), 8)])
