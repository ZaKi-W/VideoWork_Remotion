import {describe, expect, it} from 'vitest';
import {componentRegistry} from '../src/editorial/registry/component-registry';
import {headlineTakeoverPropsSchema} from '../src/editorial/schema/episode.schema';
import type {EpisodeConfig, EpisodeScene, HeadlineTakeoverProps} from '../src/editorial/schema/episode.types';
import {validateEpisodeData} from '../src/editorial/validation/validate-episode';

const baseHeadlineProps: HeadlineTakeoverProps = {
  lines: ['不是模型不够强', '是工作流没搭好'],
  emphasis: {
    text: '工作流',
    color: 'orange',
    mode: 'highlight-block',
  },
  mode: 'punch',
  placement: 'left-dominant',
  alignment: 'left',
  allowSubjectOverlay: false,
};

const makeHeadlineScene = (
  overrides: Partial<EpisodeScene> = {},
  props: Partial<HeadlineTakeoverProps> = {},
): EpisodeScene => ({
  id: 'scene-headline',
  start: 0,
  end: 6,
  track: 'primary',
  kind: 'HeadlineTakeover',
  stageMode: 'presenter-center',
  slot: 'edge-left',
  content: {
    kind: 'HeadlineTakeover',
    props: {
      ...baseHeadlineProps,
      ...props,
    },
  },
  assetIds: [],
  sourceRefIds: [],
  status: 'ready',
  notes: '',
  ...overrides,
});

const makeEpisode = (scene: EpisodeScene, presenterMode: 'placeholder' | 'video' = 'video'): EpisodeConfig => ({
  version: 1,
  episode: {
    id: 'headline-test',
    title: 'Headline Test',
    width: 1920,
    height: 1080,
    fps: 30,
    durationInSeconds: 8,
    status: 'DRAFT',
  },
  presenter: {
    mode: presenterMode,
    videoAssetId: null,
    subtitleAssetId: null,
    defaultStageMode: 'presenter-center',
  },
  scenes: [scene],
});

describe('HeadlineTakeover', () => {
  it('accepts legal HeadlineTakeover props', () => {
    expect(headlineTakeoverPropsSchema.safeParse(baseHeadlineProps).success).toBe(true);
  });

  it('rejects fewer than one or more than three title lines', () => {
    expect(headlineTakeoverPropsSchema.safeParse({...baseHeadlineProps, lines: []}).success).toBe(false);
    expect(
      headlineTakeoverPropsSchema.safeParse({
        ...baseHeadlineProps,
        lines: ['一', '二', '三', '四'],
      }).success,
    ).toBe(false);
  });

  it('rejects emphasis text that is not continuous in lines', () => {
    const result = headlineTakeoverPropsSchema.safeParse({
      ...baseHeadlineProps,
      emphasis: {
        text: '不存在',
        color: 'orange',
        mode: 'highlight-block',
      },
    });

    expect(result.success).toBe(false);
  });

  it('allows only one emphasis keyword by schema shape', () => {
    const result = headlineTakeoverPropsSchema.safeParse({
      ...baseHeadlineProps,
      emphasis: [
        {text: '工作流'},
        {text: '模型'},
      ],
    });

    expect(result.success).toBe(false);
  });

  it('rejects presenter-center + takeover', () => {
    const scene = makeHeadlineScene(
      {stageMode: 'presenter-center', slot: 'edge-left'},
      {mode: 'takeover', placement: 'wraparound', alignment: 'center'},
    );
    const result = validateEpisodeData(makeEpisode(scene), {assets: []}, {sources: []}, {mode: 'preview'});

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'headline-takeover.stage-mode')).toBe(true);
  });

  it('rejects presenter-center + center-overlay', () => {
    const scene = makeHeadlineScene({stageMode: 'presenter-center', slot: 'center-overlay'});
    const result = validateEpisodeData(makeEpisode(scene), {assets: []}, {sources: []}, {mode: 'preview'});

    expect(result.ok).toBe(false);
    expect(
      result.issues.some(
        (issue) => issue.code === 'headline-takeover.slot-mode' || issue.code === 'safe-zone.presenter',
      ),
    ).toBe(true);
  });

  it('allows takeover + no-presenter + full-bleed', () => {
    const scene = makeHeadlineScene(
      {stageMode: 'no-presenter', slot: 'full-bleed'},
      {
        lines: ['一条视频', '自动生成'],
        emphasis: {
          text: '自动生成',
          color: 'orange',
          mode: 'highlight-block',
        },
        mode: 'takeover',
        placement: 'wraparound',
        alignment: 'center',
      },
    );
    const result = validateEpisodeData(makeEpisode(scene), {assets: []}, {sources: []}, {mode: 'preview'});

    expect(result.ok).toBe(true);
  });

  it('is registered as ready', () => {
    expect(componentRegistry.HeadlineTakeover.implementationStatus).toBe('ready');
  });

  it('passes preview validation for a HeadlineTakeover sample episode', () => {
    const result = validateEpisodeData(makeEpisode(makeHeadlineScene()), {assets: []}, {sources: []}, {mode: 'preview'});

    expect(result.ok).toBe(true);
  });

  it('blocks HeadlineTakeover sample in strict validation because presenter is placeholder', () => {
    const result = validateEpisodeData(makeEpisode(makeHeadlineScene(), 'placeholder'), {assets: []}, {sources: []}, {mode: 'strict'});

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'presenter.placeholder')).toBe(true);
  });
});
