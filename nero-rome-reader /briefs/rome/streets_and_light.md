# 街道重做 与 神殿太白 · Streets redesign and the too-white temples

> 2026-10-25：第 1 节（街道）以 `city-generation-spec.md` 为准；第 2 节（神殿太白）仍然有效。

## 1. Streets (the author is very unhappy with them)
What is wrong now (shots/z_aven.png is the clearest): streets are flat lavender-grey strips of constant width, dead
straight, crossing at right angles, outlined by thin white lines (the kerbs), and they run across big empty grey squares.
They read like a map diagram laid on the ground, not like streets.

**The author's rule (this decides the design):** streets are not a network laid over the land. They grow by
themselves in the open ground around continuous, dense, built-up, non-vegetated areas: wherever buildings stand close
together, the space between and around them is street; where there is vegetation (gardens, parks, groves, hill slopes,
fields), there is no paved street. Streets come in three grades:
* **white marble / travertine slabs** — the Forum, temple precincts and forecourts, the Palatine palaces, the big
  monumental squares (rectangular slabs in courses, pale warm white, thin joints);
* **grey stone** — the main streets and the better districts (polygonal basalt as described below, grey to grey-brown);
* **dirt** — ordinary lanes, poor districts, the edges of the city, service yards (beaten earth with ruts).

Suggested way to build it (the integrator decides the details):
1. Rasterise the built-up area into a grid over the city (about 2 m cells): building footprints (W.foot and the GLB
   placements), vegetation zones (gardens, parks, groves, the green hill slopes), water.
2. Street cells = not building, not vegetation, not water, and within a few metres of buildings on both sides or
   along the main-road lines; drop isolated specks, keep it continuous. Squares appear naturally where buildings leave
   bigger gaps.
3. Grade per cell: marble inside monument/precinct zones and the Forum/Palatine; grey stone on the main roads and in
   mid/rich zones; dirt elsewhere and in alleys narrower than about 3 m.
4. Draw it with the terrain: a street-mask texture sampled by the terrain shader (grade + distance to the nearest wall)
   gives paving patterns, the kerb line and grime near walls with no extra geometry; add real raised kerbs/sidewalks
   (geometry) only along the grey-stone main streets. Replace the current per-block street rings (paveBlock) and the
   flat lavender road ribbons with this.

**Stairs on steep or complicated climbs (author):** where a street climbs a slope that is too steep or too
broken for a ramp (about > 12–15 % or with sharp level changes between terraces), the street turns into a stair of
its own grade: marble streets become **marble stairs** (wide white treads, landings, cheek walls with a coping),
grey-stone streets become **stone stairs** (grey treads, rougher, landings every 10–15 steps, a low side wall where the
ground falls away). **Dirt paths never become stairs**: they stay ramps or switchback paths, at most with a few log
or stone steps worked into the earth. Stairs follow the slope line, bend at landings, and start and end flush with
the street surfaces they join.

What Roman streets of AD 56 look like, and what to build:
* **Paved streets (silex):** polygonal basalt blocks, 0.6–1.2 m, fitted with thin dark joints. Colour dark grey-brown
  (about sRGB 60/57/53, varying ±10 % per stone), never blue or lavender. A slightly smoother, lighter worn band down
  the middle, two darker wheel ruts along the axis, dust and grit at the edges. Do it in the city shader (part 10) as a
  world-space Voronoi pattern; give paveBlock and the main-road ribbons a UV whose u runs along the street, so the ruts
  follow it.
* **Sidewalks (crepidines):** raised 0.3–0.45 m, 1.2–2.5 m wide. Beaten earth or reddish opus signinum on ordinary
  streets, travertine slabs on rich streets and near the Forum. The kerb is a row of long tuff/travertine blocks in a
  mid grey-beige with visible joints; its vertical face must read as a step with a shadow, never as a white line.
* **Stepping stones** at crossings of paved streets: three oval stones across the street (GLB rome_stepping).
* **Lanes and alleys:** beaten earth (warm ochre-brown) with ruts, some gravel, darker damp patches near fountains.
  No kerbs. On steep slopes, stairs (gradus) with landings instead of ramps.
* **Width and line:** vary street widths (main 6–9 m, ordinary 4–6 m, alleys 2–3 m). Bend long streets slightly where
  they follow a valley or contour; avoid long perfectly straight runs except Via Lata/Flaminia. Where streets meet,
  make small irregular piazzas rather than clean right-angle crossings.
* **Crossroads life:** at some junctions a compitum shrine (rome_compitum) and a street fountain (rome_lacus); along
  shop streets awnings (rome_awning), counters (rome_counter), amphora racks, a cart, laundry between upper floors.
  Porticoes along the big streets (Sacra Via, Vicus Tuscus, Argiletum).
* **Big empty grey squares:** no empty paved field anywhere. Give each open area a purpose: Forum Boarium (cattle
  market, the Ara Maxima, a round temple, stalls), Forum Holitorium (vegetable market stalls), temple forecourts (altar,
  statues on bases, trees in pits), and otherwise break the paving with a fountain, a tree group or a statue.
* **Fit the ground:** roads follow the terrain (no floating or buried strips); on slopes, cut the road in with a low
  retaining wall on the uphill side.
* **Named streets on their real routes** (labels are already partly there): Sacra Via, Vicus Tuscus, Vicus Iugarius,
  Argiletum, Clivus Argentarius, Clivus Capitolinus (zigzag), Clivus Palatinus, Clivus Victoriae, Vicus Longus, Clivus
  Suburanus, Clivus Scauri, Via Lata, the start of Via Appia at Porta Capena.

## 2. Temples look too white under the light
Why: the GLB marble and the procedural temple parts are near-white (albedo ~0.9) under a sun of intensity 3 with no
tone mapping, so lit faces clip to flat white and lose all form. Real Luna marble is a warm ivory; travertine is
beige; podiums are grey tuff or peperino; temples were painted and gilded in places; and they were weathered.
The plan, from strongest effect to weakest:
1. **Albedo:** cap marble/stone/plaster at about 0.7 (linear ≈ 0.45–0.5) and tint warm ivory (sRGB ≈ 232/224/207);
   travertine warmer and darker; podiums in peperino grey. Do it in romeMat by material name, and in the city shader
   for the procedural temples.
2. **Ambient occlusion:** tried and measured: per-vertex AO baked into the GLBs (`tools/models/rome/bake_ao.py`,
   test set in `assets/models/rome_ao/`) changes little (castor visible-area mean 0.78 → 0.74 even at 8 m) because the
   big low-poly faces are sampled only at their corners, and it makes the models 1.7× larger. Not used. Instead: a
   screen-space AO pass (three.js SAO/SSAO style) at the higher quality levels only, plus the shader terms below.
3. **Weathering in the shader:** darker, warmer grime in the lowest 2–3 m above each model's base; darker downward
   faces (soffits); faint vertical streaks under horizontal edges; per-block tone variation on walls and column drums.
4. **Highlight roll-off:** a soft shoulder in the final composite above about 0.8, so bright surfaces compress
   instead of clipping; leave mid-tones as they are (the author likes the current overall look).
5. **Colour accents (later model rounds):** painted frieze bands, coloured pediment ground, gilded acroteria and
   bronze doors on the main temples, as the references show.
