# Component Production

## New Ready Component Demo Rule

Whenever a component becomes `ready`, create a standalone demo episode for it in the project.

Requirements:

- Use `episodes/demo-<component-name-kebab>/`.
- Use `public/episodes/demo-<component-name-kebab>/assets/`.
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
