# Antium briefs · how a modelling worker runs

One worker = one brief. You build the asset(s) in that brief with Blender in background mode, render previews,
look at them, fix, and report. The lead reviews your renders against the brief, the reference images and the novel,
and sends a numbered fix list. Repeat until every checklist item passes.

## Paths (note: the project folder name ends with a SPACE — always quote paths)
* Project root: `/Users/Rainy/PycharmProjects/nero_rome_reader/nero-rome-reader /`
* Kit (shared, read-only for you): `tools/models/antium/bl_kit.py` — read it first; it has boxes, prisms, columns,
  colonnades, ring colonnades, arcades, facade skins with real window recesses, hip/pyramid/gable/lean/cone/ring roofs
  with tile ribs, stairs, balustrades, crenels, statues, pools, flower beds, temple fronts, gate blocks,
  `rect_building`, `square_tower`, `court_building`, and `finish()`.
* Your script: `tools/models/antium/<asset>.py`
* Reference images: `briefs/antium/refs/ref1_headland_overview.jpg … ref5_bridge_closeup.jpg`

## Script skeleton
```python
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_kit import *
reset()
# ... build with kit calls (frame None = world; Frame(x, y, z, rot_deg) for local frames) ...
human(None, 10, -8)          # 1.8 m scale figure in the previews only
finish('<asset>', front='+X')  # renders/<asset>/{front,side,three,top}.png + assets/models/antium/<asset>.glb
```

## Run
```bash
cd "/Users/Rainy/PycharmProjects/nero_rome_reader/nero-rome-reader " && /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/antium/<asset>.py" 2>&1 | grep -E "ASSET_REPORT|Error|Traceback|line [0-9]+"
```
A run takes a few seconds. The `ASSET_REPORT` line gives triangles, size, z range and file paths.
Look at every render with the Read tool before you report.

## Rules
* Blender +X = east, +Y = north, +Z = up; metres; origin = centre of the footprint; z = 0 = ground-floor level
  (the bridge brief uses sea level instead — read it). Foundations go below z = 0 so nothing floats on a slope.
* Wall lines go counter-clockwise around a building; the outside is on the right of p0 → p1.
* Materials: only the names in `PAL` (marble, plaster, stone, tuff, tile, tile2, red, brick, wood, dark, felt, bronze,
  gold, iron, silver, copper, lead, water, grass, hedge, gravel, paving, flower*, cloth). White plaster walls, red
  bands, travertine plinths, terracotta roofs. Openings are never pure black and never see-through.
* Close every roof: gable ends need their triangles (the kit does it), no gaps between roof and wall.
* No trees (the page adds them). No window glass. Nothing later than Nero (AD 54–68).
* Stay under the triangle budget. Do NOT edit `bl_kit.py` or any file outside your own script, renders and GLB.
  If you need a helper the kit lacks, write it in your own script.
* Iterate on your own up to three times before reporting (render → look → fix).

## Report (keep it short)
Asset name(s), triangle count(s), size, what you built, which checklist items pass, anything you could not do,
and the render paths.
