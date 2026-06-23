# Component QC

## SectionStamp

Check:

- It reads as an Impact Chapter with a dominant bold title, not a small TV corner bug or old index strip.
- The title is the main visual, not a label beside a decorative bar.
- The title is short, two-line, extra-bold, and high contrast.
- There is only one emphasis word and one emphasis color block.
- Supporting metadata stays visually quiet and small.
- It does not enter presenter safe zone.
- It does not enter subtitle safe zone.
- It uses only `top-left`, `top-right`, `edge-left`, or `edge-right`.
- `slot` matches `content.props.placement`.
- Title remains readable and no more than two visual lines.
- `edge-impact` remains a strong side composition and does not become a traditional side panel.
- `emphasis.text` appears in the title and only one emphasis is used.
- Orange and blue accents are used with restraint.
- It does not look like cyberpunk, HUD, neon, glassmorphism, or a rounded web card.

## HeadlineTakeover

Check:

- It reads as the strongest point, conclusion, reversal, key judgment, or chapter memory point.
- It does not read as a chapter marker, ordinary title card, lower third, or TV package.
- There is no section number, kicker, brand label, English index, side tab, long subline, or layered metadata.
- The title is the only dominant visual and remains much larger than body text.
- The title uses 1 to 3 lines, extra-bold black typography, tight line-height, and restrained letter spacing.
- There is only one emphasis word or phrase.
- Orange and blue are not used together for emphasis.
- `punch` uses only edge/top slots and does not enter face, upper-body, gesture, or subtitle safe zones.
- `wrap` surrounds the presenter asymmetrically and does not become two neat panels.
- `takeover` appears only in `no-presenter` or `screen-primary`.
- `presenter-center` never uses `takeover`, `center-overlay`, `full-bleed`, or `allowSubjectOverlay`.
- It does not show news, website, screen-recording, or metric evidence without source binding.
- It does not look like cyberpunk, HUD, neon, glassmorphism, a web card, or old TV graphics.
- In a 5 to 10 minute video, usage stays around 2 to 5 times with roughly 20 to 40 seconds of meaningful content between uses.

## ConceptSplit

Check:

- It reads as Editorial Contrast Cut / 编辑对照切片, not a chapter marker, claim takeover, data table, evidence screenshot, or software demo.
- There are exactly two concepts or work modes, with a clear `versus`, `from-to`, or `not-but` relationship.
- The new concept has visibly more weight than the old concept.
- It does not become traditional left/right PPT columns.
- It does not become two rounded white cards or a red/blue battle layout.
- `cross-cut` wraps around the presenter safe zone asymmetrically and does not cover face, upper body, hands, or subtitle safe zone.
- `editorial-fold` uses `no-presenter` or `screen-primary` only, and keeps readable content above subtitle safe zone.
- `handoff` uses only `presenter-small`, `screen-primary`, or `no-presenter`, and reads as one key transfer, not a multi-step flowchart.
- Title remains the dominant layer and is no more than two visual lines per side.
- Descriptions and points remain short; no paragraphs, tables, rankings, or dense bullets.
- Only one side uses accent emphasis.
- Blue is used only for Agent, automation, code, engineering, workflow, or technical capability.
- It does not appear in the same spoken segment as `HeadlineTakeover`.
- Consecutive `ConceptSplit` scenes change `mode` or `anchor`.
- In a 5 to 10 minute video, usage stays around 2 to 5 times.

## EvidenceClip

Check:

- It reads as a cropped evidence clipping, document excerpt, archive page, or annotated source material.
- It does not read as a right-side giant white rounded web card.
- It does not use a bottom black `SOURCE` bar.
- It does not fake a website, news page, tweet, product page, or chart.
- `assetId` exists in `asset-manifest.json` and the local file exists.
- `sourceRefId` exists in `sources.json`.
- `asset.sourceRefId` is empty or matches the scene `sourceRefId`.
- Source has `title`, `publisher`, and either `url` or an explicit local verification note.
- Strict render uses only `captured` or `verified` sources.
- Strict render does not use `generated` evidence assets.
- Preview-only demo generated assets are visibly labeled as not real sources.
- `clipping` uses only edge/top slots and does not enter face, upper-body, gesture, or subtitle safe zones.
- `spotlight` uses only `screen-primary` or `full-bleed`; full-bleed has no presenter.
- Screenshot text is not shrunk into unreadable decoration.
- There are no more than 3 highlights and no more than 2 annotations.
- Highlights match explicit scene coordinates and do not look guessed.
- Reference strip is readable but quiet.
- In a 5 to 10 minute video, usage stays around 3 to 8 times, with no three web screenshots in a row.

## MetricSpread

Check:

- It reads as Data Ledger / 数据账页, not a normal table, Excel screenshot, finance TV chart, or dark HUD.
- The primary number is the dominant visual and stays extra-bold.
- There is only one main judgment.
- Rows stay between 1 and 4.
- Every row has meaningful data and does not contain long prose.
- Only one value per row is emphasized.
- The ratio bar is a single quiet bar, not a chart system.
- Source index is readable but quiet and does not become a black `SOURCE` bar.
- It uses only `top-left`, `edge-left`, or `screen-primary`; right-side slots are not allowed.
- `sourceRefId` exists in `sources.json`.
- Source has `title`, `publisher`, and either `url` or an explicit local verification note.
- Strict render uses only `captured` or `verified` sources.
- Strict render does not use `kind: "demo"` sources.
- `presenter-center` uses only left-side edge/top slots and avoids face, upper-body, gesture, and subtitle safe zones.
- `screen-primary` is not used with `presenter-center`.
- It does not appear in the same spoken segment as `HeadlineTakeover`.
- In a 5 to 10 minute video, usage stays around 2 to 6 times.
