"""rome_cavea_s · straight stand module of the Circus Maximus (33.6 m long, 42 m deep).

Arena on the -Y side (arena wall outer face y -21), street facade on the +Y side (outer face y +21). z = 0 = arena level.
Lower stone seats (14 marble rows, two stone stair aisles at x +-8.4), a walkway with a parapet and two dark
vomitoria, wooden seats on a timber frame (16 rows, z 13 -> 18), a covered gallery on tuscan columns, and a
three-storey arcaded facade (shops, arches, arches with dark backs, attic). Solid tuff fills the stands.

END_CAPS = True adds thin tuff caps on the two open short ends to the RENDERS only (a separate preview object).
The exported GLB never contains them, i.e. the GLB is the same as with END_CAPS = False.
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                     # noqa: F401,F403  Frame, box, wall, arcade, taberna_front, column, lean_roof, ...
import bl_kit as _bk                 # _G buffers, _build_object, ROOT (private helpers of the kit)
import bpy

NAME = 'rome_cavea_s'
END_CAPS = True                      # preview only; the GLB is always exported without the caps

HX = 16.8                            # half length: x -16.8 .. 16.8


def build_module():
    F = Frame()

    # arena wall (outer face y -21) with a bronze lattice rail on top
    wall(F, -HX, -20.5, HX, -20.5, 0.0, 3.2, 1.0, 'marble')
    lattice_rail(F, -HX + 0.2, -20.5, HX - 0.2, -20.5, 3.2, 1.05, 'bronze', 'marble', 3.0, 0.9)

    # lower stone seats: 14 rows (y -20 .. -6), 0.45 m rise each, z 3.2 -> 9.5, on a tuff base
    box(F, 0.0, -13.0, 0.0, 2 * HX, 14.0, 3.2, 'tuff')
    for i in range(14):
        y0 = -20.0 + i
        top = 3.2 + 0.45 * (i + 1)
        for xa, xb in ((-HX, -9.0), (-7.8, 7.8), (9.0, HX)):          # the gaps are the two stair aisles
            box(F, (xa + xb) / 2, y0 + 0.5, 3.2, xb - xa, 1.0, top - 3.2, 'marble')
    # stair aisles: 28 small stone steps (rise 0.225, run 0.5) from z 3.2 up to 9.5
    for sx in (-8.4, 8.4):
        for k in range(28):
            ya = -20.0 + 0.5 * k
            top = 3.2 + 0.225 * (k + 1)
            box(F, sx, ya + 0.25, 3.2, 1.2, 0.5, top - 3.2, 'stone')

    # walkway y -6 .. -4 at z 9.5; parapet 1 m high on its back edge, gaps in front of the vomitoria
    box(F, 0.0, -5.0, 0.0, 2 * HX, 2.0, 9.3, 'tuff')
    box(F, 0.0, -5.0, 9.3, 2 * HX, 2.0, 0.2, 'paving')
    for xa, xb in ((-HX + 0.3, -10.2), (-6.6, 6.6), (10.2, HX - 0.3)):
        wall(F, xa, -4.25, xb, -4.25, 9.5, 1.0, 0.5, 'stone')
    # back wall of the walkway: solid up to 9.5, then a wall (z 9.5 -> 13) with two dark arched vomitoria
    box(F, 0.0, -3.7, 0.0, 2 * HX, 0.6, 9.5, 'stone')
    arcade(F, -HX, -3.7, HX, -3.7, 9.5, 3.5, 0.6, 2, 'stone', open_w=3.0, open_h=3.2, back='dark')

    # tuff core under the wooden stand (y -3.4 .. 13, up to z 13)
    box(F, 0.0, 4.8, 0.0, 2 * HX, 16.4, 13.0, 'tuff')
    # wooden seats: 16 rows (y -4 .. 13), 0.3125 rise each, z 13 -> 18; benches on stepped tuff, timber posts on the risers
    for j in range(16):
        y0 = -4.0 + j * (17.0 / 16.0)
        top = 13.0 + 0.3125 * (j + 1)
        top_prev = 13.0 + 0.3125 * j
        box(F, 0.0, y0 + 0.53125, 13.0, 2 * HX, 17.0 / 16.0, top - 0.12 - 13.0, 'tuff')    # tuff core behind the frame
        box(F, 0.0, y0 + 0.48125, top - 0.12, 2 * HX, 1.1625, 0.12, 'wood')                # bench
        box(F, 0.0, y0, top_prev, 2 * HX, 0.1, top - 0.12 - top_prev, 'wood')              # timber riser boards
        if j:
            for x in (-14.0, -10.0, -6.0, -2.0, 2.0, 6.0, 10.0, 14.0):
                box(F, x, y0 - 0.1, top_prev, 0.2, 0.2, top - 0.12 - top_prev, 'wood')     # posts on the risers

    # top gallery y 13 .. 20 at z 18: solid tuff core, marble floor, 8 tuscan columns (5 m), lean-to tile roof
    box(F, 0.0, 16.5, 0.0, 2 * HX, 7.0, 17.6, 'tuff')
    box(F, 0.0, 16.5, 17.6, 2 * HX, 7.0, 0.4, 'marble')
    for k in range(8):
        column(F, -14.7 + 4.2 * k, 13.6, 18.0, 5.0, 0.42, 'marble', 'tuscan', 0, 10)
    lean_roof(F, -HX, 20.5, HX, 20.5, 25.0, 7.5, 2.0, 'tile', True, 'tile2')

    # street facade (outer face y 21): ground floor shops, two arcaded storeys, attic, cornices
    wall(F, HX, 19.95, -HX, 19.95, 0.0, 8.0, 1.0, 'travertine')               # ground-floor core (faces 19.45 .. 20.45)
    taberna_front(F, HX, 20.45, -HX, 20.45, 0.0, 6, h=8.0, mat='travertine', depth=0.5)   # 6 shops, lintels to y 21
    arcade(F, HX, 20.5, -HX, 20.5, 8.0, 7.0, 1.0, 6, 'travertine', open_w=3.2, open_h=6.2, back='dark')
    arcade(F, HX, 20.5, -HX, 20.5, 15.0, 6.0, 1.0, 6, 'travertine', open_w=2.8, open_h=5.0, back='dark')
    wall(F, HX, 20.5, -HX, 20.5, 21.0, 4.0, 1.0, 'travertine')                # attic (faces 20 .. 21), top z 25
    for z in (8.3, 15.3, 21.3):      # the mouldings overhang 0.55 m: line shortened and moved in so they end at 33.6 m and y 21
        cornice(F, HX - 0.55, 20.45, -HX + 0.55, 20.45, z, 0.6, 0.55, 'marble')


# side silhouette (y, z) of the module, used only for the preview caps at the two open ends
CAP_PTS = [(-21.0, 0.0), (21.0, 0.0), (21.0, 25.0), (20.0, 25.0), (13.0, 23.0), (13.0, 18.0), (-2.94, 13.31),
           (-3.4, 13.0), (-4.0, 13.0), (-4.0, 10.5), (-4.5, 10.5), (-4.5, 9.5), (-6.0, 9.5), (-20.0, 3.65),
           (-20.0, 3.2), (-21.0, 3.2)]


def end_caps():
    F = Frame()
    for x in (HX + 0.05, -HX - 0.05):
        pts = [F.p(x, y, z) for (y, z) in CAP_PTS]
        add_poly('tuff', pts)
        add_poly('tuff', list(reversed(pts)))


def export_glb(ob, glb):
    os.makedirs(os.path.dirname(glb), exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB', use_selection=True, export_yup=True,
                              export_apply=True, export_normals=True, export_texcoords=False, export_materials='EXPORT',
                              export_cameras=False, export_lights=False)


def main():
    reset()
    build_module()
    ob = _bk._build_object(NAME)                     # the module itself (no caps): this is what gets exported
    tris = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    bb = [Vector(c) for c in ob.bound_box]
    size = [round(max(v[i] for v in bb) - min(v[i] for v in bb), 2) for i in range(3)]
    glb = os.path.join(_bk.ROOT, 'assets', 'models', 'rome', NAME + '.glb')
    export_glb(ob, glb)
    if END_CAPS:                                     # preview-only caps: a separate object, never exported
        _bk._G.clear()
        end_caps()
        _bk._build_object(NAME + '_endcaps')
    files = render_previews(ob, NAME, '-Y', extra=(('back', Vector((0.6, 1.0, 0.0)), 22),))
    info = {'asset': NAME, 'triangles': tris, 'size_xyz_m': size,
            'z_min': round(min(v.z for v in bb), 2), 'z_max': round(max(v.z for v in bb), 2),
            'glb': glb, 'glb_kb': round(os.path.getsize(glb) / 1024), 'end_caps_in_renders_only': END_CAPS,
            'renders': files}
    print('ASSET_REPORT ' + json.dumps(info, ensure_ascii=False))


if __name__ == '__main__':          # rome_cavea_c imports build_module() and the caps profile from this file
    main()
