# React Bits 视觉原语引入 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从 React Bits 中选择性吸收语义文字聚焦、HUD 焦点迁移和像素揭示三类设计，重写为 Remotion 原生、逐帧确定、可在现有组件中复用的 C28-C30 视觉原语。

**Architecture:** 不安装 React Bits 整包，也不引入 GSAP、Motion、OGL 或 Three.js。新增三个独立公共组件，统一使用 `useCurrentFrame()`、`interpolate()`、`spring()` 和现有 `src/editorial/shared/motion.ts` 驱动；先注册独立 Studio Demo，再分别接入摘要组件与全屏内容组件。React Bits 只作为视觉与交互逻辑参考，所有时间控制改写为 Remotion 帧驱动。

**Tech Stack:** React 19、TypeScript、Remotion 4、Zod、Vitest、React Bits 设计参考

---

## 0. 执行边界

- 不运行 `episode:preview`、`episode:render`、`remotion render` 或其他视频导出命令。
- 不进行深度测试；每个任务只运行与当前改动相关的测试，最终运行一次 `npm run lint`、`npm run typecheck`、`npm run test` 和 `npm run episode:smoke`。
- 实现完成后必须启动 `npm run dev`，提供 Studio 网页预览地址，等待用户确认。
- 不新增任何渐变。背景、遮罩、边框和光效只能使用纯色、透明度、阴影、SVG、`clip-path` 和 `filter`。
- 正文不得进入底部字幕安全区 `y >= 885px`；人物居中时，普通组件不得进入人物安全区。
- C16、C21、C23-C26 的改动必须继续遵守 `docs/visual-redesign-guide-c16-c21-c23-c26.md`。
- 优先修改公共原语本体，不在单个 episode 中覆盖样式或时间参数。
- 当前工作区已有用户未提交改动；执行前先运行 `git status --short`，不得覆盖或清理这些改动。

## 1. 引入范围与来源映射

| 新编号 | 组件 | React Bits 参考 | 首批使用位置 | 主要视觉任务 |
| --- | --- | --- | --- | --- |
| C28 | `SemanticTextReveal` | True Focus、Split Text、Blur Text、Scrambled Text | C16、C23、C24 | 逐词聚焦、逐词错峰、轻模糊揭示 |
| C29 | `FocusReticle` | True Focus 的焦点边界与 Spotlight 类构图 | C21、C25、C26 | 在列表项、卡片或关键词之间迁移 HUD 焦点 |
| C30 | `PixelReveal` | Pixel Transition | C05、C06、C09、C11、C12、C27 | 证据、数据状态和内容区的像素网格揭示 |

这三项均为“参考后重写”，不得复制 React Bits 的运行时计时器、hover/click 触发、IntersectionObserver、随机动画或 GSAP timeline。若直接改编了实质性源码，必须在 `THIRD_PARTY_NOTICES.md` 中保留来源 URL、组件名、版权和 React Bits 许可证说明。

## 2. 文件结构

**新增：**

- `src/editorial/components/SemanticTextReveal.tsx`：C28 逐词/逐字语义揭示。
- `src/editorial/components/FocusReticle.tsx`：C29 可移动 HUD 焦点框。
- `src/editorial/components/PixelReveal.tsx`：C30 确定性像素网格揭示。
- `src/editorial/fixtures/demo-react-bits-primitives.ts`：C28-C30 独立 Studio Demo。
- `tests/react-bits-primitives.test.ts`：纯函数、确定性和边界测试。
- `THIRD_PARTY_NOTICES.md`：React Bits 来源与许可证记录。

**修改：**

