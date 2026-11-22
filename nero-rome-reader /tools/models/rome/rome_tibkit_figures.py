"""Four marble figures of the Domus Tiberiana kit, rebuilt as lofted bodies (round 3).

    statue_a     togate man, weight on the right leg, right forearm out of the sinus
    statue_b     woman in chiton and palla, veiled, weight on the left leg, right arm across the chest
    dioscuri_l   youth (pilos, chlamys) holding a standing, striding horse by the bridle; horse at +x
    dioscuri_r   mirror of dioscuri_l

Drop-in replacements for the round-2 files of rome_tib_kit.py: the same node names (statues: empty `shell`
with meshes `figure`, at z = 1.0, and `pedestal`; dioscuri: one mesh `shell`), origin at the centre of the base,
front -Y, material `marble`. Statue figure 2.0 m on a 0.8 x 0.8 x 1.0 pedestal; dioscuri 1.6 x 2.6 x 3.0.

Every body is a skin lofted through cross-sections placed along a pose (horizontal rings for standing bodies,
rings square to a path for limbs, the neck and the tail). Limbs start inside the trunk they grow from.

Run:
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P tools/models/rome/rome_tibkit_figures.py
  ... -- --skip-renders      (GLBs only)
  ... -- --only far,all      (a subset of the preview renders)
"""

import argparse
import math
import sys
from pathlib import Path

import bpy
import bmesh
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rk  # noqa: E402  (palette and material maker)
from rk import _bk as kit  # noqa: E402

ROOT = Path(__file__).resolve().parents[3]
MODELS = ROOT / "assets" / "models" / "rome"
RENDERS = ROOT / "renders" / "rome_tibkit_figures"
STONE = "marble"
PEDESTAL_HEIGHT = 1.0
BUDGETS = {"statue_a": 700, "statue_b": 700, "dioscuri_l": 1700, "dioscuri_r": 1700}
PART_BUDGETS = {"figure": 650, "pedestal": 50}
TAU = math.tau
FRONT, BACK, LEFT, RIGHT = -math.pi / 2, math.pi / 2, 0.0, math.pi   # figure's left is +x (it faces -Y)


# ------------------------------------------------------------------ geometry
class Geo:
    """Vertex and face lists for one mesh."""

    def __init__(self):
        self.V, self.F = [], []

    def loft(self, rings, start="flat", end="flat"):
        """Skin through equal-sided rings. start / end: 'flat', None, or an apex point."""
        n = len(rings[0])
        o = len(self.V)
        for ring in rings:
            self.V.extend(tuple(p) for p in ring)
        for r in range(len(rings) - 1):
            for i in range(n):
                j = (i + 1) % n
                self.F.append((o + r * n + i, o + r * n + j, o + (r + 1) * n + j, o + (r + 1) * n + i))
        for cap, row in ((start, 0), (end, len(rings) - 1)):
            if cap is None:
                continue
            idx = [o + row * n + i for i in range(n)]
            if cap == "flat":
                self.F.append(tuple(idx))
            else:
                a = len(self.V)
                self.V.append(tuple(cap))
                for i in range(n):
                    self.F.append((idx[i], idx[(i + 1) % n], a))

    def tris(self):
        return sum(len(f) - 2 for f in self.F)


def bump(a, centre, width):
    d = math.remainder(a - centre, TAU) / width
    return math.cos(math.pi * d / 2) ** 2 if abs(d) < 1 else 0.0


def offset(a, bumps):
    return sum(amp * bump(a, c, w) for c, w, amp in bumps)


def hring(z, cx, cy, rx, ry, n, bumps=(), rot=0.0, tilt=0.0, pleat=0.0, pleat_from=None):
    """Horizontal section. Angles: 0 = +x (figure's left), -pi/2 = front. rot turns the section (head turns);
    tilt raises the +x side (z += tilt * dx); pleat alternates the radius vertex by vertex (fine vertical folds),
    only on the front half if pleat_from == 'front'."""
    ring = []
    for i in range(n):
        a = TAU * i / n
        d = offset(a, bumps)
        if pleat:
            if pleat_from != "front" or math.sin(a) < 0.2:
                d += pleat * (1.0 if i % 2 == 0 else -0.7)
        lx = (rx + d) * math.cos(a)
        ly = (ry + d) * math.sin(a)
        c, s = math.cos(rot), math.sin(rot)
        x, y = lx * c - ly * s, lx * s + ly * c
        ring.append((cx + x, cy + y, z + tilt * x))
    return ring


