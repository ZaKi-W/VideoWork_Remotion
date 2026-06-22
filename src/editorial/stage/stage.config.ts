import type {Rect, StageLayout, StageMode, StageSlot} from './stage.types';

const rect = (x: number, y: number, width: number, height: number): Rect => ({
  x,
  y,
  width,
  height,
});

export const getStageLayout = (width: number, height: number): StageLayout => {
  const margin = Math.round(width * 0.055);
  const subtitleHeight = Math.round(height * 0.18);

  return {
    edgeMargin: margin,
    presenterSafeZone: rect(
      Math.round(width * 0.32),
      Math.round(height * 0.12),
      Math.round(width * 0.36),
      Math.round(height * 0.68),
    ),
    subtitleSafeZone: rect(0, height - subtitleHeight, width, subtitleHeight),
    slots: {
      'top-left': rect(margin, margin, Math.round(width * 0.22), Math.round(height * 0.26)),
      'top-right': rect(
        Math.round(width * 0.72),
        margin,
        Math.round(width * 0.23),
        Math.round(height * 0.26),
      ),
      'bottom-left': rect(
        margin,
        Math.round(height * 0.56),
        Math.round(width * 0.31),
        Math.round(height * 0.22),
      ),
      'bottom-right': rect(
        Math.round(width * 0.64),
        Math.round(height * 0.56),
        Math.round(width * 0.31),
        Math.round(height * 0.22),
      ),
      'edge-left': rect(margin, Math.round(height * 0.22), Math.round(width * 0.24), Math.round(height * 0.52)),
      'edge-right': rect(
        Math.round(width * 0.71),
        Math.round(height * 0.22),
        Math.round(width * 0.24),
        Math.round(height * 0.52),
      ),
      'full-bleed': rect(0, 0, width, height),
      'screen-primary': rect(margin, margin, width - margin * 2, Math.round(height * 0.66)),
      'center-overlay': rect(
        Math.round(width * 0.25),
        Math.round(height * 0.18),
        Math.round(width * 0.5),
        Math.round(height * 0.42),
      ),
    },
  };
};

export const allowedSlotsByStageMode: Record<StageMode, StageSlot[]> = {
  'presenter-center': ['top-left', 'top-right', 'edge-left', 'edge-right'],
  'presenter-small': ['screen-primary', 'top-left', 'top-right', 'edge-left', 'edge-right'],
  'screen-primary': ['screen-primary', 'top-left', 'top-right', 'edge-left', 'edge-right'],
  'no-presenter': ['full-bleed', 'screen-primary', 'center-overlay', 'top-left', 'top-right', 'edge-left', 'edge-right'],
};

export const rectsIntersect = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;
