"""Apollo south-slope walking garden, chosen A, field-fit revision 2026-11-19.

No Blender process is launched here. The coordinator runs this file in its ONE
Blender process. All output stays in this asset's delivery directory.

Pure Python preparation (no bpy dependency; no bytecode files):
  python3 -B <this-file> --plan-only
Blender entry: run this file with -P; optional arguments after --:
  --no-render                  export only
  --no-preview-vegetation      no preview trees or hedges

build_design() and check_design() also work without Blender. run_blender() is
the explicit bpy export/preview entry. rk/bl_kit are read-only palette sources;
their finish() is deliberately NOT used (its ROOT points into source/).

Geometry is stored as (lx,lz,absolute_y), metres. Blender coordinates are
(lx-57,147-lz,absolute_y-34.2); glTF Y-up becomes (lx-57,y-34.2,lz-147).
This is a project garden design, not an archaeological reconstruction.
"""
import argparse
from collections import Counter, defaultdict
import hashlib
import json
import math
from pathlib import Path
import sys

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
SOURCE = HERE / 'clivus_b_data'   # in the repo: survey.json lives here
DELIVERY = SOURCE
PLAN_PATH = DELIVERY / 'plan-A.json'
GLB_PATH = DELIVERY / 'models' / 'rome_clivus_palatinus.glb'
RENDER_DIR = DELIVERY / 'renders'
ASSET = 'rome_clivus_palatinus'
ORIGIN = (57.0, 147.0, 34.2)
EPS = 1e-8
WIDTH = 3.0
CURB = .4
WALL = .45
PARAPET = .95
BUDGET = 30000
HEIGHTS = (34.2, 27.8, 21.4, 15.0, 8.5)
STAIR_SPEC = ((80, 151, 1), (74, 159, -1), (80, 167, 1), (74, 183, -1))


def rnd(v):
    return round(float(v), 7)


def dist(a,b):
    return math.sqrt(sum((x-y)**2 for x,y in zip(a,b)))


def area(poly):
    return sum(a[0]*b[1]-b[0]*a[1] for a, b in zip(poly, poly[1:]+poly[:1])) / 2


def cross(a, b, c):
    return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])


def clean(poly):
    out = []
    for p in poly:
        q = tuple(map(float, p))
        if not out or dist(q, out[-1]) > EPS:
            out.append(q)
    if len(out) > 1 and dist(out[0], out[-1]) < EPS:
        out.pop()
    if len(out) < 3 or abs(area(out)) < EPS:
        return []
    return out if area(out) > 0 else out[::-1]


def rect(x0, z0, x1, z1):
    return clean([(x0,z0),(x1,z0),(x1,z1),(x0,z1)])


def inside(p, poly):
    # Includes the boundary, including re-entrant platform corners.
    hit = False
    for a, b in zip(poly, poly[1:]+poly[:1]):
        if abs(cross(a,b,p)) < 1e-7 and min(a[0],b[0])-EPS <= p[0] <= max(a[0],b[0])+EPS and min(a[1],b[1])-EPS <= p[1] <= max(a[1],b[1])+EPS:
            return True
        if (a[1] > p[1]) != (b[1] > p[1]):
            if p[0] < (b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]:
                hit = not hit
    return hit


def clip_line(poly, a, b, positive=True):
    if not poly:
        return []
    out = []
    for p, q in zip(poly, poly[1:]+poly[:1]):
        dp, dq = cross(a,b,p), cross(a,b,q)
        ip, iq = (dp >= -EPS, dq >= -EPS) if positive else (dp <= EPS, dq <= EPS)
        if ip:
            out.append(p)
        if ip != iq and abs(dp-dq) > EPS:
            t = dp/(dp-dq)
            out.append((p[0]+t*(q[0]-p[0]), p[1]+t*(q[1]-p[1])))
    return clean(out)


def intersect(poly, convex):
    for a,b in zip(convex, convex[1:]+convex[:1]):
        poly = clip_line(poly,a,b)
    return poly


def subtract(poly, convex):
    """Disjoint convex fragments of poly outside a convex cutter."""
    remainder, out = poly, []
    for a,b in zip(convex,convex[1:]+convex[:1]):
        q = clip_line(remainder,a,b,False)
        if q:
            out.append(q)
        remainder = clip_line(remainder,a,b)
        if not remainder:
            break
    return out


def triangulate(poly):
    poly = clean(poly)
    if not poly:
        return []
    ids, out = list(range(len(poly))), []
    while len(ids) > 3:
        for k, j in enumerate(ids):
            i, l = ids[k-1], ids[(k+1)%len(ids)]
            a,b,c = poly[i],poly[j],poly[l]
            if cross(a,b,c) <= EPS:
                continue
            if any(cross(a,b,poly[t]) > EPS and cross(b,c,poly[t]) > EPS and cross(c,a,poly[t]) > EPS for t in ids if t not in (i,j,l)):
                continue
            out.append([a,b,c]); ids.pop(k)
            break
        else:
            raise ValueError('Cannot triangulate platform: '+repr(poly))
    out.append([poly[i] for i in ids])
    return out


def strip(a, b, width):
    dx,dz = b[0]-a[0],b[1]-a[1]
    length = math.hypot(dx,dz)
    nx,nz = -dz/length*width/2,dx/length*width/2
    return clean([(a[0]-nx,a[1]-nz),(b[0]-nx,b[1]-nz),(b[0]+nx,b[1]+nz),(a[0]+nx,a[1]+nz)])


def route_polys(nodes, width):
    out = [strip(a,b,width) for a,b in zip(nodes,nodes[1:]) if dist(a,b)>EPS]
    # Full square turn pads: their union retains the entire clear turning area.
    out.extend(rect(p[0]-width/2,p[1]-width/2,p[0]+width/2,p[1]+width/2) for p in nodes[1:-1])
    return out


def to_blender(p):
    x,z,y = p
    return (x-57,147-z,y-34.2)


def to_world(p, frame):
    x,z,y = p
    c,s = math.cos(frame['rot']),math.sin(frame['rot'])
    return [rnd(frame['ox']+x*c+z*s),rnd(y),rnd(frame['oz']-x*s+z*c)]


class Survey:
    def __init__(self):
        raw = (SOURCE/'survey.json').read_bytes()
        self.data = json.loads(raw)
        self.sha = hashlib.sha256(raw).hexdigest()
        self.t = self.data['terrain']
        self.rows = self.t['values']
        self.nz,self.nx = len(self.rows),len(self.rows[0])
        assert all(len(r)==self.nx and all(math.isfinite(v) for v in r) for r in self.rows)

    def height(self,x,z):
        u,v = (x-self.t['x'])/self.t['step'],(z-self.t['z'])/self.t['step']
        if not (-EPS<=u<=self.nx-1+EPS and -EPS<=v<=self.nz-1+EPS):
            raise ValueError('Footing outside supplied survey: '+repr((x,z)))
        u,v = min(max(u,0),self.nx-1),min(max(v,0),self.nz-1)
        i,j = min(int(u),self.nx-2),min(int(v),self.nz-2)
        f,g = u-i,v-j
        a,b,c,d = self.rows[j][i],self.rows[j][i+1],self.rows[j+1][i],self.rows[j+1][i+1]
        return a*(1-f)*(1-g)+b*f*(1-g)+c*(1-f)*g+d*f*g

    def footing(self,poly,ceiling):
        """Constant bottom per structural bay. Conservative grid-cell envelope.

        Every bilinear value in every intersected grid cell is >= its minimum
        corner. Taking the rectangle's complete grid-cell envelope therefore
        guarantees 2 m burial even BETWEEN the recorded 0.25 m samples. This
        avoids the old practice of subtracting 2 m from the designed floor.
        """
        x0,x1 = min(p[0] for p in poly),max(p[0] for p in poly)
        z0,z1 = min(p[1] for p in poly),max(p[1] for p in poly)
        self.height(x0,z0); self.height(x1,z1)
        i0,i1 = math.floor(x0-self.t['x']),math.ceil(x1-self.t['x'])
        j0,j1 = math.floor(z0-self.t['z']),math.ceil(z1-self.t['z'])
        low = min(self.rows[j][i] for j in range(max(0,j0),min(self.nz-1,j1)+1) for i in range(max(0,i0),min(self.nx-1,i1)+1))
        bot = min(low-2.02,ceiling-.4)
        samples = []
        for a,b in zip(poly,poly[1:]+poly[:1]):
            n = max(1,math.ceil(dist(a,b)/.25))
            for k in range(n+1):
                q = (a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n)
                h = self.height(*q)
                samples.append([rnd(q[0]),rnd(q[1]),rnd(h),rnd(h-bot)])
        return bot,samples