def path_rings(stations, n, uref=(1, 0, 0), vertical_ends=0, vertical_starts=0):
    """Rings square to a path. stations: (point, w, h, bumps). w along the lateral axis u (from uref),
    h along v = t x u. Angle 0 = +u, pi/2 = +v. The first / last k rings can be forced horizontal."""
    pts = [Vector(s[0]) for s in stations]
    rings = []
    for k, (p, w, h, bumps) in enumerate(stations):
        if k == 0:
            t = pts[1] - pts[0]
        elif k == len(pts) - 1:
            t = pts[-1] - pts[-2]
        else:
            t = (pts[k + 1] - pts[k]).normalized() + (pts[k] - pts[k - 1]).normalized()
        t.normalize()
        if k >= len(pts) - vertical_ends or k < vertical_starts:
            t = Vector((0, 0, -1 if t.z < 0 else 1))
        u = Vector(uref)
        u = (u - u.dot(t) * t).normalized()
        v = t.cross(u)
        ring = []
        for i in range(n):
            a = TAU * i / n
            d = offset(a, bumps)
            q = Vector(p) + (w + d) * math.cos(a) * u + (h + d) * math.sin(a) * v
            ring.append(tuple(q))
        rings.append(ring)
    return rings


def yring(y, x0, zc, w, h, n, bumps=()):
    """Section across a horse's body: angle 0 = +x, pi/2 = up."""
    ring = []
    for i in range(n):
        a = TAU * i / n
        d = offset(a, bumps)
        ring.append((x0 + (w + d) * math.cos(a), y, zc + (h + d) * math.sin(a)))
    return ring


def foot(g, x, y, length, width, height, n=6, toe_dir=0.0):
    """A sandalled foot / shoe tip: a low wedge, toe towards -y (turned by toe_dir)."""
    c, s = math.cos(toe_dir), math.sin(toe_dir)

    def ring(z, l, w, back):
        out = []
        for i in range(n):
            a = TAU * i / n
            lx, ly = w * math.cos(a), l * math.sin(a) - back
            out.append((x + lx * c - ly * s, y + lx * s + ly * c, z))
        return out
    g.loft([ring(0.0, length, width, 0.0), ring(height, length * .7, width * .8, -length * .2)])


