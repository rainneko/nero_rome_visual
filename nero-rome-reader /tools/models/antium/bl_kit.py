"""bl_kit · shared Blender building kit for the Antium assets (Blender 5.x, background mode).

Run an asset script with:
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/antium/<asset>.py"

Conventions (same as the web page after glTF export):
  * metres; Blender +X = east, +Y = north, +Z = up (exported as Y-up: web x east, z south)
  * origin = centre of the footprint, z = 0 = ground-floor level; foundations go below z = 0
  * no trees (the page adds them), no glass windows (AD 56), roofs terracotta

Everything is accumulated per material and joined into one object at the end (fast, clean GLB).
Wall lines run counter-clockwise around a building: the outside is on the RIGHT of p0 -> p1.
"""
import bpy, math, os, sys, json, time
from mathutils import Vector, Matrix

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
TAU = math.pi * 2
GLB_SUB = 'antium'   # export folder under assets/models/ (the Rome kit sets 'rome')
PREVIEW_GROUND = -0.05   # z of the grey preview ground (set it lower for assets with walls below their floor)
D2R = math.pi / 180


def _lin(c):
    return tuple(((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92 for v in c)


# name: (sRGB colour 0-1, metallic, roughness)
PAL = {
    'marble':  ((0.90, 0.88, 0.83), 0.0, 0.45),   # white marble: columns, steps, statues, cornices
    'plaster': ((0.89, 0.86, 0.79), 0.0, 0.85),   # lime-washed walls
    'stone':   ((0.76, 0.71, 0.62), 0.0, 0.90),   # travertine / limestone ashlar
    'tuff':    ((0.56, 0.51, 0.42), 0.0, 0.95),   # foundations, retaining walls
    'tile':    ((0.66, 0.34, 0.24), 0.0, 0.80),   # terracotta roof tiles
    'tile2':   ((0.55, 0.31, 0.23), 0.0, 0.85),   # older / darker tiles (ribs, ridges)
    'red':     ((0.58, 0.17, 0.13), 0.0, 0.80),   # Pompeian red bands and dados
    'ochre':   ((0.78, 0.58, 0.30), 0.0, 0.85),
    'brick':   ((0.64, 0.38, 0.27), 0.0, 0.90),
    'wood':    ((0.38, 0.26, 0.17), 0.0, 0.85),
    'gallery_wall': ((0.50, 0.44, 0.35), 0.0, 0.92),
    'gallery_floor': ((0.47, 0.42, 0.34), 0.0, 0.92),
    'dark':    ((0.20, 0.17, 0.14), 0.0, 0.95),   # inside openings (never pure black)
    'felt':    ((0.035, 0.035, 0.035), 0.0, 1.0), # black wool felt (book: dark room windows)
    'bronze':  ((0.50, 0.36, 0.20), 0.7, 0.45),
    'gold':    ((0.88, 0.66, 0.30), 0.8, 0.35),   # the page boosts materials named 'gold'
    'iron':    ((0.20, 0.20, 0.21), 0.8, 0.50),
    'silver':  ((0.86, 0.87, 0.89), 1.0, 0.25),
    'copper':  ((0.72, 0.43, 0.27), 0.9, 0.40),
    'lead':    ((0.45, 0.47, 0.49), 0.6, 0.60),
    'water':   ((0.20, 0.45, 0.50), 0.0, 0.08),
    'grass':   ((0.36, 0.46, 0.22), 0.0, 0.95),
    'hedge':   ((0.17, 0.30, 0.13), 0.0, 0.90),
    'gravel':  ((0.80, 0.76, 0.66), 0.0, 0.95),
    'paving':  ((0.80, 0.77, 0.70), 0.0, 0.80),   # stone paving of courts and terraces
    'flowerR': ((0.78, 0.18, 0.20), 0.0, 0.90),
    'flowerY': ((0.92, 0.78, 0.25), 0.0, 0.90),
    'flowerW': ((0.93, 0.92, 0.88), 0.0, 0.90),
    'flowerP': ((0.55, 0.35, 0.70), 0.0, 0.90),
    'cloth':   ((0.62, 0.18, 0.20), 0.0, 0.95),
}

_G = {}          # material -> [verts, faces, smooth flags]
_EXTRA = []      # preview-only objects (ground, scale figure)


def reset():
    """Empty scene and geometry buffers."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _G.clear(); _EXTRA.clear()
    sc = bpy.context.scene
    sc.unit_settings.system = 'METRIC'


def _buf(mat):
    if mat not in PAL:
        raise ValueError('unknown material %r; use one of %s' % (mat, ', '.join(PAL)))
    return _G.setdefault(mat, [[], [], []])


def add_poly(mat, pts, smooth=False):
    """One polygon (list of 3D points, counter-clockwise seen from outside)."""
    if len(pts) < 3:
        return
    b = _buf(mat); o = len(b[0])
    b[0].extend([tuple(p) for p in pts]); b[1].append(tuple(range(o, o + len(pts)))); b[2].append(smooth)


def add_mesh(mat, verts, faces, smooth=False):
    b = _buf(mat); o = len(b[0])
    b[0].extend([tuple(v) for v in verts])
    for f in faces:
        b[1].append(tuple(o + i for i in f)); b[2].append(smooth)


class Frame:
    """A local frame: origin (x, y, z) and a rotation about Z in degrees. F.p(lx, ly, lz) -> world point."""
    def __init__(self, x=0.0, y=0.0, z=0.0, rot=0.0):
        self.o = Vector((x, y, z)); self.r = rot * D2R
        self.c = math.cos(self.r); self.s = math.sin(self.r)

    def p(self, x, y, z):
        return Vector((self.o.x + x * self.c - y * self.s, self.o.y + x * self.s + y * self.c, self.o.z + z))

    def sub(self, x=0.0, y=0.0, z=0.0, rot=0.0):
        q = self.p(x, y, z); return Frame(q.x, q.y, q.z, (self.r / D2R) + rot)


F0 = Frame()


def _F(F):
    return F if F is not None else F0


# ---------------------------------------------------------------- primitives
def box(F, cx, cy, z0, sx, sy, sz, mat, rot=0.0):
    """Axis box centred at (cx, cy) in frame F, from z0 to z0 + sz, optionally rotated by rot degrees."""
    F = _F(F).sub(cx, cy, z0, rot); hx, hy = sx / 2, sy / 2
    v = [F.p(-hx, -hy, 0), F.p(hx, -hy, 0), F.p(hx, hy, 0), F.p(-hx, hy, 0),
         F.p(-hx, -hy, sz), F.p(hx, -hy, sz), F.p(hx, hy, sz), F.p(-hx, hy, sz)]
    add_mesh(mat, v, [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])


def beam(F, x0, y0, z0, x1, y1, z1, w, h, mat):
    """A box of width w and height h from point 0 to point 1 (any direction, e.g. a sloping ridge)."""
    F = _F(F); a = F.p(x0, y0, z0); b = F.p(x1, y1, z1); d = b - a
    if d.length < 1e-6:
        return
    ax = d.normalized(); up = Vector((0, 0, 1))
    side = ax.cross(up)
    if side.length < 1e-6:
        side = Vector((1, 0, 0))
    side.normalize(); up2 = side.cross(ax).normalized()
    sw = side * (w / 2); uh = up2 * (h / 2)
    v = [a - sw - uh, a + sw - uh, a + sw + uh, a - sw + uh, b - sw - uh, b + sw - uh, b + sw + uh, b - sw + uh]
    add_mesh(mat, v, [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)])


def prism(F, pts, z0, z1, mat, smooth=False):
    """Extrude a 2D polygon (counter-clockwise list of (x, y)) from z0 to z1."""
    F = _F(F); n = len(pts)
    bot = [F.p(x, y, z0) for x, y in pts]; top = [F.p(x, y, z1) for x, y in pts]
    add_poly(mat, list(reversed(bot))); add_poly(mat, top)
    for i in range(n):
        j = (i + 1) % n
        add_poly(mat, [bot[i], bot[j], top[j], top[i]], smooth)


def cyl(F, cx, cy, z0, r, h, mat, seg=16, r_top=None, smooth=True, caps=True):
    """Cylinder or frustum standing at (cx, cy), from z0 to z0 + h."""
    F = _F(F); rt = r if r_top is None else r_top
    b = [F.p(cx + r * math.cos(TAU * i / seg), cy + r * math.sin(TAU * i / seg), z0) for i in range(seg)]
    t = [F.p(cx + rt * math.cos(TAU * i / seg), cy + rt * math.sin(TAU * i / seg), z0 + h) for i in range(seg)]
    for i in range(seg):
        j = (i + 1) % seg
        if rt > 1e-4:
            add_poly(mat, [b[i], b[j], t[j], t[i]], smooth)
        else:
            add_poly(mat, [b[i], b[j], t[i]], smooth)
    if caps:
        add_poly(mat, list(reversed(b)))
        if rt > 1e-4:
            add_poly(mat, t)


def sphere(F, cx, cy, cz, r, mat, seg=12, rings=8, z_scale=1.0):
    F = _F(F); V = []; Fa = []
    for i in range(rings + 1):
        th = math.pi * i / rings
        for j in range(seg):
            ph = TAU * j / seg
            V.append(F.p(cx + r * math.sin(th) * math.cos(ph), cy + r * math.sin(th) * math.sin(ph), cz + r * z_scale * math.cos(th)))
    for i in range(rings):
        for j in range(seg):
            a = i * seg + j; b = i * seg + (j + 1) % seg; c = (i + 1) * seg + (j + 1) % seg; d = (i + 1) * seg + j
            Fa.append((a, d, c, b))
    add_mesh(mat, V, Fa, smooth=True)


def lathe(F, cx, cy, profile, mat, seg=24, smooth=True):
    """Revolve a profile [(r, z), ...] (bottom to top) around a vertical axis."""
    F = _F(F); n = len(profile); V = []; Fa = []
    for r, z in profile:
        for j in range(seg):
            a = TAU * j / seg; V.append(F.p(cx + r * math.cos(a), cy + r * math.sin(a), z))
    for i in range(n - 1):
        for j in range(seg):
            a = i * seg + j; b = i * seg + (j + 1) % seg; c = (i + 1) * seg + (j + 1) % seg; d = (i + 1) * seg + j
            Fa.append((a, b, c, d))
    add_mesh(mat, V, Fa, smooth)


# ---------------------------------------------------------------- classical parts
def column(F, cx, cy, z0, h, r=None, mat='marble', order='ionic', flutes=0, seg=12, base=True, cap_mat=None):
    """A column: plinth, base, tapering shaft (optionally fluted), capital and abacus. Total height h."""
    r = r if r else h / 18.0
    cm = cap_mat or mat
    ph = r * 0.5 if base else 0.0
    if base:
        box(F, cx, cy, z0, r * 2.5, r * 2.5, ph * 0.55, mat)
        cyl(F, cx, cy, z0 + ph * 0.55, r * 1.18, ph * 0.45, mat, seg, r_top=r * 1.02)
    cap_h = {'tuscan': r * 0.9, 'doric': r * 0.9, 'ionic': r * 1.0, 'corinthian': r * 2.2}.get(order, r)
    sh = h - ph - cap_h
    if flutes:
        n = flutes * 2; F2 = _F(F)
        bot = []; top = []
        for i in range(n):
            a = TAU * i / n; q = 1 - 0.06 * (i % 2)
            bot.append(F2.p(cx + r * q * math.cos(a), cy + r * q * math.sin(a), z0 + ph))
            top.append(F2.p(cx + r * 0.86 * q * math.cos(a), cy + r * 0.86 * q * math.sin(a), z0 + ph + sh))
        for i in range(n):
            j = (i + 1) % n; add_poly(mat, [bot[i], bot[j], top[j], top[i]], True)
    else:
        cyl(F, cx, cy, z0 + ph, r, sh, mat, seg, r_top=r * 0.86, caps=False)
    zc = z0 + ph + sh
    if order == 'corinthian':
        cyl(F, cx, cy, zc, r * 0.88, cap_h * 0.8, cm, seg, r_top=r * 1.25)
        box(F, cx, cy, zc + cap_h * 0.8, r * 2.7, r * 2.7, cap_h * 0.2, cm)
    elif order == 'ionic':
        cyl(F, cx, cy, zc, r * 0.9, cap_h * 0.45, cm, seg, r_top=r * 1.05)
        box(F, cx, cy, zc + cap_h * 0.45, r * 2.6, r * 1.7, cap_h * 0.3, cm)      # volute bolster
        box(F, cx, cy, zc + cap_h * 0.75, r * 2.4, r * 2.4, cap_h * 0.25, cm)
    else:
        cyl(F, cx, cy, zc, r * 0.88, cap_h * 0.5, cm, seg, r_top=r * 1.2)
        box(F, cx, cy, zc + cap_h * 0.5, r * 2.5, r * 2.5, cap_h * 0.5, cm)


def entablature(F, x0, y0, x1, y1, z0, h, depth, mat='marble', frieze_mat=None, cornice_proj=None):
    """Architrave, frieze and cornice along a line (for colonnades)."""
    F = _F(F); L = math.hypot(x1 - x0, y1 - y0)
    if L < 1e-6:
        return
    rot = math.atan2(y1 - y0, x1 - x0) / D2R; mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    cp = depth * 0.25 if cornice_proj is None else cornice_proj
    box(F, mx, my, z0, L, depth, h * 0.4, mat, rot)
    box(F, mx, my, z0 + h * 0.4, L, depth * 0.92, h * 0.33, frieze_mat or mat, rot)
    box(F, mx, my, z0 + h * 0.73, L + cp * 2, depth + cp * 2, h * 0.27, mat, rot)


def colonnade(F, x0, y0, x1, y1, z0, n, h, r=None, mat='marble', order='ionic', ent=True, ent_h=None, ent_depth=None,
              flutes=0, seg=12):
    """n columns from (x0, y0) to (x1, y1), both ends included, with an entablature on top. Returns top z."""
    r = r if r else h / 18.0
    for i in range(n):
        t = i / (n - 1) if n > 1 else 0.5
        column(F, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, z0, h, r, mat, order, flutes, seg)
    eh = ent_h if ent_h else h * 0.2
    if ent and n > 1:
        entablature(F, x0, y0, x1, y1, z0 + h, eh, ent_depth or r * 2.6, mat)
    return z0 + h + (eh if ent else 0)


def ring_colonnade(F, cx, cy, z0, R, n, h, r=None, mat='marble', order='ionic', ent=True, ent_h=None, a0=0.0, a1=360.0,
                   seg=10):
    """Columns on a circle (or an arc from a0 to a1 degrees) with a segmented ring entablature."""
    r = r if r else h / 18.0
    full = abs(a1 - a0) >= 359.9
    m = n if full else n - 1
    pts = []
    for i in range(n):
        a = (a0 + (a1 - a0) * i / m) * D2R
        pts.append((cx + R * math.cos(a), cy + R * math.sin(a)))
        column(F, pts[-1][0], pts[-1][1], z0, h, r, mat, order, 0, seg)
    eh = ent_h if ent_h else h * 0.2
    if ent:
        k = n if full else n - 1
        for i in range(k):
            p, q = pts[i], pts[(i + 1) % n]
            entablature(F, p[0], p[1], q[0], q[1], z0 + h, eh, r * 2.6, mat)
    return z0 + h + (eh if ent else 0)


def wall(F, x0, y0, x1, y1, z0, h, t, mat):
    """Straight wall of thickness t centred on the line p0 -> p1."""
    L = math.hypot(x1 - x0, y1 - y0)
    if L < 1e-6:
        return
    box(F, (x0 + x1) / 2, (y0 + y1) / 2, z0, L, t, h, mat, math.atan2(y1 - y0, x1 - x0) / D2R)


def _arch_pts(u0, u1, zs, seg):
    """Semicircular arch points from left springing (u0, zs) over the top to the right (u1, zs)."""
    r = (u1 - u0) / 2; c = (u0 + u1) / 2
    return [(c - r * math.cos(math.pi * i / seg), zs + r * math.sin(math.pi * i / seg)) for i in range(seg + 1)]


def arcade(F, x0, y0, x1, y1, z0, h, t, n, mat='stone', open_w=None, open_h=None, seg=10, back=None, impost_mat=None,
           keystone=True):
    """A wall from p0 to p1 with n semicircular arched openings through it.
    open_w: opening width (default 62 % of a bay); open_h: height to the crown (default 78 % of h).
    back=None: the openings go through (arcade, bridge, gate). back='dark': a dark panel 0.05 m inside the back face
    (blind arcade on a solid building). Returns nothing."""
    F = _F(F); L = math.hypot(x1 - x0, y1 - y0)
    if L < 1e-6:
        return
    rot = math.atan2(y1 - y0, x1 - x0) / D2R; W = F.sub(x0, y0, 0, rot)
    bay = L / n; ow = open_w if open_w else bay * 0.62; oh = open_h if open_h else h * 0.78
    ow = min(ow, bay - 0.4); zs = oh - ow / 2
    if zs < 0.2:
        zs = 0.2
    yf, yb = -t / 2, t / 2           # local y: front face (outside, right of p0->p1) is -y
    P = lambda u, z, y: W.p(u, y, z0 + z)
    for k in range(n):
        u0 = k * bay; u1 = u0 + bay; a0 = (u0 + u1) / 2 - ow / 2; a1 = a0 + ow
        arch = _arch_pts(a0, a1, zs, seg)
        poly = [(u0, 0), (a0, 0), (a0, zs)] + arch[1:-1] + [(a1, zs), (a1, 0), (u1, 0), (u1, h), (u0, h)]
        add_poly(mat, [P(u, z, yf) for u, z in poly])
        add_poly(mat, [P(u, z, yb) for u, z in reversed(poly)])
        rim = [(a0, 0), (a0, zs)] + arch[1:-1] + [(a1, zs), (a1, 0)]
        for i in range(len(rim) - 1):
            (ua, za), (ub, zb) = rim[i], rim[i + 1]
            add_poly(mat, [P(ua, za, yf), P(ua, za, yb), P(ub, zb, yb), P(ub, zb, yf)])
        if back == 'dark':
            add_poly('gallery_wall', [P(a0, 0, yb - 0.05), P(a1, 0, yb - 0.05)] + [P(u, z, yb - 0.05) for u, z in reversed(arch)])
        if impost_mat:
            for uu in (a0, a1):
                box(W, uu, 0, z0 + zs - 0.25, 0.5, t + 0.12, 0.25, impost_mat)
        if keystone:
            box(W, (a0 + a1) / 2, 0, z0 + zs + ow / 2 - 0.15, 0.5, t + 0.06, 0.7, impost_mat or mat)
    # wall top and ends
    add_poly(mat, [P(0, h, yf), P(L, h, yf), P(L, h, yb), P(0, h, yb)])
    add_poly(mat, [P(0, 0, yb), P(0, 0, yf), P(0, h, yf), P(0, h, yb)])
    add_poly(mat, [P(L, 0, yf), P(L, 0, yb), P(L, h, yb), P(L, h, yf)])


def opening_skin(F, x0, y0, x1, y1, z0, h, openings, mat='plaster', depth=0.35, inner='dark', reveal_mat=None,
                 frame_mat=None):
    """A facade skin on the OUTSIDE of a wall line p0 -> p1 (outside = right side), from z0 to z0 + h, with holes.
    openings: list of (u_centre, z_bottom, width, height, kind); kind 'rect' or 'arch'; z relative to z0.
    Openings may be stacked and of different widths, but must not overlap each other.
    Each hole has reveals `depth` deep and a dark back panel, so windows read as real recesses (never see-through).
    Use it on a core block whose face lies on the line (rect_building does this for you)."""
    F = _F(F); L = math.hypot(x1 - x0, y1 - y0)
    if L < 1e-6:
        return
    rot = math.atan2(y1 - y0, x1 - x0) / D2R; W = F.sub(x0, y0, z0, rot)
    rm = reveal_mat or mat
    yo = -0.01 - depth
    P = lambda u, z, y=yo: W.p(u, y, z)
    ops = []
    for (uc, zb, w, hh, kind) in openings:
        a, b = max(0.05, uc - w / 2), min(L - 0.05, uc + w / 2)
        if b - a < 0.1 or zb < 0 or zb + hh > h:
            continue
        ops.append((a, b, zb, hh, kind))

    def top_at(o, u):
        a, b, zb, hh, kind = o
        if kind != 'arch':
            return zb + hh
        r = (b - a) / 2; c = (a + b) / 2; zs = zb + hh - r
        return zs + math.sqrt(max(0.0, r * r - (u - c) ** 2))

    edges = sorted(set([0.0, L] + [o[0] for o in ops] + [o[1] for o in ops]))
    for i in range(len(edges) - 1):
        u0, u1 = edges[i], edges[i + 1]
        if u1 - u0 < 1e-4:
            continue
        cov = sorted([o for o in ops if o[0] <= u0 + 1e-6 and o[1] >= u1 - 1e-6], key=lambda o: o[2])
        zcur_pts = [(u0, 0.0), (u1, 0.0)]          # current lower boundary (left to right)
        for o in cov + [None]:
            zt = h if o is None else o[2]
            low = zcur_pts
            poly = [P(u, z) for u, z in low] + [P(u1, zt), P(u0, zt)]
            if zt - max(z for _, z in low) > -1e-6 and (zt - min(z for _, z in low)) > 1e-4:
                add_poly(mat, poly)
            if o is None:
                break
            a, b, zb, hh, kind = o
            if kind == 'arch':
                r = (b - a) / 2; c = (a + b) / 2
                us = [u0] + [c - r * math.cos(math.pi * k / 10) for k in range(1, 10) if u0 < c - r * math.cos(math.pi * k / 10) < u1] + [u1]
                zcur_pts = [(u, top_at(o, u)) for u in us]
            else:
                zcur_pts = [(u0, zb + hh), (u1, zb + hh)]
    for (a, b, zb, hh, kind) in ops:
        top = zb + hh
        if kind == 'arch':
            zs = top - (b - a) / 2; arch = _arch_pts(a, b, zs, 10)
            rim = [(a, zb), (a, zs)] + arch[1:-1] + [(b, zs), (b, zb)]
        else:
            rim = [(a, zb), (a, top), (b, top), (b, zb)]
        rim_c = rim + [rim[0]]
        for i in range(len(rim_c) - 1):
            (ua, za), (ub, zb2) = rim_c[i], rim_c[i + 1]
            add_poly(rm, [P(ua, za), P(ua, za, -0.005), P(ub, zb2, -0.005), P(ub, zb2)])
        back_mat = 'gallery_wall' if kind == 'arch' and inner == 'dark' else inner
        add_poly(back_mat, [P(u, z, -0.02) for u, z in reversed(rim)])
        if kind == 'arch':
            add_poly('gallery_floor', [P(a, zb), P(b, zb), P(b, zb, -0.02), P(a, zb, -0.02)])
        if frame_mat:
            uc = (a + b) / 2; w = b - a
            box(W, uc, yo - 0.06, zb - 0.12, w + 0.4, 0.22, 0.14, frame_mat)
            if kind != 'arch':
                box(W, uc, yo - 0.05, top, w + 0.3, 0.18, 0.22, frame_mat)
    add_poly(mat, [P(0, h), P(L, h), P(L, h, 0), P(0, h, 0)])


def band(F, x0, y0, x1, y1, z, h=0.28, proj=0.42, mat='red'):
    """A projecting horizontal band (string course) on the outside of a wall line."""
    L = math.hypot(x1 - x0, y1 - y0)
    if L < 1e-6:
        return
    rot = math.atan2(y1 - y0, x1 - x0) / D2R; W = _F(F).sub(x0, y0, 0, rot)
    box(W, L / 2, -proj / 2, z, L, proj, h, mat)


def cornice(F, x0, y0, x1, y1, z, h=0.5, proj=0.6, mat='stone'):
    L = math.hypot(x1 - x0, y1 - y0)
    if L < 1e-6:
        return
    rot = math.atan2(y1 - y0, x1 - x0) / D2R; W = _F(F).sub(x0, y0, 0, rot)
    box(W, L / 2, -proj / 2 + 0.1, z, L + proj * 2, proj + 0.2, h * 0.45, mat)
    box(W, L / 2, -proj * 0.3 + 0.1, z - h * 0.55, L + proj, proj * 0.6 + 0.2, h * 0.55, mat)


# ---------------------------------------------------------------- roofs
def _ribs(mat, eave_a, eave_b, run_vec, rise, spacing, lens, w=0.17, hgt=0.09):
    """Cover-tile ribs on a slope: from points along the eave (a -> b) up the slope; lens(u) gives plan length."""
    L = (eave_b - eave_a).length
    if L < 0.3:
        return
    ex = (eave_b - eave_a).normalized(); n = max(1, int(L / spacing))
    rl = run_vec.length; rn = run_vec.normalized()
    for i in range(n):
        u = (i + 0.5) * L / n; pl = lens(u)
        if pl < 0.25:
            continue
        a = eave_a + ex * u; b = a + rn * pl + Vector((0, 0, rise * pl / rl))
        # lift ribs slightly off the surface along the slope normal
        nrm = (ex.cross(b - a)).normalized()
        if nrm.z < 0:
            nrm = -nrm
        lift = nrm * (hgt * 0.5)
        sw = ex * (w / 2); uh = nrm * (hgt / 2)
        a2 = a + lift; b2 = b + lift
        v = [a2 - sw - uh, a2 + sw - uh, a2 + sw + uh, a2 - sw + uh, b2 - sw - uh, b2 + sw - uh, b2 + sw + uh, b2 - sw + uh]
        add_mesh(mat, v, [(0, 1, 2, 3), (2, 6, 7, 3), (1, 5, 6, 2), (0, 3, 7, 4), (4, 7, 6, 5)])


def hip_roof(F, cx, cy, z0, w, d, pitch=22.0, overhang=0.6, mat='tile', tiles=True, rib_mat='tile2', rot=0.0):
    """Hipped roof over a w x d footprint centred at (cx, cy), eaves at z0. w == d gives a pyramid. Returns apex z."""
    F = _F(F).sub(cx, cy, z0, rot)
    W2, D2 = w / 2 + overhang, d / 2 + overhang
    run = min(W2, D2); rise = run * math.tan(pitch * D2R)
    if W2 >= D2:
        r0, r1 = Vector((-(W2 - run), 0, rise)), Vector(((W2 - run), 0, rise))
    else:
        r0, r1 = Vector((0, -(D2 - run), rise)), Vector((0, (D2 - run), rise))
    c = [F.p(-W2, -D2, 0), F.p(W2, -D2, 0), F.p(W2, D2, 0), F.p(-W2, D2, 0)]
    R0, R1 = F.p(r0.x, r0.y, rise), F.p(r1.x, r1.y, rise)
    if W2 >= D2:
        add_poly(mat, [c[0], c[1], R1, R0]); add_poly(mat, [c[2], c[3], R0, R1])
        add_poly(mat, [c[1], c[2], R1]); add_poly(mat, [c[3], c[0], R0])
    else:
        add_poly(mat, [c[1], c[2], R1, R0]); add_poly(mat, [c[3], c[0], R0, R1])
        add_poly(mat, [c[0], c[1], R0]); add_poly(mat, [c[2], c[3], R1])
    add_poly(mat, [c[0], c[3], c[2], c[1]])           # soffit (no see-through from below)
    # fascia
    for i in range(4):
        a, b = c[i], c[(i + 1) % 4]; dz = Vector((0, 0, -0.18)); add_poly(rib_mat, [a, a + dz, b + dz, b])
    if tiles:
        sp = 0.62
        edges = [(c[0], c[1]), (c[1], c[2]), (c[2], c[3]), (c[3], c[0])]
        for i, (a, b) in enumerate(edges):
            L = (b - a).length; mid = (a + b) / 2
            ctr = F.p(0, 0, 0); inward = (ctr - mid); inward.z = 0
            depth = run
            iv = inward.normalized() * depth
            _ribs(rib_mat, a, b, iv, rise, sp, lambda u, L=L: min(u, L - u, depth) * 0.98)
        beam(None, R0.x, R0.y, R0.z + 0.05, R1.x, R1.y, R1.z + 0.05, 0.34, 0.26, rib_mat)
        for k in range(4):
            Rk = R0 if k in (0, 3) else R1
            if W2 < D2:
                Rk = R0 if k in (0, 1) else R1
            beam(None, c[k].x, c[k].y, c[k].z + 0.05, Rk.x, Rk.y, Rk.z + 0.05, 0.3, 0.22, rib_mat)
    return z0 + rise


def pyramid_roof(F, cx, cy, z0, w, pitch=28.0, overhang=0.6, mat='tile', tiles=True, rot=0.0):
    return hip_roof(F, cx, cy, z0, w, w, pitch, overhang, mat, tiles, rot=rot)


def gable_roof(F, cx, cy, z0, w, d, pitch=22.0, axis='x', overhang=0.5, mat='tile', tiles=True, rib_mat='tile2',
               gable_mat='plaster', pediment=False, tymp_mat=None, rot=0.0):
    """Gabled roof over w x d, ridge along local x (axis='x') or y; eaves at z0 on the wall line.
    The gable triangles are always closed (gable_mat, both faces). pediment=True adds raking and horizontal cornices
    and a recessed tympanum (temple front). Returns the ridge z."""
    if axis == 'y':
        return gable_roof(F, cx, cy, z0, d, w, pitch, 'x', overhang, mat, tiles, rib_mat, gable_mat, pediment, tymp_mat,
                          rot + 90.0)
    F = _F(F).sub(cx, cy, z0, rot)
    tn = math.tan(pitch * D2R); rise = (d / 2) * tn
    W2 = w / 2 + overhang * 0.6; D2 = d / 2 + overhang; ze = -overhang * tn
    a, b = F.p(-W2, -D2, ze), F.p(W2, -D2, ze)
    c, e = F.p(W2, D2, ze), F.p(-W2, D2, ze)
    r0, r1 = F.p(-W2, 0, rise), F.p(W2, 0, rise)
    add_poly(mat, [a, b, r1, r0]); add_poly(mat, [c, e, r0, r1])        # slopes
    add_poly(mat, [a, r0, r1, b]); add_poly(mat, [c, r1, r0, e])        # undersides
    for sx in (-1, 1):                                                  # verge boards at the gable ends
        q = [F.p(sx * W2, -D2, ze), F.p(sx * W2, 0, rise), F.p(sx * W2, D2, ze)]
        add_poly(rib_mat, [q[0], q[1], q[1] + Vector((0, 0, -0.2)), q[0] + Vector((0, 0, -0.2))][::(1 if sx < 0 else -1)])
        add_poly(rib_mat, [q[1], q[2], q[2] + Vector((0, 0, -0.2)), q[1] + Vector((0, 0, -0.2))][::(1 if sx < 0 else -1)])
    for sx in (-1, 1):
        x = sx * w / 2
        tri = [F.p(x, -d / 2, 0), F.p(x, d / 2, 0), F.p(x, 0, rise)]     # normal +x
        # both faces are added, but the mesh validation keeps only the first of two identical polygons, so the
        # first copy must face outward: +x for the +x gable, -x for the -x gable
        out_f, in_f = (tri, tri[::-1]) if sx > 0 else (tri[::-1], tri)
        add_poly(gable_mat, out_f); add_poly(gable_mat, in_f)
        if pediment:
            tm = tymp_mat or gable_mat; xi = x - sx * 0.3
            tt = [F.p(xi, -d / 2 + 1.0, 0.45), F.p(xi, d / 2 - 1.0, 0.45), F.p(xi, 0, rise - 0.6)]
            add_poly(tm, tt if sx > 0 else tt[::-1])
            # side walls of the tympanum recess
            for s2 in (-1, 1):
                beam(F, x + sx * 0.05, s2 * (d / 2 + 0.3), -0.05, x + sx * 0.05, 0, rise + 0.15, 0.7, 0.45, 'marble')
            beam(F, x + sx * 0.05, -d / 2 - 0.35, 0.1, x + sx * 0.05, d / 2 + 0.35, 0.1, 0.7, 0.5, 'marble')
    if tiles:
        yv = F.p(0, 1, 0) - F.p(0, 0, 0)
        _ribs(rib_mat, a, b, yv * D2, rise - ze, 0.62, lambda u: D2 * 0.97)
        _ribs(rib_mat, c, e, -yv * D2, rise - ze, 0.62, lambda u: D2 * 0.97)
        beam(None, r0.x, r0.y, r0.z + 0.06, r1.x, r1.y, r1.z + 0.06, 0.36, 0.28, rib_mat)
    return z0 + rise


def lean_roof(F, x0, y0, x1, y1, z_high, depth, drop, mat='tile', tiles=True, rib_mat='tile2'):
    """Mono-pitch roof against a wall line p0 -> p1, sloping down `drop` metres over `depth` to the outside (right)."""
    L = math.hypot(x1 - x0, y1 - y0)
    if L < 1e-6:
        return
    rot = math.atan2(y1 - y0, x1 - x0) / D2R; W = _F(F).sub(x0, y0, 0, rot)
    a, b = W.p(0, 0, z_high), W.p(L, 0, z_high); c, e = W.p(L, -depth, z_high - drop), W.p(0, -depth, z_high - drop)
    add_poly(mat, [e, c, b, a]); add_poly(mat, [a, b, c, e])
    if tiles:
        _ribs(rib_mat, e, c, a - e, 0.0, 0.62, lambda u: depth * 0.98)


def cone_roof(F, cx, cy, z0, r, h, mat='tile', seg=28, tiles=True, rib_mat='tile2', finial='bronze'):
    F = _F(F); ring = [F.p(cx + r * math.cos(TAU * i / seg), cy + r * math.sin(TAU * i / seg), z0) for i in range(seg)]
    ap = F.p(cx, cy, z0 + h)
    for i in range(seg):
        add_poly(mat, [ring[i], ring[(i + 1) % seg], ap])
    add_poly(mat, list(reversed(ring)))
    if tiles:
        for i in range(seg * 2):
            a = TAU * (i + 0.5) / (seg * 2); p = F.p(cx + r * 0.99 * math.cos(a), cy + r * 0.99 * math.sin(a), z0 + 0.06)
            q = p + (ap - p) * 0.9
            beam(None, p.x, p.y, p.z, q.x, q.y, q.z + 0.06, 0.16, 0.1, rib_mat)
    if finial:
        sphere(F, cx, cy, z0 + h + 0.3, 0.35, finial, 8, 6)


def ring_roof(F, cx, cy, z0, r_in, r_out, rise, mat='tile', seg=40, tiles=True, rib_mat='tile2'):
    """Annular lean-to roof between two circles: high at r_in, low (z0) at r_out."""
    F = _F(F)
    for i in range(seg):
        a, b = TAU * i / seg, TAU * (i + 1) / seg
        pi = [F.p(cx + r_in * math.cos(t), cy + r_in * math.sin(t), z0 + rise) for t in (a, b)]
        po = [F.p(cx + r_out * math.cos(t), cy + r_out * math.sin(t), z0) for t in (a, b)]
        add_poly(mat, [po[0], po[1], pi[1], pi[0]]); add_poly(mat, [pi[0], pi[1], po[1], po[0]])
        if tiles:
            for k in range(3):
                t = a + (b - a) * (k + 0.5) / 3
                p = F.p(cx + r_out * math.cos(t), cy + r_out * math.sin(t), z0 + 0.05)
                q = F.p(cx + r_in * math.cos(t), cy + r_in * math.sin(t), z0 + rise + 0.05)
                beam(None, p.x, p.y, p.z, q.x, q.y, q.z, 0.15, 0.09, rib_mat)


def dome(F, cx, cy, z0, r, mat='plaster', seg=24, rings=8, oculus=0.0):
    F = _F(F); V = []; Fa = []
    for i in range(rings + 1):
        th = (math.pi / 2) * i / rings
        rr = r * math.cos(th); zz = z0 + r * math.sin(th)
        if oculus and rr < oculus:
            rr = oculus
        for j in range(seg):
            V.append(F.p(cx + rr * math.cos(TAU * j / seg), cy + rr * math.sin(TAU * j / seg), zz))
    for i in range(rings):
        for j in range(seg):
            a = i * seg + j; b = i * seg + (j + 1) % seg; c = (i + 1) * seg + (j + 1) % seg; d = (i + 1) * seg + j
            Fa.append((a, b, c, d))
    add_mesh(mat, V, Fa, smooth=True)


# ---------------------------------------------------------------- site parts
def stairs(F, x, y, z0, width, n, rise=0.17, run=0.40, rot=0.0, mat='marble', cheeks=True, cheek_mat='stone',
           cheek_h=0.9):
    """A straight flight climbing in local +x (after rot) from its bottom-front centre (x, y, z0).
    Each step is a solid block down to z0 (no floating). Returns (top x offset, top z)."""
    S = _F(F).sub(x, y, z0, rot)
    for i in range(n):
        box(S, i * run + run / 2, 0, 0, run, width, (i + 1) * rise, mat)
    if cheeks:
        Lr = n * run
        for sd in (-1, 1):
            yy = sd * (width / 2 + 0.3)
            prism(S, [(0, yy - 0.3), (Lr, yy - 0.3), (Lr, yy + 0.3), (0, yy + 0.3)], 0, 0.01, cheek_mat)
            # sloping cheek wall
            v = [S.p(0, yy - 0.3, 0), S.p(Lr, yy - 0.3, 0), S.p(Lr, yy - 0.3, n * rise + cheek_h), S.p(0, yy - 0.3, cheek_h),
                 S.p(0, yy + 0.3, 0), S.p(Lr, yy + 0.3, 0), S.p(Lr, yy + 0.3, n * rise + cheek_h), S.p(0, yy + 0.3, cheek_h)]
            add_mesh(cheek_mat, v, [(0, 1, 2, 3), (5, 4, 7, 6), (3, 2, 6, 7), (4, 0, 3, 7), (1, 5, 6, 2)])
    return n * run, z0 + n * rise


def balustrade(F, x0, y0, x1, y1, z0, h=1.0, mat='marble', post_every=1.8, t=0.28):
    """Low railing: posts, top rail, bottom plinth and thin balusters."""
    L = math.hypot(x1 - x0, y1 - y0)
    if L < 1e-6:
        return
    rot = math.atan2(y1 - y0, x1 - x0) / D2R; W = _F(F).sub(x0, y0, z0, rot)
    box(W, L / 2, 0, 0, L, t + 0.06, 0.18, mat); box(W, L / 2, 0, h - 0.14, L + 0.1, t + 0.1, 0.14, mat)
    n = max(1, int(L / post_every))
    for i in range(n + 1):
        box(W, L * i / n, 0, 0, 0.34, t + 0.06, h, mat)
    nb = int(L / 0.32)
    for i in range(nb):
        u = (i + 0.5) * L / nb; cyl(W, u, 0, 0.18, 0.07, h - 0.32, mat, 6, r_top=0.05, caps=False)


def crenels(F, x0, y0, x1, y1, z0, h=0.9, t=0.6, w=0.9, gap=0.7, mat='stone'):
    """Merlons along a wall top."""
    L = math.hypot(x1 - x0, y1 - y0)
    if L < 1e-6:
        return
    rot = math.atan2(y1 - y0, x1 - x0) / D2R; W = _F(F).sub(x0, y0, z0, rot)
    n = max(1, int((L + gap) / (w + gap)))
    st = (L - (n * w + (n - 1) * gap)) / 2
    for i in range(n):
        box(W, st + i * (w + gap) + w / 2, 0, 0, w, t, h, mat)


def statue(F, x, y, z0, h=2.0, mat='marble', pedestal=1.1, rot=0.0, ped_mat='stone', arm=True):
    """A stylised standing figure in a robe on a pedestal (reads as a statue at distance)."""
    S = _F(F).sub(x, y, z0, rot)
    if pedestal > 0:
        box(S, 0, 0, 0, h * 0.42, h * 0.42, pedestal * 0.12, ped_mat)
        box(S, 0, 0, pedestal * 0.12, h * 0.34, h * 0.34, pedestal * 0.76, ped_mat)
        box(S, 0, 0, pedestal * 0.88, h * 0.42, h * 0.42, pedestal * 0.12, ped_mat)
    zb = pedestal
    cyl(S, 0, 0, zb, h * 0.17, h * 0.55, mat, 10, r_top=h * 0.11)            # robe
    cyl(S, 0, 0, zb + h * 0.55, h * 0.11, h * 0.25, mat, 10, r_top=h * 0.13)  # torso
    sphere(S, 0, 0, zb + h * 0.88, h * 0.075, mat, 10, 6)                     # head
    if arm:
        beam(S, 0, h * 0.1, zb + h * 0.74, h * 0.12, h * 0.2, zb + h * 0.98, h * 0.06, h * 0.06, mat)


def pool(F, cx, cy, z0, w, d, mat='water', rim='marble', rim_w=0.45, depth=0.6, rot=0.0):
    S = _F(F).sub(cx, cy, z0, rot)
    box(S, 0, 0, -depth, w, d, depth - 0.12, mat)
    for sx, sy, a, b in ((0, -d / 2, w + rim_w * 2, rim_w), (0, d / 2, w + rim_w * 2, rim_w),
                         (-w / 2, 0, rim_w, d), (w / 2, 0, rim_w, d)):
        box(S, sx, sy, 0, a, b, 0.35, rim)


def round_pool(F, cx, cy, z0, r, mat='water', rim='marble', rim_w=0.5, seg=28):
    lathe(F, cx, cy, [(r + rim_w, z0), (r + rim_w, z0 + 0.4), (r, z0 + 0.4), (r, z0 - 0.1)], rim, seg, smooth=False)
    cyl(F, cx, cy, z0 - 0.5, r, 0.42, mat, seg, smooth=False)


def hedge(F, x0, y0, x1, y1, z0, h=0.8, t=0.7, mat='hedge'):
    wall(F, x0, y0, x1, y1, z0, h, t, mat)


def flower_bed(F, cx, cy, z0, w, d, flowers=('flowerR', 'flowerY', 'flowerW'), rot=0.0):
    """A clipped box-hedge border around rows of flowers."""
    S = _F(F).sub(cx, cy, z0, rot)
    for x0, y0, x1, y1 in ((-w / 2, -d / 2, w / 2, -d / 2), (w / 2, -d / 2, w / 2, d / 2), (w / 2, d / 2, -w / 2, d / 2),
                           (-w / 2, d / 2, -w / 2, -d / 2)):
        hedge(S, x0, y0, x1, y1, 0, 0.55, 0.45)
    box(S, 0, 0, 0, w - 0.4, d - 0.4, 0.12, 'grass')
    rows = max(1, int((d - 1.2) / 0.9))
    for i in range(rows):
        yy = -d / 2 + 0.9 + i * (d - 1.8) / max(1, rows - 1) if rows > 1 else 0
        box(S, 0, yy, 0.12, w - 1.4, 0.45, 0.22, flowers[i % len(flowers)])


def pediment_front(F, cx, cy, z0, w, n, col_h, depth=None, order='corinthian', mat='marble', tymp_mat='plaster',
                   steps=3, rot=0.0, roof_mat='tile'):
    """A temple-front porch facing local -y: n columns across w, entablature and pediment with a tiled roof.
    Origin (cx, cy) = centre of the front column line. Returns the ridge z."""
    S = _F(F).sub(cx, cy, z0, rot); dp = depth if depth else w * 0.35
    r = col_h / 18.0
    for i in range(steps):
        box(S, 0, -0.45 * (steps - i) + dp / 2 - dp / 2, 0, w + 1.2, dp + 0.9 * (steps - i), 0.18 * (i + 1), mat)
    zc = 0.18 * steps
    colonnade(S, -w / 2 + r * 1.3, 0, w / 2 - r * 1.3, 0, zc, n, col_h, r, mat, order)
    for sd in (-1, 1):
        colonnade(S, sd * (w / 2 - r * 1.3), dp * 0.9, sd * (w / 2 - r * 1.3), dp * 0.9, zc, 1, col_h, r, mat, order, ent=False)
    eh = col_h * 0.22
    for yy in (0, dp * 0.9):
        entablature(S, -w / 2, yy, w / 2, yy, zc + col_h, eh, r * 2.8, mat)
    for sd in (-1, 1):
        entablature(S, sd * w / 2, 0, sd * w / 2, dp * 0.9, zc + col_h, eh, r * 2.8, mat)
    return gable_roof(S, 0, dp * 0.45, zc + col_h + eh, dp + 0.6, w + 0.6, 15, axis='x', overhang=0.4, mat=roof_mat,
                      gable_mat=mat, pediment=True, tymp_mat=tymp_mat, rot=90)


def gate_block(F, cx, cy, z0, w, d, h, open_w, open_h, mat='stone', rot=0.0, attic_h=2.6, side_arches=True):
    """A solid gate block (passage along local y) with a through arch, optional small side arches and an attic."""
    S = _F(F).sub(cx, cy, z0, rot)
    # front and back faces with the arch, solid sides, vaulted passage
    for yy, sgn in ((-d / 2, 1), (d / 2, -1)):
        pts = [(-w / 2, 0), (-open_w / 2, 0), (-open_w / 2, open_h - open_w / 2)] + \
              _arch_pts(-open_w / 2, open_w / 2, open_h - open_w / 2, 12)[1:-1] + \
              [(open_w / 2, open_h - open_w / 2), (open_w / 2, 0), (w / 2, 0), (w / 2, h), (-w / 2, h)]
        poly = [S.p(u, yy, z) for u, z in pts]
        add_poly(mat, poly if sgn > 0 else poly[::-1])
    rim = [(-open_w / 2, 0), (-open_w / 2, open_h - open_w / 2)] + _arch_pts(-open_w / 2, open_w / 2, open_h - open_w / 2, 12)[1:-1] + \
          [(open_w / 2, open_h - open_w / 2), (open_w / 2, 0)]
    for i in range(len(rim) - 1):
        (ua, za), (ub, zb) = rim[i], rim[i + 1]
        add_poly('stone' if mat != 'stone' else 'tuff', [S.p(ua, -d / 2, za), S.p(ub, -d / 2, zb), S.p(ub, d / 2, zb), S.p(ua, d / 2, za)][::-1])
    for sx in (-1, 1):
        x = sx * w / 2; q = [S.p(x, -d / 2, 0), S.p(x, d / 2, 0), S.p(x, d / 2, h), S.p(x, -d / 2, h)]
        add_poly(mat, q if sx > 0 else q[::-1])
    add_poly(mat, [S.p(-w / 2, -d / 2, h), S.p(w / 2, -d / 2, h), S.p(w / 2, d / 2, h), S.p(-w / 2, d / 2, h)])
    box(S, 0, 0, h, w + 0.6, d + 0.6, 0.5, 'marble')
    if attic_h:
        box(S, 0, 0, h + 0.5, w * 0.96, d * 0.9, attic_h, mat)
        box(S, 0, -d * 0.45 - 0.05, h + 0.5 + attic_h * 0.2, w * 0.45, 0.1, attic_h * 0.6, 'marble')   # inscription panel
        box(S, 0, 0, h + 0.5 + attic_h, w + 0.4, d + 0.4, 0.35, 'marble')
    box(S, 0, -d / 2 - 0.05, open_h - 0.4, 0.7, 0.2, 0.8, 'marble')   # keystone
    for yy in (-d / 2 - 0.06, d / 2 + 0.06):
        for sx in (-1, 1):
            box(S, sx * (open_w / 2 + 0.25), yy, open_h - open_w / 2 - 0.3, 0.6, 0.12, 0.3, 'marble')


# ---------------------------------------------------------------- whole buildings
def rect_building(F, cx, cy, w, d, floors=2, floor_h=4.2, ground_h=None, wall_mat='plaster', base_mat='stone',
                  bay=3.4, win_w=1.15, win_h=1.9, arch_windows=False, ground_arches=False, doors=(), roof='hip',
                  pitch=22.0, band_mat='red', cornice_mat='stone', quoins=True, foundation=6.0, rot=0.0, skip_sides=(),
                  roof_overhang=0.6, felt=False):
    """A rectangular building block with real window recesses on all four sides, red floor bands, a cornice
    and a roof ('hip', 'pyramid', 'gable_x', 'gable_y', 'flat' or None).
    doors: list of (side, u) with side in 'S','E','N','W' (S faces -y) and u the offset along that side from its
    centre. skip_sides: sides that touch another block (no windows). felt=True: windows are black felt panels.
    Returns the eave height."""
    S = _F(F).sub(cx, cy, 0, rot)
    gh = ground_h if ground_h else floor_h * 1.1
    H = gh + floor_h * (floors - 1)
    if foundation:
        box(S, 0, 0, -foundation, w + 0.8, d + 0.8, foundation + 0.6, base_mat)
    box(S, 0, 0, 0, w - 0.7, d - 0.7, H, wall_mat)          # core (its faces sit 0.35 inside the skin plane)
    hw, hd = w / 2 - 0.35, d / 2 - 0.35
    sides = {'S': ((-hw, -hd), (hw, -hd)), 'E': ((hw, -hd), (hw, hd)), 'N': ((hw, hd), (-hw, hd)),
             'W': ((-hw, hd), (-hw, -hd))}
    inner = 'felt' if felt else 'dark'
    for key, (p0, p1) in sides.items():
        L = math.hypot(p1[0] - p0[0], p1[1] - p0[1])
        if key in skip_sides:
            add_poly(wall_mat, [S.p(p0[0], p0[1], 0), S.p(p1[0], p1[1], 0), S.p(p1[0], p1[1], H), S.p(p0[0], p0[1], H)])
            continue
        nb = max(1, int(L / bay)); ops = []
        door_us = [L / 2 + u for (sd, u) in doors if sd == key]
        for fl in range(floors):
            z0 = 0 if fl == 0 else gh + (fl - 1) * floor_h; fh = gh if fl == 0 else floor_h
            for b in range(nb):
                u = (b + 0.5) * L / nb
                if fl == 0 and any(abs(u - du) < L / nb * 0.6 for du in door_us):
                    continue
                if fl == 0 and ground_arches:
                    ops.append((u, z0, min(L / nb * 0.6, 2.6), fh * 0.82, 'arch'))
                else:
                    ww = win_w; hh = min(win_h, fh * 0.6)
                    ops.append((u, z0 + fh * 0.3, ww, hh, 'arch' if arch_windows else 'rect'))
        for du in door_us:
            ops.append((du, 0.0, 2.4, min(gh * 0.82, 4.2), 'arch'))
        # one skin per side, full height
        opening_skin(S, p0[0], p0[1], p1[0], p1[1], 0, H, [o for o in ops], wall_mat, depth=0.35, inner=inner,
                     frame_mat=None)
        if band_mat:
            for fl in range(1, floors):
                band(S, p0[0], p0[1], p1[0], p1[1], gh + (fl - 1) * floor_h - 0.2, 0.3, 0.42, band_mat)
            band(S, p0[0], p0[1], p1[0], p1[1], 0, 0.9, 0.44, base_mat)     # plinth
        if cornice_mat:
            cornice(S, p0[0], p0[1], p1[0], p1[1], H - 0.5, 0.6, 0.62, cornice_mat)
    if quoins:
        for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
            box(S, sx * (w / 2 - 0.25), sy * (d / 2 - 0.25), 0, 0.9, 0.9, H - 0.4, 'stone')
    if roof == 'hip':
        hip_roof(S, 0, 0, H, w, d, pitch, roof_overhang)
    elif roof == 'pyramid':
        hip_roof(S, 0, 0, H, w, d, pitch, roof_overhang)
    elif roof == 'gable_x':
        gable_roof(S, 0, 0, H, w, d, pitch, 'x', roof_overhang)
    elif roof == 'gable_y':
        gable_roof(S, 0, 0, H, w, d, pitch, 'y', roof_overhang)
    elif roof == 'flat':
        box(S, 0, 0, H, w - 0.2, d - 0.2, 0.25, 'paving')
        for (p0, p1) in sides.values():
            wall(S, p0[0] * 1.0, p0[1], p1[0], p1[1], H, 1.0, 0.5, wall_mat)
    return H


def square_tower(F, cx, cy, w, h, wall_mat='stone', roof='pyramid', pitch=30.0, slit_rows=None, battered=True,
                 foundation=10.0, rot=0.0, top_loggia=False, cornice_mat='marble', band_mat='red'):
    """A square tower: battered plinth, window slits on every storey, cornice, optional open loggia on top, roof
    ('pyramid', 'crenel' or None). Returns the eave height (top of walls)."""
    S = _F(F).sub(cx, cy, 0, rot)
    if foundation:
        box(S, 0, 0, -foundation, w + 1.2, w + 1.2, foundation, 'tuff')
    if battered:
        prism(S, [(-w / 2 - 0.35, -w / 2 - 0.35), (w / 2 + 0.35, -w / 2 - 0.35), (w / 2 + 0.35, w / 2 + 0.35), (-w / 2 - 0.35, w / 2 + 0.35)], 0, 0.4, 'tuff')
        v = []
        for zz, e in ((0.4, 0.35), (2.2, 0.0)):
            v += [S.p(-w / 2 - e, -w / 2 - e, zz), S.p(w / 2 + e, -w / 2 - e, zz), S.p(w / 2 + e, w / 2 + e, zz), S.p(-w / 2 - e, w / 2 + e, zz)]
        add_mesh('tuff', v, [(0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])
    lh = 5.0 if top_loggia else 0.0
    Hw = h - lh
    hw = w / 2
    box(S, 0, 0, 0, w - 0.6, w - 0.6, Hw, wall_mat)
    sides = [((-hw + 0.3, -hw + 0.3), (hw - 0.3, -hw + 0.3)), ((hw - 0.3, -hw + 0.3), (hw - 0.3, hw - 0.3)),
             ((hw - 0.3, hw - 0.3), (-hw + 0.3, hw - 0.3)), ((-hw + 0.3, hw - 0.3), (-hw + 0.3, -hw + 0.3))]
    nst = slit_rows if slit_rows else max(2, int(Hw / 5.0))
    for (p0, p1) in sides:
        L = math.hypot(p1[0] - p0[0], p1[1] - p0[1]); ops = []
        for k in range(1, nst):
            z = k * Hw / nst
            if w > 9:
                ops += [(L * 0.3, z, 0.7, 1.5, 'arch'), (L * 0.7, z, 0.7, 1.5, 'arch')]
            else:
                ops.append((L / 2, z, 0.7, 1.5, 'arch'))
        opening_skin(S, p0[0], p0[1], p1[0], p1[1], 4.0, Hw - 4.0, [(u, z - 4.0, ww, hh, kd) for (u, z, ww, hh, kd) in ops if z > 4.5],
                     wall_mat, depth=0.3)
        if band_mat:
            band(S, p0[0], p0[1], p1[0], p1[1], Hw - 2.2, 0.3, 0.36, band_mat)
        cornice(S, p0[0], p0[1], p1[0], p1[1], Hw - 0.45, 0.6, 0.55, cornice_mat)
    z_top = Hw
    if top_loggia:
        box(S, 0, 0, Hw, w + 0.4, w + 0.4, 0.4, 'marble')
        for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
            box(S, sx * (hw - 0.6), sy * (hw - 0.6), Hw + 0.4, 1.2, 1.2, lh - 0.8, wall_mat)
        for (p0, p1) in sides:
            colonnade(S, p0[0] + (p1[0] - p0[0]) * 0.25, p0[1] + (p1[1] - p0[1]) * 0.25, p0[0] + (p1[0] - p0[0]) * 0.75,
                      p0[1] + (p1[1] - p0[1]) * 0.75, Hw + 0.4, 3, lh - 0.8, 0.22, 'marble', 'tuscan', ent=False)
            balustrade(S, p0[0], p0[1], p1[0], p1[1], Hw + 0.4, 0.9, 'marble', 2.0, 0.2)
        box(S, 0, 0, h - 0.4, w + 0.3, w + 0.3, 0.4, 'marble')
        z_top = h
    if roof == 'pyramid':
        hip_roof(S, 0, 0, z_top, w, w, pitch, 0.7)
    elif roof == 'crenel':
        box(S, 0, 0, z_top, w, w, 0.3, 'paving')
        for (p0, p1) in sides:
            crenels(S, p0[0], p0[1], p1[0], p1[1], z_top, 1.0, 0.6, 0.9, 0.7, wall_mat)
    return z_top


def court_building(F, cx, cy, w, d, cw, cd, floors=2, floor_h=4.2, wall_mat='plaster', base_mat='stone',
                   peristyle=True, col_order='ionic', court_mat='gravel', pool_size=None, roof_pitch=22.0, bay=3.4,
                   doors=(('S', 0.0),), foundation=6.0, rot=0.0, arch_windows=False):
    """Four ranges round a central court cw x cd: outside windows, an inner peristyle (columns + lean-to roof),
    a garden court (gravel, hedges) and an optional central pool (w, d). Returns the eave height."""
    S = _F(F).sub(cx, cy, 0, rot)
    gh = floor_h * 1.1; H = gh + floor_h * (floors - 1)
    rw, rd = (w - cw) / 2, (d - cd) / 2     # range depths
    if foundation:
        box(S, 0, 0, -foundation, w + 0.8, d + 0.8, foundation + 0.6, base_mat)
    # four ranges as separate blocks (S and N full width, E and W between them)
    rect_building(S, 0, -d / 2 + rd / 2, w, rd, floors, floor_h, None, wall_mat, base_mat, bay, roof=None, foundation=0,
                  doors=[(sd, u) for (sd, u) in doors if sd == 'S'], skip_sides=(), arch_windows=arch_windows)
    rect_building(S, 0, d / 2 - rd / 2, w, rd, floors, floor_h, None, wall_mat, base_mat, bay, roof=None, foundation=0,
                  doors=[(sd, u) for (sd, u) in doors if sd == 'N'], arch_windows=arch_windows)
    rect_building(S, -w / 2 + rw / 2, 0, rw, cd + 0.02, floors, floor_h, None, wall_mat, base_mat, bay, roof=None,
                  foundation=0, skip_sides=('S', 'N'), doors=[(sd, u) for (sd, u) in doors if sd == 'W'], quoins=False,
                  arch_windows=arch_windows)
    rect_building(S, w / 2 - rw / 2, 0, rw, cd + 0.02, floors, floor_h, None, wall_mat, base_mat, bay, roof=None,
                  foundation=0, skip_sides=('S', 'N'), doors=[(sd, u) for (sd, u) in doors if sd == 'E'], quoins=False,
                  arch_windows=arch_windows)
    # roofs: one hip roof per range, ridges meeting at the corners (simple: four hip roofs)
    hip_roof(S, 0, -d / 2 + rd / 2, H, w, rd, roof_pitch, 0.6)
    hip_roof(S, 0, d / 2 - rd / 2, H, w, rd, roof_pitch, 0.6)
    gable_roof(S, -w / 2 + rw / 2, 0, H, rw, cd + rd, roof_pitch, 'y', 0.6, gable_mat=wall_mat)
    gable_roof(S, w / 2 - rw / 2, 0, H, rw, cd + rd, roof_pitch, 'y', 0.6, gable_mat=wall_mat)
    # court
    box(S, 0, 0, 0, cw, cd, 0.15, 'paving')
    if peristyle:
        m = 3.2; ch = min(gh * 0.85, 5.2)
        x0, x1, y0, y1 = -cw / 2 + m, cw / 2 - m, -cd / 2 + m, cd / 2 - m
        nx = max(2, int((x1 - x0) / 3.0) + 1); ny = max(2, int((y1 - y0) / 3.0) + 1)
        for (a, b, nn) in (((x0, y0), (x1, y0), nx), ((x1, y0), (x1, y1), ny), ((x1, y1), (x0, y1), nx), ((x0, y1), (x0, y0), ny)):
            colonnade(S, a[0], a[1], b[0], b[1], 0.15, nn, ch, ch / 16, 'marble', col_order)
        for (a, b) in (((-cw / 2, -cd / 2), (cw / 2, -cd / 2)), ((cw / 2, -cd / 2), (cw / 2, cd / 2)),
                       ((cw / 2, cd / 2), (-cw / 2, cd / 2)), ((-cw / 2, cd / 2), (-cw / 2, -cd / 2))):
            # lean-to from the inner wall (a->b runs clockwise as seen from the court -> outside of the wall line is the court)
            lean_roof(S, b[0], b[1], a[0], a[1], 0.15 + ch * 1.2 + 1.3, m, 1.1)
        box(S, 0, 0, 0.15, x1 - x0 - 1.0, y1 - y0 - 1.0, 0.12, court_mat)
        for sx in (-1, 1):
            hedge(S, sx * (x1 - x0) * 0.3, y0 + 1.5, sx * (x1 - x0) * 0.3, y1 - 1.5, 0.27, 0.6, 0.5)
    if pool_size:
        pool(S, 0, 0, 0.3, pool_size[0], pool_size[1])
        statue(S, 0, 0, 0.3, 1.6, 'bronze', 0.8)
    return H


def human(F, x, y, z0=0.0):
    """Preview-only 1.8 m figure for scale (not exported)."""
    _EXTRA.append(('human', _F(F).p(x, y, z0)))


# ---------------------------------------------------------------- finish: join, render, export
def _make_mat(name):
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    col, met, rough = PAL[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*_lin(col), 1.0)
    b.inputs['Metallic'].default_value = met; b.inputs['Roughness'].default_value = rough
    m.diffuse_color = (*_lin(col), 1.0)
    return m


def _build_object(name):
    objs = []
    for mat, (V, Fa, Sm) in _G.items():
        if not Fa:
            continue
        me = bpy.data.meshes.new(name + '_' + mat); me.from_pydata(V, [], Fa); me.validate(clean_customdata=False)
        me.update()
        for poly, s in zip(me.polygons, Sm):
            poly.use_smooth = s
        me.materials.append(_make_mat(mat))
        ob = bpy.data.objects.new(name + '_' + mat, me); bpy.context.scene.collection.objects.link(ob); objs.append(ob)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    if len(objs) > 1:
        bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active; ob.name = name; ob.data.name = name
    # merge coincident vertices (keeps hard edges because faces keep their flat/smooth flag)
    import bmesh
    bm = bmesh.new(); bm.from_mesh(ob.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)
    bm.to_mesh(ob.data); bm.free()
    ob.data.update()
    return ob


def _look(cam, target):
    d = Vector(target) - cam.location; cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def _preview_scene(ob, front):
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_EEVEE'
    sc.render.resolution_x, sc.render.resolution_y = 1280, 720
    try:
        sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Base Contrast'
    except Exception:
        pass
    w = bpy.data.worlds.new('sky'); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes.get('Background'); bg.inputs[0].default_value = (0.55, 0.68, 0.85, 1); bg.inputs[1].default_value = 0.9
    fdir = {'+X': Vector((1, 0, 0)), '-X': Vector((-1, 0, 0)), '+Y': Vector((0, 1, 0)), '-Y': Vector((0, -1, 0))}[front]
    sdir = Vector((-fdir.y, fdir.x, 0))
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun)
    sun.data.energy = 4.0; sun.data.angle = 0.03
    ldir = -(fdir * 0.55 + sdir * 0.6 + Vector((0, 0, 0.9))).normalized()
    sun.rotation_euler = ldir.to_track_quat('-Z', 'Y').to_euler()
    bb = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    mn = Vector((min(v.x for v in bb), min(v.y for v in bb), max(PREVIEW_GROUND - 0.45, min(v.z for v in bb))))
    mx = Vector((max(v.x for v in bb), max(v.y for v in bb), max(v.z for v in bb)))
    ctr = (mn + mx) / 2; R = max((mx - mn).length / 2, 1.0)
    bpy.ops.mesh.primitive_plane_add(size=max(mx.x - mn.x, mx.y - mn.y) * 4 + 60, location=(ctr.x, ctr.y, PREVIEW_GROUND))
    gp = bpy.context.active_object; gp.name = 'preview_ground'
    gm = bpy.data.materials.new('preview_ground'); gm.use_nodes = True
    gm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*_lin((0.55, 0.53, 0.45)), 1)
    gp.data.materials.append(gm)
    hm = bpy.data.materials.new('preview_human'); hm.use_nodes = True
    hm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.8, 0.05, 0.03, 1)
    hum = [(n, p) for (n, p) in _EXTRA if n == 'human'] or [('human', Vector((mx.x + 2.0, ctr.y, 0)))]
    for _, p in hum:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.25, depth=1.8, location=(p.x, p.y, p.z + 0.9))
        bpy.context.active_object.data.materials.append(hm); bpy.context.active_object.name = 'preview_human'
    return ctr, R, mn, mx, fdir, sdir


def render_previews(ob, name, front='+X', extra=()):
    """Four fixed cameras (front, side, three-quarter from above, top) auto-framed on the asset.
    extra: more shots as (name, direction Vector, elevation degrees)."""
    out = os.path.join(ROOT, 'renders', name); os.makedirs(out, exist_ok=True)
    ctr, R, mn, mx, fdir, sdir = _preview_scene(ob, front)
    sc = bpy.context.scene
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.lens = 35; cam.data.clip_end = 20000
    th = math.tan(math.atan(0.5 * 36 / 35) * 0.9); tv = math.tan(math.atan(0.5 * 36 * 9 / 16 / 35) * 0.9)
    corners = [Vector((x, y, z)) for x in (mn.x, mx.x) for y in (mn.y, mx.y) for z in (mn.z, mx.z)]
    shots = [('front', fdir, 6), ('side', sdir, 6), ('three', (fdir + sdir).normalized(), 32)] + list(extra)
    files = []
    for nm, dvec, el in shots:
        e = math.radians(el); dv = Vector((dvec.x * math.cos(e), dvec.y * math.cos(e), math.sin(e))).normalized()
        rt = dv.cross(Vector((0, 0, 1))).normalized(); up = rt.cross(dv).normalized()
        dist = max(max((c - ctr).dot(dv) + abs((c - ctr).dot(rt)) / th, (c - ctr).dot(dv) + abs((c - ctr).dot(up)) / tv)
                   for c in corners)
        cam.data.type = "PERSP"; cam.location = ctr + dv * dist; _look(cam, ctr)
        sc.render.filepath = os.path.join(out, nm + '.png'); bpy.ops.render.render(write_still=True); files.append(sc.render.filepath)
    cam.data.type = 'ORTHO'; cam.data.ortho_scale = max(mx.x - mn.x, (mx.y - mn.y) * 16 / 9) * 1.12
    cam.location = Vector((ctr.x, ctr.y, mx.z + 50)); cam.rotation_euler = (0, 0, 0)
    sc.render.filepath = os.path.join(out, 'top.png'); bpy.ops.render.render(write_still=True); files.append(sc.render.filepath)
    return files


def finish(name, front='+X', extra_cams=(), export=True):
    """Join everything, report triangles, render previews to renders/<name>/ and export assets/models/<GLB_SUB>/<name>.glb."""
    t0 = time.time()
    ob = _build_object(name)
    tris = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    bb = [Vector(c) for c in ob.bound_box]
    size = [round(max(v[i] for v in bb) - min(v[i] for v in bb), 2) for i in range(3)]
    zmin = round(min(v.z for v in bb), 2); zmax = round(max(v.z for v in bb), 2)
    glb = os.path.join(ROOT, 'assets', 'models', GLB_SUB, name + '.glb')
    if export:
        os.makedirs(os.path.dirname(glb), exist_ok=True)
        bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active = ob
        bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB', use_selection=True, export_yup=True,
                                  export_apply=True, export_normals=True, export_texcoords=False, export_materials='EXPORT',
                                  export_cameras=False, export_lights=False)
    files = render_previews(ob, name, front, extra_cams)
    info = {'asset': name, 'triangles': tris, 'size_xyz_m': size, 'z_min': zmin, 'z_max': zmax,
            'materials': sorted(_G.keys()), 'glb': glb if export else None,
            'glb_kb': round(os.path.getsize(glb) / 1024) if export else None, 'renders': files,
            'seconds': round(time.time() - t0, 1)}
    print('ASSET_REPORT ' + json.dumps(info, ensure_ascii=False))
    return info