class Mesh:
    def __init__(self,name,kind='structure',export=True):
        self.name,self.kind,self.export = name,kind,export
        self.verts,self.faces,self.mats = [],[],[]

    def face(self,pts,mat):
        # Faces supplied here are triangles or planar convex quads.
        n = len(self.verts)
        self.verts.extend(tuple(map(float,p)) for p in pts)
        for i in range(1,len(pts)-1):
            a,b,c = pts[0],pts[i],pts[i+1]
            v,w = [b[k]-a[k] for k in range(3)],[c[k]-a[k] for k in range(3)]
            if sum(t*t for t in (v[1]*w[2]-v[2]*w[1],v[2]*w[0]-v[0]*w[2],v[0]*w[1]-v[1]*w[0])) < 1e-16:
                continue
            self.faces.append((n,n+i,n+i+1)); self.mats.append(mat)

    def top(self,poly,y,mat):
        for tri in triangulate(poly):
            self.face([(x,z,y) for x,z in tri[::-1]],mat)

    def prism(self,poly,bot,top,mat):
        poly = clean(poly)
        if not poly:
            return
        b = bot if callable(bot) else lambda x,z:bot
        t = top if callable(top) else lambda x,z:top
        for tri in triangulate(poly):
            self.face([(x,z,b(x,z)) for x,z in tri],mat)
            self.face([(x,z,t(x,z)) for x,z in tri[::-1]],mat)
        for a,c in zip(poly,poly[1:]+poly[:1]):
            self.face([(a[0],a[1],b(*a)),(a[0],a[1],t(*a)),(c[0],c[1],t(*c)),(c[0],c[1],b(*c))],mat)

    def box(self,x,z,y,w,d,h,mat):
        assert w>0 and d>0 and h>0
        self.prism(rect(x-w/2,z-d/2,x+w/2,z+d/2),y,y+h,mat)

    def cyl(self,x,z,y,r,h,mat,n=12,rt=None):
        rt = r if rt is None else rt
        bot = [(x+r*math.cos(k*math.tau/n),z+r*math.sin(k*math.tau/n),y) for k in range(n)]
        top = [(x+rt*math.cos(k*math.tau/n),z+rt*math.sin(k*math.tau/n),y+h) for k in range(n)]
        self.face(bot,mat); self.face(top[::-1],mat)
        for i in range(n):
            j = (i+1)%n
            self.face([bot[i],top[i],top[j],bot[j]],mat)


class Design:
    def __init__(self):
        self.survey = Survey()
        self.meshes,self.decks,self.stairs,self.surfaces = [],[],[],[]
        self.foundations,self.targets,self.plants,self.beds,self.furniture = [],[],[],[],[]
        self.walk_samples,self.route,self.tail_profile,self.ray_objects = [],[],[],{}

    def mesh(self,name,kind='structure',export=True):
        m = Mesh(name,kind,export); self.meshes.append(m); return m

    def ground(self,name,poly,y,thickness,role,priority=10):
        self.targets.append({'id':name,'polygon_lx_lz':[[rnd(x),rnd(z)] for x,z in poly],
                             'y':rnd(y-thickness),'surface_y':rnd(y),'priority':priority,
                             'role':role,'mode':'replace_inside_polygon','slab_thickness':thickness})

    def surface(self,name,poly,y,kind,**data):
        rec = {'id':name,'object':name,'kind':kind,'polygon_lx_lz':[[rnd(x),rnd(z)] for x,z in poly],
               'y':rnd(y),**data}
        self.surfaces.append(rec)
        return rec

    def footing(self,name,poly,ceiling):
        bot,samples = self.survey.footing(poly,ceiling)
        self.foundations.append({'id':name,'polygon_lx_lz':[[rnd(x),rnd(z)] for x,z in poly],
                                 'bottom_y':rnd(bot),'original_soil_samples_lx_lz_y_depth':samples,
                                 'min_burial_m':rnd(min(p[3] for p in samples))})
        return bot


def decorate_wall(mesh,a,b,bot,top,survey):
    """Ashlar face only above original soil; smooth masonry, not grid spikes."""
    length = dist(a,b)
    if length < .04:
        return
    ux,uz = (b[0]-a[0])/length,(b[1]-a[1])/length
    nx,nz = uz,-ux
    # a->b is a CCW footprint's OUTER edge: outward is its right.
    low = max(bot, min(survey.height(*a),survey.height(*b))-.1)
    hi = min(top(*a),top(*b))
    course,block = .8,1.8
    nrow = max(0,int(math.ceil((hi-low)/course)))
    for row in range(nrow):
        y0,y1 = low+row*course+.022,min(low+(row+1)*course-.022,hi-.025)
        if y1-y0<.05:
            continue
        # The small module faces are paint-thin, so they do not consume clearance.
        shift = block/2 if row%2 else 0
        pos = -shift
        while pos < length:
            s0,s1 = max(.018,pos+.018),min(length-.018,pos+block-.018)
            if s1-s0>.04:
                p = (a[0]+ux*s0+nx*.012,a[1]+uz*s0+nz*.012)
                q = (a[0]+ux*s1+nx*.012,a[1]+uz*s1+nz*.012)
                mesh.face([(p[0],p[1],y0),(p[0],p[1],y1),(q[0],q[1],y1),(q[0],q[1],y0)],'stone')
            pos += block


def wall_bay(des,name,poly,top,outer=None,rail=True):
    t = top if callable(top) else lambda x,z:top
    ceiling = min(t(x,z) for x,z in poly)
    bot = des.footing(name,poly,ceiling)
    m = des.mesh(name,'retaining_wall')
    m.prism(poly,bot,lambda x,z:t(x,z)+(PARAPET-.12 if rail else -.12),'tuff')
    m.prism(poly,lambda x,z:t(x,z)+(PARAPET-.12 if rail else -.12),lambda x,z:t(x,z)+(PARAPET if rail else 0),'grey')
    if outer:
        decorate_wall(m,*outer,bot,lambda x,z:t(x,z)+(PARAPET-.14 if rail else -.14),des.survey)
    # Flush grey belts; no projecting cap can narrow the stair's 3 m lane.
    for depth in (3.0,6.0,9.0,12.0,15.0):
        if ceiling-depth > bot+.2:
            m.prism(poly,lambda x,z:t(x,z)-depth,lambda x,z:t(x,z)-depth+.13,'grey')
    return m


