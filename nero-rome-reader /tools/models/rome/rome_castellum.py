"""rome_castellum v2 · aqueduct terminus and distribution tank on the Palatine (AD 56).

Two arcade bays of the aqueduct (x +42 .. +8, brick piers, travertine imposts) carry a covered channel at z 18 into a
round brick castellum (R 6, 20 m: brick courses, a red band, travertine plinth and cornice, conical tile roof). West of
the tower a brick arch spans a sunken round basin (8.4 m across at the coping, floor 1.5 m below ground, travertine rim
and tile coping): clear span = basin diameter + 0.6 m, intrados crown 8.5 m above ground, depth 2.0 m. Its east leg is
the tower's flank (a 2.2 x 2.2 m pier joined to it), its west leg a 2.2 x 2.2 m pier just outside the rim. A 1.4 m
attic with tile coping sits on the arch; an open stone trough runs from the tower over it to the crown and ends in a
spout, and a thin water sheet falls from the spout into the basin. A curved stair of ten steps hugs the wall (100 deg),
and the water lies 1.1 m below the rim. Three lead pipes leave the basin westward, sunk in 0.7 m stone channels with
grey cover slabs (0.15 m shows), and end 4 m from the rim in a 1.2 x 1.2 x 0.9 m stone distribution box with a slab
lid. A keeper's room stands against the tower's south side. Front = +X (the aqueduct comes from the east). Footprint,
channel height and orientation as in v1.

Render-only: the ground is a fan of quads at z = 0 with the basin left open (so the basin shows in the renders); the
GLB contains the castellum only. The basin close-up re-aims the camera that finish() leaves in the scene.
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
PIT = (-11.5, 0.0)    # centre of the sunken round basin
R_IN = 3.4            # basin radius at the water edge (inside the wall)
R_OUT = 4.0           # outer face of the stone wall and travertine rim
R_COP = 4.18          # tile coping (overhangs the rim by 0.18 m)
PIT_FLOOR = -1.5      # floor 1.5 m below ground
WATER_Z = -1.1        # water surface 1.1 m below the rim (was 0.3): deep enough that the stair reads as steps
STAIR = (200.0, 100.0, 10)  # stair: start angle, arc span (deg), number of steps; along the wall, south-west side
STAIR_W = 1.2         # radial width of each step
PIPE_Z = -0.01        # pipe axis: r 0.16 gives a top at 0.15 above ground
# arch over the basin: clear span = basin diameter (2 R_COP) + 0.6; intrados crown 8.5 m; depth 2.0 m; attic 1.4 m
AX, AY = PIT          # arch centre line through the basin centre (plane y = AY)
ARCH_RI = R_COP + 0.3 # intrados radius 4.48
ARCH_RO = ARCH_RI + 2.0
ARCH_ZS = 8.5 - ARCH_RI               # springing 4.02 m: crown at 8.5
ARCH_D = 2.0          # thickness through, along y
ZA = ARCH_ZS + ARCH_RO + 1.4          # attic top 11.9
TR_Z = ZA + 0.18      # trough floor, on the tile coping
PIER_X_W, PIER_X_E = AX - ARCH_RI - 1.1, AX + ARCH_RI + 1.1   # 2.2 m piers: west (outside the rim), east (tower flank)


def add_out(mat, pts, ref, smooth=False):
    """A planar polygon, wound so that its normal points away from the point ref."""
    p = [Vector(q) for q in pts]
    n = (p[1] - p[0]).cross(p[2] - p[0])
    c = sum(p, Vector()) / len(p)
    if n.dot(c - Vector(ref)) < 0:
        p = p[::-1]
    add_poly(mat, [tuple(q) for q in p], smooth)


def tube(mat, A, B, r, seg=8):
    """A closed pipe of radius r from point A to point B."""
    A = Vector(A); B = Vector(B); d = (B - A).normalized()
    u = d.cross(Vector((0.0, 0.0, 1.0)))
    if u.length < 1e-6:
        u = Vector((1.0, 0.0, 0.0))
    u.normalize(); v = d.cross(u); v.normalize()
    ring = lambda P: [P + (u * math.cos(TAU * j / seg) + v * math.sin(TAU * j / seg)) * r for j in range(seg)]
    a = ring(A); b = ring(B); ref = (A + B) / 2
    for j in range(seg):
        k = (j + 1) % seg
        add_out(mat, [a[j], a[k], b[k], b[j]], ref, True)
    add_out(mat, a, ref)
    add_out(mat, b, ref)


def xz_prism(mat, pts, y0, y1):
    """A simple polygon in the xz plane (list of (x, z)), extruded from y0 to y1; the face at y0 looks to -Y."""
    n = len(pts)
    A = sum(pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1] for i in range(n))
    if A < 0:
        pts = pts[::-1]
    front = [(x, y0, z) for x, z in pts]
    back = [(x, y1, z) for x, z in pts]
    add_poly(mat, front)
    add_poly(mat, back[::-1])
    for i in range(n):
        j = (i + 1) % n
        add_poly(mat, [front[i], back[i], back[j], front[j]])


def sheet(mat, pts, half_w):
    """A thin bent sheet of water, 2 * half_w wide along X, following the 3D polyline pts; two-sided."""
    X = Vector((half_w, 0.0, 0.0))
    for A, B in zip(pts, pts[1:]):
        A = Vector(A); B = Vector(B)
        q = [A - X, A + X, B + X, B - X]
        add_poly(mat, [tuple(p) for p in q])
        add_poly(mat, [tuple(p) for p in q[::-1]])


def arch_pts(cx, zs, r, seg=24):
    """Intrados of a semicircular arch: from the east springing (angle 0) over the crown to the west springing (180)."""
    return [(cx + r * math.cos(math.pi * k / seg), zs + r * math.sin(math.pi * k / seg)) for k in range(seg + 1)]


def trench(A, B, top=0.02, w=0.7):
    """A 0.7 m stone channel at ground level from A to B (x, y): stone bed and walls below ground, grey cover slabs
    1.2 m long with joints every 1.2 m (top at height `top`). The pipe lies on the bed, 0.17 m below the slab bottom."""
    A = Vector((A[0], A[1], 0.0)); B = Vector((B[0], B[1], 0.0))
    d = (B - A).normalized(); nrm = Vector((-d.y, d.x, 0.0)); L = (B - A).length
    beam(None, A.x, A.y, -0.295, B.x, B.y, -0.295, w, 0.25, 'stone')                     # bed, top at -0.17
    for s in (-1, 1):
        a = A + nrm * (s * (w / 2 - 0.07)); b = B + nrm * (s * (w / 2 - 0.07))
        beam(None, a.x, a.y, -0.28, b.x, b.y, -0.28, 0.14, 0.28, 'stone')               # walls, -0.42 .. -0.14
    zc = (-0.14 + top) / 2; h = top + 0.14
    s0 = 0.0
    while s0 < L - 0.05:                                                                  # cover slabs, joints every 1.2 m
        s1 = min(s0 + 1.2 - 0.03, L)
        p = A + d * s0; q = A + d * s1
        beam(None, p.x, p.y, zc, q.x, q.y, zc, w, h, 'grey')
        s0 += 1.2


def curved_stair(cx, cy, r_in, r_out, floor, a0, span, n, water_z, seg=8):
    """n steps hugging the basin wall: each a curved slab from r_in to r_out over span / n degrees, cut into seg facets,
    solid from the floor up. Tread i sits at -(i + 1) h, h = (-water_z - 0.1) / n, so the last tread is 0.1 m above water."""
    h = (-water_z - 0.1) / n
    step = span / n
    P = lambda r, deg, z: (cx + r * math.cos(math.radians(deg)), cy + r * math.sin(math.radians(deg)), z)
    for i in range(n):
        zt = -(i + 1) * h; A0 = a0 + i * step
        for k in range(seg):
            a = A0 + step * k / seg; b = A0 + step * (k + 1) / seg
            ref = P((r_in + r_out) / 2, (a + b) / 2, (floor + zt) / 2)
            add_out('stone', [P(r_in, a, zt), P(r_out, a, zt), P(r_out, b, zt), P(r_in, b, zt)], ref)           # tread
            add_out('stone', [P(r_out, a, floor), P(r_out, b, floor), P(r_out, b, zt), P(r_out, a, zt)], ref)  # outer face
            add_out('stone', [P(r_in, a, floor), P(r_in, b, floor), P(r_in, b, zt), P(r_in, a, zt)], ref)      # inner face
        ref = P((r_in + r_out) / 2, A0 + step / 2, (floor + zt) / 2)
        for a in (A0, A0 + step):                                                                             # ends
            add_out('stone', [P(r_in, a, floor), P(r_out, a, floor), P(r_out, a, zt), P(r_in, a, zt)], ref)


def sunken_basin(cx, cy, R_in, R_out, R_cop, floor, a0, span, n, water_z, seg=32):
    """A sunken round basin: stone floor and wall below ground, travertine rim at ground level, tile coping; a curved
    stair of n steps along the wall (start angle a0, arc span, degrees; see curved_stair); water over the whole disc."""
    B = Frame(cx, cy, 0.0)
    cyl(B, 0.0, 0.0, floor - 0.12, R_in, 0.12, 'stone', seg)                                   # floor slab
    lathe(B, 0.0, 0.0, [(R_in, floor), (R_out, floor), (R_out, -0.5), (R_in, -0.5), (R_in, floor)], 'stone', seg, smooth=False)
    lathe(B, 0.0, 0.0, [(R_in, -0.5), (R_out, -0.5), (R_out, 0.0), (R_in, 0.0), (R_in, -0.5)], 'travertine', seg, smooth=False)
    lathe(B, 0.0, 0.0, [(R_in, 0.0), (R_cop, 0.0), (R_cop, 0.12), (R_in, 0.12), (R_in, 0.0)], 'tile', seg, smooth=False)
    curved_stair(cx, cy, R_in - STAIR_W, R_in + 0.02, floor, a0, span, n, water_z)
    for k in range(seg):
        t0 = TAU * k / seg; t1 = TAU * (k + 1) / seg
        add_poly('water', [B.p(0, 0, water_z), B.p(R_in * math.cos(t0), R_in * math.sin(t0), water_z),
                           B.p(R_in * math.cos(t1), R_in * math.sin(t1), water_z)])


def render_ground(cx, cy, r_hole, half=400.0, n=48):
    """Render-only ground at z = 0: a fan of quads from the basin's edge out to `half` metres. Not part of the GLB."""
    V = []; Fa = []
    for k in range(n):
        a0 = TAU * k / n; a1 = TAU * (k + 1) / n
        i = len(V)
        for r, a in ((r_hole, a0), (half, a0), (half, a1), (r_hole, a1)):
            V.append((cx + r * math.cos(a), cy + r * math.sin(a), 0.0))
        Fa.append((i, i + 1, i + 2, i + 3))
    me = bpy.data.meshes.new('render_ground'); me.from_pydata(V, [], Fa); me.update()
    ob = bpy.data.objects.new('render_ground', me); bpy.context.scene.collection.objects.link(ob)
    m = bpy.data.materials.new('render_ground'); m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*_bk._lin((0.55, 0.53, 0.45)), 1.0)
    b.inputs['Roughness'].default_value = 0.95
    me.materials.append(m)
    return ob


