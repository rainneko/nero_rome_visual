"""B wall-fountain courts. Pure geometry; NEVER starts Blender or edits scene files.

python3 -B <this-file> --plan-only
Coordinator API: design = build_design(); check_design(design); make_plan(design).
design.meshes preserves components; exportable_meshes(design) groups by material.
Mesh vertices: (lx,lz,absolute_y); to_blender maps to (lx-57,147-lz,y-34.2).
Only this script and DELIVERY/plan-B.json belong to this structural handoff.
"""
import argparse
from collections import Counter, defaultdict
import hashlib
import json
import math
from pathlib import Path
import sys

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))
import clivus_b_legacy as A

Mesh, Survey = A.Mesh, A.Survey
rect, clean, inside = A.rect, A.clean, A.inside
intersect, subtract, triangulate = A.intersect, A.subtract, A.triangulate
rnd, to_blender = A.rnd, A.to_blender
DELIVERY = HERE / 'clivus_b_data'   # in the repo: the inputs (survey, hydrology, native hill snapshot)
PLAN_PATH = HERE / 'clivus_palatinus_b_plan.json'
ASSET = 'rome_clivus_palatinus_b'
WIDTH, CURB, PARAPET, BUDGET = 3.0, .4, .95, 30000


def bounds(poly):
    return min(p[0] for p in poly), min(p[1] for p in poly), max(p[0] for p in poly), max(p[1] for p in poly)


def overlaps(a, b):
    return min(a[2], b[2]) >= max(a[0], b[0])-1e-8 and min(a[3], b[3]) >= max(a[1], b[1])-1e-8


def pieces(poly, holes=()):
    out = triangulate(poly)
    for hole in holes:
        out = [q for p in out for q in subtract(p, hole)]
    return out


def target_y(t, x, z):
    p = t.get('plane')
    return p['slope']*z+p['intercept'] if p else t['y']


class Design(A.Design):
    def __init__(self):
        super().__init__()
        self.walls, self.water, self.openings = [], [], []
        self.clear_polys = []
        self.hydrology_path = DELIVERY/'hydrology.json'
        self.hydrology = json.loads(self.hydrology_path.read_bytes()) if self.hydrology_path.exists() else None

    def soil(self, x, z):
        candidates = [t for t in self.targets if inside((x, z), t['polygon_lx_lz'])]
        if not candidates:
            return self.survey.height(x, z)
        priority = max(t['priority'] for t in candidates)
        return min(target_y(t, x, z) for t in candidates if t['priority'] == priority)

    def footing(self, name, poly, ceiling):
        # ALL targets exist before walls are built. Conservatively include every
        # intersecting cut, even a lower-priority cut subsequently covered by fill.
        old_bot, samples = self.survey.footing(poly, ceiling)
        terrain = self.survey.t
        x0, z0, x1, z1 = bounds(poly)
        ix0, ix1 = math.floor((x0-terrain['x'])/terrain['step']), math.ceil((x1-terrain['x'])/terrain['step'])
        iz0, iz1 = math.floor((z0-terrain['z'])/terrain['step']), math.ceil((z1-terrain['z'])/terrain['step'])
        old_low = min(self.survey.rows[j][i] for j in range(iz0, iz1+1) for i in range(ix0, ix1+1))
        new_low, governing = old_low, []
        for t in self.targets:
            if not overlaps(bounds(poly), bounds(t['polygon_lx_lz'])):
                continue
            hit = intersect(poly, t['polygon_lx_lz'])
            if hit:
                low = min(target_y(t, *p) for p in hit)
                if low < old_low:
                    governing.append(t['id'])
                new_low = min(new_low, low)
        bot = min(old_bot, old_low-2.02, new_low-2.02, ceiling-.4)
        evidence = [[x, z, h, rnd(self.soil(x, z)), rnd(min(h, self.soil(x, z))-bot)]
                    for x, z, h, depth in samples]
        self.foundations.append({'id': name, 'polygon_lx_lz': poly, 'bottom_y': rnd(bot),
            'original_cell_envelope_min_y': rnd(old_low), 'new_ground_conservative_min_y': rnd(new_low),
            'governing_cut_targets': governing, 'min_burial_m': rnd(min(old_low, new_low)-bot),
            'sample_columns': ['lx', 'lz', 'original_y', 'resolved_new_y', 'burial_below_lower_soil'],
            'samples': evidence, 'proof': 'whole bilinear-cell envelope + minimum of intersecting target planes'})
        return bot


def walk(des, name, nodes, y, kind='flat_path'):
    des.clear_polys.extend(A.route_polys(nodes, WIDTH))
    for i, (a, b) in enumerate(zip(nodes, nodes[1:])):
        length = A.dist(a, b)
        nx, nz = -(b[1]-a[1])/length, (b[0]-a[0])/length
        get_y = y if callable(y) else lambda x, z: y
        n = max(1, math.ceil(length/.25))
        for k in range(n+1):
            for off in (-1.499, -1., -.5, 0., .5, 1., 1.499):
                x, z = a[0]+(b[0]-a[0])*k/n+nx*off, a[1]+(b[1]-a[1])*k/n+nz*off
                des.walk_samples.append((name, x, z, get_y(x, z), kind))
        des.route.append({'id': name+'_route_'+str(i), 'object': name, 'kind': kind,
            'from': [*a, rnd(get_y(*a))], 'to': [*b, rnd(get_y(*b))], 'net_width_m': WIDTH})


