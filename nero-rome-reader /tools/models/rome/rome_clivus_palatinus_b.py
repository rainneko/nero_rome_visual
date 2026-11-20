"""B4 joined podiums, upper garden and directional stairs. Never launches Blender.
Run: python3 -B <this-file> --plan-only
API: build_design(), check_design(des), make_plan(des), exportable_meshes(des).
B2 water/facade helpers are a private COPY in this B3 source directory.
"""
import sys
from pathlib import Path
sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))
import clivus_b_geometry as B
from clivus_b_geometry import Mesh, Survey, A, rect, clean, inside, intersect, subtract, triangulate
from clivus_b_geometry import rnd, to_blender, bounds, overlaps, pieces, target_y, deck, wall, tail
from clivus_b_geometry import exportable_meshes, tube, WIDTH, CURB, PARAPET, BUDGET
import argparse
import hashlib
import json
import math
from collections import Counter, defaultdict
from clivus_b_audit import NativeContext, check_walk_meshes, check_plants

DELIVERY = HERE/'clivus_b_data'   # in the repo: the inputs (survey, hydrology, native hill snapshot)
PLAN_PATH = HERE/'clivus_palatinus_b_plan.json'
ASSET = 'rome_clivus_palatinus_b'


class Design(B.Design):
    def __init__(self):
        super().__init__()
        self.native = NativeContext(DELIVERY, A)
        self.route_pads = []
        self.native_report = None
        if self.hydrology is None:
            old = DELIVERY.parent/'clivus-palatinus-b-height-fit-v2/hydrology.json'
            if old.exists():
                self.hydrology_path = old
                self.hydrology = json.loads(old.read_bytes())

    def footing(self, name, poly, ceiling):
        bottom = super().footing(name, poly, ceiling)
        evidence = self.foundations[-1]
        native_low = self.native.terrain_lower_bound(poly)
        if native_low is not None:
            bottom = min(bottom, native_low-2.02)
            evidence['original_native_mesh_lower_bound_y'] = rnd(native_low)
            evidence['native_snapshot_sha256'] = self.native.sha
            evidence['bottom_y'] = rnd(bottom)
            evidence['min_burial_m'] = rnd(min(native_low, evidence['original_cell_envelope_min_y'], evidence['new_ground_conservative_min_y'])-bottom)
            for sample in evidence['samples']:
                sample[4] = rnd(min(sample[2], sample[3])-bottom)
        return bottom


def walk(des, name, nodes, y, kind='flat_path'):
    before = len(des.route)
    count = sum(r.get('object') == name for r in des.route)
    B.walk(des, name, nodes, y, kind)
    for i, route in enumerate(des.route[before:]):
        route['id'] = name+'_route_'+str(count+i)
    get_y = y if callable(y) else lambda x, z: y
    # Cover the entire 3x3 turning area, not merely two crossing centrelines.
    for i, (x, z) in enumerate(nodes[1:-1]):
        poly = rect(x-1.5, z-1.5, x+1.5, z+1.5)
        des.route_pads.append({'id': name+'_turn_'+str(len(des.route_pads)), 'poly': poly, 'y': rnd(get_y(x, z))})
        for ix in range(13):
            for iz in range(13):
                xx, zz = x-1.499+ix*2.998/12, z-1.499+iz*2.998/12
                des.walk_samples.append((name, xx, zz, get_y(xx, zz), 'turn_square'))


def local_poly(start, direction, s0, s1, t0=-1.5, t1=1.5):
    ux, uz = direction; nx, nz = -uz, ux
    return clean([(start[0]+ux*s+nx*t, start[1]+uz*s+nz*t) for s, t in ((s0, t0), (s1, t0), (s1, t1), (s0, t1))])


RIGHT_GATE=(117.6,112+(117.6-106)*16.1/16.3)
RIGHT_OUT=(-16.1/math.hypot(16.1,16.3),16.3/math.hypot(16.1,16.3))
RIGHT_IN=tuple(-v for v in RIGHT_OUT)
RIGHT_START=tuple(RIGHT_GATE[k]+RIGHT_OUT[k]*9.1 for k in (0,1))
RIGHT_TOP=tuple(RIGHT_START[k]+RIGHT_OUT[k]*3.2 for k in (0,1))

def smooth_line(nodes):
    out=[nodes[0]]
    for a,c,d in zip(nodes,nodes[1:],nodes[2:]):
        la=math.dist(a,c);lb=math.dist(c,d);r=min(2.,la/3,lb/3)
        p=(c[0]+(a[0]-c[0])*r/la,c[1]+(a[1]-c[1])*r/la)
        q=(c[0]+(d[0]-c[0])*r/lb,c[1]+(d[1]-c[1])*r/lb)
        out.append(p)
        for i in range(1,9):
            t=i/8;out.append(((1-t)**2*p[0]+2*t*(1-t)*c[0]+t*t*q[0],(1-t)**2*p[1]+2*t*(1-t)*c[1]+t*t*q[1]))
    out.append(nodes[-1]);return out

def offset_line(nodes,offset):
    dirs=[]
    for a,c in zip(nodes,nodes[1:]):
        L=math.dist(a,c);dirs.append(((c[0]-a[0])/L,(c[1]-a[1])/L))
    out=[]
    for i,p in enumerate(nodes):
        if i==0:n=(-dirs[0][1],dirs[0][0]);out.append((p[0]+n[0]*offset,p[1]+n[1]*offset));continue
        if i==len(nodes)-1:n=(-dirs[-1][1],dirs[-1][0]);out.append((p[0]+n[0]*offset,p[1]+n[1]*offset));continue
        u,v=dirs[i-1],dirs[i];a=(-u[1],u[0]);c=(-v[1],v[0]);den=1+u[0]*v[0]+u[1]*v[1]
        out.append((p[0]+(a[0]+c[0])*offset/den,p[1]+(a[1]+c[1])*offset/den))
    return out

