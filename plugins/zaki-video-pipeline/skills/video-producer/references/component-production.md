# Component Production

## New Ready Component Demo Rule

Whenever a reusable component becomes `ready`, create a standalone demo episode for it in the project.

Requirements:

- Assign or keep a stable component code in `src/editorial/registry/component-catalog.ts`.
- Register a Remotion Studio Composition named `Cxx-ComponentName` so it can be opened directly from the left menu.
- Any change to a component's look, motion, layout, or behavior must be made in the component implementation itself so every episode/demo using it updates together. Do not patch only one episode config unless the user explicitly asks for a one-episode exception.
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

## Episode-Specific Effects

One-off effects must stay in the episode-specific component or folder that owns them.

Production rules:

- Do not promote one-off effects into the public component library unless they are expected to be reused at least twice.
- Register the component only when Remotion Studio needs to open it directly.
- Keep props narrow and tied to the approved storyboard.
- Text effects over talking-head footage must include a soft black gradient backplate by default, similar to the demo scrim, unless the background is already dark enough.
- Start the web preview for review before any render/export.
