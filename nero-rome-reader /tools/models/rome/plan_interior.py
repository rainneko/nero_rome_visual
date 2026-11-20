"""plan_interior · the walkable inside of a palace built from a plan file (briefs/rome/transitoria-interior.md, 七).

Plain Python (no Blender): the inside is boxes and flat polygons only, so it is written straight to a GLB. The palace's web model
(the shell, built by tib_plan.py in Blender) is read, never written: this module looks into it to find where its own faces stand in
the way of a door, and hands the page the boxes of shell faces it replaces (`cuts`, in the GLB node's extras).

  Interior(plan, shell_glb, opts)   read the plan JSON (rooms, roof blocks, doors, vertical) and the shell's triangles
  .build()                          floor slabs (with openings over the stairs), partitions WALL_T thick with real doorways and
                                    arches, the walls of upper rooms over lower roofs, stairs (solid flights, landings), parapets,
                                    a dado by room use; one mesh per material
  .write(path, name)                the GLB (y up: x east, y = model z, z = -model y), node extras {cuts, levels}

Model axes as the plan: x east, y north, z up, z 0 = the ground floor. Levels and heights come from the plan.
"""
import json, math, struct, re

WALL_T = 0.45          # partitions (as tib_plan.WALL_T)
SLAB = 0.06            # floor slabs: top this much over the level (as tib_plan.floors_and_rooms)
SLAB_T = 0.30          # upper slabs' thickness
DADO_H = 0.95          # the dado band, from the floor; under the upper windows' sills (1.0)
LEAN_FALL = 0.24       # tib_plan.LEAN_FALL
VAULT_RISE = 0.30      # tib_plan.VAULT_RISE
ARCH_SEG = 6           # segments of an arched door's head

# colours (linear RGB, about the albedo the page's romeMat gives its stone and plaster); names are the page's material names
MATS = {
    'int_plaster': (0.56, 0.51, 0.42),      # walls, ceilings, parapets
    'int_marble': (0.66, 0.63, 0.57),       # floors: state, art, dining, living rooms, bath
    'int_trav': (0.52, 0.43, 0.29),         # floors: building office, guards; the stairs
    'int_earth': (0.33, 0.22, 0.13),        # floors: servants, stores (beaten-earth coloured tiles)
    'int_paving': (0.38, 0.36, 0.32),       # floors: porticoes, passages, stair halls
    'dado_red': (0.30, 0.035, 0.025),       # 深红: state rooms, living rooms
    'dado_black': (0.025, 0.022, 0.02),     # 黑: picture gallery, library, music, sculpture
    'dado_yellow': (0.56, 0.36, 0.05),      # 黄: dining rooms
    'dado_teal': (0.04, 0.22, 0.19),        # 蓝绿: the bath
    'int_wallred': (0.133, 0.0116, 0.0072), # a portico's back wall where the shell's painted one is cut (the shell's wallred)
}
FLOOR = {'state': 'int_marble', 'art': 'int_marble', 'dining': 'int_marble', 'private': 'int_marble', 'family': 'int_marble', 'bath': 'int_marble',
         'work': 'int_trav', 'guard': 'int_trav', 'service': 'int_earth', 'portico': 'int_paving', 'corridor': 'int_paving', 'stair': 'int_paving',
         'terrace': 'int_paving', 'garden': None, 'court': None}
DADO = {'state': 'dado_red', 'private': 'dado_red', 'family': 'dado_red', 'art': 'dado_black', 'dining': 'dado_yellow', 'bath': 'dado_teal'}


# ------------------------------------------------------------------ the shell, read only
def read_glb(path):
    """Triangles of a GLB in model axes (x east, y north, z up), as a list of (material name, [(x, y, z) * 3])."""
    import numpy as np
    b = open(path, 'rb').read(); jl = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + jl]); bin_ = b[20 + jl + 8:]
    def acc(i):
        a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]; n = {'SCALAR': 1, 'VEC3': 3}[a['type']]
        dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16}[a['componentType']]; off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
        return np.frombuffer(bin_, dtype=dt, count=a['count'] * n, offset=off).reshape(-1, n) if n > 1 else np.frombuffer(bin_, dtype=dt, count=a['count'], offset=off)
    out = []
    for nd in j['nodes']:
        if 'mesh' not in nd: continue
        assert not nd.get('rotation') and not nd.get('scale') and not nd.get('matrix'), 'shell node has a transform'
        t = nd.get('translation', [0, 0, 0])
        for p in j['meshes'][nd['mesh']]['primitives']:
            P = acc(p['attributes']['POSITION']).astype(np.float64) + t; I = acc(p['indices']).reshape(-1, 3)
            M = np.stack([P[:, 0], -P[:, 2], P[:, 1]], axis=1)          # glTF y up -> model z up
            out.append((j['materials'][p['material']]['name'], M[I]))
    return out


