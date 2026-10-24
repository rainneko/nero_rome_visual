# 街道小品 · Street props (rome_lacus, rome_compitum, rome_stepping, rome_counter, rome_cart, rome_amphorae, rome_awning, rome_laundry)

Site: the narrow streets below the Palatine (Velabrum, Vicus Tuscus, Nova Via) and the Subura. The page scatters
these props along its procedural streets.
References: `houses_street.jpg` (a market street with awnings and stalls), `houses_poor_1.jpg` (a well, carts, barrels),
`houses_timber.jpg` (balconies, laundry).

## From the book (quoted exactly)
* "一楼开着铺子，卖面包的，卖鱼的，卖油的，卖陶罐的。二楼往上住人，阳台上晒着衣服，有个女人在往街上倒一盆脏水。街很窄，两个人迎面走过来，要侧着身子才能过去。"

## History 【史】
Roman streets were paved with polygonal basalt between raised sidewalks; stepping stones let people cross dry-shod;
public fountains (lacus) stood at corners: a basin of four basalt slabs held by iron clamps and a pillar with a spout
carved as a face. At many crossroads stood a shrine of the Lares Compitales (painted wall, little altar), kept by the
neighbourhood's magistrates.

## Props (each its own GLB; origin = centre of its base; z = 0 = street surface; front = −Y)
Build them in one script, calling `reset()` before each prop and `finish(name, front='-Y')` after it.
* rome_lacus: basin 2.6 × 1.6 m, 0.9 m high, four 'basalt' slabs 0.25 thick with iron clamps ('iron' small boxes on
  the corners); 'water' 0.15 below the rim; a pillar 0.5 × 0.4 × 1.4 m at one short end with a 'bronze' spout and a
  carved face (a 'marble' disc). ≤ 600 triangles.
* rome_compitum: wall panel 2.6 m wide × 3.2 m high × 0.5 m ('plaster' with a 'red' painted panel and a niche), a small
  gabled tile roof projecting 0.8 m over it, a little `altar` (0.8 × 0.6 × 1.0, 'travertine') in front. ≤ 900.
* rome_stepping: three stepping stones across a 4.5 m street (each 1.0 × 0.6 × 0.35 m, 'basalt', 8-sided), 0.6 m gaps,
  plus the two curb stones at the street edges (0.4 high). ≤ 300.
* rome_counter: a shop counter (thermopolium), L-shaped (legs 3.0 and 1.5 m, 1.0 m high, 0.6 thick, 'plaster3' with a
  'marble' top) with three dark round holes for jars and a stepped shelf for jugs. ≤ 800.
* rome_cart: a two-wheeled handcart ('wood'): bed 1.8 × 1.1 m, two wheels (`vdisc` r 0.55), two shafts, three
  amphorae (lathe, 'tile') lying on it. ≤ 1 500.
* rome_amphorae: a wooden rack with 12 amphorae ('tile') leaning in two rows. ≤ 2 500.
* rome_awning: a shop awning 4 m wide: two poles and a cloth sloping 1.6 m out from a wall line ('awning'). ≤ 300.
* rome_laundry: a line 5 m long between two wall brackets with six hanging cloths ('linen', 'flowerR', 'blue',
  'awning'). ≤ 300.

## Checklist
- [ ] Eight props, each exported separately, sitting on z = 0, readable at a few metres
- [ ] Budgets respected
