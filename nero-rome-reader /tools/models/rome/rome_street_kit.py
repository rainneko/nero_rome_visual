"""rome_street_kit · eight street props for the narrow streets below the Palatine (AD 56).
rome_lacus, rome_compitum, rome_stepping, rome_counter, rome_cart, rome_amphorae, rome_awning, rome_laundry.
Each builder calls reset() first and finish() last (one GLB + renders per prop).
Run: /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_street_kit.py"
"""
import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *

# amphora profiles (radius, distance from the toe along the axis), metres at s = 1 (about 1.06 m tall)
AMPH_FULL = [(0.012, 0.0), (0.045, 0.03), (0.095, 0.13), (0.128, 0.27), (0.150, 0.42), (0.158, 0.54), (0.148, 0.66),
             (0.114, 0.79), (0.074, 0.89), (0.060, 0.94), (0.058, 1.0), (0.066, 1.03), (0.068, 1.05), (0.060, 1.06),
             (0.012, 1.06)]
AMPH_LITE = [(0.012, 0.0), (0.095, 0.13), (0.150, 0.42), (0.158, 0.54), (0.114, 0.79), (0.074, 0.89), (0.058, 1.0),
             (0.068, 1.05), (0.012, 1.06)]


def _reset():
    """Empty scene for one prop, with low EEVEE samples (memory is tight on the render machine)."""
    import bpy
    reset()
    bpy.context.scene.eevee.taa_render_samples = 8


def _slab(mat, P, n, t):
    """Flat slab: outline P (4 points, counter-clockwise seen from the outward normal n), thickness t going into -n."""
    n = Vector(n).normalized()
    Q = [p - n * t for p in P]
    add_poly(mat, P)
    add_poly(mat, list(reversed(Q)))
    for i in range(len(P)):
        j = (i + 1) % len(P)
        add_poly(mat, [P[i], Q[i], Q[j], P[j]])


def _amphora(mat, base, axis, s, profile, seg, handle_mat=None):
    """Amphora: `profile` (r, t) revolved about `axis` from its toe at `base`, scaled by s. Optional side handles."""
    a = Vector(axis).normalized()
    u = (Vector((1.0, 0.0, 0.0)) - a * a.x).normalized()
    v = a.cross(u)
    V = []
    for (r, t) in profile:
        for j in range(seg):
            ph = TAU * j / seg
            V.append(base + a * (t * s) + (u * math.cos(ph) + v * math.sin(ph)) * (r * s))
    n = len(profile); Fc = []
    for i in range(n - 1):
        for j in range(seg):
            a0 = i * seg + j; a1 = i * seg + (j + 1) % seg
            b0 = (i + 1) * seg + j; b1 = (i + 1) * seg + (j + 1) % seg
            Fc.append((a0, a1, b1, b0))
    Fc.append(tuple(reversed(range(seg))))                 # toe cap
    Fc.append(tuple(range((n - 1) * seg, n * seg)))        # mouth cap
    add_mesh(mat, V, Fc, smooth=True)
    if handle_mat:
        for sd in (-1, 1):
            p1 = base + a * (0.90 * s) + u * (sd * 0.07 * s)
            p2 = base + a * (0.66 * s) + u * (sd * 0.16 * s)
            beam(None, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, 0.035 * s, 0.035 * s, handle_mat)


# ---------------------------------------------------------------- rome_lacus: basin with a face pillar and spout
def lacus():
    _reset()
    # basin 2.6 x 1.6 m, 0.9 m high; four basalt walls 0.25 thick on a basalt floor; water 0.15 below the rim
    box(None, 0, 0, 0, 2.1, 1.1, 0.12, 'basalt')
    box(None, 0, 0.675, 0, 2.6, 0.25, 0.9, 'basalt')
    box(None, 0, -0.675, 0, 2.6, 0.25, 0.9, 'basalt')
    box(None, 1.175, 0, 0, 0.25, 1.1, 0.9, 'basalt')
    box(None, -1.175, 0, 0, 0.25, 1.1, 0.9, 'basalt')
    box(None, 0, 0, 0.12, 2.1, 1.1, 0.63, 'water')                 # surface at z = 0.75
    for sx in (-1, 1):                                             # iron clamps on the corners
        for sy in (-1, 1):
            for zc in (0.25, 0.65):
                box(None, sx * 1.3, sy * 0.8, zc, 0.22, 0.22, 0.05, 'iron')
    # pillar 0.5 x 0.4 x 1.4 m at the +X short end (shaft + cap)
    box(None, 1.55, 0, 0, 0.5, 0.4, 1.32, 'basalt')
    box(None, 1.55, 0, 1.32, 0.56, 0.46, 0.08, 'basalt')
    face = [Vector((1.55 + 0.15 * math.cos(TAU * i / 12), -0.23, 1.0 + 0.15 * math.sin(TAU * i / 12)))
            for i in range(12)]
    _slab('marble', face, Vector((0, -1, 0)), 0.03)                # carved face: marble disc on the pillar front
    beam(None, 1.33, 0, 0.95, 1.0, 0, 0.95, 0.09, 0.09, 'bronze')  # spout pouring over the basin
    finish('rome_lacus', front='-Y')


