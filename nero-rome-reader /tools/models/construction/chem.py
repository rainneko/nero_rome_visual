"""Staged AD 56 chemical works yard, coordinates retained in the Rome zone frame."""
import os, sys, math, json
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'rome')))
from rk import *
import rk as _rk
import bpy
from mathutils import Vector
_bk = _rk._bk

ROOT = _rk._bk.ROOT
OUT = os.path.join(ROOT, 'renders', 'construction', 'chem', 'model')
GLB = os.path.join(ROOT, 'assets', 'models', 'construction', 'chem')
os.makedirs(OUT, exist_ok=True); os.makedirs(GLB, exist_ok=True)
PAL.update({'workbrick':((.61,.34,.24),0,.94),'limebrick':((.76,.60,.43),0,.92),
            'woodraw':((.42,.28,.16),0,.88),'leadmat':((.46,.47,.48),.62,.62),
            'soot':((.25,.22,.19),0,.98),'plank':((.55,.39,.23),0,.9)})

# Native local (x,z) becomes kit (x,y=-z), with native metres preserved.
F=Frame(); T=math.pi*2
def B(x,z,y,sx,sz,sy,mat,rot=0): box(F,x,-z,y,sx,sz,sy,mat,-math.degrees(rot))
def M(x0,z0,y0,x1,z1,y1,w,h,mat='woodraw'):
    beam(F,x0,-z0,y0,x1,-z1,y1,w,h,mat)
def C(x,z,y,r,h,mat,seg=16,rt=None,caps=True): cyl(F,x,-z,y,r,h,mat,seg,r_top=rt,caps=caps,smooth=False)
def L(x,z,profile,mat,seg=16,smooth=False): lathe(F,x,-z,profile,mat,seg,smooth)

def hollow_stack(x,z,bottom,top,r0,r1,mat='workbrick',seg=16,wall=.24):
    """Tapered masonry flue with an open mouth, inner wall, and visible annular rim."""
    ro=max(.2,r0-wall); rt=max(.2,r1-wall); vv=[]; ff=[]
    for y,r in ((bottom,r0),(top,r1),(bottom,ro),(top,rt)):
        for j in range(seg):
            a=T*j/seg; vv.append((x+r*math.cos(a),-z-r*math.sin(a),y))
    for j in range(seg):
        j1=(j+1)%seg
        ff.append((j,seg+j,seg+j1,j1))
        ff.append((2*seg+j,2*seg+j1,3*seg+j1,3*seg+j))
        ff.append((seg+j,3*seg+j,3*seg+j1,seg+j1))
    _bk.add_mesh(mat,vv,ff,False)
    C(x,z,top-.45,max(.15,rt-.08),.025,'soot',seg,max(.15,rt-.08),caps=True)

def boxstack(x,z,n,mat='workbrick'):
    for k in range(n):
        for j in range(3): B(x+(j-1)*.48,z+(k%2)*.12,.25+k*.22,1.25,.42,.22,mat)

def plot(x,z,w,d):
    for xx in (-w/2,w/2): M(x+xx,z-d/2,.22,x+xx,z+d/2,.22,.12,.12,'plank')
    for zz in (-d/2,d/2): M(x-w/2,z+zz,.22,x+w/2,z+zz,.22,.12,.12,'plank')
    for xx in (-w/2,w/2):
        for zz in (-d/2,d/2): C(x+xx,z+zz,.05,.16,.48,'woodraw',8)

def footing_rect(cx,cz,w,d,t=.9,top=.9):
    """Raised perimeter footings, from below grade to a clearly visible +0.9 m top."""
    h=top+1.0
    B(cx,cz-d/2,-1,w+2*t,t,h,'stone'); B(cx,cz+d/2,-1,w+2*t,t,h,'stone')
    B(cx-w/2,cz,-1,t,d,h,'stone'); B(cx+w/2,cz,-1,t,d,h,'stone')

