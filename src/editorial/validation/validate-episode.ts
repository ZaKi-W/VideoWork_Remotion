import fs from 'node:fs';
import path from 'node:path';
import {
  allowedSlotsByStageMode,
  getStageLayout,
  rectsIntersect,
} from '../stage/stage.config';
import {componentRegistry} from '../registry/component-registry';
import {
  assetManifestSchema,
  episodeSchema,
  sourceManifestSchema,
} from '../schema/episode.schema';
import type {
  AssetManifest,
  ConceptSplitProps,
  EditorialOverlayProps,
  EvidenceClipProps,
  EpisodeConfig,
  EpisodeScene,
  MetricSpreadProps,
  NarrationEchoLayerProps,
  SourceManifest,
} from '../schema/episode.types';
import type {StageMode, StageSlot} from '../stage/stage.types';
import type {ValidationIssue, ValidationMode, ValidationResult} from './validation.types';

const push = (
  issues: ValidationIssue[],
  level: ValidationIssue['level'],
  code: string,
  message: string,
  sceneId?: string,
) => issues.push({level, code, message, sceneId});

const headlinePunchSlots: StageSlot[] = ['top-left', 'top-right', 'edge-left', 'edge-right'];
const headlineWrapStageModes: StageMode[] = ['presenter-center', 'presenter-small'];
const headlineTakeoverStageModes: StageMode[] = ['no-presenter', 'screen-primary'];
const headlineTakeoverSlots: StageSlot[] = ['full-bleed', 'center-overlay', 'screen-primary'];
const evidenceClippingStageModes: StageMode[] = ['presenter-center', 'presenter-small', 'screen-primary', 'no-presenter'];
const evidenceClippingSlots: StageSlot[] = ['top-left', 'top-right', 'edge-left', 'edge-right'];
const evidenceSpotlightStageModes: StageMode[] = ['presenter-small', 'screen-primary', 'no-presenter'];
const evidenceSpotlightSlots: StageSlot[] = ['screen-primary', 'full-bleed'];
const evidenceAssetTypes: AssetManifest['assets'][number]['type'][] = ['screenshot', 'image', 'chart'];
const metricPresenterCenterSlots: StageSlot[] = ['top-left', 'edge-left'];
const metricNonCenterStageModes: StageMode[] = ['presenter-small', 'screen-primary', 'no-presenter'];
const metricNonCenterSlots: StageSlot[] = ['top-left', 'edge-left', 'screen-primary'];
const conceptCrossCutStageModes: StageMode[] = ['presenter-center', 'presenter-small', 'screen-primary', 'no-presenter'];
const conceptCrossCutSlots: StageSlot[] = ['top-left', 'top-right', 'edge-left', 'edge-right'];
const conceptFoldStageModes: StageMode[] = ['no-presenter', 'screen-primary'];
const conceptFoldSlots: StageSlot[] = ['full-bleed', 'screen-primary'];
const conceptHandoffStageModes: StageMode[] = ['presenter-small', 'screen-primary', 'no-presenter'];
const conceptHandoffSlots: StageSlot[] = ['edge-left', 'edge-right', 'screen-primary'];
const editorialOverlayStageModes: StageMode[] = ['presenter-center', 'presenter-small', 'screen-primary', 'no-presenter'];
const editorialOverlaySlots: StageSlot[] = ['top-left', 'top-right', 'edge-left', 'edge-right'];
const narrationEchoStageModes: StageMode[] = ['presenter-center', 'presenter-small'];
const narrationEchoSlots: StageSlot[] = ['top-left', 'edge-left'];

const headlineContext = (episode: EpisodeConfig, scene: EpisodeScene): string => {
  const mode = scene.content.kind === 'HeadlineTakeover' ? scene.content.props.mode ?? 'punch' : 'unknown';
  return `episode=${episode.episode.id}; scene=${scene.id}; mode=${mode}; stageMode=${scene.stageMode}; slot=${scene.slot}`;
};

const isHeadlineTakeoverFullCanvas = (scene: EpisodeScene): boolean =>
  scene.content.kind === 'HeadlineTakeover' && (scene.content.props.mode ?? 'punch') === 'takeover';

const isEvidenceClipSpotlightCanvas = (scene: EpisodeScene): boolean =>
  scene.content.kind === 'EvidenceClip' &&
  (scene.content.props.variant ?? 'clipping') === 'spotlight' &&
  scene.slot === 'full-bleed';

const isConceptSplitFoldCanvas = (scene: EpisodeScene): boolean =>
  scene.content.kind === 'ConceptSplit' &&
  (scene.content.props.mode ?? 'cross-cut') === 'editorial-fold' &&
  scene.slot === 'full-bleed';

const acidFullCanvasKinds = new Set<EpisodeScene['kind']>([
  'MediaWall',
  'Countdown',
  'ChapterIndex',
  'CountryGap',
  'ReleaseTimeline',
  'StatsBoard',
  'Ecosystem',
  'OpenSourceWave',
  'MapFocus',
  'TimeGap',
  'PricePage',
  'TokenBoard',
  'AgentExecution',
]);