# ------------------------------------------------------------------ statues
def statue_a():
    """Togate man. Weight on the right leg (-x): right hip up, shoulders the other way, head turned right.
    Right forearm comes forward out of the sinus; the left forearm, under the cloth, carries the hanging
    lacinia that falls in a panel down the front of the left side."""
    g = Geo()
    n = 16
    # one fold that climbs from the right hip to the left shoulder (the balteus) and the sinus swag
    rows = [
        # z, cx, cy, rx, ry, rot, tilt, bumps
        (0.000, .000, .000, .258, .188, 0, 0,
         [(-2.45, .55, .036), (-1.05, .55, .040), (-.25, .45, .026), (1.25, .7, .02), (2.6, .6, .024)]),
        (0.070, .000, .000, .248, .180, 0, 0,
         [(-2.45, .55, .034), (-1.05, .55, .036), (-.25, .45, .024), (1.25, .7, .02), (2.6, .6, .022)]),
        (0.330, -.012, .000, .208, .146, 0, 0,
         [(-1.15, .70, .040), (-2.55, .40, .040), (RIGHT, .45, .030), (2.25, .5, .024), (-.30, .45, .036)]),
        (0.560, -.020, .000, .214, .148, 0, -.03,
         [(-1.12, .72, .080), (-1.80, .35, -.030), (-2.55, .40, .036), (RIGHT, .45, .028),
          (-.30, .55, .055), (2.3, .5, .018)]),
        (0.800, -.036, .002, .224, .148, 0, -.08,
         [(-2.15, .65, .050), (-.28, .55, .075), (-1.15, .55, .030), (RIGHT, .4, .020)]),
        (1.000, -.054, .006, .246, .152, 0, -.18,
         [(-1.95, .65, .045), (-.25, .60, .072), (BACK, 1.0, .014), (RIGHT, .5, .02)]),
        (1.140, -.046, .002, .262, .156, 0, -.10,
         [(-2.35, .50, .042), (-.42, .60, .060), (-1.55, .45, .026), (-2.85, .45, .040)]),
        (1.300, -.028, .000, .268, .160, 0, 0,
         [(-1.95, .45, .040), (LEFT, .5, .020), (RIGHT, .5, .024), (BACK, .8, .012)]),
        (1.440, -.012, .000, .272, .160, 0, .08,
         [(-1.40, .45, .040), (LEFT, .5, .022), (RIGHT, .5, .020), (-2.5, .5, .014)]),
        (1.555, -.004, .002, .268, .146, 0, .16,
         [(-.80, .50, .034), (.30, .60, .030), (-2.7, .5, -.012)]),
        (1.625, -.010, .006, .200, .120, 0, .18,
         [(.20, .70, .036), (-.75, .45, .018)]),
        (1.675, -.022, .010, .084, .086, -.10, 0, [(.20, .9, .034)]),
        (1.728, -.032, .002, .067, .075, -.28, 0, [(FRONT, .45, .020)]),
        (1.800, -.038, -.004, .082, .094, -.36, 0, [(FRONT, .32, .028), (BACK, .9, .010)]),
        (1.878, -.040, .000, .087, .100, -.36, 0, [(FRONT, .80, .012), (BACK, .9, .016)]),
        (1.950, -.040, .006, .071, .083, -.36, 0, [(BACK, 1.2, .010)]),
    ]
    rings = [hring(z, cx, cy, rx, ry, n, b, rot, tilt) for z, cx, cy, rx, ry, rot, tilt, b in rows]
    g.loft(rings, "flat", (-.040, .010, 2.000))
    # right forearm: elbow buried in the cloth at the right side, hand forward at the waist
    arm = [
        ((-.235, -.020, 1.140), .076, .070, ()),
        ((-.215, -.170, 1.150), .068, .060, ()),
        ((-.190, -.290, 1.180), .048, .043, ()),
        ((-.175, -.360, 1.195), .056, .030, ()),
    ]
    g.loft(path_rings(arm, 6, uref=(0, 0, 1)), "flat", "flat")
    foot(g, -.090, -.150, .115, .052, .070, toe_dir=-.15)
    foot(g, .115, -.190, .110, .050, .065, toe_dir=.20)
    return g


def statue_b():
    """Woman in chiton and palla, the palla drawn over the head (veiled). Weight on the left leg (+x).
    The right forearm crosses the chest to hold the palla at the left collarbone; the left hand, at the hip,
    pulls a corner of the palla down. The palla's lower edge runs diagonally across the shins."""
    g = Geo()
    n = 16
    hem = lambda x: .60 * x        # the palla's edge: low on the right, high on the left  # noqa: E731
    rows = [
        (0.000, .010, .000, .238, .190, 0, 0, [(-2.0, .6, .030)], .018),
        (0.060, .010, .000, .228, .180, 0, 0, [(-2.0, .6, .028)], .017),
        (0.280, .015, .000, .188, .146, 0, 0, [(-1.95, .6, .030)], .014),
        # under the palla's edge (chiton), then the edge itself; both rings tilted by hem()
        (0.470, .018, .000, .182, .144, 0, .60, [(-1.95, .6, .030)], .012),
        (0.505, .022, .000, .226, .176, 0, .60, [(-2.0, .7, .062), (-.30, .5, .046)], .0),
        (0.780, .036, .004, .226, .162, 0, .06,
         [(-.25, .55, .060), (-2.0, .6, .046), (-2.40, .45, .026), (-1.25, .45, .028)], .0),
        (0.985, .058, .010, .242, .168, 0, .18, [(-.10, .6, .050), (-1.50, .5, .026), (BACK, 1.0, .014)], .0),
        (1.140, .046, .002, .214, .146, 0, .08, [(-2.74, .6, .052), (-1.55, .5, .024)], .0),
        (1.280, .030, -.004, .208, .150, 0, 0, [(-2.30, .6, .056), (-.40, .5, .012)], .0),
        (1.400, .016, -.006, .204, .156, 0, -.07, [(-1.45, .7, .058), (-.50, .5, .022)], .0),
        (1.505, .008, .000, .204, .142, 0, -.15, [(-.75, .6, .052), (-2.6, .5, .012)], .0),
        (1.590, .010, .006, .186, .132, .05, -.15, [(-.65, .5, .024)], .0),
        (1.665, .020, .006, .122, .120, .18, 0, [(FRONT, .60, -.030)], .0),
        (1.745, .030, -.002, .110, .116, .34, 0, [(FRONT, .75, -.034), (FRONT, .25, .014)], .0),
        (1.825, .036, -.008, .112, .118, .36, 0, [(FRONT, .90, -.036), (FRONT, .28, .030)], .0),
        (1.905, .038, -.006, .104, .112, .36, 0, [(FRONT, .80, -.018)], .0),
        (1.962, .036, .000, .078, .088, .36, 0, [], .0),
    ]
    rings = []
    for z, cx, cy, rx, ry, rot, tilt, b, pleat in rows:
        rings.append(hring(z, cx, cy, rx, ry, n, b, rot, tilt, pleat))
    g.loft(rings, "flat", (.036, .004, 1.998))
    foot(g, .085, -.160, .105, .048, .060, toe_dir=.10)
    foot(g, -.105, -.200, .110, .048, .060, toe_dir=-.25)
    return g


