# Component and Shot Layout Guide

这份文档用于写稿、分镜和配置 `episode.json`。每次新增、删除或修改组件的表现、样式、动效、布局、props、编号或可用位置时，都必须同步更新本文档。

## 写稿时先选视觉任务

一段口播只承担一个主要视觉任务。先判断这段要做什么，再选组件：

- 讲事实证据、数据、发布时间、价格、成本、对比：优先使用 C01-C13 的全屏 Acid 组件。
- 讲观点、转折、结论、提要：优先使用 C16、C21、C23-C26 的口播摘要组件。
- 只是承载口播视频、音频和字幕：使用 BASE `TalkVideoBase`。
- 需要切换人物和内容区域：使用 C27 `ShotDirector` 的 `shots` 镜头布局系统。
- 需要在现有标题或摘要中复用逐词、逐字或焦点迁移文字动效：使用 C28 `SemanticTextReveal` 视觉原语。
- 需要在列表项、卡片或关键词之间移动 HUD 焦点：使用 C29 `FocusReticle` 视觉原语。
- 需要确定性地揭示证据、数据状态或内容区域：使用 C30 `PixelReveal` 视觉原语。

证据类组件不得伪造来源。`requiresSource: true` 的组件必须绑定 `sourceRefIds`，其画面中的 `source.sourceRefId` 应能追溯到 `sources.json`。

## Scene 基础字段

每个 scene 都必须写：

```json
{
  "id": "scene-id",
  "start": 0,
  "end": 6,
  "track": "primary",
  "kind": "TrendBanner",
  "stageMode": "presenter-center",
  "slot": "edge-left",
  "content": {"kind": "TrendBanner", "props": {}},
  "assetIds": [],
  "sourceRefIds": [],
  "status": "ready",
  "notes": ""
}
```

字段含义：

| 字段 | 可用值 / 要求 |
| --- | --- |
| `id` | 稳定唯一 ID，供 `shots.contentId` / `shots.summaryId` 引用 |
| `start` / `end` | 秒，`end` 必须大于 `start` |
| `track` | `primary`、`annotation`、`background`、`overlay` |
| `kind` | 必须与 `content.kind` 一致 |
| `stageMode` | `presenter-center`、`presenter-small`、`screen-primary`、`no-presenter` |
| `slot` | 见下方 Stage Slot |
| `assetIds` | 引用 `asset-manifest.json` 中的素材 ID |
| `sourceRefIds` | 引用 `sources.json` 中的来源 ID |
| `status` | `draft`、`approved`、`ready`、`needs-assets` |

## Stage Slot

`getStageLayout(width, height)` 会根据画布尺寸生成安全区与组件槽位。1920x1080 下可按比例理解：

| slot | 位置与用途 |
| --- | --- |
| `full-bleed` | 全画布，适合全屏主视觉、口播底层 |
| `screen-primary` | 上方主屏区域，适合屏幕内容 |
| `center-overlay` | 中央覆盖层，当前少用 |
| `top-left` / `top-right` | 上角轻量标注，避开人物和字幕 |
| `edge-left` / `edge-right` | 左右侧主要摘要区，口播时最常用 |
| `bottom-left` / `bottom-right` | 底部槽位，当前不建议正文使用，容易接近字幕安全区 |

舞台模式允许的 slot：

| stageMode | 可用 slot |
| --- | --- |
| `presenter-center` | `top-left`、`top-right`、`edge-left`、`edge-right` |
| `presenter-small` | `screen-primary`、`top-left`、`top-right`、`edge-left`、`edge-right` |
| `screen-primary` | `screen-primary`、`top-left`、`top-right`、`edge-left`、`edge-right` |
| `no-presenter` | `full-bleed`、`screen-primary`、`center-overlay`、`top-left`、`top-right`、`edge-left`、`edge-right` |

人物居中时，普通组件不能进入 `presenterSafeZone`。所有模式下，正文信息不能进入 `subtitleSafeZone`。全屏 Acid 组件和 `TalkVideoBase` 是特殊画布层，但仍需在画面设计上给字幕留空间。

## 通用 Props

### AcidComponent props

C01-C13 共用 `acidComponentPropsSchema`，不同组件会读取其中不同字段。