def hull(points):
    pts=sorted(set(points));lower=[];upper=[]
    for p in pts:
        while len(lower)>1 and A.cross(lower[-2],lower[-1],p)<=1e-8:lower.pop()
        lower.append(p)
    for p in pts[::-1]:
        while len(upper)>1 and A.cross(upper[-2],upper[-1],p)<=1e-8:upper.pop()
        upper.append(p)
    return clean(lower[:-1]+upper[:-1])

def offset_closed(poly,d):
    out=[]
    for i,p in enumerate(poly):
        a=poly[i-1];b=poly[(i+1)%len(poly)];la=math.dist(a,p);lb=math.dist(p,b)
        u=((p[0]-a[0])/la,(p[1]-a[1])/la);v=((b[0]-p[0])/lb,(b[1]-p[1])/lb)
        n=(u[1],-u[0]);m=(v[1],-v[0]);den=1+u[0]*v[0]+u[1]*v[1]
        out.append((p[0]+(n[0]+m[0])*d/den,p[1]+(n[1]+m[1])*d/den))
    return out

def side_connections(des):
    # A direct, countable stair from the original left platform, with a real
    # mouth in its wall. The obsolete parallel footSlot is retired in preview.
    stair(des,'B3_left_platform_26',(54.,163.8),(1,0),26.06,21.4,(13,13),top_flat=1.6)
    deck(des,'left_native_landing',26.06,rect(52.4,162.3,54.,165.3),'native_platform_joint')
    des.walls.extend([
      ('B3_left_native_north_rail',rect(52.4,161.9,54.,162.3),26.06,True),
      ('B3_left_native_south_rail',rect(52.4,165.3,54.,165.7),26.06,True)])
    walk(des,'left_native_landing',[(52.4,163.8),(54.,163.8)],26.06)
    walk(des,'water_court',[(63.1,163.8),(66.3,163.8),(66.3,167.7)],21.4)
    # The short southwest edge is both nearer and naturally higher than the
    # formerly chosen long, outer wall beyond the corner pier.
    raw=[(90.2,150.6),(94.,150.6),(101.,148.),(107.,144.),(110.3,139.),(111.1,134.4)]
    nodes=smooth_line(raw);C=nodes[-1];L=math.dist(C,nodes[-2]);u=((C[0]-nodes[-2][0])/L,(C[1]-nodes[-2][1])/L)
    D=(C[0]-u[0]*2.,C[1]-u[1]*2.);nodes[-1]=D
    left=offset_line(nodes,1.5);right=offset_line(nodes,-1.5)
    poly=clean(left+right[::-1]);deck(des,'B3_right_park_walk',29.2,poly,'park_connection_walk')
    deck(des,'B3_right_contact_merge',29.2,rect(90.2,152.1,93.6,152.4),'shared_level_contact')
    # The path's curved offset boundary is checked at every transverse strip;
    # broad world-axis squares are deliberately not substituted for bends.
    before=len(des.route);B.walk(des,'B3_right_park_walk',nodes,29.2)
    for i,r in enumerate(des.route[before:]):r['id']='B3_right_park_walk_'+str(i)
    for side in (-1,1):
        inner=offset_line(nodes,side*1.5);outer=offset_line(nodes,side*1.9)
        p=clean(inner+outer[::-1])
        if side==-1:
            h=lambda x,z:max(29.2,des.survey.height(x,z)-.75)
        else:h=29.2
        pp=subtract(p,rect(89.8,151.9,94.,155.6)) if side==1 else [p]
        for j,q in enumerate(pp):des.walls.append(('B3_right_park_side_'+str(side)+'_'+str(j),q,h,True))
    stair(des,'B3_right_park_18',RIGHT_START,RIGHT_IN,29.2,26.06,(9,9),bottom_flat=2.4)
    topflat=local_poly(RIGHT_START,RIGHT_IN,-3.2,0.)
    v=tuple((RIGHT_TOP[k]-C[k])/math.dist(RIGHT_TOP,C) for k in (0,1))
    cross=local_poly(D,u,0.,.001)
    landing=hull(topflat+cross+local_poly(C,u,0.,.001)+local_poly(C,v,0.,.001)+local_poly(RIGHT_TOP,v,0.,.001))
    deck(des,'B3_right_turn_landing',29.2,landing,'park_connection_turn')
    B.walk(des,'B3_right_turn_landing',[D,C,RIGHT_TOP,RIGHT_START],29.2)
    outer=offset_closed(landing,.4)
    portals=[(left[-1],right[-1]),(topflat[1],topflat[2])]
    for i,a in enumerate(landing):
        b=landing[(i+1)%len(landing)]
        if any(abs(A.cross(x,y,a))<1e-6 and abs(A.cross(x,y,b))<1e-6 for x,y in portals):continue
        des.walls.append(('B3_right_turn_guard_'+str(i),clean([a,b,outer[(i+1)%len(outer)],outer[i]]),29.2,True))
    bottom=tuple(RIGHT_GATE[k]+RIGHT_OUT[k]*2.4 for k in (0,1))
    inside=tuple(RIGHT_GATE[k]+RIGHT_IN[k]*1.6 for k in (0,1))
    p=local_poly(RIGHT_GATE,RIGHT_IN,-2.4,1.6)
    deck(des,'right_native_landing',26.06,p,'native_platform_joint')
    for side in (-1,1):
        lo,hi=sorted((side*1.5,side*1.9))
        des.walls.append(('B3_right_native_rail_'+str(side),local_poly(RIGHT_GATE,RIGHT_IN,-2.4,1.6,lo,hi),26.06,True))
    B.walk(des,'right_native_landing',[bottom,RIGHT_GATE,inside],26.06)
    des.connection_data={'left':{'native':'footS','native_floor_y':26.06,'gate':[54.,163.8,26.06],
        'opening_width_m':3.,'replacement_for':'footSlot','stairs':'B3_left_platform_26'},
      'right':{'native':'footE','native_floor_y':26.06,'gate':[*RIGHT_GATE,26.06],'outward_unit_lx_lz':list(RIGHT_OUT),
        'opening_width_m':3.,'stairs':'B3_right_park_18','centerline':nodes,
        'walk_polygon_lx_lz':poly,'turn_polygon_lx_lz':landing,'walk_y':29.2,'construction':'retained path, no unsupported thin deck'},
      'native_cutters':[
        {'id':'left_gate','polygon_lx_lz':rect(52.4,161.9,55.4,165.7),'above_y':24.7,'replace':'rail/wall/floor in exact joint; new solid stair and landing fill it'},
        {'id':'right_gate','polygon_lx_lz':local_poly(RIGHT_GATE,RIGHT_IN,-5.5,1.6,-1.6,1.6),'above_y':25.77,'replace':'parapet and duplicated paving at gate; retain wall below'}],
      'retire_native_stair':'footSlot'}
    return des.connection_data


