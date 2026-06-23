# Episode Format

`episodes/<slug>/` 存放本期所有人工输入、分镜、来源和配置。

推荐输入结构：

```text
episodes/<slug>/
  talk.mp4
  talk.srt
  script.md
  assets/
```

`script.md` 可以是纯口播文案，不要求一定出现素材。需要展示截图、录屏或图片时，可以保留 Obsidian 嵌入素材写法，例如 `![[Pasted image 20260522160436.png|574]]`。脚本会提取 `|` 前面的文件名，并检查它是否存在于 `assets/`；没有 `![[...]]` 时视为本期没有脚本指定素材。

渲染脚本会自动把 `episodes/<slug>/assets/` 镜像到 `public/episodes/<slug>/assets/`，供 Remotion 的 `staticFile()` 使用。不要手动维护 public 里的镜像文件。

`asset-manifest.json` 中的 `path` 仍然使用相对 `public/` 的路径，例如 `episodes/<slug>/assets/example.png`。

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
