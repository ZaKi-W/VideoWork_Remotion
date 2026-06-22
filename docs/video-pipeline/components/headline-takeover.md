# HeadlineTakeover

`HeadlineTakeover` 是核心观点 / 强势结论 / 转折句组件。它负责把一句最重要的话变成画面的唯一视觉中心。

一句话边界：

- `SectionStamp` 负责“现在讲什么”。
- `HeadlineTakeover` 负责“这句话你必须记住”。

适合：

- 一段中的最强观点。
- 结论。
- 反转。
- 关键判断。
- 章节中的记忆点。

不适合：

- 普通转场。
- 每一句话。
- 普通标题。
- 新闻、官网、录屏、数据说明。
- 与 `SectionStamp` 连续叠用。

建议频率：一条 5 到 10 分钟视频使用 2 到 5 次，两次之间尽量至少间隔 20 到 40 秒有效内容。同一段里不要同时使用 `SectionStamp` 和 `HeadlineTakeover`。

## Props

```ts
type HeadlineTakeoverProps = {
  lines: string[];
  emphasis?: {
    text: string;
    color?: "orange" | "blue";
    mode?: "highlight-block" | "reverse" | "underline";
  };
  mode?: "punch" | "wrap" | "takeover";
  placement?: "left-dominant" | "right-dominant" | "wraparound";
  alignment?: "left" | "right" | "center";
  allowSubjectOverlay?: boolean;
};
```

`lines` 必须是 1 到 3 行，每行不能为空。推荐每行 2 到 12 个中文字符。过长时校验器会 warning，制作时不要把标题缩成普通正文。

`emphasis.text` 必须完整、连续存在于 `lines` 拼接后的文本中。一次只允许一个强调词或短语。

## Modes

`punch`：

- 默认模式。
- 一侧强势大字从边缘压入。
- 适合 `presenter-center`、`presenter-small`、`screen-primary`、`no-presenter`。
- 允许 slot：`top-left`、`top-right`、`edge-left`、`edge-right`。

`wrap`：

- 标题围绕人物安全区形成包围感。
- 只适合 `presenter-center`、`presenter-small`。
- 允许 slot：`top-left`、`top-right`、`edge-left`、`edge-right`。
- 不要做成对称双栏。

`takeover`：

- 核心观点接管画面。
- 只适合 `no-presenter`、`screen-primary`。
- 允许 slot：`full-bleed`、`center-overlay`、`screen-primary`。
- 禁止 `presenter-center`。

## Visual Rules

- 黑色超粗中文标题是唯一绝对主角。
- 标题占可用视觉区域约 60% 到 82%。
- 行高 0.78 到 0.93，字距轻微收紧。
- 只使用一个强调色。
- 不显示 `sectionNo`、kicker、brandLabel、边签、英文栏目副标题或多层辅助信息。
- 不使用描边字、渐变字、发光字、霓虹、HUD、玻璃拟态或电视栏目包装。

## Animation

- 0 到 3 帧：色块或深色形状快速压入。
- 2 到 8 帧：标题经裁切显现。
- 5 到 11 帧：强调词落位。
- 停留期完全稳定。
- 退出快速收回。

不使用慢淡入、逐字打字、弹跳、故障闪烁、扫描线、粒子或 3D 翻转。
