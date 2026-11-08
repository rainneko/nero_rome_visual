# 公寓楼 · Apartment blocks (rome_insula_a, rome_insula_b, rome_insula_c)

Site: the narrow streets below the Palatine (Velabrum, Vicus Tuscus) and the Subura; the page places many copies.
Each origin = centre of the footprint, z = 0 = street level, front = −Y (the street side).
References: `houses_timber.jpg` (wooden balconies, tiled roofs), `houses_poor_1.jpg`, `houses_poor_2.jpg` (plain poor
houses), `houses_mid_1.jpg`, `houses_mid_2.jpg` (warm plaster, red bands, roof terraces with pergolas),
`houses_street.jpg` (a street with awnings and stalls). These are city-builder game screenshots, so use them for mood only.
`houses_ai_watercolour.jpg` is AI-generated (mood only). For materials and colours the evidence is `refs/arch/` (see `refs/arch/SOURCES.md` and the rules at the top of
`facades.md`). In particular the timber frame is plastered over (`timber_skin(plastered=True)`), with no open braced
grid, and rome_insula_c has one 0.5 m maenianum, not a stepped jetty on every floor (2026-10-28).

## From the book (quoted exactly)
* "它比我想的乱。房子挤着房子，四五层高，木头搭的，墙上糊着泥，窗户小得像洞。一楼开着铺子，卖面包的，卖鱼的，卖油的，卖陶罐的。二楼往上住人，阳台上晒着衣服"
* "在那两条狭窄泥泞的街道两侧，密密麻麻挤着几百栋四五层高的木头公寓楼"

## History 【史】
Before the fire of AD 64 most apartment blocks had a masonry ground floor and timber-framed upper floors filled with
mud and lime (opus craticium); Augustus limited their height to about 21 m; tile roofs; wooden balconies (maeniana).
Porticoes along every street came only with Nero's building rules after AD 64 — do not add street porticoes.

## Five more blocks (2026-11-08, `tools/models/rome/rome_insulae2.py`; ground floors per `ground-floor.md`)
Each fits an older block's placement slot; `monuments.js` picks the variant from a hash of the place.
* rome_insula_d (slot a, 14 × 12 m, 4 storeys): four shops with lofts (bread, fish, oil, pottery), a stair door with an
  election notice, a shrine on the side, a shop shut with its boards; maenianum with laundry. ≤ 9 000 triangles (8 930).
* rome_insula_e (slot b, 12 × 12 m): a corner food bar open on both streets (painted counter, three dolia, jug shelf,
  lararium), a wine shop, a closed timber room hanging over the street, benches. 8 104.
* rome_insula_f (slot a): a bakery with two lava mills and a domed oven, the bread shop beside it, gable roof. 4 982.
* rome_insula_g (slot c, 8 × 11 m, 3 storeys): Herculaneum type, the first floor out over the pavement on two brick
  columns; a potter's shop. 4 016.
* rome_insula_h (slot c, 8 × 12 m, 6 storeys, eaves 18.75 m): Subura tenement, dyer's shop, cloth over the street. 3 148.
  Becomes c where `W.storeyCut` allows fewer than six storeys.
* All eight blocks stand on a tuff plinth (1.6 m); the page sets the floor at the street in front, at most 0.5 m above
  the lowest ground of the footprint.

## Second set of five (2026-11-08, `tools/models/rome/rome_insulae3.py`; evidence in `ground-floor.md`, "Second set")
Same slots and place hash: slot a = a/d/f/i/k, slot b = b/e/j/m, slot c = c/g/h/l.
* rome_insula_i (slot a, 3 storeys and a flat roof terrace): a fuller's workshop after the Fullonica of Stephanus:
  treading stalls, a rinsing tank, the cloth press and a bleaching frame behind a wide door, election notices on the front,
  a cloth shop; cloth drying on lines on the roof, a stair house. 4 006 triangles.
