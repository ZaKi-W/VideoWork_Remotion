import type {CSSProperties} from 'react';
import {Easing, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import type {ComponentRendererProps} from '../registry/component.types';
import type {NarrationEchoLayerProps} from '../schema/episode.types';
import {getStageLayout} from '../stage/stage.config';
import {visualTokens} from '../stage/visual-tokens';
import {acidTokens} from './acid-system';
import {SemanticTextRevealView} from './SemanticTextReveal';

type EchoItem = NarrationEchoLayerProps['items'][number];
type EchoSegment = EchoItem['segments'][number];

const echoText = acidTokens.color.text;
const echoMuted = 'rgba(255,255,255,0.96)';

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const easeOut = (value: number): number => Easing.bezier(0.16, 1, 0.3, 1)(clamp01(value));

const rangeProgress = (frame: number, start: number, end: number): number => {
  if (end <= start) {
    return frame >= start ? 1 : 0;
  }
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
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

// 动画注入：提供微波纹、呼吸发光和光标动画的局部样式块
const StyleEffects = ({accentColor}: {accentColor: string}) => {
  const cleanColor = accentColor.replace('#', '');
  return (
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes rippleWave-${cleanColor} {
        0% { transform: scale(0.95); opacity: 0.85; }
        100% { transform: scale(3.0); opacity: 0; }
      }
      @keyframes cursorBreathe {
        0%, 100% { opacity: 1; transform: scaleY(1); }
        50% { opacity: 0.15; transform: scaleY(0.9); }
      }
    `}} />
  );
};

// 精细打字机渲染组件：支持模糊、淡入、物理回弹与瞬态爆印发光
const SmoothSegmentText = ({
  segment,
  startFrame,
  charFrames,
  localFrame,
}: {
  segment: EchoSegment;
  startFrame: number;
  charFrames: number;
  localFrame: number;
}) => {
  if (segment.break) {
    return localFrame >= startFrame ? <br /> : null;
  }

  const text = segment.text ?? '';
  const chars = Array.from(text);

  return (
    <>
      {chars.map((char, index) => {
        const charStart = startFrame + index * charFrames;
        const charProgress = rangeProgress(localFrame, charStart, charStart + 5);

        if (charProgress <= 0) {
          return (
            <span
              key={index}
              style={{
                display: 'inline-block',
                whiteSpace: char === ' ' ? 'pre' : 'normal',
                opacity: 0,
              }}
            >
              {char}
            </span>
          );
        }

        const opacity = charProgress;
        const blur = interpolate(charProgress, [0, 1], [8, 0]);
        const scale = interpolate(charProgress, [0, 1], [1.2, 1], {
          easing: Easing.bezier(0.175, 0.885, 0.32, 1.15),
        });
        const translateY = interpolate(charProgress, [0, 1], [10, 0]);
        const glowPhase = interpolate(charProgress, [0, 0.4, 1], [0, 1, 0]);
        // 瞬间爆发发光，突出白字在视频上的吸附效果
        const textShadow = glowPhase > 0.1 ? `0 0 ${glowPhase * 16}px ${acidTokens.color.acid}` : '0 2px 14px rgba(0, 0, 0, 0.72)';

        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              whiteSpace: char === ' ' ? 'pre' : 'normal',
              opacity,
              filter: `blur(${blur}px)`,
              transform: `translateY(${translateY}px) scale(${scale})`,
              transformOrigin: 'center bottom',
              color: segment.accent ? acidTokens.color.acid : undefined,
              textShadow,
            }}
          >
            {char}
          </span>
        );
      })}
    </>
  );
};

const TypedLine = ({
  item,
  localFrame,
  charFrames,
  segmentPauseFrames,
  intro,
  isCurrent,
}: {
  item: EchoItem;
  localFrame: number;
  charFrames: number;
  segmentPauseFrames: number;
  intro: number;
  isCurrent: boolean;
}) => {
  const lineStart = 17;
  let cursorFrame = lineStart;
  let isTyping = false;

  const renderList = item.segments.map((segment, index) => {
    const currentStart = cursorFrame;
    const isBreak = segment.break;

    if (isBreak) {
      cursorFrame += (segment.pauseFrames ?? segmentPauseFrames);
      return <SmoothSegmentText key={index} segment={segment} startFrame={currentStart} charFrames={charFrames} localFrame={localFrame} />;
    }

    const text = segment.text ?? '';
    const charsLen = Array.from(text).length;
    cursorFrame += charsLen * charFrames + (segment.pauseFrames ?? segmentPauseFrames);

    const charEnd = currentStart + charsLen * charFrames;
    if (localFrame >= currentStart && localFrame < charEnd) {
      isTyping = true;
    }

    return (
      <SmoothSegmentText key={index} segment={segment} startFrame={currentStart} charFrames={charFrames} localFrame={localFrame} />
    );
  });

  const typed = localFrame >= cursorFrame;
  const cursorVisible = isTyping || (!typed && intro > 0.5);
  const semanticText = item.segments
    .map((segment) => (segment.break ? '\n' : segment.text ?? ''))
    .join('');
  const emphasis = item.segments
    .filter((segment) => segment.accent && segment.text)
    .map((segment) => segment.text as string);

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
        letterSpacing: '-0.02em',
        opacity: intro,
        transform: `translateY(${(1 - intro) * 14}px)`,
        textShadow: '0 3px 20px rgba(0, 0, 0, 0.72)',
      }}
    >
      {isCurrent ? (
        <SemanticTextRevealView
          text={semanticText}
          mode="focus"
          emphasis={emphasis}
          startFrame={lineStart}
          durationInFrames={5}
          staggerFrames={charFrames}
          blurPx={6}
          accentColor={acidTokens.color.acid}
          style={{whiteSpace: 'pre-wrap'}}
        />
      ) : (
        renderList
      )}
      <span
        style={{
          display: 'inline-block',
          width: 5,
          height: '0.86em',
          borderRadius: 2,
          marginLeft: 8,
          verticalAlign: '-0.07em',
          background: acidTokens.color.acid,
          boxShadow: `0 0 16px ${acidTokens.color.acid}`,
          opacity: cursorVisible ? 1 : 0,
          animation: cursorVisible ? 'cursorBreathe 1.2s infinite cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          transformOrigin: 'center bottom',
        }}
      />
    </div>
  );
};

// 精致的双箭头数据流连线 SVG
const FlowArrow = () => (
  <svg width="18" height="12" viewBox="0 0 18 12" fill="none" style={{ opacity: 0.35, margin: '0 4px', pointerEvents: 'none' }}>
    <path d="M5 2L9 6L5 10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 2L14 6L10 10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BeatBlock = ({
  item,
  localFrame,
  introFrame,
  exiting,
  props,
  isCurrent,
}: {
  item: EchoItem;
  localFrame: number;
  introFrame: number;
  exiting: number;
  props: NarrationEchoLayerProps;
  isCurrent: boolean;
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
          gap: 12,
          color: echoMuted,
          fontFamily: visualTokens.fontFamily.body,
          fontSize: 16,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          opacity: labelIn,
          transform: `translateY(${(1 - labelIn) * 12}px)`,
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Label 呼吸波纹圆点 */}
        <div style={{ position: 'relative', width: 9, height: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <span
            style={{
              position: 'absolute',
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: visualTokens.color.acid,
              animation: `rippleWave-${visualTokens.color.acid.replace('#', '')} 2.4s infinite cubic-bezier(0.16, 1, 0.3, 1)`,
            }}
          />
          <span
            style={{
              position: 'relative',
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: visualTokens.color.acid,
              boxShadow: `0 0 10px ${visualTokens.color.acid}`,
            }}
          />
        </div>
        <span>{item.label}</span>
        {item.beat ? <b style={{color: acidTokens.color.acid, fontWeight: 900, marginLeft: -4}}>{item.beat}</b> : null}
      </div>
      <TypedLine
        item={item}
        localFrame={localFrame}
        charFrames={props.charFrames ?? 2}
        segmentPauseFrames={props.segmentPauseFrames ?? 6}
        intro={lineIn}
        isCurrent={isCurrent}
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
            textShadow: '0 2px 14px rgba(0, 0, 0, 0.72)',
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
              <div key={`${item.label}-track-container-${text}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                {/* 几何化步骤胶囊徽章 */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 14px',
                    borderRadius: '12px',
                    background: isActive ? `${acidTokens.color.acid}18` : 'rgba(255, 255, 255, 0.02)',
                    border: isActive ? `1px solid ${acidTokens.color.acid}44` : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isActive ? echoText : 'rgba(255, 255, 255, 0.45)',
                    fontFamily: visualTokens.fontFamily.body,
                    fontSize: 19,
                    lineHeight: 1.1,
                    fontWeight: 900,
                    letterSpacing: '0.02em',
                    transform: `scale(${isActive ? 1.04 : 1}) translateY(${isActive ? -1 : 0}px)`,
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)',
                    boxShadow: isActive ? `0 0 12px ${acidTokens.color.acid}15` : 'none',
                  }}
                >
                  <b
                    style={{
                      color: isActive ? acidTokens.color.acid : 'rgba(255, 255, 255, 0.4)',
                      fontFamily: visualTokens.fontFamily.display,
                      fontSize: 14,
                      lineHeight: 1,
                      fontWeight: 900,
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </b>
                  <span>{text}</span>
                </span>
                {index < track.length - 1 && <FlowArrow />}
              </div>
            );
          })}
        </div>
      ) : null}
      {focus ? (
        // 升级为 HUD 极简胶囊 Badge，浮空贴合
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: '4%',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 18px',
            borderRadius: '20px',
            border: `1px solid ${acidTokens.color.acid}33`,
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
            opacity: focusIn,
            transform: `translateY(${(1 - focusIn) * 7}px)`,
            fontSize: 14,
            fontFamily: visualTokens.fontFamily.body,
            fontWeight: 900,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {/* 微发光呼吸小绿点 */}
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: acidTokens.color.acid,
              boxShadow: `0 0 8px ${acidTokens.color.acid}`,
            }}
          />
          <span style={{ color: 'rgba(255, 255, 255, 0.55)' }}>当前焦点 ·</span>
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
  // 增加复合文字软投影，保护视频贴合下的高可读性
  textShadow: '0 2px 16px rgba(0, 0, 0, 0.72), 0 1px 4px rgba(0, 0, 0, 0.6)',
});

