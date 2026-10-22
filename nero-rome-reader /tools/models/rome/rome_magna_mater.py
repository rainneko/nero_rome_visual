"""Temple of Magna Mater on the Cermalus (rome_magna_mater), brief briefs/rome/magna_mater.md. AD 56.
Blender +X = east, +Y = north. The temple faces -Y (south-west on the real site).
Base, stepping down as on hill_temple_base.jpg: main terrace (z 0) -> side and lower terraces (z -8) ->
the walls rise out of craggy tuff whose top is at about z -12 -> ground (z -16)."""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                      # noqa: F401,F403  bl_kit parts and Rome parts
import bpy
import bl_kit as _bl                  # the kit's preview scene: this script only lowers its sample count

_PREVIEW_KIT = _bl._preview_scene


def _preview_low_samples(ob, front):
    out = _PREVIEW_KIT(ob, front)
    try:
        bpy.context.scene.eevee.taa_render_samples = 16     # low samples: the Mac is short of memory
    except Exception:
        pass
    return out


_bl._preview_scene = _preview_low_samples

ZM = 0.02        # main terrace paving top (a hair above the podium foundation top: no z-fighting)
ZL = -7.98       # lower level paving top
FILL = -0.03     # top of the solid fill under the main terrace (hidden under the paving)


def floor_top(F, pts, z, mat):
    """A flat paved surface (counter-clockwise points) with its top at z; the walls around it hold it up."""
    add_poly(mat, [F.p(x, y, z) for x, y in pts])


def solid(F, x0, y0, x1, y1, z0, z1, mat='tuff'):
    """A solid block between two corners: hidden fill under a terrace, or a landing."""
    box(F, (x0 + x1) / 2, (y0 + y1) / 2, z0, abs(x1 - x0), abs(y1 - y0), z1 - z0, mat)


def lion(F, x, y, z0, rot=0.0, mat='marble'):
    """Recumbent marble lion, about 2.6 m long, head toward local -y, resting on the top z0."""
    S = F.sub(x, y, z0, rot)
    box(S, 0, 0.15, 0.40, 1.0, 1.5, 0.75, mat)              # body and haunches
    box(S, 0, -0.62, 0.40, 1.02, 0.72, 1.02, mat)           # raised chest and forequarters
    for sx in (-1, 1):
        box(S, sx * 0.34, -0.70, 0.0, 0.26, 0.28, 0.42, mat)    # forepaws
        box(S, sx * 0.34, 0.60, 0.0, 0.30, 0.42, 0.42, mat)     # hind legs
    sphere(S, 0, -1.05, 1.22, 0.42, mat, 10, 6)             # mane
    sphere(S, 0, -1.18, 1.18, 0.30, mat, 10, 6)             # head
    box(S, 0, -1.44, 1.06, 0.24, 0.26, 0.20, mat)           # muzzle
    beam(S, 0.36, 1.00, 0.60, 0.42, 1.25, 1.00, 0.10, 0.10, mat)    # tail


def close_up(path, loc, target):
    """Check render only (not exported): one camera at loc looking at target, saved to path."""
    import bpy
    import bl_kit
    ob = bl_kit._build_object('rome_magna_mater_close')
    bl_kit._preview_scene(ob, '-Y')
    sc = bpy.context.scene
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.lens = 35; cam.data.clip_end = 2000
    cam.location = Vector(loc); bl_kit._look(cam, Vector(target))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    sc.render.filepath = path; bpy.ops.render.render(write_still=True)
    print('CLOSE_UP ' + path)


# ---------------------------------------------------------------- build
reset()
F = Frame()
preview_ground(-16.0)

# ---- hill rock: the walls stand in craggy tuff whose top is at about -12 (the outcrops overlap the walls' feet)
RK = dict(z0=-24.0, z1=-12.0, strata=4, jitter=1.0, step=5.0, dip=1.5, relief=1.5, moss_cover=0.3, grid=7.0,
          ground=-16.0)                       # cliff extent = 0.6 x (top - ground) = about 2.4 m
W_TOP = rock_mass(F, [(-20, -56), (-20, 44), (-33, 44), (-33, -56)], seed=3, **RK)     # west cliff band
S_TOP = rock_mass(F, [(-40, -51), (40, -51), (40, -40), (-40, -40)], seed=7, **RK)     # south cliff band
E_TOP = rock_mass(F, [(20, -56), (33, -56), (33, 44), (20, 44)], seed=11, **RK)        # east cliff band
N_TOP = rock_mass(F, [(-34, 20), (34, 20), (34, 44), (-34, 44)], -20.0, -2.0, seed=5, strata=6, jitter=1.0,
                  step=5.0, dip=1.5, relief=0.8, grid=7.0, ground=-16.0)               # north band, under the north wall

# ---- main terrace (floor z = 0): solid fill, paved floor, walls on the W, S, E and N
solid(F, -19.8, -29.8, 19.8, 29.8, -16.0, FILL, 'tuff')
floor_top(F, [(-22, -32), (22, -32), (22, 32), (-22, 32)], ZM, 'paving')
# south wall: the arcaded hall is built against it, so no buttresses here
retaining_wall(F, [(-22, -32), (22, -32)], 0.0, -16.0, buttress=None, batter=0.0)
retaining_wall(F, [(-22, 32), (-22, -32)], 0.0, -16.0, mat='stone', bastion='d', every=22.0, b_size=8.0,
               b_rise=0.8, coping=True, batter=0.04)
