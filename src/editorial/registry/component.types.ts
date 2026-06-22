import type {ReactNode} from 'react';
import type {z} from 'zod';
import type {StageMode, StageSlot} from '../stage/stage.types';
import type {EpisodeScene} from '../schema/episode.types';

export type ComponentImplementationStatus = 'planned' | 'prototype' | 'ready';

export type ComponentRendererProps = {
  scene: EpisodeScene;
  assetStatus: string;
  durationInFrames: number;
};

export type ComponentRegistryItem = {
  name: EpisodeScene['kind'];
  purpose: string;
  allowedStageModes: StageMode[];
  allowedSlots: StageSlot[];
  requiresSource: boolean;
  implementationStatus: ComponentImplementationStatus;
  schema: z.ZodType;
  render: (props: ComponentRendererProps) => ReactNode;
};