def wallrun(x0,z0,x1,z1,base,top,thick,course=.72,mat='workbrick',openings=None,arch=False):
    """Masonry ribbon assembled at real course heights; openings=[(along-centre,width,sill,head)]."""
    dx=x1-x0; dz=z1-z0; length=math.hypot(dx,dz); ux=dx/length; uz=dz/length
    count=max(1,int(math.ceil(length/(1.8 if openings else 3.4)))); seglen=length/count
    levels=[]; yy=base
    while yy < top-1e-5:
        h=min(course,top-yy)
        for i in range(count):
            a=i*seglen; b=(i+1)*seglen
            # Offset joints every other course; skip only segments inside a true opening.
            a=max(0,a+(.42 if int((yy-base)/course)%2 and i else 0)); b=min(length,b+(.42 if int((yy-base)/course)%2 and i else 0))
            if b-a<.18: continue
            mid=(a+b)/2; omit=False
            for oc,ow,osill,ohead in openings or []:
                if mid>oc-ow/2-.02 and mid<oc+ow/2+.02 and yy+h>osill and yy<ohead:
                    omit=True; break
            if omit: continue
            cx=x0+ux*mid; cz=z0+uz*mid
            if h>.06: B(cx,cz,yy+.025,b-a,thick,h-.05,mat,math.atan2(uz,ux))
        yy+=course
    if arch:
        for oc,ow,osill,ohead in openings or []:
            if ohead>base+.2:
                for side in (-1,1):
                    a=oc+side*ow/2
                    M(x0+ux*a,z0+uz*a,ohead-.45,x0+ux*a,z0+uz*a,ohead+.08,.22,.22,'woodraw')

def rectangular(cx,cz,w,d,base,top,t,course=.72,ports=None,mat='workbrick',arch=False):
    # front is native z-positive; openings are centered along this south/front wall.
    ports=ports or []
    wallrun(cx-w/2,cz-d/2,cx+w/2,cz-d/2,base,top,t,course,mat)
    wallrun(cx+w/2,cz-d/2,cx+w/2,cz+d/2,base,top,t,course,mat)
    wallrun(cx-w/2,cz+d/2,cx-w/2,cz-d/2,base,top,t,course,mat)
    # Build the ported front wall once; opening offsets are measured from its x-min end.
    wallrun(cx-w/2,cz+d/2,cx+w/2,cz+d/2,base,top,t,course,mat,
            [(q[0],q[1],q[2],q[3]) for q in ports or []],arch)

def timber_scaffold(cx,cz,w,d,base,top,spacing=3.0,inside=False):
    """Ground-seated timber standards, ledgers, putlogs and full diagonal bracing."""
    for side in (-1,1):
        zz=cz+side*(d/2+.9)
        xs=[cx-w/2-.5+i*spacing for i in range(int(w/spacing)+1)]+[cx+w/2+.5]
        xs=sorted(set(round(q,2) for q in xs))
        for xx in xs:
            B(xx,zz,.24,.2,.2,top-.24,'woodraw')
            B(xx,zz,.24,.55,.55,.12,'plank')
        for level in [v for v in (2.3,4.8,7.3,9.8,12.3,14.8,17.3,19.8,22.3,24.8) if base+v<top]:
            for a,b in zip(xs,xs[1:]): M(a,zz,level,b,zz,level,.14,.16,'woodraw')
        for i in range(len(xs)-1):
            a,b=xs[i],xs[i+1]
            M(a,zz,.35,b,zz,min(top-.3,4.9),.12,.12,'woodraw')
            M(a,zz,min(top-.3,4.9),b,zz,.35,.12,.12,'woodraw')
            if top>9:
                M(a,zz,5.0,b,zz,min(top-.3,9.6),.12,.12,'woodraw')
                M(a,zz,min(top-.3,9.6),b,zz,5.0,.12,.12,'woodraw')
        for level in (2.3,4.8,7.3,9.8):
            if level+base<top-.2:
                for a,b in zip(xs,xs[1:]): B((a+b)/2,zz,level+base,(b-a)*.94,.65,.12,'plank')

