import type {CSSProperties} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import type {ComponentRendererProps} from '../registry/component.types';
import type {SummaryComponentProps} from '../schema/episode.types';
import {staggerProgress} from '../shared/motion';
import {getStageLayout} from '../stage/stage.config';
import {visualTokens} from '../stage/visual-tokens';
import {FocusReticleView, type FocusReticleTarget} from './FocusReticle';
import {SemanticTextRevealView} from './SemanticTextReveal';

const summaryKinds = ['TrendTotem', 'TrendBanner', 'TopicSignal', 'SideBrief'] as const;
type SummaryKind = (typeof summaryKinds)[number];
type AccentName = 'acid' | 'blue' | 'yellow' | 'orange' | 'red' | 'cyan';

const colors: Record<AccentName, string> = {
  acid: visualTokens.color.acid,
  blue: '#2e8fff',
  yellow: '#ffd84d',
  orange: '#ff6a3d',
  red: '#ff5538',
  cyan: '#4ff1d8',
};

const getProps = (rendererProps: ComponentRendererProps): {kind: SummaryKind; props: SummaryComponentProps} => {
  const content = rendererProps.scene.content;
  if (!summaryKinds.includes(content.kind as SummaryKind)) {
    throw new Error(`SummaryComponents renderer received ${content.kind}`);
  }
  return {kind: content.kind as SummaryKind, props: content.props as SummaryComponentProps};
};

const progress = (frame: number, start: number, end: number): number =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const exitProgress = (frame: number, durationInFrames: number): number =>
  interpolate(frame, [Math.max(0, durationInFrames - 16), Math.max(1, durationInFrames - 1)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

const canvasStyle = (rendererProps: ComponentRendererProps): CSSProperties => {
  const slotRect = getStageLayout(rendererProps.width, rendererProps.height).slots[rendererProps.scene.slot];

  return {
    position: 'absolute',
    left: -slotRect.x,
    top: -slotRect.y,
    width: rendererProps.width,
    height: rendererProps.height,
    overflow: 'hidden',
    pointerEvents: 'none',
  };
};

const slotStyle = (rendererProps: ComponentRendererProps, side: 'left' | 'right'): CSSProperties => {
  const layout = getStageLayout(rendererProps.width, rendererProps.height);
  const slotRect = layout.slots[rendererProps.scene.slot];
  const safeGap = Math.round(rendererProps.width * 0.012);
  const leftSafeWidth = Math.max(320, layout.presenterSafeZone.x - slotRect.x - safeGap);
  const rightEdge = slotRect.x + slotRect.width;
  const rightSafeWidth = Math.max(
    320,
    rightEdge - (layout.presenterSafeZone.x + layout.presenterSafeZone.width) - safeGap,
  );
  
  // 根据舞台模式动态解锁宽度，非人像居中模式下拓宽至 680px
  const isPresenterCenter = rendererProps.scene.stageMode === 'presenter-center';
  const maxWidthLimit = isPresenterCenter ? 520 : 680;

  const width = side === 'right'
    ? Math.min(maxWidthLimit, rightSafeWidth)
    : Math.min(maxWidthLimit, leftSafeWidth);

  return {
    position: 'absolute',
    zIndex: 28,
    // 提升顶部 top 位置至距离顶部 7.5% (约 81px)，留出空间用于纵向拉伸
    top: Math.round(rendererProps.height * 0.075),
    left: side === 'left' ? slotRect.x : undefined,
    right: side === 'right' ? rendererProps.width - slotRect.x - slotRect.width : undefined,
    width,
    // 纵向最小高度由原来的 58% (626px) 拓升至 73% (788px)，最大高度限制在字幕安全线上边缘 (885px)
    minHeight: Math.round(rendererProps.height * 0.73),
    color: '#f5f7ef',
    fontFamily: visualTokens.fontFamily.body,
    textAlign: side === 'right' ? 'right' : 'left',
    // 升级为高对比度复合软文字阴影，提供极佳悬浮易读性
    textShadow: '0 2px 16px rgba(0, 0, 0, 0.72), 0 1px 4px rgba(0, 0, 0, 0.6)',
  };
};

const layerStyle = (intro: number, exit: number, side: 'left' | 'right'): CSSProperties => {
  const sign = side === 'right' ? 1 : -1;
  return {
    position: 'relative',
    width: '100%',
    opacity: intro * (1 - exit * 0.92),
    transform: `translateX(${(1 - intro) * sign * 18 + exit * sign * 34}px)`,
    filter: exit > 0 ? `blur(${exit * 3}px)` : undefined,
  };
};

// 调薄 Scrim 遮罩，防止硬方块色板感
const c21ScrimStyle = (intro: number, side: 'left' | 'right'): CSSProperties => ({
  position: 'absolute',
  zIndex: 1,
  left: side === 'left' ? 0 : undefined,
  right: side === 'right' ? 0 : undefined,
  top: '7.5%',
  width: side === 'left' ? '46%' : '30%',
  height: '78%',
  background:
    side === 'left'
      ? 'radial-gradient(ellipse at 18% 48%, rgba(7,9,6,0.22) 0%, rgba(7,9,6,0.12) 42%, rgba(7,9,6,0) 76%), linear-gradient(90deg, rgba(7,9,6,0.15) 0%, rgba(7,9,6,0.07) 42%, rgba(7,9,6,0) 76%)'
      : 'radial-gradient(ellipse at 82% 48%, rgba(7,9,6,0.22) 0%, rgba(7,9,6,0.12) 42%, rgba(7,9,6,0) 76%), linear-gradient(270deg, rgba(7,9,6,0.15) 0%, rgba(7,9,6,0.07) 42%, rgba(7,9,6,0) 76%)',
  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 82%, transparent 100%)',
  maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 82%, transparent 100%)',
  transform: `translateX(${(1 - intro) * (side === 'left' ? -24 : 24)}px) scaleX(${0.94 + intro * 0.06})`,
  transformOrigin: side === 'left' ? 'left center' : 'right center',
});

