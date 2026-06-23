import {describe, expect, it} from 'vitest';
import {componentRegistry} from '../src/editorial/registry/component-registry';
import {sectionStampPropsSchema} from '../src/editorial/schema/episode.schema';
import {
  normalizeSectionStampVariant,
  splitSectionStampTitle,
} from '../src/editorial/components/section-stamp-layout';
import {visualTokens} from '../src/editorial/stage/visual-tokens';
import type {EpisodeConfig, EpisodeScene} from '../src/editorial/schema/episode.types';
import {validateEpisodeData} from '../src/editorial/validation/validate-episode';

const baseSectionStampProps = {
  sectionNo: '01',
  brandLabel: 'ZAKI / NOTE',
  kicker: 'AI TOOL NOTE',
  title: '工作流才是重点',
  subline: '工具只是入口，不是终点',
  placement: 'top-left',
  variant: 'impact',
  accent: 'orange',
  emphasis: {
    text: '工作流',
    color: 'orange',
    mode: 'highlight-block',
  },
} as const;

const makeSectionStampScene = (overrides: Partial<EpisodeScene> = {}): EpisodeScene => ({
  id: 'scene-section-stamp',
  start: 0,
  end: 5,
  track: 'primary',
  kind: 'SectionStamp',
  stageMode: 'presenter-center',
  slot: 'top-left',
  content: {
    kind: 'SectionStamp',
    props: baseSectionStampProps,
  },
  assetIds: [],
  sourceRefIds: [],
  status: 'ready',
  notes: '',
  ...overrides,
});

