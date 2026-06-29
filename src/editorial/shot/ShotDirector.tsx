import type {ReactNode} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {visualTokens} from '../stage/visual-tokens';
import type {Shot, ShotLayerRect, ShotMode} from './shot.types';

type ShotDirectorProps = {
  shot: Shot;
  previousShot?: Shot;
  talkVideoLayer: ReactNode;
  contentLayer?: ReactNode;
  previousContentLayer?: ReactNode;
  summaryLayer?: ReactNode;
  previousSummaryLayer?: ReactNode;
  sidecarLayer?: ReactNode;
  previousSidecarLayer?: ReactNode;
  contentTakeoverFullBleed?: boolean;
  previousContentTakeoverFullBleed?: boolean;
};

const shotModeNeedsContent = (mode: ShotMode): boolean =>
  mode === 'speaker-left' || mode === 'speaker-right' || mode === 'pip-right' || mode === 'content-full';

const shotModeAllowsSummary = (mode: ShotMode): boolean => mode === 'talk' || mode === 'push-in';

const talkRects: Record<ShotMode, ShotLayerRect> = {
  talk: {left: 0, top: 0, width: 100, height: 100, opacity: 1, scale: 1, translateX: 0, translateY: 0},
  'speaker-left': {left: 3.4, top: 9, width: 27, height: 78, opacity: 1, scale: 1, translateX: 0, translateY: 0},
  'speaker-right': {left: 69.6, top: 9, width: 27, height: 78, opacity: 1, scale: 1, translateX: 0, translateY: 0},
  'pip-right': {left: 73, top: 6, width: 22, height: 27, opacity: 1, scale: 1, translateX: 0, translateY: 0},
  'content-full': {left: 73, top: 6, width: 22, height: 27, opacity: 0, scale: 1, translateX: 0, translateY: 0},
  'push-in': {left: 0, top: 0, width: 100, height: 100, opacity: 1, scale: 1.1, translateX: -3.2, translateY: 0},
};

const contentRects: Record<Exclude<ShotMode, 'talk' | 'push-in'>, ShotLayerRect> = {
  'speaker-left': {left: 34, top: 9, width: 62.6, height: 78, opacity: 1, scale: 1, translateX: 0, translateY: 0},
  'speaker-right': {left: 3.4, top: 9, width: 62.6, height: 78, opacity: 1, scale: 1, translateX: 0, translateY: 0},
  'pip-right': {left: 3.5, top: 5, width: 93, height: 81, opacity: 1, scale: 1, translateX: 0, translateY: 0},
  'content-full': {left: 2.5, top: 4, width: 95, height: 84, opacity: 1, scale: 1, translateX: 0, translateY: 0},
};

const hiddenContentRect: ShotLayerRect = {
  left: 7,
  top: 8,
  width: 86,
  height: 80,
  opacity: 0,
  scale: 0.985,
  translateX: 0,
  translateY: 0,
};

const fullBleedContentRect: ShotLayerRect = {
  left: 0,
  top: 0,
  width: 100,
  height: 100,
  opacity: 1,
  scale: 1,
  translateX: 0,
  translateY: 0,
};

const percent = (value: number): string => `${value}%`;

const easeProgress = (frame: number, start: number, end: number): number => {
  if (end <= start) {
    return frame >= end ? 1 : 0;
  }

  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.2, 0.86, 0.2, 1),
  });
};

export const sidecarProgressFor = (
  localFrame: number,
  hasSidecar: boolean,
): number => {
  if (!hasSidecar) {
    return 0;
  }
  return easeProgress(localFrame, 5, 17);
};

export const contentExitProgressFor = (localFrame: number): number =>
  easeProgress(localFrame, 0, 8);

const blendRect = (from: ShotLayerRect, to: ShotLayerRect, progress: number): ShotLayerRect => ({
  left: interpolate(progress, [0, 1], [from.left, to.left]),
  top: interpolate(progress, [0, 1], [from.top, to.top]),
  width: interpolate(progress, [0, 1], [from.width, to.width]),
  height: interpolate(progress, [0, 1], [from.height, to.height]),
  opacity: interpolate(progress, [0, 1], [from.opacity, to.opacity]),
  scale: interpolate(progress, [0, 1], [from.scale, to.scale]),
  translateX: interpolate(progress, [0, 1], [from.translateX, to.translateX]),
  translateY: interpolate(progress, [0, 1], [from.translateY, to.translateY]),
});

const layerStyle = (rect: ShotLayerRect, zIndex: number, withBorder = false) => ({
  position: 'absolute' as const,
  zIndex,
  left: percent(rect.left),
  top: percent(rect.top),
  width: percent(rect.width),
  height: percent(rect.height),
  opacity: rect.opacity,
  overflow: 'hidden',
  pointerEvents: 'none' as const,
  transform: `translate(${rect.translateX}%, ${rect.translateY}%) scale(${rect.scale})`,
  transformOrigin: '50% 50%',
  border: withBorder ? `2px solid ${visualTokens.color.acid}` : '0 solid transparent',
  boxShadow: withBorder ? '0 18px 38px rgba(0,0,0,0.28)' : undefined,
});

const contentTargetRect = (mode: ShotMode, hasContent: boolean): ShotLayerRect => {
  if (hasContent && (mode === 'talk' || mode === 'push-in')) {
    return {left: 0, top: 0, width: 100, height: 100, opacity: 1, scale: 1, translateX: 0, translateY: 0};
  }
  switch (mode) {
    case 'speaker-left':
    case 'speaker-right':
    case 'pip-right':
    case 'content-full':
      return contentRects[mode];
    case 'talk':
    case 'push-in':
      return hiddenContentRect;
  }
};

