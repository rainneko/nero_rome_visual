# 贵族宅邸 · Two aristocratic terrace houses (rome_domus_a, rome_domus_b)

Site: on the Palatine slopes and hilltop round the palaces; the page places several copies, rotated, so the hill is
"一座挨着一座". Each house sits on its own two-level plot: the street and entrance on the north (+Y) at z = 0, a
garden terrace on the south at z = −6. Asset front = −Y (the garden and loggia side, which faces the view).
References: `villa_noble.jpg`, `houses_rich_1.jpg`, `houses_mid_1.jpg` (roof terraces, arcaded loggias, red and ochre
plaster; ignore chimneys).

## History 【史】
The Palatine of the late Republic was the address of the rich: Cicero, Crassus, Hortensius, Catulus and Scaurus had
houses here; Cicero's looked over the Forum.

## Shape and size (each plot 30 × 46 m: x −15..15, y −23..23)
* Upper part (y −2..23, z 0): entrance door with two half-columns on the north wall; an atrium with impluvium and a
  compluvium roof; a tablinum; then a peristyle garden (court 14 × 10, 'stone' Doric columns, hedges, small round
  fountain); rooms round it, one or two storeys, 'plaster2' or 'plaster3' walls with a 'red' band, tile hip roofs.
* On the south edge of the upper part a two-storey arcaded loggia ('plaster' with 'travertine' piers) overlooking the
  garden terrace.
* Garden terrace (y −23..−2, z −6): `retaining_wall` between the levels (0 → −6) behind the loggia's lower storey,
  a garden with a pergola and a rectangular fish pond, and a south `retaining_wall` from −6 down to −12 with round
  buttresses and a balustrade. `preview_ground(-12)`.
* rome_domus_a: as above, two storeys, warm 'plaster2'.
* rome_domus_b: 'plaster3', with a three-storey belvedere tower 8 × 8 m on the north-east corner (open loggia on
  top), and a roof terrace with a pergola over the west range.
* Build both in one script (call `reset()` before the second) or in two scripts.
  Budget ≤ 18 000 triangles each. `finish('rome_domus_a', front='-Y')`, `finish('rome_domus_b', front='-Y')`.

## Checklist
- [ ] Atrium + peristyle + loggia over a lower garden terrace on a buttressed wall
- [ ] B has a belvedere tower and a roof terrace with pergola
- [ ] ≤ 18k triangles each
