"""tib_plan · a palace built from a plan file (briefs/rome/tiberiana-v2.md, step 3).

The plan (tools/models/rome/tiberiana_plan.json, written and checked by tools/plan/tiberiana_plan.py) gives the rooms of each
floor and the roof blocks (the massing). This module has no palace numbers of its own: change the JSON and rebuild.
Model axes as in the plan: x east, y north, z up; z = 0 is the platform top.

  load(opts, extra)  read the plan; opts = {block id: {...}} for the few things a block has that the plan only notes in words,
                     extra = blocks that stand over a block of the plan (a raised middle part, a gate pavilion)
  part(name)         everything built after this call goes into that part (tib_base, tib_garden, tib_f1/2/3, tib_roof; the
                     tib_f1w/tib_f2w/tib_f3w parts are for the web file only)
  block_walls(b)     the outer faces of a roof block, from the neighbour's roof up, cut at the floor levels; with detail:
                     windows by the room behind, doors, plinth, dado band, string courses, cornice, flashing over lower roofs
  roof(b)            its roof by b['roof']: gable, hip, pyramid, lean, compluviate, flat, vault
  courts()           the open courts as flat floors
  porticoes()        the open sides of the portico rooms and loggias: columns, architrave, parapet of an upper storey
  shells()           the back and end walls and the upper floors of those porticoes (web file only)
  recesses()         the room behind an open bay that is not a portico (a loggia cut into a block)
  merged()           all parts in one buffer, for the web file

Options (opts[block id]): hip_ends 'E'; over 'M01m'; open [(storey, side, a, b)] an open bay between plan coordinates a..b along
that side; gaps [(side, a, b)] in a flat roof's parapet; deck 'paving'; cross_walls [coordinates along the ridge];
pediment 'NS'; gold True; wall_top z; roof 'own'; vault_mat; parapet False; col_mat, col_mat2 (upper order); on_floor, arch2, rail (upper order on the floor, its beam, the parapet's material); order1 (ground-floor order); low (a lean-to's low edge); windows {(storey, side) or storey: (w, h, z, kind[, bay]) or None}; doors [(side, at, w, h, z, kind)].

How blocks meet: surf(b, x, y) is the height of a block's roof at a plan point. A wall face is drawn from the lowest roof
height of whatever stands on the other side (0 for a court or the outside) up to the block's own wall top. Roofs are single
surfaces that may run into one another: a gable that ends against a neighbour's slope is carried on into it until the ridge
meets that slope (a valley), a gable that ends over a lower roof gets its gable wall, lean-to roofs of equal height that
meet at a corner are mitred.
"""
import os, sys, json, math, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                       # noqa: F401,F403
import bl_kit as _bk
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))

# ---- the brief's rules (not palace numbers)
OVER = 0.6            # eaves overhang
VERGE = 0.3           # roof edge beyond a gable wall
RIB = 1.0             # tile ribs (imbrex rows) every RIB metres along the eaves: the brief allows up to 1.1
RIB_W, RIB_H = 0.24, 0.11
PLINTH = 0.9          # travertine plinth
PARAPET_H, PARAPET_T = 1.0, 0.45
COL1, ARCH = 4.4, 0.4  # ground-floor order of the porticoes: column and architrave (the opening is COL1 + ARCH high)
ARCH_UP = 0.3         # the beam of an upper order whose columns stand on the floor
DROP, UPSTAND = 1.4, 0.3   # compluviate roof: the opening lies DROP below the outer edge, with an upstand round it
VAULT_RISE = 0.3      # barrel vault: rise / span
VAULT_PARAPET = 0.35  # the end walls stand this much above the vault
SKIN = 0.36           # the wall faces with openings are a skin this far in front of the wall core (window reveals)
BAY = 3.0             # one window, one column per bay
WIN1 = (0.7, 1.4, 3.8, 'rect')    # ground floor: small high windows (w, h, sill above the floor)
WIN2 = (1.1, 1.9, 1.0, 'rect')    # upper floors, with a lattice
NOWIN1 = ('stair', 'service', 'guard')   # ground-floor rooms without windows
DADO = (2.05, 0.3)    # the red dado band: bottom and height (its middle is 2.2 m up)
FLASH = 0.25          # flashing course on a wall above the tiles of a lower roof
BACK_MAT = 'plaster'  # the back walls of the open porticoes (web file)
SIGNINUM = 'plaster3'  # flat roofs: opus signinum, a mortar of crushed terracotta (the kit's reddish buff)
SIDES = 'SENW'
OPP = {'S': 'N', 'N': 'S', 'E': 'W', 'W': 'E'}
OUT = {'S': (0.0, -1.0), 'E': (1.0, 0.0), 'N': (0.0, 1.0), 'W': (-1.0, 0.0)}

PLAN = {}; BL = []; ROOMS = []; COURTS = []; FEAT = {}; OPT = {}; BLOCK = {}; ROOM = {}; DOORS = {}; NO_WINDOW = set()
PRE = 'tib'           # prefix of the part names (load(prefix=...))
LEAN_FALL = 0.24      # a lean-to roof whose note gives no low edge falls this much per metre (as the plan's drawings show it)
FLN = []; FLZ = []; PITCH = 0.4
OPENINGS = []         # open bays found by block_walls: dict(b, s, k, u0, u1, z0, z1, floor, room)
OPEN_ROOMS = set()    # (floor name, room id) of the portico rooms that have an open side
STATS = {}

# ------------------------------------------------------------------ parts
PARTS = {}


def part(name):
    """Everything added from now on belongs to this part."""
    _bk._G = PARTS.setdefault(name, {})
    return name


def _fold(G, a='tile2', b='tile'):
    """Every roof surface uses one material: fold the kit's darker rib material into it."""
    t2 = G.pop(a, None)
    if t2:
        t = G.setdefault(b, [[], [], []]); o = len(t[0])
        t[0].extend(t2[0]); t[1].extend(tuple(o + i for i in f) for f in t2[1]); t[2].extend(t2[2])


def merged(skip=()):
    """All parts in one buffer (the web file: one mesh per material)."""
    G = {}
    for nm, Pt in PARTS.items():
        if nm in skip:
            continue
        for mat, (V, Fa, Sm) in Pt.items():
            g = G.setdefault(mat, [[], [], []]); o = len(g[0])
            g[0].extend(V); g[1].extend(tuple(o + i for i in f) for f in Fa); g[2].extend(Sm)
    _fold(G)
    return G


def tris(G):
    return sum(len(f) - 2 for g in G.values() for f in g[1])


# ------------------------------------------------------------------ the plan
def load(path=None, opts=None, extra=(), doors=None, no_window=(), prefix='tib', rules=None):
    """Read the plan. extra: blocks standing over a plan block (id, over, x0, y0, x1, y1, storeys, eaves, roof, ridge);
    doors: {door feature id: (w, h, kind[, at])}; no_window: ids of rooms without windows; prefix: of the part names;
    rules: {name: value} for the rules above that a palace's brief sets otherwise (COL1, WIN1, ...)."""
    global PLAN, BL, ROOMS, COURTS, FEAT, OPT, BLOCK, ROOM, FLN, FLZ, PITCH, DOORS, NO_WINDOW, PRE, PART_NAMES, WEB_SKIP
    PRE = prefix; globals().update(rules or {})
    PART_NAMES = tuple(n.replace('tib_', PRE + '_', 1) for n in ('tib_base', 'tib_b1', 'tib_garden', 'tib_f1', 'tib_f2', 'tib_f3', 'tib_roof'))
    WEB_SKIP = tuple(PRE + n for n in ('_b1', '_f1r', '_f2r', '_f3r'))
    PLAN = json.load(open(path or os.path.join(HERE, 'tiberiana_plan.json'), encoding='utf-8'))
    BL = PLAN['roof_blocks'] + [dict(b) for b in extra]; ROOMS = PLAN['rooms']; OPT = opts or {}
    DOORS = doors or {}; NO_WINDOW = set(no_window)
    BLOCK = {b['id']: b for b in BL}; ROOM = {r['id']: r for r in ROOMS}; PITCH = PLAN['roof_pitch']
    for b in BL:
        b.setdefault('note', ''); b.setdefault('over', ''); b['over'] = OPT.get(b['id'], {}).get('over', b['over'])
        if 'ridge_z' not in b:
            sp = (b['y1'] - b['y0']) if b['ridge'] == 'EW' else (b['x1'] - b['x0']); b['span'] = sp
            b['ridge_z'] = b['eaves'] + (sp / 2 * PITCH if b['roof'] in ('gable', 'hip', 'pyramid') else 0.0)
    for b in BL:
        d = 0; q = b
        while q['over']:
            q = BLOCK[q['over']]; d += 1
        b['_depth'] = d
    COURTS = [ROOM[k] for k in PLAN['open_courts']]; FEAT = {f['id']: f for f in PLAN['features']}
    FLN = sorted((k for k, z in PLAN['levels'].items() if z >= 0), key=lambda k: PLAN['levels'][k])
    FLZ = [PLAN['levels'][k] for k in FLN]
    for b in BL:
        if b['roof'] == 'lean':        # the low edge is in the note ("檐口 4.8")
            m = re.search(r'檐口\s*([0-9.]+)', b['note']); D = (b['y1'] - b['y0']) if b['ridge'] in 'NS' else (b['x1'] - b['x0'])
            b['low'] = OPT.get(b['id'], {}).get('low', float(m.group(1)) if m else round(b['eaves'] - D * LEAN_FALL, 2))
        if b['roof'] == 'vault' and not b['ridge']:     # a barrel vault runs along the longer side
            b['ridge'] = 'EW' if b['x1'] - b['x0'] > b['y1'] - b['y0'] else 'NS'
        if b['roof'] == 'compluviate':  # the opening is in the note ("天井 [x0,y0,x1,y1]")
            m = re.search(r'\[([^\]]+)\]', b['note'])
            if not m:
                raise ValueError('compluviate roof %s: no opening in its note' % b['id'])
            b['hole'] = [float(v) for v in m.group(1).split(',')]
    _CACHE.clear(); OPENINGS.clear(); OPEN_ROOMS.clear(); STATS.clear()
    return PLAN


def inside(q, x, y):
    return q['x0'] < x < q['x1'] and q['y0'] < y < q['y1']


def block_at(x, y, skip=None):
    """The roof block at a plan point (a block standing over another one wins)."""
    hit = None
    for b in BL:
        if b is not skip and inside(b, x, y) and (hit is None or b['_depth'] > hit['_depth']):
            hit = b
    return hit


def room_at(fl, x, y):
    for r in ROOMS:
        if r['floor'] == fl and inside(r, x, y):
            return r
    return None


def dist(b, s, x, y):
    """Distance of a point from side s of a block, measured inward."""
    return {'S': y - b['y0'], 'N': b['y1'] - y, 'W': x - b['x0'], 'E': b['x1'] - x}[s]


def side_line(b, s):
    """Side s as p0 -> p1 with the outside on the right (counter-clockwise round the block)."""
    x0, y0, x1, y1 = b['x0'], b['y0'], b['x1'], b['y1']
    return {'S': ((x0, y0), (x1, y0)), 'E': ((x1, y0), (x1, y1)), 'N': ((x1, y1), (x0, y1)), 'W': ((x0, y1), (x0, y0))}[s]


def hips(b):
    """The ends of a ridge roof that are hipped."""
    if b['roof'] == 'pyramid':
        return SIDES
    if b['roof'] == 'hip':
        return 'WE' if b['ridge'] == 'EW' else 'SN'
    return OPT.get(b['id'], {}).get('hip_ends', '')


def plane_sides(b):
    """The sides a ridge roof (gable, hip, pyramid) has a slope on."""
    if b['roof'] == 'pyramid':
        return SIDES
    return ('SN' if b['ridge'] == 'EW' else 'WE') + hips(b)


