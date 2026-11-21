# Survey: the slope below Magna Mater and Victoria (stage A)

Measured on branch `claude/mm-slope-scheme` (main a806e70), `dist/test.html?test` after `romeLoadModels()`.
Probes: `probe/survey.mjs` (W.gy ground grid, streets, stairs, rings, footprints, rock outlines, PAL_SC, palMMStats, templeLinks) → `probe/survey.json`; `probe/top.mjs` (own triangle rasteriser, max y per 2 m cell, GLB models + terrain) → `probe/survey-ray.json`; `probe/sections.py` → `probe/sections.md`.

Frame: hill-local lx (ESE), lz (SSW); scene x = 100 + 0.866·lx − 0.5·lz, z = 300 + 0.5·lx + 0.866·lz. World north in local = (−0.5, −0.866), i.e. up-slope is −lz.
**M** = measured in the running page. **S** = read from source/model spec, not measured. **G** = my inference.

## 1. Levels

| Thing | Level (m) | Src | Notes |
|---|---|---|---|
| Magna Mater forecourt (main terrace) | 56.6 | M | lx −184.5…−140.5, lz 68…132 (S); temple roof 79.0 (M) |
| MM lower terrace | 48.6 | M | lx −192.5…−132.5, lz 132…148 (S); two-storey arcade 40×7 m, top ≈56 (M ≈54.8–56) |
| MM east side terrace | 48.6 | M | lx −140.5…−132.5, lz 85…132 |
| MM west side terrace | 48.6 | S/G | assumed symmetric (lx −192.5…−184.5); not rastered |
| MM lower-terrace south wall foot | ≈34.7–35.1 | M | wall exposed ≈13.5 m (model, not ours; R2 does not apply to the GLB) |
| MM model west stair | 48.6 → 40.6 | S/M | (−192.1,136) → foot (−200.5,152) |
| Victoria terrace | 52.0 | M | lx −130…−90, lz 107…157 (S); roof 70.3; rock base down to 37.3 |
| Victoria stair foot / Scalae Caci forecourt (PAL_SC land) | 42.06 | M | [−120.5…−107.5] × [166…176.8] |
| beltMM terrace | 42.0 | M | walls up to 7.3 m exposed |
| Ring 37 (palTer 37, segs 133–136) | 37 | M | walls 8.6–8.9 m |
| Ring 30 south piece (segs 114–117, lx −141…−169), the "square platform" | 30 (floor 30.0–30.2) | M | wall ≈7.6 m |
| Ring 23 = curved foot wall, floor = "road on it" (segs 114–127) | 23 | M | outer edge (−150.0,195.0) → (−239,134.6); floor 6–10 m deep; wall exposed 6.9–8.2 m |
| Valley street | 8–10 | M | begins lz ≈190 at lx −215, lz ≈220 at lx −130; west street meets ring 23 end at (−230,162) at 12.7 |

## 2. Stairs on the slope today (M)

| Stair | From → to | Steps / landings | Notes |
|---|---|---|---|
| Zigzag = templeLinks auto stair "众神之母神庙（库柏勒）", status `stair`, len 77, drop 22 | (−173.2,146.9) 34.69 → (−209.3,180.0) 12.72 | 116 / 4 | flights 34.69→30.73→27.01→23.04 at (−193.6,170.9); (−207.6,171.2) 23→15.88→12.72 |
| mmWest (PAL_MM_LINKS) | model stair 48.6 → landing 40.6 (19 base pieces) → ring 30 at (−216.0,125.8) 30.2 | 52 / 5 | palMMStats.west |
| mmEast | 48.6 → 42 at lx −137.5 | 33 | |
| w37 | 37 → 30.2 | | PAL_PLAN.west |
| w30 | 30 → 23.2 | | |
| Scalae Caci | 42.05 → 30.04 (−142.1,177.4) → 30 → 23 (−152,185.7) → 9.01 (−170,216); scFoot to street 8.17 (−177.6,228.8) | 174 / 6 | fixed points; path w 5.8 |

## 3. Sections (M: ground = W.gy, top = highest surface; every 6 m; full 3 m tables in `probe/sections.md`)

**A, west of the Magna Mater, lx −205**

| lz | 50 | 62 | 74 | 86 | 98 | 110 | 122 | 134 | 146 | 152 | 158 | 164 | 170 | 176 | 182 | 188 | 200 | 212 | 230 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ground | 42.4 | 40.7 | 38.8 | 36.4 | 34.8 | 34.1 | 33.4 | 32.8 | 32.4 | 31.7 | 29.0 | 24.7 | 19.7 | 15.7 | 13.0 | 11.2 | 9.1 | 8.3 | 8.2 |
| top | | | | | | | | | | 40.6 mmWest landing | | | | | | street | | | |

**B, the temple axis, lx −165** (top = MM model)

| lz | 60 | 72 | 84–102 | 108 | 120–126 | 138 | 144 | 150 | 156 | 162 | 168 | 174 | 180 | 186 | 198 | 210 | 222 | 234 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ground | 52.5 | 50.6 | 48.7–43.6 | 42.1 | 40.5–40.0 | 37.5 | 36.1 | 35.1 | 34.3 | 32.6 | 29.6 | 25.8 | 22.2 | 19.2 | 14.4 | 10.9 | 8.8 | 8.2 |
| top | 52.8 | 56.6 | 79 (temple) | 62.4 | 56.6 | 50.8 | 48.6 | 45.4 | 34.5 | 32.2 | 30.2 | 25.2 | 22.8 | 18.7 | 14.1 | 12.6 | 8.7 | 8.2 |

**C, between the temples, lx −135**

