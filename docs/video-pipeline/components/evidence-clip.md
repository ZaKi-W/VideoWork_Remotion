# EvidenceClip

`EvidenceClip` 是证据剪报 / 来源素材展示组件。它用于展示已经由创作者提供或确认来源的真实素材，例如官网公告截图、新闻页面截图、产品发布页、价格页、数据报告局部、官方说明文档、研究报告图表、采访或评论截图。

它的任务是给观点提供可见依据，提高信息密度，让观众知道信息从哪里来。它不是装饰，也不是自动生成网页截图的工具。

## 什么时候用

- 需要证明一个功能已经上线。
- 需要展示官方公告、价格、产品页面。
- 需要展示新闻、报告、推文中的一句关键内容。
- 需要让观众看见原始依据。

## 什么时候不要用

- 只是解释概念。
- 没有可靠来源。
- 素材内容太小、太模糊、看不清。
- 每一句口播。
- 只是为了填满人物旁边的空间。

## 使用频率

- 一条 5 到 10 分钟视频，大约使用 3 到 8 次。
- 单个 EvidenceClip 停留时间建议至少 2.5 秒。
- 不要连续出现三张网页截图。
- 连续展示证据时，应该插入观点、数据、流程或录屏画面。

## 视觉规则

- 资料剪报、证据裁片、档案页局部、批注过的网页截图。
- 优先局部裁切和重点放大，不要把完整网页缩成小卡片。
- 截图必须有深灰细边、轻微阴影或底层纸面，避免与白墙融在一起。
- 来源标识是小型档案索引条，不是底部粗黑 `SOURCE` 条。
- 默认橙色用于重点结论、价格、变化、关键句。
- 蓝色用于技术流程、代码、Agent、工具能力。
- 禁止伪造官网截图、新闻页面、推文、数据图，禁止把 AI 生成图伪装成证据。

## Props

```ts
type EvidenceClipProps = {
  assetId: string;
  sourceRefId: string;
  variant?: 'clipping' | 'spotlight';
  placement: 'top-left' | 'top-right' | 'edge-left' | 'edge-right' | 'screen-primary' | 'full-bleed';
  crop?: {
    fit?: 'cover' | 'contain';
    focalPoint?: {x: number; y: number};
    aspectRatio?: 'auto' | '4:3' | '3:4' | '16:9';
  };
  sourceLabel?: string;
  headline?: string;
  highlights?: Array<{
    kind: 'marker' | 'box' | 'underline';
    x: number;
    y: number;
    width: number;
    height: number;
    color?: 'orange' | 'blue';
  }>;
  annotations?: Array<{
    text: string;
    x: number;
    y: number;
    side?: 'left' | 'right' | 'top' | 'bottom';
  }>;
  showReferenceStrip?: boolean;
};
```

## 模式限制

`clipping` 用于人物仍然存在时的辅助证据展示。

- stageMode：`presenter-center`、`presenter-small`、`screen-primary`、`no-presenter`
- slot：`top-left`、`top-right`、`edge-left`、`edge-right`

`spotlight` 用于资料本身成为当前讲解重点。

- stageMode：`presenter-small`、`screen-primary`、`no-presenter`
- slot：`screen-primary`、`full-bleed`
- `full-bleed` 只允许 `no-presenter`
- `presenter-center` 不允许 `spotlight`

## 素材准备格式

1. 截图放到：

```text
public/episodes/<slug>/assets/screenshots/
```

2. 在 `asset-manifest.json` 中登记：

- `assetId`
- `type`
- `path`
- `sourceRefId`
- `purpose`
- `sceneHints`

3. 在 `sources.json` 中登记：

- `sourceRefId`
- `title`
- `publisher`
- `url`
- `publishedAt`
- `status`

4. 在 `episode.json` 中通过：

```text
assetId + sourceRefId
```

引用素材。

## 校验规则

- `assetId` 必须存在于 `asset-manifest.json`。
- `sourceRefId` 必须存在于 `sources.json`。
- 本地素材路径必须存在。
- 正式 strict render 只允许 `screenshot`、`image`、`chart`。
- demo preview 可以使用 `generated`，但会 warning；strict render 会 blocking。
- strict render 中来源状态必须为 `captured` 或 `verified`。
- `provided` 只允许 preview warning 通过。
- `pending`、`provided`、`rejected` 不得作为正式 strict render 证据。
- `asset.sourceRefId` 必须为空或与 scene `sourceRefId` 一致。
- highlights 最多 3 个，annotations 最多 2 个。
- 高亮和批注坐标都使用 0 到 1 的归一化坐标，不能越界。
