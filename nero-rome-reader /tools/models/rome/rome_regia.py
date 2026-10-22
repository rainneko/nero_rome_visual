"""Regia (rome_regia), AD 56: office of the Pontifex Maximus, rebuilt in marble by Cn. Domitius Calvinus (36 BC).
Trapezoid plan: front (south, -Y) 22 m, back (north) 20 m, depth 13 m. The north half holds three rooms in a row
(marble walls 6 m high, dark doors on the court side); the south half is an open court closed by a front wall with a
door, and a portico of four columns stands inside the court in front of the rooms. Low-pitched tile roofs, 0.6 m
marble plinth. Origin = centre of the footprint; z = 0 = ground. Built with rk / bl_kit parts."""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *

reset()
F = Frame()

WT = 0.7           # wall thickness
WH = 6.0           # marble wall height of the rooms
COURT_WALL = 3.4   # the court's enclosing walls (front and sides), lower so that the portico shows over them
PLINTH = 0.6       # marble plinth
COURT = 0.12       # top of the court paving (the court is raised a little above the foundation)
OUT = [(-11.0, -6.5), (11.0, -6.5), (10.0, 6.5), (-10.0, 6.5)]      # outer faces, counter-clockwise: SW, SE, NE, NW


def inset(pts, d):
    """Corners of a counter-clockwise polygon with every edge moved inward by d (negative d: outward)."""
    n = len(pts); lines = []
    for i in range(n):
        (x0, y0), (x1, y1) = pts[i], pts[(i + 1) % n]
        dx, dy = x1 - x0, y1 - y0; L = math.hypot(dx, dy)
        lines.append(((x0 - dy / L * d, y0 + dx / L * d), (dx, dy)))     # left normal = inward for a CCW polygon
    res = []
    for i in range(n):
        (px, py), (ux, uy) = lines[i - 1]
        (qx, qy), (vx, vy) = lines[i]
        s = ((qx - px) * vy - (qy - py) * vx) / (ux * vy - uy * vx)
        res.append((px + s * ux, py + s * uy))
    return res


def y_cut(p, q, y):
    """Point where the line p -> q crosses the height y (second coordinate)."""
    s = (y - p[1]) / (q[1] - p[1])
    return (p[0] + s * (q[0] - p[0]), y)


def seg_frame(p0, p1, z0=0.0):
    """Local frame on a wall line: x along p0 -> p1, -y = outside (right side). Returns (frame, length)."""
    return Frame(p0[0], p0[1], z0, math.atan2(p1[1] - p0[1], p1[0] - p0[0]) / D2R), \
        math.hypot(p1[0] - p0[0], p1[1] - p0[1])


def wall_run(p0, p1, z0, h, t, mat, doors=()):
    """A wall piece on the centre line p0 -> p1, from z0 to z0 + h, thickness t. It runs t/2 past both ends so the
    corners close. doors: (u, w, top) = an opening w wide centred u metres from p0, from z0 up to z0 + top, with a
    dark door panel set in the middle of the wall (never see-through)."""
    S, L = seg_frame(p0, p1, z0)
    u_cur = -t / 2
    for (u, w, top) in sorted(doors):
        a, b = u - w / 2, u + w / 2
        if a > u_cur:
            box(S, (u_cur + a) / 2, 0, 0, a - u_cur, t, h, mat)
        if h - top > 0.01:
            box(S, u, 0, top, w, t, h - top, mat)          # lintel over the opening
        box(S, u, 0, 0, w, 0.10, top, 'dark')              # the dark door, set back in the wall
        u_cur = b
    end = L + t / 2
    if end > u_cur:
        box(S, (u_cur + end) / 2, 0, 0, end - u_cur, t, h, mat)


# ---- wall centre lines (the outer faces stay on OUT)
CC = inset(OUT, WT / 2)                      # corners: SW, SE, NE, NW
SW, SE, NE, NW = CC
S0 = y_cut(NW, SW, 0.0)                      # west and east ends of the rooms' south wall (y = 0)
S1 = y_cut(SE, NE, 0.0)
ROOM_X, PART_X = 6.9, 3.6                    # room centres (west, east) and the two partition walls