def _arc(span, t):
    """Height of a segmental vault above its springing, t metres from the middle of the span."""
    r = VAULT_RISE * span; R = (span * span / 4 + r * r) / (2 * r)
    return math.sqrt(max(0.0, R * R - t * t)) - (R - r)


def surf(b, x, y):
    """Height of a block's roof surface at a plan point."""
    e = b['eaves']; t = b['roof']
    if t in ('gable', 'hip', 'pyramid'):
        return e + PITCH * max(0.0, min(dist(b, s, x, y) for s in plane_sides(b)))
    if t == 'lean':
        lo = b['ridge']; D = (b['y1'] - b['y0']) if lo in 'NS' else (b['x1'] - b['x0'])
        return b['low'] + (e - b['low']) * min(1.0, max(0.0, dist(b, lo, x, y) / D))
    if t == 'vault':
        if b['ridge'] == 'EW':
            return e + _arc(b['y1'] - b['y0'], y - (b['y0'] + b['y1']) / 2)
        return e + _arc(b['x1'] - b['x0'], x - (b['x0'] + b['x1']) / 2)
    return e


def wtop(b, s):
    """Top of the wall on side s (a lean-to's wall is lower on its low side; its ends get a sloping piece from the roof)."""
    if b['roof'] == 'lean' and s != OPP[b['ridge']]:
        return b['low']
    return OPT.get(b['id'], {}).get('wall_top', b['eaves'])      # wall_top: the walls stop below the eaves (an open belvedere under the roof)


_CACHE = {}


def across(b, s):
    """What stands on the other side of side s: intervals (u along the side line) with kind 'block', 'open' (a court),
    'ext' (outside the building) or 'child' (a block standing over this one takes the face), and the lowest roof height
    there (cover)."""
    key = (b['id'], s)
    if key in _CACHE:
        return _CACHE[key]
    (ax, ay), (bx, by) = side_line(b, s); L = math.hypot(bx - ax, by - ay); ux, uy = (bx - ax) / L, (by - ay) / L; ox, oy = OUT[s]
    cuts = {0.0, L}
    for q in BL + ROOMS:
        for cx in (q['x0'], q['x1']):
            for cy in (q['y0'], q['y1']):
                if abs((cx - ax) * ox + (cy - ay) * oy) < 1e-6:
                    u = (cx - ax) * ux + (cy - ay) * uy
                    if 1e-6 < u < L - 1e-6:
                        cuts.add(round(u, 6))
    for k, sd, a, c in OPT.get(b['id'], {}).get('open', ()):
        if sd == s:
            cuts.update(round(min(L, max(0.0, _u(b, s, v))), 6) for v in (a, c))
    cuts = sorted(cuts); out = []
    for u0, u1 in zip(cuts, cuts[1:]):
        um = (u0 + u1) / 2; mx, my = ax + ux * um, ay + uy * um
        pin = (mx - ox * 0.01, my - oy * 0.01); pout = (mx + ox * 0.01, my + oy * 0.01)
        n = block_at(pout[0], pout[1], skip=b); cover = 0.0
        if any(c['over'] == b['id'] and inside(c, *pin) for c in BL):
            kind = 'child'; n = None
        elif n is not None:
            kind = 'block'
            cover = min(surf(n, ax + ux * u + ox * 0.01, ay + uy * u + oy * 0.01) for u in (u0 + 1e-3, um, u1 - 1e-3))
        elif any(inside(c, *pout) for c in COURTS):
            kind = 'open'
        else:
            kind = 'ext'
        out.append(dict(u0=u0, u1=u1, kind=kind, n=n, cover=cover, pin=pin, pout=pout))
    _CACHE[key] = out
    return out


def _u(b, s, v):
    """Station along side s of a plan coordinate (x on the north and south sides, y on the east and west)."""
    return {'S': v - b['x0'], 'N': b['x1'] - v, 'E': v - b['y0'], 'W': b['y1'] - v}[s]


def _nb_surf(b, s, u):
    """Roof height just outside side s at station u (0 outside the building and over courts)."""
    (ax, ay), (bx, by) = side_line(b, s); L = math.hypot(bx - ax, by - ay); ux, uy = (bx - ax) / L, (by - ay) / L; ox, oy = OUT[s]
    u = min(L - 1e-3, max(1e-3, u))
    for iv in across(b, s):
        if iv['u0'] - 1e-9 <= u <= iv['u1'] + 1e-9:
            if iv['kind'] == 'child':
                return 1e9
            if iv['kind'] == 'block':
                return surf(iv['n'], ax + ux * u + ox * 0.01, ay + uy * u + oy * 0.01)
            return 0.0
    return 0.0


def _covered(b, s, profile):
    """True when the neighbours' roofs hide a wall piece whose top runs through profile [(u, z), ...]."""
    pts = []
    for (u0, z0), (u1, z1) in zip(profile, profile[1:]):
        for k in range(5):
            t = k / 4; pts.append((u0 + (u1 - u0) * t, z0 + (z1 - z0) * t))
    return all(_nb_surf(b, s, u) >= z - 0.05 for u, z in pts)


def _W(b, s):
    """Frame on side s: local x along the side, local -y = outside. Returns (frame, length)."""
    (ax, ay), (bx, by) = side_line(b, s)
    return Frame(ax, ay, 0.0, math.degrees(math.atan2(by - ay, bx - ax))), math.hypot(bx - ax, by - ay)


def _merge(items, nkey):
    """Join neighbouring intervals [u0, u1, *key] whose keys are equal."""
    items = sorted(items, key=lambda it: (tuple(it[2:2 + nkey]), it[0])); out = []
    for it in items:
        if out and out[-1][2:2 + nkey] == it[2:2 + nkey] and abs(out[-1][1] - it[0]) < 1e-6:
            out[-1][1] = it[1]
        else:
            out.append(list(it))
    return out


def _union(ivs):
    ivs = sorted(ivs); out = []
    for a, c in ivs:
        if out and a <= out[-1][1] + 1e-6:
            out[-1][1] = max(out[-1][1], c)
        else:
            out.append([a, c])
    return out


def _bar(W, u0, u1, z, h, proj, mat):
    """A projecting band on the outside of a wall line (no back face)."""
    a = [W.p(u0, 0, z), W.p(u1, 0, z), W.p(u1, -proj, z), W.p(u0, -proj, z)]
    c = [W.p(u0, 0, z + h), W.p(u1, 0, z + h), W.p(u1, -proj, z + h), W.p(u0, -proj, z + h)]
    add_mesh(mat, a + c, [(0, 1, 2, 3), (7, 6, 5, 4), (3, 2, 6, 7), (0, 3, 7, 4), (2, 1, 5, 6)])


# ------------------------------------------------------------------ walls
def storeys(b):
    """(storey number, floor z, top z) of a block; its top storey runs up to the wall top. A block with more storeys
    than the plan has floor levels (a tower) is one tall top storey above the last level."""
    n = min(b['storeys'], len(FLZ))
    return [(k, FLZ[k - 1], FLZ[k] if k < n else 1e9) for k in range(1, n + 1)]


def is_open(b, s, iv, k):
    """An open bay: the room behind the face is a portico and this is its open side (the low side of its lean-to roof;
    for a loggia inside a bigger block, the side that looks out of the building), or the block's options say so."""
    um = (iv['u0'] + iv['u1']) / 2
    for kk, sd, a, c in OPT.get(b['id'], {}).get('open', ()):
        if kk == k and sd == s and min(_u(b, s, a), _u(b, s, c)) - 1e-6 <= um <= max(_u(b, s, a), _u(b, s, c)) + 1e-6:
            return True
    r = room_at(FLN[k - 1], *iv['pin'])
    if not r or r['type'] != 'portico':
        return False
    return (s == b['ridge']) if b['roof'] == 'lean' else iv['kind'] == 'ext'


def _doors_on(b, s):
    """Doors on side s: the plan's door features that lie on this face, and the block's own (opts 'doors'): (u, z, w, h, kind)."""
    (ax, ay), (bx, by) = side_line(b, s); L = math.hypot(bx - ax, by - ay); ux, uy = (bx - ax) / L, (by - ay) / L; ox, oy = OUT[s]; out = []
    for f in FEAT.values():
        if f.get('kind') != 'door' or f['side'] != s or abs((f['x'] - ax) * ox + (f['y'] - ay) * oy) > 1e-6:
            continue
        u = (f['x'] - ax) * ux + (f['y'] - ay) * uy
        if 0 < u < L and block_at(f['x'] - ox * 0.01, f['y'] - oy * 0.01) is b:
            d = DOORS.get(f['id'], (1.8, 3.0, 'rect')); w, h, kind = d[:3]
            out.append((_u(b, s, d[3]) if len(d) > 3 else u, 0.0, w, h, kind))      # a fourth value moves the door along its wall
    for sd, at, w, h, z, kind in OPT.get(b['id'], {}).get('doors', ()):
        if sd == s:
            out.append((_u(b, s, at), z, w, h, kind))
    return out


def _win_spec(b, s, k):
    """Windows of storey k on side s: (w, h, z of the sill, kind[, bay]) or None."""
    o = OPT.get(b['id'], {}).get('windows', {})
    for key in ((k, s), k):
        if key in o:
            return o[key]
    w, h, sill, kind = WIN1 if k == 1 else WIN2
    return (w, h, FLZ[k - 1] + sill, kind)


def _piece_openings(b, s, k, u0, u1, a, c, doors):
    """Doors and windows on one wall piece: [(u, z, w, h, kind, 'door' | 'win')]. One window per bay, by the room behind."""
    (ax, ay), (bx, by) = side_line(b, s); L = math.hypot(bx - ax, by - ay); ux, uy = (bx - ax) / L, (by - ay) / L; ox, oy = OUT[s]
    ops = []; taken = []
    for u, z, w, h, kind in doors:
        if u0 + w / 2 + 0.1 <= u <= u1 - w / 2 - 0.1 and a - 0.01 <= z and z + h <= c - 0.15:
            ops.append((u, z, w, h, kind, 'door')); taken.append((u - w / 2 - 0.5, u + w / 2 + 0.5))
    spec = _win_spec(b, s, k)
    if spec:
        w, h, z, kind = spec[:4]; bay = spec[4] if len(spec) > 4 else BAY; own = k in OPT.get(b['id'], {}).get('windows', {}) or (k, s) in OPT.get(b['id'], {}).get('windows', {})
        if a <= z - 0.2 and c >= z + h + 0.25:
            n = int((u1 - u0 + 1e-6) / bay)
            if n == 0 and u1 - u0 >= w + 1.2:
                n = 1
            for i in range(n):
                u = u0 + (i + 0.5) * (u1 - u0) / n
                if any(u + w / 2 > t0 and u - w / 2 < t1 for t0, t1 in taken):
                    continue
                r = room_at(FLN[k - 1], ax + ux * u - ox * 0.01, ay + uy * u - oy * 0.01)
                if (r is None and not own) or (r is not None and (r['id'] in NO_WINDOW or (k == 1 and not own and r['type'] in NOWIN1))):
                    continue
                ops.append((u, z, w, h, kind, 'win'))
    return ops


def _minus(runs, holes):
    """Intervals [u0, u1] without the holes [(a, b)]."""
    for a, c in holes:
        nxt = []
        for u0, u1 in runs:
            if c <= u0 or a >= u1:
                nxt.append([u0, u1]); continue
            if a - u0 > 0.05:
                nxt.append([u0, a])
            if u1 - c > 0.05:
                nxt.append([c, u1])
        runs = nxt
    return runs


def _bar2(W, u0, u1, z0, z1, h, proj, mat):
    """A projecting band that follows a slope: z0 at u0, z1 at u1 (the flashing over a lower roof)."""
    a = [W.p(u0, 0, z0), W.p(u1, 0, z1), W.p(u1, -proj, z1), W.p(u0, -proj, z0)]
    c = [W.p(u0, 0, z0 + h), W.p(u1, 0, z1 + h), W.p(u1, -proj, z1 + h), W.p(u0, -proj, z0 + h)]
    add_mesh(mat, a + c, [(7, 6, 5, 4), (3, 2, 6, 7), (0, 3, 7, 4), (2, 1, 5, 6)])