def stair(des, name, start, direction, upper, lower, flights, top_flat=3.2, bottom_flat=3.2):
    """Any horizontal direction; flight lengths explicitly specify riser counts."""
    length = math.hypot(*direction); direction = tuple(v/length for v in direction)
    ux, uz = direction; nx, nz = -uz, ux
    count = sum(flights); rise = (upper-lower)/count; run = count*.30+(len(flights)-1)*1.3
    pos = lambda s, t=0.: (start[0]+ux*s+nx*t, start[1]+uz*s+nz*t)
    g = {'id': name, 'start': [*start, upper], 'end': [*map(rnd, pos(run)), lower], 'direction_lx_lz': list(direction),
         'riser_count': count, 'riser_height_m': rnd(rise), 'tread_depth_m': .3, 'run_m': rnd(run),
         'net_width_m': 3., 'curb_each_m': .4, 'flights': [], 'treads': [], 'intermediate_landings': [],
         'endpoint_flat_landings': [], 'rail_profiles': []}
    s, step = 0., 0
    for flight, n in enumerate(flights):
        fs, fy = s, upper-step*rise
        for j in range(n):
            step += 1; y = upper-step*rise
            name_i = name+'_tread_'+str(step).zfill(2)
            poly = local_poly(start, direction, s, s+.3)
            des.mesh(name_i, 'tread').prism(poly, y-.32, y, 'stone')
            rec = des.surface(name_i, poly, y, 'tread', index=step, flight=flight+1, center=[*map(rnd, pos(s+.15)), rnd(y)],
                leading_edge=[*map(rnd, pos(s)), rnd(y)], trailing_edge=[*map(rnd, pos(s+.3)), rnd(y)],
                run_from_m=rnd(s), run_to_m=rnd(s+.3), net_width_m=3., rise_m=rnd(rise))
            g['treads'].append(rec)
            des.ground(name_i, local_poly(start, direction, s, s+.3, -1.9, 1.9), y, .32, 'stair_cut_or_fill', 40)
            for ds in (.035, .15, .265):
                for t in (-1.499, -1., -.5, 0., .5, 1., 1.499):
                    x, z = pos(s+ds, t); des.walk_samples.append((name_i, x, z, y, 'tread'))
            s += .3
        g['flights'].append({'index': flight+1, 'steps': n, 'run_from_m': rnd(fs), 'run_to_m': rnd(s)})
        g['rail_profiles'].append({'run_from_m': rnd(fs), 'run_to_m': rnd(s), 'floor_from_y': rnd(fy), 'floor_to_y': rnd(y)})
        if flight < len(flights)-1:
            name_i = name+'_landing_'+str(flight+1)
            poly = local_poly(start, direction, s, s+1.3)
            des.mesh(name_i, 'stair_landing').prism(poly, y-.32, y, 'paving')
            rec = des.surface(name_i, poly, y, 'stair_landing', center=[*map(rnd, pos(s+.65)), rnd(y)],
                run_from_m=rnd(s), run_to_m=rnd(s+1.3), depth_m=1.3, net_width_m=3.)
            g['intermediate_landings'].append(rec)
            des.ground(name_i, local_poly(start, direction, s, s+1.3, -1.9, 1.9), y, .32, 'stair_landing_cut_or_fill', 40)
            for ds in (.05, .35, .65, .95, 1.25):
                for t in (-1.499, -.75, 0., .75, 1.499):
                    x, z = pos(s+ds, t); des.walk_samples.append((name_i, x, z, y, 'stair_landing'))
            g['rail_profiles'].append({'run_from_m': rnd(s), 'run_to_m': rnd(s+1.3), 'floor_from_y': rnd(y), 'floor_to_y': rnd(y)})
            s += 1.3
    assert abs(s-run) < 1e-6
    for which, a, b, y in (('top', -top_flat, 0., upper), ('bottom', run, run+bottom_flat, lower)):
        p = local_poly(start, direction, a, b)
        g['endpoint_flat_landings'].append({'id': name+'_'+which+'_flat', 'polygon_lx_lz': p, 'y': y, 'net_width_m': 3., 'depth_m': rnd(b-a)})
        for i in range(14):
            for j in range(13):
                x, z = pos(a+.002+(b-a-.004)*i/13, -1.499+j*2.998/12)
                des.walk_samples.append((name+'_'+which, x, z, y, 'endpoint_flat'))
    # Stairs appear in the route graph as well as in the detailed stair schema.
    des.route.append({'id': name, 'kind': 'descending_stair', 'from': g['start'], 'to': g['end'], 'net_width_m': 3., 'stair_id': name})
    des.stairs.append(g)


