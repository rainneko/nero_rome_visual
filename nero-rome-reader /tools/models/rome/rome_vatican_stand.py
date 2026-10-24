import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
from mathutils import Vector

# One straight module of the raised wooden stands of the Vatican circus (after AD 57: three tiers added).
# x -15..15 (30 m), y -8..8 (16 m); arena side = -Y. Stone podium wall with a wooden fence, three tiers of
# wooden benches on an open timber frame, plank walkways, a lean tile roof on posts over the top tier.
reset()
F = Frame()

XS = (-14.0, -7.0, 0.0, 7.0, 14.0)

# ---------------------------------------------------------------- podium wall and fence (護栏)
box(F, 0.0, -7.5, 0.0, 30.0, 1.0, 2.0, 'stone')                    # podium wall, y -8..-7, z 0..2
lattice_rail(F, -14.8, -7.6, 14.8, -7.6, 2.0, h=1.05, mat='wood', post_mat='wood', post_every=3.0, panel=0.9)

# ---------------------------------------------------------------- tiers: plank decks, risers
box(F, 0.0, -4.5, 3.4, 30.0, 5.0, 0.2, 'wood')                     # tier 0 deck, y -7..-2, top 3.6
box(F, 0.0, 0.5, 6.2, 30.0, 5.0, 0.2, 'wood')                      # tier 1 deck, y -2..3, top 6.4
box(F, 0.0, 5.5, 9.0, 30.0, 5.0, 0.2, 'wood')                      # tier 2 deck, y 3..8, top 9.2
for k in range(20):                                                 # risers: open board slats on rails (frame visible)
    xs = -14.25 + 1.5 * k
    box(F, xs, -2.0, 3.6, 0.22, 0.25, 2.8, 'wood')                 # tier 1 riser slat
    box(F, xs, 3.0, 6.4, 0.22, 0.25, 2.8, 'wood')                  # tier 2 riser slat
box(F, 0.0, -2.0, 3.6, 30.0, 0.25, 0.2, 'wood')                    # tier 1 riser rails
box(F, 0.0, -2.0, 6.2, 30.0, 0.25, 0.2, 'wood')
box(F, 0.0, 3.0, 6.4, 30.0, 0.25, 0.2, 'wood')                     # tier 2 riser rails
box(F, 0.0, 3.0, 8.8, 30.0, 0.25, 0.2, 'wood')

# ---------------------------------------------------------------- open timber frame: posts, beams, braces
for x in XS:
    box(F, x, -6.8, 0.0, 0.3, 0.3, 3.4, 'wood')                    # row front (under tier 0)
    box(F, x, -2.4, 0.0, 0.3, 0.3, 6.2, 'wood')                    # row 2 (tiers 0/1)
    box(F, x, 2.6, 0.0, 0.3, 0.3, 9.0, 'wood')                     # row 3 (tiers 1/2)
    box(F, x, 7.4, 0.0, 0.3, 0.3, 9.0, 'wood')                     # row back (under tier 2)
for (yy, zb) in ((-6.8, 3.2), (-2.4, 6.0), (2.6, 8.8), (7.4, 8.8)):
    beam(F, -15.0, yy, zb, 15.0, yy, zb, 0.25, 0.25, 'wood')       # long beams under the decks
for i in range(len(XS) - 1):
    a, b = XS[i], XS[i + 1]
    beam(F, a, -6.8, 0.5, b, -6.8, 3.0, 0.14, 0.14, 'wood')        # diagonal braces, front row
    beam(F, a, 2.6, 2.5, b, 2.6, 8.6, 0.14, 0.14, 'wood')          # diagonal braces, row 3
    beam(F, a, 7.4, 2.5, b, 7.4, 8.6, 0.14, 0.14, 'wood')          # diagonal braces, back row
for x in XS:
    box(F, x, 2.7, 9.0, 0.25, 0.25, 0.85, 'wood')                  # front roof posts
    box(F, x, 7.6, 9.0, 0.3, 0.3, 2.0, 'wood')                     # back roof posts, up to z 11.0
beam(F, -15.0, 7.6, 10.9, 15.0, 7.6, 10.9, 0.3, 0.3, 'wood')       # back wall plate

# ---------------------------------------------------------------- lean tile roof over the top tier
lean_roof(F, -15.0, 8.0, 15.0, 8.0, 11.0, 5.4, 1.2, 'tile')

human(F, 0.0, -12.0, 0.0)
import bpy
bpy.context.scene.eevee.taa_render_samples = 8          # low-sample previews (shared Mac)
finish('rome_vatican_stand', front='-Y', extra_cams=[('back', Vector((0.0, 1.0, 0.0)), 15)])
