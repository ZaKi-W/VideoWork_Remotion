import type {CSSProperties} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import type {ComponentRendererProps} from '../registry/component.types';
import type {RemotionTalkEffectProps} from '../schema/episode.types';
import {getStageLayout} from '../stage/stage.config';
import {visualTokens} from '../stage/visual-tokens';
import {FocusReticleView, type FocusReticleTarget} from './FocusReticle';

const getProps = (rendererProps: ComponentRendererProps): RemotionTalkEffectProps => {
  if (rendererProps.scene.content.kind !== 'RemotionTalkEffect') {
    throw new Error(`RemotionTalkEffect renderer received ${rendererProps.scene.content.kind}`);
  }
  return rendererProps.scene.content.props;
};

const paletteFor = (accentName: RemotionTalkEffectProps['accent']) => {
  if (accentName === 'cyan') {
    return {
      accent: '#63e7ff',
      title: '#63e7ff',
      soft: 'rgba(255,255,255,0.96)',
      muted: 'rgba(222,245,255,0.8)',
    };
  }
  if (accentName === 'orange') {
    return {
      accent: '#ff9f43',
      title: '#ffb04f',
      soft: 'rgba(255,255,255,0.96)',
      muted: 'rgba(255,235,205,0.8)',
    };
  }
  return {
    accent: '#d9ff4c',
    title: '#d9ff4c',
    soft: 'rgba(255,255,255,0.96)',
    muted: 'rgba(239,255,202,0.8)',
  };
};

