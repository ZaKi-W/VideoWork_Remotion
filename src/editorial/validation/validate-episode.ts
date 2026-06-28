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

const narrationEchoStageModes: StageMode[] = ['presenter-center', 'presenter-small'];
const narrationEchoSlots: StageSlot[] = ['top-left', 'edge-left'];

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
  acidFullCanvasKinds.has(scene.kind) &&
  (scene.stageMode === 'no-presenter' || scene.stageMode === 'presenter-center') &&
  scene.slot === 'full-bleed';

const isTalkVideoBaseCanvas = (scene: EpisodeScene): boolean =>
  scene.kind === 'TalkVideoBase' && scene.stageMode === 'no-presenter' && scene.slot === 'full-bleed';

const sceneRangesOverlap = (a: EpisodeScene, b: EpisodeScene): boolean => a.start < b.end && b.start < a.end;

const summaryKinds = new Set<EpisodeScene['kind']>([
  'NarrationEchoLayer',
  'RemotionTalkEffect',
  'TrendTotem',
  'TrendBanner',
  'TopicSignal',
  'SideBrief',
]);

const contentShotModes = new Set(['speaker-left', 'speaker-right', 'pip-right', 'content-full']);
const summaryShotModes = new Set(['talk', 'push-in']);

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

  validateLayering(episode.scenes, issues, Boolean(episode.shots?.length));
  validateShots(episode, issues);

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

const validateShots = (episode: EpisodeConfig, issues: ValidationIssue[]) => {
  const shots = episode.shots ?? [];
  if (shots.length === 0) {
    return;
  }

  const durationInFrames = Math.ceil(episode.episode.durationInSeconds * episode.episode.fps);
  const sceneById = new Map(episode.scenes.map((scene) => [scene.id, scene]));
  const sortedShots = [...shots].sort((a, b) => a.from - b.from);

  if (!episode.scenes.some(isTalkVideoBaseCanvas)) {
    push(issues, 'blocking', 'shots.talk-video-missing', 'shots require one full-bleed TalkVideoBase scene');
  }

  for (let index = 0; index < sortedShots.length; index += 1) {
    const shot = sortedShots[index];
    const shotId = `${shot.mode}@${shot.from}`;

    if (shot.to > durationInFrames) {
      push(issues, 'blocking', 'shots.out-of-range', `shot exceeds episode duration: ${shotId}`);
    }

    if (index > 0 && shot.from < sortedShots[index - 1].to) {
      push(issues, 'blocking', 'shots.overlap', `shot overlaps previous shot: ${shotId}`);
    }

    if (contentShotModes.has(shot.mode) && !shot.contentId) {
      push(issues, 'blocking', 'shots.content-required', `${shot.mode} requires contentId`);
    }

    if (shot.mode !== 'talk' && shot.mode !== 'push-in' && !contentShotModes.has(shot.mode) && shot.contentId) {
      push(issues, 'warning', 'shots.content-unused', `${shot.mode} ignores contentId ${shot.contentId}`);
    }

    if (!summaryShotModes.has(shot.mode) && shot.summaryId) {
      push(issues, 'warning', 'shots.summary-unused', `${shot.mode} exits summaryId ${shot.summaryId} before content enters`);
    }

    if (shot.contentId) {
      const contentScene = sceneById.get(shot.contentId);
      if (!contentScene) {
        push(issues, 'blocking', 'shots.content-missing-ref', `contentId not found: ${shot.contentId}`);
      } else if (summaryKinds.has(contentScene.kind) || contentScene.kind === 'TalkVideoBase') {
        push(
          issues,
          'blocking',
          'shots.content-kind',
          `contentId must reference a main content scene: ${shot.contentId}`,
          contentScene.id,
        );
      }
    }

    if (shot.summaryId) {
      const summaryScene = sceneById.get(shot.summaryId);
      if (!summaryScene) {
        push(issues, 'blocking', 'shots.summary-missing-ref', `summaryId not found: ${shot.summaryId}`);
      } else if (!summaryKinds.has(summaryScene.kind)) {
        push(
          issues,
          'blocking',
          'shots.summary-kind',
          `summaryId must reference a summary scene: ${shot.summaryId}`,
          summaryScene.id,
        );
      }
    }
  }
};

const validateLayering = (scenes: EpisodeScene[], issues: ValidationIssue[], usesShotDirector = false) => {
  const visualScenes = scenes.filter((scene) => scene.track !== 'background');

  for (let index = 0; index < visualScenes.length; index += 1) {
    const scene = visualScenes[index];
    for (const candidate of visualScenes.slice(index + 1)) {
      if (scene.slot === candidate.slot && sceneRangesOverlap(scene, candidate)) {
        push(
          issues,
          'blocking',
          'timeline.slot-overlap',
          `${scene.slot} overlaps ${scene.id}; move one layer to another slot or change timing`,
          candidate.id,
        );
      }
    }
  }

  if (usesShotDirector) {
    return;
  }

  for (const scene of visualScenes) {
    const activeLayers = visualScenes.filter((candidate) => sceneRangesOverlap(scene, candidate));
    if (activeLayers.length > 3) {
      push(
        issues,
        'warning',
        'timeline.layer-density',
        `more than three visual layers active near ${scene.start}s`,
        scene.id,
      );
    }
  }
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

  if (!allowedSlotsByStageMode[scene.stageMode].includes(scene.slot)) {
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
  if (
    scene.stageMode === 'presenter-center' &&
    scene.slot !== 'full-bleed' &&
    rectsIntersect(slotRect, layout.presenterSafeZone)
  ) {
    push(issues, 'blocking', 'safe-zone.presenter', `${scene.slot} enters presenter safe zone`, scene.id);
  }
  if (
    rectsIntersect(slotRect, layout.subtitleSafeZone) &&
    !isAcidFullCanvas(scene) &&
    !isTalkVideoBaseCanvas(scene)
  ) {
    push(issues, 'blocking', 'safe-zone.subtitle', `${scene.slot} enters subtitle safe zone`, scene.id);
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
