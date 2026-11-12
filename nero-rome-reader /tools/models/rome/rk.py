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
    'turf':       ((0.66, 0.57, 0.36), 0.0, 0.95),   # dry hill grass on ledges and scree (the page gives it the terrain's seasonal meadow)
    'ivy':        ((0.22, 0.30, 0.12), 0.0, 0.90),   # ivy on rock faces: more olive than the clipped box hedges (it hangs in the faces' shade)
    'rock3':      ((0.60, 0.55, 0.45), 0.0, 0.95),   # the same rock, a stain darker and warmer (the Tiberiana's base; the page: W rock3)
    'rock4':      ((0.47, 0.43, 0.36), 0.0, 0.95),   # ... in shadowed re-entrants: fissures, under bench lips
    'pav_red':    ((0.62, 0.24, 0.17), 0.0, 0.50),   # red marble inlay bands
    'pav_blue':   ((0.24, 0.34, 0.52), 0.0, 0.50),   # blue-grey inlay bands
    'blue':       ((0.20, 0.36, 0.62), 0.0, 0.80),   # Egyptian blue paint
    'plaster2':   ((0.87, 0.71, 0.52), 0.0, 0.88),   # warm ochre plaster (houses)
    'plaster3':   ((0.83, 0.64, 0.56), 0.0, 0.88),   # pinkish plaster
    'mud':        ((0.62, 0.55, 0.43), 0.0, 0.95),   # mud-and-lime daub over the timber-framed floors
    'linen':      ((0.92, 0.90, 0.84), 0.0, 0.95),   # laundry, awnings
    'awning':     ((0.76, 0.58, 0.32), 0.0, 0.95),
    'flame':      ((1.00, 0.55, 0.15), 0.0, 1.00),   # fire in braziers (the page makes it glow)
    'wallred':    ((0.40, 0.11, 0.08), 0.0, 0.90),   # dark Pompeian red of painted wall fields (the page shows 'red' bright: keep that for bands)
    'dado':       ((0.20, 0.07, 0.06), 0.0, 0.85),   # the dark dado under the painted fields
    'doorway':    ((0.08, 0.065, 0.05), 0.0, 1.00),  # the dark of a room seen through a door (the page lights 'dark' as a gallery interior)
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
              relief=0.3, batter=7.5, moss_cover=0.3, ground=None, band=None, tilt=None, split=None, top_mat=None):
    """A steep cliff of ledge rock: `strata` benches (z0 to z1 in all), each the previous outline inset 1-3 m with
    noise; the stack dips `dip` degrees and its tops vary `relief` m along the outline (about 1.5 steps a wall foot's
    ledge up and down). Faces lean back by `batter` degrees, with deep joint notches, a two-step rounded lip and
    `rock2` stains. Tops are pale `mat` with a `rim`; only the topmost bench gets moss, as irregular islands over
    `moss_cover` of its top. `boulders` irregular chunks sit on the ledges, partly sunk. Give a footprint that hugs a
    wall: inner edge inside the terrace fill, outer edge 8-12 m out. Returns top(x, y), the top height at a point.
    tilt(x, y): metres added to every level at (x, y), so the stack follows the hill's slope (give dip=0 with it; the
    dip's direction is random). split: the benches' share of z0..z1, bottom first (e.g. (0.5, 0.3, 0.2)), so they are
    not all the same height. top_mat: material of the topmost bench's top inside the rim (e.g. 'grass' for a grassy
    slope above the cliff; its moss islands still go on it). All three default off: the old models come out as before."""
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

    acc = None
    if split:
        tot = float(sum(split)); acc = [0.0]
        for f in split:
            acc.append(acc[-1] + f / tot)

    def lev(s):            # height of level s above z0 (equal benches unless split)
        return s * h if acc is None else (z1 - z0) * acc[min(s, len(acc) - 1)]

    def zat(x, y, s):      # height of level s (0 = bottom) at (x, y): stacked, dipping, relief and fine noise
        return (z0 + lev(s) + tdip * ((x - cxm) * math.cos(phi) + (y - cym) * math.sin(phi))
                + relief * math.sin(0.11 * x + 1.7 * seed) * math.cos(0.09 * y + 0.4 * seed)
                + 0.3 * math.sin(0.37 * x + 1.7 * seed) * math.cos(0.29 * y + 0.4 * seed)
                + (tilt(x, y) if tilt else 0.0))

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
            hb = h if acc is None else lev(s + 1) - lev(s)
            B = [(O[k][0] + out[k][0] * hb * tbat, O[k][1] + out[k][1] * hb * tbat) for k in (i, j)]   # batter
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
        _flat_top(F, R2, zf, top_mat if (top_mat and s == strata - 1) else mat, grid)
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