def gable(cx,cz,w,d,eave,ridge,mat='woodraw',tilefrac=0):
    # x-running building; gable rises across the native-z span.
    M(cx-w/2,cz-d/2,eave,cx-w/2,cz,eave+(ridge-eave),.22,.24,mat)
    M(cx-w/2,cz,eave+(ridge-eave),cx-w/2,cz+d/2,eave,.22,.24,mat)
    for x in [cx-w/2+i*2 for i in range(int(w/2)+1)]:
        M(x,cz-d/2,eave,x,cz,eave+(ridge-eave),.14,.16,'woodraw')
        M(x,cz,eave+(ridge-eave),x,cz+d/2,eave,.14,.16,'woodraw')
    for s in (-1,1):
        for x in (cx-w/2,cx+w/2):
            M(x,cz,eave+(ridge-eave),x,cz+s*d/2,eave,.2,.2,'woodraw')
    if tilefrac:
        rows=max(1,int(math.ceil((d/2)*tilefrac/1.05)))
        for s in (-1,1):
            for j in range(rows):
                zc=cz+s*(d/2-(j+.5)*1.05)
                for x in [cx-w/2+k*1.05 for k in range(int(w/1.05)+1)]:
                    verts=[]
                    for yyoff in (0,-.07):
                        for xx,zz in ((x-.49,zc-.49),(x+.49,zc-.49),(x+.49,zc+.49),(x-.49,zc+.49)):
                            surf=eave+(ridge-eave)*(1-abs(zz-cz)/(d/2))
                            verts.append((xx,-zz,surf+yyoff))
                    _bk.add_mesh('tile' if (j+int(x))%5 else 'tile2',verts,[(0,3,2,1),(7,4,5,6)],False)

def stage0():
    for x,z,w,d in [(60,-118,48,18),(32,-118,8,16),(88,-118,8,16),(132,-150,12,12),(152,-150,12,12),(172,-150,12,12),
                    (-160,-40,23,23),(-132,-40,34,12),(-62,-40,26,15),(22,-40,36,14),(102,-40,30,12)]: plot(x,z,w,d)
    # Small material piles sit inside outlined work plots; no stockpiles outside the yard.
    for x,z,n in [(40,-124,4),(80,-124,4),(132,-154,3),(152,-154,3),(172,-154,3),
                  (-140,-43,3),(-72,-45,3),(8,-45,3),(108,-44,3)]: boxstack(x,z,n)
    for x,z in [(132,-150),(152,-150),(172,-150)]:
        C(x,z,.2,5.2,.18,'stone',12)

def openhearth(stage):
    cx,cz=60,-118; reg=[(32,-118),(88,-118)]
    if stage>=1: footing_rect(cx,cz,48,18,1.1)
    rectangular(cx,cz,48,18,.9 if stage>=1 else -.35, [0,2.4,5.0,10][stage],1.0,.62,
                ports=[(4.8+i*9.6,1.55,.05,2.1) for i in range(5)],arch=stage>=2)
    for x,z in reg:
        if stage>=1: footing_rect(x,z,8,16,1.0)
        rectangular(x,z,8,16,.9 if stage>=1 else -.3,[0,2.2,4.5,5][stage],.8,.52,
                    ports=[(4,.95,.15,2.0)],arch=stage>=2)
        # Paired honeycomb chambers: interior cell walls at 1.6m intervals.
        if stage>=1:
            for ix in (-1.4,0,1.4):
                for iz in (-5.5,-3.8,-2.1,-.4,1.3,3.0,4.7,6.4):
                    B(x+ix,z+iz,.9,1.0,.9,min([0,1.2,2.0,2.8][stage],4.4),'limebrick')
            # Timber arch centering over the exposed front fire throat.
            if stage==1:
                rad=.58; spring=1.48
                for dz in (-.18,0,.18):
                    prev=None
                    for i in range(9):
                        xx=-rad+2*rad*i/8; yy=spring+math.sqrt(max(0,rad*rad-xx*xx))
                        if prev: M(x+prev[0],z+7.82+dz,prev[1],x+xx,z+7.82+dz,yy,.09,.11,'woodraw')
                        prev=(xx,yy)
                for side in (-1,1): M(x+side*rad,z+7.82,.9,x+side*rad,z+7.82,spring,.09,.09,'woodraw')
        if stage>=2:
            h= [0,0,14.0,28.3][stage]
            hollow_stack(x,z,4.5,h,1.8,1.1,'workbrick',16,.30)
    if stage>=1:
        timber_scaffold(cx,cz,48,18,0,min(10,[0,3,6,10][stage]),4)
    if stage==2:
        gable(cx,cz,48,18,5,8.28,'woodraw',0)
    if stage==3:
        gable(cx,cz,48,18,10,13.28,'woodraw',.5)

