"""Garden façade shared by the four Palatine terrace houses. Blender south is -Y."""

from rk import box, column, cyl, entablature, hip_roof, lathe, lean_roof

FLOOR = 0.05
PORCH_EDGE = -2.40
COLUMN_Y = -1.75
BACK_Y = 2.30
PAVILION_Y = COLUMN_Y - 2.20
PAVILION_INNER_X = 9.40
PAVILION_EAVE = 9.10
UPPER_FLOOR = 4.60
ENTRY_HALF = 1.60


def _span(F, x0, x1, y0, y1, z0, z1, mat):
    if x1 - x0 > 1e-5 and z1 - z0 > 1e-5:
        box(F, (x0+x1)/2, (y0+y1)/2, z0, x1-x0, y1-y0, z1-z0, mat)


def _wall(F, x0, x1, y, z0, z1, mat, openings=(), dado=None, depth=0.38):
    """Solid wall with rectangular apertures and a red dado interrupted at their jambs."""
    def fill(a, b, lo, hi):
        if dado is not None and lo < dado:
            _span(F, a, b, y-depth/2, y+depth/2, lo, min(hi,dado), 'wallred')
            lo = max(lo,dado)
        _span(F, a, b, y-depth/2, y+depth/2, lo, hi, mat)

    edges = sorted({x0, x1, *(x + sign*width/2
                            for x, width, _, _ in openings for sign in (-1, 1))})
    for a, b in zip(edges, edges[1:]):
        centre = (a+b)/2
        cuts = sorted((sill, sill+height) for x, width, sill, height in openings
                      if abs(centre-x) < width/2)
        lo = z0
        for sill, head in cuts:
            fill(a,b,lo,sill)
            lo = head
        fill(a,b,lo,z1)


def _frame(F, x, y, z, width, height, t=0.13, sill=True):
    """Stone jambs, lintel and projecting sill on the visible side of the reveal."""
    for side in (-1, 1):
        box(F, x+side*(width+t)/2, y, z, t, 0.18, height, 'travertine')
    box(F, x, y-0.015, z+height, width+2.5*t, 0.24, 1.15*t, 'travertine')
    if sill:
        box(F, x, y-0.045, z-0.80*t, width+2.3*t, 0.29, t, 'travertine')


def _lattice(F, x, y, z, width, height, columns=4, rows=5, back=True):
    """Recessed open timber grille, with the room back set behind the reveal."""
    _frame(F, x, y-0.24, z, width, height)
    for i in range(columns+1):
        xx = x+width*(i/columns-0.5)
        box(F, xx, y-0.06, z, 0.065, 0.10, height, 'wood')
    for i in range(rows+1):
        zz = z+height*i/rows
        box(F, x, y-0.075, zz-0.028, width, 0.08, 0.056, 'wood')
    if back:
        box(F, x, y+0.48, z-0.09, width+0.32, 0.12, height+0.18, 'dado')


def _door(F, x, y, z, width, height):
    _frame(F, x, y-0.23, z, width, height, t=0.16, sill=False)
    for side in (-1, 1):
        xx = x+side*width*0.25
        box(F, xx, y+0.04, z, width/2-0.025, 0.14, height, 'wood')
        for lo, hi in ((0.14,0.41),(0.51,0.88)):
            box(F, xx, y-0.045, z+height*lo, width*0.36, 0.044, height*(hi-lo), 'dado')
        box(F, x+side*0.09, y-0.11, z+1.29, 0.055, 0.08, 0.13, 'bronze')


def _end_room(F, side, mat):
    inner, outer = side*PAVILION_INNER_X, side*15.0
    x0, x1 = sorted((inner,outer))
    x = (x0+x1)/2
    y = PAVILION_Y+0.19
    d = BACK_Y-PAVILION_Y
    yc = PAVILION_Y+d/2
    # Ground floor: a smaller window with its sill 1.65 m above the floor (over the dado); the larger one is upstairs.
    windows = [(x,1.80,1.70,1.60),(x,2.02,5.52,2.18)]
    _wall(F,x0,x1,y,FLOOR,PAVILION_EAVE-0.28,mat,windows,dado=1.53)
    for opening in windows:
        xx, w, z, h = opening
        _lattice(F,xx,y,z,w,h,columns=6)
    # Plain side returns and a continuous plinth close the projecting rooms.
    return_y0, return_y1 = PAVILION_Y + 0.38, 2.53
    for a, b in ((x0,x0+0.38),(x1-0.38,x1)):
        _span(F,a,b,return_y0,return_y1,FLOOR,1.53,'wallred')
        _span(F,a,b,return_y0,return_y1,1.53,PAVILION_EAVE-0.28,mat)
    # Pale stone surrounds stay within the original lateral envelope.
    box(F,x,yc+0.025,-0.14,5.6,d+0.22,0.32,'travertine')
    box(F,x,PAVILION_Y-0.025,4.44,5.60,0.18,0.18,'travertine')
    box(F,x,yc,4.44,4.84,d-0.38,0.20,'paving')
    # Keep the cornice just behind the tile fascia so their faces never share a plane.
    box(F,x,yc,8.79,5.56,d+0.15,0.31,'travertine')
    hip_roof(F,x,yc,PAVILION_EAVE,5.34,d,17.5,0.13)


