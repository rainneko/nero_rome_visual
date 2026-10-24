import numpy as np, trimesh, math, sys
sys.path.insert(0,'/tmp/jup');import jupiter_model
from trimesh.visual.material import PBRMaterial
from trimesh.transformations import translation_matrix as T, rotation_matrix as Rm
class TB:
    def __init__(s):s.G={}
    def put(s,m,mat,flat=True):
        if flat:m=m.copy();m.unmerge_vertices()
        s.G.setdefault(mat,[]).append(m)
    def box(s,cx,cy,z0,sx,sy,sz,mat):s.put(trimesh.creation.box(extents=(sx,sy,sz),transform=T((cx,cy,z0+sz/2))),mat)
    def boxr(s,cx,cy,z0,sx,sy,sz,mat,rz=0,tilt=0):
        M=T((cx,cy,z0))@Rm(rz,[0,0,1])@Rm(tilt,[1,0,0])@T((0,0,sz/2));s.put(trimesh.creation.box(extents=(sx,sy,sz),transform=M),mat)
    def boxr2(s,cx,cy,zc,lx,sy,sz,mat,ry):
        M=T((cx,cy,zc))@Rm(ry,[0,1,0]);s.put(trimesh.creation.box(extents=(lx,sy,sz),transform=M),mat)
    def ring(s,cx,cy,z0,rs,h,seg,mat):
        n=len(rs);V=[(cx+rs[i]*math.cos(2*math.pi*i/n),cy+rs[i]*math.sin(2*math.pi*i/n),z) for z in(z0,z0+h) for i in range(n)]
        return V
    def frustum(s,cx,cy,z0,r1,h,mat,seg=20,r2=None):
        r2=r1 if r2 is None else r2;a=np.linspace(0,2*np.pi,seg,endpoint=False);V=[(cx+r1*np.cos(t),cy+r1*np.sin(t),z0) for t in a]+[(cx+r2*np.cos(t),cy+r2*np.sin(t),z0+h) for t in a]+[(cx,cy,z0),(cx,cy,z0+h)];F=[];b,t_=2*seg,2*seg+1
        for i in range(seg):j=(i+1)%seg;F+=[(i,j,seg+j),(i,seg+j,seg+i),(b,j,i),(t_,seg+i,seg+j)]
        s.put(trimesh.Trimesh(V,F,process=False),mat,flat=False)
    def star(s,cx,cy,z0,r1,h,mat,fl=24,dp=.07,r2=None):
        r2=r1 if r2 is None else r2;n=fl*2;V=[];F=[]
        for rr,z in((r1,z0),(r2,z0+h)):
            for i in range(n):a=2*np.pi*i/n;q=rr*(1-dp*(i%2));V.append((cx+q*np.cos(a),cy+q*np.sin(a),z))
        V+=[(cx,cy,z0),(cx,cy,z0+h)];b,t_=2*n,2*n+1
        for i in range(n):j=(i+1)%n;F+=[(i,j,n+j),(i,n+j,n+i),(b,j,i),(t_,n+i,n+j)]
        s.put(trimesh.Trimesh(V,F,process=False),mat,flat=False)
    def prism(s,pts,y0,y1,mat):
        n=len(pts);V=[(x,y0,z) for x,z in pts]+[(x,y1,z) for x,z in pts];F=[]
        for i in range(1,n-1):F+=[(0,i+1,i),(n,n+i,n+i+1)]
        for i in range(n):j=(i+1)%n;F+=[(i,j,n+j),(i,n+j,n+i)]
        m=trimesh.Trimesh(V,F,process=False);m.fix_normals();s.put(m,mat)
B=TB();jupiter_model.build(B)
PAL={'marble':([214,206,188],0,.5),'stone':([166,152,128],0,.85),'gold':([255,186,80],1,.3),'dark':([18,15,13],0,1),'tympanum':([30,48,96],0,.8)}
Y=np.array([[1,0,0,0],[0,0,1,0],[0,-1,0,0],[0,0,0,1]],float);sc=trimesh.Scene();tris=0
for k,ms in B.G.items():
    m=trimesh.util.concatenate(ms);m.apply_transform(Y);c,met,ro=PAL[k]
    m.visual=trimesh.visual.TextureVisuals(material=PBRMaterial(name=k,baseColorFactor=c+[255],metallicFactor=met,roughnessFactor=ro));_=m.vertex_normals;tris+=len(m.faces);sc.add_geometry(m,geom_name=k)
open('/tmp/site/jupiter.glb','wb').write(sc.export(file_type='glb',include_normals=True));print('TRIS',tris)