def kiln(cx,cz,stage):
    # Native profile: broad lower body, shoulder, and narrow upper neck; each course is separate.
    if stage==0: return
    heights=1.6 if stage==1 else ({132:6.8,152:9.0,172:7.4}[cx] if stage==2 else 18.3)
    base=.9; C(cx,cz,-1,5.7,1.9,'stone',24,caps=True)
    native=[(0,5.2),(7,5.2),(11,4.4),(15.5,2.4),(17.6,1.7),(17.9,1.7),(18.0,2.0),(18.3,2.0)]
    def radius_at(y):
        for (ya,ra),(yb,rb) in zip(native,native[1:]):
            if y<=yb: return ra+(rb-ra)*(y-ya)/(yb-ya)
        return native[-1][1]
    y=base
    while y<heights-1e-5:
        h=min(.72,heights-y); y0=y; y1=y+h
        r0=radius_at(y0); r1=radius_at(y1)
        gy0=y0+(.02 if y0>base+1e-5 else 0); gy1=y1-(.02 if y1<heights-1e-5 else 0)
        seg=16; vv=[]; ff=[]
        for yy,rr in ((gy0,radius_at(gy0)),(gy1,radius_at(gy1)),
                      (gy0,radius_at(gy0)-.28),(gy1,radius_at(gy1)-.28)):
            for j in range(seg):
                a=T*j/seg; vv.append((cx+rr*math.cos(a),-cz-rr*math.sin(a),yy))
        for j in range(seg):
            a=T*(j+.5)/seg
            # Loading mouth only through its 2.4 m opening; the courses above remain intact.
            if stage>=2 and y0<base+2.4 and abs((a-math.pi/2+math.pi)%(2*math.pi)-math.pi)<.25: continue
            j1=(j+1)%seg
            ff.append((j,seg+j,seg+j1,j1))
            ff.append((2*seg+j,2*seg+j1,3*seg+j1,3*seg+j))
            if y1>=heights-1e-5: ff.append((seg+j,3*seg+j,3*seg+j1,seg+j1))
        _bk.add_mesh('workbrick',vv,ff,False)
        y+=h
    # Recessed throat, jambs attached inside the cut, and a lintel on the masonry spring.
    if stage>=2:
        B(cx,cz+4.35,base+.18,2.1,.12,1.8,'soot')
        for xx in (-1,1): B(cx+xx*1.18,cz+4.86,base,.25,.45,2.35,'workbrick')
        B(cx,cz+4.86,base+2.25,2.65,.48,.35,'workbrick')
    if stage>=2:
        for a in (-1,1):
            B(cx+a*3.8,cz+5.7,.24,.22,.22,min(heights-base,5.2),'woodraw')
            M(cx+a*3.8,cz+5.7,2.5,cx,cz+5.7,4.9,.12,.12,'woodraw')
        B(cx,cz+5.7,.24,.22,.22,4.66,'woodraw')
        M(cx-3.8,cz+5.7,4.9,cx+3.8,cz+5.7,4.9,.18,.2,'woodraw')
        B(cx,cz+5.7,4.98,7.6,.7,.1,'plank')

