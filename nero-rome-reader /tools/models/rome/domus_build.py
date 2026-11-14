"""Export (and render) the four Palatine terrace houses in one Blender process, with checks on the mesh.

  Blender -b --factory-startup --python-exit-code 1 -P tools/models/rome/domus_build.py -- --no-render

GLBs go to assets/models/rome/, review renders (without --no-render) to renders/palatine/domus-garden-stair/."""

import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
OUT = ROOT / "renders/palatine/domus-garden-stair"
sys.path.insert(0, str(HERE))
import rome_domus_a as domus
import bl_kit as kit

VARIANTS = (
    ("rome_domus_a_belt", "plaster2", False, True),
    ("rome_domus_b_belt", "plaster3", True, True),
    ("rome_domus_a", "plaster2", False, False),
    ("rome_domus_b", "plaster3", True, False),
)


def check_access(ob):
    """Check the mesh itself: the open central bay, every tread of the garden stair, the landings, the parapets."""
    vertices = [v.co for v in ob.data.vertices]
    faces = [tuple(p.vertices) for p in ob.data.polygons]
    tree = BVHTree.FromPolygons(vertices, faces, all_triangles=False)
    D = domus

    def hits(origin, direction, distance):
        return tree.ray_cast(Vector(origin), Vector(direction), distance)[0]

    def floor(x, y, z, what):
        hit = hits((x, y, z + 1.65), (0, 0, -1), 1.80)
        assert hit is not None and abs(hit.z - z) < 0.004, (what, x, y, z, hit)

    for x in (-1.45, -0.7, 0.0, 0.7, 1.45):                       # central bay: open from the landing into the house
        for z in (0.28, 1.45, 2.8, 3.25):
            assert hits((x, -2.85, z), (0, 1, 0), 5.35) is None, ("entrance", x, z)
    assert hits((0, 3.4, 2.3), (0, 1, 0), 1.7), "dining room lattice should be visible"
    for x in (-8.0, -5.5, -3.2, 3.2, 5.5, 8.0):                   # lower parapet between the columns, 1 m
        hit = hits((x, -2.19, 2.0), (0, 0, -1), 1.5)
        assert hit is not None and abs(hit.z - (D.FLOOR + 1.0)) < 0.004, ("porch parapet", x, hit)
    for k in range(1, D.ENTRY_STEPS):                              # six risers on the axis
        y = D.PORCH_EDGE - (k - 0.5) * D.ENTRY_TREAD
        for x in (-1.5, 0, 1.5):
            floor(x, y, D.FLOOR - k * D.ENTRY_RISE, "entry stair")
    for x in (-1.5, 0, 1.5):                                       # landing before the bay
        for y in (D.ENTRY_FOOT - 0.2, D.BAND_A[0] + 0.2) + ((sum(D.BAND_A) / 2,) if x else ()):
            floor(x, y, D.LANDING_Z, "landing")
    treads = 0
    for side in (-1, 1):
        for k in range(1, D.STAIR_RISERS):
            for y in (D.BAND_A[0] + 0.15, sum(D.BAND_A) / 2, D.BAND_A[1] - 0.15):      # upper flight
                floor(side * (D.CORE_X + (k - 0.5) * D.STAIR_TREAD), y, D.LANDING_Z - k * D.STAIR_RISE, "upper flight")
            for y in (D.BAND_B[0] + 0.15, sum(D.BAND_B) / 2, D.BAND_B[1] - 0.15):      # lower flight
                floor(side * (D.STAIR_TURN - (k - 0.5) * D.STAIR_TREAD), y, D.STAIR_MID - k * D.STAIR_RISE, "lower flight")
            treads += 2
        for y in (D.BAND_B[0] + 0.3, D.BAND_B[1] + 0.15, D.BAND_A[1] - 0.3):           # half-landing, open between the bands
            floor(side * (D.STAIR_TURN + 0.65), y, D.STAIR_MID, "half-landing")
        assert hits((side * (D.STAIR_TURN + 0.65), D.BAND_B[0] + 0.3, D.STAIR_MID + 1.2), (0, 1, 0), 2.2) is None, "turn"
        floor(side * (D.CORE_X - 0.5), sum(D.BAND_B) / 2, D.T1, "foot on T1")            # the foot, beside the niche
        # headroom over both flights and at the foot (nothing within 2.2 m above the walking line)
        for k in (1, 6, 12):
            for x, y, z in ((D.CORE_X + (k - 0.5) * D.STAIR_TREAD, sum(D.BAND_A) / 2, D.LANDING_Z - k * D.STAIR_RISE),
                            (D.STAIR_TURN - (k - 0.5) * D.STAIR_TREAD, sum(D.BAND_B) / 2, D.STAIR_MID - k * D.STAIR_RISE)):
                assert hits((side * x, y, z + 0.1), (0, 0, 1), 2.2) is None, ("headroom", side, k)
    # the niche is closed at the back (0.55 m deep) and the stair's face has no other opening
    hit = hits((0, D.BAND_B[0], D.T1 + 1.5), (0, 1, 0), 6.0)
    assert hit is not None and abs(hit.y - (D.BAND_A[0] + 0.25 - 0.06)) < 0.01, ("niche back", hit)
    for x in (-7.0, -5.0, -3.0, 3.0, 5.0, 7.0):
        for z in (D.T1 + 0.3, D.T1 + 0.75):
            hit = hits((x, D.STAIR_FRONT - 0.2, z), (0, 1, 0), 2.0)
            assert hit is not None and abs(hit.y - D.STAIR_FRONT) < 0.01, ("solid front", x, z, hit)
    # The most forward edge of each end room stands on its own masonry cheek.
    for x in (-14.66, -12.20, -9.62, 9.62, 12.20, 14.66):
        hit = hits((x, D.PAVILION_Y - 0.06, -0.02), (0, 0, -1), 0.25)
        assert hit is not None and abs(hit.z + 0.14) < 0.004, ("end room support", x)
    return {"entry_rays": 20, "stair_treads": treads, "entry_risers": D.ENTRY_STEPS,
            "stair_risers_per_flight": D.STAIR_RISERS, "stair_rise_m": round(D.STAIR_RISE, 4)}