| 字段 | 类型 / 限制 | 用途 |
| --- | --- | --- |
| `topic` | string，1-44，可选 | 左上角主题线 |
| `topicDetail` | string，1-44，可选 | 主题线右侧补充 |
| `eyebrow` | string，1-44，可选 | 小标题 / 标签 |
| `title` | string[]，1-3 行，每行 1-14 | 主标题 |
| `copy` | string，1-90，可选 | 正文补充 |
| `subtitle` | string，1-56，必填 | 底部字幕式解释 |
| `subtitleEn` | string，1-90，可选 | 英文辅助字幕 |
| `primaryValue` | string，1-16，可选 | 大数字 / 主数值 |
| `primaryUnit` | string，1-12，可选 | 单位 |
| `caption` | string，1-18，可选 | 大数字下方说明 |
| `items` | array，最多 8 | 列表、指标、时间线、条形图等 |
| `source` | object，可选 | 右侧来源卡 |
| `messages` | array，最多 6 | Agent 对话气泡 |
| `mediaCount` | integer，12-60，默认 48 | MediaWall 网格数量 |
| `scrimIntensity` | `none`、`soft`、`medium`，默认 `soft` | 左侧暗化强度 |
| `backgroundVideoPath` | string，1-160，可选 | 背景视频路径 |

`items` 每项：

| 字段 | 类型 / 限制 |
| --- | --- |
| `label` | string，1-24，必填 |
| `value` | string，1-20，可选 |
| `detail` | string，1-44，可选 |
| `percent` | number，0-100，可选，用于条形图 |

`source` 每项：

| 字段 | 类型 / 限制 |
| --- | --- |
| `label` | string，1-36，可选 |
| `code` | string，1-10，可选 |
| `meta` | string，1-48，可选 |
| `title` | string，1-64，可选 |
| `highlight` | string，1-80，可选 |
| `footer` | string，1-32，可选 |
| `assetId` | string，可选，指向截图/图片资产 |
| `sourceRefId` | string，可选，指向来源记录 |

`messages` 每项：`speaker` 为 `me` 或 `agent`，`text` 为 1-64 字符。

### SummaryComponent props

C23-C26 共用 `summaryComponentPropsSchema`。

| 字段 | 类型 / 限制 | 用途 |
| --- | --- | --- |
| `kicker` | string，1-24，可选 | 顶部短标签 |
| `label` | string，1-24，可选 | 英文/短标识 |
| `title` | string[]，1-3 行，每行 1-18 | 主标题 |
| `copy` | string，1-90，可选 | 补充解释 |
| `foot` | string，1-24，可选 | 脚注，不得用灰色弱化 |
| `index` | string，1-6，可选 | 序号，主要给 C26 |
| `emphasis` | string，1-12，可选 | 标题中需要高亮的词 |
| `focus` | string，1-18，可选 | 焦点标签，主要给 C26 |
| `tail` | string，1-28，可选 | 尾句，主要给 C26 |
| `blocks` | array，最多 3 | 卡片块，主要给 C25 |
| `accent` | `acid`、`blue`、`yellow`、`orange`、`red`、`cyan`，默认 `acid` | 强调色 |

`blocks` 每项：`label` 1-18，`title` 1-22，`icon` 最多 2 字符，可选，`accent` 可选。

## 组件清单

### C01 MediaWall

- Composition: `C01-MediaWall`
- 类型：全屏 Acid 主视觉
- 用途：素材墙 / 多来源素材概览。适合“信息很多、材料扑面而来”的开场或转场。
- 展现：全屏 12x5 风格网格，中间叠大标题，酸绿色 eyebrow。
- 允许：`stageMode: no-presenter`，`slot: full-bleed`
- 来源：不强制，但真实素材墙建议绑定来源。
- 关键 props：`title`、`eyebrow`、`subtitle`、`mediaCount`、`topic`、`topicDetail`、`backgroundVideoPath`
- 写稿提示：不要写成数据证据；它更像“材料规模感”。

### C02 Countdown

