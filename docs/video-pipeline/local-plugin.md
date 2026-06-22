# Local Plugin

本地插件目录：

```text
plugins/zaki-video-pipeline/
```

本地 marketplace：

```text
.agents/plugins/marketplace.json
```

重新加载方式：

1. 在 Codex 中重新打开当前工作区，或触发插件/Skills 列表刷新。
2. 确认插件名 `zaki-video-pipeline` 出现在本地插件来源中。
3. 在 Skills 列表中确认以下三个 Skill 可用：
   - `video-director`
   - `video-producer`
   - `video-qc`

后续调用：

- 需要从 `script.md + talk.srt` 生成分镜和素材清单时，调用 `video-director`。
- storyboard 已 `APPROVED` 后，调用 `video-producer`。
- 查看关键帧和低清预览后，调用 `video-qc`。
