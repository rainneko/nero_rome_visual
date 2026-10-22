# 神君奥古斯都神庙 · Temple of Divus Augustus (rome_divus_augustus)

Site: at the foot of the Palatine behind the Basilica Julia, just below the Domus Tiberiana. Asset front = −Y.
References: `temple_checker_plaza.jpg` (precinct with checkered paving, altar, enclosure with statues),
`temple_curved_stair.jpg`.

## History 【史】
* Begun after Augustus' death (AD 14) by Tiberius and Livia, dedicated by Caligula in AD 37. Caligula's coins show a
  hexastyle Ionic temple with garlands, statues on the roof and a figure group in the pediment.

## Shape and size (precinct 50 × 64 m; origin = centre; z = 0 = precinct floor)
* Temple: `podium_temple(F, 0, 8, W=24, L=38, pod_h=4, col_h=13, nf=6, kind='prostyle', porch=3, order='ionic',
  front='-Y', stair='front', acroteria='gold')`. Garlands: a row of small 'hedge' swags (thin curved beams) hanging
  between the front columns under the architrave.
* Precinct: a wall 5 m high round 50 × 64 m ('plaster' with a 'travertine' coping and plinth); inside it on the two
  long sides a one-storey Ionic portico 5 m deep (lean roofs); a gate in the middle of the front (south) wall with two
  columns and a pediment.
* In front of the temple: `checker_paving` (tile 1.4) and an `altar` on the axis; four statues on pedestals.
* Budget ≤ 30 000 triangles. `finish('rome_divus_augustus', front='-Y')`.

## Checklist
- [ ] Ionic hexastyle temple with garlands and gilded acroteria, front stair
- [ ] Walled precinct with side porticoes and a front gate; checkered paving and altar
- [ ] ≤ 30k triangles
