# 维斯塔神庙与王宫 · Temple of Vesta (rome_vesta) and the Regia (rome_regia)

Site: the east end of the Forum, at the foot of the Palatine, next to the House of the Vestals.
References: `temple_checker_plaza.jpg` (for marble colours only).

## History 【史】
* The Vestal Virgins kept the sacred fire of Rome burning in the round Temple of Vesta. In AD 56 it is the Augustan
  temple: about 15 m across, 20 Corinthian columns round a round cella, a conical roof covered with bronze tiles with
  an opening at the top for the smoke, a small stair on the east.
* The Regia, the office of the Pontifex Maximus, was rebuilt in marble by Cn. Domitius Calvinus in 36 BC: a small
  trapezoidal building with a court.

## rome_vesta (origin = centre; z = 0 = ground; front = +X, the stair side)
* `tholos_temple(F, 0, 0, R=7.5, pod_h=3.0, n=20, col_h=9.0, front='+X', roof='cone', roof_mat='bronze')`.
* A low enclosure round it: 12-sided `lattice_rail` at radius 11 m with a gap at the stair; 'paving' floor disc
  (radius 11.5, 0.15 thick).
* Budget ≤ 15 000. `finish('rome_vesta', front='+X')`.

## rome_regia (origin = centre; z = 0; front = −Y)
* A single-storey marble building on a trapezoid plan: front 22 m, back 20 m, depth 13 m. Three rooms in a row along
  the north half ('marble' walls 6 m high, dark doors), a court on the south half closed by a wall with a door and a
  portico of 4 columns inside; low-pitched tile roofs; a 0.6 m marble plinth.
* Budget ≤ 8 000. `finish('rome_regia', front='-Y')`.

## Checklist
- [ ] Round temple: 20 columns, round cella with bronze door, bronze conical roof with smoke vent, east stair
- [ ] Regia: small marble trapezoid with court and portico
- [ ] Budgets respected
