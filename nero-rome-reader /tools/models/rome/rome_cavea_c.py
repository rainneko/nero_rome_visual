"""rome_cavea_c · curved stand module of the Circus Maximus (the round end): the straight section swept round a
22.5 degree wedge of a ring, centred on the origin, arena side toward the origin.

Same parts, heights and profile as rome_cavea_s (imported from it). The straight module is bent into the ring:
its y (-21 .. 21, arena at -21, street facade at +21) becomes the radius r = 61 + y (inner r 40 = arena wall,
outer r 82 = street facade); its x (-16.8 .. 16.8) becomes the angle phi = x * 11.25 deg / 16.8 about the +Y axis,
so the wedge runs from -11.25 to +11.25 deg. Every triangle longer than 8.4 m in x is cut before bending, so the
wedge has 4 segments across it and each curved face is a polyline of chords. z = 0 = arena level.

END_CAPS = True adds the two end walls to the renders only (a separate preview object); the GLB never has them.
"""
import os, sys, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rome_cavea_s as S                  # the straight module: same parts, heights and profile
from rk import *                          # noqa: F401,F403  Vector, reset, add_poly, render_previews, ...
import bl_kit as _bk
import bpy, bmesh

NAME = 'rome_cavea_c'
END_CAPS = True                           # preview only; the GLB is always exported without the end walls

R_MID = 61.0                              # straight y = 0 sits at r = 61 (y = -21 -> r 40, y = 21 -> r 82)
WEDGE = math.radians(11.25)               # half angle of the 22.5 degree wedge
K = WEDGE / S.HX                          # radians per metre of straight x
SEG = 8.4                                 # longest piece in x before bending (33.6 / 4 = 4 segments)


def bend(x, y, z):
    r = R_MID + y
    phi = x * K
    return Vector((r * math.sin(phi), r * math.cos(phi), z))


def bend_object(ob):
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    for _ in range(4):
        longe = [e for e in bm.edges if abs(e.verts[1].co.x - e.verts[0].co.x) > SEG + 1e-4]
        if not longe:
            break
        bmesh.ops.subdivide_edges(bm, edges=longe, cuts=1)
        bmesh.ops.triangulate(bm, faces=bm.faces[:])
    for v in bm.verts:
        v.co = bend(v.co.x, v.co.y, v.co.z)
    bm.to_mesh(ob.data)
    bm.free()
    ob.data.update()
    bpy.context.view_layer.update()               # refresh bound_box before it is read for the report and framing


def end_caps():
    for x in (S.HX + 0.05, -S.HX - 0.05):
        pts = [bend(x, y, z) for (y, z) in S.CAP_PTS]
        add_poly('tuff', pts)
        add_poly('tuff', list(reversed(pts)))


def main():
    reset()
    S.build_module()
    ob = _bk._build_object(NAME)                  # the straight section, joined (no caps)
    bend_object(ob)                               # bend it into the wedge
    tris = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    bb = [Vector(c) for c in ob.bound_box]
    size = [round(max(v[i] for v in bb) - min(v[i] for v in bb), 2) for i in range(3)]
    glb = os.path.join(_bk.ROOT, 'assets', 'models', 'rome', NAME + '.glb')
    S.export_glb(ob, glb)
    if END_CAPS:                                  # preview-only end walls: a separate object, never exported
        _bk._G.clear()
        end_caps()
        _bk._build_object(NAME + '_endcaps')
    sc = bpy.context.scene
    try:
        sc.eevee.taa_render_samples = 16          # low samples: memory is tight, previews only
    except Exception:
        pass
    files = render_previews(ob, NAME, '-Y', extra=(('back', Vector((0.6, 1.0, 0.0)), 22),
                                                   ('close', Vector((-0.5, -1.0, 0.0)), 8)))
    info = {'asset': NAME, 'triangles': tris, 'size_xyz_m': size,
            'z_min': round(min(v.z for v in bb), 2), 'z_max': round(max(v.z for v in bb), 2),
            'glb': glb, 'glb_kb': round(os.path.getsize(glb) / 1024), 'end_caps_in_renders_only': END_CAPS,
            'renders': files}
    print('ASSET_REPORT ' + json.dumps(info, ensure_ascii=False))


if __name__ == '__main__':
    main()
