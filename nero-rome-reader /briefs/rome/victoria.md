# 胜利女神庙 · Temple of Victoria and the shrine of Victoria Virgo (rome_victoria)

Site: on the Palatine's south-west slope, next to the Temple of Magna Mater (south-east of it), on a terrace above the
road Clivus Victoriae. Faces south-west; in the asset frame front = −Y.
References: `hill_temple_base.jpg` (terrace walls with half-round buttresses, rock at the foot),
`temple_checker_plaza.jpg`.

## History 【史】
* The Temple of Victory was vowed in 294 BC by L. Postumius Megellus and restored under Augustus. Cybele's black stone
  was kept in it from 204 until 191 BC, while her own temple was being built.
* Beside it Cato the Elder dedicated the small shrine of Victoria Virgo in 193 BC.

## Shape and size (z = 0 = terrace floor; origin = centre of the terrace)
* Terrace 40 × 50 m (x −20..20, y −25..25): `retaining_wall` on south, west and east from 0 down to −10 (buttress
  'round', every 9 m, parapet 'balustrade'); north side down to −2. Paving `terrace_floor`.
* Temple of Victoria: `podium_temple(F, -4, 6, W=16, L=28, pod_h=4, col_h=10, nf=6, kind='prostyle', porch=2,
  order='corinthian', front='-Y', stair='front', frieze_mat='red', acroteria='gold')` (gilded Victories on the roof).
* Victoria Virgo: `podium_temple(F, 13, -6, W=7, L=11, pod_h=1.8, col_h=5.5, nf=4, kind='prostyle', porch=1,
  front='-Y', acroteria='gold')`.
* A monumental stair from the road below: `stair_flight` 6 m wide on the axis of the big temple, from (−4, −38, −10)
  up to (−4, −25, 0); open the parapet there and frame the stair head with two statues on pedestals.
* An `altar` on the axis in front of the big temple; 6 statues on pedestals along the south parapet.
* `rock_mass` under the south-west corner (z −14..−8). `preview_ground(-10)`.
* Budget ≤ 30 000 triangles. `finish('rome_victoria', front='-Y')`.

## Checklist
- [ ] Two temples (big hexastyle with red frieze and gilded acroteria; small tetrastyle) on one terrace
- [ ] Buttressed terrace walls with rock at the foot; a straight monumental stair up from the road
- [ ] Altar, statues on the parapet
- [ ] ≤ 30k triangles
