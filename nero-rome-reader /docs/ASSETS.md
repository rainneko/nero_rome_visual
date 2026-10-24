# Asset pipeline

Large detailed buildings are GLB files. The Rome models (`assets/models/*.glb`) are inlined in the page; the Antium
models (`assets/models/antium/*.glb`) go into `dist/antium-assets.js`, which the page loads when the Antium page is
opened (and in the background a few seconds after start). Every model has a plain procedural stand-in that stays if
the model cannot load.

## Conventions
* Metres; Blender +X east, +Y north, +Z up (exported Y-up: page x east, z south). Origin at the centre of the
  footprint, z = 0 at ground-floor level, foundations below 0 so nothing floats on slopes (the bridge uses sea level).
* Material names from the kit palette (`PAL` in `tools/models/antium/bl_kit.py`): plaster, marble, stone, tuff, tile,
  red, brick, wood, dark, felt, bronze, gold, iron, silver, copper, lead, water, grass, hedge, gravel, paving, flower*.
  The page adjusts a few by name: `gold` shines, `water` is translucent, `tuff` and `dark` are darkened to match the
  scene, and all GLB materials get the same atmospheric haze as the procedural city.
* Roofs terracotta, no glass, nothing later than Nero. Keep each model within its brief's triangle budget.

## Antium: Blender in background mode (no MCP needed)
1. Brief: `briefs/antium/<name>.md` — book quotes, sizes, orientation, checklist, triangle budget.
   `briefs/antium/README.md` is the worker's workflow; reference images are in `briefs/antium/refs/`.
2. Script: `tools/models/antium/<asset>.py`, built with the kit (columns, colonnades, arcades, facade skins with real
   window recesses, roofs with tile ribs and closed gables, stairs, balustrades, statues, pools, whole buildings).
3. Run: `/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "tools/models/antium/<asset>.py"` →
   `renders/<asset>/{front,side,three,top}.png` and `assets/models/antium/<asset>.glb` (a few seconds).
4. Review: compare the renders with the brief, the references and the book; send a numbered fix list; repeat.
   In Claude Code the lead session runs one `blender-modeler` worker (`.claude/agents/`, Haiku) per brief, in parallel.
5. Optimise: `sh tools/models/antium/optimize.sh` quantizes every Antium GLB (positions 14-bit, normals 8-bit;
   KHR_mesh_quantization, read natively by three.js) — about 57 % of the raw size, ~1.2 MB gzipped for all twelve.
6. Place: in `src/scenes/antium/*.js`, `antStand(G, layer, name, x, z, y, rot, standIn)` registers a placement
   (one model can be placed many times) and draws its stand-in. `npm run build`, then check the views.

## Rome generators
`tools/models/*.py` are the Python (trimesh) scripts that wrote the Rome GLB files.
