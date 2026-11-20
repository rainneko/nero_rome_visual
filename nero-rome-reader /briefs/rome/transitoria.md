# 尼禄东宫（过渡宫）· Nero's east palace, "Domus Transitoria" (rome_transitoria)

Site: the east part of the Palatine top. Asset front = +X (east, toward the Velia and the Esquiline). The long
covered gallery to the Esquiline starts at its north-east corner (the page draws the gallery).
References: `villa_noble.jpg` (terraces, porticoes, pool, statues), `houses_rich_2.jpg` (loggias),
`hill_temple_base.jpg` (buttressed walls).

## History and book
* 【史】 Nero first built a palace linking the Palatine with the gardens on the Esquiline, the Domus Transitoria
  (most historians date it after AD 60). Its excavated rooms show a sunken nymphaeum court: a fountain wall of niches
  and small columns facing a pool and a columned dining pavilion, floors of porphyry, giallo antico and serpentine,
  gilded stucco.
* 【书中】 "我一个人披着斗篷站在帕拉蒂尼山东侧最高的那处观景露台上，隔着半座黑暗的罗马城，遥遥望着埃斯奎利诺山脚下的方向。"

## Shape and size (112 × 92 m; origin = centre; z = 0 = ground floor)
* `court_building(F, 0, 0, 112, 92, 64, 48, floors=2, floor_h=5.0, wall_mat='plaster', peristyle=True,
  col_order='corinthian', court_mat='paving', foundation=0, doors=(('E', 0.0), ('W', 0.0)))`.
* East front: a two-storey arcaded portico 6 m deep along the whole east side (`arcade` ×2, open, marble), so the
  colonnades stack up the hillside ("柱廊一层一层往上叠").
* Sunken nymphaeum in the middle of the court: a garden 36 × 20 m sunk to z −3 (walls 'marble' round it, stairs down at
  two corners). On its west side a fountain wall 36 m long, 8 m high: two storeys of aediculae (pairs of small
  'porphyry' and 'giallo' columns framing niches with statues), thin 'water' sheets falling down steps into a long
  pool at its foot. Facing it on the east side, an open dining pavilion: 6 'porphyry' columns, gilded capitals
  (cap_mat='gold'), tile roof.
* The tower belvedere — the highest point of the palace: a square tower 12 × 12 m, 32 m tall, at the middle of the
  east side, built into the east wing (`square_tower(..., top_loggia=True, roof='pyramid')`): the open loggia on top is
  the viewing terrace of the book.
* Platform walls on the east and south from 0 down to −6 (`retaining_wall`, buttress 'square'). `preview_ground(-6)`.
* Rich touches: 'porphyry' and 'giallo' columns, 'gold' capitals, red bands; tile roofs; no glass.
* Budget ≤ 60 000 triangles. `finish('rome_transitoria', front='+X')`.

## Checklist
- [ ] Courtyard palace with a two-storey east portico
- [ ] Sunken nymphaeum: fountain wall with coloured columns and water cascades, pool, dining pavilion
- [ ] 32 m tower with an open top loggia (the highest point) on the east side
- [ ] ≤ 60k triangles

## v2 (2026-11): the palace above its terraces, rebuilt from a plan
Brief: `briefs/rome/transitoria-v2.md`. Plan data: `tools/models/rome/transitoria_plan.json` (written and checked by
`python3 tools/plan/transitoria_plan.py`: 82 rooms, 26 roof blocks; drawings `briefs/rome/plans/transitoria-plan.html`).
This section replaces "Shape and size" above for everything over z = 0.

**Why** (the author, 2026-11-13): "接下来就精修尼禄东宫（过渡宫）吧 要求比提比略宫奢华。… 圈出来的是奇怪的拱廊". The v1 model was
four wings 22–24 m deep under single hip roofs, with a two-storey arcade on the east front.

**What it is now**
- Envelope 112 × 92 m, storeys 7.0 / 5.0 / 4.2 m. One ridge per range, no tiled plane over 7.6 m. Two storeys; three only in
  the south block (eaves 16.2, a row of arched windows); the west range is one tall storey; the south-west corner is the
  bath's two barrel vaults (kit material 'stone', a travertine coping). Three corner pavilions at 14.0 with one large arched
  window per storey on each outer face, a travertine belt and quoin strips. The gate block at 14.0 with a pediment, the
  four-column porch in front of it.
- **East front:** a two-storey colonnade 6 m deep between the tower and the pavilions, flat roof at 11.6. Lower order Ionic,
  5.25 m, in `pavonazzetto` (a kit material added for this: near-white with a violet-grey cast); upper order Corinthian in
  white marble, 3.8 m, on the floor with a marble balustrade between; a stone balustrade round the roof with figures. No arches.
- **Tower** 【书】: 12 × 12 m, shaft to the terrace floor at 30.0, eaves 34.0, apex 36.4. String courses, quoin pilasters,
  three windows a level in travertine frames, brackets under the cornice, a gilt band. The terrace is open between corner
  piers with two bronze posts a side; the page draws the plate glass in those three lights by story state
  (`domus-aurea.js`, `glaze`: 58 glazed, 64–68 burnt, glazed again later). A four-sided copper roof. Nothing of the lift shows.
