"""Four-storey Roman luxury corner insula with an open atrium and continuous street portico.

Run from Blender 5.x with the project layout intact. This file owns its export and Workbench
preview setup so the shared Rome kit remains untouched.
"""
import os
import sys
import json
import math

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *  # noqa: F401,F403
import bpy
import bl_kit as _bk
from mathutils import Vector

NAME = 'rome_lux_corner4'
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT_GLB = os.path.join(ROOT, 'assets', 'models', 'rome', NAME + '.glb')
OUT_BLEND = os.path.join(ROOT, 'renders', NAME, 'asset.blend')
OUT_RENDER = os.path.join(ROOT, 'renders', NAME)


def wall_line(F, a, b, z, h, t, mat):
    """Solid wall on a segment, centred on its plan line."""
    dx, dy = b[0] - a[0], b[1] - a[1]
    L = math.hypot(dx, dy)
    if L > 0.001:
        box(F, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z, L, t, h, mat,
            math.degrees(math.atan2(dy, dx)))


def ring_floor(F, z, mat='paving', hole=7.0, outer=20.0, thick=0.24):
    """Four plate sections leave an actual 7 x 7 m void, rather than covering the court."""
    q, o = hole / 2, outer / 2
    box(F, 0, -(q + o) / 2, z, outer, o - q, thick, mat)
    box(F, 0, (q + o) / 2, z, outer, o - q, thick, mat)
    box(F, -(q + o) / 2, 0, z, o - q, hole, thick, mat)
    box(F, (q + o) / 2, 0, z, o - q, hole, thick, mat)


def arcade_piers(F, a, b, z, h, n, width, arch_h):
    """Stone piers and caps spaced within a true through-arcade."""
    L = math.hypot(b[0] - a[0], b[1] - a[1]); rot = math.degrees(math.atan2(b[1]-a[1], b[0]-a[0]))
    W = F.sub(a[0], a[1], 0, rot); bay = L / n; pier = bay - width
    for i in range(n + 1):
        u = i * bay
        box(W, u, 0, z, min(0.54, pier + 0.06), 0.64, h, 'travertine')
        box(W, u, 0, z, min(0.82, pier + 0.25), 0.84, 0.24, 'plaster2')
        box(W, u, 0, z + h - 0.24, min(0.82, pier + 0.25), 0.84, 0.24, 'plaster2')


def frame_window(F, a, b, z, h, n, w, hh, style='rect'):
    L = math.hypot(b[0] - a[0], b[1] - a[1])
    rot = math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))
    W = F.sub(a[0], a[1], 0, rot)
    # Irregularly spaced, small apertures with a shallow reveal and plain stone lintel.
    row = []
    for i in range(n):
        u = L * (i + 0.5) / n + (0.24 if i % 2 else -0.18)
        row.append((u, 0.82 + (0.16 if i % 2 else 0.0), min(w, 0.82), min(hh, 1.48), 'rect'))
    opening_skin(W, 0, 0, L, 0, z, h, row, mat='plaster3', depth=0.25,
                 inner='dark', reveal_mat='stone', frame_mat='stone')
    for u, zb, ww, hhh, _ in row:
        box(W, u, -0.40, z + zb + hhh, ww + 0.14, 0.12, 0.09, 'stone')
        box(W, u, -0.32, z + zb + 0.08, ww * 0.42, 0.05, hhh - 0.12, 'wood')


def coin_detail(F, x, y, z, mat='porphyry'):
    vdisc(F, x, y, z, 0.27, 0.10, mat, seg=8)
    vdisc(F, x, y - 0.055, z, 0.18, 0.11, 'porphyry', seg=8)


