import type {CSSProperties, ReactNode} from 'react';
import {Easing, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import type {ComponentRendererProps} from '../registry/component.types';
import type {NarrationEchoLayerProps} from '../schema/episode.types';
import {getStageLayout} from '../stage/stage.config';
import {visualTokens} from '../stage/visual-tokens';
import {acidTokens, leftInfoTextShadow} from './acid-system';

type EchoItem = NarrationEchoLayerProps['items'][number];
type EchoSegment = EchoItem['segments'][number];

const echoText = acidTokens.color.text;
const echoMuted = 'rgba(255,255,255,0.92)';
const echoWeak = 'rgba(255,255,255,0.94)';

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const easeOut = (value: number): number => Easing.bezier(0.2, 0.86, 0.2, 1)(clamp01(value));

const rangeProgress = (frame: number, start: number, end: number): number => {
  if (end <= start) {
    return frame >= start ? 1 : 0;
  }
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.2, 0.86, 0.2, 1),
  });
};

const getProps = (rendererProps: ComponentRendererProps): NarrationEchoLayerProps => {
  if (rendererProps.scene.content.kind !== 'NarrationEchoLayer') {
    throw new Error(`NarrationEchoLayer renderer received ${rendererProps.scene.content.kind}`);
  }
  return rendererProps.scene.content.props;
};

const itemTiming = (frame: number, itemCount: number, durationInFrames: number) => {
  const itemSpan = durationInFrames / itemCount;
  const activeIndex = Math.min(itemCount - 1, Math.max(0, Math.floor(frame / itemSpan)));
  const localFrame = frame - activeIndex * itemSpan;
  return {activeIndex, itemSpan, localFrame};
};

const typedTextFor = (
  segment: EchoSegment,
  localFrame: number,
  cursorFrame: number,
  charFrames: number,
): {node: ReactNode; nextCursor: number; typing: boolean} => {
  if (segment.break) {
    return {
      node: localFrame >= cursorFrame ? <br /> : null,
      nextCursor: cursorFrame + (segment.pauseFrames ?? 6),
      typing: false,
    };
  }

  const text = segment.text ?? '';
  const chars = Array.from(text);
  const visibleCount = Math.max(0, Math.min(chars.length, Math.floor((localFrame - cursorFrame) / charFrames)));
  const nextCursor = cursorFrame + chars.length * charFrames + (segment.pauseFrames ?? 6);

  return {
    node:
      visibleCount > 0 ? (
        <span style={{whiteSpace: 'pre-wrap', color: segment.accent ? acidTokens.color.acid : undefined}}>
          {chars.slice(0, visibleCount).join('')}
        </span>
      ) : null,
    nextCursor,
    typing: visibleCount > 0 && visibleCount < chars.length,
  };
};

const TypedLine = ({
  item,
  localFrame,
  charFrames,
  segmentPauseFrames,
  intro,
}: {
  item: EchoItem;
  localFrame: number;
  charFrames: number;
  segmentPauseFrames: number;
  intro: number;
}) => {
  const lineStart = 17;
  let cursorFrame = lineStart;
  let isTyping = false;

  const nodes = item.segments.map((segment, index) => {
    const {node, nextCursor, typing} = typedTextFor(
      {...segment, pauseFrames: segment.pauseFrames ?? segmentPauseFrames},
      localFrame,
      cursorFrame,
      charFrames,
    );
    cursorFrame = nextCursor;
    isTyping ||= typing;
    return node ? <span key={`${item.label}-${index}`}>{node}</span> : null;
  });

  const typed = localFrame >= cursorFrame;

  return (
    <div
      style={{
        maxWidth: '96%',
        minHeight: '2.38em',
        marginTop: 13,
        color: echoText,
        fontFamily: visualTokens.fontFamily.display,
        fontSize: 80,
        lineHeight: 1.13,
        fontWeight: 900,
        letterSpacing: 0,
        opacity: intro,
        transform: `translateY(${(1 - intro) * 14}px)`,
      }}
    >
      {nodes}
      <span
        style={{
          display: 'inline-block',
          width: '0.085em',
          height: '0.86em',
          marginLeft: '0.1em',
          verticalAlign: '-0.07em',
          background: acidTokens.color.acid,
          boxShadow: '0 0 10px rgba(217,255,76,0.42)',
          opacity: isTyping ? (Math.floor(localFrame / 9) % 2 === 0 ? 1 : 0) : typed ? 0 : intro,
        }}
      />
    </div>
  );
};

