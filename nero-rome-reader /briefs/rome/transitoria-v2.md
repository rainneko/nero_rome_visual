# 尼禄东宫 v2 · Domus Transitoria v2 (rome_transitoria): the palace above its terraces, rebuilt from a plan

From the review session, 2026-11-14. Same method as `briefs/rome/tiberiana-v2.md`: read that brief first; everything it says
about `tib_plan.py` (walls per roof block, roofs by type, windows, porticoes, parts, rounds) applies here unless this brief
says otherwise. Reuse the module; do not write a second one. If it has palace-specific numbers left in it, move them to the JSON.

Plan (data): `tools/models/rome/transitoria_plan.json`, written and checked by `python3 tools/plan/transitoria_plan.py`
(must print "checks pass: 82 rooms (F1 47, F2 28, F3 2, B1 5), 26 roof blocks").
Drawings: `briefs/rome/plans/transitoria-plan.html`, PNGs `briefs/rome/plans/png/transitoria-*.png`.
Reference pictures: GPT is drawing ten views from `briefs/rome/transitoria-v2-gpt-workorder.md`; they will be in the main
checkout under `renders/palatine/transitoria-v2-v1/`. Section 三 of that work order is the outside in words: it binds you now.
The pictures guide round 2 (details, colours); layout and sizes come from the JSON, never from the pictures.

## Why (the author, 2026-11-13)
"接下来就精修尼禄东宫（过渡宫）吧 要求比提比略宫奢华。… 圈出来的是奇怪的拱廊" (the circled part is the two-storey arcade
on the east front). The v1 model is four wings 22–24 m deep under single hip roofs: the same fault the Tiberiana had.

What the palace is for is at the top of the HTML. In short: the Tiberiana is the inherited official palace; this is the house
Nero wanted: the east tower with the lift, the building office with Celer's clay model, music, pictures, books, the water
court and the summer dining room, a new bedroom floor. No audience hall, no great banquet hall, few guards.
The copy session checked the labels: only the tower, the lift, the clay model and the drawing office are the book's (【书】).
Everything else is design and must not be labelled 【书】 in notes or page labels.

## Numbers that do not change
- Envelope 112 × 92 m, x −56…56 (east +, the Velia), y −46…46 (north +, the gate), z 0 = ground floor (page: 56.7 m).
  Origin, axes and the page placement (`PAL_ASSETS`: lx 73.3, lz −63.1, turn 0, hw 60, hd 52) stay.
- Everything below z = 0: the two stepped terraces and the hill base. The terrace session (PR 24, branch `claude/palatine-h2`)
  is editing exactly that part of `rome_transitoria.py` right now (an opening in the north parapet of terrace B on the axis,
  two flights against the wall of terrace A, a buried half-round pier on the east wall). **You do not touch anything below
  z = 0, and you do not edit those lines.** Put the palace in calls into the plan module, as you did for the Tiberiana, so
  the two changes merge without conflict. Start from `origin/main`; before round 2 ask the review session whether PR 24 is
  in main, and rebase onto it if it is.
- No road re-bake: `node tools/test/bake-roads.mjs --check` must say "up to date" at the end.

## Heights
F1 floor 0, 7.0 to F2; F2 floor +7.0, 5.0 high; F3 floor +12.0, 4.2 high. Eaves: two storeys 12.0; corner pavilions 13.0;
gate block 14.0; south block (three storeys) 16.2; west range (one tall storey) 7.6; bath vaults 8.0; court walks 11.2 (west
walk 6.2); the tower: terrace floor at 30.0, eaves 34.0. Nothing but the tower is higher than the south block's ridge.

## What is particular to this palace
- **East front** (roof blocks ME3, ME5): a two-storey colonnade 6 m deep between the tower and the two corner pavilions:
  lower order Tuscan or Ionic 5.6 m, upper order Corinthian 3.8 m on a stone balustrade, flat architraves. No arches.
  The old two-storey arcade goes.
