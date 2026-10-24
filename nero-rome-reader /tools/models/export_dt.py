import numpy as np, trimesh, math, sys
sys.path.insert(0,'/tmp/jup');import tiberiana_model
from trimesh.visual.material import PBRMaterial
from trimesh.transformations import translation_matrix as T
class TB:
    def __init__(s):s.G={}
    def put(s,m,mat,flat=True):
        if flat:m=m.copy();m.unmerge_vertices()
        s.G.setdefault(mat,[]).append(m)
    def box(s,cx,cy,z0,sx,sy,sz,mat):s.put(trimesh.creation.box(extents=(sx,sy,sz),transform=T((cx,cy,z0+sz/2))),mat)
    def frustum(s,cx,cy,z0,r1,h,mat,seg=12,r2=None):
        r2=r1 if r2 is None else r2;a=np.linspace(0,2*np.pi,seg,endpoint=False);V=[(cx+r1*np.cos(t),cy+r1*np.sin(t),z0) for t in a]+[(cx+r2*np.cos(t),cy+r2*np.sin(t),z0+h) for t in a]+[(cx,cy,z0),(cx,cy,z0+h)];F=[];b,t_=2*seg,2*seg+1
        for i in range(seg):j=(i+1)%seg;F+=[(i,j,seg+j),(i,seg+j,seg+i),(b,j,i),(t_,seg+i,seg+j)]
        s.put(trimesh.Trimesh(V,F,process=False),mat,flat=False)
    def prism(s,pts,a0,a1,mat,axis='y0',ox=0,oy=0):
        n=len(pts)
        if axis=='x':V=[(a0+ox,u+oy,z) for u,z in pts]+[(a1+ox,u+oy,z) for u,z in pts]
        elif axis=='y':V=[(u+ox,a0+oy,z) for u,z in pts]+[(u+ox,a1+oy,z) for u,z in pts]
        else:V=[(u,a0,z) for u,z in pts]+[(u,a1,z) for u,z in pts]
        F=[]
        for i in range(1,n-1):F+=[(0,i+1,i),(n,n+i,n+i+1)]
        for i in range(n):j=(i+1)%n;F+=[(i,j,n+j),(i,n+j,n+i)]
        m=trimesh.Trimesh(V,F,process=False);m.fix_normals();s.put(m,mat)
    def prismN(s,cx,cy,z0,w,h,alongX,mat):
        if alongX:s.prism([(cx-w/2,z0),(cx+w/2,z0),(cx,z0+h)],cy-.12,cy+.12,mat,axis='y0')
        else:s.prism([(cy-w/2,z0),(cy+w/2,z0),(cy,z0+h)],cx-.12,cx+.12,mat,axis='x',ox=0,oy=0)
B=TB();tiberiana_model.build(B)
PAL={'plaster':([224,214,192],0,.85),'marble':([232,228,216],0,.5),'stone':([196,182,156],0,.9),'roof':([170,92,58],0,.75),'gold':([236,168,64],1,.32),'void':([104,90,74],0,1),'red':([150,40,30],0,.8)}
Y=np.array([[1,0,0,0],[0,0,1,0],[0,-1,0,0],[0,0,0,1]],float);sc=trimesh.Scene();tris=0
for k,ms in B.G.items():
    m=trimesh.util.concatenate(ms);m.apply_transform(Y);c,met,ro=PAL[k]
    m.visual=trimesh.visual.TextureVisuals(material=PBRMaterial(name=k,baseColorFactor=c+[255],metallicFactor=met,roughnessFactor=ro));_=m.vertex_normals;tris+=len(m.faces);sc.add_geometry(m,geom_name=k)
open('/tmp/site/tiberiana.glb','wb').write(sc.export(file_type='glb',include_normals=True));print('TRIS',tris)
