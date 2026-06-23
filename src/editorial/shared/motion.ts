import {Easing, interpolate} from 'remotion';

type ProgressOptions = {
  start?: number;
  end?: number;
  startRatio?: number;
  endRatio?: number;
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export const editorialProgress = (
  frame: number,
  durationInFrames: number,
  options: ProgressOptions = {},
): number => {
  const available = Math.max(1, durationInFrames - 1);
  const start = Math.min(options.start ?? 0, Math.floor(available * (options.startRatio ?? 0.18)));
  const end = Math.min(options.end ?? 24, Math.floor(available * (options.endRatio ?? 0.46)));

  if (end <= start) {
    return frame >= start ? 1 : 0;
  }

  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
};

export const editorialExitProgress = (
  frame: number,
  durationInFrames: number,
  minFrames = 10,
  maxFrames = 18,
  ratio = 0.16,
): number => {
  const available = Math.max(1, durationInFrames - 1);
  const exitDuration = Math.min(maxFrames, Math.max(minFrames, Math.floor(durationInFrames * ratio), 1));
  const start = Math.max(0, available - exitDuration);

  if (available <= start) {
    return frame >= available ? 1 : 0;
  }

  return interpolate(frame, [start, available], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
};

export const staggerProgress = (progress: number, index: number, step = 0.12): number =>
  clamp01(progress - index * step);

export const revealInset = (progress: number, direction: -1 | 1, vertical = false): string => {
  const hidden = `${(1 - clamp01(progress)) * 100}%`;
  if (vertical) {
    return `inset(0 0 ${hidden} 0)`;
  }
  return `inset(0 ${direction === -1 ? hidden : 0} 0 ${direction === 1 ? hidden : 0})`;
};

export const slide = (progress: number, pixels: number, direction: -1 | 1): number =>
  (1 - clamp01(progress)) * pixels * direction;