def landscape(des):
    B.landscape(des)
    des.plants[:] = [p for p in des.plants if not p['id'].startswith('scree_')]
    # The moved left stair needs the old lower-west bed and bench to move east.
    for b in des.beds:
        if b['id']=='west_shade':b['poly']=rect(68.4,162.1,70.6,165.5)
        if b['id'] == 'lower_west':
            b['poly'] = rect(62.35, 182.6, 63.65, 183.8)
    for p in des.plants:
        if p['kind']=='tree' and p['y']==21.4 and p['lx']<66:p['lx']=69.5
        if p['kind'] == 'tree' and p['y'] == 15. and p['lx'] < 64:
            p.update(lx=63., lz=183.2, crown_radius_m=1.05)
    for ident, poly in [('upper_south_west', rect(73, 155.2, 77, 156.5)),
                        ('upper_south_east', rect(81.5, 155.2, 85.8, 156.5)),
                        ('upper_north', rect(73, 149.1, 77, 150.6))]:
        des.beds.append({'id': ident, 'deck': 'upper_garden', 'poly': poly, 'y': 29.2, 'soil_y': 29.2, 'rim_height_m': .16})
    for i, (x, z) in enumerate(((75, 155.85), (83.7, 155.85), (75, 149.85))):
        des.plants.append({'id': 'upper_laurel_'+str(i), 'kind': 'tree', 'species': 'Laurus nobilis',
            'lx': x, 'lz': z, 'y': 29.2, 'height_m': 5.6, 'crown_radius_m': 2.2, 'clear_trunk_height_m': 2.7, 'export': False})


def furniture(des):
    B.build_landscape(des)
    bench = next(m for m in des.meshes if m.name == 'B_bench_0')
    # Move and shorten only the left bench, keeping B2's other seats editable.
    bench.verts[:] = [(62.9+(x-61.5)*1.0/2.4, z-.6, y) for x, z, y in bench.verts]
    des.furniture[0].update(center=[62.9, 180.5, 15.], width_m=1.0)
    for i, (x, z, width) in enumerate(((75, 154.75, 2.6), (83.7, 154.75, 2.8), (82., 149.65, 3.))):
        m = des.mesh('B3_upper_bench_'+str(i), 'public_seat')
        for dx in (-width*.32, width*.32):
            m.box(x+dx, z, 29.2, .30, .5, .32, 'stone')
        m.box(x, z, 29.52, width, .55, .14, 'travertine')
        des.furniture.append({'id': m.name, 'type': 'bench', 'center': [x, z, 29.2], 'width_m': width, 'depth_m': .55, 'seat_y': 29.66})
    m = des.mesh('B3_upper_terracotta_urns', 'furniture')
    for x, z in ((72.8, 155.8), (78., 149.8)):
        for h, r, rt, dy in ((0, .24, .22, .1), (.1, .22, .34, .45), (.55, .34, .22, .17)):
            m.cyl(x, z, 29.2+h, r, dy, 'tile', 12, rt)
        des.furniture.append({'id': 'upper_urn_'+str(x), 'type': 'urn', 'center': [x, z, 29.2], 'radius_m': .34, 'height_m': .72})


def trim_fountain_roof(des):
    # The existing cornice supports the garden: omit its coincident cap faces
    # under new slabs/treads while retaining every visible moulding and niche.
    m = next(m for m in des.meshes if m.name == 'B_three_niche_wall')
    result = Mesh(m.name, m.kind)
    for f, mat in zip(m.faces, m.mats):
        vv = [m.verts[i] for i in f]
        if all(abs(p[2]-29.2) < 1e-6 for p in vv):
            for p in pieces(clean([(v[0],v[1]) for v in vv]),
                            [rect(64.6,148.8,90.2,157.1),rect(64.3,154.1,64.6,157.1)]):
                result.top(p,29.2,mat)
        elif all(abs(p[1]-157.5)<1e-6 for p in vv):
            # The stair's south cheek is the shared left end of this facade.
            # Remove the buried coplanar facade face, rather than offsetting
            # two walls and leaving the visible checkerboard flicker.
            original_area=A.area([(v[0],v[2]) for v in vv])
            for p in pieces(clean([(v[0],v[2]) for v in vv]),[rect(57.,-100.,64.6,40.)]):
                if original_area<0:p=p[::-1]
                result.face([(x,157.5,y) for x,y in p],mat)
        else:
            result.face(vv,mat)
    m.verts, m.faces, m.mats = result.verts, result.faces, result.mats