def closeup(name, target, dvec, dist, elev, fname):
    """Re-aim the scene camera (left by finish) at target and render one close-up into renders/<name>/."""
    sc = bpy.context.scene; cam = sc.camera
    e = math.radians(elev)
    dv = Vector((dvec[0] * math.cos(e), dvec[1] * math.cos(e), math.sin(e))).normalized()
    cam.data.type = 'PERSP'; cam.data.lens = 35
    cam.location = Vector(target) + dv * dist
    _bk._look(cam, target)
    sc.render.filepath = os.path.join(_bk.ROOT, 'renders', name, fname)
    bpy.ops.render.render(write_still=True)
    return sc.render.filepath


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

# round castellum: brick shaft R 6, travertine plinth, brick courses, a red band, cornice, conical tile roof
cyl(F, 0.0, 0.0, Z0, R_T, H_T - Z0, 'brick', 32)
lathe(F, 0.0, 0.0, [(R_T + 0.3, Z0), (R_T + 0.3, 0.7), (R_T - 0.05, 0.7)], 'travertine', 32, smooth=False)
for zb in [z for z in range(1, 19) if z != 14]:                       # brick courses every metre, none under the band
    lathe(F, 0.0, 0.0, [(R_T + 0.06, zb), (R_T + 0.06, zb + 0.09), (R_T - 0.01, zb + 0.09)], 'stone', 32, smooth=False)
