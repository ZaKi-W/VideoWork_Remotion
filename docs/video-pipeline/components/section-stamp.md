# SectionStamp

`SectionStamp` 是强势章节标题 / 话题切换组件。它不是栏目标签，也不是轻量索引条，而是在话题切换时快速建立视觉重心的 Impact Chapter。

默认策略：短标题、两行、超粗、黑白高对比、一个强调词、一个强调色块、少量辅助信息。

核心画面是：黑色超粗中文标题 + 一个高对比强调色块 + 极少量浅灰编号或小标签。

## 什么时候用

- 开始一个新的章节。
- 从观点 A 进入观点 B。
- 进入工具演示前。
- 进入案例、数据、工作流、避坑等不同板块前。

## 什么时候不要用

- 每一句话之间。
- 同一主题内部的小补充。
- 需要一句核心观点压住全屏时。
- 需要展示新闻、网页、录屏、数据图时。
- 为了填满画面时。

## 使用频率

- 一条 5 到 10 分钟视频，通常使用 3 到 7 次。
- 两次 `SectionStamp` 之间尽量至少间隔 20 秒以上的有效内容。
- 不要连续两段都使用同样 placement 和同样 accent。

## Props

```ts
type SectionStampProps = {
  sectionNo: string;
  kicker: string;
  title: string;
  subline?: string;
  placement: 'top-left' | 'top-right' | 'edge-left' | 'edge-right';
  variant?: 'impact' | 'edge-impact' | 'index-strip' | 'edge-note';
  accent?: 'orange' | 'blue';
  brandLabel?: string;
  emphasis?: {
    text: string;
    color?: 'orange' | 'blue';
    mode?: 'highlight-block' | 'underline' | 'reverse';
  };
};
```

## 支持范围

- stageMode：`presenter-center`、`presenter-small`、`screen-primary`、`no-presenter`
- placement：`top-left`、`top-right`、`edge-left`、`edge-right`
- variant：`impact`、`edge-impact`
- 兼容旧配置：`index-strip` 映射为 `impact`，`edge-note` 映射为 `edge-impact`
- accent：`orange` 使用 signalOrange，`blue` 使用 electricBlue

## Variant

`impact`：默认形态。适合 `top-left` / `top-right`，用于常规章节切换。标题是主视觉，小编号和 kicker 只是辅助。

`edge-impact`：边缘压入形态。适合 `edge-left` / `edge-right`，用于案例、避坑、流程等板块入口。它比旧边签更强势，但不能变成电视侧栏。

## Emphasis

`emphasis.text` 必须是 `title` 中真实存在的连续文本。一次只允许一个强调词。

- `highlight-block`：强调词背后出现高饱和色块。
- `underline`：强调词使用粗下划线。
- `reverse`：强调词进入深色块，文字反白。

标题长度建议：优先 4 到 12 个中文字符，最多两行。标题会尊重手动换行；没有换行时自动拆成两行，避免孤立单字和英文单词中间断词。超过海报标题舒适长度会产生 warning，需要看关键帧确认可读性。

主标题使用 `visualTokens.fontFamily.display`，优先系统里的 Source Han Sans SC、Source Han Sans CN、MiSans、HarmonyOS Sans SC、PingFang SC、Microsoft YaHei。不要下载或嵌入字体文件。若系统缺少 Black / Heavy 字重，组件使用极轻微同色叠层和微量 scale 来增强厚度，不使用描边、发光或渐变字。

## 示例 Scene

```json
{
  "id": "scene-01",
  "start": 0,
  "end": 6,
  "track": "primary",
  "kind": "SectionStamp",
  "stageMode": "presenter-center",
  "slot": "top-left",
  "content": {
    "kind": "SectionStamp",
    "props": {
      "sectionNo": "01",
      "brandLabel": "ZAKI / NOTE",
      "kicker": "AI TOOL NOTE",
      "title": "工作流才是重点",
      "subline": "工具只是入口，不是终点",
      "placement": "top-left",
      "variant": "impact",
      "accent": "orange",
      "emphasis": {
        "text": "工作流",
        "color": "orange",
        "mode": "highlight-block"
      }
    }
  },
  "assetIds": [],
  "sourceRefIds": [],
  "status": "ready",
  "notes": ""
}
```

`slot` 与 `content.props.placement` 必须一致。

不要每一段都使用 `SectionStamp`。一条 5 到 10 分钟视频通常 3 到 7 次，两次之间尽量至少间隔 20 秒有效内容。
