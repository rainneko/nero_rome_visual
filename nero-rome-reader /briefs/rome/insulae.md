# 公寓楼 · Apartment blocks (rome_insula_a, rome_insula_b, rome_insula_c)

Site: the narrow streets below the Palatine (Velabrum, Vicus Tuscus) and the Subura; the page places many copies.
Each origin = centre of the footprint, z = 0 = street level, front = −Y (the street side).
References: `houses_timber.jpg` (wooden balconies, tiled roofs), `houses_poor_1.jpg`, `houses_poor_2.jpg` (plain poor
houses), `houses_mid_1.jpg`, `houses_mid_2.jpg` (warm plaster, red bands, roof terraces with pergolas),
`houses_street.jpg` (a street with awnings and stalls). These are city-builder game screenshots, so use them for mood only.
For materials and colours the evidence is `refs/arch/` (see `refs/arch/SOURCES.md` and the rules at the top of
`facades.md`). In particular the timber frame is plastered over (`timber_skin(plastered=True)`), with no open braced
grid, and rome_insula_c has one 0.5 m maenianum, not a stepped jetty on every floor (2026-10-28).

## From the book (quoted exactly)
* "它比我想的乱。房子挤着房子，四五层高，木头搭的，墙上糊着泥，窗户小得像洞。一楼开着铺子，卖面包的，卖鱼的，卖油的，卖陶罐的。二楼往上住人，阳台上晒着衣服"
* "在那两条狭窄泥泞的街道两侧，密密麻麻挤着几百栋四五层高的木头公寓楼"

## History 【史】
Before the fire of AD 64 most apartment blocks had a masonry ground floor and timber-framed upper floors filled with
mud and lime (opus craticium); Augustus limited their height to about 21 m; tile roofs; wooden balconies (maeniana).
Porticoes along every street came only with Nero's building rules after AD 64 — do not add street porticoes.

## rome_insula_a — 14 × 12 m, 5 storeys (ground 4.2 m, upper 3.0 m each; eaves at ~16.2 m)
* Ground floor masonry ('plaster2' over a 'brick' plinth) with three shops on the front (`taberna_front`, counters)
  and one shop on each side.
* First floor masonry, small windows, a long wooden `balcony` across the front with laundry.
* Floors 2–4 timber-framed (`timber_skin`, 'mud') with small square windows on all four sides.
* Hipped tile roof. A core `box` behind the skins so nothing is see-through. ≤ 9 000 triangles.

## rome_insula_b — corner block 12 × 12 m, 4 storeys
* 'plaster3' with a 'red' band at each floor; shops on the front and on the right (+X) side; a wooden balcony
  wrapping round the corner on the first floor; half the roof is a paved roof terrace with a `pergola` and a parapet,
  the other half a hipped tile roof. ≤ 9 000.

## rome_insula_c — narrow block 8 × 12 m, 4 storeys, the poorest
* Ground floor 'brick' with one wide workshop opening (dark inside, an anvil block and a hearth box visible inside the
  opening) and a door; upper floors timber-framed, each jutting 0.5 m further over the street on the front (jetties
  on beams); small windows with wooden shutters; a gabled roof with the gable to the street; a laundry pole sticking
  out from the third floor. ≤ 6 000.

Build all three in one script (`reset()` before each) or in three scripts; `finish('rome_insula_a', front='-Y')` etc.

## Checklist
- [ ] Shops on the ground floor, wooden balconies with laundry, small windows, timber-framed mud upper floors
- [ ] Four–five storeys, tile roofs, no street porticoes, no glass
- [ ] Budgets respected