lathe(F, 0.0, 0.0, [(R_T + 0.05, 13.9), (R_T + 0.05, 14.6), (R_T - 0.05, 14.6)], 'red', 32, smooth=False)
lathe(F, 0.0, 0.0, [(R_T - 0.1, 18.9), (R_T + 0.45, 18.9), (R_T + 0.45, 19.35), (R_T + 0.2, 19.5),
                    (R_T + 0.2, H_T), (R_T - 0.1, H_T)], 'travertine', 32, smooth=False)
cone_roof(F, 0.0, 0.0, H_T, R_T + 0.85, 5.2, 'tile', 32)
for ang in (60.0, 120.0, 240.0, 300.0):                               # small dark slit windows, two rows
    for zw in (9.0, 15.8):
        a = math.radians(ang)
        box(F, R_T * math.cos(a), R_T * math.sin(a), zw, 0.06, 0.5, 0.9, 'dark', rot=ang)

# arch over the sunken basin (plane y = AY): east leg = 2.2 x 2.2 pier attached to the tower's flank; west leg = 2.2 x 2.2
# pier just outside the rim; 2.0 m deep ring with spandrels up to the attic top; red band at the impost; tile coping
box(F, PIER_X_W, AY, Z0, 2.2, 2.2, ARCH_ZS - Z0, 'brick')            # west pier, outside the rim
box(F, PIER_X_E, AY, Z0, 2.2, 2.2, ARCH_ZS - Z0, 'brick')            # east pier, against the tower
outline = [(AX - ARCH_RO, ARCH_ZS), (AX - ARCH_RO, ZA), (AX + ARCH_RO, ZA), (AX + ARCH_RO, ARCH_ZS)] + arch_pts(AX, ARCH_ZS, ARCH_RI)
xz_prism('brick', outline, AY - ARCH_D / 2, AY + ARCH_D / 2)
for px in (PIER_X_W, PIER_X_E):                                      # red band at the impost, on the front face
    box(F, px, AY - ARCH_D / 2 - 0.125, ARCH_ZS, 2.2, 0.25, 0.45, 'red')
