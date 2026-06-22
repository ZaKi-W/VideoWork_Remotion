import {Easing, interpolate, useCurrentFrame} from 'remotion';
import type {CSSProperties, ReactNode} from 'react';
import type {ComponentRendererProps} from '../registry/component.types';
import type {HeadlineTakeoverProps} from '../schema/episode.types';
import {visualTokens} from '../stage/visual-tokens';

const getHeadlineTakeoverProps = (props: ComponentRendererProps): HeadlineTakeoverProps => {
  if (props.scene.content.kind !== 'HeadlineTakeover') {
    throw new Error(`HeadlineTakeover renderer received ${props.scene.content.kind}`);
  }
  return props.scene.content.props;
};

const introProgress = (frame: number, start: number, end: number, durationInFrames: number): number => {
  const available = Math.max(1, durationInFrames - 1);
  const compressedStart = Math.min(start, Math.floor(available * 0.18));
  const compressedEnd = Math.min(end, Math.floor(available * 0.38));
  if (compressedEnd <= compressedStart) {
    return frame >= compressedStart ? 1 : 0;
  }
  return interpolate(frame, [compressedStart, compressedEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
};

const exitProgress = (frame: number, durationInFrames: number): number => {
  const exitDuration = Math.min(11, Math.max(7, Math.floor(durationInFrames * 0.14)));
  return interpolate(frame, [durationInFrames - exitDuration, durationInFrames - 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
};

const colorFor = (color: 'orange' | 'blue' | undefined): string =>
  color === 'blue' ? visualTokens.color.electricBlue : visualTokens.color.signalOrange;

const textColorFor = (mode: HeadlineTakeoverProps['mode'] | undefined, emphasisMode?: string): string => {
  if (mode === 'takeover' && emphasisMode === 'highlight-block') {
    return visualTokens.color.inkBlack;
  }
  return visualTokens.color.inkBlack;
};

type LayoutSpec = {
  wrapper: CSSProperties;
  title: CSSProperties;
  support?: CSSProperties;
  titleSize: number;
  lineHeight: number;
  align: 'left' | 'right' | 'center';
  direction: -1 | 1;
  supportColor: string;
  inverseTitle?: boolean;
};

const alignmentFor = (props: HeadlineTakeoverProps): 'left' | 'right' | 'center' => {
  if (props.alignment) {
    return props.alignment;
  }
  if (props.placement === 'right-dominant') {
    return 'right';
  }
  if (props.mode === 'takeover') {
    return 'center';
  }
  return 'left';
};

const layoutFor = (props: HeadlineTakeoverProps): LayoutSpec => {
  const mode = props.mode ?? 'punch';
  const placement = props.placement ?? 'left-dominant';
  const align = alignmentFor(props);
  const isRight = placement === 'right-dominant';
  const accent = colorFor(props.emphasis?.color);

  if (mode === 'takeover') {
    return {
      wrapper: {width: 1920, height: 1080, left: 0, top: 0},
      title: {left: 180, top: 190, width: 1560, height: 620},
      support: {left: 118, top: 150, width: 1686, height: 600},
      titleSize: props.lines.length === 1 ? 210 : 146,
      lineHeight: 1.08,
      align,
      direction: 1,
      supportColor: props.emphasis?.color === 'blue' ? visualTokens.color.inkBlack : accent,
      inverseTitle: props.emphasis?.color === 'blue',
    };
  }

  if (mode === 'wrap') {
    return {
      wrapper: {
        width: 760,
        height: 720,
        left: placement === 'right-dominant' ? -320 : -20,
        top: -40,
      },
      title: isRight
        ? {right: 0, top: 26, width: 500, height: 520}
        : {left: 0, top: 12, width: 500, height: 520},
      titleSize: 72,
      lineHeight: 1.08,
      align,
      direction: isRight ? 1 : -1,
      supportColor: accent,
    };
  }

  return {
    wrapper: {
      width: isRight ? 760 : 610,
      height: 560,
      left: isRight ? -340 : -8,
      top: -8,
    },
    title: isRight
      ? {right: 0, top: 70, width: 660, height: 360}
      : {left: 0, top: 70, width: 520, height: 360},
    titleSize: props.lines.length === 1 ? 100 : 76,
    lineHeight: 1.08,
    align,
    direction: isRight ? 1 : -1,
    supportColor: accent,
  };
};

const renderEmphasis = (
  text: string,
  props: HeadlineTakeoverProps,
  keyPrefix: string,
): ReactNode => {
  const emphasis = props.emphasis;
  if (!emphasis || !text.includes(emphasis.text)) {
    return <span key={keyPrefix}>{text}</span>;
  }

  const firstIndex = text.indexOf(emphasis.text);
  const before = text.slice(0, firstIndex);
  const after = text.slice(firstIndex + emphasis.text.length);
  const accent = colorFor(emphasis.color);
  const mode = emphasis.mode ?? 'highlight-block';
  const style: CSSProperties = {
    display: 'inline-block',
    position: 'relative',
    fontWeight: 900,
    color: textColorFor(props.mode, mode),
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
  };

  if (mode === 'highlight-block') {
    style.background = accent;
    style.padding = '0 0.13em 0.03em';
    style.margin = '0 -0.02em';
    style.borderRadius = 2;
  }
  if (mode === 'reverse') {
    style.background = emphasis.color === 'blue' ? visualTokens.color.electricBlue : visualTokens.color.inkBlack;
    style.color = visualTokens.color.paperWhite;
    style.padding = '0 0.15em 0.04em';
    style.margin = '0 -0.015em';
    style.borderRadius = 2;
  }
  if (mode === 'underline') {
    style.background = `linear-gradient(to top, ${accent} 0 24%, transparent 24% 100%)`;
    style.padding = '0 0.04em 0.04em';
  }

  return (
    <span key={keyPrefix}>
      {before}
      <span style={style}>{emphasis.text}</span>
      {after}
    </span>
  );
};

export const HeadlineTakeover = (rendererProps: ComponentRendererProps) => {
  const frame = useCurrentFrame();
  const props = getHeadlineTakeoverProps(rendererProps);
  const layout = layoutFor(props);
  const blockIntro = introProgress(frame, 0, 3, rendererProps.durationInFrames);
  const titleIntro = introProgress(frame, 2, 8, rendererProps.durationInFrames);
  const emphasisIntro = introProgress(frame, 5, 11, rendererProps.durationInFrames);
  const exit = exitProgress(frame, rendererProps.durationInFrames);
  const entryShift = (1 - titleIntro) * layout.direction * -54;
  const exitShift = exit * layout.direction * 96;
  const clip = (1 - titleIntro) * 100;
  const titleColor = layout.inverseTitle ? visualTokens.color.paperWhite : visualTokens.color.inkBlack;

  const wrapperStyle: CSSProperties = {
    position: 'relative',
    ...layout.wrapper,
    boxSizing: 'border-box',
    fontFamily: visualTokens.fontFamily.display,
    color: titleColor,
    opacity: 1 - exit * 0.78,
    transform: `translateX(${exitShift}px)`,
  };

  return (
    <div style={wrapperStyle}>
      {layout.support ? (
        <div
          style={{
            position: 'absolute',
            ...layout.support,
            background: layout.supportColor,
            opacity: 1,
            transform: `translateX(${(1 - blockIntro) * layout.direction * -140}px) scaleX(${
              0.05 + blockIntro * 0.95
            })`,
            transformOrigin: layout.direction === 1 ? 'right center' : 'left center',
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          ...layout.title,
          overflow: 'hidden',
          clipPath: `inset(0 ${layout.direction === -1 ? `${clip}%` : 0} 0 ${
            layout.direction === 1 ? `${clip}%` : 0
          })`,
          transform: `translateX(${entryShift}px)`,
        }}
      >
        <div
          style={{
            fontSize: layout.titleSize,
            lineHeight: layout.lineHeight,
            fontWeight: 900,
            letterSpacing: '-0.045em',
            color: titleColor,
            fontFamily: visualTokens.fontFamily.display,
            fontSynthesis: 'weight',
            textShadow: `0.018em 0 0 ${titleColor}`,
            transform: 'scaleX(0.98)',
            transformOrigin: `${layout.align} top`,
            textAlign: layout.align,
          }}
        >
          {props.lines.map((line, index) => (
            <div
              key={`${line}-${index}`}
              style={{
                display: 'block',
                whiteSpace: 'nowrap',
                marginTop: 0,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  opacity: props.emphasis && line.includes(props.emphasis.text) ? emphasisIntro : 1,
                  transform: `translateY(${(1 - titleIntro) * 12}px)`,
                }}
              >
                {renderEmphasis(line, props, `${line}-${index}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
