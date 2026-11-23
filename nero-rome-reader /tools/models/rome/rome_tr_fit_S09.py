"""The Domus Transitoria's S09 kitchen fittings, in palace coordinates."""

import math
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from tr_furnishings import deliver, rk


NAME = "rome_tr_fit_S09"
ROOM = "S09"
LIMIT = 15000
FLOOR = .06
FRAME = rk.Frame()
SLOTS = ()

VIEWS = (
    ("cam1-from-north-door.png", (28, -36.8, 1.66), (28, -45.2, 1.0), 32),
    ("cam2-from-west-door.png", (24.8, -40, 1.66), (31.5, -41.5, 1.0), 17.5),
    ("cam3-plan.png", (28, -41, 14), (28, -41, 0), 34),
    ("cam4-hearth-close.png", (28, -42.6, 1.5), (27, -45.2, 1.0), 23),
)

# These geometry group keys become vertex colours under the canonical materials.
TINTS = {
    "hearth_mortar": ("brick", (.33, .24, .20)),
    "hearth_bed": ("brick", (.40, .30, .25)),
    "brick_russet": ("brick", (.62, .37, .25)),
    "brick_dust": ("brick", (.57, .38, .27)),
    "brick_muted": ("brick", (.54, .31, .22)),
    "brick_burnt": ("brick", (.46, .28, .22)),
    "brick_pale": ("brick", (.66, .44, .32)),
    "chamber_lining": ("int_reveal", (.20, .13, .095)),
    "cavity_back": ("int_reveal", (.125, .09, .066)),
    "iron_dark": ("int_reveal", (.18, .18, .17)),
    "iron_edge": ("int_reveal", (.25, .24, .21)),
    "ember_dark": ("int_plaster", (.29, .08, .051)),
    "ember_red": ("int_plaster", (.71, .18, .07)),
    "ember_orange": ("int_plaster", (.98, .49, .14)),
    "dome_ivory": ("int_plaster", (.74, .65, .51)),
    "dome_base": ("int_plaster", (.65, .54, .41)),
    "dome_entry": ("int_plaster", (.66, .55, .43)),
    "stone_light": ("stone", (.67, .64, .55)),
    "stone_mid": ("stone", (.58, .55, .47)),
    "stone_inner": ("stone", (.49, .46, .40)),
    "stone_mortar": ("stone", (.53, .48, .40)),
    "copper_body": ("bronze", (.72, .42, .23)),
    "copper_rim": ("bronze", (.80, .54, .28)),
    "copper_dark": ("bronze", (.47, .28, .17)),
    "copper_flat": ("bronze", (.63, .36, .23)),
    "clay_red": ("tile", (.64, .32, .23)),
    "clay_earth": ("tile", (.63, .47, .32)),
    "clay_tan": ("tile", (.72, .52, .36)),
    "clay_rim": ("tile", (.68, .43, .30)),
    "clay_inside": ("tile", (.44, .27, .20)),
    "clay_seal": ("tile", (.52, .40, .29)),
    "wood_medium": ("wood", (.47, .31, .19)),
    "wood_warm": ("wood", (.54, .36, .22)),
    "wood_light": ("wood", (.57, .40, .25)),
    "wood_dark": ("wood", (.34, .22, .14)),
    "split_wood": ("wood", (.65, .47, .29)),
    "split_end": ("wood", (.70, .52, .35)),
    "split_bark": ("wood", (.32, .22, .14)),
    "willow_dark": ("wood", (.48, .32, .18)),
    "willow_light": ("wood", (.68, .47, .24)),
    "fish_back": ("int_plaster", (.39, .48, .46)),
    "fish_flank": ("int_plaster", (.63, .69, .62)),
    "fish_belly": ("int_plaster", (.76, .75, .64)),
    "fish_eye": ("int_plaster", (.24, .24, .20)),
    "meat_side": ("int_plaster", (.52, .23, .18)),
    "meat_face": ("int_plaster", (.65, .31, .24)),
    "meat_rim": ("int_plaster", (.77, .56, .40)),
    "garlic_pale": ("int_plaster", (.83, .75, .58)),
    "garlic_shade": ("int_plaster", (.71, .62, .49)),
    "herb_leaf": ("int_plaster", (.39, .46, .26)),
    "herb_light": ("int_plaster", (.51, .55, .30)),
    "bread_crust": ("int_plaster", (.71, .48, .26)),
    "bread_light": ("int_plaster", (.78, .57, .33)),
    "greens_dark": ("int_plaster", (.36, .44, .23)),
    "greens_light": ("int_plaster", (.54, .59, .30)),
}
BRICKS = ("brick_russet", "brick_dust", "brick_muted", "brick_pale", "brick_burnt")


