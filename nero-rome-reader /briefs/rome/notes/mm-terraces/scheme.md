# Scheme: the slope below Magna Mater and Victoria (stage A)

Drawings: `scheme-plan.png` (plan, 2310×1928) and `scheme-sections.png` (A at lx −200, B at lx −158, C at lx −137.5, D the Scalae Caci unfolded; true scale).
Data: `scheme.json` (polygons, levels, lane points, buildings, life markers). Generators: `probe/scheme_data.py`, `probe/draw_plan.py`, `probe/draw_sections.py`.
Measured facts: `survey.md`. Everything here is design unless marked M.

## 0. Idea in one paragraph

Terraces first, then routes. The slope drops from the 48.6 and 42 belts to the 23 foot road (M) in three bands:
- **Middle band:** the sanctuary's working back side. A tile-roofed tabernae range sits against the Magna Mater's south wall, an arch on the temple axis opens into an old covered street, and a walled work yard with storerooms lies on the west.
- **Court:** the hollow below the temple front becomes a small shared court at 32.5 with a fountain basin.
- **Lower band:** two short rows of city houses with their backs to retaining walls, bent along the ring 23 curve.

One oblique lane climbs through this from the foot road to the court. The zigzag stair goes.
Nothing is on a grid: rows follow the contour, plots differ by 4–9 m in width and 1–3 storeys, and roofs are mostly lean-tos falling downhill.

## 1. Levels

| Level | Height | Status | Extent / use |
|---|---|---|---|
| MM forecourt | 56.6 | kept (M) | temple |
| MM lower terrace + arcade | 48.6 | kept (M) | |
| beltMM + Scalae Caci forecourt | 42 | kept (M) | |
| Model stair foot / yard-flight top | 40.6 | kept (M) | |
| **West yard** | 33.5 | new | lx −209.5…−192.5, lz 102…140.5; ≈1.1 m cut below today's ground (M 32.4–34.4) |
| **Court** | 32.5 | new | lx −161…−134.5, lz 155.5…176.6, irregular polygon with an east arm reaching the Scalae Caci |
| **Walk 30** | 30 | ring 30 south floor reused | front of row C, joins the Scalae Caci landing at 30 (M) |
| Road on the foot wall | 23 | kept (M) | front of row A |
| Valley street | 8–10 | kept (M) | |

Steps between bands: 56.6 → 48.6 (model) → 40.6 (model stair) → 33.5 yard → 32.5 court → 30 walk → 23 road → 9 street.
Each step is 1–8 m, so every retaining wall stays at or under 7.5 m, except beltMM's south face over the court (9.5 m; see risks).

## 2. Buildings (22, plus pergola)

Finishes by age: **T** = dark old tufa blocks; **N** = net-pattern facing with stone corners; **P** = plaster with a red dado. Pale travertine only for copings and door frames.

| Id | Plan (m) | Floor | Storeys | Eave | Roof (falls to) | Finish | Use |
|---|---|---|---|---|---|---|---|
| R1 | 6.5×7.2 | 27.8 | 2 | 34.2 | lean, S | N | taberna, shop below, store above |
| R2 | 6.0×6.9 | 29.0 | 2 | 35.4 | lean, S | N | taberna |
| R3 | 6.5×7.2 | 30.0 | 2 | 36.4 | lean, S | N | taberna |
| R4 | 4.2×7.2 | 31.2 | 2 | 37.6 | lean, S | N | taberna |
| RA | 4.6×7.2 | 32.5 | arch | 38.9 | lean, S | T, travertine keystone | arch on the temple axis into the old covered street (gated) |
| R5–R7 | 6.4 / 6.3 / 5.0 × 7.2 | 32.5 | 2 | 38.9 | lean, S | N | tabernae on the court's north side |
| S | 6.5×29.5 | 33.5 | 1 | 37.7 | lean, W | T | sanctuary storerooms, 6 rooms opening on the yard |
| P | 6.5×12.5 | 33.5 | — | 36.1 | pergola | timber | vine pergola, jars and cart below |
| H | 5.6×2.8 | 32.5 | 1 | 35.9 | lean, S | N | cart / wood shed against beltMM's south wall |
| B1 | 9×7 | 26.8 | 2 | 33.4 | lean, S | P | house, back to the MM south-west rock foot |
| B2 | 9×5 | 25.3 | 3 | 35.1 | lean, S | N | house; the yard flight's turn landing (40.6 side) sits on its back wall |
| C1 | ≈7×6 trapezoid | 30.0 | 2 | 36.0 | flat | P | house; roof terrace with vine pergola, entered from the court |
| C2 | ≈7×7 trapezoid | 30.0 | 2 | 36.0 | lean, SSW | N | house; laundry upstairs |
| A2 | 7×7 | 23 | 2 | 29.4 | lean, SSW | P | house and workshop; upper door onto the lane |
| A3 | 7.5×8.5 | 23 | 2 | 29.6 | gable | P | house, bench by the door |
| A4 | 7.5×10 | 23 | 3 | 32.4 | lean | P | 3 storeys, top loggia with laundry |
| A5 | 6.5×10.5 | 23 | 2 | 29.2 | lean | N | bakery, counter on the foot road |
| A6 | 4.5×8 | 23 | 2 | 30.0 | gable | P | corner house, compitum at its corner |
| A7 | 6.7×5.3 | 23 | 2 | 29.6 | lean | P | shop + loft, awning and counter |
| A8 | 4.8×5.3 | 23 | 2 | 29.6 | lean | N | pottery shop + loft |

