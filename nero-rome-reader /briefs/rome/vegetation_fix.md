# Vegetation fix round · 2026-10-23

The previous round (`vegetation_seasons.md`, sheets `shots/veg_sheet_A.png` and `veg_sheet_B.png`, cameras
`tools/test/jobs-veg*.json`) works: the three seasons now differ clearly. Fix these five things only. Each needs a
before/after from the same camera.

1. **Spring wild flowers look like snow** (veg_sheet_B, f3_grass_sp). Cold grey-white blotches cover the whole meadow.
   * Make them small warm dots: poppy red ≈ 190/50/40, cream ≈ 235/225/190, yellow ≈ 225/190/60, a few violet.
   * Cover at most 5 % of the grass, in loose clusters. Nothing grey.
   * Spring only, fading out in early summer.
2. **Winter deciduous crowns shatter into black/grey fragments** (veg_sheet_B, f3_pal_wi).
   * Bare trees should read as a solid but thinner grey-brown crown (≈ 120/105/90, scale about 0.7, no holes or
     scattered shards), or as trunk plus a few branch cones.
   * Winter shadows should shrink with them, if cheap.
3. **Pomegranate crowns are covered in red speckles** (f3_pal_su, f3_pal_au): it reads as disease.
   * Summer flowers and autumn fruit: at most about 8 % of the crown surface, as a few distinct dots on the outer
     shell, not noise over the whole crown.
4. **Autumn browns are too orange** (f3_grass_au, f3_ave_au).
   * Lower the saturation about 20 %. Brown ≈ 150/105/55, yellow ≈ 200/170/75.
   * About a third of the deciduous trees should still be green in early autumn.
5. **Watered-garden discs** (f3_ave_su): the green patches around the Aventine domus are perfect circles with hard edges
   on straw.
   * Shape them to the garden/pad rectangle plus 4–6 m, with a soft noisy edge.

Stop when done or at about 200k context. Run `npm run check` and `npm run build`, update the "植被与四季" entry in
`docs/TODO.md`, and report in at most 8 lines with sheet names. Do not edit Blender scripts or GLBs; do not delete files.
