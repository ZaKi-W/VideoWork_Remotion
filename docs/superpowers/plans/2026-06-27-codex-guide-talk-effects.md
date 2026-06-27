# CodexGuideTalk 特效 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `CodexGuideTalk` 建立完整 episode 配置、按 SRT 对齐现有组件特效、完成关键帧 QC，并启动 Remotion Studio 供用户网页确认。

**Architecture:** 继续使用现有 `EpisodeComposition → ShotTimelineDirector → SceneRenderer` 渲染链路，不新增或修改公共组件。所有创意变化写入本期 `episode.json` 的 scenes 和 shots；外部素材缺失段改用 C13 抽象解释画面，口播摘要沿用 C16、C21、C23、C24、C26，镜头由 C27 驱动。

**Tech Stack:** Remotion、React、TypeScript、Zod、Vitest、JSON episode 配置、SRT。

---

## 文件结构

- Create: `episodes/CodexGuideTalk/asset-manifest.json` — 登记本地口播视频和字幕。
- Create: `episodes/CodexGuideTalk/sources.json` — 仅登记本地素材来源，不加入外部事实来源。
- Create: `episodes/CodexGuideTalk/sources.md` — 说明本期证据边界。
- Create: `episodes/CodexGuideTalk/assets-needed.md` — 记录用户选择抽象视觉，不等待外部素材。
- Create: `episodes/CodexGuideTalk/storyboard.md` — 固化 SRT 对齐后的分镜和 QC 时间点。
- Create: `episodes/CodexGuideTalk/episode.json` — 本期所有 scene、shot 和组件 props。
- Modify: `src/Root.tsx` — 在 Studio 注册 `CodexGuideTalk` 成片 Composition。
- Modify: `tests/episode-validation.test.ts` — 验证本期配置通过 preview 校验且未使用证据型外部素材。

不修改 `src/editorial/components/`、`src/editorial/registry/component-catalog.ts` 或 `docs/component-and-shot-layout-guide.md`，因为本期只组合既有组件，不改变组件本体、编号、props、stageMode 或 slot。

### Task 1：建立素材清单与来源边界

**Files:**
- Create: `episodes/CodexGuideTalk/asset-manifest.json`
- Create: `episodes/CodexGuideTalk/sources.json`
- Create: `episodes/CodexGuideTalk/sources.md`
- Create: `episodes/CodexGuideTalk/assets-needed.md`

- [ ] **Step 1：写入口播视频与字幕清单**

创建 `asset-manifest.json`，内容固定为两个 ready 素材：

```json
{
  "assets": [
    {
      "id": "codex-guide-talk-video",
      "type": "talk-video",
      "path": "episodes/CodexGuideTalk/talk.mp4",
      "purpose": "本期口播视频底层画面和音频",
      "sourceRefId": "local-codex-guide-talk-video",
      "sceneHints": ["all-scenes", "presenter-video"],
      "status": "ready",
      "priority": "high"
    },
    {
      "id": "codex-guide-talk-subtitle",
      "type": "subtitle",
      "path": "episodes/CodexGuideTalk/talk.srt",
      "purpose": "按真实口播时间轴定位分镜和字幕",
      "sourceRefId": "local-codex-guide-talk-subtitle",
      "sceneHints": ["timing", "sectioning"],
      "status": "ready",
      "priority": "high"
    }
  ]
}
```

- [ ] **Step 2：写入仅包含本地文件的来源记录**

`sources.json` 使用 `kind: "local"` 和 `status: "captured"`；视频说明“不作为外部事实证据”，字幕说明“仅用于分段和特效时机判断”。不登记脚本中缺失的六项截图或录屏。

- [ ] **Step 3：记录素材决策**

`assets-needed.md` 明确写：

```markdown
# CodexGuideTalk 素材确认

状态：CONFIRMED

- 用户已选择方案 A：缺失录屏和截图全部改为抽象解释型视觉。
- 不等待 `long-test-terminal.mp4`、`agents-no-deep-test-rule.png`、`pursue-goal-entry.mp4`、`ugly-ui-before.png`、`gpt-html-design-flow.mp4`、`codex-implements-design.mp4`。
- 抽象画面不得伪装成真实 Codex、GPT、终端或网页证据。
```

`sources.md` 写明本期只引用本地口播与字幕，所有额度、速度、模型审美和产品行为均为口播观点的视觉转述。

- [ ] **Step 4：运行状态检查**

Run: `npm run episode:status -- --episode CodexGuideTalk`

Expected: `script assets missing: 0`、`high priority assets pending: 0`；此时允许仅因 `storyboard.md` 或 `episode.json` 尚未创建而显示 blocking。

- [ ] **Step 5：提交素材边界**

