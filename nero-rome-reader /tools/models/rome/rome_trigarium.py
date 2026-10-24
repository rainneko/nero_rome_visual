"""rome_trigarium · the public practice track (Trigarium, Campus Martius, AD 56).

Run from the project root (the folder name ends with a space, so quote it):
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_trigarium.py"
Frame: origin = centre of the track, z = 0 = track level, long axis along X (rounded end at +X), front = -Y (stand).
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                      # noqa: F401,F403  (bl_kit parts + Rome parts)
import bl_kit as bk
import bpy
from mathutils import Vector

reset()
F = Frame()
try:                                                              # low samples: previews only, machine is loaded
    bpy.context.scene.eevee.taa_render_samples = 4
except Exception:
    pass


# ---------------------------------------------------------------- helpers for the track wall
def _rn(p, q):
    """Right-hand normal of p -> q: the outside of a counter-clockwise track."""
    dx, dy = q[0] - p[0], q[1] - p[1]
    L = math.hypot(dx, dy)
    return Vector((dy / L, -dx / L, 0.0))


def _quad(mat, a, b, c, d, want, smooth=False):
    """Planar quad a-b-c-d, wound so that its normal points along `want`."""
    if (b - a).cross(c - a).dot(want) < 0:
        a, b, c, d = d, c, b, a
    add_poly(mat, [a, b, c, d], smooth)


def wall_band(pts, s0, s1, z0, z1, mat, smooth=False):
    """A wall band along the open polyline pts (counter-clockwise track: outside = right of each segment).
    Faces lie between the offsets s0 (inside) and s1 (outside) and between z0 and z1; both ends are closed."""
    n = len(pts)
    seg = [_rn(pts[i], pts[i + 1]) for i in range(n - 1)]
    tan = [Vector((pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1], 0.0)).normalized() for i in range(n - 1)]
    mv = [seg[0]]
    for i in range(1, n - 1):
        a, b = seg[i - 1], seg[i]
        mv.append((a + b) / (1.0 + a.dot(b)))         # mitred offset direction at a corner
    mv.append(seg[-1])

    def at(i, s, z):
        return Vector((pts[i][0] + mv[i].x * s, pts[i][1] + mv[i].y * s, z))

    up = Vector((0.0, 0.0, 1.0))
    for i in range(n - 1):
        _quad(mat, at(i, s1, z0), at(i + 1, s1, z0), at(i + 1, s1, z1), at(i, s1, z1), seg[i], smooth)
        _quad(mat, at(i, s0, z0), at(i + 1, s0, z0), at(i + 1, s0, z1), at(i, s0, z1), -seg[i], smooth)
        _quad(mat, at(i, s0, z1), at(i + 1, s0, z1), at(i + 1, s1, z1), at(i, s1, z1), up, smooth)
    _quad(mat, at(0, s0, z0), at(0, s1, z0), at(0, s1, z1), at(0, s0, z1), -tan[0], smooth)
    k = n - 1
    _quad(mat, at(k, s0, z0), at(k, s1, z0), at(k, s1, z1), at(k, s0, z1), tan[-1], smooth)


# ---------------------------------------------------------------- track wall: 1.6 m stone, tile coping, gate gaps
ARC = [(110.0 + 40.0 * math.cos(-math.pi / 2 + math.pi * k / 24),
        40.0 * math.sin(-math.pi / 2 + math.pi * k / 24)) for k in range(25)]     # rounded east end, r 40 about (110, 0)
PIECES = [
    [(-150.0, -21.0), (-150.0, -40.0), (72.0, -40.0)],           # south-west (gate gap at x 72..80)
    [(80.0, -40.0)] + ARC + [(-8.0, 40.0)],                      # south-east, rounded end, north side (gap -16..-8)
    [(-16.0, 40.0), (-150.0, 40.0), (-150.0, 21.0)],             # north-west
]
for pts in PIECES:
    sm = len(pts) > 4
    wall_band(pts, 0.0, 1.2, -0.6, 1.45, 'stone', sm)            # wall body, sunk 0.6 m below track level
    wall_band(pts, -0.15, 1.35, 1.45, 1.6, 'tile', sm)           # tile coping
for (x, y) in ((72.0, -40.6), (80.0, -40.6), (-8.0, 40.6), (-16.0, 40.6)):
    box(F, x, y, 0.0, 2.4, 2.4, 2.3, 'stone')                    # gate piers
    box(F, x, y, 2.3, 2.8, 2.8, 0.25, 'marble')

# ---------------------------------------------------------------- main stand on the -Y side, x -60 .. 60
# The arcades run westward, so their outside (right of the line) is +Y: the track side.
arcade(F, 60.0, -46.0, -60.0, -46.0, 0.0, 4.6, 6.0, 30, 'stone', open_w=2.4, open_h=3.4, back='dark',
       impost_mat='marble')                                      # lower arcade, 4.6 m: 30 dark arches
box(F, 0.0, -46.0, -1.0, 122.0, 6.4, 1.0, 'tuff')                 # foundation
band(F, 60.0, -43.0, -60.0, -43.0, 4.4, 0.22, 0.4, 'red')         # red string course
box(F, 0.0, -46.0, 4.6, 122.0, 6.0, 0.1, 'paving')                # gallery floor
box(F, 0.0, -42.2, 0.0, 122.0, 1.6, 0.1, 'paving')                # walkway along the track wall
box(F, 0.0, -48.4, 4.6, 122.0, 0.6, 1.1, 'plaster')               # low back parapet of the gallery (benches sit on it)
box(F, 0.0, -48.4, 5.7, 122.0, 0.7, 0.12, 'stone')                # its coping
for x in range(-60, 61, 4):
    box(F, float(x), -48.4, 4.6, 0.3, 0.3, 4.4, 'wood')           # rear posts of the open gallery, up to 9 m
beam(F, -61.0, -48.4, 8.8, 61.0, -48.4, 8.8, 0.25, 0.2, 'wood')   # rear beam carrying the roof edge
lean_roof(F, 61.0, -48.4, -61.0, -48.4, 9.0, 5.2, 1.6)           # tiled lean-to roof on posts, eaves at 7.4 m
for x in range(-60, 61, 4):
    box(F, float(x), -43.5, 4.6, 0.3, 0.3, 2.8, 'wood')           # posts carrying the roof
for yb in (-45.0, -47.0):                                         # two rows of wooden benches
    box(F, 0.0, yb, 5.0, 120.0, 0.6, 0.1, 'wood')
    for x in range(-60, 61, 4):
        box(F, float(x), yb, 4.6, 0.14, 0.4, 0.4, 'wood')
beam(F, -61.0, -43.6, 5.0, 61.0, -43.6, 5.0, 0.12, 0.12, 'wood')   # wooden railing, middle rail
beam(F, -61.0, -43.6, 5.6, 61.0, -43.6, 5.6, 0.12, 0.12, 'wood')   # wooden railing, top rail
beam(F, -61.0, -43.5, 7.3, 61.0, -43.5, 7.3, 0.2, 0.25, 'wood')    # eave beam on the posts

# ---------------------------------------------------------------- starting building, west end (-X)
# Six stalls with wooden gates open east onto the track; a square tower with the judge's gallery at the NW corner.
SKIN = -149.99                                                   # outer face of the stall wall (track edge)
box(F, -156.8, 0.0, -1.0, 12.4, 44.0, 7.0, 'stone')               # core: x -163 .. -150.6, y -22 .. 22, z -1 .. 6
stalls = [-15.0 + 6.0 * i for i in range(6)]                      # stall centres along y, 6 m apart
opening_skin(F, -150.6, -22.0, -150.6, 22.0, 0.0, 6.0, [(yc + 22.0, 0.0, 3.6, 4.2, 'rect') for yc in stalls],
             'stone', depth=0.6)
for yc in stalls:
    box(F, -150.25, yc, 0.0, 0.14, 3.2, 3.9, 'wood')              # wooden gate leaves
band(F, SKIN, -22.0, SKIN, 22.0, 4.9, 0.25, 0.4, 'red')
cornice(F, SKIN, -22.0, SKIN, 22.0, 5.5, 0.6, 0.6, 'marble')
hip_roof(F, -156.8, 0.0, 6.0, 12.4, 44.0, 22.0, 0.8)
square_tower(F, -158.5, 18.0, 8.0, 11.29, wall_mat='stone', roof='pyramid', pitch=30.0, slit_rows=4,
             foundation=1.0, top_loggia=True, cornice_mat='marble', band_mat='red')   # eaves 11.3 m, apex about 14 m

# ---------------------------------------------------------------- stable sheds, well hut, hitching posts (west, outside)
for sy in (-14.0, 8.0):
    rect_building(F, -176.0, sy, 10.0, 7.0, floors=1, floor_h=3.6, ground_h=3.6, wall_mat='plaster', base_mat='stone',
                  bay=3.4, win_w=1.0, win_h=1.5, roof='hip', pitch=24.0, band_mat=None, cornice_mat='stone',
                  quoins=False, foundation=1.0, doors=(('E', 0.0),))
cyl(F, -170.0, -30.0, 0.0, 1.0, 1.0, 'stone', 14)                 # well ring
cyl(F, -170.0, -30.0, 1.0, 0.72, 0.03, 'dark', 14)                # dark mouth of the well
for sx in (-1, 1):
    for sy in (-1, 1):
        box(F, -170.0 + 1.5 * sx, -30.0 + 1.5 * sy, 0.0, 0.2, 0.2, 2.6, 'wood')
hip_roof(F, -170.0, -30.0, 2.6, 3.6, 3.6, 25.0, 0.5)              # well hut roof
for y in range(-20, 21, 5):
    box(F, -186.0, float(y), 0.0, 0.16, 0.16, 1.3, 'wood')        # hitching posts
beam(F, -186.0, -20.0, 1.15, -186.0, 20.0, 1.15, 0.1, 0.1, 'wood')   # hitching rail

# ---------------------------------------------------------------- central barrier, columns with statues, turning posts
box(F, 0.0, 0.0, 0.0, 160.0, 4.0, 1.0, 'stone')                   # barrier, x -80 .. 80
for x in (-60.0, -20.0, 20.0, 60.0):
    column(F, x, 0.0, 1.0, 5.0, 0.36, 'marble', 'doric')          # columns on the barrier
    statue(F, x, 0.0, 6.0, 2.3, 'bronze', pedestal=0.0)           # bronze statues on top
for x in (-80.0, 80.0):
    box(F, x, 0.0, 0.0, 3.4, 3.4, 1.3, 'stone')                   # turning-post bases
    cone_roof(F, x, 0.0, 1.3, 1.5, 8.0, 'stone', 16, tiles=False, finial=None)   # stone cones, not gilded

human(F, 0.0, -24.0, 0.0)                                         # 1.8 m scale figure, previews only

finish('rome_trigarium', front='-Y')

# ---------------------------------------------------------------- close-ups (same scene and lights as the previews)
sc = bpy.context.scene
cam = sc.camera
cam.data.type = 'PERSP'


def _closeup(name, loc, target, lens=35.0):
    cam.data.lens = lens
    cam.location = Vector(loc)
    bk._look(cam, Vector(target))
    sc.render.filepath = os.path.join(bk.ROOT, 'renders', 'rome_trigarium', name + '.png')
    bpy.ops.render.render(write_still=True)


_closeup('close_start', (-100.0, -4.0, 3.5), (-152.0, 0.0, 3.0))
_closeup('close_stand', (0.0, 20.0, 16.0), (0.0, -46.0, 5.0), 20.0)
_closeup('close_barrier', (-44.0, -16.0, 3.0), (0.0, 0.0, 3.0), 30.0)
_closeup('close_west', (-200.0, -55.0, 12.0), (-168.0, -8.0, 4.0), 30.0)