const isAcidFullCanvas = (scene: EpisodeScene): boolean =>
  acidFullCanvasKinds.has(scene.kind) && scene.stageMode === 'no-presenter' && scene.slot === 'full-bleed';

const evidenceContext = (episode: EpisodeConfig, scene: EpisodeScene, props: EvidenceClipProps): string =>
  `episode=${episode.episode.id}; scene=${scene.id}; variant=${props.variant ?? 'clipping'}; stageMode=${
    scene.stageMode
  }; slot=${scene.slot}`;

const metricContext = (episode: EpisodeConfig, scene: EpisodeScene): string =>
  `episode=${episode.episode.id}; scene=${scene.id}; stageMode=${scene.stageMode}; slot=${scene.slot}`;

const conceptContext = (episode: EpisodeConfig, scene: EpisodeScene, props: ConceptSplitProps): string =>
  `episode=${episode.episode.id}; scene=${scene.id}; mode=${props.mode ?? 'cross-cut'}; relationship=${
    props.relationship ?? 'from-to'
  }; stageMode=${scene.stageMode}; slot=${scene.slot}`;

const editorialOverlayContext = (episode: EpisodeConfig, scene: EpisodeScene, props: EditorialOverlayProps): string =>
  `episode=${episode.episode.id}; scene=${scene.id}; layout=${props.layout ?? 'corner-stack'}; density=${
    props.density ?? 'light'
  }; stageMode=${scene.stageMode}; slot=${scene.slot}`;

const scenesOverlap = (a: EpisodeScene, b: EpisodeScene): boolean => a.start < b.end && b.start < a.end;

const hasLocalVerificationNote = (notes: string): boolean => /local|本地|可验证|demo/i.test(notes);

export const validateEpisodeData = (
  episode: EpisodeConfig,
  assets: AssetManifest,
  sources: SourceManifest,
  options: {mode: ValidationMode; publicDir?: string; requireApprovedStoryboard?: boolean} = {
    mode: 'preview',
  },
): ValidationResult => {
  const issues: ValidationIssue[] = [];
  const parsedEpisode = episodeSchema.safeParse(episode);
  const parsedAssets = assetManifestSchema.safeParse(assets);
  const parsedSources = sourceManifestSchema.safeParse(sources);

  if (!parsedEpisode.success) {
    push(issues, 'blocking', 'schema.episode', parsedEpisode.error.message);
  }
  if (!parsedAssets.success) {
    push(issues, 'blocking', 'schema.assets', parsedAssets.error.message);
  }
  if (!parsedSources.success) {
    push(issues, 'blocking', 'schema.sources', parsedSources.error.message);
  }
  if (!parsedEpisode.success || !parsedAssets.success || !parsedSources.success) {
    return {ok: false, issues};
  }

  const strict = options.mode === 'strict';
  const assetIds = new Set(assets.assets.map((asset) => asset.id));
  const sourceIds = new Set(sources.sources.map((source) => source.id));
  const layout = getStageLayout(episode.episode.width, episode.episode.height);

  if (strict && episode.presenter.mode === 'placeholder') {
    push(issues, 'blocking', 'presenter.placeholder', 'placeholder presenter is demo-only and cannot be used for strict render');
  }

  const primaryScenes = episode.scenes
    .filter((scene) => scene.track === 'primary')
    .sort((a, b) => a.start - b.start);

  for (let index = 1; index < primaryScenes.length; index += 1) {
    if (primaryScenes[index].start < primaryScenes[index - 1].end) {
      push(
        issues,
        'blocking',
        'timeline.primary-overlap',
        `primary scene overlaps ${primaryScenes[index - 1].id}`,
        primaryScenes[index].id,
      );
    }
  }

  for (const scene of episode.scenes) {
    validateScene(scene, episode, assets, sources, assetIds, sourceIds, issues, strict, options.publicDir, layout);
  }

  for (let index = 2; index < primaryScenes.length; index += 1) {
    const a = primaryScenes[index - 2];
    const b = primaryScenes[index - 1];
    const c = primaryScenes[index];
    if (a.kind === b.kind && b.kind === c.kind) {
      push(issues, 'warning', 'sequence.repeated-kind', `same main component repeats three times: ${c.kind}`, c.id);
    }
  }

  validateEditorialOverlayTimeline(episode, issues, strict);

  const ok = !issues.some((issue) => issue.level === 'blocking' || issue.level === 'error');
  return {ok, issues};
};