def _ray_poly(px, py, nx, ny, poly):
    """Distance along the unit vector (nx, ny) from (px, py) to the nearest crossing of the closed polygon, or None."""
    best = None
    for i in range(len(poly)):
        (x0, y0), (x1, y1) = poly[i], poly[(i + 1) % len(poly)]
        ex, ey = x1 - x0, y1 - y0
        den = nx * ey - ny * ex
        if abs(den) < 1e-9:
            continue
        t = ((x0 - px) * ey - (y0 - py) * ex) / den
        s = ((x0 - px) * ny - (y0 - py) * nx) / den
        if t > 0.0 and -1e-6 <= s <= 1.0 + 1e-6 and (best is None or t < best):
            best = t
    return best


def _wave(rnd, n=3, base=0.03):
    """A smooth 1-D noise in [0, 1] along a length s: n sines with random wavelengths (about 1/base m and shorter) and phases."""
    W = [(rnd.uniform(0.6, 1.6) * base * (1.9 ** k), rnd.uniform(0.0, TAU), 0.55 ** k) for k in range(n)]
    tot = sum(a for _, _, a in W)
    return lambda s: 0.5 + 0.5 * sum(a * math.sin(w * s + p) for w, p, a in W) / tot


def _tris():
    return sum(len(f) - 2 for g in _bk._G.values() for f in g[1])