const _unused_summaryProgressFor = (localFrame: number, shot: Shot, previousShot?: Shot): number => {
  if (shotModeAllowsSummary(shot.mode) && shot.summaryId) {
    return easeProgress(localFrame, shot.mode === 'push-in' ? 2 : 6, shot.mode === 'push-in' ? 12 : 18);
  }

  if (previousShot?.summaryId) {
    return 1 - easeProgress(localFrame, 0, 8);
  }

  return 0;
};

const summaryProgressFor = (localFrame: number, shot: Shot, previousShot?: Shot): number => {
  if (shotModeAllowsSummary(shot.mode) && shot.summaryId) {
    if (previousShot?.contentId) {
      return easeProgress(localFrame, 12, 24);
    }
    return easeProgress(localFrame, shot.mode === 'push-in' ? 2 : 6, shot.mode === 'push-in' ? 12 : 18);
  }

  if (previousShot?.summaryId) {
    return 1 - easeProgress(localFrame, 0, 8);
  }

  return 0;
};

export const ShotDirector = ({
  shot,
  previousShot,
  talkVideoLayer,
  contentLayer,
  previousContentLayer,
  summaryLayer,
  previousSummaryLayer,
  sidecarLayer,
  previousSidecarLayer,
  contentTakeoverFullBleed = false,
  previousContentTakeoverFullBleed = false,
}: ShotDirectorProps) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - shot.from);
  const previousMode = previousShot?.mode ?? shot.mode;
  const talkStart = shot.mode === 'talk' && previousShot && shotModeNeedsContent(previousShot.mode) ? 5 : 0;
  const talkEnd = talkStart + (shot.mode === 'push-in' ? 12 : 15);
  const talkProgress = easeProgress(localFrame, talkStart, talkEnd);
  const talkRect = blendRect(talkRects[previousMode], talkRects[shot.mode], talkProgress);
  
  const hasContent = Boolean(shot.contentId);
  const contentEntering = shotModeNeedsContent(shot.mode) || hasContent;
  const contentProgress = contentEntering
    ? easeProgress(localFrame, 5, 21)
    : contentExitProgressFor(localFrame);
  const previousContentRect = previousShot
    ? previousContentTakeoverFullBleed && previousShot.mode === 'content-full'
      ? fullBleedContentRect
      : contentTargetRect(previousShot.mode, Boolean(previousShot.contentId))
    : hiddenContentRect;
  const currentContentRect =
    contentTakeoverFullBleed && shot.mode === 'content-full'
      ? fullBleedContentRect
      : contentTargetRect(shot.mode, hasContent);
  const contentRect = blendRect(contentEntering ? hiddenContentRect : previousContentRect, currentContentRect, contentProgress);
  const visibleContentLayer = contentEntering ? contentLayer : previousContentLayer;
  const visibleSummaryLayer = shotModeAllowsSummary(shot.mode) && shot.summaryId ? summaryLayer : previousSummaryLayer;
  const summaryProgress = summaryProgressFor(localFrame, shot, previousShot);
  const hasSidecar = Boolean(shot.sidecarId);
  const visibleSidecarLayer = hasSidecar ? sidecarLayer : previousSidecarLayer;
  const sidecarProgress = hasSidecar
    ? sidecarProgressFor(localFrame, true)
    : previousShot?.sidecarId
      ? 1 - easeProgress(localFrame, 0, 8)
      : 0;
  const sidecarMode = hasSidecar ? shot.mode : previousShot?.mode;
  const showTalkBorder = shot.mode !== 'talk' && shot.mode !== 'push-in';

  // 当是 pip-right 模式时，content 在 talkVideo（人物PIP）底层（zIndex 8）；
  // 否则，如果是 talk 且有 contentId 时，content 在 talkVideo 顶层（zIndex 28）。
  const contentZIndex = shot.mode === 'pip-right' ? 8 : 28;

  return (
    <AbsoluteFill
      style={{
        background: visualTokens.color.paperWhite,
        color: visualTokens.color.inkBlack,
        fontFamily: visualTokens.fontFamily.body,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: visualTokens.color.paperWhite,
        }}
      />
      {visibleContentLayer ? (
        <div style={layerStyle(contentRect, contentZIndex)}>
          {visibleContentLayer}
        </div>
      ) : null}
      <div style={layerStyle(talkRect, 18, showTalkBorder)}>{talkVideoLayer}</div>
      {visibleSummaryLayer ? (
        <div
          style={{
            position: 'absolute',
            zIndex: 28,
            inset: 0,
            opacity: summaryProgress,
            transform: `translateX(${interpolate(summaryProgress, [0, 1], [-14, 0])}px)`,
            pointerEvents: 'none',
          }}
        >
          {visibleSummaryLayer}
        </div>
      ) : null}
      {visibleSidecarLayer ? (
        <div
          style={{
            position: 'absolute',
            zIndex: 28,
            inset: 0,
            opacity: sidecarProgress,
            transform: `translateX(${interpolate(
              sidecarProgress,
              [0, 1],
              [sidecarMode === 'speaker-left' ? 18 : -18, 0],
            )}px)`,
            pointerEvents: 'none',
          }}
        >
          {visibleSidecarLayer}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