- Composition: `C02-Countdown`
- 类型：全屏 Acid 主视觉
- 用途：时间冲击 / 大数字倒计时。
- 展现：左侧标题和大数字，右侧有巨大年份视觉。
- 允许：`stageMode: no-presenter`，`slot: full-bleed`
- 来源：不强制。
- 关键 props：`eyebrow`、`title`、`primaryValue`、`primaryUnit`、`copy`、`subtitle`
- 默认兜底：`primaryValue: "90"`，`primaryUnit: "DAYS"`

### C03 ChapterIndex

- Composition: `C03-ChapterIndex`
- 类型：全屏 Acid 主视觉
- 用途：章节索引 / 分段目录。
- 展现：全屏人像安全区绝对净空（中轴 35%-65% 区域无元素干扰）。左右两侧信息区 100% 透明无遮挡悬浮。左侧为优雅的 2px 垂直生长轨线，文字配备 360 度 1px 黑色超细描边轮廓（在任何复杂/亮底视频上均字字锐利不发虚），并仅为当前激活章节渲染一个极窄（260px宽）的半透明小插槽进行局部提亮。最右侧边缘悬浮展示超细刻度进度尺与带描边游标，专为口播场景定制。
- 允许：`stageMode: no-presenter`，`slot: full-bleed`
- 来源：不强制。
- 关键 props：`eyebrow`、`title`、`items[].label`、`items[].detail`、`subtitle`
- 写稿提示：适合“接下来讲三点”，不要塞长段正文。

### C04 CountryGap

- Composition: `C04-CountryGap`
- 类型：全屏 Acid 主视觉
- 用途：国家对比 / 阵营差距。
- 展现：左侧两个大对比卡，下面 logo/tag 条。
- 允许：`stageMode: no-presenter`，`slot: full-bleed`
- 来源：不强制，但涉及现实国家数据时必须绑定来源。
- 关键 props：`title`、`items[0..1].label/value/detail`、`items[2..].label`、`subtitle`

### C05 ReleaseTimeline

- Composition: `C05-ReleaseTimeline`
- 类型：全屏 Acid 证据/时间线
- 用途：发布时间线 / 版本节奏。
- 展现：左侧标题，下方纵向时间线。
- 揭示：内容首次出现时使用一次 C30 确定性像素揭示，来源校验、文字和时间线数据保持不变。
- 允许：`stageMode: no-presenter`，`slot: full-bleed`
- 来源：强制 `sourceRefIds`
- 关键 props：`eyebrow`、`title`、`items[].label` 作为时间、`items[].value` 作为事件、`items[].detail` 作为说明、`source`、`subtitle`

### C06 StatsBoard

- Composition: `C06-StatsBoard`
- 类型：全屏 Acid 证据/数据面板
- 用途：指标板 / benchmark 面板。
- 展现：左侧三条指标卡 + 后续条形图。
- 揭示：内容首次出现时使用一次 C30 确定性像素揭示，不改变指标和来源表达。
- 允许：`stageMode: no-presenter`，`slot: full-bleed`
- 来源：强制 `sourceRefIds`
- 关键 props：`eyebrow`、`title`、`items[0..2].label/value`、`items[3..].label/value/percent`、`source`、`subtitle`

### C07 Ecosystem

- Composition: `C07-Ecosystem`
- 类型：全屏 Acid 解释组件
- 用途：生态列表 / 产品入口清单。
- 展现：左侧标题，下方圆点列表。
- 允许：`stageMode: no-presenter`，`slot: full-bleed`
- 来源：不强制。
- 关键 props：`eyebrow`、`title`、`items[].label`、`items[].detail`、`subtitle`

### C08 OpenSourceWave

- Composition: `C08-OpenSourceWave`
- 类型：全屏 Acid 证据/发布清单
- 用途：开源浪潮 / 发布清单。
- 展现：左侧标题，下方编号列表。
- 允许：`stageMode: no-presenter`，`slot: full-bleed`
- 来源：强制 `sourceRefIds`
- 关键 props：`eyebrow`、`title`、`items[].label/detail`、`source`、`subtitle`

### C09 MapFocus

