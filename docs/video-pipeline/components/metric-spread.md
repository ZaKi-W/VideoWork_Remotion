# MetricSpread

`MetricSpread` 是数据冲击板 / 指标展开组件。正式视觉名称是 `Data Ledger / 数据账页`。

它承担一个叙事任务：一个最重要的大数字，加一到四条前后对照数据，再加极简来源索引。它不是普通表格、Excel 截图、财经节目图表、复杂排行榜或 HUD 仪表盘。

## 什么时候使用

- 需要让一个关键数字成为观众记忆点。
- 有明确的前后变化。
- 有价格、时间、效率、比例或性能对照。
- 有可追溯来源。

## 什么时候不要使用

- 只是表达观点，没有数据。
- 数据太多，超过四行。
- 没有可靠来源。
- 需要展示网页原图。
- 只是为了让画面更满。

## 使用频率

- 一条 5 到 10 分钟视频，建议使用 2 到 6 次。
- 同一段内不要同时使用多个主视觉组件。
- 数据讲完后，应切回人物、证据、录屏、案例或下一段逻辑。

## Props

```ts
type MetricSpreadProps = {
  variant?: 'delta-ledger';
  placement: 'top-left' | 'edge-left' | 'screen-primary';
  accent?: 'orange' | 'blue';
  kicker?: string;
  primary: {
    value: string;
    unit?: string;
    label: string;
    direction?: 'up' | 'down' | 'neutral';
  };
  rows: Array<{
    label: string;
    before?: string;
    after?: string;
    delta?: string;
    emphasis?: 'before' | 'after' | 'delta' | 'none';
  }>;
  sourceRefId: string;
  sourceLabel?: string;
  note?: string;
  showRatioBar?: boolean;
};
```

## 舞台限制

`presenter-center`：

- slot 只能是 `top-left`、`edge-left`。
- 禁止 `screen-primary`、`full-bleed`、`center-overlay`、`bottom-left`、`bottom-right`。
- 不支持 `top-right` 或 `edge-right`，避免在人物右侧形成拥挤的数据侧栏。

`presenter-small` / `screen-primary` / `no-presenter`：

- slot 可为 `top-left`、`edge-left`、`screen-primary`。
- 禁止 `full-bleed`、`center-overlay`、`bottom-left`、`bottom-right`。
- 不支持右侧 slot。

## 来源规则

- `sourceRefId` 必须存在于 `sources.json`。
- source 必须有 `title`、`publisher`，以及 `url` 或本地可验证说明。
- preview 中 `provided` 可 warning 通过。
- strict render 中 source status 必须是 `captured` 或 `verified`。
- `kind: "demo"` 的 source 只允许 preview，strict render 必须 blocking。
- 不自动联网抓取、核验或计算数据真实性。

## 组件边界

- `EvidenceClip` 只负责真实来源截图和批注，不承担数据账页排版。
- `MetricSpread` 只负责一个主要指标、少量对照数据和来源索引。
