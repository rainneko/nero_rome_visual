"""Paired Roman produce stalls, original AD 56 city asset."""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                         # noqa: F401,F403
import bpy
import bl_kit as _bl

# Script-local finishes; do not alter the shared kit.
_PREVIEW = _bl._preview_scene
def _cycles_preview(ob, front):
    out = _PREVIEW(ob, front)
    sc = bpy.context.scene
    # The shared preview helper adds a red scale figure by default; omit it for this asset.
    for obj in list(bpy.data.objects):
        if obj.name.startswith('preview_human'):
            bpy.data.objects.remove(obj, do_unlink=True)
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 12
    sc.cycles.use_denoising = False
    sc.render.threads_mode = 'FIXED'
    sc.render.threads = 2
    sc.render.resolution_x = 800
    sc.render.resolution_y = 450
    sc.render.resolution_percentage = 100
    return out
_bl._preview_scene = _cycles_preview

PAL.update({
    'wicker': ((0.48, 0.31, 0.16), 0.0, 0.96),
    'apple': ((0.72, 0.16, 0.09), 0.0, 0.52),
    'fig': ((0.32, 0.16, 0.34), 0.0, 0.62),
    'leaf': ((0.28, 0.40, 0.16), 0.0, 0.88),
    'ceramic': ((0.56, 0.29, 0.18), 0.0, 0.72),
})

reset()
F = Frame()

def cloth_panel(x0, x1, y0, y1, zfront, zback, mat, sag=0.07):
    """Thin, closed cloth sheet with a gentle sag between its support rails."""
    nx, ny, thick = 12, 8, 0.025
    verts = []
    def p(i, j, lower=False):
        u, v = i / nx, j / ny
        x = x0 + u * (x1 - x0)
        y = y0 + v * (y1 - y0)
        z = zfront + v * (zback - zfront) - sag * math.sin(math.pi * v) * (0.7 + 0.3 * math.cos((u-.5)*math.pi))
        return (x, y, z - (thick if lower else 0.0))
    for lower in (False, True):
        for j in range(ny + 1):
            for i in range(nx + 1):
                verts.append(p(i, j, lower))
    n = (nx + 1) * (ny + 1)
    faces = []
    for j in range(ny):
        for i in range(nx):
            a = j*(nx+1)+i; b=a+1; d=(j+1)*(nx+1)+i; c=d+1
            faces.extend(((a,b,c,d),(n+d,n+c,n+b,n+a)))
    for i in range(nx):
        a=i; b=i+1; faces.append((a,n+a,n+b,b))
        a=ny*(nx+1)+i; b=a+1; faces.append((a,b,n+b,n+a))
    for j in range(ny):
        a=j*(nx+1); b=(j+1)*(nx+1); faces.append((a,b,n+b,n+a))
        a=j*(nx+1)+nx; b=(j+1)*(nx+1)+nx; faces.append((a,n+a,n+b,b))
    add_mesh(mat, verts, faces)

def basket(x, y, z, r=0.32, h=0.30):
    # Low tapered basket body, a strong rim, and two sparse woven bands.
    lathe(None, x, y, [(r*.72,z),(r*.78,z+h*.82),(r,z+h),(r*.90,z+h),(r*.67,z+h*.12)], 'wicker', 12, smooth=False)
    for zz, rr in ((z+h*.20,r*.80),(z+h*.48,r*.88),(z+h*.91,r)):
        cyl(None,x,y,zz,rr,0.026,'wood',12)

def crate(x,y,z,w=.48,d=.38,h=.42):
    # Four open-looking slatted sides and a board base.
    box(None,x,y,z,w,d,.045,'wood')
    for zz in (z+.10,z+.25,z+h-.045):
        box(None,x,y-d/2+.018,zz,w,.035,.055,'wood')
        box(None,x,y+d/2-.018,zz,w,.035,.055,'wood')
        box(None,x-w/2+.018,y,zz,.035,d,.055,'wood')
        box(None,x+w/2-.018,y,zz,.035,d,.055,'wood')

def jar(x,y,z,s=1.0):
    lathe(None,x,y,[(.12*s,z),(.18*s,z+.05*s),(.22*s,z+.20*s),(.19*s,z+.38*s),(.11*s,z+.47*s),(.075*s,z+.48*s),(.075*s,z+.52*s),(.11*s,z+.52*s)],'ceramic',12,smooth=True)

# Flush, shallow stone apron: overall declared footprint 6.3 x 3.7 m.
prism(None,[(-3.15,-1.85),(3.15,-1.85),(3.15,1.85),(-3.15,1.85)],-.12,0,'stone')
for x in (-2.95,-2.45,-1.95,-1.45,-.95,-.45,.45,.95,1.45,1.95,2.45,2.95):
    beam(None,x,-1.82,-.112,x,1.82,-.112,.018,.009,'paving')
for y in (-1.30,-.70,-.10,.50,1.10,1.70):
    beam(None,-3.13,y,-.111,3.13,y,-.111,.018,.009,'paving')