- `src/editorial/shared/motion.ts`：加入可测试的区间进度与 stagger 计算。
- `src/editorial/registry/component-catalog.ts`：登记 C28-C30 稳定编号。
- `src/editorial/registry/component-registry.ts`：登记用途、stageMode、slot 和 renderer。
- `src/editorial/registry/component.types.ts`：将 `ComponentCategory` 扩展为 `regular | system | primitive`。
- `src/editorial/schema/episode.schema.ts`：加入三个 props schema 和 component kind。
- `src/editorial/schema/episode.types.ts`：从 schema 推导并导出对应类型。
- `src/editorial/fixtures/demo-component-catalog.ts`：若沿用统一 Demo 表，则合并 C28-C30 demo。
- `src/Root.tsx`：确保 C28-C30 出现在 Remotion Studio 左侧 Composition 菜单。
- `src/editorial/components/NarrationEchoLayer.tsx`：C16 接入 C28。
- `src/editorial/components/RemotionTalkEffect.tsx`：C21 接入 C29。
- `src/editorial/components/SummaryComponents.tsx`：C23/C24 接入 C28，C25/C26 接入 C29。
- `src/editorial/components/AcidComponent.tsx`：仅在指定 C05/C06/C09/C11/C12 分支接入 C30。
- `src/editorial/shot/ShotDirector.tsx`：在内容接管阶段可选接入 C30。
- `docs/component-and-shot-layout-guide.md`：记录 C28-C30 的 props、动效、布局、stageMode、slot 和使用约束，同时更新被接入组件的行为说明。

## 3. 固定 API

### C28 `SemanticTextReveal`

```ts
export type SemanticTextRevealMode = 'words' | 'characters' | 'focus';

export type SemanticTextRevealViewProps = {
  text: string;
  mode?: SemanticTextRevealMode;
  emphasis?: string[];
  activeIndex?: number;
  startFrame?: number;
  durationInFrames?: number;
  staggerFrames?: number;
  blurPx?: number;
  accentColor?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  style?: React.CSSProperties;
};
```

组件文件同时导出：

```ts
export const SemanticTextRevealView = (props: SemanticTextRevealViewProps) => JSX.Element;
export const SemanticTextReveal = (rendererProps: ComponentRendererProps) => JSX.Element;
```

现有 C16/C23/C24 复用 `SemanticTextRevealView`；registry 和独立 Studio Composition 使用 `SemanticTextReveal` renderer。scene schema 只暴露可序列化字段，不包含 `className`、`style`。

约束：

- 默认 `mode="words"`、`startFrame=0`、`durationInFrames=18`、`staggerFrames=2`、`blurPx=8`。
- 中文按标点和连续语义片段切分；无法可靠切词时按字符切分，但标点依附前一单元。
- `focus` 模式只降低非当前单元的不透明度和增加轻微模糊，不允许使用灰色文字。
- 字体颜色保持白色或 `accentColor`；非焦点文本至少 `opacity: 0.52`，并保留复合黑色 `textShadow`。
- 所有状态由 `frame` 推导，不使用 CSS keyframes、定时器或组件内部 state。

### C29 `FocusReticle`

```ts
export type FocusReticleTarget = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FocusReticleViewProps = {
  targets: FocusReticleTarget[];
  activeIndex: number;
  previousIndex?: number;
  transitionStartFrame?: number;
  transitionDurationInFrames?: number;
  accentColor?: string;
  cornerLength?: number;
  lineWidth?: number;
  padding?: number;
};
```

组件文件同时导出 `FocusReticleView(props)` 和符合 `ComponentRendererProps` 的 `FocusReticle(rendererProps)`；C21/C25/C26 只复用 View。

约束：

- 默认只绘制四个直角角标、中心 `+` 准心和一个低透明呼吸点，不绘制实色底板。
- 从前一目标到当前目标的 `x/y/width/height` 均由同一进度插值，避免边框先到、尺寸后到。
- `activeIndex` 越界时返回 `null`；目标尺寸为零或负数时不绘制。
- 不依赖 DOM 测量作为渲染前提。调用方应传入由现有固定布局计算得到的目标矩形。

### C30 `PixelReveal`

```ts
export type PixelRevealViewProps = {
  children: React.ReactNode;
  progress: number;
  columns?: number;
  rows?: number;
  direction?: 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'center-out';
  cellGap?: number;
  pixelColor?: string;
  seed?: string;
  style?: React.CSSProperties;
};
```

组件文件同时导出 `PixelRevealView(props)` 和符合 `ComponentRendererProps` 的 `PixelReveal(rendererProps)`。由于 ReactNode 不能写入 episode JSON，C30 的独立 scene renderer 使用 schema 中的演示标题、说明和数值组装内部内容；C05/C06/C09/C11/C12/C27 复用 View 并传入真实 `children`。

约束：

