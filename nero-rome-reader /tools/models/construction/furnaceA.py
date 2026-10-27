import os, sys, math, json
from pathlib import Path
import bpy
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(ROOT / 'tools/models/rome'))
import rk as kit
from mathutils import Vector

OUT = ROOT / 'assets/models/construction/furnaceA'
RENDER = ROOT / 'renders/construction/furnaceA/model'
OUT.mkdir(parents=True, exist_ok=True); RENDER.mkdir(parents=True, exist_ok=True)
XS = (-150.0, -110.0, -70.0)
YARD = 0.2
kit.PAL.update({'redbrick':((0.57,.27,.19),0,.92),'refractory':((.80,.74,.61),0,.94),
 'mortar':((.48,.43,.35),0,.98),'timber':((.34,.22,.12),0,.90),'rope':((.55,.42,.25),0,.98),
 'darkthroat':((.12,.105,.085),0,1),'clay':((.66,.52,.35),0,.98)})

def box(x,y,z,sx,sy,sz,mat,rot=0): kit.box(None,x,y,z,sx,sy,sz,mat,rot)
def beam(a,b,w=.22,h=.22,mat='timber'): kit.beam(None,*a,*b,w,h,mat)
def ring_square(cx,cy,base,outer,inner,height,mat='stone',n=4):
    # Open square ring with course-height horizontal cuts; every course is tangible masonry.
    for k in range(n):
        z0=base+height*k/n; z1=base+height*(k+1)/n
        t0=outer[0]+(outer[1]-outer[0])*k/n; t1=outer[0]+(outer[1]-outer[0])*(k+1)/n
        q0=inner[0]+(inner[1]-inner[0])*k/n; q1=inner[0]+(inner[1]-inner[0])*(k+1)/n
        for i in range(4):
            a=i*math.pi/2; b=(i+1)*math.pi/2
            pts=[(cx+t0*math.cos(a),cy+t0*math.sin(a),z0),(cx+t0*math.cos(b),cy+t0*math.sin(b),z0),
                 (cx+t1*math.cos(b),cy+t1*math.sin(b),z1),(cx+t1*math.cos(a),cy+t1*math.sin(a),z1)]
            kit.add_poly(mat,pts)
            ip=[(cx+q0*math.cos(a),cy+q0*math.sin(a),z0),(cx+q1*math.cos(a),cy+q1*math.sin(a),z1),
                (cx+q1*math.cos(b),cy+q1*math.sin(b),z1),(cx+q0*math.cos(b),cy+q0*math.sin(b),z0)]
            kit.add_poly('darkthroat' if mat=='redbrick' else mat,ip)
            kit.add_poly(mat,[pts[0],pts[3],ip[1],ip[0]])
    # Upper course rim only: no cap across either furnace or chimney mouth.
    z=base+height; a0=outer[0]+(outer[1]-outer[0]); b0=inner[0]+(inner[1]-inner[0])
    for i in range(4):
        a=i*math.pi/2; b=(i+1)*math.pi/2
        kit.add_poly(mat,[(cx+a0*math.cos(a),cy+a0*math.sin(a),z),(cx+a0*math.cos(b),cy+a0*math.sin(b),z),
                         (cx+b0*math.cos(b),cy+b0*math.sin(b),z),(cx+b0*math.cos(a),cy+b0*math.sin(a),z)])

def rope_line(a,b,r=.045): beam(a,b,r,r,'rope')
def survey(cx, cz, w, d):
    for x in (-w/2,w/2):
        for z in (-d/2,d/2):
            box(cx+x,cz+z,YARD,.11,.11,1.0,'timber')
    for z in (-d/2,d/2): rope_line((cx-w/2,cz+z,YARD+.7),(cx+w/2,cz+z,YARD+.7))
    for x in (-w/2,w/2): rope_line((cx+x,cz-d/2,YARD+.7),(cx+x,cz+d/2,YARD+.7))