- **Tower (MT)**: 12 × 12 m, plain plastered shaft with a travertine plinth and small windows, a cornice at 30.0, then the
  terrace: glazed on four sides between bronze mullions (material as the page's glazed loggia: `domus-aurea.js` line 72
  switches the glass by story state; find what it keys on and keep it working), parapet 1.0 m, a four-sided copper roof.
  The lift shaft is inside, in the north-east corner (feature `lift`): nothing of it shows outside.
- **Raised gallery stub**: from the upper colonnade at the north-east end (feature `doorE`, model (56, 21), z 7.0) a walkway
  3.6 m wide on arches goes east for three bays (about 13 m) and stops at a scaffolded end. It must stay inside the
  footprint the page reserves (hw 60): check, and shorten it if not. 【书】"廊子架在拱上，从街和神龛的头顶跨过去"; only this
  end was started that year.
- **Corner pavilions** (MNW, MNE, MSE1; the south-west corner is the bath vaults): 1 m higher, own hip roof, one large
  window per storey on each outer face.
- **Gate block (MNF)**: the existing pedimented porch stays in front of it (four columns, 14 m wide block, pediment).
- **Court**: garden 54 × 38 m; walks two-storey on the north, east and south, one-storey on the west. In its middle the
  sunken water court 20 × 36 m at −4.5 (feature `sunk`): the v1 model has this nymphaeum already (fountain wall on the west,
  pool, pavilion on the east). Keep it, move it to the plan's numbers, and make the fountain wall two tiers of niches with
  small columns, like a stage front 【史】. A balustrade round the opening; a stair down on the east side (room B05).
- **South block (MS1)**: three storeys, a row of arched windows on F3 to the south. The v1 roof terrace, pergola and the
  small domed rotunda on the south-east corner go; the terrace is now room 2S16 on the flat roof MSE2.
- **Bath (MSW1, MSW2)**: two plastered barrel vaults, three arched windows to the west.
- **Materials**: plaster warm white, travertine plinths and frames, coloured marble columns (yellow in the court, purple-veined
  on the east front, green at the gate), a 'gold' band 0.4 m under the main cornices and gilt bronze on the tower and the gate
  pediment only. No gold walls. No chimneys, dormers or glass anywhere but the tower terrace.
- **R7 and R10** of `briefs/rome/palatine-masterplan.md`: square buttresses only; the palace walls start at z 0 with a plinth
  of 0.9 m and no podium of their own.

## Parts
As for the Tiberiana: `assets/models/rome/parts/rome_transitoria_parts.glb` with `tr_base`, `tr_garden`, `tr_f1`, `tr_f2`,
`tr_f3`, `tr_tower`, `tr_roof`. Web file ≤ 70 000 triangles; parts file ≤ 100 000.

## Rounds (report to the review session after each, with the images; do not commit or push)
- **Round 1: massing and roofs.** Blank walls, all 26 roofs, the court and the sunken court as flat shapes, the tower, the
  east colonnade as plain posts. Renders `top`, `se_high`, `ne_high`; page views `east`, `north_bowl`, `saddle`, `top`
  before and after, same cameras.
- **Round 2: outside finished**, after the author has chosen from GPT's pictures: orders, windows, balustrades, fountain
  wall, glass, gallery stub, materials; page; all checks (`check`, `test:boot`, `bake-roads --check`, `city-audit --assert`,
  `__floatCheck`, `__wallFootCheck`, `__palBaseCheck`).
- **Round 3: parts and rooms**: `room_<id>` slabs for all 82 rooms, partitions, doors, stairs, the `apart` render.

## Checklist
- [ ] Footprint, origin, everything below z 0 unchanged; road bake up to date
- [ ] 26 roof blocks as in the JSON; no tiled plane with a run over 7.6 m
- [ ] East front: colonnade between tower and pavilions, no arcade
- [ ] Tower: terrace floor 30 m, glass on four sides still switched by story state
- [ ] Four corners: three pavilions and the bath vaults; gate block with its porch
- [ ] Court with the sunken water court, fountain wall on the west, pavilion on the east
- [ ] Only the tower and the south block above two storeys
- [ ] Gold only as bands and on the tower and gate pediment
- [ ] No 【书】 on anything but the tower, lift, clay model and drawing office
