"""rome_claudia_terminal · the Aqua Claudia terminus by the great gate (AD 56).

The Aqua Claudia (AD 52) arrives from the east on a brick arcade. Its last two arches step down: the outer arch carries
the channel at z 11.6, the inner arch at z 10.4, and the channel runs into a polygonal brick settling tower (10 sides,
7 m across, 16 m high: brick courses, a red band, a travertine cornice, slit windows, a door with a tiled porch on its
south face, a tile cone roof). Three bronze pipes run from the tower's south-west side, sunk in 0.7 m stone channels
with grey cover slabs (0.15 m shows), into a small brick distribution house with three outlets: east, a sunk pipe to a
sunken round public basin (9.8 m across at the coping, floor 2 m below ground, travertine rim, tile coping, a curved
stair of ten steps hugging the wall on its south-west side, water 1.5 m below the rim); south into a small baths tank
and west into a trough for the private houses.

Over the basin stands a brick arch (depth 2.0 m, clear span = basin diameter + 0.6 m, intrados crown 8.5 m above
ground): the west leg is a 2.2 x 2.2 m pier joined to the tower by a wall, the east leg a 2.2 x 2.2 m pier just outside
the rim. A red band runs at the impost; a 1.4 m attic with tile coping sits on the arch, and an open stone trough
carries water from the tower over the attic to the crown, ending in a spout; a thin water sheet falls from it into
the basin.

Front = -Y (the camera side used by the page). Coordinates: Blender +X east, +Y north; z = 0 = ground at the tower.
Render-only: the ground is a fan of quads at z = 0 with the basin left open; the GLB contains the terminal only.
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector
from rk import *
import bl_kit as _bk

Z0 = -0.02            # base of everything that stands on the ground
R_T = 3.6             # tower: 10 sides, corner radius 3.6 m (about 7.2 m across)
APO = R_T * math.cos(math.radians(18.0))   # apothem: the faces are centred on 18 + 36 k degrees
H_TOP = 16.0          # top of the cone roof
ZC_OUT, ZC_IN = 11.6, 10.4                 # channel level on the outer and the inner arch
PIT = (8.3, -6.8)     # centre of the public basin, in front of the inner arch (as in the reference)
R_IN, R_OUT, R_COP = 4.0, 4.6, 4.9         # basin: water edge, wall and rim, coping
PIT_FLOOR = -2.0
WATER_Z = -1.5                             # water surface (was -0.45): deep enough that the stair reads as steps
STAIR = (200.0, 100.0, 10)                 # stair: start angle, arc span (deg), steps; along the wall, south-west side
STAIR_W = 1.2                              # radial width of each step
HOUSE = (-7.0, -8.0)                       # distribution house centre, south-west of the tower
PIPE_Z = -0.01                             # pipe axis: r 0.16 gives a top at 0.15 above ground
# arch over the basin: clear span = basin diameter (2 R_COP) + 0.6; intrados crown 8.5 m; depth 2.0 m; attic 1.4 m
AX, AY = PIT                               # arch centre line runs through the basin centre (plane y = AY)
ARCH_RI = R_COP + 0.3                      # intrados radius 5.2
ARCH_RO = ARCH_RI + 2.0                    # extrados radius (depth 2.0)
ARCH_ZS = 8.5 - ARCH_RI                    # springing (impost) 3.3 m: crown at 8.5
ARCH_D = 2.0                               # thickness through, along y
ZA = ARCH_ZS + ARCH_RO + 1.4               # attic top 11.9 (1.4 m above the extrados crown)
TR_Z = ZA + 0.18                           # trough floor, on the tile coping
PIER_X_W, PIER_X_E = AX - ARCH_RI - 1.1, AX + ARCH_RI + 1.1   # centres of the 2.2 m piers (2.0 and 14.6)


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


def poly(R, n):
    """Counter-clockwise regular polygon with a vertex on the +X axis."""
    return [(R * math.cos(TAU * k / n), R * math.sin(TAU * k / n)) for k in range(n)]


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
    cyl(B, 0.0, 0.0, floor - 0.12, R_in, 0.12, 'stone', seg)
    lathe(B, 0.0, 0.0, [(R_in, floor), (R_out, floor), (R_out, -0.5), (R_in, -0.5), (R_in, floor)], 'stone', seg, smooth=False)
    lathe(B, 0.0, 0.0, [(R_in, -0.5), (R_out, -0.5), (R_out, 0.0), (R_in, 0.0), (R_in, -0.5)], 'travertine', seg, smooth=False)
    lathe(B, 0.0, 0.0, [(R_in, 0.0), (R_cop, 0.0), (R_cop, 0.12), (R_in, 0.12), (R_in, 0.0)], 'tile', seg, smooth=False)
    curved_stair(cx, cy, R_in - STAIR_W, R_in + 0.02, floor, a0, span, n, water_z)
    for k in range(seg):
        t0 = TAU * k / seg; t1 = TAU * (k + 1) / seg
        add_poly('water', [B.p(0, 0, water_z), B.p(R_in * math.cos(t0), R_in * math.sin(t0), water_z),
                           B.p(R_in * math.cos(t1), R_in * math.sin(t1), water_z)])


def annulus(mat, cx, cy, z, r0, r1, seg=32):
    """A flat ring of paving from radius r0 to r1 at height z (normals up)."""
    for k in range(seg):
        a0 = TAU * k / seg; a1 = TAU * (k + 1) / seg
        add_poly(mat, [(cx + r0 * math.cos(a0), cy + r0 * math.sin(a0), z), (cx + r1 * math.cos(a0), cy + r1 * math.sin(a0), z),
                       (cx + r1 * math.cos(a1), cy + r1 * math.sin(a1), z), (cx + r0 * math.cos(a1), cy + r0 * math.sin(a1), z)])


def tank(F, cx, cy, w, d, t=0.4, rim=0.5):
    """A small rectangular tank on the ground: marble walls, water inside up to 0.3 m."""
    box(F, cx, cy + d / 2 - t / 2, 0.0, w, t, rim, 'marble')
    box(F, cx, cy - d / 2 + t / 2, 0.0, w, t, rim, 'marble')
    box(F, cx - w / 2 + t / 2, cy, 0.0, t, d - 2 * t, rim, 'marble')
    box(F, cx + w / 2 - t / 2, cy, 0.0, t, d - 2 * t, rim, 'marble')
    box(F, cx, cy, 0.0, w - 2 * t, d - 2 * t, 0.3, 'water')


def channel(F, xa, xb, zc):
    """An open channel of the aqueduct on a wall top at zc, from xa to xb (xa < xb): stone trough, water inside."""
    L = xb - xa; cx = (xa + xb) / 2
    box(F, cx, 0.0, zc, L, 2.0, 0.25, 'stone')
    for sy in (-0.9, 0.9):
        box(F, cx, sy, zc + 0.25, L, 0.2, 0.8, 'stone')
    box(F, cx, 0.0, zc + 0.25, L, 1.2, 0.12, 'water')


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
box(F, 14.25, 0.0, -2.2, 22.5, 3.6, 2.2 + Z0, 'tuff')                # arcade footing, x 3 .. 25.5
prism(F, poly(R_T + 0.3, 10), -2.2, Z0, 'tuff')                       # tower footing

# the last two arches of the aqueduct: outer (channel z 11.6), inner (channel z 10.4, stepped down)
arcade(F, 25.0, 0.0, 13.5, 0.0, Z0, ZC_OUT - Z0, 3.0, 1, 'brick', open_w=6.6, open_h=9.6,
       back='dark', impost_mat='travertine')
arcade(F, 13.5, 0.0, 3.0, 0.0, Z0, ZC_IN - Z0, 3.0, 1, 'brick', open_w=5.6, open_h=8.4,
       back='dark', impost_mat='travertine')
channel(F, 13.5, 25.0, ZC_OUT)
channel(F, 3.0, 13.5, ZC_IN)

# settling tower: 10 sides, brick shaft, travertine plinth, courses, red band, cornice, cone roof to z 16
prism(F, poly(R_T + 0.25, 10), 0.0, 0.8, 'travertine')
prism(F, poly(R_T, 10), 0.0, 13.2, 'brick')
for zb in list(range(1, 11)) + [12.4]:                                # brick courses (lime joints as light bands)
    prism(F, poly(R_T + 0.05, 10), zb, zb + 0.09, 'stone')
prism(F, poly(R_T + 0.08, 10), 11.6, 12.2, 'red')
prism(F, poly(R_T + 0.35, 10), 13.2, 13.7, 'travertine')
cone_roof(F, 0.0, 0.0, 13.7, R_T + 0.6, H_TOP - 13.7, 'tile', 10)
for ang in (54.0, 126.0, 234.0, 306.0):                               # slit windows on four faces, two rows
    for zw in (7.2, 10.6):
        a = math.radians(ang)
        box(F, APO * math.cos(a), APO * math.sin(a), zw, 0.06, 0.45, 0.9, 'dark', rot=ang)
box(F, 0.0, -APO - 0.02, 0.0, 1.1, 0.12, 2.3, 'wood')                 # door on the south face
box(F, 0.0, -4.42, 0.0, 2.6, 2.0, 0.25, 'stone')                      # porch floor
for px in (-1.1, 1.1):
    for py in (-3.65, -5.2):
        box(F, px, py, 0.25, 0.22, 0.22, 2.4, 'marble')               # porch posts
gable_roof(F, 0.0, -4.42, 2.65, 2.9, 2.2, pitch=20.0, axis='x', overhang=0.4, mat='tile', gable_mat='brick')

# distribution house, south-west of the tower
hx, hy = HOUSE
box(F, hx, hy, 0.0, 5.5, 4.5, 3.6, 'brick')                           # distribution house
hip_roof(F, hx, hy, 3.6, 5.5, 4.5, pitch=22.0, overhang=0.5, mat='tile')
box(F, hx - 2.0, hy - 2.27, 0.0, 0.9, 0.12, 2.1, 'wood')              # door on the south face

# three bronze pipes, each sunk in its own 0.7 m stone channel from the tower's south-west side to the house's north wall
for ang, xe in ((198.0, -8.6), (216.0, -7.0), (234.0, -5.4)):
    a = math.radians(ang); A = (3.0 * math.cos(a), 3.0 * math.sin(a))
    trench(A, (xe, -5.45))
    tube('bronze', (A[0], A[1], PIPE_Z), (xe, -5.45, PIPE_Z), 0.16)

# the outlets: west into the houses' trough and south into the baths tank (raised spouts), east into the public basin
# by a sunk pipe along y -8.6, south of the arch's west pier
trench((-4.0, -8.6), (3.9, -8.6))
tube('bronze', (-4.0, -8.6, PIPE_Z), (3.9, -8.6, PIPE_Z), 0.14)
tube('bronze', (hx - 0.6, hy - 2.1, 1.6), (hx - 0.6, -13.6, 1.0), 0.14)   # to the baths tank
beam(F, hx - 0.6, -13.6, 0.95, hx - 0.6, -13.6, 0.35, 0.4, 0.1, 'water')
tank(F, hx - 0.6, -14.5, 4.0, 4.0)
tube('bronze', (hx - 2.6, -8.0, 1.6), (-12.6, -8.0, 1.0), 0.14)      # to the private houses' trough
beam(F, -12.6, -8.0, 0.95, -12.6, -8.0, 0.35, 0.4, 0.1, 'water')
tank(F, -13.5, -8.0, 4.0, 1.6)

# arch over the sunken basin (plane y = AY): west leg = 2.2 x 2.2 pier joined to the tower by a wall; east leg = 2.2 x 2.2
# pier just outside the rim; 2.0 m deep ring with spandrels up to the attic top; red band at the impost; tile coping
box(F, PIER_X_W, AY, Z0, 2.2, 2.2, ARCH_ZS - Z0, 'brick')            # west pier
box(F, PIER_X_E, AY, Z0, 2.2, 2.2, ARCH_ZS - Z0, 'brick')            # east pier
box(F, PIER_X_W, (-5.7 - 2.8) / 2, Z0, 2.2, 2.9, ZA - Z0, 'brick')   # wall from the tower to the west pier
outline = [(AX - ARCH_RO, ARCH_ZS), (AX - ARCH_RO, ZA), (AX + ARCH_RO, ZA), (AX + ARCH_RO, ARCH_ZS)] + arch_pts(AX, ARCH_ZS, ARCH_RI)
xz_prism('brick', outline, AY - ARCH_D / 2, AY + ARCH_D / 2)
for px in (PIER_X_W, PIER_X_E):                                      # red band at the impost, on the front face
    box(F, px, AY - ARCH_D / 2 - 0.125, ARCH_ZS, 2.2, 0.25, 0.45, 'red')
box(F, AX, AY, ZA, 14.6, 2.5, 0.18, 'tile')                          # tile coping of the attic
box(F, PIER_X_W, (-5.55 - 2.75) / 2, ZA, 2.2, 2.8, 0.18, 'tile')     # coping over the wall to the tower

# open stone trough on the attic: from the tower's flank along x = 2.0 to the attic, then east along the arch's centre
# line to the crown, ending in a spout that overhangs the south face of the arch
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
trough_run(2.0, (-2.9 + AY) / 2, -2.9 - AY, along_x=False)           # from the tower face (y -2.9) to the attic (y AY)
trough_run((2.0 + AX) / 2, AY, AX - 2.0, along_x=True)               # along the attic to the crown
box(F, AX, AY - 0.85, TR_Z, 0.5, 1.7, 0.2, 'stone')                  # spout
box(F, AX, AY - 1.7, TR_Z, 0.5, 0.2, 0.45, 'stone')                  # lip at the spout's tip
sheet('water', [(AX, AY - 1.6, TR_Z + 0.25), (AX, AY - 1.9, 8.0), (AX, AY - 2.3, 3.0), (AX, AY - 2.5, WATER_Z - 0.1)], 0.3)

# sunken public basin (9.8 m across at the coping), curved stair along its wall, paving round it
sunken_basin(PIT[0], PIT[1], R_IN, R_OUT, R_COP, PIT_FLOOR, STAIR[0], STAIR[1], STAIR[2], WATER_Z)
annulus('paving', PIT[0], PIT[1], 0.03, R_COP - 0.02, 7.0)

# preview-only scale figure (not exported)
human(F, 2.0, -13.0, 0.0)

# render-only ground with the public basin open; the kit's own preview plane goes far below it
render_ground(PIT[0], PIT[1], R_COP)
preview_ground(-30.0)
finish('rome_claudia_terminal', front='-Y')
closeup('rome_claudia_terminal', Vector((PIT[0], PIT[1], -0.8)), (-0.75, -0.65), 14.0, 30.0, 'basin.png')
