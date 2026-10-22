"""Close-up test renders of the central gate alone (renders/rome_circus_carceres/gate_*.png). Not an asset:
it builds only build_gate() from rome_circus_carceres_gate.py and writes no GLB.
Run: /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_circus_carceres_gate_closeup.py"
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from rk import *
from bl_kit import _build_object, _preview_scene, _look
from rome_circus_carceres_gate import build_gate

reset()
build_gate(Frame())
preview_ground(-1.0)
ob = _build_object('rome_circus_carceres_gate')
print('GATE_TRIS', sum(len(p.vertices) - 2 for p in ob.data.polygons))
ctr, R, mn, mx, fdir, sdir = _preview_scene(ob, '-Y')
sc = bpy.context.scene
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
sc.collection.objects.link(cam)
sc.camera = cam
cam.data.lens = 35
cam.data.clip_end = 2000
out = os.path.join(ROOT, 'renders', 'rome_circus_carceres')
os.makedirs(out, exist_ok=True)
sc.render.resolution_x, sc.render.resolution_y = 1280, 720
sc.eevee.taa_render_samples = 16
SHOTS = [
    ('gate_close', (-9.0, -27.0, 15.0), (0.0, -8.0, 12.5)),
    ('gate_quadriga', (-10.0, -18.0, 29.0), (0.0, 0.0, 22.5)),
    ('gate_street', (0.0, 36.0, 6.0), (0.0, 9.0, 3.0)),
]
for nm, pos, tgt in SHOTS:
    cam.location = Vector(pos)
    _look(cam, Vector(tgt))
    sc.render.filepath = os.path.join(out, nm + '.png')
    bpy.ops.render.render(write_still=True)
    print('GATE_SHOT', sc.render.filepath)
