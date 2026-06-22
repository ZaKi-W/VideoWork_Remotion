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

## SectionStamp Scene

`SectionStamp` 不需要素材和来源，`assetIds` 与 `sourceRefIds` 通常为空数组。允许的 `slot` 只有：

- `top-left`
- `top-right`
- `edge-left`
- `edge-right`

`content.props.placement` 必须与 scene 的 `slot` 一致。
