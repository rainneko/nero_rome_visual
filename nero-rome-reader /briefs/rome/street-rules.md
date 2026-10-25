# 道路规则与当前限制（2026-10-25）

- **道路来源**：主路采用场景明确登记的中心线；普通街巷由密集建筑之间的非植被空地生成，不能从住宅庭院穿过。闭环保护详见 `courtyard-and-depot-rules.md`。
- **三级材质**：窄巷与郊野为泥路，城市主路／普通较好街区为灰石，神殿前庭及指定广场为暖白石材／大理石。不是把整块空地全部刷成石路。
- **水岸和建筑**：道路纹理、路沿、车辙必须共享水域／建筑／坡度检查。水域粗采样后还要对实际道路格和模糊纹理边缘复查精确岸线，不能只检查主路中心一个点。
- **坡度**：未单独设计桥或梯道的主路不直接越过大于30%的坡面。石阶与大理石阶仅在对应等级的石路上生成，整段及完整宽度不得碰建筑或水，且两端必须接现有街面；泥路不自动变成阶梯。
- **预留地**：一般 open 用地可供合法主路穿越；带 reservation／庭院标记的私院禁止穿路。原学院按本体与未来附楼分别预留，不再用340m见方的空白保护区。
- **当前限制**：栅格通常2.5m，低画质3.5m；小于栅格的窄巷不能保证每一条都清晰。当前没有全城道路寻路图，遇到水岸／超陡坡会截断，不能自动保证两端绕行相接。数值检查“未入水”不等于已证明全城道路连通。

以下是各实现细节与验收边界。

# Rome street raster rules

These are the constraints implemented by `src/world/streets.js` and `src/world/terrain-roads.js` (world units are metres).

## Three surface grades

1. **Dirt (grade 1):** narrow lanes, poor districts, edges, and rural minor routes. Ordinary streets come from open cells within 9 m of building footprints and a local density threshold; lanes narrower than about 3.2 m are forced to dirt. Road centre lines narrower than 9 m are grade 1 outside the urban mask.
2. **Stone (grade 2):** ordinary streets use `zone(x,z)` unless narrowed to dirt; main-road cells use stone in the urban mask or when the named road is at least 9 m wide. Grey main roads are the only ones that receive kerbs and wheel-rut decals.
3. **Marble/travertine (grade 3):** plaza rectangles, cells within 16 m of a temple footprint, designated marble districts within 12 m of buildings, or any grade-3 result explicitly returned by `zone(x,z)`. These surfaces take precedence over the ordinary road grade.

The width argument is a centre-line corridor width. Raster cell size is 2.5 m (3.5 m in low quality mode), so visual edges and narrow paths are quantized. Texture coverage is blurred for antialiasing and cut back on buildings, natural vegetation, water, and court reservations. A legal main-road cell may retain its texture across a generic open reserve.

## Admission, land and water

Ordinary street growth excludes building footprints, reserved open/vegetated land, and water, and is density-gated near buildings. Main roads may cross generic `tag: 'open'` reserves such as the Academy approach, while reservations with `siteRole`/`reservation` metadata (courtyards) remain blocked; both types still exclude ordinary street growth. Main roads are rejected on buildings, courtyards, natural vegetation, water, and terrain steeper than 30% (finite-difference sample baseline 4 m). The same ground/water/slope mask gates kerbs and rut decals, avoiding decorative road edges after the road itself ends. Building reservations use the same grade gate at 6 m samples and keep an intentional clearance margin beyond the rendered corridor. This does not raise the sea, flatten terrain, or invent a bridge. A corridor can end where the authored centreline enters forbidden terrain; rerouting endpoints around a cliff or shoreline is not automatic.

`water(x,z)` and `veg(x,z)` are sampled on an approximately 10 m lattice before rasterization. That makes shore and vegetation boundaries approximate at the raster scale, even though the texture mask is cut back per street cell. Generic open reserves are tracked separately, so a legal main road can keep its material texture there. Accepted street cells and blurred texture fringes are then checked against the exact water predicate; kerb/rut positions also check the precise shoreline. Changing terrain heights alone does not update a river polygon or its fixed water level.

## Slope and stairs

The road raster rejects ground gradients above 0.30 (30%). Separately, `streetStairs` detects connected steep stone/marble street cells: marble starts at about 11% gradient, stone at about 16%. Grade-1 roads are excluded; grade-2 main roads are excluded, while grade-3 road cells can qualify. A candidate must run roughly along the fall line, be at least 7 cells, fit within 12 m transverse span and 42 m run, and drop 1.1–40 m. Before mesh emission, the entire stair footprint is sampled across its full width and length; every sample must be a street cell outside buildings and water, and both ends must join the connected street raster. There is no general route solver that converts an over-steep authored road to a switchback. `hillRoute` is an explicit path helper used only where the scene author calls it.

## Courts and colonnades

Footprint `tag: 'open'` excludes ordinary street growth and reserves gardens/open land. A main road may cross generic open reserve, but must not cross a court carrying `siteRole`/reservation metadata. A rendered floor/pool without a matching footprint reservation is not automatically protected from the street raster. Diana's precinct searches complete U plans that contain the existing 26 × 44 m temple with 4 m clearance, without shrinking the court inside the temple footprint. It emits all three continuous wings only when the sampled terrain support is at most 7 m (a civic retaining foundation, distinct from the 2 m cap for residential gardens); each wing has a continuous stone footing, two aligned column rows and a continuous roof beam. If no full-size plan passes, `W.dianaPrecinct.built` and `complete` are false with a reason and no U is drawn. Wing metadata reports column count, support range, and world-space bounds; the high-ground stepped entry reports rise and run; the steep river-side end is closed by a balustrade.

## Deliberate limits

The current implementation has no globally connected path graph, no pathfinding around newly added buildings, no shore-aware road rerouting, and no automatic stair/bridge construction for main roads. Raster smoothing can close small land gaps but cannot guarantee route connectivity. Adjust the authored road polylines or add a specifically modelled crossing when continuity across a cliff, water edge, or protected court is required.
