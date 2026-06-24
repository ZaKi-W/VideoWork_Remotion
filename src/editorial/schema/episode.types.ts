import type {z} from 'zod';
import type {
  assetManifestSchema,
  acidComponentPropsSchema,
  episodeSchema,
  narrationEchoLayerPropsSchema,
  sourceManifestSchema,
  summaryComponentPropsSchema,
  remotionTalkEffectPropsSchema,
  talkVideoBasePropsSchema,
} from './episode.schema';

export type EpisodeConfig = z.infer<typeof episodeSchema>;
export type EpisodeScene = EpisodeConfig['scenes'][number];
export type NarrationEchoLayerProps = z.infer<typeof narrationEchoLayerPropsSchema>;
export type AcidComponentProps = z.infer<typeof acidComponentPropsSchema>;
export type SummaryComponentProps = z.infer<typeof summaryComponentPropsSchema>;
export type TalkVideoBaseProps = z.infer<typeof talkVideoBasePropsSchema>;
export type RemotionTalkEffectProps = z.infer<typeof remotionTalkEffectPropsSchema>;
export type AssetManifest = z.infer<typeof assetManifestSchema>;
export type SourceManifest = z.infer<typeof sourceManifestSchema>;
export type EpisodeInputProps = {
  episode: EpisodeConfig;
  assets: AssetManifest;
  sources: SourceManifest;
  debug?: boolean;
  strict?: boolean;
};