def wall_edges(des,deck):
    p,y = deck['poly'],deck['y']
    # Mitered outside corners share the SAME vertex: no slit between bays.
    outer = []
    for i,b in enumerate(p):
        a,c = p[i-1],p[(i+1)%len(p)]
        u,v = ((b[0]-a[0]),(b[1]-a[1])),((c[0]-b[0]),(c[1]-b[1]))
        lu,lv = math.hypot(*u),math.hypot(*v)
        n0,n1 = (u[1]/lu,-u[0]/lu),(v[1]/lv,-v[0]/lv)
        den = 1+n0[0]*n1[0]+n0[1]*n1[1]
        off = ((n0[0]+n1[0])*WALL/den,(n0[1]+n1[1])*WALL/den)
        outer.append((b[0]+off[0],b[1]+off[1]))
    for edge,(a,b) in enumerate(zip(p,p[1:]+p[:1])):
        length = dist(a,b)
        keep = [(0.,1.)]
        for gate in deck['gates']:
            # A gate is a 3.8 m opening including the two flush 0.4 m curbs.
            axis,value,lo,hi = gate
            other = 1-axis
            if abs(a[axis]-value)>1e-6 or abs(b[axis]-value)>1e-6:
                continue
            t0,t1 = sorted(((lo-a[other])/(b[other]-a[other]),(hi-a[other])/(b[other]-a[other])))
            updated = []
            for u,v in keep:
                if t1<=u or t0>=v:
                    updated.append((u,v))
                else:
                    if t0>u: updated.append((u,t0))
                    if t1<v: updated.append((t1,v))
            keep = updated
        def lerp(a,b,t):
            return (a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t)
        for part,(u,v) in enumerate(keep):
            n = max(1,math.ceil((v-u)*length/2.8))
            for k in range(n):
                s,t = u+(v-u)*k/n,u+(v-u)*(k+1)/n
                ia,ib = lerp(a,b,s),lerp(a,b,t)
                nx,nz=(b[1]-a[1])/length,-(b[0]-a[0])/length
                # Gate cut ends use perpendicular caps, not a diluted corner
                # miter that could taper across the stair's opening.
                oa = outer[edge] if abs(s)<EPS else (ia[0]+nx*WALL,ia[1]+nz*WALL)
                ob = outer[(edge+1)%len(p)] if abs(t-1)<EPS else (ib[0]+nx*WALL,ib[1]+nz*WALL)
                wall_bay(des,f"{deck['id']}_wall_{edge:02d}_{part}_{k:02d}",clean([ia,oa,ob,ib]),y,outer=(oa,ob),rail=y>8.5)
            # Square buttresses, approximately 9 m apart. Footings sampled anew.
            count = int((v-u)*length/8.5)
            for k in range(count):
                t = u+(v-u)*(k+.5)/count
                q = lerp(a,b,t); o = lerp(outer[edge],outer[(edge+1)%len(p)],t)
                nx,nz = (o[0]-q[0])/WALL,(o[1]-q[1])/WALL
                cen = (o[0]+nx*.2,o[1]+nz*.2)
                pp = rect(cen[0]-.44,cen[1]-.44,cen[0]+.44,cen[1]+.44)
                # A buttress must never project into a route or a stair lane.
                if any(intersect(pp,s['polygon_lx_lz']) for s in des.surfaces if s['kind'] in ('tread','stair_landing')):
                    continue
                name = f"{deck['id']}_square_buttress_{edge}_{part}_{k}"
                base = des.footing(name,pp,y)
                m = des.mesh(name,'square_buttress')
                m.prism(pp,base,y-.16,'tuff'); m.prism(pp,y-.16,y,'grey')


def union_fragments(polys,limit):
    """Disjoint union clipped to a (possibly concave) platform."""
    previous,out = [],[]
    for cutter in polys:
        for tri in triangulate(limit):
            q = intersect(tri,cutter)
            pending = [q] if q else []
            for used in previous:
                pending = [r for p in pending for r in subtract(p,used)]
            out.extend(pending)
        previous.append(cutter)
    return out


def make_deck(des,name,y,poly,nodes,gates):
    poly = clean(poly)
    deck = {'id':name,'y':y,'poly':poly,'nodes':nodes,'gates':gates}
    des.decks.append(deck)
    m = des.mesh(name,'walkable_deck')
    wide,clearpath = route_polys(nodes,WIDTH+2*CURB),route_polys(nodes,WIDTH)
    bedpolys = [b['poly'] for b in des.beds if b['deck']==name]
    # Actual top is partitioned: gravel, dark polygonal paving, flush light curbs,
    # and soil holes never have coincident faces or independent floating slabs.
    patches = []
    pending = triangulate(poly)
    for cutter in wide+bedpolys:
        pending = [q for p in pending for q in subtract(p,cutter)]
    patches.extend((p,'gravel') for p in pending)
    for p in union_fragments(wide,poly):
        pending = [p]
        for cutter in clearpath+bedpolys:
            pending = [q for p in pending for q in subtract(p,cutter)]
        patches.extend((q,'travertine') for q in pending)
    for p in union_fragments(clearpath,poly):
        pending = [p]
        for cutter in bedpolys:
            pending = [q for p in pending for q in subtract(p,cutter)]
        patches.extend((q,'peperino') for q in pending)
    for p,mat in patches:
        m.top(p,y,mat)
    # A thin deck, NEVER a full-height podium. The coordinator supplies the fill.
    for tri in triangulate(poly):
        m.face([(x,z,y-.28) for x,z in tri],'tuff')
    for a,b in zip(poly,poly[1:]+poly[:1]):
        m.face([(a[0],a[1],y-.28),(a[0],a[1],y),(b[0],b[1],y),(b[0],b[1],y-.28)],'tuff')
    des.surface(name,poly,y,'deck')
    des.ground(name,poly,y,.28,'garden_fill')
    # A full-width transverse sample at each 0.2 m, including both lane edges.
    for seg,(a,b) in enumerate(zip(nodes,nodes[1:])):
        L = dist(a,b)
        nx,nz = -(b[1]-a[1])/L,(b[0]-a[0])/L
        n = math.ceil(L/.2)
        for k in range(n+1):
            t = k/n
            center = (a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t)
            # Endpoint cross-sections belong to the stair's tangent at its riser.
            for off in (-1.5,-1.35,-.75,0,.75,1.35,1.5):
                q = (center[0]+nx*off,center[1]+nz*off)
                des.walk_samples.append((name,*q,y,'deck'))
        des.route.append({'id':f'{name}_path_{seg}','kind':'flat_path','deck':name,'from':[rnd(a[0]),rnd(a[1]),y],
                          'to':[rnd(b[0]),rnd(b[1]),y],'net_width_m':3.0})
    return deck


