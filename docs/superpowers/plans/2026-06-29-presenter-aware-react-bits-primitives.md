# C28-C30 口播镜头适配 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 C28/C29 只能通过 C27 左右分屏出现在人物对侧，并让 C30 按 24 帧揭示、45 帧停留、12 帧恢复的节奏完成内容接管。

**Architecture:** 在 C27 shot 数据中新增 `sidecarId`，把人物对侧视觉与主内容、普通摘要分开；C27 负责人物让位和 sidecar 入退场，C28/C29 本体不裁切人物区。C30 继续作为 `content-full` 的 `contentId`，由验证层约束至少 69 帧内容接管并要求后续人物恢复镜头。

**Tech Stack:** React 19、TypeScript、Remotion 4、Zod、Vitest

---

## 0. 执行边界

- 当前工作区存在用户未提交改动，不覆盖、不清理、不重置。
- 不运行 `episode:preview`、`episode:render`、`remotion render` 或会生成视频文件的 smoke。
- 不进行深度测试；每个任务只运行相关测试，最终运行相关 ESLint、typecheck 和单元测试。
- 关键帧 QC 只允许生成静态 PNG。
- 不新增渐变，不改变证据来源校验。
- 每次组件或 C27 行为变化后同步更新 `docs/component-and-shot-layout-guide.md`。

## 1. 文件结构

**修改：**

- `src/editorial/schema/episode.schema.ts`：为 shot 增加 `sidecarId`。
- `src/editorial/shot/shot.types.ts`：同步 `Shot` 和渲染 props 类型。
- `src/editorial/validation/validate-episode.ts`：验证 sidecar 模式、方向、互斥关系、C28/C29 引用和 C30 时长。
- `src/editorial/shot/ShotTimelineDirector.tsx`：查找并创建 sidecar layer。
- `src/editorial/shot/ShotDirector.tsx`：控制人物让位、sidecar 延迟入场和退场。
- `src/editorial/components/PixelReveal.tsx`：将默认揭示时长统一为 24 帧。
- `src/editorial/schema/episode.schema.ts`：同步 C30 默认 `durationInFrames=24`。
- `src/editorial/fixtures/demo-react-bits-primitives.tsx`：增加左右人物与内容接管的口播适配 Demo。
- `src/Root.tsx`：注册新的口播适配 Demo Composition。
- `docs/component-and-shot-layout-guide.md`：记录 sidecar 和 C30 内容接管规则。
- `tests/episode-validation.test.ts`：覆盖 sidecar 与 C30 shot 验证。
- `tests/react-bits-primitives.test.ts`：覆盖 C30 时间结构纯函数。

## 2. 固定数据模型

shot 新增：

```ts
sidecarId?: string;
```

合法示例：

```json
{
  "from": 120,
  "to": 240,
  "mode": "speaker-left",
  "sidecarId": "semantic-focus-right"
}
```

人物在左时 sidecar scene 必须使用 `edge-right | top-right`；人物在右时必须使用 `edge-left | top-left`。

---

### Task 1：增加 sidecar schema 与验证

**Files:**

- Modify: `src/editorial/schema/episode.schema.ts`
- Modify: `src/editorial/shot/shot.types.ts`
- Modify: `src/editorial/validation/validate-episode.ts`
- Test: `tests/episode-validation.test.ts`

- [ ] **Step 1：先写失败测试**

在 `tests/episode-validation.test.ts` 增加四个用例：

