"""Clivus Palatinus B (B5, accepted 2026-11-20): the wall-fountain terraces between the Apollo hill and the Circus street.
Run: /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup --python tools/models/rome/rome_clivus_palatinus_b_blender.py
Writes assets/models/rome/rome_clivus_palatinus_b.glb (the page's file) and tools/models/rome/clivus_palatinus_b_plan.json; the editable .blend,
the preview-only soil, site and planting GLBs and four renders go to renders/palatine/clivus-palatinus-b-v5/ (git-ignored).
Geometry: rome_clivus_palatinus_b.py (on clivus_b_geometry.py, clivus_b_legacy.py, clivus_b_audit.py; inputs in clivus_b_data/).
In the page: src/scenes/rome/clivus-b.js (placement, the cuts in the hill and the ground)."""
import sys,json,math,hashlib,random
from pathlib import Path
import bpy
from mathutils import Vector
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
import os
OUT=Path(os.environ.get('CLIVUS_B_OUT',ROOT/'renders/palatine/clivus-palatinus-b-v5'))   # previews, renders, .blend (git-ignored)
for d in ('models','scene','renders'):(OUT/d).mkdir(parents=True,exist_ok=True)
sys.dont_write_bytecode=True
sys.path.insert(0,str(HERE))
import rome_clivus_palatinus_b as g
import rk
import bl_kit as kit
kit.PAL['foam']=((.78,.85,.82),0.,.25)
kit.PAL['panelred']=((.62,.36,.25),0.,.90)
# B5: retaining walls in the hill's palPlatWalls tone (measured in the page: hill
# +lx faces (173,165,144) vs B4 'stone' (163,153,131)); linear ~(.49,.43,.32).
# 'ash' is otherwise unused in this model, so the small peperino service covers keep their colour.
kit.PAL['ash']=((.729,.687,.601),0.,.92)

def collection(name):
    c=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(c);return c

def bbox(poly):return min(q[0] for q in poly),min(q[1] for q in poly),max(q[0] for q in poly),max(q[1] for q in poly)
def overlap(a,b):return a[0]<b[2]-1e-8 and b[0]<a[2]-1e-8 and a[1]<b[3]-1e-8 and b[1]<a[3]-1e-8
def ground_model(des):
    regions=[(r,bbox(r['polygon_lx_lz']),g.triangulate(r['polygon_lx_lz'])) for r in sorted(des.targets,key=lambda r:r['priority'])]
    soil=g.Mesh('B_requested_ground','preview_soil',False)
    original=g.Mesh('B_original_site_context','preview_context',False)
    def cut(pieces,tris):
        for tri in tris:
            bb=bbox(tri);out=[]
            for p in pieces:out.extend(g.subtract(p,list(tri)) if overlap(bbox(p),bb) else [p])
            pieces=out
        return pieces
    def patch(p,h):
        # Closed soil volumes give a real cut face, never an open dark hole.
        # This is a view-only soil volume. Its vertical skin must sit just
        # inside masonry, rather than occupy the exact same plane as the
        # stair/retaining-wall faces and create a striped depth fight.
        original=p
        for a,b in zip(original,original[1:]+original[:1]):
            L=math.dist(a,b);nx=-(b[1]-a[1])/L*.025;nz=(b[0]-a[0])/L*.025
            p=g.A.clip_line(p,(a[0]+nx,a[1]+nz),(b[0]+nx,b[1]+nz))
            if not p:return
        start=len(soil.faces);soil.prism(p,5.,h,'turf')
        # The steep excavation exposes the same local bedrock family as Apollo.
        # Keep meadow on gentler tops; a soil shader stretched down a steep cut
        # looked like a grey curtain in the city camera.
        for i in range(start,len(soil.faces)):
            vv=[Vector(g.to_blender(soil.verts[k])) for k in soil.faces[i]]
            normal=(vv[1]-vv[0]).cross(vv[2]-vv[0]).normalized()
            if normal.z<.70:soil.mats[i]='rock' if normal.z>.15 else 'rock2'
    for x in range(51,103):
        for z in range(144,244):
            pieces=[g.rect(x,z,x+1,z+1)]
            for r,bb,tris in regions:
                if overlap((x,z,x+1,z+1),bb):pieces=cut(pieces,tris)
            # This read-only backdrop is for the standalone viewer only. In the
            # actual city use the original native terrain outside the targets.
            for p in pieces:
                for tri in g.triangulate(p):
                    original.face([(x,z,des.survey.height(x,z)) for x,z in tri[::-1]],'turf')
    for i,(r,bb,tris) in enumerate(regions):
        pieces=[list(t) for t in tris]
        for other,ob,ot in regions[i+1:]:
            if overlap(bb,ob):pieces=cut(pieces,ot)
        for p in pieces:
            patch(p,lambda x,z,r=r:g.target_y(r,x,z)-(.025 if r['role']=='planting_soil' else 0))
    return soil,original