Plot widths: 4.2–9 m. Heights: floors take 9 different levels, eaves 29.2–38.9. Row A splays about 12° along the curve. Plans are in `scheme.json`.

How the height is taken up (sections A and B):
- The tabernae range stands with its back on the MM wall foot. The model wall above it stays visible for 7.1 m.
- Row B steps from 25.3 to 26.8 and uses the lane cut as its ground floor.
- Row A's upper floors open onto the lane, which runs 2.5–6 m above the foot road (split-level houses).

## 3. Routes

**Oblique lane** (cordonata, 3–4.5 m wide, 0.15 m risers on ramps)

| Leg | Length | Rise | Slope | Treads |
|---|---|---|---|---|
| L0 (−216,153.8) 23.0 → L1 (−204,157.2) 25.0 | 12.5 m | 2.0 | 16 % | 13 risers in a ramp |
| L1 → L2 (−190,158.3) 27.2 | 14.0 m | 2.2 | 15.7 % | 15 |
| L2 → L2b (−177,158.0) 29.0 | 13.0 m | 1.8 | 13.8 % | 12 |
| L2b → L4 (−166,157.8) 31.0 | 11.0 m | 2.0 | 18.2 % | 13 |
| L4 → L5 (−161,158.2) 32.5, the court | 5.0 m | 1.5 | 30 % | an 8-riser flight |
| Branch L2b → X (−169.5,165.5) 30.0, onto walk 30 | 10.6 m | 1.0 | 9.4 % | 7 |

From the foot road to the court: 9.5 m of rise over 55 m (average 17 %).
The lane bends twice: once at L1, where it comes off the ring 23 curve, and again at the X fork, where the compitum stands.

**Scalae Caci:** all fixed points kept (M). It becomes a walled stepped lane, with a new landing at 32.5 at (−137.6,176.2) where the court's east arm joins. That splits the 42 → 30 flight into 50 + 13 risers.

**Short private stairs:**
- The yard flight, 40.6 → 33.5: 38 risers in 2 flights beside the model stair at lx −203, with a turn landing on B2.
- mmWest's lower part, kept: 33.5 → 30.2, 18 risers.

**West foot stair (to be decided):** 23 → 12.7, 55 risers in 4 flights against ring 23's outer face, from (−218.5,160.5) to (−232.5,150). It replaces the zigzag's two lowest flights as the link to the west street. Without it, the foot road reaches the valley only by the Scalae Caci and w30/w37.

**Removed:** the whole zigzag (116 steps); mmWest's 40.6 landing and upper flight.

**Kept:** mmEast, w37, w30, the Scalae Caci and the model stair. There are no dead ends (R8). Every new stair ends on a floor at its exact level (R11).

## 4. Signs of life (number = plan marker)

1. Counters and awnings at R1–R4 (facing the lane), R5–R7 (facing the court) and A7–A8 (facing the foot road).
2. Street fountain basin (lacus) where the lane widens into the court (−151.5,160.5).
3. Compitum shrine at the lane fork (−172.6,165).
4. Jars and a two-wheeled cart in the yard (−203,125.5).
5. Vine pergolas: the yard (P) and C1's roof.
6. Laundry: C2 upstairs and A4's loggia.
7. Benches: beside the arch, and by A3's door.
8. Kitchen gardens: west of B2 and at the yard's north end.
9. Weeds and bare rock only in the leftover corners: the MM south-west rock foot, and outside the yard flight.
10. Stone pines: 3 in the west yard (the pine of Attis, fitting the Magna Mater), 1 in the court. No grove.
11. A fig tree in a court corner.
12. Townspeople on the lane, in the court and on the foot road.

Optional: 【史】the hut of Romulus (casa Romuli) at about (−101.5,169.5), next to the Scalae Caci head. Its ground level was not measured.

## 5. History notes

- 【史】The Victoria temple stood at the head of the Clivus Victoriae. Sure (several sources).
- 【史】A road under the palace substructures on the west and north-west is traditionally the Clivus Victoriae. It is likely, but the exact line is disputed, and I did not check it against a plan.
- The covered street under the Magna Mater platform, and tabernae opening off it: **not verified (待核)**.
  - Project note `palatine-bugs-20261113.md` says the platform stood on arched substructures with the clivus passing under.
  - I found no source for shops there. In the scene, label it as design, not 【史】.