```ts
it('accepts a right sidecar while the presenter is left', () => {
  const result = validateEpisodeData(
    episodeWithShots([
      {from: 0, to: 90, mode: 'speaker-left', sidecarId: 'c28-right'},
    ], [
      primitiveScene('c28-right', 'SemanticTextReveal', 'edge-right'),
    ]),
    emptyAssets,
    emptySources,
    {mode: 'preview'},
  );
  expect(result.issues.some(({code}) => code.startsWith('shots.sidecar'))).toBe(false);
});

it('rejects sidecarId outside speaker-left or speaker-right', () => {
  const result = validateEpisodeData(
    episodeWithShots([
      {from: 0, to: 90, mode: 'talk', sidecarId: 'c28-right'},
    ], [
      primitiveScene('c28-right', 'SemanticTextReveal', 'edge-right'),
    ]),
    emptyAssets,
    emptySources,
    {mode: 'preview'},
  );
  expect(result.issues.some(({code}) => code === 'shots.sidecar-mode')).toBe(true);
});

it('rejects a sidecar placed on the presenter side', () => {
  const result = validateEpisodeData(
    episodeWithShots([
      {from: 0, to: 90, mode: 'speaker-left', sidecarId: 'c29-left'},
    ], [
      primitiveScene('c29-left', 'FocusReticle', 'edge-left'),
    ]),
    emptyAssets,
    emptySources,
    {mode: 'preview'},
  );
  expect(result.issues.some(({code}) => code === 'shots.sidecar-slot')).toBe(true);
});

it('rejects contentId and sidecarId in the same shot', () => {
  const result = validateEpisodeData(
    episodeWithShots([
      {
        from: 0,
        to: 90,
        mode: 'speaker-left',
        contentId: 'main-content',
        sidecarId: 'c28-right',
      },
    ], [
      mainContentScene('main-content'),
      primitiveScene('c28-right', 'SemanticTextReveal', 'edge-right'),
    ]),
    emptyAssets,
    emptySources,
    {mode: 'preview'},
  );
  expect(result.issues.some(({code}) => code === 'shots.sidecar-content-conflict')).toBe(true);
});
```

- [ ] **Step 2：运行测试确认失败**

Run:

```bash
npx vitest run tests/episode-validation.test.ts
```

Expected: FAIL，`sidecarId` 尚未进入 shot schema 或验证 issue 尚不存在。

- [ ] **Step 3：扩展 shot 类型与 schema**

在 `shotSchema` 和 `Shot` 中增加：

```ts
sidecarId: z.string().trim().min(1).optional(),
```

```ts
sidecarId?: string;
```

同时在 `ShotDirectorRenderProps` 增加：

```ts
sidecarId?: string;
sidecarLayer?: ReactNode;
```

- [ ] **Step 4：实现最小验证**

在 `validateShots()` 中加入：

```ts
const sidecarKinds = new Set<EpisodeScene['kind']>([
  'SemanticTextReveal',
  'FocusReticle',
  'NarrationEchoLayer',
  'RemotionTalkEffect',
  'TrendTotem',
  'TrendBanner',
  'TopicSignal',
  'SideBrief',
]);

const expectedSidecarSlots = {
  'speaker-left': new Set(['edge-right', 'top-right']),
  'speaker-right': new Set(['edge-left', 'top-left']),
} as const;
```

逐 shot 验证：

```ts
if (shot.sidecarId && shot.mode !== 'speaker-left' && shot.mode !== 'speaker-right') {
  push(issues, 'blocking', 'shots.sidecar-mode', `${shot.mode} cannot use sidecarId`);
}

if (shot.sidecarId && shot.contentId) {
  push(issues, 'blocking', 'shots.sidecar-content-conflict', 'sidecarId and contentId are mutually exclusive');
}

if (shot.sidecarId) {
  const scene = sceneById.get(shot.sidecarId);
  if (!scene) {
    push(issues, 'blocking', 'shots.sidecar-missing-ref', `sidecarId not found: ${shot.sidecarId}`);
  } else if (!sidecarKinds.has(scene.kind)) {
    push(issues, 'blocking', 'shots.sidecar-kind', `unsupported sidecar: ${scene.kind}`, scene.id);
  } else if (
    (shot.mode === 'speaker-left' || shot.mode === 'speaker-right') &&
    !expectedSidecarSlots[shot.mode].has(scene.slot as never)
  ) {
    push(issues, 'blocking', 'shots.sidecar-slot', `${scene.slot} is on the presenter side`, scene.id);
  }
}
```

- [ ] **Step 5：运行测试确认通过**

Run:

```bash
npx vitest run tests/episode-validation.test.ts
npm run typecheck
```

Expected: PASS。

### Task 2：C27 渲染人物对侧 sidecar

**Files:**

- Modify: `src/editorial/shot/ShotTimelineDirector.tsx`
- Modify: `src/editorial/shot/ShotDirector.tsx`
- Test: `tests/shot-director-sidecar.test.ts`

- [ ] **Step 1：增加 sidecar 进度纯函数测试**

新增 `tests/shot-director-sidecar.test.ts`：

```ts
import {describe, expect, it} from 'vitest';
import {sidecarProgressFor} from '../src/editorial/shot/ShotDirector';

describe('C27 sidecar timing', () => {
  it('waits five frames for the presenter to move before entering', () => {
    expect(sidecarProgressFor(4, true)).toBe(0);
    expect(sidecarProgressFor(5, true)).toBe(0);
    expect(sidecarProgressFor(17, true)).toBe(1);
  });

  it('stays hidden when the shot has no sidecar', () => {
    expect(sidecarProgressFor(30, false)).toBe(0);
  });
});
```