# ---- foundation (top at z = 0, a little wider than the walls) and the raised court paving
prism(F, inset(OUT, -0.2), -0.6, 0.0, 'tuff')
prism(F, [SW, SE, S1, S0], 0.0, COURT, 'paving')

# ---- walls, counter-clockwise (outside on the right of each line)
front_len = math.hypot(SE[0] - SW[0], SE[1] - SW[1])
wall_run(SW, SE, 0.0, COURT_WALL, WT, 'marble', doors=[(front_len / 2, 2.8, 2.9)])   # court front wall, main door
wall_run(SE, S1, 0.0, COURT_WALL, WT, 'marble')          # court east wall
wall_run(S1, NE, 0.0, WH, WT, 'marble')                  # east wall of the rooms
wall_run(NE, NW, 0.0, WH, WT, 'marble')                  # north wall of the rooms
wall_run(NW, S0, 0.0, WH, WT, 'marble')                  # west wall of the rooms
wall_run(S0, SW, 0.0, COURT_WALL, WT, 'marble')          # court west wall
# the rooms' south wall, facing the court: three dark doors, one into each room
u0 = S0[0]
wall_run(S0, S1, 0.0, WH, WT, 'marble',
         doors=[(-ROOM_X - u0, 2.0, 3.4), (-u0, 2.6, 3.8), (ROOM_X - u0, 2.0, 3.4)])
# partitions between the three rooms
for x in (-PART_X, PART_X):
    wall_run((x, 0.0), (x, NW[1]), 0.0, WH, WT, 'marble')

# ---- cornices (outside the wall faces, the court side included)
for p0, p1, hh in ((SW, SE, COURT_WALL), (SE, S1, COURT_WALL), (S1, NE, WH), (NE, NW, WH), (NW, S0, WH),
                   (S0, SW, COURT_WALL), (S0, S1, WH)):
    cornice(F, p0[0], p0[1], p1[0], p1[1], hh, 0.5, 0.6, 'marble')

# ---- 0.6 m marble plinth round the outside (open at the main door)
oSW, oSE, oNE, oNW = OUT
wall_run(oSE, oNE, 0.0, PLINTH, 0.5, 'marble')
wall_run(oNE, oNW, 0.0, PLINTH, 0.5, 'marble')
wall_run(oNW, oSW, 0.0, PLINTH, 0.5, 'marble')
wall_run(oSW, (-1.65, -6.5), 0.0, PLINTH, 0.5, 'marble')
wall_run((1.65, -6.5), oSE, 0.0, PLINTH, 0.5, 'marble')

# ---- portico of four columns inside the court, in front of the rooms
COL_Y, COL_R, COL_H = -2.5, 0.3, 4.0
for x in (-4.5, -1.5, 1.5, 4.5):
    column(F, x, COL_Y, COURT, COL_H, COL_R, 'marble', 'doric', 12, 12)
ZE = COURT + COL_H                           # top of the columns
entablature(F, -4.8, COL_Y, 4.8, COL_Y, ZE, 0.5, COL_R * 2.6, 'marble')
ZB = ZE + 0.5                                # top of the entablature: the portico roof's front edge
lean_roof(F, -5.1, 0.0, 5.1, 0.0, ZB + 0.8, 2.9, 0.8)       # mono-pitch portico roof against the rooms' wall
for x in (-5.1, 5.1):                        # closing boards at the ends of the portico roof
    q = [(x, 0.0, ZB + 0.8), (x, -2.9, ZB), (x, -2.9, ZB - 0.1), (x, 0.0, ZB + 0.7)]
    add_poly('tile2', q); add_poly('tile2', q[::-1])

# ---- low-pitched hipped tile roof over the three rooms (north half)
hip_roof(F, 0.0, 3.25, WH, 20.0, 6.5, 14.0, 0.5)

human(F, 13.5, -4.0, 0.0)                    # 1.8 m scale figure, previews only
finish('rome_regia', front='-Y')
