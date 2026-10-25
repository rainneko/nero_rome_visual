"""Open garden exedra with a lightly shaded timber pergola. Front is -Y."""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
import rk as _bk
import bpy
from mathutils import Vector

_bk.PAL.update({
    'exedra_stone': ((0.78, 0.73, 0.63), 0.0, 0.82),
    'exedra_trim': ((0.91, 0.86, 0.74), 0.0, 0.72),
    'exedra_red': ((0.48, 0.12, 0.10), 0.0, 0.84),
    'exedra_wood': ((0.27, 0.13, 0.065), 0.0, 0.82),
    'exedra_cloth': ((0.40, 0.075, 0.065), 0.0, 0.92),
    'exedra_terra': ((0.55, 0.25, 0.13), 0.0, 0.9),
    'exedra_leaf': ((0.12, 0.25, 0.10), 0.0, 0.9),
    'exedra_bronze': ((0.30, 0.22, 0.10), 0.72, 0.36),
})

def ellipsoid(F, cx, cy, cz, sx, sy, sz, mat, seg=12, rings=8, smooth=True):
    F = F if F is not None else Frame(); verts=[]; faces=[]
    for i in range(rings+1):
        th=math.pi*i/rings
        for j in range(seg):
            ph=TAU*j/seg
            verts.append(F.p(cx+sx*math.sin(th)*math.cos(ph), cy+sy*math.sin(th)*math.sin(ph), cz+sz*math.cos(th)))
    for i in range(rings):
        for j in range(seg):
            a=i*seg+j; b=i*seg+(j+1)%seg; c=(i+1)*seg+(j+1)%seg; d=(i+1)*seg+j
            faces.append((a,d,c,b))
    add_mesh(mat,verts,faces,smooth)

def volute(F, x, y, z, side):
    """Short tapered round-section Ionic scroll in the front-facing capital plane."""
    centers=[]; steps=36
    for i in range(steps+1):
        t=i/steps
        ang=2*math.pi*t+0.3
        r=0.085*(1-0.58*t)
        centers.append((x+side*(0.13+r*math.cos(ang)), y, z+r*math.sin(ang)))
    verts=[]; faces=[]; n=7; tube=0.018
    for i,(px,py,pz) in enumerate(centers):
        prev=Vector(centers[max(0,i-1)]); nex=Vector(centers[min(steps,i+1)])
        tangent=(nex-prev).normalized(); normal=Vector((-tangent.z,0,tangent.x)).normalized()
        for j in range(n):
            a=TAU*j/n
            q=Vector((px,py,pz))+tube*(math.cos(a)*normal+math.sin(a)*Vector((0,1,0)))
            verts.append(q)
    for i in range(steps):
        for j in range(n):
            a=i*n+j; b=i*n+(j+1)%n
            faces.append((a,b,b+n,a+n))
    add_mesh('exedra_trim',verts,faces,True)

def curved_band(F, radius_outer, radius_inner, z0, z1, a0, a1, cy, mat, steps=24):
    v=[]
    for z in (z0,z1):
        for r in (radius_outer,radius_inner):
            for i in range(steps+1):
                a=math.radians(a0+(a1-a0)*i/steps)
                v.append(F.p(r*math.cos(a),cy+r*math.sin(a),z))
    n=steps+1; faces=[]
    # four longitudinal surfaces, plus end caps
    for i in range(steps):
        b=i; faces += [(b,b+1,n+b+1,n+b), (2*n+b,3*n+b,3*n+b+1,2*n+b+1),
                       (b,2*n+b,2*n+b+1,b+1), (n+b,n+b+1,3*n+b+1,3*n+b)]
    faces += [(0,n,3*n,2*n),(steps,2*n+steps,3*n+steps,n+steps)]
    add_mesh(mat,[tuple(p) for p in v],faces)

def pot_and_myrtle(F,x,y):
    lathe(F,x,y,[(0.20,0.04),(0.25,0.10),(0.31,0.32),(0.27,0.47),(0.30,0.49),(0.30,0.54),(0.23,0.53)],'exedra_terra',16,False)
    cyl(F,x,y,0.52,0.19,0.08,'rock',12)
    # compact clipped myrtle crown and visible twiglets
    lobes=[(-.02,.01,1.03,.18,.16,.19),(-.20,.02,.91,.17,.15,.18),
           (.18,.05,.96,.18,.15,.20),(-.09,-.17,.94,.17,.15,.18),
           (.10,.18,1.04,.16,.14,.18),(.02,-.04,1.18,.15,.14,.17),
           (-.18,-.10,1.12,.15,.14,.17)]
    for dx,dy,z,sx,sy,sz in lobes:
        ellipsoid(F,x+dx,y+dy,z,sx,sy,sz,'exedra_leaf',8,5,smooth=False)

