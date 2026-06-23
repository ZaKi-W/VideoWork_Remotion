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

## ConceptSplit Scene

`ConceptSplit` 不需要素材和来源，`assetIds` 与 `sourceRefIds` 通常为空数组。它用于解释两个概念、两种方式、两个阶段之间的差异。

Props 示例：

```json
{
  "mode": "cross-cut",
  "relationship": "from-to",
  "anchor": "right-heavy",
  "accent": "blue",
  "emphasize": "right",
  "left": {
    "eyebrow": "旧方式",
    "title": "聊天",
    "description": "问一句，答一句"
  },
  "right": {
    "eyebrow": "新方式",
    "title": "执行",
    "description": "读文件、改文件、交付任务"
  },
  "bridge": {
    "label": "从对话到执行",
    "style": "arrow"
  },
  "showDivider": true
}
```

限制：

- `mode` 只支持 `cross-cut`、`editorial-fold`、`handoff`。
- `relationship` 只支持 `versus`、`from-to`、`not-but`。
- `left.title` 和 `right.title` 必填，最长 18 个字符，最多两行。
- `description` 最长 34 个字符。
- `points` 最多 2 条，每条最长 18 个字符。
- `bridge.label` 最长 12 个字符。
- `cross-cut` 可用 `presenter-center`、`presenter-small`、`screen-primary`、`no-presenter`；slot 只能是 `top-left`、`top-right`、`edge-left`、`edge-right`。
- `editorial-fold` 只允许 `no-presenter`、`screen-primary`；slot 只能是 `full-bleed`、`screen-primary`。
- `handoff` 只允许 `presenter-small`、`screen-primary`、`no-presenter`；slot 只能是 `edge-left`、`edge-right`、`screen-primary`。
- 人物居中时不得进入人物安全区；所有模式下正文信息不得进入字幕安全区。

## EvidenceClip Scene

`EvidenceClip` 必须同时引用素材和来源。`assetIds` 必须包含 `content.props.assetId`，`sourceRefIds` 必须包含 `content.props.sourceRefId`。

Props 示例：

```json
{
  "assetId": "official-announcement-crop",
  "sourceRefId": "source-official-announcement",
  "variant": "clipping",
  "placement": "top-right",
  "crop": {
    "fit": "cover",
    "focalPoint": {"x": 0.54, "y": 0.58},
    "aspectRatio": "16:9"
  },
  "headline": "官方说明里最关键的是这一句",
  "highlights": [
    {"kind": "marker", "x": 0.08, "y": 0.54, "width": 0.74, "height": 0.12, "color": "orange"}
  ],
  "annotations": [
    {"text": "这里决定了实际能力边界", "x": 0.58, "y": 0.54, "side": "left"}
  ],
  "showReferenceStrip": true
}
```

素材准备：

1. 截图放到 `public/episodes/<slug>/assets/screenshots/`。
2. 在 `asset-manifest.json` 登记 `assetId`、`type`、`path`、`sourceRefId`、`purpose`、`sceneHints`。
3. 在 `sources.json` 登记 `sourceRefId`、`title`、`publisher`、`url`、`publishedAt`、`status`。
4. 在 `episode.json` 用 `assetId + sourceRefId` 引用素材。

限制：

- `clipping` slot 只能是 `top-left`、`top-right`、`edge-left`、`edge-right`。
- `spotlight` slot 只能是 `screen-primary`、`full-bleed`。
- `full-bleed` spotlight 只允许 `no-presenter`。
- strict render 来源状态必须是 `captured` 或 `verified`。
- strict render 不允许 `generated` 证据素材。

## MetricSpread Scene

`MetricSpread` 不需要素材，但必须引用来源。`sourceRefIds` 必须包含 `content.props.sourceRefId`。

Props 示例：

```json
{
  "variant": "delta-ledger",
  "placement": "top-left",
  "accent": "orange",
  "primary": {
    "value": "75%",
    "label": "成本下降",
    "direction": "down"
  },
  "rows": [
    {"label": "缓存命中", "before": "¥0.103", "after": "¥0.026", "delta": "-75%", "emphasis": "after"},
    {"label": "输出价格", "before": "¥24.71", "after": "¥6.18", "delta": "-75%", "emphasis": "delta"}
  ],
  "sourceRefId": "source-official-pricing",
  "sourceLabel": "OFFICIAL PRICING",
  "note": "按官方价格页计算",
  "showRatioBar": true
}
```

限制：

- `variant` 目前只支持 `delta-ledger`。
- `rows` 最少 1 行，最多 4 行。
- 每行必须至少提供 `before`、`after`、`delta` 中的一项。
- `presenter-center` 只能使用 `top-left`、`edge-left`。
- `MetricSpread` 不支持右侧 slot，避免人物右侧形成拥挤的数据侧栏。
- `screen-primary` 只允许 `presenter-small`、`screen-primary`、`no-presenter`。
- strict render 来源状态必须是 `captured` 或 `verified`。
- `kind: "demo"` 的 source 只允许 preview。
