# Video Pipeline Overview

这是一个面向 AI 科普、AI 工具讲解、Codex/Remotion 工作流、案例展示的视频生产工程。

每期实际操作：

1. 在剪映完成基础口播剪辑。
2. 导出最终 `talk.mp4`。
3. 导出与最终视频精确对应的 `talk.srt`。
4. 写 `script.md`。
5. 调用 `video-director` 生成 `storyboard.md` 与 `assets-needed.md`。
6. 补 high 优先级素材、来源链接、录屏。
7. 把 storyboard 状态改为 `APPROVED`。
8. 调用 `video-producer`。
9. 查看关键帧联系表。
10. 修改有问题镜头。
11. 查看低清预览。
12. 通过 QC 后再高清 render。
13. 复盘是否需要新增正式组件。

核心原则：先规划，再确认素材，再进入 `episode.json`，最后才渲染。