def house(cx,cz,stage):
    # 18x13m casting house. Native plan long axis is x; gable ridge also runs x.
    x0,x1=cx-9,cx+9; z0,z1=cz-6.5,cz+6.5; base=-1; eave=6.5
    if stage==0:
        survey(cx,cz,18,13); return
    if stage==1:
        box(cx,cz,base,18,13,.6,'tuff')
        for z in (z0,z1): box(cx,z,base+.6,18,.55,1.3,'refractory')
        for x in (x0,x1): box(x,cz,base+.6,.55,13,1.3,'refractory')
        return
    walltop=3.0 if stage==2 else 6.5
    # Course joints are narrow recessed mortar bands; the final course meets the eaves exactly.
    ncourse=math.ceil((walltop-base)/.65)
    for k in range(ncourse):
        lo=base+k*.65; hi=min(lo+.65,walltop); last=(k==ncourse-1)
        h=(hi-lo) if last else max(.05,hi-lo-.035)
        gap=0 if last else hi-(lo+h)
        def wall_segment(x,y,sx,sy):
            box(x,y,lo,sx,sy,h,'redbrick')
            if gap>0:
                msx,msy=(sx*.995,sy-.06) if sx>sy else (sx-.06,sy*.995)
                box(x,y,lo+h,msx,msy,gap,'mortar')
        wall_segment(cx-5,cz-6.5,8,.42); wall_segment(cx+5,cz-6.5,8,.42)
        wall_segment(cx,cz+6.5,18,.42)
        for x in (x0,x1): wall_segment(x,cz,.42,13)
    if stage==2: return
    ridge=eave+6.5*math.tan(math.radians(22))
    # Complete simple gable timber frame; half tiled roof on western half only.
    for x in (x0,x0+4,x0+8,x0+12,x1):
        beam((x,z0-.3,eave),(x,cz,ridge),.18,.2)
        beam((x,cz,ridge),(x,z1+.3,eave),.18,.2)
        beam((x,z0-.3,eave),(x,z1+.3,eave),.18,.2)
    beam((x0,cz,ridge),(x1,cz,ridge),.24,.25)
    for x in (x0,x1):
        beam((x,z0-.3,eave),(x,cz,ridge),.22,.22)
        beam((x,cz,ridge),(x,z1+.3,eave),.22,.22)
    # Roof tiles follow the actual 22-degree gable pitch on only one longitudinal half.
    for j in range(36):
        xa=x0+j*.49; xb=min(x1,xa+.45)
        if xb>cx: continue
        for side in (-1,1):
            outerz=cz+side*6.8
            outerh=eave-(.3*math.tan(math.radians(22)))
            kit.add_poly('tile',[(xa,cz,ridge),(xb,cz,ridge),(xb,outerz,outerh),(xa,outerz,outerh)])

def scaffold(cx,cz,base,top,radius,levels=0):
    # square/diamond timber scaffold, posts seated on small timber sole plates, braced each bay.
    levels=max(1,levels)
    corners=[(cx-radius,cz-radius),(cx+radius,cz-radius),(cx+radius,cz+radius),(cx-radius,cz+radius)]
    for px,pz in corners: box(px,pz,base,.85,.85,.26,'timber')
    for px,pz in corners: beam((px,pz,base+.12),(px,pz,top),.25,.25)
    for li in range(1,levels+1):
        h=base+(top-base)*li/(levels+1)
        for i in range(4):
            p=corners[i]; q=corners[(i+1)%4]
            beam((p[0],p[1],h),(q[0],q[1],h),.18,.2)
            # board walkways rest directly on transverse ledgers
            mid=((p[0]+q[0])/2,(p[1]+q[1])/2)
            if abs(p[0]-q[0])>abs(p[1]-q[1]): box(mid[0],mid[1],h-.18,2*radius,.55,.16,'wood')
            else: box(mid[0],mid[1],h-.18,.55,2*radius,.16,'wood')
            if i%2==0: beam((p[0],p[1],base+.22),(q[0],q[1],h),.13,.13)
            else: beam((q[0],q[1],base+.22),(p[0],p[1],h),.13,.13)
        for i in range(4):
            p=corners[i]; q=corners[(i+1)%4]
            rope_line((p[0]-.12,p[1],h-.06),(p[0]+.12,p[1],h+.06),.055)

