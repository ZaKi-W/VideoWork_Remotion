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
- `EditorialOverlay`
- `WorkflowPath`
- `DemoFocusFrame`
- `AssetStack`

当前 `EditorialStage`、`StageDebugOverlay`、`SectionStamp`、`HeadlineTakeover`、`ConceptSplit`、`EvidenceClip`、`MetricSpread` 与 `EditorialOverlay` 是 ready。其他高级组件仍只允许 prototype 或 planned。

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

`ConceptSplit`：

- 用途：概念对比、新旧方式切换、认知转折。
- 定位：Editorial Contrast Cut / 编辑对照切片，不是数据表、证据截图、普通标题或章节入口。
- modes：`cross-cut`、`editorial-fold`、`handoff`。
- relationship：`versus`、`from-to`、`not-but`。
- cross-cut stageMode：`presenter-center`、`presenter-small`、`screen-primary`、`no-presenter`。
- cross-cut slot：`top-left`、`top-right`、`edge-left`、`edge-right`。
- editorial-fold stageMode：`no-presenter`、`screen-primary`。
- editorial-fold slot：`full-bleed`、`screen-primary`。
- handoff stageMode：`presenter-small`、`screen-primary`、`no-presenter`。
- handoff slot：`edge-left`、`edge-right`、`screen-primary`。
- requiresSource：否。
- requiresAsset：否。
- implementationStatus：`ready`。
- demo：`episodes/demo-concept-split/`。

`EvidenceClip`：

- 用途：官方来源、新闻、公告、网页、数据截图等证据展示。
- 定位：证据剪报 / 来源素材展示，不是装饰卡片。
- variants：`clipping`、`spotlight`。
- clipping stageMode：`presenter-center`、`presenter-small`、`screen-primary`、`no-presenter`。
- clipping slot：`top-left`、`top-right`、`edge-left`、`edge-right`。
- spotlight stageMode：`presenter-small`、`screen-primary`、`no-presenter`。
- spotlight slot：`screen-primary`、`full-bleed`。
- requiresSource：是。
- requiresAsset：是。
- allowedAssetTypes：`screenshot`、`image`、`chart`。
- implementationStatus：`ready`。
- demo：`episodes/demo-evidence-clip/`。

`MetricSpread`：

- 用途：价格、成本、性能、速度、比例、时间等关键指标表达。
- 定位：Data Ledger / 数据账页，不是表格或仪表盘。
- variant：`delta-ledger`。
- presenter-center slot：`top-left`、`edge-left`。
- presenter-small / screen-primary / no-presenter slot：`top-left`、`edge-left`、`screen-primary`。
- requiresSource：是。
- requiresAsset：否。
- implementationStatus：`ready`。
- demo：`episodes/demo-metric-spread/`。

`EditorialOverlay`：

- 用途：轻量关键词、编号、短列表、小数据、批注等基础信息填充。
- 定位：信息空气 / 环境信息层，不是主视觉。
- 内部原子：`GhostNumber`、`KeywordStamp`、`MiniList`、`StatTag`、`Annotation`。
- layouts：`corner-stack`、`edge-rail`、`counterweight`、`scatter`。
- stageMode：`presenter-center`、`presenter-small`、`screen-primary`、`no-presenter`。
- slot：`top-left`、`top-right`、`edge-left`、`edge-right`。
- allowed track：`overlay`。
- requiresSource：否。
- requiresAsset：否。
- implementationStatus：`ready`。
- demo：`episodes/demo-editorial-overlay/`。

Strict render 规则：

- planned 组件阻止高清渲染。
- prototype 组件阻止高清渲染。
- ready 组件本身不因实现状态阻止高清渲染，但仍需通过 presenter、slot、安全区、素材和来源等规则。
- `EvidenceClip` 必须有有效 `sourceRefId`。
- `assetId` 必须存在于 `asset-manifest.json`。
- `sourceRefId` 必须存在于 `sources.json`。
- strict render 中 `EvidenceClip` source status 必须是 `captured` 或 `verified`。
- strict render 中 `EvidenceClip` 不允许使用 `generated` 证据素材。
- preview 中 demo `generated` 素材和 `provided` 来源只允许 warning 通过。
- `MetricSpread` 必须有有效 `sourceRefId`。
- strict render 中 `MetricSpread` source status 必须是 `captured` 或 `verified`。
- strict render 中 `MetricSpread` 不允许 `kind: "demo"` source。
- preview 中 `provided` 或 demo source 只允许 warning 通过。
- `EditorialOverlay` 必须在 `overlay` track；strict render 中非 overlay track 会 blocking。
- 同一时刻超过一个 `EditorialOverlay` 活跃会 blocking。
- `EditorialOverlay` 与 `HeadlineTakeover` 或 `SectionStamp` 重叠：preview warning，strict render blocking。
