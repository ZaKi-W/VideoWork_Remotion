# Component Production

## New Ready Component Demo Rule

Whenever a component becomes `ready`, create a standalone demo episode for it in the project.

Requirements:

- Use `episodes/demo-<component-name-kebab>/`.
- Put user-provided demo assets in `episodes/demo-<component-name-kebab>/assets/`.
- In `asset-manifest.json`, use paths relative to `public/`, such as `episodes/demo-<component-name-kebab>/assets/example.png`; render scripts mirror the episode assets directory into `public/episodes/...`.
- Demonstrate only that component, without introducing future components early.
- Cover the component's representative modes, stage modes, and slots.
- Run preview validation, keyframe export, and low-res preview render.
- If the demo uses a placeholder presenter, strict render must be blocked.

## SectionStamp

`SectionStamp` is ready for production.

Allowed stage modes:

- `presenter-center`
- `presenter-small`
- `screen-primary`
- `no-presenter`

Allowed slots:

- `top-left`
- `top-right`
- `edge-left`
- `edge-right`

Production rules:

- `assetIds` should normally be `[]`.
- `sourceRefIds` should normally be `[]`.
- `slot` must match `content.props.placement`.
- Use `accent: "orange"` by default.
- Use `accent: "blue"` only for technical, workflow, or process chapters.
- Do not use it as a full-screen cover or evidence visual.

## HeadlineTakeover

`HeadlineTakeover` is ready for production.

Allowed mode rules:

- `punch`: stage modes `presenter-center`, `presenter-small`, `screen-primary`, `no-presenter`; slots `top-left`, `top-right`, `edge-left`, `edge-right`.
- `wrap`: stage modes `presenter-center`, `presenter-small`; slots `top-left`, `top-right`, `edge-left`, `edge-right`.
- `takeover`: stage modes `no-presenter`, `screen-primary`; slots `full-bleed`, `center-overlay`, `screen-primary`.

Production rules:

- `assetIds` should normally be `[]`.
- `sourceRefIds` should normally be `[]`.
- Use it only for the strongest point, conclusion, reversal, key judgment, or chapter memory point.
- Use 1 to 3 non-empty `lines`.
- Use at most one `emphasis` object, and `emphasis.text` must appear continuously in `lines`.
- Use `color: "orange"` by default.
- Use `color: "blue"` only for technical, Agent, workflow, or engineering context.
- Do not add section numbers, kicker text, brand labels, English index labels, side tabs, long sublines, or data/evidence annotations.
- Do not place it next to `SectionStamp` in the same segment.

## ConceptSplit

`ConceptSplit` is ready for production.

Allowed mode rules:

- `cross-cut`: stage modes `presenter-center`, `presenter-small`, `screen-primary`, `no-presenter`; slots `top-left`, `top-right`, `edge-left`, `edge-right`.
- `editorial-fold`: stage modes `no-presenter`, `screen-primary`; slots `full-bleed`, `screen-primary`.
- `handoff`: stage modes `presenter-small`, `screen-primary`, `no-presenter`; slots `edge-left`, `edge-right`, `screen-primary`.

Production rules:

- `assetIds` should normally be `[]`.
- `sourceRefIds` should normally be `[]`.
- Use it only for two concepts, two work modes, or one old-to-new cognitive turn.
- Use `relationship: "from-to"` by default; use `not-but` only for a clear correction; use `versus` only for parallel contrast.
- `left.title` and `right.title` are required, short, and no longer than 18 characters.
- Use at most one description per side and at most two points per side.
- Use `accent: "orange"` by default.
- Use `accent: "blue"` only for Agent, automation, code, engineering, workflow, or technical capability.
- Emphasize only one side. New-state emphasis should normally be `right`.
- Do not create symmetric left/right panels, rounded white cards, PPT columns, red/blue battle layouts, HUD, neon, or grid-heavy visuals.
- Do not use it in the same spoken segment as `HeadlineTakeover`.

## EvidenceClip

`EvidenceClip` is ready for production.

Allowed variant rules:

- `clipping`: stage modes `presenter-center`, `presenter-small`, `screen-primary`, `no-presenter`; slots `top-left`, `top-right`, `edge-left`, `edge-right`.
- `spotlight`: stage modes `presenter-small`, `screen-primary`, `no-presenter`; slots `screen-primary`, `full-bleed`.
- `full-bleed` spotlight requires `no-presenter`.

Production rules:

- `assetIds` must include `content.props.assetId`.
- `sourceRefIds` must include `content.props.sourceRefId`.
- Asset type must be `screenshot`, `image`, or `chart` for production.
- `generated` may appear only in preview/demo and must never be treated as real evidence.
- Strict render requires source status `captured` or `verified`.
- `provided` source status is preview-only and should be upgraded before final render.
- Use at most 3 highlights and at most 2 annotations.
- Use normalized 0..1 coordinates for highlights and annotations.
- Do not create fake website, news, tweet, or report screenshots.
- Do not use a right-side rounded web-card layout or a bottom black `SOURCE` strip.

## MetricSpread

`MetricSpread` is ready for production.

Allowed placement rules:

- `presenter-center`: slots `top-left`, `edge-left`.
- `presenter-small`, `screen-primary`, `no-presenter`: slots `top-left`, `edge-left`, `screen-primary`.
- Do not use right-side slots for `MetricSpread`.
- Never use `bottom-left`, `bottom-right`, `center-overlay`, or `full-bleed`.

Production rules:

- `assetIds` should normally be `[]`.
- `sourceRefIds` must include `content.props.sourceRefId`.
- Use only `variant: "delta-ledger"` for now.
- Use 1 to 4 rows.
- Every row must provide `before`, `after`, or `delta`.
- Use `accent: "orange"` by default.
- Use `accent: "blue"` only for Agent, workflow, automation, engineering speed, or technical capability.
- Strict render requires source status `captured` or `verified`.
- `kind: "demo"` source is preview-only.
- Do not put full webpage screenshots, report images, or dense tables into `MetricSpread`; use `EvidenceClip` for source screenshots.

## EditorialOverlay

`EditorialOverlay` is ready for production.

Allowed placement rules:

- stage modes: `presenter-center`, `presenter-small`, `screen-primary`, `no-presenter`.
- slots: `top-left`, `top-right`, `edge-left`, `edge-right`.
- track: `overlay` only.
- Never use `bottom-left`, `bottom-right`, `center-overlay`, `full-bleed`, or `screen-primary`.

Production rules:

- `assetIds` should be `[]`.
- `sourceRefIds` should be `[]`.
- `content.props.placement` must match scene `slot`.
- `layout` must be `corner-stack`, `edge-rail`, `counterweight`, or `scatter`.
- `density` must be `light` or `medium`; there is no heavy mode.
- Use `accent: "orange"` by default.
- Use `accent: "blue"` only for Agent, automation, code, engineering, workflow, or technical capability.
- Use 1 to 4 items total.
- Use at most one `ghost-number`, one `keyword`, one `mini-list`, one `annotation`, and two `stat-tag` items.
- `mini-list.rows` must contain 2 to 4 short rows.
- `scatter` may use at most 2 items.
- Do not overlap `SectionStamp` or `HeadlineTakeover`; preview warns and strict render blocks.
- When overlapping `EvidenceClip`, `MetricSpread`, or `ConceptSplit`, use only `density: "light"`.
- Do not build HUD frames, TV sidebars, right news cards, dark battle panels, rounded white cards, dense tables, or pill tags.
