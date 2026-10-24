"""Three free-standing limestone outcrops for the steep hill faces (the Capitol cliff, the Palatine slopes). v3 method.

Each mass: an icosphere (subdivision 4) scaled to the mass size, displaced along its normals by low-frequency,
large-amplitude fBm (3 octaves, gain 0.5; A = 0.22 x min size, wavelength L = 0.45 x max footprint), then a finer pass
(A x 0.25, L x 0.3). 4 to 6 planar cuts (bisect_plane, clear_outer, hole filled) make flat joint facets, a cliff face,
and flat ledges. The bottom is cut flat at BASE = -1.5 m. Masses are boolean-unioned, decimated to a budget, flat shaded.
Moss: faces with normal z > 0.85 in noise patches (about 30 % of those). rock2: about 25 % of the rest.

  rome_rock_a  ~12 x 8 x 5 m: three stacked ledge masses, each stepping back.
  rome_rock_b  ~8 x 6 x 8 m: one tall mass, a near-vertical cliff face on the south side, a ledge near the top.
  rome_rock_c  ~5 x 4 x 3 m: four masses of 2 to 3 m, each with a flat top facet.

Run all three in one Blender process:
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_rocks.py"
"""
import os, sys, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector, Matrix, noise
from rk import *                       # reset, Frame, human, ... (also the 'rock', 'rock2', 'moss' palette)
import bl_kit as bk
from bl_kit import _make_mat, render_previews

BASE = -1.5                            # the base sinks 1.5 m below z = 0


def fbm(p, octaves=3, gain=0.5):
    s = 0.0; a = 1.0; f = 1.0; norm = 0.0
    for _ in range(octaves):
        s += a * noise.noise(p * f, noise_basis='PERLIN_ORIGINAL')
        norm += a; a *= gain; f *= 2.0
    return s / norm


def displace_fbm(bm, seed, A, L):
    """p += normal * A * fbm(p / L): low frequency, large amplitude, so the mass gets lumps, not folds."""
    off = Vector((seed * 1.37, seed * 2.91, seed * 4.13))
    bm.normal_update()
    for v in bm.verts:
        v.co += v.normal * (A * fbm((v.co + off) / L))
    bm.normal_update()


def new_object(name, bm):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def tri_count(me):
    return sum(max(0, len(p.vertices) - 2) for p in me.polygons)


def apply_modifier(ob, mod):
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.modifier_apply(modifier=mod.name)


def bisect_cut(ob, point, normal):
    """Planar cut: remove everything on the +normal side of the plane through `point`, then fill the hole so the
    cut leaves one flat joint facet."""
    n = Vector(normal).normalized()
    bm = bmesh.new(); bm.from_mesh(ob.data)
    geom = list(bm.verts) + list(bm.edges) + list(bm.faces)
    bmesh.ops.bisect_plane(bm, geom=geom, dist=0.0001, plane_co=Vector(point), plane_no=n, clear_outer=True)
    bnd = [e for e in bm.edges if len(e.link_faces) == 1]
    if bnd:
        bmesh.ops.holes_fill(bm, edges=bnd, sides=0)
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=0.0005)
    bm.normal_update()
    bm.to_mesh(ob.data); bm.free()
    ob.data.update()


def decimate(ob, target):
    tris = tri_count(ob.data)
    if tris <= target:
        return
    m = ob.modifiers.new('dec', 'DECIMATE')
    m.decimate_type = 'COLLAPSE'; m.ratio = target / tris
    apply_modifier(ob, m)


def blob(name, c, s, seed, cuts, target, base=BASE):
    """One mass: icosphere scaled to s = (sx, sy, sz), centred at c, displaced (two passes), cut by planes, bottom
    cut flat at `base`, decimated to `target` triangles."""
    sx, sy, sz = s
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=4, radius=0.5)
    bmesh.ops.scale(bm, vec=(sx, sy, sz), verts=list(bm.verts))
    bmesh.ops.translate(bm, vec=(c[0], c[1], c[2]), verts=list(bm.verts))
    A1 = 0.22 * min(sx, sy, sz); L1 = 0.45 * max(sx, sy)
    displace_fbm(bm, seed, A1, L1)
    displace_fbm(bm, seed + 50, 0.25 * A1, 0.3 * L1)
    ob = new_object(name, bm)
    decimate(ob, target * 3)
    for point, normal in list(cuts) + [((0.0, 0.0, base), (0.0, 0.0, -1.0))]:
        bisect_cut(ob, point, normal)
    decimate(ob, target)
    return ob