def box(x, y, z, width, depth, height, mat):
    rk.box(FRAME, x, y, z, width, depth, height, mat)


def rod(a, b, thickness, mat):
    rk.beam(FRAME, *a, *b, thickness, thickness, mat)


def connect(first, second, mat, smooth=False):
    """Make the faces between consecutive closed rings, with a point at a cap."""
    count = max(len(first), len(second))
    for i in range(count):
        j = (i + 1) % count
        if len(first) == 1:
            face = (first[0], second[j], second[i])
        elif len(second) == 1:
            face = (first[i], first[j], second[0])
        else:
            face = (first[i], first[j], second[j], second[i])
        rk.add_poly(mat, face, smooth)


def vessel(profile, place, material, segments=12):
    """Profile has radius/height pairs in bottom-to-rim-to-inside order."""
    angles = [math.tau * j / segments for j in range(segments)]
    rings = [[place(0, 0, z)] if r == 0 else
             [place(r * math.cos(a), r * math.sin(a), z) for a in angles]
             for r, z in profile]
    for i, (first, second) in enumerate(zip(rings, rings[1:])):
        tint = material[i] if isinstance(material, (list, tuple)) else material
        connect(first, second, tint, profile[i][1] != profile[i+1][1])


def vertical(x, y, z):
    return lambda u, v, height: (x + u, y + v, z + height)


def arc_points(cx, spring, radius, segments=10):
    return [(cx - radius * math.cos(math.pi * i / segments),
             spring + radius * math.sin(math.pi * i / segments))
            for i in range(segments + 1)]


def clip(poly, axis, value, sign):
    result = []
    for a, b in zip(poly[-1:] + poly[:-1], poly):
        da, db = (a[axis] - value) * sign, (b[axis] - value) * sign
        if (da < 0) != (db < 0):
            weight = da / (da - db)
            result.append((a[0] + weight * (b[0]-a[0]), a[1] + weight * (b[1]-a[1])))
        if db >= 0:
            result.append(b)
    return result


def brickwork(outline, surface, backing, z0, course=.113, length=.318):
    """Lay running-bond facing on a planar patch and stop it at actual openings."""
    area = abs(sum(a[0] * b[1] - a[1] * b[0] for a,b in zip(outline, outline[1:] + outline[:1])))
    if len(outline) < 3 or area < 1e-8:
        return
    points = list(outline)
    rk.add_poly("hearth_mortar", [backing(*point) for point in points])
    xmin, xmax = min(p[0] for p in points), max(p[0] for p in points)
    zmin, zmax = min(p[1] for p in points), max(p[1] for p in points)
    for row in range(math.floor((zmin-z0)/course), math.ceil((zmax-z0)/course)):
        bottom = z0 + row*course
        band = clip(clip(points, 1, bottom+.004, 1), 1, bottom+course-.004, -1)
        shift = (row % 2) * length/2
        for index in range(math.floor((xmin-shift)/length), math.ceil((xmax-shift)/length)):
            x = shift + index*length
            brick = clip(clip(band, 0, x+.004, 1), 0, x+length-.004, -1)
            if len(brick) >= 3:
                tint = BRICKS[(index*7 + row*3) % len(BRICKS)]
                rk.add_poly(tint, [surface(*point) for point in brick])


def front_bricks(points, y):
    brickwork(points, lambda x,z: (x,y,z), lambda x,z: (x,y-.006,z), FLOOR)


def front_rectangle(x0, x1, z0, z1, y):
    front_bricks([(x0,z0), (x0,z1), (x1,z1), (x1,z0)], y)


def wood_log(start, end, size, phase):
    """Split firewood with differently coloured bark, wood and end-grain."""
    x0, y0, z0 = start
    x1, y1, z1 = end
    dx, dy = x1-x0, y1-y0
    norm = math.hypot(dx, dy)
    ux, uy = dy/norm, -dx/norm
    cross = [(-.53, -.24), (.32, -.43), (.56, -.03), (.11, .47), (-.37, .37)]
    shift = phase % len(cross)
    cross = cross[shift:] + cross[:shift]
    ends = [[(x + ux*u*size*scale, y + uy*u*size*scale, z + v*size*scale)
             for u,v in cross] for x,y,z,scale in
            ((x0,y0,z0,1.0), (x1,y1,z1,.89))]
    rk.add_poly("split_end", ends[0][::-1])
    rk.add_poly("split_end", ends[1])
    for i in range(len(cross)):
        j = (i+1) % len(cross)
        rk.add_poly("split_bark" if (i+phase)%3 == 0 else "split_wood",
                    (ends[0][i], ends[0][j], ends[1][j], ends[1][i]))


