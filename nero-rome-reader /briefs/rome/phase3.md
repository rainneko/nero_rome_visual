# Phase 3 hand-off (integration) · 2026-10-23

You are a fresh integrator. The previous integrator's work is in the working tree (not committed). Read
`docs/TODO.md` first, then this file. Project root ends in a SPACE: quote it.

## How things work (short)
* Build `npm run build`, check `npm run check`, test build `npm run build:test`. Node:
  `/private/tmp/claude-501/-Users-Rainy-PycharmProjects-nero-rome-reader/599a50f0-4258-4435-8b25-02b48d3e1cbc/scratchpad/node/node-v20.18.1-darwin-arm64/bin`.
* Headless shots: `node tools/test/cam.mjs jobs.json` → `shots/`; jobs `{"out","pos","tgt"}` or `{"out","view"}`, optional `"js"`.
  Review your own shots as 2×2 contact sheets (cheap) rather than one by one.
* GLBs: `assets/models/rome/*.glb` → `tools/glbopt.mjs` → lazy bundle `dist/rome-assets.js`. Placement list `ROME.GLB`
  (monuments.js), Palatine via `PAL_ASSETS` in palatine.js. `romeMat` maps materials by name (assets.js).
* Debug: `window.__floatCheck()` (floating GLBs), `window.__temple(true/false)`.
* Streets: `src/world/streets.js` (2.5 m mask → terrain shader; grades marble/grey/dirt; `streetStairs`, `hillRoute`).
* Facades: shader in `src/core/materials.js`, `g.set(part,seed,sty,fl,nSt,gH,band,lit)` from builders.js / lots.js;
  ornament table in `briefs/rome/facades.md`.

## Tasks, in order. Acceptance is numeric or a named shot; report each with its shot.
1. **Window interiors stipple** (shots/p_mid.png: black/white per-pixel noise inside every window). Make the glass/void a
   flat dark warm colour (≈ sRGB 40/34/30) with at most one soft vertical gradient and an optional shutter shape; no
   per-pixel hash. Then shoot a rich-house close-up and a mid-house close-up; no horizontal line at every floor.
2. **Rock outcrops read as white popcorn** (shots/p_rock_cap.png). In monuments.js (~line 561):
   * Colour: sunlit rock face must probe ≈ sRGB 165/155/135 (the ledge rock of the hill models), with moss tint on tops.
   * Sink them: base at −40 % of their height, squash `sy` to 0.5–0.7.
   * Placement: no even scatter. Use clusters of 3–5 overlapping rocks along the steepest breaks (slope > 0.8, top 20 % of the
     steepness), turned so their flat faces follow the contour. Total ≤ 40.
   Acceptance: from the p_rock_cap camera they read as rock ledges/scarps, not boulders.
3. **Paved blob beside the Apollo stair** (shots/p_patch.png). A road meeting a stair should be a strip of road width
   (≤ 7 m), not a 30 m patch: cap the street mask's growth around stair feet / hillRoute joins.
4. **Green smear** at the Capitol's edge between town and hill: a hard-ish 4–6 m transition, no wide blurred band.
5. **Leftover floats:** rome_victoria (palatine.js PAL_ASSETS) floats 1.3 m; pale speckle on the Palatine NE slope.
   `__floatCheck()` must report nothing above 0.4 m.
6. **Aqueduct terminals** (`briefs/rome/aqueduct_outlet.md`). The GLBs `rome_claudia_terminal` and `rome_castellum` (v2)
   are in assets/models/rome/. A Blender worker may still be replacing them in place; same names and footprint, so just
   rebuild at the end. Place rome_claudia_terminal where the AD 56 Aqua Claudia ends at the great gate (x 2545, z 56): its
   channel (arriving along +X at 11.6 m) must meet the last arch of segment i=0 in gM. rome_castellum stays where it is
   (cx 258, cz 377, post-64 arcusNero layer). Shots of both, from street height and from above.
7. **Aventine** (TODO "阿文提诺山", in Chinese; summary here):
   * Procedural houses floating on the slope: extend the float test to them, then seat them on terraces with retaining
     walls (the rock/terrace kit already used on the Palatine).
   * Fill the empty upper-right area with gardens, vineyards and 2–3 noble houses (rome_domus_a / rome_domus_b) along the ridge.
     Not a whole luxury quarter: AD 56 Aventine is mainly plebeian.
   * Temple of Diana: tile roof, a colonnaded precinct around it, move the apartment block that touches it.
   Shot: an Aventine overview from the NE (same framing as the old shots/z_aven.png; its job file is gone, so pick a
   camera, record it in a jobs file and shoot before/after).

Stop after task 7 or when the context passes about 400k, whichever is first. Finish with `npm run build`, then a ≤ 15-line
report: what changed, shot names, what is not done. Do not edit Blender scripts or GLBs; do not delete files.
