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

const colorFor = (accent: RemotionTalkEffectProps['accent']): string => {
  if (accent === 'cyan') {
    return '#63e7ff';
  }
  if (accent === 'orange') {
    return '#ff9f43';
  }
  return '#d9ff4c';
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
  width: 610,
  minHeight: 430,
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
  accent,
  frame,
  intro,
}: {
  props: RemotionTalkEffectProps;
  accent: string;
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
          color: 'rgba(255,255,255,0.94)',
          fontSize: 16,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          opacity: intro,
        }}
      >
        <span style={{width: 9, height: 9, borderRadius: 99, background: accent, boxShadow: `0 0 14px ${accent}`}} />
        <span>{props.eyebrow}</span>
        {props.index ? <b style={{color: accent, letterSpacing: 0}}>{props.index}</b> : null}
      </div>
      <div
        style={{
          marginTop: 22,
          minHeight: '2.08em',
          fontFamily: visualTokens.fontFamily.display,
          fontSize: props.title.length > 10 ? 72 : 82,
          lineHeight: 1.04,
          fontWeight: 900,
          letterSpacing: 0,
          color: '#fff',
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
            background: accent,
            boxShadow: `0 0 12px ${accent}`,
            opacity: cursorVisible ? (Math.floor(frame / 8) % 2 === 0 ? 1 : 0.22) : 0,
          }}
        />
      </div>
      {props.subtitle ? (
        <div
          style={{
            maxWidth: 520,
            marginTop: 18,
            color: 'rgba(255,255,255,0.94)',
            fontSize: 24,
            lineHeight: 1.36,
            fontWeight: 880,
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

const ItemRail = ({items, accent, frame}: {items: string[]; accent: string; frame: number}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div style={{display: 'grid', gap: 12, marginTop: 28}}>
      {items.map((item, index) => {
        const itemIntro = progress(frame, 42 + index * 4, 56 + index * 4);

        return (
          <div
            key={item}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: 'rgba(255,255,255,0.94)',
              fontSize: 22,
              lineHeight: 1.16,
              fontWeight: 900,
              opacity: itemIntro,
              transform: `translateX(${(1 - itemIntro) * -10}px)`,
            }}
          >
            <span style={{width: 22, height: 3, background: index === 0 ? accent : '#fff'}} />
            <span>{item}</span>
          </div>
        );
      })}
    </div>
  );
};

const CompareBlock = ({props, accent, frame}: {props: RemotionTalkEffectProps; accent: string; frame: number}) => (
  <div style={{marginTop: 32, display: 'grid', gap: 14, width: 520}}>
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
            borderLeft: `5px solid ${active ? accent : '#fff'}`,
            padding: '12px 0 12px 18px',
            color: '#fff',
            fontFamily: visualTokens.fontFamily.display,
            fontSize: active ? 50 : 42,
            lineHeight: 1,
            fontWeight: 900,
            opacity: itemIntro,
            transform: `translateX(${(1 - itemIntro) * -12}px)`,
          }}
        >
          <span>{label}</span>
        </div>
      );
    })}
  </div>
);

export const RemotionTalkEffect = (rendererProps: ComponentRendererProps) => {
  const frame = useCurrentFrame();
  const props = getProps(rendererProps);
  const accent = colorFor(props.accent ?? 'lime');
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
              height: 370,
              background: `linear-gradient(${accent}, rgba(255,255,255,0.08))`,
              opacity: 0.82,
              transform: `scaleY(${intro})`,
              transformOrigin: 'top center',
            }}
          />
          <TitleBlock props={props} accent={accent} frame={frame} intro={intro} />
          {showCompare ? <CompareBlock props={props} accent={accent} frame={frame} /> : null}
          <ItemRail items={props.items ?? []} accent={accent} frame={frame} />
        </div>
      </div>
    </div>
  );
};
