"""Noble stand of the Circus Maximus, north side, Rome AD 56 (rome_circus_pulvinar), round 2.

Section: x -30..30 (60 m), y -9..9 (18 m); z = 0 = floor of the imperial box; substructure down to z -12 (arena).
  Centre x -12..12: the imperial box (pulvinar). Framed marble panels on the grey podium front, the entrance tunnel
  with a small pediment, Corinthian columns with gilded capitals, purple awning on four bronze poles, two bronze
  tripods on the parapet, three rows of seats, ivory chair, bronze railing at the edge.
  Wings x -30..-12 and 12..30: senators' seats (six marble rows, red cushions), a statue at each outer end, and a
  one-storey Ionic colonnade with a tile lean roof at the back of each wing.
  Behind the box (+y): a covered stair (stair_flight) rising from the box floor to z +12, the way up to the palace.
Asset front = -Y (toward the arena). Run:
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_circus_pulvinar.py"
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                      # noqa: F401,F403  (box, cyl, lathe, beam, add_poly, column, statue, stair_flight, ...)
from mathutils import Vector

reset()
F = Frame()
import bpy
try:
    bpy.context.scene.eevee.taa_render_samples = 16      # low samples: quick previews
except AttributeError:
    pass

# ---------------------------------------------------------------- dimensions (metres)
FRONT_Y = -9.0                # podium front line of the whole section
RAIL_Y = -8.8                 # bronze railing along the front
COL_H = 6.0                   # box columns, base to capital
R_COL = 0.36                  # column radius (Corinthian, about 8 diameters high)
ENT_H = 1.1                   # entablature height
EAVE = COL_H + ENT_H          # 7.1: top of the box entablature = foot of the roof
PITCH = 20.0                  # roof pitch, degrees
OVER = 0.5                    # roof overhang
Y_COL = 6.5                   # box column lines: front y = -6.5, back y = +6.5
X_COL = 10.5                  # outer box columns at x = +-10.5
HALF_ROOF = 12.0 + OVER       # roof half width at the eaves (x)
TAN = math.tan(math.radians(PITCH))
ZE = -OVER * TAN              # eave height relative to EAVE (as gable_roof builds it)
RISE = 12.0 * TAN             # ridge height above EAVE (12 m from the ridge to each eave)

ST_Y0, ST_Y1, ST_Z, ST_W = 8.0, 29.0, 12.0, 3.6     # covered stair: foot behind the box, head at z +12
ST_L = ST_Y1 - ST_Y0          # horizontal run 21 m (67 treads of about 0.31 m, risers 0.18 m)
ST_HW = ST_W / 2.0            # passage half width 1.8 m


def roof_z(x):
    """Height of the box roof sheet at x (ridge at x = 0)."""
    return EAVE + ZE + (RISE - ZE) * (1.0 - abs(x) / HALF_ROOF)


def xz_extrude(Fr, pts, y0, y1, mat):
    """A prism: the closed polygon pts [(x, z), ...] in the xz plane, extruded from y0 to y1."""
    A = [Fr.p(x, y0, z) for x, z in pts]
    B = [Fr.p(x, y1, z) for x, z in pts]
    add_poly(mat, A)
    add_poly(mat, list(reversed(B)))
    n = len(pts)
    for i in range(n):
        j = (i + 1) % n
        add_poly(mat, [A[i], B[i], B[j], A[j]])


def wall_slab(Sf, u0, u1, zb, zt, y0, y1, mat, bottom=False):
    """A sloped slab in the local frame Sf: along u (u0..u1), between local y0 and y1, from the line zb(u) up to zt(u).
    zb and zt are linear in u, so every face is planar."""
    ib0, ib1 = Sf.p(u0, y0, zb(u0)), Sf.p(u1, y0, zb(u1))
    it0, it1 = Sf.p(u0, y0, zt(u0)), Sf.p(u1, y0, zt(u1))
    ob0, ob1 = Sf.p(u0, y1, zb(u0)), Sf.p(u1, y1, zb(u1))
    ot0, ot1 = Sf.p(u0, y1, zt(u0)), Sf.p(u1, y1, zt(u1))
    add_poly(mat, [ib0, ib1, it1, it0])     # inner face
    add_poly(mat, [ob0, ob1, ot1, ot0])     # outer face
    add_poly(mat, [it0, it1, ot1, ot0])     # top
    add_poly(mat, [ib0, it0, ot0, ob0])     # end at u0
    add_poly(mat, [ib1, ob1, ot1, it1])     # end at u1
    if bottom:
        add_poly(mat, [ib0, ob0, ob1, ib1])


def drape(Fr, x0, x1, y, z_top, hem, sag, bays=6, pleats=12, depth=0.14, n=96, mat='cloth'):
    """A hanging cloth from x0 to x1 at plan y, hung from z_top. The hem swags: highest (hem) at the bay joints,
    lowest (hem - sag) in the middle of each bay. Vertical pleats bulge toward -y (into the box)."""
    top = []; low = []
    for i in range(n + 1):
        u = i / n
        x = x0 + (x1 - x0) * u
        yy = y - depth * (0.5 - 0.5 * math.cos(TAU * pleats * u))
        zh = hem - sag * math.sin(math.pi * ((bays * u) % 1.0))
        top.append(Fr.p(x, yy, z_top)); low.append(Fr.p(x, yy, zh))
    for i in range(n):
        a, b, c, d = top[i], top[i + 1], low[i + 1], low[i]
        add_poly(mat, [a, b, c])
        add_poly(mat, [a, c, d])


def wing_arcade(x0, x1, n=4, open_w=2.6, open_h=7.0):
    """A wing podium front: n arched openings (travertine piers) into dark vaults 6 m deep, and a marble impost band
    over the piers at the springing line. Front face at y = FRONT_Y (-9), back at y = -3."""
    arcade(F, x0, -6.0, x1, -6.0, -12.0, 11.8, 6.0, n, 'stone', open_w=open_w, open_h=open_h, back='dark',
           impost_mat='marble')
    bay = (x1 - x0) / n
    b = [x0]
    for k in range(n):
        u = x0 + (k + 0.5) * bay
        b += [u - open_w / 2.0, u + open_w / 2.0]
    b.append(x1)
    spring = -12.0 + (open_h - open_w / 2.0)            # arch springing line
    for i in range(0, len(b) - 1, 2):                   # the piers between the openings
        p0, p1 = b[i], b[i + 1]
        box(F, (p0 + p1) / 2.0, FRONT_Y - 0.21, spring - 0.35, p1 - p0, 0.42, 0.35, 'marble')


def relief_panel(cx, cz, w, h, bar=0.32, depth=0.14, mat='marble'):
    """A raised marble frame (four bars) standing on the grey podium face at y = FRONT_Y."""
    yc = FRONT_Y - depth / 2.0 + 0.02
    box(F, cx, yc, cz + h - bar, w, depth, bar, mat)                  # top bar
    box(F, cx, yc, cz, w, depth, bar, mat)                            # bottom bar
    box(F, cx - w / 2.0 + bar / 2.0, yc, cz, bar, depth, h, mat)      # left bar
    box(F, cx + w / 2.0 - bar / 2.0, yc, cz, bar, depth, h, mat)      # right bar


def tripod(x, y, z0):
    """A bronze tripod with a fire bowl; the feet stand on radius 0.42 at z0 (top of the parapet pier)."""
    top = z0 + 1.0
    for k in range(3):
        a = math.radians(90.0 + 120.0 * k)
        beam(F, x + 0.42 * math.cos(a), y + 0.42 * math.sin(a), z0, x, y, top, 0.09, 0.09, 'bronze')
    cyl(F, x, y, top - 0.1, 0.07, 0.6, 'bronze', 8)                   # stem
    lathe(F, x, y, [(0.01, top + 0.4), (0.18, top + 0.5), (0.34, top + 0.7), (0.42, top + 0.85), (0.38, top + 0.95),
                    (0.01, top + 0.95)], 'bronze', 14, smooth=False)  # bowl
    cyl(F, x, y, top + 0.95, 0.3, 0.7, 'flame', 8, r_top=0.0)        # fire


def senators(x0, x1, y0=-7.0, y1=4.0, n=6, rise=0.45):
    """Senators' seats: n marble rows stepping up toward +y (rise each), with a red cushion strip on every row."""
    xc = (x0 + x1) / 2.0; L = x1 - x0; dy = (y1 - y0) / n
    for k in range(n):
        ya = y0 + k * dy; yb = ya + dy; top = (k + 1) * rise
        box(F, xc, (ya + yb) / 2.0, 0.0, L, dy, top, 'marble')
        box(F, xc, (ya + yb) / 2.0 + 0.05, top, L - 1.0, dy * 0.55, 0.12, 'cloth')


