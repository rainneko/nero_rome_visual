"""rome_cavea_pavilion: a rome_cavea_s module with a 12 m pavilion in the middle (the page swaps it in every 100-150 m).

ALIGNMENT (same as rome_cavea_s, so it swaps in one-for-one): footprint x -16.8..16.8, y -21..21 (arena at -y, street
at +y), z = 0 = arena level; wood tier z 13..18; gallery floor z 18; gallery roof top z 25 (y 20.5); street facade
floors at z 8, 15, 21; attic top z 25.
PAVILION: x -6..6 (12 m), y 13..21 on the street side; base z 18..25 over the gallery's middle bay; two storeys above
the gallery roof, z 25..30 and 30..35 (arched walls, storey 1 with three tuscan columns in front); wooden balcony at
z 30 with a marble railing (top z 31) and a red cloth hanging below it; hip roof, eaves z 35, apex about z 37.1;
taller arched portal on the street ground floor, x -3..3, opening 3.6 m wide, crown z 8.6 (the rome_cavea_s shops stay
on either side). No inside stair is built.
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rome_cavea_s as S                 # the straight module: its build_module() gives the whole footprint and section
from rk import *                         # noqa: F401,F403  Frame, box, arcade, column, balcony, balustrade, hip_roof, ...
import bl_kit as _bk
import bpy

NAME = 'rome_cavea_pavilion'


def build_pavilion():
    S.build_module()
    F = Frame()
    box(F, 0, 16.5, 18.0, 12.0, 7.0, 7.0, 'travertine')          # base z 18..25, y 13..20
    box(F, 0, 16.5, 25.0, 12.0, 7.0, 5.0, 'travertine')          # storey 1 core z 25..30
    arcade(F, 6.0, 20.5, -6.0, 20.5, 25.0, 5.0, 1.0, 2, 'travertine', open_w=2.8, open_h=4.0, back='dark')
    for x in (-5.5, 0.0, 5.5):                                    # tuscan columns in front of storey 1
        column(F, x, 21.6, 25.0, 5.0, 0.35, 'marble', 'tuscan', 0, 10)
    box(F, 0, 16.5, 30.0, 12.0, 7.0, 5.0, 'travertine')          # storey 2 core z 30..35
    arcade(F, 6.0, 20.5, -6.0, 20.5, 30.0, 5.0, 1.0, 2, 'travertine', open_w=2.4, open_h=3.4, back='dark')
    balcony(F, 3.0, 21.0, -3.0, 21.0, 30.0, depth=1.1, mat='wood', roof=False)
    balustrade(F, -3.0, 22.1, 3.0, 22.1, 30.0, 1.0, 'marble', 2.2, 0.28)
    box(F, 0, 22.15, 27.0, 4.0, 0.05, 3.0, 'cloth')              # cloth hanging below the rail
    hip_roof(F, 0, 17.0, 35.0, 12.0, 8.0, pitch=25.0, overhang=0.6, mat='tile')
    arcade(F, 3.0, 21.5, -3.0, 21.5, 0.0, 10.0, 1.0, 1, 'travertine', open_w=3.6, open_h=8.6, back='dark')


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
    build_pavilion()
    ob = _bk._build_object(NAME)
    tris = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    bb = [Vector(c) for c in ob.bound_box]
    size = [round(max(v[i] for v in bb) - min(v[i] for v in bb), 2) for i in range(3)]
    glb = os.path.join(_bk.ROOT, 'assets', 'models', 'rome', NAME + '.glb')
    export_glb(ob, glb)
    try:
        bpy.context.scene.eevee.taa_render_samples = 16      # low samples: previews only, memory is tight
    except Exception:
        pass
    files = render_previews(ob, NAME, '-Y', extra=(('street', Vector((0.0, 1.0, 0.0)), 12),))
    info = {'asset': NAME, 'triangles': tris, 'size_xyz_m': size,
            'z_min': round(min(v.z for v in bb), 2), 'z_max': round(max(v.z for v in bb), 2),
            'glb': glb, 'glb_kb': round(os.path.getsize(glb) / 1024), 'renders': files}
    print('ASSET_REPORT ' + json.dumps(info, ensure_ascii=False))


if __name__ == '__main__':
    main()