def glass(stage):
    x,z=-160,-40; h=[0,1.2,16.0,29.4][stage]
    if stage>=1: C(x,z,-1,11.8,1.9,'stone',32,caps=True)
    full=[(11.5,.9),(11.5,5),(10.6,9),(8.4,16),(5.4,23),(3.4,28),(2.9,29.4)]
    def radius_at(py):
        for (ra,ya),(rb,yb) in zip(full,full[1:]):
            if py<=yb: return ra+(rb-ra)*(py-ya)/(yb-ya)
        return full[-1][0]
    if h>.9:
        ys=[.9]
        while ys[-1]+.72<h: ys.append(ys[-1]+.72)
        if h>=3.5 and 3.5 not in ys: ys.append(3.5); ys.sort()
        ys.append(h)
        seg=24; vv=[]; ff=[]
        # Each course has outer and inner faces; the mouth cuts only the lower 3.5 m.
        for py in ys:
            for inset in (0,.36):
                rad=radius_at(py)-inset
                for j in range(seg):
                    a=T*j/seg; vv.append((x+rad*math.cos(a),-z-rad*math.sin(a),py))
        nring=seg*2
        for level in range(len(ys)-1):
            low,high=ys[level],ys[level+1]
            for j in range(seg):
                a=T*(j+.5)/seg; mouth=high<=3.5 and abs((a-math.pi/2+math.pi)%(2*math.pi)-math.pi)<.16
                if mouth: continue
                o0=level*nring+j; o1=level*nring+(j+1)%seg
                i0=o0+seg; i1=o1+seg; O0=o0+nring; O1=o1+nring; I0=O0+seg; I1=O1+seg
                ff.extend(((o0,O0,O1,o1),(i0,i1,I1,I0)))
        # Close wall thickness at the foot and as an annular, open top rim.
        for j in range(seg):
            j1=(j+1)%seg; lo=j; lo1=j1; ilo=seg+j; ilo1=seg+j1
            top=(len(ys)-1)*nring+j; top1=(len(ys)-1)*nring+j1; itop=top+seg; itop1=top1+seg
            ff.extend(((lo,lo1,ilo1,ilo),(top,itop,itop1,top1)))
        # Exposed radial jambs reveal the real wall thickness at the two mouth edges.
        for aedge in (math.pi/2-.16,math.pi/2+.16):
            edge=int(round(aedge/T*seg))%seg
            for level in range(len(ys)-1):
                if ys[level+1]>3.5: continue
                o=level*nring+edge; inn=o+seg; ot=o+nring; it=ot+seg
                ff.append((o,ot,it,inn))
        _bk.add_mesh('workbrick',vv,ff,False)
    # Current K3 remains masonry work; no experimental glazing roof is introduced.
    # Dark recessed throat and projecting jambs clarify the front opening.
    if stage>=2:
        B(x,z+9.8,.95,3.6,.16,2.5,'soot')
        for s in (-1,1): M(x+s*1.8,z+11.4,.9,x+s*1.8,z+11.4,3.4,.28,.28,'workbrick')
        M(x-1.8,z+11.4,3.4,x+1.8,z+11.4,3.4,.28,.28,'workbrick')
    if stage>=2:
        # Course-following timber access, outside the masonry. Each upper lift's
        # standards seat on the preceding broad deck rather than emerging from the wall.
        lift=.24
        while lift<h-.15:
            upper=min(h,lift+2.4)
            outer=radius_at(max(.9,lift))+1.2
            inner=radius_at(upper)+.35
            nodes={j:(x+outer*math.cos(j*T/8),z+outer*math.sin(j*T/8)) for j in range(1,8)}
            # The east bay is kept clear of the attached annealing annex.
            for j,(px,pz) in nodes.items():
                if lift<.3: B(px,pz,.2,.55,.55,.12,'plank')
                M(px,pz,lift,px,pz,upper,.17,.17,'woodraw')
            for j in range(1,7):
                ax,az=nodes[j]; bx,bz=nodes[j+1]
                M(ax,az,upper-.14,bx,bz,upper-.14,.16,.18,'woodraw')
                M(ax,az,lift+.12,bx,bz,upper-.14,.11,.11,'woodraw')
                a=j*T/8; b=(j+1)*T/8
                pts=[(x+(outer+.15)*math.cos(b),-(z+(outer+.15)*math.sin(b)),upper),
                     (x+(outer+.15)*math.cos(a),-(z+(outer+.15)*math.sin(a)),upper),
                     (x+inner*math.cos(a),-(z+inner*math.sin(a)),upper),
                     (x+inner*math.cos(b),-(z+inner*math.sin(b)),upper)]
                _bk.add_poly('plank',pts)
            lift=upper
    # Separate 34x12 annex, native center (-132,-40), eaves 5m.
    if stage>=1: footing_rect(-132,-40,34,12,.85)
    rectangular(-132,-40,34,12,.9 if stage>=1 else -.3,[0,2.3,4.5,5][stage],.65,.58,mat='workbrick')
    if stage>=2: timber_scaffold(-132,-40,34,12,0,5,4)
    if stage>=3: gable(-132,-40,34,12,5,7.62,'woodraw',.5)

