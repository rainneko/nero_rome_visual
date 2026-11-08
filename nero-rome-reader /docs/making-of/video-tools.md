# 视频工具备查

作者 2026-10-27 收集的开源工具，对照我们的流程（阅读器录镜头 `tools/video/record.mjs` → 粗剪 `cut.mjs` → 声音
`sounds.mjs` → 旁白）挑过一遍。星数和许可证是 2026-10-27 在 GitHub 上核的。都还**没装**；第三方代码，装之前先读
安装脚本，模型和程序装到外接硬盘（`/Volumes/BackupPlus`），内置盘留给系统。

## 用得上

| 工具 | 用在哪 | 注意 |
|---|---|---|
| [HyperFrames](https://github.com/heygen-com/hyperframes)（HeyGen，7.4 万星，Apache-2.0） | 第 9 段 token 柱状图和 5 张教训卡（计划里本来就写了它）；开发段的数据动画、标题卡 | 要 Node 22+，现在 conda 里是 Node 20，用时在同一个 env 里升级。HTML 写画面，和我们的 puppeteer 录制思路一样，出来的 MP4 直接进 `cut.mjs` |
| [VoiceStudio](https://github.com/debpalash/VoiceStudio)（9.1 万星，AGPL-3.0） | 英文版旁白：克隆作者的声音或设计一个声音；也能做转写（给旁白出时间轴） | 有 macOS `.dmg`，未公证，第一次打开会被 Gatekeeper 拦，按它的文档放行。Mac 上的加速没写清楚，先试一段 |
| [VoxCPM2](https://github.com/OpenBMB/VoxCPM)（面壁，4.1 万星，Apache-2.0） | 中文强：文字描述设计声音、克隆、带时间戳输出。中文旁白作者自录，它可以做试听稿（先听节奏，再录真的） | 官方要求 CUDA；Mac 只能走 CPU 或 llama.cpp-omni 端侧推理，慢，先试 |

B 站用 AI 配音要勾选声明（计划“素材”第 6 条）。

## 可能有用

| 工具 | 用在哪 | 注意 |
|---|---|---|
| [Anatomy](https://github.com/wheresryan22/anatomy)（2.1 万星，MIT） | 小说里机器的等距拆解图：热气球燃烧器、八音盒、高炉。做插图或封面 | 必须照小说原文画，标“小说里”；图里不能出现剧透红线 |
| [youtube-agent-skill](https://github.com/Jakeschincariol/youtube-agent-skill)（3300 星，MIT） | 英文版：开头钩子、标题和封面成对检查、切 Shorts | 只做英文版的参考，中文版的文案还是文案总监定 |
| [motion-graphics-skills](https://github.com/charlie947/motion-graphics-skills)（440 星，MIT） | 开发段的代码动效（终端、提交记录、对比） | 和 HyperFrames 重叠，HyperFrames 不够用再看 |
| [motion-graphics](https://github.com/Barty-Bart/motion-graphics)（890 星，许可证未声明） | 按旁白稿出 B-roll 空镜 | 许可证不明，只借思路 |

## 不需要

| 工具 | 为什么 |
|---|---|
| [YuE2-Studio](https://github.com/timoncool/YuE2-Studio) | 要 NVIDIA 显卡（6 GB 显存），这台 Mac 跑不了；配乐用阅读器的八音盒《卡农》 |
| [Remotion skills](https://github.com/remotion-dev/skills) | 和 HyperFrames 二选一，HyperFrames 不用 React、没有授权费 |
| [claude-motion-design](https://github.com/howseen-ai/claude-motion-design) | HTML + Playwright + ffmpeg，就是我们 `record.mjs` 已经在做的事 |
| [ffmpeg-skill](https://github.com/kajisho5/ffmpeg-skill) | 剪切、字幕、响度、导出 `cut.mjs` 已经做了；按平台批量导出时可以再看 |
