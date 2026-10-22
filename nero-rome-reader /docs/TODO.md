# 待办与进度 · TODO

Keep this file current: every promise made to the author goes here until it is done and checked in the browser.
状态：✅ 完成并在浏览器里看过 · 🔶 做了一半 · ⬜ 未开始 · ⚠️ 需要作者操作

## 部署（作者操作）
* ⚠️ 上传 `dist/` 里的**全部**文件，不只是 `index.html`：`book.js`（全文、目录、上一章/下一章都靠它）、
  `antium-assets.js`（安齐奥模型）、以后还有 `rome-assets.js`（罗马模型）。
* ⚠️ 章节访客计数要先部署 `server/visit-counter/`（Cloudflare Worker + D1，见那里的 README），再把地址填进
  `build.config.json` 的 `"counter"`。

## 第 1–2 轮
* ✅ 安齐奥重做（功能分区、观测塔、花园、两层翼楼、柱廊观景台）
* ✅ 画意滤镜默认关闭；🔶 新增"晶格油画"滤镜 —— 代码在，但控制面板重排时漏掉了按钮（第 4 轮修）
* ✅ 示例摘录加入第一次失败的气球段落
* 🔶 全文阅读（目录、上一章/下一章、记住位置、#ch12 链接）—— 已做；入口不明显，要加"读正文"按钮（第 4 轮）
* ⚠️ 每章不同 IP 访客数 —— Worker 代码已写，等部署

## 第 3 轮
* ✅ 远处海面锯齿条纹：根因是后期渲染目标只有 16 位深度，改成 24 位 + 近裁剪面随视距变化
* ✅ 罗马积木库 `tools/models/rome/rk.py`、21 份任务书 `briefs/rome/`、参考图 `briefs/rome/refs/`
* 🔶 Haiku 工人建模（额度中断，多数停在半路）—— 见下表
* 🔶 `src/scenes/rome/assets.js`（罗马模型按需加载、替身、石材/砖/铺地着色）—— 写好未接入构建
* ⬜ 街道：铺装、路缘、人行道、踏脚石、街角水池与神龛
* ⬜ 帕拉蒂尼山层叠台地与自然地基（作者最满意的方向）

## 第 4 轮（作者反馈）
* ⬜ 不是全换：好的旧模型保留，只换明显不好的；重点是核心区建筑重叠/碰撞、地基太突兀
* ⬜ 帕拉蒂尼山：层叠感（参考 hill_temple_base、villa_noble：喷泉、柱廊、雕像）
* ⬜ 大竞技场：正门细化、贵族看台（皇家包厢 + 元老席）
* ⬜ 两个小跑马场：公共的小跑马场；尼禄的梵蒂冈跑马场（后加看台）+ 他的展厅（第 26 章《石杯》）
* ⬜ 民居：在原有程序化房子上加罗马花纹和外立面细节（不是替换）；GLB 公寓楼作为补充
* ⬜ 提比略宫屋顶没有瓦纹
* ⬜ 部分建筑屋顶中间灰色块（内院）要做完整；绿色"顶棚"改成合理颜色

## 罗马资产（工人）
| 资产 | 状态 |
|---|---|
| rome_castor | 🔶 第一版好；第二轮（马太小、台阶）中断 |
| rome_circus_pulvinar | 🔶 第一版完成，太简单，要按"贵族看台"加细 |
| rome_victoria | 🔶 完成，待审 |
| rome_basilica_aemilia | 🔶 完成，待审 |
| rome_vesta / rome_regia | 🔶 完成，待审 |
| rome_circus_spina | 🔶 完成，待审 |
| rome_basilica_julia | 🔶 快完成时中断 |
| rome_tiberiana, rome_transitoria, rome_apollo, rome_magna_mater, rome_domus_augusti, rome_domus_a/b, rome_divus_julius, rome_arch_augustus, rome_atrium_vestae, rome_divus_augustus, rome_circus_carceres, rome_cavea_s/c, rome_insula_a/b/c, 街道小品, rome_castellum | 🔶 中断，待续 |