# ---------------------------------------------------------------- rome_compitum: Lares shrine on a wall
def compitum():
    _reset()
    # wall 2.6 x 3.2 x 0.5: back layer full, front layer cut for the niche (x +-0.35, z 1.15..2.05)
    box(None, 0, 0.11, 0, 2.6, 0.28, 3.2, 'plaster')
    box(None, 0, -0.14, 0, 2.6, 0.22, 1.15, 'plaster')
    box(None, 0, -0.14, 2.05, 2.6, 0.22, 1.15, 'plaster')
    box(None, -0.825, -0.14, 1.15, 0.95, 0.22, 0.9, 'plaster')
    box(None, 0.825, -0.14, 1.15, 0.95, 0.22, 0.9, 'plaster')
    box(None, 0, -0.035, 1.6, 0.7, 0.01, 0.9, 'dark')              # niche back
    # red painted panel on the front face (x +-1.1, z 0.35..2.85), with the niche left open
    box(None, 0, -0.26, 0.35, 2.2, 0.02, 0.8, 'red')
    box(None, 0, -0.26, 2.05, 2.2, 0.02, 0.8, 'red')
    box(None, -0.725, -0.26, 1.15, 0.75, 0.02, 0.9, 'red')
    box(None, 0.725, -0.26, 1.15, 0.75, 0.02, 0.9, 'red')
    # cornice shelf 0.8 m proud of the wall carries the roof; gabled tile roof, ridge across the front-back axis
    box(None, 0, 0, 3.0, 2.6, 2.1, 0.2, 'travertine')
    gable_roof(None, 0, 0, 3.2, 2.6, 2.1, 30.0, axis='y', overhang=0.1, mat='tile', tiles=True, rib_mat='tile2',
               gable_mat='plaster')
    altar(None, 0, -1.65, 0, w=0.8, d=0.6, h=1.0, mat='travertine', steps=0, bolsters=False)
    finish('rome_compitum', front='-Y')


# ---------------------------------------------------------------- rome_stepping: stones across a 4.5 m street
def stepping():
    _reset()
    oct_pts = [(0.5, -0.15), (0.5, 0.15), (0.35, 0.3), (-0.35, 0.3), (-0.5, 0.15), (-0.5, -0.15), (-0.35, -0.3),
               (0.35, -0.3)]                                       # 8-sided, 1.0 x 0.6 m, chamfer 0.15
    for xc in (-1.6, 0.0, 1.6):                                    # 0.6 m gaps between the stones
        prism(None, [(xc + px, py) for (px, py) in oct_pts], 0.0, 0.35, 'basalt')
    box(None, -2.45, 0, 0, 0.4, 1.6, 0.4, 'stone')                 # curb stones at the street edges (x = +-2.25)
    box(None, 2.45, 0, 0, 0.4, 1.6, 0.4, 'stone')
    finish('rome_stepping', front='-Y')


# ---------------------------------------------------------------- rome_counter: L-shaped thermopolium counter
def counter():
    _reset()
    box(None, 0, 0, 0, 3.0, 0.6, 0.92, 'plaster3')                 # leg A, 3.0 m
    box(None, 1.2, 1.05, 0, 0.6, 1.5, 0.92, 'plaster3')            # leg B, 1.5 m
    box(None, 0, 0, 0.92, 3.06, 0.66, 0.08, 'marble')              # marble top, 1.0 m high
    box(None, 1.2, 1.08, 0.92, 0.66, 1.5, 0.08, 'marble')
    for hx in (-0.9, 0.0, 0.9):                                    # three dark round jar mouths with a rim
        cyl(None, hx, 0, 1.0, 0.16, 0.004, 'dark', 16)
        lathe(None, hx, 0, [(0.16, 1.0), (0.2, 1.0), (0.2, 1.012), (0.16, 1.012)], 'marble', 12, smooth=False)
    for (yc, top) in ((0.425, 1.3), (0.675, 1.6), (0.925, 1.9)): # stepped shelf for jugs, rising to the back
        box(None, -0.7, yc, 0, 1.2, 0.25, top, 'plaster3')
        box(None, -0.7, yc, top, 1.2, 0.25, 0.04, 'marble')
    finish('rome_counter', front='-Y')


