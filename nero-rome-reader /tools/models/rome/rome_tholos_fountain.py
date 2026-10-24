"""rome_tholos_fountain · a round fountain pavilion for the city squares (Rome in AD 56).

An octagonal arcaded pavilion, about 7.1 m across the flats and 7.2 m to the top of its oculus curb: eight corner piers
(lower 1.2 m in weathered stone, travertine above) carry eight round arches cut through the walls between them (one per
face, all open to the floor), each with a projecting archivolt and a keystone. A stone entablature and a thin projecting
cornice run round above them. A low dome of red-brown tiles (quarter-ellipse profile, 2.0 m high from the eaves) overhangs
the cornice by 0.25 m, is ribbed from eaves to top, and ends in a round oculus curb. Inside, a three-tier fountain
(floor basin, stem, bowl, finial) holds water, with three glazed pots nearby. A two-step plinth (base at z = 0) carries
the whole pavilion.

Front = -Y. Origin at the centre of the plinth's bottom, Z up.
Materials: travertine, travertine_light, stone, roof_tile, roof_rib, water, glaze.
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
import bl_kit as _bk
from mathutils import Vector


def _hex(h):
    return tuple(int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))


# the brief's colours, set for this script only (the kit's own palette is left as it is)
_bk.PAL.update({
    'travertine':       (_hex('#cfc6b4'), 0.0, 0.85),
    'travertine_light': (_hex('#d8d0bf'), 0.0, 0.85),   # archivolts and keystones
    'stone':            (_hex('#b9ae98'), 0.0, 0.90),   # entablature and the weathered pier bases
    'roof_tile':        (_hex('#a5543a'), 0.0, 0.80),
    'roof_rib':         (_hex('#8f4630'), 0.0, 0.80),   # darker tile ribs
    'water':            (_hex('#4f8fa6'), 0.0, 0.08),
    'glaze':            (_hex('#2f7f86'), 0.0, 0.30),
})

# ---------------------------------------------------------------- dimensions (metres)
A_PL1, A_PL2 = 4.2, 3.95          # plinth apothems: step 1 z 0 .. 0.18, step 2 z 0.18 .. 0.36
Z_FLOOR = 0.36                    # pavilion floor (top of step 2)
A_F = 3.55                        # arcade face plane (7.1 m across the flats)
R_C = A_F / math.cos(math.radians(22.5))   # corner radius of the octagon
ARCH_R = 1.0                      # round arch, clear span 2.0 m
ZS = 3.0                          # arch springing (crown at 4.0)
WALL_T = 0.6                      # thickness of the arcade wall: the arch reveals are this deep
ARCH_BAND = 0.12                  # projection of the archivolt in front of the wall face
Z_ENT = 4.2                       # underside of the entablature
Z_CORN = 4.5                      # top of the frieze, underside of the cornice
A_CN = 3.70                       # cornice apothem (its corners reach 4.0 m from the axis)
Z_EAVE = 4.72                     # top of the cornice, eave of the dome
R_EAVE = 4.25                     # eave radius of the dome: 0.25 m beyond the cornice corners
ROOF_RISE = 2.0                   # the dome rises 2.0 m from the eave to the oculus curb
R_OCC = 0.95                      # dome radius at its top
Z_TOP = Z_EAVE + ROOF_RISE        # top of the dome, where it meets the oculus curb
Z_ROOF = 7.2                      # top of the oculus curb
Z_CURB_B = 6.6                    # bottom of the oculus curb (sunk into the dome)
R_CURB_O = 1.2                    # oculus curb: outer radius (inner 0.92)
R_CURB_I = 0.92
PIER_W = 0.9                      # pier width
PIER_RC = R_C - 0.2               # pier centre on the corner bisector; its outer face is a flat pilaster face
DOME_RINGS = 6                    # profile rings from eave to top
DOME_SEG = 24                     # facets round the dome
RIBS = 16                         # tile ribs


def octagon(A):
    """Counter-clockwise octagon of apothem A, face normals at 0, 45, ... degrees (vertices at 22.5 + 45 k)."""
    R = A / math.cos(math.radians(22.5))
    return [(R * math.cos(math.radians(22.5 + 45 * k)), R * math.sin(math.radians(22.5 + 45 * k))) for k in range(8)]


def extrude_yz(F, pts, x0, x1, mat):
    """A polygon given as (y, z) in the local plane of F (local x = thickness), extruded from local x0 to x1."""
    n = len(pts)
    A = sum(pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1] for i in range(n))
    if A < 0:
        pts = pts[::-1]
    front = [F.p(x1, y, z) for y, z in pts]
    back = [F.p(x0, y, z) for y, z in pts]
    add_poly(mat, front)
    add_poly(mat, back[::-1])
    for i in range(n):
        j = (i + 1) % n
        add_poly(mat, [front[i], back[i], back[j], front[j]])


def arcade_wall_pts():
    """The wall between two piers, in the face plane (y, z). The round arch is cut through it: the opening runs
    from the floor up to the arch, so what is left is the solid above the arch and the two side ends in the piers."""
    arc = _bk._arch_pts(-ARCH_R, ARCH_R, ZS, 8)     # from the west springing over the crown to the east one
    return [(-1.2, Z_FLOOR), (-ARCH_R, Z_FLOOR)] + arc + [(ARCH_R, Z_FLOOR), (1.2, Z_FLOOR), (1.2, Z_ENT), (-1.2, Z_ENT)]


def archivolt_pts(seg=6):
    """A U-shaped band round one arch, 0.22 m wide, running from the springing on one side over the crown to the other."""
    ro, ri, zl = ARCH_R + 0.22, ARCH_R, ZS - 0.3
    ts = [math.pi * i / seg for i in range(seg + 1)]
    pts = [(ro, zl)] + [(ro * math.cos(t), ZS + ro * math.sin(t)) for t in ts] + [(-ro, zl), (-ri, zl)]
    pts += [(ri * math.cos(t), ZS + ri * math.sin(t)) for t in reversed(ts)] + [(ri, zl)]
    return pts


def disc(mat, cx, cy, z, r, seg=24):
    """A flat round sheet of water at height z, normal up."""
    for k in range(seg):
        a0 = TAU * k / seg; a1 = TAU * (k + 1) / seg
        add_poly(mat, [(cx, cy, z), (cx + r * math.cos(a0), cy + r * math.sin(a0), z),
                       (cx + r * math.cos(a1), cy + r * math.sin(a1), z)])


def quad_out(mat, pts, out):
    """A quad, wound so that its normal points along out (away from the dome)."""
    n = (pts[1] - pts[0]).cross(pts[2] - pts[0])
    add_poly(mat, pts[::-1] if n.dot(out) < 0 else pts)


# ---------------------------------------------------------------- dome
def dome_rings():
    """Profile rings (r, z, nr, nz) from the eave to the top: a quarter ellipse, steep at the eave and flat at the top.
    (nr, nz) is the unit outward normal of the profile at that ring."""
    a = R_EAVE - R_OCC; b = ROOF_RISE; out = []
    for i in range(DOME_RINGS):
        th = (math.pi / 2) * i / (DOME_RINGS - 1)
        r = R_OCC + a * math.cos(th); z = Z_EAVE + b * math.sin(th)
        nr, nz = b * math.cos(th), a * math.sin(th)
        L = math.hypot(nr, nz)
        out.append((r, z, nr / L, nz / L))
    return out


def dome_band_quads(mat, rings_xyz, outward):
    for i in range(len(rings_xyz) - 1):
        A = rings_xyz[i]; B = rings_xyz[i + 1]; n = len(A)
        for k in range(n):
            j = (k + 1) % n
            q = [A[k], A[j], B[j], B[k]]
            add_poly(mat, q if outward else q[::-1])


def rib_strip(mat, phi, w=0.085, h=0.06, rings=None):
    """A raised tile rib (0.17 m wide, 0.06 m proud of the dome) running from eave to top along meridian phi."""
    ux, uy = math.cos(phi), math.sin(phi)
    T = Vector((-uy, ux, 0.0))
    prof = []
    for (r, z, nr, nz) in rings:
        S = Vector((r * ux, r * uy, z)); N = Vector((nr * ux, nr * uy, nz))
        base = S - N * 0.04                                         # sunk slightly into the shell
        prof.append((base - T * w, base + T * w, S - T * w + N * h, S + T * w + N * h, N))
    for p, q in zip(prof, prof[1:]):
        quad_out(mat, [p[2], p[3], q[3], q[2]], p[4])               # crown
        quad_out(mat, [p[0], p[2], q[2], q[0]], -T)                 # left flank
        quad_out(mat, [p[1], q[1], q[3], p[3]], T)                  # right flank


# ---------------------------------------------------------------- build
reset()
F = Frame()

# two-step plinth, its base flat at z = 0
prism(F, octagon(A_PL1), 0.0, 0.18, 'stone')
prism(F, octagon(A_PL2), 0.18, Z_FLOOR, 'stone')

# eight corner piers: the lower 1.2 m in weathered stone, travertine above; bases and abaci
for j in range(8):
    Fc = Frame(0, 0, 0, rot=22.5 + 45 * j)
    box(Fc, PIER_RC, 0.0, Z_FLOOR, PIER_W, PIER_W, 1.2, 'stone')
    box(Fc, PIER_RC, 0.0, Z_FLOOR + 1.2, PIER_W, PIER_W, Z_ENT - Z_FLOOR - 1.2, 'travertine')
    box(Fc, PIER_RC, 0.0, Z_FLOOR, 1.1, 1.1, 0.14, 'stone')
    box(Fc, PIER_RC, 0.0, Z_ENT - 0.12, 1.1, 1.1, 0.12, 'travertine')

# eight round arches: the wall between the piers with the arch cut through it, a projecting archivolt, a keystone
for k in range(8):
    Fk = Frame(0, 0, 0, rot=45 * k)
    extrude_yz(Fk, arcade_wall_pts(), A_F - WALL_T, A_F, 'travertine')
    extrude_yz(Fk, archivolt_pts(), A_F, A_F + ARCH_BAND, 'travertine_light')
    box(Fk, A_F + 0.10, 0.0, 3.90, 0.20, 0.30, 0.30, 'travertine_light')        # keystone at the crown

# entablature (frieze) and projecting cornice, both octagonal
prism(F, octagon(A_F), Z_ENT, Z_CORN, 'stone')
prism(F, octagon(A_CN), Z_CORN, Z_EAVE, 'stone')

# dome: tile shell outside, ceiling inside (sharing the eave ring), raised ribs from eave to top, oculus curb
RINGS = dome_rings()
outer = [[(r * math.cos(TAU * k / DOME_SEG), r * math.sin(TAU * k / DOME_SEG), z) for k in range(DOME_SEG)]
         for (r, z, _, _) in RINGS]
inner = [outer[0]] + [[(x, y, z - 0.06) for (x, y, z) in ring] for ring in outer[1:]]
dome_band_quads('roof_tile', outer, True)
dome_band_quads('roof_tile', inner, False)
for k in range(RIBS):
    rib_strip('roof_rib', TAU * k / RIBS, rings=RINGS)
lathe(F, 0.0, 0.0, [(R_CURB_I, Z_CURB_B), (R_CURB_O, Z_CURB_B), (R_CURB_O, Z_ROOF), (R_CURB_I, Z_ROOF),
                    (R_CURB_I, Z_CURB_B)], 'travertine', 16, smooth=False)

# tiered fountain on the floor: a round basin, a stem, a smaller bowl, a finial on a post
basin = [(0.0, Z_FLOOR), (1.6, Z_FLOOR), (1.6, 0.60), (1.80, 0.68), (1.80, 0.76), (1.45, 0.76), (1.45, 0.50),
         (0.0, 0.46)]
lathe(F, 0.0, 0.0, basin, 'travertine', 20, smooth=False)
disc('water', 0.0, 0.0, 0.62, 1.42, 24)
cyl(F, 0.0, 0.0, 0.46, 0.2, 1.0, 'travertine', 16, r_top=0.14)                    # stem, top at z 1.46
bowl = [(0.0, 1.40), (0.62, 1.40), (0.90, 1.56), (0.90, 1.68), (0.78, 1.76), (0.62, 1.76), (0.62, 1.66),
        (0.0, 1.60)]
lathe(F, 0.0, 0.0, bowl, 'travertine', 16, smooth=False)
disc('water', 0.0, 0.0, 1.70, 0.60, 16)
cyl(F, 0.0, 0.0, 1.60, 0.05, 0.5, 'travertine', 8, r_top=0.03)                    # finial post
sphere(F, 0.0, 0.0, 2.2, 0.14, 'travertine', 8, 6)                                  # finial

# three glazed pots, set in the front arches
pot = [(0.0, Z_FLOOR), (0.24, Z_FLOOR), (0.30, 0.55), (0.34, 0.78), (0.22, 1.00), (0.19, 1.08), (0.25, 1.14),
       (0.20, 1.17), (0.17, 1.16), (0.17, 1.06), (0.0, 1.06)]
for ang in (225.0, 270.0, 315.0):
    a = math.radians(ang)
    lathe(F, 2.5 * math.cos(a), 2.5 * math.sin(a), pot, 'glaze', 10, smooth=True)

# preview-only scale figure (not exported)
human(F, 5.2, -5.0, 0.0)

preview_ground(0.0)
finish('rome_tholos_fountain', front='-Y')