def _flashing(b, s, W, L, iv, top):
    """A travertine course on the wall just above the tiles of the lower roof on the other side of this face."""
    n = iv['n']
    if iv['kind'] != 'block' or n['roof'] not in ('lean', 'gable', 'hip', 'pyramid', 'compluviate') or top - iv['cover'] < 0.4:
        return
    (ax, ay), (bx, by) = side_line(b, s); ux, uy = (bx - ax) / L, (by - ay) / L; us = {iv['u0'], iv['u1']}
    hs = min(n['x1'] - n['x0'], n['y1'] - n['y0']) / 2                # where the neighbour's roof may change slope along this edge
    for v in ((n['x0'] + n['x1']) / 2, n['x0'] + hs, n['x1'] - hs) if s in 'SN' else ((n['y0'] + n['y1']) / 2, n['y0'] + hs, n['y1'] - hs):
        u = _u(b, s, v)
        if iv['u0'] + 1e-6 < u < iv['u1'] - 1e-6:
            us.add(u)
    us = sorted(us); k = max(1, sum(1 for z in FLZ if z <= iv['cover'] + 1e-6)); part(PRE + '_f%d' % min(k, b['storeys']))
    for u0, u1 in zip(us, us[1:]):
        z0, z1 = _nb_surf(b, s, u0 + 1e-3), _nb_surf(b, s, u1 - 1e-3)
        if max(z0, z1) + FLASH <= top - 0.1:
            _bar2(W, u0, u1, z0, z1, FLASH, 0.07, 'travertine')


def block_walls(b, detail=True):
    """The outer faces of a roof block. A face stands only where the neighbour is lower or open, from the neighbour's
    roof up; it is cut at the floor levels (parts tib_f1, tib_f2, tib_f3). Travertine plinth, a red dado band, a red
    band at every floor level of the block (the string courses), a cornice under the wall top. detail: the faces are skins with
    window recesses and doors, and a wall above a lower tiled roof gets its flashing course."""
    o = OPT.get(b['id'], {})
    for s in SIDES:
        top = wtop(b, s); W, L = _W(b, s); walls = []; opens = []; doors = _doors_on(b, s) if detail else []
        for iv in across(b, s):
            if iv['kind'] == 'child' or top - iv['cover'] < 0.05:
                continue
            for k, za, zb in storeys(b):
                a, c = max(iv['cover'], za), min(top, zb)
                if c - a < 0.02:
                    continue
                if is_open(b, s, iv, k):
                    zo = min(c, za + (COL1 + ARCH if k == 1 else 1e9))
                    if a < zo - 0.02:
                        r = room_at(FLN[k - 1], *iv['pin'])
                        opens.append([iv['u0'], iv['u1'], a, zo, k, za, r['id'] if r else ''])
                        if r and r['type'] == 'portico':
                            OPEN_ROOMS.add((FLN[k - 1], r['id']))
                    a = max(a, zo)
                    if c - a < 0.02:
                        continue
                walls.append([iv['u0'], iv['u1'], a, c, k])
            if detail:
                _flashing(b, s, W, L, iv, top)
        holes = []; wins = []
        for u0, u1, a, c, k in _merge(walls, 3):
            part(PRE + '_f%d' % k); ops = _piece_openings(b, s, k, u0, u1, a, c, doors) if detail else []
            STATS['wall_m2'] = STATS.get('wall_m2', 0.0) + (u1 - u0) * (c - a)
            if not ops:
                add_poly('plaster', [W.p(u0, 0, a), W.p(u1, 0, a), W.p(u1, 0, c), W.p(u0, 0, c)])
                continue
            opening_skin(W.sub(0, SKIN, 0), u0, 0, u1, 0, a, c - a, [(u - u0, z - a, w, h, kind) for u, z, w, h, kind, what in ops],
                         'plaster', depth=SKIN - 0.01, inner='dark')
            for u, z, w, h, kind, what in ops:
                yi = SKIN - 0.06                                     # just in front of the dark back of the recess
                if what == 'door':
                    hl = h - (w / 2 if kind == 'arch' else 0.0); holes.append((u - w / 2, u + w / 2, z, h))
                    add_poly('wood', [W.p(u - w / 2, yi, z), W.p(u + w / 2, yi, z), W.p(u + w / 2, yi, z + hl), W.p(u - w / 2, yi, z + hl)])
                    STATS['doors'] = STATS.get('doors', 0) + 1
                else:
                    STATS['win%d' % k] = STATS.get('win%d' % k, 0) + 1; wins.append((u - w / 2, u + w / 2, z, h))
                    if k > 1 and kind == 'rect':                     # a wooden lattice: one upright, two rails
                        t = 0.05
                        for (ua, ub, za, zb) in ((u - t, u + t, z, z + h), (u - w / 2, u + w / 2, z + h / 3 - t, z + h / 3 + t),
                                                 (u - w / 2, u + w / 2, z + 2 * h / 3 - t, z + 2 * h / 3 + t)):
                            add_poly('wood', [W.p(ua, yi, za), W.p(ub, yi, za), W.p(ub, yi, zb), W.p(ua, yi, zb)])
        for u0, u1, a, zo, k, za, rid in _merge(opens, 5):
            OPENINGS.append(dict(b=b, s=s, k=k, u0=u0, u1=u1, z0=a, z1=zo, floor=za, room=rid, kind=across_kind(b, s, (u0 + u1) / 2)))
        if not walls:
            continue
        part(PRE + '_f1'); ground = _union([w[:2] for w in walls if w[2] < 0.01])
        for u0, u1 in _minus(ground, [(h0, h1) for h0, h1, z, h in holes if z < 0.5]):
            _bar(W, u0, u1, 0.0, PLINTH, 0.10, 'travertine')
        if detail:
            tall = _union([w[:2] for w in walls if w[2] < 0.01 and w[3] >= DADO[0] + DADO[1] + 1.0])
            for u0, u1 in _minus(tall, [(h0 - 0.15, h1 + 0.15) for h0, h1, z, h in holes if z < 0.5 and h > DADO[0]]):
                _bar(W, u0, u1, DADO[0], DADO[1], 0.06, 'red')
        us = sorted({w[0] for w in walls} | {w[1] for w in walls})
        for i, zf in enumerate(FLZ[1:b['storeys']]):     # a string course marks a floor of this block (a hall through two storeys has none)
            part(PRE + '_f%d' % (i + 2)); hit = []
            for u0, u1 in zip(us, us[1:]):
                um = (u0 + u1) / 2; here = [w for w in walls if w[0] < um < w[1]]
                if any(w[2] <= zf - 0.3 and w[3] >= zf - 1e-6 for w in here) and any(w[2] <= zf + 1e-6 and w[3] >= zf + 0.9 for w in here):
                    hit.append([u0, u1])
            for u0, u1 in _minus(_union(hit), [(h0 - 0.1, h1 + 0.1) for h0, h1, z, h in holes + wins if z - 0.15 < zf < z + h + 0.15]):
                _bar(W, u0, u1, zf - 0.15, 0.3, 0.08, 'red')
        part(PRE + '_f%d' % b['storeys']); tops = _union([w[:2] for w in walls if w[3] >= top - 0.01])
        for u0, u1 in tops:
            _bar(W, u0, u1, top - 0.52, 0.42, 0.22, 'travertine')        # 0.1 under the wall top: it stays below the eaves' soffit
            if detail and o.get('gold'):
                _bar(W, u0, u1, top - 1.02, 0.5, 0.05, 'gold')           # the gilt band under the cornice


def across_kind(b, s, u):
    for iv in across(b, s):
        if iv['u0'] - 1e-9 <= u <= iv['u1'] + 1e-9:
            return iv['kind']
    return 'ext'


# ------------------------------------------------------------------ roofs
def _clip(poly, a, b, c):
    """The part of a convex polygon [(x, y), ...] where a x + b y + c >= 0."""
    out = []; n = len(poly)
    for i in range(n):
        p, q = poly[i], poly[(i + 1) % n]
        fp = a * p[0] + b * p[1] + c; fq = a * q[0] + b * q[1] + c
        if fp >= -1e-9:
            out.append(p)
        if (fp > 1e-9 and fq < -1e-9) or (fp < -1e-9 and fq > 1e-9):
            t = fp / (fp - fq); out.append((p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t))
    return out


def _area(poly):
    return 0.5 * sum(poly[i][0] * poly[(i + 1) % len(poly)][1] - poly[(i + 1) % len(poly)][0] * poly[i][1] for i in range(len(poly)))


def _plane(b, s, slope, z_line):
    """The plane that is z_line high on side s of block b and rises by `slope` per metre inward: (gx, gy, c)."""
    if s == 'S':
        return (0.0, slope, z_line - slope * b['y0'])
    if s == 'N':
        return (0.0, -slope, z_line + slope * b['y1'])
    if s == 'W':
        return (slope, 0.0, z_line - slope * b['x0'])
    return (-slope, 0.0, z_line + slope * b['x1'])


def _z(pl, x, y):
    return pl[0] * x + pl[1] * y + pl[2]


def _sub(p, q):
    return (p[0] - q[0], p[1] - q[1], p[2] - q[2])


def _tiles(poly, pl, fascia=True, ribs=True):
    """A tiled roof plane over a convex plan polygon: the surface, a fascia under its lowest edge and the tile ribs
    (imbrex rows) running down the slope every RIB metres."""
    poly = [p for i, p in enumerate(poly) if math.hypot(p[0] - poly[i - 1][0], p[1] - poly[i - 1][1]) > 1e-6]
    if len(poly) < 3 or abs(_area(poly)) < 0.05:
        return
    if _area(poly) < 0:
        poly = poly[::-1]
    P3 = [Vector((x, y, _z(pl, x, y))) for x, y in poly]; n = len(poly)
    add_poly('tile', P3)
    STATS['tile_m2'] = STATS.get('tile_m2', 0.0) + abs(_area(poly))
    g = math.hypot(pl[0], pl[1])
    if g < 1e-6:
        return
    fx, fy = -pl[0] / g, -pl[1] / g; lx, ly = -fy, fx          # downhill, and across the slope
    T = [x * fx + y * fy for x, y in poly]
    STATS['run_max'] = max(STATS.get('run_max', 0.0), max(T) - min(T))
    if fascia:
        zmin = min(p.z for p in P3); dz = Vector((0, 0, 0.2))
        for i in range(n):
            a, c = P3[i], P3[(i + 1) % n]
            if abs(a.z - zmin) < 1e-4 and abs(c.z - zmin) < 1e-4:
                add_poly('tile', [a, c, c - dz, a - dz])
    if not ribs:
        return
    S = [x * lx + y * ly for x, y in poly]; smin, smax = min(S), max(S)
    if smax - smin < 0.5:
        return
    nr = max(1, int(round((smax - smin) / RIB))); nrm = Vector((-pl[0], -pl[1], 1.0)).normalized(); lat = Vector((lx, ly, 0.0))
    for k in range(nr):
        s = smin + (k + 0.5) * (smax - smin) / nr; ts = []
        for i in range(n):
            (x0, y0), (x1, y1) = poly[i], poly[(i + 1) % n]; s0 = x0 * lx + y0 * ly - s; s1 = x1 * lx + y1 * ly - s
            if (s0 < 0) != (s1 < 0):
                q = s0 / (s0 - s1); ts.append((x0 + (x1 - x0) * q) * fx + (y0 + (y1 - y0) * q) * fy)
        if len(ts) < 2:
            continue
        t0, t1 = min(ts) + 0.12, max(ts)
        if t1 - t0 < 0.6:
            continue
        ends = []
        for t in (t0, t1):
            x, y = lx * s + fx * t, ly * s + fy * t; ends.append(Vector((x, y, _z(pl, x, y))))
        a, c = ends; w = lat * (RIB_W / 2); h = nrm * RIB_H
        add_mesh('tile', [a - w, a + w, a + h, c - w, c + w, c + h], [(0, 3, 5, 2), (2, 5, 4, 1), (3, 4, 5)])
        STATS['ribs'] = STATS.get('ribs', 0) + 1


