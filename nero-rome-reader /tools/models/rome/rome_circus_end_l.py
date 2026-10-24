"""rome_circus_end_l (and rome_circus_end_r with `-- r`): the tall corner block that closes the stands at the carceres end.

Run as  ... -P rome_circus_end_l.py            -> assets/models/rome/rome_circus_end_l.glb
        ... -P rome_circus_end_l.py -- r       -> assets/models/rome/rome_circus_end_r.glb (mirror image in x)

ALIGNMENT NUMBERS (metres; x east, y north, z = 0 = arena level, the same base level as the stands). The asset origin is
the block centre; the page places end_l at x = -97 and end_r at x = +97, so the carceres-side face is at x = -84 and the
stand-side face at x = -110 (end_l).
  rome_circus_carceres: stall-block terrace (balustrade base) z 12.0, balustrade top 13.0; end towers 16 x 16 at
      x -84..-68 (and +68..+84), y -6..10, top z 24; stall fronts y -8..-5; street ground z -1.0; arena z 0.
  rome_cavea_s section: arena outer face y -21, street outer face y +21; seats from z 3.2, walkway 9.5, wood tier
      z 13..18 (y -4..13), gallery floor 18, gallery roof top 25 (y 20.5); facade floors at z 8, 15, 21.
  this block (end_l local; base z 0 like the stands, no foundation step):
      arena face y -21 is a facade from z 0 to 29: plain podium to z 12, storey A arches z 12..17.6, red band
      17.8..18.1, storey B arches z 18.2..24.8, cornice z 25.0, attic to 29 with a red band at 27.2 and a top cornice.
      Official box (tribunal) on the podium level: floor z 11.5..12.0, x -5..5, front at y -24; two tuscan columns
      (h 11.5); marble railing top z 13.0; red cloth hanging z 9..12.
      Stair inside the block along the stand edge: x -11.5..-8.5, y -8..-4, z 12.0 -> 13.8 in ten 0.18 m steps from the
      terrace level onto the first seat row (y -4..-3, top z 13.8); it is hidden inside the block.
      Seats: none in front of the facade. Stone rows rise from z 12.0 at y -4 to z 18.5 at y 13 (line z 13.5 -> 18.5).
      Stand-side and carceres-side flanks: full-height walls x -13..-12 and x 12..13, z 0..29, so no seating section shows.
      Roof terrace: paving at z 29.0..29.2 over the whole block, parapet 1 m high (z 29.2..30.2) on its edges.
      Corner tower on the carceres side: x 0.5..12.5 (end_l local), y 9..21, top z 30.0, hip apex about z 33.7; porch at
      x 6.5 on y 21..25 (steps at the front); street plinth y 21..22, z 0..0.2; arena plinth steps y -22.8..-21.
      Street arcades on the stands' storey lines z 8 / 15 / 21, attic to z 29.
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                      # noqa: F401,F403  Frame, box, wall, arcade, taberna_front, cornice, square_tower, ...
import bl_kit as _bk
import bpy



def line_top(y):
    """Top of the stone seat rows: a straight rise from z 13.5 at y -4 to z 18.5 at y 13."""
    return 13.5 + (y + 4.0) / 17.0 * 5.0


def build():
    F = Frame()
    # massing: solid from z 0; arena-side mass y -20..-8 up to the roof terrace
    box(F, 0, -14.0, 0, 26, 12, 29.0, 'tuff')
    box(F, 0, -20.5, 0, 26, 1.0, 12.0, 'stone')             # plain podium front y -21..-20
    box(F, 0, -6.0, 0, 26, 4.0, 11.9, 'stone')              # plateau y -8..-4
    box(F, 0, -6.0, 11.9, 26, 4.0, 0.1, 'paving')           # plateau top at the carceres terrace z 12.0
    # seats behind the plateau: solid core, then 17 marble rows whose tops lie on the line
    box(F, 0, 4.5, 0, 26, 17, 12.0, 'tuff')                 # y -4..13
    for k in range(17):
        y0 = -4.0 + k
        box(F, 0, y0 + 0.5, 12.0, 26, 1.0, line_top(y0 + 1.0) - 12.0, 'marble')
    box(F, 0, 16.5, 0, 26, 7.0, 18.5, 'tuff')               # back core y 13..20 up to z 18.5
    box(F, 0, 17.0, 18.5, 26, 8.0, 10.5, 'tuff')            # gallery massing y 13..21 up to z 29
    # full-height flanks: the stands' section and the carceres side never show
    box(F, 12.51, 0.0, 0.0, 1.02, 42.0, 29.0, 'travertine')    # carceres-side flank (plain)
    # stand-side flank: a facade over the stands, two rows of arched windows with red panels, string course, cornice
    wall(F, -12.52, 21.0, -12.52, -21.0, 0.0, 19.0, 1.0, 'travertine')
    band(F, -12.52, 20.5, -12.52, -20.5, 18.7, 0.3, 0.42, 'marble')
    arcade(F, -12.52, 21.0, -12.52, -21.0, 19.0, 5.4, 1.0, 7, 'travertine', open_w=2.6, open_h=4.4, back='dark')
    arcade(F, -12.52, 21.0, -12.52, -21.0, 24.6, 4.4, 1.0, 7, 'travertine', open_w=2.6, open_h=3.4, back='dark')
    for y in (-15.0, -9.0, -3.0, 3.0, 9.0, 15.0):             # red panels on the piers between the windows
        box(F, -13.06, y, 19.6, 0.1, 1.0, 3.2, 'red')
        box(F, -13.06, y, 25.0, 0.1, 1.0, 2.6, 'red')
    cornice(F, -12.52, 20.45, -12.52, -20.45, 28.8, 0.6, 0.55, 'marble')
    # roof terrace with a parapet on its edges
    box(F, 0, 0, 29.0, 26, 42, 0.2, 'paving')
    wall(F, -13.0, -20.7, 13.0, -20.7, 29.2, 1.0, 0.6, 'marble')
    wall(F, -13.0, 20.7, 13.0, 20.7, 29.2, 1.0, 0.6, 'marble')
    wall(F, -12.7, -21.0, -12.7, 21.0, 29.2, 1.0, 0.6, 'marble')
    wall(F, 12.7, -21.0, 12.7, 21.0, 29.2, 1.0, 0.6, 'marble')
    # two braziers and a small pyramid-roofed corner turret on the roof terrace
    torch_column(F, -3.0, -18.0, 29.2, h=3.0)
    torch_column(F, 3.0, -18.0, 29.2, h=3.0)
    box(F, -10.0, -18.0, 29.2, 4.0, 4.0, 3.8, 'travertine')
    box(F, -10.0, -18.0, 33.0, 4.4, 4.4, 0.25, 'marble')
    hip_roof(F, -10.0, -18.0, 33.25, 4.0, 4.0, pitch=40.0, overhang=0.3, mat='tile')

    # arena facade (track side): podium, two arcaded storeys with red panels, cornice, attic, top cornice
    arcade(F, -13.0, -20.5, 13.0, -20.5, 12.0, 7.0, 1.0, 5, 'travertine', open_w=2.8, open_h=5.6, back='dark')
    band(F, -13.0, -20.5, 13.0, -20.5, 17.8, 0.3, 0.42, 'red')
    arcade(F, -13.0, -20.5, 13.0, -20.5, 18.2, 6.6, 1.0, 5, 'travertine', open_w=2.4, open_h=5.0, back='dark')
    for x in (-7.8, -2.6, 2.6, 7.8):                       # red panels on the piers of storey B
        box(F, x, -21.05, 19.5, 1.0, 0.1, 3.5, 'red')
    cornice(F, -12.45, -20.5, 12.45, -20.5, 25.0, 0.6, 0.55, 'marble')   # mouldings stay within x -13..13
    wall(F, -13.0, -20.5, 13.0, -20.5, 25.6, 3.4, 1.0, 'travertine')
    band(F, -13.0, -20.5, 13.0, -20.5, 27.2, 0.3, 0.42, 'red')
    cornice(F, -12.45, -20.5, 12.45, -20.5, 28.8, 0.6, 0.55, 'marble')

    # official box (tribunal) on the podium level: columns, a railing and a hanging cloth
    box(F, 0, -22.0, 11.5, 10.0, 4.0, 0.5, 'marble')
    column(F, -4.2, -23.2, 0.0, 11.5, 0.32, 'marble', 'tuscan', 0, 10)
    column(F, 4.2, -23.2, 0.0, 11.5, 0.32, 'marble', 'tuscan', 0, 10)
    balustrade(F, -5.0, -24.0, 5.0, -24.0, 12.0, 1.0, 'marble', 2.2, 0.28)
    box(F, 0, -24.12, 9.0, 4.0, 0.06, 3.0, 'cloth')

    # stair inside the block along the stand edge: from the terrace level (z 12) up to the first seat row (z 13.8)
    stair_flight(F, -10.0, -8.0, -10.0, -4.0, 12.0, 13.8, width=3.0, mat='stone', cheek_mat='tuff', cheeks=True)

    # arena-side plinth steps and the street-side plinth
    box(F, 0, -22.4, 0, 26, 0.8, 0.2, 'stone')
    box(F, 0, -21.5, 0, 26, 1.0, 0.35, 'stone')
    box(F, -6.25, 21.5, 0.0, 13.5, 1.0, 0.2, 'stone')

    # street side: taberna ground floor, two arcaded storeys and an attic, continuing the stands' facade
    wall(F, 0.5, 19.95, -13.0, 19.95, 0.0, 8.0, 1.0, 'travertine')
    taberna_front(F, 0.5, 20.45, -13.0, 20.45, 0.0, 3, h=8.0, mat='travertine', depth=0.5)
    arcade(F, 0.5, 20.5, -13.0, 20.5, 8.0, 7.0, 1.0, 3, 'travertine', open_w=3.0, open_h=6.2, back='dark')
    arcade(F, 0.5, 20.5, -13.0, 20.5, 15.0, 6.0, 1.0, 3, 'travertine', open_w=2.6, open_h=5.0, back='dark')
    wall(F, 0.5, 20.5, -13.0, 20.5, 21.0, 8.0, 1.0, 'travertine')
    for z in (8.3, 15.3, 21.3):
        cornice(F, 0.5, 20.45, -12.45, 20.45, z, 0.6, 0.55, 'marble')

    # corner tower on the carceres side (top z 30), with a pedimented porch at its foot facing the street
    square_tower(F, 6.5, 15.0, 12.0, 30.0, wall_mat='travertine', roof='pyramid', pitch=28.0, foundation=0.0,
                 cornice_mat='marble', band_mat='red')
    pediment_front(F, 6.5, 22.9, 0.0, 6.0, 4, 5.0, depth=2.1, order='corinthian', mat='marble', steps=2, rot=180.0)


def export_glb(ob, glb):
    os.makedirs(os.path.dirname(glb), exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB', use_selection=True, export_yup=True,
                              export_apply=True, export_normals=True, export_texcoords=False, export_materials='EXPORT',
                              export_cameras=False, export_lights=False)


def run_variant(MIRROR):
    NAME = 'rome_circus_end_r' if MIRROR else 'rome_circus_end_l'
    ORIGIN_X = 97.0 if MIRROR else -97.0          # where the page puts the block centre (see the numbers above)
    reset()
    preview_ground(-0.05)
    build()
    if MIRROR:                                   # mirror image in x: flip the vertices and the winding
        for mat, (V, Fa, Sm) in list(_bk._G.items()):
            V[:] = [(-v[0], v[1], v[2]) for v in V]
            Fa[:] = [tuple(reversed(f)) for f in Fa]
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
            'page_origin_x': ORIGIN_X, 'glb': glb, 'glb_kb': round(os.path.getsize(glb) / 1024), 'renders': files}
    print('ASSET_REPORT ' + json.dumps(info, ensure_ascii=False))


def main():
    args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    if 'all' in args:                                # one process: both blocks, then the join check
        run_variant(False)
        run_variant(True)
        import rome_circus_end_join
        rome_circus_end_join.main()
    else:
        run_variant('r' in args)


if __name__ == '__main__':
    main()
