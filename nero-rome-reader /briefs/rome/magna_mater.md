# 大母神庙 · Temple of Magna Mater on the Cermalus (rome_magna_mater)

Site: the south-west corner of the Palatine (the Cermalus), on the cliff edge above the Velabrum and the old stair
Scalae Caci. The temple faces south-west; in the asset frame it faces −Y. South of the temple the ground drops ~16 m.
**This asset is the lead's showcase for the "hill base" — study `hill_temple_base.jpg` closely**: a temple on a rock
spur; ashlar terrace walls with half-round buttress towers that follow the rock; a lower terrace with a two-storey
arcaded hall built against the upper wall; stairs climbing along the walls and the rock. Also `temple_curved_stair.jpg`
(grey podium, torch columns, bronze railings).

## History 【史】
* Dedicated in 191 BC to the Great Mother (Cybele), whose sacred black stone was brought from Pessinus in 204 BC;
  rebuilt by Augustus after a fire in AD 3.
* Corinthian, six columns in front (hexastyle prostyle), on a high podium of grey peperino stone. Its broad front stair
  served as seats for the audience of the Megalesian games: plays were performed in the open area in front of it.
* The goddess's animals are lions.

## Shape and size (z = 0 = main terrace floor; origin = centre of the main terrace)
* Main terrace 44 × 64 m (x −22..22, y −32..32): `retaining_wall` on the west, south and east sides from z_top 0 down
  to z_bot −16 (buttress 'round', every 9 m, b_size 2.0, parapet 'balustrade'); the north side (toward the hilltop)
  only down to −2. `terrace_floor`.
* Temple: `podium_temple(F, 0, 10, W=17.5, L=33, pod_h=6, col_h=12, nf=6, kind='prostyle', porch=3,
  order='corinthian', front='-Y', stair='front', stair_w=15.5, pod_mat='peperino', cheek_statues=None)`.
  Put a marble lion (write `lion()`: body, legs, head with a mane, ~2.4 m long) on each cheek wall's front end.
* Forecourt for the games in front of the stair: `checker_paving` from y −31 to the stair foot, full terrace width
  minus 2 m; an `altar` on the axis 5 m in front of the stair; two `torch_column`s at the stair foot.
* Lower terrace: 60 × 16 m south of the main terrace (x −30..30, y −48..−32) at z −8, with its own `retaining_wall`
  (z_top −8, z_bot −16, buttress 'round', every 8 m). Against the main terrace's south wall, on the lower terrace,
  a two-storey arcaded hall 40 m long × 7 m deep (two `arcade`s of 4 m with back='dark', 8 bays each, 'travertine'
  piers, a tiled `lean_roof` falling south, its top just under the main terrace parapet).
* Stairs: a flight from the hill foot (z −16) up to the west end of the lower terrace, running north along the outside
  of the lower terrace's west wall; a second flight from the lower terrace up to the main terrace, running north
  along the outside of the main terrace's east wall and arriving through a gap in its parapet (`stair_flight`).
* Rock: `rock_mass` round the foot of the walls on the south and west (from z −20 up to about −13), so the walls rise
  from craggy tuff as in the reference. `preview_ground(-16)`.
* Budget ≤ 45 000 triangles. `finish('rome_magna_mater', front='-Y')`.

## Checklist
- [ ] Grey podium, white Corinthian hexastyle temple, broad near-full-width stair, two marble lions
- [ ] Main and lower terraces with half-round buttressed walls rising from craggy rock (like the reference)
- [ ] Two-storey arcaded hall on the lower terrace against the upper wall
- [ ] Stairs climbing along the walls; paved forecourt with altar and torches
- [ ] ≤ 45k triangles
