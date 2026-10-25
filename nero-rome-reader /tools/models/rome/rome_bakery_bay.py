"""Open bakery work bay, a plausible Roman neighborhood bake shop in AD 56."""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
import rk as _rk
import bpy
from mathutils import Vector

PAL.update({
    'millstone': ((0.33, 0.32, 0.29), 0.0, 0.97),
    'kiln_lining': ((0.68, 0.45, 0.31), 0.0, 0.96),
    'bread': ((0.64, 0.39, 0.19), 0.0, 0.95),
    'clay': ((0.45, 0.25, 0.16), 0.0, 0.92),
})

NAME = 'rome_bakery_bay'
_old_preview_scene = _rk._bk._preview_scene

def _cycles_preview(ob, front):
    result = _old_preview_scene(ob, front)
    preview_human = bpy.data.objects.get('preview_human')
    if preview_human:
        bpy.data.objects.remove(preview_human, do_unlink=True)
    # Preview-only warm fill into the oven throat; finish() exports the GLB before this hook.
    lamp_data=bpy.data.lights.new('oven_preview_fill','AREA')
    lamp_data.energy=80
    lamp_data.color=(1.0,.62,.40)
    lamp_data.shape='DISK'
    lamp_data.size=.42
    lamp=bpy.data.objects.new('oven_preview_fill',lamp_data)
    bpy.context.scene.collection.objects.link(lamp)
    lamp.location=(1.2,.42,1.52)
    lamp.rotation_euler=(Vector((1.2,1.78,1.30))-lamp.location).to_track_quat('-Z','Y').to_euler()
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 12
    sc.cycles.use_denoising = False
    sc.render.threads_mode = 'FIXED'
    sc.render.threads = 2
    sc.render.resolution_x, sc.render.resolution_y = 800, 450
    sc.render.resolution_percentage = 100
    return result

_rk._bk._preview_scene = _cycles_preview

def _shell(cx, cy, r, base, inner=False):
    """Hemidome with a clean grid-aligned opening for the lined oven throat."""
    nlat, nlon = 16, 40
    verts, faces = [], []
    for i in range(nlat + 1):
        th = (math.pi / 2) * i / nlat
        for j in range(nlon):
            ph = 2 * math.pi * j / nlon
            verts.append((cx + r * math.sin(th) * math.cos(ph),
                          cy + r * math.sin(th) * math.sin(ph),
                          base + r * math.cos(th)))
    for i in range(nlat):
        for j in range(nlon):
            a = i*nlon+j; b = i*nlon+(j+1)%nlon
            c = (i+1)*nlon+(j+1)%nlon; d = (i+1)*nlon+j
            # Phi cells 27..32 are centered on the -Y face. Their shared
            # vertices produce straight, regular aperture edges.
            opening_row = 4 if inner else 6
            if not (27 <= j <= 32 and i >= opening_row):
                face=(a,b,c,d)
                faces.append(tuple(reversed(face)) if inner else face)
    add_mesh('kiln_lining' if inner else 'plaster2', verts, faces, smooth=True)

def _arch_wedge(cx, y, spring, rin, rout, a0, a1, mat):
    """A single voussoir block, annular sector extruded through the oven face."""
    verts=[]
    for yy in (y-0.11, y+0.11):
        for rr, aa in ((rin,a0),(rout,a0),(rout,a1),(rin,a1)):
            verts.append((cx+rr*math.sin(aa), yy, spring+rr*math.cos(aa)))
    add_mesh(mat, verts, [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)])

def _roof_tile(x0, y0, width, length, zback, zfront, mat):
    """Flat, individually laid terracotta tile, sloped down toward the open front."""
    verts=[(x0,y0,zback),(x0+width,y0,zback),(x0+width,y0+length,zfront),(x0,y0+length,zfront)]
    d=Vector((0,0.03,-0.035)); bot=[tuple(Vector(v)+d) for v in verts]
    add_mesh(mat, verts+bot, [(0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)])

