export const secondsToFrames = (seconds: number, fps: number): number => Math.round(seconds * fps);

export const sceneDurationInFrames = (start: number, end: number, fps: number): number =>
  Math.max(1, secondsToFrames(end - start, fps));
