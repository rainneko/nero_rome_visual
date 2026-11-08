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



# ================================================================ the garden villa (行宫) east of the colonnade
# 【史】The circus stood in the Gardens of Agrippina on the Vatican plain; Nero rehearsed in a private theatre there
# (Pliny). A suburban garden villa of the time: one-storey ranges round a peristyle, a dining pavilion on the
# garden, a small bath, pergolas, fountains, low garden walls. The treasure room (静室) is the last room of the villa's
# west wing and closes the east end of the colonnade (第26章："回廊深处的一间静室里").
# Plan (x east, y north): west wing + house west range x 75.3..81.2, y -9.7..36; house (peristyle) x 75.3..103.3,
# y 14..36; garden x 81.2..135.5, y -9.6..12.6 with the dining pavilion and pergola at its east end; bath, kitchen
# garden and yard in the north-east; gate on the north wall (y 41..44) toward the approach road. Nothing at y < -9.7.
D = 0.35                      # facade skin depth (opening reveals)
EAVE = 5.6                    # one-storey eave (top of the walls)
PITCH = 22.0
T22 = math.tan(math.radians(PITCH))


def slab_x(x0, x1, pts, mat):
    """Extrude a (y, z) polygon (counter-clockwise with y to the right, z up) from x0 to x1."""
    A = [F.p(x0, y, z) for y, z in pts]; B = [F.p(x1, y, z) for y, z in pts]
    add_poly(mat, list(reversed(A))); add_poly(mat, B)
    for i in range(len(pts)):
        j = (i + 1) % len(pts)
        add_poly(mat, [A[i], A[j], B[j], B[i]])


def slab_y(y0, y1, pts, mat):
    """Extrude an (x, z) polygon (counter-clockwise with x to the right, z up) from y0 to y1."""
    A = [F.p(x, y0, z) for x, z in pts]; B = [F.p(x, y1, z) for x, z in pts]
    add_poly(mat, A); add_poly(mat, list(reversed(B)))
    for i in range(len(pts)):
        j = (i + 1) % len(pts)
        add_poly(mat, [A[i], B[i], B[j], A[j]])


def block(x0, y0, x1, y1, H, mat='plaster2', ops=None, z0=0.0, skip=(), base='plaster', base_h=0.9, band_mat='red',
          cor='marble', nocor=(), nobase=(), inner='dark'):
    """A solid block x0..x1 / y0..y1 from z0 to z0 + H with recessed openings on its faces.
    ops: {'S'|'E'|'N'|'W': [(pos, zb, w, h, kind)]}, pos = x on S/N faces, y on E/W faces (absolute), zb above z0.
    skip: faces that touch another block (no skin). White base band (split at doors), red band and marble cornice
    under the eave (not on faces listed in nocor, e.g. under a lean-to portico roof)."""
    ops = ops or {}
    cx0 = x0 + (0.0 if 'W' in skip else D); cx1 = x1 - (0.0 if 'E' in skip else D)
    cy0 = y0 + (0.0 if 'S' in skip else D); cy1 = y1 - (0.0 if 'N' in skip else D)
    box(F, (cx0 + cx1) / 2, (cy0 + cy1) / 2, z0, cx1 - cx0, cy1 - cy0, H, mat)
    sides = {'S': ((x0, y0 + D), (x1, y0 + D), lambda v: v - x0),
             'E': ((x1 - D, y0), (x1 - D, y1), lambda v: v - y0),
             'N': ((x1, y1 - D), (x0, y1 - D), lambda v: x1 - v),
             'W': ((x0 + D, y1), (x0 + D, y0), lambda v: y1 - v)}
    for k, (p, q, conv) in sides.items():
        if k in skip:
            continue
        o = [(conv(a), zb, w, h, kd) for (a, zb, w, h, kd) in ops.get(k, [])]
        opening_skin(F, p[0], p[1], q[0], q[1], z0, H, o, mat, depth=D, inner=inner)
        L = math.hypot(q[0] - p[0], q[1] - p[1]); ux, uy = (q[0] - p[0]) / L, (q[1] - p[1]) / L
        P = lambda u: (p[0] + ux * u, p[1] + uy * u)
        if base and k not in nobase:
            cuts = sorted((u - w / 2, u + w / 2) for (u, zb, w, h, kd) in o if zb < base_h)
            a = -0.08
            for (c0, c1) in cuts + [(L + 0.08, L + 0.08)]:
                if c0 - a > 0.05:
                    band(F, *P(a), *P(c0), z0, base_h, D + 0.06, base)
                a = max(a, c1)
        if k not in nocor:
            if band_mat:
                band(F, *P(-0.06), *P(L + 0.06), z0 + H - 0.75, 0.22, D + 0.05, band_mat)
            if cor:
                cornice(F, p[0], p[1], q[0], q[1], z0 + H - 0.24, 0.48, D + 0.26, cor)


def hip(x0, y0, x1, y1, z_wall, ov=0.5, pitch=PITCH):
    """Hip roof over a block whose walls end at z_wall (the slope passes the wall line at z_wall)."""
    return hip_roof(F, (x0 + x1) / 2, (y0 + y1) / 2, z_wall - ov * math.tan(math.radians(pitch)), x1 - x0, y1 - y0,
                    pitch, ov)


def pcol(x, y, z0, h, r=None):
    """Stuccoed portico column: white shaft, the lower third painted red (Pompeian)."""
    r = r or h / 17.0
    column(F, x, y, z0, h, r, 'plaster', 'tuscan', 0, 10)
    cyl(F, x, y, z0 + r * 0.5, r * 1.04, h * 0.33, 'red', 10, caps=False)


