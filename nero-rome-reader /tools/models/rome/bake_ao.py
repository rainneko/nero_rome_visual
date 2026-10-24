"""Bake per-vertex ambient occlusion into one Rome GLB (Blender 5.2, Cycles on CPU, background mode).

One input per run. Reads assets/models/rome/<name>.glb and writes assets/models/rome_ao/<name>.glb: the same mesh
objects, material names and transforms, plus one colour attribute "AO" (CORNER, BYTE_COLOR) exported as COLOR_0.
The source folder is never written.

Bake: Cycles, CPU, 32 samples, denoising off, AO distance 3 m (World > Light Settings > Distance), bake target
VERTEX_COLORS, bpy.ops.object.bake(type='AO') on all mesh objects. No ground plane.

Buried corners: a corner inside solid geometry gets AO 0 and drags the faces around it to black (long triangles whose
ends run into a block). repair_buried_corners() fixes that on open faces without changing the mesh; see its docstring.

  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/bake_ao.py" -- rome_castor
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/bake_ao.py" -- rome_castor --check

Options after the name: --out DIR (default assets/models/rome_ao), --check (re-import <out>/<name>.glb, print the AO
statistics, render the AO colours (Workbench, vertex colour) to renders/_ao_test/<short name>_ao.png).
"""
import argparse, math, os, random, sys, time
import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
SRC_DIR = os.path.join(ROOT, 'assets', 'models', 'rome')
OUT_DIR = os.path.join(ROOT, 'assets', 'models', 'rome_ao')
TEST_DIR = os.path.join(ROOT, 'renders', '_ao_test')

AO_NAME = 'AO'
AO_DISTANCE = 3.0     # metres; the Cycles AO bake reads World > Light Settings > Distance
AO_FACTOR = 1.0       # World > Light Settings > Factor (full AO, no blending with white)
AO_SAMPLES = 32       # CPU samples per vertex
BURIED = 0.25         # a corner below this is mostly blocked: it sits inside or against solid geometry
MIN_OPEN = 0.2        # a face is repaired only if at least this share of its centre's rays is free


def _args():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    p = argparse.ArgumentParser(prog='bake_ao.py')
    p.add_argument('name', help='asset name, e.g. rome_castor (with or without .glb)')
    p.add_argument('--check', action='store_true', help='re-import the baked GLB, print stats, render a preview')
    p.add_argument('--out', default=OUT_DIR, help='output folder')
    p.add_argument('--distance', type=float, default=AO_DISTANCE, help='AO distance in metres (default 3)')
    p.add_argument('--preview', default=None, help='preview PNG for --check (default renders/_ao_test/<short>_ao.png)')
    a = p.parse_args(argv)
    if a.name.endswith('.glb'):
        a.name = a.name[:-4]
    return a


