# 提比略宫 v2 · Domus Tiberiana v2 (rome_tiberiana): the palace above the platform, rebuilt from a plan

Plan (data): `tools/models/rome/tiberiana_plan.json` — written by `python3 tools/plan/tiberiana_plan.py`, which also checks it
(rooms fill each floor without overlap, every upper room stands on a block tall enough, roofs + open courts fill the plan,
no roof span over the limit). Drawings: `briefs/rome/plans/tiberiana-plan.html` (each floor, the roofs, the floors taken apart).
Before picture: `docs/screenshots/palatine-plan-20261111/now_tib_roofs.jpg`, `now_tib_north.jpg`.
This brief replaces the "Shape and size" section of `briefs/rome/tiberiana.md` for everything above z = 0. The hill base of
that brief (rework of 2026-11-08, three rounds: north arcade, terrace garden, cliff, north-west stair, west walls, corner towers)
is finished and stays exactly as it is.

## Why (the author, 2026-11-11)
- "提比略宫的超大砖瓦也很奇怪": the wings are 28–33 m deep under single roofs, so each roof plane is a tiled sheet up to
  130 m long and 17 m wide. Roman ranges were one room deep; a palace roofscape is many small roofs round courts.
- "非必要 皇宫 domus 不要超过三楼 … 一楼做高": at most three storeys, a tall ground floor. The model has a 4-storey banquet
  hall (18.5 m) and a 19 m corner tower.
- "提比略宫其实本质上是个元老贵族房子形制 可以稍微夸张一点点 … 不能超过大皇宫规制": a senator's house on the axis porch →
  atrium → tablinum → peristyle → oecus, enlarged; no dome, no rotunda, less gilding than the Golden House.
- "一楼 二楼 三楼 按照房间功能的平面设计图 那种可以拆开的 … 未来要放 Unity": the floors must exist as separate parts.

【史】 What the plan takes from the excavations (Krause 1983–88; Tomei and Filetici from 1990; summaries: Tomei and Macaulay,
"Domus Tiberiana", Gardens of the Roman Empire; the Wikipedia article of the same name):
- a central peristyle of 100 × 150 Roman feet (29.6 × 44.4 m) with a basin whose inner wall alternates rectangular and
  semicircular niches (Julio-Claudian), and a small cryptoporticus under the walks;
- south of it a double row of rooms with a broad corridor between them, north of it another block of rooms;
- an oval fish pond, open to the sky, in the south-east corner;
- a portico in front of a row of rooms on the south-west (guard graffiti there are later than Nero: 待核);
- Nero's cryptoporticus, 130 m, along the east side;
- a Republican house on a high podium under the west end;
- a pavilion called the Hermaeum and a solarium beside it (Suetonius, Claudius 10), and a keeper of the solarium's awnings.
The unified platform itself is Neronian and, by the excavators, later than the fire of AD 64; before that the "Domus Tiberiana"
was several houses joined together. The novel's palace of AD 54–59 keeps the platform we already have. Write this in the
model's 【史】 note; do not claim the plan is the excavated one.

## The novel's own rooms (added 2026-11-12; they are in the plan data now)
The reader's gazetteer (`GZ` in `src/ui/app.js`) sends these names from the text to the Palatine view, so the palace must have them:
| the book | in the plan | where |
|---|---|---|
| 寝宫、寝殿 | 2T2 | tower, F2 |
| 屋顶露台 | SOL | beside the bedroom, F2 |
| 大餐厅 | E07 | east side |
| 秘书处 | N08 | west of the state atrium |
| 核销房 | N09 | east of the state atrium |
| 金库 | N10 | next to 核销房: thick walls, one door, no window |
| 内殿 | S01 | south of the peristyle (position 待文案组核对) |
| 西侧偏殿 and its 小庭院 with the pomegranate tree | W08, W09 and court W14 | west side, y 4…28 |
| 后厨 | E11 | north-east |
| 甜酒工坊 | E03 | between the cellar and the banquet anteroom |
| 地下浴室 | B05–B08 | basement, under the west side hall |
| 秘密回廊 | B01–B04, B09 | basement ring under the peristyle walks, with a link to the bath |
| 暗阁 | not placed yet | the copy session is asked for the passage; leave room for a mezzanine |

