"""rome_castellum · aqueduct terminus and distribution tank on the Palatine (AD 56).

Two arcade bays of the aqueduct (x +42 .. +8, brick piers, travertine imposts) carry a covered channel at z 18 into a
round brick castellum (R 6, 20 m, travertine bands and cornice, conical tile roof). An arched outlet on its west face
(sill z 5.4) pours water down a sloping sheet into a sunken stone basin (14 x 8 m, floor 1.5 m below ground, rim at
ground level, water 0.3 m below the rim). Three lead pipes leave the basin westward; a keeper's room (5 x 4 m) stands
against the tower's south side. Front = +X (the aqueduct comes from the east).

Render-only: the preview ground is a plane at z = 0 with the basin left open (so the sunken basin shows in the
renders); the GLB contains the castellum only.
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector
from rk import *
import bl_kit as _bk

Z0 = -0.02            # base of everything that stands on the ground (foundations top out here, under the ground)
R_T = 6.0             # tower radius
H_T = 20.0            # tower height (top of the cornice)
BASIN = (-21.0, -7.0, -4.0, 4.0)   # x0, x1, y0, y1 of the basin (14 x 8 m)
BASIN_FLOOR = -1.5    # floor 1.5 m below ground
WATER_Z = -0.3        # water surface 0.3 m below the rim (rim = ground level)


def add_out(mat, pts, ref, smooth=False):
    """A planar polygon, wound so that its normal points away from the point ref."""
    p = [Vector(q) for q in pts]
    n = (p[1] - p[0]).cross(p[2] - p[0])
    c = sum(p, Vector()) / len(p)
    if n.dot(c - Vector(ref)) < 0:
        p = p[::-1]
    add_poly(mat, [tuple(q) for q in p], smooth)


def tube_x(mat, xa, xb, y, z, r, seg=10):
    """A closed horizontal pipe along x from xa to xb (xa < xb), axis at (y, z)."""
    ref = ((xa + xb) / 2, y, z)
    ring = lambda x: [(x, y + r * math.cos(TAU * j / seg), z + r * math.sin(TAU * j / seg)) for j in range(seg)]
    a, b = ring(xa), ring(xb)
    for j in range(seg):
        k = (j + 1) % seg
        add_out(mat, [a[j], a[k], b[k], b[j]], ref, True)
    add_out(mat, a, ref)
    add_out(mat, b, ref)


def arch_outlet(x_face, x_back, yw, z_sill, z_spring, mat):
    """An arch-topped dark recess plate on the tower's west face: front at x_face (normal -X), closed round its sides
    back to x_back (inside the tower). Half-width yw, sill z_sill, springing z_spring, crown z_spring + yw."""
    outline = [(yw, z_sill), (yw, z_spring)]
    outline += [(yw * math.cos(math.pi * k / 12), z_spring + yw * math.sin(math.pi * k / 12)) for k in range(1, 12)]
    outline += [(-yw, z_spring), (-yw, z_sill)]
    front = [(x_face, y, z) for (y, z) in outline]
    back = [(x_back, y, z) for (y, z) in outline]
    ref = (x_back, 0.0, (z_sill + z_spring) / 2)
    add_out(mat, front, ref)
    n = len(outline)
    for i in range(n):
        j = (i + 1) % n
        add_out(mat, [front[i], front[j], back[j], back[i]], ref)


def render_ground(z=0.0, half=400.0):
    """Render-only ground at z = 0 (four quads around the open basin). Not part of the GLB."""
    x0b, x1b, y0b, y1b = BASIN
    pieces = [(-half, y1b, half, half),       # north of the basin
              (-half, -half, half, y0b),      # south
              (-half, y0b, x0b, y1b),         # west of the basin
              (x1b, y0b, half, y1b)]          # east of the basin (under the tower)
    V = []; Fa = []
    for (xa, ya, xb, yb) in pieces:
        i = len(V)
        V += [(xa, ya, z), (xb, ya, z), (xb, yb, z), (xa, yb, z)]
        Fa.append((i, i + 1, i + 2, i + 3))
    me = bpy.data.meshes.new('render_ground'); me.from_pydata(V, [], Fa); me.update()
    ob = bpy.data.objects.new('render_ground', me); bpy.context.scene.collection.objects.link(ob)
    m = bpy.data.materials.new('render_ground'); m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*_bk._lin((0.55, 0.53, 0.45)), 1.0)
    b.inputs['Roughness'].default_value = 0.95
    me.materials.append(m)
    return ob


# ---------------------------------------------------------------- build
reset()
F = Frame()

# foundations (below ground)
box(F, 25.0, 0.0, -3.0, 36.0, 4.4, Z0 + 3.0, 'tuff')                 # arcade footing, x 7 .. 43
cyl(F, 0.0, 0.0, -3.0, R_T + 0.2, Z0 + 3.0, 'tuff', 32)              # tower footing

# aqueduct: two arcade bays from x +42 to x +8, piers brick, imposts and keystones travertine
arcade(F, 42.0, 0.0, 8.0, 0.0, Z0, 18.0 - Z0, 3.0, 2, 'brick', open_w=13.0, open_h=16.0 - Z0,
       back='dark', impost_mat='travertine')
cornice(F, 42.0, 1.5, 8.0, 1.5, 17.8, 0.45, 0.3, 'travertine')        # north outside face
cornice(F, 8.0, -1.5, 42.0, -1.5, 17.8, 0.45, 0.3, 'travertine')      # south outside face
box(F, 7.0, 0.0, Z0, 4.0, 3.0, 18.0 - Z0, 'brick')                    # pier joining the arcade to the tower, x 5 .. 9

# covered channel on top of the arcade, z 18 .. 20.2, open near the tower (x 6 .. 14) with water in it
box(F, 23.5, 0.0, 18.0, 37.0, 2.2, 1.0, 'stone')                      # trough floor, x 5 .. 42
for sy in (-0.95, 0.95):
    box(F, 23.5, sy, 19.0, 37.0, 0.3, 1.0, 'stone')                   # trough sides
box(F, 28.0, 0.0, 20.0, 28.0, 2.2, 0.2, 'stone')                      # cover, x 14 .. 42
box(F, 10.0, 0.0, 19.0, 8.0, 1.6, 0.3, 'water')                       # water strip where the channel is open, x 6 .. 14

# round castellum: brick shaft R 6, plinth, travertine bands every 4 m, cornice, conical tile roof
cyl(F, 0.0, 0.0, Z0, R_T, H_T - Z0, 'brick', 32)
lathe(F, 0.0, 0.0, [(R_T + 0.3, Z0), (R_T + 0.3, 0.7), (R_T - 0.05, 0.7)], 'travertine', 32, smooth=False)
for zb in (4.0, 8.0, 12.0, 16.0):
    lathe(F, 0.0, 0.0, [(R_T - 0.1, zb), (R_T + 0.25, zb), (R_T + 0.25, zb + 0.3), (R_T - 0.1, zb + 0.3)],
          'travertine', 32, smooth=False)
lathe(F, 0.0, 0.0, [(R_T - 0.1, 18.9), (R_T + 0.45, 18.9), (R_T + 0.45, 19.35), (R_T + 0.2, 19.5),
                    (R_T + 0.2, H_T), (R_T - 0.1, H_T)], 'travertine', 32, smooth=False)
cone_roof(F, 0.0, 0.0, H_T, R_T + 0.85, 5.2, 'tile', 32)

# arched outlet on the west face (sill z 5.4) and the sloping water sheet falling into the basin
arch_outlet(-6.05, -5.6, 0.9, 5.4, 6.4, 'dark')
beam(F, -6.0, 0.0, 5.5, -9.0, 0.0, WATER_Z + 0.1, 1.6, 0.2, 'water')

# sunken basin 14 x 8 m: floor at -1.5, stone walls up to ground level, water at -0.3
x0b, x1b, y0b, y1b = BASIN
xc, yc = (x0b + x1b) / 2, (y0b + y1b) / 2
W_, D_ = x1b - x0b, y1b - y0b
t = 0.6
box(F, xc, yc, BASIN_FLOOR - 0.1, W_, D_, 0.1, 'stone')                          # floor slab
for (wx, wy, sx_, sy_) in ((xc, y1b - t / 2, W_, t), (xc, y0b + t / 2, W_, t),        # north, south
                           (x0b + t / 2, yc, t, D_ - 2 * t), (x1b - t / 2, yc, t, D_ - 2 * t)):   # west, east
    box(F, wx, wy, BASIN_FLOOR, sx_, sy_, -0.5 - BASIN_FLOOR, 'stone')            # wall below the rim
    box(F, wx, wy, -0.5, sx_, sy_, 0.5, 'travertine')                             # stone rim, 0.5 m high, top at ground level
box(F, xc, yc, BASIN_FLOOR, W_ - 2 * t, D_ - 2 * t, WATER_Z - BASIN_FLOOR, 'water')

# three lead pipes (r 0.15) leave the basin westward, lying on the ground
for yy in (-2.2, 0.0, 2.2):
    tube_x('lead', -29.0, -20.9, yy, 0.12, 0.15)

# keeper's room 5 x 4 m against the tower's south side (its north wall sits inside the tower)
box(F, 0.0, -6.8, Z0, 5.0, 4.0, 3.6 - Z0, 'brick')
box(F, -0.6, -8.84, Z0, 1.0, 0.1, 2.2, 'wood')                                    # door
box(F, 1.5, -8.84, 1.9, 0.7, 0.1, 0.7, 'dark')                                    # window
gable_roof(F, 0.0, -6.8, 3.6, 5.0, 4.0, pitch=24.0, axis='x', overhang=0.5, mat='tile', gable_mat='brick')

# preview-only scale figure (not exported)
human(F, -4.0, -12.0, 0.0)

# render-only ground with the basin open; the kit's own preview plane goes far below it
render_ground()
preview_ground(-30.0)
finish('rome_castellum', front='+X', extra_cams=[('basin', Vector((-1.0, -0.6, 0.0)).normalized(), 18)])
