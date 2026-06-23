# ConceptSplit

`ConceptSplit` 是 Editorial Contrast Cut / 编辑对照切片。它用于解释两个概念、两种方式、两个阶段之间的本质差异，让观众先看见旧概念，再看见新概念，并用最少信息理解转折。

适合使用：

- 解释两个概念的差异。
- 解释旧工作方式和新工作方式。
- 解释从聊天到执行、从工具到流程等认知升级。
- 用一组对照帮助观众理解抽象概念。

不要使用：

- 只是展示数字；用 `MetricSpread`。
- 只是展示新闻或网页；用 `EvidenceClip`。
- 需要详细步骤；后续用 `WorkflowPath`。
- 需要展示真实软件界面；后续用 `DemoFocusFrame`。
- 一组概念超过两个。
- 没有明确对照关系。
- 普通章节切换；用 `SectionStamp`。
- 一句最强观点接管画面；用 `HeadlineTakeover`。

使用频率建议：

- 一条 5 到 10 分钟视频，建议使用 2 到 5 次。
- 两次之间应插入人物口播、数据、证据、录屏或案例。
- 同一段里不要同时使用 `HeadlineTakeover` 和 `ConceptSplit`。
- 连续两个 `ConceptSplit` 必须更换 `mode` 或 `anchor`。

Props：

```ts
type ConceptSplitProps = {
  mode?: 'cross-cut' | 'editorial-fold' | 'handoff';
  relationship?: 'versus' | 'from-to' | 'not-but';
  anchor?: 'left-heavy' | 'right-heavy';
  left: {
    title: string;
    eyebrow?: string;
    description?: string;
    points?: string[];
  };
  right: {
    title: string;
    eyebrow?: string;
    description?: string;
    points?: string[];
  };
  bridge?: {
    label?: string;
    style?: 'arrow' | 'vs' | 'not-but' | 'cut';
  };
  accent?: 'orange' | 'blue';
  emphasize?: 'left' | 'right';
  showDivider?: boolean;
};
```

字段限制：

- `left.title` 和 `right.title` 必填，最长 18 个字符，最多两行。
- `description` 最长 34 个字符。
- `points` 最多 2 条，每条最长 18 个字符。
- `bridge.label` 最长 12 个字符。
- `accent` 只能是 `orange` 或 `blue`。
- `emphasize` 一次只能强调一侧。

Mode：

- `cross-cut`：人物居中或边缘讲解时使用。旧概念更克制，新概念更重，两个概念围绕人物安全区形成不对称切片。
- `editorial-fold`：无人物或屏幕主视觉时使用。两个纸面区域沿折页切口相遇，概念本身接管画面。
- `handoff`：工具演示、录屏或流程讲解中使用。旧概念像被收起的资料，新概念像被展开的资料，只表达一次关键跃迁。

Stage / slot 限制：

- `cross-cut`：`presenter-center`、`presenter-small`、`screen-primary`、`no-presenter`；slot 只能是 `top-left`、`top-right`、`edge-left`、`edge-right`。
- `editorial-fold`：只允许 `no-presenter`、`screen-primary`；slot 只能是 `full-bleed`、`screen-primary`。
- `handoff`：只允许 `presenter-small`、`screen-primary`、`no-presenter`；slot 只能是 `edge-left`、`edge-right`、`screen-primary`。

视觉规则：

- 新概念视觉重量必须大于旧概念。
- 不使用规整左右双栏、两个圆角白卡片、红蓝阵营或传统 PPT 对比表。
- 人物居中时，文字围绕固定人物安全区排版，不进入脸部、头部、上半身和手势区。
- 正文信息不得进入字幕安全区。
- 强调色只用于一个核心概念或短强调块。
- 蓝色只用于 Agent、自动化、代码、工程、工作流、技术能力等语境。

