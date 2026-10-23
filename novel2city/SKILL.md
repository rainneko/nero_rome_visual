---
name: novel2city
description: >
  Turn a novel — especially a historical or infrastructure ("基建文") novel — into a living,
  chapter-synced 3D city on the web: story bible extraction (settings, timeline, money, resources,
  building projects), historical research and period filtering, reference-image selection and scoring,
  procedural city fabric (terrain, roads, lots, density, heights, styles), hero buildings as GLB
  (Blender / scripted), day–night–season–weather lighting, a reading UI with place-name links,
  paragraph triggers, resource HUD, and multi-agent review (director, builder, historian, editor, workers).
  Use this skill whenever someone wants readers to SEE the world of a book: "把我的小说做成3D城市",
  "小说可视化", "阅读网站背景要有会变化的城市", "从小说里整理硬核设定/时间线/建筑进度",
  "帮我找适合建模的历史参考图", "给历史小说做沙盘/地图/鸟瞰图", "make my novel's world 3D",
  "a reading site with a 3D background", "reconstruct a historical city for my story" — even when
  they only ask for one piece (just the bible, just the references, just one building, just the reader UI).
---

# Novel2City · 把一本小说读成一座会生长的城市

一句话：**先把书变成数据，再把数据变成城市，最后让城市跟着书走。**

这份技能来自一次真实的长期合作：把约 43 万字的历史基建小说《尼禄重工纪元》做成了一座
公元 54–100 年的罗马（外加安齐奥海角行宫、奥斯提亚船坞、公元 58 年帝国地图）。
二十多次迭代里有做对的，也有反复返工的。下面的流程把两者都写进去了，后来的人可以少走弯路。

## 0. 先对齐目标：交付的是什么

| 交付物 | 说明 | 是否必需 |
|---|---|---|
| 设定圣经（硬核设定） | 时间轴、钱、资源、产能、建筑工程跨卷进度、人口人才，带【史】【设】【书中】标签 | 必需 |
| 地点表 + 状态表 | 每个地点的坐标、首次出场章、存在区间、原文描述；每个"时代状态"的年份、章节、机位、天气、图层、数字 | 必需 |
| 参考图清单 | 每张图的来源、时代、可信度、用途、要忽略的部分、打分 | 必需 |
| 网页城市 | 地形、城市肌理、地标、核心资产、光照天气、按状态出现的图层 | 必需 |
| 阅读界面 | 正文 + 背景城市、地名链接、段落触发、资源栏、小地图 | 必需 |
| 核心资产 GLB | 少量精细建筑（神庙、宫殿、桥）单独建模 | 推荐 |
| 代码仓库 | 模块化源码、构建、测试、部署、文档 | 推荐 |

**先定"好看的固定机位"，再扩成整座城。** 读书背景首先要的是几个漂亮画面随章节变化。
一上来就追求"每个角度都精致的整座城"，目标会失焦（见 `references/10-pitfalls.md` #2）。

## 1. 九个阶段（每阶段：输入 → 动作 → 产出 → 验收门）

> 每个阶段都有"验收门"。没过门，不进下一阶段。所有"已修好"的说法都要有截图或测试为证。

### P0 立项与镜头（半天）
- 输入：小说简介、作者最想让读者看到的 5–10 个画面、作者给的风格参考图。
- 动作：列出 **英雄镜头**（hero shots）：每个镜头写清 地点 / 年代 / 时刻 / 天气 / 画面主体 / 对应章节。
  定阅读布局（桌面：正文右侧约 38–40%，场景主体放左侧 60%；手机：场景在上 40%）。
- 产出：`shots.md`。验收门：作者确认镜头清单。

### P1 设定圣经（硬核设定）
- 读 `references/01-story-bible.md`，用 `templates/story-bible-template.md`。
- 分块读全书（约 2 万字一块），抽取地点、工程阶段、日期、数量、钱、资源、人物职务；合并去重；
  统一时间轴；每个数字打【史】/【设】/【书中】；做一致性检查；史学 agent 复核；作者签字冻结。
- 验收门：所有进入 HUD 的数字都能在圣经里查到出处；没有自相矛盾的数字。

### P2 地点表与状态表
- 用 `templates/places.csv`、`templates/states.json`。原点选城市中心地标，**1 单位 = 1 米，从第一天定死**。
- 把全书切成 6–12 个"时代状态"；状态内部再用 **章节闸门** 和 **段落触发** 补细节（P8）。
- 验收门：每个出场地点都有坐标、存在区间、原文引语；每个状态有默认机位。

