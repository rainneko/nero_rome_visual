"""rk · Rome kit (Rome in AD 56): everything in ../antium/bl_kit.py plus Roman parts.

Run an asset script with:
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/<asset>.py"

Asset script skeleton:
  import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
  from rk import *
  reset()
  F = Frame()                      # origin = centre of the footprint, z = 0 = main floor level
  ... build ...
  finish('rome_xxx', front='-Y')   # -> assets/models/rome/rome_xxx.glb + renders/rome_xxx/{front,side,three,top}.png

Conventions (same as bl_kit): metres; Blender +X = east, +Y = north, +Z = up; wall lines run counter-clockwise,
the outside is on the RIGHT of p0 -> p1. No trees and no people (the page adds them). No glass (AD 56).
Every part stands on something: steps, columns and walls go down to the floor or foundation below them.
"""
import os, sys, math, random
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'antium'))
import bl_kit as _bk
from bl_kit import *            # noqa: F401,F403  reset, Frame, box, beam, prism, cyl, sphere, lathe, column, ...
from bl_kit import _F, _arch_pts
from mathutils import Vector

_bk.GLB_SUB = 'rome'
_bk.PAL.update({
    'grey':       ((0.60, 0.61, 0.62), 0.0, 0.45),   # grey marble (bardiglio)
    'giallo':     ((0.86, 0.72, 0.42), 0.0, 0.45),   # giallo antico, yellow Numidian marble
    'porphyry':   ((0.46, 0.17, 0.18), 0.0, 0.40),   # rosso antico / porphyry
    'granite':    ((0.58, 0.40, 0.35), 0.0, 0.55),   # red Egyptian granite (obelisks)
    'peperino':   ((0.43, 0.42, 0.39), 0.0, 0.92),   # dark grey volcanic stone (old podia)
    'travertine': ((0.84, 0.80, 0.70), 0.0, 0.85),
    'basalt':     ((0.26, 0.26, 0.27), 0.0, 0.80),   # street paving stones (selce)
    'rock':       ((0.79, 0.75, 0.68), 0.0, 0.95),   # pale limestone of the hills, #c9bfae (was a brown tuff)
    'rock2':      ((0.66, 0.62, 0.54), 0.0, 0.95),   # darker stain on rock faces, #a89d8a
    'moss':       ((0.60, 0.65, 0.29), 0.0, 0.90),   # yellow-green moss and grass on ledge tops, #9aa64a
    'pav_red':    ((0.62, 0.24, 0.17), 0.0, 0.50),   # red marble inlay bands
    'pav_blue':   ((0.24, 0.34, 0.52), 0.0, 0.50),   # blue-grey inlay bands
    'blue':       ((0.20, 0.36, 0.62), 0.0, 0.80),   # Egyptian blue paint
    'plaster2':   ((0.87, 0.71, 0.52), 0.0, 0.88),   # warm ochre plaster (houses)
    'plaster3':   ((0.83, 0.64, 0.56), 0.0, 0.88),   # pinkish plaster
    'mud':        ((0.62, 0.55, 0.43), 0.0, 0.95),   # mud-and-lime daub over the timber-framed floors
    'linen':      ((0.92, 0.90, 0.84), 0.0, 0.95),   # laundry, awnings
    'awning':     ((0.76, 0.58, 0.32), 0.0, 0.95),
    'flame':      ((1.00, 0.55, 0.15), 0.0, 1.00),   # fire in braziers (the page makes it glow)
})

ROT = {'-Y': 0.0, '+X': 90.0, '+Y': 180.0, '-X': 270.0}


def preview_ground(z):
    """Put the grey preview ground at height z (default -0.05). Call it before finish() when the asset has
    terrace walls or substructures going down below its floor, so the renders show them."""
    _bk.PREVIEW_GROUND = z


def vdisc(F, x, y, z, r, t, mat, seg=12):
    """A vertical disc (wheel) centred at (x, y, z), axis along local x, thickness t."""
    F = _F(F)
    A = [F.p(x - t / 2, y + r * math.cos(TAU * i / seg), z + r * math.sin(TAU * i / seg)) for i in range(seg)]
    B = [F.p(x + t / 2, y + r * math.cos(TAU * i / seg), z + r * math.sin(TAU * i / seg)) for i in range(seg)]
    add_poly(mat, A); add_poly(mat, list(reversed(B)))
    for i in range(seg):
        j = (i + 1) % seg; add_poly(mat, [A[j], A[i], B[i], B[j]])


def _seg_frame(F, x0, y0, x1, y1, z=0.0):
    """Frame on a wall line: local x along p0 -> p1, local -y = outside (right side)."""
    return _F(F).sub(x0, y0, z, math.atan2(y1 - y0, x1 - x0) / D2R), math.hypot(x1 - x0, y1 - y0)


