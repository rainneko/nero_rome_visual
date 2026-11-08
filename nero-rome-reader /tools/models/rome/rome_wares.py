"""rome_wares · goods set out in the street in front of a shop (AD 56, before Domitian pushed the shops back behind
their thresholds; briefs/rome/ground-floor.md). Five small instanced props for the procedural houses:
rome_wares_jars (a potter's jars and dish stacks), rome_wares_bread (a trestle table of loaves and two baskets),
rome_wares_fish (a stone table with fish and a basket), rome_wares_amph (amphorae and jugs against the wall),
rome_wares_cloth (a rack of dyed cloth).
Origin = middle of the back edge, against the house wall; the goods stand out to -Y (the street), at most 0.9 m.
Run: /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/rome_wares.py"
"""
import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *            # noqa: F401,F403
from rome_tabernae import jar, amphora, loaf
import bpy


def _go(name, fn):
    reset()
    bpy.context.scene.eevee.taa_render_samples = 8
    fn(Frame())
    finish(name, front='-Y')


def wares_jars(F):
    for k, (x, y, h, r, m) in enumerate(((-0.55, -0.32, 0.78, 0.27, 'tile'), (-0.05, -0.28, 0.6, 0.22, 'tile2'),
                                         (0.42, -0.34, 0.5, 0.18, 'tile'), (0.2, -0.7, 0.36, 0.14, 'tile2'),
                                         (-0.35, -0.72, 0.32, 0.12, 'tile'))):
        jar(F, x, y, 0.0, h, r, m, 6, 'jar' if k % 2 == 0 else 'jug')
    for k in range(3):
        cyl(F, 0.62, -0.68, 0.11 * k, 0.17, 0.11, 'tile', 7, r_top=0.19)


def wares_bread(F):
    box(F, 0.0, -0.4, 0.74, 1.3, 0.62, 0.05, 'wood')
    for x in (-0.55, 0.55):
        beam(F, x, -0.12, 0.0, x, -0.68, 0.74, 0.05, 0.05, 'wood')
        beam(F, x, -0.68, 0.0, x, -0.12, 0.74, 0.05, 0.05, 'wood')
    for k in range(8):
        loaf(F, -0.48 + (k % 4) * 0.32, -0.25 - 0.3 * (k // 4), 0.79, 0.12)
    cyl(F, 0.85, -0.45, 0.0, 0.25, 0.3, 'wood', 8, r_top=0.3)
    for a in range(3):
        loaf(F, 0.85 + 0.11 * math.cos(a * 2.1), -0.45 + 0.11 * math.sin(a * 2.1), 0.3, 0.1)


def wares_fish(F):
    box(F, 0.0, -0.38, 0.0, 0.7, 0.4, 0.72, 'stone')
    box(F, 0.0, -0.38, 0.72, 1.2, 0.66, 0.07, 'marble')
    for k in range(6):
        box(F, -0.42 + k * 0.17, -0.38 + (0.12 if k % 2 else -0.12), 0.79, 0.34, 0.08, 0.05, 'grey', rot=70 + 25 * (k % 3))
    cyl(F, 0.85, -0.42, 0.0, 0.27, 0.26, 'wood', 8, r_top=0.31)
    for k in range(3):
        box(F, 0.85 + (k - 1) * 0.11, -0.42, 0.26, 0.3, 0.07, 0.05, 'grey', rot=80 + 30 * k)


def wares_amph(F):
    for k in range(3):
        amphora(F, -0.6 + k * 0.4, -0.22, 0.0, 0.95, (0.0, 0.2), 'tile' if k % 2 else 'tile2', 5)
    for k in range(2):
        jar(F, 0.5 + 0.26 * k, -0.55 - 0.08 * (k % 2), 0.0, 0.42, 0.13, 'tile2', 5, 'jug')


def wares_cloth(F):
    for x in (-0.75, 0.75):
        box(F, x, -0.55, 0.0, 0.07, 0.07, 1.85, 'wood')
        beam(F, x, -0.55, 1.2, x, -0.05, 1.75, 0.05, 0.05, 'wood')
    beam(F, -0.8, -0.55, 1.82, 0.8, -0.55, 1.82, 0.05, 0.05, 'wood')
    for k, m in enumerate(('linen', 'red', 'blue', 'awning', 'ochre')):
        hh = 0.9 + 0.2 * ((k * 5) % 3)
        box(F, -0.6 + k * 0.3, -0.55, 1.8 - hh, 0.26, 0.02, hh, m)


if __name__ == '__main__':
    for name, fn in (('rome_wares_jars', wares_jars), ('rome_wares_bread', wares_bread), ('rome_wares_fish', wares_fish),
                     ('rome_wares_amph', wares_amph), ('rome_wares_cloth', wares_cloth)):
        _go(name, fn)
