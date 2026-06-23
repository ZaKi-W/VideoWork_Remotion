import type {CSSProperties, ReactNode} from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import type {AcidComponentProps, AssetManifest, SourceManifest} from '../schema/episode.types';
import {editorialExitProgress, editorialProgress, revealInset, staggerProgress} from '../shared/motion';
import {visualTokens} from '../stage/visual-tokens';

export type ScrimIntensity = 'none' | 'soft' | 'medium';

export const acidTokens = {
  color: {
    acid: visualTokens.color.acid,
    acidDim: 'rgba(217,255,76,0.72)',
    acidLine: 'rgba(217,255,76,0.34)',
    black: '#0B0D0A',
    black2: '#11150F',
    panel: 'rgba(7,9,6,0.32)',
    panelStrong: 'rgba(7,9,6,0.42)',
    paper: '#F7F7EE',
    paper2: '#E7EAD8',
    text: '#F9FAEF',
    muted: 'rgba(249,250,239,0.68)',
    weak: 'rgba(249,250,239,0.42)',
    line: 'rgba(255,255,255,0.15)',
    wall: '#F2F0EA',
    wall2: '#DEDCD5',
  },
  font: visualTokens.fontFamily,
  layout: {
    left: {left: '4.4%', top: '15.8%', width: '30.5%'},
    source: {top: '11.7%', right: '3.7%', width: '31.2%'},
    subtitle: {bottom: '2.55%', maxWidth: '67%', minWidth: '39%'},
  },
} as const;

export const leftInfoTextShadow =
  '0 2px 10px rgba(0,0,0,0.24), 0 1px 2px rgba(0,0,0,0.28)';

const leftScrimStyles: Record<ScrimIntensity, CSSProperties | null> = {
  none: null,
  soft: {
    background:
      'radial-gradient(ellipse at 18% 48%, rgba(7,9,6,0.30) 0%, rgba(7,9,6,0.17) 42%, rgba(7,9,6,0) 76%), linear-gradient(90deg, rgba(7,9,6,0.20) 0%, rgba(7,9,6,0.10) 42%, rgba(7,9,6,0) 76%)',
  },
  medium: {
    background:
      'radial-gradient(ellipse at 18% 48%, rgba(7,9,6,0.42) 0%, rgba(7,9,6,0.24) 42%, rgba(7,9,6,0) 76%), linear-gradient(90deg, rgba(7,9,6,0.28) 0%, rgba(7,9,6,0.14) 42%, rgba(7,9,6,0) 76%)',
  },
};

export const acidLeftTextStyle: CSSProperties = {
  textShadow: leftInfoTextShadow,
};

export type AcidRenderProps = {
  kind: string;
  props: AcidComponentProps;
  assets: AssetManifest;
  sources: SourceManifest;
};

