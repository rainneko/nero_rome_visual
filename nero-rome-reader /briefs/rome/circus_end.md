# 大竞技场：正门与看台的衔接 · Joining the starting front to the stands (rome_circus_end_l, rome_circus_end_r, rome_cavea_pavilion)

The author: the main front (carceres) and the stands beside it look disconnected. In the page the stands end in a raw
sloped section that sticks up behind the lower starting building.
References (study them): `罗马风格参考/跑马场/大跑马场/` — three views of a large circus. Copied for you as
`refs/circus_1.jpg`, `circus_2.jpg`, `circus_3.jpg` (and the originals are larger).

## What the references do at the junction
* **A tall corner block (oppidum) closes each end of the stands.** Where the carceres meets each long side stands a
  square, multi-storey block (3–4 storeys, arched windows in rows, a hip tile roof, sometimes a crenellated roof
  terrace with braziers), as tall as the top of the stands or taller. The stands butt into its side, so their section
  is never seen. Its street corner has a small pedimented porch on columns.
* **The stands' outer facade wraps round the corner** into this block: the arcades of the long side continue to it.
* **The top gallery** (the roofed portico on top of the stands) ends against the block, under a gable.
* **One base for the whole front:** the carceres arcade, the corner blocks and the stand ends stand on one stepped
  plinth with a paved forecourt in front (squares of paving, braziers).
* **Matching heights:** the carceres' roof terrace (with its railing) is at the height of the stands' front podium,
  and runs into it; stairs lead from that terrace up into the first seating tier.
* **The long stands are broken** every 100–150 m by tall pavilions rising through the seating (tribunals, stair
  towers: 2–3 storeys above the top row, hip roofs, columns, coloured cloth), so they are not one endless wedge.

## Assets (front = −Y = arena side; z = 0 = the arena/track level; read the section of rome_cavea_s and the terrace
height of rome_circus_carceres from their scripts so everything matches)
* **rome_circus_end_l / rome_circus_end_r** (mirror images): a block about 26 m along the stands × the full depth of
  the cavea section (about 42 m), as tall as the stands' top gallery + 3–5 m. Arena side: the end of the seating
  closed by a wall with a stair down to the carceres terrace level. Street side: the stands' outer arcade storeys
  wrapping round, then the square corner tower (3–4 storeys, windows in rows, hip roof or crenellated terrace with
  two braziers) and a small pedimented porch at its foot. The top gallery's last bay ends under a gable on this block.
  Stepped plinth along its front. Budget ≤ 18 000 each.
* **rome_cavea_pavilion**: a module the page swaps in for one rome_cavea_s every 100–150 m: same footprint and section
  as rome_cavea_s, but in the middle a pavilion 12 m wide rises 2–3 storeys above the top row (columns, hip roof,
  a balcony with railing and a coloured cloth hanging), with a stair inside; the street side gets a taller arched
  entrance. Budget ≤ 12 000.
* Colours as the references: travertine/marble white with red panels and red columns, terracotta roofs.

## Checklist
- [ ] End blocks hide the stands' section completely and reach above the top gallery
- [ ] Heights match the carceres terrace and the stands' podium; stair from the terrace into the seating
- [ ] Street arcades wrap round the corner; corner tower with porch; shared stepped plinth
- [ ] Pavilion module breaks the long stands; budgets respected