def wall_run(x0, y0, x1, y1, h=2.4, t=0.5, mat='plaster2', cap='tile'):
    """Garden / enclosure wall with a white base and a small tiled (or marble) ridge coping."""
    wall(F, x0, y0, x1, y1, 0.0, h, t, mat)
    wall(F, x0, y0, x1, y1, 0.0, 0.45, t + 0.1, 'plaster')
    L = math.hypot(x1 - x0, y1 - y0); rot = math.atan2(y1 - y0, x1 - x0)
    S = F.sub(x0, y0, 0, math.degrees(rot))
    hw = t / 2 + 0.12
    A = [S.p(-0.06, -hw, h), S.p(-0.06, hw, h), S.p(-0.06, 0, h + 0.24)]
    B = [S.p(L + 0.06, -hw, h), S.p(L + 0.06, hw, h), S.p(L + 0.06, 0, h + 0.24)]
    add_poly(cap, A[::-1]); add_poly(cap, B)
    add_poly(cap, [A[0], A[2], B[2], B[0]]); add_poly(cap, [A[2], A[1], B[1], B[2]])
    add_poly(cap, [A[1], A[0], B[0], B[1]])


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


def tripod(x, y, z0=0.4, s=0.85):
    """Thin bronze incense tripod (scaled by s): stem, three legs, shallow bowl, a small flame and a smoke wisp."""
    zs = lambda z: z0 + (z - 0.4) * s
    cyl(F, x, y, z0, 0.03, 1.1 * s, 'bronze', 8)
    for a in (0.0, 120.0, 240.0):
        ar = math.radians(a)
        beam(F, x, y, zs(1.45), x + 0.42 * s * math.cos(ar), y + 0.42 * s * math.sin(ar), z0, 0.035, 0.035, 'bronze')
    lathe(F, x, y, [(r * s, zs(z)) for r, z in ((0.01, 1.5), (0.10, 1.5), (0.20, 1.52), (0.22, 1.58), (0.19, 1.58),
                                                (0.10, 1.55), (0.01, 1.55))], 'bronze', 14)
    cyl(F, x, y, zs(1.58), 0.08 * s, 0.25 * s, 'flame', 8, r_top=0.0)
    for k, (dx, r0, r1) in enumerate(((0.0, 0.03, 0.02), (0.03, 0.02, 0.012), (0.05, 0.012, 0.007),
                                      (0.06, 0.007, 0.003))):
        cyl(F, x + dx * s, y, zs(1.85) + 0.3 * s * k, r0, 0.3 * s, 'linen', 6, r_top=r1)


# ---------------------------------------------------------------- treasure room: 5 x 5 m, 4.5 m high, open to the west
RX, RY = 78.2, -6.1                  # room centre; interior x 75.7..80.7, y -8.6..-3.6, floor 0.4, ceiling 4.9
RX0, RX1, RY0, RY1 = 75.7, 80.7, -8.6, -3.6
ZF, ZC = 0.4, 4.9
CW_X0, CW_X1 = 75.25, 75.7           # the end wall that closes the colonnade (the room's front wall)


def ztop(y):                         # top of that wall: just above the colonnade's lean roof (7.6 at y -3.5, 6.6 at -9.5)
    return 6.6 + (y + 9.5) / 6.0 + 0.3


checker_paving(F, RX0, RY0, RX1, RY1, ZF, tile=0.5, mats=('marble', 'basalt'), border=0.25,
               border_mats=('basalt', 'marble'), thick=0.4)             # black-and-white mosaic floor, top 0.4
box(F, (RX0 + 81.2) / 2, -8.85, 0, 81.2 - RX0, 0.5, EAVE, 'plaster2')  # south wall y -9.1..-8.6
box(F, (RX0 + 81.2) / 2, -3.35, 0, 81.2 - RX0, 0.5, EAVE, 'plaster2')  # north wall (to the next room)
box(F, 80.95, RY, 0, 0.5, 5.0, EAVE, 'plaster2')                        # east wall x 80.7..81.2
box(F, RX, RY, ZC, 5.0, 5.0, EAVE - ZC, 'plaster')                      # ceiling slab
# the end wall of the colonnade = the room's front: marble piers, a 4.4 m opening with two columns in antis
box(F, (CW_X0 + CW_X1) / 2, -9.0, 0, CW_X1 - CW_X0, 1.4, 4.4, 'marble')       # south pier y -9.7..-8.3
box(F, (CW_X0 + CW_X1) / 2, -3.5, 0, CW_X1 - CW_X0, 0.8, 4.4, 'marble')       # north pier y -3.9..-3.1
slab_x(CW_X0, CW_X1, [(-9.7, 4.4), (-3.1, 4.4), (-3.1, ztop(-3.1)), (-9.7, ztop(-9.7))], 'plaster2')
beam(F, (CW_X0 + CW_X1) / 2, -9.78, ztop(-9.7) + 0.08, (CW_X0 + CW_X1) / 2, -3.04, ztop(-3.1) + 0.08, 0.62, 0.18,
     'marble')                                                          # coping along the sloping top
box(F, (CW_X0 + CW_X1) / 2, RY, 0, CW_X1 - CW_X0, 4.4, ZF + 0.03, 'marble')    # threshold
for cy in (-7.0, -5.2):
    column(F, (CW_X0 + CW_X1) / 2, cy, ZF + 0.03, 3.97, 0.21, 'marble', 'corinthian', 0, 12, True, 'giallo')
