# Video Pipeline Overview

这是一个面向 AI 科普、AI 工具讲解、Codex/Remotion 工作流、案例展示的视频生产工程。

每期实际操作：

1. 在剪映完成基础口播剪辑。
2. 新建 `episodes/<slug>/`。
3. 把最终口播视频放到 `episodes/<slug>/talk.mp4`。
4. 把与最终视频精确对应的字幕放到 `episodes/<slug>/talk.srt`。
5. 写 `episodes/<slug>/script.md`。
   - 可以使用 Obsidian 的 `![[素材文件名.png|宽度]]` 写法。
   - 被引用的素材文件放到 `episodes/<slug>/assets/`。
6. 调用 `video-director` 生成 `storyboard.md` 与 `assets-needed.md`。
7. 补 high 优先级素材、来源链接、录屏。
8. 把 storyboard 状态改为 `APPROVED`。
9. 调用 `video-producer`。
10. 查看关键帧联系表。
11. 修改有问题镜头。
12. 查看低清预览。
13. 通过 QC 后再高清 render。
14. 复盘是否需要新增正式组件。

核心原则：先规划，再确认素材，再进入 `episode.json`，最后才渲染。