const validateEditorialOverlayTimeline = (
  episode: EpisodeConfig,
  issues: ValidationIssue[],
  strict: boolean,
) => {
  const overlayScenes = episode.scenes
    .filter((scene) => scene.kind === 'EditorialOverlay')
    .sort((a, b) => a.start - b.start);

  for (let index = 1; index < overlayScenes.length; index += 1) {
    const previous = overlayScenes[index - 1];
    const current = overlayScenes[index];
    if (scenesOverlap(previous, current)) {
      push(
        issues,
        'blocking',
        'editorial-overlay.concurrent',
        `only one EditorialOverlay can be active at a time; overlaps ${previous.id}`,
        current.id,
      );
    }
  }

  for (const overlay of overlayScenes) {
    for (const scene of episode.scenes) {
      if (scene.id === overlay.id || !scenesOverlap(overlay, scene)) {
        continue;
      }
      if (scene.kind === 'HeadlineTakeover') {
        push(
          issues,
          strict ? 'blocking' : 'warning',
          'editorial-overlay.headline-overlap',
          `EditorialOverlay overlaps HeadlineTakeover ${scene.id}`,
          overlay.id,
        );
      }
      if (scene.kind === 'SectionStamp') {
        push(
          issues,
          strict ? 'blocking' : 'warning',
          'editorial-overlay.section-overlap',
          `EditorialOverlay overlaps SectionStamp ${scene.id}`,
          overlay.id,
        );
      }
      if (scene.kind === 'EvidenceClip' || scene.kind === 'MetricSpread' || scene.kind === 'ConceptSplit') {
        const density = overlay.content.kind === 'EditorialOverlay' ? overlay.content.props.density ?? 'light' : 'light';
        if (density !== 'light') {
          push(
            issues,
            strict ? 'blocking' : 'warning',
            'editorial-overlay.density-with-main',
            `EditorialOverlay must use light density when overlapping ${scene.kind}`,
            overlay.id,
          );
        }
      }
    }
  }
};

