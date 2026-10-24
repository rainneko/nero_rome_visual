"""Temple of Vesta (rome_vesta), AD 56: round Augustan temple at the east end of the Forum.
Origin = centre; z = 0 = ground; the stair faces +X (east). Built with rk.tholos_temple plus a bronze lattice rail
and a paving disc."""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *

reset()
F = Frame()

# the round temple: podium, 20 Corinthian columns, round cella with bronze door, bronze cone roof, stair to the east
R, POD, COL = 7.5, 3.0, 9.0
tholos_temple(F, 0, 0, R=R, pod_h=POD, n=20, col_h=COL, front='+X', roof='cone', roof_mat='bronze')
# top of the kit's bronze smoke-vent stack (same numbers as tholos_temple uses)
_r = COL / 20.0; _Rc = R - _r * 1.6 - 0.3; _rh = _Rc * 0.55; _ze = POD + COL + COL * 0.22
vent_top = _ze + _rh * 1.08
# smoke opening: a dark disc on the vent cap, the gilt finial sits in it
cyl(F, 0, 0, vent_top + 0.005, 0.85, 0.02, 'dark', 16)

# low enclosure: 12-sided bronze lattice rail on radius 11 m; the side facing the stair (+X) is left open
RR = 11.0
P = [(RR * math.cos(math.radians(15 + 30 * k)), RR * math.sin(math.radians(15 + 30 * k))) for k in range(12)]
for k in range(12):
    if k == 11:                    # the side from 345 to 15 degrees, centred on +X: the gap at the stair
        continue
    (x0, y0), (x1, y1) = P[k], P[(k + 1) % 12]
    lattice_rail(F, x0, y0, x1, y1, 0.0, 1.05, 'bronze', 'marble', 3.0, 0.9)

# paving disc (radius 11.5, 0.15 thick), top at ground level, and a paved apron under the stair foot
cyl(F, 0, 0, -0.15, 11.5, 0.15, 'paving', 48)
box(F, 11.2, 0.0, -0.15, 1.6, 3.6, 0.15, 'paving')

human(F, 12.8, 6.0, 0.0)           # 1.8 m scale figure, previews only
finish('rome_vesta', front='+X')