- [ ] **Step 2：运行测试确认失败**

Run:

```bash
npx vitest run tests/shot-director-sidecar.test.ts
```

Expected: FAIL，`sidecarProgressFor` 尚未导出。

- [ ] **Step 3：实现并导出进度函数**

在 `ShotDirector.tsx` 中加入：

```ts
export const sidecarProgressFor = (
  localFrame: number,
  hasSidecar: boolean,
): number => {
  if (!hasSidecar) return 0;
  return easeProgress(localFrame, 5, 17);
};
```

- [ ] **Step 4：接入 sidecar layer**

`ShotTimelineDirector` 查找：

```ts
const sidecarScene = shot.sidecarId ? sceneById.get(shot.sidecarId) : undefined;
const previousSidecarScene = previousShot?.sidecarId
  ? sceneById.get(previousShot.sidecarId)
  : undefined;
```

传给 `ShotDirector`：

```tsx
sidecarLayer={renderSceneLayer(sidecarScene, props, true)}
previousSidecarLayer={renderSceneLayer(previousSidecarScene, props, true)}
```

扩展 `ShotDirectorProps`：

```ts
sidecarLayer?: ReactNode;
previousSidecarLayer?: ReactNode;
```

只在 `speaker-left/right` 且存在 `sidecarId` 时显示当前 sidecar；离开 sidecar shot 时用前一 layer 在 8 帧内退场。人物先移动，sidecar 从第 5 帧开始入场：

```tsx
const hasSidecar = Boolean(shot.sidecarId);
const sidecarProgress = sidecarProgressFor(localFrame, hasSidecar);
const visibleSidecarLayer = hasSidecar ? sidecarLayer : previousSidecarLayer;
```

sidecar 层样式：

```tsx
{
  position: 'absolute',
  zIndex: 28,
  inset: 0,
  opacity: sidecarProgress,
  transform: `translateX(${interpolate(sidecarProgress, [0, 1], [
    shot.mode === 'speaker-left' ? 18 : -18,
    0,
  ])}px)`,
  pointerEvents: 'none',
}
```

- [ ] **Step 5：运行相关测试**

Run:

```bash
npx vitest run tests/shot-director-sidecar.test.ts tests/episode-validation.test.ts
npm run typecheck
```

Expected: PASS。

### Task 3：约束 C28/C29 的人物场景用法

**Files:**

- Modify: `src/editorial/validation/validate-episode.ts`
- Modify: `src/editorial/registry/component-registry.ts`
- Test: `tests/episode-validation.test.ts`

- [ ] **Step 1：增加未被 sidecar 引用的失败测试**

```ts
it('rejects presenter C28 or C29 scenes not referenced by sidecarId', () => {
  const result = validateEpisodeData(
    episodeWithShots(
      [{from: 0, to: 90, mode: 'talk'}],
      [primitiveScene('orphan-c28', 'SemanticTextReveal', 'edge-right')],
    ),
    emptyAssets,
    emptySources,
    {mode: 'preview'},
  );
  expect(result.issues.some(({code}) => code === 'shots.primitive-sidecar-required')).toBe(true);
});
```

- [ ] **Step 2：运行测试确认失败**

Run:

```bash
npx vitest run tests/episode-validation.test.ts
```

Expected: FAIL，缺少 `shots.primitive-sidecar-required`。

- [ ] **Step 3：实现引用检查**

在 `validateShots()` 末尾建立所有 sidecar 引用：

```ts
const referencedSidecars = new Set(sortedShots.flatMap((shot) => (
  shot.sidecarId ? [shot.sidecarId] : []
)));

for (const scene of episode.scenes) {
  if (
    (scene.kind === 'SemanticTextReveal' || scene.kind === 'FocusReticle') &&
    scene.stageMode !== 'no-presenter' &&
    !referencedSidecars.has(scene.id)
  ) {
    push(
      issues,
      'blocking',
      'shots.primitive-sidecar-required',
      `${scene.kind} requires C27 sidecarId when a presenter is visible`,
      scene.id,
    );
  }
}
```

registry 保留 `no-presenter`，人物模式只保留 `presenter-small`，去掉会误导直接覆盖人物的 `presenter-center`：