### P3 史料、时代过滤与参考图
- 读 `references/02-history-and-sources.md` 和 `references/03-reference-images.md`。
- 先做"不许出现清单"（例：公元 54 年的罗马没有斗兽场、图拉真广场、卡拉卡拉浴场、哈德良万神殿穹顶）。
- 参考图按六项打分（时代、来源、视角、清晰度、可配准、文本吻合），核心资产至少 2 张 A/B 级图 + 1 张平面。
- 用参考鸟瞰图**量**密度（按颜色分类 → 网格覆盖率 → 控制点配准），不要凭感觉。
- 验收门：`refs/manifest.csv` 完整；不许出现清单经史学 agent 复核。

### P4 技术骨架
- 读 `references/04-tech-architecture.md`。默认：three.js、经典脚本、构建成单个 HTML（方便分享），
  同时保持模块化仓库；场景按"图层 + 状态"组织；远处子场景（港口、行宫）放在同一世界的远处坐标，用页面按钮切换。
- 第一天就建好：无头截图工具 `__shot(state, view, tod)`、启动测试、语法检查。
- 验收门：空城能启动、能切状态、能出截图。

### P5 地形与城市肌理
- 读 `references/05-city-fabric.md`。顺序：地形 → 水系 → 道路 → **先给地标预留地块** → 街区 → 地块 → 房屋 → 填缝。
- 用中央"占地登记表"（footprint registry）防重叠；墙体一律埋到地下、坡地加台基与挡土墙，防留缝。
- 高度、立面、屋顶按时代与阶层定规则（罗马例：民居最多 6 层，临街窄面宽错落，奶油白墙，陶瓦屋顶）。
- 验收门：俯视图无重叠、无悬空；三个距离档的截图通过作者审美。

### P6 核心资产（英雄建筑）
- 读 `references/06-hero-assets.md`。每个核心资产一份任务书（`templates/asset-brief.md`）：书中原文、史料要点、尺寸、
  必须有、不许有、三角面预算、四个固定预览机位。
- 有 Blender MCP 时用"主控 + 工人"循环（主控挑刺，工人改，直到清单全过）；没有时用脚本生成 GLB。
- 验收门：四机位预览全部过清单；放进场景后比例、朝向、台基与地形衔接正确。

### P7 光、天气、季节、夜景
- 读 `references/07-light-weather-time.md`。昼夜关键帧（曝光、日月强度、天空色）平滑插值；季节和天气渐变；
  夜景按时代：古代城市是稀疏的油灯、火把和火盆，不是现代城市的灯海。
- 验收门：清晨、正午、黄昏、夜四张图都通过；雨雾不把画面冲白。

### P8 阅读体验
- 读 `references/08-reader-ux.md`。地名链接（点了飞过去）、背景卡片、自动飞行、**段落触发**、**章节闸门**、
  资源栏（只显示短数字，悬停看详情）、面板分层、全屏阅读、字体选择、小地图与键盘移动。
- 自动标注的链接交给作者在表格里逐条审批。
- 验收门：导入全书后，关键段落都触发了正确的镜头和场景变化。

### P9 质检与发布
- 读 `references/10-pitfalls.md`。每次改动后：语法检查 → 启动测试 → 固定机位截图 → 对照参考图。
- 拆成代码仓库（`references/04-tech-architecture.md` 有目录结构），配自动部署。
- 验收门：作者在真实浏览器里通过。

## 2. 多 agent 分工（详见 `references/09-multi-agent.md`）

| 角色 | 谁来做 | 负责 | 不负责 |
|---|---|---|---|
| 导演 | 作者本人，或顶级模型（如 Claude Fable）代理 | 审美、优先级、拍板、故事事实 | 写代码 |
| 主建造 | Claude Opus | 计划、写代码、整合、截图验证、任务清单 | 改小说原文 |
| 史学顾问 | 另一个模型（如 Gemini） | 挑时代错误、给复原方案和量级 | 未经核实就落地 |
| 文本编辑 | 小说编剧 agent | 原文引语、章节—状态对应、哪些场景要画 | 改模型 |
| 建模工人 | Haiku 子代理（Claude Code + Blender MCP） | 一次建一个资产、出四机位图 | 自己决定验收 |

**规则：任何 agent 的说法进入场景前，都要有出处，并由主建造核实。** 我们遇到过顾问 agent 编造
"列表里有某某项目"的情况；也遇到过顾问对夜景的批评完全正确、采纳后效果更好。不全信，也不全否。

## 3. 二十条铁律