def _dining_room(F, mat):
    """Small triclinium behind the garden door, daylit from the porch and peristyle."""
    _span(F,-1.83,1.83,BACK_Y+0.21,4.53,-0.10,FLOOR,'paving')
    for side in (-1,1):
        x = side*1.79
        box(F,x,3.40,FLOOR,0.28,1.90,1.05,'wallred')
        box(F,x,3.40,1.10,0.28,1.90,2.77,mat)
        box(F,side*1.30,3.43,FLOOR,0.56,1.28,0.40,'wood')
        box(F,side*1.30,3.43,0.45,0.60,1.29,0.12,'cloth')
    _wall(F,-1.92,1.92,4.34,FLOOR,3.88,mat,[(0,1.26,1.53,1.56)],dado=1.10)
    _lattice(F,0,4.34,1.53,1.26,1.56,columns=3,rows=3,back=False)
    box(F,0,3.39,3.88,3.84,2.10,0.16,'wood')
    # Stone table with a bronze shallow dish, visible from the approach.
    cyl(F,0,3.42,FLOOR,0.17,0.64,'travertine',10,r_top=0.11)
    box(F,0,3.42,0.69,1.14,0.68,0.11,'marble')
    lathe(F,0,3.42,[(0.07,0.80),(0.15,0.86),(0.15,0.90),(0.125,0.88)],'bronze',10)


def _stone_rail(F, y, z):
    """Rail on its own sill, with a clear handrail profile over the small balusters."""
    box(F,0,y,z,18.65,0.32,0.15,'travertine')
    box(F,0,y,z+0.83,18.65,0.33,0.13,'travertine')
    for i in range(54):
        x = (i-26.5)*0.34
        lathe(F,x,y,[(0.078,z+0.15),(0.095,z+0.34),(0.051,z+0.64),
                     (0.070,z+0.83)],'travertine',8)
    for x in (-9.20,-6.89,-4.58,-2.28,0,2.28,4.58,6.89,9.20):
        box(F,x,y,z+0.15,0.24,0.28,0.68,'stone')


def front(F, wall):
    """Two classical storeys between a pair of two-storey projecting garden rooms."""
    plaster = 'plaster2' if wall == 'plaster3' else wall
    half = PAVILION_INNER_X
    for side in (-1, 1):
        _end_room(F,side,plaster)
    # Separate floor and soffit make the two shaded walks legible in section.
    _span(F,-half,half,PORCH_EDGE,BACK_Y+0.21,-0.15,FLOOR,'paving')
    _span(F,-half,half,-2.28,BACK_Y+0.16,4.37,4.59,'wood')
    _span(F,-half,half,-2.28,BACK_Y+0.16,4.59,UPPER_FLOOR,'paving')
    _span(F,-half,half,-1.99,BACK_Y+0.16,7.83,8.02,'wood')
    lower_windows = [(x,1.36,1.70,1.68) for x in (-7.97,-3.26,3.26,7.97)]
    upper_windows = [(x,1.28,5.29,1.73) for x in (-7.97,-3.26,3.26,7.97)]
    entry = (0,2*ENTRY_HALF,FLOOR,3.32)
    upper_door = (0,1.66,UPPER_FLOOR,2.68)
    _wall(F,-half,half,BACK_Y,FLOOR,UPPER_FLOOR,plaster,[entry]+lower_windows,dado=1.53)
    _wall(F,-half,half,BACK_Y,UPPER_FLOOR,8.79,plaster,[upper_door]+upper_windows)
    _frame(F,0,BACK_Y-0.24,FLOOR,2*ENTRY_HALF,3.32,t=0.18,sill=False)
    for x, width, z, height in lower_windows+upper_windows:
        _lattice(F,x,BACK_Y,z,width,height)
    _door(F,0,BACK_Y,UPPER_FLOOR,1.66,2.68)
    _dining_room(F,plaster)

    xs = (-9.05,-6.73,-4.30,-1.97,1.97,4.30,6.73,9.05)
    for x in xs:
        column(F,x,COLUMN_Y,FLOOR,3.85,0.28,'travertine','tuscan',0,12)
        column(F,x,COLUMN_Y,UPPER_FLOOR,2.86,0.23,'travertine','ionic',0,12)
    entablature(F,-half,COLUMN_Y,half,COLUMN_Y,3.90,0.70,0.75,'travertine',frieze_mat=plaster)
    entablature(F,-half,COLUMN_Y,half,COLUMN_Y,7.46,0.73,0.73,'travertine',frieze_mat=plaster)
    _stone_rail(F,-2.04,UPPER_FLOOR)

    # A one metre solid guard with pale panels between the columns.
    for a,b in ((-half,-1.74),(1.74,half)):
        _span(F,a,b,-2.36,-2.01,FLOOR,FLOOR+0.86,'stone')
        _span(F,a,b,-2.40,-1.98,FLOOR+0.86,FLOOR+1.0,'travertine')
    for a,b in zip(xs,xs[1:]):
        if a < 0 < b:
            continue
        box(F,(a+b)/2,-2.381,0.20,b-a-0.44,0.05,0.57,'travertine')
    lean_roof(F,-9.43,2.53,9.43,2.53,8.82,4.96,0.63)
    box(F,0,-2.41,8.07,18.85,0.13,0.12,'tile2')
