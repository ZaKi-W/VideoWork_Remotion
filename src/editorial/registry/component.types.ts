import type {ReactNode} from 'react';
import type {z} from 'zod';
import type {StageMode, StageSlot} from '../stage/stage.types';
import type {AssetManifest, EpisodeScene, SourceManifest} from '../schema/episode.types';

export type ComponentImplementationStatus = 'planned' | 'prototype' | 'ready';
export type ComponentCategory = 'regular' | 'system';

export type ComponentRendererProps = {
  scene: EpisodeScene;
  assets: AssetManifest;
  sources: SourceManifest;
  assetStatus: string;
  durationInFrames: number;
  width: number;
  height: number;
};

export type ComponentRegistryItem = {
  name: EpisodeScene['kind'];
  category?: ComponentCategory;
  tags?: string[];
  purpose: string;
  allowedStageModes: StageMode[];
  allowedSlots: StageSlot[];
  allowedAssetTypes?: AssetManifest['assets'][number]['type'][];
  requiresSource: boolean;
  requiresAsset?: boolean;
  implementationStatus: ComponentImplementationStatus;
  schema: z.ZodType;
  render: (props: ComponentRendererProps) => ReactNode;
};
