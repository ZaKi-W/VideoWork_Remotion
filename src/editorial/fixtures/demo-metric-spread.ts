import episode from '../../../episodes/demo-metric-spread/episode.json';
import assets from '../../../episodes/demo-metric-spread/asset-manifest.json';
import sources from '../../../episodes/demo-metric-spread/sources.json';
import {assetManifestSchema, episodeSchema, sourceManifestSchema} from '../schema/episode.schema';
import type {EpisodeInputProps} from '../schema/episode.types';

export const demoMetricSpread: EpisodeInputProps = {
  debug: false,
  strict: false,
  episode: episodeSchema.parse(episode),
  assets: assetManifestSchema.parse(assets),
  sources: sourceManifestSchema.parse(sources),
};
