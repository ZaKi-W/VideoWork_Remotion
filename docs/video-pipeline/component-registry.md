# Component Registry

注册表位置：`src/editorial/registry/component-registry.ts`。

每个组件声明：

- 组件名称。
- 用途。
- 允许的舞台模式。
- 允许的 slot。
- 是否要求来源。
- 实现状态：`planned`、`prototype`、`ready`。
- Props schema。
- renderer。

当前保留组件：

- `EvidenceClip`
- `MetricSpread`
- `NarrationEchoLayer`
- `TalkVideoBase`
- `RemotionTalkEffect`
- Acid 系列全屏组件
- `WorkflowPath`
- `DemoFocusFrame`
- `AssetStack`

Strict render 规则：

- planned 组件阻止高清渲染。
- prototype 组件阻止高清渲染。
- `EvidenceClip` 必须有有效 `assetId` 与 `sourceRefId`。
- `MetricSpread` 必须有有效 `sourceRefId`。
- strict render 中证据/数据来源状态必须是 `captured` 或 `verified`。
- `TalkVideoBase` 只作为本地口播视频、音频和字幕承载层。
- `RemotionTalkEffect` 是 `RemotionTalk` 的一次性 episode 组件，不进入公共组件库。
