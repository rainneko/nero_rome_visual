# 帕拉蒂尼山内廷官署院落 · Crowded court offices of the Palatine (rome_pal_block_a, _b, _c, _d)

Site: the saddle (Intermontium) between the two summits of the Palatine — Germalus in the north-west (Domus Tiberiana)
and Palatium in the south-east (Domus Transitoria). In AD 56 Domitian's great palace does not exist yet: the saddle is
packed with old Republican houses taken over by the emperors and turned into offices (secretariats, archives,
physicians, freedmen clerks, guest lodgings, a guard court). The book (第2章): "一座挨着一座，白的墙，红的瓦，柱廊一层一层往上叠".
The page places many copies, rotated and at different heights, pressed against each other and against the big palace
models, so they must look good from every side and must stack: a block's low side may stand against another block's
high side.
References: `palatine_dense_plan_LATE.png` — study the density: courts inside courts, porticoes on several levels,
long ranges of rooms, stairs and ramps between levels, roofs at many heights. (It shows the later Domus Augustana and
some later rebuilding: copy the density and the building types, not those buildings.) Also `villa_noble.jpg`,
`houses_rich_1.jpg`, `hill_temple_base.jpg` (terrace walls with buttresses).

## History 【史】
The emperors bought up the aristocratic houses of the hill (Hortensius, Catulus, Cicero, Crassus); remains of the
"House of the Griffins" and the "Aula Isiaca" lie under Domitian's later palace. Claudius' freedmen ran the imperial
offices (ab epistulis, a rationibus, a libellis). No Flavian buildings, no later palace.

## Common rules
* Every block is split-level: the high part at z = 0, the low part at z = −5 (or −10 where said). Between levels a
  `retaining_wall` with a few round or flat buttresses and a parapet or balustrade, and a `stair_flight` with cheek
  walls. Build the walls down to the lowest level so no block floats: `preview_ground(-10)`.
* Walls 'plaster', 'plaster2' or 'plaster3' with a 'red' or 'ochre' band at floor lines; 'travertine' door frames and
  piers; tile hip and lean roofs at different heights, no two neighbouring roofs at the same height. Small windows,
  some shuttered ('wood'). Roof terraces with a parapet and potted plants or a `pergola` here and there.
* Inner courts are finished: paving or garden, a well head or small fountain, a Doric or Tuscan portico on at least
  two sides. No empty grey squares.
* Look: crowded and three-dimensional — overhangs, balconies (`balcony`), loggias on upper floors, an external stair
  up a wall, a bridge or arch between two wings.

## The four blocks (origin = centre of the plot; front = −Y = the low side)
* **rome_pal_block_a — secretariat court** (36 × 30 m). High part (y 0..15): a two-storey range round a portico court
  10 × 8 m. Low part (y −15..0, z −5): a three-storey front range whose top floor is level with the court; its
  ground floor is an arcade of 7 bays. A balcony along the top floor; an external stair from the low street to the
  court through an arched gate.
* **rome_pal_block_b — the long portico with shops and offices** (60 × 16 m). A two-storey range on the low side
  (z −5) with an arcaded portico of 15 bays on the street front (shops/offices behind, 'wood' shutters), an upper
  gallery with small columns, and on the high side (z 0) a row of five small offices each with its own lean roof
  stepping along the range. Ends closed with blank walls so blocks can join end to end.
* **rome_pal_block_c — guest house and garden** (30 × 30 m). An L of two- and three-storey rooms round a garden
  court with a pergola, fish pond and two statues; a three-storey corner tower 7 × 7 with an open loggia on top; the
  garden side ends at the z 0 → z −10 drop with a buttressed `retaining_wall` and a balustrade; a covered stair down
  inside the wall.
* **rome_pal_block_d — guard court and archive** (34 × 26 m). Plain and heavy: a court 14 × 10 with 'stone' piers, a
  well, arms racks and benches ('wood'); on the low side a windowless archive block of 'brick' with small high
  slit windows and a vaulted ground floor; a stair ramp with a wall alongside climbing from the low street (z −5)
  to the court (z 0).
* Budget ≤ 14 000 triangles each. Build all four in one script with `reset()` between them, or in four scripts.
  `finish('rome_pal_block_a', front='-Y')` etc. Render each from the low side and from above.

## Checklist
- [ ] Four split-level blocks, walls reaching the lowest level, stairs between levels
- [ ] Finished courts (paving or garden, porticoes, wells); varied roof heights; balconies, loggias, terraces
- [ ] Nothing Flavian or later; ≤ 14k triangles each