# ---------------------------------------------------------------- rome_cart: two-wheeled handcart with amphorae
def cart():
    _reset()
    box(None, 0, 0, 0.6, 1.1, 1.8, 0.08, 'wood')                   # bed 1.1 x 1.8 m
    for sx in (-1, 1):
        box(None, sx * 0.52, 0, 0.68, 0.06, 1.8, 0.25, 'wood')     # side boards
    for sy in (-1, 1):
        box(None, 0, sy * 0.87, 0.68, 1.04, 0.06, 0.25, 'wood')    # end boards
    beam(None, -0.7, 0, 0.55, 0.7, 0, 0.55, 0.1, 0.1, 'wood')      # axle under the bed
    for sx in (-1, 1):
        vdisc(None, sx * 0.62, 0, 0.55, 0.55, 0.08, 'wood', 16)    # wheels r 0.55
        beam(None, sx * 0.3, -0.8, 0.56, sx * 0.3, -2.4, 0.05, 0.08, 0.1, 'wood')   # two shafts, tips on the street
    for x in (-0.31, 0.0, 0.31):                                   # three amphorae lying on the bed
        _amphora('tile', Vector((x, -0.45, 0.814)), Vector((0, 1, 0)), 0.85, AMPH_FULL, 10)
    finish('rome_cart', front='-Y')


# ---------------------------------------------------------------- rome_amphorae: wooden rack, 12 leaning amphorae
def amphora_rack():
    _reset()
    box(None, 0, 0, 0, 3.1, 1.1, 0.08, 'wood')                     # deck
    for x in (-1.5, 0.0, 1.5):
        for y in (-0.5, 0.5):
            box(None, x, y, 0, 0.1, 0.1, 1.45, 'wood')             # posts
    for y in (-0.5, 0.5):
        for z in (0.5, 1.1):
            box(None, 0, y, z, 3.1, 0.07, 0.08, 'wood')            # side rails
        box(None, 0, y, 1.35, 3.1, 0.08, 0.1, 'wood')              # top rails
    for x in (-1.5, 0.0, 1.5):
        box(None, x, 0, 1.35, 0.1, 1.1, 0.1, 'wood')               # cross beams
    lean = math.radians(12.0)
    for (ry, sgn) in ((-0.22, -1), (0.22, 1)):                     # two rows, each leaning outwards
        axis = Vector((0, sgn * math.sin(lean), math.cos(lean)))
        for x in (-1.1, -0.66, -0.22, 0.22, 0.66, 1.1):
            _amphora('tile', Vector((x, ry, 0.08)), axis, 0.92, AMPH_LITE, 8, handle_mat='tile')
    finish('rome_amphorae', front='-Y')


# ---------------------------------------------------------------- rome_awning: 4 m shop awning, 1.6 m out
def awning():
    _reset()
    P = [Vector((-2.0, 0.8, 3.0)), Vector((-2.0, -0.8, 2.35)), Vector((2.0, -0.8, 2.35)), Vector((2.0, 0.8, 3.0))]
    _slab('awning', P, Vector((0.0, -0.377, 0.926)), 0.03)         # cloth, wall line at y = +0.8
    box(None, 0, -0.8, 2.23, 4.0, 0.03, 0.12, 'awning')            # valance band
    for i in range(8):                                             # scalloped flaps hanging from it
        box(None, -1.75 + i * 0.5, -0.8, 2.11, 0.42, 0.03, 0.12, 'awning')
    box(None, 0, 0.8, 2.9, 4.0, 0.1, 0.1, 'wood')                  # rail at the wall line
    for sx in (-1, 1):
        cyl(None, sx * 1.9, -0.8, 0, 0.05, 2.35, 'wood', 8)        # two poles
    finish('rome_awning', front='-Y')


# ---------------------------------------------------------------- rome_laundry: line between two wall brackets
def laundry():
    _reset()
    for sx in (-1, 1):
        box(None, sx * 2.5, -0.15, 0, 0.3, 0.3, 2.6, 'plaster')                     # wall brackets: piers from the street
        box(None, sx * 2.5, -0.15, 2.6, 0.36, 0.36, 0.08, 'iron')                   # iron caps
    beam(None, -2.5, -0.3, 2.55, 2.5, -0.3, 2.55, 0.03, 0.03, 'wood')                 # 5 m line between them
    cloths = [(-2.05, 0.62, 0.95, 'linen'), (-1.25, 0.58, 1.10, 'flowerR'), (-0.45, 0.66, 0.85, 'blue'),
              (0.35, 0.60, 1.05, 'awning'), (1.15, 0.64, 0.90, 'linen'), (1.95, 0.56, 1.08, 'flowerR')]
    for (x, w, h, m) in cloths:
        box(None, x, -0.3, 2.56 - h, w, 0.02, h, m)
    finish('rome_laundry', front='-Y')


lacus()
compitum()
stepping()
counter()
cart()
amphora_rack()
awning()
laundry()
