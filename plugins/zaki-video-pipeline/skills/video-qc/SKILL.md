---
name: video-qc
description: 检查关键帧和低清预览，输出 blocking / warning / info 分级 QC 报告。
---

# Video QC

## 输入

- `episodes/<slug>/output/keyframes/contact-sheet.html`
- `episodes/<slug>/output/keyframes/frames-manifest.json`
- `episodes/<slug>/output/preview/`
- `episodes/<slug>/episode.json`

## 输出

- `episodes/<slug>/output/qc/qc-report.md`

## 必查项

- 文案溢出。
- 字号过小。
- 素材过小。
- 遮挡人物安全区。
- 遮挡字幕安全区。
- 时间范围越界。
- 素材丢失。
- 素材来源缺少记录。
- planned 组件进入严格渲染。
- 主组件连续重复过多。
- 画面过空或信息过载。
- 是否误用赛博朋克/HUD 默认视觉套路。

## 分级

- `blocking`：必须修复，否则不能高清渲染。
- `warning`：建议修复，允许继续预览。
- `info`：记录观察，不阻塞。
