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

## Rework 2026-11-08 (podium p3, C1): the hill base on the Forum and west sides
The author (2026-11-07): the big base and the arches under the palace look unnatural. In the page (`palatine.js`, `PAL_ASSETS`:
platform z = 0 at 54.8 m) the ground round the model is, relative to the platform: the valley floor at about −47 north of the
model and west of its north half, rising to about −32 at the south end of the west side; east and south the ground is level
with the platform (the saddle deck and the hilltop), so the east and south walls and rock are buried. What was wrong:
* the Forum-side street, shops and brick back wall (y 66–90) stood on the rock; from the Forum only a 130 m brick strip and a
  lean roof showed, like a beam lying on the grass;
* three identical tiers of brick arcades on the north side (they read as an aqueduct; 【待核】the brick arcades along the Nova
  Via are mostly Domitianic and Hadrianic, after Nero);
* a white slanted slab ("west ramp") at the north-west corner;
* D-shaped bastions every 30 m on the lower walls (the author's rule: half-round projections only at a few rock-spur corners,
  square buttresses elsewhere — `briefs/rome/podium-stairs-rock.md` section 6, decision 3);
* four rock benches of the same height with flat tops: they read as four more walls.
The wall stone stays `tuff` (the page's procedural Palatine walls already take this model's colours).

Change only these things (line numbers are those of `tools/models/rome/rome_tiberiana.py` before the change):
1. **Remove the Forum-side street and everything on it:** the fill `box(F, 0, 72, -36, ...)` and `box(F, -67, 75, -36, ...)`
   (lines 19–20) and the whole block "the Forum-side foot" (lines 129–134: paving, brick back wall, arcade at y 90,
   `taberna_front`, Tuscan colonnade, lean roof).
2. **Three brick arcade tiers → one tuff arcade:** remove both `substructure(...)` calls (lines 33–35) and build instead
   * the upper north face as a plain wall like the other sides, but without buttresses (the viewing portico stands in front of it):
     `retaining_wall(F, [(65, 60), (-65, 60)], 0.0, -7.0, buttress=None, parapet=None, courses=3.5)` and a fill under the
     forecourt `box(F, 0, 55, -7, 130, 10, 7, 'tuff')`;
   * a plinth along the foot of the lower north face, 0.9 m proud of it: `box(F, 0, 63.45, -40, 130, 6.9, 21.0, 'tuff')`
     (y 60–66.9, z −40 to −19) and a travertine band on it `box(F, 0, 66.45, -19.4, 130.4, 0.9, 0.4, 'travertine')`;
   * ONE storey of tall tuff arches on it, travertine imposts and cornice, a marble balustrade along the mid terrace on top:
     `substructure(F, 65, 66, -65, 66, -19.0, storeys=1, h=12.0, bay=8.0, depth=6.0, mat='tuff', pier_mat='travertine',
     half_cols=False, cornice_mat='travertine', top_parapet=True)` (16 arches about 4.6 × 9.6 m);
   * the two corner piers (lines 21–22) go down to −40: `box(F, ±68, 63, -40, 6, 6, 33, 'tuff')`.
   The mid terrace paving (line 39) and its Ionic colonnade (line 40, the viewing portico) stay.
