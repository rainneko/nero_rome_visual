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
# (author's bug list 2026-11-13, 图七) The court's south front is the arcaded wall at y = -36 (the arcade is no longer a
# hall standing in front of it), and the grand stair comes up through its middle: the court is cut open over the stair
# (|x| < SX, y -36 .. YS). 【史】 the platform in front of the temple stood on arched substructures.
YF = -36.0                 # south face of the arcaded front wall (the court's south edge)
SW = 8.9                   # grand stair: tread width
SX = SW / 2 + 0.6          # its cheeks' outer faces (5.05)
YS = -28.0                 # the stair's head on the court
solid(F, -19.8, YS, 19.8, 29.8, -16.0, FILL, 'tuff')
for sx in (-1, 1):
    solid(F, sx * 19.8, -32.0, sx * (SX + 0.05), YS, -16.0, FILL, 'tuff')     # behind the arcade, beside the stair
floor_top(F, [(-22, YS), (22, YS), (22, 32), (-22, 32)], ZM, 'paving')
floor_top(F, [(-22, YF), (-SX - 0.05, YF), (-SX - 0.05, YS), (-22, YS)], ZM, 'paving')
floor_top(F, [(SX + 0.05, YF), (22, YF), (22, YS), (SX + 0.05, YS)], ZM, 'paving')
retaining_wall(F, [(-22, 32), (-22, YF)], 0.0, -16.0, mat='stone', buttress='square', every=10.0, coping=True, batter=0.04)
# east wall: plain where the side stair climbs against it (no buttress in its way), no parapet over its head
# (y -19.3 .. -16.3); the corner piers (2.8 m) at y -36 and -12 stay clear of the stair and its landing
retaining_wall(F, [(22, YF), (22, -12)], 0.0, -16.0, mat='stone', buttress=None, coping=True, batter=0.04, parapet=None)
retaining_wall(F, [(22, -12), (22, 32)], 0.0, -16.0, mat='stone', buttress='square', every=10.0, coping=True, batter=0.04, parapet=None)
balustrade(F, 21.7, YF + 0.3, 21.7, -19.3, 0.35, 1.05, 'marble', 2.2, 0.28)
balustrade(F, 21.7, -16.3, 21.7, 32.0, 0.35, 1.05, 'marble', 2.2, 0.28)
# north wall (toward the hilltop): only down to -2
retaining_wall(F, [(22, 32), (-22, 32)], 0.0, -2.0, mat='stone', buttress='square', every=10.0, coping=True, batter=0.04)
solid(F, -22.0, 29.8, 22.0, 32.0, -16.0, -2.0, 'tuff')     # solid under the north wall: no floating base

# ---- temple on the podium, stair to the south
T = podium_temple(F, 0, 10, W=17.5, L=33, pod_h=6, col_h=12, nf=6, kind='prostyle', porch=3,
                  order='corinthian', front='-Y', stair='front', stair_w=15.5, pod_mat='peperino',
                  cheek_statues=None, flutes=12)
lion(F, -8.25, -15.4, 6.0)
lion(F, 8.25, -15.4, 6.0)

# ---- forecourt for the games, altar and torches at the stair foot (stair foot at y = -17)
checker_paving(F, -20, YS + 0.6, 20, -17, z=0.05, tile=1.2)
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
# south wall: drawn here as retaining_wall(F, [(-30, -48), (30, -48)], ZL, -16.0, mat='stone', buttress='square',
# every=10.0, coping=True, batter=0.04) draws it (same body, string course, buttresses, corner piers), but open at its
# east end (x GX0 .. GX1): no coping and no balustrade there, a capped pier each side, a threshold slab flush with
# the floor running out to y -48.6, the head of the stair the scene builds down the hill from here, and no buttress
# under it (the one at x 25 is left out; the other five stay)
GX0, GX1 = 23.0, 27.0