const validateScene = (
  scene: EpisodeScene,
  episode: EpisodeConfig,
  assets: AssetManifest,
  sources: SourceManifest,
  assetIds: Set<string>,
  sourceIds: Set<string>,
  issues: ValidationIssue[],
  strict: boolean,
  publicDir: string | undefined,
  layout: ReturnType<typeof getStageLayout>,
) => {
  const registryItem = componentRegistry[scene.kind];
  const duration = episode.episode.durationInSeconds;

  if (scene.end > duration) {
    push(issues, 'blocking', 'timeline.out-of-range', 'scene end exceeds episode duration', scene.id);
  }

  if (
    !allowedSlotsByStageMode[scene.stageMode].includes(scene.slot) &&
    !isHeadlineTakeoverFullCanvas(scene)
  ) {
    push(
      issues,
      strict ? 'blocking' : 'error',
      'stage.slot-mode',
      `${scene.slot} is not allowed in ${scene.stageMode}`,
      scene.id,
    );
  }

  if (!(registryItem.allowedStageModes as StageMode[]).includes(scene.stageMode)) {
    push(
      issues,
      strict ? 'blocking' : 'error',
      'component.stage-mode',
      `${scene.kind} does not allow ${scene.stageMode}`,
      scene.id,
    );
  }

  if (!(registryItem.allowedSlots as StageSlot[]).includes(scene.slot)) {
    push(
      issues,
      strict ? 'blocking' : 'error',
      'component.slot',
      `${scene.kind} does not allow slot ${scene.slot}`,
      scene.id,
    );
  }

  const slotRect = layout.slots[scene.slot];
  if (scene.stageMode === 'presenter-center' && rectsIntersect(slotRect, layout.presenterSafeZone)) {
    push(issues, 'blocking', 'safe-zone.presenter', `${scene.slot} enters presenter safe zone`, scene.id);
  }
  if (
    rectsIntersect(slotRect, layout.subtitleSafeZone) &&
    !isHeadlineTakeoverFullCanvas(scene) &&
    !isEvidenceClipSpotlightCanvas(scene) &&
    !isConceptSplitFoldCanvas(scene) &&
    !isAcidFullCanvas(scene)
  ) {
    push(issues, 'blocking', 'safe-zone.subtitle', `${scene.slot} enters subtitle safe zone`, scene.id);
  }

  if (strict && registryItem.implementationStatus === 'planned') {
    push(issues, 'blocking', 'component.planned', `${scene.kind} is planned and cannot be strict-rendered`, scene.id);
  }
  if (strict && registryItem.implementationStatus === 'prototype') {
    push(issues, 'blocking', 'component.prototype', `${scene.kind} is prototype and cannot be strict-rendered`, scene.id);
  }
  if (!strict && registryItem.implementationStatus === 'prototype') {
    push(issues, 'warning', 'component.prototype', `${scene.kind} is preview-only prototype`, scene.id);
  }
  if (!strict && registryItem.implementationStatus === 'planned') {
    push(issues, 'warning', 'component.planned', `${scene.kind} is planned placeholder`, scene.id);
  }

  for (const assetId of scene.assetIds) {
    if (!assetIds.has(assetId)) {
      push(issues, 'blocking', 'asset.missing-ref', `assetId not found: ${assetId}`, scene.id);
    }
  }
  for (const sourceRefId of scene.sourceRefIds) {
    if (!sourceIds.has(sourceRefId)) {
      push(issues, 'blocking', 'source.missing-ref', `sourceRefId not found: ${sourceRefId}`, scene.id);
    }
  }

  if (registryItem.requiresSource && scene.sourceRefIds.length === 0) {
    push(issues, strict ? 'blocking' : 'warning', 'source.required', `${scene.kind} requires a sourceRefId`, scene.id);
  }
  if (scene.kind === 'EvidenceClip' && strict && scene.sourceRefIds.length === 0) {
    push(issues, 'blocking', 'evidence.source-required', 'EvidenceClip requires sourceRefId in strict mode', scene.id);
  }

  if (scene.content.kind === 'SectionStamp') {
    const section = scene.content.props;
    if (section.placement !== scene.slot) {
      push(
        issues,
        strict ? 'blocking' : 'error',
        'section-stamp.placement-mismatch',
        `SectionStamp props placement ${section.placement} must match scene slot ${scene.slot}`,
        scene.id,
      );
    }
    const compactTitleLength = section.title.replace(/\s+/g, '').length;
    const explicitTitleLines = section.title.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (compactTitleLength > 14 || explicitTitleLines.length > 2) {
      push(
        issues,
        'warning',
        'section-stamp.title-long',
        'SectionStamp title is long for poster typography; verify balanced two-line readability in keyframes',
        scene.id,
      );
    }
    if (section.emphasis && !section.title.includes(section.emphasis.text)) {
      push(
        issues,
        strict ? 'blocking' : 'error',
        'section-stamp.emphasis-missing',
        `SectionStamp emphasis text "${section.emphasis.text}" must exist in title`,
        scene.id,
      );
    }
    if ((section.variant ?? 'index-strip') === 'edge-note' && section.subline && section.subline.length > 32) {
      push(
        issues,
        'warning',
        'section-stamp.edge-subline-long',
        'edge-note subline is long for a narrow edge slot; verify keyframes',
        scene.id,
      );
    }
  }

  if (scene.content.kind === 'HeadlineTakeover') {
    const headline = scene.content.props;
    const mode = headline.mode ?? 'punch';
    const context = headlineContext(episode, scene);
    const issueLevel = strict ? 'blocking' : 'error';

    if ((mode === 'punch' || mode === 'wrap') && !headlinePunchSlots.includes(scene.slot)) {
      push(
        issues,
        issueLevel,
        'headline-takeover.slot-mode',
        `HeadlineTakeover ${mode} requires top-left, top-right, edge-left, or edge-right (${context})`,
        scene.id,
      );
    }
    if (mode === 'wrap' && !headlineWrapStageModes.includes(scene.stageMode)) {
      push(
        issues,
        issueLevel,
        'headline-takeover.stage-mode',
        `HeadlineTakeover wrap requires presenter-center or presenter-small (${context})`,
        scene.id,
      );
    }
    if (mode === 'takeover' && !headlineTakeoverStageModes.includes(scene.stageMode)) {
      push(
        issues,
        issueLevel,
        'headline-takeover.stage-mode',
        `HeadlineTakeover takeover requires no-presenter or screen-primary (${context})`,
        scene.id,
      );
    }
    if (mode === 'takeover' && !headlineTakeoverSlots.includes(scene.slot)) {
      push(
        issues,
        issueLevel,
        'headline-takeover.slot-mode',
        `HeadlineTakeover takeover requires full-bleed, center-overlay, or screen-primary (${context})`,
        scene.id,
      );
    }
    if (scene.stageMode === 'presenter-center' && (scene.slot === 'center-overlay' || scene.slot === 'full-bleed')) {
      push(
        issues,
        issueLevel,
        'headline-takeover.presenter-overlay',
        `HeadlineTakeover cannot use presenter-center with center-overlay or full-bleed (${context})`,
        scene.id,
      );
    }
    if (headline.allowSubjectOverlay && (mode !== 'takeover' || scene.stageMode === 'presenter-center')) {
      push(
        issues,
        issueLevel,
        'headline-takeover.subject-overlay',
        `HeadlineTakeover allowSubjectOverlay cannot bypass presenter safe zones (${context})`,
        scene.id,
      );
    }
    const compactLength = headline.lines.join('').replace(/\s+/g, '').length;
    if (compactLength > 24 || headline.lines.some((line) => line.replace(/\s+/g, '').length > 12)) {
      push(
        issues,
        'warning',
        'headline-takeover.title-long',
        `HeadlineTakeover title may be too long for poster typography; do not shrink to body size (${context})`,
        scene.id,
      );
    }
  }

  if (scene.content.kind === 'EvidenceClip') {
    validateEvidenceClip(scene, episode, assets, sources, issues, strict, publicDir, layout);
  }

  if (scene.content.kind === 'MetricSpread') {
    validateMetricSpread(scene, episode, sources, issues, strict);
  }

  if (scene.content.kind === 'ConceptSplit') {
    validateConceptSplit(scene, episode, issues, strict);
  }

  if (scene.content.kind === 'EditorialOverlay') {
    validateEditorialOverlay(scene, episode, issues, strict);
  }

  if (scene.content.kind === 'NarrationEchoLayer') {
    validateNarrationEchoLayer(scene, episode, issues, strict);
  }

  if (publicDir) {
    for (const assetId of scene.assetIds) {
      const asset = assets.assets.find((candidate) => candidate.id === assetId);
      if (!asset) {
        continue;
      }
      const filePath = path.join(publicDir, asset.path);
      if (asset.status === 'ready' && !fs.existsSync(filePath)) {
        push(issues, strict ? 'blocking' : 'warning', 'asset.file-missing', `asset file missing: ${asset.path}`, scene.id);
      }
    }
  }
};

