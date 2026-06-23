import type {CSSProperties} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import type {ComponentRendererProps} from '../registry/component.types';
import type {RemotionTalkEffectProps} from '../schema/episode.types';
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

const shellStyle = (intro: number, exit: number): CSSProperties => ({
  position: 'relative',
  width: 520,
  minHeight: 360,
  color: '#f8f8f2',
  fontFamily: visualTokens.fontFamily.body,
  opacity: intro * (1 - exit * 0.86),
  transform: `translateX(${(1 - intro) * -24 + exit * -38}px)`,
  textShadow: '0 2px 16px rgba(0,0,0,0.28)',
  pointerEvents: 'none',
});

const TitleBlock = ({props, accent, intro}: {props: RemotionTalkEffectProps; accent: string; intro: number}) => (
  <>
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        color: 'rgba(255,255,255,0.72)',
        fontSize: 14,
        lineHeight: 1,
        fontWeight: 900,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      <span style={{width: 8, height: 8, borderRadius: 99, background: accent, boxShadow: `0 0 12px ${accent}`}} />
      <span>{props.eyebrow}</span>
      {props.index ? <b style={{color: accent, letterSpacing: 0}}>{props.index}</b> : null}
    </div>
    <div
      style={{
        marginTop: 20,
        fontFamily: visualTokens.fontFamily.display,
        fontSize: props.title.length > 10 ? 58 : 66,
        lineHeight: 1.04,
        fontWeight: 900,
        letterSpacing: 0,
        color: '#fff',
        transform: `translateY(${(1 - intro) * 10}px)`,
      }}
    >
      {props.title}
    </div>
    {props.subtitle ? (
      <div
        style={{
          maxWidth: 430,
          marginTop: 16,
          color: 'rgba(255,255,255,0.72)',
          fontSize: 19,
          lineHeight: 1.46,
          fontWeight: 760,
        }}
      >
        {props.subtitle}
      </div>
    ) : null}
  </>
);

const ItemRail = ({items, accent, intro}: {items: string[]; accent: string; intro: number}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div style={{display: 'grid', gap: 9, marginTop: 24}}>
      {items.map((item, index) => {
        const itemIntro = progress(intro * 30, index * 3, index * 3 + 12);

        return (
          <div
            key={item}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: 'rgba(255,255,255,0.82)',
              fontSize: 18,
              lineHeight: 1.16,
              fontWeight: 820,
              opacity: itemIntro,
              transform: `translateX(${(1 - itemIntro) * -10}px)`,
            }}
          >
            <span style={{width: 18, height: 2, background: index === 0 ? accent : 'rgba(255,255,255,0.28)'}} />
            <span>{item}</span>
          </div>
        );
      })}
    </div>
  );
};

const CompareBlock = ({props, accent, intro}: {props: RemotionTalkEffectProps; accent: string; intro: number}) => (
  <div style={{marginTop: 28, display: 'grid', gap: 12, width: 430}}>
    {[props.left, props.right].map((label, index) => {
      if (!label) {
        return null;
      }
      const active = index === 1;

      return (
        <div
          key={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderLeft: `4px solid ${active ? accent : 'rgba(255,255,255,0.26)'}`,
            padding: '10px 0 10px 16px',
            color: active ? '#fff' : 'rgba(255,255,255,0.58)',
            fontFamily: visualTokens.fontFamily.display,
            fontSize: active ? 38 : 30,
            lineHeight: 1,
            fontWeight: 900,
            opacity: intro,
          }}
        >
          <span>{label}</span>
          {active && props.connector ? (
            <span style={{color: accent, fontSize: 16, fontFamily: visualTokens.fontFamily.body}}>{props.connector}</span>
          ) : null}
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
    <div style={shellStyle(intro, exit)}>
      <div
        style={{
          position: 'absolute',
          left: -26,
          top: 4,
          width: 2,
          height: 310,
          background: `linear-gradient(${accent}, rgba(255,255,255,0.08))`,
          opacity: 0.82,
          transform: `scaleY(${intro})`,
          transformOrigin: 'top center',
        }}
      />
      <TitleBlock props={props} accent={accent} intro={intro} />
      {showCompare ? <CompareBlock props={props} accent={accent} intro={intro} /> : null}
      <ItemRail items={props.items ?? []} accent={accent} intro={intro} />
    </div>
  );
};
