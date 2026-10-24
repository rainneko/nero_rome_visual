"""Rome · the central barrier of the Circus Maximus, AD 56 (rome_circus_spina).

Origin = centre of the barrier; x east, y north, z = 0 = arena sand (the preview ground).
310 m x 6 m, 1.7 m high; four long water basins; one granite obelisk with a gilded tip; two turning posts (metae)
with three gilded cones each; two lap counters (seven bronze eggs, seven bronze dolphins); three tetrastyle shrines;
three honorific columns with gilded statues; Cybele on a lion. Built on rk.py (which sits on bl_kit.py).
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                    # noqa: F401,F403  (Frame, box, beam, cyl, sphere, prism, column, statue, obelisk, ...)
import bl_kit as bk                 # bk.ROOT = project folder, for the close-up renders
import bpy
from mathutils import Vector

NAME = 'rome_circus_spina'
HL, HW = 155.0, 3.0                 # barrier half length and half width (6 m wide)
Z_CORE, Z_TOP, Z_WATER = 1.1, 1.7, 1.55
RIM = 0.45                          # thickness of the basin walls
BASINS = [(-151.0, -116.0), (-56.5, -34.0), (6.5, 32.0), (126.0, 152.0)]   # x ranges of the four water basins
METAE_X = 159.0                     # turning posts: flat face of each half-round base on x = +-159

reset()
F = Frame()
preview_ground(0.0)                 # the grey preview ground is the arena sand


# ---------------------------------------------------------------- barrier
def deck(x0, x1):
    """Solid marble top of the barrier between two basins (z 1.1 .. 1.7)."""
    box(F, (x0 + x1) / 2, 0, Z_CORE, x1 - x0, 2 * HW, Z_TOP - Z_CORE, 'marble')


def basin(a, b):
    """A long water basin on the barrier top: marble rim walls up to 1.7 m, water surface at 1.55 m.
    (The kit's pool() would bury its water inside the solid top, so the basin is built here.)"""
    H = Z_TOP - Z_CORE
    box(F, a + RIM / 2, 0, Z_CORE, RIM, 2 * HW, H, 'marble')                       # end walls
    box(F, b - RIM / 2, 0, Z_CORE, RIM, 2 * HW, H, 'marble')
    for s in (-1, 1):                                                               # long walls
        box(F, (a + b) / 2, s * (HW - RIM / 2), Z_CORE, (b - a) - 2 * RIM, RIM, H, 'marble')
    box(F, (a + b) / 2, 0, Z_CORE, (b - a) - 2 * RIM, 2 * (HW - RIM), Z_WATER - Z_CORE, 'water')


def barrier():
    box(F, 0, 0, -0.3, 2 * HL, 2 * HW + 0.7, 0.7, 'marble')                       # plinth, its foot in the sand
    box(F, 0, 0, 0.4, 2 * HL, 2 * HW, Z_CORE - 0.4, 'marble')                     # solid core
    prev = -HL
    for a, b in BASINS:
        deck(prev, a)
        basin(a, b)
        prev = b
    deck(prev, HL)
    cornice(F, -HL, -HW, HL, -HW, Z_TOP - 0.225, 0.5, 0.5, 'marble')              # cornice on both long sides
    cornice(F, HL, HW, -HL, HW, Z_TOP - 0.225, 0.5, 0.5, 'marble')
    band(F, -HL, -HW, HL, -HW, 0.7, 0.18, 0.12, 'red')                            # red string course
    band(F, HL, HW, -HL, HW, 0.7, 0.18, 0.12, 'red')


# ---------------------------------------------------------------- turning posts (metae)
def turning_post(sx):
    """Half-round base 4.5 m high, radius 4 m, flat face on x = sx*METAE_X and its round side facing away from the
    barrier, with three gilded cones (r 1.1 -> 0, 7 m tall) and egg finials on top."""
    T = F.sub(sx * METAE_X, 0, 0, 0.0 if sx > 0 else 180.0)
    R, n = 4.0, 24
    disc = [(0.0, -R)] + [(R * math.cos(math.pi * (-0.5 + i / n)), R * math.sin(math.pi * (-0.5 + i / n)))
                          for i in range(1, n)] + [(0.0, R)]
    prism(T, disc, -0.3, 4.5, 'marble')
    for v in (-2.4, 0.0, 2.4):
        cyl(T, 1.3, v, 4.5, 1.1, 7.0, 'gold', 16, r_top=0.0)
        sphere(T, 1.3, v, 11.9, 0.42, 'gold', 12, 8, z_scale=1.3)


# ---------------------------------------------------------------- shrines, honorific columns, lap counters, Cybele
def shrine(x, roof, rib):
    """Small tetrastyle pavilion, 3.2 m square, about 5 m high: four columns across the front, corner columns,
    a closed entablature, a plaster cella with a dark doorway, and a hipped roof (tile or bronze)."""
    T = F.sub(x, 0, Z_TOP)
    box(T, 0, 0, -0.1, 3.2, 3.2, 0.5, 'marble')                                    # podium 1.6 .. 2.1 m
    for cx in (-1.1, -0.37, 0.37, 1.1):
        column(T, cx, -1.1, 0.4, 3.2, 0.2, 'marble', 'ionic', 0, 10)
    for cx in (-1.1, 1.1):
        column(T, cx, 1.1, 0.4, 3.2, 0.2, 'marble', 'ionic', 0, 10)
    for a, b in (((-1.1, -1.1), (1.1, -1.1)), ((1.1, -1.1), (1.1, 1.1)),
                 ((1.1, 1.1), (-1.1, 1.1)), ((-1.1, 1.1), (-1.1, -1.1))):
        entablature(T, a[0], a[1], b[0], b[1], 3.6, 0.55, 0.5, 'marble')
    box(T, 0, 0.2, 0.4, 1.9, 2.1, 3.2, 'plaster')                                  # cella
    box(T, 0, -0.86, 0.4, 0.5, 0.04, 2.3, 'dark')                                  # doorway
    hip_roof(T, 0, 0, 4.1, 2.8, 2.8, 24.0, 0.4, roof, True, rib)


def honorific(x):
    """Honorific column, 8 m, with a gilded statue on its capital."""
    column(F, x, 1.6, Z_TOP, 8.0, 0.42, 'marble', 'corinthian', 0, 14)
    statue(F, x, 1.6, Z_TOP + 8.0, 2.2, 'gold', pedestal=0.8, ped_mat='marble')


def dolphin(x, y, z0):
    """A bronze dolphin on a beam at height z0 (its head touches the beam): three thick beams bent in an arc, tail up,
    head down with a short beak, a dorsal fin and a fluke at the tail."""
    pts = [(-0.45, 0.42), (-0.15, 0.68), (0.25, 0.58), (0.46, 0.04)]
    for a, b in zip(pts[:-1], pts[1:]):
        beam(F, x + a[0], y, z0 + a[1], x + b[0], y, z0 + b[1], 0.2, 0.2, 'bronze')
    sphere(F, x + 0.48, y, z0 + 0.08, 0.13, 'bronze', 8, 6)                        # head
    beam(F, x + 0.48, y, z0 + 0.08, x + 0.66, y, z0 + 0.02, 0.08, 0.08, 'bronze')  # beak
    beam(F, x - 0.05, y, z0 + 0.66, x + 0.05, y, z0 + 0.94, 0.06, 0.06, 'bronze')  # dorsal fin
    beam(F, x - 0.45, y, z0 + 0.42, x - 0.66, y, z0 + 0.62, 0.2, 0.08, 'bronze')   # fluke


def lap_counter(x, eggs):
    """Lap counter: two marble columns 4 m high across the barrier, a beam on top, and seven bronze eggs
    (or seven bronze dolphins) in a row on the beam."""
    for y in (-2.4, 2.4):
        column(F, x, y, Z_TOP, 4.0, 0.42, 'marble', 'doric', 0, 12)
    box(F, x, 0, Z_TOP + 4.0, 1.0, 5.6, 0.5, 'marble')
    top = Z_TOP + 4.5                                                             # top of the beam, 6.2 m
    for k in range(7):
        y = -2.25 + 0.75 * k
        if eggs:
            sphere(F, x, y, top + 0.41, 0.33, 'bronze', 12, 8, z_scale=1.4)       # egg, its foot 5 cm into the beam
        else:
            dolphin(x, y, top)


def cybele(x):
    """Cybele seated on a lion (bronze, built of beams and spheres) on a marble plinth."""
    T = F.sub(x, 0, Z_TOP)
    box(T, 0, 0, 0, 4.0, 2.4, 0.6, 'marble')                                       # plinth 1.7 .. 2.3 m
    beam(T, -1.0, 0, 1.15, 0.9, 0, 1.15, 0.6, 0.6, 'bronze')                       # lion body
    for xl in (-0.7, 0.6):
        for yl in (-0.25, 0.25):
            beam(T, xl, yl, 0.2, xl, yl, 0.95, 0.16, 0.16, 'bronze')               # legs
    for k in range(7):          # mane: a ring of small spheres behind the head
        a = 2 * math.pi * k / 7
        sphere(T, 1.05, 0.3 * math.cos(a), 1.3 + 0.3 * math.sin(a), 0.13, 'bronze', 8, 6)
    sphere(T, 1.2, 0, 1.3, 0.3, 'bronze', 10, 7)                                   # head
    beam(T, -1.0, 0, 1.2, -1.5, 0, 1.6, 0.12, 0.12, 'bronze')                      # tail
    sphere(T, -1.55, 0, 1.65, 0.12, 'bronze', 8, 6)
    for sd in (-1, 1):                                                  # arms
        beam(T, -0.1, sd * 0.2, 2.3, 0.2, sd * 0.26, 1.95, 0.1, 0.1, 'bronze')
    cyl(T, -0.1, 0, 1.95, 0.28, 0.45, 'bronze', 12, r_top=0.22)        # upper robe
    cyl(T, -0.1, 0, 1.45, 0.36, 0.5, 'bronze', 12, r_top=0.28)                     # Cybele's robe
    sphere(T, -0.1, 0, 2.5, 0.22, 'bronze', 10, 6)                                 # torso
    sphere(T, -0.1, 0, 2.8, 0.18, 'bronze', 10, 6)                                 # head
    cyl(T, -0.1, 0, 2.95, 0.2, 0.15, 'bronze', 10, r_top=0.16)                     # mural crown


def closeup(name, target, dist, az, el, lens=50.0):
    """A real close-up render (the kit's extra cameras frame the whole 310 m asset): the camera sits `dist` m from
    `target` at azimuth az (0 = east, 90 = north) and elevation el (degrees). Uses the scene finish() has built."""
    sc = bpy.context.scene
    cam = bpy.data.objects.new('cam_' + name, bpy.data.cameras.new('cam_' + name))
    sc.collection.objects.link(cam)
    cam.data.lens = lens; cam.data.clip_end = 3000.0
    a, e, tg = math.radians(az), math.radians(el), Vector(target)
    cam.location = tg + Vector((math.cos(e) * math.cos(a), math.cos(e) * math.sin(a), math.sin(e))) * dist
    cam.rotation_euler = (tg - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sc.camera = cam
    sc.render.filepath = os.path.join(bk.ROOT, 'renders', NAME, name + '.png')
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam, do_unlink=True)


# ---------------------------------------------------------------- assemble, finish, close-ups
barrier()
obelisk(F, 0, 0, Z_TOP, h=23.3, mat='granite', tip='gold')                        # the one obelisk, in the middle
turning_post(-1)
turning_post(1)
lap_counter(-60.0, eggs=True)
lap_counter(60.0, eggs=False)
shrine(-110.0, 'tile', 'tile2')
shrine(-30.0, 'bronze', 'bronze')
shrine(100.0, 'tile', 'tile2')
for x in (-85.0, 35.0, 85.0):
    honorific(x)
cybele(120.0)
human(F, -20.0, -6.5, 0.0)                                                        # preview scale figure only

finish(NAME, front='-Y', extra_cams=[('west_oblique', Vector((-1, -1, 0)), 25), ('east_low', Vector((1, -0.6, 0)), 8)])
closeup('close_eggs', (-60.0, 0.0, 4.5), 24.0, -120.0, 14.0)
closeup('close_dolphins', (60.0, 0.0, 4.5), 24.0, -60.0, 14.0)
closeup('close_shrine', (-30.0, 0.0, 3.5), 26.0, -35.0, 16.0)
closeup('close_cybele', (120.0, 0.0, 2.5), 18.0, -60.0, 18.0)
closeup('close_metae', (161.0, 0.0, 6.0), 34.0, -120.0, 20.0)
closeup('close_column', (35.0, 1.6, 10.5), 22.0, -60.0, 12.0)
closeup('close_obelisk', (0.0, 0.0, 15.5), 90.0, -40.0, 8.0)
