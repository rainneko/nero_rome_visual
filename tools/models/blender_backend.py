# Run inside Blender (Scripting tab). Put jupiter_model.py next to this file, or paste its build() above.
import bpy, bmesh, math, sys, os
sys.path.insert(0,os.path.dirname(bpy.data.filepath) or os.getcwd())
import jupiter_model
bpy.ops.wm.read_factory_settings(use_empty=True)
MATS={}
def M(name,col,metal,rough):
    m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*col,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough;MATS[name]=m
for n,c,me,r in(('marble',(.84,.81,.74),0,.5),('stone',(.65,.6,.5),0,.85),('gold',(1,.73,.31),1,.3),('dark',(.07,.06,.05),0,1),('tympanum',(.12,.19,.38),0,.8)):M(n,c,me,r)
bm=bmesh.new();mat_index={k:i for i,k in enumerate(MATS)}
def add(verts,faces,mat):
    vs=[bm.verts.new(v) for v in verts]
    for f in faces:
        try:fa=bm.faces.new([vs[i] for i in f]);fa.material_index=mat_index[mat]
        except ValueError:pass
def cube(M4,mat):
    import mathutils
    P=[(-.5,-.5,-.5),(.5,-.5,-.5),(.5,.5,-.5),(-.5,.5,-.5),(-.5,-.5,.5),(.5,-.5,.5),(.5,.5,.5),(-.5,.5,.5)]
    add([tuple(M4@mathutils.Vector(p)) for p in P],[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],mat)
class BB:
    def box(s,cx,cy,z0,sx,sy,sz,mat):
        import mathutils;cube(mathutils.Matrix.Translation((cx,cy,z0+sz/2))@mathutils.Matrix.Diagonal((sx,sy,sz,1)),mat)
    def boxr(s,cx,cy,z0,sx,sy,sz,mat,rz=0,tilt=0):
        import mathutils;T=mathutils.Matrix.Translation;R=mathutils.Matrix.Rotation;cube(T((cx,cy,z0))@R(rz,4,'Z')@R(tilt,4,'X')@T((0,0,sz/2))@mathutils.Matrix.Diagonal((sx,sy,sz,1)),mat)
    def boxr2(s,cx,cy,zc,lx,sy,sz,mat,ry):
        import mathutils;cube(mathutils.Matrix.Translation((cx,cy,zc))@mathutils.Matrix.Rotation(ry,4,'Y')@mathutils.Matrix.Diagonal((lx,sy,sz,1)),mat)
    def frustum(s,cx,cy,z0,r1,h,mat,seg=20,r2=None):
        r2=r1 if r2 is None else r2;V=[(cx+r*math.cos(2*math.pi*i/seg),cy+r*math.sin(2*math.pi*i/seg),z) for r,z in((r1,z0),(r2,z0+h)) for i in range(seg)]
        F=[(i,(i+1)%seg,seg+(i+1)%seg,seg+i) for i in range(seg)]+[tuple(range(seg-1,-1,-1)),tuple(range(seg,2*seg))];add(V,F,mat)
    def star(s,cx,cy,z0,r1,h,mat,fl=24,dp=.07,r2=None):
        r2=r1 if r2 is None else r2;n=fl*2;V=[(cx+rr*(1-dp*(i%2))*math.cos(2*math.pi*i/n),cy+rr*(1-dp*(i%2))*math.sin(2*math.pi*i/n),z) for rr,z in((r1,z0),(r2,z0+h)) for i in range(n)]
        F=[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]+[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))];add(V,F,mat)
    def prism(s,pts,y0,y1,mat):
        n=len(pts);V=[(x,y0,z) for x,z in pts]+[(x,y1,z) for x,z in pts];F=[tuple(range(n)),tuple(range(2*n-1,n-1,-1))]+[(i,n+i,n+(i+1)%n,(i+1)%n) for i in range(n)];add(V,F,mat)
jupiter_model.build(BB())
bmesh.ops.recalc_face_normals(bm,faces=bm.faces);me=bpy.data.meshes.new('Iuppiter');bm.to_mesh(me);bm.free()
for m in MATS.values():me.materials.append(m)
ob=bpy.data.objects.new('Iuppiter_Optimus_Maximus',me);bpy.context.scene.collection.objects.link(ob)
out=os.path.join(os.path.expanduser('~'),'jupiter_temple.glb')
bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
bpy.ops.export_scene.gltf(filepath=out,export_format='GLB',use_selection=True);print('exported',out)