1. 1 单位 = 1 米，原点 = 城市中心地标，x 东 z 南（或你选定的约定），第一天写进文档。
2. 每个数字只有一个出处：设定圣经。HUD 不编数字；书里没有数字就显示一个短词。
3. 每个建筑都要回答："那一年它存在吗？"答不上来就不放。
4. 区分【史】和【书中】，标签和卡片里都写明。
5. 参考图先打分再用；后世模型（如 4 世纪的吉斯蒙迪模型）只借密度与质感，不借建筑清单。
6. 先给地标预留地块，再铺民居；所有生成器共用一张占地登记表。
7. 墙体埋进地下；坡地上的建筑有台基；桥有桥台和坡道；道路遇河断开。
8. 城市密度用参考图量出来，再和"离中心距离曲线"混合。
9. 民居要窄、要错落；避免"八窗宽、六层高"的大方块。
10. 古代城市的颜色：浅色灰泥墙、陶瓦屋顶；后期才逐步出现玻璃窗。
11. 夜景按时代：稀疏油灯、火把、火盆；宅邸外墙暗、内院亮。
12. 核心资产单独成文件（GLB + 生成脚本），用任务书和四机位预览验收。
13. 程序化几何要从多个角度看一遍（山墙三角、背面剔除、屋瓦方向）。
14. 状态粒度不够时，用章节闸门和段落触发，不要硬拆状态。
15. 自动标注要限量（每章同一词最多 2 处）、分场景，并交作者审批。
16. 每次修改后先跑启动测试；一个常量用在定义之前就能让整页起不来。
17. 截图为证。没看到图，就说"还没确认"。
18. 代码早拆模块；单文件超过 1 MB 就该拆。
19. 测试模式关掉重后期（阴影、油画滤镜），否则软件渲染卡死。
20. 让作者在真实浏览器里验收交互（键盘、音频、全屏）；无头浏览器测不出这些。

## 4. 常见坑速查（完整版见 `references/10-pitfalls.md`）

| 症状 | 直接原因 | 一句话修法 |
|---|---|---|
| 一个旧建筑一直压在别的建筑上 | 早期版本的同名生成代码没删 | 在区域里查询实例来源，删旧代码，地标只留一个来源 |
| 房子悬空、平台之间有缝 | 墙底在地面以上 | 墙体向下延伸 20–30 米，坡地加台基 |
| 屋顶下面缺一个三角 | 山墙三角朝内，被背面剔除 | 两面都画，或修正绕序 |
| 城市发黑 | 平顶上的天井画成纯黑方块 | 缩小、改暗棕、只放在大平顶上 |
| 画面发白 | 雾太浓 | 雾密度按距离调；雨天单独调 |
| 整城像工厂 | 地块太大、窗太多太规则 | 大地块拆成约 10 米面宽的窄楼 |
| 时代穿帮 | 参考图是后世的 | 先建"不许出现清单" |
| 页面起不来 | 常量在定义前被读取（TDZ） | 启动测试 + 把数据常量放在使用者之前 |
| 宫殿被做成居民区 | 没从原文推导功能 | 先搜原文写分区表，再建模（14） |
| 最高点后面还有一大截地形 | 地形只有近端边界 | 尖端收成断崖，沿脊线采样检查 |

## 5. 资料少的时代、别的文明、虚构世界

罗马的史料特别多。换成别的时代，流程不变，换的是证据来源：当时人的城市笔记、营造规范、同时代长卷绘画、幸存的同期建筑；
没有直接证据的部分标【推】并写明类比对象；虚构世界先写"风格圣经"和骨架地图。详见 `references/13-other-settings.md`。

## 6. 什么时候读哪个参考文件

- 要从小说整理设定：`references/01-story-bible.md` + `templates/story-bible-template.md`
- 要查史料、做时代过滤：`references/02-history-and-sources.md`、`references/12-sources.md`
- 要找参考图、量密度：`references/03-reference-images.md` + `scripts/density_from_reference.py`
- 要搭技术骨架、拆仓库：`references/04-tech-architecture.md`
- 要铺城市：`references/05-city-fabric.md` + `scripts/footprint.js`
- 要做核心建筑：`references/06-hero-assets.md` + `templates/asset-brief.md`
- 要调光和夜景：`references/07-light-weather-time.md`
- 要做阅读界面：`references/08-reader-ux.md`
- 要组织多个 agent：`references/09-multi-agent.md`
- 要排查问题：`references/10-pitfalls.md` + `scripts/probe_instances.js`
- 想看完整案例：`references/11-case-study-nero-rome.md`
- 资料少、别的文明或虚构世界：`references/13-other-settings.md`
- 一个地方该分成哪些功能区（宫殿、要塞、港口）：`references/14-zoning-from-text.md`
- 多代理花费、哪一步最烧 token、什么时候新开工人：`references/15-token-cost.md`
- 试用 img2threejs（纯代码 three.js 重建）与 Blender 流程的同题对比：`references/16-img2threejs-trial.md`
