"""Kit test: every Rome helper once (not an asset). Run: Blender -b --factory-startup -P tools/models/rome/_kit_demo.py"""
import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *

reset()
F = Frame()
# hill: rock + buttressed terrace wall + terrace floor at z = 8
T = [(-40, -30), (40, -30), (40, 30), (-40, 30)]
rock_mass(F, [(-46, -36), (46, -36), (48, 36), (-48, 36)], -2, 3, seed=3)
retaining_wall(F, T, 8.0, -1.0, closed=True, buttress='round', every=10.0)
terrace_floor(F, T, 8.0)
podium_temple(F, -12, 8, W=18, L=30, pod_h=4.0, col_h=11, nf=6, kind='prostyle', porch=2, front='-Y', flutes=8)
F8 = Frame(0, 0, 8.0)
podium_temple(F8, 22, 10, W=16, L=26, pod_h=3.2, col_h=9, nf=6, kind='peripteral', front='-Y', stair='sides')
checker_paving(F8, -30, -28, 10, -12, 0.02, holes=[(-10, -20, 3.0)])
round_mosaic(F8, -10, -20, 0.02, 3.0)
altar(F8, -10, -15, 0.02, 3.6, 2.4, 1.6, fire=True)
for x in (-26, -18, -2, 6):
    torch_column(F8, x, -26.5, 0.02)
lattice_rail(F8, -30, -29.5, 10, -29.5, 0.02)
obelisk(F8, 28, -22, 0.0, 14)
quadriga(F8, 14, -22, 0.0, 1.0)
eagle(F8, 32, -14, 0.0, 1.5, broken=True)
tholos_temple(F8, 30, 22, R=6, pod_h=2.4, n=18, col_h=7.5)
# substructure on the east face of a second terrace
substructure(F, 60, -20, 60, 20, -1.0, storeys=2, h=6.0)
# a small insula: shops, balcony with laundry, timber-framed top floors
box(F, -70, 0, 0, 12, 10, 14, 'plaster2')
taberna_front(F, -76, -5, -64, -5, 0, 3, 3.8, 'plaster2')
balcony(F, -76, -5, -64, -5, 6.2, laundry=True)
timber_skin(F, -76, -5, -64, -5, 9.0, 5.0, floors=2)
hip_roof(F, -70, 0, 14, 12, 10)
pergola(F, -78, 8, -62, 14, 0)
stair_flight(F, 44, -36, 44, -12, -1.0, 8.0, 3.0)
human(F, -10, -36, 8.0)
finish('_kit_demo', front='-Y', export=False)