entablature(F, 75.3, -9.75, 75.3, -3.2, 4.4, 0.6, 0.4, 'marble', 'giallo')
# small pediment over the opening (aedicula): porphyry tympanum, marble raking cornices
slab_x(75.12, 75.3, [(-8.4, 5.0), (-3.8, 5.0), (-6.1, 5.75)], 'porphyry')
beam(F, 75.12, -8.75, 4.98, 75.12, -6.1, 5.86, 0.34, 0.17, 'marble')
beam(F, 75.12, -6.1, 5.86, 75.12, -3.45, 4.98, 0.34, 0.17, 'marble')
# outside of the room: white base, red band, marble cornice on the south face; east gable faces the garden
band(F, RX0 - 0.1, -9.1, 81.3, -9.1, 0, 0.9, 0.06, 'plaster')
band(F, RX0 - 0.05, -9.1, 81.25, -9.1, EAVE - 0.75, 0.22, 0.05, 'red')
cornice(F, RX0, -9.1, 81.2, -9.1, EAVE - 0.24, 0.48, 0.26, 'marble')
gable_roof(F, (RX0 + 81.2) / 2, RY, EAVE, 81.2 - RX0, 6.0, PITCH, 'x', 0.5, 'tile', gable_mat='plaster2')
for s in (-1, 1):                                                       # marble rakes on the east gable
    beam(F, 81.27, RY + s * 3.15, EAVE - 0.02, 81.27, RY, EAVE + 3.0 * T22 + 0.02, 0.24, 0.16, 'marble')
# inside: porphyry dado, dark fillet, red walls with giallo-framed panels, giallo cornice, blue ceiling with a gilt rosette
for (cx, cy, sx, sy) in ((RX, RY0 + 0.03, 5.0, 0.06), (RX, RY1 - 0.03, 5.0, 0.06), (RX1 - 0.03, RY, 0.06, 5.0)):
    box(F, cx, cy, ZF, sx, sy, 1.2, 'porphyry')
    box(F, cx, cy, ZF + 1.2, sx, sy, 0.08, 'basalt')
    box(F, cx, cy, ZF + 1.28, sx * 0.99 if sx > 1 else 0.04, sy * 0.99 if sy > 1 else 0.04, ZC - 0.25 - ZF - 1.28, 'red')
    box(F, cx, cy, ZC - 0.25, sx if sx > 1 else 0.2, sy if sy > 1 else 0.2, 0.25, 'giallo')
box(F, RX0 + 0.1, RY, ZC - 0.25, 0.2, 5.0, 0.25, 'giallo')
for px in (77.0, 79.4):
    panel(px, RY0 + 0.07, 2.0, 1.5, 2.1, 'xz')
    panel(px, RY1 - 0.07, 2.0, 1.5, 2.1, 'xz')
panel(RX1 - 0.07, RY, 2.0, 2.4, 2.1, 'yz')
box(F, RX, RY, ZC - 0.03, 3.6, 3.6, 0.03, 'blue')
for (cx, cy, sx, sy) in ((RX, RY - 1.85, 3.8, 0.1), (RX, RY + 1.85, 3.8, 0.1), (RX - 1.85, RY, 0.1, 3.8), (RX + 1.85, RY, 0.1, 3.8)):
    box(F, cx, cy, ZC - 0.05, sx, sy, 0.05, 'gold')
cyl(F, RX, RY, ZC - 0.06, 0.45, 0.04, 'gold', 16)
# furnishings: purple-velvet pedestal 1.2 m, gold dish, the tiny pale cup; four tripods; a small hanging lamp
drape(RX, RY, ZF, ZF + 1.2, 0.3, 0.5, 'flowerP')
lathe(F, RX, RY, [(0.01, 1.6), (0.20, 1.6), (0.23, 1.64), (0.20, 1.66), (0.01, 1.66)], 'gold', 24, smooth=True)
cyl(F, RX, RY, 1.66, 0.035, 0.03, 'linen', 10)                       # foot of the cup
lathe(F, RX, RY, [(0.01, 1.69), (0.03, 1.69), (0.05, 1.70), (0.10, 1.725), (0.12, 1.74), (0.12, 1.745),
                  (0.10, 1.75), (0.07, 1.735), (0.01, 1.73)], 'linen', 20, smooth=True)   # shallow wide bowl
for (tx, ty) in ((RX - 1.75, RY - 1.75), (RX - 1.75, RY + 1.75), (RX + 1.75, RY - 1.75), (RX + 1.75, RY + 1.75)):
    tripod(tx, ty)
beam(F, RX, RY, ZC - 0.05, RX, RY, 4.2, 0.04, 0.04, 'bronze')
lathe(F, RX, RY, [(0.01, 3.7), (0.05, 3.7), (0.12, 3.78), (0.13, 3.9), (0.08, 4.0), (0.01, 4.0)], 'bronze', 12)
cyl(F, RX, RY, 4.0, 0.04, 0.2, 'flame', 8, r_top=0.0)

# ---------------------------------------------------------------- west range: the wing north of the room + house west range
block(75.3, -3.1, 81.2, 36.0, EAVE, 'plaster2',
      ops={'W': [(y, 2.4, 0.8, 1.2, 'rect') for y in (-0.6, 4.4, 14.4, 19.4, 24.4, 29.4, 33.6)] +
                [(9.4, 0.0, 1.4, 2.8, 'rect')],                         # side door toward the theatre's back
           'E': [(0.4, 0.4, 1.3, 3.0, 'rect'), (3.6, 2.3, 0.9, 1.3, 'rect'), (6.8, 0.4, 1.3, 3.0, 'rect'),
                 (10.0, 2.3, 0.9, 1.3, 'rect'), (12.6, 0.4, 1.3, 3.0, 'rect'),
                 (21.8, 0.4, 1.3, 3.0, 'rect'), (25.0, 0.4, 2.6, 3.6, 'rect'), (28.2, 0.4, 1.3, 3.0, 'rect')],
           'N': [(78.25, 2.4, 0.8, 1.2, 'rect')]},
      skip=('S',), nocor=('E',))
