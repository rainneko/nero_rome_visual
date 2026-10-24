# 奥古斯都与莉薇娅之家 · Houses of Augustus and Livia (rome_domus_augusti)

Site: the south-west quarter of the Palatine top, between the Temple of Magna Mater and the Temple of Apollo, on the
edge of the slope toward the Circus. Two levels: the north half at z = 0, the south half at z = −5.
Asset front = −Y (south, toward the slope). Footprint 72 × 58 m (x −36..36, y −29..29).
References: `houses_mid_1.jpg`, `villa_noble.jpg` (only for colours and roofs; these houses are modest).

## History 【史】
* Augustus lived for forty years in a modest house on the Palatine, without marble and without fine floors
  (Suetonius, Aug. 72–73). The neighbouring "House of Livia" is a Republican atrium house with famous wall paintings.
* A ramp linked Augustus' house with the Temple of Apollo to the east.

## Shape and size (origin = centre; z = 0 = upper level)
* Retaining wall between the levels along y = 0 (`retaining_wall` from 0 down to −5, buttress 'square', parapet
  'wall'), and along the south edge a wall from −5 down to −12 (buttress 'round'). `preview_ground(-12)`.
* House of Livia (west, upper level, about 26 × 28 m): rooms round a tuscan atrium (no columns) with an impluvium
  pool; the atrium roof slopes inward to a rectangular compluvium opening over the pool (build it from four
  `lean_roof`s); a tablinum on the axis; behind it a small peristyle garden (court 12 × 10, 'stone' Doric columns).
* House of Augustus (east): an upper peristyle 24 × 18 m at z 0 and a lower peristyle 26 × 20 m at z −5, connected by a
  stair; single- and two-storey rooms round them ('plaster' walls with a 'red' dado band 1 m high, tile hip roofs).
* A covered ramp 4 m wide along the east edge rising from −5 to 0 (lean roof on posts).
* Modest: plaster walls, a red dado, 'stone' (stuccoed) columns, tile roofs, no marble facades.
* Budget ≤ 40 000 triangles. `finish('rome_domus_augusti', front='-Y')`.

## Checklist
- [ ] Two levels joined by a buttressed wall and a stair; a ramp on the east
- [ ] Livia's atrium with compluvium roof and impluvium; peristyle gardens
- [ ] Modest plaster-and-tile look, red dado
- [ ] ≤ 40k triangles