- Composition: `C09-MapFocus`
- 类型：全屏 Acid 解释组件
- 用途：地图焦点 / 区域与节点强调。
- 展现：左侧标题说明 + 指标列表，画面中部抽象地图节点。
- 揭示：整个解释画面首次出现时使用一次 C30 `center-out` 像素揭示。
- 允许：`stageMode: no-presenter`，`slot: full-bleed`
- 来源：不强制。涉及真实地理事实时需要来源。
- 关键 props：`topic`、`topicDetail`、`eyebrow`、`title`、`copy`、`items`、`subtitle`

### C10 TimeGap

- Composition: `C10-TimeGap`
- 类型：全屏 Acid 大数字
- 用途：时间差 / 代差大数字。
- 展现：左侧超大数字 + 单位 + caption。
- 允许：`stageMode: no-presenter`，`slot: full-bleed`
- 来源：不强制。真实时间差判断需来源。
- 关键 props：`topic`、`topicDetail`、`primaryValue`、`primaryUnit`、`caption`、`subtitle`
- 默认兜底：`primaryValue: "6"`，`primaryUnit: "个月"`，`caption: "误差"`

### C11 PricePage

- Composition: `C11-PricePage`
- 类型：全屏 Acid 证据/价格页
- 用途：价格页 / 价格战与折扣表。
- 展现：左侧标题 + 大折扣值 + 价格行。
- 揭示：内容首次出现时使用一次 C30 确定性像素揭示，不改变价格与来源信息。
- 允许：`stageMode: no-presenter`，`slot: full-bleed`
- 来源：强制 `sourceRefIds`
- 关键 props：`eyebrow`、`title`、`primaryValue`、`primaryUnit`、`items[].label/detail/value`、`source`、`subtitle`
- 默认兜底：`primaryValue: "2.5"`，`primaryUnit: "折"`

### C12 TokenBoard

- Composition: `C12-TokenBoard`
- 类型：全屏 Acid 证据/成本图
- 用途：Token 成本图 / 单位成本比较。
- 展现：左侧标题 + 大成本比值 + 条形图 + copy。
- 揭示：内容首次出现时使用一次 C30 确定性像素揭示，不改变成本数据与来源信息。
- 允许：`stageMode: no-presenter`，`slot: full-bleed`
- 来源：强制 `sourceRefIds`
- 关键 props：`eyebrow`、`title`、`primaryValue`、`primaryUnit`、`items[].label/value/percent`、`copy`、`source`、`subtitle`
- 默认兜底：`primaryValue: "1/35"`，`primaryUnit: "原价水平"`

### C13 AgentExecution

- Composition: `C13-AgentExecution`
- 类型：全屏 Acid 解释/流程组件
- 用途：Agent 执行页 / 聊天与任务轨迹。
- 展现：左侧标题说明 + 指标列表，右侧任务对话卡。
- 允许：`stageMode: no-presenter`，`slot: full-bleed`
- 来源：不强制。
- 关键 props：`topic`、`topicDetail`、`eyebrow`、`title`、`copy`、`items`、`messages[].speaker/text`、`subtitle`

### C16 NarrationEchoLayer

- Composition: `C16-Summary-NarrationEchoLayer`
- 类型：口播摘要组件
- 用途：左侧提要式短句、打字机文本、淡关键词轨迹。
- 展现：极致透底 HUD 悬浮设计。当前焦点句复用 C28 `mode="focus"` 做语义词组聚焦，上一句退场仍保留原有层级；流程轨 (track) 为半透胶囊徽章配双向 SVG 数据流箭头；当前焦点使用悬浮 HUD 圆角胶囊 Badge；全局正文附加复合软投影。
- 允许：`stageMode: presenter-center | presenter-small`，`slot: edge-left | top-left`
- 来源：不强制。
- track 建议：`overlay`
- 特殊规则：`props.placement` 必须与 scene `slot` 一致。

Props：

| 字段 | 类型 / 限制 |
| --- | --- |
| `placement` | `edge-left` 或 `top-left`，默认 `edge-left` |
| `items` | 1-5 个 |
| `charFrames` | integer，1-5，默认 2 |
| `segmentPauseFrames` | integer，2-18，默认 6 |
| `exitFrames` | integer，10-12，默认 12 |
| `exitAtFrame` | integer，可选 |
| `showSoftener` | boolean，默认 true |
| `backgroundVideoPath` | string，可选 |
| `backgroundStartFromFrame` | integer >= 0，可选 |
| `backgroundAudio` | boolean，可选 |