def make_stair(des,i):
    sx,z,direction = STAIR_SPEC[i]
    upper,lower = HEIGHTS[i:i+2]
    rise = (upper-lower)/36
    ex = sx+direction*13.4
    group = {'id':f'stair_{i+1}','direction_lx':direction,'start':[sx,z,upper],
             'end':[rnd(ex),z,lower],'net_width_m':3.0,'curb_each_m':.4,
             'riser_count':36,'tread_depth_m':.30,'riser_height_m':rnd(rise),
             'run_m':13.4,'flights':[],'treads':[],'intermediate_landings':[],
             'endpoint_flat_landings':[],'nominal_clear_lz_m':3.0}
    for which,x,y in (('top',sx,upper),('bottom',ex,lower)):
        # 3.6 m in the stair direction by 3.0 m across it. No tree or item here.
        dx = -direction if which=='top' else direction
        poly = rect(min(x,x+dx*3.6),z-1.5,max(x,x+dx*3.6),z+1.5)
        group['endpoint_flat_landings'].append({'id':f'stair_{i+1}_{which}_flat','polygon_lx_lz':poly,'y':y,
                                                'clear_lz_m':3.0,'required_clear_lz_m':1.8})
    s,step = 0.,0
    for flight in range(3):
        fs = s
        for j in range(12):
            step += 1
            a,b = sx+direction*s,sx+direction*(s+.3)
            y = upper-step*rise
            name = f'stair_{i+1}_tread_{step:02d}'
            pp = rect(min(a,b),z-1.5,max(a,b),z+1.5)
            m = des.mesh(name,'tread')
            m.prism(pp,y-.32,y,'stone')
            for side in (-1,1):
                m.prism(rect(min(a,b),z+side*1.7-.2,max(a,b),z+side*1.7+.2),y-.32,y,'travertine')
            rec = des.surface(name,pp,y,'tread',group=i+1,index=step,flight=flight+1,
                              center=[rnd((a+b)/2),z,rnd(y)],leading_edge=[rnd(a),z,rnd(y)],
                              trailing_edge=[rnd(b),z,rnd(y)],run_from_m=rnd(s),run_to_m=rnd(s+.3),
                              rise_m=rnd(rise),net_width_m=3.0)
            group['treads'].append(rec)
            des.ground(name,rect(min(a,b),z-1.9,max(a,b),z+1.9),y,.32,'stair_fill',30)
            for u in (.1,.5,.9):
                for off in (-1.5,-1.35,-.75,0,.75,1.35,1.5):
                    des.walk_samples.append((name,a+(b-a)*u,z+off,y,'tread'))
            s += .3
        group['flights'].append({'index':flight+1,'run_from_m':rnd(fs),'run_to_m':rnd(s),'steps':12})
        if flight<2:
            a,b = sx+direction*s,sx+direction*(s+1.3)
            y = upper-step*rise
            name = f'stair_{i+1}_landing_{flight+1}'
            pp = rect(min(a,b),z-1.5,max(a,b),z+1.5)
            m = des.mesh(name,'stair_landing'); m.prism(pp,y-.32,y,'paving')
            for side in (-1,1):
                m.prism(rect(min(a,b),z+side*1.7-.2,max(a,b),z+side*1.7+.2),y-.32,y,'travertine')
            rec = des.surface(name,pp,y,'stair_landing',group=i+1,index=flight+1,
                              center=[rnd((a+b)/2),z,rnd(y)],run_from_m=rnd(s),run_to_m=rnd(s+1.3),
                              depth_m=1.3,net_width_m=3.0)
            group['intermediate_landings'].append(rec)
            des.ground(name,rect(min(a,b),z-1.9,max(a,b),z+1.9),y,.32,'stair_landing_fill',30)
            for u in (.1,.5,.9):
                for off in (-1.5,-1.35,0,1.35,1.5):
                    des.walk_samples.append((name,a+(b-a)*u,z+off,y,'stair_landing'))
            s += 1.3
    assert abs(s-13.4)<EPS
    # Cheek walls follow the slope of EACH 12-step flight and flatten at BOTH
    # intermediate landings. The lowest rail clearance over any tread is .95 m.
    profiles = [(0,3.6,upper,upper-12*rise),(3.6,4.9,upper-12*rise,upper-12*rise),
                (4.9,8.5,upper-12*rise,upper-24*rise),(8.5,9.8,upper-24*rise,upper-24*rise),
                (9.8,13.4,upper-24*rise,lower)]
    for side in (-1,1):
        za,zb = sorted((z+side*1.9,z+side*2.35))
        for k,(a,b,ya,yb) in enumerate(profiles):
            n = math.ceil((b-a)/2.6)
            for j in range(n):
                u,v = a+(b-a)*j/n,a+(b-a)*(j+1)/n
                xa,xb = sorted((sx+direction*u,sx+direction*v))
                def height(x,zz,a=a,b=b,ya=ya,yb=yb):
                    return ya+(yb-ya)*(((x-sx)*direction-a)/(b-a))
                poly = rect(xa,za,xb,zb)
                # Clockwise travel on the exposed rail face has outward normal.
                outer = ((xa,za),(xb,za)) if side<0 else ((xb,zb),(xa,zb))
                wall_bay(des,f'stair_{i+1}_cheek_{side}_{k}_{j}',poly,height,outer)
    group['rail_profiles'] = [{'run_from_m':a,'run_to_m':b,'floor_from_y':rnd(ya),'floor_to_y':rnd(yb),'rail_height_m':.95} for a,b,ya,yb in profiles]
    des.stairs.append(group)


def add_beds(des):
    specs = [('top_bed','terrace_0',61,150.5,71,153.1,34.2),
             ('west_upper_bed','terrace_1',57.5,154,69.5,156.8,27.8),
             ('east_middle_bed','terrace_2',83.5,162.1,94,164.8,21.4),
             ('south_middle_bed','terrace_3',58,177.4,68.8,179.7,15),
             ('north_middle_bed','terrace_3',81,170.4,90.5,172.7,15),
             ('west_middle_bed','terrace_3',55.3,172,57.5,175.5,15)]
    for name,deck,x0,z0,x1,z1,y in specs:
        des.beds.append({'id':name,'deck':deck,'poly':rect(x0,z0,x1,z1),'y':y})
    pts = [('cypress_top','cypress',63,152,.65,6.3,'top_bed'),
           ('laurel_top','laurel',68.7,152,1.15,3.3,'top_bed'),
           ('cypress_upper','cypress',60,155.2,.65,6.0,'west_upper_bed'),
           ('laurel_upper','laurel',66.5,155.2,1.1,3.2,'west_upper_bed'),
           ('cypress_middle','cypress',85.1,163.45,.65,5.8,'east_middle_bed'),
           ('laurel_middle','laurel',91.3,163.45,1.1,3.0,'east_middle_bed'),
           ('cypress_lower','cypress',60.4,178.55,.65,5.5,'south_middle_bed'),
           ('laurel_lower','laurel',66.2,178.55,1.0,3.0,'south_middle_bed'),
           ('laurel_north','laurel',85.1,171.55,1.0,3.2,'north_middle_bed')]
    for name,kind,x,z,r,h,bed in pts:
        b = next(b for b in des.beds if b['id']==bed)
        des.plants.append({'id':name,'kind':kind,'lx':x,'lz':z,'y':b['y'],'height_m':h,'crown_radius_m':r,
                           'bed':bed,'export_glb':False,'scene_planting_only':True})


def build_beds(des):
    for b in des.beds:
        poly,y,name = b['poly'],b['y'],b['id']
        x0,z0 = poly[0]; x1,z1 = poly[2]
        m = des.mesh(name,'planter')
        # Thin submerged masonry sides rooted in the SAME soil fill as the deck.
        # Infill is exactly flush with paving; .16 m rim, no detached garden box.
        for p in (rect(x0,z0,x1,z0+.18),rect(x0,z1-.18,x1,z1),
                  rect(x0,z0+.18,x0+.18,z1-.18),rect(x1-.18,z0+.18,x1,z1-.18)):
            m.prism(p,y-.5,y+.16,'travertine')
        m.top(rect(x0+.18,z0+.18,x1-.18,z1-.18),y,'turf')
        des.ground(name+'_soil',poly,y,0,'planting_soil',40)


