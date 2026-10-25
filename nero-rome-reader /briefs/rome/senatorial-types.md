# 罗马住宅资产三类：适用边界

用于街区选型的工程分类，不声称它们都对应同一年代、同一考古遗址或具体史实复原。剧情中的住宅以【书中】标识；史实说明另行标【史】。

| 类型 | 项目内实际文件／模型名 | 用途 | 场地条件与限制 |
|---|---|---|---|
| 旧标准庭园宅 | `src/scenes/rome/monuments.js` 的 `courtFill.domus`；procedural `domus` lot 经 `genBlocks` 分配，并由 `decorLot` / `lotBuild` 生成 | 低层住宅与庭院水池的通用程序资产 | 仅用于足以容纳内院、池沿和通行空间的完整地块。坡度、道路及已登记 Foot 仍须通过住宅场地规则。旧标准水池庭院的半成品构造需待 `genBlocks` 对应修复完成后再用于新街区；本次学院补建不调用 `genBlocks`。 |
| 旧最高豪宅与后期四层街宅（两支资产） | 旧最高豪宅：`assets/models/rome/rome_domus_a.glb`、`rome_domus_b.glb`，对应 `src/scenes/rome/palatine.js` 的 `PAL_ASSETS` 放置；后期四层街宅：`assets/models/rome/rome_lux_row4.glb`、`rome_lux_corner4.glb`（放置名同文件基名） | `rome_domus_a/b` 是旧最高豪宅；`rome_lux_*` 是后来四层红瓦庭院街宅，可作为单体／街角资产。两支来源分别记录，不视为同档资产。 | `rome_domus_a/b` 带大型山体／基座，只能在模型原设的山坡承托条件和完整占地范围内使用，不得直接放到平地或陡坡。`rome_lux_*` 仅放入足够大的近矩形地块，地面需平缓，模型包围盒连同至少 2 m 净距须通过 Foot 检查。 |
| 现有新密集型 | `src/scenes/rome/noble-quarter.js` 的 `nobleCourtHouse`（多翼庭院生成）；一般密集住宅在 `src/world/lots.js` 的 `genBlocks` / `lotBuild` | 新建街区优先使用的可变尺寸程序资产；前者用于三／四层显贵街宅，后者用于普通密集住宅 | 按实际 polygon 验证 Foot、道路、地块间通行、坡差和建筑尺度。显贵街宅以适中矩形或复合地块为单位；不能把长条大体量当作一个实心楼。学院附近新增宅院要求地面坡差不超过 1.5 m，宅间留至少 2 m。 |

## 本次学院街区的选择

新增文件 `src/scenes/rome/academy-housing.js` 沿主街方向组织三组街块，在学院主址 `(1350,-330)` 的 215–330 m 范围内连接道路并逐地块验证 Foot。目标为 12–20 处：优先尝试 4 处 32×28 m 庭院显贵宅、2 处现有四层红瓦 `rome_lux_*`，再补适中三／四层新密集型街宅；实际成功数取决于现场 Foot 与坡度，不为凑数放宽约束。程序宅院的坡差上限为 1.5 m，`rome_lux_*` 为 1 m；地块碰撞检查保留至少 2 m 净距。成功项独立记录到 `W.academyHomes`，不并入 `W.nobleParcels`。

本次在通过 Foot 与坡差校验的地块上复用两个 `rome_lux_*` GLB；不移动对应 `PAL_ASSETS` 的 `rome_domus_a/b`。这里不复用尚待修正的标准水池庭院 lot 构造，也不新建灯光。

## 2026-10-25 场景更新

旧标准柱庭宅由 `scenic-estates.js` 在阿文提诺和学院附近各恢复4组；一般随机旧庭院仍经过整组验证。新学院显贵住宅实际9处，与这4组恢复柱庭宅分别记账。校园预留改为本体64×100m及7处未来建筑的独立小地块，不再维持170m半宽的大方形禁建区。