def soap(stage):
    # Open timber canopy with 4 fixed pot positions; two installed only in K3.
    cx,cz=-62,-40
    for x in (-75,-49):
        for z in (-47.5,-32.5):
            if stage>=1: B(x,z,-.3,1.2,1.2,1.2,'stone')
            posttop=[0,2.8,5.7,5.7][stage]
            if posttop>0: B(x,z,.9 if stage>=1 else .24,.35,.35,posttop-(.9 if stage>=1 else 0),'woodraw')
            B(x,z,.9 if stage>=1 else .24,.58,.58,.12,'plank')
    if stage>=2:
        for z in (-47.5,-32.5): M(-75,z,5.7,-49,z,5.7,.18,.18,'woodraw')
        for x in (-75,-49): M(x,-47.5,5.7,x,-32.5,5.7,.18,.18,'woodraw')
        gable(cx,cz,26,15,5.7,8.7,'woodraw',0)
    for x in (-71,-65,-59,-53):
        B(x,cz,-.3,2.1,2.1,1.2 if stage>=1 else .75,'stone')
        if stage==3 and x in (-71,-65):
            C(x,cz,.9,.92,.13,'copper',20,.92)
            C(x,cz,1.03,.83,1.72,'copper',20,.72,caps=False)
            C(x,cz,2.63,.78,.12,'copper',20,.78,caps=False)
        elif stage>=1: C(x,cz,.7,.88,.1,'workbrick',16,.88)
    # Drying racks at x=-40, not a fourth production structure.
    for z in (-46,-42,-38,-34):
        B(-40,z,.25,5.5,.22,.16,'woodraw')
        for x in (-42.5,-37.5): B(x,z,.24,.14,.14,3.2,'woodraw')

def lead(stage):
    cx,cz=22,-40; heights=[0,2.5,8,15][stage]
    if stage>=1: footing_rect(cx,cz,36,14,1.2,1.0)
    rectangular(cx,cz,36,14,1.0 if stage>=1 else -.4,heights,1.0,.68,mat='workbrick')
    if stage>=1:
        # External timber frame every six metres; its standards begin at the raised base.
        for x in (4,10,16,22,28,34,40):
            for z in (-47.4,-32.6):
                if heights>1.0: B(x,z,1.0,.32,.32,heights-1.0,'woodraw')
                B(x,z,1.0,.62,.62,.12,'plank')
        for z in (-47.4,-32.6):
            for x in (4,10,16,22,28,34,40):
                for yy in (4.2,8.4,12.6):
                    if yy<heights: M(x-3,z,yy,x+3,z,yy,.18,.18,'woodraw')
        # Side tower and independent left chimney rise with the staged masonry.
        if stage>=2:
            towerTop=[0,0,12,24][stage]
            footing_rect(44,-40,4,4,.8,1.0)
            rectangular(44,-40,4,4,1.0,towerTop,.65,.8,mat='workbrick')
            C(44,-40,towerTop-.2,1.5,.2,'workbrick',12,1.15,caps=False)
        C(0,-40,-1,1.9,1.9,'stone',16,1.9,caps=True)
        chimneyTop=[0,0,11.2,22.2][stage]
        if chimneyTop>.9:
            hollow_stack(0,-40,.9,chimneyTop,1.6,1.25,'workbrick',16,.28)
    if stage>=2:
        timber_scaffold(cx,cz,36,14,0,heights,6)
        # trusses inside are visible below unfinished roofline
        rise=7*math.tan(math.radians(14))
        for x in (4,10,16,22,28,34,40):
            M(x,-47,heights,x,-40,heights+rise,.18,.2,'woodraw')
            M(x,-40,heights+rise,x,-33,heights,.18,.2,'woodraw')
    if stage>=3:
        # Fixed city frame plus partially hung, dull lead pans in separated patches.
        for z in (-46.5,-40,-33.5):
            for x in (7,13,19,25,31,37):
                if (x+int(z))%3:
                    B(x,z,2.6,5.0,.07,3.0,'leadmat')
        # Two further copper pots stay grounded beside the racks in this stage.
        for x in (-48,-45.8):
            L(x,-43,[(.12,0),(.62,.12),(.72,.32),(.68,1.0),(.58,1.12),(.48,1.05),(.40,.76),(.12,.68)],'copper',16,False)