def union_all(objs, name):
    """Boolean-union the masses into one solid (plain joining leaves the intersecting surfaces unmerged)."""
    base = objs[0]
    for o in objs[1:]:
        m = base.modifiers.new('uni', 'BOOLEAN')
        m.operation = 'UNION'; m.object = o; m.solver = 'EXACT'
        apply_modifier(base, m)
        bpy.data.objects.remove(o, do_unlink=True)
    base.name = name; base.data.name = name
    return base


def rand_cut(rnd, c, s):
    """A random planar cut near the outside of a mass: its plane sits about 0.8 of the mass radius from the centre."""
    n = Vector((rnd.uniform(-1, 1), rnd.uniform(-1, 1), rnd.uniform(-0.3, 0.3))).normalized()
    p = Vector((c[0], c[1], c[2] if len(c) > 2 else 0.0)) + n * 0.8 * min(s[0], s[1]) / 2
    return ((p.x, p.y, p.z), (n.x, n.y, n.z))


def paint(ob, seed):
    """moss on flat tops (normal z > 0.85) in noise patches, about 30 % of those faces; rock2 on about 25 % of the rest."""
    me = ob.data
    rnd = random.Random(seed)
    me.materials.clear()
    for nm in ('rock', 'rock2', 'moss'):
        me.materials.append(_make_mat(nm))
    tops = []
    for p in me.polygons:
        p.use_smooth = False
        if p.normal.z > 0.85:
            c = p.center
            tops.append((noise.noise(c * 0.45 + Vector((seed, seed, seed)), noise_basis='PERLIN_ORIGINAL'), p))
        else:
            p.material_index = 1 if rnd.random() < 0.25 else 0
    tops.sort(key=lambda t: t[0], reverse=True)
    k = round(0.3 * len(tops))
    for i, (_, p) in enumerate(tops):
        p.material_index = 2 if i < k else 0
        if i >= k and rnd.random() < 0.25:
            p.material_index = 1


def open_edges(me):
    bm = bmesh.new(); bm.from_mesh(me)
    bad = [e for e in bm.edges if len(e.link_faces) != 2]
    n = len(bad)
    bm.free()
    return n


def close_holes(ob):
    """Fill any boundary loop left over, so every mass is watertight (closed bottoms)."""
    bm = bmesh.new(); bm.from_mesh(ob.data)
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=0.0005)
    edges = [e for e in bm.edges if len(e.link_faces) == 1]
    if edges:
        bmesh.ops.holes_fill(bm, edges=edges, sides=0)
    bm.to_mesh(ob.data); bm.free()
    ob.data.update()


def export_and_render(name, ob, front='-Y'):
    close_holes(ob)
    tris = tri_count(ob.data)
    bb = [Vector(v) for v in ob.bound_box]
    size = [round(max(v[i] for v in bb) - min(v[i] for v in bb), 2) for i in range(3)]
    zmin = round(min(v.z for v in bb), 2); zmax = round(max(v.z for v in bb), 2)
    glb = os.path.join(bk.ROOT, 'assets', 'models', 'rome', name + '.glb')
    os.makedirs(os.path.dirname(glb), exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active = ob
    bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB', use_selection=True, export_yup=True,
                              export_apply=True, export_normals=True, export_texcoords=False, export_materials='EXPORT',
                              export_cameras=False, export_lights=False)
    files = render_previews(ob, name, front)
    print('ASSET_REPORT %s triangles=%d size=%s z=[%s, %s] open_edges=%d glb=%s renders=%s' % (
        name, tris, size, zmin, zmax, open_edges(ob.data), glb, os.path.dirname(files[0])))


