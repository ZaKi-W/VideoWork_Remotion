import {describe, expect, it} from 'vitest';
import {componentRegistry} from '../src/editorial/registry/component-registry';
import {conceptSplitPropsSchema} from '../src/editorial/schema/episode.schema';
import type {ConceptSplitProps, EpisodeConfig, EpisodeScene} from '../src/editorial/schema/episode.types';
import {validateEpisodeData} from '../src/editorial/validation/validate-episode';

const baseProps: ConceptSplitProps = {
  mode: 'cross-cut',
  relationship: 'from-to',
  anchor: 'right-heavy',
  accent: 'blue',
  emphasize: 'right',
  showDivider: true,
  left: {
    eyebrow: '旧方式',
    title: '聊天',
    description: '问一句，答一句',
  },
  right: {
    eyebrow: '新方式',
    title: '执行',
    description: '读文件、改文件、交付任务',
  },
  bridge: {
    label: '从对话到执行',
    style: 'arrow',
  },
};

const makeScene = (
  overrides: Partial<EpisodeScene> = {},
  props: Partial<ConceptSplitProps> = {},
): EpisodeScene => {
  const mergedProps: ConceptSplitProps = {
    ...baseProps,
    ...props,
  };
  return {
    id: 'scene-concept',
    start: 0,
    end: 6,
    track: 'primary',
    kind: 'ConceptSplit',
    stageMode: 'presenter-center',
    slot: 'top-left',
    content: {
      kind: 'ConceptSplit',
      props: mergedProps,
    },
    assetIds: [],
    sourceRefIds: [],
    status: 'ready',
    notes: '',
    ...overrides,
  };
};

const makeEpisode = (scene: EpisodeScene, presenterMode: 'placeholder' | 'video' = 'video'): EpisodeConfig => ({
  version: 1,
  episode: {
    id: 'concept-test',
    title: 'Concept Test',
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

describe('ConceptSplit', () => {
  it('accepts legal ConceptSplit props', () => {
    expect(conceptSplitPropsSchema.safeParse(baseProps).success).toBe(true);
  });

  it('rejects missing left or right title', () => {
    const missingLeftTitle: unknown = {
      ...baseProps,
      left: {
        description: '问一句，答一句',
      },
    };
    const missingRightTitle: unknown = {
      ...baseProps,
      right: {
        description: '读文件、改文件、交付任务',
      },
    };

    expect(conceptSplitPropsSchema.safeParse(missingLeftTitle).success).toBe(false);
    expect(conceptSplitPropsSchema.safeParse(missingRightTitle).success).toBe(false);
  });

  it('rejects more than two points', () => {
    expect(
      conceptSplitPropsSchema.safeParse({
        ...baseProps,
        left: {
          title: '手动剪辑',
          points: ['逐段调整', '反复预览', '重复劳动'],
        },
      }).success,
    ).toBe(false);
  });

  it('rejects overlong descriptions and points', () => {
    expect(
      conceptSplitPropsSchema.safeParse({
        ...baseProps,
        left: {
          title: '旧方式',
          description: 'abcdefghijklmnopqrstuvwxyzabcdefghi',
        },
      }).success,
    ).toBe(false);
    expect(
      conceptSplitPropsSchema.safeParse({
        ...baseProps,
        right: {
          title: '新方式',
          points: ['这是一条明显超过十八个字符限制的长解释点'],
        },
      }).success,
    ).toBe(false);
  });

  it('rejects illegal accent', () => {
    expect(conceptSplitPropsSchema.safeParse({...baseProps, accent: 'green'}).success).toBe(false);
  });

  it('allows cross-cut presenter-center + top-left', () => {
    const result = validateEpisodeData(makeEpisode(makeScene()), {assets: []}, {sources: []}, {mode: 'preview'});

    expect(result.ok).toBe(true);
  });

  it('rejects editorial-fold with presenter-center', () => {
    const scene = makeScene({}, {mode: 'editorial-fold'});
    const result = validateEpisodeData(makeEpisode(scene), {assets: []}, {sources: []}, {mode: 'preview'});

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'concept-split.stage-mode')).toBe(true);
  });

  it('allows editorial-fold no-presenter + full-bleed', () => {
    const scene = makeScene(
      {stageMode: 'no-presenter', slot: 'full-bleed'},
      {mode: 'editorial-fold', relationship: 'versus'},
    );
    const result = validateEpisodeData(makeEpisode(scene), {assets: []}, {sources: []}, {mode: 'preview'});

    expect(result.ok).toBe(true);
  });

  it('rejects handoff with presenter-center', () => {
    const scene = makeScene({slot: 'edge-right'}, {mode: 'handoff'});
    const result = validateEpisodeData(makeEpisode(scene), {assets: []}, {sources: []}, {mode: 'preview'});

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'concept-split.stage-mode')).toBe(true);
  });

  it('allows handoff screen-primary + edge-right', () => {
    const scene = makeScene({stageMode: 'screen-primary', slot: 'edge-right'}, {mode: 'handoff'});
    const result = validateEpisodeData(makeEpisode(scene), {assets: []}, {sources: []}, {mode: 'preview'});

    expect(result.ok).toBe(true);
  });

  it('is registered as ready', () => {
    expect(componentRegistry.ConceptSplit.implementationStatus).toBe('ready');
  });

  it('passes preview validation for a ConceptSplit sample episode', () => {
    const result = validateEpisodeData(makeEpisode(makeScene()), {assets: []}, {sources: []}, {mode: 'preview'});

    expect(result.ok).toBe(true);
  });

  it('blocks ConceptSplit sample in strict validation because presenter is placeholder', () => {
    const result = validateEpisodeData(makeEpisode(makeScene(), 'placeholder'), {assets: []}, {sources: []}, {mode: 'strict'});

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'presenter.placeholder')).toBe(true);
  });
});
