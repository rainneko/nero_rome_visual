# 大竞技场中央石堤 · The central barrier of the Circus Maximus (rome_circus_spina)

Site: the middle of the arena; long axis along X. z = 0 = arena (sand) level.
References: `circus_1.jpg`, `circus_2.jpg`, `circus_3.jpg` (the barrier with obelisks, statues, shrines, turning posts),
`circus_small.jpg` (columns with statues along a barrier).

## From the book (quoted exactly)
* "一条长长的赛道，两头是弯，中间是一道石堤，堤上立着方尖碑、铜像、七颗铜蛋似的计圈器。"

## History 【史】
* Augustus set up the obelisk of Ramesses II from Heliopolis in 10 BC (about 23.3 m without its base; today in Piazza
  del Popolo) in the middle of the barrier. Seven eggs (ova) and seven bronze dolphins (added by Agrippa in 33 BC)
  counted the laps. Claudius gilded the turning posts (metae): at each end three tall cones on a high half-round base.
  Along the barrier: water basins (the euripus), small shrines and statues (Cybele riding a lion, Victory on a column).
* There is only ONE obelisk in AD 56 (the second one came in AD 357).

## Shape and size (origin = centre)
* Barrier: from x −155 to 155, 6 m wide, 1.7 m high ('marble' with a cornice); its top holds four long water basins
  (`pool`) separated by short platforms.
* Obelisk in the middle: `obelisk(F, 0, 0, 1.7, h=23.3, mat='granite', tip='gold')`.
* Turning posts at both ends, beyond the barrier ends (x ±166): a half-round base 4.5 m high, radius 4 m, its round
  side facing away from the barrier, with three gilded cones (`cyl` r 1.1 → 0, 7 m tall, 'gold') with egg finials.
* Egg lap counter at x −60: two 'marble' columns 4 m + a beam, with seven bronze eggs (sphere, z_scale 1.4) on the beam.
* Dolphin lap counter at x +60: the same frame with seven bronze dolphins on top (each two or three short beams bent
  in an arc, head down).
* Shrines: three small tetrastyle pavilions (about 3 × 3 m, 5 m high, tile or bronze roofs) at x −110, −30, 100;
  honorific columns 8 m with gilded statues at x −85, 35, 85; a statue of Cybele on a lion at x 120 (statue + lion
  made of beams and spheres, 'bronze').
* Budget ≤ 30 000 triangles. Add two close-up cameras to check the details (see the README).
  `finish('rome_circus_spina', front='-Y', extra_cams=[...])`.

## Checklist
- [ ] Long marble barrier with water basins, ONE obelisk with gilded tip in the middle
- [ ] Gilded turning-post cones on half-round bases at both ends
- [ ] Seven bronze eggs and seven bronze dolphins on their frames
- [ ] Shrines, columns with statues, Cybele on a lion
- [ ] ≤ 30k triangles