def add_furniture(des):
    # The pergola occupies the west side of the large 15 m garden, outside the
    # 3 m crossing at lz175. Tuscan bases, tapered stone shafts, wooden lintels.
    m = des.mesh('middle_tuscan_pergola','pergola')
    for x in (61,66,71):
        for z in (171.05,172.65):
            m.box(x,z,15,.56,.56,.15,'travertine')
            m.cyl(x,z,15.15,.21,.15,'travertine')
            m.cyl(x,z,15.3,.17,2.45,'travertine',12,.145)
            m.cyl(x,z,17.75,.17,.13,'travertine',12,.23)
            m.box(x,z,17.88,.5,.5,.17,'travertine')
    for z in (171.05,172.65):
        m.box(66,z,18.05,11.2,.23,.26,'wood')
    for i in range(16):
        m.box(60.65+i*.71,171.85,18.31,.12,2.3,.14,'wood')
    des.furniture.append({'id':m.name,'deck':'terrace_3','kind':'wood_pergola','footprint_lx_lz':rect(60.4,170.7,71.6,173),'min_under_beam_clearance_m':3.05})
    for name,x,z,y,w in (('bench_top',74,152.6,34.2,2.6),('bench_upper',71.8,155.2,27.8,2.4),('bench_pergola',66,171.85,15,3.2)):
        m = des.mesh(name,'stone_bench')
        for dx in (-w*.34,w*.34):
            m.box(x+dx,z,y,.3,.48,.4,'peperino')
        m.box(x,z,y+.4,w,.66,.16,'travertine')
        des.furniture.append({'id':name,'kind':'stone_bench','center':[x,z,y],'width':w})
    # Street-side amenities; the narrowed tail itself has no high podium.
    m = des.mesh('street_drinking_trough','drinking_trough')
    x,z,y = 65,185.65,8.5
    m.box(x,z,y,2.4,1.0,.18,'peperino')
    for dx in (-1.08,1.08):
        m.box(x+dx,z,y+.18,.24,1,.65,'travertine')
    for dz in (-.38,.38):
        m.box(x,z+dz,y+.18,1.92,.24,.65,'travertine')
    m.top(rect(x-.95,z-.24,x+.95,z+.24),y+.55,'water')
    m.box(x,z-.46,y+.83,.42,.3,.75,'stone')
    m.cyl(x,z-.22,y+1.02,.09,.11,'bronze',8)
    des.furniture.append({'id':m.name,'kind':'drinking_trough','center':[x,z,y]})
    m = des.mesh('street_shallow_niche','shallow_niche')
    x,z,y = 62.1,185.35,8.5
    m.box(x,z,y,2.25,.55,.2,'travertine')
    m.box(x,z-.1,y+.2,2.05,.36,2.1,'stone')
    m.box(x,z+.09,y+.45,1.25,.035,1.6,'wallred')
    for dx in (-.82,.82):
        m.box(x+dx,z+.18,y+.2,.25,.25,2.1,'travertine')
    m.box(x,z+.13,y+2.3,2.3,.65,.18,'grey')
    # Closed triangular pediment of a shallow niche, not an arch or arcade.
    a,b,c = (x-1.15,z-.2,y+2.48),(x+1.15,z-.2,y+2.48),(x,z-.2,y+3.1)
    d,e,f = [(p[0],z+.48,p[2]) for p in (a,b,c)]
    for face in ((a,c,b),(d,e,f),(a,b,e,d),(b,c,f,e),(c,a,d,f)):
        m.face(face,'travertine')
    m.box(x,z+.2,y+.2,.64,.32,.35,'travertine')
    m.cyl(x,z+.2,y+.55,.14,.75,'bronze',8,.11)
    m.cyl(x,z+.2,y+1.3,.14,.23,'bronze',8,.09)
    des.furniture.append({'id':m.name,'kind':'shallow_votive_niche','center':[x,z,y]})
    for i,x in enumerate((51.2,57.1)):
        m = des.mesh('street_boundary_pier_'+str(i+1),'square_gate_pier')
        pp = rect(x-.55,238.6,x+.55,239.7)
        bot = des.footing(m.name,pp,8.5)
        m.prism(pp,bot,8.7,'peperino'); m.box(x,239.15,8.7,.85,.85,1.3,'stone')
        m.box(x,239.15,10,1.15,1.15,.18,'grey')
        m.box(x,239.15,10.18,.38,.38,.55,'travertine')


def make_tail(des):
    # The low approach is just a thin 3 m strip. No retaining garden continues
    # down to lz224; no new street platform or houses are created.
    nodes = [(58.8,186.2),(58.8,188),(60.6,188),(70.1,189.8),(66,214),(54,240)]
    breaks=sorted(set([186.,189.8,190.,194.,237.,240.,242.]+[float(i) for i in range(186,243)]))
    for z in breaks:
        if z<=190 or z>=240:
            y=8.5
        else:
            x=70.1+(66-70.1)*(z-189.8)/(214-189.8) if z<=214 else 66+(54-66)*(z-214)/26
            blend=min(1.,(z-190)/4,(240-z)/3)
            y=8.5+(des.survey.height(x,z)+.025-8.5)*blend
        des.tail_profile.append([rnd(z),rnd(y)])
    def height(z):
        return tail_height(des,z)
    polys = route_polys(nodes,3.0)
    # Use a perimeter encompassing the disjoint union only as a clipping box;
    # unlike make_deck(), this emits NO filled rectangular court.
    limit = rect(50,186,73,242)
    fragments = union_fragments(polys,limit)
    m = des.mesh('street_tail_path','walkable_path')
    count=0
    for k,p in enumerate(fragments):
        # Remove garden overlap: one face at each point, no coplanar tail slabs.
        pieces=[p]
        for deck in des.decks:
            for tri in triangulate(deck['poly']):
                pieces=[q for poly in pieces for q in subtract(poly,tri)]
        for piece in pieces:
            for (za,ya),(zb,yb) in zip(des.tail_profile,des.tail_profile[1:]):
                if max(v[1] for v in piece)<za or min(v[1] for v in piece)>zb:
                    continue
                q=intersect(piece,rect(49,za,74,zb))
                if not q: continue
                top=lambda x,z:height(z)
                m.prism(q,lambda x,z:top(x,z)-.22,top,'paving' if k%3==0 else 'gravel')
                name=f'tail_{count:04d}'; count+=1
                slope=(yb-ya)/(zb-za); intercept=ya-slope*za
                des.targets.append({'id':name,'polygon_lx_lz':q,'y':rnd(height(sum(v[1] for v in q)/len(q))-.22),
                                    'surface_y':None,'priority':25,'role':'low_approach_path',
                                    'mode':'replace_inside_polygon','slab_thickness':.22,
                                    'plane':{'axis':'lz','slope':rnd(slope),'intercept':rnd(intercept-.22)},
                                    'vertices_lx_lz_y':[[rnd(x),rnd(z),rnd(height(z)-.22)] for x,z in q]})
    # End boundary joins the existing street at EXACTLY (54,240,8.5).
    des.surface(m.name,[],8.5,'path_union',polygons_lx_lz=fragments)
    for seg,(a,b) in enumerate(zip(nodes,nodes[1:])):
        L = dist(a,b); nx,nz = -(b[1]-a[1])/L,(b[0]-a[0])/L
        for k in range(math.ceil(L/.2)+1):
            t = k/math.ceil(L/.2)
            for off in (-1.5,-1.35,-.75,0,.75,1.35,1.5):
                x,z=a[0]+(b[0]-a[0])*t+nx*off,a[1]+(b[1]-a[1])*t+nz*off
                des.walk_samples.append((m.name,x,z,height(z),'path'))
        des.route.append({'id':f'tail_path_{seg}','kind':'low_path','object':m.name,
                          'from':[a[0],a[1],height(a[1])],'to':[b[0],b[1],height(b[1])],
                          'height_profile':'tail_profile_lz_y','net_width_m':3.0})


def tail_height(des,z):
    for (za,ya),(zb,yb) in zip(des.tail_profile,des.tail_profile[1:]):
        if za-EPS<=z<=zb+EPS:
            return ya+(yb-ya)*(z-za)/(zb-za)
    return 8.5


def target_height(region,x,z):
    p=region.get('plane')
    return p['slope']*z+p['intercept'] if p else region['y']