```bash
git add episodes/CodexGuideTalk/asset-manifest.json episodes/CodexGuideTalk/sources.json episodes/CodexGuideTalk/sources.md episodes/CodexGuideTalk/assets-needed.md
git commit -m "chore: define CodexGuideTalk assets and sources"
```

### Task 2：固化实际时间轴分镜

**Files:**
- Create: `episodes/CodexGuideTalk/storyboard.md`

- [ ] **Step 1：写入 APPROVED 分镜表**

分镜必须使用以下语义边界，不沿用 `script.md` 中过期的 4:08 时间轴：

| 时间 | 主视觉任务 | 主组件 | 辅助组件 / 镜头 |
| --- | --- | --- | --- |
| 00:00–00:13.466 | 开场定位 | C24 TrendBanner | C26 SideBrief / talk→push-in |
| 00:13.466–00:24.133 | 过度测试数字对比 | C23 TrendTotem | C26 SideBrief / talk |
| 00:24.133–00:35.500 | 测试链路扩张 | C13 AgentExecution | content-full |
| 00:35.500–00:47.000 | 限制深度测试 | C13 AgentExecution | C24、C26 / speaker-right |
| 00:47.000–00:58.600 | 第二个痛点：额度 | C24 TrendBanner | C26 SideBrief / talk |
| 00:58.600–01:04.666 | 1% 关键数字 | C23 TrendTotem | C26 SideBrief / push-in |
| 01:04.666–01:18.200 | 三步操作 | C21 RemotionTalkEffect | speaker-right |
| 01:18.200–01:28.933 | 集中推进任务 | C13 AgentExecution | pip-right |
| 01:28.933–01:46.300 | 第三个痛点：审美 | C21 RemotionTalkEffect | C24、C26 / talk→content-full |
| 01:46.300–02:09.433 | 网页 GPT 到 HTML 再到 Codex | C13 AgentExecution | C21 / speaker-right→content-full |
| 02:09.433–02:24.133 | 两个好处 | C21 RemotionTalkEffect | C24、C26 / talk |
| 02:24.133–02:34.533 | 第四个技巧：拆任务 | C21 RemotionTalkEffect | C24、C26 / talk |
| 02:34.533–03:00.400 | 长上下文与任务舱 | C13 AgentExecution | C26 / speaker-left→content-full→pip-right |
| 03:00.400–03:18.800 | 通用结论与结束 | C16 NarrationEchoLayer | C24、C26 / talk→push-in |

- [ ] **Step 2：写入关键帧 QC 清单**

至少包含 `00:06`、`00:19`、`00:30`、`00:40`、`00:52`、`01:01`、`01:11`、`01:23`、`01:37`、`01:56`、`02:17`、`02:29`、`02:48`、`03:08`、`03:16`，逐项检查人物安全区、字幕安全区、唯一主任务和抽象视觉标签。

- [ ] **Step 3：检查分镜无占位符**

Run: `rg -n 'TBD|TODO|待定|待补' episodes/CodexGuideTalk/storyboard.md`

Expected: 无输出。

- [ ] **Step 4：提交分镜**

```bash
git add episodes/CodexGuideTalk/storyboard.md
git commit -m "docs: add CodexGuideTalk storyboard"
```

### Task 3：先写本期配置校验测试

**Files:**
- Modify: `tests/episode-validation.test.ts`
- Create later: `episodes/CodexGuideTalk/episode.json`

- [ ] **Step 1：添加失败测试**

在测试文件顶部导入本期 JSON，并添加：

```ts
import codexGuideTalkAssets from '../episodes/CodexGuideTalk/asset-manifest.json';
import codexGuideTalkEpisode from '../episodes/CodexGuideTalk/episode.json';
import codexGuideTalkSources from '../episodes/CodexGuideTalk/sources.json';

it('accepts CodexGuideTalk as an abstract, source-safe episode', () => {
  const result = validateEpisodeData(
    codexGuideTalkEpisode as EpisodeConfig,
    codexGuideTalkAssets as AssetManifest,
    codexGuideTalkSources as SourceManifest,
    {mode: 'preview'},
  );

  expect(result.ok).toBe(true);
  expect(codexGuideTalkEpisode.episode.durationInSeconds).toBe(198.8);
  expect(codexGuideTalkEpisode.presenter.videoAssetId).toBe('codex-guide-talk-video');
  expect(codexGuideTalkEpisode.presenter.subtitleAssetId).toBe('codex-guide-talk-subtitle');
  expect(codexGuideTalkEpisode.scenes.some((scene) => scene.sourceRefIds.length > 0)).toBe(false);
  expect(codexGuideTalkEpisode.scenes.filter((scene) => scene.kind === 'AgentExecution').length).toBeGreaterThanOrEqual(4);
});
```