export const AcidStage = ({
  children,
  subtitle,
  subtitleEn,
  frame,
  durationInFrames,
  scrimIntensity = 'soft',
  backgroundVideoPath,
}: {
  children: ReactNode;
  subtitle: string;
  subtitleEn?: string;
  frame: number;
  durationInFrames: number;
  scrimIntensity?: ScrimIntensity;
  backgroundVideoPath?: string;
}) => {
  const intro = editorialProgress(frame, durationInFrames, {start: 0, end: 26});
  const exit = editorialExitProgress(frame, durationInFrames, 12, 18);
  const subtitleIntro = editorialProgress(frame, durationInFrames, {start: 14, end: 36});
  const scrimStyle = leftScrimStyles[scrimIntensity];

  return (
    <div
    style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      isolation: 'isolate',
      background:
        'radial-gradient(circle at 50% 18%, rgba(255,255,255,0.96), transparent 31%), linear-gradient(113deg, #dedbd5 0%, #f7f5ef 49%, #e2dfd8 100%)',
      color: acidTokens.color.text,
      fontFamily: acidTokens.font.body,
    }}
  >
    {backgroundVideoPath ? (
      <OffthreadVideo
        src={staticFile(backgroundVideoPath)}
        muted
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    ) : null}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        background:
          backgroundVideoPath
            ? 'radial-gradient(ellipse at 50% 102%, rgba(16,18,24,0.18), transparent 46%), linear-gradient(90deg, rgba(0,0,0,0.12), transparent 18%, transparent 78%, rgba(0,0,0,0.11))'
            : 'radial-gradient(ellipse at 50% 102%, rgba(16,18,24,0.25), transparent 46%), linear-gradient(90deg, rgba(0,0,0,0.07), transparent 15%, transparent 81%, rgba(0,0,0,0.06))',
        transform: `scale(${1.035 - intro * 0.035 + exit * 0.018})`,
      }}
    />
    {scrimStyle ? (
      <div
        style={{
          position: 'absolute',
          zIndex: 1,
          left: 0,
          top: '7.5%',
          width: '46%',
          height: '78%',
          ...scrimStyle,
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 82%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 82%, transparent 100%)',
          transform: `translateX(${(1 - intro) * -24}px) scaleX(${0.94 + intro * 0.06})`,
          transformOrigin: 'left center',
        }}
      />
    ) : null}
    <div
      style={{
        position: 'absolute',
        zIndex: 1,
        right: 0,
        top: 0,
        bottom: 0,
        width: '25%',
        background: 'linear-gradient(90deg, transparent, rgba(10,12,9,0.03) 30%, rgba(10,12,9,0.15) 100%)',
        transform: `translateX(${(1 - intro) * 34}px)`,
      }}
    />
    {backgroundVideoPath ? null : <Presenter />}
    <div style={{position: 'absolute', inset: 0, zIndex: 10}}>{children}</div>
    <Subtitle text={subtitle} en={subtitleEn} progress={subtitleIntro} exit={exit} />
  </div>
  );
};

const Presenter = () => (
  <div
    style={{
      position: 'absolute',
      zIndex: 12,
      left: '50%',
      bottom: '5.4%',
      width: '30%',
      height: '80%',
      transform: 'translateX(-50%)',
      pointerEvents: 'none',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: '-3%',
        width: '113%',
        height: '14%',
        transform: 'translateX(-50%)',
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.37), transparent 70%)',
        filter: 'blur(8px)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: '2%',
        left: '50%',
        width: '28%',
        aspectRatio: '1',
        transform: 'translateX(-50%)',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 34% 27%, rgba(255,255,255,0.40), transparent 20%), linear-gradient(145deg, #d2a28e, #6c4b54 77%)',
        boxShadow: 'inset -10px -8px 0 rgba(0,0,0,0.13)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 0,
        width: '92%',
        height: '75%',
        transform: 'translateX(-50%)',
        borderRadius: '47% 47% 11% 11% / 22% 22% 7% 7%',
        background: 'linear-gradient(135deg, #2a354c, #171c28 74%)',
        boxShadow: 'inset 13px 0 0 rgba(255,255,255,0.045), inset -13px 0 0 rgba(0,0,0,0.15)',
      }}
    />
  </div>
);

export const TopicLine = ({topic, detail}: {topic?: string; detail?: string}) => (
  <div
    style={{
      position: 'absolute',
      zIndex: 18,
      top: '4.6%',
      left: '4.2%',
      ...acidLeftTextStyle,
      color: acidTokens.color.acid,
      fontSize: 11,
      lineHeight: 1,
      fontWeight: 900,
      letterSpacing: '0.075em',
      textTransform: 'uppercase',
    }}
  >
    {topic}
    {detail ? <span style={{marginLeft: 11, color: acidTokens.color.weak, fontSize: 9, letterSpacing: '0.025em'}}>{detail}</span> : null}
  </div>
);

export const LeftPanel = ({children}: {children: ReactNode}) => (
  <div style={{position: 'absolute', zIndex: 18, ...acidTokens.layout.left, ...acidLeftTextStyle}}>{children}</div>
);