box(F, AX, AY, ZA, 13.0, 2.5, 0.18, 'tile')                          # tile coping of the attic

# open stone trough on the attic: from the tower's west flank along the arch's centre line to the crown, then a spout
# that overhangs the south face of the arch
def trough_run(cx, cy, length, along_x):
    if along_x:
        box(F, cx, cy, TR_Z, length, 0.8, 0.2, 'stone')
        for s in (-1, 1):
            box(F, cx, cy + s * 0.34, TR_Z + 0.2, length, 0.12, 0.4, 'stone')
        box(F, cx, cy, TR_Z + 0.2, length, 0.56, 0.08, 'water')
    else:
        box(F, cx, cy, TR_Z, 0.8, length, 0.2, 'stone')
        for s in (-1, 1):
            box(F, cx + s * 0.34, cy, TR_Z + 0.2, 0.12, length, 0.4, 'stone')
        box(F, cx, cy, TR_Z + 0.2, 0.56, length, 0.08, 'water')
trough_run((AX - 5.9) / 2, AY, -5.9 - AX, along_x=True)              # from the tower face (x -5.9) to the crown (x AX)
box(F, AX, AY - 1.05, TR_Z, 0.5, 2.1, 0.2, 'stone')                  # spout
box(F, AX, AY - 2.0, TR_Z, 0.5, 0.2, 0.45, 'stone')                  # lip at the spout's tip
sheet('water', [(AX, AY - 1.7, TR_Z + 0.25), (AX, AY - 1.85, 8.0), (AX, AY - 1.95, 3.5), (AX, AY - 2.0, WATER_Z - 0.1)], 0.3)

