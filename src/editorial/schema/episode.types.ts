import type {z} from 'zod';
import type {
  assetManifestSchema,
  acidComponentPropsSchema,
  episodeSchema,
  shotModeSchema,
  shotSchema,
  narrationEchoLayerPropsSchema,
  sourceManifestSchema,
  summaryComponentPropsSchema,
  remotionTalkEffectPropsSchema,
  semanticTextRevealPropsSchema,
  focusReticlePropsSchema,
  pixelRevealPropsSchema,
  talkVideoBasePropsSchema,
} from './episode.schema';

export type EpisodeConfig = z.infer<typeof episodeSchema>;
export type EpisodeScene = EpisodeConfig['scenes'][number];
export type ShotMode = z.infer<typeof shotModeSchema>;
export type Shot = z.infer<typeof shotSchema>;
export type NarrationEchoLayerProps = z.infer<typeof narrationEchoLayerPropsSchema>;
export type AcidComponentProps = z.infer<typeof acidComponentPropsSchema>;
export type SummaryComponentProps = z.infer<typeof summaryComponentPropsSchema>;
export type TalkVideoBaseProps = z.infer<typeof talkVideoBasePropsSchema>;
export type RemotionTalkEffectProps = z.infer<typeof remotionTalkEffectPropsSchema>;
export type SemanticTextRevealProps = z.infer<typeof semanticTextRevealPropsSchema>;
export type FocusReticleProps = z.infer<typeof focusReticlePropsSchema>;
export type PixelRevealProps = z.infer<typeof pixelRevealPropsSchema>;
export type AssetManifest = z.infer<typeof assetManifestSchema>;
export type SourceManifest = z.infer<typeof sourceManifestSchema>;
export type EpisodeInputProps = {
  episode: EpisodeConfig;
  assets: AssetManifest;
  sources: SourceManifest;
  debug?: boolean;
  strict?: boolean;
};