def link_object(obj,col):
    for c in list(obj.users_collection):c.objects.unlink(obj)
    col.objects.link(obj)

def plants(des,col):
    random.seed(730)
    green=[]
    for i,color in enumerate(((.22,.32,.12),(.29,.39,.15),(.36,.43,.17))):
        mat=bpy.data.materials.new('hedge' if i==0 else 'ivy');mat.diffuse_color=(*kit._lin(color),1)
        mat.use_nodes=True;p=mat.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*kit._lin(color),1);p.inputs['Roughness'].default_value=.92;green.append(mat)
    for p in des.plants:
        if p['kind']!='tree':continue
        x,z,y=p['lx'],p['lz'],p['y'];r=p['crown_radius_m'];h=p['height_m']
        m=g.Mesh('PREVIEW_trunk_'+p['id'],'preview_tree',False)
        m.cyl(x,z,y,.12,h*.62,'wood',9,.075)
        for side in (-1,1):
            g.tube(m,[(x,z,y+h*.38),(x+side*r*.42,z+.15,y+h*.72)],.055,'wood',7)
        g.A.create_bpy_mesh(bpy,kit,m,col)
        for j in range(5):
            ang=j*math.tau/5;rad=r*.40
            center=(x+math.cos(ang)*rad,z+math.sin(ang)*rad,y+h*.77+random.uniform(-.2,.2))
            bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=1,location=g.to_blender(center))
            ob=bpy.context.object;ob.name='PREVIEW_crown_'+p['id']+'_'+str(j);ob.scale=(r*.78,r*.78,h*.22)
            ob.data.materials.append(green[j%3]);link_object(ob,col)
    for b in des.beds:
        x0,z0,x1,z1=g.bounds(b['poly'])
        for j in range(max(2,int((x1-x0)/.75))):
            x=x0+.35+(x1-x0-.7)*j/max(1,int((x1-x0)/.75)-1);z=(z0+z1)/2
            bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=.48,location=g.to_blender((x,z,b['y']+.27)))
            ob=bpy.context.object;ob.name='PREVIEW_bed_'+b['id'];ob.scale=(1.,min(1,(z1-z0)*.6),.6);ob.data.materials.append(green[j%3]);link_object(ob,col)
        detail=g.Mesh('PREVIEW_flowers_'+b['id'],'preview_planting',False)
        for j in range(max(5,int((x1-x0)*(z1-z0)*6))):
            x=random.uniform(x0+.22,x1-.22);z=random.uniform(z0+.22,z1-.22);h=b['y']+random.uniform(.28,.55)
            for k in range(5):
                a=k*math.tau/5;bb=(k+1)*math.tau/5;r=.065
                detail.face([(x,z,h),(x+r*math.cos(a),z+r*math.sin(a),h+.025),
                    (x+r*math.cos(bb),z+r*math.sin(bb),h+.025)],'flowerW' if j%3 else 'flowerP')
        g.A.create_bpy_mesh(bpy,kit,detail,col)
    for p in des.plants:
        if p['kind']!='shrub' or not p['id'].startswith('urn'):continue
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=p['crown_radius_m'],location=g.to_blender((p['lx'],p['lz'],p['y']+.23)))
        ob=bpy.context.object;ob.name='PREVIEW_'+p['id'];ob.scale.z=.75;ob.data.materials.append(green[1]);link_object(ob,col)

