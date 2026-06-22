# Component Production

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