def _ridge_beam(p, q, w=0.34, h=0.26):
    beam(None, p[0], p[1], p[2] + 0.05, q[0], q[1], q[2] + 0.05, w, h, 'tile')


def _eave_free(b, s, z):
    """True when the roof edge on side s (z high) looks over something lower, so it gets its overhang."""
    return any(iv['kind'] != 'child' and iv['cover'] < z - 0.3 for iv in across(b, s))


def end_kind(b, s):
    """How a ridge roof ends on side s: ('hip',), ('butt',) against a taller wall, ('run', d, n) carried d metres on
    into neighbour n's slope until the ridge meets it, or ('gable',) with its own gable wall."""
    if s in hips(b):
        return ('hip',)
    e = b['eaves']; (ax, ay), (bx, by) = side_line(b, s); L = math.hypot(bx - ax, by - ay); rz = e + PITCH * L / 2
    if _covered(b, s, [(0, e), (L / 2, rz), (L, e)]):
        return ('butt',)
    ivs = across(b, s); n = ivs[0]['n']
    if n is not None and all(iv['n'] is n for iv in ivs) and n['roof'] in ('gable', 'hip', 'pyramid') and OPP[s] in plane_sides(n):
        ox, oy = OUT[s]; mx, my = (ax + bx) / 2, (ay + by) / 2; d = (rz - n['eaves']) / PITCH
        if n['eaves'] >= e - 0.5 and d > 0 and surf(n, mx + ox * d, my + oy * d) >= rz - 1e-6:
            return ('run', d, n)
    return ('gable',)


def _ridge_roof(b):
    """Gable, hip and pyramid roofs: one plane per eaves side, cut where they meet; ridge tiles on every ridge and hip."""
    e = b['eaves']; ps = plane_sides(b); x0, y0, x1, y1 = b['x0'], b['y0'], b['x1'], b['y1']; ext = {}; ends = {}
    for s in SIDES:
        if s in ps:
            ext[s] = OVER if _eave_free(b, s, e) else 0.0
        else:
            ends[s] = end_kind(b, s); ext[s] = VERGE if ends[s][0] == 'gable' else 0.0
    rect = [(x0 - ext['W'], y0 - ext['S']), (x1 + ext['E'], y0 - ext['S']), (x1 + ext['E'], y1 + ext['N']), (x0 - ext['W'], y1 + ext['N'])]
    PL = {s: _plane(b, s, PITCH, e) for s in ps}; polys = {}
    for s in ps:
        poly = rect
        for t in ps:
            if t != s:
                poly = _clip(poly, *_sub(PL[t], PL[s]))
        polys[s] = poly; _tiles(poly, PL[s])
    seen = set()
    for s in ps:                                   # an edge two planes share is a ridge or a hip
        n = len(polys[s])
        for i in range(n):
            p, q = polys[s][i], polys[s][(i + 1) % n]
            if math.hypot(p[0] - q[0], p[1] - q[1]) < 0.05:
                continue
            for t in ps:
                if t != s and abs(_z(PL[t], *p) - _z(PL[s], *p)) < 1e-6 and abs(_z(PL[t], *q) - _z(PL[s], *q)) < 1e-6:
                    key = tuple(sorted((tuple(round(v, 3) for v in p), tuple(round(v, 3) for v in q))))
                    if key not in seen:
                        seen.add(key); _ridge_beam((p[0], p[1], _z(PL[s], *p)), (q[0], q[1], _z(PL[s], *q)))
    for s, kind in ends.items():
        W, L = _W(b, s); rz = e + PITCH * L / 2
        if kind[0] == 'gable':                     # the gable wall above the eaves line
            add_poly('plaster', [W.p(0, 0, e), W.p(L, 0, e), W.p(L / 2, 0, rz)])
            if s in OPT.get(b['id'], {}).get('pediment', ''):      # a pediment: marble raking cornices and a marble cornice below
                for ua, ub in ((-0.3, L / 2), (L + 0.3, L / 2)):
                    beam(W, ua, -0.2, e - 0.14 - PITCH * (0.3 if ua < 0 or ua > L else 0), ub, -0.2, rz - 0.14, 0.52, 0.3, 'marble')
                _bar(W, -0.25, L + 0.25, e - 0.45, 0.42, 0.42, 'marble')
        elif kind[0] == 'run':                     # carried on into the neighbour's slope: a valley on each side
            d, n = kind[1], kind[2]; ox, oy = OUT[s]; npl = _plane(n, OPP[s], PITCH, n['eaves'])
            (ax, ay), (bx, by) = side_line(b, s)
            strip = [(ax, ay), (bx, by), (bx + ox * d, by + oy * d), (ax + ox * d, ay + oy * d)]
            for t in ps:
                poly = strip
                for t2 in ps:
                    if t2 != t:
                        poly = _clip(poly, *_sub(PL[t2], PL[t]))
                _tiles(_clip(poly, *_sub(PL[t], npl)), PL[t], fascia=False)
            mx, my = (ax + bx) / 2, (ay + by) / 2
            _ridge_beam((mx, my, rz), (mx + ox * d, my + oy * d, rz))
    b['_ends'] = ends
    for v in OPT.get(b['id'], {}).get('cross_walls', ()):
        _cross_wall(b, v)


def _cross_wall(b, v, rise=0.5, t=0.45):
    """A parapet gable across a ridge roof at plan coordinate v along the ridge: a wall standing `rise` above the tiles,
    coped in travertine. It breaks a long ridge."""
    e = b['eaves']
    if b['ridge'] == 'NS':
        Fc = Frame(b['x0'], v - t / 2, 0.0, 0.0); L = b['x1'] - b['x0']
    else:
        Fc = Frame(v + t / 2, b['y0'], 0.0, 90.0); L = b['y1'] - b['y0']
    rz = e + PITCH * L / 2; z0 = e - 0.3
    prof = [(0, z0), (L, z0), (L, e + rise), (L / 2, rz + rise), (0, e + rise)]
    add_poly('plaster', [Fc.p(u, 0, z) for u, z in prof]); add_poly('plaster', [Fc.p(u, t, z) for u, z in reversed(prof)])
    for (ua, za), (ub, zb) in (((0, z0), (0, e + rise)), ((L, e + rise), (L, z0))):
        add_poly('plaster', [Fc.p(ua, 0, za), Fc.p(ub, 0, zb), Fc.p(ub, t, zb), Fc.p(ua, t, za)])
    for ua, ub in ((0.0, L / 2), (L, L / 2)):
        beam(Fc, ua, t / 2, e + rise + 0.05, ub, t / 2, rz + rise + 0.05, t + 0.16, 0.1, 'travertine')


def _partners(b):
    """Lean-to roofs of the same height that meet this one at a corner. 'owner': this block holds the corner square;
    'guest': the other one does, and this roof is carried on into it. Returns [(other, role, side of the guest that
    touches the owner)]."""
    out = []
    for o in BL:
        if o is b or o['roof'] != 'lean' or abs(o['eaves'] - b['eaves']) > 1e-6 or abs(o['low'] - b['low']) > 1e-6:
            continue
        if (b['ridge'] in 'NS') == (o['ridge'] in 'NS'):
            continue
        for A, B in ((b, o), (o, b)):
            lo = A['ridge']; hiB = OPP[B['ridge']]; key = {'S': 'y0', 'N': 'y1', 'W': 'x0', 'E': 'x1'}
            touch = abs(B[key[OPP[lo]]] - A[key[lo]]) < 1e-6 and (
                min(A['x1'], B['x1']) - max(A['x0'], B['x0']) > 1e-6 if lo in 'NS' else min(A['y1'], B['y1']) - max(A['y0'], B['y0']) > 1e-6)
            if touch and abs(B[key[hiB]] - A[key[hiB]]) < 1e-6:
                out.append((o, 'owner' if A is b else 'guest', OPP[lo]))
    return out


def _lean_plane(b):
    lo = b['ridge']; D = (b['y1'] - b['y0']) if lo in 'NS' else (b['x1'] - b['x0'])
    return _plane(b, lo, (b['eaves'] - b['low']) / D, b['low'])


def _lean(b):
    """A lean-to roof: high edge b['eaves'] against the wall behind, falling to b['low'] on side b['ridge']."""
    e, low = b['eaves'], b['low']; lo = b['ridge']; hi = OPP[lo]; pl = _lean_plane(b); ext = {s: 0.0 for s in SIDES}
    ext[lo] = OVER if _eave_free(b, lo, low) else 0.0
    parts = _partners(b); guest = {sd for _, role, sd in parts if role == 'guest'}; pieces = {}
    for s in SIDES:
        if s in (lo, hi) or s in guest:
            continue
        W, L = _W(b, s); (ax, ay), (bx, by) = side_line(b, s); ix, iy = -OUT[s][0] * 0.01, -OUT[s][1] * 0.01
        za, zb = surf(b, ax + ix, ay + iy), surf(b, bx + ix, by + iy)
        if not _covered(b, s, [(0, za), (L, zb)]):
            pieces[s] = (W, L, za, zb); ext[s] = VERGE
    for o, role, sd in parts:
        if role == 'guest':
            ext[sd] = (o['y1'] - o['y0']) if o['ridge'] in 'NS' else (o['x1'] - o['x0'])
    poly = [(b['x0'] - ext['W'], b['y0'] - ext['S']), (b['x1'] + ext['E'], b['y0'] - ext['S']),
            (b['x1'] + ext['E'], b['y1'] + ext['N']), (b['x0'] - ext['W'], b['y1'] + ext['N'])]
    for o, role, sd in parts:
        poly = _clip(poly, *_sub(pl, _lean_plane(o)))          # the mitre: each roof keeps the side where it is the higher one
    _tiles(poly, pl)
    for s, (W, L, za, zb) in pieces.items():                   # the sloping wall piece over each end
        pts = [W.p(0, 0, low), W.p(L, 0, low)] + ([W.p(L, 0, zb)] if zb > low + 1e-6 else []) + ([W.p(0, 0, za)] if za > low + 1e-6 else [])
        add_poly('plaster', pts)


def _compluviate(b):
    """Four planes falling inward to the opening, which lies DROP lower than the outer edge, with an upstand round it.
    The room below is given its inner faces (web file only), so that one looks down into a room, not into the block."""
    e = b['eaves']; hx0, hy0, hx1, hy1 = b['hole']; x0, y0, x1, y1 = b['x0'], b['y0'], b['x1'], b['y1']
    run = {'S': hy0 - y0, 'N': y1 - hy1, 'W': hx0 - x0, 'E': x1 - hx1}
    PL = {s: _plane(b, s, -DROP / run[s], e) for s in SIDES}; ext = {s: (OVER if _eave_free(b, s, e) else 0.0) for s in SIDES}
    rect = [(x0 - ext['W'], y0 - ext['S']), (x1 + ext['E'], y0 - ext['S']), (x1 + ext['E'], y1 + ext['N']), (x0 - ext['W'], y1 + ext['N'])]
    for s in SIDES:
        poly = rect
        for t in SIDES:
            if t != s:
                poly = _clip(poly, *_sub(PL[s], PL[t]))        # the valleys: each plane where it is the highest
        _tiles(_clip(poly, PL[s][0], PL[s][1], PL[s][2] - (e - DROP)), PL[s], fascia=False)
    zl = e - DROP; t = 0.2
    for (cx, cy, sx, sy) in (((hx0 + hx1) / 2, hy0 - t / 2, hx1 - hx0 + 2 * t, t), ((hx0 + hx1) / 2, hy1 + t / 2, hx1 - hx0 + 2 * t, t),
                             (hx0 - t / 2, (hy0 + hy1) / 2, t, hy1 - hy0), (hx1 + t / 2, (hy0 + hy1) / 2, t, hy1 - hy0)):
        box(None, cx, cy, zl - 0.15, sx, sy, UPSTAND + 0.15, 'tile')
    part(PRE + '_f1w'); i = 0.3; zt = e - 0.05 - i * DROP / min(run.values())      # just under the tiles at the inset
    q = [(x0 + i, y0 + i), (x1 - i, y0 + i), (x1 - i, y1 - i), (x0 + i, y1 - i)]
    for k in range(4):
        (ax, ay), (bx, by) = q[k], q[(k + 1) % 4]
        add_poly('plaster', [Vector((bx, by, 0.05)), Vector((ax, ay, 0.05)), Vector((ax, ay, zt)), Vector((bx, by, zt))])
    part(PRE + '_roof')