def chimney(cx,cz,stage):
    base=-1
    if stage==0:
        for i in range(16):
            a=2*math.pi*i/16; x=cx+2.4*math.cos(a); z=cz+2.4*math.sin(a)
            box(x,z,YARD,.12,.12,.8,'timber')
        for i in range(16):
            a=2*math.pi*i/16; b=2*math.pi*(i+1)/16
            rope_line((cx+2.4*math.cos(a),cz+2.4*math.sin(a),YARD+.55),(cx+2.4*math.cos(b),cz+2.4*math.sin(b),YARD+.55))
        return
    if stage==1:
        kit.cyl(None,cx,cz,base,2.7,1.15,'tuff',24,r_top=2.3,smooth=False)
        kit.cyl(None,cx,cz,.15,2.25,.7,'redbrick',24,r_top=2.15,smooth=False)
        return
    h=12 if stage==2 else 34.6
    # Editable profile follows the existing stepped/flared chimney silhouette, scaled by actual cut height.
    prof=[(2.4,0),(2.4,1),(2.0,11),(1.7,25),(1.55,33),(1.85,33.6),(1.85,34.6)]
    sampled=[]
    for r,y in prof:
        if y<=h: sampled.append((r,y))
        else:
            if sampled:
                pr,py=sampled[-1]; nr,ny=r,y; frac=(h-py)/(ny-py); sampled.append((pr+(nr-pr)*frac,h))
            break
    if sampled[-1][1]<h: sampled.append((sampled[-1][0],h))
    # build mesh as a many-sided square-ish brick stack, hollow with dark inner lining
    kit.lathe(None,cx,cz,[(r,y+base) for r,y in sampled]+[(max(1.15,sampled[-1][0]-.5),h+base)],'redbrick',16,False)
    # inner throat wall and mouth annulus, with an open void. Profile walls nested inward.
    kit.lathe(None,cx,cz,[(max(.75,r-.42),y+base) for r,y in sampled]+[(max(.75,sampled[-1][0]-.85),h+base)],'darkthroat',16,False)
    if stage==2: scaffold(cx,cz,YARD,h+base,3.4,4)
    elif stage==3: scaffold(cx,cz,YARD,31.6,3.4,13)

def furnace(cx,cz,stage):
    # Furnace footprint is diamond section from the original four-profile lathe. Heights are real.
    if stage==0: survey(cx,cz,15,15); return
    base=-3
    if stage==1:
        ring_square(cx,cz,base,(7.8,7.4),(6.5,6.1),3.8,'tuff',4)
        ring_square(cx,cz,.25,(7.4,7.25),(6.1,5.95),.55,'refractory',1)
        return
    top=11 if stage==2 else 20
    full=[(7.5,0),(7.5,3),(6.8,11),(5.2,17),(4.6,18.5),(4.9,19),(4.9,20),(0,20)]
    def rad(y):
        for j in range(len(full)-1):
            if full[j][1]<=y<=full[j+1][1]:
                u=(y-full[j][1])/(full[j+1][1]-full[j][1]); return full[j][0]*(1-u)+full[j+1][0]*u
        return full[-1][0]
    cuts=sorted(set([round(v*.6,5) for v in range(math.ceil(top/.6))]+[0.0,top]+[y for r,y in full if 0<y<top]))
    for y0,y1 in zip(cuts,cuts[1:]):
        r0,r1=rad(y0),rad(y1)
        ring_square(cx,cz,base+y0,(r0,r1),(max(0,r0-1.15),max(0,r1-1.15)),y1-y0,'refractory',1)
        if y1<20:
            for i in range(4):
                a=i*math.pi/2; b=(i+1)*math.pi/2
                aa=(cx+r1*math.cos(a),cz+r1*math.sin(a),base+y1-.035); bb=(cx+r1*math.cos(b),cz+r1*math.sin(b),base+y1-.035)
                rope_line(aa,bb,.035)
    if stage==2: scaffold(cx,cz,YARD,base+top+1,9.2,3)
    if stage==3: scaffold(cx,cz,YARD,9,9.2,3)
    # modest iron tapping opening; dark, cold, no fire.
    box(cx,cz-7.3,base+5.2,1.2,.16,.5,'dark')
    if stage>=2:
        # separate 3.2m loading gantry on rear/north side. Each beam has direct post/brace support.
        gz=16 if stage==2 else 16
        for dx in (-1.2,1.2): beam((cx+dx,cz+11,YARD),(cx+dx,cz+11,gz),.34,.34)
        beam((cx-1.6,cz+11,gz),(cx+1.6,cz+11,gz),.4,.4)
        beam((cx,cz+11,gz),(cx,cz+2,gz),.24,.24)
        beam((cx-1.2,cz+11,gz),(cx,cz+3,gz-4),.2,.2)
        beam((cx+1.2,cz+11,gz),(cx,cz+3,gz-4),.2,.2)
        beam((cx,cz+3,gz-4),(cx,cz+3,gz),.2,.2)
        # hand hoist rope and wooden pulley block
        beam((cx,cz+2,gz),(cx,cz+2,gz-1.2),.18,.18)
        kit.cyl(None,cx,cz+2,gz-1.35,.22,.35,'timber',10,smooth=False)