- 【史】The Scalae Caci are a fixed point, already in the scene.
- 【史】The casa Romuli was kept as a relic in this area. Sure in general; the position is approximate.
- Nothing later than Nero is used. The net-pattern facing is Augustan to Neronian; the tufa is older.

Sources: hmdb.org m=229883 and m=265324; Antiquaries Journal, "Temple of Victory on the Palatine"; Platner–Ashby 1929, p. 439 (Heidelberg digital).

## 6. Stage B: building it behind `?mm=1`

**Gate.** `const MM1 = /[?&]mm=1/.test(location.search)`, read once in `palatine-h1.js`. Without the flag no code path changes, so the default page behaves the same; check by diffing the `__palStairEnds`, `__palReach` and footprint counts with and without the flag.

**Order of work:**
1. Data: put the scheme polygons into a new classic script `src/scenes/rome/palatine-mm.js`, holding `PAL_MM` (levels, lane, buildings, life). Add it to `build.config.json` right after `palatine-h1.js`, keeping the existing order.
2. Removals, under MM1 only:
   - skip the Magna Mater's templeLinks auto stair by registering the lane as that temple's link (status `linked`, via `lane`), so templeLinks does not rebuild one;
   - cut mmWest at 33.5 in `palMMLinks`;
   - stop `palWestSlope` from planting inside the scheme mask, and `palWestReserve` from reserving there;
   - change ring 30's south floor only in its use, not in its geometry.
3. Terrain: a ground mask with our own post hook, after `palPlatPost`. Set W.gy to the level polygons (33.5, 32.5, 30) and to the lane profile; let `palShape`'s rock-foot pull skip cells inside the mask. The 3 m cells mean polygon edges need a 1.5 m apron of retaining wall.
4. Retaining walls: `terraceStrips` / palPlatWalls-style wall strips, with the T, N and P finishes, square buttresses (R7) and travertine copings.
5. Stairs: `hillStair` / `stairLandings` for the yard flight, the lane flights and the Scalae Caci split landing. The lane ramps are cordonata: risers 0.15 m, treads 1.1–1.4 m.
6. Buildings:
   - `houseShell` / `houseRectWalls` for the rows, with `rdPentRoof` (lean-to with antefixes) and gables where marked;
   - `rdShopRow` with `romanFrontRelief` for R1–R7 and A7–A8;
   - the arch RA reuses the tufa arch part of the shop row (to check).
7. Life:
   - props: `placeShopWares`, `romePlace('rome_awning'|'rome_cart'|'rome_compitum'|'rome_lacus'|'rome_laundry', …, {inst:1})`, or `fountain()` if `rome_lacus` does not fit;
   - trees: 4 pines + 1 fig via the existing tree instancer;
   - people: `populateStreetLife` / `W.people` spawns on the lane, court and foot road.
8. Footprints: register all new footprints before `W.footMark.houses`.
9. Checks: `__palStairEnds`, `__palOpenEnds`, `__palReach`, `__palBaseCheck`, `__palBareSlope` must pass under `?mm=1`. Also `npm run check`, `npm run build:test && npm run test:boot`.
10. Renders: the four views (plan bird view, from the Scalae Caci, from the foot road, from the forecourt edge), with and without the flag, for R9.

**Triangle estimate (G):**
- 22 buildings × ≈1.5–2k = 35–45k;
- walls and copings ≈10k;
- stairs and lane ≈12k;
- instanced props ≈5k;
- trees ≈3k.

Total ≈ +70–80k, about 0.35 % of the scene's 21.6M (M). Removing the zigzag and the grove saves roughly 10–15k (G).

## 7. Risks

1. **templeLinks / v2 district 117:** removing the auto stair changes `?city=v2` district 117 (masterplan). Under the flag v2 must not be touched, or the lane must be registered the same way in both.
2. **Terrain shaping:** the rock-foot pull (20 m) and the 3 m terrain cells will round off the court and yard edges. If the post hook runs in the wrong order, buildings float or sink. This is the most likely bug.
3. **Road bake:** the lane must stay a hill path, not a baked city road; check that the walker does not snap to an old road raster. The unexplained street line at lz ≈149 may interfere with R1–R7.
4. **Walker ground:** the lane ramps at 14–18 % plus one 30 % flight. Check that the walker's step-height limit allows the 0.15 m risers and that no level edge leaves a gap over 0.3 m.
5. **Townspeople:** they must spawn on the court and lane, not inside buildings or on roofs, and the footprints must be registered first.
6. **beltMM south wall:** 9.5 m exposed above the court breaks R2. Shed H covers the lower 5 m. Alternatives: raise the court's east arm to 33.5, or add a 1.5 m step in that wall.
7. **Rule exceptions:** `palTerSkip` (10 m from rock base) is broken by R1–R7 and B1; R12 §15.3 requires the author's consent for the lane and the west foot stair; R9 requires close-ups before removal.
8. **The model's south wall:** R1–R7 must butt against the GLB wall, which drops to 29.8 in places (M). There may be gaps behind the roofs.