Changes this makes to the first version of the plan: the ground-floor bath on the west side is gone (roof block M17 is now one
single-storey gabled hall, 7.5 m to the eaves, instead of three vaults and a flat roof: 35 roof blocks, not 38; 134 rooms,
not 130); the west court W14 is the pomegranate court (paved, a 3 × 3 m soil bed in its north-east corner, feature `pome`).

## Numbers that do not change
- Platform top z = 0 (page: 54.8 m), building 130 × 100 m: x −65…65 (east +), y −50…50 (north +, the front).
- Page placement `PAL_ASSETS` (`palatine.js`): lx −138.4, lz −29.8, turn 0. A model point (x, y) is at hill-grid
  lx = −138.4 + x, lz = −29.8 − y; world = `palW(lx, lz)`.
- The rock foot outline (`palrock.js`) and everything below z = 0. So no road re-bake: `node tools/test/bake-roads.mjs --check`
  must still say "up to date" at the end. If it does not, something below z = 0 moved: undo it.

## Heights
| | floor | floor to floor |
|---|---|---|
| F1 | 0 | 6.5 |
| F2 | +6.5 | 4.5 |
| F3 | +11.0 | 3.8 (only the south-west tower M12 and the north frontispiece M02) |

Eaves: one storey 6.5, two storeys 11.0, three storeys 14.8; the state atrium 8.5; the banquet hall nave 14.5 (aisles 6.5 at
the outer wall, 7.9 against the nave; changed from 13.0 after round 1). The highest ridge is the tower's, 17.2 m. Nothing may be higher.

## Steps
0. **Start clean.** `git fetch origin`; work on a new branch from `origin/main`. Copy these from the review session's worktree
   (`/Users/Rainy/PycharmProjects/nero_rome_reader/.claude/worktrees/cool-solomon-015306/nero-rome-reader /`) to the same
   paths in yours; they are not committed anywhere yet and your PR carries them:
   `tools/plan/tiberiana_plan.py`, `tools/models/rome/tiberiana_plan.json`, `briefs/rome/plans/tiberiana-plan.html`,
   `briefs/rome/tiberiana-v2.md`, `docs/screenshots/palatine-plan-20261111/now_tib_roofs.jpg`, `now_tib_north.jpg`, `now_top.jpg`.
   Run `python3 tools/plan/tiberiana_plan.py`: it must print "checks pass: 141 rooms … 35 roof blocks".
   Open the HTML and read all six tabs before modelling.
1. **Read** `tools/models/rome/rome_tiberiana.py` (257 lines), `rk.py`, `bl_kit.py`, `docs/ASSETS.md`, and
   `briefs/rome/tiberiana.md` from "Rework 2026-11-08" down. In the script: lines 13–68 are the fills, the hill base, the
   forecourt and the north porch (`pediment_front` at line 68); lines 70–152 are the palace (wings, hall, apartment, eagle,
   service wing, belvedere tower, garden court, peristyle, garden furniture, pavilion, side-door stair, upper loggia);
   lines 153–240 are the terrace garden and the cliff; 241–257 fold the tile ribs and call `finish`.
2. **Take the before set**: the model previews as they are, and the page views `tib_roofs`, `tib_north`, `top`, `saddle`,
   `west` (cameras in `briefs/rome/palatine-masterplan.md` section 7; `tools/plan/palatine_survey.mjs` shows how they are shot).