# ---------------------------------------------------------------- temples
def podium_temple(F, cx=0.0, cy=0.0, W=20.0, L=34.0, pod_h=4.0, col_h=12.0, nf=6, kind='prostyle', porch=2,
                  order='corinthian', front='-Y', col_mat='marble', cap_mat=None, pod_mat='marble', cella_mat='marble',
                  ent_mat='marble', frieze_mat=None, roof_mat='tile', tymp_mat='marble', stair='front', stair_w=None,
                  flutes=0, acroteria='marble', door_mat='bronze', pitch=15.0, seg=12, cheek_statues='bronze',
                  foundation=4.0):
    """A Roman temple on a high podium with its stair in front.
    W x L = podium footprint WITHOUT a 'front' stair (the stair is added in front of it). front = side of the stair.
    kind: 'prostyle'     nf columns across the front, `porch` rows deep (rows after the first: only the two outer
                         columns), the cella walls in line with the outer columns;
          'pseudo'       prostyle porch + half-columns engaged on the cella side and back walls;
          'peripteral'   columns all round (cella one bay inside);
          'sine_postico' columns on the front and both long sides, a solid back wall.
    stair: 'front'  a flight in front of the podium between two cheek walls (statues on their front ends);
           'inset'  the flight is cut into the front of the podium (stays inside W x L);
           'sides'  a speaker's platform across the front, reached by two side flights (Castor, Divus Julius);
           None     no stair.
    Returns a dict: top (podium top z), eave (top of the entablature), ridge, stair_len, col_r, spacing,
    front_y (canonical y of the stair foot; the temple is built facing -Y and rotated to `front`)."""
    T = _F(F).sub(cx, cy, 0, ROT[front])
    r = col_h / {'corinthian': 20.0, 'composite': 20.0, 'ionic': 18.0}.get(order, 16.0)
    m = r * 1.6 + 0.35
    n = max(3, int(round(pod_h / 0.24))); rise = pod_h / n; run = 0.42; Ls = n * run if stair in ('front', 'inset', 'sides') else 0.0
    if stair == 'sides':
        Ls = max(6.0, n * 0.34)
    y0p = -L / 2 + (Ls if stair == 'inset' else 0.0)          # front face of the podium proper
    # foundation, base moulding, die, crown
    if foundation:
        yfoot = -L / 2 - (Ls if stair in ('front', 'sides') else 0.0)
        box(T, 0, (yfoot + L / 2) / 2, -foundation, W + 1.0, L / 2 - yfoot + 1.0, foundation, 'tuff')
    yc = (y0p + L / 2) / 2; Lp = L / 2 - y0p
    box(T, 0, yc, 0, W + 0.7, Lp + 0.7, 0.55, pod_mat)
    box(T, 0, yc, 0.55, W, Lp, pod_h - 1.0, pod_mat)
    box(T, 0, yc, pod_h - 0.45, W + 0.6, Lp + 0.6, 0.45, ent_mat)
    zt = pod_h
    # stair
    if stair in ('front', 'inset'):
        sw = stair_w if stair_w else W - 3.0
        yf0 = (y0p - Ls)                                       # foot of the stair
        for i in range(n):
            ya = yf0 + i * run; box(T, 0, (ya + y0p) / 2, 0, sw, y0p - ya, (i + 1) * rise, 'marble')
        for sd in (-1, 1):
            cw = (W - sw) / 2; xx = sd * (sw / 2 + cw / 2)
            box(T, xx, yf0 + Ls / 2, 0, cw, Ls, pod_h - 0.45, pod_mat)
            box(T, xx, yf0 + Ls / 2, pod_h - 0.45, cw + 0.3, Ls + 0.3, 0.45, ent_mat)
            if cheek_statues:
                statue(T, xx, yf0 + 0.9, pod_h, min(3.2, col_h * 0.26), cheek_statues, pedestal=0.9, ped_mat='marble')
    elif stair == 'sides':
        # speaker's platform across the front at podium height, two side flights climbing toward the temple
        yf0 = y0p - Ls; sw = stair_w if stair_w else 3.6
        box(T, 0, yf0 + Ls / 2, 0, W - 2 * sw - 0.6, Ls, pod_h - 0.45, pod_mat)
        box(T, 0, yf0 + Ls / 2, pod_h - 0.45, W - 2 * sw - 0.3, Ls + 0.3, 0.45, ent_mat)
        box(T, 0, yf0 - 0.06, pod_h * 0.25, (W - 2 * sw) * 0.6, 0.12, pod_h * 0.5, pod_mat)       # panel (no hole)
        box(T, 0, yf0 - 0.1, pod_h * 0.25 + pod_h * 0.5, (W - 2 * sw) * 0.62, 0.2, 0.25, ent_mat)
        nn = max(3, int(round(pod_h / 0.24))); rr = pod_h / nn; ru = Ls / nn
        for sd in (-1, 1):
            xx = sd * (W / 2 - sw / 2)
            for i in range(nn):
                ya = yf0 + i * ru; box(T, xx, (ya + y0p) / 2, 0, sw, y0p - ya, (i + 1) * rr, 'marble')
    else:
        yf0 = y0p
    # columns
    yF = y0p + m; yB = L / 2 - m; xS = W / 2 - m
    s = (2 * xS) / (nf - 1)
    cols = []
    for i in range(nf):
        cols.append((-xS + i * s, yF))
    if kind in ('prostyle', 'pseudo'):
        for k in range(1, porch):
            cols += [(-xS, yF + k * s), (xS, yF + k * s)]
        ycw = yF + porch * s                                    # cella front wall line
        cella = (-xS, ycw, xS, yB)
    else:
        ny = max(2, int(round((yB - yF) / s)) + 1); sy = (yB - yF) / (ny - 1)
        for k in range(1, ny):
            cols += [(-xS, yF + k * sy), (xS, yF + k * sy)]
        if kind == 'peripteral':
            for i in range(1, nf - 1):
                cols.append((-xS + i * s, yB))
            ycw = yF + porch * sy
            cella = (-xS + s, ycw, xS - s, yB - sy)
        else:  # sine_postico: solid back wall on the back column line
            ycw = yF + porch * sy
            cella = (-xS + s, ycw, xS - s, yB)
    for (x, y) in cols:
        column(T, x, y, zt, col_h, r, col_mat, order, flutes, seg, cap_mat=cap_mat)
    # cella walls (up to the underside of the entablature)
    t = max(1.0, r * 1.7)
    x0c, y0c, x1c, y1c = cella
    box(T, (x0c + x1c) / 2, (y0c + y1c) / 2, zt, (x1c - x0c) + t, (y1c - y0c) + t, col_h, cella_mat)
    if kind == 'sine_postico':
        box(T, 0, yB, zt, 2 * xS + t, t, col_h, cella_mat)
    if kind == 'pseudo':
        ny2 = max(2, int(round((yB - ycw) / s)) + 1); sy2 = (yB - ycw) / (ny2 - 1)
        for k in range(1, ny2):
            for sd in (-1, 1):
                column(T, sd * xS, ycw + k * sy2, zt, col_h, r, col_mat, order, flutes, seg, cap_mat=cap_mat)
        for i in range(1, nf - 1):
            column(T, -xS + i * s, yB, zt, col_h, r, col_mat, order, flutes, seg, cap_mat=cap_mat)
    # bronze door with a dark frame
    dw = min(5.0, (x1c - x0c) * 0.32); dh = min(col_h * 0.62, 9.0)
    box(T, 0, y0c - t / 2 - 0.06, zt, dw + 0.9, 0.14, dh + 0.6, 'marble')
    box(T, 0, y0c - t / 2 - 0.14, zt, dw, 0.12, dh, door_mat)
    # entablature all round the column lines
    ze = zt + col_h; eh = col_h * 0.24; ed = r * 2.9
    yBack = yB
    for (a, b) in (((-xS, yF), (xS, yF)), ((xS, yF), (xS, yBack)), ((xS, yBack), (-xS, yBack)), ((-xS, yBack), (-xS, yF))):
        entablature(T, a[0], a[1], b[0], b[1], ze, eh, ed, ent_mat, frieze_mat)
    We = 2 * xS + ed; Le = (yBack - yF) + ed; ym = (yF + yBack) / 2
    box(T, 0, ym, ze, We - 0.2, Le - 0.2, eh * 0.95, ent_mat)      # ceiling block (no see-through)
    ridge = gable_roof(T, 0, ym, ze + eh, We, Le, pitch, 'y', 0.5, roof_mat, gable_mat=ent_mat, pediment=True,
                       tymp_mat=tymp_mat)
    if acroteria:
        ya = ym - Le / 2 - 0.25
        statue(T, 0, ya, ridge - 0.25, min(3.4, col_h * 0.28), acroteria, pedestal=0.5, ped_mat=ent_mat)
        statue(T, 0, ym + Le / 2 + 0.25, ridge - 0.25, min(3.0, col_h * 0.24), acroteria, pedestal=0.5, ped_mat=ent_mat)
        for sd in (-1, 1):
            statue(T, sd * (We / 2 - 0.4), ya, ze + eh, min(2.4, col_h * 0.2), acroteria, pedestal=0.4, ped_mat=ent_mat)
    return {'top': zt, 'eave': ze + eh, 'ridge': ridge, 'stair_len': Ls, 'col_r': r, 'spacing': s,
            'front_y': (yf0 if stair else y0p)}