# sunken round basin (8.4 m across at the coping), curved stair along its wall
sunken_basin(PIT[0], PIT[1], R_IN, R_OUT, R_COP, PIT_FLOOR, STAIR[0], STAIR[1], STAIR[2], WATER_Z)

# three lead pipes (r 0.16), each sunk in its own 0.7 m stone channel, leave the basin westward; they converge to 0.36 m
# spacing and end 4 m from the rim (x -19.68) inside a 1.2 x 1.2 x 0.9 m stone distribution box with a slab lid
BOX_E = PIT[0] - R_COP - 4.0                                         # east face of the box, 4 m from the rim
for y0, y1 in ((-0.8, -0.36), (0.0, 0.0), (0.8, 0.36)):
    top = 0.02 if y0 == 0.0 else 0.024                               # staggered cover heights where channels meet
    x0 = PIT[0] - math.sqrt(R_OUT ** 2 - y0 ** 2) + 0.3              # starts inside the wall
    P0 = (x0, y0); P1 = (-18.4, y0); P2 = (BOX_E - 0.2, y1)
    trench(P0, P1, top)
    trench(P1, P2, top)
    tube('lead', (P0[0], P0[1], PIPE_Z), (P1[0], P1[1], PIPE_Z), 0.16)
    tube('lead', (P1[0], P1[1], PIPE_Z), (P2[0], P2[1], PIPE_Z), 0.16)
box(F, BOX_E - 0.6, 0.0, 0.0, 1.2, 1.2, 0.82, 'grey')                # distribution box
box(F, BOX_E - 0.6, 0.0, 0.82, 1.3, 1.3, 0.08, 'grey')               # slab lid

# keeper's room 5 x 4 m against the tower's south side (its north wall sits inside the tower)
box(F, 0.0, -6.8, Z0, 5.0, 4.0, 3.6 - Z0, 'brick')
box(F, -0.6, -8.84, Z0, 1.0, 0.1, 2.2, 'wood')                                    # door
box(F, 1.5, -8.84, 1.9, 0.7, 0.1, 0.7, 'dark')                                    # window
gable_roof(F, 0.0, -6.8, 3.6, 5.0, 4.0, pitch=24.0, axis='x', overhang=0.5, mat='tile', gable_mat='brick')

# preview-only scale figure (not exported)
human(F, -4.0, -12.0, 0.0)

# render-only ground with the basin open; the kit's own preview plane goes far below it
render_ground(PIT[0], PIT[1], R_COP)
preview_ground(-30.0)
finish('rome_castellum', front='+X', extra_cams=[('arch_south', Vector((0.0, -1.0, 0.0)), 8)])   # the tower hides the arch from +X
closeup('rome_castellum', Vector((PIT[0], PIT[1], -0.6)), (-0.6, -0.8), 13.0, 30.0, 'basin.png')