// 调薄调透 Scrim 遮罩，防止硬色板边界
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
      'radial-gradient(ellipse at 18% 48%, rgba(7,9,6,0.22) 0%, rgba(7,9,6,0.12) 42%, rgba(7,9,6,0) 76%), linear-gradient(90deg, rgba(7,9,6,0.15) 0%, rgba(7,9,6,0.07) 42%, rgba(7,9,6,0) 76%)',
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
    <span style={{visibility: 'hidden'}}>双方都在快速迭代，只是速度 and 节奏完全不同。</span>
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

  const content = (
    <div style={containerStyle(exit, props.placement, Boolean(props.backgroundVideoPath))}>
      {previousItem && localFrame < 7 ? (
        <BeatBlock
          item={previousItem}
          localFrame={itemSpan - 1}
          introFrame={itemSpan}
          exiting={swapOut}
          props={props}
          isCurrent={false}
        />
      ) : null}
      <BeatBlock
        item={props.items[activeIndex]}
        localFrame={activeIntroFrame}
        introFrame={activeIntroFrame}
        exiting={0}
        props={props}
        isCurrent={true}
      />
    </div>
  );

  return (
    <div style={slotCanvasStyle(rendererProps)}>
      {/* 动画载入样式 */}
      <StyleEffects accentColor={acidTokens.color.acid} />
      
      {!props.backgroundVideoPath ? (
        <>
          {props.showSoftener ?? true ? <div style={canvasScrimStyle(frame, exit)} /> : null}
          <div style={slotContentStyle(rendererProps)}>{content}</div>
        </>
      ) : (
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
      )}
    </div>
  );
};