def _jar(x,y,z,s=1.0,mat='clay'):
    lathe(None,x,y,[(.05*s,z),(.17*s,z+.06*s),(.22*s,z+.28*s),(.20*s,z+.48*s),(.12*s,z+.60*s),(.09*s,z+.63*s),(.11*s,z+.66*s),(.07*s,z+.66*s)],mat,12,True)

def build():
    reset()
    F=Frame()
    # Flush irregular paving; no raised platform.
    for ix in range(9):
        for iy in range(8):
            x=-2.65+ix*.65; y=-2.35+iy*.66
            w=.62+(.03*((ix+iy)%3)); d=.61+(.025*((ix*2+iy)%3))
            box(F,x,y,-.12,w,d,.12,('paving','stone','paving')[(ix+2*iy)%3])
    # Rear enclosure with waist-high open side returns and red lower back plaster.
    box(F,0,2.55,0,5.85,.22,2.52,'plaster2')
    box(F,0,2.425,.04,5.45,.018,1.08,'red')
    for s in (-1,1):
        box(F,s*2.85,-.02,0,.22,5.10,.78,'stone')
        # rough brick coping at the open return
        for k in range(8):
            box(F,s*2.85,-2.28+k*.64,.78,.27,.58,.10,'brick')
    # Rear-third lean-to, supported with exposed wood rafters and tiled roof.
    for x in (-2.55,2.55):
        beam(F,x,1.00,2.42,x,2.45,3.10,.12,.12,'wood')
        beam(F,x,1.00,0,x,1.00,2.48,.12,.12,'wood')
        box(F,x,2.43,0,.12,.12,3.10,'wood')  # grounded rear post seats directly under the high beam
    beam(F,-2.65,2.43,3.10,2.65,2.43,3.10,.14,.14,'wood')
    beam(F,-2.65,1.00,2.42,2.65,1.00,2.42,.13,.13,'wood')
    for x in (-2.25,-1.35,-.45,.45,1.35,2.25):
        beam(F,x,1.00,2.35,x,2.45,3.03,.075,.10,'wood')
    # Overlapping courses share a single lean-to plane; rafters are below the tiles.
    for row in range(4):
        y=.90+row*.39
        zback=2.45+(y-1.0)*(.68/1.45)
        zfront=2.45+(y+.43-1.0)*(.68/1.45)
        for col in range(8):
            _roof_tile(-2.95+col*.735,y,.755,.43,zback,zfront,'tile' if (row+col)%4 else 'tile2')
    # Volcanic hourglass hand mill, with a clearly readable turning bar.
    mx,my=-1.35,.60
    lathe(F,mx,my,[(.48,0),(.55,.08),(.58,.25),(.53,.35),(.52,.38),(.43,.54),(.32,.72),(.25,.85),(.25,.95),(.32,1.12),(.46,1.37),(.52,1.44),(.53,1.48),(.47,1.48),(.40,1.42),(.38,1.30),(.31,1.10),(.18,.95),(.14,.72)],'millstone',28,False)
    cyl(F,mx,my,1.40,.075,.10,'millstone',12)
    beam(F,mx,my,1.48,mx-.96,my,1.48,.10,.09,'wood')
    cyl(F,mx-.96,my,1.40,.07,.16,'wood',10)
    # Rear oven: hemispherical outer shell and smaller warm chamber lining, both open at the mouth.
    ox,oy=1.20,1.25
    # low kiln plinth and clay hearth at about 0.9 m
    box(F,ox,oy,.04,2.15,2.10,.76,'stone')
    box(F,ox,oy,.80,2.25,2.14,.16,'brick')
    cyl(F,ox,oy,.96,.84,.022,'kiln_lining',36, smooth=False)
    _shell(ox,oy,1.06,.92,False)
    _shell(ox,oy,.96,.92,True)
    # A compact arched tunnel lip; open rectangular throat continues into the hollow dome.
    spring=1.28; inner=.40; outer=.54
    # short straight jambs and lintel base stones
    for x in (ox-.47,ox+.47): box(F,x,oy-.82,1.06,.14,.20,.24,'brick')
    for i in range(11):
        a0=-math.pi/2+i*math.pi/11; a1=-math.pi/2+(i+1)*math.pi/11
        _arch_wedge(ox,oy-.82,spring,inner,outer,a0,a1,'brick')
    # Refractory jambs and curved soffit make a short open tunnel into the chamber.
    for side in (-1,1):
        box(F,ox+side*.43,oy-.47,.97,.12,.70,.31,'kiln_lining')
    tv=[]; tf=[]; nseg=22
    for i in range(nseg+1):
        a=-math.pi/2+i*math.pi/nseg
        x=ox+inner*math.sin(a); z=spring+inner*math.cos(a)
        tv.extend([(x,oy-.82,z),(x,oy-.22,z)])
    for i in range(nseg):
        k=2*i; tf.append((k,k+1,k+3,k+2))
    add_mesh('kiln_lining',tv,tf)
    # Recessed clay interior visible through the open mouth and its pale refractory floor.
    box(F,ox,1.08,.965,.72,1.30,.035,'kiln_lining')
    # Warm clay back wall at the far end of the chamber (the throat stays open).
    back_y=1.78
    add_poly('kiln_lining',[(ox-.36,back_y,.99),(ox+.36,back_y,.99),(ox+.36,back_y,1.30),
                            (ox+.31,back_y,1.44),(ox+.18,back_y,1.57),(ox,back_y,1.62),
                            (ox-.18,back_y,1.57),(ox-.31,back_y,1.44),(ox-.36,back_y,1.30)])
    # Wood fuel below hearth, stacked neatly in the low opening (unlit).
    for k in range(5):
        beam(F,ox-.47+k*.22,oy-.86,.20,ox-.47+k*.22,oy-.34,.20,.075,.075,'wood')
    # Supported long-handled bread paddle beside the oven; paddle head and shaft.
    beam(F,2.45,-.65,.08,2.45,.05,1.55,.075,.075,'wood')
    box(F,2.45,-.76,.08,.36,.30,.055,'wood')
    # Workbench at front-left, well outside the mill's >=0.9 m walking ring.
    bx,by=-1.62,-1.92
    box(F,bx,by,.75,1.72,.76,.10,'wood')
    for x in (bx-.72,bx+.72):
        for y in (by-.28,by+.28): box(F,x,y,0,.10,.10,.75,'wood')
    beam(F,bx-.78,by-.31,.34,bx+.78,by-.31,.34,.07,.07,'wood')
    beam(F,bx-.78,by+.31,.34,bx+.78,by+.31,.34,.07,.07,'wood')
    # Six scored round loaves, three on each side of the bench top.
    for x,y in ((bx-.48,by-.20),(bx,by-.20),(bx+.48,by-.20),(bx-.48,by+.20),(bx,by+.20),(bx+.48,by+.20)):
        sphere(F,x,y,.91,.16,'bread',16,8,.62)
        # scored cross in muted flour color
        beam(F,x-.075,y,.999,x+.075,y,.999,.012,.008,'plaster2')
        beam(F,x,y-.075,1.0,x,y+.075,1.0,.012,.008,'plaster2')
    # Grain bowls stand on the paving beside the bench, supported by the ground.
    for x,rim in ((-.35,.22),(.22,.19)):
        lathe(F,x,-1.72,[(.05,.02),(rim,.02),(rim*.82,.12),(rim*.32,.17),(.05,.17)],'clay',16,False)
        cyl(F,x,-1.72,.145,rim*.67,.018,'bread',16)
    # Grain sack and water jar against rear side of work area.
    lathe(F,-2.25,1.45,[(.16,0),(.25,.12),(.29,.48),(.23,.78),(.16,.84),(.14,.78)],'plaster2',12,True)
    cyl(F,-2.25,1.45,.77,.15,.015,'bread',12)
    _jar(2.45,.55,0,.95,'clay')
    # small wooden ingredient tubs under the bench, left open for circulation at the front.
    # finish() joins/export/renders with the script-local Cycles preview wrapper.
    finish(NAME,front='-Y')
    # Preserve the full Blender handoff scene, including preview cameras and lights.
    out=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','..','renders',NAME,'source.blend')
    os.makedirs(os.path.dirname(out),exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(out))

if __name__ == '__main__':
    build()