`items` 每项：

| 字段 | 类型 / 限制 |
| --- | --- |
| `ghost` | string，1-8，可选 |
| `label` | string，1-18，必填 |
| `beat` | string，1-12，可选 |
| `counter` | string，1-4，可选 |
| `progress` | number，0-1，可选 |
| `segments` | 1-8 个，必填 |
| `note` | string，1-34，可选 |
| `copy` | string，1-90，可选 |
| `track` | string[]，1-3 个，每个 1-12，可选 |
| `activeTrackIndex` | integer，0-2，可选，必须指向已有 track |
| `focus` | string，1-16，可选 |

`segments` 每项只能二选一：`text` 1-18，或 `break: true`。`accent: true` 只能用于文字段，并且每个 item 最多一个 accent，位置应靠近句尾。

### C21 RemotionTalkEffect

- Composition: `C21-Summary-RemotionTalkEffect`
- 类型：口播摘要组件
- 用途：标题打字机、步骤、声明、比较、交接、outro。
- 展现：极简无界透底 HUD 悬浮风格。组件固定锚定在左上安全区域：1920x1080 下外框起点约为 `x=48px / y=81px`，右边界不越过人物安全区，最小高度为 `788px`，底部保留字幕安全距离。左侧指示线为 4px 能量条；列表使用固定矩形计算并复用 C29 在当前项之间迁移焦点；对比块宽度跟随安全区域收缩；去除深色背景板。
- 允许：`stageMode: presenter-center`，`slot: edge-left`
- 来源：不强制。
- 关键 props：`variant`、`title`、`subtitle`、`items`、`left/right/connector`

Props：

| 字段 | 类型 / 限制 |
| --- | --- |
| `variant` | `title`、`steps`、`statement`、`compare`、`handoff`、`outro` |
| `eyebrow` | string，1-28，可选 |
| `title` | string，1-28，必填 |
| `subtitle` | string，1-56，可选 |
| `accent` | `lime`、`cyan`、`orange`，默认 `lime` |
| `index` | string，1-6，可选 |
| `items` | string[]，最多 4，每项 1-16 |
| `left` | string，1-16，可选 |
| `right` | string，1-16，可选 |
| `connector` | string，1-10，可选 |

`compare` 和 `handoff` 会优先展示 `left`、`right`、`connector`；其他 variant 更适合用 `items` 做步骤/要点。

### C22 AcidSrtSubtitle

- Composition: `C22-AcidSrtSubtitle`
- 类型：独立字幕演示组件
- 用途：根据 SRT 自动切分短语，当前短语变酸绿色并带底部描边流动效果。
- 展现：底部字幕安全区内的黑色字幕条，最多两行。
- 当前状态：在 Studio 中可单独预览，但不在 `episode.scene.kind` 联合类型中；正式 episode 中通常通过 `TalkVideoBase` / `ShotSubtitleLayer` 承载字幕。
- Props：`captions: Caption[]`，`maxWidth?: number`。demo 使用 `srt: string`。

### C23 TrendTotem

- Composition: `C23-Summary-TrendTotem`
- 类型：口播摘要组件
- 用途：左侧大字趋势型，强调“机会、趋势、判断”。
- 展现：极致无界透底 HUD 悬浮。整体 top 位置提至 7.5%，容器高度增加至 788px；1-2 行标题复用 C28 `mode="words"`，copy 仅整体淡入，避免同段出现第二个逐字主视觉。
- 允许：`stageMode: presenter-center | presenter-small`，`slot: edge-left | top-left`
- 来源：不强制。
- 关键 props：`kicker`、`label`、`title[0..1]`、`copy`、`foot`、`emphasis`、`accent`

### C24 TrendBanner

- Composition: `C24-Summary-TrendBanner`
- 类型：口播摘要组件
- 用途：左侧横向大标题型，承接口播观点句、判断句、结论句。
- 展现：极致无界透底 HUD 悬浮。kicker + 波形符号 + label + 1-2 行复用 C28 `mode="words"` 的标题 + 整体淡入 copy + foot；容器高度纵向拉伸至 788px。
- 允许：`stageMode: presenter-center | presenter-small`，`slot: edge-left | top-left`
- 来源：不强制。
- 关键 props：`kicker`、`label`、`title[0..1]`、`copy`、`foot`、`accent`

