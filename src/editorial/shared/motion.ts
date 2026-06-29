import {Easing, interpolate} from 'remotion';

type ProgressOptions = {
  start?: number;
  end?: number;
  startRatio?: number;
  endRatio?: number;
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export type GridDirection =
  | 'left-to-right'
  | 'right-to-left'
  | 'top-to-bottom'
  | 'center-out';

export const frameRangeProgress = (frame: number, start: number, end: number): number => {
  if (end <= start) return frame >= start ? 1 : 0;
  return Math.max(0, Math.min(1, (frame - start) / (end - start)));
};

export const orderedGridCells = (
  columns: number,
  rows: number,
  direction: GridDirection,
  seed: string,
): Array<{column: number; row: number}> => {
  const safeColumns = Math.max(1, Math.floor(columns));
  const safeRows = Math.max(1, Math.floor(rows));
  const seedValue = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const cells = Array.from({length: safeColumns * safeRows}, (_, index) => ({
    column: index % safeColumns,
    row: Math.floor(index / safeColumns),
  }));
  const centerX = (safeColumns - 1) / 2;
  const centerY = (safeRows - 1) / 2;

  return cells.sort((a, b) => {
    const score = (cell: {column: number; row: number}) => {
      if (direction === 'right-to-left') return -cell.column * 1000 + cell.row;
      if (direction === 'top-to-bottom') return cell.row * 1000 + cell.column;
      if (direction === 'center-out') {
        return Math.hypot(cell.column - centerX, cell.row - centerY) * 1000;
      }
      return cell.column * 1000 + cell.row;
    };
    const delta = score(a) - score(b);
    if (delta !== 0) return delta;
    return (
      ((a.column * 31 + a.row * 17 + seedValue) % 97) -
      ((b.column * 31 + b.row * 17 + seedValue) % 97)
    );
  });
};

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