def wing_colonnade(x0, x1, y=5.8, z0=2.7, h=3.2, r=0.24):
    """One-storey Ionic colonnade on the wing terrace (five columns), entablature, and a tile lean roof that rests
    on the back wall (wall line y 8.2) and slopes down toward the arena."""
    xs = [x0 + 1.0 + i * (x1 - x0 - 2.0) / 4.0 for i in range(5)]
    for x in xs:
        column(F, x, y, z0, h, r, 'marble', 'ionic', 0, 12)
    entablature(F, x0 + 0.6, y, x1 - 0.6, y, z0 + h, 0.6, 0.6, 'marble')
    lean_roof(F, x0 + 0.6, 8.2, x1 - 0.6, 8.2, 7.0, 3.8, 0.9, 'tile', True, 'tile2')


# ---------------------------------------------------------------- substructure (z -12 .. -0.2)
# Centre: the podium front is a grey ground framed by raised marble panels, with the entrance tunnel: an arched
# passage 4 m wide x 6 m high (z -12 .. -6), 6 m deep, dark at its back; the core behind it is solid.
# Wings: solid travertine. The floor slab (top at z 0) runs over the whole section.
arcade(F, -12.0, -6.0, 12.0, -6.0, -12.0, 11.8, 6.0, 1, 'grey', open_w=4.0, open_h=6.0, back='dark',
       impost_mat='marble')                                            # front y -9, back y -3