class Interior:
    def __init__(self, plan, shell_glb, low=None, outer_doors=None, keep_shell_floor=(), no_slab=(), skip_rooms=()):
        """low: {block id: low edge} of lean-to roofs the palace script sets (opts 'low'); outer_doors: {feature id: width} (the
        palace script's DOORS) where the dado on the outer wall breaks; keep_shell_floor: upper portico rooms whose floor the shell
        has (shells()) and keeps; no_slab: rooms that get no floor slab (terraces: the shell's flat roof is their floor);
        skip_rooms: rooms not built at all this round."""
        self.plan = plan; self.R = {r['id']: r for r in plan['rooms']}; self.L = plan['levels']; self.HT = plan['floor_heights']
        self.FLN = sorted((k for k, z in self.L.items() if z >= 0), key=lambda k: self.L[k]); self.FLZ = [self.L[k] for k in self.FLN]
        X, Y = plan['size'][0] / 2, plan['size'][1] / 2; self.ENV = (-X, -Y, X, Y)
        self.BL = [dict(b) for b in plan['roof_blocks']]; self.BK = {b['id']: b for b in self.BL}; self.PITCH = plan['roof_pitch']; low = low or {}
        for b in self.BL:
            d = 0; q = b
            while q.get('over'):
                q = self.BK[q['over']]; d += 1
            b['_depth'] = d
            if b['roof'] == 'lean':
                m = re.search(r'檐口\s*([0-9.]+)', b.get('note', '')); D = (b['y1'] - b['y0']) if b['ridge'] in 'NS' else (b['x1'] - b['x0'])
                b['low'] = low.get(b['id'], float(m.group(1)) if m else round(b['eaves'] - D * LEAN_FALL, 2))
            if b['roof'] == 'vault' and not b['ridge']:
                b['ridge'] = 'EW' if b['x1'] - b['x0'] > b['y1'] - b['y0'] else 'NS'
        self.OPEN = set(plan['open_courts']); self.DOORS = plan['doors']; self.V = plan['vertical']
        self.outer_doors = outer_doors or {}; self.keep_shell_floor = set(keep_shell_floor); self.no_slab = set(no_slab); self.skip = set(skip_rooms)
        self.G = {m: ([], []) for m in MATS}          # material -> (positions, normals) of loose triangles
        self.cuts = []; self.report = {}
        self.shell = read_glb(shell_glb) if shell_glb else []
        if self.shell:
            import numpy as np
            self.TRI = np.concatenate([t for _, t in self.shell]); self.TMAT = sum(([m] * len(t) for m, t in self.shell), [])
            self.TLO = self.TRI.min(axis=1); self.THI = self.TRI.max(axis=1)

    # ---------------------------------------------------------------- roofs (as tib_plan.surf)
    def block_at(self, x, y):
        hit = None
        for b in self.BL:
            if b['x0'] < x < b['x1'] and b['y0'] < y < b['y1'] and (hit is None or b['_depth'] > hit['_depth']): hit = b
        return hit

    def surf(self, b, x, y):
        e = b['eaves']; t = b['roof']
        dist = lambda s: {'S': y - b['y0'], 'N': b['y1'] - y, 'W': x - b['x0'], 'E': b['x1'] - x}[s]
        if t in ('gable', 'hip', 'pyramid'):
            hips = 'SENW' if t == 'pyramid' else ('WE' if b['ridge'] == 'EW' else 'SN') if t == 'hip' else ''
            sides = 'SENW' if t == 'pyramid' else ('SN' if b['ridge'] == 'EW' else 'WE') + hips
            return e + self.PITCH * max(0.0, min(dist(s) for s in sides))
        if t == 'lean':
            lo = b['ridge']; D = (b['y1'] - b['y0']) if lo in 'NS' else (b['x1'] - b['x0'])
            return b['low'] + (e - b['low']) * min(1.0, max(0.0, dist(lo) / D))
        if t == 'vault':
            span = (b['y1'] - b['y0']) if b['ridge'] == 'EW' else (b['x1'] - b['x0']); tt = (y - (b['y0'] + b['y1']) / 2) if b['ridge'] == 'EW' else (x - (b['x0'] + b['x1']) / 2)
            r = VAULT_RISE * span; Rr = (span * span / 4 + r * r) / (2 * r)
            return e + math.sqrt(max(0.0, Rr * Rr - tt * tt)) - (Rr - r)
        return e

    def ceil(self, k, x, y):
        """The ceiling of storey k (1-based) at a plan point: the next floor, or in a block's top storey its roof."""
        b = self.block_at(x, y)
        for dx, dy in ((0.03, 0.03), (-0.03, 0.03), (0.03, -0.03), (-0.03, -0.03)):   # on a block's edge: the block just beside
            if b is None: b = self.block_at(x + dx, y + dy)
        if b is None: return self.FLZ[min(k, len(self.FLZ) - 1)] + 3.0
        if k < b['storeys'] and k < len(self.FLZ): return self.FLZ[k]
        if k < len(self.FLZ) and any(r['floor'] == self.FLN[k] and r['x0'] <= x <= r['x1'] and r['y0'] <= y <= r['y1'] for r in self.plan['rooms']):
            return min(self.FLZ[k], self.surf(b, x, y))      # a room of the floor above stands here (2S04 over the south porch): its floor caps the storey
        return self.surf(b, x, y)

    def breaks(self, ax, c, lo, hi):
        """Stations along a wall line (ax 'x': the line x = c, stations in y; 'y': y = c, stations in x) where a roof over it may
        change slope: block edges, ridges, hip lines; for vaults a few more."""
        us = {lo, hi}
        for b in self.BL:
            a0, a1 = (b['y0'], b['y1']) if ax == 'x' else (b['x0'], b['x1']); w = min(b['x1'] - b['x0'], b['y1'] - b['y0']) / 2
            cand = [a0, a1, (a0 + a1) / 2, a0 + w, a1 - w]
            if b['roof'] == 'vault': cand += [a0 + (a1 - a0) * i / 8 for i in range(1, 8)]
            for u in cand:
                if lo + 1e-6 < u < hi - 1e-6: us.add(round(u, 6))
        return sorted(us)

    # ---------------------------------------------------------------- geometry
    def tri(self, m, a, b, c):
        n = ((b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]))
        l = math.sqrt(n[0] ** 2 + n[1] ** 2 + n[2] ** 2)
        if l < 1e-9: return
        n = (n[0] / l, n[1] / l, n[2] / l); P, N = self.G[m]
        for p in (a, b, c): P.append(p); N.append(n)

    def quad(self, m, a, b, c, d, want=None):
        """A planar quad a-b-c-d; want: the direction its front should face (the order is turned round if it faces away)."""
        if want is not None:
            n = ((b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]))
            if n[0] * want[0] + n[1] * want[1] + n[2] * want[2] < 0: a, b, c, d = d, c, b, a
        self.tri(m, a, b, c); self.tri(m, a, c, d)

    def hrect(self, m, x0, y0, x1, y1, z, up=True):
        if x1 - x0 < 1e-4 or y1 - y0 < 1e-4: return
        self.quad(m, (x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z), (0, 0, 1 if up else -1))

    def box(self, m, x0, y0, x1, y1, z0, z1, faces='tnsew'):
        """An axis box; faces: t top, b bottom, n s e w sides."""
        if 't' in faces: self.hrect(m, x0, y0, x1, y1, z1)
        if 'b' in faces: self.hrect(m, x0, y0, x1, y1, z0, up=False)
        if 's' in faces: self.quad(m, (x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1), (0, -1, 0))
        if 'n' in faces: self.quad(m, (x1, y1, z0), (x0, y1, z0), (x0, y1, z1), (x1, y1, z1), (0, 1, 0))
        if 'e' in faces: self.quad(m, (x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1), (1, 0, 0))
        if 'w' in faces: self.quad(m, (x0, y1, z0), (x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (-1, 0, 0))

    def P(self, ax, c, u, off, z):
        """A point on a wall line: station u along it, off across it (+ = the higher x / y side), height z."""
        return (c + off, u, z) if ax == 'x' else (u, c + off, z)

    def vface(self, m, ax, c, off, u0, u1, z0a, z0b, z1a, z1b, side):
        """A vertical face in the plane `off` across the line, from u0 to u1, bottom z0a..z0b, top z1a..z1b; side +1 faces the
        higher x / y side, -1 the lower."""
        if u1 - u0 < 1e-4 or (z1a - z0a < 1e-4 and z1b - z0b < 1e-4): return
        a, b, cc, d = self.P(ax, c, u0, off, z0a), self.P(ax, c, u1, off, z0b), self.P(ax, c, u1, off, z1b), self.P(ax, c, u0, off, z1a)
        self.quad(m, a, b, cc, d, self.P(ax, 0, 0, side, 0))

    def endface(self, m, ax, c, u, o0, o1, z0, z1, side):
        """The end of a wall (a door jamb): the face across the line at station u, from offset o0 to o1, facing +u (side +1) or -u."""
        if z1 - z0 < 1e-4: return
        a, b, cc, d = self.P(ax, c, u, o0, z0), self.P(ax, c, u, o1, z0), self.P(ax, c, u, o1, z1), self.P(ax, c, u, o0, z1)
        self.quad(m, a, b, cc, d, self.P(ax, 0, side, 0, 0))

    def wall(self, ax, c, u0, u1, z0, top, o0=-WALL_T / 2, o1=WALL_T / 2, ends=(True, True), dado=(None, None), zd=None, mat='int_plaster', face=(None, None)):
        """A wall run on a line: from u0 to u1, thickness o0..o1 across the line, bottom z0, top(u) a function (sampled at the run's
        breaks); dado (material on the -side, on the +side) DADO_H high from zd (default z0); face: the -side's and +side's own material."""
        us = [u0] + [u for u in self.breaks(ax, c, u0, u1) if u0 < u < u1] + [u1]; zd = z0 if zd is None else zd
        for a, b in zip(us, us[1:]):
            ta, tb = top(a), top(b)
            self.vface(face[0] or mat, ax, c, o0, a, b, z0, z0, ta, tb, -1); self.vface(face[1] or mat, ax, c, o1, a, b, z0, z0, ta, tb, +1)
            pa0, pb0, pb1, pa1 = self.P(ax, c, a, o0, ta), self.P(ax, c, b, o0, tb), self.P(ax, c, b, o1, tb), self.P(ax, c, a, o1, ta)
            self.quad(mat, pa0, pb0, pb1, pa1, (0, 0, 1))
        if ends[0]: self.endface(mat, ax, c, u0, o0, o1, z0, top(u0), -1)
        if ends[1]: self.endface(mat, ax, c, u1, o0, o1, z0, top(u1), +1)
        for side, dm in ((-1, dado[0]), (1, dado[1])):
            if dm and u1 - u0 > 0.05:
                off = (o0 - 0.006) if side < 0 else (o1 + 0.006)
                self.vface(dm, ax, c, off, u0, u1, zd, zd, zd + DADO_H, zd + DADO_H, side)

    def head(self, ax, c, u0, u1, zs, top, o0, o1, arch, dado=(None, None)):
        """The wall over a door from u0 to u1: a flat lintel at zs, or an arch springing at zs (semicircle of the door's width)."""
        ta, tb = top(u0), top(u1); zt = min(ta, tb)
        if zs >= zt - 0.02: return
        if not arch:
            for off, side in ((o0, -1), (o1, 1)): self.vface('int_plaster', ax, c, off, u0, u1, zs, zs, ta, tb, side)
            a, b, cc, d = self.P(ax, c, u0, o0, zs), self.P(ax, c, u1, o0, zs), self.P(ax, c, u1, o1, zs), self.P(ax, c, u0, o1, zs)
            self.quad('int_plaster', a, b, cc, d, (0, 0, -1))                  # the soffit faces down
        else:
            r = (u1 - u0) / 2; um = (u0 + u1) / 2
            pts = [(um - r * math.cos(math.pi * i / ARCH_SEG), zs + r * math.sin(math.pi * i / ARCH_SEG)) for i in range(ARCH_SEG + 1)]
            tops = lambda u: ta + (tb - ta) * (u - u0) / (u1 - u0)
            for (ua, za), (ub, zb) in zip(pts, pts[1:]):
                for off, side in ((o0, -1), (o1, 1)): self.vface('int_plaster', ax, c, off, ua, ub, za, zb, tops(ua), tops(ub), side)
                a, b, cc, d = self.P(ax, c, ua, o0, za), self.P(ax, c, ub, o0, zb), self.P(ax, c, ub, o1, zb), self.P(ax, c, ua, o1, za)
                um2 = (ua + ub) / 2 - um; zm = (za + zb) / 2 - zs                  # the soffit faces the arch's centre
                self.quad('int_plaster', a, b, cc, d, self.P(ax, 0, -um2, 0, -zm))
        p0, p1, p2, p3 = self.P(ax, c, u0, o0, ta), self.P(ax, c, u1, o0, tb), self.P(ax, c, u1, o1, tb), self.P(ax, c, u0, o1, ta)
        self.quad('int_plaster', p0, p1, p2, p3, (0, 0, 1))

    # ---------------------------------------------------------------- the plan's walls
    def shared(self, a, b):
        if a['floor'] != b['floor']: return None
        for x in (a['x1'], a['x0']):
            if x == (b['x0'] if x == a['x1'] else b['x1']):
                lo, hi = max(a['y0'], b['y0']), min(a['y1'], b['y1'])
                if hi > lo: return ('x', x, lo, hi)
        for y in (a['y1'], a['y0']):
            if y == (b['y0'] if y == a['y1'] else b['y1']):
                lo, hi = max(a['x0'], b['x0']), min(a['x1'], b['x1'])
                if hi > lo: return ('y', y, lo, hi)
        return None

    def kfl(self, fl): return self.FLN.index(fl) + 1

    def side_ceil(self, r, ax, c, u, side):
        """The ceiling of room r just on one side of a wall line (inf for an open court or a terrace)."""
        if r['id'] in self.OPEN or r['type'] in ('terrace', 'garden', 'court'): return 1e9
        x, y = self.P(ax, c, u, side * 0.05, 0)[:2]
        return self.ceil(self.kfl(r['floor']), x, y)

    def shell_hits(self, lo, hi):
        """Shell triangles meeting the box lo..hi (model axes): their indices."""
        import numpy as np
        if not self.shell: return []
        lo = np.array(lo); hi = np.array(hi)
        cand = np.where(np.all(self.THI >= lo, axis=1) & np.all(self.TLO <= hi, axis=1))[0]; out = []
        for i in cand:                                   # sample each candidate's surface (5 cm): is a point inside?
            A, B, C = self.TRI[i]; L = max(np.linalg.norm(B - A), np.linalg.norm(C - B), np.linalg.norm(A - C)); n = min(400, max(2, int(L / 0.05)))
            uu, vv = np.meshgrid(np.arange(n + 1), np.arange(n + 1)); k = (uu + vv) <= n; uu, vv = uu[k] / n, vv[k] / n
            Q = A + np.outer(uu, B - A) + np.outer(vv, C - A)
            if np.any(np.all((Q >= lo) & (Q <= hi), axis=1)): out.append(int(i))
        return out

    def inside_box(self, lo, hi):
        import numpy as np
        return [int(i) for i in np.where(np.all(self.TLO >= np.array(lo) - 1e-6, axis=1) & np.all(self.THI <= np.array(hi) + 1e-6, axis=1))[0]]

    def build(self):
        P = self.P; R = self.R; rooms = [r for r in self.plan['rooms'] if r['floor'] in self.FLN and r['id'] not in self.skip]
        door_on = {}
        for d in self.DOORS:
            if d['floor'] in self.FLN: door_on.setdefault(tuple(sorted((d['a'], d['b']))), []).append(d)
        open_pair = {k for k, v in door_on.items() if any(d['kind'] == 'open' for d in v)}
        # ---- the wall lines: every shared side of two rooms of a floor, unless it is open (a portico's colonnade)
        lines = []
        for i, a in enumerate(rooms):
            for b in rooms[i + 1:]:
                s = self.shared(a, b)
                if not s: continue
                key = tuple(sorted((a['id'], b['id'])))
                if key in open_pair or (a['type'] == 'portico' and b['type'] == 'portico') or (a['id'] in self.OPEN or b['id'] in self.OPEN): continue
                ax, c, lo, hi = s; lw, hg = (a, b) if (a['x0'] < c if ax == 'x' else a['y0'] < c) else (b, a)      # lw: the room on the lower side
                lines.append(dict(fl=a['floor'], ax=ax, c=c, lo=lo, hi=hi, neg=lw, pos=hg, doors=sorted(door_on.get(key, []), key=lambda d: d['y'] if ax == 'x' else d['x'])))
        # ---- upper rooms over lower roofs (and the attic beside a top-storey room): their own wall on the open edge
        for r in rooms:
            if r['floor'] == self.FLN[0] or r['type'] in ('portico', 'terrace', 'garden', 'court') or r['id'] in self.skip: continue
            k = self.kfl(r['floor']); zf = self.FLZ[k - 1]
            for ax, c, lo, hi, side in (('y', r['y0'], r['x0'], r['x1'], -1), ('y', r['y1'], r['x0'], r['x1'], 1), ('x', r['x0'], r['y0'], r['y1'], -1), ('x', r['x1'], r['y0'], r['y1'], 1)):
                if c in (self.ENV[0], self.ENV[2]) and ax == 'x' or c in (self.ENV[1], self.ENV[3]) and ax == 'y': continue
                taken = []
                for q in self.plan['rooms']:
                    s = self.shared(r, q) if q is not r else None
                    if s and s[0] == ax and s[1] == c: taken.append((s[2], s[3]))
                free = [(lo, hi)]
                for a0, a1 in taken:
                    free = [iv for f in free for iv in ((f[0], min(f[1], a0)), (max(f[0], a1), f[1])) if iv[1] - iv[0] > 0.05]
                for u0, u1 in free:
                    um = (u0 + u1) / 2; x, y = P(ax, c, um, side * 0.05, 0)[:2]; nb = self.block_at(x, y); own = self.block_at(*P(ax, c, um, -side * 0.05, 0)[:2])
                    if nb is not None and nb is not own and max(self.surf(nb, *P(ax, c, u, side * 0.05, 0)[:2]) for u in (u0 + 0.01, um, u1 - 0.01)) <= zf + SLAB + 0.05:
                        continue                         # the shell's face of this block starts at the floor or lower
                    lines.append(dict(fl=r['floor'], ax=ax, c=c, lo=u0, hi=u1, neg=r if side > 0 else None, pos=r if side < 0 else None, doors=[], void=side, nb=nb, own=own))
        # ---- shell faces in a door's way: cut them (the page hides them while the inside shows) and build the wall in their place
        nwall = ndoor = 0; blocked = []
        runs = {}
        for Ln in lines: runs.setdefault((Ln['fl'], Ln['ax'], Ln['c']), []).append(Ln)
        for Ln in lines:
            k = self.kfl(Ln['fl']); zf = self.FLZ[k - 1]; z0 = zf + SLAB; ax, c = Ln['ax'], Ln['c']
            if 'void' in Ln:
                sd = Ln['void']; nb, own = Ln['nb'], Ln['own']
                def top(u, sd=sd, nb=nb, own=own, k=k, ax=ax, c=c, lo=Ln['lo'], hi=Ln['hi']):
                    u = min(max(u, lo + 0.03), hi - 0.03)        # at the run's own ends, not the next block's
                    x, y = P(ax, c, u, -sd * 0.05, 0)[:2]; t = self.ceil(k, x, y)
                    if nb is not None and nb is not own: t = min(t, max(z0 + 0.3, self.surf(nb, *P(ax, c, u, sd * 0.05, 0)[:2])))
                    return t - 0.02
            else:
                def top(u, Ln=Ln, ax=ax, c=c):
                    u = min(max(u, Ln['lo'] + 0.03), Ln['hi'] - 0.03)
                    return min(self.side_ceil(Ln['neg'], ax, c, u, -1), self.side_ceil(Ln['pos'], ax, c, u, 1)) - 0.02
            Ln['top'] = top; Ln['z0'] = z0; Ln['o'] = [-WALL_T / 2, WALL_T / 2]
            for d in Ln['doors']:
                u = d['y'] if ax == 'x' else d['x']; hw = d['w'] / 2
                # the clear opening, less a 15 cm threshold (the shell's string courses at a floor level, as the east tower's
                # travertine band at 6.82-7.18, are left as a sill) and 10 cm under the head
                lo, hi = P(ax, c, u - hw + 0.05, -0.5, z0 + 0.15), P(ax, c, u + hw - 0.05, 0.5, z0 + d['h'] - 0.1)
                lo, hi = [min(p, q) for p, q in zip(lo, hi)], [max(p, q) for p, q in zip(lo, hi)]
                d['_box'] = (lo, hi); d['_hits'] = self.shell_hits(lo, hi)
        # every shell face a door meets is cut whole, with whatever else lies wholly in the box round those faces (on that line:
        # the painted back walls of the porticoes, windows that become doors); boxes on one line that overlap are merged
        import numpy as np
        boxes = {}
        for Ln in lines:
            for d in Ln['doors']:
                if not d['_hits']: continue
                T = self.TRI[d['_hits']].reshape(-1, 3)
                boxes.setdefault((Ln['fl'], Ln['ax'], Ln['c']), []).append([(T.min(axis=0) - 0.03).tolist(), (T.max(axis=0) + 0.03).tolist(), [d]])
        for key, bl in boxes.items():
            fl, ax, c = key; merged = True
            while merged:
                merged = False
                for i in range(len(bl)):
                    for j in range(i + 1, len(bl)):
                        A, B = bl[i], bl[j]
                        if all(A[0][q] <= B[1][q] and B[0][q] <= A[1][q] for q in range(3)):
                            bl[i] = [[min(A[0][q], B[0][q]) for q in range(3)], [max(A[1][q], B[1][q]) for q in range(3)], A[2] + B[2]]; del bl[j]; merged = True; break
                    if merged: break
            for lo, hi, ds in bl:
                gone = self.inside_box(lo, hi); gset = set(gone)
                ua, ub = (lo[1], hi[1]) if ax == 'x' else (lo[0], hi[0])
                self.cuts.append(dict(fl=fl, line='%s=%g' % (ax, c), u=[round(ua, 2), round(ub, 2)], box=[round(v, 3) for v in lo + hi], tris=len(gone), mats=sorted({self.TMAT[i] for i in gone})))
                members = [Ln for Ln in runs[key] if Ln['hi'] > ua and Ln['lo'] < ub]
                offs = [(t[:, 0] if ax == 'x' else t[:, 1]) - c for t in self.TRI[gone]]
                omin = min(float(o.min()) for o in offs); omax = max(float(o.max()) for o in offs)
                for Ln in members:                       # the wall that takes the shell's place covers what was cut
                    Ln['o'] = [min(Ln['o'][0], omin - 0.03), max(Ln['o'][1], omax + 0.03)]; Ln['cut'] = True
                    zc = [float(t[:, 2].max()) for t in self.TRI[gone] if (t[:, 1] if ax == 'x' else t[:, 0]).max() > Ln['lo'] and (t[:, 1] if ax == 'x' else t[:, 0]).min() < Ln['hi']]
                    if zc and 'neg' in Ln and Ln['neg'] and Ln['pos']: Ln['skin'] = max(Ln.get('skin', 0.0), max(zc))
                for d in ds:
                    rest = [i for i in d['_hits'] if i not in gset]
                    if rest: blocked.append((d['id'], sorted({self.TMAT[i] for i in rest}), len(rest)))
                self._cover_check(gone, members, ax, c)
        for Ln in lines:                                  # doors through no cut: is the shell clear there?
            for d in Ln['doors']:
                if d['kind'] != 'open' and d['_hits'] and not Ln.get('cut'): blocked.append((d['id'], 'shell face, not cut', len(d['_hits'])))
        self.report['blocked'] = blocked
        # ---- build the walls
        for Ln in lines:
            ax, c, z0, top, (o0, o1) = Ln['ax'], Ln['c'], Ln['z0'], Ln['top'], Ln['o']
            dn = DADO.get(Ln['neg']['type']) if Ln['neg'] else None; dp = DADO.get(Ln['pos']['type']) if Ln['pos'] else None
            red = lambda r: 'int_wallred' if Ln.get('cut') and r and r['type'] == 'portico' else None
            face = (red(Ln['neg']), red(Ln['pos']))
            cuts = []
            for d in Ln['doors']:
                if d['kind'] == 'open': continue
                u = d['y'] if ax == 'x' else d['x']; cuts.append((u - d['w'] / 2, u + d['w'] / 2, d))
            s = Ln['lo']; pieces = []
            for a, b, d in cuts:
                pieces.append((s, a)); s = b
            pieces.append((s, Ln['hi']))
            for i, (a, b) in enumerate(pieces):
                self.wall(ax, c, a, b, z0, top, o0, o1, ends=(i > 0, i < len(pieces) - 1), dado=(dn, dp), face=face); nwall += 1
            if Ln.get('skin'):
                us = self.breaks(ax, c, Ln['lo'], Ln['hi']); zb = min(top(u) for u in us) - 0.01
                sides = {self.skin_top(Ln, u)[1] for u in us}
                for sd in sides:
                    st = lambda u, sd=sd: (self.skin_top(Ln, u)[0] if self.skin_top(Ln, u)[1] == sd else zb)
                    if max(st(u) for u in us) > zb + 0.05:
                        self.wall(ax, c, Ln['lo'], Ln['hi'], zb, st, *((o0, 0.0) if sd < 0 else (0.0, o1)), face=face); nwall += 1
            for a, b, d in cuts:
                zs = z0 + d['h'] - (d['w'] / 2 if d['kind'] == 'arch' else 0.0)
                self.head(ax, c, a, b, zs, top, o0, o1, d['kind'] == 'arch'); ndoor += 1
        # ---- floor slabs (with openings over the stairs)
        holes = {}
        for v in self.V:
            if v.get('built', True) and v.get('hole'): holes.setdefault(v['to'], []).append(v['hole'])
        nslab = 0
        for r in rooms:
            if r['id'] in self.no_slab or r['id'] in self.keep_shell_floor or FLOOR.get(r['type']) is None: continue
            k = self.kfl(r['floor']); zf = self.FLZ[k - 1]; zt = zf + SLAB; m = FLOOR[r['type']]
            rects = [(r['x0'], r['y0'], r['x1'], r['y1'])]
            for h in holes.get(r['id'], []):
                nxt = []
                for x0, y0, x1, y1 in rects:
                    if h['x1'] <= x0 or h['x0'] >= x1 or h['y1'] <= y0 or h['y0'] >= y1: nxt.append((x0, y0, x1, y1)); continue
                    nxt += [(x0, y0, x1, h['y0']), (x0, h['y1'], x1, y1), (x0, max(y0, h['y0']), h['x0'], min(y1, h['y1'])), (h['x1'], max(y0, h['y0']), x1, min(y1, h['y1']))]
                rects = [q for q in nxt if q[2] - q[0] > 1e-4 and q[3] - q[1] > 1e-4]
                if k > 1:                                 # the opening's edges
                    hc = ((h['x0'] + h['x1']) / 2, (h['y0'] + h['y1']) / 2)
                    for (pa, pb) in (((h['x0'], h['y0']), (h['x1'], h['y0'])), ((h['x1'], h['y0']), (h['x1'], h['y1'])), ((h['x1'], h['y1']), (h['x0'], h['y1'])), ((h['x0'], h['y1']), (h['x0'], h['y0']))):
                        mid = ((pa[0] + pb[0]) / 2 - hc[0], (pa[1] + pb[1]) / 2 - hc[1], 0)    # faces into the opening
                        self.quad('int_plaster', (pa[0], pa[1], zt - SLAB_T), (pb[0], pb[1], zt - SLAB_T), (pb[0], pb[1], zt), (pa[0], pa[1], zt), (-mid[0], -mid[1], 0))
            for x0, y0, x1, y1 in rects:
                self.hrect(m, x0, y0, x1, y1, zt)
                if k > 1: self.hrect('int_plaster', x0, y0, x1, y1, zt - SLAB_T, up=False)       # the ceiling of the room below
            nslab += 1
        # ---- dado on the outer walls (the shell's inner face: plain wall at the line, a skin with openings 0.36 inside)
        self.outer_dado(rooms)
        # ---- stairs
        nfl = 0
        for v in self.V:
            if not v.get('built', True) or v['kind'] != 'stair': continue
            base = self.L[self.R[v['room']]['floor']] + SLAB
            for f in v['flights']: self.flight(f, base); nfl += 1
            for L in v['landings']: self.box('int_trav', L['x0'], L['y0'], L['x1'], L['y1'], base, L['z'])
            zu = self.L[self.R[v['to']]['floor']] + SLAB
            for q in v['rails']: self.box('int_plaster', q[0], q[1], q[2], q[3], zu, zu + 1.5)
        self.report.update(walls=nwall, doors=ndoor, slabs=nslab, flights=nfl, lines=len(lines), cuts=len(self.cuts))
        return self

    def skin_top(self, Ln, u):
        """Over a cut line the shell's face may rise above the lower room's ceiling, up to the higher room's (the porticoes' back walls
        over the lean-to roofs of the rooms behind): a skin on the higher side, from the wall's top to there."""
        if not Ln.get('skin'): return None
        u = min(max(u, Ln['lo'] + 0.03), Ln['hi'] - 0.03)
        hn, hp = self.side_ceil(Ln['neg'], Ln['ax'], Ln['c'], u, -1), self.side_ceil(Ln['pos'], Ln['ax'], Ln['c'], u, 1)
        return min(max(hn, hp) - 0.02, Ln['skin']), (-1 if hn > hp else 1)

    def _cover_check(self, gone, members, ax, c):
        """Every shell triangle cut must lie inside the wall built in its place (or in the line's u range and under its top)."""
        bad = 0
        for i in gone:
            t = self.TRI[i]; us = t[:, 1] if ax == 'x' else t[:, 0]; zs = t[:, 2]
            ok = False
            for Ln in members:
                if us.min() >= Ln['lo'] - 0.05 and us.max() <= Ln['hi'] + 0.05:
                    tops = [max(Ln['top'](float(u)), (self.skin_top(Ln, float(u)) or (0,))[0]) for u in us]
                    if all(z <= tp + 0.08 for z, tp in zip(zs, tops)) and zs.min() >= Ln['z0'] - 0.12: ok = True; break
            if not ok:
                lo_all = min(Ln['lo'] for Ln in members); hi_all = max(Ln['hi'] for Ln in members)
                if us.min() >= lo_all - 0.05 and us.max() <= hi_all + 0.05:
                    tops = [max(max(Ln['top'](float(u)), (self.skin_top(Ln, float(u)) or (0,))[0]) for Ln in members if Ln['lo'] - 0.05 <= u <= Ln['hi'] + 0.05) for u in us]
                    ok = all(z <= tp + 0.08 for z, tp in zip(zs, tops))
            if not ok:
                bad += 1; self.report.setdefault('uncovered_tris', []).append((self.TMAT[i], [[round(float(v), 2) for v in q] for q in t]))
        self.report.setdefault('uncovered', 0); self.report['uncovered'] += bad

    def outer_dado(self, rooms):
        X0, Y0, X1, Y1 = self.ENV; n = 0
        for r in rooms:
            dm = DADO.get(r['type'])
            if not dm or r['type'] in ('portico',): continue
            k = self.kfl(r['floor']); zf = self.FLZ[k - 1] + SLAB
            for ax, c, lo, hi, side in (('y', Y0, r['x0'], r['x1'], 1), ('y', Y1, r['x0'], r['x1'], -1), ('x', X0, r['y0'], r['y1'], 1), ('x', X1, r['y0'], r['y1'], -1)):
                if (r['y0'] if ax == 'y' and side > 0 else r['y1'] if ax == 'y' else r['x0'] if side > 0 else r['x1']) != c: continue
                # the shell's innermost face along this edge, in pieces between the roof blocks' edges
                us = self.breaks(ax, c, lo, hi)
                for a, b in zip(us, us[1:]):
                    a2, b2 = a + (0.3 if a == lo else 0.0), b - (0.3 if b == hi else 0.0)
                    if b2 - a2 < 0.2: continue
                    plo = self.P(ax, c, a2, 0 if side > 0 else -0.6, zf + 0.1); phi = self.P(ax, c, b2, 0.6 if side > 0 else 0, zf + DADO_H)
                    lo3 = [min(p, q) for p, q in zip(plo, phi)]; hi3 = [max(p, q) for p, q in zip(plo, phi)]
                    hits = self.shell_hits(lo3, hi3)
                    offs = []
                    for i in hits:
                        t = self.TRI[i]; o = (t[:, 0] if ax == 'x' else t[:, 1]) - c
                        if o.max() - o.min() < 0.01 and (t[:, 2].max() - t[:, 2].min()) > 0.3: offs.append(float(o.mean()) * side)
                    if not offs: continue
                    inner = max(offs) + 0.006
                    gaps = []
                    for fid, w in self.outer_doors.items():
                        f = next((q for q in self.plan['features'] if q['id'] == fid), None)
                        if f is None or (f['x'] if ax == 'x' else f['y']) != c: continue
                        u = f['y'] if ax == 'x' else f['x']; gaps.append((u - w / 2 - 0.05, u + w / 2 + 0.05))
                    segs = [(a2, b2)]
                    for g0, g1 in gaps:
                        segs = [iv for s0, s1 in segs for iv in ((s0, min(s1, g0)), (max(s0, g1), s1)) if iv[1] - iv[0] > 0.05]
                    for s0, s1 in segs:
                        self.vface(dm, ax, c, side * inner, s0, s1, zf, zf, zf + DADO_H, zf + DADO_H, side); n += 1
        self.report['outer_dado'] = n

    def flight(self, f, base):
        """A solid flight: risers, treads, its two sides as steps down to `base` (solid under the stair)."""
        n = f['risers']; ew = f['up'] in 'EW'; d = 1 if f['up'] in 'EN' else -1; r = f['riser']; t = f['tread']; m = 'int_trav'
        a0 = (f['x0'] if d > 0 else f['x1']) if ew else (f['y0'] if d > 0 else f['y1'])          # the foot
        s0, s1 = (f['y0'], f['y1']) if ew else (f['x0'], f['x1'])
        def p(u, s, z): return (u, s, z) if ew else (s, u, z)
        back = p(-d, 0, 0); out0 = p(0, -1, 0); out1 = p(0, 1, 0)
        for i in range(n):
            u = a0 + d * i * t; z_lo = (f['z0'] if i else base) + (r * i if i else 0.0); z_hi = f['z0'] + r * (i + 1)
            self.quad(m, p(u, s0, z_lo), p(u, s1, z_lo), p(u, s1, z_hi), p(u, s0, z_hi), back)         # riser (the first one from the base)
            if i < n - 1:
                u2 = u + d * t
                self.quad(m, p(u, s0, z_hi), p(u2, s0, z_hi), p(u2, s1, z_hi), p(u, s1, z_hi), (0, 0, 1))  # tread
                self.quad(m, p(u, s0, base), p(u2, s0, base), p(u2, s0, z_hi), p(u, s0, z_hi), out0)     # the sides, down to the base
                self.quad(m, p(u, s1, base), p(u2, s1, base), p(u2, s1, z_hi), p(u, s1, z_hi), out1)
        ue = a0 + d * (n - 1) * t                                                                       # the solid's end under its head
        self.quad(m, p(ue, s0, base), p(ue, s1, base), p(ue, s1, f['z1']), p(ue, s0, f['z1']), p(d, 0, 0))

    def poke_check(self):
        """Faces of a storey that rise through the floor of a room above (well inside it): the count, 0 when the storeys stack."""
        n = 0; up = [(self.FLZ[i], self.FLN[i]) for i in range(1, len(self.FLZ))]
        for m, (P, _) in self.G.items():
            for i in range(0, len(P), 3):
                t = P[i:i + 3]; zl = min(p[2] for p in t); zh = max(p[2] for p in t); cx = sum(p[0] for p in t) / 3; cy = sum(p[1] for p in t) / 3
                for lvl, fl in up:
                    if zl < lvl - 0.5 and zh > lvl + 0.1 and any(r['floor'] == fl and r['x0'] + 0.3 < cx < r['x1'] - 0.3 and r['y0'] + 0.3 < cy < r['y1'] - 0.3 for r in self.plan['rooms']): n += 1
        self.report['through_floor'] = n
        return n

    # ---------------------------------------------------------------- output
    def tris(self): return sum(len(P) // 3 for P, _ in self.G.values())

    def write(self, path, name, extras=None):
        import numpy as np
        mats = [m for m in MATS if self.G[m][0]]; bin_ = bytearray(); acc = []; views = []; prims = []
        def put(arr, target):
            while len(bin_) % 4: bin_.append(0)
            o = len(bin_); bin_.extend(arr.tobytes()); views.append(dict(buffer=0, byteOffset=o, byteLength=arr.nbytes, target=target)); return len(views) - 1
        for i, m in enumerate(mats):
            Pm = np.array(self.G[m][0], dtype=np.float64); Nm = np.array(self.G[m][1], dtype=np.float64)
            Pg = np.stack([Pm[:, 0], Pm[:, 2], -Pm[:, 1]], axis=1).astype(np.float32); Ng = np.stack([Nm[:, 0], Nm[:, 2], -Nm[:, 1]], axis=1).astype(np.float32)
            idx = np.arange(len(Pg), dtype=np.uint32)
            vp = put(Pg, 34962); acc.append(dict(bufferView=vp, componentType=5126, count=len(Pg), type='VEC3', min=Pg.min(axis=0).tolist(), max=Pg.max(axis=0).tolist()))
            vn = put(Ng, 34962); acc.append(dict(bufferView=vn, componentType=5126, count=len(Ng), type='VEC3'))
            vi = put(idx, 34963); acc.append(dict(bufferView=vi, componentType=5125, count=len(idx), type='SCALAR'))
            prims.append(dict(attributes=dict(POSITION=len(acc) - 3, NORMAL=len(acc) - 2), indices=len(acc) - 1, material=i))
        while len(bin_) % 4: bin_.append(0)
        j = dict(asset=dict(version='2.0', generator='plan_interior.py'), scene=0, scenes=[dict(nodes=[0])],
                 nodes=[dict(mesh=0, name=name, extras=extras or {})], meshes=[dict(name=name, primitives=prims)],
                 materials=[dict(name=m, pbrMetallicRoughness=dict(baseColorFactor=list(MATS[m]) + [1.0], metallicFactor=0.0, roughnessFactor=0.9)) for m in mats],
                 accessors=acc, bufferViews=views, buffers=[dict(byteLength=len(bin_))])
        js = json.dumps(j, separators=(',', ':')).encode()
        while len(js) % 4: js += b' '
        out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bin_)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(bin_), 0x004E4942) + bytes(bin_)
        open(path, 'wb').write(out)
        return len(out)