- 默认 `columns=12`、`rows=7`、`direction="left-to-right"`、`cellGap=2`。
- `progress` 必须由调用方通过当前帧计算并钳制在 `0..1`。
- 网格顺序由坐标、方向和固定 `seed` 决定；禁止 `Math.random()`。
- `children` 始终存在于 DOM 中，通过确定性遮罩层或单元裁切揭示，避免内容反复挂载。
- 人物居中画面只允许作用于人物安全区之外的内容区，不得把像素块覆盖到人脸或字幕。

## 4. 实施任务

### Task 1：建立确定性运动辅助函数与测试

**Files:**

- Modify: `src/editorial/shared/motion.ts`
- Create: `tests/react-bits-primitives.test.ts`

- [ ] **Step 1：先写失败测试**

测试必须覆盖：

```ts
import {describe, expect, it} from 'vitest';
import {frameRangeProgress, orderedGridCells} from '../src/editorial/shared/motion';

describe('React Bits 视觉原语运动辅助函数', () => {
  it('将帧区间进度钳制在 0 到 1', () => {
    expect(frameRangeProgress(5, 10, 20)).toBe(0);
    expect(frameRangeProgress(15, 10, 20)).toBeCloseTo(0.5);
    expect(frameRangeProgress(25, 10, 20)).toBe(1);
  });

  it('相同 seed 生成相同像素顺序', () => {
    expect(orderedGridCells(4, 3, 'center-out', 'demo')).toEqual(
      orderedGridCells(4, 3, 'center-out', 'demo'),
    );
  });

  it('像素顺序包含每个单元且不重复', () => {
    const cells = orderedGridCells(4, 3, 'left-to-right', 'demo');
    expect(cells).toHaveLength(12);
    expect(new Set(cells.map(({column, row}) => `${column}:${row}`)).size).toBe(12);
  });
});
```

- [ ] **Step 2：运行目标测试确认失败**

Run: `npx vitest run tests/react-bits-primitives.test.ts`

Expected: FAIL，提示 `frameRangeProgress` 或 `orderedGridCells` 尚未导出。

- [ ] **Step 3：实现最小确定性辅助函数**

在 `motion.ts` 中新增并导出：

```ts
export type GridDirection =
  | 'left-to-right'
  | 'right-to-left'
  | 'top-to-bottom'
  | 'center-out';

export const frameRangeProgress = (frame: number, start: number, end: number): number => {
  if (end <= start) return frame >= start ? 1 : 0;
  return Math.max(0, Math.min(1, (frame - start) / (end - start)));
};

export const orderedGridCells = (
  columns: number,
  rows: number,
  direction: GridDirection,
  seed: string,
): Array<{column: number; row: number}> => {
  const safeColumns = Math.max(1, Math.floor(columns));
  const safeRows = Math.max(1, Math.floor(rows));
  const seedValue = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const cells = Array.from({length: safeColumns * safeRows}, (_, index) => ({
    column: index % safeColumns,
    row: Math.floor(index / safeColumns),
  }));
  const centerX = (safeColumns - 1) / 2;
  const centerY = (safeRows - 1) / 2;

  return cells.sort((a, b) => {
    const score = (cell: {column: number; row: number}) => {
      if (direction === 'right-to-left') return -cell.column * 1000 + cell.row;
      if (direction === 'top-to-bottom') return cell.row * 1000 + cell.column;
      if (direction === 'center-out') {
        return Math.hypot(cell.column - centerX, cell.row - centerY) * 1000;
      }
      return cell.column * 1000 + cell.row;
    };
    const delta = score(a) - score(b);
    if (delta !== 0) return delta;
    return ((a.column * 31 + a.row * 17 + seedValue) % 97) -
      ((b.column * 31 + b.row * 17 + seedValue) % 97);
  });
};
```

- [ ] **Step 4：运行目标测试确认通过**

Run: `npx vitest run tests/react-bits-primitives.test.ts`

Expected: PASS。

### Task 2：实现并注册 C28 `SemanticTextReveal`

**Files:**

- Create: `src/editorial/components/SemanticTextReveal.tsx`
- Modify: `src/editorial/schema/episode.schema.ts`
- Modify: `src/editorial/schema/episode.types.ts`
- Modify: `src/editorial/registry/component-catalog.ts`
- Modify: `src/editorial/registry/component-registry.ts`
- Modify: `src/editorial/registry/component.types.ts`
- Modify: `src/editorial/fixtures/demo-react-bits-primitives.ts`
- Modify: `src/Root.tsx`
- Test: `tests/react-bits-primitives.test.ts`

