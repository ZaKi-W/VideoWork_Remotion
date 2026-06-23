# Component QC

## NarrationEchoLayer

Check:

- It reads as a quiet narration echo, not a main title card.
- It uses only `edge-left` or `top-left`.
- `slot` matches `content.props.placement`.
- It avoids presenter face, upper body, hands, and subtitle safe zones.
- Lines remain short and readable.
- It is not used for every sentence.

## Episode-Specific Effects

Check:

- If the change is about a reusable component's style, motion, layout, or behavior, the implementation changed at the component level rather than only in one episode config.
- The effect matches the approved storyboard for that episode.
- It does not enter presenter or subtitle safe zones.
- Text has a soft black gradient backplate when placed over talking-head footage.
- It has one primary visual task per spoken segment.
- It does not duplicate a reusable component unless the reusable component is intentionally selected.
- It is previewed in the web studio before any render/export.