box(F, 0, 3.0, -12.0, 24.0, 12.0, 11.8, 'stone')                      # centre core, y -3 .. 9
for xc in (-21.0, 21.0):
    box(F, xc, 3.0, -12.0, 18.0, 12.0, 11.8, 'stone')                   # wing cores, y -3 .. 9 (behind the arcades)
wing_arcade(12.0, 30.0)                                 # travertine arcades on the wing podiums
wing_arcade(-30.0, -12.0)
box(F, 0, 18.5, -12.0, 4.8, 21.0, 11.5, 'stone')                      # solid base under the covered stair
box(F, 0, 0, -0.2, 60.0, 18.0, 0.2, 'marble')                         # floor slab, top at z = 0
cornice(F, -29.5, FRONT_Y, 29.5, FRONT_Y, -0.4, 0.8, 0.5, 'marble')  # cornice at the floor, whole front

# framed marble relief panels on the grey podium face (upper row flanks the arch, lower row beside it)
for (cx, cz, w, h) in ((-9.6, -5.4, 4.0, 4.2), (-5.2, -5.4, 4.0, 4.2), (5.2, -5.4, 4.0, 4.2), (9.6, -5.4, 4.0, 4.2),
                       (-9.0, -11.0, 3.6, 4.2), (-4.6, -11.0, 3.6, 4.2), (4.6, -11.0, 3.6, 4.2), (9.0, -11.0, 3.6, 4.2)):
    relief_panel(cx, cz, w, h)
# small pediment crowning the tunnel arch
box(F, 0, FRONT_Y - 0.12, -5.5, 6.2, 0.24, 0.55, 'marble')            # cornice over the arch, z -5.5 .. -4.95
xz_extrude(F, [(-2.9, -4.95), (2.9, -4.95), (0.0, -3.6)], FRONT_Y - 0.2, FRONT_Y - 0.02, 'marble')

