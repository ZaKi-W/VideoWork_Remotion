import episode from '../../../episodes/demo-evidence-clip/episode.json';
import assets from '../../../episodes/demo-evidence-clip/asset-manifest.json';
import sources from '../../../episodes/demo-evidence-clip/sources.json';
import {assetManifestSchema, episodeSchema, sourceManifestSchema} from '../schema/episode.schema';
import type {EpisodeInputProps} from '../schema/episode.types';

export const demoEvidenceClip: EpisodeInputProps = {
  debug: false,
  strict: false,
  episode: episodeSchema.parse(episode),
  assets: assetManifestSchema.parse(assets),
  sources: sourceManifestSchema.parse(sources),
};