* rome_insula_j (slot b, 3 storeys): an inn (stabulum): an arched cart gate into the yard (cart, manger, trough, wheel
  ruts in the threshold), a food bar, an elephant sign as at the inn of Sittius, a timber gallery before the guest
  rooms, a tethering stone, stable windows on the side. 5 277.
* rome_insula_k (slot a, 2 storeys): an atrium house with four shops let on its front (bread, greengrocer, oil, food
  bar) either side of the house door; a flat over the shops with a balcony and its own stair door on the side street;
  the atrium wing has a compluviate roof sloping in to the opening over the impluvium. 6 069.
* rome_insula_l (slot c, 4 storeys): narrow smith's house in tuff with brick bands and quoins; hearth, anvil, tub, tools,
  iron goods in the street. 3 560.
* rome_insula_m (slot b, 4 storeys): a masonry stair up the outside of the side wall to the first-floor flat's door;
  greengrocer with a stepped stand of baskets, a barber (stool outside, awning), an oil shop. 5 762.

## Third set of five (2026-11-08, `tools/models/rome/rome_insulae4.py`; evidence in `ground-floor.md`, "Third set")
Slot a = a/d/f/i/k/n/p, slot b = b/e/j/m/o/q, slot c = c/g/h/l/r. Each shows a different shop front.
* rome_insula_n (slot a, 3 storeys): four arched shops in tuff with travertine arches, imposts and keystones, a timber
  lintel and a lunette grille lighting each loft (Forum of Caesar type); a bookseller with titles on his doorposts,
  cloth, pottery, a food bar; windows over the arches. 8 568.
* rome_insula_o (slot b, 4 storeys): an open market front: three wide loftless stalls under cloth awnings on poles,
  trestle tables and baskets in the street (butcher with joints on hooks, greengrocer with strings of onions, fishmonger
  at a marble table); the stair door on the side street. 6 268.
* rome_insula_p (slot a, 3 storeys): timber pergula booths built out from the shops (lattice sides, counters, tiled pent
  roofs); a school in the widest, its benches running out into the booth; oil and bread on the counters. 7 420.
* rome_insula_q (slot b, 4 storeys): a wine merchant: a tall shop without a loft, dolia sunk in the floor, amphorae
  racked on two tiers, an Ad Cucumas price list on the pier; a hot-food hatch over a masonry counter. 7 036.
* rome_insula_r (slot c, 4 storeys): on a raised pavement with a kerb and end steps; a food hatch, a passage through to
  an inner court (workshop doors, a cistern mouth, a handcart, a timber gallery, laundry), a potter; roofs round the
  court. 6 602.

## Roman style pass (2026-11-01; this overrides the per-asset lists below where they differ)
Learnt from `refs/arch/trajan_market_LATE.jpg` (Trajan's Market, about AD 110: materials and construction only, not its
plan) and the Ostia/Herculaneum shop rows; mood from `refs/houses_ai_watercolour.jpg`.
* 【史】Shop door (taberna): travertine jambs, lintel and threshold; a small window over the lintel that lights the
  pergula (the loft over the shop); a brick relieving arch over both. Helpers `_shops` / `_shop_side` / `_arch`.
* 【史】Brick-faced concrete (opus testaceum) is in Rome from Tiberius on (Castra Praetoria), so an exposed brick ground
  floor is allowed before AD 64, but it is the newer, better block (insula_a), not the norm.
* A projecting brick string course over the shops; a stepped brick cornice on insula_b; flat brick relieving arches
  over the windows of insula_a floors 2–3; rafter ends under the eaves (a, and the sides of c).
* No pink: insula_b is an ochre ground floor with lime-plastered floors above; one red band only (the second floor).
* insula_a: brick ground floor, lime first floor with the maenianum and its tile pent roof, ochre floors 2–3, one
  timber-framed top floor. insula_b: an open timber loggia across the top floor of the street front.
  insula_c: timber lintel, loft window and brick arch over the workshop, a brick ring round the door.
* Not copied: the hemicycle and the medieval tower of Trajan's Market; from the AI image the bicycle, the lettering, the
  street portico and the deep eaves. Triangles: a 5 422, b 5 114, c 2 374.

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
