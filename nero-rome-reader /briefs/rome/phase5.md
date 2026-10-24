# Phase 5 hand-off (fix round) · 2026-10-23

You are a fresh integrator. Read `briefs/rome/phase3.md` (how things work), then this file. Phase 4's work is in the working tree
(not committed); its sheets are `shots/u*_sheet*.png` and its cameras are in `tools/test/jobs-*.json`. Project root ends in a
SPACE: quote it. Every item needs a before/after pair from the same camera.

1. **Capitol slope regression (most important; u7_sheet_A: cap_b, cap_c, cap_d, rock_r2).** The new "bare rock" terrain colour
   covers the whole slope in wavy contour-line stripes (tan, or grey in cap_c). It looks like a topographic map.
   * Bare rock only within 6–10 m of the rock clusters, plus genuinely near-vertical cells (slope > 0.9). Grass everywhere else, as before phase 4.
   * Pattern: irregular patches from 2D fBm in world xz (two tones of earth/rock, about sRGB 150/138/115 and 128/118/100), with
     soft-noise edges into grass. Nothing that follows height (no bands).
   * Remove the yellow flower specks on steep slopes.
   * Acceptance: same cameras; the slope reads as grass with rocky scarps around the clusters.
2. **Statues** (u4_sheet_A): the honorific columns and statue bases carry golden capsule/bullet shapes.
   * Make them a simple standing-figure silhouette, about 2.2 m on the column top (1.9 m on bases): legs/drapery block, torso, head, one raised arm.
   * Material: dark bronze (about sRGB 70/72/55) or marble ivory; gilding at most on a small detail.
3. **Timber frame** (u3_sheet_A rich_close, u4_sheet_B loggia_a): diagonal timber framing covers whole tall ivory blocks.
   Follow the facades.md table: poor 35 % / mid 10 % / rich 0 %, on ONE upper storey only, and only on houses of ≤ 4 storeys.
4. **Black stipple dots** near windows (u4_sheet_B street2, loggia_a): find the source (a notice/graffiti or shop-sign
   pattern?). Make it a clean painted shape, or remove it.
5. **Wooden balconies** float like shelves: add 3–4 beam ends/brackets under each and a floor slab edge.
6. **Loggia** (u4_sheet_B loggia_c): the top-floor loggia reads as a painted arch.
   * Make it a real open arcade: a dark recessed interior (about sRGB 45/38/34), a column/pier rhythm, a parapet line.
   * In the shader that is acceptable if it reads as depth from the street.
7. **Seat the Boarium tholos** (buried about 2 m on its slope): flatten a pad under it, as for the Claudia terminus.
8. **Ten procedural porticoes** report floats in `__floatCheck()`: inspect them. Fix the real ones; exclude false alarms with a reason.
9. **Street crown, drain and ruts** (u6_sheet_A): if one more attempt does not make them visible at street height on the main
   grey streets, remove that code rather than leave it invisible.

Stop after item 9 or at about 350k context. Finish with `npm run check` and `npm run build`, update docs/TODO.md, and send a
report of 15 lines at most with sheet names. Say honestly what is not done. Do not edit Blender scripts or GLBs; do not delete files.
