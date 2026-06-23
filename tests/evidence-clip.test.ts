import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {componentRegistry} from '../src/editorial/registry/component-registry';
import {evidenceClipPropsSchema} from '../src/editorial/schema/episode.schema';
import type {AssetManifest, EvidenceClipProps, EpisodeConfig, EpisodeScene, SourceManifest} from '../src/editorial/schema/episode.types';
import {validateEpisodeData} from '../src/editorial/validation/validate-episode';

const repoRoot = process.cwd();
const publicDir = path.join(repoRoot, 'public');

const baseProps: EvidenceClipProps = {
  assetId: 'asset-evidence',
  sourceRefId: 'source-evidence',
  variant: 'clipping',
  placement: 'top-right',
  crop: {
    fit: 'cover',
    focalPoint: {x: 0.5, y: 0.5},
    aspectRatio: '16:9',
  },
  sourceLabel: 'REF. / Demo Publisher',
  headline: '官方说明里最关键的是这一句',
  highlights: [
    {
      kind: 'marker',
      x: 0.1,
      y: 0.3,
      width: 0.6,
      height: 0.12,
      color: 'orange',
    },
  ],
  annotations: [
    {
      text: '关键表述',
      x: 0.62,
      y: 0.36,
      side: 'right',
    },
  ],
  showReferenceStrip: true,
};

const makeAsset = (
  overrides: Partial<AssetManifest['assets'][number]> = {},
): AssetManifest['assets'][number] => ({
  id: 'asset-evidence',
  type: 'screenshot',
  path: 'episodes/test-evidence-clip/assets/screenshots/reference-policy.svg',
  purpose: 'test evidence',
  sourceRefId: 'source-evidence',
  sceneHints: ['scene-evidence'],
  status: 'ready',
  ...overrides,
});

const makeSource = (
  overrides: Partial<SourceManifest['sources'][number]> = {},
): SourceManifest['sources'][number] => ({
  id: 'source-evidence',
  title: 'Evidence Source',
  publisher: 'Demo Publisher',
  url: 'https://example.test/source',
  publishedAt: '2026-06-22',
  capturedAssetId: 'asset-evidence',
  notes: 'test source',
  kind: 'external',
  status: 'captured',
  ...overrides,
});

const makeScene = (
  overrides: Partial<EpisodeScene> = {},
  props: Partial<EvidenceClipProps> = {},
): EpisodeScene => {
  const mergedProps = {
    ...baseProps,
    ...props,
  };
  return {
    id: 'scene-evidence',
    start: 0,
    end: 6,
    track: 'primary',
    kind: 'EvidenceClip',
    stageMode: 'presenter-center',
    slot: 'top-right',
    content: {
      kind: 'EvidenceClip',
      props: mergedProps,
    },
    assetIds: [mergedProps.assetId],
    sourceRefIds: [mergedProps.sourceRefId],
    status: 'ready',
    notes: '',
    ...overrides,
  };
};