- [ ] **Step 1：增加文本切分测试**

增加测试，确认中文标点不会独立成为动画单元，空文本返回空数组，英文连续单词按空格分组。将切分函数命名为：

```ts
export const splitSemanticText = (text: string, mode: 'words' | 'characters' | 'focus'): string[];
```

- [ ] **Step 2：运行目标测试确认失败**

Run: `npx vitest run tests/react-bits-primitives.test.ts`

Expected: FAIL，提示 `splitSemanticText` 尚未导出。

- [ ] **Step 3：实现 C28**

实现要求：

- 组件内部读取 `useCurrentFrame()`。
- 每个单元使用 `frameRangeProgress(frame, unitStart, unitEnd)`。
- 入场只使用 `opacity`、`transform: translate3d(...) scale(...)` 和 `filter: blur(...)`。
- `emphasis` 命中的单元使用明确品牌强调色，不使用渐变文字。
- 根节点使用 `display: inline-flex` 或可换行 flex，不改变调用方现有标题宽度。
- 必须输出稳定 React key；同一文本、同一帧渲染结果完全一致。

- [ ] **Step 4：登记 C28**

先将 `ComponentCategory` 扩展为：

```ts
export type ComponentCategory = 'regular' | 'system' | 'primitive';
```

在 catalog 中追加：

```ts
{code: 'C28', kind: 'SemanticTextReveal', category: 'primitive', tags: ['text', 'motion']}
```

registry 设置：

- `purpose`: `视觉原语 / 逐词聚焦与语义文字揭示`
- `allowedStageModes`: `['no-presenter', 'presenter-center', 'presenter-small']`
- `allowedSlots`: `['full-bleed', 'edge-left', 'edge-right', 'top-left', 'top-right']`
- `requiresSource`: `false`
- `requiresAsset`: `false`
- `implementationStatus`: `ready`

- [ ] **Step 5：增加独立 Studio Demo**

Demo 使用三行固定文案，依次展示 `words`、`characters`、`focus`，Composition ID 必须为 `C28-SemanticTextReveal`，画面中显示安全区辅助线但正文不进入字幕安全区。

- [ ] **Step 6：运行轻量验证**

Run:

```bash
npm run typecheck
npx vitest run tests/react-bits-primitives.test.ts
```

Expected: 全部通过。

### Task 3：实现并注册 C29 `FocusReticle`

**Files:**

- Create: `src/editorial/components/FocusReticle.tsx`
- Modify: `src/editorial/schema/episode.schema.ts`
- Modify: `src/editorial/schema/episode.types.ts`
- Modify: `src/editorial/registry/component-catalog.ts`
- Modify: `src/editorial/registry/component-registry.ts`
- Modify: `src/editorial/registry/component.types.ts`
- Modify: `src/editorial/fixtures/demo-react-bits-primitives.ts`
- Modify: `src/Root.tsx`
- Test: `tests/react-bits-primitives.test.ts`

- [ ] **Step 1：增加矩形插值测试**

新增纯函数：

```ts
export const interpolateReticleRect = (
  from: FocusReticleTarget,
  to: FocusReticleTarget,
  progress: number,
): FocusReticleTarget;
```

测试 `progress=0` 等于 `from`、`progress=1` 等于 `to`、`progress=0.5` 的四个数值均为中点。

- [ ] **Step 2：运行目标测试确认失败**

Run: `npx vitest run tests/react-bits-primitives.test.ts`

Expected: FAIL，提示 `interpolateReticleRect` 尚未导出。

- [ ] **Step 3：实现 C29**

实现要求：

- 使用绝对定位的单个根节点移动焦点框，不为每个目标创建一套常驻边框。
- 四个角标均为纯色 `1px` 线段；禁止渐变、实色大底板和灰色说明文字。
- 焦点移动时间默认 12 帧，使用 `Easing.bezier(0.16, 1, 0.3, 1)`。
- 呼吸点必须由 `frame` 的周期函数计算，禁止 CSS keyframes。
- 根节点设置 `pointerEvents: 'none'`。