def _parapet_runs(b):
    """Where a flat roof gets its parapet: along every edge that looks over something lower (a step of up to 0.6 m
    between two flat roofs stays open). opts 'gaps': [(side, a, b)] in plan coordinates along that side."""
    e = b['eaves']; out = []
    for s in SIDES:
        W, L = _W(b, s); (ax, ay), (bx, by) = side_line(b, s); runs = []
        for iv in across(b, s):
            n = iv['n']
            if iv['kind'] == 'child' or (iv['kind'] == 'block' and (iv['cover'] >= e + 0.3 or (n['roof'] == 'flat' and abs(n['eaves'] - e) <= 0.6))):
                continue
            runs.append([iv['u0'], iv['u1']])
        runs = _union(runs)
        for sd, ga, gb in OPT.get(b['id'], {}).get('gaps', ()):
            if sd != s:
                continue
            ua, ub = sorted((abs(ga - (ax if s in 'SN' else ay)), abs(gb - (ax if s in 'SN' else ay)))); cut = []
            for u0, u1 in runs:
                if ua > u0 + 1e-6:
                    cut.append([u0, min(u1, ua)])
                if ub < u1 - 1e-6:
                    cut.append([max(u0, ub), u1])
            runs = [r for r in cut if r[1] - r[0] > 0.05]
        out += [(s, W, u0, u1) for u0, u1 in runs]
    return out


def _flat(b):
    """A flat roof with a parapet where it has an open edge. The deck is opus signinum (a terrace people use is paved:
    opts 'deck'); the parapet's coping is signinum too, so that no flat roof reads as a white slab from above."""
    e = b['eaves']
    add_poly(OPT.get(b['id'], {}).get('deck', SIGNINUM), [Vector((b['x0'], b['y0'], e)), Vector((b['x1'], b['y0'], e)), Vector((b['x1'], b['y1'], e)), Vector((b['x0'], b['y1'], e))])
    for s, W, u0, u1 in ([] if OPT.get(b['id'], {}).get('parapet') is False else _parapet_runs(b)):      # parapet False: the palace script puts its own balustrade there
        box(W, (u0 + u1) / 2, PARAPET_T / 2, e, u1 - u0, PARAPET_T, PARAPET_H, 'plaster')
        _box5(W, (u0 + u1) / 2, PARAPET_T / 2 - 0.03, e + PARAPET_H, u1 - u0 + 0.06, PARAPET_T + 0.12, 0.1, SIGNINUM)


def _vault(b, seg=10):
    """A plastered barrel vault along b['ridge'], with a low parapet wall at both ends."""
    vm = OPT.get(b['id'], {}).get('vault_mat', 'plaster'); e = b['eaves']; ew = b['ridge'] == 'EW'; span = (b['y1'] - b['y0']) if ew else (b['x1'] - b['x0'])
    ends = 'WE' if ew else 'SN'; W0, L0 = _W(b, ends[0]); length = (b['x1'] - b['x0']) if ew else (b['y1'] - b['y0'])
    prof = [(span * i / seg, e + _arc(span, span * i / seg - span / 2)) for i in range(seg + 1)]      # (u across the span, z)
    for i in range(seg):                           # the extrados, from end 0 to end 1 (W0: local x across, +y inward)
        (ua, za), (ub, zb) = prof[i], prof[i + 1]
        add_poly(vm, [W0.p(ua, 0, za), W0.p(ub, 0, zb), W0.p(ub, length, zb), W0.p(ua, length, za)], smooth=True)
    for s in ends:
        W, L = _W(b, s); top = [(u, z + VAULT_PARAPET) for u, z in prof]
        if _covered(b, s, top):
            continue
        t = PARAPET_T; front = [W.p(0, 0, e), W.p(L, 0, e)] + [W.p(u, 0, z) for u, z in reversed(top)]
        back = [W.p(0, t, e), W.p(L, t, e)] + [W.p(u, t, z) for u, z in reversed(top)]
        add_poly(vm, front); add_poly(vm, back[::-1])
        for i in range(seg):
            (ua, za), (ub, zb) = top[i], top[i + 1]
            add_poly(vm, [W.p(ua, 0, za), W.p(ub, 0, zb), W.p(ub, t, zb), W.p(ua, t, za)])


def roof(b):
    """The roof of a block by b['roof']."""
    part(PRE + '_roof')
    if OPT.get(b['id'], {}).get('roof') == 'own':                # the palace script builds this roof itself
        return
    {'gable': _ridge_roof, 'hip': _ridge_roof, 'pyramid': _ridge_roof, 'lean': _lean, 'compluviate': _compluviate,
     'flat': _flat, 'vault': _vault}[b['roof']](b)


def ridge_z(b):
    """Highest point of a block's roof."""
    if b['roof'] in ('gable', 'hip', 'pyramid'):
        return b['ridge_z']
    if b['roof'] == 'vault':
        return b['eaves'] + VAULT_RISE * ((b['y1'] - b['y0']) if b['ridge'] == 'EW' else (b['x1'] - b['x0'])) + VAULT_PARAPET
    if b['roof'] == 'flat':
        return b['eaves'] + PARAPET_H + 0.1
    return b['eaves']


# ------------------------------------------------------------------ courts, porticoes
def courts(mats=None, holes=None):
    """The open courts as flat floors (what stands in them is the palace script's). mats: by room type or room id;
    holes: {court id: (x0, y0, x1, y1)} an opening in its floor (a sunken court)."""
    mats = dict({'garden': 'grass', 'court': 'paving'}, **(mats or {})); holes = holes or {}
    part(PRE + '_garden')
    for c in COURTS:
        h = holes.get(c['id']); m = mats.get(c['id'], mats[c['type']])
        R = [(c['x0'], c['y0'], c['x1'], c['y1'])] if not h else [(c['x0'], c['y0'], c['x1'], h[1]), (c['x0'], h[3], c['x1'], c['y1']), (c['x0'], h[1], h[0], h[3]), (h[2], h[1], c['x1'], h[3])]
        for x0, y0, x1, y1 in R:
            add_poly(m, [Vector((x0, y0, 0.1)), Vector((x1, y0, 0.1)), Vector((x1, y1, 0.1)), Vector((x0, y1, 0.1))])