def build_design():
    des = Design()
    add_beds(des)
    # FIRST: stairs, so buttress selection knows every reserved stair footprint.
    for i in range(4):
        make_stair(des,i)
    # Nominal points are the user's handoff coordinates. The turn centres sit
    # 1.8 m INSIDE each flat landing, so no landing covers any descending tread.
    specs = [
        ('terrace_0',34.2,[(54,145),(60,145),(60,145.4),(80,145.4),(83,147.5),(83,148.95),(80,148.95),(80,153.3),(77.5,153.3),(59,153.3),(54,151.8)],
         [(57,145),(57,147),(78.2,147),(78.2,151),(80,151)],[(1,145,54,60),(0,80,149.1,152.9)]),
        ('terrace_1',27.8,[(93.4,148.6),(98.2,148.6),(100,150.4),(100,155.6),(97.8,158),(81,158),(79.2,160),(79.2,161.4),(74,161.4),(74,157.02),(57.5,157.02),(54.4,155.8),(56.8,153.5),(93.4,153.5)],
         [(93.4,151),(95.2,151),(95.2,155.5),(75.8,155.5),(75.8,159),(74,159)],[(0,93.4,149.1,152.9),(0,74,157.1,160.9)]),
        ('terrace_2',21.4,[(56.2,156.6),(60.6,156.6),(60.6,161.5),(95.8,161.5),(99.2,164),(96.8,165.02),(80,165.02),(80,169.4),(75.2,169.4),(75.2,166),(58,166),(54.4,163.8),(54.4,158.4)],
         [(60.6,159),(58.8,159),(58.8,163.5),(78.2,163.5),(78.2,167),(80,167)],[(0,60.6,157.1,160.9),(0,80,165.1,168.9)]),
        ('terrace_3',15,[(93.4,164.6),(98.2,164.6),(100,166.4),(100,174.8),(97.2,178.2),(85.5,180.5),(79.2,182),(79.2,185.4),(74,185.4),(74,180.65),(58,180.65),(54.4,176.6),(54.4,171.5),(57.5,169.5),(93.4,169.5)],
         [(93.4,167),(95.2,167),(95.2,175),(75.8,175),(75.8,183),(74,183)],[(0,93.4,165.1,168.9),(0,74,181.1,184.9)]),
        ('terrace_4',8.5,[(56.2,180.6),(60.6,180.6),(60.6,185.05),(65.8,185.05),(67.5,186.5),(66.5,188),(55.8,188),(54.4,186.4),(54.4,182.4)],
         [(60.6,183),(58.8,183),(58.8,186.2)],[(0,60.6,181.1,184.9),(1,188,56.9,62.5)]),
    ]
    for args in specs:
        make_deck(des,*args)
    make_tail(des)
    for deck in des.decks:
        wall_edges(des,deck)
    build_beds(des)
    add_furniture(des)
    for i,g in enumerate(des.stairs):
        for j,flat in enumerate(g['endpoint_flat_landings']):
            poly=flat['polygon_lx_lz']; x0,z0=poly[0]; x1,z1=poly[2]
            name=des.decks[i+(1 if j else 0)]['id']
            for a in range(13):
                for b in range(13):
                    x=x0+.002+(x1-x0-.004)*a/12
                    z=z0+.002+(z1-z0-.004)*b/12
                    des.walk_samples.append((name,x,z,flat['y'],'endpoint_flat'))
    return des


def ray_y(x,z,a,b,c):
    den = cross(a,b,c)
    if abs(den)<1e-12:
        return None
    u,v,w = cross((x,z),b,c)/den,cross(a,(x,z),c)/den,cross(a,b,(x,z))/den
    if min(u,v,w)<-1e-7 or max(u,v,w)>1+1e-7:
        return None
    return u*a[2]+v*b[2]+w*c[2]


def check_design(des):
    meshes = [m for m in des.meshes if m.export]
    tris = sum(len(m.faces) for m in meshes)
    assert tris <= BUDGET, f'triangle budget {tris}>{BUDGET}'
    assert len({m.name for m in meshes})==len(meshes)
    # A 2 m spatial index supports actual mesh-ray checks, without bpy mocks.
    cells = defaultdict(list)
    for m in meshes:
        for f in m.faces:
            vs = [m.verts[k] for k in f]
            a,b,c = vs
            if abs(cross(a,b,c))<1e-12:
                continue
            for ix in range(math.floor(min(v[0] for v in vs)/2),math.floor(max(v[0] for v in vs)/2)+1):
                for iz in range(math.floor(min(v[1] for v in vs)/2),math.floor(max(v[1] for v in vs)/2)+1):
                    cells[ix,iz].append((m.name,a,b,c))
    problems = []
    min_overhead = float('inf')
    walkable={m.name for m in meshes if m.kind in ('walkable_deck','walkable_path','tread','stair_landing')}
    for sample_i,(name,x,z,y,kind) in enumerate(des.walk_samples):
        hits = []
        volume_crossings=defaultdict(set)
        for ob,a,b,c in cells[math.floor(x/2),math.floor(z/2)]:
            yy = ray_y(x,z,a,b,c)
            if yy is not None:
                hits.append((yy,ob))
                if yy>y+.025:
                    volume_crossings[ob].add((round(yy,7),1 if cross(a,b,c)<0 else -1))
        ground = [h for h in hits if abs(h[0]-y)<2e-5 and h[1] in walkable]
        obstacle = [h for h in hits if y+2e-4<h[0]<y+2.4-1e-5]
        # A tall wall may contain the whole 2.4m ray segment. A signed crossing
        # sum detects its solid interior even when its top is above that ray.
        occupied=[ob for ob,crossings in volume_crossings.items() if sum(sign for yy,sign in crossings)>0]
        obstacle.extend((y+.025,ob) for ob in occupied)
        if ground:
            des.ray_objects[sample_i]=name if any(ob==name for yy,ob in ground) else ground[0][1]
        above = [h[0]-y for h in hits if h[0]>y+.03]
        if above:
            min_overhead = min(min_overhead,min(above))
        if not ground or obstacle:
            problems.append({'object':name,'point':[rnd(x),rnd(z),rnd(y)],'reason':'obstacle' if obstacle else 'no_surface','hits':[(rnd(a),b) for a,b in obstacle[:3]]})
    if problems:
        raise AssertionError(json.dumps({'mesh_clearance_failures':len(problems),'by_object':dict(Counter(p['object'] for p in problems)),
                                        'first':problems[:12],'last':problems[-12:]},ensure_ascii=False))
    continuity = []
    for g in des.stairs:
        pieces = sorted(g['treads']+g['intermediate_landings'],key=lambda r:r['run_from_m'])
        maxgap = max(abs(a['run_to_m']-b['run_from_m']) for a,b in zip(pieces,pieces[1:]))
        maxrise = max(abs(a['y']-b['y']) for a,b in zip(pieces,pieces[1:]))
        assert maxgap<1e-6 and maxrise<=.181
        assert abs(pieces[-1]['y']-g['end'][2])<1e-6
        assert abs(g['start'][2]-pieces[0]['y']-g['riser_height_m'])<1e-6
        assert len(g['treads'])==36 and len(g['intermediate_landings'])==2
        continuity.append({'id':g['id'],'gap_m':rnd(maxgap),'max_riser_m':rnd(maxrise),'last_tread_to_lower_floor_m':rnd(abs(pieces[-1]['y']-g['end'][2]))})
    burial = min(f['min_burial_m'] for f in des.foundations)
    assert burial>=2
    # Crown disks must clear every tread/platform lane AND every walking strip.
    crown_checks = []
    for p in des.plants:
        mind = float('inf')
        for g in des.stairs:
            x0,x1 = sorted((g['start'][0],g['end'][0])); z = g['start'][1]
            dx = max(x0-p['lx'],0,p['lx']-x1)
            dz = max(z-1.5-p['lz'],0,p['lz']-z-1.5)
            mind = min(mind,math.hypot(dx,dz)-p['crown_radius_m'])
        assert mind>=.1,(p['id'],'crown over stairs',mind)
        crown_checks.append({'id':p['id'],'min_stair_crown_gap_m':rnd(mind)})
    return {'status':'passed','method':'actual design triangles, vertical ray intersections; no Blender process',
            'triangles':tris,'triangle_budget':BUDGET,'export_objects':len(meshes),
            'walk_ray_samples':len(des.walk_samples),'required_net_width_m':3.0,
            'required_headroom_m':2.4,'min_ray_overhead_m':None if not math.isfinite(min_overhead) else rnd(min_overhead),
            'stair_continuity':continuity,'foundation_bays':len(des.foundations),'min_original_soil_burial_m':burial,
            'plant_crown_checks':crown_checks,'bpy_export_verified':False,'scene_acceptance':'pending coordinator'}