hip(75.3, -3.1, 81.2, 36.0, EAVE)
box(F, 75.05, 9.4, 0.0, 0.5, 2.2, 0.2, 'marble')                       # step and marble frame of the side door
box(F, 75.24, 9.4, 2.8, 0.12, 2.0, 0.22, 'marble')
for dy in (-0.82, 0.82):
    box(F, 75.24, 9.4 + dy, 0.2, 0.12, 0.24, 2.6, 'marble')

# ---------------------------------------------------------------- the house: ranges round a peristyle court
block(97.8, 14.0, 103.3, 36.0, EAVE, 'plaster2',                      # east range
      ops={'W': [(28.0, 0.4, 1.3, 3.0, 'rect'), (25.0, 0.4, 2.6, 3.6, 'rect'), (22.0, 0.4, 1.3, 3.0, 'rect')],
           'E': [(y, 2.4, 0.8, 1.2, 'rect') for y in (16.5, 20.5, 24.5, 28.5, 32.5)],
           'S': [(100.5, 0.4, 1.3, 3.0, 'rect')], 'N': [(100.5, 2.4, 0.8, 1.2, 'rect')]},
      nocor=('W', 'S'))
hip(97.8, 14.0, 103.3, 36.0, EAVE)
block(81.2, 30.5, 97.8, 36.0, EAVE, 'plaster2',                       # north range with the entrance
      ops={'N': [(89.5, 0.4, 2.0, 3.3, 'rect'), (84.0, 2.4, 0.8, 1.2, 'rect'), (86.4, 2.4, 0.8, 1.2, 'rect'),
                 (92.6, 2.4, 0.8, 1.2, 'rect'), (95.0, 2.4, 0.8, 1.2, 'rect')],
           'S': [(84.4, 0.4, 1.3, 3.0, 'rect'), (89.5, 0.4, 3.0, 3.6, 'rect'), (94.6, 0.4, 1.3, 3.0, 'rect')]},
      skip=('W', 'E'), nocor=('S',))
gable_roof(F, (78.55 + 100.25) / 2, 33.25, EAVE, 100.25 - 78.55, 5.5, PITCH, 'x', 0.5, 'tile', gable_mat='plaster2')
block(81.2, 14.0, 84.0, 19.5, EAVE, 'plaster2',                       # south range, west piece
      ops={'S': [(82.6, 0.4, 1.2, 3.0, 'rect')], 'N': [(82.6, 0.4, 1.2, 3.0, 'rect')]},
      skip=('W', 'E'), nocor=('S', 'N'))
gable_roof(F, (78.6 + 84.3) / 2, 16.75, EAVE, 84.3 - 78.6, 5.5, PITCH, 'x', 0.5, 'tile', gable_mat='plaster2')
block(94.6, 14.0, 97.8, 19.5, EAVE, 'plaster2',                       # south range, east piece
      ops={'S': [(96.2, 0.4, 1.2, 3.0, 'rect')], 'N': [(96.2, 0.4, 1.2, 3.0, 'rect')]},
      skip=('W', 'E'), nocor=('S', 'N'))
gable_roof(F, (94.3 + 100.25) / 2, 16.75, EAVE, 100.25 - 94.3, 5.5, PITCH, 'x', 0.5, 'tile', gable_mat='plaster2')

# the two-storey block in the middle of the south range: ground floor, upper floor with a loggia over the garden
ZU, HU = EAVE, 3.8                     # upper floor from 5.6 to 9.4
block(84.0, 14.0, 94.6, 19.5, ZU, 'plaster3',
      ops={'S': [(89.3, 0.4, 2.6, 3.6, 'rect'), (86.2, 0.4, 1.2, 3.0, 'rect'), (92.4, 0.4, 1.2, 3.0, 'rect')],
           'N': [(89.3, 0.4, 3.2, 3.8, 'rect'), (86.2, 0.4, 1.2, 3.0, 'rect'), (92.4, 0.4, 1.2, 3.0, 'rect')]},
      skip=('W', 'E'), nocor=('S', 'N'))
block(84.0, 15.8, 94.6, 19.5, HU, 'plaster3', z0=ZU,
      ops={'N': [(x, 1.0, 0.9, 1.4, 'arch') for x in (86.2, 89.3, 92.4)],
           'E': [(17.65, 1.0, 0.9, 1.4, 'arch')], 'W': [(17.65, 1.0, 0.9, 1.4, 'arch')],
           'S': [(86.6, 0.0, 1.1, 2.5, 'rect'), (89.3, 0.0, 1.4, 2.7, 'rect'), (92.0, 0.0, 1.1, 2.5, 'rect')]},
      base=None, nocor=('S',))
band(F, 94.7, 19.5, 83.9, 19.5, ZU - 0.1, 0.25, 0.08, 'red')          # string course between the floors (court side)
box(F, 89.3, 14.0 - 0.02, ZU - 0.15, 10.8, 0.4, 0.25, 'marble')       # loggia floor edge on the garden side
box(F, 89.3, 14.9, ZU, 10.6, 1.8, 0.05, 'paving')                     # loggia floor
for px in (84.35, 94.25):                                             # corner piers of the loggia
    box(F, px, 14.9, ZU, 0.7, 1.8, HU - 0.3, 'plaster3')
box(F, 89.3, 14.35, ZU, 9.2, 0.3, 0.9, 'plaster')                     # parapet between the columns
box(F, 89.3, 14.35, ZU + 0.9, 9.3, 0.4, 0.1, 'marble')
for k in range(4):
    column(F, 84.7 + 9.2 * (k + 1) / 5, 14.35, ZU, 3.0, 0.16, 'marble', 'ionic', 0, 10)
