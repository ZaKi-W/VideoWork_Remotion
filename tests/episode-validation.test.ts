import {describe, expect, it} from 'vitest';
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

describe('episode schema and validation', () => {
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
});