### C25 TopicSignal

- Composition: `C25-Summary-TopicSignal`
- 类型：口播摘要组件
- 用途：话题切口与三张信息块，适合把一个选题拆成 2-3 个信号。
- 展现：无界透底 HUD 悬浮。顶部 label/kicker + 两行标题 + copy + 三张高透明度白色磨砂子卡片；使用固定卡片矩形和 C29 在三张信息块间迁移焦点，不读取 DOM 尺寸。
- 允许：`stageMode: presenter-center | presenter-small`，`slot: edge-left | top-left`
- 来源：不强制。
- 关键 props：`label`、`kicker`、`title[0..1]`、`copy`、`blocks[0..2]`、`foot`

### C26 SideBrief

- Composition: `C26-Summary-SideBrief`
- 类型：口播摘要组件
- 用途：右侧结论收束与补充提示。
- 展现：右侧无界透底 HUD 悬浮风格。右侧 3px 发光流轨 + kicker + 大序号 + 1-3 行标题；使用固定行矩形和 C29 跟随当前结论条目，copy/焦点胶囊/tail/foot 保持原信息层级。
- 允许：`stageMode: presenter-center | presenter-small`，`slot: edge-right | top-right`
- 来源：不强制。
- 关键 props：`kicker`、`index`、`title[0..2]`、`copy`、`focus`、`tail`、`foot`、`emphasis`、`accent`

### C27 ShotDirector

- Composition: `C27-ShotDirector`
- 类型：系统布局组件
- 用途：把口播层、内容层、摘要层按镜头切换，不把人物位置写死在具体组件里。
- 展现：根据 `episode.shots` 在全屏口播、左右演讲者、PIP、内容全屏、push-in 之间切换。
- 内容揭示：C27 不再为普通内容自动添加像素遮罩；只有显式 C30 scene 才执行像素揭示。
- 人物对侧组件：C28/C29 及复用它们的 C16/C21/C23-C26 必须通过 `sidecarId` 进入 `speaker-left` 或 `speaker-right`；人物在左时组件必须使用右侧 slot，人物在右时组件必须使用左侧 slot。
- C30 内容接管：显式 C30 scene 使用 `content-full + contentId`，全画布覆盖人物；24 帧揭示、45 帧完整停留，下一人物镜头用 12 帧恢复。
- 配置位置：`episode.shots`，不是普通 scene props。
- 前置要求：必须有一个 `TalkVideoBase` scene，且为 `stageMode: no-presenter`、`slot: full-bleed`。

Shot 字段：

| 字段 | 类型 / 要求 |
| --- | --- |
| `from` | 起始帧，integer >= 0 |
| `to` | 结束帧，integer > `from` |
| `mode` | 见下方 shot mode |
| `contentId` | 可选，引用主内容 scene |
| `summaryId` | 可选，引用 summary scene |
| `sidecarId` | 可选，引用人物对侧的 C28/C29 或摘要 scene |

Shot mode：

| mode | 画面布局 | contentId | summaryId |
| --- | --- | --- | --- |
| `talk` | 口播全屏 | 不使用 | 可用 |
| `speaker-left` | 人物左侧，内容或 sidecar 在右侧 | `contentId` / `sidecarId` 二选一 | 不使用 |
| `speaker-right` | 内容或 sidecar 在左侧，人物右侧 | `contentId` / `sidecarId` 二选一 | 不使用 |
| `pip-right` | 内容主导，人物右上 PIP | 必填 | 不使用 |
| `content-full` | 内容接管全屏，人物隐藏 | 必填 | 不使用 |
| `push-in` | 口播全屏轻微推近 | 不使用 | 可用 |

`contentId` 不能引用 summary 组件或 `TalkVideoBase`；`summaryId` 必须引用 C16/C21/C23-C26 这类 summary 组件。

`sidecarId` 与 `contentId` 互斥，只能用于 `speaker-left/right`。`speaker-left` 对应 `edge-right/top-right`，`speaker-right` 对应 `edge-left/top-left`。C28/C29 在有人物的 episode 中不得脱离 `sidecarId` 直接覆盖居中人物。

