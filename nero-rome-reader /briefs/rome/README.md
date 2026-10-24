# Rome briefs · how a modelling worker runs

The novel is set in Rome in **AD 54–58** (the reader's main year is AD 56). You build the asset(s) of one brief with
Blender in background mode, render previews, look at them, fix, and report. The lead reviews your renders against
the brief, the reference images and history, and sends a numbered fix list. Repeat until every checklist item passes.

## Paths (the project folder name ends with a SPACE — always quote paths)
* Project root: `/Users/Rainy/PycharmProjects/nero_rome_reader/nero-rome-reader /`
* Kit: `tools/models/rome/rk.py` (Rome parts) on top of `tools/models/antium/bl_kit.py` (basic parts). Read BOTH
  first. Do not edit them.
* Your script: `tools/models/rome/<asset>.py` → `assets/models/rome/<asset>.glb` and `renders/<asset>/*.png`
* Reference images: `briefs/rome/refs/*.jpg` (game screenshots and reconstructions; see the warnings below)

## Script skeleton
```python
import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rk import *
reset()
F = Frame()                         # origin = centre of the footprint, z = 0 = the main floor / terrace level
# ... build with kit calls ...
human(F, 10, -8, 0)                 # 1.8 m red scale figure, previews only
preview_ground(-6.0)                # only if you built walls below z = 0 that the renders must show
finish('<asset>', front='-Y')       # front = the side the main stair / entrance faces
```

## Run
```bash
cd "/Users/Rainy/PycharmProjects/nero_rome_reader/nero-rome-reader " && /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/rome/<asset>.py" 2>&1 | grep -E "ASSET_REPORT|Error|Traceback|line [0-9]+"
```
A run takes seconds. Look at every render with the Read tool before you report. For long assets add close-up
cameras: `finish(name, front, extra_cams=[('close', Vector((0.3, -1, 0)), 20)])` gives renders/<asset>/close.png
(direction from the asset centre to the camera, elevation in degrees; the camera frames the whole asset, so for
real close-ups build a second, smaller test script that only contains one part).

## Kit parts you will want (tools/models/rome/rk.py)
* `podium_temple(F, cx, cy, W, L, pod_h, col_h, nf, kind, porch, order, front, stair, flutes, frieze_mat, ...)` —
  a Roman temple on a high podium: base and crown mouldings, stair between cheek walls with statues, columns, cella,
  bronze door, entablature, tiled gable roof with pediments and acroteria. Kinds: prostyle, pseudo, peripteral,
  sine_postico. Stairs: front, inset, sides (speaker's platform), None. Returns heights.
* `tholos_temple(...)` — round temple.
* `retaining_wall(F, pts, z_top, z_bot, buttress='round'|'square'|None, parapet=...)` — terrace wall with
  half-round buttress towers, string courses, coping, balustrade/wall/lattice parapet (the "hill base").
* `substructure(F, x0, y0, x1, y1, z0, storeys, h, bay, depth)` — stacked arcades with deep dark bays and half-columns.
* `rock_mass(F, pts, z0, z1)` — craggy stratified tuff outcrop under walls on a hill edge.
* `terrace_floor`, `checker_paving` (marble checks with red/blue border bands), `round_mosaic`, `altar`,
  `torch_column`, `lattice_rail` (bronze), `obelisk`, `quadriga`, `eagle`, `taberna_front` (shops), `balcony`
  (wooden, optional laundry), `timber_skin` (timber-framed mud walls with small windows), `pergola`, `stair_flight`,
  `vdisc` (wheel).
* From bl_kit: `box, beam, prism, cyl, sphere, lathe, column, colonnade, ring_colonnade, entablature, wall, arcade,
  opening_skin, band, cornice, hip_roof, gable_roof, lean_roof, cone_roof, dome, stairs, balustrade, statue, pool,
  round_pool, hedge, flower_bed, pediment_front, gate_block, rect_building, square_tower, court_building, human`.

## Rules
* Blender +X = east, +Y = north, +Z = up; metres; origin = centre of the footprint; z = 0 = main floor level.
  Foundations and terrace walls go below z = 0 (the brief says how deep). Nothing floats; every step is solid.
* Wall lines go counter-clockwise; the outside is on the right of p0 → p1.
* Materials: only names in the palette — bl_kit: marble, plaster, stone, tuff, tile, tile2, red, ochre, brick, wood,
  dark, bronze, gold, iron, lead, water, grass, hedge, gravel, paving, flowerR/Y/W/P, cloth; rk adds: grey, giallo,
  porphyry, granite, peperino, travertine, basalt, rock, pav_red, pav_blue, blue, plaster2, plaster3, mud, linen,
  awning, flame. Openings are never pure black and never see-through.
* Roofs are terracotta (`tile`) unless the brief says bronze or gilt. Close every roof.
* No trees and no people (the page adds them; leave soil beds where the brief asks for a tree). No window glass.
* **Nothing later than AD 58.** Do NOT copy from the reference pictures: the Colosseum, any amphitheatre in Rome,
  the Domus Augustana / Domus Flavia / "new vestibule" / "monumental ramp" of the Palatine map, the Stadium of the
  Palatine, the Forums of Trajan, Nerva and Vespasian (Temple of Peace), the Temple of Venus and Roma, the Basilica of
  Maxentius/Constantine, the Arches of Titus, Severus and Constantine, any big domed bath hall, brick-faced
  multi-storey arcaded street fronts with porticoes on every street (that is after the fire of AD 64).
  Files named `*_LATE.jpg` show Rome around AD 300 — use them only for what the brief says.
* Stay under the triangle budget. Edit only your own script(s), renders and GLB(s): other workers run in parallel.
  If you need a helper the kits lack, write it in your own script.
* Iterate on your own up to three times before reporting (render → look → fix).

## Foundations, hill bases and layering (the author's feedback, round 4 — read before you build)
* The author finds big flat podium or platform faces sticking out of a slope "突兀" (abrupt). Do not build one tall
  plain box under a building. Where the ground falls away, **step the base down in 2–3 terraces** (each 4–8 m high,
  each with a coping, a strip of paving or planting, and often a colonnade or a balustrade), the way
  `hill_temple_base.jpg` does: walls with half-round or square buttresses, string courses, the lowest wall rising out
  of craggy rock (`rock_mass`), stairs climbing along the walls.
* Layering (层叠): porticoes and loggias stacked on the terraces so the hillside reads as colonnades one above another.
* Decoration like `villa_noble.jpg`: fountains (round basins with a statue group, wall fountains with niches), rows of
  statues on pedestals, colonnades, pergolas, coloured marble ('giallo', 'porphyry', 'grey'), gilded details.
* Roofs: every tiled roof uses the kit roofs (tile ribs). Courtyards are open to the sky and finished (paving, garden,
  pool, peristyle) — never leave a flat grey patch in the middle of a roof.

## Report (short)
Asset name(s), triangle count(s), size, what you built, which checklist items pass, what you could not do, render paths.
