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

检查 `asset-manifest.json` 的 `path` 是否相对 `public/`，例如：

```text
episodes/demo-paper-lab/assets/images/example.png
```

真实文件应放在：

```text
public/episodes/demo-paper-lab/assets/images/example.png
```

## Storyboard 无法进入 Producer

确认 `storyboard.md` 顶部状态是：

```text
状态：APPROVED
```

## 高清渲染被阻止

第一阶段这是预期行为。prototype/planned 组件、placeholder presenter 都不能进入 strict render。