### C28 SemanticTextReveal

- Composition: `C28-SemanticTextReveal`
- 类型：公共视觉原语
- 用途：逐词、逐字和焦点迁移式语义文字揭示，供摘要标题与内容标题复用。
- 展现：所有状态由当前帧确定；入场仅使用透明度、`translate3d`、缩放和模糊。强调词使用明确品牌色，不使用渐变；非焦点文字保持白色且透明度不低于 `0.52`，所有文字保留复合黑色阴影。
- 允许：`stageMode: no-presenter | presenter-small`，`slot: full-bleed | edge-left | edge-right | top-left | top-right`
- 来源与素材：均不强制。
- 布局：View 使用可换行 `inline-flex`，不改变调用方标题宽度；scene renderer 会按 slot 限制宽度，并确保正文停留在字幕安全区上方。
- 使用约束：有人物时必须由 C27 `sidecarId` 切到左右分屏，组件位于人物对侧；不裁切人物区，不允许直接覆盖居中人物。不得使用 CSS keyframes、计时器、内部 state 或随机数驱动动画。
- 禁止项：不得添加渐变、实时随机、hover、click 或其他交互触发；默认单元揭示时长为 `18` 帧。

Props：

| 字段 | 类型 / 限制 | 默认值 |
| --- | --- | --- |
| `text` | string，最多 240，必填 | — |
| `mode` | `words`、`characters`、`focus` | `words` |
| `emphasis` | string[]，最多 12 项 | `[]` |
| `activeIndex` | integer >= 0，可选 | 按当前帧推导 |
| `startFrame` | integer >= 0 | `0` |
| `durationInFrames` | integer > 0 | `18` |
| `staggerFrames` | integer >= 0 | `2` |
| `blurPx` | number，0-24 | `8` |
| `accentColor` | string，1-32 | `#c7ff3d` |
| `align` | `left`、`center`、`right` | `left` |

中文在 `words` / `focus` 模式下按连续语义片段和标点切分，标点依附前一单元；`characters` 模式按字符切分并同样吸附标点。`className` 和 `style` 只属于代码内 View API，不进入 episode JSON。

### C29 FocusReticle

- Composition: `C29-FocusReticle`
- 类型：公共视觉原语
- 用途：在列表项、卡片或关键词目标之间迁移 HUD 焦点。
- 展现：单个绝对定位根节点绘制四组 `1px` 纯色直角角标、中心 `+` 准心和低透明呼吸点；不绘制实色底板，不使用渐变或 CSS keyframes。
- 允许：`stageMode: no-presenter | presenter-small`，`slot: full-bleed | edge-left | edge-right | top-left | top-right`
- 来源与素材：均不强制。
- 布局：目标矩形由调用方基于固定布局传入，不依赖 DOM 测量；有人物时必须由 C27 `sidecarId` 将人物与组件分居左右，所有目标必须位于字幕安全区上方。
- 动效：`x/y/width/height` 使用同一进度插值，默认迁移 12 帧，缓动为 `Easing.bezier(0.16, 1, 0.3, 1)`；呼吸点由当前帧周期函数计算。
- 边界：`activeIndex` 越界或当前目标宽高不为正时不绘制。
- 禁止项：不得添加渐变、实时随机、CSS keyframes、hover、click 或 DOM 测量触发。

Props：

| 字段 | 类型 / 限制 | 默认值 |
| --- | --- | --- |
| `targets` | `{id, x, y, width, height}[]`，1-24 项 | — |
| `activeIndex` | integer >= 0 | — |
| `previousIndex` | integer >= 0，可选 | `activeIndex` |
| `transitionStartFrame` | integer >= 0 | `0` |
| `transitionDurationInFrames` | integer > 0 | `12` |
| `accentColor` | string，1-32 | `#c7ff3d` |
| `cornerLength` | number，0-80 | `18` |
| `lineWidth` | number，0-4 | `1` |
| `padding` | number，0-48 | `8` |

### C30 PixelReveal