def firewood_arch(center, front, spring, radius):
    inside, outside = arc_points(center, spring, radius), arc_points(center, spring, radius+.077)
    clear_profile = [(center-radius,FLOOR), *inside, (center+radius,FLOOR)]
    outer_profile = [(center-radius-.077,FLOOR), *outside, (center+radius+.077,FLOOR)]
    for i, ((u0,z0), (u1,z1), (v0,h0), (v1,h1)) in enumerate(
            zip(clear_profile, clear_profile[1:], outer_profile, outer_profile[1:])):
        rk.add_poly(BRICKS[(i+2) % len(BRICKS)],
                    ((u0,front,z0), (v0,front,h0), (v1,front,h1), (u1,front,z1)))
        rk.add_poly("brick_burnt", ((u0,front,z0), (u1,front,z1),
                                  (u1,front-.12,z1), (u0,front-.12,z0)))
        rk.add_poly("chamber_lining", ((u0,front-.12,z0), (u1,front-.12,z1),
                                     (u1,-45.58,z1), (u0,-45.58,z0)))
    rk.add_poly("cavity_back", [(x,-45.58,z) for x,z in clear_profile])
    rk.add_poly("hearth_bed", ((center-radius,front,FLOOR+.004),
                             (center-radius,-45.58,FLOOR+.004),
                             (center+radius,-45.58,FLOOR+.004),
                             (center+radius,front,FLOOR+.004)))
    for i in range(8):
        layer, col = divmod(i, 4)
        x = center + (col-1.5)*.168 + layer*.021
        z = .143 + layer*.127 + (i%3)*.009
        near = -44.95 - (i%3)*.036 - .047*layer
        wood_log((x,near-.50,z-.012), (x+.019,near,z), .157, i)


def hearth():
    x0, x1, rear, near = 24.4, 31.6, -45.70, -44.80
    top, spring, radius = FLOOR+.85, FLOOR+.05, .45
    centers = (25.22, 26.61, 28, 29.39, 30.78)
    outside = radius+.077
    cursor = x0
    for cx in centers:
        front_rectangle(cursor, cx-outside, FLOOR, top, near)
        curve = arc_points(cx, spring, outside)
        for (a,h0),(b,h1) in zip(curve, curve[1:]):
            front_bricks([(a,h0),(a,top),(b,top),(b,h1)], near)
        firewood_arch(cx, near, spring, radius)
        cursor = cx+outside
    front_rectangle(cursor, x1, FLOOR, top, near)
    for x in (x0,x1):
        inward = .006 if x == x0 else -.006
        patch = [(rear,FLOOR),(rear,top),(near,top),(near,FLOOR)]
        if x == x1:
            patch.reverse()
        brickwork(patch, lambda y,z:(x,y,z), lambda y,z:(x+inward,y,z), FLOOR)
    # Closed rear and top, with no masonry face across the front apertures.
    rk.add_poly("brick_muted", ((x0,rear,FLOOR),(x1,rear,FLOOR),(x1,rear,top),(x0,rear,top)))
    rk.add_poly("hearth_bed", ((x0,rear,top),(x1,rear,top),(x1,near,top),(x0,near,top)))
    for y in (rear+.038,near-.038):
        box(28, y, top, 7.2, .076, .08, "brick_burnt")
    for x in (x0+.038,x1-.038):
        box(x, (rear+near)/2, top, .076, .748, .08, "brick_burnt")


def cooking_pot(x, y, z, radius, tall, copper=True):
    profile = [(0,0),(.53*radius,0),(.82*radius,.17*tall),(radius,.72*tall),
               (radius,tall),(.90*radius,tall),(.83*radius,.67*tall),(.49*radius,.22*tall),(0,.18*tall)]
    if copper:
        tints = ["copper_body"]*4 + ["copper_rim"] + ["copper_dark"]*3
        handle_mat = "copper_rim"
    else:
        tints = ["clay_red"]*4 + ["clay_rim"] + ["clay_inside"]*3
        handle_mat = "clay_rim"
    vessel(profile, vertical(x,y,z), tints, 12)
    for side in (-1,1):
        points = [(x+side*radius*.82,y,z+tall*.70),
                  (x+side*radius*1.12,y,z+tall*.76),
                  (x+side*radius*1.18,y,z+tall),
                  (x+side*radius*.97,y,z+tall*.97)]
        for a,b in zip(points, points[1:]):
            rod(a,b,.019,handle_mat)


