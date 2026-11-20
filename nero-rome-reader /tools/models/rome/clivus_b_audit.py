"""Read-only native snapshot comparison and pure triangle/plant clearance checks."""
from collections import Counter, defaultdict
import hashlib
import json
import math


def bbox(poly):
    return min(p[0] for p in poly), min(p[1] for p in poly), max(p[0] for p in poly), max(p[1] for p in poly)


def index_triangle(cells, record, vertices):
    x0, z0, x1, z1 = bbox(vertices)
    for i in range(math.floor(x0/2), math.floor(x1/2)+1):
        for j in range(math.floor(z0/2), math.floor(z1/2)+1):
            cells[i, j].append(record)


def check_walk_meshes(des, A):
    cells = defaultdict(list)
    floors = set()
    for m in des.meshes:
        if not m.export:
            continue
        if m.kind in ('walkable_deck', 'walkable_path', 'tread', 'stair_landing'):
            floors.add(m.name)
        for f in m.faces:
            v = [m.verts[i] for i in f]
            if abs(A.cross(*v)) > 1e-11:
                index_triangle(cells, (m.name, v), v)
    failures, ground_failures = [], []
    target_index = defaultdict(list)
    for t in des.targets:
        index_triangle(target_index, t, t['polygon_lx_lz'])
    min_head = float('inf')
    for i, (name, x, z, y, kind) in enumerate(des.walk_samples):
        hits, crossings = [], defaultdict(set)
        for obj, v in cells[math.floor(x/2), math.floor(z/2)]:
            h = A.ray_y(x, z, *v)
            if h is None:
                continue
            hits.append((h, obj))
            if h > y+.025+1e-7:
                crossings[obj].add((round(h, 7), 1 if A.cross(*v) < 0 else -1))
        matched = [obj for h, obj in hits if abs(h-y) < 2e-5 and obj in floors]
        blocked = sorted(set(obj for h, obj in hits if y+.025+1e-7 < h < y+2.4-1e-7) |
                         set(obj for obj, cr in crossings.items() if sum(sign for h, sign in cr) > 0))
        if not matched or blocked:
            failures.append({'sample': i, 'route': name, 'point': [round(x, 7), round(z, 7), round(y, 7)],
                             'reason': 'obstacle' if blocked else 'no_surface', 'blocked_by': blocked})
        else:
            des.ray_objects[i] = name if name in matched else matched[0]
        overhead = [h-y for h, obj in hits if h > y+.025+1e-7]
        if overhead:
            min_head = min(min_head, min(overhead))
        active = [t for t in target_index[math.floor(x/2), math.floor(z/2)] if A.inside((x, z), t['polygon_lx_lz'])]
        if active:
            priority = max(t['priority'] for t in active)
            def level(t):
                p = t.get('plane')
                return p['slope']*z+p['intercept'] if p else t['y']
            soil = min(level(t) for t in active if t['priority'] == priority)
            if soil > y+.005:
                ground_failures.append({'sample': i, 'route': name, 'point': [x, z, y], 'resolved_new_soil_y': soil})
    assert not failures, json.dumps({'mesh_failures': len(failures), 'by_route': dict(Counter(r['route'] for r in failures)), 'first': failures[:20], 'last': failures[-8:]})
    assert not ground_failures, json.dumps({'buried_walk_samples': len(ground_failures), 'first': ground_failures[:12]})
    return {'method': 'actual triangle rays + signed solid crossings + resolved earthwork targets',
            'passed_samples': len(des.walk_samples), 'missing_floor': 0, 'headroom_obstacles': 0,
            'buried_by_new_soil': 0, 'minimum_sampled_overhead_m': None if not math.isfinite(min_head) else round(min_head, 7)}


def check_plants(des):
    failures = []
    for p in des.plants:
        for i, (name, x, z, y, kind) in enumerate(des.walk_samples):
            d2 = (p['lx']-x)**2+(p['lz']-z)**2
            if p['kind'] == 'tree':
                volumes = [(.16, p['y'], p['y']+p['height_m']),
                           (p['crown_radius_m'], p['y']+p['clear_trunk_height_m'], p['y']+p['height_m'])]
            elif p['kind'] == 'vine':
                volumes = [(p['crown_radius_m'], p['y']-p['height_m'], p['y'])]
            else:
                volumes = [(p['crown_radius_m'], p['y'], p['y']+p['height_m'])]
            if any(d2 < r*r and hi > y+.025 and lo < y+2.4-1e-7 for r, lo, hi in volumes):
                failures.append({'plant': p['id'], 'sample': i, 'route': name, 'point': [x, z, y]})
                break
    assert not failures, json.dumps({'plant_clearance_failures': failures})
    return {'plants': len(des.plants), 'method': 'conservative trunk/crown/shrub cylinders against every route headroom volume',
            'blocked_plants': 0, 'trees_in_formal_GLB': False}