export const Eyebrow = ({children}: {children?: ReactNode}) =>
  children ? (
    <div
      style={{
        color: acidTokens.color.acid,
        fontSize: 11,
        lineHeight: 1,
        fontWeight: 900,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </div>
  ) : null;

export const DisplayTitle = ({lines}: {lines: string[]}) => (
  <h1
    style={{
      margin: '11px 0 0',
      color: acidTokens.color.text,
      fontFamily: acidTokens.font.display,
      fontSize: 71,
      lineHeight: 0.98,
      fontWeight: 900,
      letterSpacing: '-0.028em',
    }}
  >
    {lines.map((line) => (
      <span key={line} style={{display: 'block'}}>
        {line}
      </span>
    ))}
  </h1>
);

export const Copy = ({children}: {children?: ReactNode}) =>
  children ? (
    <div style={{marginTop: 15, maxWidth: '92%', color: acidTokens.color.muted, fontSize: 24, lineHeight: 1.55, fontWeight: 800}}>
      {children}
    </div>
  ) : null;

export const StatStack = ({items, progress = 1}: {items: AcidComponentProps['items']; progress?: number}) => (
  <div style={{display: 'grid', gap: 10, marginTop: 20}}>
    {items.map((item, index) => {
      const intro = staggerProgress(progress, index, 0.12);
      return (
      <div
        key={`${item.label}-${item.value}`}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          gap: 9,
          padding: '11px 12px',
          background: 'rgba(255,255,255,0.06)',
          borderLeft: `5px solid ${acidTokens.color.acid}`,
          opacity: intro,
          transform: `translateX(${(1 - intro) * -22}px)`,
          clipPath: revealInset(intro, -1),
        }}
      >
        <b style={{color: acidTokens.color.text, fontSize: 24, lineHeight: 1.25, fontWeight: 900}}>{item.label}</b>
        <strong style={{color: acidTokens.color.acid, fontFamily: acidTokens.font.display, fontSize: 32, lineHeight: 1, fontWeight: 900}}>
          {item.value}
        </strong>
      </div>
      );
    })}
  </div>
);

export const Bars = ({items, progress = 1}: {items: AcidComponentProps['items']; progress?: number}) => (
  <div style={{display: 'grid', gap: 9, marginTop: 18}}>
    {items.map((item, index) => {
      const intro = staggerProgress(progress, index, 0.12);
      return (
      <div
        key={`${item.label}-bar`}
        style={{
          display: 'grid',
          gridTemplateColumns: '92px 1fr auto',
          gap: 12,
          alignItems: 'center',
          color: acidTokens.color.text,
          fontSize: 18,
          fontWeight: 800,
          opacity: intro,
          transform: `translateX(${(1 - intro) * -18}px)`,
        }}
      >
        <span>{item.label}</span>
        <i style={{height: 13, background: 'rgba(255,255,255,0.16)'}}>
          <span style={{display: 'block', height: '100%', width: `${item.percent ?? 50}%`, background: acidTokens.color.acid, transform: `scaleX(${intro})`, transformOrigin: 'left center'}} />
        </i>
        <b style={{color: acidTokens.color.acid}}>{item.value}</b>
      </div>
      );
    })}
  </div>
);