const summaryPanelStyle = (height?: number): CSSProperties => ({
  padding: '18px 17px',
  minHeight: height,
});

// 动画注入组件：提供微波纹与呼吸动画的局部样式
const StyleEffects = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes breathGlow {
      0%, 100% { opacity: 0.5; box-shadow: 0 0 6px currentColor, 0 0 2px currentColor; }
      50% { opacity: 1; box-shadow: 0 0 14px currentColor, 0 0 4px currentColor; }
    }
    @keyframes rippleWave {
      0% { transform: scale(0.95); opacity: 0.85; }
      100% { transform: scale(2.8); opacity: 0; }
    }
    @keyframes flowGlow {
      0%, 100% { opacity: 0.45; }
      50% { opacity: 0.95; }
    }
  `}} />
);

const Kicker = ({text, accent, side, progressValue}: {text?: string; accent: string; side: 'left' | 'right'; progressValue: number}) => {
  if (!text) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: side === 'right' ? 'flex-end' : 'flex-start',
        alignItems: 'center',
        gap: 8,
        color: accent,
        fontSize: 10,
        lineHeight: 1,
        fontWeight: 900,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        opacity: progressValue,
        transform: `translateX(${(1 - progressValue) * (side === 'right' ? 13 : -13)}px) scale(${0.9 + progressValue * 0.1})`,
        textShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
      }}
    >
      {side === 'left' ? <i style={{display: 'block', width: 3, height: 18, borderRadius: 2, background: 'currentColor'}} /> : null}
      <span>{text}</span>
      {side === 'right' ? <i style={{display: 'block', width: 3, height: 18, borderRadius: 2, background: 'currentColor'}} /> : null}
    </div>
  );
};

const Foot = ({
  text,
  progressValue,
  side,
  accent,
}: {
  text?: string;
  progressValue: number;
  side: 'left' | 'right';
  accent: string;
}) => {
  if (!text) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: side === 'right' ? 'row-reverse' : 'row',
        justifyContent: side === 'right' ? 'flex-start' : 'flex-start',
        alignItems: 'center',
        gap: 8,
        marginTop: 18,
        color: '#fff',
        fontSize: 10,
        lineHeight: 1,
        fontWeight: 900,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        opacity: progressValue,
        transform: `translateX(${(1 - progressValue) * (side === 'right' ? 8 : -8)}px)`,
        textShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
      }}
    >
      <span style={{width: 34, height: 2, background: accent, boxShadow: `0 0 8px ${accent}`}} />
      <span>{text}</span>
    </div>
  );
};

const titleSize = (lines: string[], base: number, min: number): number => {
  const longest = Math.max(...lines.map((line) => Array.from(line).length), 1);
  return Math.max(min, Math.min(base, base - Math.max(0, longest - 6) * 6));
};

const topicCardTitleStyle = (title: string): CSSProperties => {
  const lines = title.split('\n');
  const longestLine = Math.max(...lines.map((line) => Array.from(line).length), 1);
  const fontSize = Math.max(13, Math.min(17, 17 - Math.max(0, longestLine - 5) * 1.1 - Math.max(0, lines.length - 2) * 1.2));

  return {
    display: 'block',
    marginTop: 10,
    color: '#fff',
    fontSize,
    lineHeight: 1.36,
    fontWeight: 900,
    whiteSpace: 'pre-line',
  };
};

const EmphasisText = ({text, emphasis, accent}: {text: string; emphasis?: string; accent: string}) => {
  if (!emphasis || !text.includes(emphasis)) {
    return <>{text}</>;
  }

  const [before, ...afterParts] = text.split(emphasis);
  return (
    <>
      {before}
      <span style={{color: accent}}>{emphasis}</span>
      {afterParts.join(emphasis)}
    </>
  );
};

const TrendTotem = ({props, frame, exit}: {props: SummaryComponentProps; frame: number; exit: number}) => {
  const accent = colors[props.accent ?? 'yellow'];
  const intro = progress(frame, 0, 18);
  const titleLines = props.title.slice(0, 2);
  const fontSize = titleSize(titleLines, 116, 72);
  const noteIn = progress(frame, 20, 36);

  return (
    // 内部纵向面板高度拉伸至 680px，留出大量阅读空档
    <div style={{...layerStyle(intro, exit, 'left'), ...summaryPanelStyle(680)}}>
      <Kicker text={props.kicker} accent={accent} side="left" progressValue={progress(frame, 2, 12)} />
      {props.label ? (
        <div
          style={{
            marginTop: 20,
            color: accent,
            fontFamily: visualTokens.fontFamily.display,
            fontSize: Math.max(20, Math.min(38, 38 - Math.max(0, props.label.length - 10) * 2)),
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: '0.12em',
            opacity: progress(frame, 6, 18),
            transform: `translateX(${(1 - progress(frame, 6, 18)) * -16}px)`,
          }}
        >
          {props.label}
        </div>
      ) : null}
      <div style={{display: 'grid', gap: 0, marginTop: 12}}>
        {titleLines.map((line, index) => (
          <div
            key={`${line}-${index}`}
            style={{
              color: '#ffffff',
              fontFamily: visualTokens.fontFamily.display,
              fontSize,
              lineHeight: 0.92,
              fontWeight: 900,
              letterSpacing: '-0.04em',
            }}
          >
            <SemanticTextRevealView
              text={line}
              mode="words"
              emphasis={props.emphasis ? [props.emphasis] : []}
              startFrame={10 + index * 5}
              durationInFrames={15}
              staggerFrames={2}
              blurPx={6}
              accentColor={accent}
            />
          </div>
        ))}
      </div>
      {props.copy ? (
        <div
          style={{
            maxWidth: '88%',
            // 适当调高段间距（由原来的 17 升级至 32），使文字排列更显宏大
            marginTop: 32,
            paddingTop: 11,
            borderTop: `1px solid ${accent}`,
            color: '#fff',
            fontSize: 16,
            lineHeight: 1.5,
            fontWeight: 900,
            opacity: noteIn,
            transform: `translateY(${(1 - noteIn) * 10}px)`,
            textShadow: '0 2px 14px rgba(0, 0, 0, 0.72)',
          }}
        >
          {props.copy}
        </div>
      ) : null}
      <Foot text={props.foot} progressValue={progress(frame, 30, 44)} side="left" accent={accent} />
    </div>
  );
};

const TrendBanner = ({props, frame, exit}: {props: SummaryComponentProps; frame: number; exit: number}) => {
  const accent = colors[props.accent ?? 'blue'];
  const intro = progress(frame, 0, 18);
  const titleLines = props.title.slice(0, 2);
  const fontSize = titleSize(titleLines, 104, 62);
  const rowIn = progress(frame, 7, 20);

  return (
    // 内部纵向面板高度拉伸至 680px
    <div style={{...layerStyle(intro, exit, 'left'), ...summaryPanelStyle(680)}}>
      <Kicker text={props.kicker} accent={colors.yellow} side="left" progressValue={progress(frame, 2, 12)} />
      <div
        style={{
          marginTop: 42,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: accent,
          opacity: rowIn,
          transform: `translateX(${(1 - rowIn) * -16}px)`,
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{fontFamily: visualTokens.fontFamily.display, fontSize: 26, lineHeight: 1, fontWeight: 900, letterSpacing: '-0.1em'}}>≋</div>
        {props.label ? (
          <div style={{fontFamily: visualTokens.fontFamily.display, fontSize: Math.max(26, Math.min(54, 54 - Math.max(0, props.label.length - 12) * 2)), lineHeight: 1, fontWeight: 900, letterSpacing: '0.04em'}}>
            {props.label}
          </div>
        ) : null}
      </div>
      <div style={{marginTop: 18, overflow: 'hidden'}}>
        {titleLines.map((line, index) => (
          <div
            key={`${line}-${index}`}
            style={{
              color: '#ffffff',
              fontFamily: visualTokens.fontFamily.display,
              fontSize,
              lineHeight: 0.95,
              fontWeight: 900,
              letterSpacing: '-0.04em',
            }}
          >
            <SemanticTextRevealView
              text={line}
              mode="words"
              startFrame={12 + index * 5}
              durationInFrames={15}
              staggerFrames={2}
              blurPx={6}
              accentColor={accent}
            />
          </div>
        ))}
      </div>
      {props.copy ? (
        <div
          style={{
            // 适当调高段间距（由 18 调至 34）
            marginTop: 34,
            maxWidth: '92%',
            color: '#fff',
            fontSize: 16,
            lineHeight: 1.5,
            fontWeight: 900,
            opacity: progress(frame, 24, 38),
            transform: `translateY(${(1 - progress(frame, 24, 38)) * 12}px)`,
            textShadow: '0 2px 14px rgba(0, 0, 0, 0.72)',
          }}
        >
          {props.copy}
        </div>
      ) : null}
      <Foot text={props.foot} progressValue={progress(frame, 32, 48)} side="left" accent={accent} />
    </div>
  );
};

const TopicSignal = ({props, frame, exit}: {props: SummaryComponentProps; frame: number; exit: number}) => {
  const intro = progress(frame, 0, 18);
  const tagsIn = progress(frame, 27, 56);
  const cards = props.blocks.slice(0, 3);
  const titleLines = props.title.slice(0, 2);
  const headSize = titleSize(titleLines, 92, 54);
  const activeCardIndex = Math.min(
    Math.max(0, cards.length - 1),
    Math.max(0, Math.floor((frame - 27) / 10)),
  );
  const cardTargets: FocusReticleTarget[] = cards.map((card, index) => ({
    id: `card-${index}-${card.label}`,
    x: index * 166,
    y: 0,
    width: 152,
    height: 160,
  }));

  return (
    // 内部总高度拉伸至 700px
    <div style={{...layerStyle(intro, exit, 'left'), ...summaryPanelStyle(700)}}>
      {props.label ? (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9,
            padding: '12px 16px',
            borderRadius: 14,
            border: `1px solid rgba(255,106,61,0.35)`,
            background: 'rgba(255,106,61,0.08)',
            color: colors.orange,
            fontSize: 14,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            opacity: progress(frame, 2, 14),
            transform: `translateY(${(1 - progress(frame, 2, 14)) * -10}px)`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {props.label}
        </div>
      ) : null}
      {props.kicker ? (
        <div style={{marginTop: 22, color: colors.orange, fontFamily: visualTokens.fontFamily.display, fontSize: 14, lineHeight: 1, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: progress(frame, 8, 20), transform: `translateX(${(1 - progress(frame, 8, 20)) * -16}px)`}}>
          {props.kicker}
        </div>
      ) : null}
      <div style={{marginTop: 18}}>
        {titleLines.map((line, index) => {
          const lineIn = progress(frame, 14 + index * 4, 27 + index * 4);
          return (
            <div
              key={`${line}-${index}`}
              style={{
                color: index === 1 ? colors.red : '#fff',
                fontFamily: visualTokens.fontFamily.display,
                fontSize: index === 1 ? headSize + 18 : headSize,
                lineHeight: 1.05,
                fontWeight: 900,
                letterSpacing: 0,
                opacity: lineIn,
                transform: `translateY(${(1 - lineIn) * (index === 1 ? 20 : 16)}px)`,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
      {props.copy ? (
        <div style={{marginTop: 12, color: '#fff', fontSize: 16, lineHeight: 1.4, fontWeight: 900, opacity: progress(frame, 22, 34), transform: `translateY(${(1 - progress(frame, 22, 34)) * 10}px)`}}>
          {props.copy}
        </div>
      ) : null}
      {/* 调大子卡片间距 */}
      <div style={{position: 'relative', marginTop: 28}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14}}>
          {cards.map((card, index) => {
          const accent = colors[(card.accent ?? (index === 0 ? 'cyan' : index === 1 ? 'orange' : 'yellow')) as AccentName];
          const cardIn = staggerProgress(tagsIn, index, 0.18);
          return (
            <div
              key={`${card.label}-${index}`}
              style={{
                // 子卡片纵向高度由 112px 大幅拉伸至 160px，padding 调整为 18px，极其饱满
                minHeight: 160,
                padding: '18px 14px 12px',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${accent}33`,
                borderRadius: 14,
                boxShadow: `0 8px 24px rgba(0,0,0,0.15), inset 0 0 10px ${accent}08`,
                opacity: cardIn,
                transform: `translateY(${(1 - cardIn) * 18}px) scale(${0.96 + cardIn * 0.04})`,
                textShadow: '0 2px 10px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{display: 'grid', gridTemplateColumns: '14px 1fr', alignItems: 'center', gap: 8, color: accent, fontFamily: visualTokens.fontFamily.display, fontSize: 10, lineHeight: 1.15, fontWeight: 900, letterSpacing: 0, textTransform: 'uppercase'}}>
                <span 
                  style={{
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    background: accent,
                    boxShadow: `0 0 8px ${accent}`,
                    animation: 'breathGlow 2s infinite ease-in-out',
                    display: 'inline-block'
                  }} 
                />
                <span style={{overflowWrap: 'anywhere'}}>{card.label}</span>
              </div>
              <strong style={topicCardTitleStyle(card.title)}>
                {card.title}
              </strong>
            </div>
          );
          })}
        </div>
        {cards.length > 0 ? (
          <FocusReticleView
            targets={cardTargets}
            activeIndex={activeCardIndex}
            previousIndex={Math.max(0, activeCardIndex - 1)}
            transitionStartFrame={27 + activeCardIndex * 10}
            transitionDurationInFrames={12}
            accentColor={colors.orange}
            cornerLength={14}
            padding={5}
          />
        ) : null}
      </div>
      <Foot text={props.foot} progressValue={progress(frame, 42, 58)} side="left" accent={colors.orange} />
    </div>
  );
};