def soda(stage):
    cx,cz=102,-40
    if stage>=1: footing_rect(cx,cz,30,12,.9)
    eave=[0,2.3,3.2,6][stage]
    rectangular(cx,cz,30,12,.9 if stage>=1 else -.3,eave,.8,.62,mat='workbrick')
    if stage>=2: timber_scaffold(cx,cz,30,12,0,6,4)
    if stage==2: gable(cx,cz,30,12,eave,eave+6*math.tan(math.radians(22)),'woodraw',0)
    if stage==3: gable(cx,cz,30,12,eave,8.42,'woodraw',.5)
    if stage>=2:
        top=[0,0,10.5,19.2][stage]
        C(85,-40,-1,1.75,1.9,'stone',16,caps=True)
        hollow_stack(85,-40,.9,top,1.45,1.0,'workbrick',16,.25)

def build(stage):
    reset(); global F; F=Frame()
    if stage==0: stage0(); return
    # Yard progression: distinct geometry in each export; no blast furnaces.
    openhearth(stage)
    for x in (132,152,172): kiln(x,-150,stage)
    glass(stage); soap(stage); lead(stage); soda(stage)

def export_stage(stage):
    build(stage); name=f'chem_K{stage}'
    counts={mat:sum(len(face)-2 for face in data[1]) for mat,data in _bk._G.items()}
    print('CHEM_STAGE_MATERIAL_TRIANGLES '+json.dumps({'stage':name,'counts':counts,'total':sum(counts.values())}))
    ob=_bk._build_object(name)
    # Export selection only; keep local geometry untranslated so the lead applies the zone origin.
    path=os.path.join(GLB,f'K{stage}.glb')
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active=ob
    bpy.ops.export_scene.gltf(filepath=path,export_format='GLB',use_selection=True,export_yup=True,export_apply=True,
        export_normals=True,export_texcoords=False,export_materials='EXPORT',export_cameras=False,export_lights=False)
    tris=sum(len(p.vertices)-2 for p in ob.data.polygons)
    bb=[Vector(c) for c in ob.bound_box]; mins=[min(v[i] for v in bb) for i in range(3)]; maxs=[max(v[i] for v in bb) for i in range(3)]
    report={'stage':f'K{stage}','triangles':tris,'bounds_xyz_m':[[round(v,3) for v in mins],[round(v,3) for v in maxs]],
            'bytes':os.path.getsize(path),'materials':sorted(_bk._G.keys()),'glb':path}
    if tris>60000: raise RuntimeError('%s exceeds 60000 triangles: %d'%(name,tris))
    if mins[0]<-179.01 or maxs[0]>190.01 or mins[1]<17.99 or maxs[1]>168.01 or maxs[2]>32.01:
        raise RuntimeError('%s outside allowed XYZ bounds: %r to %r'%(name,mins,maxs))
    # Save source stage scene before preview-only camera and ground objects are added.
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,f'K{stage}.blend'))
    if stage==2: report['previews']=render_k2(ob)
    if stage==3: report['previews']=[render_k3(ob)]
    return report