def build():
    reset()
    preview_ground(-1.2)
    F = Frame()
    # Ground plinth and four genuinely separate floor wings around the open court.
    box(F, 0, 0, -1.2, 20.0, 20.0, 1.2, 'tuff')
    ring_floor(F, 0.0, 'travertine', thick=0.22)
    for z in (4.0, 7.2, 10.4, 13.6):
        ring_floor(F, z, 'travertine' if z == 4.0 else 'plaster2', thick=0.24)
    # Interior courtyard walls: facing the 7 x 7 court, with a low fountain and statue.
    for z, h in ((0.0, 4.0), (4.0, 3.2), (7.2, 3.2), (10.4, 3.2)):
        for a, b in (((-3.5,-3.5),(3.5,-3.5)), ((3.5,-3.5),(3.5,3.5)),
                     ((3.5,3.5),(-3.5,3.5)), ((-3.5,3.5),(-3.5,-3.5))):
            wall_line(F, a, b, z, h, 0.34, 'plaster3')
    # Compact Doric peristyle galleries face inward on every occupied level.
    for z, h in ((0.24,3.45),(4.0,2.72),(7.2,2.72),(10.4,2.72)):
        for x in (-3.0,3.0):
            for y in (-2.1,0.0,2.1):
                column(F, x, y, z, h, 0.18, 'travertine', 'doric', seg=8)
        for y in (-3.0,3.0):
            for x in (-2.1,0.0,2.1):
                column(F, x, y, z, h, 0.18, 'travertine', 'doric', seg=8)
    # One short true passage arcade on the front; the rear wall closes its depth.
    front_a, front_b = (-10,-10), (8.5,-10)
    right_a, right_b = (10,-8.5), (10,10)
    _bk.arcade(F, -10, -10, -4.5, -10, 0.0, 3.72, 0.38, 2, mat='plaster2',
               open_w=1.70, open_h=3.05, back=None, impost_mat='stone', keystone=False)
    # Close the remaining street edges with plain plaster walls; only the short front bay is arcade.
    box(F, 2.0, -9.82, 0.0, 13.0, 0.36, 3.85, 'plaster3')
    box(F, 9.82, 0.75, 0.0, 0.36, 18.5, 3.85, 'plaster3')
    # Painted red dado and ochre upper band enrich the private court rather than the street facade.
    for z0, h, mat in ((0.48,0.72,'red'), (1.20,0.18,'plaster2')):
        box(F, 0, -3.30, z0, 6.6, 0.035, h, mat)
        box(F, 0, 3.30, z0, 6.6, 0.035, h, mat)
        box(F, -3.30, 0, z0, 0.035, 6.6, h, mat)
        box(F, 3.30, 0, z0, 0.035, 6.6, h, mat)
    # Ground-floor entrance bays set back behind the portico; solid side and rear walls.
    box(F, -0.5, -7.85, 0.0, 16.5, 0.32, 3.85, 'plaster3')
    box(F, 8.35, 0.0, 0.0, 0.32, 16.5, 3.85, 'plaster3')
    for x in (-6.6, -2.4, 2.0, 6.0):
        box(F, x, -8.07, 0.0, 1.35, 0.10, 2.75, 'wood')
        box(F, x, -8.10, 2.75, 1.65, 0.18, 0.22, 'stone')
    for y in (-3.2, 3.2):
        box(F, 8.55, y, 0.0, 0.10, 0.92, 2.60, 'wood')
        box(F, 8.58, y, 2.60, 0.16, 1.18, 0.20, 'stone')
    # Upper level exterior elevations have real punched windows, varied by storey.
    # Short end returns remain plastered and tie each wing into its inner court.
    for z, h, n, ww, wh, style in ((4.0,3.2,3,0.82,1.40,'rect'),
                                    (7.2,3.2,4,0.72,1.35,'rect'),
                                    (10.4,3.2,3,0.78,1.42,'rect')):
        elevations = (((-10,-9.82),(10,-9.82)), ((9.82,-10),(9.82,10)),
                      ((10,9.82),(-10,9.82)), ((-9.82,10),(-9.82,-10)))
        for a,b in elevations:
            if z == 10.4 and ((a[1] == -9.82 and b[1] == -9.82) or
                              (a[0] == 9.82 and b[0] == 9.82)):
                continue
            frame_window(F, a,b,z,h,n,ww,wh,style)
    # Keep substantial plaster wall on both sides of each three-arch loggia.
    frame_window(F, (-10,-9.82), (-9.2,-9.82), 10.4, 3.2, 1, 0.36, 1.20, 'arch')
    frame_window(F, (-2.2,-9.82), (10,-9.82), 10.4, 3.2, 5, 0.88, 1.60, 'arch')
    frame_window(F, (9.82,-10), (9.82,2.2), 10.4, 3.2, 5, 0.88, 1.60, 'arch')
    frame_window(F, (9.82,9.2), (9.82,10), 10.4, 3.2, 1, 0.36, 1.20, 'arch')
    # Three-bay upper loggias, open through the wall with recessed room walls behind them.
    _bk.arcade(F, -9.2, -9.82, -2.2, -9.82, 10.4, 2.95, 0.34, 3,
               mat='plaster2', open_w=1.72, open_h=2.60, back=None, impost_mat='travertine')
    _bk.arcade(F, 9.82, 2.2, 9.82, 9.2, 10.4, 2.95, 0.34, 3,
               mat='plaster2', open_w=1.72, open_h=2.60, back=None, impost_mat='travertine')
    box(F, -5.7, -8.35, 10.55, 7.0, 0.28, 2.85, 'plaster3')
    box(F, 8.35, 5.7, 10.55, 0.28, 7.0, 2.85, 'plaster3')
    # The two quieter ground-floor elevations are fully enclosed behind the colonnaded streets.
    box(F, 0, 9.80, 0.0, 19.6, 0.36, 3.85, 'plaster3')
    box(F, -9.80, 0, 0.0, 0.36, 19.6, 3.85, 'plaster3')
    # Ground storey stone bases and restrained red dado; broken into facade lengths.
    for a,b in ((front_a,front_b),(right_a,right_b),((10,10),(-10,10)),((-10,10),(-10,-10))):
        band(F, *a, *b, 0.22, h=0.46, proj=0.16, mat='red')
    # Upper street walls remain plain; one small lintel is the only repeated dressing.
    # Four distinct pitched roof wings leave the court uncovered; ridge height stays below 17.5 m.
    gable_roof(F,0,-6.72,13.78,19.2,6.45,22.0,'x',0.42,'tile',False,'tile2','plaster3')
    gable_roof(F,0,6.72,13.78,19.2,6.45,22.0,'x',0.42,'tile',False,'tile2','plaster3')
    gable_roof(F,6.72,0,13.78,19.2,6.45,22.0,'x',0.42,'tile',False,'tile2','plaster3',rot=90)
    gable_roof(F,-6.72,0,13.78,19.2,6.45,22.0,'x',0.42,'tile',False,'tile2','plaster3',rot=90)
    # Eaves with a little vine relief, expressed as warm stone foliage rosettes.
    for x in (-8,-6,-4,4,6,8):
        sphere(F,x,-9.70,3.62,0.13,'hedge',seg=8,rings=5,z_scale=0.55)
    # Court fountain and simple statue on a square pedestal.
    lathe(F,0,0,[(1.00,0.02),(1.00,0.32),(0.76,0.40),(0.76,0.10)],'marble',20,False)
    cyl(F,0,0,0.11,0.75,0.04,'water',20)
    box(F,0,0,0.16,0.42,0.42,0.92,'giallo')
    sphere(F,0,0,1.34,0.23,'marble',seg=10,rings=6,z_scale=1.6)
    cyl(F,0,0,1.55,0.12,0.48,'marble',10,r_top=0.10)
    # Stone window guards: sparse vertical bars, never a continuous dark surface.
    return F