def _box5(F, cx, cy, z0, sx, sy, sz, mat, rot=0.0):
    """A box without its bottom face (it stands on something)."""
    F = (F or Frame()).sub(cx, cy, z0, rot); hx, hy = sx / 2, sy / 2
    v = [F.p(-hx, -hy, 0), F.p(hx, -hy, 0), F.p(hx, hy, 0), F.p(-hx, hy, 0), F.p(-hx, -hy, sz), F.p(hx, -hy, sz), F.p(hx, hy, sz), F.p(-hx, hy, sz)]
    add_mesh(mat, v, [(4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])


def column(x, y, z0, h, order='ionic', mat='marble', r=None, rot=0.0, seg=8):
    """A light column for the web file (36 triangles Ionic, 52 Corinthian): plinth, tapering shaft, capital."""
    r = r or h / 17.0; ph = r * 0.45; ch = r * (2.1 if order == 'corinthian' else 1.0)
    _box5(None, x, y, z0, r * 2.5, r * 2.5, ph, mat, rot)
    cyl(None, x, y, z0 + ph, r, h - ph - ch, mat, seg, r_top=r * 0.86, caps=False); zc = z0 + h - ch
    if order == 'corinthian':
        cyl(None, x, y, zc, r * 0.88, ch * 0.8, mat, seg, r_top=r * 1.3, caps=False)
        _box5(None, x, y, zc + ch * 0.8, r * 2.8, r * 2.8, ch * 0.2, mat, rot)
    else:
        _box5(None, x, y, zc, r * 3.0, r * 2.1, ch, mat, rot)        # the volutes' block, long side along the colonnade
    STATS['columns'] = STATS.get('columns', 0) + 1


def _run_ends(o, sb):
    """First and last column station of an open run. Where it meets another run at a corner the two share the corner
    column; where the next run goes on in line they share the column between them; against a wall it stands sb + 0.1 in."""
    W, L = _W(o['b'], o['s']); ends = []
    for u, sgn in ((o['u0'], -1.0), (o['u1'], 1.0)):
        p = W.p(u, 0, 0); d = -sgn * (sb + 0.1)
        for q in OPENINGS:
            if q is o or q['k'] != o['k']:
                continue
            Wq, Lq = _W(q['b'], q['s'])
            if any((Wq.p(v, 0, 0) - p).length < 1e-4 for v in (q['u0'], q['u1'])):
                d = 0.0 if q['s'] == o['s'] else sgn * sb
        ends.append(u + d)
    return ends


def porticoes(order='column', bay=BAY, sb=0.35, edge_z=0.35, court_z=0.2):
    """The open bays block_walls found: columns every `bay` metres and an architrave under the wall or roof above.
    Ground floor: Ionic, on the platform wall's coping at the edge of the building (edge_z) or on a stylobate in a court.
    Upper storeys: a parapet, the columns on it where they would be at least 2.6 m tall, else on the floor with the
    parapet between them; Corinthian over a ground-floor portico (the second order), Ionic in a loggia.
    order='pier' (round 1): plain piers instead of columns."""
    seen = set()
    for o in OPENINGS:
        b = o['b']; W, L = _W(b, o['s']); k = o['k']; z0, z1, zf = o['z0'], o['z1'], o['floor']; part(PRE + '_f%d' % k)
        ua, ub = _run_ends(o, sb); n = max(1, int(round((ub - ua) / bay))); um = (ua + ub) / 2; rot = math.degrees(W.r); arch = ARCH
        if k == 1:
            zc = edge_z if o['kind'] == 'ext' else court_z; ordr = OPT.get(b['id'], {}).get('order1', 'ionic')
            if o['kind'] != 'ext':
                box(W, um, sb, 0.05, ub - ua + 0.9, 0.9, zc - 0.05, 'travertine')         # stylobate
        else:
            oo = OPT.get(b['id'], {})
            box(W, (o['u0'] + o['u1']) / 2, 0.16, zf, o['u1'] - o['u0'], 0.3, PARAPET_H, oo.get('rail', 'plaster'))
            _box5(W, (o['u0'] + o['u1']) / 2, 0.16, zf + PARAPET_H, o['u1'] - o['u0'], 0.42, 0.08, 'marble')
            _bar(W, o['u0'], o['u1'], zf - 0.15, 0.3, 0.08, 'red')
            zc = zf + PARAPET_H + 0.08 if (z1 - ARCH) - (zf + PARAPET_H) >= 2.6 and not oo.get('on_floor') else zf
            if zc == zf:
                arch = oo.get('arch2', ARCH_UP)      # columns on the floor (under a low roof, or opts on_floor): a lighter beam (opts arch2), a taller column
            ordr = OPT.get(b['id'], {}).get('order', 'corinthian' if b['roof'] == 'lean' else 'ionic')
        zc = max(zc, z0)
        for i in range(n + 1):
            u = ua + (ub - ua) * i / n; p = W.p(u, sb, zc); key = (round(p.x, 2), round(p.y, 2), round(p.z, 2))
            if key in seen:
                continue
            seen.add(key)
            if order == 'pier':
                box(None, p.x, p.y, p.z, 0.5, 0.5, z1 - arch - zc, 'marble', rot)
            else:
                cm = OPT.get(b['id'], {}).get('col_mat', 'marble'); column(p.x, p.y, p.z, z1 - arch - zc, ordr, cm if k == 1 else OPT.get(b['id'], {}).get('col_mat2', cm), rot=rot)
        box(W, um, sb, z1 - arch, ub - ua + 0.7, 0.7, arch, 'marble')
        STATS['col_h%d%s' % (k, 'L' if b['roof'] == 'lean' else '')] = round(z1 - arch - zc, 2)
        STATS['bays'] = STATS.get('bays', 0) + n


def recesses(depth=2.5):
    """Behind an open bay that is not a portico room (a loggia cut into a block): a floor, a back wall, two side walls
    and a ceiling, `depth` metres in (opts 'recess')."""
    for o in OPENINGS:
        r = ROOM.get(o['room'])
        if r is not None and r['type'] == 'portico':
            continue
        b = o['b']; W, L = _W(b, o['s']); u0, u1, zf, z1 = o['u0'], o['u1'], o['floor'], o['z1']; d = OPT.get(b['id'], {}).get('recess', depth)
        part(PRE + '_f%d' % o['k']); zb = zf + 0.03
        add_poly('paving', [W.p(u0, 0, zb), W.p(u1, 0, zb), W.p(u1, d, zb), W.p(u0, d, zb)])
        add_poly('plaster', [W.p(u0, d, zf), W.p(u1, d, zf), W.p(u1, d, z1), W.p(u0, d, z1)])
        add_poly('plaster', [W.p(u0, d, zf), W.p(u0, 0, zf), W.p(u0, 0, z1), W.p(u0, d, z1)][::-1])
        add_poly('plaster', [W.p(u1, 0, zf), W.p(u1, d, zf), W.p(u1, d, z1), W.p(u1, 0, z1)][::-1])
        add_poly('plaster', [W.p(u0, 0, z1), W.p(u1, 0, z1), W.p(u1, d, z1), W.p(u0, d, z1)][::-1])
        add_poly('wood', [W.p((u0 + u1) / 2 - 0.7, d - 0.03, zf), W.p((u0 + u1) / 2 + 0.7, d - 0.03, zf),
                          W.p((u0 + u1) / 2 + 0.7, d - 0.03, zf + 2.4), W.p((u0 + u1) / 2 - 0.7, d - 0.03, zf + 2.4)])   # the door into the room


def _ceil(k, x, y):
    """Ceiling height of storey k at a plan point: the next floor, or the roof in a block's top storey."""
    b = block_at(x, y)
    if b is None:
        return FLZ[k] if k < len(FLZ) else FLZ[-1] + 3.0
    return FLZ[k] if k < b['storeys'] else surf(b, x, y)


def shells():
    """Back and end walls of the open portico rooms and the floors of the upper ones (parts tib_f1w, tib_f2w: the web
    file has no rooms, so without these one would look through a colonnade into the empty block)."""
    for fl, rid in sorted(OPEN_ROOMS):
        r = ROOM[rid]; k = FLN.index(fl) + 1; z0 = FLZ[k - 1]; part(PRE + '_f%dw' % k)
        open_sides = {o['s'] for o in OPENINGS if o['k'] == k and room_at(fl, *_mid_in(o)) is r}
        for s in SIDES:
            if s in open_sides:
                continue
            back = OPP[s] in open_sides
            (ax, ay), (bx, by) = side_line(r, s); L = math.hypot(bx - ax, by - ay); ux, uy = (bx - ax) / L, (by - ay) / L; ox, oy = OUT[s]
            cuts = {0.0, L}
            for q in ROOMS:
                if q['floor'] == fl and q is not r:
                    for cx in (q['x0'], q['x1']):
                        for cy in (q['y0'], q['y1']):
                            if abs((cx - ax) * ox + (cy - ay) * oy) < 1e-6:
                                u = (cx - ax) * ux + (cy - ay) * uy
                                if 1e-6 < u < L - 1e-6:
                                    cuts.add(round(u, 6))
            cuts = sorted(cuts); runs = []
            for u0, u1 in zip(cuts, cuts[1:]):
                um = (u0 + u1) / 2; q = room_at(fl, ax + ux * um + ox * 0.01, ay + uy * um + oy * 0.01)
                if (q is None and not back) or (q is not None and (fl, q['id']) in OPEN_ROOMS):
                    continue
                runs.append([u0, u1])
            for u0, u1 in _union(runs):
                pa = (ax + ux * u0, ay + uy * u0); pb = (ax + ux * u1, ay + uy * u1); i = 0.02
                za = _ceil(k, pa[0] + ux * i - ox * i, pa[1] + uy * i - oy * i); zb = _ceil(k, pb[0] - ux * i - ox * i, pb[1] - uy * i - oy * i)
                if BACK_MAT != 'painted':
                    add_poly(BACK_MAT, [Vector((pb[0], pb[1], z0)), Vector((pa[0], pa[1], z0)), Vector((pa[0], pa[1], za)), Vector((pb[0], pb[1], zb))])
                else:                                # a painted wall: a red dado for the lower third, warm white above, an ochre panel in every bay
                    zl = min(za, zb); zd = z0 + (zl - z0) / 3; Lr = u1 - u0; nb = max(1, int(round(Lr / BAY))); V3 = lambda u, z, off=0.0: Vector((pa[0] + ux * (u - u0) - ox * off, pa[1] + uy * (u - u0) - oy * off, z))
                    add_poly('wallred', [V3(u1, z0), V3(u0, z0), V3(u0, zd), V3(u1, zd)]); add_poly('plaster', [V3(u1, zd), V3(u0, zd), Vector((pa[0], pa[1], za)), Vector((pb[0], pb[1], zb))])
                    for i in range(nb):
                        ca, cb = u0 + Lr * i / nb + 0.45, u0 + Lr * (i + 1) / nb - 0.45
                        if cb - ca > 0.6 and zl - 0.5 - (zd + 0.35) > 0.6:
                            add_poly('ochre', [V3(cb, zd + 0.35, 0.02), V3(ca, zd + 0.35, 0.02), V3(ca, zl - 0.5, 0.02), V3(cb, zl - 0.5, 0.02)])
        if k > 1:
            add_poly('paving', [Vector((r['x0'], r['y0'], z0 + 0.02)), Vector((r['x1'], r['y0'], z0 + 0.02)), Vector((r['x1'], r['y1'], z0 + 0.02)), Vector((r['x0'], r['y1'], z0 + 0.02))])


def _mid_in(o):
    (ax, ay), (bx, by) = side_line(o['b'], o['s']); L = math.hypot(bx - ax, by - ay); um = (o['u0'] + o['u1']) / 2
    return (ax + (bx - ax) / L * um - OUT[o['s']][0] * 0.01, ay + (by - ay) / L * um - OUT[o['s']][1] * 0.01)


def massing(order='column', detail=True, court_mats=None, court_holes=None):
    """Walls, roofs, courts and porticoes of the whole plan."""
    for b in BL:
        block_walls(b, detail)
    for b in BL:
        roof(b)
    courts(court_mats, court_holes); porticoes(order); shells(); recesses()


# ------------------------------------------------------------------ reports and renders
def report():
    rows = ['%-5s %-11s %-2s eaves %-5g top %-5.2f %s' % (b['id'], b['roof'], b['ridge'], b['eaves'], ridge_z(b),
            ' '.join('%s:%s' % (s, k[0] + ('%.1f' % k[1] if k[0] == 'run' else '')) for s, k in sorted(b.get('_ends', {}).items()))) for b in BL]
    return '\n'.join(rows)


def shot(name, out_dir, dvec, el, lo, hi, ortho=True, res=(1600, 1000), margin=1.06, sun=None):
    """One more render of the scene render_previews left: the camera stands in direction dvec (plan) from the box lo..hi,
    `el` degrees up, and frames that box. sun: the direction the light comes from (x, y, z), to light the faces in view."""
    import bpy
    sc = bpy.context.scene; cam = sc.camera; lo = Vector(lo); hi = Vector(hi); ctr = (lo + hi) / 2
    h = math.hypot(dvec[0], dvec[1]) or 1.0
    e = math.radians(el); dv = Vector((dvec[0] / h * math.cos(e), dvec[1] / h * math.cos(e), math.sin(e))).normalized()
    if sun is not None and bpy.data.objects.get('sun'):
        bpy.data.objects['sun'].rotation_euler = (-Vector(sun).normalized()).to_track_quat('-Z', 'Y').to_euler()
    if el > 89.9:
        rt = Vector((1, 0, 0)); up = Vector((0, 1, 0))
    else:
        rt = dv.cross(Vector((0, 0, 1))).normalized(); up = dv.cross(rt).normalized()
    corners = [Vector((x, y, z)) for x in (lo.x, hi.x) for y in (lo.y, hi.y) for z in (lo.z, hi.z)]
    wx = max(abs((c - ctr).dot(rt)) for c in corners) * 2; wy = max(abs((c - ctr).dot(up)) for c in corners) * 2
    sc.render.resolution_x, sc.render.resolution_y = res; asp = res[0] / res[1]
    cam.location = ctr + dv * 600.0
    cam.rotation_euler = (ctr - cam.location).to_track_quat('-Z', 'Y').to_euler() if el <= 89.9 else (0, 0, 0)
    if ortho:
        cam.data.type = 'ORTHO'; cam.data.ortho_scale = max(wx, wy * asp) * margin
    else:
        cam.data.type = 'PERSP'
    cam.data.clip_end = 5000
    sc.render.filepath = os.path.join(out_dir, name + '.png'); bpy.ops.render.render(write_still=True)
    return sc.render.filepath


# ------------------------------------------------------------------ garden furniture (light versions for the web file)
def _prism_up(pts, z0, z1, mat):
    """Extrude a plan polygon (counter-clockwise, may be concave) from z0 to z1: top and sides, no bottom."""
    top = [Vector((x, y, z1)) for x, y in pts]; bot = [Vector((x, y, z0)) for x, y in pts]; n = len(pts)
    add_poly(mat, top)
    for i in range(n):
        j = (i + 1) % n
        add_poly(mat, [bot[i], bot[j], top[j], top[i]])


def niche_pool(x0, y0, x1, y1, z0=0.1, rim=0.4, wall=1.0, niche=1.2, pitch=2.4, seg=6):
    """A basin whose inner wall alternates rectangular and semicircular niches, each `niche` wide. The rim is `rim` high
    over z0; the water stands 0.12 below it. Nothing reaches below z0."""
    d = niche / 2; O = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]; I = [(x0 + wall, y0 + wall), (x1 - wall, y0 + wall), (x1 - wall, y1 - wall), (x0 + wall, y1 - wall)]
    add_poly('paving', [Vector((x0 + 0.2, y0 + 0.2, z0 + 0.02)), Vector((x1 - 0.2, y0 + 0.2, z0 + 0.02)), Vector((x1 - 0.2, y1 - 0.2, z0 + 0.02)), Vector((x0 + 0.2, y1 - 0.2, z0 + 0.02))])
    count = 0
    for k in range(4):                              # one polygon per side: the inner edge with its niches, then the outer edge back
        a, b = I[k], I[(k + 1) % 4]; L = math.hypot(b[0] - a[0], b[1] - a[1]); ux, uy = (b[0] - a[0]) / L, (b[1] - a[1]) / L; ox, oy = uy, -ux
        n = max(1, int((L - niche) / pitch)); u0 = (L - (n - 1) * pitch) / 2; pts = [a]
        for i in range(n):
            uc = u0 + i * pitch; P = lambda u, v: (a[0] + ux * u + ox * v, a[1] + uy * u + oy * v)
            if (i + k) % 2 == 0:
                pts += [P(uc - d, 0), P(uc - d, d), P(uc + d, d), P(uc + d, 0)]
            else:
                pts += [P(uc - d * math.cos(math.pi * q / seg), d * math.sin(math.pi * q / seg)) for q in range(seg + 1)]
            count += 1
        pts += [b, O[(k + 1) % 4], O[k]]
        _prism_up(pts[::-1], z0, z0 + rim, 'marble')
    add_poly('water', [Vector((x0 + 0.25, y0 + 0.25, z0 + rim - 0.12)), Vector((x1 - 0.25, y0 + 0.25, z0 + rim - 0.12)),
                       Vector((x1 - 0.25, y1 - 0.25, z0 + rim - 0.12)), Vector((x0 + 0.25, y1 - 0.25, z0 + rim - 0.12))])
    return count