```ts
allowedStageModes: ['no-presenter', 'presenter-small']
```

- [ ] **Step 4：运行测试确认通过**

Run:

```bash
npx vitest run tests/episode-validation.test.ts
npm run typecheck
```

Expected: PASS。

### Task 4：落实 C30 内容接管节奏

**Files:**

- Modify: `src/editorial/components/PixelReveal.tsx`
- Modify: `src/editorial/schema/episode.schema.ts`
- Modify: `src/editorial/validation/validate-episode.ts`
- Test: `tests/react-bits-primitives.test.ts`
- Test: `tests/episode-validation.test.ts`

- [ ] **Step 1：增加 C30 时间结构测试**

在 `PixelReveal.tsx` 导出：

```ts
export const pixelTakeoverTiming = {
  revealFrames: 24,
  holdFrames: 45,
  restoreFrames: 12,
} as const;
```

先写测试：

```ts
it('uses a 24 + 45 + 12 frame takeover cadence', () => {
  expect(pixelTakeoverTiming).toEqual({
    revealFrames: 24,
    holdFrames: 45,
    restoreFrames: 12,
  });
  expect(
    pixelTakeoverTiming.revealFrames +
    pixelTakeoverTiming.holdFrames +
    pixelTakeoverTiming.restoreFrames,
  ).toBe(81);
});
```

在 episode validation 测试中增加：

```ts
it('rejects a C30 content-full shot shorter than reveal plus hold', () => {
  const result = validateEpisodeData(
    episodeWithShots([
      {from: 0, to: 68, mode: 'content-full', contentId: 'pixel'},
      {from: 68, to: 120, mode: 'talk'},
    ], [
      primitiveScene('pixel', 'PixelReveal', 'full-bleed'),
    ]),
    emptyAssets,
    emptySources,
    {mode: 'preview'},
  );
  expect(result.issues.some(({code}) => code === 'shots.pixel-takeover-too-short')).toBe(true);
});
```

- [ ] **Step 2：运行测试确认失败**

Run:

```bash
npx vitest run tests/react-bits-primitives.test.ts tests/episode-validation.test.ts
```

Expected: FAIL，时间常量和验证规则尚不存在。

- [ ] **Step 3：实现时间常量与默认值**

在 `PixelReveal.tsx` 导出固定常量，并把 schema 默认值改为：

```ts
durationInFrames: z.number().int().positive().default(24)
```

renderer 继续通过：

```ts
frameRangeProgress(frame, props.startFrame, props.startFrame + props.durationInFrames)
```

完成揭示后自然保持 `progress=1`，直到 C27 切换下一 shot。

- [ ] **Step 4：增加 C30 shot 验证**

在 `validateShots()` 中，当：

```ts
shot.mode === 'content-full' &&
contentScene?.kind === 'PixelReveal'
```

检查：

```ts
if (shot.to - shot.from < 69) {
  push(
    issues,
    'blocking',
    'shots.pixel-takeover-too-short',
    'PixelReveal content-full requires at least 69 frames',
    contentScene.id,
  );
}

const nextShot = sortedShots[index + 1];
if (!nextShot || (nextShot.mode !== 'talk' && nextShot.mode !== 'push-in')) {
  push(
    issues,
    'blocking',
    'shots.pixel-takeover-restore-missing',
    'PixelReveal takeover requires a following talk or push-in shot',
    contentScene.id,
  );
}
```

- [ ] **Step 5：运行测试确认通过**

Run:

```bash
npx vitest run tests/react-bits-primitives.test.ts tests/episode-validation.test.ts
npm run typecheck
```

Expected: PASS。

### Task 5：增加口播适配 Studio Demo

**Files:**

- Modify: `src/editorial/fixtures/demo-react-bits-primitives.tsx`
- Modify: `src/Root.tsx`
- Test: `tests/react-bits-primitives.test.ts`

- [ ] **Step 1：增加 Demo ID 测试**

在测试中读取 `src/Root.tsx` 或导出的 ID 常量，确认存在：

```ts
expect(presenterPrimitiveDemoIds).toEqual([
  'C28-Presenter-Sidecar',
  'C29-Presenter-Sidecar',
  'C30-Presenter-Takeover',
]);
```

- [ ] **Step 2：运行测试确认失败**

Run:

```bash
npx vitest run tests/react-bits-primitives.test.ts
```