export const SourceCard = ({source, assets, sources, frame, durationInFrames}: {
  source?: AcidComponentProps['source'];
  assets: AssetManifest;
  sources: SourceManifest;
  frame: number;
  durationInFrames: number;
}) => {
  if (!source) {
    return null;
  }
  const intro = editorialProgress(frame, durationInFrames, {start: 8, end: 34});
  const bodyIntro = editorialProgress(frame, durationInFrames, {start: 16, end: 42});
  const exit = editorialExitProgress(frame, durationInFrames, 12, 18);
  const asset = source.assetId ? assets.assets.find((candidate) => candidate.id === source.assetId) : undefined;
  const sourceRecord = source.sourceRefId ? sources.sources.find((candidate) => candidate.id === source.sourceRefId) : undefined;
  const imagePath = asset?.path ? staticFile(asset.path) : null;

  return (
    <article
      style={{
        position: 'absolute',
        zIndex: 20,
        ...acidTokens.layout.source,
        color: '#15181E',
        opacity: intro * (1 - exit * 0.78),
        transform: `translateX(${(1 - intro) * 92 + exit * 110}px) rotate(${1.8 - intro * 1.48 + exit * 1.2}deg)`,
        transformOrigin: 'right center',
      }}
    >
      <div
        style={{
          padding: 9,
          background: acidTokens.color.black,
          border: `2px solid ${acidTokens.color.acid}`,
          boxShadow: '10px 12px 0 rgba(0,0,0,0.18), 0 18px 34px rgba(0,0,0,0.19)',
        }}
      >
        <SourceBar left={source.label ?? sourceRecord?.publisher ?? 'Reference'} right={source.code ?? 'REF'} />
        <div
          style={{
            minHeight: 496,
            padding: 20,
            background: `linear-gradient(145deg, ${acidTokens.color.paper}, ${acidTokens.color.paper2})`,
            overflow: 'hidden',
          }}
        >
          {imagePath ? (
            <Img src={imagePath} style={{width: '100%', height: 304, objectFit: 'contain', background: '#fff', border: '1px solid rgba(21,24,30,0.14)', opacity: bodyIntro, transform: `translateY(${(1 - bodyIntro) * 12}px) scale(${0.98 + bodyIntro * 0.02})`}} />
          ) : null}
          <div
            style={{
              paddingBottom: 11,
              borderBottom: '1px solid rgba(21,24,30,0.14)',
              color: 'rgba(21,24,30,0.53)',
              fontSize: 15,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              marginTop: imagePath ? 16 : 0,
              opacity: bodyIntro,
              clipPath: revealInset(bodyIntro, -1),
            }}
          >
            {source.meta ?? sourceRecord?.title ?? 'Captured source'}
          </div>
          <div style={{margin: '16px 0 13px', fontFamily: acidTokens.font.display, fontSize: 31, lineHeight: 1.22, fontWeight: 900, opacity: bodyIntro, transform: `translateY(${(1 - bodyIntro) * 10}px)`, clipPath: revealInset(bodyIntro, -1)}}>
            {source.title ?? sourceRecord?.title ?? '真实来源截图区域'}
          </div>
          <SourceLines progress={bodyIntro} />
          {source.highlight ? (
            <div
              style={{
                margin: '14px 0',
                padding: '9px 10px',
                color: '#101317',
                fontSize: 20,
                lineHeight: 1.55,
                fontWeight: 800,
                background: 'rgba(217,255,76,0.55)',
                borderLeft: `3px solid ${acidTokens.color.acid}`,
                opacity: bodyIntro,
                transform: `translateX(${(1 - bodyIntro) * -16}px)`,
              }}
            >
              {source.highlight}
            </div>
          ) : null}
          <SourceLines short progress={bodyIntro} />
        </div>
        <SourceBar left="Reference linked" right={source.footer ?? sourceRecord?.publisher ?? 'Source'} />
      </div>
    </article>
  );
};

const SourceBar = ({left, right}: {left: string; right: string}) => (
  <div
    style={{
      height: 27,
      padding: '0 10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: 'rgba(249,250,239,0.60)',
      fontSize: 15,
      lineHeight: 1,
      fontWeight: 900,
      letterSpacing: '0.075em',
      textTransform: 'uppercase',
    }}
  >
    <span>{left}</span>
    <b style={{color: acidTokens.color.acid}}>{right}</b>
  </div>
);

const SourceLines = ({short = false, progress = 1}: {short?: boolean; progress?: number}) => (
  <div style={{display: 'grid', gap: 9, marginTop: 16}}>
    {Array.from({length: short ? 2 : 3}, (_, index) => {
      const intro = staggerProgress(progress, index, 0.12);
      return (
      <i
        key={`line-${index}`}
        style={{
          display: 'block',
          height: 8,
          borderRadius: 3,
          background: '#C7CCD6',
          width: index === 1 ? '82%' : index === 2 ? '63%' : '100%',
          transform: `scaleX(${intro})`,
          transformOrigin: 'left center',
          opacity: intro,
        }}
      />
      );
    })}
  </div>
);

const Subtitle = ({text, en, progress, exit}: {text: string; en?: string; progress: number; exit: number}) => (
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
      opacity: progress * (1 - exit * 0.82),
      transform: `translate(-50%, ${(1 - progress) * 18 + exit * 16}px)`,
    }}
  >
    {text}
    {en ? <small style={{display: 'block', marginTop: 6, color: 'rgba(255,255,255,0.62)', fontSize: 15, lineHeight: 1.32, fontWeight: 600}}>{en}</small> : null}
  </div>
);

export const rowStyle: CSSProperties = {
  padding: '11px 12px',
  background: 'rgba(255,255,255,0.06)',
  color: acidTokens.color.text,
  fontSize: 22,
  lineHeight: 1.2,
  fontWeight: 800,
};