| lz | 64 | 76 | 82–94 | 100–112 | 118–142 | 154 | 160 | 166 | 172 | 178 | 184 | 190 | 202 | 214 | 232 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ground | 55.4 | 50.4 | 47.5–43.5 | 42.5–41.1 | 40.6–39.8 | 39.3 | 38.8 | 37.5 | 34.8 | 30.7 | 26.2 | 22.3 | 16.4 | 12.1 | 8.7 |
| top | 55.6 | 51.0 | 48.6 MM | 50 Victoria | 48.6 MM | 43.6 | 38.9 | 37.1 | 35.4 | 33.5 | 27.0 | 21.7 | 16.0 | 11.8 | 8.8 |

**D, Scalae Caci line, lx −114**: ground 44–47 under Victoria (top 52 / 70.2), 40.1 at lz 166, 37.9 at 172 (top 42.1 forecourt), 34.2 at 178, 29.1 at 184, 24.4 at 190, 17.6 at 202, 13.0 at 214, 8.9 at 232. Unfolded route in section D of `scheme-sections.png`.

Slope between the 42 belt and the street: ≈34 m height over ≈60–70 m horizontal (≈50 %); steepest at lz 160–185 (lx −205: 9.3 m in 12 m).

## 4. Plan extents of the scheme area (hill-local)

- Whole area worked on: lx −218…−134, lz 100…184.
- West yard: lx −209.5…−192.5, lz 102…140.5.
- Middle band (tabernae range): lx −188…−142.5, lz 148.3…155.5 (against the MM lower-terrace south wall).
- Court: lx −161…−134.5, lz 155.5…176.6.
- Lower band: rows A (lz 159.6…183, on ring 23 floor) and B/C (lz 149…174).
- Survey grid itself: lx −275…−55, lz 35…255.

## 5. Existing objects on the slope

| Object | Made by | Scheme |
|---|---|---|
| MM temple, podium, forecourt, lower terrace, arcade, model west stair | GLB `rome_magna_mater` (PAL_ASSETS) | keep |
| Victoria temple, terrace, stair | GLB `rome_victoria` | keep |
| Domus Augusti | GLB `rome_domus_augusti` | keep (outside area) |
| Scalae Caci + forecourt + scFoot | `palScalae`, `PAL_SC`, `palSCFoot` | keep; add a landing at 32.5 (splits 50 + 13 risers) |
| beltMM terrace and walls | `palMMEast` / `PAL_PLAN` beltMM | keep |
| mmEast stair | `palMMLinks` | keep |
| mmWest stair | `palMMLinks` | change: drop the 40.6 landing and upper flight; keep the lower 33.5 → 30.2 part |
| Zigzag (MM auto stair) | `templeLinks` (temple-links.js) | remove |
| Ring 23 wall + floor (foot wall, road on it) | `palTerraces` / `PAL_PLAN.west` rings | keep |
| Ring 30 south piece | same | change: floor becomes walk 30, front of row C |
| Ring 30 west stretch with portico, ring 37 | same | keep |
| w37, w30 stairs | `palWestStairs` | keep |
| Grove (holm oak, laurel, pines), scrub, foot planting, fill | `palWestSlope` | remove inside the scheme area; keep outside. Counts M: shrubs 64, grove 79, pines 33, fill 87, loose 26, foot 129, mmSlope 24; per-tree positions not measured |
| 8 m 'open' reserve squares | `palWestReserve` (223 `open:keep` footprints incl. ringLand) | change: clear where new buildings stand |
| City houses | `W.footMark.houses` (54 entries in the survey area) | none inside the scheme footprint (M) |
| Valley street | road bake | keep |
| Terrain | `palShape` rock-foot pull (20 m), `palPlatPost`, `palSCHold` | change under the flag (own ground mask) |

## 6. Rules and reserves the scheme touches

- **templeLinks:** the zigzag is the temple's auto link. Removing it leaves MM unlinked, and templeLinks would rebuild a stair unless the flag registers the new lane as the link. Masterplan: removing it changes `?city=v2` district 117 (bake risk).
- **Road bake:** the valley street and the ring 23 floor are kept as they are. The lane is a new path and must not be baked into the city road mesh. Not checked: whether the walker uses baked roads or `W.gy` here.
- **`W.footMark.houses`:** no overlap measured. The new footprints must be registered before that mark runs, so city lots and townspeople do not fill them.
- **"No terrace within 10 m of a rock base" (`palTerSkip`):** broken on purpose. The tabernae range R1–R7 and B1 stand against the MM base. This needs the author's acceptance or a flag-only exception.
- **R2 (≤ 9 m exposed):** new walls are 4.5–7.5 m. beltMM's south wall would show 9.5 m above the court: over the limit, partly covered by shed H (5 m).
- **R7, R10, R11:** square buttresses; a building's own wall ≤ 0.75 storey; every stair end flush. Applied in the plan, not checked in 3D.
- **R12 §15.3:** new hill-lane stairs need the author's consent. The oblique lane and the west foot stair both fall under it.
- **R9:** close-ups must be shown before demolition (zigzag, grove).

## 7. Not measured or unresolved

- The procedural meshes free their geometry after upload (19 meshes, incl. palTerraces, palPlatWalls, palPlatStairs, terraceFeet), so their tops come from source data (rings, stairs, wallFeet), not from a raster.
- MM west side terrace: assumed, not rastered.
- Individual tree positions: `W.trees` is empty after the flush.
- casa Romuli site (−101.5,169.5): ground level not taken.
- Street-raster line at lz ≈149 along the MM lower-terrace foot (lx −195…−139): source unknown.
- Slope east of the Scalae Caci's lower flight: looked at only in section C; left alone.
- No scene render of the area was made in stage A.
