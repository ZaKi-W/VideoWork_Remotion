import type {ReactElement} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import type {ComponentRendererProps} from '../registry/component.types';
import type {FocusReticleProps} from '../schema/episode.types';
import {getStageLayout} from '../stage/stage.config';

export type FocusReticleTarget = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FocusReticleViewProps = {
  targets: FocusReticleTarget[];
  activeIndex: number;
  previousIndex?: number;
  transitionStartFrame?: number;
  transitionDurationInFrames?: number;
  accentColor?: string;
  cornerLength?: number;
  lineWidth?: number;
  padding?: number;
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export const interpolateReticleRect = (
  from: FocusReticleTarget,
  to: FocusReticleTarget,
  progress: number,
): FocusReticleTarget => {
  const safeProgress = clamp01(progress);
  const mix = (start: number, end: number) =>
    start + (end - start) * safeProgress;

  return {
    id: safeProgress === 0 ? from.id : to.id,
    x: mix(from.x, to.x),
    y: mix(from.y, to.y),
    width: mix(from.width, to.width),
    height: mix(from.height, to.height),
  };
};

const line = (
  style: React.CSSProperties,
  color: string,
  lineWidth: number,
): ReactElement => (
  <i
    style={{
      position: 'absolute',
      display: 'block',
      backgroundColor: color,
      ...style,
      width: style.width ?? lineWidth,
      height: style.height ?? lineWidth,
    }}
  />
);

export const FocusReticleView = ({
  targets,
  activeIndex,
  previousIndex = activeIndex,
  transitionStartFrame = 0,
  transitionDurationInFrames = 12,
  accentColor = '#c7ff3d',
  cornerLength = 18,
  lineWidth = 1,
  padding = 8,
}: FocusReticleViewProps): ReactElement | null => {
  const frame = useCurrentFrame();
  const activeTarget = targets[activeIndex];

  if (
    !activeTarget ||
    activeTarget.width <= 0 ||
    activeTarget.height <= 0
  ) {
    return null;
  }

  const previousTarget = targets[previousIndex] ?? activeTarget;
  const safePreviousTarget =
    previousTarget.width > 0 && previousTarget.height > 0
      ? previousTarget
      : activeTarget;
  const transitionEnd =
    transitionStartFrame + Math.max(1, transitionDurationInFrames);
  const progress = interpolate(
    frame,
    [transitionStartFrame, transitionEnd],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );
  const rect = interpolateReticleRect(
    safePreviousTarget,
    activeTarget,
    progress,
  );
  const width = rect.width + padding * 2;
  const height = rect.height + padding * 2;
  const safeCornerLength = Math.min(
    Math.max(1, cornerLength),
    width / 2,
    height / 2,
  );
  const breathe = 0.38 + ((Math.sin(frame * 0.18) + 1) / 2) * 0.42;

  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x - padding,
        top: rect.y - padding,
        width,
        height,
        color: accentColor,
        pointerEvents: 'none',
      }}
    >
      {line({left: 0, top: 0, width: safeCornerLength}, accentColor, lineWidth)}
      {line({left: 0, top: 0, height: safeCornerLength}, accentColor, lineWidth)}
      {line({right: 0, top: 0, width: safeCornerLength}, accentColor, lineWidth)}
      {line({right: 0, top: 0, height: safeCornerLength}, accentColor, lineWidth)}
      {line({left: 0, bottom: 0, width: safeCornerLength}, accentColor, lineWidth)}
      {line({left: 0, bottom: 0, height: safeCornerLength}, accentColor, lineWidth)}
      {line({right: 0, bottom: 0, width: safeCornerLength}, accentColor, lineWidth)}
      {line({right: 0, bottom: 0, height: safeCornerLength}, accentColor, lineWidth)}
      {line(
        {
          left: '50%',
          top: '50%',
          width: 12,
          transform: 'translate(-50%, -50%)',
        },
        accentColor,
        lineWidth,
      )}
      {line(
        {
          left: '50%',
          top: '50%',
          height: 12,
          transform: 'translate(-50%, -50%)',
        },
        accentColor,
        lineWidth,
      )}
      <i
        style={{
          position: 'absolute',
          right: 5,
          top: 5,
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: accentColor,
          opacity: breathe,
          boxShadow: `0 0 10px ${accentColor}`,
        }}
      />
    </div>
  );
};

const getProps = (rendererProps: ComponentRendererProps): FocusReticleProps => {
  if (rendererProps.scene.content.kind !== 'FocusReticle') {
    throw new Error(`FocusReticle renderer received ${rendererProps.scene.content.kind}`);
  }
  return rendererProps.scene.content.props;
};

export const FocusReticle = (
  rendererProps: ComponentRendererProps,
): ReactElement | null => {
  const props = getProps(rendererProps);
  const slot = getStageLayout(
    rendererProps.width,
    rendererProps.height,
  ).slots[rendererProps.scene.slot];

  return (
    <div
      style={{
        position: 'relative',
        width: slot.width,
        height: slot.height,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <FocusReticleView {...props} />
    </div>
  );
};
