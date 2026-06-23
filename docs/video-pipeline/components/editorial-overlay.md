# EditorialOverlay

`EditorialOverlay` 是基础信息填充层 / 环境信息层。它不是主视觉组件，而是人物正常口播时的“信息空气”：让白底画面不空，但不抢人物、主组件和字幕。

它在注册表中只作为一个正式组件出现，内部包含五个基础原子：

- `GhostNumber`：弱化编号、阶段感、资料索引感。
- `KeywordStamp`：一个短关键词。
- `MiniList`：2 到 4 条短信息。
- `StatTag`：小数据、小比例、小时间或短指标。
- `Annotation`：一句非常短的编辑批注和短引导线。

## 什么时候用

- 人物正常口播，画面太空。
- 需要强调一两个关键词。
- 需要给出短列表、小数据、小批注。
- 需要维持持续的信息密度。

## 什么时候不要用

- 章节开场，使用 `SectionStamp`。
- 核心观点，使用 `HeadlineTakeover`。
- 新闻证据、网页、公告、资料截图，使用 `EvidenceClip`。
- 复杂数据和前后对照，使用 `MetricSpread`。
- 两个概念或工作方式差异，使用 `ConceptSplit`。
- 操作演示、录屏、复杂流程。
- 已经有主视觉组件压场时。
- 只是为了让画面不空。

## Props

```ts
type EditorialOverlayProps = {
  placement: "top-left" | "top-right" | "edge-left" | "edge-right";
  layout?: "corner-stack" | "edge-rail" | "counterweight" | "scatter";
  density?: "light" | "medium";
  accent?: "orange" | "blue";
  items: Array<
    | {type: "ghost-number"; value: string}
    | {type: "keyword"; text: string; emphasis?: "none" | "block" | "reverse" | "underline"}
    | {type: "mini-list"; title?: string; rows: Array<{label: string; value?: string; emphasis?: "label" | "value" | "none"}>}
    | {type: "stat-tag"; value: string; label?: string; tone?: "accent" | "neutral"}
    | {type: "annotation"; text: string; direction?: "left" | "right" | "up" | "down"}
  >;
};
```

## Layout

- `corner-stack`：角落分层信息，适合 `top-left` / `top-right`。
- `edge-rail`：边缘纵向页边注，适合 `edge-left` / `edge-right`。
- `counterweight`：平衡人物或主视觉另一侧空白，不排成完整面板。
- `scatter`：最多 2 个元素的轻量散点，不做满屏装饰。

## 规则

- 默认放在 `overlay` track。
- 一次最多 4 个基础元素。
- 一个场景只允许一个 `EditorialOverlay`。
- 同一时刻最多一个 `EditorialOverlay` 活跃。
- 不允许在 `HeadlineTakeover` 或 `SectionStamp` 活跃期间使用；preview 为 warning，strict render 为 blocking。
- 与 `EvidenceClip`、`MetricSpread`、`ConceptSplit` 同时出现时，只允许 `density: "light"`。
- `presenter-center` 必须避开人物安全区；所有模式必须避开字幕安全区。
- 一个 overlay 内只允许一种强调色：`orange` 或 `blue`。

## 使用频率

- 一条 5 到 10 分钟视频，可使用 6 到 15 段。
- 每段建议 3 到 8 秒。
- 相邻两段不要重复相同 layout。
- 不要连续三段使用同一种 item 组合。
- 不要把它当成“每句话都必须有特效”。

## QC

检查它是否：

- 真的填充了空画面。
- 明显比主组件轻。
- 像白底科技编辑部的资料批注。
- 没有变成 HUD、电视栏目角标、固定侧栏或圆角信息卡。
- 没有太多小字。
- 没有挡住人物、字幕、主组件或关键词。
