import type {z} from 'zod';
import type {
  assetManifestSchema,
  episodeSchema,
  sectionStampPropsSchema,
  sourceManifestSchema,
} from './episode.schema';

export type EpisodeConfig = z.infer<typeof episodeSchema>;
export type EpisodeScene = EpisodeConfig['scenes'][number];
export type SectionStampProps = z.infer<typeof sectionStampPropsSchema>;
export type AssetManifest = z.infer<typeof assetManifestSchema>;
export type SourceManifest = z.infer<typeof sourceManifestSchema>;
export type EpisodeInputProps = {
  episode: EpisodeConfig;
  assets: AssetManifest;
  sources: SourceManifest;
  debug?: boolean;
  strict?: boolean;
};