def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    des=g.build_design();checks=g.check_design(des);plan=g.make_plan(des,checks)
    model=collection(g.ASSET)
    components=[g.A.create_bpy_mesh(bpy,kit,m,model) for m in des.meshes if m.export]
    for m in bpy.data.materials:m.use_backface_culling=True
    dest=OUT/'models'/g.ASSET
    web=ROOT/'assets/models/rome'/(g.ASSET+'.glb')
    sc=bpy.context.scene;sc.unit_settings.system='METRIC'
    # Save editable components before generating a separate efficient export.
    bpy.ops.wm.save_as_mainfile(filepath=str(dest.with_suffix('.blend')))
    export=collection('WEB_EXPORT')
    objects=[g.A.create_bpy_mesh(bpy,kit,m,export) for m in g.exportable_meshes(des)]
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.export_scene.gltf(filepath=str(web),export_format='GLB',use_selection=True,
        export_yup=True,export_apply=True,export_normals=True,export_texcoords=False,
        export_materials='EXPORT',export_cameras=False,export_lights=False,export_extras=True)
    model.hide_render=True
    plan['blender']={'triangles':sum(len(o.data.loop_triangles) for o in objects),
        'editable_objects':len(components),'web_material_parts':len(objects),
        'glb_bytes':web.stat().st_size,
        'glb_sha256':hashlib.sha256(web.read_bytes()).hexdigest(),
        'version':bpy.app.version_string,'backface_culling':True,'reference_acceptance':'pending visual review'}
    g.PLAN_PATH.write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    context=collection('CONTEXT_not_exported')
    ground,backdrop=ground_model(des)
    soil=g.A.create_bpy_mesh(bpy,kit,ground,context)
    for mat in soil.data.materials:mat.use_backface_culling=True
    bpy.ops.object.select_all(action='DESELECT');soil.select_set(True);bpy.context.view_layer.objects.active=soil
    bpy.ops.export_scene.gltf(filepath=str(OUT/'scene/ground-preview.glb'),export_format='GLB',use_selection=True,
        export_yup=True,export_apply=True,export_normals=True,export_materials='EXPORT',export_cameras=False,export_lights=False)
    backdrop_ob=g.A.create_bpy_mesh(bpy,kit,backdrop,context)
    for mat in backdrop_ob.data.materials:mat.use_backface_culling=True
    bpy.ops.object.select_all(action='DESELECT');backdrop_ob.select_set(True);bpy.context.view_layer.objects.active=backdrop_ob
    bpy.ops.export_scene.gltf(filepath=str(OUT/'scene/site-context.glb'),export_format='GLB',use_selection=True,
        export_yup=True,export_apply=True,export_normals=True,export_materials='EXPORT',export_cameras=False,export_lights=False)
    apollo=ROOT/'assets/models/rome/rome_apollo.glb'
    if apollo.exists():
        before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(apollo))
        added=set(bpy.data.objects)-before
        # Translation only. Actual palace and natural rock are never remodelled.
        for o in added:
            if o.parent not in added:o.location+=Vector((-20,73,22.4))
            link_object(o,context)
    plantcol=collection('B_preview_planting_only');plants(des,plantcol)
    bpy.ops.object.select_all(action='DESELECT')
    for o in plantcol.objects:o.select_set(True)
    bpy.context.view_layer.objects.active=next(iter(plantcol.objects))
    bpy.ops.object.join()
    bpy.ops.export_scene.gltf(filepath=str(OUT/'scene/planting-preview.glb'),export_format='GLB',use_selection=True,
        export_yup=True,export_apply=True,export_normals=True,export_materials='EXPORT',export_cameras=False,export_lights=False)
    for m in bpy.data.materials:
        m.use_backface_culling=True
    for engine in ('BLENDER_EEVEE','BLENDER_EEVEE_NEXT'):
        try:sc.render.engine=engine;break
        except TypeError:pass
    sc.render.resolution_x=1440;sc.render.resolution_y=1000;sc.render.resolution_percentage=100
    sc.render.image_settings.file_format='PNG';sc.render.film_transparent=False
    sc.view_settings.view_transform='AgX';sc.view_settings.exposure=.05
    world=bpy.data.worlds.new('B_preview_sky');world.use_nodes=True;sc.world=world
    world.node_tree.nodes['Background'].inputs[0].default_value=(.65,.73,.87,1)
    world.node_tree.nodes['Background'].inputs[1].default_value=.65
    sun=bpy.data.objects.new('B_preview_sun',bpy.data.lights.new('B_preview_sun','SUN'));context.objects.link(sun)
    sun.data.energy=2.5;sun.data.angle=.08;sun.rotation_euler=(math.radians(28),math.radians(-28),math.radians(-32))
    area=bpy.data.objects.new('B_preview_fill',bpy.data.lights.new('B_preview_fill','AREA'));context.objects.link(area)
    area.location=g.to_blender((75,210,60));area.data.energy=900;area.data.shape='DISK';area.data.size=30
    area.rotation_euler=(Vector(g.to_blender((75,167,24)))-area.location).to_track_quat('-Z','Y').to_euler()
    cam=bpy.data.objects.new('B_preview_camera',bpy.data.cameras.new('B_preview_camera'));context.objects.link(cam);sc.camera=cam
    cam.data.clip_end=3000;cam.data.clip_start=.1;cam.data.type='PERSP'
    shots=[('01-overview',(114,248,83),(75,166,26),49),
        ('02-water-court',(87,181,28),(75,157,25),26),
        ('03-seating',(100,203,30),(74,180,17),35),
        ('04-arrival',(85,170,49),(58,147,34.2),28)]
    for name,pos,tgt,lens in shots:
        cam.location=g.to_blender(pos);cam.rotation_euler=(Vector(g.to_blender(tgt))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=lens
        sc.render.filepath=str(OUT/'renders'/(name+'.png'));bpy.ops.render.render(write_still=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'scene/review-B.blend'))
    print('B_BUILD_OK',json.dumps(plan['blender']),flush=True)

main()
