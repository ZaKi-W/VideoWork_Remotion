# Visual System

视觉体系名称：白底科技编辑部 / AI 纸面实验室。

原则：

- 白墙实拍人物与纸白资料底保持统一。
- 人物居中时，普通信息不得进入人物安全区。
- 所有正文信息不得进入字幕安全区。
- 没有可靠来源时，只使用抽象解释型视觉，不伪造证据。
- 公共组件必须至少预计复用两次；一次性效果留在具体 episode 内。

当前保留的通用视觉组件：

- `EvidenceClip`：有来源截图/图片/图表时使用，必须绑定 `assetId` 与 `sourceRefId`。
- `MetricSpread`：有来源数据时使用，必须绑定 `sourceRefId`。
- `NarrationEchoLayer`：普通口播的左侧提要式短句层，保留。
- `TalkVideoBase`：口播视频、音频和 SRT 字幕底层。
- Acid 系列全屏组件：仅用于已经沉淀为可复用风格的全屏主题视觉。

本期一次性视觉：

- `RemotionTalkEffect` 仅服务 `episodes/RemotionTalk/`，不进入公共组件库。
