import {describe, expect, it} from 'vitest';
import {componentRegistry} from '../src/editorial/registry/component-registry';
import {editorialOverlayPropsSchema, episodeSchema} from '../src/editorial/schema/episode.schema';
import type {EditorialOverlayProps, EpisodeConfig, EpisodeScene} from '../src/editorial/schema/episode.types';
import {validateEpisodeData} from '../src/editorial/validation/validate-episode';

const emptyAssets = {assets: []};
const emptySources = {sources: []};

const baseOverlayProps: EditorialOverlayProps = {
  placement: 'top-left',
  layout: 'corner-stack',
  density: 'medium',
  accent: 'orange',
  items: [
    {type: 'ghost-number', value: '01'},
    {type: 'keyword', text: '工作流', emphasis: 'block'},
    {
      type: 'mini-list',
      title: '关键环节',
      rows: [{label: '口播', emphasis: 'none'}, {label: '字幕', emphasis: 'none'}, {label: '分镜', emphasis: 'none'}],
    },
  ],
};

const overlayScene = (overrides: Partial<EpisodeScene> = {}): EpisodeScene => ({
  id: 'overlay-01',
  start: 0,
  end: 5,
  track: 'overlay',
  kind: 'EditorialOverlay',
  stageMode: 'presenter-center',
  slot: 'top-left',
  content: {
    kind: 'EditorialOverlay',
    props: baseOverlayProps,
  },
  assetIds: [],
  sourceRefIds: [],
  status: 'ready',
  notes: '',
  ...overrides,
});

const episodeWith = (scenes: EpisodeScene[], presenterMode: 'placeholder' | 'video' = 'video'): EpisodeConfig => ({
  version: 1,
  episode: {
    id: 'test-editorial-overlay',
    title: 'EditorialOverlay validation',
    width: 1920,
    height: 1080,
    fps: 30,
    durationInSeconds: 12,
    status: 'DRAFT',
  },
  presenter: {
    mode: presenterMode,
    videoAssetId: null,
    subtitleAssetId: null,
    defaultStageMode: 'presenter-center',
  },
  scenes,
});

describe('EditorialOverlay schema', () => {
  it('accepts valid EditorialOverlay props', () => {
    expect(editorialOverlayPropsSchema.safeParse(baseOverlayProps).success).toBe(true);
  });

  it('rejects more than four items', () => {
    const result = editorialOverlayPropsSchema.safeParse({
      ...baseOverlayProps,
      items: [
        {type: 'ghost-number', value: '01'},
        {type: 'keyword', text: '工作流'},
        {type: 'stat-tag', value: '3x'},
        {type: 'annotation', text: '轻量批注'},
        {type: 'stat-tag', value: '1次'},
      ],
    });

    expect(result.success).toBe(false);
  });

  it('rejects more than one keyword', () => {
    const result = editorialOverlayPropsSchema.safeParse({
      ...baseOverlayProps,
      items: [
        {type: 'keyword', text: '工作流'},
        {type: 'keyword', text: '执行'},
      ],
    });

    expect(result.success).toBe(false);
  });

  it('rejects more than one ghost-number', () => {
    const result = editorialOverlayPropsSchema.safeParse({
      ...baseOverlayProps,
      items: [
        {type: 'ghost-number', value: '01'},
        {type: 'ghost-number', value: '02'},
      ],
    });

    expect(result.success).toBe(false);
  });

  it('rejects mini-list rows outside the 2 to 4 row range', () => {
    expect(
      editorialOverlayPropsSchema.safeParse({
        ...baseOverlayProps,
        items: [{type: 'mini-list', rows: [{label: '读文件'}]}],
      }).success,
    ).toBe(false);

    expect(
      editorialOverlayPropsSchema.safeParse({
        ...baseOverlayProps,
        items: [
          {
            type: 'mini-list',
            rows: [{label: '一'}, {label: '二'}, {label: '三'}, {label: '四'}, {label: '五'}],
          },
        ],
      }).success,
    ).toBe(false);
  });

  it('rejects annotation text over 18 characters', () => {
    const result = editorialOverlayPropsSchema.safeParse({
      ...baseOverlayProps,
      items: [{type: 'annotation', text: '这是一条超过十八个中文字符限制的小批注'}],
    });

    expect(result.success).toBe(false);
  });
});

describe('EditorialOverlay validation', () => {
  it('blocks strict render when EditorialOverlay is not on overlay track', () => {
    const episode = episodeWith([overlayScene({track: 'primary'})]);
    const result = validateEpisodeData(episode, emptyAssets, emptySources, {mode: 'strict'});

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'editorial-overlay.track')).toBe(true);
  });

  it('allows presenter-center top-left placement', () => {
    const result = validateEpisodeData(episodeWith([overlayScene()]), emptyAssets, emptySources, {mode: 'preview'});

    expect(result.ok).toBe(true);
  });

  it('rejects presenter-center center-overlay placement', () => {
    const result = validateEpisodeData(
      episodeWith([
        overlayScene({
          slot: 'center-overlay',
          content: {
            kind: 'EditorialOverlay',
            props: {...baseOverlayProps, placement: 'top-left'},
          },
        }),
      ]),
      emptyAssets,
      emptySources,
      {mode: 'preview'},
    );

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'editorial-overlay.slot')).toBe(true);
  });

  it('warns when EditorialOverlay overlaps HeadlineTakeover', () => {
    const headline: EpisodeScene = {
      id: 'headline-01',
      start: 1,
      end: 4,
      track: 'primary',
      kind: 'HeadlineTakeover',
      stageMode: 'presenter-center',
      slot: 'top-right',
      content: {
        kind: 'HeadlineTakeover',
        props: {
          lines: ['核心观点'],
          mode: 'punch',
          placement: 'right-dominant',
          allowSubjectOverlay: false,
        },
      },
      assetIds: [],
      sourceRefIds: [],
      status: 'ready',
      notes: '',
    };
    const result = validateEpisodeData(episodeWith([overlayScene(), headline]), emptyAssets, emptySources, {mode: 'preview'});

    expect(result.issues.some((issue) => issue.level === 'warning' && issue.code === 'editorial-overlay.headline-overlap')).toBe(true);
  });

  it('blocks when two EditorialOverlay scenes are active at the same time', () => {
    const result = validateEpisodeData(
      episodeWith([
        overlayScene({id: 'overlay-a', start: 0, end: 5}),
        overlayScene({id: 'overlay-b', start: 4, end: 8, slot: 'top-right'}),
      ]),
      emptyAssets,
      emptySources,
      {mode: 'preview'},
    );

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'editorial-overlay.concurrent')).toBe(true);
  });

  it('registers EditorialOverlay as ready', () => {
    expect(componentRegistry.EditorialOverlay.implementationStatus).toBe('ready');
  });

  it('allows EditorialOverlay episode in preview but blocks strict placeholder presenter', () => {
    const episode = episodeWith([overlayScene()], 'placeholder');

    expect(episodeSchema.safeParse(episode).success).toBe(true);

    const preview = validateEpisodeData(episode, emptyAssets, emptySources, {
      mode: 'preview',
    });
    expect(preview.ok).toBe(true);

    const strict = validateEpisodeData(episode, emptyAssets, emptySources, {
      mode: 'strict',
    });
    expect(strict.ok).toBe(false);
    expect(strict.issues.some((issue) => issue.code === 'presenter.placeholder')).toBe(true);
  });
});