def pedestal():
    """The round-2 pedestal, unchanged: one solid stepped block, 0.8 x 0.8 x 1.0."""
    g = Geo()

    def square(r, z):
        return [(-r, -r, z), (r, -r, z), (r, r, z), (-r, r, z)]
    g.loft([square(r, z) for r, z in (
        (.40, 0), (.40, .115), (.34, .175), (.34, .86), (.40, .92), (.40, PEDESTAL_HEIGHT))])
    return g


# ------------------------------------------------------------------ dioscuri
HX = .40      # the horse's centre line (x); the youth stands at -x


def horse(g):
    # trunk: chest, girth, barrel, flank, haunch, buttock
    trunk = [
        (-.800, 1.450, .245, .440, [(-math.pi / 2, .7, .030)]),
        (-.520, 1.440, .310, .540, [(math.pi / 2, .45, .035), (-math.pi / 2, .8, .015)]),
        (-.200, 1.420, .335, .510, [(math.pi / 2, .5, .015)]),
        (.150, 1.415, .345, .500, ()),
        (.480, 1.465, .328, .445, [(-math.pi / 2, .9, -.02)]),
        (.760, 1.535, .315, .410, [(math.pi / 2, .6, .012)]),
        (.980, 1.590, .262, .335, ()),
        (1.090, 1.605, .165, .215, ()),
    ]
    # the breast: two pectoral planes either side of a groove instead of a pointed fan
    front = []
    for i in range(12):
        a = TAU * i / 12
        pect = bump(a, -math.pi / 2 - .75, .9) + bump(a, -math.pi / 2 + .75, .9)
        groove = bump(a, -math.pi / 2, .5)
        front.append((HX + .175 * math.cos(a), -.890 - .075 * pect + .030 * groove,
                      1.500 + .290 * math.sin(a)))
    rings = [front] + [yring(y, HX, zc, w, h, 12, b) for y, zc, w, h, b in trunk]
    g.loft(rings, "flat", (HX, 1.150, 1.605))
    # neck and head along one path: up and forward, arched, flexed at the poll, nose down
    mane = math.pi / 2
    neck = [
        ((HX, -.300, 1.580), .190, .300, ()),
        ((HX, -.600, 1.860), .225, .345, [(mane, .35, .030)]),
        ((HX - .005, -.830, 2.110), .175, .285, [(mane, .35, .045)]),
        ((HX - .012, -.950, 2.360), .130, .200, [(mane, .35, .045)]),
        ((HX - .020, -1.020, 2.540), .110, .160, [(mane, .35, .040)]),
        ((HX - .028, -1.060, 2.680), .095, .130, [(mane, .4, .020)]),
        ((HX - .036, -1.150, 2.620), .110, .190, [(-mane, .8, .030)]),
        ((HX - .044, -1.220, 2.440), .090, .130, ()),
        ((HX - .048, -1.255, 2.270), .075, .100, ()),
        ((HX - .050, -1.262, 2.160), .066, .085, ()),
    ]
    g.loft(path_rings(neck, 10), "flat", "flat")
    # ears
    for s in (-1, 1):
        bx, by, bz = HX - .030 + s * .052, -1.050, 2.760
        base = [(bx - .025, by - .025, bz), (bx + .025, by - .025, bz), (bx + .025, by + .025, bz),
                (bx - .025, by + .025, bz)]
        g.loft([base], "flat", (bx + s * .015, by + .010, bz + .200))
    # legs: (x, stations); stations are (y, z, w, h, bumps) from inside the trunk to the hoof
    def leg(x, st):
        stations = [((x + dx, y, z), w, h, b) for dx, y, z, w, h, b in st]
        g.loft(path_rings(stations, 6, vertical_ends=2), "flat", "flat")

    hock = (-math.pi / 2, .7, .030)        # in leg rings, angle pi/2 = front (-y), -pi/2 = back
    knee = (math.pi / 2, .7, .012)
    # near foreleg (towards the youth) stepping forward; far foreleg upright
    for dx, ys in ((-.150, (-.520, -.580, -.650, -.700, -.715, -.760, -.770)),
                   (.150, (-.470, -.470, -.475, -.480, -.470, -.510, -.520))):
        s = 1 if dx > 0 else -1
        leg(HX + dx, [(-s * .03, ys[0], 1.350, .125, .165, ()), (0, ys[1], 1.000, .118, .150, ()),
                      (0, ys[2], .800, .092, .112, ()), (0, ys[3], .590, .074, .084, [knee]),
                      (0, ys[4], .230, .062, .070, ()), (0, ys[5], .095, .072, .082, ()),
                      (0, ys[6], .000, .090, .098, ())])
    # hind legs: near one back, far one forward under the body
    for dxs, y0, shift in ((-.140, .800, .08), (.140, .680, -.06)):
        leg(HX + dxs, [(-dxs * .2, y0, 1.500, .150, .220, ()),
                       (0, y0 - .070 + shift * .2, 1.120, .132, .200, ()),
                       (0, y0 + .060 + shift * .5, .880, .102, .135, ()),
                       (0, y0 + .140 + shift, .620, .074, .095, [hock]),
                       (0, y0 + .100 + shift, .230, .062, .070, ()),
                       (0, y0 + .065 + shift, .095, .072, .082, ()),
                       (0, y0 + .050 + shift, .000, .090, .098, ())])
    # tail: a long hanging cone, clear of the hocks
    tail = [((HX, 1.060, 1.780), .055, .055, ()), ((HX, 1.150, 1.690), .068, .068, ()),
            ((HX + .005, 1.190, 1.350), .075, .072, ()), ((HX + .010, 1.195, .950), .066, .060, ())]
    g.loft(path_rings(tail, 6), "flat", (HX + .012, 1.180, .600))