entablature(F, 84.0, 14.35, 94.6, 14.35, ZU + 3.0, 0.5, 0.5, 'marble', 'red')
box(F, 89.3, 14.35, ZU + 3.5, 10.6, 0.7, HU - 3.5, 'plaster3')
cornice(F, 84.0, 14.0, 94.6, 14.0, ZU + HU - 0.24, 0.48, 0.3, 'marble')
hip(84.0, 14.0, 94.6, 19.5, ZU + HU, ov=0.6)

# peristyle: paved walk, 12 stuccoed columns, lean-to roofs, garden with a basin
box(F, 89.5, 25.0, 0, 16.6, 11.0, 0.35, 'paving')
PX0, PX1, PY0, PY1 = 83.8, 95.2, 22.1, 27.9
pts = [(PX0 + (PX1 - PX0) * i / 4, PY0) for i in range(5)] + [(PX0 + (PX1 - PX0) * i / 4, PY1) for i in range(5)] + \
      [(PX0, (PY0 + PY1) / 2), (PX1, (PY0 + PY1) / 2)]
for (x, y) in pts:
    pcol(x, y, 0.35, 3.4)
for (a, b) in (((PX0, PY0), (PX1, PY0)), ((PX1, PY0), (PX1, PY1)), ((PX1, PY1), (PX0, PY1)), ((PX0, PY1), (PX0, PY0))):
    entablature(F, a[0], a[1], b[0], b[1], 3.75, 0.45, 0.42, 'plaster', 'red')
zl = 5.3; sl = (zl - 4.2) / 2.6
lean_roof(F, 97.8, 19.5, 81.2, 19.5, zl, 2.85, 2.85 * sl)
lean_roof(F, 81.2, 30.5, 97.8, 30.5, zl, 2.85, 2.85 * sl)
lean_roof(F, 81.2, 19.5, 81.2, 30.5, zl, 2.85, 2.85 * sl)
lean_roof(F, 97.8, 30.5, 97.8, 19.5, zl, 2.85, 2.85 * sl)
box(F, 89.5, 25.0, 0.35, 10.2, 4.6, 0.08, 'grass')
for (a, b, c, d) in ((84.5, 22.8, 94.5, 22.8), (94.5, 22.8, 94.5, 27.2), (94.5, 27.2, 84.5, 27.2), (84.5, 27.2, 84.5, 22.8)):
    hedge(F, a, b, c, d, 0.35, 0.5, 0.35)
pool(F, 89.5, 25.0, 0.43, 3.6, 1.3, rim_w=0.3, depth=0.4)
statue(F, 89.5, 25.0, 0.2, 1.1, 'bronze', 0.5, 0.0, 'marble')
for fx in (86.2, 92.8):
    box(F, fx, 25.0, 0.43, 1.6, 2.6, 0.18, 'flowerR' if fx < 89 else 'flowerY')

# entrance porch on the north front (toward the gate)
box(F, 89.5, 36.9, 0, 4.4, 1.8, 0.25, 'marble')
for px in (88.0, 91.0):
    column(F, px, 37.55, 0.25, 3.75, 0.19, 'marble', 'ionic', 0, 10)
entablature(F, 87.6, 37.55, 91.4, 37.55, 4.0, 0.45, 0.42, 'marble')
gable_roof(F, 89.5, 36.85, 4.45, 3.8, 1.7, PITCH, 'y', 0.3, 'tile', gable_mat='marble', pediment=True, tymp_mat='red')
for bx in (85.4, 93.6):                                               # stone benches by the door
    box(F, bx, 36.45, 0, 2.4, 0.6, 0.45, 'stone')

# ---------------------------------------------------------------- the garden portico: along the wing and the house front
box(F, 82.975, 2.45, 0, 3.55, 23.1, 0.4, 'paving')                    # walk along the wing, x 81.2..84.75
box(F, 92.0, 12.225, 0, 21.6, 3.55, 0.4, 'paving')                    # walk along the house, y 10.45..14
CWX, CWY = 84.3, 10.9
ys = [-8.6 + (CWY + 8.6) * i / 6 for i in range(7)]
xs = [CWX + 3.1 * i for i in range(6)]
for y in ys:
    pcol(CWX, y, 0.4, 3.5)
for x in xs[1:]:
    pcol(x, CWY, 0.4, 3.5)
entablature(F, CWX, -9.1, CWX, CWY + 0.3, 3.9, 0.5, 0.45, 'plaster', 'red')
entablature(F, CWX - 0.3, CWY, 102.8, CWY, 3.9, 0.5, 0.45, 'plaster', 'red')
zp = 5.3; sp = (zp - 4.4) / 3.1
lean_roof(F, 81.2, -9.1, 81.2, 14.0, zp, 3.45, 3.45 * sp)
lean_roof(F, 81.2, 14.0, 103.3, 14.0, zp, 3.55, 3.55 * sp)
# south end of the walk: an arched gate from the colonnade's forecourt into the garden walk, white base, steps
arcade(F, 81.2, -9.35, 84.65, -9.35, 0.0, zp - 3.45 * sp, 0.5, 1, 'plaster2', open_w=2.0, open_h=3.3,
       impost_mat='marble')
slab_y(-9.6, -9.1, [(81.2, zp - 3.45 * sp), (84.65, zp - 3.45 * sp), (81.2, zp)], 'plaster2')
for (a, b) in ((81.1, 81.925), (83.925, 84.75)):
    band(F, a, -9.6, b, -9.6, 0, 0.9, 0.06, 'plaster')
