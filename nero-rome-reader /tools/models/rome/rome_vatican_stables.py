import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
from mathutils import Vector

# Royal stables on the Vatican slope: a courtyard building 60 x 36 m. Front (-Y) faces the track:
# two-storey wings with an arched gate; one-storey stall ranges W, E and N round a sand court.
reset()
F = Frame()

# ---------------------------------------------------------------- stall ranges (one storey, 4.6 m, tile roofs)
box(F, -26.0, 0.0, 0.0, 8.0, 20.0, 4.6, 'stone')                    # west range, x -30..-22, y -10..10
gable_roof(F, -26.0, 0.0, 4.6, 8.0, 20.0, pitch=24.0, axis='y', overhang=0.6, mat='tile', gable_mat='plaster')
box(F, 26.0, 0.0, 0.0, 8.0, 20.0, 4.6, 'stone')                     # east range
gable_roof(F, 26.0, 0.0, 4.6, 8.0, 20.0, pitch=24.0, axis='y', overhang=0.6, mat='tile', gable_mat='plaster')
box(F, 0.0, 14.0, 0.0, 60.0, 8.0, 4.6, 'stone')                     # north range, x -30..30, y 10..18
gable_roof(F, 0.0, 14.0, 4.6, 60.0, 8.0, pitch=24.0, axis='x', overhang=0.6, mat='tile', gable_mat='plaster')

# stall fronts on the court side: arched-free doors (dark recesses), one per 2.5 m
stall_w = [(1.5 + 2.5 * k, 0.0, 1.4, 2.6, 'rect') for k in range(8)]
opening_skin(F, -22.0, -10.0, -22.0, 10.0, 0.0, 4.6, stall_w, 'stone', depth=0.35)     # west (court = +X)
opening_skin(F, 22.0, 10.0, 22.0, -10.0, 0.0, 4.6, stall_w, 'stone', depth=0.35)       # east (court = -X)
north_w = [(2.0 + 3.5 * k, 0.0, 1.5, 2.6, 'rect') for k in range(12)]
opening_skin(F, -22.0, 10.0, 22.0, 10.0, 0.0, 4.6, north_w, 'stone', depth=0.35)       # north (court = -Y)

# open timber gable (hay loft) on the north range, over the centre bay, facing the court
for sx in (-1, 1):
    beam(F, sx * 3.2, 9.0, 4.6, 0.0, 9.0, 7.6, 0.22, 0.22, 'wood')
beam(F, -3.2, 9.0, 4.6, 3.2, 9.0, 4.6, 0.22, 0.22, 'wood')
beam(F, -2.4, 9.0, 6.0, 2.4, 9.0, 6.0, 0.14, 0.14, 'wood')
for sx in (-1, 1):
    beam(F, sx * 3.2, 9.0, 4.6, sx * 3.2, 9.0, 3.4, 0.2, 0.2, 'wood')
box(F, 0.0, 9.0, 4.4, 6.0, 0.1, 1.0, 'dark')                        # loft opening (dark, never see-through)
box(F, 0.0, 9.0, 4.4, 6.4, 0.06, 0.12, 'wood')                      # loft sill beam

# ---------------------------------------------------------------- two-storey front wings and the arched gate (y -18..-10)
rect_building(F, -20.0, -14.0, 20.0, 8.0, floors=2, floor_h=4.0, ground_h=4.0, wall_mat='stone', base_mat='stone',
              bay=3.0, win_w=0.9, win_h=1.3, roof='gable_x', foundation=0.0, quoins=False)
rect_building(F, 20.0, -14.0, 20.0, 8.0, floors=2, floor_h=4.0, ground_h=4.0, wall_mat='stone', base_mat='stone',
              bay=3.0, win_w=0.9, win_h=1.3, roof='gable_x', foundation=0.0, quoins=False)
gate_block(F, 0.0, -14.0, 0.0, 20.0, 8.0, 8.0, 5.0, 6.0, 'stone', 0.0, 2.0)

# ---------------------------------------------------------------- court: sand, long water trough
box(F, 0.0, 0.0, 0.0, 44.0, 20.0, 0.15, 'gravel')
box(F, 0.0, 1.1, 0.0, 24.0, 0.2, 0.8, 'stone')                      # trough: long walls, ends, base
box(F, 0.0, -1.1, 0.0, 24.0, 0.2, 0.8, 'stone')
box(F, -11.9, 0.0, 0.0, 0.2, 2.2, 0.8, 'stone')
box(F, 11.9, 0.0, 0.0, 0.2, 2.2, 0.8, 'stone')
box(F, 0.0, 0.0, 0.0, 23.8, 2.0, 0.2, 'stone')
box(F, 0.0, 0.0, 0.2, 23.6, 1.8, 0.4, 'water')                      # water top at 0.6

# ---------------------------------------------------------------- hitching posts outside the gate
for px in (-6.0, -2.0, 2.0, 6.0):
    box(F, px, -21.0, 0.0, 0.18, 0.18, 1.2, 'wood')
beam(F, -6.0, -21.0, 1.1, 6.0, -21.0, 1.1, 0.12, 0.12, 'wood')

human(F, -28.0, -24.0, 0.0)
import bpy
bpy.context.scene.eevee.taa_render_samples = 8          # low-sample previews (shared Mac)
finish('rome_vatican_stables', front='-Y',
       extra_cams=[('court', Vector((0.0, -1.0, 0.0)), 40)])
