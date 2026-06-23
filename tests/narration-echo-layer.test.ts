import {describe, expect, it} from 'vitest';
import {componentRegistry} from '../src/editorial/registry/component-registry';
import {narrationEchoLayerPropsSchema} from '../src/editorial/schema/episode.schema';
import type {EpisodeConfig, EpisodeScene, NarrationEchoLayerProps} from '../src/editorial/schema/episode.types';
import {validateEpisodeData} from '../src/editorial/validation/validate-episode';

const emptyAssets = {assets: []};
const emptySources = {sources: []};

const baseProps: NarrationEchoLayerProps = {
  placement: 'edge-left',
  charFrames: 2,
  segmentPauseFrames: 6,
  exitFrames: 12,
  showSoftener: true,
  items: [
    {
      label: 'AI 工作流',
      beat: '01 / 03',
      segments: [
        {text: '真正费神的，'},
        {break: true, pauseFrames: 5},
        {text: '不是'},
        {text: '生成', accent: true},
        {text: '。'},
      ],
      copy: '直出只是起点，真正的工作量在后续视觉和节奏的调整。',
      track: ['默认效果', '视觉调整', '形成风格'],
      activeTrackIndex: 1,
      focus: '视觉表达',
    },
  ],
};

const echoScene = (overrides: Partial<EpisodeScene> = {}): EpisodeScene => ({
  id: 'echo-01',
  start: 0,
  end: 5,
  track: 'overlay',
  kind: 'NarrationEchoLayer',
  stageMode: 'presenter-center',
  slot: 'edge-left',
  content: {
    kind: 'NarrationEchoLayer',
    props: baseProps,
  },
  assetIds: [],
  sourceRefIds: [],
  status: 'ready',
  notes: '',
  ...overrides,
});

const episodeWith = (scenes: EpisodeScene[]): EpisodeConfig => ({
  version: 1,
  episode: {
    id: 'test-narration-echo',
    title: 'NarrationEchoLayer validation',
    width: 1920,
    height: 1080,
    fps: 30,
    durationInSeconds: 8,
    status: 'DRAFT',
  },
  presenter: {
    mode: 'placeholder',
    videoAssetId: null,
    subtitleAssetId: null,
    defaultStageMode: 'presenter-center',
  },
  scenes,
});

describe('NarrationEchoLayer schema', () => {
  it('accepts phrase-based typewriter props', () => {
    expect(narrationEchoLayerPropsSchema.safeParse(baseProps).success).toBe(true);
  });

  it('rejects accent segments that arrive too early', () => {
    const result = narrationEchoLayerPropsSchema.safeParse({
      ...baseProps,
      items: [
        {
          ...baseProps.items[0],
          segments: [{text: '生成', accent: true}, {text: '之后'}, {text: '才费神'}],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('rejects active track indexes outside the thought track', () => {
    const result = narrationEchoLayerPropsSchema.safeParse({
      ...baseProps,
      items: [
        {
          ...baseProps.items[0],
          track: ['默认效果', '视觉调整'],
          activeTrackIndex: 2,
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});

describe('NarrationEchoLayer registry and validation', () => {
  it('is registered as a ready left-side talk overlay', () => {
    expect(componentRegistry.NarrationEchoLayer.implementationStatus).toBe('ready');
    expect(componentRegistry.NarrationEchoLayer.allowedSlots).toEqual(['edge-left', 'top-left']);
  });

  it('validates a left-side presenter-center overlay scene', () => {
    const result = validateEpisodeData(episodeWith([echoScene()]), emptyAssets, emptySources, {mode: 'preview'});

    expect(result.ok).toBe(true);
  });

  it('flags placement mismatches', () => {
    const result = validateEpisodeData(
      episodeWith([
        echoScene({
          slot: 'top-left',
        }),
      ]),
      emptyAssets,
      emptySources,
      {mode: 'strict'},
    );

    expect(result.issues.some((issue) => issue.code === 'narration-echo.placement-mismatch')).toBe(true);
  });
});