# ---------------------------------------------------------------- floor, tiered seats, rear platform (centre)
box(F, 0, -4.25, 0, 22.0, 1.5, 0.45, 'marble')    # seat row 1 (front), top 0.45
box(F, 0, -2.75, 0, 22.0, 1.5, 0.90, 'marble')    # seat row 2, top 0.90
box(F, 0, -1.25, 0, 22.0, 1.5, 1.35, 'marble')    # seat row 3, top 1.35
box(F, 0, 2.5, 0, 24.0, 6.0, 1.35, 'marble')      # rear platform, y -0.5 .. 5.5
box(F, -5.95, 6.75, 0, 7.1, 2.5, 1.35, 'marble')  # back strip left, x -9.5 .. -2.4, y 5.5 .. 8
box(F, 5.95, 6.75, 0, 7.1, 2.5, 1.35, 'marble')   # back strip right; the gap in the middle leads to the stair

# ---------------------------------------------------------------- ivory chair with footstool (front centre, on the floor)
CH_Y = -6.4
box(F, 0, CH_Y, 0, 0.9, 0.75, 0.46, 'giallo')                       # seat
box(F, 0, CH_Y + 0.3, 0.46, 0.9, 0.14, 0.9, 'giallo')               # back, on the +y side (the sitter faces -y)
for sd in (-1, 1):
    box(F, sd * 0.42, CH_Y - 0.05, 0.46, 0.14, 0.6, 0.24, 'giallo')  # arm rests
box(F, 0, -7.2, 0, 0.5, 0.36, 0.2, 'giallo')                        # footstool

# ---------------------------------------------------------------- bronze railing along the whole front edge
lattice_rail(F, -30.0, RAIL_Y, 30.0, RAIL_Y, 0.0, 1.05, 'bronze', 'marble', post_every=3.0, panel=0.9)

# two bronze tripods with fire on marble piers on the parapet
for sd in (-1, 1):
    box(F, sd * 7.0, RAIL_Y, 0.0, 0.9, 0.9, 1.2, 'marble')          # pier on the parapet line
    tripod(sd * 7.0, RAIL_Y, 1.2)

# purple awning ('flowerP' = palette purple; 'cloth' renders red) on four bronze poles over the front seats
box(F, 0, -2.35, 4.6, 15.0, 5.7, 0.1, 'flowerP')                      # awning, x -7.5 .. 7.5, y -5.2 .. 0.5
box(F, 0, -5.2, 4.1, 15.0, 0.06, 0.5, 'flowerP')                      # front valance
for sd in (-1, 1):
    cyl(F, sd * 7.5, -5.2, 0.0, 0.12, 4.6, 'bronze', 10)            # front poles, on the floor
    cyl(F, sd * 7.5, 0.5, 1.35, 0.12, 3.25, 'bronze', 10)           # rear poles, on the platform

# ---------------------------------------------------------------- six Corinthian columns, entablature, roof (box)
for x in (-10.5, -3.5, 3.5, 10.5):                                  # four in front
    column(F, x, -Y_COL, 0.0, COL_H, R_COL, 'marble', 'corinthian', 10, 14, cap_mat='gold')
for x in (-X_COL, X_COL):                                           # two at the back corners
    column(F, x, Y_COL, 0.0, COL_H, R_COL, 'marble', 'corinthian', 10, 14, cap_mat='gold')

ED = R_COL * 2.9                                                    # entablature depth
ring = [(-X_COL, -Y_COL, X_COL, -Y_COL), (X_COL, -Y_COL, X_COL, Y_COL),
        (X_COL, Y_COL, -X_COL, Y_COL), (-X_COL, Y_COL, -X_COL, -Y_COL)]
for (a, b, c, d) in ring:
    entablature(F, a, b, c, d, COL_H, ENT_H, ED, 'marble', frieze_mat='red')

# pediments on the front (-y, toward the arena) and back gables; ridge along y, 24 m wide, 14.6 m deep
gable_roof(F, 0, 0, EAVE, 24.0, 14.6, pitch=PITCH, axis='y', overhang=OVER, mat='tile', tiles=True,
           rib_mat='tile2', gable_mat='marble', pediment=True, tymp_mat='plaster')
# close the gap between the cornice and the roof sheet on the long sides (top kept under the sheet)
for sd in (-1, 1):
    xz = [(10.0, EAVE), (11.28, EAVE), (11.28, roof_z(11.28) - 0.1), (10.0, roof_z(10.0) - 0.1)]
    if sd < 0:
        xz = [(-x, z) for x, z in xz]
    xz_extrude(F, xz, -7.0, 7.0, 'marble')
