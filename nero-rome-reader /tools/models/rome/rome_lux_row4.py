"""rome_lux_row4 · four-storey luxury Roman urban townhouse with open peristyle court.
Run with Blender background mode from any working directory. Front is -Y; all dimensions are metres.
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
import bl_kit as _bk
import bpy
from mathutils import Vector

NAME = 'rome_lux_row4'
F = Frame()

# Small façade helpers. The openings are backed by dark wood/recess panels, never glazing.
def front_pilaster(x, z0, height, y=-10.0, width=0.32, mat='stone'):
    box(F, x, y - 0.14, z0, width, 0.34, height, mat)
    box(F, x, y - 0.18, z0, width * 1.5, 0.44, 0.18, 'marble')
    box(F, x, y - 0.18, z0 + height - 0.22, width * 1.6, 0.44, 0.22, 'marble')

def lintelled_window(x, y, z, w, h, face='front', arch=False, flowerbox=False):
    # Small recessed opening, closed shutter and one plain lintel.
    if face == 'front':
        box(F, x, y - 0.22, z, w + 0.10, 0.16, h + 0.10, 'stone')
        box(F, x, y - 0.32, z + 0.08, w, 0.06, h - 0.02, 'dark')
        box(F, x, y - 0.37, z + 0.12, w * 0.48, 0.045, h - 0.10, 'wood')
        box(F, x, y - 0.40, z + h + 0.08, w + 0.18, 0.20, 0.10, 'stone')
    else:
        # Rear and side elevations: framed recesses with dark closed shutters.
        if face == 'back':
            box(F, x, y + 0.22, z, w + 0.10, 0.16, h + 0.10, 'stone')
            box(F, x, y + 0.32, z + 0.08, w, 0.06, h - 0.02, 'dark')
            box(F, x, y + 0.37, z + 0.12, w * 0.48, 0.045, h - 0.10, 'wood')
            box(F, x, y + 0.40, z + h + 0.08, w + 0.18, 0.20, 0.10, 'stone')
            return
        rot = 90 if face == 'east' else -90
        xx = 12.0 if face == 'east' else -12.0
        side = 1 if face == 'east' else -1
        box(F, xx + side*0.22, x, z, 0.16, w + 0.10, h + 0.10, 'stone')
        box(F, xx + side*0.32, x, z + 0.08, 0.06, w, h - 0.02, 'dark')
        box(F, xx + side*0.37, x, z + 0.12, 0.045, w*0.48, h-0.10, 'wood')
        box(F, xx + side*0.40, x, z+h+0.08, 0.20, w+0.18, 0.10, 'stone')

def build():
    reset()
    # Palette additions preserve Roman warm plaster, red dado and pale travertine dressings.
    # Ground datum and shallow foundation; footprint core 24 x 20, ground at z=0.
    box(F, 0, 0, -1.2, 24, 20, 1.2, 'tuff')
    box(F, 0, 0, 0, 24, 20, 0.38, 'stone')
    box(F, 0, 0, 0.38, 24, 20, 0.16, 'marble')
    # Floors surround a true 8 x 7 m open courtyard (x=-4..4, y=-3.5..3.5).
    for z, thick in ((0.54,0.18),(4.0,0.22),(7.2,0.22),(10.4,0.22)):
        box(F, 0, -6.75, z, 24, 6.5, thick, 'stone')
        box(F, 0, 6.75, z, 24, 6.5, thick, 'stone')
        box(F, -8, 0, z, 8, 7.0, thick, 'stone')
        box(F, 8, 0, z, 8, 7.0, thick, 'stone')
    # Court paving and small impluvium, with an uninterrupted sky opening above it.
    box(F, 0, 0, 0.54, 8, 7, 0.12, 'paving')
    box(F, 0, 0, 0.66, 2.6, 1.8, 0.28, 'marble')
    box(F, 0, 0, 0.95, 2.1, 1.3, 0.04, 'water')
    for x in (-3.05,3.05):
        flower_bed(F, x, 0, 0.66, 1.25, 4.4)
    # Ground floor outer wall masses. Front is assembled around the open arcaded shopfront.
    # Rear wall and side wall cores, leaving the court-facing sides legible from the top view.
    box(F, 0, 9.72, 0.54, 24, 0.56, 3.46, 'plaster2')
    box(F, -11.72, 0, 0.54, 0.56, 18.9, 3.46, 'plaster2')
    box(F, 11.72, 0, 0.54, 0.56, 18.9, 3.46, 'plaster2')
    # Main floor arcade: four true arches, 1.4 m walk depth behind the column line.
    arcade(F, -12, -9.72, -6, -9.72, 0.54, 3.12, 0.52, 1, 'stone', open_w=3.2, open_h=2.85, seg=10,
           impost_mat='marble', keystone=True)
    # Deep wall behind arcade and discrete closed timber shop doors/shutters in each bay.
    box(F, 0, -7.78, 0.54, 24, 0.56, 3.46, 'plaster2')
    for x in (-9,-3,3,9):
        box(F, x, -8.08, 0.68, 2.5, 0.12, 2.25, 'wood')
        for j in range(1,5): box(F, x-1.25+j*0.5, -8.16, 0.74, 0.045, 0.06, 2.12, 'wood')
        box(F, x, -8.16, 2.96, 2.6, 0.22, 0.16, 'marble')
    # Four broad street-facing stone columns/pier supports; no continuous façade band.
    for x in (-12,-6):
        column(F, x, -9.9, 0.54, 3.12, 0.30, 'stone', 'plain', seg=8)
    # The rest of the street frontage is a plain wall with one ordinary doorway.
    box(F, -3.425, -9.72, 0.54, 5.15, 0.56, 3.46, 'plaster2')
    box(F, 6.4, -9.72, 0.54, 11.2, 0.56, 3.46, 'plaster2')
    box(F, 0, -10.04, 0.66, 1.45, 0.10, 2.42, 'wood')
    box(F, 0, -10.08, 3.08, 1.65, 0.16, 0.18, 'stone')
    # Three broad entry stair treads rise from street grade to the 0.54 m main floor.
    for i in range(3):
        y0 = -11.20 + i * 0.40
        box(F, 0, y0 + 0.20, 0, 4.0, 0.42, 0.18 * (i + 1), 'stone')
    # A few recessed side windows bring light to the ground-floor rooms.
    for y in (-4.5, 4.5):
        lintelled_window(y,0,1.45,1.25,1.55,face='east')
        lintelled_window(y,0,1.45,1.25,1.55,face='west')
    # Courtyard colonnade: four sides, visible from above and open between columns.
    for x in (-3.65,3.65):
        for y in (-2.9,0,2.9): column(F,x,y,0.66,3.15,0.20,'stone','plain',seg=8)
    for y in (-3.15,3.15):
        for x in (-2.7,0,2.7): column(F,x,y,0.66,3.15,0.20,'stone','plain',seg=8)
    # Level 2: full warm plaster storey, centered three-bay open loggia with authentic back wall/floor/ceiling.
    box(F, -8.0, -6.75, 4.0, 8.0, 6.5, 3.2, 'plaster2')
    box(F, 8.0, -6.75, 4.0, 8.0, 6.5, 3.2, 'plaster2')
    box(F, 0, -6.78, 4.0, 7.8, 0.30, 3.2, 'plaster2')
    box(F, 0, -9.72, 4.0, 8.0, 0.56, 3.2, 'plaster2')
    # Close the second-storey ring along both long sides and the rear; the court remains open.
    box(F, -11.72, 0, 4.0, 0.56, 19.44, 3.2, 'plaster2')
    box(F, 11.72, 0, 4.0, 0.56, 19.44, 3.2, 'plaster2')
    box(F, 0, 9.72, 4.0, 24.0, 0.56, 3.2, 'plaster2')
    # A few individual upper apertures; no continuous front balcony or gallery.
    for x in (-8.6,5.8):
        lintelled_window(x,-9.98,4.86,0.82,1.45)
    for y in (-8.0,-5.0):
        lintelled_window(y,0,4.85,1.0,1.5,face='east',flowerbox=True)
        lintelled_window(y,0,4.85,1.0,1.5,face='west',flowerbox=True)
    for x in (-6.0,5.5): lintelled_window(x,9.72,4.85,0.85,1.45,face='back')
    for x in (-2.2,3.4): lintelled_window(x,-6.78,4.82,0.90,1.45)
    # Compact timber balcony for one upper room only.
    box(F,5.8,-10.18,4.10,2.4,0.85,0.16,'wood')
    for x in (4.75,5.8,6.85): box(F,x,-10.55,4.20,0.08,0.08,0.72,'wood')
    box(F,5.8,-10.55,4.92,2.2,0.08,0.08,'wood')
    # Level 3: split wing masses keep the 8 x 7 m court open to the sky.
    box(F,-8.25,0,7.2,7.5,20,3.2,'plaster2')
    box(F,8.25,0,7.2,7.5,20,3.2,'plaster2')
    box(F,0,-6.75,7.2,9.0,6.5,3.2,'plaster2')
    box(F,0,6.75,7.2,9.0,6.5,3.2,'plaster2')
    for x,w in ((-7.6,0.85),(1.4,0.95),(8.4,0.72)): lintelled_window(x,-9.93,8.05,w,1.55)
    for x in (-6.5,2.8): lintelled_window(x,9.93,8.05,0.85,1.5,face='back')
    # Side elevations use fewer recessed windows; courtyard remains open at all heights.
    for y in (-7,-1,5):
        lintelled_window(y,0,8.05,1.15,1.8,face='east',arch=True)
        lintelled_window(y,0,8.05,1.15,1.8,face='west',arch=True)
    # Recessed fourth storey, set back 1.0 m from front/rear and 0.7 m from sides; shows its full height.
    box(F,-8.25,0,10.4,7.5,17.8,3.2,'plaster2')
    box(F,8.25,0,10.4,7.5,17.8,3.2,'plaster2')
    box(F,0,8.95,10.4,11,2.1,3.2,'plaster2')
    # front partial open loggia on central upper part, with solid back, floor and roof soffit.
    box(F,0,-7.45,10.4,10.8,0.28,3.2,'plaster2')
    # Solid front returns flank the localized 3.2 m loggia bay.
    box(F,-3.5,-8.9,10.4,3.8,0.28,3.2,'plaster2')
    box(F,3.5,-8.9,10.4,3.8,0.28,3.2,'plaster2')
    box(F,0,-8.55,10.4,3.2,1.5,0.18,'stone')
    for x in (-1.45,1.45): column(F,x,-8.9,10.4,2.48,0.20,'stone','plain',seg=8)
    for x in (-8,8): lintelled_window(x,-8.9,11.05,0.78,1.10)
    for y in (-5,1,6):
        lintelled_window(y,0,11.05,0.9,1.22,face='east')
        lintelled_window(y,0,11.05,0.9,1.22,face='west')
    # Courtyard upper walls form the inside perimeter, leaving the full 8 x 7 m void open to sky.
    # Level 2 interior walls and gallery floor/roof are separate wings, no partitions across the court.
    # Warm red and ochre painted dadoes face the private court at every level.
    for z0,h in ((0.54,3.46),(4.0,3.2),(7.2,3.2),(10.4,3.2)):
        box(F,0,-3.68,z0,8.0,0.36,h,'plaster2')
        box(F,0,3.68,z0,8.0,0.36,h,'plaster2')
        box(F,-4.18,0,z0,0.36,7.0,h,'plaster2')
        box(F,4.18,0,z0,0.36,7.0,h,'plaster2')
        box(F,0,-3.485,z0,7.5,0.025,0.55,'pav_red')
        box(F,0,3.485,z0,7.5,0.025,0.55,'pav_red')
        box(F,-3.985,0,z0,0.025,6.5,0.55,'pav_red')
        box(F,3.985,0,z0,0.025,6.5,0.55,'pav_red')
    # Four levels of internal court columns and continuous covered gallery lintels (not across open centre).
    for z0 in (4.0,7.2,10.4):
        for x in (-3.65,3.65):
            for y in (-2.9,0,2.9): column(F,x,y,z0,2.55,0.18,'stone','doric',seg=8)
        for y in (-3.15,3.15):
            for x in (-2.7,0,2.7): column(F,x,y,z0,2.55,0.18,'stone','doric',seg=8)
    # Eaves, dentils, cornice and low four-sided tiled roof wings; ridge stays under 17.5 m.
    for z, mat, thick, over in ((13.55,'stone',0.18,0.04),):
        # Rectangular ring strips leave the 8 x 7 m court void unobstructed.
        box(F,0,-6.75-over/2,z,24.0,6.5+over,thick,mat)
        box(F,0,6.75+over/2,z,24.0,6.5+over,thick,mat)
        box(F,-8-over/2,0,z,8.0+over,7.0,thick,mat)
        box(F,8+over/2,0,z,8.0+over,7.0,thick,mat)
    # Wings frame the open courtyard; each hipped wing has low rise and exposed roof tiles/ribs.
    hip_roof(F,-8.25,0,13.65,7.5,19.8,pitch=18,overhang=0.28,mat='tile',tiles=False,rib_mat='tile2')
    hip_roof(F,8.25,0,13.65,7.5,19.8,pitch=18,overhang=0.28,mat='tile',tiles=False,rib_mat='tile2')
    # The central front and rear roof wings cover the remaining roof area without spanning the court.
    hip_roof(F,0,-6.75,13.65,9.0,6.5,pitch=18,overhang=0.0,mat='tile',tiles=False,rib_mat='tile2')
    hip_roof(F,0,6.75,13.65,9.0,6.5,pitch=18,overhang=0.0,mat='tile',tiles=False,rib_mat='tile2')
    # Compact timber-framed roof lights on each roof wing.
    for x in (-8,8):
        box(F,x,-2.5,14.88,1.35,1.2,0.16,'wood')
        for dx in (-0.48,0.48): box(F,x+dx,-2.5,14.90,0.08,1.35,0.25,'wood')
        for dy in (-0.48,0.48): box(F,x,-2.5+dy,14.90,1.0,0.08,0.25,'wood')
    # Ridge caps follow each wing's actual ridge (eaves 13.65 m, ridge about 14.87 m).
    for x in (-8.25,8.25): box(F,x,0,14.88,0.48,12.3,0.16,'tile2')
    for y in (-6.75,6.75): box(F,0,y,14.71,2.7,0.42,0.16,'tile2')

    ob = _bk._build_object(NAME)
    # report bounds and polygon triangle count from the joined source mesh
    tris = sum(len(p.vertices)-2 for p in ob.data.polygons)
    bb = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    mins=[min(v[i] for v in bb) for i in range(3)]; maxs=[max(v[i] for v in bb) for i in range(3)]
    bounds=[round(maxs[i]-mins[i],3) for i in range(3)]
    # Export only the asset mesh.
    glb=os.path.join(_bk.ROOT,'assets','models','rome',NAME+'.glb'); os.makedirs(os.path.dirname(glb),exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active=ob
    bpy.ops.export_scene.gltf(filepath=glb,export_format='GLB',use_selection=True,export_yup=True,export_apply=True,
                              export_normals=True,export_texcoords=False,export_materials='EXPORT',export_cameras=False,export_lights=False)
    # Workbench material-color studio previews; no EEVEE or cycles.
    scene=bpy.context.scene; scene.render.engine='BLENDER_WORKBENCH'; scene.display.shading.light='STUDIO'
    scene.display.shading.color_type='MATERIAL'; scene.display.shading.show_shadows=True
    scene.display.shading.show_cavity=True; scene.display.shading.cavity_type='BOTH'
    scene.render.resolution_x=900; scene.render.resolution_y=700; scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG'; scene.render.film_transparent=False
    if scene.world is None: scene.world=bpy.data.worlds.new('RomePreviewWorld')
    scene.world.color=(0.22,0.22,0.22)
    # Material diffuse colors for Workbench display are provided by the shared kit's materials.
    out=os.path.join(_bk.ROOT,'renders',NAME); os.makedirs(out,exist_ok=True)
    camera=bpy.data.objects.new('RomePreviewCamera',bpy.data.cameras.new('RomePreviewCamera')); scene.collection.objects.link(camera); scene.camera=camera
    target=Vector((0,0,8.1)); dirs={'front':Vector((0,-1,0)),'side':Vector((1,-0.1,0)),'three':Vector((1,-1,0.75))}
    for nm,d in dirs.items():
        d.normalize(); camera.location=target+d*42; camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler(); camera.data.type='ORTHO'; camera.data.ortho_scale=32
        scene.render.filepath=os.path.join(out,nm+'.png'); bpy.ops.render.render(write_still=True)
    camera.location=Vector((0,0,50)); camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler(); camera.data.type='ORTHO'; camera.data.ortho_scale=30
    scene.render.filepath=os.path.join(out,'top.png'); bpy.ops.render.render(write_still=True)
    # Saved scene contains the finished asset and Workbench camera/studio setup.
    blend=os.path.join(out,'asset.blend'); bpy.ops.wm.save_as_mainfile(filepath=blend)
    report={'asset':NAME,'triangles':tris,'bounds_xyz_m':bounds,'z_min':round(mins[2],3),'z_max':round(maxs[2],3),
            'glb':glb,'blend':blend,'renders':[os.path.join(out,n+'.png') for n in ('front','side','three','top')]}
    print('ASSET_REPORT '+json.dumps(report,ensure_ascii=False))
    return report

if __name__ == '__main__':
    build()
