# 大竞技场看台模块 · Stand modules of the Circus Maximus (rome_cavea_s, rome_cavea_c)

Site: the stands of the Circus Maximus; the page repeats these modules ~30 times. The arena is on the −Y side of the
module, the street facade on the +Y side. z = 0 = arena level. Asset front = −Y.
References: `circus_1.jpg`, `circus_2.jpg`, `circus_3.jpg` (stone seats below, a covered gallery on top, an outer
facade of arches with shops; note the pictures exaggerate the decoration).

## From the book (quoted exactly)
* "看台从赛道边上一层一层往上叠，石头的，木头的，一直叠到山坡上。"
* "人从四面八方涌进来，挤满了每一层。"

## History 【史】
In the 1st century AD the lower stands were stone and the upper stands wood; the outside had three storeys of arcades
with shops on the ground floor (the great fire of AD 64 started in these shops).

## rome_cavea_s — straight module, 33.6 m long (x −16.8..16.8), 42 m deep (y −21..21)
* Arena wall at y −21: 'marble' wall 3.2 m high with a bronze `lattice_rail` on top.
* Stone seats from y −20 to −6: 14 rows (each 0.45 m high, 1.0 m deep, 'marble'), rising from z 3.2 to 9.5, with two
  stair aisles 1.2 m wide (smaller steps, 'stone') at x ±8.4.
* Walkway at y −6..−4 (z 9.5) with a parapet wall 1 m high on its back edge, and two dark arched entrances
  (vomitoria) in the wall behind it.
* Wooden seats from y −4 to 13: 16 rows of benches ('wood') on a timber frame (posts and braces visible behind/under
  them), rising to z 18.
* Top gallery y 13..21: a covered portico at z 18 (marble columns 5 m every 4.2 m along the front edge, tile `lean_roof`
  falling outward).
* Outer facade at y 21 (facing +Y): three storeys of arches, 6 bays of 5.6 m: ground floor 8 m with shops (dark wide
  openings with wooden shutters), first floor 7 m arches, second floor 6 m arches (dark backs), 'travertine' with
  'marble' cornices; top at about z 21.
* Solid 'tuff' masses fill between the seats and the facade (no see-through anywhere); the two short ends (x ±16.8)
  are left open (the next module covers them) but must be closed with a plain end wall in the renders' view — put a
  thin 'tuff' cap you can delete with a flag `END_CAPS = False` at the top of the script (export with it False).
* Budget ≤ 12 000 triangles. `finish('rome_cavea_s', front='-Y')`.

## rome_cavea_c — curved module for the round end
* The same section swept round a 22.5° wedge of a ring: inner radius 40 m (arena wall), outer radius 82 m, centred at
  the origin, from angle −11.25° to +11.25° about the +Y axis (so the wedge lies along +Y, arena side toward the
  origin). Use 4 segments in the wedge. Budget ≤ 12 000. `finish('rome_cavea_c', front='-Y')`.

## Checklist
- [ ] Stone seats below, wooden seats on a timber frame above, a covered gallery on top
- [ ] Three-storey arcaded street facade with shops; arena wall with bronze railing
- [ ] No see-through; ≤ 12k triangles each