## 第4轮中断（额度）
* 所有工人已停；后台 Blender 已全部关闭。脚本都在 tools/models/rome/*.py，已导出的 GLB 在 assets/models/rome/。
* 续做方法：用 SendMessage 给原工人（id 见 scratchpad/workers.md）说"继续"；同时最多开 8 个（内存）。
* 我这边未完成：palatine.js 写好但未接入 monuments.js/构建；街道铺装与内院改动已写未截图验证。

## 第 6 轮（作者反馈）
* 🔶 帕拉蒂尼山要"公共/内廷建筑互相拥挤、层叠、立体"（参考 罗马风格参考/核心行政神殿区规划参考 → briefs/rome/refs/palatine_dense_plan_LATE.png）。
  采纳 Gemini 笔记：图密善大皇宫此时不存在，两山头之间的鞍部塞满被皇室收归的老宅（官署、档案、客房、卫队院）、
  老神庙、尼禄的半地下长廊。不采纳：引水渠终端（尼禄水道支线是 64 年后）、复仇者朱庇特庙（不确定）、弗拉维宫。
  新任务书 briefs/rome/pal_blocks.md（4 种分层官署院落）；Sonnet 负责接入 palatine.js、摆放、长廊、截图。
* 🔶 阿波罗圣域：任务书本来就有达那伊得斯黄柱廊、黑色雕像、双图书馆、太阳战车——这轮让工人逐项核对
* 🔶 卡比托利欧：心智女神与厄律克斯维纳斯神庙及地基、装饰稍降低，旁边楼梯适配（Sonnet）
* 🔶 "轻晶格"：0.5 倍强度的晶格油画（Sonnet）
* 🔶 提比略宫：所有屋顶用瓦；朝广场一侧（卡里古拉扩建）做 2–3 层拱廊台基、坡道、凉廊、带店铺的柱廊
* 工人上限：10 个 Blender + 1 个 Sonnet；排队：cavea_c、castor、basilica_julia、divus_julius/arch、atrium_vestae、divus_augustus
* 待审：street_kit 8 件、梵蒂冈 3 件、trigarium、spina（METAE_X）

### 第 6 轮资产审查结果（renders/ 里的图已看过；尚未放进页面）
| 资产 | 状态 |
|---|---|
| apollo（黄柱廊+黑色达那伊得斯像+双图书馆+太阳战车） | ✅ 审过 |
| tiberiana（第 3 版：7 个不同高度的翼楼、第二内院、屋顶露台；北侧 3 层拱廊台基+坡道+店铺柱廊） | ✅ 审过 |
| transitoria（第 3 版：分翼不同高度、圆顶餐厅、入口门楼、屋顶露台） | ✅ 审过 |
| domus_augusti（第 2 版：空平台填满房间） | ✅ 审过 |
| magna_mater, domus_a/b, pal_block_a–d（新：内廷官署院落） | ✅ 审过 |
| circus_carceres 正门（胜利女神像、拱顶修好）、pulvinar 贵族看台（拱廊台基、紫色天篷） | ✅ 审过 |
| cavea_s/c（弯段要在页面里按 (i+½)·22.5° 旋转拼接） | ✅ 审过 |
| trigarium、vatican 剧场+静室（石杯场景）、马厩、木看台模块 | ✅ 审过 |
| castor（马加大）、basilica_julia、atrium_vestae、divus_augustus、divus_julius、arch_augustus（拱门可穿行） | ✅ 审过 |
| insula_a/b/c、街道小品 8 件 | ✅ 审过 |
| 岩石基座 | ✅ 按靠山神殿参考重做（briefs/rome/rock_and_base.md）：陡峭层叠岩台、节理、苔藓只在顶面成片、墙脚坐在岩石上、D 形宽棱堡+压顶。已重导出并审过：magna_mater、apollo、tiberiana、transitoria、domus_augusti、domus_a/b（现 34×49 m）、victoria、pal_block_a–d。页面里地形与岩脚衔接待 Sonnet 做 |
| 全部放进页面、压缩 GLB、截图验证 | ⬜ Sonnet 第二阶段 |

## 第 6 轮追加（作者反馈）
* ⬜ **道路**：作者"极其不满意"。我截图看了（shots/z_aven.png）：路是等宽、笔直、淡紫灰的平带，白色描边，穿过大片空灰地，像地图示意图。
  重做方案写在 briefs/rome/streets_and_light.md 第 1 节（玄武岩多边形铺石+车辙、抬高的人行道和石缘、过街踏石、
  土路小巷与坡道台阶、宽度和走向有变化、路口小广场+神龛+水池、店铺街的遮阳棚等、空地都有用途、按真实路线命名）。交给 Sonnet 第二阶段，优先。
* 🔶 **神殿太白**：方案在同一文件第 2 节（降低反照率改暖象牙色、烘焙环境光遮蔽、风化与污渍、高光柔和压缩、以后再加彩绘）。
  顶点 AO 烘焙试过（42 个都烤了，在 assets/models/rome_ao/），实测效果很小、文件变大 1.7 倍，不采用；改为高画质下的屏幕空间 AO + 着色器风化。烘焙时发现 bl_kit.gable_roof 山墙三角朝内（页面里材质是双面的，所以看不出来），已在工具里修好，以后导出自动正确。
* 🔶 **尼禄的长廊**：Sonnet 第一版只是屋顶之间一条扁平的褐色带，看不出来。已改为两层可见的长廊：下层半地下拱廊（地面上一排小拱窗），
  上层有柱廊和瓦顶的步道，过巷子处架拱桥，两端拱门进宫。
* ⬜ **街道逻辑（作者 2026-10-22）**：街道应在连续、密集、无植被的建筑区周围自然生成（有植被的地方没有铺装路），
  分三级：白色大理石/石灰华（广场、神庙区、帕拉蒂尼）、灰色石铺（主街、较好街区）、泥路（普通小巷、贫民区、城边）。
  做法写进 briefs/rome/streets_and_light.md 第 1 节（建筑栅格→街道遮罩→分级→地形着色器画铺装、主街再加实体路缘）。Sonnet 第二阶段。
* 🔶 **基座贴合山体**（作者：提比略宫有点悬浮）：Sonnet 写自动悬浮检测（模型外沿采样地形高度），逐个修 y 和地形垫。
* 🔶 **默认开启轻晶格**（测试模式仍关）：Sonnet。
* ⬜ **坡道变阶梯**（作者）：复杂或陡的上坡路变成同级阶梯——大理石路→大理石阶梯，石路→石阶梯；泥路不变阶梯（只用坡道/之字路）。已写进 streets_and_light.md。Sonnet 第二阶段。
* 🔶 **大竞技场正门与看台脱节**：看了三张大跑马场参考——两端有和看台一样高的转角楼（oppidum）把看台断面完全挡住，外立面拱廊绕过转角，顶层廊在它上面收头，正门和转角楼坐在同一个台阶基座上，正门屋顶平台与看台前沿同高；长看台每 100–150 m 有高起的亭楼打断。
  任务书 briefs/rome/circus_end.md；✅ 模型已审过：rome_circus_end_l/_r（9.2k 三角，四面拱窗+红板、朝跑道的官员包厢、屋顶平台+火盆+小塔，看台断面完全挡住，基座 z0）和 rome_cavea_pavilion。对齐数字在 tools/models/rome/rome_circus_end_l.py 顶部（end_l 中心 x −97，看台侧面 x −110，正门侧面 x −84，台面 z 12）。⬜ 页面摆放交给 Sonnet。
* ⬜ **民居外立面花纹概率表**：研究了民居参考（豪华/中等/低收入），写成 briefs/rome/facades.md：取消每层一条的细横线，
  装饰集中在窗户周围、底层和檐口；分三档给出每种装饰的概率（成组拱窗、窗框、红色拱眉、菱形小花纹、檐下彩绘饰带、齿形檐口、木/石阳台、凉廊、店面、遮阳棚、风化露砖等），相邻房子不重复。Sonnet 第二阶段。

### Sonnet 第一阶段结果（已审，2026-10-22）
* ✅ 帕拉蒂尼新布局接入（palatine.js）：18 栋官署院落 GLB 挤满鞍部、两个下沉花园、胜利朱庇特庙、南坡三层柱廊、松柏填空；旧程序化宫殿替换，陶鹰等书中点位保留
* ✅ 卡比托利欧心智女神/厄律克斯维纳斯台地降低 1.3 m，楼梯、水渠重建
* ✅ 轻晶格（0.5 倍）默认开启
* ✅ 岩石基座与地形衔接（tools/pal_rock.mjs 读 GLB 生成岩脚高度）；悬浮检测 window.__floatCheck()：提比略宫等已贴合
* 🔶 尼禄长廊（两层：下层拱窗砖廊、上层多立克柱廊步道+瓦顶）已做，但近景截图拍到墙里，未验证
* 🔶 南/西南坡外圈台地是大片白色弧形墙带，像体育场 —— 第二阶段按岩石与台基规则重做
* 🔶 奥古斯都宫东西两侧、过渡宫北侧仍悬浮 3–5 m
* 🔶 市场遮阳棚有青色/蓝色 —— 改为时代颜色
### Sonnet 第二阶段 a（进行中）：街道重做 → 时代配色 → 放入全部已审 GLB（竞技场、广场、梵蒂冈、跑马场、公寓、街道小品）→ 帕拉蒂尼修正
### 第二阶段 b（之后）：民居外立面概率表、神殿太白、GLB 压缩、构建、文档