const SideBrief = ({props, frame, exit}: {props: SummaryComponentProps; frame: number; exit: number}) => {
  const intro = progress(frame, 0, 20);
  const accent = colors[props.accent ?? 'acid'];
  const titleLines = props.title.slice(0, 3);
  const titleIn = progress(frame, 14, 32);
  const titleFont = titleSize(titleLines, 78, 50);
  const railOffset = -34;
  const titleLineHeight = titleFont * 1.1;
  const activeConclusionIndex = Math.min(
    Math.max(0, titleLines.length - 1),
    Math.max(0, Math.floor((frame - 14) / 10)),
  );
  const conclusionTargets: FocusReticleTarget[] = titleLines.map((line, index) => ({
    id: `conclusion-${index}-${line}`,
    x: 0,
    y: index * titleLineHeight,
    width: 478,
    height: titleLineHeight,
  }));

  return (
    // 内部纵向面板高度拉伸至 800px
    <div style={{...layerStyle(intro, exit, 'right'), ...summaryPanelStyle(800)}}>
      {/* 内部高度调整为 800px，拉大间距 */}
      <div style={{position: 'relative', height: 800, padding: '0 42px 0 0'}}>
        {/* 右侧极细流程轨高度跟随拉伸至 800px，非常提拔 */}
        <div style={{position: 'absolute', top: 0, right: railOffset, width: 3, height: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 2}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', background: accent, boxShadow: `0 0 12px ${accent}`, transform: `translateY(${(-1 + progress(frame, 4, 24)) * 104}%)`, borderRadius: 2}} />
          <div
            style={{
              position: 'absolute',
              top: `${progress(frame, 4, 24) * 100}%`,
              left: -2,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: `0 0 10px ${accent}`,
              animation: 'flowGlow 1.5s infinite ease-in-out',
            }}
          />
        </div>
        
        <Kicker text={props.kicker} accent={accent} side="right" progressValue={progress(frame, 3, 15)} />
        {props.index ? (
          <div style={{marginTop: 34, overflow: 'visible', color: accent, fontFamily: visualTokens.fontFamily.display, fontSize: Math.max(96, Math.min(146, 146 - Math.max(0, props.index.length - 2) * 8)), lineHeight: 0.76, fontWeight: 900, letterSpacing: 0, opacity: progress(frame, 10, 18), textShadow: `0 0 20px ${accent}25`}}>
            <span style={{display: 'inline-block', transform: `translateX(${(1 - progress(frame, 10, 25)) * 22}px)`}}>{props.index}</span>
          </div>
        ) : null}
        <div style={{position: 'relative', marginTop: 28, overflow: 'hidden', color: '#fff', fontFamily: visualTokens.fontFamily.display, fontSize: titleFont, lineHeight: 1.1, fontWeight: 900, letterSpacing: '-0.024em', opacity: titleIn}}>
          <span style={{display: 'inline-block', transform: `translateX(${(1 - titleIn) * 108}%)`}}>
            {titleLines.map((line) => (
              <span key={line} style={{display: 'block'}}>
                <EmphasisText text={line} emphasis={props.emphasis} accent={accent} />
              </span>
            ))}
          </span>
          {titleLines.length > 0 ? (
            <FocusReticleView
              targets={conclusionTargets}
              activeIndex={activeConclusionIndex}
              previousIndex={Math.max(0, activeConclusionIndex - 1)}
              transitionStartFrame={14 + activeConclusionIndex * 10}
              transitionDurationInFrames={12}
              accentColor={accent}
              cornerLength={16}
              padding={4}
            />
          ) : null}
        </div>
        {props.copy ? (
          // 调高纵向段落间距（从 24 优化至 40）
          <div style={{maxWidth: '95%', margin: '40px 0 0 auto', color: '#fff', fontSize: 20, lineHeight: 1.5, fontWeight: 900, opacity: progress(frame, 28, 42), transform: `translateX(${(1 - progress(frame, 28, 42)) * 22}px)`}}>
            {props.copy}
          </div>
        ) : null}
        
        {props.focus ? (
          // 升级为 HUD 悬浮圆角胶囊
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 28,
              padding: '8px 18px',
              borderRadius: '20px',
              border: `1px solid ${accent}33`,
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
              opacity: progress(frame, 36, 50),
              transform: `scaleX(${0.92 + progress(frame, 36, 50) * 0.08}) translateX(${(1 - progress(frame, 36, 50)) * 22}px)`,
              transformOrigin: 'right',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: '0.06em',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: accent,
                boxShadow: `0 0 8px ${accent}`,
              }}
            />
            <span style={{ color: 'rgba(255, 255, 255, 0.55)' }}>当前焦点 ·</span>
            <b style={{color: accent, fontWeight: 900, letterSpacing: 0}}>{props.focus}</b>
          </div>
        ) : null}
        {props.tail ? (
          <div style={{display: 'grid', gridTemplateColumns: '1fr 44px', alignItems: 'center', gap: 10, maxWidth: '88%', margin: '20px 0 0 auto', color: '#fff', fontSize: 14, lineHeight: 1.45, fontWeight: 900, letterSpacing: '0.035em', opacity: progress(frame, 44, 58), transform: `translateX(${(1 - progress(frame, 44, 58)) * 15}px)`}}>
            <span>{props.tail}</span>
            <span style={{height: 2, background: accent, transform: `scaleX(${progress(frame, 50, 64)})`, transformOrigin: 'right', boxShadow: `0 0 8px ${accent}`}} />
          </div>
        ) : null}
        <div style={{position: 'absolute', right: 42, bottom: 0}}>
          <Foot text={props.foot} progressValue={progress(frame, 54, 70)} side="right" accent={accent} />
        </div>
      </div>
    </div>
  );
};

export const SummaryComponents = (rendererProps: ComponentRendererProps) => {
  const frame = useCurrentFrame();
  const {kind, props} = getProps(rendererProps);
  const intro = progress(frame, 0, 24);
  const exit = exitProgress(frame, rendererProps.durationInFrames);
  const side = kind === 'SideBrief' ? 'right' : 'left';

  return (
    <div style={canvasStyle(rendererProps)}>
      {/* 动画载入样式 */}
      <StyleEffects />
      
      <div style={c21ScrimStyle(intro, side)} />
      <div style={slotStyle(rendererProps, side)}>
        {kind === 'TrendTotem' ? <TrendTotem props={props} frame={frame} exit={exit} /> : null}
        {kind === 'TrendBanner' ? <TrendBanner props={props} frame={frame} exit={exit} /> : null}
        {kind === 'TopicSignal' ? <TopicSignal props={props} frame={frame} exit={exit} /> : null}
        {kind === 'SideBrief' ? <SideBrief props={props} frame={frame} exit={exit} /> : null}
      </div>
    </div>
  );
};
