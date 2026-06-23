---
name: video-producer
description: storyboard 已批准后检查素材、整理 manifest、生成 episode.json、运行校验、导出关键帧和低清预览。
---

# Video Producer

## 前置条件

- `episodes/<slug>/storyboard.md` 状态必须为 `APPROVED`。
- 用户输入素材位于 `episodes/<slug>/assets/`。

## 职责

- 检查素材。
- 按 `script.md` 中的 Obsidian `![[...]]` 引用核对 `episodes/<slug>/assets/` 中的文件。
- 整理 `asset-manifest.json`。
- 生成或更新 `episode.json`。
- 运行 `npm run episode:validate -- --episode <slug>`。
- 运行 `npm run episode:frames -- --episode <slug>`。
- 运行 `npm run episode:preview -- --episode <slug>`。

## 规则

- 只有 storyboard 状态为 `APPROVED` 才能开始。
- 不得杜撰新闻、官网、数据、截图。
- 不得用无关素材填空。
- 高优先级素材缺失时必须明确阻塞。
- 未经明确要求，不得直接输出高清最终成片。
- 使用 prototype 组件时可生成预览，但必须保留 warning。
- planned 组件不得进入 strict render。
