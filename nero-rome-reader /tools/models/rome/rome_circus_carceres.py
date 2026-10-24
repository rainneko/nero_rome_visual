"""Starting gates of the Circus Maximus (rome_circus_carceres), AD 56. Asset front = -Y (the arena side).

Metres; x east, y north, z = 0 arena level. 168 m wide (x -84..84), 16 m deep at the gate.
Central gate (Porta Pompae, detailed in rome_circus_carceres_gate.py): 30 x 16 m, triumphal-arch front on both faces,
7 x 12 m through arch, magistrate's loggia on the arena side, gilded quadriga on the attic, flight of steps and statues
on the street side. Twelve stalls (six each side): 4.4 m arched openings with red lattice gates on an 8.83 m pitch,
marble piers with herm heads; the row is curved so the outer stalls stand 3 m further back. Above: a 5 m storey, a
balustraded terrace and statues. Towers 16 x 16 m, 24 m tall at both ends. Travertine back (+Y) wall, three arches.
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
from rk import _arch_pts
from mathutils import Vector
from rome_circus_carceres_gate import build_gate, ST_Z

reset()
F = Frame()

X_GATE = 15.0                                   # gate half-width (gate 30 m)
X_END = 84.0                                    # half-width of the whole asset
TOWER_W, TOWER_H = 16.0, 24.0
PITCH = (X_END - TOWER_W - X_GATE) / 6.0        # 8.83 m: six stalls per side fill x 15..68
STALL_W, STALL_H = 4.4, 7.0                     # stall opening (crown height)
STOREY = 5.0                                    # storey over the stalls
TOP = STALL_H + STOREY                          # 12 m: terrace level
DEPTH = 16.0                                    # stall block depth
ROW_BACK = 3.0                                  # outer stalls stand this far back (+Y)


def front_y(x):
    """Arena-side face of the stall row at x (|x| >= 15): a gentle curve, ROW_BACK m further back at the ends."""
    t = min(1.0, (abs(x) - X_GATE) / (X_END - TOWER_W - X_GATE))
    return -DEPTH / 2 + ROW_BACK * t * t


def cl_y(x):
    """Centre line of a stall block (its arcade wall is DEPTH thick)."""
    return front_y(x) + DEPTH / 2


def back_y(x):
    """Centre line of the 1 m travertine back wall: its outer face is 0.5 m beyond the block back face."""
    return front_y(x) + DEPTH + 0.5


def seg_frame(x0, y0, x1, y1):
    """Local frame of a wall line p0 -> p1 (same rotation the kit's arcade uses) and its length."""
    rot = math.atan2(y1 - y0, x1 - x0) / D2R
    return F.sub(x0, y0, 0, rot), math.hypot(x1 - x0, y1 - y0)


def lattice_gate(W, uc, ow, zs, yy):
    """Double gate of wooden lattice in an arched opening: red frame and wooden bars (local frame W, centre uc)."""
    a0, a1 = uc - ow / 2, uc + ow / 2
    arch = _arch_pts(a0, a1, zs, 12)
    for p, q in zip(arch[:-1], arch[1:]):
        beam(W, p[0], yy, p[1], q[0], yy, q[1], 0.14, 0.14, 'red')
    for u in (a0, a1):
        beam(W, u, yy, 0.15, u, yy, zs, 0.14, 0.14, 'red')
    for k in (1, 2, 3):
        u = a0 + ow * k / 4
        top = zs + math.sqrt(max(0.0, (ow / 2) ** 2 - (u - uc) ** 2))
        beam(W, u, yy, 0.15, u, yy, top, 0.07, 0.07, 'wood')
    for zb in (1.6, 3.2):
        beam(W, a0, yy, zb, a1, yy, zb, 0.07, 0.07, 'wood')


def stall(i, sd):
    """Stall i (0 = next to the gate) on side sd (-1 west, +1 east). Each stall runs in +x, so its outside
    (the right-hand side of the line) is the arena side."""
    if sd > 0:
        xa, xb = X_GATE + i * PITCH, X_GATE + (i + 1) * PITCH
    else:
        xb, xa = -(X_GATE + i * PITCH), -(X_GATE + (i + 1) * PITCH)
    ya, yb = cl_y(xa), cl_y(xb)
    arcade(F, xa, ya, xb, yb, 0.0, TOP, DEPTH, 1, 'marble', open_w=STALL_W, open_h=STALL_H, back='dark',
           impost_mat='marble')
    W, L = seg_frame(xa, ya, xb, yb)
    lattice_gate(W, L / 2, STALL_W, STALL_H - STALL_W / 2, -DEPTH / 2 + 0.25)
    fa, fb = front_y(xa), front_y(xb)
    band(F, xa, fa, xb, fb, 7.4, 0.3, 0.42, 'red')
    cornice(F, xa, fa, xb, fb, TOP - 0.5, 0.5, 0.55, 'marble')
    balustrade(F, xa, fa - 0.4, xb, fb - 0.4, TOP, 1.0, 'marble', 2.2, 0.28)
    xm = (xa + xb) / 2
    statue(F, xm, front_y(xm) + 1.6, TOP, 2.6, 'marble', pedestal=0.8, ped_mat='marble')


def herm(x, y):
    """A marble pilaster with a herm head, on the front face of the row."""
    box(F, x, y, 0, 0.9, 0.5, TOP - 0.4, 'marble')
    box(F, x, y, 8.3, 0.9, 0.6, 0.25, 'marble')
    cyl(F, x, y, 8.55, 0.18, 0.5, 'marble', 8)
    sphere(F, x, y, 9.25, 0.34, 'marble', 10, 6)


def back_wall(sd):
    """Plain travertine back wall (+Y side, down to the street ground) with one arched opening per side."""
    if sd > 0:
        p0, p1 = (68.0, back_y(68.0)), (X_GATE, back_y(X_GATE))
    else:
        p0, p1 = (-X_GATE, back_y(-X_GATE)), (-68.0, back_y(-68.0))
    arcade(F, p0[0], p0[1], p1[0], p1[1], ST_Z, TOP - ST_Z, 1.0, 1, 'travertine', open_w=7.0, open_h=9.0, back='dark',
           impost_mat='travertine')
    cornice(F, p0[0], p0[1] + 0.5, p1[0], p1[1] + 0.5, TOP - 0.5, 0.5, 0.55, 'travertine')


# ------------------------------------------------------------------ central gate (detailed, own module)
build_gate(F)

# ------------------------------------------------------------------ rows, back walls, herms
for sd in (-1, 1):
    for i in range(6):
        stall(i, sd)
    back_wall(sd)
    for i in range(1, 6):
        x = sd * (X_GATE + i * PITCH)
        herm(x, front_y(x) - 0.2)

# ------------------------------------------------------------------ end towers
for sd in (-1, 1):
    square_tower(F, sd * (X_END - TOWER_W / 2), 2.0, TOWER_W, TOWER_H, wall_mat='travertine', roof='pyramid',
                 pitch=30.0, foundation=8.0, cornice_mat='marble', band_mat='red')

preview_ground(-8.5)
import bpy
bpy.context.scene.eevee.taa_render_samples = 16      # low-sample previews
finish('rome_circus_carceres', front='-Y')
