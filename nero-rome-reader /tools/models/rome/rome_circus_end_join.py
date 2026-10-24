"""rome_circus_end_join: a renders-only check of the join. Imports the GLBs of rome_circus_carceres, rome_circus_end_l and
rome_cavea_s into a fresh scene at the alignment positions (nothing is exported) and renders the junction.

Positions (metres, z = 0 arena level): carceres at the origin (its own coordinates); rome_circus_end_l at x = -97
(carceres-side face x -84, stand-side face x -110); rome_cavea_s at x = -126.8 (its east end at x -110, the block's
stand-side face).
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                      # noqa: F401,F403  Vector, reset, preview_ground, render_previews, ...
import bl_kit as _bk
import bpy

NAME = 'rome_circus_end_join'
PLACE = [('rome_circus_carceres', (0.0, 0.0, 0.0)),
         ('rome_circus_end_l', (-97.0, 0.0, 0.0)),
         ('rome_cavea_s', (-126.8, 0.0, 0.0))]
VIEW = (-146.0, -62.0, -32.0, 26.0, -1.0, 36.0)      # x0, x1, y0, y1, z0, z1 of the framed region


def import_at(name, off):
    before = set(o.name for o in bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(_bk.ROOT, 'assets', 'models', 'rome', name + '.glb'))
    new = [o for o in bpy.data.objects if o.name not in before]
    for o in new:
        if o.parent is None:
            o.location = (o.location.x + off[0], o.location.y + off[1], o.location.z + off[2])
    return new


def main():
    reset()
    preview_ground(-1.0)
    for name, off in PLACE:
        import_at(name, off)
    x0, x1, y0, y1, z0, z1 = VIEW
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2))
    frame = bpy.context.active_object                  # invisible to the renderer: only sets the framing
    frame.name = 'view_frame'
    frame.scale = (x1 - x0, y1 - y0, z1 - z0)
    frame.hide_render = True
    bpy.context.view_layer.update()                    # the framing reads bound_box * matrix_world: refresh them now
    try:
        bpy.context.scene.eevee.taa_render_samples = 16      # low samples: previews only, memory is tight
    except Exception:
        pass
    files = render_previews(frame, NAME, '-Y', extra=(('join_w', Vector((-1.0, -1.0, 0.0)), 14),
                                                     ('street_w', Vector((-0.6, 1.0, 0.0)), 14)))
    print('ASSET_REPORT ' + json.dumps({'asset': NAME, 'renders': files}, ensure_ascii=False))


if __name__ == '__main__':
    main()