# east wall: no parapet over the stair landing (balustrade pieces below leave the gap)
retaining_wall(F, [(22, -32), (22, 32)], 0.0, -16.0, mat='stone', bastion='d', every=22.0, b_size=8.0,
               b_rise=0.8, coping=True, batter=0.04, parapet=None)
balustrade(F, 21.7, -32.0, 21.7, -23.5, 0.35, 1.05, 'marble', 2.2, 0.28)
balustrade(F, 21.7, -20.5, 21.7, 32.0, 0.35, 1.05, 'marble', 2.2, 0.28)
# north wall (toward the hilltop): only down to -2
retaining_wall(F, [(22, 32), (-22, 32)], 0.0, -2.0, mat='stone', bastion='d', every=16.0, b_size=8.0,
               b_rise=0.8, coping=True, batter=0.04)
solid(F, -22.0, 29.8, 22.0, 32.0, -16.0, -2.0, 'tuff')     # solid under the north wall: no floating base

# ---- temple on the podium, stair to the south
T = podium_temple(F, 0, 10, W=17.5, L=33, pod_h=6, col_h=12, nf=6, kind='prostyle', porch=3,
                  order='corinthian', front='-Y', stair='front', stair_w=15.5, pod_mat='peperino',
                  cheek_statues=None, flutes=12)
lion(F, -8.25, -15.4, 6.0)
lion(F, 8.25, -15.4, 6.0)

# ---- forecourt for the games, altar and torches at the stair foot (stair foot at y = -17)
checker_paving(F, -20, -31, 20, -17, z=0.05, tile=1.2)
altar(F, 0, -22.0, 0.05, w=4.0, d=3.0, h=1.7, mat='marble', steps=2, fire=True)
torch_column(F, -10.2, -18.6, 0.05)
torch_column(F, 10.2, -18.6, 0.05)

# ---- rows of statues on pedestals along the side terraces (W strip x -26, E strip x 26)
for yy in (-24, -8, 8, 24):
    statue(F, -26.0, yy, ZL, h=2.6, mat='marble', pedestal=1.0, ped_mat='stone')
for yy in (-10, 6, 22):
    statue(F, 26.0, yy, ZL, h=2.6, mat='marble', pedestal=1.0, ped_mat='stone')

# ---- lower level (floor z = -8): the south terrace (60 x 16 m) and side terraces 8 m wide along the W and E walls
solid(F, -29.8, -47.8, 29.8, -31.8, -16.0, ZL - 0.05, 'tuff')
solid(F, -29.8, -31.8, -22.0, 31.8, -16.0, ZL - 0.05, 'tuff')
solid(F, 22.0, -31.8, 29.8, 31.8, -16.0, ZL - 0.05, 'tuff')
floor_top(F, [(-30, -48), (30, -48), (30, -32), (-30, -32)], ZL, 'paving')
floor_top(F, [(-30, -32), (-22, -32), (-22, 32), (-30, 32)], ZL, 'paving')
floor_top(F, [(22, -32), (30, -32), (30, 32), (22, 32)], ZL, 'paving')
retaining_wall(F, [(-30, -48), (30, -48)], ZL, -16.0, mat='stone', bastion='d', every=16.0, b_size=8.0,
               b_rise=0.8, coping=True, batter=0.04)
retaining_wall(F, [(30, -48), (30, 32)], ZL, -16.0, mat='stone', bastion='d', every=16.0, b_size=8.0,
               b_rise=0.8, coping=True, batter=0.04)
retaining_wall(F, [(-30, 32), (-30, -32)], ZL, -16.0, mat='stone', bastion='d', every=16.0, b_size=8.0,
               b_rise=0.8, coping=True, batter=0.04)
retaining_wall(F, [(-30, -40), (-30, -48)], ZL, -16.0, buttress='round', every=8.0, b_size=2.0,
               batter=0.0)         # gap at y -40..-32 where the west stair comes up
# wall feet on the ledges: irregular chunks overlapping the foot, seated on each band's top (the west stair foot is clear)
foot_rocks(F, [(-30, -48), (30, -48)], (-14.0, -12.0), seed=21, blocks=10, top_z=S_TOP)
foot_rocks(F, [(30, -48), (30, 32)], (-14.0, -12.0), seed=22, blocks=12, top_z=E_TOP)
foot_rocks(F, [(-30, 32), (-30, -32)], (-14.0, -12.0), seed=23, blocks=10, top_z=W_TOP)

# ---- two-storey arcaded hall against the upper wall (south), lean roof falling south
arcade(F, -20, -35.5, 20, -35.5, -8.0, 3.7, 7.0, 8, 'travertine', back='dark', impost_mat='travertine')
arcade(F, -20, -35.5, 20, -35.5, -4.3, 3.7, 7.0, 8, 'travertine', back='dark', impost_mat='travertine')
lean_roof(F, -20, -32, 20, -32, 0.3, 7.0, 0.9, 'tile')     # back edge on the coping, falling south

# ---- stairs: lower level -> main terrace along the east wall, hill foot -> lower level on the west
stair_flight(F, 25.0, -38.0, 24.6, -22.0, -8.0, 0.0, width=3.0)
solid(F, 22.0, -23.5, 24.6, -20.5, -8.5, 0.0, 'stone')            # landing at the gap in the parapet
stair_flight(F, -38.0, -52.0, -29.6, -36.0, -16.0, -8.0, width=3.0)

CLOSE = os.environ.get('MM_CLOSE')       # optional close-up check into a scratch folder; normal runs skip it
if CLOSE:
    close_up(os.path.join(CLOSE, 'wall_foot.png'), (-50.0, -14.0, 6.0), (-30.0, -2.0, -12.0))
else:
    finish('rome_magna_mater', front='-Y')