- [ ] **Step 4：登记 C29 并添加 Demo**

Catalog：

```ts
{code: 'C29', kind: 'FocusReticle', category: 'primitive', tags: ['hud', 'focus']}
```

Demo 设置三个固定矩形，按固定帧段从上到下迁移。Composition ID 必须为 `C29-FocusReticle`。

- [ ] **Step 5：运行轻量验证**

Run:

```bash
npm run typecheck
npx vitest run tests/react-bits-primitives.test.ts
```

Expected: 全部通过。

### Task 4：实现并注册 C30 `PixelReveal`

**Files:**

- Create: `src/editorial/components/PixelReveal.tsx`
- Modify: `src/editorial/schema/episode.schema.ts`
- Modify: `src/editorial/schema/episode.types.ts`
- Modify: `src/editorial/registry/component-catalog.ts`
- Modify: `src/editorial/registry/component-registry.ts`
- Modify: `src/editorial/fixtures/demo-react-bits-primitives.ts`
- Modify: `src/Root.tsx`
- Test: `tests/react-bits-primitives.test.ts`

- [ ] **Step 1：增加单元可见度测试**

新增纯函数：

```ts
export const pixelCellProgress = (
  cellIndex: number,
  cellCount: number,
  progress: number,
): number;
```

测试总进度为 0 时所有单元为 0，总进度为 1 时所有单元为 1，中段进度只有前部单元完成且返回值始终位于 `0..1`。

- [ ] **Step 2：运行目标测试确认失败**

Run: `npx vitest run tests/react-bits-primitives.test.ts`

Expected: FAIL，提示 `pixelCellProgress` 尚未导出。

- [ ] **Step 3：实现 C30**

实现要求：

- `children` 放在稳定内容层；上层网格使用 `orderedGridCells()` 生成顺序。
- 每个像素只动画 `opacity` 和 `scale`，避免动画 `width/height/top/left`。
- `pixelColor` 默认使用 `visualTokens.color.inkBlack`，调用方可传品牌强调色。
- 单元数量默认 84，禁止为了“更细腻”默认提高到数百个。
- 不使用 canvas、WebGL、GSAP、Motion、hover 或 click。

- [ ] **Step 4：登记 C30 并添加 Demo**

Catalog：

```ts
{code: 'C30', kind: 'PixelReveal', category: 'primitive', tags: ['transition', 'reveal']}
```

Demo 展示一块虚构数据卡从遮挡到完全揭示；不得使用无来源的真实新闻或真实指标。Composition ID 必须为 `C30-PixelReveal`。

- [ ] **Step 5：运行轻量验证**

Run:

```bash
npm run typecheck
npx vitest run tests/react-bits-primitives.test.ts
```

Expected: 全部通过。

### Task 5：接入现有组件

**Files:**

- Modify: `src/editorial/components/NarrationEchoLayer.tsx`
- Modify: `src/editorial/components/RemotionTalkEffect.tsx`
- Modify: `src/editorial/components/SummaryComponents.tsx`
- Modify: `src/editorial/components/AcidComponent.tsx`
- Modify: `src/editorial/shot/ShotDirector.tsx`
- Test: `tests/narration-echo-layer.test.ts`
- Test: `tests/remotion-talk-effect-layout.test.ts`
- Test: `tests/react-bits-primitives.test.ts`

- [ ] **Step 1：C16 接入 C28**

只替换当前焦点句的字符/词组渲染，不改变 C16 的外层尺寸、HUD 骨架、人物安全区或字幕安全区。默认使用 `mode="focus"`；非当前句继续保留原有层级。

- [ ] **Step 2：C23/C24 接入 C28**

C23、C24 的 `title` 使用 `mode="words"`；`copy` 不做逐字动画，只保留整体淡入，避免一段口播承担两个主视觉任务。

- [ ] **Step 3：C21/C25/C26 接入 C29**

- C21：焦点在当前列表项之间迁移。
- C25：焦点在三个信息块之间迁移。
- C26：焦点跟随当前结论条目。

调用方传入现有布局函数计算的固定矩形，不在渲染过程中读取 `getBoundingClientRect()`。

- [ ] **Step 4：C05/C06/C09/C11/C12 接入 C30**