const makeEpisode = (scene: EpisodeScene, presenterMode: 'placeholder' | 'video' = 'video'): EpisodeConfig => ({
  version: 1,
  episode: {
    id: 'evidence-test',
    title: 'Evidence Test',
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

describe('EvidenceClip', () => {
  it('accepts legal EvidenceClip props', () => {
    expect(evidenceClipPropsSchema.safeParse(baseProps).success).toBe(true);
  });

  it('rejects missing assetId', () => {
    expect(evidenceClipPropsSchema.safeParse({...baseProps, assetId: ''}).success).toBe(false);
  });

  it('rejects missing sourceRefId', () => {
    expect(evidenceClipPropsSchema.safeParse({...baseProps, sourceRefId: ''}).success).toBe(false);
  });

  it('blocks generated assets in strict render', () => {
    const scene = makeScene();
    const result = validateEpisodeData(
      makeEpisode(scene),
      {assets: [makeAsset({type: 'generated'})]},
      {sources: [makeSource()]},
      {mode: 'strict', publicDir},
    );

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'evidence.generated-strict')).toBe(true);
  });

  it.each(['pending', 'provided', 'rejected'] as const)('blocks %s sources in strict render', (status) => {
    const scene = makeScene();
    const result = validateEpisodeData(
      makeEpisode(scene),
      {assets: [makeAsset()]},
      {sources: [makeSource({status})]},
      {mode: 'strict', publicDir},
    );

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'evidence.source-status')).toBe(true);
  });

  it.each(['captured', 'verified'] as const)('allows %s sources in strict source-status checks', (status) => {
    const scene = makeScene();
    const result = validateEpisodeData(
      makeEpisode(scene),
      {assets: [makeAsset()]},
      {sources: [makeSource({status})]},
      {mode: 'strict', publicDir},
    );

    expect(result.issues.some((issue) => issue.code === 'evidence.source-status')).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'evidence.generated-strict')).toBe(false);
  });

  it('rejects highlight coordinates that exceed bounds', () => {
    const result = evidenceClipPropsSchema.safeParse({
      ...baseProps,
      highlights: [{kind: 'marker', x: 0.8, y: 0.2, width: 0.4, height: 0.1, color: 'orange'}],
    });

    expect(result.success).toBe(false);
  });

  it('rejects more than 3 highlights', () => {
    expect(
      evidenceClipPropsSchema.safeParse({
        ...baseProps,
        highlights: [
          {kind: 'marker', x: 0.1, y: 0.1, width: 0.1, height: 0.1},
          {kind: 'box', x: 0.2, y: 0.2, width: 0.1, height: 0.1},
          {kind: 'underline', x: 0.3, y: 0.3, width: 0.1, height: 0.1},
          {kind: 'marker', x: 0.4, y: 0.4, width: 0.1, height: 0.1},
        ],
      }).success,
    ).toBe(false);
  });

  it('rejects more than 2 annotations or overly long annotation text', () => {
    expect(
      evidenceClipPropsSchema.safeParse({
        ...baseProps,
        annotations: [
          {text: '一', x: 0.1, y: 0.1},
          {text: '二', x: 0.2, y: 0.2},
          {text: '三', x: 0.3, y: 0.3},
        ],
      }).success,
    ).toBe(false);
    expect(
      evidenceClipPropsSchema.safeParse({
        ...baseProps,
        annotations: [{text: '这是一条非常非常非常非常非常非常非常非常长的批注', x: 0.1, y: 0.1}],
      }).success,
    ).toBe(false);
  });

  it('allows clipping + presenter-center + top-right', () => {
    const scene = makeScene();
    const result = validateEpisodeData(makeEpisode(scene), {assets: [makeAsset()]}, {sources: [makeSource()]}, {mode: 'preview'});

    expect(result.ok).toBe(true);
  });

  it('rejects clipping + presenter-center + full-bleed', () => {
    const scene = makeScene(
      {slot: 'full-bleed'},
      {placement: 'full-bleed'},
    );
    const result = validateEpisodeData(makeEpisode(scene), {assets: [makeAsset()]}, {sources: [makeSource()]}, {mode: 'preview'});

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'evidence.slot-mode')).toBe(true);
  });

  it('rejects spotlight + presenter-center', () => {
    const scene = makeScene(
      {stageMode: 'presenter-center', slot: 'top-right'},
      {variant: 'spotlight', placement: 'top-right'},
    );
    const result = validateEpisodeData(makeEpisode(scene), {assets: [makeAsset()]}, {sources: [makeSource()]}, {mode: 'preview'});

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'evidence.stage-mode')).toBe(true);
  });

  it('allows spotlight + no-presenter + full-bleed', () => {
    const scene = makeScene(
      {stageMode: 'no-presenter', slot: 'full-bleed'},
      {variant: 'spotlight', placement: 'full-bleed'},
    );
    const result = validateEpisodeData(makeEpisode(scene), {assets: [makeAsset()]}, {sources: [makeSource()]}, {mode: 'preview'});

    expect(result.ok).toBe(true);
  });

  it('is registered as ready', () => {
    expect(componentRegistry.EvidenceClip.implementationStatus).toBe('ready');
  });

  it('passes preview validation for an EvidenceClip sample episode', () => {
    const result = validateEpisodeData(
      makeEpisode(makeScene()),
      {assets: [makeAsset()]},
      {sources: [makeSource()]},
      {mode: 'preview', publicDir},
    );

    expect(result.ok).toBe(true);
  });

  it('blocks EvidenceClip sample in strict validation because presenter and generated evidence are preview-only', () => {
    const result = validateEpisodeData(
      makeEpisode(makeScene(), 'placeholder'),
      {assets: [makeAsset({type: 'generated'})]},
      {sources: [makeSource()]},
      {mode: 'strict', publicDir},
    );

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'presenter.placeholder')).toBe(true);
    expect(result.issues.some((issue) => issue.code === 'evidence.generated-strict')).toBe(true);
  });
});