def youth(g):
    """Nude youth in a pilos, a chlamys pinned at the right shoulder. Weight on the right leg (straight, under
    the head); the left leg free, knee bent, foot set back and out on its toes. Pelvis, ribcage and chest are
    three masses tilted against each other; the left hand is up at the horse's bridle, the head turned to it.
    Body 2.50 m to the crown (head 1/7.5), crotch at 1.20 (48 %), pilos to 2.62."""
    n = 12
    X, Y = -.390, -.620
    rows = [
        # z, cx, cy, rx, ry, rot, tilt, bumps
        (1.170, X - .030, Y + .005, .200, .118, -.06, -.20, [(BACK, .8, .020), (FRONT, .6, -.02)]),
        (1.300, X - .040, Y, .228, .135, -.06, -.26, [(BACK, .8, .028)]),           # pelvis, right hip up
        (1.420, X - .035, Y - .003, .222, .128, -.06, -.26, [(LEFT, .5, .012), (RIGHT, .5, .012)]),
        (1.510, X - .022, Y - .008, .168, .112, 0, -.10, ()),                         # waist
        (1.650, X - .008, Y - .014, .196, .126, .08, .06, [(FRONT, .6, .010)]),       # ribcage
        (1.820, X + .004, Y - .018, .228, .150, .12, .14,
         [(FRONT - .55, .45, .018), (FRONT + .55, .45, .018)]),                         # chest, pectorals
        (1.970, X + .008, Y - .012, .290, .145, .12, .17, [(BACK, .9, .020)]),        # deltoids
        (2.060, X + .010, Y - .006, .232, .120, .12, .18, ()),                       # shoulder slope
        (2.105, X + .012, Y, .098, .096, .15, 0, ()),                                 # thick short neck
        (2.170, X + .016, Y - .006, .086, .094, .35, 0, [(FRONT, .45, .020)]),        # chin
        (2.250, X + .018, Y - .010, .096, .108, .40, 0, [(FRONT, .32, .030)]),        # nose
        (2.330, X + .020, Y - .004, .104, .116, .40, 0, [(BACK, .9, .016)]),          # brow, hair at the back
        (2.400, X + .020, Y + .004, .110, .120, .40, 0, [(BACK, .9, .018)]),          # hair mass
        (2.415, X + .020, Y + .004, .135, .142, .40, 0, ()),                          # pilos rim
        (2.510, X + .020, Y + .006, .122, .128, .40, 0, ()),
        (2.585, X + .020, Y + .006, .082, .088, .40, 0, ()),
    ]
    rings = [hring(z, cx, cy, rx, ry, n, b, rot, tilt) for z, cx, cy, rx, ry, rot, tilt, b in rows]
    g.loft(rings, "flat", (X + .020, Y + .006, 2.620))

    def limb(st, n=6, uref=(1, 0, 0), vertical_ends=0):
        g.loft(path_rings(st, n, uref=uref, vertical_ends=vertical_ends), "flat", "flat")

    calf = (-math.pi / 2, .9, .026)      # leg rings: pi/2 = front, -pi/2 = back
    knee = (math.pi / 2, .6, .010)
    # right leg (weight): vertical, under the head; foot a wedge 0.27 long
    limb([((X - .105, Y, 1.330), .110, .115, ()), ((X - .115, Y, 1.120), .135, .138, ()),
          ((X - .112, Y - .006, .950), .112, .116, ()), ((X - .104, Y - .010, .730), .078, .080, [knee]),
          ((X - .102, Y, .530), .080, .086, [calf]), ((X - .100, Y + .006, .130), .048, .052, ()),
          ((X - .100, Y - .060, .060), .055, .125, ()), ((X - .100, Y - .070, .000), .058, .135, ())],
         n=8, vertical_ends=2)
    # left leg (free): thigh forward, knee bent, shin raking back, foot set back and out on the ball
    limb([((X + .050, Y, 1.250), .110, .115, ()), ((X + .075, Y - .030, 1.060), .134, .138, ()),
          ((X + .100, Y - .070, .890), .108, .112, ()), ((X + .118, Y - .100, .680), .076, .078, [knee]),
          ((X + .135, Y - .020, .480), .078, .084, [calf]), ((X + .165, Y + .150, .170), .048, .052, ()),
          ((X + .175, Y + .070, .060), .055, .090, ()), ((X + .180, Y + .020, .000), .058, .080, ())],
         n=8, vertical_ends=1)
    # left arm up to the bridle: shoulder, elbow, wrist, hand on the horse's cheek strap
    limb([((X + .225, Y - .010, 1.975), .085, .085, ()), ((X + .320, Y - .150, 2.000), .072, .068, ()),
          ((X + .420, Y - .310, 2.030), .058, .054, ()), ((X + .540, Y - .440, 2.180), .054, .050, ()),
          ((X + .630, Y - .520, 2.310), .038, .036, ()), ((X + .680, Y - .565, 2.380), .048, .026, ())],
         uref=(0, 0, 1))
    # right arm inside the chlamys; the forearm and hand come forward out of its front edge
    limb([((X - .230, Y, 1.975), .085, .085, ()), ((X - .285, Y + .020, 1.640), .066, .066, ()),
          ((X - .280, Y - .140, 1.430), .046, .044, ()), ((X - .272, Y - .225, 1.380), .050, .026, ())],
         uref=(0, 0, 1))
    # chlamys: pinned on the right shoulder, across the back, falling in one broad mass down the outer side
    # to mid-calf; the upper arm and the arm-torso join are inside it
    cloak = [
        (2.110, X - .120, Y + .050, .170, .090, ()),
        (2.020, X - .190, Y + .040, .150, .170, [(BACK, .9, .020)]),
        (1.800, X - .275, Y + .040, .130, .190, [(FRONT + .5, .5, .018)]),
        (1.450, X - .290, Y + .030, .120, .205, [(FRONT + .6, .5, .024), (BACK + .5, .5, .018)]),
        (1.050, X - .295, Y + .030, .110, .195, [(FRONT + .6, .5, .024), (BACK - .5, .5, .018)]),
        (0.700, X - .300, Y + .030, .090, .170, [(FRONT + .6, .5, .020)]),
        (0.520, X - .300, Y + .040, .065, .125, ()),
    ]
    g.loft([hring(z, cx, cy, rx, ry, 8, b) for z, cx, cy, rx, ry, b in cloak], "flat",
           (X - .300, Y + .060, .420))