def bust(F):
    # low bronze portrait on a square marble socle; face looks toward the garden front (-Y)
    box(F,0,1.39,0,0.62,0.54,0.38,'exedra_stone')
    box(F,0,1.39,0.38,0.52,0.46,0.10,'exedra_trim')
    cyl(F,0,1.39,0.48,0.20,0.17,'exedra_bronze',12,r_top=0.16)
    ellipsoid(F,0,1.39,0.79,0.29,0.20,0.24,'exedra_bronze',12,8) # shoulders and chest
    ellipsoid(F,0,1.37,.98,.115,.12,.15,'exedra_bronze',10,7)
    ellipsoid(F,0,1.30,1.15,.18,.17,.20,'exedra_bronze',12,9)
    # low hair cap and a shallow face plane keep the bronze portrait readable at scale
    ellipsoid(F,0,1.335,1.275,.17,.14,.078,'exedra_bronze',10,6)
    ellipsoid(F,0,1.126,1.15,.105,.035,.142,'exedra_bronze',10,7)
    for sx in (-1,1):
        ellipsoid(F,sx*.17,1.30,1.16,.035,.045,.065,'exedra_bronze',8,5)
    # brows, projecting nose and restrained eyes
    for sx in (-1,1):
        ellipsoid(F,sx*.055,1.094,1.20,.028,.018,.018,'exedra_wood',8,5)
    ellipsoid(F,0,1.078,1.145,.026,.035,.064,'exedra_bronze',8,5)

def build():
    reset(); F=Frame(); preview_ground(-0.16)
    # shallow square paving, flush with the ground; clipped corners leave an elegant furnishing footprint
    prism(F,[(-3.48,-1.98),(3.48,-1.98),(3.58,-1.86),(3.58,1.86),(3.48,1.98),(-3.48,1.98),(-3.58,1.86),(-3.58,-1.86)],-.12,0,'exedra_stone')
    # thin paving border
    for y in (-1.82,1.82): box(F,0,y,0,6.65,.045,.018,'exedra_red')
    for x in (-3.42,3.42): box(F,x,0,0,.045,3.55,.018,'exedra_red')

    # Four slim fluted Ionic columns, entirely open between them
    cols=[(-2.72,-1.48),(2.72,-1.48),(-2.72,1.48),(2.72,1.48)]
    for x,y in cols:
        column(F,x,y,0,2.72,.155,'exedra_trim','ionic',flutes=8,seg=16,cap_mat='exedra_trim')
        z=2.617
        # paired readable spiral volutes on the front face of each capital
        for side in (-1,1): volute(F,x,y-.145,z,side)

    # Open timber frame: perimeter plates and four evenly spaced joists, with no solid roof slab
    zbeam=2.70
    for y in (-1.48,1.48): box(F,0,y,zbeam,5.56,.17,.18,'exedra_wood')
    for x in (-2.72,2.72): box(F,x,0,zbeam,.17,3.12,.18,'exedra_wood')
    for x in (-1.85,-.93,0,.93,1.85): box(F,x,0,zbeam,.10,2.94,.13,'exedra_wood')
    # Two long, narrow madder strips; each under 10% of roof plan area
    for x in (-1.38,1.38):
        box(F,x,0,2.81,.48,2.65,.035,'exedra_cloth')

    # Curved low bench, open at the front; low back wall with restrained red inset panels
    cy=-0.02
    curved_band(F,2.00,1.55,.06,.48,22,158,cy,'exedra_stone',28)
    curved_band(F,2.04,1.99,.48,.90,22,158,cy,'exedra_stone',28)
    # The decorative field faces the seated side of the wall (toward -Y).
    curved_band(F,1.985,1.975,.54,.82,29,151,cy,'exedra_red',24)
    curved_band(F,1.972,1.964,.51,.85,31,149,cy,'exedra_trim',24)
    # joints/supports under seat, at three points along its arc
    for a in (38,90,142):
        t=math.radians(a); x=1.93*math.cos(t); y=cy+1.93*math.sin(t)
        box(F,x,y,.02,.30,.32,.43,'exedra_trim',rot=a-90)
    # continuous pale seat slab with a fine edge moulding
    curved_band(F,2.02,1.51,.46,.53,22,158,cy,'exedra_trim',28)

    bust(F)
    # Small round marble table set behind the clear entry apron
    cyl(F,0,-.43,.04,.075,.48,'exedra_wood',10,r_top=.11)
    cyl(F,0,-.43,.49,.38,.065,'exedra_trim',20)
    cyl(F,0,-.43,.555,.34,.018,'marble',20)
    for x,y in ((-2.37,.24),(2.37,.24)): pot_and_myrtle(F,x,y)

    # report-friendly local preview configuration, per brief
    original_preview=_bk._bk._preview_scene
    def _preview_scene_cpu(ob,front):
        result=original_preview(ob,front)
        sc=bpy.context.scene
        for obj in sc.objects:
            if obj.name == 'preview_human': obj.hide_render=True
        sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=12
        sc.cycles.use_denoising=False
        sc.render.resolution_x=800; sc.render.resolution_y=450; sc.render.resolution_percentage=100
        sc.render.threads_mode='FIXED'; sc.render.threads=2
        return result
    _bk._bk._preview_scene=_preview_scene_cpu
    finish('rome_garden_exedra',front='-Y')
    handoff=os.path.join(ROOT,'renders','rome_garden_exedra','source.blend')
    os.makedirs(os.path.dirname(handoff),exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=handoff)

if __name__=='__main__': build()
