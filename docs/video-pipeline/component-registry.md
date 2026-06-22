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

每个进入 `ready` 的新组件必须在工程中有独立展示：

- 新建独立 episode：`episodes/demo-<component-name-kebab>/`。
- 新建对应素材目录：`public/episodes/demo-<component-name-kebab>/assets/`。
- demo 只展示这个组件的代表性 mode / stage / slot，不混入其他新组件。
- 必须能通过 preview 校验并导出关键帧。
- 如果 demo 使用 placeholder presenter，strict render 必须被正确阻止。

第一批组件：

- `SectionStamp`
- `HeadlineTakeover`
- `ConceptSplit`
- `EvidenceClip`
- `MetricSpread`
- `WorkflowPath`
- `DemoFocusFrame`
- `AssetStack`

当前 `EditorialStage`、`StageDebugOverlay`、`SectionStamp` 与 `HeadlineTakeover` 是 ready。其他高级组件仍只允许 prototype 或 planned。

`SectionStamp`：

- 用途：强势章节标题 / 话题切换。
- 标题定位：章节主视觉，不是栏目标签。
- 默认策略：短标题、两行、超粗、黑白高对比、一个强调词、一个强调色块、少量辅助信息。
- stageMode：`presenter-center`、`presenter-small`、`screen-primary`、`no-presenter`。
- slot：`top-left`、`top-right`、`edge-left`、`edge-right`。
- requiresSource：否。
- requiresAsset：否。
- implementationStatus：`ready`。
- variants：`impact`、`edge-impact`。旧 `index-strip`、`edge-note` 保持兼容映射。

`HeadlineTakeover`：

- 用途：核心观点 / 强势结论 / 转折句。
- 标题定位：一句必须被记住的话，不是章节入口。
- 默认策略：1 到 3 行超粗黑字、一个强调词、一个高对比色块、极少量辅助形状。
- modes：`punch`、`wrap`、`takeover`。
- stageMode：`presenter-center`、`presenter-small`、`screen-primary`、`no-presenter`，但不同 mode 有额外限制。
- punch slot：`top-left`、`top-right`、`edge-left`、`edge-right`。
- wrap：仅 `presenter-center` / `presenter-small`，slot 同 punch。
- takeover：仅 `no-presenter` / `screen-primary`，slot 为 `full-bleed`、`center-overlay`、`screen-primary`。
- requiresSource：否。
- requiresAsset：否。
- implementationStatus：`ready`。

Strict render 规则：

- planned 组件阻止高清渲染。
- prototype 组件阻止高清渲染。
- ready 组件本身不因实现状态阻止高清渲染，但仍需通过 presenter、slot、安全区、素材和来源等规则。
- `EvidenceClip` 必须有有效 `sourceRefId`。
- `assetId` 必须存在于 `asset-manifest.json`。
- `sourceRefId` 必须存在于 `sources.json`。