def south_wall():
    S = F.sub(-30.0, -48.0, 0.0, 0.0); L, t, zt, zb, b = 60.0, 2.2, ZL, -16.0, 1.8
    H = zt - zb; bb = 0.04 * H; g0, g1 = GX0 + 30.0, GX1 + 30.0         # the opening in the wall's own x (0 .. L)
    v = [S.p(0, 0, zb), S.p(L, 0, zb), S.p(L, t, zb), S.p(0, t, zb),
         S.p(0, bb, zt), S.p(L, bb, zt), S.p(L, t, zt), S.p(0, t, zt)]
    add_mesh('stone', v, [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])
    box(S, L / 2, 0.04 * 4.0 - 0.08, zb + 4.0, L, 0.3, 0.28, 'travertine')         # string course (z -12)
    cy, cd = bb + t / 2 - 0.2, t + 0.4 - bb                                        # coping, either side of the opening
    box(S, (g0 - 0.1) / 2, cy, zt - 0.05, g0 + 0.1, cd, 0.4, 'rock2')
    box(S, (g1 + L + 0.1) / 2, cy, zt - 0.05, L + 0.1 - g1, cd, 0.4, 'rock2')
    for j in range(5):                                                             # square buttresses every 10 m, but
        u = (j + 0.5) * 10.0                                                       # none at x 25: the stair goes down there
        box(S, u, -b / 2 + 0.3, zb, b * 1.1, b + 0.6, H - 0.4, 'stone')
        box(S, u, -b / 2 + 0.3, zt - 0.45, b * 1.1 + 0.3, b + 0.9, 0.35, 'rock2')
    for x in (-30.0, 30.0):                                                        # corner piers
        box(F, x, -48.0, zb, t + 0.6, t + 0.6, H + 0.35, 'stone')
    zp, yb, pw = zt + 0.35, bb + 0.3, 0.9                                          # on the coping (top z -7.63)
    balustrade(S, 0.0, yb, g0 - pw, yb, zp, 1.05, 'marble', 2.2, 0.28)
    balustrade(S, g1 + pw, yb, L, yb, zp, 1.05, 'marble', 2.2, 0.28)
    for u in (g0 - pw / 2, g1 + pw / 2):                                           # the piers: 0.9 m, capped
        box(S, u, yb, zp, pw, pw, 1.15, 'travertine')
        box(S, u, yb, zp + 1.15, pw + 0.16, pw + 0.16, 0.14, 'travertine')
    box(S, (g0 + g1) / 2, (cy + cd / 2 - 0.6) / 2, -8.3, g1 - g0, cy + cd / 2 + 0.6, zt + 0.012 + 8.3,
        'paving')                                                                  # threshold, y -48.6 .. coping's back


south_wall()
retaining_wall(F, [(30, -48), (30, 32)], ZL, -16.0, mat='stone', buttress='square', every=10.0, coping=True, batter=0.04)
retaining_wall(F, [(-30, 32), (-30, -32)], ZL, -16.0, mat='stone', buttress='square', every=10.0, coping=True, batter=0.04)
retaining_wall(F, [(-30, -40), (-30, -48)], ZL, -16.0, buttress='square', every=8.0, b_size=2.0,
               batter=0.0)         # gap at y -40..-32 where the west stair comes up
# wall feet on the ledges: irregular chunks overlapping the foot, seated on each band's top (the west stair foot is clear)
foot_rocks(F, [(-30, -48), (30, -48)], (-14.0, -12.0), seed=21, blocks=10, top_z=S_TOP)
foot_rocks(F, [(30, -48), (30, 32)], (-14.0, -12.0), seed=22, blocks=12, top_z=E_TOP)
foot_rocks(F, [(-30, 32), (-30, -32)], (-14.0, -12.0), seed=23, blocks=10, top_z=W_TOP)

# ---- the court's south front: two storeys of arches set in the wall (y -36 .. -32), dark rooms 4 m deep behind them,
# the court's paving and a balustrade on top, no roof. Three bays a side; the two arches next to the stair are
# passages (open to a doorway at the back), the others dark rooms.
AY = (YF - 32.0) / 2       # wall centre line (y -34), 4 m thick
for sx in (-1, 1):
    xo, xm, xi = sx * 19.8, sx * 9.95, sx * (SX + 0.05)     # outer end, between bays 2 and 3, inner end at the stair
    a, b = (xo, xm) if sx < 0 else (xm, xo)
    arcade(F, a, AY, b, AY, -8.0, 3.7, 4.0, 2, 'travertine', back='dark', impost_mat='travertine')
    a, b = (xm, xi) if sx < 0 else (xi, xm)
    arcade(F, a, AY, b, AY, -8.0, 3.7, 4.0, 1, 'travertine', back=None, impost_mat='travertine')   # the passage
    xc = (xm + xi) / 2
    door = [F.p(xc - 0.8, -32.03, ZL + 0.02), F.p(xc + 0.8, -32.03, ZL + 0.02), F.p(xc + 0.8, -32.03, ZL + 2.7),
            F.p(xc - 0.8, -32.03, ZL + 2.7)]
    add_poly('dark', door)
    add_poly('dark', list(reversed(door)))                 # its doorway into the substructures
    a, b = (xo, xi) if sx < 0 else (xi, xo)
    arcade(F, a, AY, b, AY, -4.3, 3.7, 4.0, 3, 'travertine', back='dark', impost_mat='travertine')
    box(F, (xo + xi) / 2, AY - 0.1, -0.6, abs(xo - xi), 4.2, 0.6, 'travertine')    # cornice slab under the paving
    balustrade(F, sx * 21.3, YF + 0.3, sx * (SX + 0.35), YF + 0.3, ZM, 1.05, 'marble', 2.2, 0.28)   # court front
    balustrade(F, sx * (SX + 0.35), YF + 0.3, sx * (SX + 0.35), YS - 0.4, ZM, 1.05, 'marble', 2.2, 0.28)  # stair well

