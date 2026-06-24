import type {ReactNode} from 'react';

export type ShotMode =
  | 'talk'
  | 'speaker-left'
  | 'speaker-right'
  | 'pip-right'
  | 'content-full'
  | 'push-in';

export type Shot = {
  from: number;
  to: number;
  mode: ShotMode;
  contentId?: string;
  summaryId?: string;
};

export type ShotLayerRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
  scale: number;
  translateX: number;
  translateY: number;
};

export type ShotDirectorRenderProps = {
  contentId?: string;
  summaryId?: string;
  contentLayer?: ReactNode;
  summaryLayer?: ReactNode;
};
