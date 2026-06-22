import {describe, expect, it} from 'vitest';
import {demoPaperLab} from '../src/editorial/fixtures/demo-paper-lab';
import {episodeSchema} from '../src/editorial/schema/episode.schema';
import type {EpisodeConfig, EpisodeScene} from '../src/editorial/schema/episode.types';
import {validateEpisodeData} from '../src/editorial/validation/validate-episode';

const cloneDemo = (): EpisodeConfig => structuredClone(demoPaperLab.episode);

describe('episode schema and validation', () => {
  it('rejects invalid scene time ranges', () => {
    const episode = cloneDemo();
    episode.scenes[0].end = episode.scenes[0].start;

    expect(episodeSchema.safeParse(episode).success).toBe(false);
  });

  it('fails strict validation when EvidenceClip lacks sourceRefId', () => {
    const episode = cloneDemo();
    episode.presenter.mode = 'video';
    episode.scenes = [
      {
        id: 'scene-evidence',
        start: 0,
        end: 5,
        track: 'primary',
        kind: 'EvidenceClip',
        stageMode: 'screen-primary',
        slot: 'screen-primary',
        content: {
          kind: 'EvidenceClip',
          props: {
            assetId: 'asset-screen',
            sourceRefId: 'source-demo-001',
            sourceLabel: 'Demo',
            highlights: [],
            annotations: [],
            placement: 'screen-primary',
          },
        },
        assetIds: [],
        sourceRefIds: [],
        status: 'ready',
        notes: '',
      },
    ];

    const result = validateEpisodeData(episode, demoPaperLab.assets, demoPaperLab.sources, {mode: 'strict'});

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'evidence.source-required')).toBe(true);
  });

  it('fails when center-overlay enters presenter-center safe zone', () => {
    const episode = cloneDemo();
    episode.scenes[0] = {
      ...episode.scenes[0],
      stageMode: 'presenter-center',
      slot: 'center-overlay',
    };

    const result = validateEpisodeData(episode, demoPaperLab.assets, demoPaperLab.sources, {mode: 'preview'});

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'safe-zone.presenter')).toBe(true);
  });

  it('fails strict validation when a planned component is present', () => {
    const episode = cloneDemo();
    episode.presenter.mode = 'video';
    const plannedScene: EpisodeScene = {
      id: 'scene-planned',
      start: 0,
      end: 5,
      track: 'primary',
      kind: 'ConceptSplit',
      stageMode: 'screen-primary',
      slot: 'screen-primary',
      content: {
        kind: 'ConceptSplit',
        props: {
          left: 'old',
          right: 'new',
          dividerLabel: 'vs',
          comparisonMode: 'old-new',
        },
      },
      assetIds: [],
      sourceRefIds: [],
      status: 'ready',
      notes: '',
    };
    episode.scenes = [plannedScene];

    const result = validateEpisodeData(episode, demoPaperLab.assets, demoPaperLab.sources, {mode: 'strict'});

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'component.planned')).toBe(true);
  });

  it('allows demo-paper-lab to pass preview validation', () => {
    const result = validateEpisodeData(demoPaperLab.episode, demoPaperLab.assets, demoPaperLab.sources, {
      mode: 'preview',
    });

    expect(result.ok).toBe(true);
  });
});