const progress = (frame: number, start: number, end: number): number =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const canvasStyle = (rendererProps: ComponentRendererProps): CSSProperties => {
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

export const getRemotionTalkEffectLayout = (width: number, height: number) => {
  const layout = getStageLayout(width, height);
  const left = Math.round(width * 0.025);
  const top = Math.round(height * 0.075);
  const minHeight = Math.round(height * 0.73);
  const paddingX = Math.round(width * 0.0125);
  const paddingY = Math.round(height * 0.0167);
  const widthBeforePresenter = layout.presenterSafeZone.x - left;

  return {
    left,
    top,
    width: Math.min(710, widthBeforePresenter),
    minHeight,
    paddingX,
    paddingY,
  };
};

const slotContentStyle = (rendererProps: ComponentRendererProps): CSSProperties => {
  const panel = getRemotionTalkEffectLayout(rendererProps.width, rendererProps.height);

  return {
    position: 'absolute',
    zIndex: 2,
    left: panel.left,
    top: panel.top,
    width: panel.width,
    minHeight: panel.minHeight,
  };
};

// 极简暗化遮罩：仍然保留，以对底层口播视频进行微弱的暗化，保护文字可读性，但这非常平滑，不是盒子边界
const leftScrimStyle = (intro: number): CSSProperties => ({
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
  transform: `translateX(${(1 - intro) * -24}px) scaleX(${0.94 + intro * 0.06})`,
  transformOrigin: 'left center',
});

// 精细打字机渲染：支持模糊、淡入、物理回弹与瞬间爆破微发光
const SmoothTypewriter = ({
  text,
  frame,
  startFrame,
  charFrames,
  palette,
}: {
  text: string;
  frame: number;
  startFrame: number;
  charFrames: number;
  palette: ReturnType<typeof paletteFor>;
}) => {
  const chars = Array.from(text);
  return (
    <>
      {chars.map((char, index) => {
        const charStart = startFrame + index * charFrames;
        const charProgress = progress(frame, charStart, charStart + 5);

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
        // 透明底色下，爆破发光让文字出现时具有完美的瞬态视觉吸附力
        const textShadow = glowPhase > 0.1 ? `0 0 ${glowPhase * 16}px ${palette.accent}` : '0 2px 14px rgba(0, 0, 0, 0.7)';

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

// 动画效果注入：提供微波纹、呼吸发光和光标动画的局部样式块
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

// 极细工业定位直角装饰
const CornerDecor = ({position}: {position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'}) => {
  const size = 10;
  const thickness = 1;
  const offset = 14;
  const style: CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    opacity: 0.36,
  };
  if (position === 'top-left') {
    style.left = offset;
    style.top = offset;
    style.borderLeft = `${thickness}px solid #ffffff`;
    style.borderTop = `${thickness}px solid #ffffff`;
  } else if (position === 'top-right') {
    style.right = offset;
    style.top = offset;
    style.borderRight = `${thickness}px solid #ffffff`;
    style.borderTop = `${thickness}px solid #ffffff`;
  } else if (position === 'bottom-left') {
    style.left = offset;
    style.bottom = offset;
    style.borderLeft = `${thickness}px solid #ffffff`;
    style.borderBottom = `${thickness}px solid #ffffff`;
  } else {
    style.right = offset;
    style.bottom = offset;
    style.borderRight = `${thickness}px solid #ffffff`;
    style.borderBottom = `${thickness}px solid #ffffff`;
  }
  return <div style={style} />;
};

// 工业对准十字装饰
const CrossDecor = ({top, right}: {top: number; right: number}) => (
  <div
    style={{
      position: 'absolute',
      top,
      right,
      color: 'rgba(255, 255, 255, 0.2)',
      fontSize: 11,
      fontFamily: visualTokens.fontFamily.mono,
      lineHeight: 1,
      pointerEvents: 'none',
    }}
  >
    +
  </div>
);

const TitleBlock = ({
  props,
  palette,
  frame,
  intro,
}: {
  props: RemotionTalkEffectProps;
  palette: ReturnType<typeof paletteFor>;
  frame: number;
  intro: number;
}) => {
  const startFrame = 8;
  const charFrames = 2;
  const charsCount = Array.from(props.title).length;
  const totalTypingFrames = startFrame + charsCount * charFrames;
  
  const isTyping = frame >= startFrame && frame < totalTypingFrames;
  const isDone = frame >= totalTypingFrames;
  const cursorVisible = isTyping || (!isDone && intro > 0.5);

  const detailIn = progress(frame, 28, 46);

  return (
    <>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          color: palette.soft,
          fontSize: 16,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          opacity: intro,
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Eyebrow 呼吸波纹圆点 */}
        <div style={{ position: 'relative', width: 9, height: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <span
            style={{
              position: 'absolute',
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: palette.accent,
              animation: `rippleWave-${palette.accent.replace('#', '')} 2.4s infinite cubic-bezier(0.16, 1, 0.3, 1)`,
            }}
          />
          <span
            style={{
              position: 'relative',
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: palette.accent,
              boxShadow: `0 0 10px ${palette.accent}`,
            }}
          />
        </div>
        <span>{props.eyebrow}</span>
        {props.index ? <b style={{color: palette.accent, letterSpacing: 0, marginLeft: -4}}>{props.index}</b> : null}
      </div>
      <div
        style={{
          marginTop: 22,
          minHeight: '2.08em',
          fontFamily: visualTokens.fontFamily.display,
          fontSize: props.title.length > 10 ? 82 : 92,
          lineHeight: 1.04,
          fontWeight: 900,
          letterSpacing: '-0.02em',
          color: palette.title,
          textShadow: `0 3px 20px rgba(0,0,0,0.72), 0 0 16px ${palette.accent}20`,
          transform: `translateY(${(1 - intro) * 10}px)`,
        }}
      >
        <SmoothTypewriter text={props.title} frame={frame} startFrame={startFrame} charFrames={charFrames} palette={palette} />
        <span
          style={{
            display: 'inline-block',
            width: 5,
            height: '0.84em',
            borderRadius: 2,
            marginLeft: 8,
            verticalAlign: '-0.06em',
            background: palette.accent,
            boxShadow: `0 0 16px ${palette.accent}`,
            opacity: cursorVisible ? 1 : 0,
            animation: cursorVisible ? 'cursorBreathe 1.2s infinite cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            transformOrigin: 'center bottom',
          }}
        />
      </div>
      {props.subtitle ? (
        <div
          style={{
            maxWidth: 600,
            marginTop: 20,
            color: palette.soft,
            fontSize: 28,
            lineHeight: 1.3,
            fontWeight: 900,
            opacity: detailIn,
            transform: `translateY(${(1 - detailIn) * 8}px)`,
            textShadow: '0 2px 14px rgba(0, 0, 0, 0.72)',
          }}
        >
          {props.subtitle}
        </div>
      ) : null}
    </>
  );
};

// 列表项激活插值计算器
const getItemActiveProgress = (frame: number, index: number, total: number, startFrame: number, duration: number) => {
  const segment = duration / total;
  const targetStart = startFrame + index * segment;
  const targetEnd = startFrame + (index + 1) * segment;
  const easeInFrames = 6;
  
  if (frame < targetStart - easeInFrames) return 0;
  if (frame > targetEnd + easeInFrames) return 0;
  if (frame >= targetStart && frame <= targetEnd) return 1;
  
  if (frame < targetStart) {
    return progress(frame, targetStart - easeInFrames, targetStart);
  }
  return 1 - progress(frame, targetEnd, targetEnd + easeInFrames);
};

const ItemRail = ({
  items,
  palette,
  frame,
  durationInFrames,
}: {
  items: string[];
  palette: ReturnType<typeof paletteFor>;
  frame: number;
  durationInFrames: number;
}) => {
  if (items.length === 0) {
    return null;
  }

  const cycleWindow = Math.max(1, durationInFrames - 78);
  const startFrame = 58;
  const segmentDuration = cycleWindow / items.length;
  const activeIndex = Math.min(
    items.length - 1,
    Math.max(0, Math.floor((frame - startFrame) / segmentDuration)),
  );
  const previousIndex = Math.max(0, activeIndex - 1);
  const targets: FocusReticleTarget[] = items.map((item, index) => ({
    id: `item-${index}-${item}`,
    x: 0,
    y: index * 66,
    width: 520,
    height: 48,
  }));

  return (
    <div style={{position: 'relative', marginTop: 36}}>
      <div style={{display: 'grid', gap: 18}}>
        {items.map((item, index) => {
        const itemIntro = progress(frame, 42 + index * 4, 56 + index * 4);
        
        const activeProgress = getItemActiveProgress(frame, index, items.length, startFrame, cycleWindow);
        const isActive = activeProgress > 0.5;
        
        const textScale = interpolate(activeProgress, [0, 1], [1, 1.03]);
        const textTranslateX = interpolate(activeProgress, [0, 1], [0, 10]);
        const padIndex = String(index + 1).padStart(2, '0');
        
        return (
          <div
            key={item}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              fontSize: 26,
              lineHeight: 1.16,
              fontWeight: 900,
              opacity: itemIntro * interpolate(activeProgress, [0, 1], [0.6, 1]),
              transform: `translateX(${(1 - itemIntro) * -12 + textTranslateX}px) scale(${textScale})`,
              transformOrigin: 'left center',
            }}
          >
            {/* 几何序号徽章：无背景深色盒子，保持极致清透 */}
            <span
              style={{
                fontFamily: visualTokens.fontFamily.mono,
                fontSize: 20,
                fontWeight: 900,
                color: isActive ? palette.accent : 'rgba(255, 255, 255, 0.4)',
                padding: '4px 10px',
                borderRadius: '8px',
                background: isActive ? `${palette.accent}15` : 'rgba(255, 255, 255, 0.02)',
                border: isActive ? `1px solid ${palette.accent}44` : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isActive ? `0 0 12px ${palette.accent}20` : 'none',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                textShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
              }}
            >
              {padIndex}
            </span>
            <span style={{ 
              color: isActive ? palette.soft : palette.muted,
              textShadow: '0 2px 14px rgba(0, 0, 0, 0.72)',
            }}>
              {item}
            </span>
          </div>
        );
        })}
      </div>
      <FocusReticleView
        targets={targets}
        activeIndex={activeIndex}
        previousIndex={previousIndex}
        transitionStartFrame={startFrame + activeIndex * segmentDuration}
        transitionDurationInFrames={12}
        accentColor={palette.accent}
        cornerLength={14}
        padding={6}
      />
    </div>
  );
};

const CompareBlock = ({
  props,
  palette,
  frame,
  durationInFrames,
}: {
  props: RemotionTalkEffectProps;
  palette: ReturnType<typeof paletteFor>;
  frame: number;
  durationInFrames: number;
}) => {
  const connectorIntro = progress(frame, 50, 66);
  const holdShift = progress(frame, 68, Math.max(69, durationInFrames - 18));

  return (
    <div style={{marginTop: 40, display: 'grid', gap: 20, width: '100%'}}>
      {[props.left, props.right].map((label, index) => {
        if (!label) {
          return null;
        }
        const active = index === 1;
        const itemIntro = progress(frame, 36 + index * 6, 52 + index * 6);
        const cardScale = interpolate(itemIntro, [0, 1], [0.95, 1], {
          easing: Easing.bezier(0.175, 0.885, 0.32, 1.1),
        });
        const cardTranslateY = interpolate(itemIntro, [0, 1], [15, 0]);

        return (
          <div
            key={label}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '16px',
              padding: '22px 28px',
              // 移除深黑色背景，改用极淡半透白，配合毛玻璃使内容浮空融入
              background: active ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(20px)',
              border: active ? `1px solid ${palette.accent}33` : '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: active 
                ? `0 12px 30px rgba(0,0,0,0.25), inset 0 0 14px ${palette.accent}12` 
                : '0 8px 24px rgba(0,0,0,0.12)',
              color: active ? palette.title : palette.soft,
              fontFamily: visualTokens.fontFamily.display,
              fontSize: active ? 56 : 48,
              lineHeight: 1.1,
              fontWeight: 900,
              opacity: itemIntro,
              transform: `scale(${cardScale}) translateY(${cardTranslateY}px) translateX(${
                (1 - itemIntro) * -12 + (active ? holdShift * 12 : 0)
              }px)`,
              textShadow: `0 2px 14px rgba(0, 0, 0, 0.72)${active ? `, 0 0 16px ${palette.accent}30` : ''}`,
              overflow: 'hidden',
            }}
          >
            {/* 激活项底部发光流淌细光丝 */}
            {active && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: 3,
                  background: palette.accent,
                  boxShadow: `0 0 12px ${palette.accent}`,
                }}
              />
            )}
            <span>{label}</span>
          </div>
        );
      })}
      
      {props.connector ? (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            width: 'max-content',
            gap: 16,
            marginLeft: 28 + holdShift * 18,
            color: palette.accent,
            fontSize: 16,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            opacity: connectorIntro,
            transform: `translateY(${(1 - connectorIntro) * -8}px)`,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
          }}
        >
          <span style={{fontFamily: visualTokens.fontFamily.mono, color: 'rgba(255,255,255,0.2)'}}>+</span>
          <div 
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: `1px solid ${palette.accent}33`,
              background: 'rgba(10, 10, 10, 0.65)',
              backdropFilter: 'blur(8px)',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: palette.accent, boxShadow: `0 0 8px ${palette.accent}` }} />
            <span>{props.connector}</span>
          </div>
          <span style={{fontFamily: visualTokens.fontFamily.mono, color: 'rgba(255,255,255,0.2)'}}>+</span>
        </div>
      ) : null}
    </div>
  );
};