仅将 C30 用作内容首次出现时的揭示层，不改变证据来源校验、文字内容和数据表达。每个 scene 最多使用一次像素揭示。

- [ ] **Step 5：C27 提供可选内容接管揭示**

只在 `content-full` 或从人物画面切到内容主导画面时使用；`talk`、`push-in` 和普通人物镜头不得覆盖像素网格。

- [ ] **Step 6：运行相关测试**

Run:

```bash
npx vitest run tests/narration-echo-layer.test.ts tests/remotion-talk-effect-layout.test.ts tests/react-bits-primitives.test.ts
npm run typecheck
```

Expected: 全部通过。

### Task 6：许可证、组件文档与最终验证

**Files:**

- Create: `THIRD_PARTY_NOTICES.md`
- Modify: `docs/component-and-shot-layout-guide.md`

- [ ] **Step 1：记录 React Bits 来源**

`THIRD_PARTY_NOTICES.md` 至少写明：

- 项目：React Bits
- 仓库：`https://github.com/DavidHDev/react-bits`
- 参考组件：True Focus、Split Text、Blur Text、Scrambled Text、Pixel Transition
- 采用方式：设计参考与 Remotion 帧驱动重写；若包含实质性改编，保留对应版权声明
- 许可证链接：`https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md`

- [ ] **Step 2：同步组件与布局指南**

为 C28-C30 分别记录：

- Composition ID
- 视觉任务
- props
- 默认动效时长
- stageMode 和 slot
- 人物/字幕安全区约束
- 禁止渐变、禁止实时随机、禁止交互触发

同时更新 C16、C21、C23-C26、C05/C06/C09/C11/C12、C27 的“表现与行为”说明。

- [ ] **Step 3：运行非深度完整验证**

Run:

```bash
npm run lint
npm run typecheck
npm run test
npm run episode:smoke
```

Expected: 四条命令均以退出码 0 完成。

- [ ] **Step 4：关键帧 QC**

使用项目现有 `episode:frames` 或 Studio 时间轴检查 C28-C30 的入场、中段和完成态。只生成关键帧 QC，不生成视频文件。重点检查：

- 文本没有溢出、灰字或侵入字幕安全区。
- C29 的框线不穿过人物安全区。
- C30 的像素块不遮挡人脸和字幕。
- 同一帧刷新后画面一致。

- [ ] **Step 5：启动 Studio**

Run: `npm run dev`

Expected: Studio 启动成功。向用户提供终端显示的本地网页地址，并提示依次查看：

- `C28-SemanticTextReveal`
- `C29-FocusReticle`
- `C30-PixelReveal`
- `C16-Summary-NarrationEchoLayer`
- `C21-Summary-RemotionTalkEffect`
- `C23-Summary-TrendTotem`
- `C24-Summary-TrendBanner`
- `C25-Summary-TopicSignal`
- `C26-Summary-SideBrief`

等待用户确认后再决定是否调整；未经用户明确要求，不执行低清预览或高清渲染。

## 5. 验收标准

- C28-C30 均有稳定编号、registry 项和独立 Studio Composition。
- 三个组件全部由 Remotion 当前帧驱动，不含 `setTimeout`、`setInterval`、`requestAnimationFrame`、`Math.random()` 或第三方动画 ticker。
- 不新增 React Bits、GSAP、Motion、OGL、Three.js 运行时依赖。
- 摘要组件无灰色文字、无新增渐变、无字幕安全区侵入。
- 每段口播仍然只有一个主要视觉任务，最多一个主组件和两个辅助标注。
- 证据类组件继续绑定可追溯来源；C30 不改变或绕过来源校验。
- lint、typecheck、test、smoke test 通过。
- Studio 可预览，用户确认前没有生成视频文件。

## 6. 暂不纳入本轮

- React Bits 的 WebGL、OGL、Three.js、Matter.js 或鼠标交互组件。
- GSAP、SplitText 插件或 paused timeline 集成。
- ScrollTrigger、hover、click、drag、pointer-follow 等网页交互语义。
- Aurora、Ballpit、Falling Text、Light Rays 等高负载或容易抢夺口播注意力的效果。
- 对现有 episode 文案、证据数据或素材内容的重写。
