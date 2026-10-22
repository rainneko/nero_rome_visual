# 提比略宫（尼禄的皇宫）· Domus Tiberiana (rome_tiberiana)

Site: the north-west part of the Palatine top. Its north front looks down on the Forum Romanum (there the hill drops
~30 m); the palace stands on a platform at z = 0. Asset front (main entrance, viewing loggia) = +Y (north).
【史】 In AD 54–59 Nero lived here: the Domus Tiberiana, begun by Tiberius and extended by Caligula toward the Forum,
was the emperors' residence. This is the palace of the novel.
References: `villa_noble.jpg` (palace of wings, porticoes, gardens, a pool, a belvedere), `houses_rich_1.jpg`,
`houses_rich_2.jpg` (warm plaster, arcaded loggias, lattice balconies — ignore the chimneys: Roman houses had none),
`hill_temple_base.jpg` (substructures and buttressed walls).

## From the book (quoted exactly)
* "帕拉蒂尼山上全是宫殿，一座挨着一座，白的墙，红的瓦，柱廊一层一层往上叠。"
* "我们从宫殿的侧门出去，沿着山坡往下走。"
* "宴会在帕拉蒂尼山的大餐厅里。" … "屋子很长，两边一排一排的柱子，柱子上缠着金箔。"
* "尼禄正斜躺在阴凉的柱廊凉亭里，脚边趴着只打盹的猎豹"
* "有一天夜里批完公文，我在寝殿旁边的屋顶露台上找到了尼禄。屋脊边立着一只早年被风吹缺了半边翅膀的旧陶鹰，他就抱着膝盖坐在陶鹰旁边的瓦片上"
* "听着密集的雨水哗哗地砸在帕拉蒂尼山高耸的陶瓦屋顶上，砸在天井院落平整的石板上，砸在窗外那棵老无花果树宽大的叶片上。"
* "传令的近卫军军官在长长的回廊里往来奔跑，沉重的铁钉军靴砸在大理石地砖上"

## Shape and size (130 × 100 m; origin = centre; z = 0 = platform / ground floor)
* Platform walls: on the east, south and west `retaining_wall` from 0 down to −8 (buttress 'square', every 10 m,
  parapet None). On the north side a two-storey arcaded substructure from −14 to 0:
  `substructure(F, 65, 50, -65, 50, -14, storeys=2, h=7, bay=5, depth=5)` (runs east → west so the arches face north).
  `preview_ground(-14)`.
* Main block: `court_building(F, 0, 0, 130, 100, 64, 44, floors=2, floor_h=5.0, wall_mat='plaster', peristyle=True,
  col_order='ionic', court_mat='grass', pool_size=(30, 9), doors=(('N', 0.0), ('W', -20.0)), foundation=0)` —
  the four wings round the big peristyle garden with a long fish pool ("长长的回廊" = the peristyle walks).
* North front: an entrance porch on the north door (`pediment_front`, 4 columns, facing +Y), and on top of the north
  wing a third-storey open loggia 60 m long facing the Forum (Ionic 'marble' colonnade, balustrade, tile roof) —
  the emperor's view over the Forum.
* Banquet hall (大餐厅) in the east wing: a hall 16 × 42 m whose walls rise to 15 m, above the wing roofs, with
  arched clerestory windows and a gable roof (axis along y). Two rows of columns stand inside; you only need the
  outside, but give it a gilded ('gold') band under the cornice so it reads as the grand hall.
* Nero's apartment (寝殿) in the south-west corner: a 3-storey block 24 × 20 m (`rect_building`, floors=3, hip roof).
  Next to it, on the west wing roof, a ROOF TERRACE 14 × 14 m (flat paved roof, `balustrade` round it, a small
  stair hut 3 × 3 m with a tile roof). On the hip-roof ridge of the apartment block, at the end next to the terrace,
  the old terracotta eagle with half a wing missing: `eagle(F, x, y, ridge_z, s=1.3, mat='tile', broken=True)`.
* A small paved inner court (天井院落) 12 × 12 m between the apartment block and the south wing: 'paving', with a
  5 × 5 m soil bed ('grass') in one corner for the old fig tree (the page plants it). The apartment block's windows
  look onto this court.
* Garden pavilion (柱廊凉亭) in the peristyle garden at the south end of the pool: `ring_colonnade` of 8 Corinthian
  columns (R 4 m, 4.5 m tall) with a `cone_roof` (tile), on a 0.6 m round platform.
* Side door (侧门) in the west wing with a `stair_flight` outside, running south along the west platform wall from
  the door sill (z 0) down to z −8 (the path down the hillside).
* Walls 'plaster' with red bands, travertine plinths, tile roofs; no chimneys, no glass.
* Budget ≤ 70 000 triangles. `finish('rome_tiberiana', front='+Y')`.

## Checklist
- [ ] Four wings round a big peristyle garden with a long pool; arcaded substructure on the north, walls elsewhere
- [ ] North entrance porch and top-floor viewing loggia toward the Forum
- [ ] Tall banquet hall with clerestory rising over the east wing
- [ ] SW apartment block, roof terrace beside it, broken-winged terracotta eagle on its ridge, paved inner court
      with a soil bed for the fig tree
- [ ] Columned garden pavilion; side door with a stair down the slope
- [ ] ≤ 70k triangles