3. **The west ramp → a stair along the wall with parapets:** remove the `beam(...)` (line 41). Two flights at x = −68 on
   solid tuff bases, travertine treads, tuff parapets (the flight's cheek walls), a landing between them:
   ```python
   def stair_on_base(F, x, ya, za, yb, zb, w=4.0, zbase=-40.0):
       """A straight flight along y at x from (ya, za) up to (yb, zb) on a solid tuff wall down to zbase."""
       stair_flight(F, x, ya, x, yb, za, zb, width=w, mat='travertine', cheek_mat='tuff')
       L = abs(yb - ya); rot = math.degrees(math.atan2(yb - ya, 0.0)); S = F.sub(x, ya, 0, rot); hw = w / 2 + 0.6
       v = [S.p(0, -hw, zbase), S.p(L, -hw, zbase), S.p(L, -hw, zb - 0.5), S.p(0, -hw, za - 0.5),
            S.p(0, hw, zbase), S.p(L, hw, zbase), S.p(L, hw, zb - 0.5), S.p(0, hw, za - 0.5)]
       add_mesh('tuff', v, [(0, 1, 2, 3), (5, 4, 7, 6), (3, 2, 6, 7), (4, 0, 3, 7), (1, 5, 6, 2), (0, 4, 5, 1)])

   stair_on_base(F, -68.0, 104.0, -26.5, 87.0, -16.0)                 # lower flight, from the rock ledge
   box(F, -68.0, 85.5, -40.0, 5.2, 3.0, 24.0, 'tuff')                 # landing (top at -16)
   box(F, -68.0, 85.5, -16.0, 5.2, 3.0, 0.1, 'travertine')
   stair_on_base(F, -68.0, 84.0, -16.0, 66.5, -7.0)                   # upper flight, onto the corner pier and the mid terrace
   ```
4. **Bastions only at the two west rock-spur corners:** the lower walls (lines 31–32) get square buttresses like the upper
   ones; the west one goes deeper (the rock top falls to about −22 at its north end):
   ```python
   retaining_wall(F, [(-71, 66), (-71, -56)], -7.0, -25.0, buttress='square', every=10.0, parapet=None, courses=3.5, coping=True)
   for pts in ([(-71, -56), (71, -56)], [(71, -56), (71, 66)]):
       retaining_wall(F, pts, -7.0, -14.0, buttress='square', every=10.0, parapet=None, courses=3.5, coping=True)
   for (bx, by) in ((-71.0, -56.0), (-73.5, 57.0)):                   # round corner towers (restored), SW and NW
       cyl(F, bx, by, -25.0, 4.5, 18.6, 'tuff', 24)
       cyl(F, bx, by, -6.85, 4.8, 0.45, 'rock2', 24)
   ```
   Also make the west foot box (line 23) go down to −25: `box(F, -69, 0, -25, 4, 132, 11, 'tuff')`.
5. **Rock that follows the hill:** replace `tN` and `tW` (lines 144–145); `tE` and `tS` (buried) stay as they are.
   `rock_mass` now takes `tilt` (metres added at (x, y)) and `split` (the benches' shares, bottom first):
   ```python
   tN = rock_mass(F, [(-80, 50), (80, 50), (80, 112), (-80, 112)], -40, -20.5, seed=3, strata=3, split=(0.45, 0.33, 0.22),
                  step=8.0, dip=0.0, tilt=lambda x, y: -0.14 * max(0.0, y - 66.0), relief=1.4, jitter=2.2, batter=18.0,
                  band=6.0, boulders=5, grid=7.0)
   tW = rock_mass(F, [(-82, -66), (-56, -66), (-56, 84), (-82, 84)], -31, -13.5, seed=5, strata=3, split=(0.45, 0.33, 0.22),
                  step=8.0, dip=0.0, tilt=lambda x, y: -0.07 * (y + 56.0) + 0.12 * min(0.0, x + 71.0), relief=1.2,
                  jitter=2.0, batter=18.0, band=6.0, boulders=4, grid=7.0)
   ```
   (north: the top meets the plinth at −20.5 and falls to about −26 at the outer ledge, the foot reaches −46 at the north edge;
   west: the top is −13.5 at the south end of the wall and −22 at its north end, the foot falls from −32 to −42.)
6. `GROUND = -47.0`; `finish(NAME, front='+Y', extra_cams=[('north_low', Vector((0.0, 1.0, 0.0)), 6),
   ('west_low', Vector((-1.0, 0.0, 0.0)), 6), ('nw', Vector((-0.7, 0.7, 0.0)), 22)])` (add `from mathutils import Vector`).

#### Round 2 (after the page view of round 1)
Round 1 got the structure right, but in the page the cliff still read as even horizontal bands, and the 40 m ledge in front of
the arcade was a broad, pale, flat plateau. The 18° batter pushes each face's foot out by height × tan 18°, so the bottom
outline grew 2.3 m to the north and 1.9 m to the west. The main road passes 2 m outside the north-west corner.
- `rock_mass` takes `top_mat` (the topmost bench's top inside the rim; default off).
- tN: footprint pulled in to x ±79, y 50–109; z −41 to −21.8 (the top stays below the plinth band at −19.4 even with the relief);
  2 benches, split (0.6, 0.4), band 4.5, relief 2.0, jitter 3.0, step 6, rock2 0.4, boulders 8, moss_cover 0.5,
  `top_mat='grass'`; same tilt.
- tW: west edge pulled in to x −79; same heights and tilt; 2 benches with the same settings, relief 1.8, boulders 6, `top_mat='grass'`.
- Lower NW flight starts at −27.0, on the ledge (the top there is about −27).
- The ledge in front of the arcade is now a grassy slope (8°) over a two-bench cliff.

#### In the page (round 2)
- `palrock.js`: tiberiana foot −47.1 (it was −40.8). The old rock's north foot stopped 6 m above the valley floor, so the
  terrain was pulled up into a 7 m mound along the north side. Now the ground 1 m outside the north foot is −45 and 10 m out
  it is −46.9, the valley floor. The outline is 24 points, box x −82.7…82.7, y −72.7…112.7 (it was −82.6…82.5, −72.7…112.5).
- `palTibFeet` and `palGlbFeet` follow the outline on their own. `__wallFootCheck()`: 107 walls, no seam over 20 m; the
  longest on this model is 11.8 m. `__floatCheck()`: 282, as before; the model floats nowhere.
- **Roads.** The router does not see the rock. Once the mound was gone, the Vicus Tuscus routed 3.6 m into the rock's
  north-west corner, at (−19.8, 73.6); its edge was 7 m inside. A waypoint at (−22, 59) in `MAIN` (`monuments.js`), 12 m off
  the corner (the old bake already passed there), keeps it out: the nearest road edge is now 2.3 m from the rock foot outline
  (it was 3.6 m with the old model). Re-baked.
- In the summer shots the grass is greener than the dry hill grass around it. Left as is.
- `city-audit.mjs --assert` fails on one H14 house on the `?city=v2` page, at (571, −413): 18.7° off its street, 1 of
  10 879 measured. It passed before the re-bake. In the bake only the Vicus Tuscus changed, and that house is 600 m away;
  v2 cuts each district into blocks from its pole (`fbSub`), so reshaping one district moves blocks far from the change.
  Left to the city-generation side (`parcels.js`, `fabric.js`).
- Shots (left before, main 7ede1f3; right after): `docs/screenshots/tiberiana-rework-20261108/`: model previews
  `model_*`, page views `page_*`, and the north-west corner with the road from above (`page_corner_top`).

#### Round 3 (2026-11-08, after the author's look at round 2)
The author: better than the old one, but the bare rock still looks abrupt, and the lawn in front of the arcade has no use.
Asked whether the lawn should become a street with shops or a terrace garden, the author chose the terrace garden.
- **Terrace garden** at the arcade floor (z −19.6, the arcade floor is −19.0), so the four middle bays become its portico:
  - a travertine step and paving in the bays;
  - gravel over the terrace, x −65…74, y 67…95;
  - eight beds in two rows, each framed by clipped box (`hedge`), with a pomegranate or a fig in the middle and flowers or
    shrubs at the corners;
  - a round basin with a statue on the axis, and six more statues on pedestals;
  - a vine pergola with a marble bench at the east end;
  - a tuff terrace wall along the cliff edge with a 1 m parapet and travertine coping, with a strip of grass behind it
    planted with cypresses, umbrella pines and two broad trees;
  - a side flight from the garden up to the NW stair landing.
  【史】 Models: Livia's garden room at Prima Porta (painted), and the Pompeian peristyle gardens, which had box-framed beds,
  gravel paths, basins, statues and pergolas.
  The page plants the garden's trees and the cliff's shrubs from `TIB_PLANTS` (`palatine.js`). The model script prints
  that list, so paste it again after every rebuild.
- **Rock.** The north and west tN/tW rock masses are replaced by one `cliff_band` (`rk.py`), a natural cliff in 132
  stations that runs round the garden and the west terrace:
  - a ragged lip and a mid bench whose height and width vary along the cliff, pinching out in places;
  - 14 fissures cut back into the face;
  - 6 soil tongues coming over the rim, each about 6 m wide;
  - talus and scree at the foot, with 10 boulders kept inside the toe;
  - ivy in 12 small clumps of pointed strands, 1–6.5 m long, with gaps between them;
  - shrubs on the benches and the scree.

  Two limits keep the faces from turning up to the sky. A face bulges out at most 7 % of its height, though recesses stay
  deep. Where the bench narrows below 1.5 m, its rib (the lip's step out) fades, so a pinched-out bench leaves no pale
  band across the face. Room left over at a station widens the bench only where the noise put one; elsewhere the faces
  lean back, so the bench comes and goes along the cliff.
  The rim dips to −24.4 where the NW stair comes down, and the bench there is at least 6.5 m wide for the stair's foot.
  Colours: the faces are `rock3`, one stain darker and warmer than the other hills, with lighter `rock2` patches; the
  fissures and the undersides of the bench lips are `rock4`. tE, tS and the foot rocks now use `rock3` too, but their
  shapes are unchanged. The whole base is clearly darker than the arcade's tuff, even in sun, while the other hills keep
  the paler `rock`.
- **Foot outline.** The toe is fitted to the round-2 outline (`palrock.js`). Every new outline vertex lies on or inside
  the old outline, at most 0.21 m in. The one exception is the NW corner, which is chamfered 1.5 m (−80.5, −110.3).
  Area 30 145 → 30 078 m² (−0.2 %). Foot −47.1 and top 21.6 are unchanged. Boulders stay inside the toe.
- **Shading** (`assets.js`, shared by every GLB rock):
  - Pattern 10 is now a function of world position only. The old version laid its beds and joints out in each face's
    own uv, which broke at every polygon edge where the uv axes switch, and the breaks showed as a ghost grid of straight
    lines. Changes:
    - wavier beds;
    - fractures as vertical planes: the edges of a cell pattern in plan (cells about 7 m), wandering with height, each
      through two to four beds. This replaces the joint per bed, which read as brick courses;
    - more ochre stains and rain streaks;
    - duller grass on the ledges.
  - Rock tints are warmer (W `rock` .385/.315/.2, `rock2` .295/.24/.15; RK `rock` .29/.235/.15, `rock2` .215/.172/.105).
  - New pattern 11 (`turf`): the terrain's seasonal hill grass, duller and darker. Bare earth takes most of a steep face
    and patches of a flat one.
  - New material `ivy` (pattern 8), more olive than the clipped box.
  - New materials `rock3` (pattern 10, W .245/.193/.112) and `rock4` (W .175/.125/.07): this model's rock and its
    shadows. No other model uses them.

  Checked on Victoria, Magna Mater, Apollo, Domus Augusti and an outcrop: one rock and one wall stone per hill still holds.
- 62 639 triangles (cliff 3 431).
- **Foot planting.** `terraceFeet` used to put rock lumps, a moss strip and scree along the rock foot outline; they read
  as flat white chips and green dashes in front of the model's own talus. The Tiberiana foot records now carry
  `natural:true` (`palGlbFeet`), so they get shrubs and cypresses only, set further out as on a ledge
  (`terrace-edge.js`).
- **Roads.** Re-baked. The Vicus Tuscus west of the palace, from (−60, 120) to (−142, 152), lost three bends. The nearest
  road edge is 2.4 m from the rock foot outline (2.3 m in round 2).
- **Checks** (summer, `dist/test.html?test`):
  - `__wallFootCheck()`: 108 walls, no seam over 20 m; the longest on this model is 11.9 m.
  - `__floatCheck()`: 282, as before; this model neither floats nor is buried.
  - `bake-roads.mjs --check`: up to date.
- Shots (left: round 2, 074128d; right: round 3), in `docs/screenshots/tiberiana-round3-20261108/`:
  - `page_camA`, `page_camB`, `page_camC`, `page_forum_far`, `page_nw`, `page_t1`;
  - `rock_*`: the other GLB rocks before and after the shared shading change;
  - `model_*`: Blender previews, after only.

### Rework checklist (2026-11-08: all pass)
- [x] No street, shops, brick back wall or lean roof north of the arcade; the north rock comes up to the plinth
- [x] One storey of tuff arches on the north side, with travertine imposts, cornice and a balustrade; nothing in brick
- [x] Upper north face is a plain wall behind the Ionic portico; forecourt parapet and statues unchanged
- [x] The north-west stair: two flights on solid bases with parapets and a landing, from the rock ledge to the mid terrace;
      no white slab
- [x] Square buttresses on all lower walls; round towers only at the SW and NW corners of the west side
- [x] Rock: benches of different heights (round 2: two, with a grassy top), tops falling toward the north and the north-west,
      no flat stack of equal layers; nothing floats (walls, plinth, stair bases go down into the rock)
- [x] Palace, wings, loggia, garden, pavilion, eagle and side-door stair unchanged
- [x] ≤ 70 000 triangles (65 774; round 3: 62 639)
- [x] Round 3: the north ledge is a terrace garden (beds in box, gravel walks, basin, statues, pergola, parapet with trees)
      and the arches open onto it as a portico
- [x] Round 3: the rock is one natural cliff (varying bench, ragged lip, fissures, soil tongues, scree, ivy, shrubs); no
      saturated green, no yellow sheets; foot outline kept (NW corner chamfered 1.5 m)

## v2 (2026-11): the palace above the platform, rebuilt from a plan
Brief: `briefs/rome/tiberiana-v2.md`. Plan data: `tools/models/rome/tiberiana_plan.json` (written and checked by
`python3 tools/plan/tiberiana_plan.py`; drawings `briefs/rome/plans/tiberiana-plan.html`). This section replaces "Shape and size"
above for everything over z = 0. The hill base of the 2026-11-08 rework (arcade, terrace garden, cliff, walls, towers, the
north-west stair) is as it was.

**Why** (the author, 2026-11-11): the roofs were single tiled sheets up to 130 m long over wings 28–33 m deep; the hall had four
storeys; the palace should be a senator's house enlarged, at most three storeys with a tall ground floor, below the Golden House
in rank; and the floors must come apart, for Unity.

**What it is now**
- 141 rooms (81 on F1, 48 on F2, 3 on F3, 9 in the basement) and 35 roof blocks, six open courts. Storeys 6.5 / 4.5 / 3.8 m.
  Three storeys only at the south-west tower (M12) and the north frontispiece (M02); the highest ridge is 17.2 m (it was 21.6).
- Roofs by block: gable, hip, pyramid, lean-to, compluviate (the two atria), flat. No tiled plane runs more than 7.6 m. Tile ribs
  every 1.0 m (2 251), ridge tiles on every ridge and hip. Where a gable ends against a neighbour's slope it runs on into it (a
  valley); lean-to roofs of equal height are mitred at corners; a wall above a lower tiled roof has a travertine flashing course.
  Flat roofs are opus signinum (`plaster3`), the solarium is paved. No ridge runs more than 45 m at one height: the north range
  is 0.6 m higher behind the loggia, the council room and the inner hall stand 0.8 m over their ranges, the inner ranges have
  parapet gables at the corners of the peristyle, the south front has a gate pavilion and the south portico a gate porch.
- North front: porch (four columns), the loggia on F2 (54 m, Ionic columns on a parapet), the frontispiece with three arched
  openings and a pediment on F3. South front (toward the Area Palatina): two storeys behind the portico, the gate pavilion 1.2 m
  over the eaves with a pediment. Banquet hall: nave 14.5 m to the eaves over lean-to aisles, 14 arched clerestory windows a side,
  one gilt band under the cornice, a pediment on each gable. West side hall with the pomegranate court. The tower with a
  three-bay loggia on F3, the solarium beside the bedroom with six bronze awning posts, the broken eagle on the west apex of the
  old house's study (M15), the fig tree's bed in the paved court. Kitchen with a ridge vent; no chimneys, no dormers, no glass.
- Walls: travertine plinth, a red dado band 2.2 m up, small high windows on the ground floor (sill 3.8 m; none on stairs, stores,
  guard rooms and the hidden closet), a red string course at each floor of a block, lattice windows above, a cornice. 371 windows, 8
  doors, 162 columns in 148 bays (ground floor Ionic 4.2 m on a stylobate in the courts and 4.05 m on the platform wall's coping at
  the south and east edges; the peristyle's upper order Corinthian 2.8 m, standing on the floor with the parapet between: the
  most that fits under the lean-to at 9.6 m with a 0.3 m beam; 【史】 Vitruvius 5.1.3 has the upper columns a quarter shorter
  than the lower, which would be 3.15 m).
- Courts: the peristyle garden (45 × 29 m) with the pool whose inner wall alternates rectangular and semicircular niches, the
  round basin, the wall fountain and the book's pavilion; the fish-pond garden with the oval pond, eight herms and the Hermaeum;
  fig court, pomegranate court, service court, kitchen court.
- Below z = 0 only this changed: three arched windows of the underground bath (y 8.5, 17.0, 22.5) and a smoke opening (y 31)
  in the upper west platform wall; and the way down from the side door (next point).
- **The way down** (addendum `briefs/rome/tiberiana-v2-stairs.md`; the author on the round 2 pictures: "有一个台阶 走到尽头路断了";
  the book: "我们从宫殿的侧门出去，沿着山坡往下走。"). It is one connected way now:
  - the side door at the west end of the broad corridor (y −29.5), a landing, and a stair going down NORTH along the west
    platform wall, outside its buttresses, to the −7 strip: three flights of 13 risers with two landings (it was one flight
    of 39 going south to a dead end by the corner tower). South of the landing the strip is closed with a parapet;
  - north along the strip to the north-west corner pier, then the two old flights of the north-west stair (−7 → −16 →
    −25.77: the lower one now ends on a landing 0.7 m above the ledge it used to stop on);
  - the new lower part, 106 risers in eight flights, none over 15 risers, on the north face inside the rock's foot outline:
    an inner lane east along the cliff's bench (5 risers, a level walk at −26.6, 15 risers to the turning landing at −29.3,
    x −39.1…−35.1), an outer lane back west (five flights of 15 risers, landings 2.8 m, to the last landing at −43.0,
    x −74.1…−71.3), and at the west end a last flight of 11 risers going north, down the bank at the rock's foot, to the hem.
    Flights 3.6 m wide, risers 0.18 to 0.20 m, treads 0.27 to 0.28 m, travertine treads, solid tuff bases and parapets
    with travertine copings, four buttresses on the outer wall.
  - **Foot:** model (−75.9, 110.1, −45.15) = hill grid (lx −214.3, lz −139.9), the lowest tread's top at page y 9.65; it
    faces north. The drawn ground at its front edge is 0.17 m (east end), 0.33 m (middle), 0.56 m (west end) lower; the
    paved edge of the Vicus Tuscus is 6 m north and about 1.7 m lower. That last stretch is outside this model (the terrace
    session's). The page plants shrubs and cypresses along the rock's outline (`terraceFeet`): none stands in front of the
    foot now.
  - Why it folds instead of running straight on as in the reference picture: a straight flight from the ledge needs 38 m to
    the north, and the outline ends 5 m north of the ledge.
  - Why the outer lane stops 2.7 m above the hem and the last flight turns north: the page's ground under a hill model is not
    the model's lowest surface. `pal_rock.mjs` lifts each 4 m cell toward its neighbours' lowest points (at most 2.5 m), the
    page puts the terrain 0.25 m under that, and the Palatine's terrain patch is smoothed three times (`buildPatch`). What is
    drawn along the north face is a bank from −43.3 (the lane's south edge) down to −45.5 at the hem, and it covers
    whatever lies under it: a first version with its last landing at −44.85 had half the landing and six steps under earth.
    A flight along the face cannot come down such a bank, only one that crosses it. The landing sits 0.3 m over the bank's
    top; between it and the last flight's head the turn is 1.3 m wide (the bank leaves 4 m for the head and eleven treads).
  - Check: `node tools/plan/tiberiana_stair_ground.mjs <log of rome_tiberiana.py> [low]` compares all 115 treads and landings
    with the drawn ground (`W0.gy`). Desktop tier: none under the ground, least clearance 0.07 m (the lowest tread's east
    end). Low tier (touch or small screens: coarser terrain, 0.3 m higher at the hem): the east ends of the three lowest
    treads lie under 0.02, 0.13 and 0.24 m of earth; the middle of the foot is 0.06 m above the ground.
  - Nothing of this moved the ground grid: every base goes down to its cell's old lowest point and no further, no tread
    reaches under it, and the rock was cut back (8 points) only where no face ends lower in any cell than before
    (`NW_FLOOR`, `_solid`, `_carve`). The raw grid equals the old one in all 3 591 cells; both bakes are up to date.
- 【史】 What the plan takes from the excavations, and that the unified platform is Neronian and later than AD 64, is in the
  brief. The plan is this project's, not the excavated one. 暗阁 (the book's hidden closet) is W02b since the plan revision of
  2026-11-14 (below).

**Files**
- `tools/models/rome/tib_plan.py` builds from the JSON (no palace numbers in it); `tools/models/rome/rome_tiberiana.py` holds the
  hill base and what the plan only notes in words (`OPTS`, `EXTRA`, the gardens, the stair). One run (15 s) writes:
  - `assets/models/rome/rome_tiberiana.glb`, the web file: 67 488 triangles (limit 80 000; 62 639 before);
  - `assets/models/rome/parts/rome_tiberiana_parts.glb`, for taking apart and for Unity: seven objects `tib_base`, `tib_b1`
    (the basement: the secret corridor ring with its link, the underground bath), `tib_garden`, `tib_f1`, `tib_f2`, `tib_f3`,
    `tib_roof`, and 141 child objects `room_<id>` (the floor slab of each room). The storeys carry partitions (0.45 m), 108
    doors, 7 stair flights, the state atrium's ten columns (【史】 a Corinthian atrium, Vitruvius 6.3.1), the hall's 26 columns
    with a gilt band round the lower third (the book: "屋子很长，两边一排一排的柱子，柱子上缠着金箔"), the real basins. 79 464 triangles (limit 110 000). The page's pack does not take the `parts/` folder (`build.config.json`: the
    Rome pack is not recursive; 77 models as before);
  - `assets/models/tiberiana.glb`, the light stand-in the page has inline (`DT_GLB`) and shows until the model arrives: one box
    per roof block with a ridge prism, 615 triangles, 34 KB (the old four-storey block was 931 KB; the page is 1.2 MB smaller).
    The procedural stand-in behind it (`monuments.js`) is built the same way from `TIB_BLOCKS`.
  - it prints `TIB_PLANTS` (paste into `palatine.js`) and `TIB_BLOCKS` (paste into `monuments.js`) after a change of plan.
- Renders: `renders/rome_tiberiana/` (`top`, `top_palace`, `se_high`, `apart`, `f1_rooms`, `f2_rooms`, `b1_rooms`; close-ups with
  `TIB_ZOOM=...`). Page views: `node tools/plan/tiberiana_shots.mjs <dir> [prefix]` (`STANDIN=1` shoots the stand-in).

**In the page**
- The eagle's label follows the eagle (`monuments.js`). The west side hall's court with the pomegranate tree is court W14 of the
  model: `W.pomePos` and the four labels moved there with their texts unchanged; the separate block at world (−118, 252) is gone.
- Two things are kept only so that the bakes stay valid, and go at the next re-bake of the street fabric:
  - the old pomegranate block's two footprints (its own and its court reservation), one line in `monuments.js`: they were
    placed before the houses and `fbKey` (fabric.js) hashes them;
  - 27 hidden 0.2 m triangles in the model ("ground anchors", `rome_tiberiana.py`). The page's terrain under a hill model is
    the lowest model height in each 4 m cell (`tools/pal_rock.mjs` → `palrock.js`), `fbKey` hashes that ground, and in those
    cells the lowest point was a piece of the old palace. For the same reason nothing of the palace reaches below z = 0, and
    the web file's two impluvia are water sheets 0.55 m up (the real basins are in the parts file).
  `palrock.js` differs from before only in the model's top (21.6 → 17.4), which the page does not read.

**Checks** (2026-11-12, `dist/test.html?test`): `tiberiana_plan.py` passes · `npm run check` · `build:test` + `test:boot`, no page
errors · `bake-roads.mjs --check`: road network and street fabric up to date · `city-audit.mjs --assert`: no errors ·
`__floatCheck()`: 281 entries as on main, this model 0 floating, 0 buried · `__wallFootCheck()`: 108 walls, no seam over 20 m,
the longest on this model 11.9 m, as on main · the raw ground grid of the new file equals the old one in all 3 591 cells ·
`perf-shadow.mjs 0:forum`, seven alternating runs of main and the round 2 build: medians 47.1 → 47.5 ms (+0.8 %), p95 +2.3 %
(single runs scatter by about ±10 %; round 3 changed nothing in the web file but the state atrium's opening).
After the stairs (same day): all of these again on the final build; `perf-shadow.mjs 0:forum`, three runs: mean 47.5, 39.1,
39.7 ms (round 2: median 47.5; not run against main this time; the stairs add 3 188 triangles to the hill base); `__wallFootCheck()` is unchanged (108 walls, no seam over 20 m, the longest on this model 11.9 m);
`tiberiana_stair_ground.mjs` as under "The way down".

**Shots** (`docs/screenshots/tiberiana-v2-20261112/`; `page_*`: main on the left, v2 on the right): `page_tib_roofs`,
`page_tib_north`, `page_top`, `page_saddle`, `page_west`, `page_tib_sw`, `page_tib_close`, `page_tib_plan`; the model:
`r3_model_se_high`, `r3_model_top_palace`, `r3_model_apart`, `r3_model_f1_rooms` (read it against the plan's F1 drawing),
`r3_model_f2_rooms`, `r3_model_b1_rooms`, `r3_model_north_front`, `r3_model_south_front`, `r3_model_west_front`,
`r3_model_peristyle`, `r3_model_sw_corner`, `r3_model_fishpond`, `r3_model_hall`; the stand-in: `r3_page_standin`;
`r1_*`, `r2_*`: the first two rounds.
The way down: `stairs_page_way` (the whole way), `stairs_page_nw`, `stairs_page_foot`, `stairs_page_side`, `stairs_page_tib_north`
and `stairs_page_tib_sw` (round 3 on the left, now on the right), `stairs_model_way_down`, `stairs_model_nw_north`,
`stairs_model_nw_nw`, `stairs_model_nw_foot`, `stairs_model_side_w`. Cameras `tib_nw`, `tib_foot`, `tib_side`, `tib_way` in
`tiberiana_shots.mjs`.

### Plan revision (2026-11-14)
The author settled several points with the copy session; the plan has 142 rooms now (`tiberiana_plan.py`). In the model:
- **暗阁（密室）** is W02b, the tower's ground floor under the bedroom: no window on any face, two solid bolted doors
  (1.8 × 2.6, wood) in its east wall to the court W03 (【书】“尼禄反手关上那两扇实心的厚门”). N10 is the 文书库 now and has its
  windows again.
- **2W04, “我”的屋子**, a new room on F2 next to the bedroom: roof block M13 is two storeys (lean-to to the south, 11.0 at the
  wall, eaves 9.7), a window to the court on its north wall; in the parts file a small arch with a purple curtain in the wall
  to 2T2 (【书】“穿过一道挂着厚重紫绒帷幔的小拱门，就是他的卧榻。”).
- **Banquet hall**: a square opening 3 × 3 m in the middle of the nave's ridge with a kerb (【书】“屋顶很高，顶上开着一个方口，
  能看见夜空。”). It is drawn as a dark square inside its kerb; the roof under it is not cut.
- **Pomegranate court W14**: a one-storey colonnade along its west and north sides, 3 m deep, columns 4.0 m, a tiled lean-to
  into the court; the north walk stops 1 m short of the tree's bed.
- **Service court W15**: a door in the north front (feature `doorNW`) with three steps outside.
- **甜酒工坊** is E16b now (north end of the kitchen court): a wide door and the hearth's mouth under a small tiled canopy.
  E03 is a plain 备酒间.
- Renamed rooms (N08 书记房, N09 账簿房, N10 文书库, S01 花园厅, 2T2 寝殿（内殿）, W02b 暗阁): the `room_<id>` objects keep
  their ids. `briefs/rome/tiberiana-v2.md` (the review's file) still lists the old names in its table of the book's rooms.
- Nothing below z = 0 changed; no re-bake.

### v2 checklist (2026-11-12)
- [x] No part over three storeys; three storeys only at M12 and M02; highest ridge 17.2 m
- [x] F1 6.5 m, F2 4.5 m, F3 3.8 m; string courses at 6.5 and 11.0 at each floor of a block
- [x] 35 roof blocks as in the JSON; no tiled plane with a run over 7.6 m; ridges, hips and tile ribs on every tiled roof
- [x] Six open courts: peristyle garden, fig court, pomegranate court, service court, kitchen court, fish-pond garden
- [x] Peristyle garden with the niched pool, the round basin and the book's pavilion; two-storey walks on the north and west
- [x] North front: porch, loggia 54 m long on F2, frontispiece with a pediment on F3
- [x] Banquet hall: nave over aisles, clerestory, gold band, two pediments; 14.5 m to the eaves
- [x] South front two storeys behind the portico, gate pavilion with a pediment
- [x] No white flat roofs; no ridge over 45 m without a break (portico lean-tos run the length of their colonnade)
- [x] South-west: tower, solarium with awning posts, the broken eagle on M15's west apex, fig bed in the paved court
- [x] West side hall with the pomegranate court (labels and `W.pomePos` moved); bath windows; kitchen ridge vent; no chimneys
- [x] Fish-pond garden with the oval pond, the herms and the Hermaeum
- [x] Side door at the west end of the corridor with its stair (north, three flights); the cryptoporticus door (y 35.3)
      inside the page's gallery
- [x] One connected way down: side door → stair → −7 strip → north-west stair → the ground at the hem by the Vicus Tuscus
      (foot: hill grid −214.3, −139.9; page y 9.65); no stair ends nowhere; no flight over 15 risers; every tread above
      the drawn ground on the desktop tier
- [x] Foot outline and ground grid unchanged; road and fabric bakes up to date
- [x] Web file 67 488 triangles; parts file with `tib_base`, `tib_b1`, `tib_garden`, `tib_f1`, `tib_f2`, `tib_f3`, `tib_roof`
- [x] `room_<id>` slabs for all 141 rooms, partitions, doors, stairs; `apart` and `f1_rooms` renders
- [x] 暗阁: W02b on the tower's ground floor (plan revision 2026-11-14, below)
