# 皇家包厢 · The imperial box (pulvinar) of the Circus Maximus (rome_circus_pulvinar)

Site: the middle of the northern stand of the Circus Maximus (the Palatine side). It projects from the stand toward the
arena; asset front = −Y (toward the arena). z = 0 = floor of the box (the page sets it about 12 m above the arena).
References: `circus_1.jpg`, `circus_2.jpg` (a temple-like box with columns, a pediment and statues, in the middle of
the stands), `temple_curved_stair.jpg` (bronze railings).

## From the book (quoted exactly)
* "尼禄穿着金线滚边的白托加，站在皇家包厢边上。塞内加站在他斜后方，阿格里皮娜端坐在象牙椅上"
* "我站在包厢的阴影里，手心全是汗。"
* "我只看见尼禄转过身，一把把我拽到栏杆边。"

## History 【史】
Augustus built the pulvinar on the Palatine side: a shrine-like box where the images of the gods (brought in the
opening procession) and the emperor's family watched the races.

## Shape and size (24 m wide: x −12..12; 16 m deep: y −8..8)
* Below the floor, a solid front down to z −12 ('marble' facing, cornice at the floor) with an arched passage 4 m wide
  × 6 m high at the bottom (z −12..−6, 'dark' back): the entrance tunnel ("门洞").
* Floor at 0: three rows of marble seats stepping up toward the back (0.45 m each), an ivory chair ('giallo', with a
  footstool) at the front centre.
* Front railing at the box edge: `lattice_rail` (bronze) with marble posts — the "栏杆".
* Roof: six Corinthian 'marble' columns 6 m tall (four in front, two at the back corners) carrying an entablature and
  a gabled tile roof with a pediment toward the arena (temple-like); 'cloth' hangings (purple-red) between the back
  columns; gilded statues on the pediment corners.
* `preview_ground(-12)`. Budget ≤ 15 000 triangles. `finish('rome_circus_pulvinar', front='-Y')`.

## Checklist
- [ ] Temple-like box with columns and pediment over tiered seats and an ivory chair
- [ ] Bronze railing at the edge; arched entrance tunnel below
- [ ] ≤ 15k triangles

## Round 2 — 贵族看台 (the author asked for a detailed noble stand)
Rebuild the asset as the whole noble section of the northern stand, 60 m wide (x −30..30), 18 m deep (y −9..9),
z = 0 = the box floor (substructure still down to −12). Budget ≤ 25 000 triangles.
* Centre (x −12..12): the imperial box as now, enriched: the podium front below it faced with framed marble relief
  panels (raised 'marble' frames on a 'grey' ground), the entrance tunnel arch crowned by a small pediment; Corinthian
  columns with gilded capitals (`cap_mat='gold'`); a purple awning ('cloth') stretched on four bronze poles over the
  front seats; gilded statues on the pediment; two bronze tripods with fire ('flame') on the parapet.
* Wings (x −30..−12 and 12..30): the senators' seats (Claudius gave senators their own seats in the Circus): 6 rows
  of 'marble' seats with red cushions ('cloth' strips), stepping up toward the back; bronze lattice railing at the
  front edge; a statue on a pedestal at each outer end; at the back of each wing a one-storey colonnade (Ionic,
  'marble', tile lean roof).
* Behind the box (+Y): a covered stair (`stair_flight`) rising from the box floor toward +Y up to z +12 — the way up
  to the palace on the Palatine.
* Keep: bronze railing at the box edge ("栏杆"), ivory chair, three rows of seats in the box.