- Composition: `C30-PixelReveal`
- 类型：公共视觉原语
- 用途：为证据、数据状态和内容区域提供确定性像素网格揭示。
- 展现：内容层始终挂载；上层默认 `12 × 7`、共 84 个像素单元，按固定方向与 seed 排序退场。每个单元只动画透明度与缩放，不使用 canvas、WebGL、GSAP、Motion、hover 或 click。
- 允许：`stageMode: no-presenter | presenter-center | presenter-small`，`slot: full-bleed | edge-left | edge-right | top-left | top-right`
- 来源：原语本身不强制；若 children 展示真实数据、新闻、网页或证据，调用组件仍必须绑定可追溯来源。无来源时只能展示抽象解释型视觉或明确标注的虚构 Demo。
- 布局：人物居中时只能作用于人物安全区外的内容区；正文与像素遮罩均不得侵入字幕安全区。默认像素色为 `visualTokens.color.inkBlack`。
- 确定性：顺序由网格坐标、方向与固定 seed 计算，禁止 `Math.random()`；总进度必须由调用方按当前帧计算并钳制到 `0..1`。
- 默认时长：scene renderer 使用 `24` 帧完成揭示；C27 内容接管随后完整停留 `45` 帧，并用 `12` 帧恢复人物。View 由调用方显式提供帧驱动进度。
- 禁止项：不得添加渐变、实时随机、CSS 动画、hover、click 或其他交互触发。

View Props：

| 字段 | 类型 / 限制 | 默认值 |
| --- | --- | --- |
| `children` | ReactNode，必填 | — |
| `progress` | number，调用方钳制到 0-1 | — |
| `columns` | integer > 0 | `12` |
| `rows` | integer > 0 | `7` |
| `direction` | `left-to-right`、`right-to-left`、`top-to-bottom`、`center-out` | `left-to-right` |
| `cellGap` | number >= 0 | `2` |
| `pixelColor` | string | `#151515` |
| `seed` | string | `pixel-reveal` |
| `style` | React CSSProperties，仅代码调用 | — |

Scene renderer 额外使用 `title`、`description`、`values[{label,value}]` 组装可序列化演示内容，并支持 `startFrame`、`durationInFrames` 或显式 `progress`。`children` 与 `style` 不进入 episode JSON。

## System Preview

### BASE TalkVideoBase

- Composition: `BASE-TalkVideoBase`
- 类型：系统预览项，不使用 C 编号。
- 用途：口播视频、音频和 SRT 字幕承载。
- 允许：`stageMode: no-presenter`，`slot: full-bleed`
- 来源：不强制。
- 素材：需要 `talk-video`，可选 `subtitle`。

Props：

| 字段 | 类型 / 限制 |
| --- | --- |
| `videoPath` | string，1-160，必填 |
| `subtitlePath` | string，1-160，可选 |
| `audio` | boolean，默认 true |
| `fit` | `cover`、`contain`，默认 `cover` |
| `subtitleMaxWidth` | integer，420-1400，默认 980 |

## 常用组合

口播观点段：

- `TalkVideoBase` 作为背景/底层。
- 选 C23/C24/C25/C26 做一个 summary。
- 若使用 C27，则在 `talk` 或 `push-in` shot 中用 `summaryId` 引用该 summary。

内容接管段：

- 准备一个 C01-C13 主内容 scene。
- 在 C27 `speaker-left`、`speaker-right`、`pip-right` 或 `content-full` 中用 `contentId` 引用它。
- 该主内容 scene 的 `start/end` 应覆盖 shot 使用区间。

证据段：

- 选 C05/C06/C08/C11/C12。
- 在 `sources.json` 写来源，在 `scene.sourceRefIds` 绑定来源。
- 如画面出现截图/来源卡，在 `asset-manifest.json` 写资产，并在 `props.source.assetId/sourceRefId` 绑定。

## 维护清单

组件发生增删改时，同步检查：

- `src/editorial/registry/component-catalog.ts`
- `src/editorial/registry/component-registry.ts`
- `src/editorial/schema/episode.schema.ts`
- `src/Root.tsx` 的 Studio Composition 注册
- 对应 demo fixture
- `docs/component-and-shot-layout-guide.md`
- 如规则变化，同步 `AGENTS.md`
