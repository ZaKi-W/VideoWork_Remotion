import {describe, expect, it} from 'vitest';
import codexGuideTalkAssets from '../episodes/CodexGuideTalk/asset-manifest.json';
import codexGuideTalkEpisode from '../episodes/CodexGuideTalk/episode.json';
import codexGuideTalkSources from '../episodes/CodexGuideTalk/sources.json';
import {episodeSchema} from '../src/editorial/schema/episode.schema';
import type {AssetManifest, EpisodeConfig, SourceManifest} from '../src/editorial/schema/episode.types';
import {validateEpisodeData} from '../src/editorial/validation/validate-episode';

const sampleAssets: AssetManifest = {assets: []};
const sampleSources: SourceManifest = {
  sources: [
    {
      id: 'source-demo-001',
      title: 'Validation sample source',
      publisher: 'Zaki Video Pipeline',
      url: '',
      publishedAt: '',
      capturedAssetId: '',
      notes: 'Local validation sample.',
      kind: 'demo',
      status: 'provided',
    },
  ],
};

const makeSampleEpisode = (): EpisodeConfig => ({
  version: 1,
  episode: {
    id: 'validation-sample',
    title: 'Validation Sample',
    width: 1920,
    height: 1080,
    fps: 30,
    durationInSeconds: 20,
    status: 'DRAFT',
  },
  presenter: {
    mode: 'placeholder',
    videoAssetId: null,
    subtitleAssetId: null,
    defaultStageMode: 'presenter-center',
  },
  scenes: [
    {
      id: 'scene-01',
      start: 0,
      end: 10,
      track: 'primary',
      kind: 'RemotionTalkEffect',
      stageMode: 'presenter-center',
      slot: 'edge-left',
      content: {
        kind: 'RemotionTalkEffect',
        props: {
          variant: 'statement',
          eyebrow: 'VALIDATION',
          title: '本地校验样例',
          accent: 'lime',
          items: [],
        },
      },
      assetIds: [],
      sourceRefIds: [],
      status: 'ready',
      notes: '',
    },
  ],
});

const cloneSample = (): EpisodeConfig => structuredClone(makeSampleEpisode());

const addTalkVideoScene = (episode: EpisodeConfig) => {
  episode.scenes.unshift({
    id: 'talk-video',
    start: 0,
    end: 20,
    track: 'background',
    kind: 'TalkVideoBase',
    stageMode: 'no-presenter',
    slot: 'full-bleed',
    content: {
      kind: 'TalkVideoBase',
      props: {
        videoPath: 'episodes/RemotionTalk/talk.mp4',
        audio: false,
        fit: 'cover',
        subtitleMaxWidth: 1040,
      },
    },
    assetIds: [],
    sourceRefIds: [],
    status: 'ready',
    notes: '',
  });
};

const addSemanticSidecar = (
  episode: EpisodeConfig,
  id: string,
  slot: 'edge-left' | 'edge-right',
) => {
  episode.scenes.push({
    id,
    start: 0,
    end: 10,
    track: 'overlay',
    kind: 'SemanticTextReveal',
    stageMode: 'presenter-small',
    slot,
    content: {
      kind: 'SemanticTextReveal',
      props: {
        text: '人物对侧语义文字',
        mode: 'words',
        emphasis: [],
        startFrame: 0,
        durationInFrames: 18,
        staggerFrames: 2,
        blurPx: 8,
        accentColor: '#c7ff3d',
        align: 'left',
      },
    },
    assetIds: [],
    sourceRefIds: [],
    status: 'ready',
    notes: '',
  });
};

const addPixelScene = (episode: EpisodeConfig, id: string) => {
  episode.scenes.push({
    id,
    start: 0,
    end: 3,
    track: 'primary',
    kind: 'PixelReveal',
    stageMode: 'no-presenter',
    slot: 'full-bleed',
    content: {
      kind: 'PixelReveal',
      props: {
        title: '个人方法',
        description: '虚构演示内容',
        values: [],
        startFrame: 0,
        durationInFrames: 24,
        columns: 12,
        rows: 7,
        direction: 'center-out',
        cellGap: 2,
        pixelColor: '#151515',
        seed: 'test',
      },
    },
    assetIds: [],
    sourceRefIds: [],
    status: 'ready',
    notes: '',
  });
};

