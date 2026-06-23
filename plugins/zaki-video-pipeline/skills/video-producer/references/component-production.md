# Component Production

## New Ready Component Demo Rule

Whenever a reusable component becomes `ready`, create a standalone demo episode for it in the project.

Requirements:

- Use `episodes/demo-<component-name-kebab>/`.
- Put user-provided demo assets in `episodes/demo-<component-name-kebab>/assets/`.
- In `asset-manifest.json`, use paths relative to `public/`.
- Demonstrate only that component, without introducing future components early.
- Cover the component's representative modes, stage modes, and slots.
- Start the web preview for review before any render/export.
- If the demo uses a placeholder presenter, strict render must be blocked.

## NarrationEchoLayer

`NarrationEchoLayer` is ready for production.

Production rules:

- Use it only on `overlay` track.
- Use it for quiet narration echoes, not full claims or evidence.
- Allowed slots are `edge-left` and `top-left`.
- `content.props.placement` must match scene `slot`.
- Keep each line short and readable.
- Avoid presenter and subtitle safe zones.

## EvidenceClip

`EvidenceClip` is ready for production.

Production rules:

- `assetIds` must include `content.props.assetId`.
- `sourceRefIds` must include `content.props.sourceRefId`.
- Asset type must be `screenshot`, `image`, or `chart` for production.
- `generated` may appear only in preview/demo and must never be treated as real evidence.
- Strict render requires source status `captured` or `verified`.
- Use at most 3 highlights and at most 2 annotations.
- Do not create fake website, news, tweet, or report screenshots.

## MetricSpread

`MetricSpread` is ready for production.

Production rules:

- `assetIds` should normally be `[]`.
- `sourceRefIds` must include `content.props.sourceRefId`.
- Use only `variant: "delta-ledger"` for now.
- Use 1 to 4 rows.
- Every row must provide `before`, `after`, or `delta`.
- Strict render requires source status `captured` or `verified`.
- Do not put full webpage screenshots, report images, or dense tables into it.

## Episode-Specific Effects

One-off effects must stay in the episode-specific component or folder that owns them.

Production rules:

- Do not promote one-off effects into the public component library unless they are expected to be reused at least twice.
- Register the component only when Remotion Studio needs to open it directly.
- Keep props narrow and tied to the approved storyboard.
- Start the web preview for review before any render/export.