def oval_pond(cx, cy, rx, ry, z0=0.1, rim=0.35, kerb=0.6, seg=24):
    """An oval pond with a marble kerb; the water stands 0.1 below the kerb's top."""
    E = lambda a, b, z: [Vector((cx + a * math.cos(TAU * i / seg), cy + b * math.sin(TAU * i / seg), z)) for i in range(seg)]
    o0, o1 = E(rx + kerb, ry + kerb, z0), E(rx + kerb, ry + kerb, z0 + rim); i1, i0 = E(rx, ry, z0 + rim), E(rx, ry, z0 + 0.04)
    for i in range(seg):
        j = (i + 1) % seg
        add_poly('marble', [o0[i], o0[j], o1[j], o1[i]]); add_poly('marble', [o1[i], o1[j], i1[j], i1[i]]); add_poly('marble', [i1[i], i1[j], i0[j], i0[i]])
    add_poly('paving', i0); add_poly('water', E(rx, ry, z0 + rim - 0.1))


def figure(x, y, z0, h=2.0, mat='marble', ped=0.9, rot=0.0):
    """A standing figure on a pedestal, light (about 100 triangles)."""
    if ped > 0:
        _box5(None, x, y, z0, h * 0.36, h * 0.36, ped, mat, rot)
    zb = z0 + ped
    cyl(None, x, y, zb, h * 0.17, h * 0.55, mat, 6, r_top=h * 0.11, caps=False)
    cyl(None, x, y, zb + h * 0.55, h * 0.11, h * 0.26, mat, 6, r_top=h * 0.13)
    sphere(None, x, y, zb + h * 0.89, h * 0.075, mat, 6, 4)


def herm(x, y, z0, h=1.6, mat='marble', rot=0.0):
    """A herm: a square pillar with a head."""
    _box5(None, x, y, z0, 0.34, 0.28, h, mat, rot); _box5(None, x, y, z0 + h * 0.72, 0.62, 0.2, 0.12, mat, rot)
    sphere(None, x, y, z0 + h + 0.17, 0.17, mat, 6, 4)


def tholos(cx, cy, z0, R=3.6, n=8, col_h=4.2, plat=0.5, mat='giallo', seg=16):
    """A round garden pavilion: columns on a round platform, a ring beam, a conical tiled roof with a gilt finial."""
    cyl(None, cx, cy, z0, R + 0.5, plat, 'marble', seg, smooth=False)
    for i in range(n):
        a = TAU * (i + 0.5) / n
        column(cx + R * math.cos(a), cy + R * math.sin(a), z0 + plat, col_h, 'corinthian', mat, rot=math.degrees(a))
    ze = z0 + plat + col_h
    cyl(None, cx, cy, ze, R + 0.35, 0.7, 'marble', seg, smooth=False)
    r = R + 0.8; zt = ze + 0.7; h = 2.3; ring = [Vector((cx + r * math.cos(TAU * i / seg), cy + r * math.sin(TAU * i / seg), zt)) for i in range(seg)]; ap = Vector((cx, cy, zt + h))
    for i in range(seg):
        add_poly('tile', [ring[i], ring[(i + 1) % seg], ap])
        m = (ring[i] + ring[(i + 1) % seg]) / 2; q = m + (ap - m) * 0.92
        beam(None, m.x, m.y, m.z + 0.05, q.x, q.y, q.z + 0.05, 0.2, 0.1, 'tile')
        q2 = ring[i] + (ap - ring[i]) * 0.92
        beam(None, ring[i].x, ring[i].y, ring[i].z + 0.05, q2.x, q2.y, q2.z + 0.05, 0.2, 0.1, 'tile')
    add_poly('tile', ring[::-1]); sphere(None, cx, cy, zt + h + 0.25, 0.32, 'gold', 6, 4)
    return zt + h


def bed(x0, y0, x1, y1, z0=0.1, mat='grass', kerb=None, hedge_h=0.0):
    """A planting bed: a raised patch, optionally with a low kerb or a clipped box hedge round it."""
    add_poly(mat, [Vector((x0, y0, z0 + 0.05)), Vector((x1, y0, z0 + 0.05)), Vector((x1, y1, z0 + 0.05)), Vector((x0, y1, z0 + 0.05))])
    if kerb or hedge_h:
        m = kerb or 'hedge'; hh = hedge_h or 0.22; t = 0.3 if kerb else 0.5
        for (cx, cy, sx, sy) in (((x0 + x1) / 2, y0, x1 - x0 + t, t), ((x0 + x1) / 2, y1, x1 - x0 + t, t), (x0, (y0 + y1) / 2, t, y1 - y0 - t), (x1, (y0 + y1) / 2, t, y1 - y0 - t)):
            _box5(None, cx, cy, z0, sx, sy, hh, m)


# ------------------------------------------------------------------ rooms (the parts file only: briefs/rome/tiberiana-v2.md, step 8)
SLABS = []            # (part, room id, material, x0, y0, x1, y1, top z, thickness): each becomes its own object room_<id>
DOOR_W, DOOR_H = 1.6, 2.6
WALL_T = 0.45         # partition walls


def _floor_mat(r):
    t = r['type']
    return 'marble' if t in ('state', 'dining', 'private', 'bath') else 'grass' if t == 'garden' else \
        'paving' if t in ('portico', 'corridor', 'court', 'terrace') else 'travertine'


def _shared(a, b):
    """The line two rooms share: ((x0, y0), (x1, y1)) or None."""
    for x in (a['x1'], a['x0']):
        if abs(x - (b['x0'] if x == a['x1'] else b['x1'])) < 1e-6:
            lo, hi = max(a['y0'], b['y0']), min(a['y1'], b['y1'])
            if hi - lo > 0.3:
                return ((x, lo), (x, hi))
    for y in (a['y1'], a['y0']):
        if abs(y - (b['y0'] if y == a['y1'] else b['y1'])) < 1e-6:
            lo, hi = max(a['x0'], b['x0']), min(a['x1'], b['x1'])
            if hi - lo > 0.3:
                return ((lo, y), (hi, y))
    return None