const makeEpisode = (
  scenes: EpisodeScene[],
  presenterMode: 'placeholder' | 'video' = 'video',
): EpisodeConfig => ({
  version: 1,
  episode: {
    id: 'section-stamp-test',
    title: 'SectionStamp Test',
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

describe('SectionStamp', () => {
  it('accepts legal SectionStamp props', () => {
    const result = sectionStampPropsSchema.safeParse({
      sectionNo: 'A1',
      kicker: 'WORKFLOW',
      title: '工作流才是重点',
      subline: '工具只是入口',
      placement: 'top-left',
      variant: 'impact',
      accent: 'orange',
      brandLabel: 'ZAKI / NOTE',
      emphasis: {
        text: '工作流',
        color: 'orange',
        mode: 'highlight-block',
      },
    });

    expect(result.success).toBe(true);
  });

  it('rejects illegal placement in props schema', () => {
    const result = sectionStampPropsSchema.safeParse({
      sectionNo: '01',
      kicker: 'WORKFLOW',
      title: '工作流才是重点',
      placement: 'bottom-left',
    });

    expect(result.success).toBe(false);
  });

  it('rejects emphasis text that is not in the title', () => {
    const result = sectionStampPropsSchema.safeParse({
      sectionNo: '01',
      kicker: 'WORKFLOW',
      title: '工作流才是重点',
      placement: 'top-left',
      variant: 'impact',
      emphasis: {
        text: '不存在',
      },
    });

    expect(result.success).toBe(false);
  });

  it('accepts all SectionStamp emphasis modes', () => {
    for (const mode of ['highlight-block', 'reverse', 'underline'] as const) {
      const result = sectionStampPropsSchema.safeParse({
        ...baseSectionStampProps,
        emphasis: {
          text: '工作流',
          color: mode === 'reverse' ? 'blue' : 'orange',
          mode,
        },
      });

      expect(result.success).toBe(true);
    }
  });

  it('rejects multiple emphasis keywords by schema shape', () => {
    const result = sectionStampPropsSchema.safeParse({
      sectionNo: '01',
      kicker: 'WORKFLOW',
      title: '工作流才是重点',
      placement: 'top-left',
      variant: 'impact',
      emphasis: [
        {
          text: '工作流',
        },
        {
          text: '重点',
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('accepts impact and edge-impact variants', () => {
    expect(
      sectionStampPropsSchema.safeParse({
        ...baseSectionStampProps,
        variant: 'impact',
      }).success,
    ).toBe(true);
    expect(
      sectionStampPropsSchema.safeParse({
        ...baseSectionStampProps,
        title: '一条视频怎么自动生成',
        placement: 'edge-left',
        variant: 'edge-impact',
        emphasis: {
          text: '自动生成',
          mode: 'underline',
        },
      }).success,
    ).toBe(true);
  });

  it('keeps index-strip and edge-note variants compatible', () => {
    expect(sectionStampPropsSchema.safeParse({...baseSectionStampProps, variant: 'index-strip'}).success).toBe(true);
    expect(
      sectionStampPropsSchema.safeParse({
        ...baseSectionStampProps,
        title: '一条视频怎么自动生成',
        placement: 'edge-left',
        variant: 'edge-note',
        emphasis: {
          text: '自动生成',
        },
      }).success,
    ).toBe(true);
  });

  it('normalizes old variants without breaking compatibility', () => {
    expect(normalizeSectionStampVariant('index-strip')).toBe('impact');
    expect(normalizeSectionStampVariant('edge-note')).toBe('edge-impact');
  });

  it('supports explicit title line breaks', () => {
    expect(splitSectionStampTitle('工作流\n才是重点')).toEqual(['工作流', '才是重点']);
  });

  it('splits long Chinese titles into balanced two-line titles', () => {
    expect(splitSectionStampTitle('不是所有 AI 工具都值得长期使用')).toEqual([
      '不是所有AI工具',
      '都值得长期使用',
    ]);
  });

  it('exposes display and body font stacks in visual tokens', () => {
    expect(visualTokens.fontFamily.display).toContain('Source Han Sans SC');
    expect(visualTokens.fontFamily.body).toContain('MiSans');
  });

  it.each(['bottom-left', 'bottom-right', 'center-overlay', 'full-bleed', 'screen-primary'] as const)(
    'rejects %s as a SectionStamp scene slot',
    (slot) => {
      const episode = makeEpisode([
        makeSectionStampScene({
        slot,
        content: {
          kind: 'SectionStamp',
          props: {
            ...baseSectionStampProps,
            placement: 'top-left',
          },
        },
        }),
      ]);

      const result = validateEpisodeData(episode, {assets: []}, {sources: []}, {mode: 'preview'});

      expect(result.ok).toBe(false);
      expect(result.issues.some((issue) => issue.code === 'component.slot')).toBe(true);
    },
  );

  it('is registered as ready', () => {
    expect(componentRegistry.SectionStamp.implementationStatus).toBe('ready');
  });

  it('is not blocked by component status in strict validation', () => {
    const episode = makeEpisode([makeSectionStampScene()]);

    const result = validateEpisodeData(episode, {assets: []}, {sources: []}, {mode: 'strict'});

    expect(result.issues.some((issue) => issue.code === 'component.prototype')).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'component.planned')).toBe(false);
  });

  it('warns when SectionStamp title may become long', () => {
    const episode = makeEpisode([
      makeSectionStampScene({
      content: {
        kind: 'SectionStamp',
        props: {
          ...baseSectionStampProps,
          title: '这是一个比较偏长但仍然合法的章节标题啊',
          emphasis: {
            text: '章节标题',
            color: 'orange',
            mode: 'underline',
          },
        },
      },
      }),
    ]);

    const result = validateEpisodeData(episode, {assets: []}, {sources: []}, {mode: 'preview'});

    expect(result.issues.some((issue) => issue.code === 'section-stamp.title-long')).toBe(true);
  });

  it('passes preview validation for a SectionStamp sample episode', () => {
    const episode = makeEpisode([makeSectionStampScene()]);

    const result = validateEpisodeData(episode, {assets: []}, {sources: []}, {mode: 'preview'});

    expect(result.ok).toBe(true);
  });

  it('warns for a long-title stress scene without blocking preview', () => {
    const episode = makeEpisode([
      makeSectionStampScene(),
      makeSectionStampScene({
        id: 'scene-04',
        start: 6,
        end: 10,
        content: {
          kind: 'SectionStamp',
          props: {
            ...baseSectionStampProps,
            title: '这是一个比较偏长但仍然合法的章节标题啊',
            emphasis: {
              text: '章节标题',
              color: 'orange',
              mode: 'underline',
            },
          },
        },
      }),
    ]);

    const result = validateEpisodeData(episode, {assets: []}, {sources: []}, {mode: 'preview'});

    expect(result.ok).toBe(true);
    expect(
      result.issues.some(
        (issue) => issue.code === 'section-stamp.title-long' && issue.sceneId === 'scene-04',
      ),
    ).toBe(true);
  });

  it('still blocks center-overlay in presenter-center through safe-zone rules', () => {
    const episode = makeEpisode([makeSectionStampScene({slot: 'center-overlay'})]);

    const result = validateEpisodeData(episode, {assets: []}, {sources: []}, {mode: 'preview'});

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'safe-zone.presenter')).toBe(true);
  });

  it('blocks SectionStamp sample in strict validation because presenter is placeholder', () => {
    const episode = makeEpisode([makeSectionStampScene()], 'placeholder');

    const result = validateEpisodeData(episode, {assets: []}, {sources: []}, {mode: 'strict'});

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'presenter.placeholder')).toBe(true);
  });
});