def structure(des):
    for g in des.stairs:
        start, direction = g['start'][:2], g['direction_lx_lz']
        ux, uz = direction
        for i, profile in enumerate(g['rail_profiles']):
            a, b = profile['run_from_m'], profile['run_to_m']
            ya, yb = profile['floor_from_y'], profile['floor_to_y']
            def h(x, z, a=a, b=b, ya=ya, yb=yb, start=start, ux=ux, uz=uz):
                return ya+(yb-ya)*(((x-start[0])*ux+(z-start[1])*uz-a)/(b-a))
            for side in (-1, 1):
                lo, hi = sorted((side*1.5, side*1.9))
                if g['id']=='B3_right_44' and side==-1:
                    lo=-2.3  # B5: east cheek reaches the single flank plane lx94.4
                poly=local_poly(start, direction, a, b, lo, hi)
                if g['id']=='B3_left_lower_36' and side==1:
                    # The west water-court wing now stands beside the stair.
                    # Guard its HIGH floor, rather than let a falling rail
                    # expose the drop beside its 21.4m paving.
                    high=intersect(poly,rect(53.,170.9,59.,181.))
                    for q in subtract(poly,rect(53.,170.9,59.,181.)):
                        wall(des,g['id']+'_cheek_'+str(side)+'_'+str(i)+'_lower',q,h)
                    if high:wall(des,g['id']+'_cheek_'+str(side)+'_'+str(i)+'_high',high,21.4)
                else:wall(des, g['id']+'_cheek_'+str(side)+'_'+str(i), poly, h)
    specs = [
        ('arrival_north_east',60.4,146.3,60.8,146.7,34.2), ('arrival_west',57.,146.7,57.4,149.9,34.2),
        ('arrival_east',60.4,146.7,60.8,149.9,34.2),
        ('corner_west',57.,154.1,57.4,157.5,31.7), ('corner_south',57.4,157.1,60.4,157.5,31.7),
        ('upper_north',64.6,148.4,90.6,148.8,29.2), ('upper_west_north',64.2,148.8,64.6,154.1,29.2),
        ('upper_east_north',90.2,148.8,90.6,149.1,29.2),
        ('upper_contact_east',93.6,152.4,94.4,155.6,29.2), ('upper_east_after_gate',90.2,155.6,90.6,157.1,29.2),
        ('water_back_contact',57.,153.7,64.2,154.1,21.4),
        ('water_north_guard',88.,158.6,90.2,159.,21.4),
        ('water_west_after_gate',61.7,171.,62.1,178.5,21.4),
        ('water_east_after_stair',94.,172.7,94.4,178.95,21.4), ('water_front',62.1,178.5,94.4,178.95,21.4),
        ('seating_west_north',61.7,179.,62.1,184.4,15.),
        ('seating_west_exposed',53.6,181.,54.,189.4,15.),
        ('seating_east',91.,178.5,91.4,189.4,15.), ('seating_front_west',54.,189.,68.1,189.4,15.),
        ('seating_front_east',71.9,189.,91.4,189.4,15.),
        ('street_notch_west',67.7,182.5,68.1,189.,15.), ('street_notch_east',71.9,182.5,72.3,189.,15.)]
    for name, xa, za, xb, zb, y in specs:
        wall(des, 'B3_'+name, rect(xa, za, xb, zb), y, outer=True)
    # This is a rail ON the cornice, never a foundation wall through the niches.
    rail=des.mesh('B3_upper_south_parapet_on_cornice','parapet')
    rail.prism(rect(64.6,157.1,90.2,157.5),29.08,30.03,'stone')
    rail.prism(rect(64.6,157.1,90.2,157.5),30.03,30.15,'travertine')
    for x in (65.,73.,81.,89.):
        rail.box(x,157.5,29.2,.50,.50,1.05,'stone')
        rail.box(x,157.5,30.25,.66,.66,.12,'travertine')
    # A continuous structural back supports the planted upper terrace, behind
    # the shallow niche backs. Solid end pier completes the cornice's east end.
    wall(des, 'B3_fountain_structural_back', rect(64.6,155.65,90.2,156.1), 28.92, False)
    wall(des, 'B3_fountain_east_support', rect(88.3,156.1,90.2,157.1), 29.2, False)
    for name, p, y, rail in des.walls:
        wall(des, name, p, y, rail)
    for x in (65., 80., 89.):
        wall(des, 'B3_square_buttress_'+str(int(x)), rect(x-.4,178.3,x+.4,178.9), 21.4, False)
    b5_closures(des)


POCKET=rect(54.,153.7,57.,161.9)
POCKET_TOP=27.4      # = cap of the footS parapet beside it (palPlatWalls 27.0-27.4)
PIER_N,PIER_E=(54.,176.76),(58.3,181.06)   # NE face of the old footS corner pier (lz-lx=122.76)


def b5_closures(des):
    """B5: solid closures where B4 left the hill's open underside in view."""
    # Upper slot: the dead-end pocket between footS/beltS (lx54), the corner
    # tower (lx57) and the 26-step stair is filled solid to the parapet line.
    wall(des,'B5_upper_slot_block',POCKET,POCKET_TOP,False)
    # Its north edge retains the old slope up to the existing ground.
    north=lambda x,z:max(POCKET_TOP,des.survey.height(x,153.55)+.15)
    wall(des,'B5_upper_slot_north_retaining',rect(54.,153.7,57.,154.1),north,False)
    # Under beltS and its corner tower the hill wall ends at 32.15m on old
    # ground (its rock skirt is only a few west-leaning triangles). Underpin
    # it in the hill wall plane from the block top up to that line, so no
    # view passes under the old wall. Stops at the diagonal footS pier.
    m=des.mesh('B5_beltS_underpinning','retaining_wall')
    # Round 2: face at lx54.47 (2cm proud of the beltS plinth face, never
    # coplanar), top 32.22 (7cm up behind that plinth), south end buried
    # ~3.5cm inside the diagonal footS pier instead of stopping short of it.
    for p in (rect(54.,153.7,54.7,155.3),[(54.,155.3),(54.47,155.3),(54.47,157.17),(54.,157.13)]):
        m.prism(p,POCKET_TOP-.12,32.22,B.WALL_STONE)
    # Lower joint: the footS corner pier (exposed once footSlot is retired)
    # already has a complete NE face 18.9-25.65m on lz-lx=122.76. The wing's
    # deck and podium now stop on that face; no B5 skin is added over it
    # (a coplanar skin would z-fight).


def b5_courses(des):
    """Level string courses so no face runs more than 9m unbroken."""
    m=next(m for m in des.meshes if m.name=='B_court_finishing')
    # Round 2: every string course projects 0.15m and is 0.20m tall, one
    # level per terrace: 20.94-21.14 (water court), 14.54-14.74 (seating).
    for ya,yb in ((20.94,21.14),(14.54,14.74)):
        m.prism(rect(94.4,152.4,94.55,179.1),ya,yb,'travertine')       # east flank lx94.4, whole face
    m.prism(rect(91.4,178.95,94.4,179.1),14.54,14.74,'travertine')      # front wall east of the seating court
    m.prism(rect(91.4,179.1,91.55,189.55),14.54,14.74,'travertine')     # seating east face, wraps the front band
    # Upper terrace: the fountain cornice's top band continued along the corner
    # tower, stopping on one square end block (27.75-29.2) where the moulded
    # entablature begins at lx61.7, so the cornice ends in one clean piece.
    m.prism(rect(57.,157.5,61.2,157.85),28.8,29.2,'travertine')
    m.prism(rect(61.2,157.5,61.7,157.85),27.75,29.2,'travertine')


