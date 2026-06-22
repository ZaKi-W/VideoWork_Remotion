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

第一批组件：

- `SectionStamp`
- `HeadlineTakeover`
- `ConceptSplit`
- `EvidenceClip`
- `MetricSpread`
- `WorkflowPath`
- `DemoFocusFrame`
- `AssetStack`

当前 `EditorialStage`、`StageDebugOverlay` 与 `SectionStamp` 是 ready。其他高级组件仍只允许 prototype 或 planned。

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

Strict render 规则：

- planned 组件阻止高清渲染。
- prototype 组件阻止高清渲染。
- ready 组件本身不因实现状态阻止高清渲染，但仍需通过 presenter、slot、安全区、素材和来源等规则。
- `EvidenceClip` 必须有有效 `sourceRefId`。
- `assetId` 必须存在于 `asset-manifest.json`。
- `sourceRefId` 必须存在于 `sources.json`。
