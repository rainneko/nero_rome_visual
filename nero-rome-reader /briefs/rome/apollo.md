# 阿波罗神庙圣域 · Temple of Apollo Palatinus and its precinct (rome_apollo)

Site: top of the Palatine, on its south edge above the Circus Maximus. The temple faces SOUTH (asset front = -Y).
The precinct is a built terrace on the hill edge: its north side is level with the hilltop, its south side stands
above the slope on a terrace wall.
References: `hill_temple_base.jpg` (terrace walls with half-round buttresses, the hill base), `temple_checker_plaza.jpg`
(checkered paving with red and blue borders, an altar on the axis, statues on pedestals), `temple_curved_stair.jpg`
(torch columns, bronze lattice railings).

## History 【史】 (Augustus dedicated it in 28 BC next to his own house)
* The temple was of solid white Luna marble, Corinthian, on a high podium. On top of the pediment stood the gilded
  chariot of the Sun (Propertius 2.31). Its doors were of ivory.
* In front of it an altar surrounded by four bronze oxen by Myron (Propertius 2.31).
* Round the open area ran the Portico of the Danaids: columns of yellow Numidian marble (giallo antico) with statues
  of the fifty daughters of Danaus between the columns.
* A Greek and a Latin library stood beside the temple.

## Shape and size (z = 0 = terrace floor; origin = centre of the terrace)
* Terrace 94 × 94 m (x −47..47, y −47..47): `retaining_wall` closed round it, z_top 0, z_bot −12, buttress 'round',
  every 10 m, b_size 2.2, parapet None (portico back walls stand on the edge). `terrace_floor` paving.
  On the north side the hilltop is level with the terrace: there the wall may stop at z −3. `preview_ground(-12)`.
* Temple: `podium_temple(F, 0, 16, W=24, L=40, pod_h=5, col_h=14, nf=6, kind='pseudo', porch=3, order='corinthian',
  front='-Y', stair='front', flutes=12, door_mat='giallo')`. Replace the front acroterion by the Sun's chariot:
  `quadriga(..., s=1.5, mat='gold')` standing on the front apex of the roof (use the returned 'ridge' height).
* Altar on the axis at (0, −20): `altar(F, 0, -20, 0.03, 6, 4, 2.2, fire=True)` with four bronze oxen at its corners
  (write a small `ox()` in your script: body beam 2.2 × 0.8 × 0.9 m, four legs, neck and head, horns; 'bronze').
* Paving: `checker_paving(F, -32, -40, 32, -8, 0.03, tile=1.5)` around the altar; 8 `torch_column`s along its two long
  sides; `lattice_rail` along the paving's south edge with a 6 m gap on the axis.
* Portico of the Danaids along the south, east and west sides, 7 m deep: a solid back wall ('plaster' outside, 8 m high)
  on the terrace edge; 'giallo' Ionic columns 6.5 m tall every 3.6 m on the inner line; 'marble' entablature; tiled
  `lean_roof` falling toward the open court. Between every two columns a marble statue (`statue`, 1.9 m, pedestal 0.6).
  In the middle of the south side the portico has no back wall for 16 m and opens onto a viewing exedra: a half-round
  bay of radius 8 m projecting south over the slope, floor at 0, wall down to −12, `balustrade` on its rim.
* Propylon (entrance gate) in the middle of the east portico at (47, 0), facing +X: 14 m wide, 9 m deep, four columns
  front and back, pediment, tile roof, passage through the portico.
* Two libraries at the north corners, beside the back of the temple: halls 20 × 18 m, 11 m high ('plaster', red band,
  hip roof), each with a tetrastyle porch (`pediment_front`) facing south into the court.
* Budget ≤ 60 000 triangles. `finish('rome_apollo', front='-Y')`.

## Checklist
- [ ] Terrace walls with half-round buttresses down to z −12, visible in the renders
- [ ] White Corinthian temple on its podium, front stair between cheek walls, gilded Sun quadriga on the pediment
- [ ] Yellow Danaid portico on three sides with statues between the columns; viewing exedra on the south
- [ ] Altar with four bronze oxen on the axis, checkered paving with red/blue borders, torch columns
- [ ] Two libraries with porches; propylon on the east
- [ ] Nothing later than AD 58; ≤ 60k triangles