const validateNarrationEchoLayer = (
  scene: EpisodeScene,
  episode: EpisodeConfig,
  issues: ValidationIssue[],
  strict: boolean,
) => {
  const props: NarrationEchoLayerProps | undefined =
    scene.content.kind === 'NarrationEchoLayer' ? scene.content.props : undefined;
  if (!props) {
    return;
  }

  const context = `episode=${episode.episode.id}; scene=${scene.id}; stageMode=${scene.stageMode}; slot=${scene.slot}`;
  const issueLevel = strict ? 'blocking' : 'error';

  if (scene.track !== 'overlay') {
    push(
      issues,
      strict ? 'blocking' : 'warning',
      'narration-echo.track',
      `NarrationEchoLayer belongs on overlay track (${context})`,
      scene.id,
    );
  }

  if (!narrationEchoStageModes.includes(scene.stageMode)) {
    push(
      issues,
      issueLevel,
      'narration-echo.stage-mode',
      `NarrationEchoLayer is only for presenter talk scenes (${context})`,
      scene.id,
    );
  }

  if (!narrationEchoSlots.includes(scene.slot)) {
    push(
      issues,
      issueLevel,
      'narration-echo.slot',
      `NarrationEchoLayer only allows top-left or edge-left (${context})`,
      scene.id,
    );
  }

  if (props.placement !== scene.slot) {
    push(
      issues,
      issueLevel,
      'narration-echo.placement-mismatch',
      `NarrationEchoLayer props placement ${props.placement} must match scene slot ${scene.slot} (${context})`,
      scene.id,
    );
  }

  const maxLineLoad = Math.max(
    ...props.items.map((item) => item.segments.reduce((sum, segment) => sum + (segment.text?.length ?? 0), 0)),
  );
  if (maxLineLoad > 26) {
    push(
      issues,
      'warning',
      'narration-echo.line-long',
      `NarrationEchoLayer line may exceed two readable lines; verify keyframes (${context})`,
      scene.id,
    );
  }
};

const validateEditorialOverlay = (
  scene: EpisodeScene,
  episode: EpisodeConfig,
  issues: ValidationIssue[],
  strict: boolean,
) => {
  const props: EditorialOverlayProps | undefined =
    scene.content.kind === 'EditorialOverlay' ? scene.content.props : undefined;
  if (!props) {
    return;
  }

  const context = editorialOverlayContext(episode, scene, props);
  const issueLevel = strict ? 'blocking' : 'error';

  if (scene.track !== 'overlay') {
    push(
      issues,
      strict ? 'blocking' : 'warning',
      'editorial-overlay.track',
      `EditorialOverlay belongs on overlay track (${context})`,
      scene.id,
    );
  }

  if (!editorialOverlayStageModes.includes(scene.stageMode)) {
    push(issues, issueLevel, 'editorial-overlay.stage-mode', `EditorialOverlay stageMode is illegal (${context})`, scene.id);
  }

  if (!editorialOverlaySlots.includes(scene.slot)) {
    push(
      issues,
      issueLevel,
      'editorial-overlay.slot',
      `EditorialOverlay only allows top-left, top-right, edge-left, or edge-right (${context})`,
      scene.id,
    );
  }

  if (props.placement !== scene.slot) {
    push(
      issues,
      issueLevel,
      'editorial-overlay.placement-mismatch',
      `EditorialOverlay props placement ${props.placement} must match scene slot ${scene.slot} (${context})`,
      scene.id,
    );
  }

  const textLoad = props.items.reduce((sum, item) => {
    if (item.type === 'mini-list') {
      return (
        sum +
        (item.title?.length ?? 0) +
        item.rows.reduce((rowSum, row) => rowSum + row.label.length + (row.value?.length ?? 0), 0)
      );
    }
    if (item.type === 'annotation') {
      return sum + item.text.length;
    }
    if (item.type === 'keyword') {
      return sum + item.text.length;
    }
    if (item.type === 'stat-tag') {
      return sum + item.value.length + (item.label?.length ?? 0);
    }
    return sum + item.value.length;
  }, 0);

  if (textLoad > 48) {
    push(
      issues,
      'warning',
      'editorial-overlay.text-load',
      `EditorialOverlay may contain too much small text; verify it stays like information air (${context})`,
      scene.id,
    );
  }
};