box(F, 82.925, -9.35, 0, 2.0, 0.5, 0.4, 'marble')
box(F, 82.925, -9.9, 0, 2.4, 0.6, 0.2, 'marble')
slab_x(102.8, 103.3, [(10.45, 0), (14.0, 0), (14.0, zp), (10.45, zp - 3.55 * sp)], 'plaster2')  # east end wall (anta)

def parterre(cx, cy, w, d):
    """A box-hedge parterre: clipped border, lawn, a low clipped centre piece and roses in the corners."""
    for (a, b, c, e) in ((-w / 2, -d / 2, w / 2, -d / 2), (w / 2, -d / 2, w / 2, d / 2), (w / 2, d / 2, -w / 2, d / 2),
                         (-w / 2, d / 2, -w / 2, -d / 2)):
        hedge(F, cx + a, cy + b, cx + c, cy + e, 0.0, 0.55, 0.45)
    box(F, cx, cy, 0.0, w - 0.4, d - 0.4, 0.1, 'grass')
    box(F, cx, cy, 0.1, 2.2, 1.4, 0.5, 'hedge')
    box(F, cx, cy, 0.6, 1.2, 0.7, 0.25, 'hedge')
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(F, cx + sx * (w / 2 - 1.1), cy + sy * (d / 2 - 1.0), 0.1, 0.9, 0.9, 0.35, 'flowerR' if sx * sy > 0 else 'flowerW')
            hedge(F, cx + sx * 1.6, cy + sy * (d / 2 - 1.0), cx + sx * (w / 2 - 1.9), cy + sy * (d / 2 - 1.0), 0.1, 0.35, 0.3)


# ---------------------------------------------------------------- garden: walls, walks, fountain, box parterres, statues
wall_run(84.65, -9.35, 135.5, -9.35, 1.4, 0.5, 'plaster2', 'tile')    # low wall on the track side
wall_run(135.25, -9.6, 135.25, 41.0, 2.4)                               # east wall
wall_run(75.3, 40.75, 85.3, 40.75, 2.4)                                 # north wall, west of the gate
wall_run(93.3, 40.75, 135.5, 40.75, 2.4)                                # north wall, east of the gate
wall_run(75.55, 36.0, 75.55, 40.75, 2.4)                                # closes the forecourt on the west
GX, GY = 99.0, 0.7                                                       # fountain at the crossing of the walks
for (x0, x1) in ((84.75, GX - 3.55), (GX + 3.55, 113.0)):
    box(F, (x0 + x1) / 2, GY, 0, x1 - x0, 2.0, 0.1, 'gravel')
for (y0, y1) in ((-9.1, GY - 3.55), (GY + 3.55, 10.45)):
    box(F, GX, (y0 + y1) / 2, 0, 2.0, y1 - y0, 0.1, 'gravel')
lathe(F, GX, GY, [(3.6, 0.0), (3.6, 0.1), (2.6, 0.1)], 'gravel', 32, smooth=False)
lathe(F, GX, GY, [(2.6, 0.0), (2.6, 0.45), (2.2, 0.45), (2.2, 0.05)], 'marble', 32, smooth=False)
cyl(F, GX, GY, 0.0, 2.2, 0.32, 'water', 32)
lathe(F, GX, GY, [(0.4, 0.3), (0.26, 0.5), (0.2, 1.05), (0.85, 1.25), (0.95, 1.4), (0.8, 1.4), (0.1, 1.3)], 'marble', 16)
cyl(F, GX, GY, 1.25, 0.8, 0.1, 'water', 16)
statue(F, GX, GY, 1.3, 1.5, 'bronze', 0.35, 0.0, 'marble')            # the fountain group: a figure on the basin
for a in (90.0, 210.0, 330.0):                                          # three small bronze figures on the rim
    ar = math.radians(a)
    statue(F, GX + 2.4 * math.cos(ar), GY + 2.4 * math.sin(ar), 0.45, 1.2, 'bronze', 0.25, a + 90.0, 'marble')
for (bx, by) in ((90.75, -4.6), (107.25, -4.6), (90.75, 6.0), (107.25, 6.0)):
    parterre(bx, by, 9.5, 7.2)
for (sx, sy) in ((GX - 3.05, GY - 3.05), (GX + 3.05, GY - 3.05), (GX - 3.05, GY + 3.05), (GX + 3.05, GY + 3.05),
                 (112.4, GY - 1.6), (112.4, GY + 1.6), (85.6, GY - 1.6), (85.6, GY + 1.6)):
    statue(F, sx, sy, 0.0, 1.9, 'marble', 1.0, 0.0, 'marble')
hedge(F, 103.6, 12.6, 107.0, 12.6, 0.0, 0.9, 0.6)                       # box hedge between garden and kitchen garden
hedge(F, 109.0, 12.6, 134.9, 12.6, 0.0, 0.9, 0.6)
CYPRESS = [(113.8, -7.6), (113.8, 9.2), (121.8, -7.6), (121.8, 9.2), (133.6, -7.6), (133.6, 9.2), (84.6, 38.6),
           (94.4, 38.6)]
for (cx, cy) in CYPRESS:                                                # soil beds for cypresses (the page plants them)
    cyl(F, cx, cy, 0.0, 0.9, 0.11, 'mud', 12)

# ---------------------------------------------------------------- dining pavilion (triclinium) opening west on the garden
box(F, 128.45, GY, 0, 11.3, 12.8, 0.6, 'plaster')                       # podium x 122.8..134.1, y -5.7..7.1
for k in range(3):
    box(F, 122.8 - 0.35 * (3 - k) / 2, GY, 0, 0.35 * (3 - k), 5.4, 0.2 * (k + 1), 'marble')
