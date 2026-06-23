# Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run episode:smoke
```

Episode 命令：

```bash
npm run episode:new -- --slug <slug>
npm run episode:status -- --episode <slug>
npm run episode:validate -- --episode <slug>
npm run episode:frames -- --episode <slug>
npm run episode:preview -- --episode <slug>
npm run episode:render -- --episode <slug>
```

SectionStamp demo：

```bash
npm run episode:validate -- --episode demo-section-stamp
npm run episode:frames -- --episode demo-section-stamp
npm run episode:preview -- --episode demo-section-stamp
```

Component gallery：

```bash
npm run episode:validate -- --episode demo-component-gallery
npm run episode:frames -- --episode demo-component-gallery
npm run episode:preview -- --episode demo-component-gallery
```

EvidenceClip demo：

```bash
npm run episode:validate -- --episode demo-evidence-clip
npm run episode:frames -- --episode demo-evidence-clip
npm run episode:preview -- --episode demo-evidence-clip
```

MetricSpread demo：

```bash
npm run episode:validate -- --episode demo-metric-spread
npm run episode:frames -- --episode demo-metric-spread
npm run episode:preview -- --episode demo-metric-spread
```

ConceptSplit demo：

```bash
npm run episode:validate -- --episode demo-concept-split
npm run episode:frames -- --episode demo-concept-split
npm run episode:preview -- --episode demo-concept-split
```

EditorialOverlay demo：

```bash
npm run episode:validate -- --episode demo-editorial-overlay
npm run episode:frames -- --episode demo-editorial-overlay
npm run episode:preview -- --episode demo-editorial-overlay
```

说明：

- `episode:validate` 默认是 preview 校验。
- strict 校验可运行：`npm run episode:validate -- --episode <slug> --strict`。
- `episode:preview` 允许 prototype，但会打印 warning。
- `episode:render` 必须通过 strict 校验，不允许 placeholder、prototype 或 planned。