3. **New module `tools/models/rome/tib_plan.py`**: loads the JSON and builds from it. Keep it free of palace-specific numbers,
   so that a change in the JSON is a rebuild, not an edit. It needs:
   - `block_walls(M)`: the outer faces of a roof block from z 0 to its eaves. A face is drawn only where the neighbour is
     lower or open (compare with the other blocks and `open_courts`), from the neighbour's eaves up. Plinth 0.9 m
     ('travertine'), walls 'plaster' with the red dado band the model already has, a string course at every floor level
     (6.5 and 11.0), a cornice under the eaves.
   - `roof(M)` by `M.roof`:
     - `gable` (ridge `EW` or `NS`), `hip` (ridge shortened by half the span at both ends), `pyramid`;
     - `lean`: `ridge` is the side the water runs to (N/S/E/W); the high edge is `eaves`, the low edge is in the note
       (porticoes 4.8; M13 5.2; M28n/M28w 9.6; hall aisles 6.5);
     - `compluviate`: four planes falling inward to the opening given in the note, the opening 1.4 m lower than the outer
       edge, a 0.3 m upstand round it;
     - `flat`: a paved deck ('paving') with a 1.0 m parapet (0.45 thick) where it has an open edge;
     - `vault`: a barrel vault along `ridge`, rise 0.3 × span, plastered ('plaster', no tiles), with a low parapet wall at
       both ends.
     Pitch 0.40 (rise per metre of run, about 22°) for every tiled roof. Eaves overhang 0.6 m. Tile ribs (imbrex rows) run
     down the slope at the kit's spacing; the script's `_ribs_sparse` trick may stay only if the ribs are still no more than
     1.1 m apart on screen (they are 2.4 × the kit spacing now: check that the smaller roofs still read as tile, not as stripes).
     Ridge tiles on every ridge and hip. Antefixes are not modelled.
   - `windows(M)`: only on faces `block_walls` draws. F1: small high windows 0.7 × 1.4, sill at 3.8, one per 3 m bay, none
     on stairs, stores, the bath's cold room or guard rooms (take the room behind the face from `rooms`: types `stair`,
     `service`, `guard` get none). F2 and F3: 1.1 × 1.9, sill 1.0 above the floor, one per 3 m bay, dark with a lattice.
     The caldarium (W08) gets three arched windows 1.8 × 3.2 on the west face 【史】 (Vitruvius 5.10.1: baths face the winter
     sunset). No chimneys, no dormers, no glass.
   - `porticoes()`: for every F1 room of type `portico` a colonnade on its open side: Ionic 'marble' columns 4.4 m at
     3.0 m centres, an architrave, the lean-to roof above. P01 and P03 carry a second order (the F2 rooms 2P01, 2P03):
     Corinthian columns 3.4 m on a 1.0 m parapet, floor at 6.5. L01 (the Forum loggia, F2, y 44…50, x −27…27) is open to the
     north: Ionic columns 3.6 m at 3.0 m centres on a 1.0 m parapet, the gable roof M01 above it.
   - `floors_and_rooms(level)`: for the Unity file only (step 8).
