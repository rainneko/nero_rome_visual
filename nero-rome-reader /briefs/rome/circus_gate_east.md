# 大竞技场弯道正门 · The gate in the curved end of the Circus Maximus (rome_circus_gate_e)

The author (2026-11-03): "目前的大跑马场的后门还没有资产建设好 也参考一下参考图里面怎么处理的吧".
In the page the middle of the curved end is a plain white box (14 × 40 m, 31 m tall) with three statues on top.
Replace it with a real gate building.

Reference: `罗马风格参考/跑马场/大跑马场/QQ_1792474637003.png` (copied as `refs/circus_gate_east.png`). At the far
(curved) end, in the middle of the curve, a gate block cuts through the stands: on the arena side a tall central arch
framed by columns (with lower side arches), the arena wall's podium running into it; above the stands a two-storey
pavilion with a loggia of columns and a hip tile roof, rising well above the top gallery. White travertine with red
panels and red columns, terracotta roofs, like the rest of the circus.

【史】 The curved end had a gate on the axis of the track (the later Arch of Titus, AD 81, stood there; it does
NOT exist in AD 56–58 — no triumphal-arch inscription, no Flavian arch). Claudius rebuilt the carceres in marble
and gilded the turning posts (Suetonius, Claudius 21). The gate's look is a reconstruction.

## Alignment (read `tools/models/rome/rome_cavea_c.py` and `rome_cavea_s.py` for the exact section)
* Same frame as `rome_cavea_c`: origin = centre of the curve, Blender +Z up, z = 0 = arena level. The gate sits on
  the **+Y axis** (phi = 0), arena toward the origin. The stands' ring runs from r 40 (arena wall) to r 82 (street
  facade); seats from z 3.2; the top gallery roof tops out at z 25; street facade floors at z 8, 15, 21.
* The page places 8 curved wedges of 22.5° each; the joint between the two middle wedges is exactly on +Y. The
  wedges stay; your gate is a solid block that encloses them where it stands, so it must cover the stands' section
  completely: footprint about ±13 m across the axis (x −13 … 13), from r 37 (it projects 3 m into the arena) to
  r 90 (it projects 8 m beyond the street facade). Every part of the stands inside that footprint must be hidden:
  the gate's side walls rise above the seating profile (> 26 m) along their whole length, so the seats butt into
  them. Check this in a preview with two wedges of `rome_cavea_c` placed at ±11.25° (preview only, not exported).
* The passage through the stands is closed: big wooden doors (bronze studs) set 1.5 m back inside the arch on the
  arena side and on the street side, so you never look into the seating behind.

## What to build
1. **Arena face (r 37–40):** a triumphal-gate front: central arch 7 m wide × 12 m high, two side arches
   3.5 × 7 m, four engaged red columns on pedestals with an entablature, attic (2.5 m) with a blank panel.
   The arena wall's podium (z 0–3.2) runs into its sides.
2. **Pavilion above the stands:** from the top of the seating (≈ z 25) a two-storey pavilion over the gate
   (about 22 × 16 m): lower storey a loggia of 6 red columns toward the arena with a balustrade (the box from which
   the games were watched at this end), upper storey with arched windows, hip tile roof, ridge ≈ z 40. Gilt bronze
   statues at the two front corners of the roof (two-horse chariots or Victories).
3. **Street face (r 82–90):** a monumental entrance: a big arch (7 m × 13 m) between two pairs of engaged columns
   on a stepped plinth (3 steps), an attic, two side doors, the stands' three outer arcade storeys meeting its sides.
   Square stair towers (≈ 7 × 7 m) on both sides of the street face, one storey higher than the stands' facade,
   with their own small hip roofs (as in the reference the gate is flanked by towers).
4. **Sides:** plain travertine walls with string courses at the street-facade floor heights (z 8, 15, 21) and red
   panels, closing the section of the stands on both sides of the gate.

Materials from the kit (`rk.py` palette): travertine, marble, red, tile, wood, bronze, gold, dark. Budget
≤ 20 000 triangles. Export `assets/models/rome/rome_circus_gate_e.glb`, render the four preview cameras to
`renders/rome_circus_gate_e/` plus one view from the arena side with the two preview wedges.

## Checklist
- [ ] Gate on the +Y axis, frame as rome_cavea_c; footprint x ±13, r 37–90
- [ ] Hides the stands' section on both sides (side walls above the seating profile everywhere)
- [ ] Arena face: big central arch + side arches, red columns, attic; doors closed inside
- [ ] Pavilion with loggia and hip roof above the top gallery (ridge ≈ 40 m), gilt statues
- [ ] Street face: big arch on a stepped plinth, flanking stair towers
- [ ] No Flavian arch, no inscription; ≤ 20 000 triangles