def cliff_band(F, rim, z_rim, z_toe, toe_poly, z_mid=None, seed=1, spacing=(1.9, 3.3), w_in=5.0, skirt=4.0,
               bench=(0.0, 5.5), bat_up=(9.0, 17.0), bat_low=(6.0, 13.0), talus=(3.0, 7.0), slope=(30.0, 38.0),
               fissures=8, tongues=4, ivy=6, boulders=16, plants=0.35, keep=(), min_bench=None, margin=0.15,
               jitter=0.5, mat='rock', top_mat='turf', scree=0.5, alt='rock2', dark='rock2'):
    """A natural cliff along an open rim polyline, the outside on the LEFT of travel (a clockwise run round a model).
    Built from cross-sections ('stations') every 1.9-3.3 m along the rim. Each runs from a buried skirt and a top strip
    w_in m wide behind the rim, over a rounded lip, down an upper face to a mid bench (z_mid; width 0-5.5 m by noise;
    none where z_mid returns None), down a lower face, and over a scree slope (talus) to its toe. The toe lands `margin`
    m inside toe_poly (a closed polygon, e.g. the old foot outline, so the footprint stays where it was) at z_toe(x, y);
    the bench and the talus share whatever room is left, and the faces steepen where there is little. Along the rim the
    heights, bench width, talus height and face batter wander by smooth noise and the faces bulge in and out (no big
    flat facets); `fissures` stations are cut back 1.2-2.6 m into vertical gullies with taller scree fans below them,
    `tongues` stations become soil slopes coming over the rim, and `ivy` patches hang from the lip. keep: boxes
    (x0, x1, y0, y1) where no fissure, tongue or ivy goes (stairs). min_bench(x, y): a minimum bench width at a rim
    point (a stair foot). z_rim and z_mid take the rim point. Materials: `mat` the faces, `alt` patches on them,
    `dark` the fissures and the bench lips' undersides (the re-entrants), `top_mat` the top strip, tongues and wide benches.
    Returns {'top': f(x, y) -> rim height of the nearest station, 'plants': [(x, y, z, kind, scale)] for the page
    (shrubs and small trees on the benches and the scree), 'tris': triangles added, 'stations': count}."""
    F = _F(F); rnd = random.Random(seed); tri0 = _tris()
    cum = [0.0]
    for i in range(len(rim) - 1):
        cum.append(cum[-1] + math.hypot(rim[i + 1][0] - rim[i][0], rim[i + 1][1] - rim[i][1]))
    total = cum[-1]

    def at(s):
        s = max(0.0, min(total, s))
        for i in range(len(rim) - 1):
            if s <= cum[i + 1] or i == len(rim) - 2:
                t = (s - cum[i]) / ((cum[i + 1] - cum[i]) or 1e-9)
                (x0, y0), (x1, y1) = rim[i], rim[i + 1]
                return x0 + (x1 - x0) * t, y0 + (y1 - y0) * t

    S = [0.0]
    while S[-1] < total - 0.6:
        S.append(min(total, S[-1] + rnd.uniform(*spacing)))
    S[-1] = total
    wj, wb, wt, wa, wm = (_wave(rnd, 3, b) for b in (0.05, 0.04, 0.05, 0.03, 0.07))
    wu1, wu2, wl1, wl2 = (_wave(rnd, 3, 0.11) for _ in range(4))
    inkeep = lambda x, y: any(x0 <= x <= x1 and y0 <= y <= y1 for (x0, x1, y0, y1) in keep)
    st = []
    for s in S:
        x, y = at(s); xa, ya = at(s - 5.0); xb, yb = at(s + 5.0)          # the normals turn slowly: no folds at bends
        tx, ty = xb - xa, yb - ya; L = math.hypot(tx, ty) or 1.0; tx /= L; ty /= L
        k = inkeep(x, y)
        j = 0.0 if k else (wj(s) - 0.5) * 2.0 * jitter + rnd.uniform(-0.15, 0.15)
        st.append({'s': s, 'x': x - ty * j, 'y': y + tx * j, 'nx': -ty, 'ny': tx, 'keep': k})
    n = len(st)
    cand = [i for i in range(3, n - 3) if not st[i]['keep']]
    rnd.shuffle(cand)
    fis = []
    for i in cand:
        if len(fis) < fissures and all(abs(i - j) >= 5 for j in fis):
            fis.append(i)
    pull = [0.0] * n
    for i in fis:
        p = rnd.uniform(1.4, 3.2); pull[i] = max(pull[i], p)
        for j in (i - 1, i + 1):
            pull[j] = max(pull[j], 0.45 * p)
    ton = [0.0] * n; cnt = 0
    for i in cand:
        if cnt < tongues and all(abs(i - j) >= 3 for j in fis) and not any(ton[max(0, i - 5):i + 6]):
            ton[i] = 1.0; ton[i - 1] = ton[i + 1] = 0.6; cnt += 1                  # 3 stations, about 6 m wide

    prof, info = [], []
    for i, q in enumerate(st):
        x, y, s = q['x'], q['y'], q['s']
        zr = z_rim(x, y)
        D = _ray_poly(x, y, q['nx'], q['ny'], toe_poly)
        D = max(1.2, (D - margin) if D is not None else 8.0)
        zt = z_toe(x + q['nx'] * D, y + q['ny'] * D)
        zm = z_mid(x, y) if z_mid else None
        if zm is not None and not (zt + 6.0 < zm < zr - 3.0):
            zm = None
        tl = math.tan(math.radians(bat_up[0] + (bat_up[1] - bat_up[0]) * wa(s)))
        tl2 = math.tan(math.radians(bat_low[0] + (bat_low[1] - bat_low[0]) * (1.0 - wa(s))))
        tg = ton[i]
        if tg:
            tl += (1.19 - tl) * tg                               # a soil slope (about 40 degrees) over the rim
        Ht = min(talus[0] + (talus[1] - talus[0]) * wt(s) + (2.0 if pull[i] > 1.0 else 0.0), 0.35 * (zr - zt))
        zf = zt + Ht
        tw = Ht / math.tan(math.radians(slope[0] + (slope[1] - slope[0]) * wt(s + 37.0)))
        zl = zr - 0.35
        bench_on = zm is not None
        zm_e = zm if bench_on else zl - 0.55 * (zl - zf)
        wbt = max(0.0, bench[0] + (bench[1] - bench[0]) * wb(s)) if bench_on and pull[i] <= 1.0 else 0.0   # bench[0] < 0: it pinches out
        mb = min_bench(x, y) if (min_bench and bench_on) else 0.0
        wbt = max(wbt, mb)
        dup = (zl - zm_e) * tl; dlo = (zm_e - zf) * tl2
        rem = D - (dup + 0.4 + dlo + tw); bw = 0.0
        if rem >= wbt:
            extra = rem - wbt; bw = wbt
            add = min(extra, max(0.0, Ht / math.tan(math.radians(22.0)) - tw)); tw += add; extra -= add
            if bench_on and wbt > 0.3:                           # the room left over widens a bench the noise put here ...
                bw += extra
            elif extra > 0.0:                                    # ... where it pinched out (or there is none), the faces lean back
                k = 1.0 + extra / max(0.01, dup + dlo); dup *= k; dlo *= k
        else:
            bw = max(mb, rem, 0.0); short = (D - rem) + bw - D          # a stair foot keeps its bench: the rest steepens
            cut = min(short, max(0.0, tw - Ht / math.tan(math.radians(50.0)))); tw -= cut; short -= cut
            if short > 0.0:
                k = max(0.15, 1.0 - short / max(0.01, dup + dlo)); dup *= k; dlo *= k
        p = pull[i]
        b1, b2 = ((0.0, 0.0) if tg >= 0.6 else ((wu1(s) - 0.5) * 1.8, (wu2(s) - 0.5) * 1.8))
        b3, b4 = (wl1(s) - 0.5) * 2.4, (wl2(s) - 0.5) * 2.4
        hu = zl - zm_e
        # bulges go in deep but come out only a little: a bulge pushed out past the face above it turns its top to the sky,
        # and in the page those tops read as pale grey wedges (round 3). Recesses stay deep: they read as shadow.
        b1, b2 = min(b1, 0.07 * hu), min(b2, 0.07 * hu)
        hl = max(0.0, zm_e - zf)
        b3, b4 = min(b3, 0.07 * hl), min(b4, 0.07 * hl)
        z_lip = zr - 0.15 if tg >= 1.0 else zl - rnd.uniform(0.0, 0.5)          # a ragged lip, not a cut edge
        rib = min(1.0, bw / 1.5) if bench_on else 0.0             # a narrow or pinched-out bench leaves no rib across the face
        zub = zm_e + 0.25 * rib
        zbe = zm_e - 0.04 * bw
        zbl = zbe - (0.05 + 0.4 * rib)
        d_lip = -0.5 * p + (wj(s * 1.7 + 5.0) - 0.5) * 0.9
        d_ub = dup - p
        d_be = dup + bw - 0.6 * p
        d_bl = d_be + 0.05 + 0.35 * rib
        d_lb = min(d_bl + dlo - 0.3 * p, D - 0.5)
        P = [(-w_in, zr - skirt), (-w_in, zr + 0.05), (-0.7, zr), (d_lip, z_lip),
             (dup * 0.36 + b1 - p, zl - hu * 0.36), (dup * 0.72 + b2 - p, zl - hu * 0.72), (d_ub, zub), (d_be, zbe),
             (d_bl, zbl), (d_bl + dlo * 0.38 + b3 - 0.8 * p, zbl - (zbl - zf) * 0.38),
             (d_bl + dlo * 0.74 + b4 - 0.5 * p, zbl - (zbl - zf) * 0.74), (d_lb, zf), (D, zt)]
        prof.append(P); info.append({'bw': bw, 'D': D, 'rib': rib})

    def mat_of(i, k):
        s = st[i]['s']
        if k == 0:
            return mat
        if k == 7:                                            # the bench lip
            return dark if min(info[i]['rib'], info[i + 1]['rib']) > 0.6 else mat
        if k == 1:
            return top_mat
        if k == 2:
            return top_mat if wm(s) > 0.35 else mat
        if k in (3, 4, 5) and min(ton[i], ton[i + 1]) >= 0.6:   # soil only where both ends lie on the tongue's slope: a face
            return top_mat                                      # half on the steep rock read as grey soil hanging on it
        if k in (3, 4, 5, 8, 9, 10):
            if max(pull[i], pull[i + 1]) > 0.9:
                return dark
            if k == 8 and min(info[i]['rib'], info[i + 1]['rib']) > 0.6:
                return dark                                   # the shadow under a bench lip
            return alt if wm(s * 3.1 + k * 7.0) > 0.68 else mat
        if k == 6:
            return top_mat if min(info[i]['bw'], info[i + 1]['bw']) > 1.5 else mat
        return alt if wm(s * 2.3 + 11.0) > 1.0 - scree else top_mat     # k == 11: the scree

    def W(q, d, z):
        return F.p(q['x'] + q['nx'] * d, q['y'] + q['ny'] * d, z)

    for i in range(n - 1):
        A, B = prof[i], prof[i + 1]
        for k in range(len(A) - 1):
            add_poly(mat_of(i, k), [W(st[i], *A[k]), W(st[i + 1], *B[k]), W(st[i + 1], *B[k + 1]), W(st[i], *A[k + 1])])
    # round a convex corner the toe points spread apart and the straight toe edge between two of them cuts the outline's
    # corner: a scree wedge, falling slightly outward, runs out to every outline vertex that lies beyond such an edge
    for i in range(n - 1):
        a, b = st[i], st[i + 1]; (da, za), (db, zb) = prof[i][-1], prof[i + 1][-1]
        ta = (a['x'] + a['nx'] * da, a['y'] + a['ny'] * da); tb = (b['x'] + b['nx'] * db, b['y'] + b['ny'] * db)
        ex, ey = tb[0] - ta[0], tb[1] - ta[1]; L = math.hypot(ex, ey)
        if L < 1e-3:
            continue
        for vx, vy in toe_poly:
            u = ((vx - ta[0]) * ex + (vy - ta[1]) * ey) / (L * L)
            out_d = (ex * (vy - ta[1]) - ey * (vx - ta[0])) / L          # > 0: outside (left of travel)
            if 0.0 < u < 1.0 and 0.3 < out_d < 4.0:
                px, py = ta[0] + ex * u, ta[1] + ey * u; f = (out_d - margin) / out_d
                add_poly(mat_of(i, 11), [F.p(ta[0], ta[1], za), F.p(tb[0], tb[1], zb),
                                         F.p(px + (vx - px) * f, py + (vy - py) * f, min(za, zb))])

    def d_at(P, z):                                           # the upper face's distance out at height z
        for k in range(3, 6):
            (d0, z0), (d1, z1) = P[k], P[k + 1]
            if z1 <= z <= z0:
                return d0 + (d1 - d0) * (z0 - z) / ((z0 - z1) or 1e-9)
        return P[6][0]

    # ivy hanging from the lip in clumps over 1-3 stations: strands 0.35-0.9 m wide and 1-6.5 m long (longest in the middle of the
    # clump) with gaps between, each ending in a point at its own height, 0.15-0.45 m in front of the face. (Round 3: whole
    # sheets read as dark stickers, and close-set strands as black saw teeth.)
    def lerp_st(j, f):
        a, b = st[j], st[j + 1]
        nx, ny = a['nx'] + (b['nx'] - a['nx']) * f, a['ny'] + (b['ny'] - a['ny']) * f; L_ = math.hypot(nx, ny) or 1.0
        q = {'x': a['x'] + (b['x'] - a['x']) * f, 'y': a['y'] + (b['y'] - a['y']) * f, 'nx': nx / L_, 'ny': ny / L_}
        P = [(d0 + (d1 - d0) * f, z0 + (z1 - z0) * f) for (d0, z0), (d1, z1) in zip(prof[j], prof[j + 1])]
        return q, P

    icand = [i for i in range(2, n - 7) if not st[i]['keep'] and not any(ton[i:i + 6])]
    rnd.shuffle(icand); used = []
    for i in icand:
        if len(used) >= ivy:
            break
        if any(abs(i - j) < 8 for j in used):
            continue
        used.append(i); L = rnd.randint(1, 3); hmax = rnd.uniform(3.0, 6.5)
        u = rnd.uniform(0.0, 0.3)                             # position along the clump in stations
        while u < L - 0.2:
            seg = max(0.5, math.hypot(st[i + 1]['x'] - st[i]['x'], st[i + 1]['y'] - st[i]['y']))
            if rnd.random() < 0.3:                            # a gap
                u += rnd.uniform(0.4, 1.2) / seg; continue
            w_st = rnd.uniform(0.35, 0.9) / seg
            u0, u1 = u, min(L, u + w_st); um = 0.5 * (u0 + u1)
            j0 = min(i + int(u0), n - 2); j1 = min(i + int(u1), n - 2); jm = min(i + int(um), n - 2)
            (qa, Pa), (qb, Pb), (qm, Pm) = lerp_st(j0, u0 - int(u0)), lerp_st(j1, min(1.0, u1 - (j1 - i))), lerp_st(jm, um - int(um))
            h = max(1.0, hmax * (0.3 + 0.7 * math.sin(math.pi * min(1.0, um / L))) * rnd.uniform(0.3, 1.0))
            za, zb = Pa[3][1] + 0.05, Pb[3][1] + 0.05; zfl = min(Pm[3][1] - 1.0, max(Pm[6][1] + 0.3, min(za, zb) - h))
            zsa, zsb = za - (za - zfl) * rnd.uniform(0.55, 0.8), zb - (zb - zfl) * rnd.uniform(0.55, 0.8)
            off = rnd.uniform(0.15, 0.45)
            add_poly('ivy', [W(qa, d_at(Pa, za) + off, za), W(qb, d_at(Pb, zb) + off, zb),
                             W(qb, d_at(Pb, zsb) + off, zsb), W(qa, d_at(Pa, zsa) + off, zsa)])
            add_poly('ivy', [W(qa, d_at(Pa, zsa) + off, zsa), W(qb, d_at(Pb, zsb) + off, zsb), W(qm, d_at(Pm, zfl) + off, zfl)])
            u = u1 - rnd.uniform(0.0, 0.15) * w_st

    out = []
    for _ in range(boulders):                                  # boulders on the scree (most) and the bench
        i = rnd.randrange(n); P = prof[i]; q = st[i]
        if info[i]['bw'] > 1.5 and rnd.random() < 0.3:
            t = rnd.uniform(0.2, 0.8); d = P[6][0] + (P[7][0] - P[6][0]) * t; z = P[6][1] + (P[7][1] - P[6][1]) * t
        else:
            t = rnd.uniform(0.25, 0.85); d = P[11][0] + (P[12][0] - P[11][0]) * t; z = P[11][1] + (P[12][1] - P[11][1]) * t
        size = rnd.uniform(1.4, 3.2)
        d = min(d, P[12][0] - 0.6 * size)                      # inside the toe: a boulder does not push the foot outline out
        _chunk(F, q['x'] + q['nx'] * d, q['y'] + q['ny'] * d, z - 0.3 * size, size, rnd, mat, rnd.uniform(0.0, 90.0))
    for i in range(n):                                         # where the page plants shrubs and small trees
        P = prof[i]; q = st[i]
        if q['keep']:
            continue
        r = rnd.random()
        if info[i]['bw'] > 2.5 and r < plants:
            t = rnd.uniform(0.35, 0.75); d = P[6][0] + (P[7][0] - P[6][0]) * t; z = P[6][1] + (P[7][1] - P[6][1]) * t
            u = rnd.random(); kind = 'shrub' if u < 0.55 else 'broadD' if u < 0.8 else 'fig'
        elif r < plants * 0.7:
            t = rnd.uniform(0.3, 0.8); d = P[11][0] + (P[12][0] - P[11][0]) * t; z = P[11][1] + (P[12][1] - P[11][1]) * t
            kind = 'shrub' if rnd.random() < 0.75 else 'broadD'
        else:
            continue
        out.append((round(q['x'] + q['nx'] * d, 1), round(q['y'] + q['ny'] * d, 1), round(z, 1), kind,
                    round(rnd.uniform(0.55, 0.9) if kind != 'shrub' else rnd.uniform(0.6, 1.0), 2)))

    def top(x, y):
        b = min(range(n), key=lambda i: (st[i]['x'] - x) ** 2 + (st[i]['y'] - y) ** 2)
        return prof[b][2][1]
    return {'top': top, 'plants': out, 'tris': _tris() - tri0, 'stations': n}


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