# ---- grand stair (8.9 m between its cheeks) on the axis, lower level (z -8) -> landing (z -4) in the arcade's middle ->
# the court (z 0), facing the altar and the temple door. 【史】 at the Megalesia the plays were given before the temple
# and the audience sat on its steps.
stair_flight(F, 0.0, YF - 6.0, 0.0, YF, -8.0, -4.0, width=SW, mat='travertine', cheek_mat='stone')
solid(F, -SX, YF, SX, YF + 2.0, -16.0, -4.0, 'travertine')                     # landing
for sx in (-1, 1):
    box(F, sx * (SW / 2 + 0.3), YF + 1.0, -4.0, 0.6, 2.0, 0.9, 'stone')         # its cheeks
stair_flight(F, 0.0, YF + 2.0, 0.0, YS, -4.0, 0.0, width=SW, mat='travertine', cheek_mat='stone')
solid(F, -SW / 2, YF + 2.0, SW / 2, YS, -16.0, -4.5, 'tuff')                     # solid under the upper flight

# ---- side stair: lower level -> court, 3 m wide, climbing against the east wall (the wall on its inner side, a
# full-height wall with a coping on its outer side), a landing at its head where the parapet is open
stair_flight(F, 23.6, -34.3, 23.6, -19.3, -8.0, 0.0, width=3.0, mat='stone', cheek_mat='stone')
beam(F, 25.4, -34.3, ZL + 0.95, 25.4, -19.3, 0.95, 0.75, 0.14, 'travertine')    # coping on the outer wall
solid(F, 22.0, -19.3, 25.7, -16.3, -8.5, 0.0, 'stone')                           # head landing, open to the court
box(F, 25.4, -17.8, 0.0, 0.6, 3.0, 1.0, 'stone')                                 # its parapets
box(F, 23.85, -16.6, 0.0, 3.7, 0.6, 1.0, 'stone')
# hill foot -> lower level on the west, on its old line: three flights (13, 13, 14 risers) with a 1.5 m landing between
# them (a landing at least every 15 steps), solid down to the old stair's underside (z -16.5) all along. Not lower: the
# lowest point of each 4 m cell is what tools/pal_rock.mjs shapes the hill to, and below this the scene builds the base
# down to its own ground (33-35 m there) and carries the stair on from the foot to the viewing terrace (palMMLinks)
def west_stair():
    xa, ya, xb, yb, za, zb, w = -38.0, -52.0, -29.6, -36.0, -16.0, -8.0, 3.0
    L = math.hypot(xb - xa, yb - ya); ux, uy = (xb - xa) / L, (yb - ya) / L; rot = math.atan2(uy, ux) / D2R
    run = (L - 3.0) / 40.0; S = F.sub(xa, ya, 0, rot); wo = w + 1.2              # wo: out to the cheeks' outer faces
    P = lambda s: (xa + ux * s, ya + uy * s)
    s, z = 0.0, za
    for k, n in enumerate((13, 13, 14)):
        s1, z1 = s + n * run, z + n * 0.2
        stair_flight(F, *P(s), *P(s1), z, z1, width=w, mat='stone', cheek_mat='stone')
        box(S, (s + s1) / 2, 0, za - 0.5, s1 - s + 0.02, wo, z - za + 0.02, 'stone')    # under the flight, to the old underside
        s, z = s1, z1
        if k < 2:                                                                      # landing, its cheeks
            box(S, s + 0.75, 0, za - 0.5, 1.52, wo, z - za + 0.5, 'stone')
            for sd in (-1, 1):
                box(S, s + 0.75, sd * (w / 2 + 0.3), z, 1.52, 0.6, 0.9, 'stone')
            s += 1.5
west_stair()

CLOSE = os.environ.get('MM_CLOSE')       # optional close-up check into a scratch folder; normal runs skip it
if CLOSE:
    close_up(os.path.join(CLOSE, 'wall_foot.png'), (-50.0, -14.0, 6.0), (-30.0, -2.0, -12.0))
    close_up(os.path.join(CLOSE, 'front.png'), (-14.0, -82.0, 10.0), (0.0, -34.0, -3.0))     # the arcaded front, grand stair
    close_up(os.path.join(CLOSE, 'side_stair.png'), (52.0, -60.0, 12.0), (20.0, -28.0, -3.0))
    close_up(os.path.join(CLOSE, 'west_stair.png'), (-64.0, -72.0, 4.0), (-33.0, -44.0, -13.0))
else:
    finish('rome_magna_mater', front='-Y')
