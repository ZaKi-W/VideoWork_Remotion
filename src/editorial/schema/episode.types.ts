import type {z} from 'zod';
import type {
  assetManifestSchema,
  acidComponentPropsSchema,
  conceptSplitPropsSchema,
  editorialOverlayPropsSchema,
  evidenceClipPropsSchema,
  episodeSchema,
  headlineTakeoverPropsSchema,
  metricSpreadPropsSchema,
  sectionStampPropsSchema,
  sourceManifestSchema,
} from './episode.schema';

export type EpisodeConfig = z.infer<typeof episodeSchema>;
export type EpisodeScene = EpisodeConfig['scenes'][number];
export type SectionStampProps = z.infer<typeof sectionStampPropsSchema>;
export type HeadlineTakeoverProps = z.infer<typeof headlineTakeoverPropsSchema>;
export type ConceptSplitProps = z.infer<typeof conceptSplitPropsSchema>;
export type EditorialOverlayProps = z.infer<typeof editorialOverlayPropsSchema>;
export type EvidenceClipProps = z.infer<typeof evidenceClipPropsSchema>;
export type MetricSpreadProps = z.infer<typeof metricSpreadPropsSchema>;
export type AcidComponentProps = z.infer<typeof acidComponentPropsSchema>;
export type AssetManifest = z.infer<typeof assetManifestSchema>;
export type SourceManifest = z.infer<typeof sourceManifestSchema>;
export type EpisodeInputProps = {
  episode: EpisodeConfig;
  assets: AssetManifest;
  sources: SourceManifest;
  debug?: boolean;
  strict?: boolean;
};
