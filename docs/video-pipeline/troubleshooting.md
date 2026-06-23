# Troubleshooting

## Remotion render 失败

先运行：

```bash
npm run episode:validate -- --episode <slug>
```

如果是 strict render，运行：

```bash
npm run episode:validate -- --episode <slug> --strict
```

## 素材找不到

先确认素材文件在 episode 输入目录：

```text
episodes/<slug>/assets/example.png
```

如果 `script.md` 中写的是 Obsidian 格式：

```md
![[example.png|574]]
```

文件名会按 `example.png` 匹配，后面的 `|574` 会被忽略。

`asset-manifest.json` 的 `path` 仍然写相对 `public/` 的路径，例如 `episodes/<slug>/assets/example.png`。运行 `episode:validate`、`episode:frames`、`episode:preview` 或 `episode:render` 时，脚本会自动把 `episodes/<slug>/assets/` 镜像到 `public/episodes/<slug>/assets/`。

## Storyboard 无法进入 Producer

确认 `storyboard.md` 顶部状态是：

```text
状态：APPROVED
```

## 高清渲染被阻止

第一阶段这是预期行为。prototype/planned 组件、placeholder presenter 都不能进入 strict render。