- **Court:** garden 54 × 38 m, yellow (giallo) columns, walks two-storey on the north, east and south (upper order 3.3 m
  under lean-to roofs 11.2 → 10.6), one-storey on the west. Four lawns in clipped box, two round basins, clipped cypresses
  in tree pits (model geometry: the page plants no trees here). In the middle the sunken water court, 20 × 36 m at −4.5:
  【史】 a fountain wall like a stage front on the west, two tiers of eight aediculae with small columns (the upper tier
  stands 3.6 m over the garden), a long pool at its foot, a twelve-column pavilion on the east half, a balustrade round the
  opening, a stair of 26 risers inside the opening at its north-east corner.
- **Raised gallery stub** 【书】"廊子架在拱上，从街和神龛的头顶跨过去": from the upper colonnade's north-east end three bays of
  4 m to the east (to x 68, over the palace's own lower terrace), deck at 7.0, scaffolding at the unfinished end.
- Back walls of all porticoes: a red dado for the lower third, warm white above, an ochre panel per bay. Gilt bands under
  the main cornices; gilt bronze on the tower and the gate only. No chimneys, dormers or glass but the tower's.
- Only the tower, the lift, the clay model and the drawing office are the book's (【书】); everything else is design.

**Below z = 0** nothing changed but one line: the fill under the sunken court, whose top went from −3 to −4.5
(`box(F, 0, 0, ZB, 20.6, 36.6, 2.0 → 0.5, 'tuff')`). The terrace branch (PR 24) edits the same script below z = 0:
whoever merges second rebases.

**Files**
- `tools/models/rome/rome_transitoria.py`: the palace is calls into `tib_plan.py`, the module the Domus Tiberiana is built
  with (now palace-neutral: `load(prefix=, rules=)`; block options `wall_top`, `roof 'own'`, `vault_mat`, `parapet`, `col_mat`,
  `col_mat2`, `order1`, `on_floor`, `arch2`, `rail`, `low`; `BACK_MAT 'painted'`; `courts(holes=)`; `basement(skip=)`). The
  Tiberiana rebuilt with it gives byte-identical files. One run writes:
  - `assets/models/rome/rome_transitoria.glb`, the web file: 61 064 triangles (limit 70 000);
  - `assets/models/rome/parts/rome_transitoria_parts.glb`: 64 788 triangles (limit 100 000), eight objects `tr_base`, `tr_b1`
    (the four rooms under the garden; an eighth part beside the brief's seven, as the Tiberiana's `tib_b1`), `tr_garden`,
    `tr_f1`, `tr_f2`, `tr_f3`, `tr_tower` (the tower above the third floor), `tr_roof`, and 82 child objects `room_<id>`;
    208 partition pieces, 61 doors, 4 stair flights;
  - it prints `TR_BLOCKS` (for the stand-in in `palatine.js`: map the roof names to 0–3 as the comment there says).
- Renders `renders/rome_transitoria/` (`top`, `se_high`, `ne_high`, `apart`, `f1_rooms`, `f2_rooms`; close-ups `TR_ZOOM=...`).

**In the page**
- The stand-in until the model arrives (`palatine.js`) is one box per roof block; the old stand-in's court reservation is
  kept by an explicit call, so the street fabric's key did not move.
- Two hidden ground anchors under the court's north walk keep two cells of the ground grid as they were (see the
  Tiberiana's v2 section); drop them at the next re-bake.
- Page labels are untouched: their texts wait for the copy session.

**Checks** (2026-11-14): plan checker · `npm run check` · `build:test` + `test:boot`, no page errors · `bake-roads.mjs --check`
both up to date · `city-audit.mjs --assert` no errors · `__floatCheck()` this model 0 floating, 0 buried ·
`__wallFootCheck()` 127 walls, none long · `__palBaseCheck()` lists it on the summit terrace, base 0 · raw ground grid equal
to the old model's in every cell; `palrock.js` only `top` (36 → 37.6).

**Shots** `docs/screenshots/transitoria-v2-20261114/`: `r3_page_east`, `_north_bowl`, `_saddle`, `_top` (main left, v2 right);
`r3_model_*` (`top`, `se_high`, `ne_high`, `east`, `tower`, `court`, `nymph`, `north`, `south`, `west`, `stub`, `apart`,
`f1_rooms`, `f2_rooms`); `r1_*`, `r2_*`: the earlier rounds.

**Open**: colours and details after GPT's reference pictures (the upper colonnade's back wall is still a heavy red);
page label texts; trees in the court from the page; the two ground anchors.

