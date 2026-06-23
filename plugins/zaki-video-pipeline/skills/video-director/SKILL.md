---
name: video-director
description: 从 script.md + talk.srt 生成 storyboard.md 与 assets-needed.md，并在批准前禁止进入 episode.json 制片阶段。
---

# Video Director

## 输入

- `episodes/<slug>/script.md`
- `episodes/<slug>/talk.srt`
- `episodes/<slug>/talk.mp4`
- `episodes/<slug>/assets/`，用于存放 `script.md` 中 Obsidian `![[...]]` 引用的素材文件
- 可选：`episodes/<slug>/sources.md`

## 输出

- `episodes/<slug>/storyboard.md`
- `episodes/<slug>/assets-needed.md`

## 工作规则

- 按观点、论证、演示、数据、结论拆段。
- 识别 `script.md` 中的 Obsidian 素材引用，例如 `![[Pasted image 20260522160436.png|574]]`；素材文件名是 `|` 前面的部分，并应存在于 `episodes/<slug>/assets/`。
- 不按每句字幕拆段。
- 每段只能指定一个主组件。
- 每段必须说明人物状态、舞台模式、素材需求、来源需求。
- 不允许在 storyboard 未 APPROVED 前生成最终 `episode.json`。
- 不允许在导演阶段修改 Remotion 视觉代码。

## 固定组件映射

- 普通口播提要 / 轻量观点提示 → `NarrationEchoLayer`

## 约束

- 无法确认来源时，只能建议抽象解释型视觉。
- 输出后等待用户把 storyboard 状态改为 `APPROVED`。
