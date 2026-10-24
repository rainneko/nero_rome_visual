"""Kit test 2: temple variants side by side."""
import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
reset()
F = Frame()
podium_temple(F, -45, 0, W=16, L=26, pod_h=4.0, col_h=10, nf=6, kind='prostyle', porch=3, front='-Y', flutes=8)
podium_temple(F, -15, 0, W=16, L=30, pod_h=3.0, col_h=10, nf=6, kind='pseudo', porch=3, front='-Y', stair='inset')
podium_temple(F, 15, 0, W=18, L=30, pod_h=5.0, col_h=10, nf=8, kind='peripteral', front='-Y', stair='sides')
podium_temple(F, 45, 0, W=16, L=28, pod_h=3.5, col_h=10, nf=6, kind='sine_postico', front='-Y', frieze_mat='red')
tholos_temple(F, 0, 40, R=7, pod_h=3, n=20, col_h=9)
retaining_wall(F, [(-60, -40), (60, -40)], 0.0, -8.0, buttress='round', every=10.0)
retaining_wall(F, [(-60, -48), (60, -48)], -8.0, -14.0, buttress='square', every=8.0, parapet='lattice')
finish('_kit_demo2', front='-Y', export=False)