Expected: FAIL，`presenterPrimitiveDemoIds` 尚不存在。

- [ ] **Step 3：实现三个口播适配 Demo**

从 fixture 导出：

```ts
export const presenterPrimitiveDemoIds = [
  'C28-Presenter-Sidecar',
  'C29-Presenter-Sidecar',
  'C30-Presenter-Takeover',
] as const;
```

Demo 规则：

- C28：前半段 `speaker-left + edge-right`，后半段 `speaker-right + edge-left`。
- C29：同样左右切换，三个固定目标在人物对侧移动。
- C30：人物居中背景；0-23 帧揭示，24-68 帧完整停留，69-80 帧恢复人物。
- 人物使用明确的本地占位轮廓或现有口播视频，不伪造真实证据。
- 三个 Demo 的正文均停留在 `y < 885px`。

在 `Root.tsx` 注册三个 Composition，每个 1920×1080、30fps；C28/C29 建议 180 帧，C30 固定 81 帧。

- [ ] **Step 4：运行轻量验证**

Run:

```bash
npx vitest run tests/react-bits-primitives.test.ts
npm run typecheck
```

Expected: PASS。

### Task 6：同步文档并完成关键帧 QC

**Files:**

- Modify: `docs/component-and-shot-layout-guide.md`
- Modify: `docs/visual-redesign-guide-c16-c21-c23-c26.md`

- [ ] **Step 1：更新 C27 与 C28-C30 文档**

必须写明：

- `sidecarId` 只用于 `speaker-left/right`。
- 人物在左时组件在右，人物在右时组件在左。
- C28/C29 不裁切人物区，不允许直接覆盖居中人物。
- C30 默认 24 帧揭示、45 帧停留、12 帧恢复。
- C30 可覆盖人物但不得覆盖字幕区。
- C16/C21/C23-C26 内部使用 C28/C29 时，必须作为 C27 sidecar scene 进入人物对侧。

- [ ] **Step 2：运行非深度验证**

Run:

```bash
npx eslint src/editorial/schema/episode.schema.ts src/editorial/shot/shot.types.ts src/editorial/validation/validate-episode.ts src/editorial/shot/ShotTimelineDirector.tsx src/editorial/shot/ShotDirector.tsx src/editorial/components/PixelReveal.tsx src/editorial/fixtures/demo-react-bits-primitives.tsx src/Root.tsx tests/episode-validation.test.ts tests/shot-director-sidecar.test.ts tests/react-bits-primitives.test.ts
npm run typecheck
npx vitest run tests/episode-validation.test.ts tests/shot-director-sidecar.test.ts tests/react-bits-primitives.test.ts tests/narration-echo-layer.test.ts tests/remotion-talk-effect-layout.test.ts
git diff --check
```

Expected: 全部通过。

- [ ] **Step 3：生成静态关键帧 QC**

只运行 `remotion still`，不得运行 `remotion render`：

```bash
npx remotion still src/index.ts C28-Presenter-Sidecar outputs/qc/presenter-primitives/c28-left.png --frame 45
npx remotion still src/index.ts C28-Presenter-Sidecar outputs/qc/presenter-primitives/c28-right.png --frame 135
npx remotion still src/index.ts C29-Presenter-Sidecar outputs/qc/presenter-primitives/c29-left.png --frame 45
npx remotion still src/index.ts C29-Presenter-Sidecar outputs/qc/presenter-primitives/c29-right.png --frame 135
npx remotion still src/index.ts C30-Presenter-Takeover outputs/qc/presenter-primitives/c30-revealing.png --frame 12
npx remotion still src/index.ts C30-Presenter-Takeover outputs/qc/presenter-primitives/c30-hold.png --frame 50
npx remotion still src/index.ts C30-Presenter-Takeover outputs/qc/presenter-primitives/c30-restore.png --frame 75
```

检查：

- C28/C29 人物与组件分居左右，不重叠。
- C29 角标完全位于组件一侧。
- C30 在揭示和停留阶段可以覆盖人物。
- C30 恢复态重新露出人物。
- 所有正文均不进入 `y >= 885px`。

- [ ] **Step 4：确认 Studio**

保持或启动：

```bash
npm run dev
```

向用户提供 `http://localhost:3000`，提示查看：

- `C28-Presenter-Sidecar`
- `C29-Presenter-Sidecar`
- `C30-Presenter-Takeover`

等待用户确认；未经明确要求，不生成低清或高清视频。