- [ ] **Step 2：运行测试并确认失败**

Run: `npm run test -- tests/episode-validation.test.ts`

Expected: FAIL，错误为找不到 `episodes/CodexGuideTalk/episode.json`。

- [ ] **Step 3：暂不提交失败状态**

继续 Task 4 创建配置，待测试转绿后一起提交。

### Task 4：创建 scene 和 shot 配置

**Files:**
- Create: `episodes/CodexGuideTalk/episode.json`

- [ ] **Step 1：写入 episode 与 presenter 基础配置**

```json
{
  "version": 1,
  "episode": {
    "id": "codex-guide-talk",
    "title": "Codex 使用小技巧",
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "durationInSeconds": 198.8,
    "status": "DRAFT"
  },
  "presenter": {
    "mode": "video",
    "videoAssetId": "codex-guide-talk-video",
    "subtitleAssetId": "codex-guide-talk-subtitle",
    "defaultStageMode": "presenter-center"
  },
  "scenes": [],
  "shots": []
}
```

- [ ] **Step 2：加入唯一的背景口播 scene**

创建 `cgt-talk-video`，范围 `0–198.8`，`track: "background"`、`kind: "TalkVideoBase"`、`slot: "full-bleed"`；props 使用 `videoPath: "episodes/CodexGuideTalk/talk.mp4"`、`subtitlePath: "episodes/CodexGuideTalk/talk.srt"`、`audio: true`、`fit: "cover"`、`subtitleMaxWidth: 1040`。

- [ ] **Step 3：加入 14 个主视觉 scene**

按 Task 2 的 14 段建立稳定 ID：

```text
cgt-opening
cgt-over-test-compare
cgt-over-test-flow
cgt-rule-flow
cgt-quota-title
cgt-one-percent
cgt-goal-steps
cgt-goal-run
cgt-aesthetic
cgt-html-handoff
cgt-two-benefits
cgt-split-title
cgt-context-split
cgt-outro
```

每个 scene 必须完整包含 `start/end/track/kind/stageMode/slot/content/assetIds/sourceRefIds/status/notes`。C13 全屏 scene 使用 `track: "primary"`、`stageMode: "no-presenter"`、`slot: "full-bleed"`；摘要 scene 使用 `track: "overlay"` 和左右 edge slot。所有 `sourceRefIds` 为空。

- [ ] **Step 4：写入脚本指定的组件内容**

核心文案固定如下，避免实现时临时发挥：

```text
C24: Codex 使用痛点 / 第二个痛点：额度 / 第三个痛点：审美 / 第四个技巧：拆任务
C23: 干活 3 分钟 → 测试 10 分钟 / 1%
C21 steps: 开追求目标 / 开完全访问 / 安排大任务
C21 compare: 解决问题：强 / 审美：一般
C21 handoff: 网页 GPT / HTML / Codex
C21 benefits: 少占 Codex 额度 / 完整样式信息
C21 split: 一个长对话 / 多个短会话
C26: 时间被吃掉 / 够用就停 / 集中火力 / 个人经验 / Token 继续消耗 / 实现更稳 / 别漏细节
C16: 规则写清楚 / 任务安排明白 / 多干正事
```

C13 的 `copy` 或 `caption` 必须包含“抽象流程”或“个人经验”，其任务气泡分别使用：

```text
过度测试：改动完成 / 跑测试 / 截图检测 / 继续检查
规则限制：读取规则 / 必要检查 / 结束
目标推进：追求目标 / 完全访问 / 大任务 / 持续推进
HTML 交接：网页端调样式 / 生成 HTML / Codex 读取 / 开始实现
上下文拆分：长对话增长 / 自动压缩 / 细节减弱 / 拆成多个会话
```

- [ ] **Step 5：加入 C24/C26 辅助 scenes**

只有脚本明确要求左右同现的段落才增加辅助 scene；同一时间不能超过一个主组件和两个辅助标注，且左右组件不得使用同一个 slot。

- [ ] **Step 6：写入 30 fps shots**

将 Task 2 时间乘以 30 并取相邻无缝整数帧。内容主导段必须使用对应 `contentId`，人物摘要段使用 `summaryId`。shot 模式顺序为：

```text
talk → push-in → talk → content-full → speaker-right → talk → push-in
→ speaker-right → pip-right → talk → content-full → speaker-right
→ content-full → talk → speaker-left → content-full → pip-right → talk → push-in
```

最后一个 shot 的 `to` 必须为 `5964`（198.8 × 30）。

- [ ] **Step 7：运行单文件测试并修正到通过**

Run: `npm run test -- tests/episode-validation.test.ts`

Expected: PASS。

- [ ] **Step 8：运行 episode 校验**