def tripod(x, y, radius):
    z0, z1 = FLOOR+.85, FLOOR+1.025
    ring = []
    for i in range(9):
        angle = math.tau*i/9
        ring.append((x+math.cos(angle)*radius*.55, y+math.sin(angle)*radius*.55, z1))
    for i in range(9):
        rod(ring[i], ring[(i+1)%9], .024, "iron_dark")
    for i in (0,3,6):
        r = radius*.93
        angle = math.tau*i/9
        rod((x+math.cos(angle)*r, y+math.sin(angle)*r,z0),ring[i],.026,"iron_dark")
    return z1


def embers(x, y):
    base = FLOOR+.85
    for i in range(5):
        dx, dy = (i%3-1)*.055, (i//3-.5)*.085
        rod((x+dx-.068,y+dy,base+.015),(x+dx+.065,y+dy+.027,base+.02),
            .029, "ember_dark")
    for i in range(5):
        px, py = x+(i-2)*.044, y+.022*math.sin(i*2)
        z = base+.018
        foot = [(px-.029,py-.018,z),(px+.028,py-.019,z),
                (px+.018,py+.022,z),(px-.023,py+.022,z)]
        mid = [(px+(a-px)*.62,py+(b-py)*.67,z+.032) for a,b,_ in foot]
        connect(foot, mid, "ember_red")
        connect(mid, [(px+.01,py-.01,z+.067+.021*(i%3))], "ember_orange")


def hearth_tools():
    y = -45.26
    for x, radius, height in ((24.97,.215,.19), (26.89,.252,.21), (29.05,.325,.26), (31.06,.226,.21)):
        cooking_pot(x, y, tripod(x,y,radius), radius, height)
    cooking_pot(25.94, y+.022, FLOOR+.85, .215, .23, False)
    cooking_pot(30.10, y-.018, FLOOR+.85, .208, .27, False)
    for x in (24.97, 27.98, 29.05):
        embers(x, y)
    x, z = 27.98, FLOOR+.995
    for a in (-.28,.28):
        for b in (-.195,.195):
            rod((x+a,y+b,FLOOR+.85),(x+a,y+b,z),.026,"iron_dark")
    for a in (-.28,.28):
        rod((x+a,y-.195,z),(x+a,y+.195,z),.025,"iron_dark")
    for b in (-.195,.195):
        rod((x-.28,y+b,z),(x+.28,y+b,z),.025,"iron_dark")
    for i in range(1,8):
        py = y-.195+i*.39/8
        rod((x-.28,py,z),(x+.28,py,z),.014,"iron_edge")


def oven():
    cx, cy, base = 30.7, -37.3, FLOOR+.90
    mouth = 29.805
    # The corners of the mouth, exact threshold and crest are included in the mesh.
    jamb_angle = math.atan2(.15,.25)
    angles = sorted({0, math.pi, jamb_angle, math.pi-jamb_angle,
                     *(math.pi*i/16 for i in range(1,16))})

    def circular(x, radius):
        return [(x,cy+radius*math.cos(a),base+radius*math.sin(a)) for a in angles]

    def portal(x):
        profile = []
        for a in angles:
            c, s = math.cos(a), math.sin(a)
            straight = .25/abs(c) if abs(c)>1e-9 else math.inf
            r = straight if straight*s <= .15+1e-8 else .15*s+math.sqrt(.25**2-(.15*c)**2)
            profile.append((x,cy+r*c,base+r*s))
        return profile

    def bridge(first, second, material, inside=False):
        for i,(a,b,c,d) in enumerate(zip(first,first[1:],second,second[1:])):
            face = (a,b,d,c)
            mat = material[i%len(material)] if isinstance(material,tuple) else material
            rk.add_poly(mat, face[::-1] if inside else face, not isinstance(material, tuple))

    def hemisphere(radius, cut, inside=False):
        start = math.acos((cx-cut)/radius)
        previous = circular(cut, radius*math.sin(start))
        leading = previous
        for j in range(1,11):
            a = start+(math.pi-start)*j/11
            new = circular(cx-radius*math.cos(a),radius*math.sin(a))
            bridge(previous,new,"chamber_lining" if inside else "dome_ivory", inside)
            previous = new
        end = (cx+radius,cy,base)
        for a,b in zip(previous,previous[1:]):
            rk.add_poly("chamber_lining" if inside else "dome_ivory",
                        (a,end,b) if inside else (a,b,end), True)
        return leading

    box(cx,cy,FLOOR,1.8,1.8,.90,"hearth_mortar")
    for x in (29.8,31.6):
        # The recessed stone joint backing is the plinth itself.
        rect = [(cy-.9,FLOOR),(cy+.9,FLOOR),(cy+.9,base),(cy-.9,base)]
        side = -1 if x<cx else 1
        brickwork(rect, lambda y,z:(x+side*.004,y,z),
                   lambda y,z:(x+side*.002,y,z), FLOOR)
    for y in (cy-.9, cy+.9):
        side = -1 if y<cy else 1
        rect = [(cx-.9,FLOOR),(cx-.9,base),(cx+.9,base),(cx+.9,FLOOR)]
        brickwork(rect, lambda x,z:(x,y+side*.004,z),
                   lambda x,z:(x,y+side*.002,z), FLOOR)

    outer_front = [(mouth,cy+.373*math.cos(a),base+.498*math.sin(a)) for a in angles]
    trim_inside = portal(mouth-.002)
    # Annular masonry face and contoured hood lead to real tunnel and chamber.
    bridge(outer_front,trim_inside,("brick_dust","brick_russet","brick_pale"),True)
    bridge(outer_front,hemisphere(.80,30.095),"dome_entry")
    throat = portal(30.081)
    bridge(trim_inside,throat,"chamber_lining",True)
    bridge(throat,hemisphere(.69,30.216,True),"chamber_lining",True)
    # A fire-baked hearth floor just over the solid plinth.
    rk.add_poly("brick_burnt", ((29.81,cy-.25,base+.001),(30.32,cy-.59,base+.001),
                              (31.30,cy-.31,base+.001),(31.30,cy+.31,base+.001),
                              (30.32,cy+.59,base+.001),(29.81,cy+.25,base+.001)))
    rod((31.49,-38.35,FLOOR+.06),(31.65,-38.15,FLOOR+1.54),.039,"wood_warm")
    rk.prism(FRAME, [(31.37,-38.42),(31.40,-38.58),(31.61,-38.57),(31.64,-38.37),
                     (31.54,-38.30),(31.46,-38.32)],FLOOR+.007,FLOOR+.061,"wood_light")


def trough():
    x, y = 31.35, -42.10

    def rim(width, depth, z, bevel):
        return [(x+u,y+v,z) for u,v in
                ((-width/2+bevel,-depth/2),(width/2-bevel,-depth/2),
                 (width/2,-depth/2+bevel),(width/2,depth/2-bevel),
                 (width/2-bevel,depth/2),(-width/2+bevel,depth/2),
                 (-width/2,depth/2-bevel),(-width/2,-depth/2+bevel))]

    rings = [rim(.56,1.62,FLOOR,.06), rim(.56,1.62,.13,.06), rim(.65,1.74,.58,.06),
             rim(.70,1.80,.80,.087), rim(.70,1.80,.86,.087), rim(.52,1.59,.86,.057),
             rim(.49,1.50,.70,.066), rim(.40,1.43,.625,.058)]
    tints = ["stone_mid","stone_mid","stone_mid","stone_light","stone_light","stone_inner","stone_inner"]
    for a,b,tint in zip(rings,rings[1:],tints):
        connect(a,b,tint)
    rk.add_poly("stone_inner",rings[-1])

    def into_wall(u,v,d):
        return (31.75-d,y+u,1.26-v)

    vessel([(0,.002),(.073,.002),(.073,.021),(.057,.034),(0,.034)],
           into_wall,"copper_rim",12)
    # Short cast pipe and dark recessed bore. A bend turns its mouth downward.
    points = [(31.73,y,1.26),(31.53,y,1.26),(31.45,y,1.24),(31.42,y,1.20)]
    rings = []
    for i,(px,py,pz) in enumerate(points):
        a,b=points[max(0,i-1)],points[min(len(points)-1,i+1)]
        dx,dz=b[0]-a[0],b[2]-a[2]
        norm = math.hypot(dx,dz)
        r = .028 if i<3 else .032
        rings.append([(px+dz/norm*r*math.sin(t),py+r*math.cos(t),pz-dx/norm*r*math.sin(t))
                      for t in (math.tau*j/10 for j in range(10))])
    for a,b in zip(rings,rings[1:]):
        connect(a,b,"copper_body",True)
    px,py,pz=points[-1]
    inner = [(px+.61*(a-px), py+.61*(b-py), pz+.61*(c-pz)) for a,b,c in rings[-1]]
    connect(rings[-1],inner,"copper_rim")
    connect(inner,[(px+.023,py,pz+.026)],"copper_dark")


def fish(x, y, z):
    rings = []
    sections = ((-.235, .086, .040), (-.192,.108,.058),
                (-.052,.119,.074), (.092,.085,.047), (.183,.032,.022),(.225,.023,.017))
    angles = [math.tau*i/10 for i in range(10)]
    for axis, width, height in sections:
        rings.append([(x+axis,y+width*math.cos(angle),z+height*math.sin(angle))
                      for angle in angles])
    connect([(x-.272,y,z-.003)],rings[0],"fish_flank")
    for a,b in zip(rings,rings[1:]):
        for i in range(10):
            j = (i+1)%10
            mat = "fish_back" if i in (1,2,3) else ("fish_belly" if i in (6,7,8) else "fish_flank")
            rk.add_poly(mat,(a[i],a[j],b[j],b[i]))
    tip = [(x+.227,y-.091,z+.007),(x+.362,y-.130,z+.019),
           (x+.318,y,z+.024),(x+.357,y+.126,z+.018),(x+.220,y+.078,z+.007)]
    rk.prism(FRAME,[(a,b) for a,b,_ in tip],z-.008,z+.012,"fish_back")
    for side in (-1,1):
        # Paired fins and scattered pale scale dashes read from above.
        rk.add_poly("fish_back",((x-.151,y+side*.092,z+.014),
                                (x-.012,y+side*.162,z-.002),(x-.04,y+side*.094,z+.022)))
        rk.sphere(FRAME,x-.211,y+side*.080,z+.026,.014,"fish_eye",8,4,.71)
        for i in range(4):
            px=x-.138+.052*i
            rk.add_poly("fish_belly",((px,y+side*.096,z+.035),
                                     (px+.023,y+side*.092,z+.041),
                                     (px+.018,y+side*.097,z+.015)))


def worktable():
    x, y = 28, -41
    top = FLOOR+.85
    for xx in (x-1.32,x+1.32):
        for yy in (y-.47,y+.47):
            box(xx,yy,FLOOR,.132,.132,.75,"wood_dark")
    for yy in (y-.48,y+.48):
        box(x,yy,FLOOR+.626,2.76,.092,.142,"wood_medium")
    for xx in (x-1.33,x+1.33):
        box(xx,y,FLOOR+.626,.098,.97,.142,"wood_medium")
    for i, mat in enumerate(("wood_medium","wood_light","wood_warm")):
        box(x,y+(i-1)*.400,top-.106,3,.398,.106,mat)

    box(27.03,-40.96,top,.69,.47,.046,"wood_warm")
    blade = [(27.00,-41.04),(27.32,-41.11),(27.36,-41.055),(27.16,-40.996)]
    rk.prism(FRAME,blade,top+.047,top+.054,"iron_edge")
    rod((26.93,-41.01,top+.065),(27.025,-41.04,top+.065),.036,"wood_dark")
    fish(27.02,-40.89,top+.114)

    vessel([(0,0),(.125,0),(.153,.027),(.152,.116),(.157,.158),
            (.125,.158),(.115,.064),(.077,.043),(0,.036)],
           vertical(28.64,-41.14,top), "stone_mortar", 16)
    rod((28.61,-41.16,top+.062),(28.81,-41.18,top+.196),.045,"stone_light")
    for ax, ay, mat in ((28.99,-40.78,"clay_red"),(28.12,-40.73,"clay_earth")):
        vessel([(0,0),(.09,0),(.089,.021),(.133,.061),(.147,.092),
                (.13,.092),(.117,.055),(.075,.029),(0,.021)],
               vertical(ax,ay,top), [mat]*4+["clay_rim"]+["clay_inside"]*3,14)


def hanger():
    beam_z = 2.08
    rod((25,-45.61,beam_z),(31,-45.61,beam_z),.073,"wood_dark")
    for x in (25.17,27.05,28.95,30.83):
        rod((x,-45.72,beam_z),(x,-45.58,beam_z),.060,"wood_medium")

    def hanging_profile(px, py, pz):
        return lambda u,v,d:(px+u,py+d,pz-v)

    utensils = ((25.37,"pan",.155,.48), (26.22,"ladle",.093,.48),
                (27.14,"pan",.170,.42),(28.06,"skimmer",.129,.52),
                (28.96,"ladle",.085,.44),(29.87,"pan",.147,.48),
                (30.67,"skimmer",.126,.43))
    for x, kind, radius, length in utensils:
        y, z = -45.47, beam_z-length
        rod((x,-45.61,beam_z-.028),(x,y,beam_z-.052),.023,"iron_dark")
        rod((x,y,beam_z-.054),(x+.011,y+.01,z+radius*.94),.026,"copper_flat")
        if kind != "skimmer":
            depth = .091 if kind == "pan" else .056
            profile = [(0,0),(.41*radius,0),(.84*radius,.53*depth),
                       (radius,.94*depth),(radius,depth),(.87*radius,depth),
                       (.71*radius,.6*depth),(.34*radius,.26*depth),(0,.23*depth)]
            vessel(profile,hanging_profile(x,y,z),
                   ["copper_body"]*4+["copper_rim"]+["copper_dark"]*3,14)
        else:
            # An annulus and radial bridge segments leave real strainer holes.
            vessel([(.75*radius,.018),(radius,.023),(radius,.046),(.75*radius,.045),
                    (.75*radius,.018)], hanging_profile(x,y,z), "copper_rim", 16)
            vessel([(0,.019),(.34*radius,.019),(.34*radius,.042),(0,.042)],
                   hanging_profile(x,y,z),"copper_dark",12)
            for i in range(8):
                a = i*math.tau/8
                c,s = math.cos(a),math.sin(a)
                rod((x+.32*radius*c,y+.030,z+.32*radius*s),
                    (x+.78*radius*c,y+.031,z+.78*radius*s),.017,"copper_body")


def hanging_food():
    x = 24.39
    rod((x,-45.44,2.15),(x,-42.06,2.15),.080,"wood_dark")
    for y in (-45.32,-43.76,-42.19):
        rod((24.27,y,2.15),(x+.055,y,2.15),.05,"wood_medium")
    hooks = (-44.89,-43.99,-43.18,-42.38)
    for y in hooks:
        bend = ((x,y,2.185),(x+.105,y,2.106),(x+.126,y,1.963),
                (x+.182,y,1.935),(x+.211,y,1.978))
        for a,b in zip(bend,bend[1:]):
            rod(a,b,.018,"iron_dark")

    def cut(y, length, sign):
        px = x+.207
        outline = ((-.09,1.96),(-.122,1.83),(-.22,1.68),(-.23,1.43),
                   (-.13,1.96-length),(+.085,1.99-length),
                   (+.20,1.46),(+.166,1.63),(+.09,1.8),(+.046,1.96))
        back = [(px-.081,y+sign*u,z) for u,z in outline]
        edge = [(px+.007,y+sign*u,z) for u,z in outline]
        face = [(px+.027,y+sign*.90*u,1.64+.95*(z-1.64)) for u,z in outline]
        connect(back,edge,"meat_side")
        connect(edge,face,"meat_rim")
        rk.add_poly("meat_face",face)
        rk.add_poly("meat_side",back[::-1])
        # Narrow pale seams are the cut's fat, all dry solid mesh.
        for dy in (-.078,.030,.107):
            rod((px+.03,y+dy,1.47),(px+.039,y+dy*.64,1.64),.015,"meat_rim")

    cut(hooks[0],.71,1)
    cut(hooks[1],.67,-1)
    for i in range(6):
        y = hooks[2]+(.037 if i%2 else -.038)
        z = 1.89-i*.047
        rk.sphere(FRAME,x+.226+(i%3)*.013,y,z,.046,
                  "garlic_pale" if i%3 else "garlic_shade",8,5,.87)
        rod((x+.223,y,z+.02),(x+.212,hooks[2],z+.097),.008,"wood_light")
    for i in range(7):
        y = hooks[3] + (i-3)*.029
        rod((x+.205,hooks[3],1.955),(x+.236,y,1.61),.008,"herb_light")
        for j in range(3):
            zz = 1.67+j*.065+(i%2)*.02
            rk.add_poly("herb_leaf" if j%2 else "herb_light",
                        ((x+.239,y,zz),(x+.28,y+.031,zz+.04),(x+.24,y+.014,zz+.043)))


def amphora(x, y, variant, clay):
    z0 = FLOOR+.013
    tilt = -.122
    scale = (.97,1.00,1.035)[variant%3]

    def lean(u, v, z):
        return x+u+tilt*(z-.41),y+v,z0+z

    profile = [(0,.006),(.064,.006),(.123,.142),(.183,.305),
               (.187,.433),(.151,.566),(.092,.630),(.061,.715),(.073,.716),(.074,.754),(.056,.760),(0,.758)]
    tints = [clay]*8+["clay_rim","clay_seal","clay_seal"]
    vessel([(r,z*scale) for r,z in profile],lean,tints,12)
    for side in (-1,1):
        # Opposed loop handles are kept within the narrow rack cells.
        handle = [lean(side*u,-.006,zh*scale) for u,zh in
                  ((.093,.624),(.175,.634),(.191,.598),(.189,.533),(.154,.505))]
        for a,b in zip(handle,handle[1:]):
            rod(a,b,.024,clay)


def amphora_rack():
    xmin, xmax, ymin, ymax = 24.40, 25.95, -38.0, -36.40
    width, depth = (xmax-xmin)/2, (ymax-ymin)/3
    low, high = .407, .474
    for i in range(2):
        for j in range(3):
            x,y = xmin+(i+.5)*width, ymin+(j+.5)*depth
            # Each patch joins its neighbours along the outer board, with an
            # open inner edge and exposed return around the amphora hole.
            half_x, half_y = width/2,depth/2
            corner = math.atan2(half_y,half_x)
            angles = sorted({*(math.tau*k/12 for k in range(12)),corner,math.pi-corner,
                             math.pi+corner,math.tau-corner})
            hole, boundary = [],[]
            for angle in angles:
                u,v = math.cos(angle), math.sin(angle)
                reach = min(half_x/max(abs(u),1e-12),half_y/max(abs(v),1e-12))
                hole.append((x+.224*u,y+.224*v))
                boundary.append((x+u*reach,y+v*reach))
            for z, mat in ((high,"wood_warm"),(low,"wood_dark")):
                a,b = [(u,v,z) for u,v in boundary],[(u,v,z) for u,v in hole]
                if z == high:
                    connect(a,b,mat)
                else:
                    connect(a[::-1],b[::-1],mat)
            connect([(a,b,high) for a,b in hole],[(a,b,low) for a,b in hole],"wood_dark")
            tints = ("clay_red","clay_earth","clay_tan")
            amphora(x,y,i*3+j,tints[(i+j)%len(tints)])
    perimeter = [(xmin,ymin),(xmax,ymin),(xmax,ymax),(xmin,ymax)]
    for a,b in zip(perimeter,perimeter[1:]+perimeter[:1]):
        rk.add_poly("wood_medium",((*a,low),(*b,low),(*b,high),(*a,high)))
    for i in range(2):
        x = xmin+(i+.5)*width+.05
        box(x,(ymin+ymax)/2,FLOOR,.22,ymax-ymin-.09,.019,"wood_medium")
    for x in (xmin+.085,xmax-.085):
        for y in (ymin+.083,ymax-.083):
            box(x,y,FLOOR,.11,.11,low-FLOOR,"wood_dark")
        box(x,(ymin+ymax)/2,FLOOR,.106,ymax-ymin-.09,.016,"wood_medium")


def basket(x, y, with_bread):
    z = FLOOR
    profile = [(0,0),(.153,0),(.157,.03),(.165,.084),(.183,.166),(.211,.235),
               (.223,.259),(.225,.278),(.202,.278),(.197,.262),(.167,.113),
               (.143,.034),(0,.034)]
    tints = ["willow_dark","willow_light","willow_dark","willow_light","willow_dark",
             "willow_light","willow_dark","willow_light","willow_light",
             "willow_dark","willow_dark","willow_dark"]
    vessel(profile,vertical(x,y,z),tints,16)
    for i in range(14):
        a = math.tau*i/14
        cs,sn=math.cos(a),math.sin(a)
        rod((x+.167*cs,y+.167*sn,z+.034),(x+.215*cs,y+.215*sn,z+.25),
            .014,"willow_light")
    if with_bread:
        for i in range(3):
            a=math.tau*i/3
            px,py=x+.088*math.cos(a),y+.088*math.sin(a)
            rk.sphere(FRAME,px,py,z+.227,.088,"bread_crust",10,5,.71)
            rod((px-.039,py-.003,z+.284),(px+.039,py+.007,z+.284),.008,"bread_light")
    else:
        for i in range(8):
            a=math.tau*i/8
            cs,sn=math.cos(a),math.sin(a)
            rk.add_poly("greens_light" if i%2 else "greens_dark",
                        ((x,y,z+.157),(x+.145*cs-.038*sn,y+.145*sn+.038*cs,z+.246),
                         (x+.175*cs,y+.175*sn,z+.302),
                         (x+.12*cs+.03*sn,y+.12*sn-.03*cs,z+.230)))


def fuel_and_baskets():
    for layer, count in enumerate((6,6,5,5)):
        for i in range(count):
            y = -40.28+i*.235 + layer*.048
            z = FLOOR+.093+layer*.161+(i%3)*.010
            x = 31.22+(.025 if (i+layer)%2 else 0)
            wood_log((x,y,z),(31.679-.021*(i%3),y-.036*(i%2),z-.025),.177,
                     layer*6+i)
    basket(30.68,-40.17,True)
    basket(30.62,-39.56,False)


def furnish():
    hearth()
    hearth_tools()
    oven()
    trough()
    worktable()
    hanger()
    hanging_food()
    amphora_rack()
    fuel_and_baskets()


if __name__ == "__main__":
    deliver(NAME, ROOM, LIMIT, furnish, TINTS, SLOTS, VIEWS)