def make_plan(des,checks):
    s = des.survey
    samples,seen = [],set()
    for r in sorted(des.targets,key=lambda r:r['priority']):
        pp = r['polygon_lx_lz']
        candidates = list(pp)
        x0,x1 = min(p[0] for p in pp),max(p[0] for p in pp)
        z0,z1 = min(p[1] for p in pp),max(p[1] for p in pp)
        for ix in range(math.ceil(x0*2),math.floor(x1*2)+1):
            for iz in range(math.ceil(z0*2),math.floor(z1*2)+1):
                if inside((ix/2,iz/2),pp):
                    candidates.append((ix/2,iz/2))
        for x,z in candidates:
            # Keep region id/priority: overlapping fills are resolved spatially,
            # never flattened by a nearest-point interpolation across a riser.
            key=(r['id'],rnd(x),rnd(z))
            if key in seen: continue
            seen.add(key); samples.append([rnd(x),rnd(z),rnd(target_height(r,x,z)),r['id'],r['priority']])
    nominal = [[57,147,34.2],[80,147,34.2],[80,151,34.2],
               [93.4,151,27.8],[93.4,155.5,27.8],[74,155.5,27.8],[74,159,27.8],
               [60.6,159,21.4],[60.6,163.5,21.4],[80,163.5,21.4],[80,167,21.4],
               [93.4,167,15],[93.4,175,15],[74,175,15],[74,183,15],
               [60.6,183,8.5],[60.6,188,8.5],[70.1,189.8,8.5],[66,214,8.5],[54,240,8.5]]
    raypoints = []
    for sample_i,(name,x,z,y,kind) in enumerate(des.walk_samples):
        # Full sample list is directly consumable by the scene's THREE.Raycaster.
        raypoints.append({'object':des.ray_objects[sample_i],'route_object':name,'lx':rnd(x),'lz':rnd(z),'y':rnd(y),'kind':kind,
                          'world_xyz':to_world((x,z,y),s.data['PALF'])})
    ordered = []
    for i,deck in enumerate(des.decks):
        ordered.extend(r for r in des.route if r.get('deck')==deck['id'])
        if i<4:
            g=des.stairs[i]
            ordered.extend({'id':r['id'],'object':r['object'],'kind':r['kind'],'center':r['center'],
                            'y':r['y'],'polygon_lx_lz':r['polygon_lx_lz']} for r in sorted(g['treads']+g['intermediate_landings'],key=lambda r:r['run_from_m']))
    ordered.extend(r for r in des.route if r['kind']=='low_path')
    return {'schema':'rome_clivus_palatinus.plan-A.v2','asset':ASSET,'design':'A / transverse stairs / field-fit 2026-11-19',
            'history_label':'【设计推演】本项目设计位置取自场景生成器；庭园不作考古复原。',
            'origin':{'lx':57,'lz':147,'y':34.2},'units':'metres','coordinate_order':'[lx,lz,absolute_y]',
            'blender_xyz':'[lx-57,147-lz,absolute_y-34.2]','gltf_xyz':'[lx-57,absolute_y-34.2,lz-147]',
            'PALF':s.data['PALF'],'survey_sha256':s.sha,
            'levels':list(HEIGHTS),'scope':{'garden_core_lz':[147,188],'garden_local_x':[54,100],
                'exceptions':'upper 6x4 arrival pad and 3m access strips at garden edges; lz>188 is path only',
                'trees_in_glb':False,'north_rock':'no mesh generated or moved','existing_houses':'no house mesh generated or modified'},
            'nominal_handoff_route':nominal,'route':ordered,'stairs':des.stairs,'tail_profile_lz_y':des.tail_profile,
            'terraces':[{'id':d['id'],'y':d['y'],'polygon_lx_lz':d['poly'],'clearance_centerline':[[*p,d['y']] for p in d['nodes']],
                         'parapet_gaps':d['gates']} for d in des.decks],
            'parapet_gap_columns':['constant_axis_0_lx_1_lz','line_value','opening_from','opening_to'],
            'parapet_gap_note':'3.8m structural openings include two flush 0.4m curbs, leaving a continuous 3m walking lane.',
            'route_note':'Handoff coordinates describe stair edges. Turning centres are 1.8m inside the endpoint flats; no upper deck overlaps a tread.',
            'ground':{'apply_order':'apply regions by priority ascending; equal-priority boundaries select the lower y; clip strictly to polygon; no interpolation across stair risers',
                       'targets':des.targets,'target_height_formula':'plane ? plane.slope*lz+plane.intercept : y',
                       'point_columns':['lx','lz','terrain_y','region_id','priority'],
                       'samples':samples,'flat_deck_fill_y':'surface_y minus slab thickness; planting soil is flush with surface_y',
                       'outside_targets':'leave original terrain and north rock unchanged'},
            'targets':des.targets,'foundations':des.foundations,
            'plants':des.plants,'beds':[{'id':b['id'],'deck':b['deck'],'polygon_lx_lz':b['poly'],'soil_y':b['y'],'rim_height':.16,'hedge_preview_only':True} for b in des.beds],
            'furniture':des.furniture,'ray_acceptance':{'point_columns':'objects contain local coordinates and transformed world_xyz',
                'expected_height_tolerance_m':.025,'required_headroom_m':2.4,'required_width_m':3,
                'samples':raypoints},'checks':checks,
            'outputs':{'script':str(Path(__file__).resolve()),'glb':str(GLB_PATH),'renders':[str(RENDER_DIR/(n+'.png')) for n in ('C1-overview','C2-arrival','C3-middle-garden','C4-street')]}}


def create_bpy_mesh(bpy,kit,model,collection):
    me = bpy.data.meshes.new(model.name)
    me.from_pydata([to_blender(v) for v in model.verts],[],model.faces)
    me.update(); me.calc_loop_triangles()
    mats = list(dict.fromkeys(model.mats))
    for mat in mats:
        me.materials.append(kit._make_mat(mat))
    indices = {mat:i for i,mat in enumerate(mats)}
    for face,mat in zip(me.polygons,model.mats):
        face.material_index=indices[mat]
    ob = bpy.data.objects.new(model.name,me); collection.objects.link(ob)
    ob['asset']=ASSET; ob['role']=model.kind; ob['exported']=model.export
    return ob


