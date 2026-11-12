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

## Domus Tiberiana: built from a plan (2026-11-12)
`tools/models/rome/rome_tiberiana.py` (Blender, `tib_plan.py`) builds the palace above the platform from
`tools/models/rome/tiberiana_plan.json`: the rooms of each floor and the roof blocks, written and checked by
`python3 tools/plan/tiberiana_plan.py` (which also writes the drawings, `briefs/rome/plans/tiberiana-plan.html`). To change the
palace, change the plan and run both again. One run writes three files:
* `assets/models/rome/rome_tiberiana.glb`, the web file (one mesh per material, no rooms);
* `assets/models/rome/parts/rome_tiberiana_parts.glb`, the same model in seven parts (`tib_base`, `tib_b1`, `tib_garden`, `tib_f1`,
  `tib_f2`, `tib_f3`, `tib_roof`) with the rooms: one child object `room_<id>` per room, partitions, doors, stairs. It is for
  taking the floors apart and for Unity; the page's pack does not read the `parts/` folder;
* `assets/models/tiberiana.glb`, the light stand-in the page has inline (`DT_GLB`) until the model arrives (it used to be
  written by `tools/models/tiberiana_model.py`).
It prints `TIB_PLANTS` (for `palatine.js`) and `TIB_BLOCKS` (for the procedural stand-in in `monuments.js`): paste them again
after a change. The page's terrain under a hill model comes from the lowest model height per 4 m cell (`tools/pal_rock.mjs`), and
the street fabric's bake is keyed to that ground: after any change run `node tools/test/bake-roads.mjs --check`, and keep the
palace above z = 0 (`briefs/rome/tiberiana.md`, "v2 (2026-11)"). The tool lifts each cell toward its neighbours' lowest points
(at most 2.5 m) and the page draws the terrain 0.25 m under that, bilinear between the cells' centres: near a cliff the ground
is a bank up to 2.25 m above the model's own lowest surface, and it covers whatever of the model lies under it. Anything that
has to meet the ground (the north-west stair's foot) is laid out against that bank (`NW_PAGE`, `_page` in `rome_tiberiana.py`).

## Golden House: the round dining hall (2026-10-28, v3 2026-11-11)
Since 2026-11-11 the file is GPT's v3 (`renders/domus-aurea/coenatio-v3/models/coenatio.glb` in the main checkout, 2.45 MB, brief
`briefs/rome/aurea-refine-v2/`): the front wall is opened to the lake and a dais added; `ROTATING_CEILING` is kept. The view
`aureaDineLake` stands on the dais (GLB 10.43, 3.55, -2.8) and looks at the lake centre; `AUREA_DINEVIEW` clears houses from that fan.
The notes below are for the 2026-10-28 version.
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

## Golden House: the Oppian halls, the octagon wing (2026-11-09, v2 2026-11-11)
Since 2026-11-11 the source is `renders/domus-aurea/oppian-model-v2/` (S1, S3 and the new `court`), packed by `oppian_pack.mjs`
(already quantized files are passed through; nodes matching `site-context|ground-target` are dropped): `oppian_s1.glb` 3.33 MB,
`oppian_s3.glb` 7.66 MB, `oppian_court.glb` 1.24 MB (the lawn and zigzag stair up from the colonnade's inner gate, state 8);
`dist/oppian-assets.js` is 8.28 MB. The court's ground is GPT's `court_ground-target.csv`, stored as `OPP_COURT` (2 m cells, Int16 cm) in
`src/scenes/rome/oppian-court-ground.js` and applied after smoothing by the `post` hook of the 2 m patch `OPP_PATCH=[606,-160,952,184]`.
The notes below are for v1.
`assets/models/oppian/oppian_s1.glb` (state 7, 59–68: walls, true openings and timber centring) and `oppian_s3.glb` (state 8, finished: vaults,
roofs, pavements, paintings, pools, garden) are stages S1 and S3 of GPT's staged model `renders/domus-aurea/oppian-model-v1/` in the main checkout
(generator `tools/models/construction/oppian/build.py` there, brief `briefs/rome/oppian-model-v1/README.md`). `tools/models/rome/oppian_pack.mjs`
drops the schematic hillside node (`S*_site-context`), welds and quantizes them (8.1 → 4.0 MB, 17.4 → 10.1 MB for the 18:21 export); the build gzips them into
`dist/oppian-assets.js` (`lazy`, `optimize`, 9.0 MB), which `domus-aurea.js` fetches the first time `aureaHalls7` or `aureaHalls8` shows.
Run the packer again on a new export rather than editing the GLBs.
Origin at the octagon's centre, floor y = 0, front (the octagon's porch) on +Z. In the page: frame `frB(850,-40,190)` on the Oppian pad (`OPP` in
`domus-aurea.js`), floor at the pad's height. `oppGround` (called by `romeH`, with a 3 m terrain patch `OPP_PATCH`) holds the ground just under the
floor and cuts it under the two garden terraces (−3.06 and −6.19 m) and a lower lawn south of them. The houses on the footprint (`AUREA_OPPIAN`) are
shown in states 0–6 only. The procedural block and dome stay until the file comes, or for good without it.