def tholos_temple(F, cx=0.0, cy=0.0, R=7.5, pod_h=3.0, n=20, col_h=9.0, order='corinthian', front='-Y',
                  pod_mat='marble', col_mat='marble', cella_mat='marble', roof='cone', roof_mat='bronze',
                  roof_h=None, stair_w=3.0, vent=True, foundation=3.0):
    """A round temple (Vesta, Hercules Victor): round podium of radius R, a stair on `front`, n columns, round cella,
    conical (or domed) roof. Returns dict(top, eave, apex)."""
    T = _F(F).sub(cx, cy, 0, ROT[front])
    if foundation:
        cyl(T, 0, 0, -foundation, R + 0.6, foundation, 'tuff', 28)
    lathe(T, 0, 0, [(R + 0.4, 0), (R + 0.4, 0.5), (R, 0.6), (R, pod_h - 0.5), (R + 0.35, pod_h - 0.35), (R + 0.35, pod_h),
                    (0.01, pod_h)], pod_mat, 36, smooth=False)
    nst = max(3, int(round(pod_h / 0.24))); rise = pod_h / nst; run = 0.4
    for i in range(nst):
        ya = -R - (nst - i) * run + 0.6
        box(T, 0, (ya - R * 0.6) / 2, 0, stair_w, -R * 0.6 - ya, (i + 1) * rise, 'marble')
    r = col_h / 20.0; Rc = R - r * 1.6 - 0.3
    ze = ring_colonnade(T, 0, 0, pod_h, Rc, n, col_h, r, col_mat, order, ent=True, ent_h=col_h * 0.22, a0=-90.0 + 180.0 / n,
                        a1=270.0 + 180.0 / n)
    Rw = Rc - r * 3.2 - 1.2
    cyl(T, 0, 0, pod_h, Rw, col_h, cella_mat, 28, caps=False)
    cyl(T, 0, 0, pod_h + col_h - 0.01, Rc + r * 1.5, col_h * 0.22 * 0.95, 'marble', 28)
    box(T, 0, -Rw - 0.05, pod_h, 1.8, 0.14, col_h * 0.6, 'bronze')
    rh = roof_h if roof_h else Rc * 0.55
    if roof == 'cone':
        cone_roof(T, 0, 0, ze, Rc + r * 1.6, rh, roof_mat, 32, tiles=True, rib_mat=roof_mat, finial='gold')
    else:
        dome(T, 0, 0, ze, Rc + r * 1.4, roof_mat, 28, 8)
    if vent:
        cyl(T, 0, 0, ze + rh * 0.78, (Rc + r * 1.6) * 0.18, rh * 0.3, 'bronze', 12)
    return {'top': pod_h, 'eave': ze, 'apex': ze + rh}


# ---------------------------------------------------------------- hill base: walls, substructures, rock
def retaining_wall(F, pts, z_top, z_bot=-6.0, t=2.2, mat='tuff', buttress='round', every=9.0, b_size=1.8, batter=0.06,
                   courses=4.0, course_mat='travertine', coping_mat='travertine', parapet='balustrade',
                   parapet_mat='marble', closed=False, bastion=None, b_rise=0.0, coping=False):
    """A terrace retaining wall along a polyline (outside on the RIGHT of each segment), from z_bot (below ground)
    to z_top (the terrace floor). The outer face leans back by `batter` (m per m). Buttresses project outward every
    `every` metres: 'round' half-round towers (like the hill temple reference), 'square' piers, or None.
    String courses every `courses` metres, a coping, and a parapet on top: 'balustrade', 'wall', 'lattice' or None.
    Corners get a pier. Fill the terrace floor yourself (e.g. terrace_floor).
    bastion='d': D-shaped bastions of diameter b_size every `every` m, b_rise m taller than the wall, with their own
    coping (replaces `buttress`). coping=True: a darker coping band ('rock2'). Defaults keep the old wall."""
    cm = 'rock2' if coping else coping_mat
    P = list(pts) + ([pts[0]] if closed else [])
    H = z_top - z_bot; bb = batter * H
    for i in range(len(P) - 1):
        (x0, y0), (x1, y1) = P[i], P[i + 1]
        S, L = _seg_frame(F, x0, y0, x1, y1, 0)
        if L < 0.3:
            continue
        v = [S.p(0, 0, z_bot), S.p(L, 0, z_bot), S.p(L, t, z_bot), S.p(0, t, z_bot),
             S.p(0, bb, z_top), S.p(L, bb, z_top), S.p(L, t, z_top), S.p(0, t, z_top)]
        add_mesh(mat, v, [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])
        if courses:
            k = 1
            while z_bot + k * courses < z_top - 0.8:
                zz = z_bot + k * courses; off = batter * (zz - z_bot)
                box(S, L / 2, off - 0.08, zz, L, 0.3, 0.28, course_mat); k += 1
        box(S, L / 2, bb + t / 2 - 0.2, z_top - 0.05, L + 0.2, t + 0.4 - bb, 0.4, cm)
        if bastion == 'd' and L > every * 0.6:
            # D-shaped bastions: flat side on the wall, diameter b_size, b_rise m taller than the wall, own coping
            nb = max(1, int(L / every)); rr = b_size / 2; zbt = z_top + b_rise
            for j in range(nb):
                u = (j + 0.5) * L / nb
                arc = [(u - rr * math.cos(math.pi * q / 16), -rr * math.sin(math.pi * q / 16)) for q in range(17)]
                prism(S, [(u - rr, bb + 0.3)] + arc + [(u + rr, bb + 0.3)], z_bot, zbt - 0.45, mat)
                capR = rr + 0.25
                arc2 = [(u - capR * math.cos(math.pi * q / 16), -capR * math.sin(math.pi * q / 16)) for q in range(17)]
                prism(S, [(u - capR, bb + 0.3)] + arc2 + [(u + capR, bb + 0.3)], zbt - 0.45, zbt - 0.05, cm)
        elif buttress and L > every * 0.6:
            nb = max(1, int(L / every))
            for j in range(nb):
                u = (j + 0.5) * L / nb
                if buttress == 'round':
                    rr = b_size
                    # half-round tower (outside = -y) with a tongue back into the (battered) wall
                    arc = [(u - rr * math.cos(math.pi * q / 10), -rr * math.sin(math.pi * q / 10)) for q in range(11)]
                    poly = [(u - rr, bb + 0.3)] + arc + [(u + rr, bb + 0.3)]
                    prism(S, poly, z_bot, z_top - 0.45, mat)
                    lathe(S, u, 0.0, [(rr + 0.25, z_top - 0.45), (rr + 0.25, z_top - 0.1), (0.01, z_top - 0.1)], cm, 12, smooth=False)
                else:
                    box(S, u, -b_size / 2 + 0.3, z_bot, b_size * 1.1, b_size + 0.6, H - 0.4, mat)
                    box(S, u, -b_size / 2 + 0.3, z_top - 0.45, b_size * 1.1 + 0.3, b_size + 0.9, 0.35, cm)
        zp = z_top + 0.35
        if parapet == 'balustrade':
            balustrade(S, 0, bb + 0.3, L, bb + 0.3, zp, 1.05, parapet_mat, 2.2, 0.28)
        elif parapet == 'wall':
            box(S, L / 2, bb + 0.35, zp, L, 0.5, 1.0, mat); box(S, L / 2, bb + 0.35, zp + 1.0, L + 0.1, 0.62, 0.14, coping_mat)
        elif parapet == 'lattice':
            lattice_rail(S, 0, bb + 0.3, L, bb + 0.3, zp, 1.1)
    for (x, y) in (P[:-1] if closed else P):
        box(_F(F), x, y, z_bot, t + 0.6, t + 0.6, H + 0.35, mat)