block(126.4, -5.3, 133.6, 6.7, 5.25, 'plaster3', z0=0.6,
      ops={'W': [(GY, 0.0, 2.8, 3.8, 'rect'), (-3.0, 1.4, 1.0, 1.8, 'rect'), (4.4, 1.4, 1.0, 1.8, 'rect')],
           'E': [(GY - 2.5, 1.6, 0.9, 1.5, 'rect'), (GY + 2.5, 1.6, 0.9, 1.5, 'rect')],
           'N': [(130.0, 1.6, 0.9, 1.5, 'rect')], 'S': [(130.0, 1.6, 0.9, 1.5, 'rect')]},
      base='plaster', base_h=0.5, nocor=('W',))
ycols = [-4.95 + (6.35 + 4.95) * i / 3 for i in range(4)]
for y in ycols:
    column(F, 123.8, y, 0.6, 4.6, 0.25, 'marble', 'corinthian', 0, 12, True, 'giallo')
entablature(F, 123.8, -5.3, 123.8, 6.7, 5.2, 0.65, 0.6, 'marble', 'red')
for y in (ycols[0], ycols[-1]):
    entablature(F, 123.8, y, 126.4, y, 5.2, 0.65, 0.6, 'marble', 'red')
gable_roof(F, 128.5, GY, 5.85, 10.2, 12.0, 18.0, 'x', 0.5, 'tile', gable_mat='plaster3', pediment=True,
           tymp_mat='plaster3')
# pergola over a paved terrace in front, with a marble table and benches
box(F, 117.35, GY, 0, 8.7, 8.2, 0.25, 'paving')
pergola(F, 113.3, -3.1, 121.5, 4.5, 0.25, 2.7)
cyl(F, 117.4, GY, 0.25, 0.55, 0.75, 'marble', 16)
for by in (GY - 1.7, GY + 1.7):
    box(F, 117.4, by, 0.25, 2.6, 0.55, 0.45, 'marble')

# ---------------------------------------------------------------- small bath (north-east): hall, domed sweating room, furnace
block(107.0, 25.0, 117.0, 33.0, 4.8, 'plaster2',
      ops={'S': [(109.5, 1.4, 1.3, 2.2, 'arch'), (112.0, 0.0, 1.3, 2.8, 'rect'), (114.5, 1.4, 1.3, 2.2, 'arch')],
           'W': [(29.0, 0.0, 1.3, 2.8, 'rect')], 'N': [(110.0, 2.2, 0.8, 1.0, 'rect'), (114.0, 2.2, 0.8, 1.0, 'rect')]})
hip(107.0, 25.0, 117.0, 33.0, 4.8)
BX, BY, BR = 120.2, 29.0, 3.2
cyl(F, BX, BY, 0.0, BR, 4.4, 'plaster2', 24, caps=False)
lathe(F, BX, BY, [(BR + 0.08, 0.0), (BR + 0.08, 0.9), (BR, 0.9)], 'plaster', 24, smooth=False)
lathe(F, BX, BY, [(BR, 3.85), (BR + 0.08, 3.85), (BR + 0.08, 4.05), (BR, 4.05)], 'red', 24, smooth=False)
lathe(F, BX, BY, [(BR, 4.1), (BR + 0.3, 4.3), (BR + 0.3, 4.45), (BR - 0.15, 4.45)], 'marble', 24, smooth=False)
dome(F, BX, BY, 4.4, BR - 0.15, 'plaster3', 24, 7)
cyl(F, BX, BY, 4.4 + BR - 0.35, 0.45, 0.45, 'plaster3', 12)             # small lantern over the oculus
cone_roof(F, BX, BY, 4.4 + BR + 0.1, 0.65, 0.45, 'bronze', 12, tiles=False, finial=None)
for a in (225.0, 270.0, 315.0):                                         # arched windows (dark recesses) on the sunny side
    ar = math.radians(a)
    box(F, BX + (BR + 0.01) * math.cos(ar), BY + (BR + 0.01) * math.sin(ar), 1.6, 0.9, 0.06, 1.7, 'dark', a + 90.0)
    box(F, BX + (BR + 0.1) * math.cos(ar), BY + (BR + 0.1) * math.sin(ar), 1.45, 1.1, 0.22, 0.15, 'marble', a + 90.0)
block(118.6, 31.6, 122.8, 35.4, 2.8, 'brick', ops={'N': [(120.7, 0.0, 1.2, 1.5, 'arch')]}, base=None, band_mat=None,
      cor=None)                                                         # furnace (praefurnium) with the stoking arch
lean_roof(F, 122.8, 32.4, 118.6, 32.4, 3.3, 3.3, 0.6)
box(F, 121.9, 34.4, 0.0, 0.9, 0.9, 7.8, 'brick')                       # chimney
box(F, 121.9, 34.4, 7.8, 1.2, 1.2, 0.2, 'tile2')
box(F, 121.9, 34.4, 8.0, 0.6, 0.6, 0.35, 'brick')
for j in range(3):                                                      # firewood stacked by the furnace
    for k in range(3 - j):
        box(F, 125.0, 33.5 + 0.48 * k + 0.24 * j, 0.32 * j, 2.8, 0.44, 0.32, 'wood')
box(F, 112.0, 24.3, 0, 10.0, 1.4, 0.12, 'paving')                      # paving in front of the bath
# service range against the north wall (kitchen, store, slaves' rooms): one storey, lean-to roof
block(110.0, 37.0, 127.0, 40.5, 3.0, 'plaster2', skip=('N',), band_mat=None, cor=None,
      ops={'S': [(112.5, 0.0, 1.2, 2.4, 'rect'), (116.0, 1.5, 0.7, 0.8, 'rect'), (119.5, 0.0, 1.2, 2.4, 'rect'),
                 (123.0, 1.5, 0.7, 0.8, 'rect'), (125.5, 0.0, 1.2, 2.4, 'rect')]})