const validateMetricSpread = (
  scene: EpisodeScene,
  episode: EpisodeConfig,
  sources: SourceManifest,
  issues: ValidationIssue[],
  strict: boolean,
) => {
  const props: MetricSpreadProps | undefined = scene.content.kind === 'MetricSpread' ? scene.content.props : undefined;
  if (!props) {
    return;
  }

  const context = metricContext(episode, scene);
  const issueLevel = strict ? 'blocking' : 'error';
  const source = sources.sources.find((candidate) => candidate.id === props.sourceRefId);

  if (props.placement !== scene.slot) {
    push(
      issues,
      issueLevel,
      'metric-spread.placement-mismatch',
      `MetricSpread props placement ${props.placement} must match scene slot ${scene.slot} (${context})`,
      scene.id,
    );
  }

  if (scene.stageMode === 'presenter-center') {
    if (!metricPresenterCenterSlots.includes(scene.slot)) {
      push(
        issues,
        issueLevel,
        'metric-spread.slot-mode',
        `MetricSpread presenter-center requires top-left or edge-left (${context})`,
        scene.id,
      );
    }
  } else if (metricNonCenterStageModes.includes(scene.stageMode)) {
    if (!metricNonCenterSlots.includes(scene.slot)) {
      push(
        issues,
        issueLevel,
        'metric-spread.slot-mode',
        `MetricSpread ${scene.stageMode} requires top-left, edge-left, or screen-primary (${context})`,
        scene.id,
      );
    }
  }

  if (scene.slot === 'screen-primary' && scene.stageMode === 'presenter-center') {
    push(
      issues,
      issueLevel,
      'metric-spread.presenter-primary',
      `MetricSpread screen-primary is not allowed with presenter-center (${context})`,
      scene.id,
    );
  }

  if (!scene.sourceRefIds.includes(props.sourceRefId)) {
    push(
      issues,
      strict ? 'blocking' : 'warning',
      'metric-spread.source-list-missing',
      `MetricSpread sourceRefId should also be listed in scene.sourceRefIds (${context})`,
      scene.id,
    );
  }

  if (!source) {
    push(
      issues,
      'blocking',
      'metric-spread.source-missing',
      `MetricSpread sourceRefId not found: ${props.sourceRefId} (${context})`,
      scene.id,
    );
    return;
  }

  if (!source.title.trim()) {
    push(issues, 'blocking', 'metric-spread.source-title', `MetricSpread source requires title (${context})`, scene.id);
  }
  if (!source.publisher.trim()) {
    push(
      issues,
      'blocking',
      'metric-spread.source-publisher',
      `MetricSpread source requires publisher (${context})`,
      scene.id,
    );
  }
  if (!source.url.trim() && !hasLocalVerificationNote(source.notes)) {
    push(
      issues,
      strict ? 'blocking' : 'warning',
      'metric-spread.source-url',
      `MetricSpread source requires url or explicit local verification note (${context})`,
      scene.id,
    );
  }
  if (!strict && source.status === 'provided') {
    push(
      issues,
      'warning',
      'metric-spread.source-provided-preview',
      `provided MetricSpread source is allowed in preview only (${context})`,
      scene.id,
    );
  }
  if (!strict && source.kind === 'demo') {
    push(issues, 'warning', 'metric-spread.demo-source', `demo MetricSpread source is preview-only (${context})`, scene.id);
  }
  if (strict && (source.status !== 'captured' && source.status !== 'verified')) {
    push(
      issues,
      'blocking',
      'metric-spread.source-status',
      `strict MetricSpread requires captured or verified source; got ${source.status} (${context})`,
      scene.id,
    );
  }
  if (strict && source.kind === 'demo') {
    push(issues, 'blocking', 'metric-spread.demo-strict', `demo MetricSpread source is not allowed in strict render (${context})`, scene.id);
  }
  if (source.status === 'rejected') {
    push(
      issues,
      strict ? 'blocking' : 'error',
      'metric-spread.source-rejected',
      `rejected source cannot be used by MetricSpread (${context})`,
      scene.id,
    );
  }
  if (props.sourceLabel) {
    const label = props.sourceLabel.toLowerCase();
    const publisher = source.publisher.toLowerCase();
    if (!label.includes(publisher) && !publisher.includes(label.replace(/^ref\.\s*\/\s*/i, ''))) {
      push(
        issues,
        strict ? 'blocking' : 'warning',
        'metric-spread.source-label',
        `sourceLabel must derive from sources.json publisher (${context})`,
        scene.id,
      );
    }
  }
};