def terrace_floor(F, pts, z, mat='paving', skirt=0.8):
    """A flat terrace floor polygon (counter-clockwise points) at height z with a thin skirt below its edge."""
    F = _F(F)
    add_poly(mat, [F.p(x, y, z) for x, y in pts])
    for i in range(len(pts)):
        (x0, y0), (x1, y1) = pts[i], pts[(i + 1) % len(pts)]
        add_poly(mat, [F.p(x0, y0, z - skirt), F.p(x1, y1, z - skirt), F.p(x1, y1, z), F.p(x0, y0, z)])


def substructure(F, x0, y0, x1, y1, z0, storeys=2, h=7.0, bay=4.8, depth=5.0, mat='tuff', pier_mat='travertine',
                 half_cols=True, col_order='doric', cornice_mat='travertine', top_parapet=True):
    """A stacked arcaded substructure facade (Tabularium / Domus Tiberiana style) on a line, outside on the RIGHT:
    `storeys` storeys of `h` m, arches every `bay` m, `depth` m deep vaulted bays (dark backs), engaged half-columns
    between the arches and a cornice at each floor. Returns the top z."""
    S, L = _seg_frame(F, x0, y0, x1, y1, 0)
    nA = max(1, int(round(L / bay)))
    z = z0
    for k in range(storeys):
        arcade(S, 0, depth / 2, L, depth / 2, z, h, depth, nA, mat, open_w=L / nA * 0.58, open_h=h * 0.8, back='dark',
               impost_mat=pier_mat)
        if half_cols:
            for j in range(nA + 1):
                column(S, j * L / nA, -0.25, z, h - 0.6, 0.38, pier_mat, col_order, 0, 10)
        cornice(S, 0, 0, L, 0, z + h - 0.1, 0.6, 0.55, cornice_mat)
        z += h
    if top_parapet:
        balustrade(S, 0, 0.4, L, 0.4, z, 1.05, 'marble', 2.4, 0.28)
    return z


# ---------------------------------------------------------------- hill rock: ledge rock
def _pip(x, y, poly):
    """Point in polygon (ray casting)."""
    inside = False
    for i in range(len(poly)):
        (x0, y0), (x1, y1) = poly[i], poly[(i + 1) % len(poly)]
        if (y0 > y) != (y1 > y) and x < x0 + (y - y0) * (x1 - x0) / (y1 - y0):
            inside = not inside
    return inside


def _inset_toward(ring, c, d):
    """Pull every outline point d metres toward the centre c (a simple inset that keeps the outline's shape)."""
    out = []
    for x, y in ring:
        dx, dy = c[0] - x, c[1] - y
        L = math.hypot(dx, dy) or 1.0
        t = min(d, 0.5 * L) / L
        out.append((x + dx * t, y + dy * t))
    return out


def _dist_edge(x, y, poly):
    """Distance from (x, y) to the nearest edge of the polygon."""
    best = 1e9
    for i in range(len(poly)):
        (x0, y0), (x1, y1) = poly[i], poly[(i + 1) % len(poly)]
        dx, dy = x1 - x0, y1 - y0
        t = max(0.0, min(1.0, ((x - x0) * dx + (y - y0) * dy) / ((dx * dx + dy * dy) or 1e-9)))
        best = min(best, math.hypot(x - x0 - t * dx, y - y0 - t * dy))
    return best


def _joints(ring, rnd, jit, c, depth=1.4):
    """Outline with noise (+-jit) and a deep joint notch every third vertex (pulled `depth` m toward c)."""
    out = []
    for i, (x, y) in enumerate(ring):
        x += rnd.uniform(-jit, jit); y += rnd.uniform(-jit, jit)
        if i % 3 == 2:
            dx, dy = c[0] - x, c[1] - y
            L = math.hypot(dx, dy) or 1.0
            x += dx / L * depth; y += dy / L * depth
        out.append((x, y))
    return out


def _chunk(F, cx, cy, z, size, rnd, mat, rot=0.0):
    """An irregular block, not a box: 8 jittered vertices, flattened to 0.5-0.8 of its width, base at z."""
    hgt = size * rnd.uniform(0.5, 0.8)
    V = []
    for k in range(8):
        dx, dy = ((-1, -1), (1, -1), (1, 1), (-1, 1))[k % 4]
        s = size / 2 * rnd.uniform(0.8, 1.2)
        V.append((dx * s + rnd.uniform(-0.15, 0.15) * size, dy * s + rnd.uniform(-0.15, 0.15) * size,
                  hgt * (0.0 if k < 4 else rnd.uniform(0.85, 1.0))))
    S = _F(F).sub(cx, cy, z, rot)
    P = [S.p(x, y, zz) for x, y, zz in V]
    for face in ((3, 2, 1, 0), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)):
        add_poly(mat, [P[i] for i in face])


def _moss_islands(F, outline, zf, rnd, cover):
    """Irregular moss islands on a top: set back from the rim, together about `cover` of the top's area."""
    n = len(outline)
    area = abs(sum(outline[i][0] * outline[(i + 1) % n][1] - outline[(i + 1) % n][0] * outline[i][1]
                   for i in range(n))) / 2
    xs = [p[0] for p in outline]; ys = [p[1] for p in outline]
    got = 0.0; tries = 0
    while got < cover * area and tries < 600:
        tries += 1
        x = rnd.uniform(min(xs), max(xs)); y = rnd.uniform(min(ys), max(ys))
        if not _pip(x, y, outline) or _dist_edge(x, y, outline) < 0.9:
            continue
        a, b, th = rnd.uniform(0.6, 1.6), rnd.uniform(0.4, 1.0), rnd.uniform(0.0, math.pi)
        ring = []
        for k in range(9):
            t = TAU * k / 9 + rnd.uniform(-0.2, 0.2)
            ex, ey = a * math.cos(t), b * math.sin(t) * rnd.uniform(0.8, 1.2)
            ring.append((x + ex * math.cos(th) - ey * math.sin(th), y + ex * math.sin(th) + ey * math.cos(th)))
        if not all(_pip(px, py, outline) and _dist_edge(px, py, outline) > 0.3 for px, py in ring):
            continue
        add_poly('moss', [F.p(px, py, zf(px, py) + 0.04) for px, py in ring])
        got += math.pi * a * b


