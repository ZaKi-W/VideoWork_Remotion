import {describe, expect, it} from 'vitest';
import {componentRegistry} from '../src/editorial/registry/component-registry';
import {metricSpreadPropsSchema} from '../src/editorial/schema/episode.schema';
import type {EpisodeConfig, EpisodeScene, MetricSpreadProps, SourceManifest} from '../src/editorial/schema/episode.types';
import {validateEpisodeData} from '../src/editorial/validation/validate-episode';

const baseProps: MetricSpreadProps = {
  variant: 'delta-ledger',
  placement: 'top-left',
  accent: 'orange',
  primary: {
    value: '75%',
    label: '成本下降',
    direction: 'down',
  },
  rows: [
    {
      label: '缓存命中',
      before: '¥0.103',
      after: '¥0.026',
      delta: '-75%',
      emphasis: 'after',
    },
  ],
  sourceRefId: 'source-metric',
  sourceLabel: 'Metric Publisher',
  showRatioBar: true,
};

const makeSource = (
  overrides: Partial<SourceManifest['sources'][number]> = {},
): SourceManifest['sources'][number] => ({
  id: 'source-metric',
  title: 'Metric Source',
  publisher: 'Metric Publisher',
  url: 'https://example.test/metric',
  publishedAt: '2026-06-22',
  capturedAssetId: '',
  notes: 'test source',
  kind: 'external',
  status: 'captured',
  ...overrides,
});

const makeScene = (
  overrides: Partial<EpisodeScene> = {},
  props: Partial<MetricSpreadProps> = {},
): EpisodeScene => {
  const mergedProps: MetricSpreadProps = {
    ...baseProps,
    ...props,
  };
  return {
    id: 'scene-metric',
    start: 0,
    end: 6,
    track: 'primary',
    kind: 'MetricSpread',
    stageMode: 'presenter-center',
    slot: 'top-left',
    content: {
      kind: 'MetricSpread',
      props: mergedProps,
    },
    assetIds: [],
    sourceRefIds: [mergedProps.sourceRefId],
    status: 'ready',
    notes: '',
    ...overrides,
  };
};

const makeEpisode = (scene: EpisodeScene, presenterMode: 'placeholder' | 'video' = 'video'): EpisodeConfig => ({
  version: 1,
  episode: {
    id: 'metric-test',
    title: 'Metric Test',
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

describe('MetricSpread', () => {
  it('accepts legal MetricSpread props', () => {
    expect(metricSpreadPropsSchema.safeParse(baseProps).success).toBe(true);
  });

  it('rejects fewer than 1 or more than 4 rows', () => {
    expect(metricSpreadPropsSchema.safeParse({...baseProps, rows: []}).success).toBe(false);
    expect(
      metricSpreadPropsSchema.safeParse({
        ...baseProps,
        rows: [
          {label: '一', delta: '1'},
          {label: '二', delta: '2'},
          {label: '三', delta: '3'},
          {label: '四', delta: '4'},
          {label: '五', delta: '5'},
        ],
      }).success,
    ).toBe(false);
  });

  it('rejects rows without before, after, or delta', () => {
    expect(
      metricSpreadPropsSchema.safeParse({
        ...baseProps,
        rows: [{label: '空行'}],
      }).success,
    ).toBe(false);
  });

  it('rejects missing sourceRefId', () => {
    expect(metricSpreadPropsSchema.safeParse({...baseProps, sourceRefId: ''}).success).toBe(false);
  });

  it('rejects illegal accent', () => {
    expect(metricSpreadPropsSchema.safeParse({...baseProps, accent: 'green'}).success).toBe(false);
  });

  it('rejects right-side placements', () => {
    expect(metricSpreadPropsSchema.safeParse({...baseProps, placement: 'top-right'}).success).toBe(false);
    expect(metricSpreadPropsSchema.safeParse({...baseProps, placement: 'edge-right'}).success).toBe(false);
  });

  it('rejects presenter-center + screen-primary slot', () => {
    const scene = makeScene({slot: 'screen-primary'}, {placement: 'screen-primary'});
    const result = validateEpisodeData(makeEpisode(scene), {assets: []}, {sources: [makeSource()]}, {mode: 'preview'});

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'metric-spread.slot-mode')).toBe(true);
  });

  it('allows presenter-center + top-left', () => {
    const result = validateEpisodeData(makeEpisode(makeScene()), {assets: []}, {sources: [makeSource()]}, {mode: 'preview'});

    expect(result.ok).toBe(true);
  });

  it('allows presenter-center + edge-left', () => {
    const scene = makeScene({slot: 'edge-left'}, {placement: 'edge-left'});
    const result = validateEpisodeData(makeEpisode(scene), {assets: []}, {sources: [makeSource()]}, {mode: 'preview'});

    expect(result.ok).toBe(true);
  });

  it('allows no-presenter + screen-primary', () => {
    const scene = makeScene({stageMode: 'no-presenter', slot: 'screen-primary'}, {placement: 'screen-primary'});
    const result = validateEpisodeData(makeEpisode(scene), {assets: []}, {sources: [makeSource()]}, {mode: 'preview'});

    expect(result.ok).toBe(true);
  });

  it('warns for provided source in preview', () => {
    const result = validateEpisodeData(
      makeEpisode(makeScene()),
      {assets: []},
      {sources: [makeSource({status: 'provided'})]},
      {mode: 'preview'},
    );

    expect(result.ok).toBe(true);
    expect(result.issues.some((issue) => issue.code === 'metric-spread.source-provided-preview')).toBe(true);
  });

  it.each(['pending', 'provided', 'rejected'] as const)('blocks %s source in strict render', (status) => {
    const result = validateEpisodeData(
      makeEpisode(makeScene()),
      {assets: []},
      {sources: [makeSource({status})]},
      {mode: 'strict'},
    );

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'metric-spread.source-status')).toBe(true);
  });

  it('blocks demo source in strict render', () => {
    const result = validateEpisodeData(
      makeEpisode(makeScene()),
      {assets: []},
      {sources: [makeSource({kind: 'demo', status: 'captured'})]},
      {mode: 'strict'},
    );

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'metric-spread.demo-strict')).toBe(true);
  });

  it('is registered as ready', () => {
    expect(componentRegistry.MetricSpread.implementationStatus).toBe('ready');
  });

  it('passes preview validation for a MetricSpread sample episode', () => {
    const result = validateEpisodeData(
      makeEpisode(makeScene()),
      {assets: []},
      {sources: [makeSource()]},
      {mode: 'preview'},
    );

    expect(result.ok).toBe(true);
  });

  it('blocks MetricSpread sample in strict validation because presenter and demo source are preview-only', () => {
    const result = validateEpisodeData(
      makeEpisode(makeScene(), 'placeholder'),
      {assets: []},
      {sources: [makeSource({kind: 'demo', status: 'captured'})]},
      {mode: 'strict'},
    );

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'presenter.placeholder')).toBe(true);
    expect(result.issues.some((issue) => issue.code === 'metric-spread.demo-strict')).toBe(true);
  });
});