def rock_a():
    """Three stacked ledge masses: a 12 x 8 m base ledge (top 2 m), a 9 x 7 m ledge (top 3.6 m), a 6 x 5 m top bench (5 m)."""
    reset()
    rnd = random.Random(101)
    m1 = blob('ra1', (0.0, 0.0, 0.5), (12.5, 8.5, 6.0), 1, target=320,
              cuts=[((0.0, 0.0, 2.0), (0.0, 0.0, 1.0)),
                    ((5.9, 0.0, 0.0), (1.0, 0.1, 0.0)),
                    ((-5.9, 0.0, 0.0), (-1.0, 0.0, 0.0)),
                    ((0.0, -3.9, 0.0), (0.0, -1.0, 0.05))])
    m2 = blob('ra2', (-1.2, -0.6, 1.5), (9.5, 6.8, 5.0), 2, target=240,
              cuts=[((0.0, 0.0, 3.6), (0.0, 0.0, 1.0)),
                    ((0.0, 2.2, 0.0), (0.0, 1.0, 0.05)),
                    ((-5.6, 0.0, 0.0), (-1.0, 0.0, 0.0)),
                    ((3.0, 0.0, 0.0), (1.0, 0.0, 0.0))])
    m3 = blob('ra3', (-2.2, -0.8, 3.4), (5.8, 4.8, 3.6), 3, target=180,
              cuts=[((0.0, 0.0, 5.0), (0.0, 0.0, 1.0)),
                    ((0.0, -2.6, 0.0), (0.0, -1.0, 0.1)),
                    ((0.4, 0.0, 0.0), (1.0, 0.0, 0.0))])
    ob = union_all([m1, m2, m3], 'rome_rock_a')
    paint(ob, 11)
    human(Frame(), 9.0, -5.5, 0.0)
    export_and_render('rome_rock_a', ob)


def rock_b():
    """One tall mass, 8.4 x 6 m, top at 8 m: a near-vertical cliff face on the south side (leaning back 6 degrees),
    a flat ledge near the top, and joint facets on the other sides."""
    reset()
    ob = blob('rome_rock_b', (0.0, 0.0, 3.0), (10.0, 8.0, 11.0), 7, target=900,
              cuts=[((0.0, -3.0, 0.0), (0.0, -1.0, 0.10)),     # cliff face, nearly vertical
                    ((0.0, 0.0, 8.0), (0.0, 0.0, 1.0)),        # ledge near the top
                    ((4.2, 0.0, 0.0), (1.0, 0.0, 0.0)),        # east joint facet
                    ((-4.2, 0.0, 0.0), (-1.0, 0.0, 0.0)),      # west joint facet
                    ((0.0, 3.0, 0.0), (0.0, 1.0, 0.0))])       # north joint facet
    paint(ob, 12)
    human(Frame(), 9.0, -4.0, 0.0)
    export_and_render('rome_rock_b', ob)


def rock_c():
    """Four masses of 2 to 3 m in a 5 x 4 m cluster, tops at 1.4 to 3.0 m, each with a flat top facet."""
    reset()
    specs = [(-1.0, -0.5, 2.8, 2.6, 3.0), (1.3, -0.7, 2.2, 2.0, 2.1),
             (0.5, 1.1, 2.4, 2.2, 2.5), (-2.0, 1.2, 2.0, 1.8, 1.4)]
    objs = []
    for i, (cx, cy, sx, sy, top) in enumerate(specs):
        sz = top + 1.8                       # bottom at top - sz = -1.8 (below BASE, cut flat), top at `top`
        zc = top - sz / 2
        rnd = random.Random(40 + i)
        c = (cx, cy, zc); s = (sx, sy, sz)
        cuts = [((cx, cy, top - 0.25), (0.0, 0.0, 1.0)), rand_cut(rnd, c, s), rand_cut(rnd, c, s)]
        objs.append(blob('rc%d' % (i + 1), c, s, 21 + i, cuts=cuts, target=200))
    ob = union_all(objs, 'rome_rock_c')
    paint(ob, 13)
    human(Frame(), 4.5, -3.0, 0.0)
    export_and_render('rome_rock_c', ob)


rock_a()
rock_b()
rock_c()
