"""rome_victoria · the Temple of Victoria (hexastyle, red frieze, gilded Victories) and the shrine of Victoria Virgo
(tetrastyle) on one terrace on the Palatine's south-west slope, AD 56. Front = -Y (south), as in the brief.
Built with the Rome kit (rk.py) on top of bl_kit.py. Run:
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_victoria.py"
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                          # bl_kit + Rome parts; also gives math, os, sys, Vector
import bpy
import bl_kit as bk                       # the module rk loaded (its folder is on sys.path now)

reset()
F = Frame()                               # origin = centre of the terrace; z = 0 = terrace floor

# ---- terrace 40 x 50 m (x -20..20, y -25..25): walls 10 m high on W/S/E, 2 m on N --------------
# Walls in the rock's pale stone ('rock'), D bastions (8 m across; 6 m on the north wall), 0.6-1 m above the wall,
# each with a coping band. The south wall is cut between x -8.4 and 0.4 (a pier either side): the stair head.
WALL = dict(mat='rock', bastion='d', every=15.0, coping=True)
retaining_wall(F, [(-20, 25), (-20, -25), (-8.4, -25)], 0.0, z_bot=-10.0, b_size=8.0, b_rise=1.0, **WALL)  # W + SW
retaining_wall(F, [(0.4, -25), (20, -25), (20, 25)], 0.0, z_bot=-10.0, b_size=8.0, b_rise=1.0, **WALL)     # SE + E
retaining_wall(F, [(20, 25), (-20, 25)], 0.0, z_bot=-2.0, b_size=6.0, b_rise=0.6, **WALL)                  # north
terrace_floor(F, [(-20, -25), (20, -25), (20, 25), (-20, 25)], 0.0, mat='paving')

# ---- hill base: ledge rock (rock_mass) that the walls stand in, and rock chunks at the wall foot ---------------
# South-west foot: the west wall, the south wall west of the stair and the south wall east of it (x -8.2 .. 0.8 stays
# clear for the stair). Tops about z -8 (between -9 and -7): the lowest walls stand 2 m into the rock.
RS = dict(z0=-14.0, z1=-8.0, strata=3, step=3.5, jitter=1.8, band=2.5, dip=3.0)
top_w = rock_mass(F, [(-30, -27), (-16, -27), (-16, 27), (-30, 27)], seed=11, **RS)
# no loose boulders on the two south outcrops: the stair runs between them (their boulders could hit the cheeks)
top_sw = rock_mass(F, [(-23, -34), (-8.2, -34), (-8.2, -21), (-23, -21)], seed=12, boulders=0, **RS)
top_se = rock_mass(F, [(0.8, -34), (22, -34), (22, -21), (0.8, -21)], seed=13, boulders=0, **RS)
foot_rocks(F, [(-20, 25), (-20, -25)], (-9, -7), seed=31, blocks=6, top_z=top_w)
foot_rocks(F, [(-20, -25), (-12, -25)], (-9, -7), seed=32, blocks=3, top_z=top_sw)
foot_rocks(F, [(4, -25), (20, -25)], (-9, -7), seed=33, blocks=5, top_z=top_se)
# North: two ledge tiers stepping down from the north wall foot (tops about -1.2 and -6, ground -10)
top_n1 = rock_mass(F, [(-32, 18), (32, 18), (32, 34), (-32, 34)], z0=-10.0, z1=-1.2, seed=21, strata=4, step=3.5,
                   jitter=1.8, band=2.5, dip=2.0)
top_n2 = rock_mass(F, [(-30, 30), (30, 30), (30, 44), (-30, 44)], z0=-10.0, z1=-6.0, seed=22, strata=2, step=3.5,
                   jitter=1.8, band=2.0, dip=3.0)
foot_rocks(F, [(20, 25), (-20, 25)], (-2, -1), seed=34, blocks=6, top_z=top_n1)


def _low(top, x0, y0, x1, y1, n=60):
    """Lowest rock top along the segment (x0, y0) -> (x1, y1): a wall foot must stay inside the rock above its bottom."""
    return min(top(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n) for i in range(n + 1))


print('ROCKCHK west %.2f  sw %.2f  se %.2f  north %.2f  north_bastions %.2f' % (
    _low(top_w, -20, 25, -20, -25), _low(top_sw, -20, -25, -8.4, -25), _low(top_se, 0.4, -25, 20, -25),
    _low(top_n1, 20, 25, -20, 25), _low(top_n1, 20, 27, -20, 27)))

# ---- the two temples ----------------------------------------------------------------------------
podium_temple(F, -4, 6, W=16, L=28, pod_h=4, col_h=10, nf=6, kind='prostyle', porch=2, order='corinthian',
              front='-Y', stair='front', frieze_mat='red', acroteria='gold')
podium_temple(F, 13, -6, W=7, L=11, pod_h=1.8, col_h=5.5, nf=4, kind='prostyle', porch=1, front='-Y',
              acroteria='gold')

# ---- monumental stair from the road (z -10) up the axis of the big temple to the terrace (z 0) -----
stair_flight(F, -4, -38, -4, -25, -10, 0, width=6.0, mat='stone', cheek_mat='rock')
statue(F, -8.4, -25, 0.35, 3.2, 'marble', pedestal=1.0)      # frame the stair head: statues on the piers
statue(F, 0.4, -25, 0.35, 3.2, 'marble', pedestal=1.0)

# ---- altar on the axis, between the stair head and the foot of the temple stair -------------------
altar(F, -4, -20, 0, w=4.0, d=3.0, h=1.7, mat='marble', steps=2)

# ---- six statues on pedestals, standing on the coping just inside the south parapet ---------------
for x in (-15.5, -11.0, 3.0, 7.5, 12.0, 16.5):
    statue(F, x, -23.3, 0.35, 2.4, 'marble', pedestal=1.0)

human(F, 3.0, -35.0, -10.0)                  # 1.8 m scale figure, previews only (not exported)
preview_ground(-10)


def close_up(fname, target, direction, elev, dist):
    """Re-aim the camera the kit set up and render a closer view to renders/rome_victoria/<fname>.png."""
    sc = bpy.context.scene; cam = sc.camera
    d = Vector(direction).normalized(); e = math.radians(elev)
    dv = Vector((d.x * math.cos(e), d.y * math.cos(e), math.sin(e))).normalized()
    tgt = Vector(target)
    cam.data.type = 'PERSP'; cam.data.lens = 35
    cam.location = tgt + dv * dist
    bk._look(cam, tgt)
    out = os.path.join(bk.ROOT, 'renders', 'rome_victoria'); os.makedirs(out, exist_ok=True)
    sc.render.filepath = os.path.join(out, fname + '.png')
    bpy.ops.render.render(write_still=True)


info = finish('rome_victoria', front='-Y', extra_cams=[('sw', Vector((-1, -1, 0)), 14)])
close_up('close_stair', (-4, -27, -3), (-0.5, -1, 0), 16, 26)
close_up('close_sw', (-19, -24, -6), (-1, -1, 0), 12, 30)