class NativeContext:
    def __init__(self, delivery, A):
        self.A = A
        self.path = delivery/'native-mesh-patch.json'
        self.heights_path = delivery/'heights.json'
        raw = self.path.read_bytes()
        self.data = json.loads(raw)
        self.heights = json.loads(self.heights_path.read_bytes())
        self.sha = hashlib.sha256(raw).hexdigest()
        self.cells = defaultdict(list)
        for t in self.data['triangles']:
            if abs(A.cross(*t['v'])) > 1e-11:
                index_triangle(self.cells, t, t['v'])

    def query(self, x, z):
        out, seen = [], set()
        for t in self.cells[math.floor(x/2), math.floor(z/2)]:
            h = self.A.ray_y(x, z, *t['v'])
            if h is None:
                continue
            key = (t['objId'], round(h, 6), t['sign'])
            if key not in seen:
                seen.add(key); out.append((h, t))
        return out

    def terrain_lower_bound(self, poly):
        box = bbox(poly); candidates = {}
        for i in range(math.floor(box[0]/2), math.floor(box[2]/2)+1):
            for j in range(math.floor(box[1]/2), math.floor(box[3]/2)+1):
                for t in self.cells[i, j]:
                    if t['terrain']:
                        candidates[id(t)] = t
        low = []
        for t in candidates.values():
            plan = self.A.clean([(v[0], v[1]) for v in t['v']])
            if plan and self.A.intersect(poly, plan):
                # A complete triangle's vertex minimum bounds its intersection,
                # including the continuous soil between all recorded samples.
                low.append(min(p[2] for p in t['v']))
        return min(low) if low else None

    def audit(self, des):
        hard, houses, ground = [], [], []
        categories, objects = Counter(), Counter()
        for i, (route, x, z, y, kind) in enumerate(des.walk_samples):
            groups, labels = defaultdict(list), {}
            for h, t in self.query(x, z):
                if t['terrain']:
                    if h > y+.025:
                        ground.append(i)
                    continue
                groups[t['objId']].append((h, t['sign']))
                labels[t['objId']] = t
            for obj, hits in groups.items():
                winding = sum(sign for h, sign in hits if h > y+.025)
                low_hits = [h for h, sign in hits if y+.025 < h < y+2.4-1e-7]
                if winding <= 0 and not low_hits:
                    continue
                t = labels[obj]; label = t['name'] or t.get('lay') or obj
                category = 'existing_houses' if t.get('lay') == 'houses' else 'native_structure_or_rock'
                record = {'sample_index': i, 'route': route, 'point': [round(x, 7), round(z, 7), round(y, 7)],
                          'native_id': obj, 'name': label, 'material': t['material'], 'winding_above_floor': winding,
                          'nearby_crossings_y': sorted(set(round(h, 6) for h, sign in hits if h > y+.025))[:12]}
                (houses if category == 'existing_houses' else hard).append(record)
                categories[category] += 1; objects[label] += 1
        seam = []
        for i in range(15):
            x = 57.601+i*2.598/14; z = 146.439
            matches = [h for h, t in self.query(x, z) if t.get('lay') == 'stairs' and abs(h-34.2)<.02]
            seam.append({'lx': round(x, 7), 'lz': z, 'expected_y': 34.2,
                         'native_stair_floor_y': round(min(matches, key=lambda h: abs(h-34.2)), 7) if matches else None})
        upstream = [r for r in self.heights['measured'] if r.get('above_source_level_inside_meshes')]
        hard_indices = {r['sample_index'] for r in hard}; house_indices = {r['sample_index'] for r in houses}
        return {'schema': 'B3.native-route-comparison.v1', 'method': 'read-only current snapshot triangle rays and signed solid crossings',
            'snapshot': self.data['snapshot'], 'native_file': self.path.name, 'native_sha256': self.sha,
            'heights_sha256': hashlib.sha256(self.heights_path.read_bytes()).hexdigest(),
            'native_bounds_lx_lz': self.data['bounds'], 'sample_indices_reference': 'plan-B.json ray_acceptance.samples, zero-based',
            'summary': {'new_geometry_internal_status': 'passed separately', 'route_samples': len(des.walk_samples),
                'hard_structure_or_rock_blocked_samples': len(hard_indices), 'house_occupied_samples': len(house_indices),
                'overlap_records_by_category': dict(categories), 'overlap_records_by_object': dict(objects),
                'original_soil_above_route_samples': len(set(ground)), 'native_seam_floor_matched_samples': sum(p['native_stair_floor_y'] is not None for p in seam),
                'new_joint_native_cap_blocked_samples': sum(r['route']=='native_joint' for r in hard),
                'native_seam_samples': len(seam), 'city_route_acceptance': 'NOT accepted; original occupancy and coordinator scene checks remain'},
            'hard_native_violations': hard, 'house_occupancy_violations': houses,
            'soil_cut_sample_indices': sorted(set(ground)), 'soil_note': 'original terrain is compared before B3 target earthworks; fixed rock meshes are never treated as soil',
            'existing_seam': {'retained_native_width_m': 2.6, 'new_route_width_m': 3., 'samples': seam},
            'upstream_native_issues_outside_new_geometry': upstream,
            'unconnected_interfaces': ['existing footSlot continuation', 'right parks 26.06/42.06'],
            'Blender_or_city_render_acceptance': False}