def podium_contacts(des):
    """Extend the lower podiums into their higher neighbours, below every tread.

    These are real retained masonry volumes, not a narrow connecting bridge or
    a cosmetic top face over the old slots. The native footS edge is lx=54.
    Existing deck levels and all stair positions remain locked.
    """
    specs=[
        ('water_to_native',rect(54.,154.1,64.2,171.),21.4,
         'west edge directly abuts native footS; rear fill closes the slot behind the 26-step stair'),
        ('water_west_wing',[(54.,171.),(58.3,171.),(58.3,181.),(58.24,181.),(54.,176.76)],21.4,
         'water-court wing extends alongside the stair and touches footS until the old wall ends at lz181'),
        ('seating_to_native',rect(54.,181.,62.1,189.),15.,
         'lower base extends west to native footS and north to the water-court shoulder'),
        ('seating_to_water',rect(62.1,178.5,91.,179.),15.,
         'lower rear base directly meets the upper water-court retaining face at lz178.5')]
    des.podium_contacts=[]
    for name,poly,y,note in specs:
        bot=des.footing('B4_'+name,poly,y-.28)
        m=des.mesh('B4_'+name+'_solid_podium','joined_podium_mass')
        m.prism(poly,bot,y-.28,'stone')
        des.ground('B4_'+name+'_infill',poly,y,.28,'podium_contact_infill',18)
        des.podium_contacts.append({'id':name,'polygon_lx_lz':poly,'floor_y':y,
            'solid_top_y':y-.28,'foundation_bottom_y':bot,'nominal_contact_gap_m':0.,'note':note})


def build_design():
    des = Design(); landscape(des)
    stair(des,'B3_left_NS_14',(58.9,149.9),(0,1),34.2,31.7,(14,),bottom_flat=3.)
    stair(des,'B3_left_E_14',(60.4,155.6),(1,0),31.7,29.2,(14,),top_flat=3.)
    stair(des,'B3_right_44',(92.1,155.6),(0,1),29.2,21.4,(11,11,11,11))
    stair(des,'B3_left_lower_36',(60.2,171.),(0,1),21.4,15.,(12,12,12))
    stair(des,'B_street_stair',(70.,182.5),(0,1),15.,8.5,(12,12,12))
    core = rect(64.6,148.8,90.2,157.1)
    main = [(54.,154.1),(64.2,154.1),(64.2,157.5),(62.,157.5),(62.,159),(94,159),(94,178.5),
            (62.1,178.5),(62.1,171),(58.3,171),(58.3,181),(58.24,181),(54.,176.76)]
    lower = [(54.,181),(58.3,181),(58.3,184.4),(62.1,184.4),(62.1,178.5),
             (91,178.5),(91,189),(71.9,189),(71.9,182.5),(68.1,182.5),(68.1,189),(54.,189)]
    for name, poly, y, role in [('arrival',rect(57.4,146.7,60.4,149.9),34.2,'arrival_strip'),
            ('left_corner',rect(57.4,154.1,60.4,157.1),31.7,'corner_landing'),
            ('upper_garden',core,29.2,'upper_public_garden'),
            ('upper_contact',rect(90.2,152.4,93.6,155.6),29.2,'edge_stair_contact'),
            ('water_court',main,21.4,'primary_public_court'),('seating_court',lower,15.,'primary_public_court')]:
        holes = [b['poly'] for b in des.beds if b['deck'] == name]
        if name == 'water_court':
            holes += [rect(64,157.8,86,160.3),rect(74.425,160.3,75.575,177.35),rect(90.2,155.6,94,172.7),rect(54.,161.9,63.1,165.7),rect(54.,154.1,57.,161.9)]
        if name == 'seating_court':
            holes += [rect(83.5,179,86.5,181.3)]
        deck(des,name,y,poly,role,holes)
    # B5: B4 left both ends of the basin unpaved (lx62..64 and lx86..90.2 in
    # front of the fountain base), so the eye fell 0.28m onto soil/podium top.
    deck(des,'B5_fountain_west_end_paving',21.4,rect(62.,157.5,64.,159.),'fountain_end_joint')
    deck(des,'B5_fountain_east_end_paving',21.4,[(86.,157.5),(88.,157.5),(88.,156.1),(88.3,156.1),(88.3,157.1),
        (90.2,157.1),(90.2,158.6),(88.,158.6),(88.,159.),(86.,159.)],'fountain_end_joint')
    # Garden fill supersedes the obsolete low rear-of-fountain excavation.
    retained=[]
    for t in des.targets:
        if t['id'].startswith('upper_garden_fill_'):
            # The front garden slab rests on the fountain cornice/arches.
            # Its earth must stop behind the structural back; filling the
            # whole deck footprint would silently bury the real niches.
            p=intersect(t['polygon_lx_lz'],rect(64.6,148.8,90.2,155.65))
            if not p:
                continue
            t['polygon_lx_lz']=[list(q) for q in p]
            t['priority'] = 22
        retained.append(t)
    des.targets=retained
    # The last old stair has 5cm cap returns for its first 3cm. Follow that
    # real clear opening instead of claiming an unobstructed 2.6m rectangle.
    seam=[(57.65,146.44),(60.15,146.44),(60.15,146.46),(60.2,146.47),
          (60.2,146.7),(57.6,146.7),(57.6,146.47),(57.65,146.46)]
    deck(des,'native_joint',34.2,seam,'existing_stair_joint')
    for dz in (.002,.13,.258):
        half=1.249 if dz<.03 else 1.299
        for dx in (-half,-.65,0.,.65,half):
            des.walk_samples.append(('native_joint',58.9+dx,146.44+dz,34.2,'existing_width_joint'))
    des.route.append({'id':'native_joint','kind':'existing_width_joint','from':[58.9,146.44,34.2],
                      'to':[58.9,146.7,34.2],'net_width_m':2.5,'exception':'2.5m clear for the first 0.03m at old cap returns; then 2.6m, widening to 3m arrival'})
    deck(des,'street_landing',8.5,rect(68.1,195.9,71.9,199.1),'street_junction_strip')
    walk(des,'arrival',[(58.9,146.7),(58.9,148.3),(58.9,149.9)],34.2)
    walk(des,'left_corner',[(58.9,154.1),(58.9,155.6),(60.4,155.6)],31.7)
    walk(des,'upper_garden',[(64.6,155.6),(70.4,155.6),(70.4,152.7),(88.,152.7),(88.,154.),(92.1,154.),(92.1,155.6)],29.2)
    walk(des,'upper_garden',[(88.,152.7),(88.,150.6),(90.2,150.6)],29.2)
    walk(des,'water_court',[(92.1,172.7),(92.1,174.3),(80,174.3),(80,167.7),(63,167.7),(63,169.4),(60.2,169.4),(60.2,171)],21.4)
    walk(des,'seating_court',[(60.2,184.4),(60.2,186),(65.3,186),(65.3,181.5),(66.1,181.5),(66.1,180.8),(70,180.8),(70,182.5)],15.)
    walk(des,'seating_court',[(70,180.8),(79,180.8),(79,186.8),(88,186.8)],15.)
    walk(des,'street_landing',[(70,195.9),(70,199.1)],8.5)
    side_connections(des)
    B.fountain(des); B.water_features(des); furniture(des); tail(des)
    # B5: the toe stops at the seating court. East of it (lx91..94.4) the old
    # target was a 0.9m soil ridge raised to 15m over the 9-10m valley, whose
    # south face showed as raw soil; the front wall now meets the old ground.
    des.ground('main_front_toe',rect(62.1,178.5,91.,179.4),15.,.28,'wall_toe_cut',15)
    des.ground('seating_front_toe',rect(54.,189,91.5,189.6),8.5,.22,'wall_toe_cut',15)
    podium_contacts(des)
    structure(des); B.architectural_finish(des); b5_courses(des); trim_fountain_roof(des)
    # These new cheeks replace overlapping old buttress skin as solid
    # masonry. Keep the old wall BELOW the walking mouth, while removing
    # only the exact volumes now occupied by the new side walls.
    for f in des.foundations:
        if f['id'].startswith(('B3_right_park_18_cheek','B3_right_native_rail')):
            des.connection_data['native_cutters'].append({'id':'shared_'+f['id'],'polygon_lx_lz':f['polygon_lx_lz'],
                'above_y':f['bottom_y'],'replace':'old stone skin replaced by this solid new cheek/rail; shared-wall cleanup only'})
    # Trim the old decorative front belt clear of the new west stair corridor.
    m = next(m for m in des.meshes if m.name == 'B_court_finishing')
    m.verts[:] = [(62.1 if abs(x-60)<1e-6 and 178.94<z<179.12 and 20.9<y<21.2 else x,z,y) for x,z,y in m.verts]
    # B5 cutters: old ground/turf inside or above the new solids, and the hill's
    # loose ledge pieces inside the filled upper slot.
    des.terrain_cutters=[{'id':'B5_upper_slot_block','polygon_lx_lz':POCKET,'above_y':POCKET_TOP-.12,
        'replace':'old slope inside the filled slot'}]
    # Convex pieces only (the preview clips by half-planes): east of the beltS
    # corner tower (lx<=54.7 below lz155.3) and clear of the diagonal footS pier.
    for k,poly in enumerate((rect(54.71,153.7,57.,155.3),rect(54.46,155.3,57.,156.87),
                             [(55.6,156.87),(57.,156.87),(57.,158.9),(56.25,158.9)])):
        des.connection_data['native_cutters'].append({'id':'B5_upper_slot_rock_'+str(k),'polygon_lx_lz':poly,
            'above_y':POCKET_TOP-.12,'replace':'hill rock skirt / ledge pieces inside or above the new solid slot block'})
    # Round 2: the west-leaning rock skirt under beltS crossed the underpinning
    # face (zig-zag crack). Remove it between block top and the beltS wall
    # foot only (below_y), so beltS, its corner tower and the pier stay whole.
    des.connection_data['native_cutters'].append({'id':'B5_beltS_rock_skirt','polygon_lx_lz':rect(54.05,153.7,55.75,156.87),
        'above_y':POCKET_TOP-.12,'below_y':32.21,'replace':'rock skirt under beltS, now behind/inside the B5 underpinning'})
    # ...and its last piece wrapping the diagonal pier's NE face (stops 4cm
    # in front of that face, lz-lx=102.62 against the pier's 102.66).
    des.connection_data['native_cutters'].append({'id':'B5_beltS_rock_skirt_pier','polygon_lx_lz':[(54.25,156.87),(55.75,156.87),(55.75,158.37)],
        'above_y':POCKET_TOP-.12,'below_y':32.21,'replace':'rock skirt in front of the footS diagonal pier, above the slot block'})
    return des