4. **Replace lines 70–152** of `rome_tiberiana.py` by calls into `tib_plan.py`, plus the things that are particular:
   - **North frontispiece (M02)**: three storeys, 12 m wide. F1 is the porch that exists (`pediment_front`, line 68): keep
     it, but make it 12 m wide, 4 columns, its floor on the forecourt. F2 is the middle of the loggia L01. F3 is room 3N1
     with three arched openings to the north and a pediment (plain tympanum, 'marble' cornice) on its gable.
   - **State atrium (M03)**: walls to 8.5 m, the compluviate roof, the opening 8 × 5 m over the impluvium (`features`).
     Six Corinthian columns round the impluvium are inside and belong to step 8.
   - **Banquet hall (M25, M25w, M25e)**: the nave walls rise to 14.5 m with arched clerestory windows 1.2 × 2.8 at 3 m
     centres between z 9.0 and 11.8 on both long sides, a 'gold' band 0.5 m high under the cornice, a pediment on each gable.
     Two rows of 13 columns inside (x 47.5 and 56.5) are step 8.
   - **Tower (M12)**: three storeys, hip roof, the F3 study with a three-bay loggia to the west.
   - **Solarium (M14)**: flat deck at 6.5, parapet 1.0 m, six bronze awning posts 3.0 m tall on the parapet (three on the
     west side, three on the east), a door from 2T1 on its south side.
   - **The eagle** (`eagle(..., broken=True)`): on the west apex of M15's gable, at (−53, −22.5), ridge z 8.3. The book:
     "屋脊边立着一只早年被风吹缺了半边翅膀的旧陶鹰，他就抱着膝盖坐在陶鹰旁边的瓦片上". One reaches it from the solarium over
     the flat top of the corridor (M08), whose parapet is left out for 2 m at x −53…−51 on the north side.
   - **Fig court (W03)**: 'paving', a soil bed 5 × 5 m ('grass') at x −50…−45, y −40.5…−35.5 (moved after round 2: in the
     corner the crown ran into the walls). The page plants the fig tree at model (−47.5, −38), which is hill-grid (−185.9, 8.2). Find where the page plants it now
     (`grep -n "fig" src/scenes/rome/*.js`) and move it; the tree must be 8–9 m tall so its crown is level with the F2
     window of 2T2.
   - **Peristyle garden (P05)**: move the existing pool, round basin, statues, wall fountain and pavilion to the positions
     in `features` (pool x −15…15, y 4…13 with alternating rectangular and semicircular niches along its inner wall, each
     niche 1.2 m wide; pavilion at (0, −4); basin at (−18, −5)). The pavilion keeps its form (the book's 柱廊凉亭).
   - **Fish-pond garden (E18)**: 'gravel' and 'grass' beds, the oval pond 16 × 8 m at (54.5, −41) with a 'marble' kerb,
     eight herms (a square pillar 1.6 m with a head) along the path round it, a 1.8 m wall with a coping on the east and
     south sides. The Hermaeum (M11) opens to it with four columns on its east side.
   - **West side hall (M17) and the pomegranate court (W14)**: a tall single-storey hall, three doors 1.8 × 3.4 to the court
     on its east side. The court is 'paving' with the soil bed of feature `pome`. The page has this court already, as a
     separate little block south-west of the palace (`monuments.js`, the `courtBlock` at world (−118, 252) with `W.pomePos`
     and four `西侧偏殿小庭院` labels whose text changes with the story state). Remove that block and its footprint, set
     `W.pomePos` to the new place (model (−41, 26) = hill grid (−179.4, −55.8); y = 54.8), and move the four labels there
     with their texts unchanged. Check what else reads `W.pomePos` (the tree that dies in state 7) and that it still works.
   - **Underground bath (B05–B08)**: one exception to "nothing below z = 0 changes": three arched windows 1.2 × 1.8 in the
     upper west platform wall, between the buttresses, at y 8.5, 17.0 and 22.5 (as built in round 2), sill at z −3.6, dark inside; and a 0.6 × 0.6
     smoke opening at y 31. The rooms themselves are round 3 (floor at −5.5, barrel vaults to −0.6). The foot outline does
     not change.
   - **Kitchen (M26)**: a raised ridge vent (a 0.6 m high louvre strip along the middle 8 m of the ridge).
   - **Side door**: it moves from y −20 to y −29.5 (the west end of the broad corridor C01). The outside stair still runs
     south along the west platform wall from the door sill down to the −7 strip; regenerate it from the new door. Its foot
     must stay at least 3 m north of the south-west corner tower (centre (−71, −56), radius 4.5). Then
     `grep -n "tiberiana\|TIB" src/scenes/rome/*.js src/world/*.js` for anything keyed to the old stair or door, and fix it.
   - **Doors on the outside**: `features` of kind `door` (north, west, south, east, cryptoporticus). The south door (S06)
     gets a small pediment on a cross gable 8 m wide over the portico M10. The cryptoporticus door is on the east wall at
     y 37: check that it meets `PAL_CRYPTO` in `palatine.js`, whose first point is hill-grid (−72, −64.5), which is model
     (66.4, 34.7).
5. **Parts for taking apart.** Build into collections, and export them as separate objects in a second file:
   `tib_base` (everything below z 0 and the forecourt, the terrace garden, the cliff), `tib_garden` (the six open courts and
   what stands in them), `tib_f1`, `tib_f2`, `tib_f3` (walls, porticoes and loggias of each storey: cut the walls at 6.5 and
   11.0), `tib_roof` (every roof, the eagle, the awning posts). `finish(NAME, …)` writes the web file as now (one merged
   mesh per material); add an export of the same scene with the six parts kept apart to
   `assets/models/rome/parts/rome_tiberiana_parts.glb`. Check in `build.config.json` and `tools/models/rome/*.sh` that the
   page's model pack does not pick up the `parts/` folder.
6. **Renders** to `renders/rome_tiberiana/`: the four preview cameras, the three extra ones the script has, plus `top`
   (straight down, the roof plan), `se_high` (from the south-east, 35° down: the view of the drawing's taken-apart tab) and
   `apart` (the six parts 14 m apart in z, same camera).
7. **Page.** Optimise as `docs/ASSETS.md` says, paste the new `TIB_PLANTS` line the script prints into `palatine.js`,
   build, and shoot the same five page views as in step 2.
8. **Rooms (after the outside is accepted).** For the parts file only: `floors_and_rooms(level)` adds to `tib_f1/2/3` a
   floor slab per room (material by `type`: `state`, `dining`, `private` 'marble'; `portico`, `corridor`, `court`
   'paving'; `garden` 'grass'; `bath` 'marble'; the rest 'travertine'), partition walls 0.45 m thick to the storey height
   between rooms, a door 1.6 × 2.6 in the middle of the longest wall a room shares with a `corridor`, `portico`, `court`
   or `garden` room (if none, with its largest neighbour), stairs as straight flights in the `stair` rooms, the atrium's
   six columns and the hall's 26. Name each room's slab `room_<id>` so Unity can find it. The web file gets none of this.
9. **Checks** (`dist/test.html?test`, summer):
   - `python3 tools/plan/tiberiana_plan.py` passes;
   - `npm run check`; `npm run build:test && npm run test:boot`; `node tools/test/bake-roads.mjs --check` up to date;
   - `__floatCheck()` no higher than before; `__wallFootCheck()`: no seam over 20 m;
   - web file ≤ 80 000 triangles (62 639 now); parts file ≤ 110 000;
   - `node tools/test/perf-shadow.mjs` at the Forum view: frame time not more than 3 % worse.
10. **Write up** in `briefs/rome/tiberiana.md` under a heading "v2 (2026-11)": what changed, the numbers, the shots
    (`docs/screenshots/tiberiana-v2-<date>/`, before on the left, after on the right), and add the `docs/TODO.md` items.
    Do not commit or push: report, and the author says the word in your session.

## Rounds (report to the review session after each, with the images)
- **Round 1: massing and roofs.** Steps 0–4 without windows, columns or garden furniture: blank walls, every roof, the
  open courts as flat colours. Renders `top`, `se_high` and the page view `tib_roofs`. This is what the author judges first.
- **Round 2: outside finished.** Windows, porticoes, loggia, frontispiece, hall, tower, solarium, eagle, gardens, doors;
  the page; all checks.
- **Round 3: parts and rooms.** Steps 5 and 8, the `apart` render.

## Checklist
- [ ] No part over three storeys; three storeys only at M12 and M02; highest ridge 17.2 m
- [ ] F1 6.5 m, F2 4.5 m, F3 3.8 m; string courses at 6.5 and 11.0 on every face
- [ ] 35 roof blocks as in the JSON; no tiled plane with a run over 7.6 m; ridges, hips and tile ribs on every tiled roof
      (portico lean-tos may run the length of their colonnade: the 45 m rule is for ridges)
- [ ] Six open courts visible from above: peristyle garden, fig court, pomegranate court, service court, kitchen court, fish-pond garden
- [ ] Peristyle garden 45 × 29 m with the niched pool, the round basin and the book's pavilion; two-storey walks on the north and west
- [ ] North front: porch, loggia 54 m long on F2, frontispiece with a pediment on F3
- [ ] Banquet hall: nave over aisles, clerestory, gold band, two pediments; 14.5 m to the eaves
- [ ] South front (toward the Area Palatina) two storeys behind the portico, gate pavilion with a pediment in the middle
- [ ] No white flat roofs; no ridge runs more than 45 m without a break
- [ ] South-west: tower, solarium with awning posts beside the F2 bedroom, the broken eagle on M15's west apex, fig bed in the paved court
- [ ] West side hall with the pomegranate court (the old separate block removed, labels and `W.pomePos` moved); bath windows in the west platform wall; kitchen with a ridge vent; no chimneys, no dormers
- [ ] Fish-pond garden with the oval pond, the herms and the Hermaeum (pyramid roof)
- [ ] Side door at the west end of the corridor with its stair; cryptoporticus door meets `PAL_CRYPTO`
- [ ] Below z = 0 nothing changed; foot outline unchanged; road bake up to date
- [ ] Web file ≤ 80 000 triangles; parts file with `tib_base`, `tib_garden`, `tib_f1`, `tib_f2`, `tib_f3`, `tib_roof`
- [ ] Round 3: `room_<id>` slabs for all 141 rooms, partitions, doors, stairs; the `apart` render matches the drawing
