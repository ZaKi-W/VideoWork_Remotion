import type {CSSProperties} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import type {ComponentRendererProps} from '../registry/component.types';
import type {RemotionTalkEffectProps} from '../schema/episode.types';
import {getStageLayout} from '../stage/stage.config';
import {visualTokens} from '../stage/visual-tokens';

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
      soft: 'rgba(255,255,255,0.94)',
      muted: 'rgba(222,245,255,0.76)',
    };
  }
  if (accentName === 'orange') {
    return {
      accent: '#ff9f43',
      title: '#ffb04f',
      soft: 'rgba(255,255,255,0.94)',
      muted: 'rgba(255,235,205,0.76)',
    };
  }
  return {
    accent: '#d9ff4c',
    title: '#d9ff4c',
    soft: 'rgba(255,255,255,0.94)',
    muted: 'rgba(239,255,202,0.76)',
  };
};

const progress = (frame: number, start: number, end: number): number =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.2, 0.86, 0.2, 1),
  });

const typewriterText = (text: string, frame: number, startFrame: number, charFrames: number) => {
  const chars = Array.from(text);
  const visibleCount = Math.max(0, Math.min(chars.length, Math.floor((frame - startFrame) / charFrames)));

  return {
    text: chars.slice(0, visibleCount).join(''),
    isTyping: visibleCount > 0 && visibleCount < chars.length,
    isDone: visibleCount >= chars.length,
  };
};

const shellStyle = (intro: number, exit: number): CSSProperties => ({
  position: 'relative',
  width: 700,
  minHeight: 500,
  color: '#f8f8f2',
  fontFamily: visualTokens.fontFamily.body,
  opacity: intro * (1 - exit * 0.86),
  transform: `translateX(${(1 - intro) * -24 + exit * -38}px)`,
  textShadow: '0 2px 14px rgba(0,0,0,0.36), 0 0 18px rgba(255,255,255,0.14)',
  pointerEvents: 'none',
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

const leftScrimStyle = (intro: number): CSSProperties => ({
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
  transform: `translateX(${(1 - intro) * -24}px) scaleX(${0.94 + intro * 0.06})`,
  transformOrigin: 'left center',
});

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
  const typedTitle = typewriterText(props.title, frame, 8, 2);
  const detailIn = progress(frame, 28, 46);
  const cursorVisible = typedTitle.isTyping || (!typedTitle.isDone && intro > 0.5);

  return (
    <>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 11,
          color: palette.soft,
          fontSize: 18,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          opacity: intro,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 99,
            background: palette.accent,
            boxShadow: `0 0 14px ${palette.accent}`,
          }}
        />
        <span>{props.eyebrow}</span>
        {props.index ? <b style={{color: palette.accent, letterSpacing: 0}}>{props.index}</b> : null}
      </div>
      <div
        style={{
          marginTop: 22,
          minHeight: '2.08em',
          fontFamily: visualTokens.fontFamily.display,
          fontSize: props.title.length > 10 ? 82 : 92,
          lineHeight: 1.04,
          fontWeight: 900,
          letterSpacing: 0,
          color: palette.title,
          textShadow: `0 2px 14px rgba(0,0,0,0.34), 0 0 10px ${palette.accent}40`,
          transform: `translateY(${(1 - intro) * 10}px)`,
        }}
      >
        {typedTitle.text}
        <span
          style={{
            display: 'inline-block',
            width: '0.08em',
            height: '0.84em',
            marginLeft: '0.08em',
            verticalAlign: '-0.06em',
            background: palette.accent,
            boxShadow: `0 0 12px ${palette.accent}`,
            opacity: cursorVisible ? (Math.floor(frame / 8) % 2 === 0 ? 1 : 0.22) : 0,
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
            lineHeight: 1.28,
            fontWeight: 900,
            opacity: detailIn,
            transform: `translateY(${(1 - detailIn) * 8}px)`,
          }}
        >
          {props.subtitle}
        </div>
      ) : null}
    </>
  );
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
  const cycleProgress = progress(frame, 58, 58 + cycleWindow);
  const activeIndex = Math.min(items.length - 1, Math.floor(cycleProgress * items.length));

  return (
    <div style={{display: 'grid', gap: 14, marginTop: 32}}>
      {items.map((item, index) => {
        const itemIntro = progress(frame, 42 + index * 4, 56 + index * 4);
        const isActive = index === activeIndex;
        const pulse = 0.5 + Math.sin((frame - index * 5) / 8) * 0.5;

        return (
          <div
            key={item}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              color: isActive ? palette.soft : palette.muted,
              fontSize: isActive ? 28 : 25,
              lineHeight: 1.16,
              fontWeight: 900,
              opacity: itemIntro * (isActive ? 1 : 0.68),
              transform: `translateX(${(1 - itemIntro) * -10 + (isActive ? 8 : 0)}px)`,
            }}
          >
            <span
              style={{
                width: isActive ? 42 : 24,
                height: 4,
                background: isActive ? palette.accent : 'rgba(255,255,255,0.72)',
                boxShadow: isActive ? `0 0 ${8 + pulse * 12}px ${palette.accent}` : 'none',
              }}
            />
            <span>{item}</span>
          </div>
        );
      })}
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
  const connectorPulse = 0.5 + Math.sin(frame / 9) * 0.5;
  const holdShift = progress(frame, 68, Math.max(69, durationInFrames - 18));

  return (
    <div style={{marginTop: 36, display: 'grid', gap: 12, width: 600}}>
      {[props.left, props.right].map((label, index) => {
        if (!label) {
          return null;
        }
        const active = index === 1;
        const itemIntro = progress(frame, 36 + index * 6, 52 + index * 6);

        return (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderLeft: `5px solid ${active ? palette.accent : 'rgba(255,255,255,0.86)'}`,
              padding: '14px 0 14px 20px',
              color: active ? palette.title : palette.soft,
              fontFamily: visualTokens.fontFamily.display,
              fontSize: active ? 62 : 52,
              lineHeight: 1,
              fontWeight: 900,
              opacity: itemIntro,
              transform: `translateX(${(1 - itemIntro) * -12 + (active ? holdShift * 10 : 0)}px)`,
              textShadow: active ? `0 0 ${10 + connectorPulse * 10}px ${palette.accent}55` : undefined,
            }}
          >
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
            gap: 12,
            marginLeft: 20 + holdShift * 18,
            color: palette.accent,
            fontSize: 19,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: connectorIntro,
            transform: `translateY(${(1 - connectorIntro) * -8}px)`,
          }}
        >
          <span style={{width: 40 + connectorPulse * 28, height: 3, background: palette.accent}} />
          <span>{props.connector}</span>
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

  return (
    <div style={canvasStyle(rendererProps)}>
      <div style={leftScrimStyle(intro)} />
      <div style={slotContentStyle(rendererProps)}>
        <div style={shellStyle(intro, exit)}>
          <div
            style={{
              position: 'absolute',
              left: -26,
              top: 4,
              width: 3,
              height: 430,
              background: palette.accent,
              opacity: 0.82,
              transform: `scaleY(${intro})`,
              transformOrigin: 'top center',
            }}
          />
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
  );
};
