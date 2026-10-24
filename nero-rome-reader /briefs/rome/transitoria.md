# 尼禄东宫（过渡宫）· Nero's east palace, "Domus Transitoria" (rome_transitoria)

Site: the east part of the Palatine top. Asset front = +X (east, toward the Velia and the Esquiline). The long
covered gallery to the Esquiline starts at its north-east corner (the page draws the gallery).
References: `villa_noble.jpg` (terraces, porticoes, pool, statues), `houses_rich_2.jpg` (loggias),
`hill_temple_base.jpg` (buttressed walls).

## History and book
* 【史】 Nero first built a palace linking the Palatine with the gardens on the Esquiline, the Domus Transitoria
  (most historians date it after AD 60). Its excavated rooms show a sunken nymphaeum court: a fountain wall of niches
  and small columns facing a pool and a columned dining pavilion, floors of porphyry, giallo antico and serpentine,
  gilded stucco.
* 【书中】 "我一个人披着斗篷站在帕拉蒂尼山东侧最高的那处观景露台上，隔着半座黑暗的罗马城，遥遥望着埃斯奎利诺山脚下的方向。"

## Shape and size (112 × 92 m; origin = centre; z = 0 = ground floor)
* `court_building(F, 0, 0, 112, 92, 64, 48, floors=2, floor_h=5.0, wall_mat='plaster', peristyle=True,
  col_order='corinthian', court_mat='paving', foundation=0, doors=(('E', 0.0), ('W', 0.0)))`.
* East front: a two-storey arcaded portico 6 m deep along the whole east side (`arcade` ×2, open, marble), so the
  colonnades stack up the hillside ("柱廊一层一层往上叠").
* Sunken nymphaeum in the middle of the court: a garden 36 × 20 m sunk to z −3 (walls 'marble' round it, stairs down at
  two corners). On its west side a fountain wall 36 m long, 8 m high: two storeys of aediculae (pairs of small
  'porphyry' and 'giallo' columns framing niches with statues), thin 'water' sheets falling down steps into a long
  pool at its foot. Facing it on the east side, an open dining pavilion: 6 'porphyry' columns, gilded capitals
  (cap_mat='gold'), tile roof.
* The tower belvedere — the highest point of the palace: a square tower 12 × 12 m, 32 m tall, at the middle of the
  east side, built into the east wing (`square_tower(..., top_loggia=True, roof='pyramid')`): the open loggia on top is
  the viewing terrace of the book.
* Platform walls on the east and south from 0 down to −6 (`retaining_wall`, buttress 'square'). `preview_ground(-6)`.
* Rich touches: 'porphyry' and 'giallo' columns, 'gold' capitals, red bands; tile roofs; no glass.
* Budget ≤ 60 000 triangles. `finish('rome_transitoria', front='+X')`.

## Checklist
- [ ] Courtyard palace with a two-storey east portico
- [ ] Sunken nymphaeum: fountain wall with coloured columns and water cascades, pool, dining pavilion
- [ ] 32 m tower with an open top loggia (the highest point) on the east side
- [ ] ≤ 60k triangles