Run: `npm run episode:validate -- --episode CodexGuideTalk`

Expected: 校验无 error；允许无来源的抽象组件，不允许出现 `source.required`、`safe-zone.presenter`、`safe-zone.subtitle` 或 shot 引用错误。

- [ ] **Step 9：提交配置与测试**

```bash
git add episodes/CodexGuideTalk/episode.json tests/episode-validation.test.ts
git commit -m "feat: configure CodexGuideTalk effects"
```

### Task 5：注册成片到 Remotion Studio

**Files:**
- Modify: `src/Root.tsx`

- [ ] **Step 1：导入本期 JSON**

```ts
import codexGuideTalkAssets from '../episodes/CodexGuideTalk/asset-manifest.json';
import codexGuideTalkEpisode from '../episodes/CodexGuideTalk/episode.json';
import codexGuideTalkSources from '../episodes/CodexGuideTalk/sources.json';
```

- [ ] **Step 2：创建默认 props**

```ts
const codexGuideTalkProps: EpisodeInputProps = {
  episode: codexGuideTalkEpisode as EpisodeInputProps['episode'],
  assets: codexGuideTalkAssets as EpisodeInputProps['assets'],
  sources: codexGuideTalkSources as EpisodeInputProps['sources'],
  debug: false,
  strict: false,
};
```

- [ ] **Step 3：注册 Composition**

紧跟现有 `Episode` Composition 后加入：

```tsx
<Composition
  id="CodexGuideTalk"
  component={EpisodeComposition}
  defaultProps={codexGuideTalkProps}
  calculateMetadata={({props}) => getMetadata(props as EpisodeInputProps)}
/>
```

- [ ] **Step 4：运行类型检查**

Run: `npm run typecheck`

Expected: PASS，无 JSON 类型转换或 Composition ID 错误。

- [ ] **Step 5：提交 Studio 注册**

```bash
git add src/Root.tsx
git commit -m "feat: register CodexGuideTalk composition"
```

### Task 6：执行轻量验证与关键帧 QC

**Files:**
- Modify if required: `episodes/CodexGuideTalk/episode.json`
- Generated and untracked: `episodes/CodexGuideTalk/output/keyframes/`

- [ ] **Step 1：运行相关自动检查**

```bash
npm run episode:validate -- --episode CodexGuideTalk
npm run typecheck
npm run lint
npm run test
```

Expected: 四项全部 PASS。不得运行 `episode:smoke`，因为该脚本会生成 `smoke-preview.mp4`，用户尚未授权视频导出。

- [ ] **Step 2：生成静态关键帧**

Run: `npm run episode:frames -- --episode CodexGuideTalk`

Expected: 只在 `episodes/CodexGuideTalk/output/keyframes/` 生成 PNG、manifest 和 HTML，不生成视频文件。

- [ ] **Step 3：逐帧检查**

打开 contact sheet，逐项核对 Task 2 的 15 个 QC 时间点。重点检查：

```text
人物居中净空
字幕区无正文
C13 标有抽象流程或个人经验
每段只有一个主视觉任务
左右辅助层不重叠
无灰色摘要正文
无新增渐变
```

- [ ] **Step 4：只通过 episode 配置修正问题**

若出现遮挡、信息密度或节奏问题，只调整本期 scene 时间、props、slot 或 shot，不修改公共组件。每轮修正后重新运行：

```bash
npm run episode:validate -- --episode CodexGuideTalk
npm run typecheck
```

- [ ] **Step 5：提交 QC 修正**

若有配置修正：

```bash
git add episodes/CodexGuideTalk/episode.json episodes/CodexGuideTalk/storyboard.md
git commit -m "fix: refine CodexGuideTalk keyframes"
```

不要提交 `episodes/CodexGuideTalk/output/`。

### Task 7：启动网页预览并交给用户确认

**Files:**
- No source changes expected.

- [ ] **Step 1：启动 Remotion Studio**

Run: `npm run dev -- --port 3000`

Expected: Studio 启动成功并输出本地地址；若 3000 被占用，使用其自动选择的端口。

- [ ] **Step 2：确认 Composition 可打开**

在 Studio 左侧选择 `CodexGuideTalk`，确认画布、音频、字幕、scene 和 shots 正常加载。

- [ ] **Step 3：向用户提供网页地址**

提供实际监听地址，并说明当前只完成网页预览，没有导出视频。

- [ ] **Step 4：等待用户确认**

用户确认前，不执行：

```text
npm run episode:preview -- --episode CodexGuideTalk
npm run episode:render -- --episode CodexGuideTalk
npx remotion render ...
npm run episode:smoke -- --episode CodexGuideTalk
```

只有用户明确要求低清预览或高清渲染后，才进入导出步骤。
