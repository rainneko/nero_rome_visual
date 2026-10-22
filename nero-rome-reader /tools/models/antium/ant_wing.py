"""ant_wing - terrace wing with a sea gallery, the two lower tiers of Nero's palace at Antium (AD 54-68).

One module, used four times. Long axis = X (60 m), front = -Y (the sea side). Metres, z = 0 = ground floor.
  * sea side (-Y): ground floor is an 11-arch blind arcade (dark panels behind the openings); the upper floor is
    an open loggia 3.5 m deep (16 ionic columns, a marble balustrade between them), its back wall has doors and windows
  * inner side (+Y): windows on both floors, a central door with a small porch (2 columns, small pediment)
  * end pavilions: the last 11 m at each end rise to three storeys (14 m), own hip roofs, 0.6 m proud of the range
  * white plaster, red floor bands, travertine base course, terracotta hip roofs with tile ribs
  * foundations go down to z = -6
Brief: briefs/antium/wing.md
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_kit import *

reset()

# ---------------------------------------------------------------- dimensions (m)
XH = 30.0                  # half length of the range: x from -30 to +30
YH = 7.5                   # half depth: y from -7.5 (sea side) to +7.5 (inner side)
HG = 5.0                   # ground floor height (top of the loggia floor)
HU = 4.4                   # upper floor height
EAVE = HG + HU             # 9.4: eave of the range roof
ZA = HG - 0.15             # top of the ground-floor arcade (the loggia floor slab fills the last 0.15 m)
BAY = 2 * XH / 11          # 5.45 m: 11 arcade bays over the 60 m front
XP = XH - 2 * BAY          # 19.09: inner face of the end pavilions (their last 10.9 m = two bays)
YP = YH + 0.6              # pavilions are 0.6 m proud of the range: y = +-8.1
HP = 14.0                  # pavilion height (three storeys)
WT = 0.36                  # opening_skin: its inner line sits WT inside the outer face
AT = 0.72                  # arcade wall thickness (outer face = line - AT / 2)
OH = 0.6                   # roof overhang
PITCH = 22.0               # roof pitch, degrees


# ---------------------------------------------------------------- helpers
def bay_centres(L, step=3.4):
    """Centres of equal bays along a wall of length L. An odd count puts a bay in the middle."""
    nb = max(1, int(round(L / step)))
    return [(k + 0.5) * L / nb for k in range(nb)]


def row(L, zb, hh, ww=1.1, skip_centre=False):
    """One row of rectangular windows, one per bay. u is measured from the start of the skin."""
    cs = bay_centres(L); out = []
    for i, u in enumerate(cs):
        if skip_centre and i == len(cs) // 2:
            continue
        out.append((u, zb, ww, hh, 'rect'))
    return out


# ---------------------------------------------------------------- foundation and base course
box(None, 0, 0, -6.0, 2 * XH + 0.8, 2 * YP + 1.0, 5.1, 'tuff')       # foundation, down to z = -6
box(None, 0, 0, -0.9, 2 * XH + 0.5, 2 * YP + 0.7, 0.9, 'stone')      # travertine base course, top at z = 0

# ---------------------------------------------------------------- sea side (-Y), ground floor: arcade
# 7 arches across the middle section (each pavilion carries two more); dark panels behind = blind arcade
ARC_MID = -YH + AT / 2
arcade(None, -XP, ARC_MID, XP, ARC_MID, 0.0, ZA, AT, 7, mat='plaster', open_h=4.1, back='dark', impost_mat='marble')
band(None, -XP, ARC_MID, XP, ARC_MID, 4.8, 0.3, 0.52, 'red')                 # red floor band at the loggia floor

# ---------------------------------------------------------------- inner side (+Y): windows, central door
IN_LINE = YH - WT
cs = bay_centres(2 * XP)                             # 11 bays; the middle one holds the door
ops = []
for i, u in enumerate(cs):
    if i != len(cs) // 2:
        ops.append((u, 1.4, 1.1, 2.2, 'rect'))        # ground-floor windows
    ops.append((u, 6.3, 1.1, 2.0, 'rect'))            # upper windows
ops.append((XP, 0.0, 2.4, 3.3, 'arch'))               # central door (u = XP is the middle of the wall)
opening_skin(None, XP, IN_LINE, -XP, IN_LINE, 0.0, EAVE, ops, mat='plaster', depth=0.35)
band(None, XP, IN_LINE, -XP, IN_LINE, 0.0, 0.45, 0.52, 'stone')            # travertine plinth, visible at ground level
band(None, XP, IN_LINE, -XP, IN_LINE, 4.8, 0.3, 0.42, 'red')
cornice(None, XP, IN_LINE, -XP, IN_LINE, EAVE - 0.5, 0.6, 0.62, 'stone')

# ---------------------------------------------------------------- sea side, upper floor: open loggia
LOG = -4.0                                  # back wall of the loggia; the loggia runs y = -7.5 .. -4.0 (3.5 m)
C0, C1, NC = -18.5, 18.5, 16                # 16 columns from x = -18.5 to +18.5
CS = (C1 - C0) / (NC - 1)                   # 2.47 m between columns
ops = []
for i in range(NC - 1):                     # windows and a door in the bays between the columns
    u = C0 + (i + 0.5) * CS + XP            # u from the start of the back wall (x = -XP)
    if i == (NC - 1) // 2:
        ops.append((u, 0.0, 2.0, 3.1, 'arch'))        # central door into the back rooms
    else:
        ops.append((u, 0.9, 1.2, 2.2, 'rect'))
opening_skin(None, -XP, LOG, XP, LOG, HG, EAVE - HG, ops, mat='plaster', depth=0.35, frame_mat='marble')
box(None, 0, -WT / 2, ZA, 2 * XP, 2 * YH - WT, HG - ZA, 'paving')   # upper floor slab, bears on arcade, walls, pavilions       # loggia floor slab
colonnade(None, C0, -6.4, C1, -6.4, HG, NC, EAVE - HG - 0.7, r=0.2, mat='marble', order='ionic', ent=True,
          ent_h=0.7)
BAL_Y = -7.05                               # marble balustrade in front of the columns, between them
xs = [C0 + i * CS for i in range(NC)]
for a, b in [(-XP, C0)] + list(zip(xs[:-1], xs[1:])) + [(C1, XP)]:
    balustrade(None, a, BAL_Y, b, BAL_Y, HG, 1.0, 'marble', 1.8, 0.28)

# ---------------------------------------------------------------- inner-side porch: 2 columns, small pediment
PF = Frame(0.0, YH, 0.0, 180.0)             # local -y points out to +Y; local (0, 0) sits on the outer wall face
box(PF, 0, -1.4, 0.0, 3.8, 2.8, 0.2, 'marble')
colonnade(PF, -1.2, -2.2, 1.2, -2.2, 0.2, 2, 3.0, r=0.2, mat='marble', order='ionic', ent=True, ent_h=0.6)
gable_roof(PF, 0.0, -1.4, 3.8, 3.4, 2.8, 15.0, axis='y', overhang=0.3, mat='tile', tiles=True, rib_mat='tile2',
           gable_mat='marble', pediment=True, tymp_mat='plaster')

# ---------------------------------------------------------------- end pavilions: three storeys, own hip roofs
def pavilion(sx):
    """End pavilion on side sx (+1 east, -1 west): from the range (x = +-XP) out to the end (x = +-XH)."""
    xi, xo = sx * XP, sx * XH                     # inner face (against the range) and outer end face
    xe = xo - sx * WT                             # line of the end skin
    xa, xb = min(xi, xe), max(xi, xe)             # the sea-side and inner-side skins run from xa to xb
    xc, w = (xi + xo) / 2, abs(xo - xi)
    fl = -YP + WT                                 # sea-side skin line (= arcade line), outer face at y = -YP
    nl = YP - WT                                  # inner-side and end skin line, outer face at +YP
    L = xb - xa
    # sea side: two arcade bays on the ground floor, skin above
    arcade(None, xa, fl, xb, fl, 0.0, HG, AT, 2, mat='plaster', open_h=4.1, back='dark', impost_mat='marble')
    opening_skin(None, xa, fl, xb, fl, HG, HP - HG, row(L, 1.3, 2.0) + row(L, 5.8, 2.0), mat='plaster', depth=0.35)
    # inner side: a door on the ground floor, windows on three floors
    ops = row(L, 1.4, 2.2, skip_centre=True) + row(L, 6.3, 2.0) + row(L, 10.8, 2.0)
    ops.append((L / 2, 0.0, 2.2, 3.2, 'arch'))
    opening_skin(None, xb, nl, xa, nl, 0.0, HP, ops, mat='plaster', depth=0.35)
    # end wall: windows on three floors
    LE = 2 * nl
    ops = row(LE, 1.4, 2.2) + row(LE, 6.3, 2.0) + row(LE, 10.8, 2.0)
    opening_skin(None, xe, -sx * nl, xe, sx * nl, 0.0, HP, ops, mat='plaster', depth=0.35)
    # plain inner face against the range: closes the pavilion where it meets the range
    add_poly('plaster', [(xi, sx * YP, 0.0), (xi, -sx * YP, 0.0), (xi, -sx * YP, HP), (xi, sx * YP, HP)])
    # travertine plinth on the inner side and the end (the sea arcade stands on the ground), red bands, cornice, quoins
    band(None, xb, nl, xa, nl, 0.0, 0.45, 0.52, 'stone')
    band(None, xe, -sx * nl, xe, sx * nl, 0.0, 0.45, 0.52, 'stone')
    for z in (4.8, 9.3):
        band(None, xa, fl, xb, fl, z, 0.3, 0.42, 'red')
        band(None, xb, nl, xa, nl, z, 0.3, 0.42, 'red')
        band(None, xe, -sx * nl, xe, sx * nl, z, 0.3, 0.42, 'red')
    cornice(None, xa, fl, xb, fl, 13.5, 0.6, 0.62, 'stone')
    cornice(None, xb, nl, xa, nl, 13.5, 0.6, 0.62, 'stone')
    cornice(None, xe, -sx * nl, xe, sx * nl, 13.5, 0.6, 0.62, 'stone')
    for sy in (-1, 1):
        box(None, xo - sx * 0.25, sy * (YP - 0.25), 0.0, 0.9, 0.9, HP - 0.4, 'stone')
    hip_roof(None, xc, 0.0, HP, w, 2 * YP, PITCH, OH)


pavilion(1)
pavilion(-1)

# ---------------------------------------------------------------- hip roof of the range (eave at z = 9.4)
hip_roof(None, 0.0, 0.0, EAVE, 2 * XP, 2 * YH, PITCH, OH)

human(None, 9.0, -12.0)                     # preview only: 1.8 m figure for scale
finish('ant_wing', front='-Y', extra_cams=(('inner', Vector((0.0, 1.0, 0.0)), 8),))   # inner.png: the +Y side
