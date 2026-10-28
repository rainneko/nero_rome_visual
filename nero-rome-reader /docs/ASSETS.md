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

## Golden House: the round dining hall (2026-10-28)
`assets/models/aurea/coenatio.glb` is `models/reader/K5-core.glb` (the finished hall, 24,872 triangles, 18 PNG textures, 2.5 MB) of the
six-stage model closed on 2026-10-28: `renders/domus-aurea/coenatio-phase2-fixed-20261028/` in the main checkout, generator
`tools/models/construction/coenatio_phase2/model.py`, review `docs/reviews/coenatio-codex-closeout-20261028.md`. Copy it as it is:
`tools/glbopt.mjs` drops textures and UVs, so the build bundles it unshrunk into `dist/aurea-assets.js` (`lazy`, no `optimize`).
`domus-aurea.js` loads that file the first time the `coenatio` layer shows (states 7–8) and keeps the procedural drum until then.
Floor y = 0 at the model origin, door on +Z (the Palatine grid's SSW, down the slope); the node `ROTATING_CEILING` turns.
K0–K4 (the building of it) are not in the reader: the stages are not tied to any chapter in `book.txt`.

## Golden House: the colossus (2026-10-28)
`assets/models/aurea/colossus.glb` is version C ("long legs") of `renders/domus-aurea/proportion-20261028/long-legs/rome_colossus_sol.glb`
in the Codex worktree, put through `tools/models/rome/colossus_centre_head.mjs`: the head, curls and crown move 0.65 m to +x and 0.15 m up onto
the chest's midline (the body's neck stub follows on a falloff), the toes and drape hem move from the stone mesh to the bronze, materials are
renamed to the city's `bronze` / `travertine` / `gold`, vertex colours and UVs are dropped (2.3 MB, 116,229 triangles). Run it again on a new
source rather than editing the GLB. Origin at the foot of the 13 m stone base (top 6.68 m, footing to -2 m), front on +Z, 1 unit = 1 m.
`domus-aurea.js` loads it from `dist/aurea-assets.js` the first time `colossus8` or `colossus7` shows. In state 7 the head nodes
(`Sol_Head_Continuous_Neck`, `Original_A3_Curls_And_Ears`, `Seven_Ray_Crown`) are taken off and `colossus_works.glb` is added: the iron bars,
nest, timber props and casting debris of Kimi's construction model (`Kimi_Agent_头部重做/金宫铜巨人/rome_colossus_headless.glb` on the backup
drive), moved onto this body by `tools/models/rome/colossus_works.mjs` (Kimi's own body is the older, shorter-legged one and is not used).
