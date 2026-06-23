# Episode Format

`episodes/<slug>/` 存放本期所有人工输入、分镜、来源和配置。

推荐输入结构：

```text
episodes/<slug>/
  talk.mp4
  talk.srt
  script.md
  assets/
    Pasted image 20260522160436.png
```

`script.md` 可以是纯口播文案，不要求一定出现素材。需要展示截图、录屏或图片时，可以保留 Obsidian 嵌入素材写法，例如 `![[Pasted image 20260522160436.png|574]]`。脚本会提取 `|` 前面的文件名，并检查它是否存在于 `assets/`；没有 `![[...]]` 时视为本期没有脚本指定素材。

渲染脚本会自动把 `episodes/<slug>/assets/` 镜像到 `public/episodes/<slug>/assets/`，供 Remotion 的 `staticFile()` 使用。不要手动维护 public 里的镜像文件。

`asset-manifest.json` 中的 `path` 仍然使用相对 `public/` 的路径，例如 `episodes/<slug>/assets/Pasted image 20260522160436.png`。

必需文件：

- `script.md`
- `talk.mp4`
- `talk.srt`
- `assets/`
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
- 素材目录使用 `episodes/demo-<component-name-kebab>/assets/`。
- demo 只承担该组件展示任务，不提前展示其他未完成组件。
- 至少覆盖该组件的关键 mode、stageMode 和 slot 组合。
- 必须能执行 `episode:validate`、`episode:frames`、`episode:preview`。
- 使用 placeholder presenter 的 demo 在 strict render 中必须被阻止。

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

1. 截图放到 `episodes/<slug>/assets/`，并在 `script.md` 中用 Obsidian 写法引用。
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