# gilded statues on the pediment corners (front and back) and on the front apex
for yy in (-7.35, 7.35):
    for sd in (-1, 1):
        statue(F, sd * 11.9, yy, EAVE + 0.35, 2.0, 'gold', pedestal=0.4, ped_mat='marble')
statue(F, 0.0, -7.35, EAVE + RISE + 0.35, 1.8, 'gold', pedestal=0.35, ped_mat='marble')

# purple-red hangings between the back columns; the middle stays open for the stair passage (valance above it)
drape(F, -9.4, -2.6, Y_COL, COL_H, 1.6, 0.25, bays=3, pleats=6, depth=0.14, mat='cloth')
drape(F, 2.6, 9.4, Y_COL, COL_H, 1.6, 0.25, bays=3, pleats=6, depth=0.14, mat='cloth')
box(F, 0, Y_COL, 3.0, 5.2, 0.12, 3.0, 'cloth')                      # valance over the stair mouth

# ---------------------------------------------------------------- senators' wings (x -30..-12 and 12..30)
for sd in (-1, 1):
    x0, x1 = (12.0, 30.0) if sd > 0 else (-30.0, -12.0)
    xc = 0.5 * (x0 + x1)
    senators(x0, x1)                                                # six rows, red cushions
    box(F, xc, 6.1, 0.0, 18.0, 4.2, 2.7, 'marble')                  # terrace behind the seats, y 4 .. 8.2
    box(F, xc, 8.6, 0.0, 18.0, 0.8, 7.0, 'stone')                   # back wall of the stand, y 8.2 .. 9
    wing_colonnade(x0, x1)                                          # Ionic colonnade with tile lean roof
    statue(F, sd * 28.5, -7.9, 0.0, 2.6, 'marble', pedestal=1.2, ped_mat='marble')   # statue at the outer end

# ---------------------------------------------------------------- covered stair behind the box, up to z +12
stair_flight(F, 0.0, ST_Y0, 0.0, ST_Y1, 0.0, ST_Z, width=ST_W, mat='stone', cheek_mat='stone', cheeks=True)
Sst = F.sub(0.0, ST_Y0, 0.0, 90.0)                       # local u runs up the stair (+y); local y = -x
zs = lambda u: u * ST_Z / ST_L                           # nosing line of the treads
zb_wall = lambda u: zs(u) + 0.9                          # walls start on the cheeks (cheek top = nosing + 0.9)
zt_wall = lambda u: zs(u) + 2.75                         # walls run up under the roof sheet
for (y0, y1) in ((ST_HW, ST_HW + 0.6), (-ST_HW - 0.6, -ST_HW)):
    wall_slab(Sst, 0.0, ST_L, zb_wall, zt_wall, y0, y1, 'stone')
wall_slab(Sst, 0.0, ST_L, lambda u: zs(u) + 2.6, lambda u: zs(u) + 2.85, -2.5, 2.5, 'tile', bottom=True)   # roof
box(F, 0, 28.85, 11.5, ST_W + 1.2, 0.3, 3.35, 'stone')           # head wall, closes the passage at the top
box(F, 0, ST_Y1 + 0.02, 12.0, 2.0, 0.04, 2.0, 'dark')            # dark door toward the palace
box(F, -1.15, 29.08, 12.0, 0.3, 0.16, 2.0, 'marble')             # marble jamb, left
box(F, 1.15, 29.08, 12.0, 0.3, 0.16, 2.0, 'marble')              # marble jamb, right
box(F, 0.0, 29.08, 14.0, 2.6, 0.16, 0.3, 'marble')               # marble lintel: a separate gate from the Palatine side

# ---------------------------------------------------------------- preview only: scale figure on the arena
human(F, 6.0, -12.5, -12.0)

preview_ground(-12.0)
finish('rome_circus_pulvinar', front='-Y',
       extra_cams=[('rear', Vector((0.6, 1.0, 0.0)), 12), ('high', Vector((-0.9, -1.0, 0.0)), 40)])
