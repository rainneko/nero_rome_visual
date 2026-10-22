"""Temple of Divus Augustus (rome_divus_augustus), AD 56: Ionic hexastyle temple on a podium in a walled precinct.
Front = -Y (stair, gate and altar face south). Precinct 50 x 64 m, origin = centre, z = 0 = precinct floor."""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *

reset()
F = Frame()                       # origin = precinct centre, z = 0 = precinct floor

# ---- temple: Ionic hexastyle on a 4 m podium at y = +8, front stair to -Y
podium_temple(F, 0, 8, W=24, L=38, pod_h=4, col_h=13, nf=6, kind='prostyle', porch=3, order='ionic',
              front='-Y', stair='front', acroteria='gold', pod_mat='peperino')   # dark rough base, not a bare white block

# garlands: small 'hedge' swags hanging between the front columns under the architrave
col_h = 13.0; r = col_h / 18.0; m = r * 1.6 + 0.35
xS = 12.0 - m                     # outer front columns (x)
yF = 8.0 + (-19.0 + m)            # front column row (y)
s = 2 * xS / 5
gar_z, sag = 16.2, 0.9
for i in range(5):
    xa = -xS + i * s; xb = xa + s
    pts = []
    for k in range(9):
        t = k / 8.0
        pts.append((xa + (xb - xa) * t, yF - 0.75, gar_z - sag * 4 * t * (1 - t)))
    for a, b in zip(pts, pts[1:]):
        beam(F, a[0], a[1], a[2], b[0], b[1], b[2], 0.16, 0.16, 'hedge')
    xm = (xa + xb) / 2
    box(F, xm, yF - 0.8, gar_z - sag - 0.8, 0.12, 0.08, 0.8, 'red')    # tie at the lowest point of the swag

# ---- precinct: walls 50 x 64 m (outer faces), 5 m high, travertine plinth and coping
PX, PY, WT = 24.4, 31.4, 1.2      # wall centre lines and thickness


def prec_wall(p0, p1, h=4.68):
    (x0, y0), (x1, y1) = p0, p1
    L = math.hypot(x1 - x0, y1 - y0); a = math.degrees(math.atan2(y1 - y0, x1 - x0))
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    box(F, cx, cy, -0.5, L, WT, h + 0.5, 'plaster', rot=a)                # body, sunk 0.5 m into the ground
    box(F, cx, cy, -0.5, L, WT + 0.2, 0.7, 'travertine', rot=a)           # low plinth, top 0.2 m above the floor
    box(F, cx, cy, h - 0.02, L, WT + 0.2, 5.0 - h + 0.02, 'travertine', rot=a)     # coping, top at 5 m


prec_wall((PX, PY), (-PX, PY))          # north
prec_wall((-PX, PY), (-PX, -PY))        # west (long side)
prec_wall((-PX, -PY), (-4.5, -PY))      # south, west of the gate
prec_wall((4.5, -PY), (PX, -PY))        # south, east of the gate
prec_wall((PX, -PY), (PX, PY))          # east (long side)

# precinct floor, top at z = 0 (columns, walls and stairs stand on it)
box(F, 0, 0, -0.4, 2 * (PX - WT / 2), 2 * (PY - WT / 2), 0.4, 'paving')

# ---- one-storey Ionic porticoes on the long sides, 5 m deep, lean roofs against the walls
XI, YI = PX - WT / 2, PY - WT / 2  # inner faces of the walls
XC = XI - 5.0                      # column line, 5 m in from the wall
colonnade(F, -XC, -29.8, -XC, 29.8, 0, 14, 4.2, None, 'marble', 'ionic')
colonnade(F, XC, 29.8, XC, -29.8, 0, 14, 4.2, None, 'marble', 'ionic')
lean_roof(F, -XI, -YI, -XI, YI, 6.2, 5.0, 1.1)     # west portico roof (high edge on the wall)
lean_roof(F, XI, YI, XI, -YI, 6.2, 5.0, 1.1)       # east portico roof

# ---- gate in the middle of the south wall: a porch with two columns and a pediment
# (set 3.6 m inside the wall line so its entrance steps stay within the 50 x 64 m outer walls)
pediment_front(F, 0, -PY + 3.6, 0, w=9.0, n=2, col_h=6.0, depth=3.0, order='ionic', mat='marble', tymp_mat='plaster',
               steps=3)

# ---- sacred area in front of the temple: checkered paving, altar on the axis, four statues on pedestals
checker_paving(F, -16.0, -24.2, 16.0, -18.4, z=0.01, tile=1.4)     # tiles 1 cm above the floor slab
altar(F, 0, -21.0, 0.01, w=4.0, d=3.0, h=1.7, mat='marble', steps=2)
for sx in (-1, 1):
    for yy in (-20.0, -23.0):
        statue(F, sx * 9.0, yy, 0.01, h=3.2, mat='marble', pedestal=1.2, ped_mat='marble')

human(F, 29, -28, 0)              # 1.8 m scale figure, previews only

# low sample count keeps the preview renders light on memory
try:
    import bpy
    bpy.context.scene.eevee.taa_render_samples = 16
except Exception:
    pass
finish('rome_divus_augustus', front='-Y')
