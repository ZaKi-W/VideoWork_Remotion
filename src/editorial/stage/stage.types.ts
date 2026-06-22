export type StageMode =
  | 'presenter-center'
  | 'presenter-small'
  | 'screen-primary'
  | 'no-presenter';

export type StageSlot =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'edge-left'
  | 'edge-right'
  | 'full-bleed'
  | 'screen-primary'
  | 'center-overlay';

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type StageLayout = {
  presenterSafeZone: Rect;
  subtitleSafeZone: Rect;
  edgeMargin: number;
  slots: Record<StageSlot, Rect>;
};