def check_design(des):
    meshes = [m for m in des.meshes if m.export]
    triangles = sum(len(m.faces) for m in meshes)
    assert triangles <= BUDGET, triangles
    assert len({m.name for m in meshes}) == len(meshes)
    assert min(p[1] for m in meshes for p in m.verts) >= 118
    assert all(p[1]>=144 or p[0]>=95 for m in meshes for p in m.verts), 'Do not extend into the original Apollo cliff'
    assert len({r['id'] for r in des.route}) == len(des.route)
    rays = check_walk_meshes(des, A)
    plant_checks = check_plants(des)
    # Check through the actual niche openings in the FRONT direction. The
    # upper garden's rail must not turn into a full wall across those openings.
    niche_checks=[]
    for cx in (68.,75.,82.):
        for y in (24.1,26.):
            x=cx+.8; hits=[]
            for m in meshes:
                for f in m.faces:
                    vv=[(m.verts[i][0],m.verts[i][2],m.verts[i][1]) for i in f]
                    z=A.ray_y(x,y,*vv)
                    if z is not None and 155.5<z<=157.6:
                        hits.append(z)
            assert hits and abs(max(hits)-156.4)<1e-5,(x,y,hits)
            niche_checks.append({'lx':x,'y':y,'nearest_back_lz':rnd(max(hits)),'clear_recess_depth_m':1.1})
    continuity = []
    for g in des.stairs:
        parts = sorted(g['treads']+g['intermediate_landings'],key=lambda p:p['run_from_m'])
        gaps = [abs(a['run_to_m']-b['run_from_m']) for a,b in zip(parts,parts[1:])]
        assert max(gaps) < 1e-6 and len(g['treads']) == g['riser_count']
        assert abs(parts[-1]['y']-g['end'][2]) < 1e-6
        assert abs(g['start'][2]-parts[0]['y']-g['riser_height_m']) < 1e-6
        assert max(abs(a['y']-b['y']) for a,b in zip(parts,parts[1:])) <= .181
        assert all(abs(abs(A.area(p['polygon_lx_lz']))-.9)<1e-6 for p in g['treads'])
        continuity.append({'id':g['id'],'steps':g['riser_count'],'run_m':g['run_m'],
                           'riser_m':g['riser_height_m'],'gap_m':rnd(max(gaps))})
    burial = min(f['min_burial_m'] for f in des.foundations)
    assert burial >= 2.
    assert not any(m.export and m.kind in ('tree','preview_tree') for m in meshes)
    return {'status':'passed','scope':'new B3 geometry only','triangles':triangles,'triangle_budget':BUDGET,
        'component_meshes':len(meshes),'material_export_meshes':len(exportable_meshes(des)),
        'actual_mesh_walk_samples':len(des.walk_samples),'required_new_width_m':3.,'required_headroom_m':2.4,
        'existing_joint_width_m':2.5,'existing_stair_nominal_width_m':2.6,'stair_continuity':continuity,'walk_mesh_checks':rays,'plant_checks':plant_checks,
        'niche_void_checks':niche_checks,
        'foundation_bays':len(des.foundations),'min_burial_below_lower_soil_m':burial,
        'Blender_started':False,'GLB_verified':False,'scene_acceptance':'pending coordinator'}