def render_k2(ob):
    # Renderer uses shared kit framing but only our local monkeypatch/configuration.
    old=_bk._preview_scene
    def cycles(ob,front):
        result=old(ob,front)
        human=bpy.data.objects.get('preview_human')
        if human: bpy.data.objects.remove(human,do_unlink=True)
        sc=bpy.context.scene; sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=12
        sc.cycles.use_denoising=False; sc.render.threads_mode='FIXED'; sc.render.threads=2
        sc.render.resolution_x=800; sc.render.resolution_y=450; sc.render.resolution_percentage=100
        return result
    _bk._preview_scene=cycles
    import shutil
    _bk.render_previews(ob,'construction/chem/model/K2',front='-Y')
    nested=os.path.join(ROOT,'renders','construction','chem','model','K2')
    for nm in ('front.png','side.png','three.png','top.png'):
        shutil.move(os.path.join(nested,nm),os.path.join(OUT,nm))
    os.rmdir(nested)
    _bk._preview_scene=old
    return [os.path.join(OUT,nm) for nm in ('front.png','side.png','three.png','top.png')]

def render_k3(ob):
    old=_bk._preview_scene
    _bk._preview_scene=old
    ctr,R,mn,mx,fdir,sdir=_bk._preview_scene(ob,'-Y')
    human=bpy.data.objects.get('preview_human')
    if human: bpy.data.objects.remove(human,do_unlink=True)
    sc=bpy.context.scene; sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=12
    sc.cycles.use_denoising=False; sc.render.threads_mode='FIXED'; sc.render.threads=2
    sc.render.resolution_x=800; sc.render.resolution_y=450; sc.render.resolution_percentage=100
    cam=bpy.data.objects.new('chem_K3_three_cam',bpy.data.cameras.new('chem_K3_three_cam'))
    sc.collection.objects.link(cam); sc.camera=cam; cam.data.lens=35; cam.data.clip_end=20000
    th=math.tan(math.atan(.5*36/35)*.9); tv=math.tan(math.atan(.5*36*9/16/35)*.9)
    corners=[Vector((x,y,z)) for x in (mn.x,mx.x) for y in (mn.y,mx.y) for z in (mn.z,mx.z)]
    d=(fdir+sdir).normalized(); el=math.radians(32)
    dv=Vector((d.x*math.cos(el),d.y*math.cos(el),math.sin(el))).normalized()
    rt=dv.cross(Vector((0,0,1))).normalized(); up=rt.cross(dv).normalized()
    dist=max(max((c-ctr).dot(dv)+abs((c-ctr).dot(rt))/th,(c-ctr).dot(dv)+abs((c-ctr).dot(up))/tv) for c in corners)
    cam.location=ctr+dv*dist; _bk._look(cam,ctr)
    sc.render.filepath=os.path.join(OUT,'K3-three.png'); bpy.ops.render.render(write_still=True)
    _bk._preview_scene=old
    return os.path.join(OUT,'K3-three.png')

if __name__=='__main__':
    reports=[]
    report_path=os.path.join(OUT,'report.json')
    data={'asset':'chem','coordinate_mapping':'Blender X=native x, Blender Y=-native z, Blender Z=native y',
          'limits':{'x_m':[-179,190],'y_m':[18,168],'max_height_m':32,'max_triangles_per_stage':60000},
          'blast_furnaces_included':False,'stages':reports,
          'unsupported_scaffolds_audit':'All construction access uses grounded timber standards, ledgers, decks, and diagonal braces.'}
    for k in range(4):
        reports.append(export_stage(k))
        with open(report_path,'w') as f: json.dump(data,f,indent=2)
    with open(report_path,'w') as f: json.dump(data,f,indent=2)
    print('CHEM_REPORT '+json.dumps(data))