def render_views(ob, name, front):
    dest = OUT / name
    dest.mkdir(parents=True, exist_ok=True)
    centre, _, lo, hi, _, _ = kit._preview_scene(ob, front)
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 12
    scene.cycles.use_denoising = True
    scene.render.threads_mode = 'FIXED'
    scene.render.threads = 4
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 760
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.view_settings.exposure = -0.12
    bpy.data.objects["sun"].data.angle = 0.065
    bpy.data.objects["sun"].data.energy = 3.1
    scene.world.node_tree.nodes["Background"].inputs[1].default_value = 1.0
    cam = bpy.data.objects.new("Review camera", bpy.data.cameras.new("Review camera"))
    scene.collection.objects.link(cam)
    scene.camera = cam
    corners = [Vector((x, y, z)) for x in (lo.x, hi.x) for y in (lo.y, hi.y) for z in (lo.z, hi.z)]
    views = {
        "front": (0, -1, 0.23), "west": (-1, -0.13, 0.25),
        "east": (1, -0.13, 0.25), "rear": (0, 1, 0.32), "top": (0, 0, 1),
    }
    for label, direction in views.items():
        d = Vector(direction).normalized()
        cam.location = centre + 90*d
        if label == "top":
            cam.rotation_euler = (0, 0, 0)
        else:
            kit._look(cam, centre)
        quat = cam.rotation_euler.to_quaternion()
        h, v = quat @ Vector((1,0,0)), quat @ Vector((0,1,0))
        xs, ys = [p.dot(h) for p in corners], [p.dot(v) for p in corners]
        cam.data.type = "ORTHO"
        cam.data.ortho_scale = 1.10*max(max(xs)-min(xs), (max(ys)-min(ys))*1200/760)
        scene.render.filepath = str(dest / (label + ".png"))
        bpy.ops.render.render(write_still=True)
        print("VILLA_RENDER", name, label, flush=True)

    if name.endswith("_belt"):
        views = {
            "corner": ((32,-44,13),(0,-4,1.4),50),
            "entry": ((0.0,-5.2,0.75),(0,1.1,3.3),21),
            "stair": ((0.0,-17.5,-2.6),(0,-4.0,-3.2),24),
            "stair_side": ((15.5,-13.0,-1.0),(2.5,-5.0,-3.6),30),
            "above": ((0.0,-19.0,13.0),(0,-5.5,-3.0),30),
        }
        for label, (location, target, lens) in views.items():
            cam.data.type = "PERSP"
            cam.data.lens = lens
            cam.location = Vector(location)
            kit._look(cam, target)
            scene.render.filepath = str(dest / (label + ".png"))
            bpy.ops.render.render(write_still=True)
            print("VILLA_RENDER", name, label, flush=True)


def deliver(name, front="-Y"):
    ob = kit._build_object(name)
    tris = sum(len(face.vertices)-2 for face in ob.data.polygons)
    assert tris <= 28000, (name, tris)
    bounds = [[round(float(f(v[i] for v in ob.bound_box)), 4) for i in range(3)] for f in (min,max)]
    checks = check_access(ob)
    model = ROOT / "assets/models/rome" / (name + ".glb")
    bpy.ops.export_scene.gltf(
        filepath=str(model), export_format="GLB", use_selection=True, export_yup=True,
        export_apply=True, export_normals=True, export_texcoords=False, export_materials="EXPORT",
        export_cameras=False, export_lights=False,
    )
    report = {"asset": name, "triangles": tris, "bounds_blender_m": bounds, "bytes": model.stat().st_size, **checks}
    print("VILLA_REPORT " + json.dumps(report), flush=True)
    if "--no-render" not in sys.argv:
        render_views(ob, name, front)


if __name__ == "__main__":
    domus.finish = deliver
    selected = [v for v in VARIANTS if not any(a.startswith("rome_domus_") for a in sys.argv)
                or v[0] in sys.argv]
    for name, wall, belvedere, belt in selected:
        domus.house(name, wall, belvedere, belt)
