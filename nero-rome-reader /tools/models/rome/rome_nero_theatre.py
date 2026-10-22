import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
from mathutils import Vector
import bpy

# Private theatre of Nero on the Vatican circus: cavea on +Y (opens toward -Y), orchestra at y 0..6,
# stage building (scaenae frons) on -Y with its coloured front facing the cavea, colonnade east (+X) of the
# stage, treasure room at the far east end. Origin = centre of the stage axis, z = 0 = ground.
reset()
F = Frame()
preview_ground(0)

ARC = 24


def arc(R, a0, a1, n):
    return [(R * math.cos(a0 + (a1 - a0) * i / n), R * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]


# ---------------------------------------------------------------- cavea: 12 stepped marble rows, radius 6..22
for i in range(12):
    r_in = 6.0 + i * 16.0 / 12.0
    pts = arc(22.0, 0.0, math.pi, ARC) + arc(r_in, math.pi, 0.0, ARC)
    prism(F, pts, 0.0, 0.5 * (i + 1), 'marble')

# outer curved wall (radius 22..24) as six chords, each with two blind arches on the outside
for k in range(6):
    a0 = math.pi * k / 6; a1 = math.pi * (k + 1) / 6
    arcade(F, 23 * math.cos(a0), 23 * math.sin(a0), 23 * math.cos(a1), 23 * math.sin(a1), 0.0, 7.0, 2.0, 2,
           'brick', open_w=3.0, open_h=5.2, back='dark', impost_mat='stone')

# orchestra: half disc radius 6 in two colours
for k in range(ARC):
    a0 = math.pi * k / ARC; a1 = math.pi * (k + 1) / ARC
    add_poly('giallo' if k % 2 == 0 else 'porphyry',
             [F.p(0, 0, 0.02), F.p(6 * math.cos(a0), 6 * math.sin(a0), 0.02), F.p(6 * math.cos(a1), 6 * math.sin(a1), 0.02)])

# ---------------------------------------------------------------- stage: platform, scaenae frons, tile roof
box(F, 0, -2.0, 0, 26.0, 4.0, 1.2, 'marble')                       # pulpitum, y -4..0
box(F, 0, -6.3, 0, 30.0, 5.4, 9.5, 'plaster')                      # frons core, y -9..-3.6, to z 9.5
# front face toward the cavea (+Y): three stage doors, two storeys of columns, niches in the upper storey
opening_skin(F, 15.0, -3.64, -15.0, -3.64, 1.2, 8.3,
             [(15.0, 0.0, 4.0, 4.2, 'rect'), (6.0, 0.0, 2.6, 4.2, 'rect'), (24.0, 0.0, 2.6, 4.2, 'rect'),
              (6.0, 5.6, 2.0, 2.0, 'arch'), (15.0, 5.6, 2.0, 2.0, 'arch'), (24.0, 5.6, 2.0, 2.0, 'arch')],
             'plaster', depth=0.35)
box(F, 0, -3.4, 1.2, 30.0, 0.5, 0.25, 'porphyry')                 # dado band at the platform
for x in (-14.0, -11.2, -6.8, -3.0, 3.0, 6.8, 11.2, 14.0):
    column(F, x, -3.4, 1.2, 4.4, 0.3, 'porphyry', 'corinthian', 0, 12, True, 'giallo')
    column(F, x, -3.4, 6.4, 2.4, 0.2, 'giallo', 'ionic', 0, 12)
entablature(F, -15.0, -3.4, 15.0, -3.4, 5.6, 0.8, 0.9, 'marble', 'porphyry')
entablature(F, -15.0, -3.4, 15.0, -3.4, 8.8, 0.7, 0.9, 'marble', 'giallo')
for sx in (-5.0, 5.0, -12.5, 12.5):                                  # statues on the platform
    statue(F, sx, -1.4, 1.2, 2.2, 'marble', 0.8, 0.0, 'marble')
for nx in (-9.0, 0.0, 9.0):                                          # statues standing in the upper niches
    statue(F, nx, -3.4, 6.4, 1.6, 'marble', 0.4, 0.0, 'marble')
# back (-Y) face of the stage, seen from the track: rear doors, giallo pilasters, red band, cornice
opening_skin(F, -15.0, -9.0, 15.0, -9.0, 0.0, 9.5,
             [(9.0, 0.0, 2.6, 4.0, 'rect'), (21.0, 0.0, 2.6, 4.0, 'rect')], 'plaster', depth=0.35)
for px in (-13.0, -3.0, 3.0, 13.0):
    box(F, px, -9.3, 0.0, 0.7, 0.5, 9.5, 'giallo')
box(F, 0, -9.25, 2.0, 30.0, 0.3, 0.6, 'red')
cornice(F, -15.0, -9.0, 15.0, -9.0, 8.9, 0.6, 0.6, 'marble')
gable_roof(F, 0, -6.3, 9.5, 30.0, 6.0, pitch=18.0, axis='x', overhang=0.6, mat='tile', gable_mat='plaster')

# ---------------------------------------------------------------- colonnade: x 17..75, y -9 (open) .. -3.5 (back wall)
box(F, 46.2, -6.25, 0, 58.4, 5.5, 0.4, 'paving')                   # portico floor, top z 0.4
wall(F, 17.0, -3.5, 75.0, -3.5, 0.0, 7.6, 0.8, 'stone')            # solid back wall
for k in range(17):                                                 # painted panels on the portico face
    xc = 17.0 + 3.4 * (k + 0.5)
    box(F, xc, -3.05, 1.4, 2.4, 0.1, 2.8, 'red' if k % 2 == 0 else 'giallo')
box(F, 46.0, -3.05, 0.6, 58.0, 0.1, 0.35, 'red')
box(F, 46.0, -3.05, 5.2, 58.0, 0.1, 0.35, 'giallo')
for k in range(18):                                                 # Corinthian columns, 5 m, every 3.4 m
    column(F, 17.0 + 3.4 * k, -9.0, 0.4, 5.0, None, 'marble', 'corinthian', 0, 12)
entablature(F, 17.0, -9.0, 75.0, -9.0, 5.4, 0.9, 0.9, 'marble')
lean_roof(F, 17.0, -3.5, 75.0, -3.5, 7.6, 6.0, 1.0, 'tile')
for k in (2, 6, 10, 14):                                            # statues between columns
    statue(F, 17.0 + 3.4 * k + 1.7, -9.0, 0.4, 2.0, 'marble', 0.9, 0.0, 'marble')

# euripus: long water channel in front of the portico, top 0.12 above ground
box(F, 46.0, -12.6, -0.3, 58.0, 2.2, 0.42, 'water')
box(F, 46.0, -11.275, 0, 58.9, 0.45, 0.35, 'marble')
box(F, 46.0, -13.825, 0, 58.9, 0.45, 0.35, 'marble')
box(F, 16.775, -12.6, 0, 0.45, 2.2, 0.35, 'marble')
box(F, 75.225, -12.6, 0, 0.45, 2.2, 0.35, 'marble')
# two fountains with a statue each
for fx in (30.0, 62.0):
    cyl(F, fx, -17.0, -0.3, 1.8, 0.42, 'water', 28)
    lathe(F, fx, -17.0, [(2.3, 0.0), (2.3, 0.4), (1.8, 0.4), (1.8, 0.0)], 'marble', 28, smooth=False)
    statue(F, fx, -17.0, -0.3, 2.4, 'marble', 1.0, 0.0, 'marble')


# ---------------------------------------------------------------- treasure room parts (静室)
def panel(cx, cy, z0, w, h, plane):
    """A red panel with a thin giallo frame. plane 'xz': wall parallel to x, panel at y = cy; 'yz': at x = cx."""
    fd = 0.08
    if plane == 'xz':
        box(F, cx, cy, z0, w, 0.06, h, 'red')
        box(F, cx, cy, z0 - 0.06, w + 0.24, fd, 0.12, 'giallo')
        box(F, cx, cy, z0 + h - 0.06, w + 0.24, fd, 0.12, 'giallo')
        box(F, cx - w / 2 - 0.06, cy, z0, 0.12, fd, h, 'giallo')
        box(F, cx + w / 2 + 0.06, cy, z0, 0.12, fd, h, 'giallo')
    else:
        box(F, cx, cy, z0, 0.06, w, h, 'red')
        box(F, cx, cy, z0 - 0.06, fd, w + 0.24, 0.12, 'giallo')
        box(F, cx, cy, z0 + h - 0.06, fd, w + 0.24, 0.12, 'giallo')
        box(F, cx, cy - w / 2 - 0.06, z0, fd, 0.12, h, 'giallo')
        box(F, cx, cy + w / 2 + 0.06, z0, fd, 0.12, h, 'giallo')


def drape(cx, cy, z0, z1, rt, rb, mat, n=20, levels=8):
    """Purple cloth around a pedestal: a skirt from radius rt at z1 flaring to rb at z0, with pleats (alternating
    radii, deeper near the floor) and a closed top."""
    T = Frame()
    rings = []
    for j in range(levels + 1):
        t = j / levels                                       # 0 = floor, 1 = top
        z = z0 + (z1 - z0) * t
        r = rt + (rb - rt) * (1 - t) ** 2                    # concave flare toward the floor
        ring = []
        for i in range(n):
            a = TAU * i / n
            pleat = 0.07 * (1 if i % 2 == 0 else -1) * (0.4 + 0.6 * (1 - t))
            rr = r * (1 + pleat)
            ring.append(T.p(cx + rr * math.cos(a), cy + rr * math.sin(a), z))
        rings.append(ring)
    for j in range(levels):
        A, B = rings[j], rings[j + 1]
        for i in range(n):
            k = (i + 1) % n
            add_poly(mat, [A[i], A[k], B[k], B[i]])
    top = rings[-1]; c = T.p(cx, cy, z1)
    for i in range(n):
        add_poly(mat, [c, top[i], top[(i + 1) % n]])


def tripod(x, y):
    """Thin bronze incense tripod: stem, three thin legs, shallow bowl, a small flame and one tapering smoke wisp."""
    cyl(F, x, y, 0.4, 0.03, 1.1, 'bronze', 8)                                             # stem up to z 1.5
    for a in (0.0, 120.0, 240.0):
        ar = math.radians(a)
        beam(F, x, y, 1.45, x + 0.42 * math.cos(ar), y + 0.42 * math.sin(ar), 0.4, 0.035, 0.035, 'bronze')
    lathe(F, x, y, [(0.01, 1.5), (0.10, 1.5), (0.20, 1.52), (0.22, 1.58), (0.19, 1.58), (0.10, 1.55), (0.01, 1.55)],
          'bronze', 14)                                                                     # shallow bowl
    cyl(F, x, y, 1.58, 0.08, 0.25, 'flame', 8, r_top=0.0)                                 # small flame to z 1.83
    for k, (dx, r0, r1) in enumerate(((0.0, 0.03, 0.02), (0.03, 0.02, 0.012), (0.05, 0.012, 0.007),
                                      (0.06, 0.007, 0.003))):
        cyl(F, x + dx, y, 1.85 + 0.3 * k, r0, 0.3, 'linen', 6, r_top=r1)                 # one thin tapering wisp


# ---------------------------------------------------------------- treasure room: 8 x 8 m, open front to the west
RX, RY = 79.4, -6.5
box(F, RX, RY, 0, 8.0, 8.0, 0.34, 'marble')                         # floor base, top 0.34
checker_paving(F, 76.0, -9.9, 82.8, -3.1, 0.4, tile=0.5, mats=('marble', 'basalt'), border=0.3,
               border_mats=('basalt', 'marble'), thick=0.4)         # black-and-white mosaic floor, top 0.4
# walls: red, marble base moulding and cornice outside, porphyry dado inside
box(F, RX, -10.2, 0.4, 8.0, 0.6, 5.6, 'red')                        # south wall (inner face y -9.9)
box(F, RX, -2.8, 0.4, 8.0, 0.6, 5.6, 'red')                         # north wall (inner face y -3.1)
box(F, 83.1, RY, 0.4, 0.6, 8.0, 5.6, 'red')                         # east wall (inner face x 82.8)
box(F, RX, -10.75, 0.4, 8.6, 0.5, 0.45, 'marble')                   # base moulding, outside
box(F, RX, -2.25, 0.4, 8.6, 0.5, 0.45, 'marble')
box(F, 83.75, RY, 0.4, 0.5, 8.6, 0.45, 'marble')
box(F, RX, -10.75, 5.9, 8.6, 0.5, 0.35, 'marble')                   # cornice, outside
box(F, RX, -2.25, 5.9, 8.6, 0.5, 0.35, 'marble')
box(F, 83.75, RY, 5.9, 0.5, 8.6, 0.35, 'marble')
box(F, RX, -9.85, 0.4, 8.0, 0.1, 1.5, 'porphyry')                   # porphyry dado inside
box(F, RX, -3.15, 0.4, 8.0, 0.1, 1.5, 'porphyry')
box(F, 82.75, RY, 0.4, 0.1, 8.0, 1.5, 'porphyry')
panel(77.4, -9.87, 2.1, 2.4, 2.6, 'xz')                             # red panels with giallo frames
panel(81.4, -9.87, 2.1, 2.4, 2.6, 'xz')
panel(77.4, -3.13, 2.1, 2.4, 2.6, 'xz')
panel(81.4, -3.13, 2.1, 2.4, 2.6, 'xz')
panel(82.74, RY, 2.1, 3.0, 2.6, 'yz')
# front toward the colonnade: marble threshold, two antae, two columns in antis, entablature, small pediment
box(F, 75.25, RY, 0.4, 0.5, 5.6, 0.45, 'marble')
box(F, 75.5, -9.9, 0.4, 1.0, 1.2, 4.6, 'marble')                     # antae
box(F, 75.5, -3.1, 0.4, 1.0, 1.2, 4.6, 'marble')
column(F, 75.3, -9.0, 0.4, 4.6, None, 'marble', 'corinthian', 0, 12)  # columns in antis, with capitals
column(F, 75.3, -4.0, 0.4, 4.6, None, 'marble', 'corinthian', 0, 12)
entablature(F, 75.5, -10.5, 75.5, -2.5, 5.0, 1.0, 1.0, 'marble', 'giallo')
gable_roof(F, RX, RY, 6.0, 8.0, 8.0, pitch=22.0, axis='x', overhang=0.5, mat='tile', gable_mat='marble',
           pediment=True, tymp_mat='marble')
# furnishings
drape(RX, RY, 0.4, 1.6, 0.36, 0.6, 'flowerP')                        # purple cloth, 1.2 m, flares to the floor
# gold dish on the pedestal, with the small murrhine cup (pale, faint violet/amber) on a tiny foot
lathe(F, RX, RY, [(0.01, 1.6), (0.20, 1.6), (0.23, 1.64), (0.20, 1.66), (0.01, 1.66)], 'gold', 24, smooth=True)
cyl(F, RX, RY, 1.66, 0.035, 0.03, 'linen', 10)                       # foot of the cup
lathe(F, RX, RY, [(0.01, 1.69), (0.03, 1.69), (0.05, 1.70), (0.10, 1.725), (0.12, 1.74), (0.12, 1.745),
                  (0.10, 1.75), (0.07, 1.735), (0.01, 1.73)], 'linen', 20, smooth=True)   # shallow wide bowl
for (tx, ty) in ((77.6, -9.4), (77.6, -3.6), (80.8, -9.4), (80.8, -3.6)):   # four tripods, clear of the columns
    tripod(tx, ty)
beam(F, RX, RY, 7.0, RX, RY, 4.4, 0.04, 0.04, 'bronze')               # small hanging bronze lamp
lathe(F, RX, RY, [(0.01, 4.05), (0.06, 4.05), (0.14, 4.15), (0.16, 4.30), (0.10, 4.45), (0.01, 4.45)], 'bronze', 12)
cyl(F, RX, RY, 4.45, 0.05, 0.25, 'flame', 8, r_top=0.0)

human(F, -30.0, -20.0, 0.0)
bpy.context.scene.eevee.taa_render_samples = 8          # low-sample previews (shared Mac)
finish('rome_nero_theatre', front='-Y',
       extra_cams=[('stage', Vector((0.0, 1.0, 0.0)), 14), ('east', Vector((1.0, -0.6, 0.0)), 14),
                   ('high', Vector((0.0, -1.0, 0.0)), 28)])

# ---------------------------------------------------------------- treasure room close-ups (same scene, after export)
_OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'renders', 'rome_nero_theatre')


def _shot(name, eye, target, lens=35.0):
    sc = bpy.context.scene
    cam = bpy.data.objects.new(name, bpy.data.cameras.new(name))
    sc.collection.objects.link(cam)
    cam.data.lens = lens; cam.data.clip_end = 2000.0
    cam.location = Vector(eye)
    cam.rotation_euler = (Vector(target) - Vector(eye)).to_track_quat('-Z', 'Y').to_euler()
    sc.camera = cam
    sc.render.filepath = os.path.join(_OUT, name + '.png')
    bpy.ops.render.render(write_still=True)


_shot('treasure_west', (70.0, -6.5, 2.6), (79.4, -6.5, 2.2))              # straight into the open front
_shot('treasure_colonnade', (62.0, -7.6, 2.8), (79.4, -6.5, 2.2))         # from inside the colonnade