def yard_stock(stage):
    # Three material stacks west of footprints, keep clear route along the levee to south in native z.
    for idx,(x,z,mat) in enumerate([(-176,134,'redbrick'),(-178,150,'refractory'),(-176,166,'timber')]):
        if stage==0:
            for j in range(5): box(x+j*.7,z,YARD,.6,5,.35,mat)
        elif stage>=1:
            for row in range(3):
                for j in range(4): box(x+j*.62,z+row*.7,YARD,.55,.62,.4,mat)
    if stage==0:
        # one central survey datum and quarry/clay piles
        kit.cyl(None,-190,150,YARD,.75,1.2,'timber',8,smooth=False)
        for x,z,ma in [(-160,136,'clay'),(-161,142,'clay')]: kit.sphere(None,x,z,YARD+.35,.75,ma,8,5,z_scale=.55)

def crane(stage):
    if stage!=2:return
    # Manual treadwheel outside the production footprints, west/yard side, all legs bear on ground.
    cx,cz=-198,120; base=YARD; axle=8.0; R=3.2
    for x in (cx-2.4,cx+2.4):
        for z in (cz-1.2,cz+1.2): beam((x,z,base),(x,z,axle),.28,.28)
    for z in (cz-1.2,cz+1.2): beam((cx-2.4,z,axle),(cx+2.4,z,axle),.28,.28)
    kit.vdisc(None,cx,cz-1.2,4.0,R,.35,'timber',16)
    for i in range(12):
        a=2*math.pi*i/12
        beam((cx,cz-1.2,4),(cx,cz-1.2+R*math.cos(a),4+R*math.sin(a)),.12,.12)
    beam((cx-2.4,cz-1.2,4),(cx+2.4,cz-1.2,4),.24,.24)
    beam((cx,cz-1.2,4),(cx,cz+2.2,4),.28,.28)
    beam((cx,cz+2.2,4),(cx,cz+2.2,10),.2,.2)
    beam((cx-2,cz+2.2,10),(cx+2,cz+2.2,10),.2,.2)
    for x in (cx-2,cx+2): beam((x,cz+2.2,base),(x,cz+2.2,10),.2,.2)
    beam((cx,cz+2.2,10),(cx,cz+2.2,3),.08,.08,'rope')

def stage_scene(stage):
    kit.reset()
    for i,cx in enumerate(XS):
        cz=150
        furnace(cx,cz,stage)
        chimney(cx+11,cz+4,stage)
        house(cx,cz-15,stage)
    yard_stock(stage); crane(stage)
    return kit._bk._build_object('furnaceA_K%d'%stage)

def save_stage(stage, ob):
    # Set object origin at the zone origin; mesh coordinates stay in native local coordinates.
    ob.location=(0,0,0); ob.rotation_euler=(0,0,0)
    glb=OUT/('K%d.glb'%stage)
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active=ob
    bpy.ops.export_scene.gltf(filepath=str(glb),export_format='GLB',use_selection=True,export_yup=True,export_apply=True,export_normals=True,export_texcoords=False,export_materials='EXPORT',export_cameras=False,export_lights=False)
    tris=sum(len(p.vertices)-2 for p in ob.data.polygons)
    coords=[ob.matrix_world@Vector(v) for v in ob.bound_box]
    bounds=[[round(min(v[i] for v in coords),3) for i in range(3)],[round(max(v[i] for v in coords),3) for i in range(3)]]
    gltf_bounds=[[bounds[0][0],bounds[0][2],-bounds[1][1]],[bounds[1][0],bounds[1][2],-bounds[0][1]]]
    bpy.ops.wm.save_as_mainfile(filepath=str(RENDER/('furnaceA_K%d.blend'%stage)))
    return {'stage':'K%d'%stage,'triangles':tris,'bounds_blender_xyz':bounds,'bounds_gltf_xyz':gltf_bounds,'bytes':glb.stat().st_size,'glb':str(glb),'blend':str(RENDER/('furnaceA_K%d.blend'%stage))}

