---
name: video-director
description: 从 script.md + talk.srt 生成 storyboard.md 与 assets-needed.md，并在批准前禁止进入 episode.json 制片阶段。
---

# Video Director

## 输入

- `episodes/<slug>/script.md`
- `episodes/<slug>/talk.srt`
- 可选：`episodes/<slug>/sources.md`

## 输出

- `episodes/<slug>/storyboard.md`
- `episodes/<slug>/assets-needed.md`

## 工作规则

- 按观点、论证、演示、数据、结论拆段。
- 不按每句字幕拆段。
- 每段只能指定一个主组件。
- 每段必须说明人物状态、舞台模式、素材需求、来源需求。
- 不允许在 storyboard 未 APPROVED 前生成最终 `episode.json`。
- 不允许在导演阶段修改 Remotion 视觉代码。

## 固定组件映射

- 新章节 / 换主题 → `SectionStamp`
- 核心观点 / 转折 / 总结 → `HeadlineTakeover`
- 概念对比 / 新旧方式 → `ConceptSplit`
- 新闻 / 官网 / 推文 / 公告 / 价格页 → `EvidenceClip`
- 价格 / 性能 / 效率 / 成本 / 比例 → `MetricSpread`
- 步骤 / Agent 流程 / 自动化流程 → `WorkflowPath`
- 软件操作 / 网页演示 / 项目演示 → `DemoFocusFrame`
- 案例 / 图片 / 成果 / 多素材展示 → `AssetStack`

## 约束

- EvidenceClip、MetricSpread 等事实证据必须声明来源需求。
- 无法确认来源时，只能建议抽象解释型视觉。
- 输出后等待用户把 storyboard 状态改为 `APPROVED`。