def _flat_top(F, outline, zf, mat, grid):
    """A flat top: constrained Delaunay fill of the outline (counter-clockwise (x, y) list) plus interior grid points.
    Even triangles, never a fan from a centre. zf(x, y) is the height of every vertex."""
    from mathutils import geometry as mg
    n = len(outline); pts = list(outline)
    xs = [p[0] for p in outline]; ys = [p[1] for p in outline]
    gx = min(xs) + grid / 2
    while gx < max(xs):
        gy = min(ys) + grid / 2
        while gy < max(ys):
            if _pip(gx, gy, outline) and min(math.hypot(gx - x, gy - y) for x, y in outline) > 0.5 * grid:
                pts.append((gx, gy))
            gy += grid
        gx += grid
    edges = [(i, (i + 1) % n) for i in range(n)]
    verts, _edges, faces = mg.delaunay_2d_cdt([Vector(p) for p in pts], edges, [], 0, 1e-6)[:3]
    for face in faces:
        for k in range(1, len(face) - 1):
            a, b, c = verts[face[0]], verts[face[k]], verts[face[k + 1]]
            if not _pip((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, outline):
                continue
            tri = [(a.x, a.y), (b.x, b.y), (c.x, c.y)]
            if (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) < 0:
                tri.reverse()
            add_poly(mat, [F.p(x, y, zf(x, y)) for x, y in tri])


def _insets(total, n, rnd):
    """n inset steps (m) summing to `total`: shelves of at most 1.5 m, and at most one wider ledge (3-4 m) at a random
    height when the total allows it."""
    if n <= 0:
        return []
    steps = [0.0] * n; rest = total; j = None
    if total >= 3.5 + 0.3 * (n - 1) and rnd.random() < 0.6:
        j = rnd.randrange(n)
        steps[j] = min(4.0, rnd.uniform(3.0, 4.0), total - 0.3 * (n - 1))
        rest = total - steps[j]
    others = [k for k in range(n) if k != j]
    if others:
        w = [rnd.uniform(0.7, 1.3) for _ in others]; sw = sum(w)
        for k, wk in zip(others, w):
            steps[k] = min(1.5, rest * wk / sw)
    return steps


def rock_mass(F, pts, z0, z1, mat='rock', seed=1, jitter=1.4, strata=4, step=3.0,
              moss=True, boulders=6, dip=4.0, rim=0.6, grid=5.0, rock2=0.25,
              relief=0.3, batter=7.5, moss_cover=0.3, ground=None, band=None):
    """A steep cliff of ledge rock: `strata` benches (z0 to z1 in all), each the previous outline inset 1-3 m with
    noise; the stack dips `dip` degrees and its tops vary `relief` m along the outline (about 1.5 steps a wall foot's
    ledge up and down). Faces lean back by `batter` degrees, with deep joint notches, a two-step rounded lip and
    `rock2` stains. Tops are pale `mat` with a `rim`; only the topmost bench gets moss, as irregular islands over
    `moss_cover` of its top. `boulders` irregular chunks sit on the ledges, partly sunk. Give a footprint that hugs a
    wall: inner edge inside the terrace fill, outer edge 8-12 m out. Returns top(x, y), the top height at a point."""
    F = _F(F); rnd = random.Random(seed)
    ring = []
    for i in range(len(pts)):
        (ax, ay), (bx, by) = pts[i], pts[(i + 1) % len(pts)]
        L = math.hypot(bx - ax, by - ay); k = max(1, int(L / step))
        for j in range(k):
            ring.append((ax + (bx - ax) * j / k, ay + (by - ay) * j / k))
    cxm = sum(p[0] for p in ring) / len(ring); cym = sum(p[1] for p in ring) / len(ring)
    C = (cxm, cym)
    phi = rnd.uniform(0, TAU); tdip = math.tan(dip * D2R); h = (z1 - z0) / strata
    tbat = math.tan(batter * D2R)
    # horizontal extent of the benches, tied to the vertical relief below the wall (0.6 x relief, clamped 2-12 m)
    rel = z1 - (ground if ground is not None else z0)
    extent = band if band is not None else min(12.0, max(2.0, 0.6 * rel))
    steps = _insets(extent, strata - 1, rnd)

    def zat(x, y, s):      # height of level s (0 = bottom) at (x, y): stacked, dipping, relief and fine noise
        return (z0 + s * h + tdip * ((x - cxm) * math.cos(phi) + (y - cym) * math.sin(phi))
                + relief * math.sin(0.11 * x + 1.7 * seed) * math.cos(0.09 * y + 0.4 * seed)
                + 0.3 * math.sin(0.37 * x + 1.7 * seed) * math.cos(0.29 * y + 0.4 * seed))

    outline = _joints(ring, rnd, 0.0, C)
    benches = []
    for s in range(strata):
        if s > 0:
            outline = _joints(_inset_toward(outline, C, steps[s - 1]), rnd, jitter * 0.4, C)
        O = outline; n = len(O); benches.append(O)
        out = []                                         # outward unit vectors (from the centre)
        for x, y in O:
            dx, dy = x - C[0], y - C[1]; L = math.hypot(dx, dy) or 1.0
            out.append((dx / L, dy / L))
        Mid = _inset_toward(O, C, 0.2)                   # the rounded lip: a middle ring
        R1 = _inset_toward(O, C, 0.4)                    # top edge after the lip
        R2 = _inset_toward(O, C, 0.4 + rim)              # outer edge of the rim, the top inside it
        for i in range(n):
            j = (i + 1) % n
            B = [(O[k][0] + out[k][0] * h * tbat, O[k][1] + out[k][1] * h * tbat) for k in (i, j)]   # batter
            zb = [zat(O[k][0], O[k][1], s) for k in (i, j)]
            zl = [zat(O[k][0], O[k][1], s + 1) - 0.5 for k in (i, j)]
            zm = [zat(Mid[k][0], Mid[k][1], s + 1) - 0.15 for k in (i, j)]
            zt = [zat(R1[k][0], R1[k][1], s + 1) for k in (i, j)]
            zr = [zat(R2[k][0], R2[k][1], s + 1) for k in (i, j)]
            face = mat if rnd.random() >= rock2 else 'rock2'
            add_poly(face, [F.p(B[0][0], B[0][1], zb[0]), F.p(B[1][0], B[1][1], zb[1]),
                            F.p(O[j][0], O[j][1], zl[1]), F.p(O[i][0], O[i][1], zl[0])])
            add_poly(mat, [F.p(O[i][0], O[i][1], zl[0]), F.p(O[j][0], O[j][1], zl[1]),
                           F.p(Mid[j][0], Mid[j][1], zm[1]), F.p(Mid[i][0], Mid[i][1], zm[0])])
            add_poly(mat, [F.p(Mid[i][0], Mid[i][1], zm[0]), F.p(Mid[j][0], Mid[j][1], zm[1]),
                           F.p(R1[j][0], R1[j][1], zt[1]), F.p(R1[i][0], R1[i][1], zt[0])])
            add_poly(mat, [F.p(R1[i][0], R1[i][1], zt[0]), F.p(R1[j][0], R1[j][1], zt[1]),
                           F.p(R2[j][0], R2[j][1], zr[1]), F.p(R2[i][0], R2[i][1], zr[0])])
        zf = (lambda x, y, s=s: zat(x, y, s + 1))
        _flat_top(F, R2, zf, mat, grid)
        if moss and s == strata - 1:
            _moss_islands(F, R2, zf, rnd, moss_cover)
    for _ in range(boulders):
        s = rnd.randrange(strata); O = benches[s]; i = rnd.randrange(len(O))
        x = O[i][0] + rnd.uniform(-1.0, 1.0); y = O[i][1] + rnd.uniform(-1.0, 1.0)
        size = rnd.uniform(2.0, 4.5)
        _chunk(F, x, y, zat(x, y, s + 1) - 0.2 * size, size, rnd, mat, rnd.uniform(0.0, 90.0))
    return lambda x, y: zat(x, y, strata)


def foot_rocks(F, pts, z_top_range, z_bot=-20.0, width=4.0, seed=1, step=4.0, blocks=8, mat='rock', moss_strip=False,
               top_z=None):
    """Irregular chunks seated on the ledge along a wall foot polyline (the outside is the right of p0 -> p1),
    overlapping the foot and partly sunk. top_z: the callable rock_mass returns (the ledge top), so each chunk sits on
    the ledge at its own height; without it the bases are drawn from z_top_range. z_bot, step, width and moss_strip
    are kept for older calls and are not used."""
    F = _F(F); rnd = random.Random(seed); lo, hi = z_top_range
    for _ in range(blocks):
        i = rnd.randrange(len(pts) - 1)
        (ax, ay), (bx, by) = pts[i], pts[i + 1]
        L = math.hypot(bx - ax, by - ay) or 1.0
        ux, uy = (bx - ax) / L, (by - ay) / L
        t = rnd.uniform(0.0, L); d = rnd.uniform(-0.5, min(width, 1.5))   # d > 0: outside; the ledge top ends ~1.5 m out
        x, y = ax + ux * t + uy * d, ay + uy * t - ux * d
        size = rnd.uniform(2.0, 4.5)
        base = (top_z(x, y) if top_z else rnd.uniform(lo, hi)) - 0.25 * size
        _chunk(F, x, y, base, size, rnd, mat, rnd.uniform(0.0, 90.0))


# ---------------------------------------------------------------- sacred area furniture
def checker_paving(F, x0, y0, x1, y1, z=0.0, tile=1.2, mats=('marble', 'grey'), border=0.9,
                   border_mats=('pav_red', 'pav_blue'), thick=0.3, holes=()):
    """Checkered marble paving on the rectangle (x0, y0)-(x1, y1) with its top at z, framed by a broad band
    (border_mats[0]) and a thin inner band (border_mats[1]). holes: [(cx, cy, r)] left free (e.g. round_mosaic)."""
    F = _F(F); xa, xb = min(x0, x1), max(x0, x1); ya, yb = min(y0, y1), max(y0, y1)
    box(F, (xa + xb) / 2, (ya + yb) / 2, z - thick, xb - xa, yb - ya, thick - 0.06, mats[0])
    def quad(m, ax, ay, bx, by):
        add_poly(m, [F.p(ax, ay, z), F.p(bx, ay, z), F.p(bx, by, z), F.p(ax, by, z)])
    b0, b1 = border, border * 0.45
    for (ax, ay, bx, by) in ((xa, ya, xb, ya + b0), (xa, yb - b0, xb, yb), (xa, ya + b0, xa + b0, yb - b0), (xb - b0, ya + b0, xb, yb - b0)):
        quad(border_mats[0], ax, ay, bx, by)
    xa2, xb2, ya2, yb2 = xa + b0, xb - b0, ya + b0, yb - b0
    for (ax, ay, bx, by) in ((xa2, ya2, xb2, ya2 + b1), (xa2, yb2 - b1, xb2, yb2), (xa2, ya2 + b1, xa2 + b1, yb2 - b1), (xb2 - b1, ya2 + b1, xb2, yb2 - b1)):
        quad(border_mats[1], ax, ay, bx, by)
    xa3, xb3, ya3, yb3 = xa2 + b1, xb2 - b1, ya2 + b1, yb2 - b1
    nx = max(1, int(round((xb3 - xa3) / tile))); ny = max(1, int(round((yb3 - ya3) / tile)))
    tx = (xb3 - xa3) / nx; ty = (yb3 - ya3) / ny
    for i in range(nx):
        for j in range(ny):
            ax, ay = xa3 + i * tx, ya3 + j * ty; mx, my = ax + tx / 2, ay + ty / 2
            if any(math.hypot(mx - hx, my - hy) < hr for (hx, hy, hr) in holes):
                continue
            quad(mats[(i + j) % 2], ax, ay, ax + tx, ay + ty)
    for (ax, ay, bx, by) in ((xa, ya, xb, ya), (xb, ya, xb, yb), (xb, yb, xa, yb), (xa, yb, xa, ya)):
        add_poly(border_mats[0], [F.p(ax, ay, z - thick), F.p(bx, by, z - thick), F.p(bx, by, z), F.p(ax, ay, z)])


def round_mosaic(F, cx, cy, z, r, rings=4, segs=24, mats=('marble', 'pav_red', 'giallo', 'pav_blue', 'grey')):
    """A round opus-sectile disc (concentric bands of coloured segments), its top at z. Leave a hole in the paving."""
    F = _F(F)
    for k in range(rings):
        r0 = r * k / rings; r1 = r * (k + 1) / rings
        for i in range(segs):
            a0, a1 = TAU * i / segs, TAU * (i + 1) / segs; m = mats[(k + i % 2 * 2) % len(mats)]
            p = [F.p(cx + r0 * math.cos(a0), cy + r0 * math.sin(a0), z + 0.01), F.p(cx + r1 * math.cos(a0), cy + r1 * math.sin(a0), z + 0.01),
                 F.p(cx + r1 * math.cos(a1), cy + r1 * math.sin(a1), z + 0.01), F.p(cx + r0 * math.cos(a1), cy + r0 * math.sin(a1), z + 0.01)]
            add_poly(m, p if r0 > 0 else [p[0], p[1], p[2]])
    lathe(F, cx, cy, [(r + 0.35, z - 0.2), (r + 0.35, z + 0.06), (r, z + 0.06), (r, z - 0.2)], 'pav_red', 32, smooth=False)


def torch_column(F, x, y, z0, h=4.6, mat='red', base_mat='marble', cap_mat='gold', flame=True):
    """A tall torch-bearer: marble plinth, red shaft, gilt capital, bronze bowl with fire."""
    F = _F(F)
    box(F, x, y, z0, 0.9, 0.9, 0.7, base_mat); box(F, x, y, z0 + 0.7, 0.75, 0.75, 0.15, base_mat)
    cyl(F, x, y, z0 + 0.85, 0.2, h - 1.6, mat, 10, r_top=0.17)
    cyl(F, x, y, z0 + h - 0.75, 0.2, 0.25, cap_mat, 10, r_top=0.3)
    lathe(F, x, y, [(0.12, z0 + h - 0.5), (0.45, z0 + h - 0.3), (0.55, z0 + h - 0.05), (0.5, z0 + h), (0.02, z0 + h - 0.2)], 'bronze', 12)
    if flame:
        cyl(F, x, y, z0 + h - 0.1, 0.32, 0.9, 'flame', 8, r_top=0.0)


def lattice_rail(F, x0, y0, x1, y1, z0, h=1.05, mat='bronze', post_mat='marble', post_every=3.0, panel=0.9):
    """A bronze lattice railing (crossed bars) between marble posts."""
    S, L = _seg_frame(F, x0, y0, x1, y1, z0)
    if L < 0.2:
        return
    np_ = max(1, int(round(L / post_every)))
    for i in range(np_ + 1):
        box(S, L * i / np_, 0, 0, 0.36, 0.36, h + 0.15, post_mat)
    beam(S, 0, 0, h - 0.04, L, 0, h - 0.04, 0.1, 0.1, mat); beam(S, 0, 0, 0.12, L, 0, 0.12, 0.1, 0.1, mat)
    nq = max(1, int(round(L / panel)))
    for i in range(nq):
        a, b = L * i / nq, L * (i + 1) / nq
        beam(S, a, 0, 0.12, b, 0, h - 0.04, 0.05, 0.05, mat); beam(S, a, 0, h - 0.04, b, 0, 0.12, 0.05, 0.05, mat)


def altar(F, x, y, z0, w=4.0, d=3.0, h=1.7, mat='marble', steps=2, bolsters=True, fire=False, rot=0.0):
    """A monumental altar: stepped base, die, crowning moulding, bolsters (pulvini) along the top sides."""
    S = _F(F).sub(x, y, z0, rot)
    z = 0.0
    for i in range(steps):
        e = (steps - i) * 0.55
        box(S, 0, 0, z, w + e * 2, d + e * 2, 0.22, mat); z += 0.22
    box(S, 0, 0, z, w, d, 0.25, mat); box(S, 0, 0, z + 0.25, w - 0.3, d - 0.3, h - 0.65, mat)
    box(S, 0, 0, z + h - 0.4, w + 0.2, d + 0.2, 0.4, mat)
    zt = z + h
    if bolsters:
        for sd in (-1, 1):
            beam(S, sd * (w / 2 - 0.25), -d / 2 + 0.05, zt + 0.22, sd * (w / 2 - 0.25), d / 2 - 0.05, zt + 0.22, 0.45, 0.45, mat)
    if fire:
        box(S, 0, 0, zt, w * 0.4, d * 0.4, 0.15, 'bronze'); cyl(S, 0, 0, zt + 0.15, min(w, d) * 0.15, 0.7, 'flame', 8, r_top=0.0)
    return z0 + zt


def obelisk(F, x, y, z0, h=24.0, mat='granite', base_mat='marble', tip='gold', base_h=None, rot=0.0):
    """An Egyptian obelisk on a stepped marble base. h = shaft height (without the base)."""
    S = _F(F).sub(x, y, z0, rot + 45.0)
    w = h / 10.0; bh = base_h if base_h else h * 0.22
    T = _F(F).sub(x, y, z0, rot)
    box(T, 0, 0, 0, w * 2.6, w * 2.6, bh * 0.15, base_mat); box(T, 0, 0, bh * 0.15, w * 2.1, w * 2.1, bh * 0.7, base_mat)
    box(T, 0, 0, bh * 0.85, w * 2.4, w * 2.4, bh * 0.15, base_mat)
    for sx in (-1, 1):
        for sy in (-1, 1):
            sphere(T, sx * w * 0.8, sy * w * 0.8, bh + 0.25, 0.3, 'bronze', 8, 5)
    rr = w * 0.5 * math.sqrt(2)
    cyl(S, 0, 0, bh + 0.2, rr, h * 0.94, mat, 4, r_top=rr * 0.62, smooth=False, caps=False)
    cyl(S, 0, 0, bh + 0.2 + h * 0.94, rr * 0.62, h * 0.06, tip, 4, r_top=0.0, smooth=False, caps=False)
    return z0 + bh + 0.2 + h


def quadriga(F, x, y, z0, s=1.0, mat='gold', front='-Y'):
    """A stylised four-horse chariot group with a driver (for temple roofs, arches, the circus). ~4 x 3.6 m at s=1."""
    T = _F(F).sub(x, y, z0, ROT[front])
    for k in range(4):
        hx = (-1.35 + k * 0.9) * s
        beam(T, hx, 0.5 * s, 1.15 * s, hx, -1.0 * s, 1.15 * s, 0.42 * s, 0.5 * s, mat)               # body
        beam(T, hx, -0.9 * s, 1.25 * s, hx, -1.25 * s, 1.85 * s, 0.24 * s, 0.32 * s, mat)            # neck
        beam(T, hx, -1.2 * s, 1.85 * s, hx, -1.55 * s, 1.6 * s, 0.2 * s, 0.24 * s, mat)              # head
        for (ly, lx) in ((0.35, -0.12), (0.35, 0.12), (-0.85, -0.12), (-0.85, 0.12)):
            beam(T, hx + lx * s, ly * s, 0.95 * s, hx + lx * s, ly * s, 0.0, 0.1 * s, 0.1 * s, mat)
    box(T, 0, 1.25 * s, 0.45 * s, 1.5 * s, 0.9 * s, 0.85 * s, mat)
    for sd in (-1, 1):
        vdisc(T, sd * 0.85 * s, 1.35 * s, 0.55 * s, 0.55 * s, 0.12 * s, mat, 12)
    statue(T, 0, 1.3 * s, 0.6 * s, 1.9 * s, mat, pedestal=0.0)


def eagle(F, x, y, z0, s=1.0, mat='tile', broken=False, rot=0.0):
    """A perched eagle statue (~1 m at s=1), wings half spread. broken=True: half of the left wing is missing."""
    T = _F(F).sub(x, y, z0, rot)
    box(T, 0, 0, 0, 0.5 * s, 0.4 * s, 0.25 * s, mat)
    sphere(T, 0, 0, 0.55 * s, 0.24 * s, mat, 10, 6, z_scale=1.5)
    sphere(T, 0, -0.08 * s, 0.98 * s, 0.13 * s, mat, 8, 5)
    beam(T, 0, -0.18 * s, 0.97 * s, 0, -0.32 * s, 0.92 * s, 0.06 * s, 0.07 * s, mat)
    beam(T, 0.0, 0.18 * s, 0.35 * s, 0.0, 0.42 * s, 0.22 * s, 0.22 * s, 0.05 * s, mat)
    for sd in (-1, 1):
        reach = 0.42 if (broken and sd < 0) else 0.95
        prism(T, [(sd * 0.12 * s, 0.1 * s), (sd * reach * s, 0.22 * s), (sd * reach * 0.8 * s, -0.05 * s), (sd * 0.12 * s, -0.1 * s)][::-sd],
              0.6 * s, 0.68 * s, mat)
        beam(T, sd * 0.15 * s, 0.0, 0.62 * s, sd * reach * s, 0.1 * s, 0.98 * s, 0.05 * s, 0.24 * s, mat)


# ---------------------------------------------------------------- houses and streets
def taberna_front(F, x0, y0, x1, y1, z0, n, h=3.8, mat='plaster2', shutters=True, counters=True, depth=0.7, sill=0.0):
    """A row of n shop openings (wide, square-headed, dark inside) on the outside of a wall line, with wooden
    shutter boards stacked at one side and an L-shaped masonry counter in every other shop."""
    S, L = _seg_frame(F, x0, y0, x1, y1, 0)
    bay = L / n; ow = bay * 0.72; oh = h * 0.78
    opening_skin(S, 0, 0, L, 0, z0, h, [((k + 0.5) * bay, sill, ow, oh, 'rect') for k in range(n)], mat, depth=depth)
    for k in range(n):
        u = (k + 0.5) * bay
        box(S, u, -depth + 0.1, z0 + oh, ow + 0.3, 0.3, 0.28, 'wood')                  # lintel beam
        if shutters:
            box(S, u - ow / 2 + 0.25, -depth * 0.55, z0, 0.35, 0.18, oh * 0.95, 'wood')
        if counters and k % 2 == 0:
            box(S, u + ow * 0.12, -depth - 0.3 + 0.6, z0, ow * 0.55, 0.6, 1.0, 'stone')


def balcony(F, x0, y0, x1, y1, z, depth=1.1, mat='wood', roof=True, laundry=False):
    """A wooden balcony (maenianum) on the outside of a wall line at floor height z: beams, floor, rail,
    optional lean-to roof above and laundry on a line."""
    S, L = _seg_frame(F, x0, y0, x1, y1, 0)
    box(S, L / 2, -depth / 2, z - 0.12, L, depth, 0.12, mat)
    for k in range(int(L / 1.2) + 1):
        u = min(L - 0.1, 0.1 + k * 1.2)
        beam(S, u, 0.05, z - 0.25, u, -depth, z - 0.25, 0.14, 0.18, mat)
        box(S, u, -depth + 0.06, z, 0.1, 0.1, 1.0, mat)
    beam(S, 0, -depth + 0.06, z + 1.0, L, -depth + 0.06, z + 1.0, 0.1, 0.12, mat)
    beam(S, 0, -depth + 0.06, z + 0.5, L, -depth + 0.06, z + 0.5, 0.06, 0.06, mat)
    if roof:
        lean_roof(S, 0, 0, L, 0, z + 2.6, depth + 0.3, 0.6)
    if laundry:
        beam(S, 0.2, -depth + 0.1, z + 1.9, L - 0.2, -depth + 0.1, z + 1.9, 0.03, 0.03, mat)
        cols = ('linen', 'flowerR', 'linen', 'awning', 'blue', 'linen')
        k = 0; u = 0.5
        while u < L - 0.8:
            w = 0.5 + 0.3 * ((k * 7) % 3)
            box(S, u + w / 2, -depth + 0.1, z + 1.05 + 0.1 * (k % 2), w, 0.03, 0.8 - 0.1 * (k % 2), cols[k % len(cols)])
            u += w + 0.25; k += 1


def timber_skin(F, x0, y0, x1, y1, z0, h, floors=1, mat='mud', frame='wood', post_every=1.5, windows=2, braces=True,
                plastered=True):
    """Timber-framed (opus craticium) upper floors on the outside of a wall line: mud infill skin with small square
    windows. plastered (default): as at Herculaneum (Casa a Graticcio) the frame is daubed over, so only the corner
    posts and the floor beams' line show, no braced grid (the open grid read as a Northern European half-timbered
    house). plastered=False: posts every `post_every` m, a beam at every floor, diagonal braces in some panels."""
    S, L = _seg_frame(F, x0, y0, x1, y1, 0)
    fh = h / floors; ops = []
    for f in range(floors):
        for k in range(windows):
            ops.append(((k + 0.5) * L / windows, f * fh + fh * 0.4, 0.75, 0.75, 'rect'))
    opening_skin(S, 0, 0, L, 0, z0, h, ops, mat, depth=0.25)
    if plastered:
        for u in (0.08, L - 0.08):
            box(S, u, -0.27, z0, 0.16, 0.06, h, frame)
        for f in range(floors + 1):
            box(S, L / 2, -0.27, z0 + f * fh - 0.05, L, 0.06, 0.1, frame)
        return
    np_ = max(1, int(round(L / post_every)))
    for i in range(np_ + 1):
        box(S, L * i / np_, -0.3, z0, 0.16, 0.12, h, frame)
    for f in range(floors + 1):
        box(S, L / 2, -0.3, z0 + f * fh - 0.08, L, 0.14, 0.18, frame)
    if braces:
        for f in range(floors):
            for i in range(0, np_, 3):
                a, b = L * i / np_, L * (i + 1) / np_
                beam(S, a, -0.31, z0 + f * fh + 0.1, b, -0.31, z0 + (f + 1) * fh - 0.1, 0.1, 0.06, frame)


def pergola(F, x0, y0, x1, y1, z0, h=2.6, mat='wood', vine='hedge', step=2.4):
    """A pergola over the rectangle (x0, y0)-(x1, y1): posts, beams, slats and patches of vine on top."""
    F = _F(F); xa, xb = min(x0, x1), max(x0, x1); ya, yb = min(y0, y1), max(y0, y1)
    nx = max(1, int((xb - xa) / step)); ny = max(1, int((yb - ya) / step))
    for i in range(nx + 1):
        for j in (0, ny):
            box(F, xa + (xb - xa) * i / nx, ya + (yb - ya) * j / ny, z0, 0.2, 0.2, h, mat)
    for j in (0, ny):
        beam(F, xa, ya + (yb - ya) * j / ny, z0 + h, xb, ya + (yb - ya) * j / ny, z0 + h, 0.18, 0.22, mat)
    for i in range(nx * 2 + 1):
        xx = xa + (xb - xa) * i / (nx * 2)
        beam(F, xx, ya - 0.2, z0 + h + 0.18, xx, yb + 0.2, z0 + h + 0.18, 0.1, 0.1, mat)
    rnd = random.Random(int(abs(x0 * 13 + y0 * 7)) + 3)
    for k in range(max(2, nx * ny)):
        cxv = rnd.uniform(xa, xb); cyv = rnd.uniform(ya, yb)
        box(F, cxv, cyv, z0 + h + 0.25, rnd.uniform(1.0, 2.2), rnd.uniform(1.0, 2.0), 0.35, vine)


def stair_flight(F, xa, ya, xb, yb, za, zb, width=3.0, mat='stone', cheek_mat='tuff', cheeks=True):
    """A straight flight from the foot (xa, ya, za) up to the head (xb, yb, zb); every step is solid to za - 0.5.
    Use it for stairs climbing along terrace walls (they keep their own side walls)."""
    F = _F(F); L = math.hypot(xb - xa, yb - ya); dz = zb - za
    if L < 0.3 or dz <= 0:
        return
    n = max(2, int(round(dz / 0.18))); run = L / n; rot = math.atan2(yb - ya, xb - xa) / D2R
    S = F.sub(xa, ya, 0, rot)
    for i in range(n):
        box(S, i * run + run / 2, 0, za - 0.5, run + 0.02, width, (i + 1) * dz / n + 0.5, mat)
    if cheeks:
        for sd in (-1, 1):
            yy = sd * (width / 2 + 0.3)
            v = [S.p(0, yy - 0.3, za - 0.5), S.p(L, yy - 0.3, za - 0.5), S.p(L, yy - 0.3, zb + 0.9), S.p(0, yy - 0.3, za + 0.9),
                 S.p(0, yy + 0.3, za - 0.5), S.p(L, yy + 0.3, za - 0.5), S.p(L, yy + 0.3, zb + 0.9), S.p(0, yy + 0.3, za + 0.9)]
            add_mesh(cheek_mat, v, [(0, 1, 2, 3), (5, 4, 7, 6), (3, 2, 6, 7), (4, 0, 3, 7), (1, 5, 6, 2), (0, 4, 5, 1)])
