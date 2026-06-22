# Episode Format

`episodes/<slug>/` 存放文案、分镜、来源和配置。

`public/episodes/<slug>/assets/` 存放真实素材，manifest 中的 `path` 必须相对 `public/`。

必需文件：

- `script.md`
- `storyboard.md`
- `assets-needed.md`
- `sources.md`
- `sources.json`
- `asset-manifest.json`
- `episode.json`

Storyboard 状态：

- `DRAFT`
- `APPROVED`
- `IN_PRODUCTION`
- `QC`
- `FINAL`

只有 `APPROVED` 可以进入正式 Producer 阶段。

`episode.json` 使用 Zod strict schema。每个 scene 必须声明 `id`、`start`、`end`、`track`、`kind`、`stageMode`、`slot`、`content`、`assetIds`、`sourceRefIds`、`status`、`notes`。

## Component Demo Episodes

每出现一个进入 `ready` 的新组件，都必须在工程里单独展示。

要求：

- episode 目录使用 `episodes/demo-<component-name-kebab>/`。
- public 素材目录使用 `public/episodes/demo-<component-name-kebab>/assets/`。
- demo 只承担该组件展示任务，不提前展示其他未完成组件。
- 至少覆盖该组件的关键 mode、stageMode 和 slot 组合。
- 必须能执行 `episode:validate`、`episode:frames`、`episode:preview`。
- 使用 placeholder presenter 的 demo 在 strict render 中必须被阻止。

## SectionStamp Scene

`SectionStamp` 不需要素材和来源，`assetIds` 与 `sourceRefIds` 通常为空数组。允许的 `slot` 只有：

- `top-left`
- `top-right`
- `edge-left`
- `edge-right`

`content.props.placement` 必须与 scene 的 `slot` 一致。

## HeadlineTakeover Scene

`HeadlineTakeover` 不需要素材和来源，`assetIds` 与 `sourceRefIds` 通常为空数组。它用于最强观点、结论、反转、关键判断和章节记忆点，不用于普通标题、普通转场、新闻、官网、录屏或数据说明。

Props 结构：

```json
{
  "lines": ["不是模型不够强", "是工作流没搭好"],
  "emphasis": {
    "text": "工作流",
    "color": "orange",
    "mode": "highlight-block"
  },
  "mode": "punch",
  "placement": "left-dominant",
  "alignment": "left"
}
```

mode 限制：

- `punch`：stageMode 可为 `presenter-center`、`presenter-small`、`screen-primary`、`no-presenter`；slot 只能是 `top-left`、`top-right`、`edge-left`、`edge-right`。
- `wrap`：stageMode 只能是 `presenter-center`、`presenter-small`；slot 同 `punch`。
- `takeover`：stageMode 只能是 `no-presenter`、`screen-primary`；slot 只能是 `full-bleed`、`center-overlay`、`screen-primary`。

`allowSubjectOverlay` 默认 `false`，不能用于绕过人物安全区。