def _wall_piece(p, q, z0, za, zb, t, mat='plaster'):
    """A wall of thickness t on the line p -> q, from z0 up to za at p and zb at q."""
    L = math.hypot(q[0] - p[0], q[1] - p[1])
    if L < 0.05 or max(za, zb) - z0 < 0.05:
        return
    W = Frame(p[0], p[1], 0.0, math.degrees(math.atan2(q[1] - p[1], q[0] - p[0]))); h = t / 2
    v = [W.p(0, -h, z0), W.p(L, -h, z0), W.p(L, h, z0), W.p(0, h, z0), W.p(0, -h, za), W.p(L, -h, zb), W.p(L, h, zb), W.p(0, h, za)]
    add_mesh(mat, v, [(4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])


def _room_doors(fl, L, open_ids):
    """One door per room: in the middle of the longest wall it shares with a corridor, a portico, a court or a garden;
    if it has none, with its largest neighbour. Returns {(room a id, room b id): [u of the door's middle along their line]}."""
    area = lambda r: (r['x1'] - r['x0']) * (r['y1'] - r['y0']); doors = {}
    for r in L:
        if r['type'] in ('terrace', 'court', 'garden'):
            continue
        cand = [(q, _shared(r, q)) for q in L if q is not r]; cand = [(q, s) for q, s in cand if s]
        cand = [(q, s) for q, s in cand if not (r['type'] == 'portico' and (q['type'] == 'portico' or q['id'] in open_ids))]
        if not cand:
            continue
        ln = lambda s: math.hypot(s[1][0] - s[0][0], s[1][1] - s[0][1])
        pref = [(q, s) for q, s in cand if q['type'] in ('corridor', 'portico', 'court', 'garden')]
        q, s = max(pref, key=lambda c: ln(c[1])) if pref else max(cand, key=lambda c: (area(c[0]), ln(c[1])))
        key = tuple(sorted((r['id'], q['id']))); doors.setdefault(key, [])
        if not doors[key]:
            doors[key].append(ln(s) / 2)
    return doors


def floors_and_rooms():
    """The rooms of every floor: a floor slab per room (its own object, room_<id>), partition walls WALL_T thick between
    rooms up to the ceiling, a door in every room, straight flights in the stair rooms. Open courts and roof terraces have
    their outer walls already; two porticoes that meet have no wall between them. Parts tib_f1r, tib_f2r, tib_f3r."""
    open_ids = set(PLAN['open_courts']); n = dict(rooms=0, walls=0, doors=0, stairs=0)
    for k, fl in enumerate(FLN, 1):
        L = [r for r in ROOMS if r['floor'] == fl]; z0 = FLZ[k - 1]; part(PRE + '_f%dr' % k)
        for r in L:
            SLABS.append((PRE + '_f%d' % k, r['id'], _floor_mat(r), r['x0'], r['y0'], r['x1'], r['y1'], z0 + (0.06 if r['id'] not in open_ids else 0.08), 0.06 if k == 1 else 0.3))
            n['rooms'] += 1
        doors = _room_doors(fl, L, open_ids)
        for i, a in enumerate(L):
            for b in L[i + 1:]:
                s = _shared(a, b)
                if not s:
                    continue
                key = tuple(sorted((a['id'], b['id']))); du = doors.get(key, [])
                (xa, ya), (xb, yb) = s; Ls = math.hypot(xb - xa, yb - ya); ux, uy = (xb - xa) / Ls, (yb - ya) / Ls; nx, ny = -uy, ux
                P = lambda u: (xa + ux * u, ya + uy * u)
                outer = a['id'] in open_ids or b['id'] in open_ids or 'terrace' in (a['type'], b['type'])
                if outer:                          # the block's outer wall stands here: a door is a leaf on its court side
                    for u in du:
                        c = a if (a['id'] in open_ids or a['type'] == 'terrace') else b; mx, my = P(u)
                        sgn = 1.0 if inside(c, mx + nx * 0.1, my + ny * 0.1) else -1.0
                        W = Frame(mx + nx * sgn * 0.05, my + ny * sgn * 0.05, 0.0, math.degrees(math.atan2(uy, ux)))
                        add_poly('wood', [W.p(-DOOR_W / 2, 0, z0), W.p(DOOR_W / 2, 0, z0), W.p(DOOR_W / 2, 0, z0 + DOOR_H), W.p(-DOOR_W / 2, 0, z0 + DOOR_H)]); n['doors'] += 1
                    continue
                if a['type'] == 'portico' and b['type'] == 'portico':
                    continue
                top = lambda u: max(_ceil(k, P(u)[0] + nx * 0.05, P(u)[1] + ny * 0.05), _ceil(k, P(u)[0] - nx * 0.05, P(u)[1] - ny * 0.05))
                za, zb = top(0.02), top(Ls - 0.02); zt = lambda u: za + (zb - za) * u / Ls; cuts = [0.0]
                for u in sorted(du):
                    w = min(DOOR_W, Ls - 0.5); cuts += [u - w / 2, u + w / 2]
                    _wall_piece(P(u - w / 2), P(u + w / 2), z0 + DOOR_H, zt(u - w / 2), zt(u + w / 2), WALL_T)     # the wall over the door (an open doorway, no leaf)
                    n['doors'] += 1
                cuts.append(Ls)
                for u0, u1 in zip(cuts[0::2], cuts[1::2]):
                    _wall_piece(P(u0), P(u1), z0, zt(u0), zt(u1), WALL_T); n['walls'] += 1
        for r in L:                                 # stairs: a straight flight along the room, up to the next floor
            if r['type'] != 'stair' or k >= len(FLZ):
                continue
            xc, yc = (r['x0'] + r['x1']) / 2, (r['y0'] + r['y1']) / 2
            if k > 1 and room_at(FLN[k], xc, yc) is None:
                continue                           # the top landing of the flight below
            w, d = r['x1'] - r['x0'], r['y1'] - r['y0']; wid = min(2.4, min(w, d) - 1.2)
            if w >= d:
                stair_flight(None, r['x0'] + 0.9, yc, r['x1'] - 0.9, yc, z0 + 0.06, FLZ[k], width=wid, mat='travertine', cheek_mat='plaster', cheeks=False)
            else:
                stair_flight(None, xc, r['y0'] + 0.9, xc, r['y1'] - 0.9, z0 + 0.06, FLZ[k], width=wid, mat='travertine', cheek_mat='plaster', cheeks=False)
            n['stairs'] += 1
    return n


def basement(crown=-0.6, ring_h=2.4, seg=8, skip=()):
    """The basement rooms (floor B1) as their own part tib_b1: a slab, walls and a barrel vault along each room; where
    two rooms meet, a corridor opens into its neighbour over the whole shared width, other rooms get a door.
    Bath rooms (type bath, service) lie 1.5 m lower than the corridors."""
    part(PRE + '_b1'); L = [r for r in ROOMS if r['floor'] not in FLN and r['id'] not in skip]; n = 0      # skip: rooms open to the sky (a sunken court)
    for r in L:
        zf = PLAN['levels'][r['floor']] - (1.5 if r['type'] in ('bath', 'service') else 0.0); r['_zf'] = zf
        SLABS.append((PRE + '_b1', r['id'], _floor_mat(r), r['x0'], r['y0'], r['x1'], r['y1'], zf, 0.25)); n += 1
    for r in L:
        zf = r['_zf']; w, d = r['x1'] - r['x0'], r['y1'] - r['y0']; ew = w >= d; span = d if ew else w; rise = span * 0.25; zs = crown - rise
        gaps = {s: [] for s in SIDES}              # openings to the neighbours, per side: (lo, hi, height)
        for q in L:
            s = _shared(r, q) if q is not r else None
            if not s:
                continue
            (xa, ya), (xb, yb) = s; side = 'E' if abs(xa - r['x1']) < 1e-6 and xa == xb else 'W' if abs(xa - r['x0']) < 1e-6 and xa == xb else 'N' if abs(ya - r['y1']) < 1e-6 else 'S'
            lo, hi = (ya, yb) if side in 'EW' else (xa, xb)
            end = (side in 'EW') == ew; lim = (crown - 0.4 - zf) if end else (zs - zf)     # an end wall (under the lunette) can open higher than a side wall
            if 'corridor' in (r['type'], q['type']):
                gaps[side].append((lo + 0.3, hi - 0.3, min(lim, max(zf, q['_zf']) + ring_h - zf)))
            else:
                m = (lo + hi) / 2; gaps[side].append((m - DOOR_W / 2, m + DOOR_W / 2, min(lim, DOOR_H)))
        arc = lambda t: crown - rise + _arc_r(span, rise, t)
        for s in SIDES:                            # the four walls (inner faces), with their openings
            (ax, ay), (bx, by) = side_line(r, s); Ls = math.hypot(bx - ax, by - ay); W = Frame(ax, ay, 0.0, math.degrees(math.atan2(by - ay, bx - ax)))
            end = (s in 'EW') == ew                # an end wall carries the vault's lunette
            us = []
            for lo, hi, hh in gaps[s]:
                u0, u1 = sorted((abs(lo - (ay if s in 'EW' else ax)), abs(hi - (ay if s in 'EW' else ax)))); us.append((u0, u1, hh))
            us.sort(); prev = 0.0
            top = (lambda u: arc(u - Ls / 2)) if end else (lambda u: zs)
            def face(u0, u1, z0):
                if u1 - u0 < 0.02 or (not end and zs - z0 < 0.02):
                    return
                if end:
                    pts = [W.p(u0, 0, z0), W.p(u1, 0, z0)] + [W.p(u1 + (u0 - u1) * i / seg, 0, top(u1 + (u0 - u1) * i / seg)) for i in range(seg + 1)]
                else:
                    pts = [W.p(u0, 0, z0), W.p(u1, 0, z0), W.p(u1, 0, zs), W.p(u0, 0, zs)]
                add_poly('plaster', pts[::-1])
            for u0, u1, hh in us:
                face(prev, u0, zf); face(u0, u1, zf + hh); prev = u1
            face(prev, Ls, zf)
        ends = 'WE' if ew else 'SN'; W0, L0 = _W(r, ends[0]); length = w if ew else d     # the vault, seen from inside
        for i in range(seg):
            ua, ub = span * i / seg, span * (i + 1) / seg
            add_poly('plaster', [W0.p(ua, 0, arc(ua - span / 2)), W0.p(ub, 0, arc(ub - span / 2)), W0.p(ub, length, arc(ub - span / 2)), W0.p(ua, length, arc(ua - span / 2))][::-1], smooth=True)
    return n


def _arc_r(span, rise, t):
    """Height of a segmental arc of the given rise above its springing, t metres from the middle of the span."""
    R = (span * span / 4 + rise * rise) / (2 * rise)
    return math.sqrt(max(0.0, R * R - t * t)) - (R - rise)


# ------------------------------------------------------------------ the parts file (for taking the palace apart, and for Unity)
PART_NAMES = ('tib_base', 'tib_b1', 'tib_garden', 'tib_f1', 'tib_f2', 'tib_f3', 'tib_roof')      # reset by load() for another prefix
WEB_SKIP = ('tib_b1', 'tib_f1r', 'tib_f2r', 'tib_f3r')      # what the web file leaves out: the basement and the rooms


def export_parts(path, rooms=True):
    """Write the same model with its parts kept apart, one object per part: tib_base, tib_b1 (the basement), tib_garden,
    tib_f1, tib_f2, tib_f3, tib_roof. rooms: each storey takes its rooms (tib_f1r, ...: partitions, doors, stairs) and
    has one child object room_<id> per room, its floor slab; without rooms it takes the web file's portico walls
    (tib_f1w, ...) instead. Returns the part objects and their triangle counts (slabs included)."""
    import bpy
    objs = []; counts = {}; by = {}
    for nm in PART_NAMES:
        G = {}
        for src in (nm, nm + ('r' if rooms else 'w')):
            for mat, (V, Fa, Sm) in PARTS.get(src, {}).items():
                g = G.setdefault(mat, [[], [], []]); o = len(g[0])
                g[0].extend(V); g[1].extend(tuple(o + i for i in f) for f in Fa); g[2].extend(Sm)
        _fold(G)
        if not G:
            continue
        _bk._G = G; ob = _bk._build_object(nm); objs.append(ob); by[nm] = ob
        counts[nm] = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    kids = []
    for nm, rid, mat, x0, y0, x1, y1, zt, th in (SLABS if rooms else ()):
        if nm not in by:
            continue
        v = [(x0, y0, zt - th), (x1, y0, zt - th), (x1, y1, zt - th), (x0, y1, zt - th), (x0, y0, zt), (x1, y0, zt), (x1, y1, zt), (x0, y1, zt)]
        me = bpy.data.meshes.new('room_' + rid); me.from_pydata(v, [], [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]); me.update()
        me.materials.append(_bk._make_mat(mat)); ob = bpy.data.objects.new('room_' + rid, me); bpy.context.scene.collection.objects.link(ob)
        ob.parent = by[nm]; kids.append(ob); counts[nm] += 12
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objs + kids:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True, export_yup=True, export_apply=True, export_normals=True,
                              export_texcoords=False, export_materials='EXPORT', export_cameras=False, export_lights=False)
    return objs, counts, len(kids)


def tint_rooms():
    """For the renders only, after the export: colour every room's slab by its type with the plan drawing's colours."""
    import bpy
    for ob in bpy.data.objects:
        r = ROOM.get(ob.name[5:]) if ob.name.startswith('room_') else None
        if r is None:
            continue
        c = PLAN['types'][r['type']]['colour']; nm = 'type_' + r['type']; m = bpy.data.materials.get(nm)
        if m is None:
            m = bpy.data.materials.new(nm); m.use_nodes = True; b = m.node_tree.nodes.get('Principled BSDF')
            b.inputs['Base Color'].default_value = (*_bk._lin(tuple(int(c[i:i + 2], 16) / 255 for i in (1, 3, 5))), 1.0); b.inputs['Roughness'].default_value = 0.8
        ob.data.materials.clear(); ob.data.materials.append(m)


# ------------------------------------------------------------------ the stand-in the page shows until the model arrives
def standin(path, name='tiberiana', base=None, turn=180.0):
    """A light stand-in built from the roof blocks alone: one box per block up to its wall top, a ridge prism on the
    tiled ones, flat roofs flat, the courts open. base: (cx, cy, w, d, depth) of a plain block under it. turn: the page
    places this file turned half round (the old file had its front on -Y)."""
    import bpy
    _bk._G = {}; S = Frame(0.0, 0.0, 0.0, turn); n = 0
    if base:
        cx, cy, w, d, dep = base
        _box5(S, cx, cy, -dep, w, d, dep, 'tuff'); add_poly('paving', [S.p(cx - w / 2, cy - d / 2, 0.03), S.p(cx + w / 2, cy - d / 2, 0.03), S.p(cx + w / 2, cy + d / 2, 0.03), S.p(cx - w / 2, cy + d / 2, 0.03)])
    for b in sorted(BL, key=lambda q: q['_depth']):
        x0, y0, x1, y1 = b['x0'], b['y0'], b['x1'], b['y1']; h = b.get('low', b['eaves']); xc, yc = (x0 + x1) / 2, (y0 + y1) / 2; w, d = x1 - x0, y1 - y0
        _box5(S, xc, yc, 0.0, w, d, h, 'plaster'); t = b['roof']; n += 1
        if t in ('flat', 'vault', 'compluviate'):
            add_poly(SIGNINUM, [S.p(x0, y0, h + 0.03), S.p(x1, y0, h + 0.03), S.p(x1, y1, h + 0.03), S.p(x0, y1, h + 0.03)]); continue
        ew = (b['ridge'] in 'NS') if t == 'lean' else (b['ridge'] == 'EW') if t == 'gable' else w >= d
        half = (d if ew else w) / 2; r = half * PITCH; k = half if t in ('hip', 'pyramid') else 0.0      # hipped: the ridge is shorter by half the span
        if ew:
            a, c = (x0 + k, yc, h + r), (x1 - k, yc, h + r); Q = [((x0, y0, h), (x1, y0, h), c, a), ((x1, y1, h), (x0, y1, h), a, c)]; E = [((x0, y1, h), (x0, y0, h), a), ((x1, y0, h), (x1, y1, h), c)]
        else:
            a, c = (xc, y0 + k, h + r), (xc, y1 - k, h + r); Q = [((x1, y0, h), (x1, y1, h), c, a), ((x0, y1, h), (x0, y0, h), a, c)]; E = [((x0, y0, h), (x1, y0, h), a), ((x1, y1, h), (x0, y1, h), c)]
        for q in Q:
            add_poly('tile', [S.p(*p) for p in q])
        for q in E:
            add_poly('tile' if k else 'plaster', [S.p(*p) for p in q])
    ob = _bk._build_object(name); tr = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active = ob
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True, export_yup=True, export_apply=True, export_normals=True,
                              export_texcoords=False, export_materials='EXPORT', export_cameras=False, export_lights=False)
    ob.hide_render = True
    return n, tr