def dioscurus():
    g = Geo()
    horse(g)
    youth(g)
    g.V = [(x, y + .048, z) for x, y, z in g.V]      # centre the 2.6 m footprint (head at -y, tail at +y)
    return g


# ------------------------------------------------------------------ objects and export
def make_object(name, g, mirror=False):
    verts = [(-x, y, z) for x, y, z in g.V] if mirror else g.V
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], g.F)
    me.validate(clean_customdata=False)
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = False
    me.materials.append(kit._make_mat(STONE))
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def build(name):
    """Return (root object, [mesh objects]) at the origin."""
    if name.startswith("statue"):
        fig = make_object("figure", statue_a() if name == "statue_a" else statue_b())
        ped = make_object("pedestal", pedestal())
        shell = bpy.data.objects.new("shell", None)
        bpy.context.scene.collection.objects.link(shell)
        fig.parent = shell
        ped.parent = shell
        fig.location.z = PEDESTAL_HEIGHT
        return shell, [fig, ped]
    ob = make_object("shell", dioscurus(), mirror=(name == "dioscuri_r"))
    return ob, [ob]


def export(name, root, meshes):
    total = 0
    for ob in meshes:
        ob.data.calc_loop_triangles()
        count = len(ob.data.loop_triangles)
        if count > PART_BUDGETS.get(ob.name, BUDGETS[name]):
            raise ValueError(f"{name}/{ob.name} over budget: {count}")
        total += count
    if total > BUDGETS[name]:
        raise ValueError(f"{name} over budget: {total}")
    bpy.ops.object.select_all(action="DESELECT")
    for ob in [root, *meshes]:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = root
    MODELS.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(MODELS / f"rome_tibkit_{name}.glb"), export_format="GLB",
                              use_selection=True, export_yup=True, export_apply=True)
    return total


