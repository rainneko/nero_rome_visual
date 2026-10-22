"""Temple of Castor and Pollux, Forum Romanum, AD 56 (rome_castor). Brief: briefs/rome/castor.md.

Octastyle peripteral Corinthian temple (8 x 11 fluted columns) on a 7 m podium with a speaker's platform in front
(two side flights); small doors in both long sides of the podium; on the platform, one marble base per side carrying
a bronze Dioscurus beside his bronze horse, both facing front (-Y). Asset front = -Y (the Forum).
"""
import os, sys
import bpy
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rk
from rk import *

reset()
F = Frame()          # origin = centre of the podium, z = 0 = Forum level

# column counter: podium_temple places every column through rk.column, so this checks the layout
_ncol = [0]
_column = rk.column
def _count_column(*a, **k):
    _ncol[0] += 1
    return _column(*a, **k)
rk.column = _count_column

# --- the temple. W = 32 instead of the brief's 30: with the kit's spacing, 30 m gives 12 columns per flank;
# 32 m gives the brief's 8 x 11 (34 columns in all) and matches the history's 32 m width.
T = podium_temple(F, 0, 0, W=32, L=46, pod_h=7, col_h=12.5, nf=8, kind='peripteral', porch=2, order='corinthian',
                  front='-Y', stair='sides', flutes=12)
print('CHECK columns', _ncol[0], 'podium top', T['top'], 'eave', round(T['eave'], 2),
      'ridge', round(T['ridge'], 2), 'platform front y', round(T['front_y'], 2))


# --- small doors in both long sides (x = +-16): 10 per side, every 4 m, the first 6 m from the podium front (y = -23)
def podium_door(sx, yc):
    """A dark door panel 0.1 m proud of the podium side (sx = +1 east, -1 west), with a travertine frame."""
    X = sx * 16.05
    box(F, X, yc, 0.8, 0.1, 1.6, 2.4, 'dark')                 # panel 1.6 x 2.4 m
    box(F, X, yc, 3.2, 0.1, 2.0, 0.2, 'travertine')           # head of the frame
    box(F, X, yc, 0.6, 0.1, 2.0, 0.2, 'travertine')           # sill
    for d in (-0.9, 0.9):
        box(F, X, yc + d, 0.8, 0.1, 0.2, 2.4, 'travertine')   # jambs


for sx in (-1, 1):
    for k in range(10):
        podium_door(sx, -17.0 + 4.0 * k)


# --- the Dioscuri: on each half of the speaker's platform, a marble base (2.2 across x, 4.5 front to back y, 0.9 high)
# carries the twin (statue h = 3.0, no pedestal) standing beside his horse; both face front (-Y)
HORSE_S = 1.7            # horizontal scale of the quadriga horse parts: body 1.5 x 1.7 = 2.55 m long
HORSE_K = 1.7            # height scale, uniform with HORSE_S: back 2.4 m, head about 3.4 m above the base


def dioscuri_horse(F, x, y, z0, mat='bronze'):
    """A horse from the quadriga horse parts (rk.quadriga): body, neck, head, four legs, tail. Horizontal sizes x
    HORSE_S, heights x HORSE_K; head toward -y (facing front); feet on z0."""
    s, k = HORSE_S, HORSE_K
    T = F.sub(x, y, z0, 0.0)
    beam(T, 0, 0.5 * s, 1.15 * k, 0, -1.0 * s, 1.15 * k, 0.42 * s, 0.5 * k, mat)          # body
    beam(T, 0, -0.9 * s, 1.25 * k, 0, -1.25 * s, 1.85 * k, 0.24 * s, 0.32 * k, mat)       # neck, raised
    beam(T, 0, -1.2 * s, 1.85 * k, 0, -1.55 * s, 1.6 * k, 0.2 * s, 0.24 * k, mat)         # head
    beam(T, 0, 0.45 * s, 1.2 * k, 0, 0.8 * s, 0.85 * k, 0.1 * s, 0.1 * k, mat)            # tail, from inside the rump
    for (ly, lx) in ((0.35, -0.12), (0.35, 0.12), (-0.85, -0.12), (-0.85, 0.12)):
        beam(T, lx * s, ly * s, 0.95 * k, lx * s, ly * s, 0.0, 0.1 * s, 0.1 * s, mat)     # legs


BASE_H = 0.9
ZP = T['top']                          # platform top (7 m)
YC = (T['front_y'] - 23.0) / 2.0       # platform centre in y: it runs from front_y to the podium front face (y = -23)
for sx in (-1, 1):
    box(F, sx * 8.8, YC, ZP, 2.2, 4.5, BASE_H, 'marble')                                  # the base
    dioscuri_horse(F, sx * 9.3, YC + 0.79, ZP + BASE_H, 'bronze')                         # horse, nose 0.4 m inside the front edge
    statue(F, sx * 8.3, YC + 0.3, ZP + BASE_H, 3.0, 'bronze', pedestal=0.0, ped_mat='marble')   # the twin, beside his horse

# low samples for the previews (the Mac is short of memory); importing this module builds it without rendering
try:
    bpy.context.scene.eevee.taa_render_samples = 16
except Exception as e:
    print('CHECK samples not set:', e)

if __name__ == '__main__':
    finish('rome_castor', front='-Y')