def make_plan(des, checks=None):
    checks = checks or check_design(des)
    plan = B.make_plan(des,checks)
    plan.update(schema='rome_clivus_palatinus.plan-B.joined-podiums-v4',
        delivery_status='PURE PYTHON GEOMETRY CHECKED; Blender/GLB/city acceptance pending',
        native_scene_status='See native_scene_comparison; internal clearance is independent of existing houses and upstream rock.',
        primary_public_levels=[29.2,21.4,15.], route_turn_pads=des.route_pads,
        adjustments=['Restored 29.2m occupiable upper garden supported by the wall-fountain mass.',
            'Left 14+14 stairs turn on a clear 3x3m platform; right descent is 44 steps in 4 flights of 11.',
            'Water-court slab excludes right stair lx90.2..94 to lz172.7; west edge clears lx57.5..61.3 lower stair.',
            'Removed lx61 front buttress, relocated lower-west bed/bench, retained full central-stair notch.',
            'Lower-court intermediate bend moved lx66.4 to66.1 so its complete 3x3m turn pad clears the notch parapet.',
            'Old stair cap returns leave a 2.5m throat for 0.03m, then 2.6m; the new arrival and stairs are 3m.',
            'Left footS 26.06m joins water court by 26 steps; right footE 26.06m joins upper garden by a retained path and 18 steps.',
            'The obsolete footSlot is replaced; two exact wall/paving openings are documented in side_connections.'])
    plan['upper_garden']={'level_y':29.2,'core_polygon_lx_lz':rect(64.6,148.8,90.2,157.1),
        'gross_core_area_m2':212.48,'support':'solid structural back, east pier and retained fountain cornice',
        'benches':3,'tree_groups':3,'status':'new proposed garden; not an existing native platform'}
    plan['side_connections']=des.connection_data
    plan['podium_contacts']=des.podium_contacts
    plan['terrain_cutters']=getattr(des,'terrain_cutters',[])
    plan['adjustments'].append('Extended the lower water/seating podiums to touch the upper/native masonry, closing all three author-marked rear slots without raising any floor or moving a stair.')
    def route_ids(name):
        return [r['id'] for r in des.route if r.get('object')==name]
    plan['main_route_order']=(['native_joint']+route_ids('arrival')+['B3_left_NS_14']+route_ids('left_corner')+
        ['B3_left_E_14']+route_ids('upper_garden')+['B3_right_44']+route_ids('water_court')+
        ['B3_left_lower_36']+route_ids('seating_court')[:7]+['B_street_stair']+
        route_ids('street_landing')+route_ids('B_street_path'))
    plan['ray_acceptance']={'point_columns':['route_object','lx','lz','absolute_y','kind','matched_floor_mesh','required_width_m'],
        'samples':[[n,rnd(x),rnd(z),rnd(y),k,des.ray_objects[i],(2.5 if z<146.47 else 2.6) if k=='existing_width_joint' else 3.]
                   for i,(n,x,z,y,k) in enumerate(des.walk_samples)],
        'sampling':'<=0.25m along flat routes; seven transverse points; full 3x3m turn grids; per-tread cross sections',
        'required_headroom_m':2.4,'boundary_inset_tolerance_m':.001}
    plan['native_scene_comparison']=des.native_report or des.native.audit(des)
    plan['current_native_heights']={'source':'height-audit/heights.json','immutable':True,'new_upper_garden_y':29.2,
        'existing_stair_final_y':34.2,'existing_right_parks_y':[26.06,42.06]}
    plan['pending']=['Coordinator single Blender process: export editable components and material-merged GLB, verify normals.',
        'Real city/reference renders: garden activity plane, parapet proportions, rock exposure, soil joins.',
        'Existing house placeholders and upstream native turn-platform rock intrusion; see native_scene_comparison.',
        'Apply the documented native footS/footE openings and retire footSlot during formal integration; preview changes stay in memory only.',
        'Upper-garden supply adaptation and hidden services remain with coordinator.']
    return plan


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan-only',action='store_true')
    args=parser.parse_args()
    if not args.plan_only:
        parser.error('Only --plan-only is permitted here; Blender belongs to the coordinator.')
    des=build_design(); checks=check_design(des)
    des.native_report=des.native.audit(des)
    audit_path=DELIVERY/'native-route-audit.json'
    audit_path.write_text(json.dumps(des.native_report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    PLAN_PATH.write_text(json.dumps(make_plan(des,checks),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'plan':str(PLAN_PATH),'checks':checks,'native_summary':des.native_report['summary']},ensure_ascii=False))


if __name__=='__main__':
    main()
