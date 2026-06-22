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
  EpisodeConfig,
  EpisodeScene,
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

const headlineContext = (episode: EpisodeConfig, scene: EpisodeScene): string => {
  const mode = scene.content.kind === 'HeadlineTakeover' ? scene.content.props.mode ?? 'punch' : 'unknown';
  return `episode=${episode.episode.id}; scene=${scene.id}; mode=${mode}; stageMode=${scene.stageMode}; slot=${scene.slot}`;
};

const isHeadlineTakeoverFullCanvas = (scene: EpisodeScene): boolean =>
  scene.content.kind === 'HeadlineTakeover' && (scene.content.props.mode ?? 'punch') === 'takeover';

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
    validateScene(scene, episode, assets, assetIds, sourceIds, issues, strict, options.publicDir, layout);
  }

  for (let index = 2; index < primaryScenes.length; index += 1) {
    const a = primaryScenes[index - 2];
    const b = primaryScenes[index - 1];
    const c = primaryScenes[index];
    if (a.kind === b.kind && b.kind === c.kind) {
      push(issues, 'warning', 'sequence.repeated-kind', `same main component repeats three times: ${c.kind}`, c.id);
    }
  }

  const ok = !issues.some((issue) => issue.level === 'blocking' || issue.level === 'error');
  return {ok, issues};
};

const validateScene = (
  scene: EpisodeScene,
  episode: EpisodeConfig,
  assets: AssetManifest,
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
  if (rectsIntersect(slotRect, layout.subtitleSafeZone) && !isHeadlineTakeoverFullCanvas(scene)) {
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
