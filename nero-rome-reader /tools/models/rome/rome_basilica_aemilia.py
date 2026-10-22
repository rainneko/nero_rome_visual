"""Basilica Aemilia with the Porticus of Gaius and Lucius (rome_basilica_aemilia), Rome AD 56.

Built with the Rome kit (rk.py). Origin = centre of the 96 x 32 m footprint, z = 0 = floor level.
Front = -Y (the Forum side, the long south side).
  x  : 96 m east-west (the hall's ridge runs along X)
  y  : 32 m; portico + shops at y -16 .. -10, hall y -10 .. 16
Run:
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_basilica_aemilia.py"
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *                     # noqa: F401,F403  (box, wall, arcade, column, entablature, taberna_front, ...)
from mathutils import Vector

reset()
F = Frame()

# ---------------------------------------------------------------- key lines (metres)
XE = 47.65        # inner face of the end cores (the end walls' outer faces are at x = +-48)
XO = 48.0         # outer face of the end walls
YF = -15.6        # outer face of the portico (engaged columns, entablatures)
YA = -14.9        # centre line of the portico arcades (1.4 m thick: faces at -15.6 and -14.2)
YS = -10.0        # back of the portico: outer face of the back core, the shop line
YN = 16.0         # outer face of the hall's back wall
NB = 16           # bays along the front (6 m each)
BAY = 2 * XE / NB
PLINTH = 1.2


def convex(mat, faces):
    """One convex solid given as a list of faces (point lists, any winding); every face is oriented outward."""
    pts = [Vector(p) for f in faces for p in f]
    c = sum(pts, Vector((0, 0, 0))) / len(pts)
    for f in faces:
        f = [Vector(p) for p in f]
        n = (f[1] - f[0]).cross(f[2] - f[0])
        fc = sum(f, Vector((0, 0, 0))) / len(f)
        add_poly(mat, f if n.dot(fc - c) >= 0 else f[::-1])


def yz_prism(x0, x1, ring, mat):
    """A convex prism: ring = [(y, z), ...] in a plane x = const, extruded from x0 to x1."""
    A = [(x0, y, z) for y, z in ring]
    B = [(x1, y, z) for y, z in ring]
    n = len(ring)
    faces = [A, B] + [[A[i], A[(i + 1) % n], B[(i + 1) % n], B[i]] for i in range(n)]
    convex(mat, faces)


# ---------------------------------------------------------------- walk floor under the portico (z = 0)
box(F, 0, (YF + (YS - 0.7)) / 2, -0.2, 2 * XE, (YS - 0.7) - YF, 0.2, 'paving')

# ---------------------------------------------------------------- ground storey, 0 to 7 m: 16 arches, engaged Doric columns
arcade(F, -XE, YA, XE, YA, 0.0, 7.0, 1.4, NB, mat='stone', open_w=3.7, open_h=5.46, impost_mat='marble')
for k in range(NB + 1):                                   # one engaged column on every pier line
    column(F, -XE + k * BAY, YF, 0.0, 6.3, r=0.42, mat='marble', order='doric', seg=12)
entablature(F, -XE, YF, XE, YF, 6.3, 0.68, 0.7, 'marble')  # architrave, frieze, cornice

# ---------------------------------------------------------------- upper storey, 7 to 13 m: 16 arches, engaged Ionic columns
slab_y0, slab_y1 = YA + 0.7, YS - 0.7                     # gallery floor between the arcade and the shop skin
box(F, 0, (slab_y0 + slab_y1) / 2, 6.6, 2 * XE, slab_y1 - slab_y0, 0.4, 'stone')
arcade(F, -XE, YA, XE, YA, 7.0, 6.0, 1.4, NB, mat='plaster', open_w=3.7, open_h=4.7, impost_mat='marble')
for k in range(NB + 1):
    column(F, -XE + k * BAY, YF, 7.0, 5.4, r=0.36, mat='marble', order='ionic', seg=12)
entablature(F, -XE, YF, XE, YF, 12.4, 0.6, 0.7, 'marble')

# ---------------------------------------------------------------- attic band (13 to 14.3 m), red frieze strip, cornice, portico roof
wall(F, -XE, YA, XE, YA, 13.0, 1.3, 1.4, 'plaster')
band(F, -XE, YF, XE, YF, 13.75, 0.5, 0.35, 'red')
cornice(F, -XE, YF, XE, YF, 14.3, 0.5, 0.4, 'marble')
lean_roof(F, -XO, YS, XO, YS, 15.6, 6.3, 1.0, 'tile')      # mono-pitch roof, high edge on the back core
for s in (1, -1):                                         # portico end walls, top following the roof slope
    yz_prism(min(s * 47.0, s * XO), max(s * 47.0, s * XO), [(YF, 0.0), (YS, 0.0), (YS, 15.6), (YF, 14.71)], 'stone')

# ---------------------------------------------------------------- shops behind the ground arcade (taberna_front on the shop line)
taberna_front(F, -XE, YS, XE, YS, 0.0, NB, h=7.0, mat='plaster2', shutters=True, counters=True, depth=0.7, sill=0.0)
wall(F, -XE, YS + 0.5, XE, YS + 0.5, 0.0, 15.6, 1.0, 'plaster')   # solid back core behind the shop openings (y -10 .. -9)

# ---------------------------------------------------------------- hall: south aisle, nave, north aisle
# south aisle: lean roof from the nave wall (y -3, z 11) down to the portico back (y -10, z 8)
lean_roof(F, -XE, -3.0, XE, -3.0, 11.0, 7.0, 3.0, 'tile')
# south nave wall: solid to the aisle roof, then the arched clerestory up to 20 m
wall(F, -XE, -3.0, XE, -3.0, 0.0, 11.0, 1.2, 'plaster')
arcade(F, -XE, -3.0, XE, -3.0, 11.0, 9.0, 1.2, NB, mat='plaster', open_w=2.6, open_h=7.6, back='dark', impost_mat='stone')

# north aisle: lean roof from the nave wall (y 9, z 11) down to the back wall (y 16, z 8)
lean_roof(F, XE, 9.0, -XE, 9.0, 11.0, 7.0, 3.0, 'tile')
wall(F, -XE, 9.0, XE, 9.0, 0.0, 11.0, 1.2, 'plaster')
arcade(F, XE, 9.0, -XE, 9.0, 11.0, 9.0, 1.2, NB, mat='plaster', open_w=2.6, open_h=7.6, back='dark', impost_mat='stone')

# nave gable roof along X, eaves at 20 m on the nave walls
gable_roof(F, 0.0, 3.0, 20.0, 2 * XO, 12.0, pitch=25.0, axis='x', overhang=0.5, mat='tile', tiles=True,
           rib_mat='tile2', gable_mat='plaster')

# back wall (north): plaster to the aisle eave, travertine plinth
wall(F, -XE, 15.5, XE, 15.5, 0.0, 8.0, 1.0, 'plaster')                  # y 15 .. 16
box(F, 0, YN + 0.04, 0.0, 2 * XO, 0.08, PLINTH, 'travertine')           # plinth, y 16 .. 16.08

# end walls (east and west): solid cores up to 20 m, skins with an arched door and two small dark windows
for s in (1, -1):
    wall(F, s * (XE - 0.5), YS, s * (XE - 0.5), YN, 0.0, 20.0, 1.0, 'plaster')
doors_u = [(13.0, 0.0, 6.0, 11.0, 'arch'),     # main door on the nave axis (y 3), 6 m wide, 11 m high
           (3.5, 12.0, 1.6, 2.4, 'rect'),      # window over the south aisle (y -6.5)
           (22.5, 12.0, 1.6, 2.4, 'rect')]     # window over the north aisle (y 12.5)
opening_skin(F, XE, YS, XE, YN, 0.0, 20.0, doors_u, 'plaster', depth=0.35, frame_mat='marble')    # outside = +x
opening_skin(F, -XE, YN, -XE, YS, 0.0, 20.0, doors_u, 'plaster', depth=0.35, frame_mat='marble')  # outside = -x
for s in (1, -1):                                               # bronze door leaves inside the recesses
    for yc in (1.5, 4.5):
        box(F, s * (XE + 0.2), yc, 0.0, 0.2, 2.8, 9.5, 'bronze')
    box(F, s * 47.92, 3.0, 0.0, 0.32, YN - YS, PLINTH, 'travertine')    # end-wall plinth, y -10 .. 16

# ---------------------------------------------------------------- scale figure (previews only)
human(F, -12.0, -19.5, 0.0)

finish('rome_basilica_aemilia', front='-Y', extra_cams=[('back', Vector((-0.35, 1.0, 0.0)), 10)])