# ------------------------------------------------------------------ previews
GREY = (0.42, 0.42, 0.42)


def studio():
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = 20
    sc.cycles.use_denoising = True
    sc.render.image_settings.file_format = "PNG"
    world = bpy.data.worlds.new("Preview studio")
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    bg.inputs[0].default_value = (.55, .56, .58, 1)
    bg.inputs[1].default_value = .65
    sc.world = world
    sun = bpy.data.objects.new("Key light", bpy.data.lights.new("Key light", "SUN"))
    sun.data.energy = 2.6
    sun.data.angle = math.radians(5)
    sc.collection.objects.link(sun)
    sun.rotation_euler = Vector((.60, .65, -1)).to_track_quat("-Z", "Y").to_euler()
    grey = bpy.data.materials.new("Preview grey")
    grey.diffuse_color = (*GREY, 1)
    grey.use_nodes = True
    grey.node_tree.nodes.get("Principled BSDF").inputs["Base Color"].default_value = (*GREY, 1)
    me = bpy.data.meshes.new("ground")
    s = 200
    me.from_pydata([(-s, -s, -.002), (s, -s, -.002), (s, s, -.002), (-s, s, -.002)], [], [(0, 1, 2, 3)])
    me.materials.append(grey)
    sc.collection.objects.link(bpy.data.objects.new("ground", me))
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    sc.collection.objects.link(cam)
    sc.camera = cam
    return cam


