# Component Selection

## SectionStamp

Use `SectionStamp` when:

- A new chapter starts.
- The video moves from topic A to topic B.
- A tool demo, case study, data section, workflow section, or pitfalls section begins.

`SectionStamp` is an Impact Chapter: a strong title moment, not a small index strip or TV-style corner label. Its title is the main visual.

Default strategy:

- Short title.
- Two lines.
- Extra-bold black Chinese typography.
- One emphasis word.
- One orange or blue emphasis block.
- Very little supporting metadata.

Use `impact` for normal top-left / top-right chapter turns.

Use `edge-impact` for a side-pushed chapter moment such as case study, workflow, data, or pitfalls.

Use `emphasis` when one phrase in the title should carry the turn:

- `highlight-block` for a strong colored keyword.
- `underline` for a quieter but still bold mark.
- `reverse` for a black block / reversed word.

Do not use `SectionStamp`:

- Between every sentence.
- For a small aside inside the same topic.
- When a full-screen core claim is needed; use `HeadlineTakeover` later.
- When showing news, webpages, recordings, or data charts.
- Just to fill empty space.

Recommended frequency: 3 to 7 times in a 5 to 10 minute video, with at least about 20 seconds of meaningful content between uses.

## HeadlineTakeover

Use `HeadlineTakeover` when:

- One sentence is the strongest point in a segment.
- A conclusion needs to land hard.
- A turn or reversal changes the audience's interpretation.
- A key judgment should become the memory point of a chapter.

`HeadlineTakeover` is not a chapter marker. It should not show section numbers, kicker text, brand labels, English index labels, side tabs, or layered metadata. Its title is bigger, simpler, and more direct than `SectionStamp`.

Modes:

- `punch`: a side-dominant claim that presses in from the edge.
- `wrap`: an asymmetrical claim around the presenter safe zone.
- `takeover`: a no-presenter or screen-primary claim that briefly takes over the frame.

Use `emphasis` once per component:

- `highlight-block` for the strongest keyword.
- `reverse` for a reversed block word.
- `underline` for a thick, quieter mark.

Do not use `HeadlineTakeover`:

- For ordinary transitions.
- For every sentence.
- For ordinary titles.
- For news, websites, screen recordings, or data explanations.
- Immediately next to `SectionStamp` in the same segment.

Recommended frequency: 2 to 5 times in a 5 to 10 minute video, with about 20 to 40 seconds of meaningful content between uses.

## ConceptSplit

Use `ConceptSplit` when:

- Explaining the difference between two concepts.
- Explaining an old way versus a new way of working.
- Explaining a cognitive upgrade such as chat to execution, tools to workflow, or prompts to delivery.
- A single contrast can help the audience understand an abstract idea quickly.

`ConceptSplit` is an Editorial Contrast Cut. It should contain one old concept, one new concept, a restrained cut/divider/bridge, and one accent moment.

Modes:

- `cross-cut`: presenter remains visible; concept words wrap around the presenter safe zone asymmetrically.
- `editorial-fold`: no-presenter or screen-primary concept takeover with a paper fold/cut.
- `handoff`: edge or screen-primary transition from one work mode to another.

Do not use `ConceptSplit`:

- For pure numbers; use `MetricSpread`.
- For news, webpages, reports, or screenshots; use `EvidenceClip`.
- For detailed steps; use `WorkflowPath` later.
- For real software interfaces; use `DemoFocusFrame` later.
- For more than two concepts.
- Without a clear contrast relationship.
- In the same spoken segment as `HeadlineTakeover`.

Recommended frequency: 2 to 5 times in a 5 to 10 minute video. Insert narration, data, evidence, screen recording, or examples between uses. Two consecutive `ConceptSplit` scenes must change `mode` or `anchor`.

## EvidenceClip

Use `EvidenceClip` when:

- A feature launch, policy, pricing change, product page, official note, news item, report, tweet, or chart needs visible evidence.
- The audience should see the original basis behind the narration.
- A single sentence or figure from a source materially supports the claim.

Use `clipping` when the presenter remains the main human anchor and the evidence should appear as a cropped side document.

Use `spotlight` when the source itself is the current visual subject and should briefly take over the frame.

Do not use `EvidenceClip`:

- To explain an abstract concept without a reliable source.
- When the asset is too small, blurred, or unreadable.
- For every spoken sentence.
- Just to fill empty space around the presenter.
- With AI-generated images disguised as real evidence.

Recommended frequency: 3 to 8 times in a 5 to 10 minute video. Keep each clip on screen for at least about 2.5 seconds and avoid three web screenshots in a row.

## MetricSpread

Use `MetricSpread` when:

- One key number should become the audience memory point.
- There is a clear before/after change.
- There is a price, cost, time, efficiency, ratio, or performance comparison.
- The numbers have a traceable source.

`MetricSpread` is a Data Ledger, not a chart dashboard. It should contain one dominant number, 1 to 4 ledger rows, and a quiet source index.

Placement: use only `top-left`, `edge-left`, or `screen-primary`. Do not select right-side slots for `MetricSpread`.

Do not use `MetricSpread`:

- For opinions without data.
- When data exceeds four rows.
- Without a reliable source.
- When the viewer needs to inspect the original webpage or report; use `EvidenceClip`.
- Just to fill empty space.

Recommended frequency: 2 to 6 times in a 5 to 10 minute video. Do not use `HeadlineTakeover` and `MetricSpread` in the same spoken segment.

## EditorialOverlay

Use `EditorialOverlay` when:

- A normal talking-head segment feels visually empty.
- One short keyword needs quiet support.
- Two to four short facts, labels, or reminders help maintain information density.
- A small metric tag or short editorial annotation is enough.

`EditorialOverlay` is information air, not a main visual. It should sit on the `overlay` track and stay lighter than the presenter and any main component.

Use atoms:

- `ghost-number` for weak chapter, phase, or index atmosphere.
- `keyword` for one short word or phrase.
- `mini-list` for 2 to 4 short rows.
- `stat-tag` for one tiny data marker.
- `annotation` for one short note and a short guide line.

Do not use `EditorialOverlay`:

- For chapter starts; use `SectionStamp`.
- For core claims; use `HeadlineTakeover`.
- For evidence screenshots or source material; use `EvidenceClip`.
- For important numbers or before/after data; use `MetricSpread`.
- For two-concept explanation; use `ConceptSplit`.
- For screen demos or complex workflows.
- During `SectionStamp` or `HeadlineTakeover`.
- Just because every sentence seems to need motion.

Recommended frequency: 6 to 15 times in a 5 to 10 minute video, usually 3 to 8 seconds each. Do not repeat the same layout in adjacent uses, and do not use the same item combination three times in a row.