def preview_geometry(des):
    """Separate preview meshes. Never selected for export, never in GLB."""
    result = []
    terrain = Mesh('PREVIEW_original_soil_with_requested_fill','preview_soil',False)
    targets = sorted(des.targets,key=lambda r:r['priority'])
    def ground(x,z):
        y=des.survey.height(x,z)
        priority=-1
        for r in targets:
            if inside((x,z),r['polygon_lx_lz']):
                if r['priority']>priority: y,priority=target_height(r,x,z),r['priority']
                elif r['priority']==priority: y=min(y,target_height(r,x,z))
        return y
    for x in range(47,106):
        for z in range(140,244):
            pp=[(x,z),(x+1,z),(x+1,z+1),(x,z+1)]
            vv=[(a,b,ground(a,b)) for a,b in pp]
            terrain.face(vv[::-1],'turf')
    result.append(terrain)
    for p in des.plants:
        x,z,y=p['lx'],p['lz'],p['y']; h,r=p['height_m'],p['crown_radius_m']
        m=Mesh('PREVIEW_'+p['id'],'preview_tree',False)
        m.cyl(x,z,y,.13,h*.45,'wood',8,.075)
        if p['kind']=='cypress':
            m.cyl(x,z,y+h*.2,r*.65,h*.48,'hedge',10,r)
            m.cyl(x,z,y+h*.68,r,h*.32,'hedge',10,.025)
        else:
            m.cyl(x,z,y+h*.40,r*.65,h*.18,'hedge',12,r)
            m.cyl(x,z,y+h*.58,r,h*.25,'hedge',12,r*.65)
            m.cyl(x,z,y+h*.83,r*.65,h*.17,'hedge',12,.025)
        result.append(m)
    for b in des.beds:
        m=Mesh('PREVIEW_hedge_'+b['id'],'preview_hedge',False)
        x0,z0=b['poly'][0]; x1,z1=b['poly'][2]
        for p in (rect(x0+.24,z0+.24,x1-.24,z0+.52),rect(x0+.24,z1-.52,x1-.24,z1-.24)):
            m.prism(p,b['y'],b['y']+.46,'hedge')
        result.append(m)
    # 1.8 m scale rods, not exported.
    m=Mesh('PREVIEW_1m80_scale_markers','preview_scale',False)
    for x,z,y in ((77,147,34.2),(95.2,155,27.8),(73,174,15),(66,215,8.5)):
        m.box(x,z,y,.13,.13,1.8,'red')
    result.append(m)
    return result


def run_blender(des,plan,render=True,vegetation=True):
    """Called by coordinator INSIDE its existing Blender process only."""
    import bpy
    from mathutils import Vector
    sys.path.insert(0,str(HERE))
    import rk  # noqa: palette registration only; no finish(), no path overrides
    import bl_kit as kit
    # Restrict clearing to OUR collections; never reset another worker's scene.
    for name in (ASSET,ASSET+'_preview'):
        old=bpy.data.collections.get(name)
        if old:
            for ob in list(old.objects): bpy.data.objects.remove(ob,do_unlink=True)
            bpy.data.collections.remove(old)
    collection=bpy.data.collections.new(ASSET); bpy.context.scene.collection.children.link(collection)
    objects=[create_bpy_mesh(bpy,kit,m,collection) for m in des.meshes if m.export]
    actual=sum(len(o.data.loop_triangles) for o in objects)
    assert actual==plan['checks']['triangles'] and actual<=BUDGET
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objects: ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    GLB_PATH.parent.mkdir(parents=True,exist_ok=True)
    # Preserve individually editable pieces in the master. The web delivery is
    # joined by shared material so 400+ construction pieces do not become 400+
    # scene objects and draw calls in the reader.
    master=GLB_PATH.with_suffix('.blend')
    bpy.ops.wm.save_as_mainfile(filepath=str(master))
    bpy.ops.object.join()
    combined=bpy.context.view_layer.objects.active
    combined.name=ASSET
    bpy.ops.export_scene.gltf(filepath=str(GLB_PATH),export_format='GLB',use_selection=True,
                              export_yup=True,export_apply=True,export_normals=True,export_texcoords=False,
                              export_materials='EXPORT',export_cameras=False,export_lights=False,export_extras=True)
    plan['checks']['bpy_export_verified']=True
    plan['blender']={'triangles':actual,'glb_bytes':GLB_PATH.stat().st_size,
                     'glb_sha256':hashlib.sha256(GLB_PATH.read_bytes()).hexdigest(),'version':bpy.app.version_string,
                     'master':str(master),'editable_objects':len(objects),'web_objects':1,
                     'web_material_parts':len(combined.data.materials)}
    PLAN_PATH.write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    if not render: return
    preview=bpy.data.collections.new(ASSET+'_preview'); bpy.context.scene.collection.children.link(preview)
    for model in preview_geometry(des):
        if vegetation or model.kind not in ('preview_tree','preview_hedge'):
            create_bpy_mesh(bpy,kit,model,preview)
    sc=bpy.context.scene
    sc.unit_settings.system='METRIC'
    for engine in ('BLENDER_EEVEE','BLENDER_EEVEE_NEXT','CYCLES'):
        try:
            sc.render.engine=engine
            break
        except (TypeError,ValueError):
            continue
    else:
        raise RuntimeError('No supported Blender render engine is registered')
    if sc.render.engine=='CYCLES':
        sc.cycles.samples=24;sc.cycles.device='CPU';sc.cycles.use_denoising=True
    sc.render.resolution_x,sc.render.resolution_y=1440,900
    sc.render.resolution_percentage=100
    sc.render.image_settings.file_format='PNG'
    sc.render.film_transparent=False
    try: sc.view_settings.view_transform='AgX'
    except TypeError: pass
    world=bpy.data.worlds.new(ASSET+'_preview_sky'); sc.world=world; world.use_nodes=True
    bg=world.node_tree.nodes.get('Background'); bg.inputs[0].default_value=(.63,.73,.87,1); bg.inputs[1].default_value=.7
    sun=bpy.data.objects.new('PREVIEW_sun',bpy.data.lights.new('PREVIEW_sun','SUN')); preview.objects.link(sun)
    sun.data.energy=3.; sun.data.angle=.08
    sun.rotation_euler=(math.radians(25),math.radians(-25),math.radians(-35))
    cam=bpy.data.objects.new('PREVIEW_camera',bpy.data.cameras.new('PREVIEW_camera')); preview.objects.link(cam); sc.camera=cam
    cam.data.clip_start=.1; cam.data.clip_end=2000
    shots=[('C1-overview',(108,264,110),(75,167,24),48),
           ('C2-arrival',(83,166,51),(66,149,34.2),40),
           ('C3-middle-garden',(57,179,24),(83,164,23),30),
           ('C4-street',(72,253,16),(56,236,8.6),35)]
    RENDER_DIR.mkdir(parents=True,exist_ok=True)
    for name,pos,target,lens in shots:
        cam.data.lens=lens; cam.location=Vector(to_blender(pos))
        cam.rotation_euler=(Vector(to_blender(target))-cam.location).to_track_quat('-Z','Y').to_euler()
        sc.render.filepath=str(RENDER_DIR/(name+'.png'))
        bpy.ops.render.render(write_still=True)
    plan['blender']['rendered']=[str(RENDER_DIR/(s[0]+'.png')) for s in shots]
    PLAN_PATH.write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')


def main(argv=None):
    # The coordinator may exec/import this file with a non-__main__ namespace
    # and call main([]) inside its existing Blender process.
    if argv is None:
        argv=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else sys.argv[1:]
        # Blender's own switches precede --; -P without -- means defaults.
        if '-P' in argv or '--python' in argv: argv=[]
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan-only',action='store_true')
    parser.add_argument('--no-render',action='store_true')
    parser.add_argument('--no-preview-vegetation',action='store_true')
    args=parser.parse_args(argv)
    assert SOURCE.name=='source' and DELIVERY.name=='clivus-palatinus-v1'
    des=build_design(); checks=check_design(des); plan=make_plan(des,checks)
    PLAN_PATH.write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    if not args.plan_only:
        run_blender(des,plan,not args.no_render,not args.no_preview_vegetation)
    print('ASSET_PREFLIGHT '+json.dumps(checks,ensure_ascii=False))
    print('PLAN '+str(PLAN_PATH))


if __name__=='__main__':
    main()