const BeatBlock = ({
  item,
  localFrame,
  introFrame,
  exiting,
  props,
}: {
  item: EchoItem;
  localFrame: number;
  introFrame: number;
  exiting: number;
  props: NarrationEchoLayerProps;
}) => {
  const labelIn = rangeProgress(introFrame, 5, 17);
  const lineIn = rangeProgress(introFrame, 13, 25);
  const copyIn = rangeProgress(introFrame, 29, 41);
  const trackIn = rangeProgress(introFrame, 39, 51);
  const focusIn = rangeProgress(introFrame, 47, 59);
  const copy = item.copy ?? item.note;
  const track = item.track?.slice(0, 3) ?? [];
  const activeTrackIndex = Math.min(track.length - 1, Math.max(0, item.activeTrackIndex ?? 0));
  const focus = item.focus ?? item.label;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 1 - exiting * 0.86,
        transform: `translateY(${-12 * exiting}px)`,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          color: echoMuted,
          fontFamily: visualTokens.fontFamily.body,
          fontSize: 13,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          opacity: labelIn,
          transform: `translateY(${(1 - labelIn) * 12}px)`,
        }}
      >
        <span
          style={{
            display: 'block',
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: visualTokens.color.acid,
            boxShadow: '0 0 9px rgba(217,255,76,0.62)',
          }}
        />
        <span>{item.label}</span>
        {item.beat ? <b style={{color: acidTokens.color.acid, fontWeight: 900}}>{item.beat}</b> : null}
      </div>
      <TypedLine
        item={item}
        localFrame={localFrame}
        charFrames={props.charFrames ?? 2}
        segmentPauseFrames={props.segmentPauseFrames ?? 6}
        intro={lineIn}
      />
      {copy ? (
        <div
          style={{
            maxWidth: '96%',
            marginTop: 22,
            color: echoMuted,
            fontFamily: visualTokens.fontFamily.body,
            fontSize: 24,
            lineHeight: 1.38,
            fontWeight: 900,
            letterSpacing: 0,
            opacity: copyIn,
            transform: `translateY(${(1 - copyIn) * 9}px)`,
          }}
        >
          {copy}
        </div>
      ) : null}
      {track.length > 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px 10px',
            maxWidth: '98%',
            marginTop: 26,
            opacity: trackIn,
            transform: `translateY(${(1 - trackIn) * 9}px)`,
          }}
        >
          {track.map((text, index) => {
            const isActive = index === activeTrackIndex;

            return (
              <span
                key={`${item.label}-track-${text}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  color: isActive ? echoText : echoWeak,
                  fontFamily: visualTokens.fontFamily.body,
                  fontSize: 19,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  letterSpacing: '0.02em',
                  transform: `translateY(${isActive ? -1 : 0}px)`,
                }}
              >
                <b
                  style={{
                    color: isActive ? acidTokens.color.acid : '#fff',
                    fontFamily: visualTokens.fontFamily.display,
                    fontSize: 15,
                    lineHeight: 1,
                    fontWeight: 900,
                    letterSpacing: 0,
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </b>
                <span>{text}</span>
                {index < track.length - 1 ? <i style={{color: '#fff', fontStyle: 'normal'}}>→</i> : null}
              </span>
            );
          })}
        </div>
      ) : null}
      {focus ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: '3%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: echoWeak,
            fontFamily: visualTokens.fontFamily.body,
            fontSize: 15,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: focusIn,
            transform: `translateY(${(1 - focusIn) * 7}px)`,
          }}
        >
          <span>当前焦点 ·</span>
          <b style={{color: acidTokens.color.acid, fontWeight: 900, letterSpacing: 0}}>{focus}</b>
        </div>
      ) : null}
    </div>
  );
};

const containerStyle = (exit: number, placement: NarrationEchoLayerProps['placement'], fullCanvas = false): CSSProperties => ({
  position: 'relative',
  left: fullCanvas ? '4.6%' : placement === 'top-left' ? 0 : -18,
  top: fullCanvas ? '21%' : placement === 'top-left' ? 8 : 2,
  width: 690,
  height: 560,
  pointerEvents: 'none',
  fontFamily: visualTokens.fontFamily.body,
  color: echoText,
  opacity: 1 - exit,
  transform: `translateX(${-28 * exit}px)`,
  textShadow: `${leftInfoTextShadow}, 0 0 18px rgba(255,255,255,0.16)`,
});

const canvasScrimStyle = (frame: number, exit: number): CSSProperties => {
  const intro = rangeProgress(frame, 0, 26);

  return {
    position: 'absolute',
    zIndex: 1,
    left: 0,
    top: '7.5%',
    width: '46%',
    height: '78%',
    background:
      'radial-gradient(ellipse at 18% 48%, rgba(7,9,6,0.30) 0%, rgba(7,9,6,0.17) 42%, rgba(7,9,6,0) 76%), linear-gradient(90deg, rgba(7,9,6,0.20) 0%, rgba(7,9,6,0.10) 42%, rgba(7,9,6,0) 76%)',
    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 82%, transparent 100%)',
    maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 82%, transparent 100%)',
    opacity: 1 - exit,
    transform: `translateX(${(1 - intro) * -24}px) scaleX(${0.94 + intro * 0.06})`,
    transformOrigin: 'left center',
  };
};

const slotCanvasStyle = (rendererProps: ComponentRendererProps): CSSProperties => {
  const slotRect = getStageLayout(rendererProps.width, rendererProps.height).slots[rendererProps.scene.slot];

  return {
    position: 'absolute',
    left: -slotRect.x,
    top: -slotRect.y,
    width: rendererProps.width,
    height: rendererProps.height,
    pointerEvents: 'none',
  };
};

const slotContentStyle = (rendererProps: ComponentRendererProps): CSSProperties => {
  const slotRect = getStageLayout(rendererProps.width, rendererProps.height).slots[rendererProps.scene.slot];

  return {
    position: 'absolute',
    zIndex: 2,
    left: slotRect.x,
    top: slotRect.y,
    width: slotRect.width,
    height: slotRect.height,
  };
};

const fullCanvasContentStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 2,
};

const VideoBackplate = ({
  src,
  startFromFrame = 0,
  withAudio = false,
}: {
  src: string;
  startFromFrame?: number;
  withAudio?: boolean;
}) => (
  <>
    <OffthreadVideo
      src={staticFile(src)}
      startFrom={startFromFrame}
      muted={!withAudio}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        background:
          'radial-gradient(ellipse at 50% 102%, rgba(16,18,24,0.18), transparent 46%), linear-gradient(90deg, rgba(0,0,0,0.12), transparent 18%, transparent 78%, rgba(0,0,0,0.11))',
      }}
    />
  </>
);

const SubtitleBackplate = () => (
  <div
    style={{
      position: 'absolute',
      zIndex: 34,
      left: '50%',
      bottom: acidTokens.layout.subtitle.bottom,
      minWidth: acidTokens.layout.subtitle.minWidth,
      maxWidth: acidTokens.layout.subtitle.maxWidth,
      padding: '10px 17px 11px',
      color: '#fff',
      background: 'rgba(7,8,6,0.87)',
      boxShadow: '0 7px 20px rgba(0,0,0,0.22)',
      textAlign: 'center',
      fontSize: 33,
      lineHeight: 1.25,
      fontWeight: 900,
      letterSpacing: '-0.01em',
      transform: 'translate(-50%, 0)',
      pointerEvents: 'none',
    }}
  >
    <span style={{visibility: 'hidden'}}>双方都在快速迭代，只是速度和节奏完全不同。</span>
    <small
      style={{
        display: 'block',
        marginTop: 6,
        color: '#fff',
        fontSize: 15,
        lineHeight: 1.32,
        fontWeight: 800,
        visibility: 'hidden',
      }}
    >
      Both sides are iterating fast, but with very different cadence.
    </small>
  </div>
);

export const NarrationEchoLayer = (rendererProps: ComponentRendererProps) => {
  const frame = useCurrentFrame();
  const props = getProps(rendererProps);
  const exitFrames = props.exitFrames ?? 12;
  const exitStart = Math.min(
    Math.max(1, props.exitAtFrame ?? rendererProps.durationInFrames - exitFrames),
    rendererProps.durationInFrames - 1,
  );
  const exit = rangeProgress(frame, exitStart, Math.min(rendererProps.durationInFrames - 1, exitStart + exitFrames));
  const activeDuration = Math.max(1, exitStart);
  const {activeIndex, itemSpan, localFrame} = itemTiming(Math.min(frame, activeDuration - 1), props.items.length, activeDuration);
  const swapOut = activeIndex > 0 ? 1 - easeOut(localFrame / 6) : 0;
  const activeIntroFrame = activeIndex > 0 ? Math.max(0, localFrame - 6) : localFrame;
  const previousItem = activeIndex > 0 ? props.items[activeIndex - 1] : null;
  const fullCanvas = Boolean(props.backgroundVideoPath);

  const content = (
    <div style={containerStyle(exit, props.placement, fullCanvas)}>
      {previousItem && localFrame < 7 ? (
        <BeatBlock
          item={previousItem}
          localFrame={itemSpan - 1}
          introFrame={itemSpan}
          exiting={swapOut}
          props={props}
        />
      ) : null}
      <BeatBlock item={props.items[activeIndex]} localFrame={activeIntroFrame} introFrame={activeIntroFrame} exiting={0} props={props} />
    </div>
  );

  if (!props.backgroundVideoPath) {
    return (
      <div style={slotCanvasStyle(rendererProps)}>
        {props.showSoftener ?? true ? <div style={canvasScrimStyle(frame, exit)} /> : null}
        <div style={slotContentStyle(rendererProps)}>{content}</div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        isolation: 'isolate',
        background:
          'radial-gradient(circle at 50% 18%, rgba(255,255,255,0.96), transparent 31%), linear-gradient(113deg, #dedbd5 0%, #f7f5ef 49%, #e2dfd8 100%)',
      }}
    >
      <VideoBackplate
        src={props.backgroundVideoPath}
        startFromFrame={props.backgroundStartFromFrame ?? 0}
        withAudio={props.backgroundAudio ?? false}
      />
      {props.showSoftener ?? true ? <div style={canvasScrimStyle(frame, exit)} /> : null}
      <SubtitleBackplate />
      <div style={fullCanvasContentStyle}>{content}</div>
    </div>
  );
};
