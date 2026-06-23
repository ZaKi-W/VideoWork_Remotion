# Component QC

## NarrationEchoLayer

Check:

- It reads as a quiet narration echo, not a main title card.
- It uses only `edge-left` or `top-left`.
- `slot` matches `content.props.placement`.
- It avoids presenter face, upper body, hands, and subtitle safe zones.
- Lines remain short and readable.
- It is not used for every sentence.

## EvidenceClip

Check:

- It reads as a cropped evidence clipping, document excerpt, archive page, or annotated source material.
- It does not fake a website, news page, tweet, product page, or chart.
- `assetId` exists in `asset-manifest.json` and the local file exists.
- `sourceRefId` exists in `sources.json`.
- Source has `title`, `publisher`, and either `url` or an explicit local verification note.
- Strict render uses only `captured` or `verified` sources.
- Screenshot text is readable.
- There are no more than 3 highlights and no more than 2 annotations.

## MetricSpread

Check:

- It reads as Data Ledger / 数据账页, not a normal table, Excel screenshot, finance TV chart, or dark HUD.
- The primary number is the dominant visual.
- Rows stay between 1 and 4.
- Every row has meaningful data and does not contain long prose.
- Only one value per row is emphasized.
- `sourceRefId` exists in `sources.json`.
- Source has `title`, `publisher`, and either `url` or an explicit local verification note.
- Strict render uses only `captured` or `verified` sources.
- It uses only `top-left`, `edge-left`, or `screen-primary`.

## Episode-Specific Effects

Check:

- The effect matches the approved storyboard for that episode.
- It does not enter presenter or subtitle safe zones.
- It has one primary visual task per spoken segment.
- It does not duplicate a reusable component unless the reusable component is intentionally selected.
- It is previewed in the web studio before any render/export.