const validateConceptSplit = (
  scene: EpisodeScene,
  episode: EpisodeConfig,
  issues: ValidationIssue[],
  strict: boolean,
) => {
  const props: ConceptSplitProps | undefined = scene.content.kind === 'ConceptSplit' ? scene.content.props : undefined;
  if (!props) {
    return;
  }

  const mode = props.mode ?? 'cross-cut';
  const context = conceptContext(episode, scene, props);
  const issueLevel = strict ? 'blocking' : 'error';

  if (mode === 'cross-cut') {
    if (!conceptCrossCutStageModes.includes(scene.stageMode)) {
      push(issues, issueLevel, 'concept-split.stage-mode', `ConceptSplit cross-cut stageMode is illegal (${context})`, scene.id);
    }
    if (!conceptCrossCutSlots.includes(scene.slot)) {
      push(
        issues,
        issueLevel,
        'concept-split.slot-mode',
        `ConceptSplit cross-cut requires top-left, top-right, edge-left, or edge-right (${context})`,
        scene.id,
      );
    }
  }

  if (mode === 'editorial-fold') {
    if (!conceptFoldStageModes.includes(scene.stageMode)) {
      push(
        issues,
        issueLevel,
        'concept-split.stage-mode',
        `ConceptSplit editorial-fold requires no-presenter or screen-primary (${context})`,
        scene.id,
      );
    }
    if (!conceptFoldSlots.includes(scene.slot)) {
      push(
        issues,
        issueLevel,
        'concept-split.slot-mode',
        `ConceptSplit editorial-fold requires full-bleed or screen-primary (${context})`,
        scene.id,
      );
    }
  }

  if (mode === 'handoff') {
    if (!conceptHandoffStageModes.includes(scene.stageMode)) {
      push(
        issues,
        issueLevel,
        'concept-split.stage-mode',
        `ConceptSplit handoff requires presenter-small, screen-primary, or no-presenter (${context})`,
        scene.id,
      );
    }
    if (!conceptHandoffSlots.includes(scene.slot)) {
      push(
        issues,
        issueLevel,
        'concept-split.slot-mode',
        `ConceptSplit handoff requires edge-left, edge-right, or screen-primary (${context})`,
        scene.id,
      );
    }
  }

  const titleLines = [props.left.title, props.right.title].flatMap((title) =>
    title.split(/\r?\n/).filter((line) => line.trim().length > 0),
  );
  if (titleLines.length > 4 || titleLines.some((line) => line.replace(/\s+/g, '').length > 12)) {
    push(
      issues,
      'warning',
      'concept-split.title-long',
      `ConceptSplit title may exceed two-line display weight; verify keyframes (${context})`,
      scene.id,
    );
  }

  const longDescription = [props.left.description, props.right.description].some(
    (description) => description && description.length > 28,
  );
  if (longDescription) {
    push(
      issues,
      'warning',
      'concept-split.description-long',
      `ConceptSplit description is close to the maximum; verify it does not become body copy (${context})`,
      scene.id,
    );
  }
};