centres=(-1.52,1.52)
# Two independent timber frames; outer and shared centre supports stay inside footprint.
for ci,cx in enumerate(centres):
    xlo,xhi=cx-1.44,cx+1.44
    for x in (xlo,xhi):
        for y,zheight in ((-1.53,2.48),(1.52,2.75)):
            box(None,x,y,0,.105,.105,zheight,'wood')
            box(None,x,y,zheight-.04,.16,.16,.08,'wood')
    # Rear and front tie beams, ridge rails, and restrained diagonal braces.
    for y,z in ((-1.53,2.40),(1.52,2.66)):
        beam(None,xlo,y,z,xhi,y,z,.09,.09,'wood')
    beam(None,xlo,-1.53,2.43,xlo,1.52,2.67,.08,.08,'wood')
    beam(None,xhi,-1.53,2.43,xhi,1.52,2.67,.08,.08,'wood')
    # Retracted front edge rests on this crossrail, carried by the side rails.
    beam(None,xlo,-.38,2.51,xhi,-.38,2.51,.075,.075,'wood')
    for x,sgn in ((xlo,1),(xhi,-1)):
        beam(None,x,-1.45,1.55,x+sgn*.55,-.98,2.18,.065,.065,'wood')
        beam(None,x,1.44,1.75,x+sgn*.48,.95,2.37,.065,.065,'wood')
    # Cloth roof is pitched gently toward the rear and visibly draped.
    cloth_panel(xlo-.035,xhi+.035,-.38,1.76,2.51,2.68,'awning' if ci==0 else 'linen',.075)
    # Small rolled edge cords are functional bindings, not decorative labels.
    for x in (xlo+.06,(xlo+xhi)/2,xhi-.06):
        cyl(None,x,-.38,2.46,.025,.10,'wicker',8)

# Each stall: a light open counter, .85 m high, with face at y=-1.05.
for cx in centres:
    w=2.50; front=-1.05; back=-.48; top=.85
    for x in (cx-w/2+.055,cx+w/2-.055):
        box(None,x,(front+back)/2,0,.11,back-front,.81,'wood')
    for z in (.12,.70):
        beam(None,cx-w/2,front,z,cx+w/2,front,z,.075,.075,'wood')
        beam(None,cx-w/2,back,z,cx+w/2,back,z,.075,.075,'wood')
    # Four separate planks make a worn timber counter top; no stone slab.
    plank_gap=.012
    plank_w=(w-.045-3*plank_gap)/4
    for i in range(4):
        px=cx-w/2+.0225+plank_w/2+i*(plank_w+plank_gap)
        box(None,px,(front+back)/2,.81,plank_w,.66,.04,'wood')
    # Rear stock shelf, set behind a full 1.2 m merchant passage.
    shelf_y=1.25; shelf_depth=.35
    box(None,cx,shelf_y,.78,2.18,shelf_depth,.09,'wood')
    for x in (cx-1.02,cx+1.02): box(None,x,1.25,.08,.07,.30,.70,'wood')
    crate(cx-.70,-.77,.03,.46,.40,.36)
    crate(cx+.70,-.77,.03,.46,.40,.36)

# Four legible produce groups: apples, figs on left; cabbages, leeks on right.
produce_specs=[(-2.24,-.77,'apple'),(-.80,-.77,'fig'),(.80,-.77,'cabbage'),(2.24,-.77,'leek')]
for gx,gy,kind in produce_specs:
    basket(gx,gy,.91,.34,.24)
    if kind in ('apple','fig'):
        mat='apple' if kind=='apple' else 'fig'
        for i,(dx,dy,dz) in enumerate(((-.16,-.09,.20),(0,-.12,.20),(.16,-.08,.20),(-.10,.08,.24),(.10,.09,.24),(0,0,.30))):
            sphere(None,gx+dx,gy+dy,1.02+dz,.085,mat,8,5,z_scale=1.08)
    elif kind=='cabbage':
        for dx,dy in ((-.12,0),(.10,-.03),(0,.12)):
            sphere(None,gx+dx,gy+dy,1.16,.18,'leaf',10,6,z_scale=.82)
            for a in range(3):
                beam(None,gx+dx,gy+dy,1.22,gx+dx+(a-1)*.08,gy+dy+(a-1)*.04,1.34,.018,.018,'linen')
    else:
        # Leeks: pale shafts with narrow dark green leaves fanning upward.
        for j in range(5):
            x=gx-.18+j*.09
            cyl(None,x,gy,1.01,.035,.25,'linen',8,r_top=.055,smooth=False)
            beam(None,x,gy,1.22,x+(j-2)*.035,gy+.10,1.43,.035,.025,'leaf')
            beam(None,x,gy,1.22,x+(j-2)*.045,gy-.08,1.40,.03,.022,'leaf')

# Stock jars and small hanging balance, kept off the visitor aisle.
for cx in centres:
    jar(cx-1.20,1.53,.02,.86)
    jar(cx+1.20,1.53,.02,.82)
# Balance at the shared end: timber crossbar, bronze hanger and two shallow pans.
beam(None,-.10,-.94,2.08,.10,-.94,2.08,.035,.035,'bronze')
beam(None,0,-.94,2.10,0,-.94,2.39,.035,.035,'bronze')
beam(None,-.34,-.94,2.28,.34,-.94,2.28,.035,.035,'bronze')
for x in (-.25,.25):
    beam(None,x,-.94,2.27,x,-.94,1.99,.014,.014,'bronze')
    # shallow pan approximated by a small open lathed bowl
    lathe(None,x,-.94,[(.01,1.92),(.14,1.96),(.20,2.04),(.20,2.06),(.16,2.04)],'bronze',12,smooth=False)

report=finish('rome_market_pair',front='-Y')
# Preserve the built joined mesh plus preview setup as the ignored handoff file.
blend_path=os.path.join(ROOT,'renders','rome_market_pair','source.blend')
os.makedirs(os.path.dirname(blend_path),exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print('HANDOFF_BLEND '+blend_path)