def shot(cam, eye, target, path, size, lens=None, ortho=None):
    cam.location = eye
    cam.rotation_euler = (Vector(target) - Vector(eye)).to_track_quat("-Z", "Y").to_euler()
    if ortho:
        cam.data.type = "ORTHO"
        cam.data.ortho_scale = ortho
    else:
        cam.data.type = "PERSP"
        cam.data.lens = lens
    sc = bpy.context.scene
    sc.render.resolution_x, sc.render.resolution_y = size
    sc.render.resolution_percentage = 100
    sc.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)


def show_only(roots, keep):
    for name, (root, meshes) in roots.items():
        for ob in [root, *meshes]:
            ob.hide_render = name not in keep


def renders(roots, only):
    RENDERS.mkdir(parents=True, exist_ok=True)
    cam = studio()
    xs = {"statue_a": -4.1, "statue_b": -2.6, "dioscuri_l": -.4, "dioscuri_r": 2.2}
    for name, (root, _) in roots.items():
        root.location.x = xs[name]
    want = lambda k: not only or k in only  # noqa: E731
    if want("all"):
        show_only(roots, roots)
        d = Vector((math.sin(math.radians(30)), -math.cos(math.radians(30)), 0))
        c = Vector((-.95, 0, 1.55))
        shot(cam, c + d * 30 + Vector((0, 0, 4.0)), c, RENDERS / "all.png", (1800, 760), ortho=8.6)
    for name in roots:
        if not want(name.split("_", 1)[1] if False else name):
            continue
        show_only(roots, [name])
        x = xs[name]
        side = -1 if name == "dioscuri_r" else 1
        if name.startswith("statue"):
            c = Vector((x, 0, 2.0))
            dist, h, lens = 7.5, 1.0, 85
        else:
            c = Vector((x, 0, 1.55))
            dist, h, lens = 9.0, 1.4, 70
        a = math.radians(32) * side
        eye = c + Vector((math.sin(a) * dist, -math.cos(a) * dist, h))
        shot(cam, eye, c, RENDERS / f"{name}.png", (1000, 1000), lens=lens)
    if want("side"):
        show_only(roots, ["dioscuri_l"])
        c = Vector((xs["dioscuri_l"], 0, 1.5))
        shot(cam, c + Vector((-9, -1.2, .6)), c, RENDERS / "dioscuri_l_side.png", (1000, 900), lens=60)
    if want("from_below"):
        show_only(roots, ["dioscuri_l"])
        c = Vector((xs["dioscuri_l"], -.2, 1.95))
        a = math.radians(35)
        eye = Vector((c.x + math.sin(a) * 8, c.y - math.cos(a) * 8, 1.66))
        shot(cam, eye, c, RENDERS / "from_below.png", (1200, 1000), lens=45)
    if want("far"):
        show_only(roots, roots)
        c = Vector((-.95, 0, 1.4))
        a = math.radians(35)
        eye = Vector((c.x + math.sin(a) * 40, -math.cos(a) * 40, 1.66))
        shot(cam, eye, c, RENDERS / "far.png", (1600, 900), lens=50)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--skip-renders", action="store_true")
    p.add_argument("--only", default="")
    args = p.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
    roots, counts = {}, {}
    for name in BUDGETS:
        rk.reset()
        root, meshes = build(name)
        counts[name] = export(name, root, meshes)
        for ob in meshes:
            vs = [ob.matrix_world @ v.co for v in ob.data.vertices]
            print("BOUNDS", name, ob.name, [round(min(v[i] for v in vs), 3) for i in range(3)],
                  [round(max(v[i] for v in vs), 3) for i in range(3)])
    print("TRIANGLES", counts)
    if args.skip_renders:
        return
    rk.reset()
    for name in BUDGETS:
        roots[name] = build(name)
        if name.startswith("statue"):
            roots[name][0].name = f"{name}_shell"
    renders(roots, set(filter(None, args.only.split(","))))


if __name__ == "__main__":
    main()
