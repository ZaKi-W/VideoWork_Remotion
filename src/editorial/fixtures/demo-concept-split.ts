import episode from '../../../episodes/demo-concept-split/episode.json';
import assets from '../../../episodes/demo-concept-split/asset-manifest.json';
import sources from '../../../episodes/demo-concept-split/sources.json';
import {assetManifestSchema, episodeSchema, sourceManifestSchema} from '../schema/episode.schema';
import type {EpisodeInputProps} from '../schema/episode.types';

export const demoConceptSplit: EpisodeInputProps = {
  debug: false,
  strict: false,
  episode: episodeSchema.parse(episode),
  assets: assetManifestSchema.parse(assets),
  sources: sourceManifestSchema.parse(sources),
};