export const RemotionTalkEffect = (rendererProps: ComponentRendererProps) => {
  const frame = useCurrentFrame();
  const props = getProps(rendererProps);
  const accentName = props.accent ?? 'lime';
  const palette = paletteFor(accentName);
  const intro = progress(frame, 0, 24);
  const exit = progress(frame, Math.max(1, rendererProps.durationInFrames - 16), rendererProps.durationInFrames);
  const showCompare = props.variant === 'compare' || props.variant === 'handoff';
  const panelLayout = getRemotionTalkEffectLayout(rendererProps.width, rendererProps.height);

  // 用于环境光泄漏 (Ambient Light Leaks) 移动定位的平滑插值
  const glow1X = interpolate(intro, [0, 1], [-140, -50]);
  const glow1Y = interpolate(intro, [0, 1], [420, 350]);
  const glow2X = interpolate(intro, [0, 1], [580, 490]);
  const glow2Y = interpolate(intro, [0, 1], [-90, -40]);

  return (
    <div style={canvasStyle(rendererProps)}>
      {/* 动画载入样式 */}
      <StyleEffects accentColor={palette.accent} />
      
      {/* 背景柔和平滑 Scrim 层（淡入淡出暗色梯度，防止强烈的盒子边界） */}
      <div style={leftScrimStyle(intro)} />
      
      <div style={slotContentStyle(rendererProps)}>
        {/* 外容器面板：移除深色卡片背景，使其彻底透底，保证完美悬浮融入口播视频 */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: panelLayout.minHeight,
            boxSizing: 'border-box',
            padding: `${panelLayout.paddingY}px ${panelLayout.paddingX}px`,
            borderRadius: '24px',
            background: 'transparent',
            backdropFilter: 'none',
            border: 'none',
            boxShadow: 'none',
            color: '#ffffff',
            fontFamily: visualTokens.fontFamily.body,
            opacity: intro * (1 - exit * 0.86),
            transform: `translateX(${(1 - intro) * -28 + exit * -38}px)`,
            pointerEvents: 'none',
            overflow: 'hidden', // 限制内部环境漫反射光晕边界
          }}
        >
          {/* 环境光泄漏 1：透明度调至极度微妙的 5% */}
          <div
            style={{
              position: 'absolute',
              left: glow1X,
              top: glow1Y,
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: palette.accent,
              filter: 'blur(90px)',
              opacity: intro * 0.05,
              pointerEvents: 'none',
            }}
          />
          {/* 环境光泄漏 2：透明度调至极度微妙的 4% */}
          <div
            style={{
              position: 'absolute',
              left: glow2X,
              top: glow2Y,
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: '#ffffff',
              filter: 'blur(100px)',
              opacity: intro * 0.04,
              pointerEvents: 'none',
            }}
          />

          {/* 工业十字准心及直角拐角对焦修饰点：作为透明背景下的视觉定位骨架 */}
          <CornerDecor position="top-left" />
          <CornerDecor position="top-right" />
          <CornerDecor position="bottom-left" />
          <CornerDecor position="bottom-right" />
          <CrossDecor top={14} right={36} />

          {/* 主体文字与场景渲染 */}
          <div style={{ position: 'relative', zIndex: 3 }}>
            <TitleBlock props={props} palette={palette} frame={frame} intro={intro} />
            {showCompare ? (
              <CompareBlock
                props={props}
                palette={palette}
                frame={frame}
                durationInFrames={rendererProps.durationInFrames}
              />
            ) : null}
            <ItemRail
              items={props.items ?? []}
              palette={palette}
              frame={frame}
              durationInFrames={rendererProps.durationInFrames}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