slab_x(110.0, 127.0, [(37.0, 3.0), (40.5, 3.0), (40.5, 3.86)], 'plaster2')   # gable infill under the lean-to
lean_roof(F, 109.7, 40.5, 127.3, 40.5, 3.9, 4.1, 1.0)

# ---------------------------------------------------------------- kitchen garden, well, paths, forecourt and gate
box(F, 113.5, 18.4, 0, 14.0, 8.4, 0.06, 'mud')                         # vegetable plot
for i in range(8):
    box(F, 113.5, 14.9 + 1.0 * i, 0.06, 13.0, 0.42, 0.18, 'moss' if i % 2 == 0 else 'grass')
ORCHARD = [(124.5 + 4.0 * i, 15.6 + 3.6 * j) for i in range(3) for j in range(3)]
for (ox, oy) in ORCHARD:                                                # soil beds for fruit trees (the page plants them)
    cyl(F, ox, oy, 0.0, 0.7, 0.1, 'mud', 10)
lathe(F, 128.5, 28.5, [(0.85, 0.0), (0.85, 0.9), (0.6, 0.9), (0.6, 0.2)], 'stone', 16, smooth=False)
cyl(F, 128.5, 28.5, 0.0, 0.6, 0.25, 'dark', 16)
for dx in (-0.8, 0.8):
    box(F, 128.5 + dx, 28.5, 0.0, 0.14, 0.14, 2.3, 'wood')
beam(F, 127.6, 28.5, 2.25, 129.4, 28.5, 2.25, 0.14, 0.14, 'wood')
box(F, 105.0, 26.55, 0, 2.0, 27.9, 0.08, 'gravel')                     # path east of the house
box(F, 89.5, 38.25, 0, 11.0, 4.5, 0.08, 'gravel')                      # forecourt
box(F, 89.3, 42.0, 0, 3.0, 4.0, 0.08, 'gravel')                        # through the gate
box(F, 89.3, 44.5, 0, 3.0, 1.0, 0.08, 'gravel')                        # toward the road (to y 45)
# gate building: a block with an arched passage, tiled gable roof with a pediment toward the road
arcade(F, 85.3, 42.0, 93.3, 42.0, 0.0, 4.6, 4.0, 1, 'plaster3', open_w=3.0, open_h=3.9, impost_mat='marble')
for (a, b) in ((85.2, 87.8), (90.8, 93.4)):                            # white base on both faces, open at the passage
    band(F, b, 44.0, a, 44.0, 0, 0.8, 0.06, 'plaster')
    band(F, a, 40.0, b, 40.0, 0, 0.8, 0.06, 'plaster')
cornice(F, 93.3, 44.0, 85.3, 44.0, 4.36, 0.48, 0.28, 'marble')
cornice(F, 85.3, 40.0, 93.3, 40.0, 4.36, 0.48, 0.28, 'marble')
gable_roof(F, 89.3, 42.0, 4.6, 8.0, 4.0, PITCH, 'y', 0.4, 'tile', gable_mat='plaster3', pediment=True,
           tymp_mat='plaster3')
for gx in (87.95, 90.65):                                               # the two door leaves, standing open
    box(F, gx, 41.15, 0.0, 0.12, 1.5, 3.3, 'wood')
for wx in (86.5, 92.1):                                                 # porter's windows
    box(F, wx, 44.02, 2.2, 0.7, 0.06, 0.9, 'dark')
    box(F, wx, 44.06, 2.08, 0.9, 0.14, 0.12, 'marble')

human(F, -30.0, -20.0, 0.0)
human(F, 96.0, -3.0, 0.0)
bpy.context.scene.eevee.taa_render_samples = 8          # low-sample previews (shared Mac)
finish('rome_nero_theatre', front='-Y',
       extra_cams=[('stage', Vector((0.0, 1.0, 0.0)), 14), ('east', Vector((1.0, -0.6, 0.0)), 14),
                   ('high', Vector((0.0, -1.0, 0.0)), 28)])

# ---------------------------------------------------------------- close-ups (same scene, after export)
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


_e = math.radians(35.0); _d = 112.0; _t = (106.0, 15.0, 0.0)
_shot('villa_aerial', (_t[0] + _d * math.cos(_e) * 0.7071, _t[1] + _d * math.cos(_e) * 0.7071, _d * math.sin(_e)), _t)
_shot('villa_colonnade', (68.0, -19.5, 5.0), (106.0, 4.0, 3.0))        # from the colonnade's end, looking east
_shot('villa_court', (82.6, 20.6, 3.0), (95.0, 28.0, 2.2))              # the peristyle court
_shot('villa_roomgable', (93.0, -4.0, 3.4), (81.5, -6.1, 5.0))          # the room's east gable over the garden walk
_shot('villa_garden', (119.5, -6.8, 3.6), (88.0, 13.0, 4.5))           # from the pergola back to the house
_shot('villa_room_south', (68.0, -26.0, 8.0), (79.0, -5.0, 4.0))       # the colonnade end and the room from the track side
_shot('villa_west', (40.0, 32.0, 14.0), (80.0, 2.0, 3.0))               # from the meadow behind the colonnade
_shot('villa_gate', (104.0, 82.0, 16.0), (98.0, 25.0, 2.0))             # the north front with the gate
_shot('treasure_west', (70.5, RY, 2.3), (RX, RY, 1.9))                  # straight into the open front
_shot('treasure_colonnade', (60.0, -7.6, 2.6), (RX, RY, 2.2))          # from inside the colonnade
