# Phase 4 hand-off (integration) · 2026-10-23

You are a fresh integrator. Read `briefs/rome/phase3.md` (how things work: build, shots, files), then `docs/TODO.md`.
Phase 3's work is in the working tree (not committed). Its shots are in `shots/t*_sheet*.png`, and the cameras are in
`tools/test/jobs-*.json`. Project root ends in a SPACE: quote it.

## A. Fixes from the phase 3 review (do these first; each with a before/after shot from the same camera)
1. **Claudia terminus plinth** (t6_e/t6_f): the model stands on a big salmon-pink slab that sticks out as a wedge over the
   sloping ground.
   * Flatten the terrain under the footprint (+3 m margin) instead, with the pad blended into the slope as the Palatine pads are.
   * Keep at most a 0.6 m travertine/stone plinth (grey-beige, not pink), with 2–3 steps where the ground is lower.
   * No exposed slab edge higher than 0.6 m.
2. **Diana precinct portico** (t7_after_n, t7_after_dia_b): one portico wing runs past the precinct onto the river slope on
   stilts. Trim it to the precinct, or seat it on the terrain. `__floatCheck()` must also cover the portico.
3. **Rocks** (t2_sheetF, t4_d):
   * Moss reads as neon yellow-green squares. Mute it (about sRGB 120/128/80) and cover at most 30 % of a rock's top.
   * Sunlit rock should probe 150–165, not 162–189.
   * The rocks sit on smooth lawn, so they read as boulders. In the terrain shader, colour steep cells (slope > 0.6, and
     always within 6 m of a rock cluster) as bare rock/earth (about sRGB 150/138/115, noisy), blending to grass over 3–4 m.
     The rocks should emerge from a rocky scarp.
   * Acceptance: t2_r2/t4_d cameras read as rocky cliff edges.
4. **White platform edge over the Capitol slope** (t4_c, top right): a pale sheet/wedge hangs over the green slope. Find the
   pad or platform and seat or trim it.
5. **Soft dark-green band** in front of the Jupiter temple (t4_b, t4_d) and the dark smudge by the Apollo stair foot (t3_a):
   remove them, or make them a hard, intended feature.

## B. New features (from `briefs/rome/refs/city_street_square.jpg`; TODO "待做")
6. **Squares:**
   * Place `rome_tholos_fountain` (a GLB in assets/models/rome/; a Blender worker may replace it in place with a domed
     roof, so just rebuild at the end) on 3–4 large squares or market places: Forum Boarium, Forum Holitorium, and one or
     two big street squares.
   * Add **cypress rows** (existing cypress tree type) along 2–3 square edges.
   * Add **honorific columns** on the Forum and 2 squares: a simple procedural column with a statue blob on top, about
     12 m high, on a 2 m pedestal; nothing post-Nero.
   * Add **large statue bases**.
   * No square may be an empty paved field.
7. **Facade additions** (table in `briefs/rome/facades.md`; extend it, keep the per-building hash):
   * top-floor open loggia (arches) on 20 % of rich and 10 % of mid tall houses;
   * a painted garland frieze under the eaves (rich 25 %, mid 15 %);
   * a small blue-ground painted shrine panel by a door (8 %);
   * stone voussoirs over ground-floor arches and corner quoins (rich 40 %, mid 20 %);
   * wooden balconies with a railing and pots (mid 30 %);
   * a red-painted base storey with an arcade on street fronts (mid 20 %).

   Shots: 2 close-ups (rich, mid) and 1 street view.
8. **Stone paving refinement:**
   * Squares and forecourts: warm beige-grey large slabs (about sRGB 196/186/168), not pure white.
   * Main grey streets: a slight central crown, a darker central drain line, two faint wheel ruts along the street axis.
   * All stone a touch warmer.

   Shots: one square and one main street at street height.

Stop after task 8 or at about 400k context, whichever comes first. Finish with `npm run check` and `npm run build`, then a
report of 15 lines at most: what changed, contact-sheet names, what is not done. Do not edit Blender scripts or GLBs; do
not delete files.