def render_k2(ob):
    scene=bpy.context.scene; scene.render.engine='CYCLES'; scene.cycles.samples=12; scene.cycles.use_denoising=False
    scene.render.threads_mode='FIXED'; scene.render.threads=2
    scene.render.resolution_x=800; scene.render.resolution_y=450; scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG'; scene.render.film_transparent=False
    world=bpy.data.worlds.new('construction_preview_world'); scene.world=world; world.use_nodes=True
    world.node_tree.nodes['Background'].inputs[0].default_value=(.47,.53,.57,1)
    world.node_tree.nodes['Background'].inputs[1].default_value=.8
    bpy.ops.mesh.primitive_plane_add(size=700,location=(-110,150,-.4)); ground=bpy.context.object; ground.name='preview_only_ground'
    gm=bpy.data.materials.new('preview_ground'); gm.diffuse_color=(.32,.31,.27,1); ground.data.materials.append(gm)
    sun_data=bpy.data.lights.new('preview_sun','SUN');sun=bpy.data.objects.new('preview_sun',sun_data);scene.collection.objects.link(sun);sun.rotation_euler=(.35,-.55,-.4);sun_data.energy=2
    # bounding-box framing, four requested cameras. Three views and front/side use landscape orthographic projection.
    target=Vector((-127,150,6.5));
    dirs={'front':Vector((0,-1,.12)),'side':Vector((1,0,.12)),'three':Vector((1,-1,.62))}
    for name,d in dirs.items():
        camdata=bpy.data.cameras.new('cam_'+name);cam=bpy.data.objects.new('cam_'+name,camdata);scene.collection.objects.link(cam)
        cam.location=target+d.normalized()*250;cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();camdata.type='ORTHO';camdata.ortho_scale={'front':185,'side':82,'three':185}[name];scene.camera=cam
        scene.render.filepath=str(RENDER/(name+'.png'));bpy.ops.render.render(write_still=True)
    camdata=bpy.data.cameras.new('cam_top');cam=bpy.data.objects.new('cam_top',camdata);scene.collection.objects.link(cam);cam.location=( -127,150,260);cam.rotation_euler=(0,0,0);camdata.type='ORTHO';camdata.ortho_scale=185;scene.camera=cam
    scene.render.filepath=str(RENDER/'top.png');bpy.ops.render.render(write_still=True)

def render_k3_three(ob):
    scene=bpy.context.scene; scene.render.engine='CYCLES'; scene.cycles.samples=12; scene.cycles.use_denoising=False
    scene.render.threads_mode='FIXED'; scene.render.threads=2
    scene.render.resolution_x=800; scene.render.resolution_y=450; scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG'; scene.render.film_transparent=False
    world=bpy.data.worlds.new('construction_k3_preview_world'); scene.world=world; world.use_nodes=True
    world.node_tree.nodes['Background'].inputs[0].default_value=(.47,.53,.57,1); world.node_tree.nodes['Background'].inputs[1].default_value=.8
    bpy.ops.mesh.primitive_plane_add(size=700,location=(-110,150,-.4)); ground=bpy.context.object; ground.name='preview_only_ground'
    gm=bpy.data.materials.new('preview_ground_k3'); gm.diffuse_color=(.32,.31,.27,1); ground.data.materials.append(gm)
    ld=bpy.data.lights.new('preview_sun_k3','SUN');sun=bpy.data.objects.new('preview_sun_k3',ld);scene.collection.objects.link(sun);sun.rotation_euler=(.35,-.55,-.4);ld.energy=2
    target=Vector((-116,150,15)); d=Vector((1,-1,.62)).normalized()
    cd=bpy.data.cameras.new('cam_K3_three');cam=bpy.data.objects.new('cam_K3_three',cd);scene.collection.objects.link(cam)
    cam.location=target+d*250;cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cd.type='ORTHO';cd.ortho_scale=175;scene.camera=cam
    scene.render.filepath=str(RENDER/'K3_three.png');bpy.ops.render.render(write_still=True)

def main():
    reports=[]
    for stage in range(4):
        ob=stage_scene(stage)
        reports.append(save_stage(stage,ob))
        if stage==2: render_k2(ob)
        if stage==3: render_k3_three(ob)
    report={'asset':'furnaceA','coordinate_rule':'Blender X=native x, Blender Y=-native z, Blender Z=native y; glTF Y-up exports Blender Y as negative glTF Z; origin is zone origin.','stages':reports,
      'notes':'Three furnaces and separate chimneys retained as scene design; source novel states three chimneys. All scaffolds have posts and braces reaching ground/sole plates; no modern equipment, people, trees, fire or smoke. No preview ground exported.'}
    (RENDER/'report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    (RENDER/'notes.md').write_text('K0 survey and material stock; K1 low furnace/chimney/house footings; K2 body 8m, chimneys 12m, grounded timber scaffolds, open houses, treadwheel crane; K3 full cold masonry, open chimney mouths, partially tiled casting roofs, finishing scaffold and supported loading gantries. Novel evidence: Chapter 19 says “三座高耸的红砖烟囱拔地而起”. The three furnace bodies are retained from the current scene design; the novel specifies three chimneys, not three furnaces. Remaining construction details follow the design brief.\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))
if __name__=='__main__': main()