describe('episode schema and validation', () => {
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
    expect(codexGuideTalkAssets.assets.filter((asset) => asset.status === 'ready')).toHaveLength(6);
    expect(
      codexGuideTalkEpisode.scenes.find((scene) => scene.id === 'cgt-rule-flow')?.content.props,
    ).toMatchObject({
      source: {assetId: 'agents-no-deep-test-rule'},
    });
    expect(
      codexGuideTalkEpisode.scenes.find((scene) => scene.id === 'cgt-aesthetic-flow')?.content.props,
    ).toMatchObject({
      source: {assetId: 'ugly-ui-before'},
    });
    expect(
      codexGuideTalkEpisode.scenes.find((scene) => scene.id === 'cgt-html-design-video')?.content.props,
    ).toMatchObject({
      backgroundVideoPath: 'episodes/CodexGuideTalk/assets/gpt-html-design-flow.mp4',
    });
    expect(
      codexGuideTalkEpisode.scenes.find((scene) => scene.id === 'cgt-goal-run')?.content.props,
    ).toMatchObject({
      backgroundVideoPath: 'episodes/CodexGuideTalk/assets/pursue-goal-entry.mp4',
    });
    expect(
      codexGuideTalkEpisode.scenes.find((scene) => scene.id === 'cgt-codex-implements')?.content.props,
    ).not.toHaveProperty('backgroundVideoPath');
    expect(
      codexGuideTalkEpisode.scenes.find((scene) => scene.id === 'cgt-over-test-flow')?.content.props,
    ).not.toHaveProperty('backgroundVideoPath');
    expect(codexGuideTalkEpisode.scenes.filter((scene) => scene.kind === 'AgentExecution').length).toBeGreaterThanOrEqual(4);
  });

  it('rejects invalid scene time ranges', () => {
    const episode = cloneSample();
    episode.scenes[0].end = episode.scenes[0].start;

    expect(episodeSchema.safeParse(episode).success).toBe(false);
  });

  it('fails when center-overlay enters presenter-center safe zone', () => {
    const episode = cloneSample();
    episode.scenes[0] = {
      ...episode.scenes[0],
      stageMode: 'presenter-center',
      slot: 'center-overlay',
    };

    const result = validateEpisodeData(episode, sampleAssets, sampleSources, {mode: 'preview'});

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'safe-zone.presenter')).toBe(true);
  });

  it('allows the validation sample to pass preview validation', () => {
    const result = validateEpisodeData(makeSampleEpisode(), sampleAssets, sampleSources, {
      mode: 'preview',
    });

    expect(result.ok).toBe(true);
  });

  it('accepts a simple shot timeline with content and summary references', () => {
    const episode = cloneSample();
    addTalkVideoScene(episode);
    episode.scenes[1].id = 'summary-01';
    episode.scenes[1].track = 'overlay';
    episode.scenes.push({
      id: 'content-01',
      start: 4,
      end: 12,
      track: 'primary',
      kind: 'MediaWall',
      stageMode: 'no-presenter',
      slot: 'full-bleed',
      content: {
        kind: 'MediaWall',
        props: {
          title: ['内容', '展示'],
          subtitle: '镜头内容层',
          items: [],
          messages: [],
          mediaCount: 24,
          scrimIntensity: 'soft',
        },
      },
      assetIds: [],
      sourceRefIds: [],
      status: 'ready',
      notes: '',
    });
    episode.shots = [
      {from: 0, to: 90, mode: 'talk', summaryId: 'summary-01'},
      {from: 90, to: 180, mode: 'speaker-left', contentId: 'content-01'},
    ];

    const result = validateEpisodeData(episode, sampleAssets, sampleSources, {mode: 'preview'});

    expect(result.ok).toBe(true);
  });

  it('requires contentId for content shot modes', () => {
    const episode = cloneSample();
    addTalkVideoScene(episode);
    episode.shots = [{from: 0, to: 90, mode: 'speaker-left'}];

    const result = validateEpisodeData(episode, sampleAssets, sampleSources, {mode: 'preview'});

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'shots.content-required')).toBe(true);
  });

  it('accepts a right sidecar while the presenter is left', () => {
    const episode = cloneSample();
    addTalkVideoScene(episode);
    addSemanticSidecar(episode, 'c28-right', 'edge-right');
    episode.shots = [
      {from: 0, to: 90, mode: 'speaker-left', sidecarId: 'c28-right'},
    ];

    const result = validateEpisodeData(episode, sampleAssets, sampleSources, {
      mode: 'preview',
    });

    expect(result.issues.some(({code}) => code.startsWith('shots.sidecar'))).toBe(false);
  });

  it('rejects sidecarId outside speaker-left or speaker-right', () => {
    const episode = cloneSample();
    addTalkVideoScene(episode);
    addSemanticSidecar(episode, 'c28-right', 'edge-right');
    episode.shots = [{from: 0, to: 90, mode: 'talk', sidecarId: 'c28-right'}];

    const result = validateEpisodeData(episode, sampleAssets, sampleSources, {
      mode: 'preview',
    });

    expect(result.issues.some(({code}) => code === 'shots.sidecar-mode')).toBe(true);
  });

  it('rejects a sidecar placed on the presenter side', () => {
    const episode = cloneSample();
    addTalkVideoScene(episode);
    addSemanticSidecar(episode, 'c28-left', 'edge-left');
    episode.shots = [
      {from: 0, to: 90, mode: 'speaker-left', sidecarId: 'c28-left'},
    ];

    const result = validateEpisodeData(episode, sampleAssets, sampleSources, {
      mode: 'preview',
    });

    expect(result.issues.some(({code}) => code === 'shots.sidecar-slot')).toBe(true);
  });

  it('rejects contentId and sidecarId in the same shot', () => {
    const episode = cloneSample();
    addTalkVideoScene(episode);
    addSemanticSidecar(episode, 'c28-right', 'edge-right');
    episode.shots = [
      {
        from: 0,
        to: 90,
        mode: 'speaker-left',
        contentId: 'scene-01',
        sidecarId: 'c28-right',
      },
    ];

    const result = validateEpisodeData(episode, sampleAssets, sampleSources, {
      mode: 'preview',
    });

    expect(
      result.issues.some(({code}) => code === 'shots.sidecar-content-conflict'),
    ).toBe(true);
  });

  it('requires presenter C28 and C29 scenes to be referenced by sidecarId', () => {
    const episode = cloneSample();
    addTalkVideoScene(episode);
    addSemanticSidecar(episode, 'orphan-c28', 'edge-right');
    episode.shots = [{from: 0, to: 90, mode: 'talk'}];

    const result = validateEpisodeData(episode, sampleAssets, sampleSources, {
      mode: 'preview',
    });

    expect(
      result.issues.some(
        ({code}) => code === 'shots.primitive-sidecar-required',
      ),
    ).toBe(true);
  });

  it('rejects a C30 content-full shot shorter than reveal plus hold', () => {
    const episode = cloneSample();
    addTalkVideoScene(episode);
    addPixelScene(episode, 'pixel');
    episode.shots = [
      {from: 0, to: 68, mode: 'content-full', contentId: 'pixel'},
      {from: 68, to: 120, mode: 'talk'},
    ];

    const result = validateEpisodeData(episode, sampleAssets, sampleSources, {
      mode: 'preview',
    });

    expect(
      result.issues.some(
        ({code}) => code === 'shots.pixel-takeover-too-short',
      ),
    ).toBe(true);
  });
});