def reset():
    """Factory empty scene, metric units."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.unit_settings.system = 'METRIC'


def import_glb(path):
    bpy.ops.import_scene.gltf(filepath=path)
    return [o for o in bpy.context.scene.objects if o.type == 'MESH']


def tri_count(meshes):
    return sum(len(p.vertices) - 2 for ob in meshes for p in ob.data.polygons)


def _hemisphere(n, rng):
    """A random unit vector in the hemisphere around n."""
    while True:
        v = Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-1, 1)))
        if 0.0 < v.length <= 1.0:
            v.normalize()
            return v if v.dot(n) >= 0 else -v


def repair_buried_corners(meshes):
    """A corner with AO near 0 means almost every ray hit geometry within AO_DISTANCE: the corner lies inside solid
    (a wall end, a long sliver running into a block), so the vertex sees nothing, and every face that uses it
    interpolates to black even where the face itself is open. For such a corner on a face whose centre is at least
    MIN_OPEN free (32 rays, AO distance), the corner takes the mean of the face's usable corners, or the centre's
    openness if it has none. Faces whose centre is closed (real crevices, hidden faces) keep their values.
    Topology, names and transforms are untouched."""
    sc = bpy.context.scene
    dg = bpy.context.evaluated_depsgraph_get()
    rng = random.Random(1)
    rays = 32
    for ob in meshes:
        me = ob.data
        layer = me.color_attributes[AO_NAME]
        n_faces = n_corners = 0
        for poly in me.polygons:
            loops = list(poly.loop_indices)
            vals = [layer.data[li].color[0] for li in loops]
            if min(vals) >= BURIED:
                continue
            c, n = poly.center, poly.normal
            hits = 0
            for _ in range(rays):
                if sc.ray_cast(dg, c + n * 0.01, _hemisphere(n, rng), distance=AO_DISTANCE)[0]:
                    hits += 1
            openness = 1.0 - hits / rays
            if openness < MIN_OPEN:
                continue
            good = [v for v in vals if v >= BURIED]
            fill = sum(good) / len(good) if good else openness
            for li, v in zip(loops, vals):
                if v < BURIED:
                    layer.data[li].color = (fill, fill, fill, 1.0)
                    n_corners += 1
            n_faces += 1
        print('AO_REPAIR', ob.name, 'faces', n_faces, 'corners', n_corners)


def add_ao_layers(meshes):
    """One CORNER BYTE_COLOR layer 'AO' per mesh, made the active and the render colour layer."""
    for ob in meshes:
        ca = ob.data.color_attributes
        if AO_NAME in ca:
            ca.remove(ca[AO_NAME])
        ca.new(name=AO_NAME, type='BYTE_COLOR', domain='CORNER')
        idx = ca.find(AO_NAME)
        ca.active_color_index = idx
        ca.render_color_index = idx


def bake_ao(meshes):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    cy = sc.cycles
    cy.device = 'CPU'
    cy.samples = AO_SAMPLES
    cy.use_denoising = False
    cy.bake_type = 'AO'
    if sc.world is None:
        sc.world = bpy.data.worlds.new('AO_bake')
    sc.world.light_settings.distance = AO_DISTANCE
    sc.world.light_settings.ao_factor = AO_FACTOR
    rb = sc.render.bake
    rb.target = 'VERTEX_COLORS'
    rb.use_clear = True
    rb.use_selected_to_active = False
    bpy.ops.object.select_all(action='DESELECT')
    for ob in meshes:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.bake(type='AO')


def export_glb(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=path, export_format='GLB', use_selection=True,
        export_yup=True, export_apply=True, export_normals=True, export_texcoords=False,
        export_materials='EXPORT', export_cameras=False, export_lights=False,
        export_vertex_color='ACTIVE', export_all_vertex_colors=False)


def _pct(vals, p):
    k = min(len(vals) - 1, max(0, int(round(p / 100.0 * (len(vals) - 1)))))
    return vals[k]


def ao_stats(meshes):
    vals = []
    for ob in meshes:
        ca = ob.data.color_attributes
        for a in ca:
            print('AO_CHECK', ob.name, 'layer', a.name, a.domain, a.data_type, 'len', len(a.data))
        if AO_NAME in ca:
            layer = ca[AO_NAME]
        elif len(ca):
            layer = ca[0]
        else:
            print('AO_CHECK', ob.name, 'NO colour layer')
            continue
        vals.extend(d.color[0] for d in layer.data)
    vals.sort()
    if not vals:
        return
    mean = sum(vals) / len(vals)
    print('AO_RANGE min %.3f p1 %.3f p5 %.3f p50 %.3f p95 %.3f p99 %.3f max %.3f mean %.3f n %d'
          % (vals[0], _pct(vals, 1), _pct(vals, 5), _pct(vals, 50), _pct(vals, 95), _pct(vals, 99),
             vals[-1], mean, len(vals)))


def render_preview(meshes, out_png):
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_WORKBENCH'
    sh = sc.display.shading
    sh.light = 'FLAT'
    sh.color_type = 'VERTEX'
    sh.background_type = 'WORLD'
    if sc.world is None:
        sc.world = bpy.data.worlds.new('AO_check')
    sc.world.color = (0.55, 0.55, 0.57)
    sc.view_settings.view_transform = 'Standard'
    sc.render.resolution_x = 1400
    sc.render.resolution_y = 1000
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'PNG'
    sc.render.filepath = out_png

    pts = [ob.matrix_world @ Vector(c) for ob in meshes for c in ob.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    centre = (lo + hi) / 2
    size = (hi - lo).length
    az, el = math.radians(28), math.radians(10)      # front (-Y) quarter view, low, so soffits show
    dist = size * 0.9
    loc = centre + Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el))) * dist
    cam_data = bpy.data.cameras.new('AO_check_cam')
    cam_data.lens = 35
    cam = bpy.data.objects.new('AO_check_cam', cam_data)
    sc.collection.objects.link(cam)
    cam.location = loc
    cam.rotation_euler = (centre - loc).to_track_quat('-Z', 'Y').to_euler()
    sc.camera = cam
    os.makedirs(os.path.dirname(out_png), exist_ok=True)
    bpy.ops.render.render(write_still=True)


def check(name, out_dir, preview):
    path = os.path.join(out_dir, name + '.glb')
    reset()
    meshes = import_glb(path)
    print('AO_CHECK file', path, 'meshes', len(meshes), 'tris', tri_count(meshes))
    ao_stats(meshes)
    short = name[len('rome_'):] if name.startswith('rome_') else name
    out_png = preview or os.path.join(TEST_DIR, short + '_ao.png')
    render_preview(meshes, out_png)
    print('AO_PREVIEW', out_png)


def main():
    global AO_DISTANCE
    a = _args()
    AO_DISTANCE = a.distance
    if a.check:
        check(a.name, a.out, a.preview)
        return
    src = os.path.join(SRC_DIR, a.name + '.glb')
    out = os.path.join(a.out, a.name + '.glb')
    if not os.path.isfile(src):
        raise SystemExit('missing input ' + src)
    t0 = time.time()
    reset()
    meshes = import_glb(src)
    if not meshes:
        raise SystemExit('no mesh objects in ' + src)
    tris = tri_count(meshes)
    add_ao_layers(meshes)
    t1 = time.time()
    bake_ao(meshes)
    t2 = time.time()
    repair_buried_corners(meshes)
    ao_stats(meshes)
    export_glb(out)
    print('BAKE_REPORT %s meshes %d tris %d bake_s %.1f total_s %.1f out %s'
          % (a.name, len(meshes), tris, t2 - t1, time.time() - t0, out))


main()