### v2 checklist (2026-11-14)
- [x] Footprint, origin unchanged; below z 0 one line (the fill under the sunken court); road bake up to date
- [x] 26 roof blocks as in the JSON; no tiled plane with a run over 7.6 m
- [x] East front: colonnade between tower and pavilions, no arcade
- [x] Tower: terrace floor 30 m, glass on four sides still switched by story state
- [x] Four corners: three pavilions and the bath vaults; gate block with its porch
- [x] Court with the sunken water court, fountain wall on the west, pavilion on the east
- [x] Only the tower and the south block above two storeys
- [x] Gold only as bands and on the tower and gate pediment
- [x] No 【书】 on anything but the tower, lift, clay model and drawing office
- [x] Parts file with 82 `room_<id>` objects; web file 61 064 triangles

## The north gate's way down (2026-11-19)

The way from the north door to the street, hill coordinates (lx, lz): the grand stair on the axis (lx 73.3, 51.82 to 42), the gate platform (42),
the paired upper flights gUE / gUW along its front wall (42 to 39), the paved front of the gate garden, the central flight in the slot (39 to 34),
the terrace 34, the lower flights gLE / gLW (34 to 26), the foot terrace 26, the street stair footMC (26 to 20.6).

The break was at the feet of gUE and gUW. The slot's head stood at lz -157.3; its end piers (to lz -157.1) and the exedra's corner piers (to lz -156.55)
left 0.55 m between them, so nobody could pass from an upper flight's foot to the central flight. The slot's head is at lz -158.6 now: the paved front
is 3.1 m deep from the platform's wall to the head and about 1.8 m clear between the piers.

Checked with the first-person walker (`tools/test/fp-walk.mjs`): street stair foot, terrace 26, gLE, terrace 34, central flight, gUE, platform, grand
stair, the model's own west flight (51.82 to 56.9), the terrace before the north door, the door (lx 73.3, lz -109.1); the same way down to the street; gUW down to the terrace 34. Pictures: `docs/screenshots/palace-gates-transitoria-20261119/`.

## The street stair's foot to the lane (2026-11-20)

footMC comes down west along the north foot wall and meets the ground at the wall's foot, hill (84.3, -184.4), 21.0 (20.6 on the coarser terrain of
the test build: it ends where it meets the sampled ground). The nearest street is the head of a lane 6 m north of that, hill x 81-85 at lz -190 to -192,
17.6 m at its tip. (The note of 2026-11-19 said 11.5 m and 14.8 m: that was the cross street further down.)

The slope between them falls 55 %: steeper than a flight (0.2 on 0.38) with a landing, so a flight straight down from a landing at 21.0 stays 1 m over
the ground all the way to the cross street. The turn landing is therefore set into the slope (`palFootMCStreet`, `PAL_PLAN.footMCst`):

1. five more risers on west along the wall, 21.0 to 20.0 (three from 20.6), the parapet on the street's side; the cut is against the foot wall, with
   a face of masonry on it, and the ground is masked over it (the path rules, 15.1);
2. the turn landing at 20.0, 3.0 m long, a parapet across its west end (1.3 m short of the first shop arch's apron);
3. one flight with cheeks straight down the slope on hill x 80.9, 14 risers of 0.2, 20.0 to 17.2;
4. a foot paving one riser lower (17.0), 1 m deep, across the flight's foot and on east to hill x 83.5, in the lane's head.

20 risers in all from footMC's old foot, none over 0.2 m; the levels are the plan's, not the sampled ground's (15.4). The footprints are registered
after the houses: nothing to bake. No house footprint stands on the slope (checked in `W.foot.list`).

Walked with `tools/test/fp-walk.mjs`: terrace 26, footMC, the new risers, the landing, the flight, the foot paving, the lane, the cross street (14.8),
and back up. Pictures: `docs/screenshots/palace-gates-footmc-20261120/` (cameras A and B, before and after; one from the walk, looking up from the foot paving).

Review round 1 (2026-11-20):
- the awning and the stall that stood on footMC's lowest treads were not the street kit's: `terraceEdge` built the foot wall's shop rooms (B8,
  `arcadeRooms`) on every run of edge footN 10, also on the run under the stair (s < 2, the rooms are at 22-35), with a negative length: two arches,
  awnings and stalls backwards over 20 m of wall. It now builds rooms only on a run that holds at least 2 m of their span. The street kit is unchanged
  (every prop of the city compared before and after: 2168 in test.html, 1166 in index.html, none moved, none dropped);
- the slope falls away under the foot paving's street edge (0.2-0.65 m, over the walker's 0.5 m step): three steps along that edge (`skirt`), 0.2 m
  each, buried where the ground stands higher. Walked straight up from the cross street on to the paving, and on the stair's inner half;
- `tools/test/boot.mjs` fails when the stair is not built, is skipped, or its foot paving is more than 0.9 m off the ground.

Known, not changed here:
- the lane itself falls about 40 % from its head (17.6) to the cross street (14.8), 6 m, with no steps (the city's street, not the palace's);
- on the software renderer's tier (and in test.html) the wall-side flight ends at 20.6, not 21.0 (3 risers on along the wall, not 5), and the street
  raster has no cell at the lane's head: the paving's skirt ends about a metre short of the lane's cobbles there, on walkable ground;
- the west street stair footWC has the same break (its foot at 19.6, the street 15.5 m on and 8.6 m lower): next, in its own PR.