def finish_custom():
    ob = _bk._build_object(NAME)
    tris = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    if tris > 18000:
        raise RuntimeError('triangle budget exceeded: %d' % tris)
    bb = [Vector(c) for c in ob.bound_box]
    mn = [min(v[i] for v in bb) for i in range(3)]
    mx = [max(v[i] for v in bb) for i in range(3)]
    # Export the joined asset only; previews use Workbench material colours, never Eevee.
    os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active = ob
    bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format='GLB', use_selection=True,
                              export_yup=True, export_apply=True, export_normals=True,
                              export_texcoords=False, export_materials='EXPORT',
                              export_cameras=False, export_lights=False)
    os.makedirs(OUT_RENDER, exist_ok=True)
    scene = bpy.context.scene
    if scene.world is None:
        scene.world = bpy.data.worlds.new('RomePreviewWorld')
    scene.world.color = (0.62, 0.64, 0.67)
    scene.render.engine = 'BLENDER_WORKBENCH'
    scene.render.resolution_x = 900; scene.render.resolution_y = 700; scene.render.resolution_percentage = 100
    scene.display.shading.light = 'STUDIO'; scene.display.shading.studio_light = 'paint.sl'
    scene.display.shading.color_type = 'MATERIAL'; scene.display.shading.show_shadows = True
    scene.display.shading.show_cavity = True; scene.display.shading.cavity_type = 'BOTH'
    scene.display.shading.background_type = 'WORLD'; scene.display.shading.show_specular_highlight = True
    scene.render.image_settings.file_format = 'PNG'
    target = Vector((0,0,7.6)); direction = {'front':Vector((0,-1,0)), 'side':Vector((1,0,0)),
                'three':Vector((1,-1,0.62)).normalized(), 'top':Vector((0,0,1))}
    cam_data = bpy.data.cameras.new('RomePreviewCamera'); cam = bpy.data.objects.new('RomePreviewCamera',cam_data)
    scene.collection.objects.link(cam); scene.camera=cam; cam.data.type='ORTHO'; cam.data.ortho_scale=29.5
    cam.data.lens = 52
    for name, d in direction.items():
        if name == 'top':
            cam.location=Vector((0,0,48))
            cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
        else:
            cam.location=target + d*37
            cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
        scene.render.filepath=os.path.join(OUT_RENDER,name+'.png')
        bpy.ops.render.render(write_still=True)
    bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)
    report = {'asset':NAME, 'triangles':tris, 'bbox_xyz_m':[round(mx[i]-mn[i],2) for i in range(3)],
              'bounds_min_xyz_m':[round(x,2) for x in mn], 'bounds_max_xyz_m':[round(x,2) for x in mx],
              'foundation_z_m':round(mn[2],2), 'roof_peak_z_m':round(mx[2],2),
              'glb':OUT_GLB, 'blend':OUT_BLEND,
              'renders':[os.path.join(OUT_RENDER,n+'.png') for n in ('front','side','three','top')]}
    print('ASSET_REPORT '+json.dumps(report,ensure_ascii=False))
    return report


if __name__ == '__main__':
    build()
    finish_custom()