const validateEvidenceClip = (
  scene: EpisodeScene,
  episode: EpisodeConfig,
  assets: AssetManifest,
  sources: SourceManifest,
  issues: ValidationIssue[],
  strict: boolean,
  publicDir: string | undefined,
  layout: ReturnType<typeof getStageLayout>,
) => {
  const props = scene.content.kind === 'EvidenceClip' ? scene.content.props : undefined;
  if (!props) {
    return;
  }
  const variant = props.variant ?? 'clipping';
  const context = evidenceContext(episode, scene, props);
  const issueLevel = strict ? 'blocking' : 'error';
  const asset = assets.assets.find((candidate) => candidate.id === props.assetId);
  const source = sources.sources.find((candidate) => candidate.id === props.sourceRefId);

  if (props.placement !== scene.slot) {
    push(
      issues,
      issueLevel,
      'evidence.placement-mismatch',
      `EvidenceClip props placement ${props.placement} must match scene slot ${scene.slot} (${context})`,
      scene.id,
    );
  }

  if (variant === 'clipping') {
    if (!evidenceClippingStageModes.includes(scene.stageMode)) {
      push(issues, issueLevel, 'evidence.stage-mode', `clipping stageMode is illegal (${context})`, scene.id);
    }
    if (!evidenceClippingSlots.includes(scene.slot)) {
      push(
        issues,
        issueLevel,
        'evidence.slot-mode',
        `EvidenceClip clipping requires top-left, top-right, edge-left, or edge-right (${context})`,
        scene.id,
      );
    }
  }

  if (variant === 'spotlight') {
    if (!evidenceSpotlightStageModes.includes(scene.stageMode)) {
      push(
        issues,
        issueLevel,
        'evidence.stage-mode',
        `EvidenceClip spotlight requires presenter-small, screen-primary, or no-presenter (${context})`,
        scene.id,
      );
    }
    if (!evidenceSpotlightSlots.includes(scene.slot)) {
      push(
        issues,
        issueLevel,
        'evidence.slot-mode',
        `EvidenceClip spotlight requires screen-primary or full-bleed (${context})`,
        scene.id,
      );
    }
    if (scene.stageMode === 'presenter-center') {
      push(issues, issueLevel, 'evidence.presenter-center', `spotlight cannot use presenter-center (${context})`, scene.id);
    }
    if (scene.slot === 'full-bleed' && scene.stageMode !== 'no-presenter') {
      push(issues, issueLevel, 'evidence.full-bleed', `full-bleed EvidenceClip requires no-presenter (${context})`, scene.id);
    }
  }

  if (!scene.assetIds.includes(props.assetId)) {
    push(
      issues,
      strict ? 'blocking' : 'warning',
      'evidence.asset-list-missing',
      `EvidenceClip assetId should also be listed in scene.assetIds (${context})`,
      scene.id,
    );
  }
  if (!scene.sourceRefIds.includes(props.sourceRefId)) {
    push(
      issues,
      strict ? 'blocking' : 'warning',
      'evidence.source-list-missing',
      `EvidenceClip sourceRefId should also be listed in scene.sourceRefIds (${context})`,
      scene.id,
    );
  }

  if (!asset) {
    push(issues, 'blocking', 'evidence.asset-missing', `EvidenceClip assetId not found: ${props.assetId} (${context})`, scene.id);
  }
  if (!source) {
    push(
      issues,
      'blocking',
      'evidence.source-missing',
      `EvidenceClip sourceRefId not found: ${props.sourceRefId} (${context})`,
      scene.id,
    );
  }

  if (asset) {
    const isGeneratedDemoPreview = !strict && asset.type === 'generated' && episode.episode.id.startsWith('demo-');
    if (!evidenceAssetTypes.includes(asset.type) && !isGeneratedDemoPreview) {
      push(
        issues,
        strict ? 'blocking' : 'error',
        'evidence.asset-type',
        `EvidenceClip only allows screenshot, image, or chart assets (${context}); got ${asset.type}`,
        scene.id,
      );
    }
    if (isGeneratedDemoPreview) {
      push(
        issues,
        'warning',
        'evidence.demo-generated',
        `demo generated evidence asset is preview-only (${context})`,
        scene.id,
      );
    }
    if (strict && asset.type === 'generated') {
      push(issues, 'blocking', 'evidence.generated-strict', `generated evidence asset is not allowed in strict render (${context})`, scene.id);
    }
    if (asset.sourceRefId && asset.sourceRefId !== props.sourceRefId) {
      push(
        issues,
        'blocking',
        'evidence.asset-source-mismatch',
        `asset.sourceRefId ${asset.sourceRefId} does not match scene sourceRefId ${props.sourceRefId} (${context})`,
        scene.id,
      );
    }
    if (publicDir) {
      const filePath = path.join(publicDir, asset.path);
      if (!fs.existsSync(filePath)) {
        push(
          issues,
          strict ? 'blocking' : 'warning',
          'evidence.asset-file-missing',
          `EvidenceClip asset file missing: ${asset.path} (${context})`,
          scene.id,
        );
      }
    }
  }

  if (source) {
    if (!source.title.trim()) {
      push(issues, 'blocking', 'evidence.source-title', `EvidenceClip source requires title (${context})`, scene.id);
    }
    if (!source.publisher.trim()) {
      push(issues, 'blocking', 'evidence.source-publisher', `EvidenceClip source requires publisher (${context})`, scene.id);
    }
    if (!source.url.trim() && !hasLocalVerificationNote(source.notes)) {
      push(
        issues,
        strict ? 'blocking' : 'warning',
        'evidence.source-url',
        `EvidenceClip source requires url or explicit local verification note (${context})`,
        scene.id,
      );
    }
    if (strict && source.status !== 'captured' && source.status !== 'verified') {
      push(
        issues,
        'blocking',
        'evidence.source-status',
        `strict EvidenceClip requires captured or verified source; got ${source.status} (${context})`,
        scene.id,
      );
    }
    if (!strict && source.status === 'provided') {
      push(
        issues,
        'warning',
        'evidence.source-provided-preview',
        `provided source is allowed in preview only (${context})`,
        scene.id,
      );
    }
    if (source.status === 'rejected') {
      push(
        issues,
        strict ? 'blocking' : 'error',
        'evidence.source-rejected',
        `rejected source cannot be used by EvidenceClip (${context})`,
        scene.id,
      );
    }
    if (props.sourceLabel) {
      const label = props.sourceLabel.toLowerCase();
      const publisher = source.publisher.toLowerCase();
      if (!label.includes(publisher) && !publisher.includes(label.replace(/^ref\.\s*\/\s*/i, ''))) {
        push(
          issues,
          strict ? 'blocking' : 'warning',
          'evidence.source-label',
          `sourceLabel must derive from sources.json publisher (${context})`,
          scene.id,
        );
      }
    }
  }

  const slotRect = layout.slots[scene.slot];
  if (variant === 'clipping' && slotRect.width < episode.episode.width * 0.2) {
    push(
      issues,
      'warning',
      'evidence.readability-width',
      `EvidenceClip clipping slot may make screenshot text too small; verify keyframes (${context})`,
      scene.id,
    );
  }
  if (variant === 'spotlight' && scene.slot === 'full-bleed' && rectsIntersect(slotRect, layout.subtitleSafeZone)) {
    push(
      issues,
      'warning',
      'evidence.subtitle-safe-zone',
      `EvidenceClip full-bleed spotlight must keep all readable content above subtitle safe zone; verify keyframes (${context})`,
      scene.id,
    );
  }
};
