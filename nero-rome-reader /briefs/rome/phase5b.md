# Phase 5b (small fix round) · 2026-10-23

Read `briefs/rome/phase3.md` (how things work) and the "第 5 阶段" entry in `docs/TODO.md`. Phase 5's sheets are `shots/v*_sheet*.png`;
its cameras are in the scratchpad folder `p5/` (path in TODO or below). Project root ends in a SPACE: quote it. Every item
needs a before/after pair from the same camera.

1. **Street ruts look like tram rails** (v5_sheet_B road_a, road_c): a black centre line and two continuous grey strips.
   * Remove the black drain line entirely.
   * Make the ruts at most 10–15 % darker than the paving, 0.25 m wide, broken into irregular lengths (gaps), with soft edges.
   * No ruts within 6 m of a junction, so the strips do not cross.
   * The pink sidewalk strips are segmented and too pink: make them warm grey-beige (about sRGB 176/164/146) and continuous.
2. **Bare substructure walls** (v3_sheet_C port_claud, port_livia): the Claudius precinct and Livia portico foundations are
   now 24–33 m plain block walls.
   * Give them a Roman substructure face: two or three storeys of blind arches (recessed, darker) between pilaster
     buttresses every 6–8 m, a string course per storey, and a cornice at the top.
   * The temple of Claudius was under construction in AD 56: you may leave one corner unfinished, with scaffolding poles.
3. **Brown smear across the Forum Boarium** (v5_boarium): a dirt band crosses the paved market. Remove it, or make it a
   deliberate unpaved cattle pen edge with a low fence.

Stop when done or at about 250k context. Run `npm run check` and `npm run build`, update docs/TODO.md, and send a report of
at most 10 lines with sheet names. Do not edit Blender scripts or GLBs; do not delete files.
