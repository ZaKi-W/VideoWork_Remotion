# Component Registry

注册表位置：`src/editorial/registry/component-registry.ts`。

组件编号位置：`src/editorial/registry/component-catalog.ts`。

Remotion Studio 左侧 Composition 规则：每个组件必须有一个可直接打开的编号 demo，命名为 `Cxx-ComponentName`。以后沟通组件优先使用编号，例如 `C16` 指 `NarrationEchoLayer`。底层预览项不是组件，不使用 `C` 前缀。

所有新增组件必须：

- 分配稳定编号，写入 `src/editorial/registry/component-catalog.ts`。
- 注册到 Remotion Studio 左侧 Composition 菜单。
- 提供可直接打开查看的 demo。
- 组件级修改必须改组件本体，确保所有使用处同步生效；只改 episode 配置只适用于用户明确要求的单期特例。

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

- Acid 系列全屏组件
- `NarrationEchoLayer`
- `RemotionTalkEffect`

## Component Codes

| 编号 | 组件 |
| --- | --- |
| C01 | `MediaWall` |
| C02 | `Countdown` |
| C03 | `ChapterIndex` |
| C04 | `CountryGap` |
| C05 | `ReleaseTimeline` |
| C06 | `StatsBoard` |
| C07 | `Ecosystem` |
| C08 | `OpenSourceWave` |
| C09 | `MapFocus` |
| C10 | `TimeGap` |
| C11 | `PricePage` |
| C12 | `TokenBoard` |
| C13 | `AgentExecution` |
| C16 | `NarrationEchoLayer` |
| C21 | `RemotionTalkEffect` |

## System Preview

| 标记 | 项 |
| --- | --- |
| BASE | `TalkVideoBase` |

Strict render 规则：

- planned 组件阻止高清渲染。
- prototype 组件阻止高清渲染。
- strict render 中证据/数据来源状态必须是 `captured` 或 `verified`。
- `TalkVideoBase` 只作为本地口播视频、音频和字幕承载层，不视为组件，不使用 `C` 编号。
- `RemotionTalkEffect` 是 `RemotionTalk` 的一次性 episode 组件，不进入公共组件库。
