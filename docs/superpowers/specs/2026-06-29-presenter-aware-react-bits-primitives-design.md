# C28-C30 口播镜头适配设计

## 目标

让 C28 `SemanticTextReveal`、C29 `FocusReticle` 和 C30 `PixelReveal` 在口播视频中通过 C27 `ShotDirector` 获得明确的镜头语义：

- C28/C29 出现时，人物必须位于左侧或右侧，组件位于人物对侧。
- C28/C29 不做人物安全区裁切，也不允许直接覆盖居中人物。
- C30 作为短时内容接管，可以覆盖人物；完成揭示后必须保留 1-2 秒完整内容阅读时间，再恢复人物画面。
- 所有正文继续避开字幕安全区。

## 镜头数据模型

为 C27 shot 增加可选字段：

```ts
sidecarId?: string;
```

`sidecarId` 专门承载人物对侧的视觉组件，与 `contentId`、`summaryId` 分离，避免继续复用语义不匹配的字段。

约束：

- `sidecarId` 只允许出现在 `speaker-left`、`speaker-right`。
- `speaker-left` 时，sidecar scene 必须使用 `edge-right` 或 `top-right`。
- `speaker-right` 时，sidecar scene 必须使用 `edge-left` 或 `top-left`。
- `sidecarId` 可引用 C28、C29，以及内部复用它们的 C16、C21、C23-C26。
- 同一个 shot 不允许同时设置 `sidecarId` 与 `contentId`，确保一段口播只有一个主要视觉任务。
- `talk`、`push-in` 不允许使用 `sidecarId`。

## C28/C29 行为

### C28

- 有人物时只能通过 C27 `sidecarId` 渲染。
- 人物在左时进入右侧 slot；人物在右时进入左侧 slot。
- C28 本体继续只负责文字切分和逐帧动效，不读取人物坐标、不裁切文字。
- `no-presenter` 下允许继续作为普通内容组件使用。

### C29

- 与 C28 使用同一 sidecar 规则。
- target 坐标相对于 sidecar slot，而不是全画布。
- 不使用 `getBoundingClientRect()`；调用组件继续提供固定目标矩形。
- 人物侧和组件侧由 C27 决定，C29 本体不裁切角标。

### 非法配置

预览验证遇到以下情况时给出 blocking issue：

- 有人物但 C28/C29 未被任何 `sidecarId` 引用。
- shot mode 不是 `speaker-left/right` 却配置 `sidecarId`。
- sidecar slot 与人物方向相同。
- `sidecarId` 与 `contentId` 同时存在。

正式渲染不尝试自动猜测方向或修复坐标。

## C30 内容接管

C30 继续通过 C27 `contentId` 在 `content-full` 中使用，允许完整覆盖人物。

默认时间结构（30fps）：

1. 像素揭示：24 帧。
2. 完整内容停留：45 帧。
3. 恢复人物镜头：12 帧。
4. 总视觉接管：81 帧，约 2.7 秒。

其中 C30 shot 本身至少持续 69 帧（揭示 24 + 停留 45）；后续 shot 用 12 帧完成内容退出和人物恢复。若没有后续人物 shot，验证应提示缺少恢复镜头。

C30 约束：

- 可以覆盖人物安全区。
- 不得覆盖字幕安全区；字幕继续由 C27 顶层字幕层承载。
- 每个内容接管 shot 最多使用一次 C30。
- C30 只用于证据、数据状态或关键内容，不作为普通装饰频繁触发。
- 来源校验仍由被揭示的证据组件负责，C30 不绕过来源要求。

## 渲染架构

`ShotTimelineDirector` 增加 sidecar scene 查找，并将其作为独立 `sidecarLayer` 传给 `ShotDirector`。

`ShotDirector` 的层级顺序：

1. 内容接管层（C30 / content）。
2. 人物视频层。
3. 对侧 sidecar 层（C28/C29 或摘要组件）。
4. 字幕层。

sidecar 层只在 `speaker-left/right` 激活，使用 scene 已配置的对侧 slot。切换顺序为：

1. 人物先向左或右让位。
2. 约 5 帧后 sidecar 入场。
3. sidecar 退场后人物再回到居中镜头。

C30 内容接管保持内容层位于人物层上方；揭示完成后保持静态内容 45 帧，再由下一 shot 恢复人物。

## Studio Demo

- C28 Demo：增加 `speaker-left` 与 `speaker-right` 两段，文字始终位于人物对侧。
- C29 Demo：增加同样的左右人物占位与焦点迁移。
- C30 Demo：展示 24 帧揭示、45 帧完整停留、12 帧恢复人物的完整节奏。
- 独立原语细节 Demo 可以保留，但必须新增口播镜头适配 Demo，避免只验证无人物全屏画面。

## 验证

新增或更新测试覆盖：

- `sidecarId` 的合法 shot mode。
- sidecar slot 与人物方向的对应关系。
- `sidecarId` 与 `contentId` 互斥。
- C28/C29 有人物时必须由 C27 sidecar 引用。
- C30 `content-full` shot 至少 69 帧，并存在后续恢复人物 shot。
- C30 24 帧后完全揭示，同一帧重复渲染一致。

关键帧 QC：

- C28/C29：人物完成让位、sidecar 入场中段、稳定态。
- C30：遮挡态、24 帧揭示完成态、45 帧停留末端、人物恢复态。
- 所有状态检查字幕安全区。

不进行深度测试，不导出视频；只运行相关测试、typecheck、lint、关键帧静态 QC，并启动 Studio 等待用户确认。
