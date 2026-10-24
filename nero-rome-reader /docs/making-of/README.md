# making-of · 幕后（本项目的说明材料）

这里是《尼禄重工纪元》罗马沙盘**这个项目**的幕后材料，给技术博客和视频用。
做法本身（适用于任何小说的流程、预算规则、工具）在 skill `novel2city/` 里。这里只放罗马的具体数字和故事。

| 文件 | 内容 |
|---|---|
| `token-ledger.md` | 实测 token 账本：总量、按阶段、每个资产、道路等大项、结论 |
| `data/agents.csv` | 每个 agent 一行：模型、任务、调用次数、缓存读写、输出、最长上下文 |
| `data/phases.csv` | 按每次新指令切段，续用的 agent 会有多段。含指令开头的原文摘录，公开前请检查 |
| `video-plan.md` | 视频结构、资产特写、待补拍素材、竖版、标题候选 |
| `blog-outline.md` | 博客提纲：第一天、两周花费、多 agent、分析、规则、局限 |

* 重新生成两个 CSV：`python3 novel2city/scripts/token_ledger.py <会话.jsonl> "nero-rome-reader /docs/making-of/data"`
* 第一天的版本：`novel2city/examples/rome-day1.html`（单文件，浏览器直接打开）
* 前后对比图在 `../../shots/`，模型渲染在 `../../renders/`。这两个目录不进 git，发布前把用到的图复制出来。
* 完整代码：https://github.com/rainneko/nero_rome_visual