def deck(des, name, y, poly, role, holes=()):
    poly = clean(poly)
    m = des.mesh(name, 'walkable_deck')
    patches = pieces(poly, holes)
    for i, p in enumerate(patches):
        m.prism(p, y-.28, y, 'paving')
        des.ground(name+'_fill_'+str(i), p, y, .28, role)
    des.decks.append({'id': name, 'y': y, 'poly': poly, 'role': role,
                      'holes_lx_lz': list(holes), 'net_paved_area_m2': rnd(sum(abs(A.area(p)) for p in patches))})
    des.surface(name, poly, y, 'deck', holes_lx_lz=list(holes))


def stair(des, name, x, z, upper, lower, count, tread=.3):
    rise, s, step = (upper-lower)/count, 0., 0
    g = {'id': name, 'start': [x, z, upper], 'end': [x, rnd(z+count*tread+(count//12-1)*1.3), lower],
         'direction_lz': 1, 'net_width_m': WIDTH, 'curb_each_m': CURB,
         'riser_count': count, 'riser_height_m': rnd(rise), 'tread_depth_m': tread,
         'flights': [], 'treads': [], 'intermediate_landings': [], 'endpoint_flat_landings': [], 'rail_profiles': []}
    for flight in range(count//12):
        fs = s
        for j in range(12):
            step += 1
            h = upper-step*rise
            pp, whole = rect(x-1.5, z+s, x+1.5, z+s+tread), rect(x-1.9, z+s, x+1.9, z+s+tread)
            ident = name+'_tread_'+str(step).zfill(2)
            m = des.mesh(ident, 'tread'); m.prism(pp, h-.32, h, 'stone')
            rec = des.surface(ident, pp, h, 'tread', index=step, flight=flight+1,
                center=[x, rnd(z+s+tread/2), rnd(h)], leading_edge=[x, rnd(z+s), rnd(h)],
                trailing_edge=[x, rnd(z+s+tread), rnd(h)], run_from_m=rnd(s), run_to_m=rnd(s+tread), net_width_m=WIDTH)
            g['treads'].append(rec)
            des.ground(ident, whole, h, .32, 'stair_cut_or_fill', 40)
            for dz in (tread*.12, tread*.5, tread*.88):
                for dx in (-1.499, -1., 0., 1., 1.499):
                    des.walk_samples.append((ident, x+dx, z+s+dz, h, 'tread'))
            s += tread
        g['flights'].append({'index': flight+1, 'steps': 12, 'run_from_m': rnd(fs), 'run_to_m': rnd(s)})
        g['rail_profiles'].append([rnd(z+fs), rnd(z+s), rnd(upper-(step-12)*rise), rnd(h)])
        if flight < count//12-1:
            ident = name+'_landing_'+str(flight+1)
            pp = rect(x-1.5, z+s, x+1.5, z+s+1.3)
            des.mesh(ident, 'stair_landing').prism(pp, h-.32, h, 'paving')
            rec = des.surface(ident, pp, h, 'stair_landing', center=[x, rnd(z+s+.65), rnd(h)],
                run_from_m=rnd(s), run_to_m=rnd(s+1.3), depth_m=1.3, net_width_m=WIDTH)
            g['intermediate_landings'].append(rec)
            des.ground(ident, rect(x-1.9, z+s, x+1.9, z+s+1.3), h, .32, 'stair_landing_cut_or_fill', 40)
            for dz in (.1, .65, 1.2):
                for dx in (-1.499, -1., 0., 1., 1.499):
                    des.walk_samples.append((ident, x+dx, z+s+dz, h, 'stair_landing'))
            g['rail_profiles'].append([rnd(z+s), rnd(z+s+1.3), rnd(h), rnd(h)])
            s += 1.3
    g['run_m'] = rnd(s)
    for which, za, zb, h in (('top', z-3.2, z, upper), ('bottom', z+s, z+s+3.2, lower)):
        p = rect(x-1.5, za, x+1.5, zb)
        g['endpoint_flat_landings'].append({'id': name+'_'+which+'_flat', 'polygon_lx_lz': p,
                                           'y': h, 'net_width_m': WIDTH, 'depth_m': 3.2})
        for k in range(13):
            for dx in (-1.499, -.75, 0., .75, 1.499):
                des.walk_samples.append((name+'_'+which, x+dx, za+.002+(zb-za-.004)*k/12, h, 'endpoint_flat'))
    des.stairs.append(g)


def extrusion(m, contour, front, back, mat):
    p = clean(contour)
    for tri in triangulate(p):
        m.face([(x, front, y) for x, y in tri], mat)
        m.face([(x, back, y) for x, y in tri[::-1]], mat)
    for a, b in zip(p, p[1:]+p[:1]):
        m.face([(a[0],front,a[1]),(a[0],back,a[1]),(b[0],back,b[1]),(b[0],front,b[1])],mat)


def tube(m, points, radius, mat, sides=8):
    rings = []
    for i, p in enumerate(points):
        a, b = points[max(0, i-1)], points[min(len(points)-1, i+1)]
        v = [b[k]-a[k] for k in range(3)]; length = math.sqrt(sum(t*t for t in v)); v = [t/length for t in v]
        ref = (0, 0, 1) if abs(v[2]) < .9 else (1, 0, 0)
        u = [v[1]*ref[2]-v[2]*ref[1], v[2]*ref[0]-v[0]*ref[2], v[0]*ref[1]-v[1]*ref[0]]
        length = math.sqrt(sum(t*t for t in u)); u = [t/length for t in u]
        w = [v[1]*u[2]-v[2]*u[1], v[2]*u[0]-v[0]*u[2], v[0]*u[1]-v[1]*u[0]]
        rings.append([tuple(p[k]+radius*(u[k]*math.cos(j*math.tau/sides)+w[k]*math.sin(j*math.tau/sides)) for k in range(3)) for j in range(sides)])
    for a, b in zip(rings, rings[1:]):
        for j in range(sides):
            m.face([a[j], a[(j+1)%sides], b[(j+1)%sides], b[j]], mat)
    m.face(rings[0][::-1], mat); m.face(rings[-1], mat)


def fountain(des):
    m, water = des.mesh('B_three_niche_wall', 'fountain'), des.mesh('B_fountain_water', 'water')
    m.box(75, 156.8, 21.4, 26, 1.4, .9, 'stone')
    holes = [(65.6, 70.4), (72.6, 77.4), (79.6, 84.4)]
    ends = [62, 65.6, 70.4, 72.6, 77.4, 79.6, 84.4, 88]
    for left, right in zip(ends[::2], ends[1::2]):
        m.box((left+right)/2, 156.8, 22.3, right-left, 1.4, 6.3, 'stone')
    for x, (left, right) in zip((68., 75., 82.), holes):
        arc = [(x+2.4*math.cos(math.pi-j*math.pi/32), 24.7+2.4*math.sin(math.pi-j*math.pi/32)) for j in range(33)]
        contour = [(left, 22.3), (right, 22.3)]+arc[::-1]
        extrusion(m, contour, 156.4, 156.1, 'panelred')
        for a, b in zip(arc, arc[1:]):
            extrusion(m, [a, b, (b[0], 28.6), (a[0], 28.6)], 157.5, 156.1, 'stone')
            m.face([(a[0], 156.4, a[1]), (b[0], 156.4, b[1]), (b[0], 157.5, b[1]), (a[0], 157.5, a[1])], 'travertine')
            oa, ob = [(x+(p[0]-x)*1.13, 24.7+(p[1]-24.7)*1.13) for p in (a, b)]
            extrusion(m, [a, oa, ob, b], 157.57, 157.48, 'travertine')
        for edge in (left, right):
            m.box(edge, 156.95, 22.3, .12, 1.1, 2.4, 'travertine')
        m.box(x, 156.95, 22.26, 4.8, 1.1, .04, 'marble')
        # A downward bronze nozzle; its gravity jet lands INSIDE the receiving
        # pool, not behind the rear kerb. Visible city-scale stream is 25mm.
        tube(m, [(x, 156.4, 25.32), (x, 157.15, 25.32), (x, 157.45, 24.8)], .075, 'bronze')
        speed=3.;vx=speed*.5;vy=speed*math.sqrt(3)/2
        duration=(-vy+math.sqrt(vy*vy+2*9.81*(24.8-22.08)))/9.81
        pts = [(x, 157.45+vx*t, 24.8-vy*t-4.905*t*t) for t in [duration*j/16 for j in range(17)]]
        tube(water, pts, .0125, 'water')
        for radius in (.14,.25):
            tube(water,[(x+radius*math.cos(j*math.tau/24),pts[-1][1]+radius*.6*math.sin(j*math.tau/24),22.087) for j in range(25)],.012,'foam',6)
        des.water.append({'id': 'wall_spout_'+str(int(x)), 'source': [x, 157.45, 24.8],
                          'visible_end': pts[-1], 'receiving_water_y': 22.08})
        des.openings.append({'id': 'niche_'+str(int(x)), 'center_lx': x, 'width_m': 4.8,
                             'height_m': 4.8, 'depth_m': 1.1, 'base_y': 22.3, 'front_lz': 157.5})
    for x in (63.8, 71.5, 78.5, 86.2):
        m.box(x, 157.55, 21.4, 1.05, .66, .6, 'travertine')
        m.box(x, 157.58, 22., .64, .55, 5.45, 'travertine')
        m.box(x, 157.55, 27.45, 1.0, .72, .3, 'marble')
    for y, h, depth, mat in ((27.75, .2, 1.7, 'travertine'), (27.95, .65, 1.6, 'stone'), (28.6, .2, 1.85, 'grey'), (28.8, .4, 2., 'travertine')):
        m.box(75, 156.85, y, 26.6, depth, h, mat)
    for i in range(53):
        m.box(62.1+i*.5, 157.78, 28.48, .18, .22, .12, 'travertine')
    des.ground('fountain_back_cut', rect(61.6, 155.85, 88.4, 159), 21.4, .28, 'vertical_back_cut', 20)
    des.walls.append(('B_fountain_foundation', rect(62, 156.1, 88, 157.5), 21.4, False))
    des.walls.append(('B_supply_hidden_link',rect(59.3,156.55,62.2,157.05),29.2,False))


def pool(des, name, poly, floor, level, rim, outlet=False):
    x0, z0, x1, z1 = bounds(poly)
    m, w = des.mesh(name, 'basin'), des.mesh(name+'_water', 'water')
    inner = rect(x0+.35, z0+.35, x1-.35, z1-.35)
    m.prism(poly, floor-.18, floor, 'travertine')
    for p in (rect(x0, z0, x1, z0+.35), rect(x0, z0+.35, x0+.35, z1), rect(x1-.35, z0+.35, x1, z1)):
        m.prism(p, floor, rim, 'travertine')
    front = rect(x0+.35, z1-.35, x1-.35, z1)
    for p in pieces(front, [rect(74.625, z1-.35, 75.375, z1)] if outlet else []):
        m.prism(p, floor, rim, 'travertine')
    w.top(inner, level, 'water')
    des.ground(name+'_excavation', poly, floor, .18, 'basin_cut', 35)
    des.water.append({'id': name, 'outer_polygon_lx_lz': poly, 'water_polygon_lx_lz': inner,
                      'floor_y': floor, 'water_y': level, 'rim_y': rim, 'use': 'ornamental_collection_only'})


def water_features(des):
    pool(des, 'B_long_pool', rect(64, 157.8, 86, 160.3), 21.55, 22.08, 22.23, True)
    water, stone = des.mesh('B_rill_water', 'water'), des.mesh('B_rill_stones', 'water_edge')
    breaks = [161.2+i*2.5 for i in range(7)]
    for i, (za, zb) in enumerate(zip(breaks, breaks[1:])):
        h = 21.35-i*.012
        bed = rect(74.425, za, 75.575, zb)
        stone.prism(bed, h-.18, h-.08, 'travertine')
        for xa, xb in ((74.425, 74.625), (75.375, 75.575)):
            stone.prism(rect(xa, za, xb, zb), h-.08, 21.4, 'travertine')
        water.top(rect(74.625, za, 75.375, zb), h, 'water')
        des.ground('rill_cut_'+str(i), bed, h-.08, .10, 'rill_cut', 35)
        des.water.append({'id': 'rill_cell_'+str(i), 'from_lz': za, 'to_lz': zb,
                          'water_y': rnd(h), 'floor_y': rnd(h-.08), 'water_depth_m': .08})
        if i < 5:
            stone.prism(rect(74.625, zb-.06, 75.375, zb+.06), h-.092, h-.01, 'travertine')
            water.face([(74.625, zb+.061, h), (75.375, zb+.061, h), (75.375, zb+.061, h-.012), (74.625, zb+.061, h-.012)], 'water')
    des.mesh('B_rill_bridge', 'walkable_deck').prism(rect(74.425, 166.2, 75.575, 169.2), 21.34, 21.4, 'travertine')
    tube(water, [(75, 160.3, 22.08), (75, 160.7, 22.03), (75, 161.0, 21.8), (75, 161.2, 21.35)], .045, 'water')
    for side in (-1,1):stone.prism(rect(75+side*.5-.10,160.3,75+side*.5+.10,161.2),21.3,22.20,'travertine')
    # B5: solid sill under the spill between basin and rill; B4 left this
    # 1.15x0.9m cell open, showing raw soil below the basin slab.
    stone.prism(rect(74.425,160.3,75.575,161.2),20.8,21.37,'travertine')
    # Terminal low weir drops into an inspection sump BEFORE the parapet.
    stone.prism(rect(74.425, 176.2, 75.575, 177.35), 20.8, 21.16, 'travertine')
    water.face([(74.625,176.2,21.29),(75.375,176.2,21.29),(75.375,176.2,21.278),(74.625,176.2,21.278)],'water')
    water.face([(74.625,176.2,21.278),(74.625,176.65,21.24),(75.375,176.65,21.24),(75.375,176.2,21.278)],'water')
    water.face([(74.625,176.65,21.24),(75.375,176.65,21.24),(75.375,177.1,20.85),(74.625,177.1,20.85)],'water')
    for j in range(6):stone.prism(rect(74.425,176.8+j*.09,75.575,176.835+j*.09),21.35,21.4,'bronze')
    des.ground('terminal_rill_cut', rect(74.425, 176.2, 75.575, 177.35), 20.8, .14, 'rill_cut', 35)
    pool(des, 'B_lower_collection_basin', rect(83.5, 179, 86.5, 181.3), 14.42, 14.88, 15.18)
    m = des.mesh('B_lower_collection_spout', 'fountain')
    m.box(85, 178.97, 15.2, .7, .3, .9, 'travertine')
    tube(m, [(85, 178.75, 15.8), (85, 179, 15.8)], .075, 'bronze')
    tube(water, [(85, 179+1.15*t, 15.8-.92*t*t) for t in [j/12 for j in range(13)]], .016, 'water')
    # Covers are flush and visibly removable; dirty water has its own drain.
    for x,z,w,d in ((87.5,181,1.1,1.1),(82,188,.8,.8)):
        stone.prism(rect(x-w/2,z-d/2,x+w/2,z+d/2),14.90,15.001,'peperino')
        for dx in (-.22,.22):stone.prism(rect(x+dx-.04,z-.12,x+dx+.04,z+.12),15.001,15.025,'bronze')
    des.water.extend([{'id': 'lower_spout', 'source': [85, 179, 15.8], 'receiver': [85, 180.15, 14.88], 'potable': False},
        {'id': 'rill_bridge', 'polygon_lx_lz': rect(74.425, 166.2, 75.575, 169.2), 'top_y': 21.4, 'clear_route_width_m': 3.},
        {'id': 'internal_drop_handoff', 'point': [75,177.1,20.85], 'external_drop_m': .39, 'services_owner': 'coordinator'}])


def landscape(des):
    specs = [('west_shade', 'water_court', 63.5, 163.8, 2.2, 3.4, 21.4),
             ('east_shade', 'water_court', 87.8, 163.8, 2.2, 3.4, 21.4),
             ('front_west', 'water_court', 68., 177.65, 4., 1.1, 21.4),
             ('front_east', 'water_court', 85., 177.65, 8., 1.1, 21.4),
             ('rill_herbs_west', 'water_court', 72.9, 172.9, 1.2, 4.6, 21.4),
             ('rill_herbs_east', 'water_court', 77.1, 172.9, 1.2, 4.6, 21.4),
             ('lower_west', 'seating_court', 61.5, 183.2, 2.2, 1.4, 15.),
             ('lower_middle', 'seating_court', 74.8, 183.2, 3.6, 1.2, 15.),
             ('lower_east', 'seating_court', 85.8, 183.2, 6.8, 1.2, 15.)]
    for name, owner, x, z, w, d, y in specs:
        poly = rect(x-w/2, z-d/2, x+w/2, z+d/2)
        des.beds.append({'id': name, 'deck': owner, 'poly': poly, 'y': y, 'soil_y': y, 'rim_height_m': .16})
    trees = [(63.5, 163.8, 21.4, 2.3), (87.8, 163.8, 21.4, 2.3), (61.5, 183.2, 15., 2.),
             (74.8, 183.2, 15., 2.2), (83., 183.2, 15., 2.3), (88.4, 183.2, 15., 2.3)]
    for i, (x, z, y, r) in enumerate(trees):
        des.plants.append({'id': 'laurel_'+str(i), 'kind': 'tree', 'species': 'Laurus nobilis', 'lx': x, 'lz': z,
            'y': y, 'crown_radius_m': r, 'height_m': 5.8, 'clear_trunk_height_m': 2.7, 'export': False})
    for i,(x,z) in enumerate(((67.,151.8),(78.5,150.5),(91.,152.2))):
        des.plants.append({'id':'scree_laurel_'+str(i),'kind':'tree','species':'Laurus nobilis',
            'lx':x,'lz':z,'y':des.survey.height(x,z),'crown_radius_m':1.15,'height_m':3.5,
            'clear_trunk_height_m':1.7,'placement':'original_natural_soil','export':False})
    for i, x in enumerate((63., 66., 69., 82., 85., 88.)):
        des.plants.append({'id': 'low_shrub_'+str(i), 'kind': 'shrub', 'lx': x, 'lz': 177.65, 'y': 21.4,
                           'crown_radius_m': .33, 'height_m': .55, 'export': False})
    for i, x in enumerate((64., 68., 82., 87.)):
        des.plants.append({'id': 'front_vine_'+str(i), 'kind': 'vine', 'lx': x, 'lz': 178.97, 'y': 21.4,
                           'crown_radius_m': .3, 'height_m': 1.7, 'export': False})


def build_landscape(des):
    m = des.mesh('B_planter_rims_and_soil', 'landscape_structure')
    for b in des.beds:
        x0, z0, x1, z1 = bounds(b['poly'])
        inner = rect(x0+.16, z0+.16, x1-.16, z1-.16)
        for p in pieces(b['poly'], [inner]):
            m.prism(p, b['y']-.2, b['y']+.16, 'travertine')
        m.top(inner, b['y'], 'gravel')
        des.ground(b['id']+'_soil', inner, b['y'], 0., 'planting_soil', 25)
    for i, (x, z, w) in enumerate(((61.5, 181.1, 2.4), (74.8, 184.1, 2.6), (83.4, 184.1, 2.8), (88.2, 184.1, 2.8))):
        m = des.mesh('B_bench_'+str(i), 'public_seat')
        for dx in (-w*.33, w*.33):
            m.box(x+dx, z, 15., .32, .5, .32, 'stone')
        m.box(x, z, 15.32, w, .55, .14, 'travertine')
        m.box(x,z-.205,15.46,w,.14,.43,'travertine')
        des.furniture.append({'id': m.name, 'type': 'bench', 'center': [x, z, 15.], 'width_m': w,
                              'depth_m': .55, 'seat_y': 15.46, 'approach_width_m': 3.})
    ivy = des.mesh('B_front_trailing_ivy', 'landscape_detail')
    for p in [p for p in des.plants if p['kind'] == 'vine']:
        for j in range(8):
            x, z, h = p['lx']+.14*math.sin(j*1.7), p['lz']+.018, p['y']-.18-j*.19
            ivy.face([(x-.16, z, h), (x, z+.02, h+.16), (x+.16, z, h), (x, z+.02, h-.2)], 'ivy')


def architectural_finish(des):
    m=des.mesh('B_court_finishing','finish')
    # Shallow bands, not additional terraces. Main front wall stays continuous.
    # B5 round 2: 0.15m projection (was 0.05-0.07m, read as a thin pale line).
    for z,ya,yb,x0,x1 in ((178.97,20.94,21.14,60,94.55),(189.42,14.54,14.74,53.6,68.1),(189.42,14.54,14.74,71.9,91.55)):
        m.prism(rect(x0,z-.02,x1,z+.13),ya,yb,'travertine')
    for xa,xb in ((60.4,73.9),(76.1,91.4)):
        m.prism(rect(xa,176.65,xb,176.86),21.4,21.403,'marble')
    # Classical engaged shafts, bases and carved leaf-like capitals.
    for x in (63.8,71.5,78.5,86.2):
        for ya,r,h in ((22.,.38,.16),(22.16,.33,.13),(27.12,.33,.14),(27.26,.40,.17)):
            m.cyl(x,157.72,ya,r,h,'travertine',16)
        m.cyl(x,157.72,22.29,.27,4.83,'marble',16,.235)
        for j in range(8):
            t=j*math.tau/8;cx=x+.31*math.cos(t);cz=157.72+.31*math.sin(t)
            m.face([(cx-.08,cz,27.12),(cx,cz,27.45),(cx+.08,cz,27.12)],'travertine')
    # Water-spout rosettes stand proud of the plastered backs of real niches.
    for x in (68.,75.,82.):
        for j in range(16):
            a=j*math.tau/16;b=(j+1)*math.tau/16
            m.face([(x,156.42,25.32),(x+.32*math.cos(a),156.42,25.32+.32*math.sin(a)),
                    (x+.32*math.cos(b),156.42,25.32+.32*math.sin(b))],'bronze')
    for x in (62.4,87.6):
        z=159.2
        for y,r,rt,h in ((21.4,.30,.28,.12),(21.52,.28,.39,.48),(22.,.39,.25,.23),(22.23,.25,.30,.13)):
            m.cyl(x,z,y,r,h,'tile',16,rt)
        m.cyl(x,z,22.37,.26,.02,'gravel',16)
        des.plants.append({'id':'urn_shrub_'+str(x),'kind':'shrub','lx':x,'lz':z,'y':22.38,
            'crown_radius_m':.42,'height_m':.65,'export':False})


def tail(des):
    nodes = [(70, 199.1), (70, 210), (66, 227), (54, 240)]
    def height(z):
        x = 70 if z <= 210 else 70-4*(z-210)/17 if z <= 227 else 66-12*(z-227)/13
        blend = max(0., min(1., (z-202)/6., (240-z)/12.))
        return 8.5+(des.survey.height(x, min(240, max(199.1, z)))+.025-8.5)*blend
    des.tail_profile = [[rnd(z), rnd(height(z))] for z in [199.1]+list(range(200, 241))+[241.9]]
    h = lambda x, z: A.tail_height(des, z)
    limit = rect(51, 199.1, 73, 241.9)
    outer = A.union_fragments(A.route_polys(nodes, 3.8), limit)
    clear = A.route_polys(nodes, 3.)
    m = des.mesh('B_street_path', 'walkable_path')
    for i, p in enumerate(outer):
        for j, ((za, ya), (zb, yb)) in enumerate(zip(des.tail_profile, des.tail_profile[1:])):
            q = intersect(p, rect(50, za, 74, zb))
            if not q:
                continue
            slope = (yb-ya)/(zb-za)
            for r in pieces(q, clear):
                m.prism(r, lambda x, z: h(x, z)-.22, h, 'travertine')
            for r in A.union_fragments(clear, q):
                m.prism(r, lambda x, z: h(x, z)-.22, h, 'paving')
            des.targets.append({'id': 'tail_'+str(i)+'_'+str(j), 'polygon_lx_lz': q, 'y': rnd(ya-.22),
                'surface_y': None, 'priority': 30, 'role': 'ground_following_path', 'mode': 'replace_inside_polygon',
                'slab_thickness': .22, 'plane': {'axis': 'lz', 'slope': rnd(slope), 'intercept': rnd(ya-slope*za-.22)}})
    walk(des, m.name, nodes, h, 'ground_following_path')


# B5: every retaining face is ONE plane of hill-tone ashlar from footing to
# coping. The B4 'outer' bands were coplanar 0.1m prisms in the same polygon
# (z-fighting lines read as a ledge/second skin); they are gone. Where a face
# would exceed 9m, a real level string course is added by the caller.
WALL_STONE = 'ash'   # own material name: page pattern 1 (0.6m courses), colour from the GLB


def wall(des, name, poly, level, rail=True, outer=None):
    top = level if callable(level) else lambda x, z: level
    bot = des.footing(name, poly, min(top(*p) for p in poly))
    m = des.mesh(name, 'retaining_wall')
    m.prism(poly, bot, lambda x, z: top(x, z)+(PARAPET-.12 if rail else -.12), WALL_STONE)
    m.prism(poly, lambda x, z: top(x, z)+(PARAPET-.12 if rail else -.12), lambda x, z: top(x, z)+(PARAPET if rail else 0), 'travertine')


def structure(des):
    # Peripheral walls only; no transverse wall divides either public court.
    for g in des.stairs:
        x = g['start'][0]
        for j, (za, zb, ya, yb) in enumerate(g['rail_profiles']):
            h = lambda xx, zz, za=za, zb=zb, ya=ya, yb=yb: ya+(yb-ya)*(zz-za)/(zb-za)
            for side in (-1, 1):
                xa, xb = sorted((x+side*1.5, x+side*1.9))
                wall(des, g['id']+'_cheek_'+str(side)+'_'+str(j), rect(xa, za, xb, zb), h)
    # Each segment explicitly stops at gates. Main south spill is the only water gap.
    for name, x0, z0, x1, z1, h in [
        ('arrival_north_east',60.2,146.3,64.2,146.7,34.2),
        ('arrival_west',57.,146.7,57.4,149.9,34.2),
        ('arrival_east',63.8,146.7,64.2,150.3,34.2),
        ('arrival_front_east',60.4,149.9,64.2,150.3,34.2),
        ('water_west_turn',57.,176.2,57.4,179.9,21.4),
        ('water_west_turn_front',57.4,179.5,64.8,179.9,21.4),
        ('water_west_turn_return',64.4,178.5,64.8,179.5,21.4),
        ('water_north_guard',88.,158.6,94.4,159.,21.4),
        ('water_east_north',94,159,94.4,167.8,21.4),('water_east_south',94,171,94.4,178.95,21.4),
        ('water_east_gate',97.5,167.8,97.9,171,21.4),('water_front',64.8,178.5,94,178.95,21.4),
        ('seating_east_north',91,179,91.4,184.4,15.),('seating_east_south',91,187.6,91.4,189.4,15.),
        ('seating_east_turn',97.5,184.4,97.9,188,15.),('seating_east_turn_front',91,187.6,97.5,188,15.),
        ('seating_front_west',60,189,68.1,189.4,15.),
        ('seating_front_east',71.9,189,91.4,189.4,15.),('seating_west',59.6,179.7,60,189,15.),
        ('street_notch_west',67.7,182.5,68.1,189,15.),
        ('street_notch_east', 71.9, 182.5, 72.3, 189, 15.)]:
        wall(des, 'B_'+name, rect(x0, z0, x1, z1), h, outer=True)
    for name, p, y, rail in des.walls:
        wall(des, name, p, y, rail)
    for x in (61., 65., 80., 89.):
        p = rect(x-.4, 178.3, x+.4, 178.9)
        wall(des, 'B_square_buttress_'+str(int(x)), p, 21.4, False)


def build_design():
    des = Design(); landscape(des)
    stair(des, 'B_west_upper_stair', 58.9, 149.9, 34.2, 21.4, 72, tread=.275)
    stair(des, 'B_east_lower_stair', 96., 171., 21.4, 15., 36)
    stair(des, 'B_street_stair', 70., 182.5, 15., 8.5, 36)
    arrival = rect(57.4,146.7,63.8,149.9)
    main = [(60.8,159),(94,159),(94,167.8),(97.5,167.8),(97.5,171),(94,171),(94,178.5),(64.4,178.5),(64.4,179.5),(57.4,179.5),(57.4,176.2),(60.8,176.2)]
    lower = [(60,179),(91,179),(91,184.4),(97.5,184.4),(97.5,187.6),(91,187.6),(91,189),(71.9,189),(71.9,182.5),(68.1,182.5),(68.1,189),(60,189)]
    for name, poly, y, role in [('arrival', arrival, 34.2, 'arrival_strip'), ('water_court', main, 21.4, 'primary_public_court'), ('seating_court', lower, 15., 'primary_public_court')]:
        holes = [b['poly'] for b in des.beds if b['deck'] == name]
        if name == 'water_court':
            holes += [rect(64, 157.8, 86, 160.3),rect(74.425,160.3,75.575,177.35)]
        if name == 'seating_court':
            holes += [rect(83.5, 179, 86.5, 181.3)]
        deck(des, name, y, poly, role, holes)
    deck(des, 'native_joint', 34.2, rect(57.6,146.44,60.2,146.7), 'existing_stair_joint')
    # The existing flight is only 2.6m wide. Do not pretend the joint is 3m.
    for dz in (.03,.13,.23):
        for dx in (-1.299,-.65,0.,.65,1.299):
            des.walk_samples.append(('native_joint',58.9+dx,146.44+dz,34.2,'existing_width_joint'))
    deck(des, 'street_landing', 8.5, rect(68.1, 195.9, 71.9, 199.1), 'street_junction_strip')
    walk(des,'arrival',[(58.9,148.3),(58.9,149.9)],34.2)
    walk(des,'water_court',[(58.9,176.2),(58.9,177.9),(62.6,177.9),(62.6,167.7),(92.3,167.7),(92.3,169.4),(96,169.4),(96,171)],21.4)
    walk(des,'seating_court',[(96,184.4),(96,186),(79,186),(79,180.8),(70,180.8),(70,182.5)],15.)
    walk(des,'seating_court',[(70,180.8),(66.4,180.8),(66.4,181.5),(64.5,181.5),(64.5,186)],15.)
    walk(des, 'street_landing', [(70, 195.9), (70, 199.1)], 8.5)
    fountain(des); water_features(des); build_landscape(des); tail(des)
    # Exterior cut toes expose the lower face, instead of leaving old soil through the walls.
    des.ground('main_front_toe', rect(64.8,178.5,94.4,179.4),15.,.28,'wall_toe_cut',15)
    des.ground('main_west_turn_toe',rect(57.,179.5,64.8,180.),15.,.28,'wall_toe_cut',15)
    des.ground('seating_front_toe', rect(59.4, 189, 91.5, 189.6), 8.5, .22, 'wall_toe_cut', 15)
    structure(des)
    architectural_finish(des)
    return des


def exportable_meshes(des, merge_materials=True):
    if not merge_materials:
        return [m for m in des.meshes if m.export]
    grouped = {}
    for m in des.meshes:
        if not m.export:
            continue
        for face, mat in zip(m.faces, m.mats):
            key = ('water' if m.kind == 'water' else 'structure', mat)
            if key not in grouped:
                grouped[key] = Mesh('B_export_'+key[0]+'_'+mat, key[0])
            grouped[key].face([m.verts[i] for i in face], mat)
    return list(grouped.values())


def check_design(des):
    meshes = [m for m in des.meshes if m.export]
    triangles = sum(len(m.faces) for m in meshes)
    assert triangles <= BUDGET, triangles
    assert len({m.name for m in meshes}) == len(meshes)
    assert min(p[1] for m in meshes for p in m.verts) >= 144
    cells = defaultdict(list)
    walkable = {m.name for m in meshes if m.kind in ('walkable_deck', 'walkable_path', 'tread', 'stair_landing')}
    for m in meshes:
        for face in m.faces:
            a, b, c = [m.verts[i] for i in face]
            if abs(A.cross(a, b, c)) < 1e-11:
                continue
            for ix in range(math.floor(min(p[0] for p in (a, b, c))/2), math.floor(max(p[0] for p in (a, b, c))/2)+1):
                for iz in range(math.floor(min(p[1] for p in (a, b, c))/2), math.floor(max(p[1] for p in (a, b, c))/2)+1):
                    cells[ix, iz].append((m.name, a, b, c))
    failures = []
    for index, (name, x, z, y, kind) in enumerate(des.walk_samples):
        hits, crossings = [], defaultdict(set)
        for ob, a, b, c in cells[math.floor(x/2), math.floor(z/2)]:
            h = A.ray_y(x, z, a, b, c)
            if h is not None:
                hits.append((h, ob))
                if h > y+.025:
                    crossings[ob].add((round(h, 7), 1 if A.cross(a, b, c) < 0 else -1))
        floors = [ob for h, ob in hits if abs(h-y) < 2e-5 and ob in walkable]
        blocked = [ob for h, ob in hits if y+.025 < h < y+2.4] + [ob for ob, cr in crossings.items() if sum(sign for h, sign in cr) > 0]
        if not floors or blocked:
            failures.append((name, [rnd(x), rnd(z), rnd(y)], 'obstacle' if blocked else 'no_surface', blocked[:2]))
        else:
            des.ray_objects[index] = floors[0]
    assert not failures, json.dumps({'count': len(failures), 'first': failures[:16], 'last': failures[-8:]})
    continuity = []
    for g in des.stairs:
        ss = sorted(g['treads']+g['intermediate_landings'], key=lambda p: p['run_from_m'])
        gap = max(abs(a['run_to_m']-b['run_from_m']) for a, b in zip(ss, ss[1:]))
        assert gap < 1e-6 and len(g['treads']) == g['riser_count']
        assert abs(ss[-1]['y']-g['end'][2]) < 1e-6
        assert max(abs(a['y']-b['y']) for a, b in zip(ss, ss[1:])) < .181
        continuity.append({'id': g['id'], 'gap_m': rnd(gap), 'riser_m': g['riser_height_m'], 'run_m': g['run_m']})
    burial = min(f['min_burial_m'] for f in des.foundations)
    assert burial >= 2
    return {'status': 'passed', 'triangles': triangles, 'triangle_budget': BUDGET,
        'component_meshes': len(meshes), 'material_export_meshes': len(exportable_meshes(des)),
        'actual_mesh_walk_samples': len(des.walk_samples), 'required_width_m': WIDTH,
        'required_headroom_m': 2.4, 'stair_continuity': continuity, 'min_burial_below_lower_soil_m': burial,
        'Blender_started': False, 'GLB_verified': False, 'reference_and_city_render_acceptance': 'pending coordinator'}


def make_plan(des, checks=None):
    checks = checks or check_design(des)
    return {'schema': 'rome_clivus_palatinus.plan-B.height-fit-v2', 'asset': ASSET,
        'delivery_status': 'NUMERIC DRAFT ONLY; not final GLB or scene integration',
        'native_scene_status': 'Native stair conflicts resolved; existing house occupancy and upstream rock intrusion remain unresolved. See ../clivus-east-park-masterplan-v1/height-audit/',
        'history_label': '【设计推演】B壁泉休憩台地；不作考古复原。',
        'units': 'metres', 'coordinate_order': '[lx,lz,absolute_y]', 'origin': {'lx': 57, 'lz': 147, 'y': 34.2},
        'blender_xyz': '[lx-57,147-lz,absolute_y-34.2]', 'gltf_xyz': '[lx-57,absolute_y-34.2,lz-147]',
        'PALF': des.survey.data['PALF'], 'survey_sha256': des.survey.sha,
        'hydrology': {'path': des.hydrology_path.name, 'present_at_build': des.hydrology is not None,
            'sha256': hashlib.sha256(des.hydrology_path.read_bytes()).hexdigest() if des.hydrology is not None else None,
            'basis': 'coordinator water coordinates, 2026-11-19; underground services excluded'},
        'endpoints': {'upper': [58.9, 146.44, 34.2], 'street': [54, 240, 8.5]},
        'primary_public_levels': [21.4, 15.], 'stairs': des.stairs, 'decks': des.decks, 'route': des.route,
        'tail_profile_lz_y': des.tail_profile, 'targets': des.targets,
        'ground': {'targets': des.targets, 'apply_order': 'ascending priority; same-priority boundary uses lower y',
                  'height_formula': 'plane.slope*lz+plane.intercept or y', 'outside_targets': 'retain original terrain; no smoothing across cliff or stair'},
        'foundations': des.foundations, 'plants': des.plants, 'beds': des.beds, 'furniture': des.furniture,
        'visible_water': des.water, 'niches': des.openings,
        'ray_acceptance': {'point_columns': ['route_object', 'lx', 'lz', 'absolute_y', 'kind'],
                           'samples': [[n, rnd(x), rnd(z), rnd(y), k] for n, x, z, y, k in des.walk_samples]},
        'mesh_schema': {'fields': ['name', 'kind', 'export', 'verts', 'faces', 'mats'],
            'verts': '[lx,lz,absolute_y]', 'faces': 'zero-based triangle indices', 'mats': 'one rk material name per face',
            'formal_export': 'exportable_meshes(design); water separate; component meshes retained in design.meshes'},
        'adjustments': ['Only a small arrival landing, no 40m transverse upper deck',
            '72-step west stair hugs the existing cliff; east stair links the two courts',
            'central stair corridor lx68.1..71.9 is removed from the entire seating slab',
            'fountain face lz157.5, shallow returns behind it; no new terrain north of lz144'],
        'checks': checks, 'pending': ['coordinator Blender export and normals/material check',
            'four reference cameras and city camera; real rock visibility, house separation, earthwork seams',
            'coordinator hydrology/services join and actual GLB ray/scale acceptance']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan-only', action='store_true', help='build/check numeric geometry and write plan-B.json only')
    args = parser.parse_args()
    if not args.plan_only:
        parser.error('Use --plan-only; the coordinator owns Blender export/rendering.')
    des = build_design(); checks = check_design(des)
    PLAN_PATH.write_text(json.dumps(make_plan(des, checks), ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({'plan': str(PLAN_PATH), 'checks': checks}, ensure_ascii=False))


if __name__ == '__main__':
    main()
