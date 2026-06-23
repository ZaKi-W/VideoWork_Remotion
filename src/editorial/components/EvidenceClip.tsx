import {Img, staticFile, useCurrentFrame} from 'remotion';
import type {CSSProperties} from 'react';
import type {ComponentRendererProps} from '../registry/component.types';
import type {AssetManifest, EvidenceClipProps, SourceManifest} from '../schema/episode.types';
import {editorialExitProgress, editorialProgress} from '../shared/motion';
import {visualTokens} from '../stage/visual-tokens';

type EvidenceAsset = AssetManifest['assets'][number];
type EvidenceSource = SourceManifest['sources'][number];

const getEvidenceClipProps = (props: ComponentRendererProps): EvidenceClipProps => {
  if (props.scene.content.kind !== 'EvidenceClip') {
    throw new Error(`EvidenceClip renderer received ${props.scene.content.kind}`);
  }
  return props.scene.content.props;
};

const accentFor = (color: 'orange' | 'blue' | undefined): string =>
  color === 'blue' ? visualTokens.color.electricBlue : visualTokens.color.signalOrange;

const labelFor = (props: EvidenceClipProps, source: EvidenceSource | undefined): string => {
  const publisher = source?.publisher?.trim() || 'UNKNOWN SOURCE';
  return props.sourceLabel?.trim() || `REF. / ${publisher}`;
};

const directionFor = (placement: EvidenceClipProps['placement']): -1 | 1 => {
  if (placement.endsWith('right') || placement === 'screen-primary' || placement === 'full-bleed') {
    return 1;
  }
  return -1;
};

const objectPositionFor = (props: EvidenceClipProps): string => {
  const focalPoint = props.crop?.focalPoint ?? {x: 0.5, y: 0.5};
  return `${Math.round(focalPoint.x * 100)}% ${Math.round(focalPoint.y * 100)}%`;
};

const clippingLayout = (placement: EvidenceClipProps['placement']): {
  wrapper: CSSProperties;
  image: CSSProperties;
  headline: CSSProperties;
  strip: CSSProperties;
  annotationBias: number;
} => {
  if (placement === 'edge-left') {
    return {
      wrapper: {width: 520, height: 520, left: -24, top: 8},
      image: {left: 28, top: 78, width: 430, height: 300},
      headline: {left: 38, top: 20, width: 390},
      strip: {left: 0, top: 392, width: 260},
      annotationBias: 1,
    };
  }
  if (placement === 'edge-right') {
    return {
      wrapper: {width: 520, height: 520, right: -30, top: 8},
      image: {left: 56, top: 84, width: 430, height: 292},
      headline: {right: 44, top: 24, width: 390},
      strip: {right: 0, top: 390, width: 260},
      annotationBias: -1,
    };
  }
  if (placement === 'top-right') {
    return {
      wrapper: {width: 500, height: 330, right: -42, top: -10},
      image: {left: 108, top: 58, width: 350, height: 202},
      headline: {right: 50, top: 10, width: 330},
      strip: {right: 20, top: 266, width: 226},
      annotationBias: -1,
    };
  }
  return {
    wrapper: {width: 500, height: 330, left: -36, top: -10},
    image: {left: 38, top: 58, width: 350, height: 202},
    headline: {left: 46, top: 10, width: 330},
    strip: {left: 18, top: 266, width: 226},
    annotationBias: 1,
  };
};

const spotlightLayout = (placement: EvidenceClipProps['placement']): {
  wrapper: CSSProperties;
  image: CSSProperties;
  headline: CSSProperties;
  strip: CSSProperties;
} => {
  if (placement === 'full-bleed') {
    return {
      wrapper: {width: 1920, height: 1080, left: 0, top: 0},
      image: {left: 170, top: 128, width: 1410, height: 690},
      headline: {left: 188, top: 66, width: 920},
      strip: {left: 170, top: 842, width: 360},
    };
  }
  return {
    wrapper: {width: 1710, height: 712, left: 0, top: 0},
    image: {left: 40, top: 86, width: 1190, height: 512},
    headline: {left: 54, top: 24, width: 880},
    strip: {left: 40, top: 620, width: 340},
  };
};

const renderHighlight = (
  highlight: EvidenceClipProps['highlights'][number],
  imageStyle: CSSProperties,
  index: number,
  progress: number,
) => {
  const accent = accentFor(highlight.color);
  const left = Number(imageStyle.left ?? 0) + Number(imageStyle.width ?? 0) * highlight.x;
  const top = Number(imageStyle.top ?? 0) + Number(imageStyle.height ?? 0) * highlight.y;
  const width = Number(imageStyle.width ?? 0) * highlight.width;
  const height = Number(imageStyle.height ?? 0) * highlight.height;
  const base: CSSProperties = {
    position: 'absolute',
    left,
    top,
    width,
    height,
    opacity: progress,
    transformOrigin: 'left center',
  };

  if (highlight.kind === 'marker') {
    return (
      <div
        key={`highlight-${index}`}
        style={{
          ...base,
          background: `${accent}82`,
          mixBlendMode: 'multiply',
          transform: `scaleX(${0.08 + progress * 0.92}) rotate(-0.8deg)`,
        }}
      />
    );
  }

  if (highlight.kind === 'box') {
    return (
      <div
        key={`highlight-${index}`}
        style={{
          ...base,
          border: `5px solid ${accent}`,
          boxSizing: 'border-box',
          transform: `scale(${0.94 + progress * 0.06})`,
        }}
      />
    );
  }

  return (
    <div
      key={`highlight-${index}`}
      style={{
        ...base,
        top: top + height - 8,
        height: 8,
        background: accent,
        transform: `scaleX(${0.08 + progress * 0.92})`,
      }}
    />
  );
};

const renderAnnotation = (
  annotation: EvidenceClipProps['annotations'][number],
  imageStyle: CSSProperties,
  index: number,
  progress: number,
  bias: number,
) => {
  const imageLeft = Number(imageStyle.left ?? 0);
  const imageTop = Number(imageStyle.top ?? 0);
  const imageWidth = Number(imageStyle.width ?? 0);
  const imageHeight = Number(imageStyle.height ?? 0);
  const anchorX = imageLeft + imageWidth * annotation.x;
  const anchorY = imageTop + imageHeight * annotation.y;
  const horizontalShift = annotation.side === 'left' ? -168 : annotation.side === 'right' ? 18 : 20 * bias;
  const verticalShift = annotation.side === 'top' ? -52 : annotation.side === 'bottom' ? 18 : -18;

  return (
    <div
      key={`annotation-${index}`}
      style={{
        position: 'absolute',
        left: anchorX + horizontalShift,
        top: anchorY + verticalShift,
        width: 150,
        fontFamily: visualTokens.fontFamily.body,
        fontSize: 17,
        lineHeight: 1.22,
        fontWeight: 800,
        color: visualTokens.color.inkBlack,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 8}px)`,
      }}
    >
      <div
        style={{
          width: 28,
          height: 4,
          background: visualTokens.color.inkBlack,
          marginBottom: 7,
        }}
      />
      {annotation.text}
    </div>
  );
};

export const EvidenceClip = (rendererProps: ComponentRendererProps) => {
  const frame = useCurrentFrame();
  const props = getEvidenceClipProps(rendererProps);
  const asset = rendererProps.assets.assets.find((candidate) => candidate.id === props.assetId) as
    | EvidenceAsset
    | undefined;
  const source = rendererProps.sources.sources.find((candidate) => candidate.id === props.sourceRefId);
  const variant = props.variant ?? 'clipping';
  const isSpotlight = variant === 'spotlight';
  const direction = directionFor(props.placement);
  const exit = editorialExitProgress(frame, rendererProps.durationInFrames, 12, 18);
  const baseIntro = editorialProgress(frame, rendererProps.durationInFrames, {start: 0, end: 24});
  const imageIntro = editorialProgress(frame, rendererProps.durationInFrames, {start: 6, end: 32});
  const stripIntro = editorialProgress(frame, rendererProps.durationInFrames, {start: 14, end: 40});
  const markIntro = editorialProgress(frame, rendererProps.durationInFrames, {start: 20, end: 48});
  const layout = isSpotlight ? spotlightLayout(props.placement) : clippingLayout(props.placement);
  const assetPath = asset?.path ?? '';
  const label = labelFor(props, source);
  const fit = props.crop?.fit ?? (isSpotlight ? 'contain' : 'cover');
  const clipInset = (1 - imageIntro) * 100;
  const bodyShift = (1 - baseIntro) * direction * 82 - exit * direction * 108;
  const annotationBias = 'annotationBias' in layout && typeof layout.annotationBias === 'number' ? layout.annotationBias : 1;

  const wrapperStyle: CSSProperties = {
    position: 'relative',
    ...layout.wrapper,
    color: visualTokens.color.inkBlack,
    fontFamily: visualTokens.fontFamily.body,
    opacity: 1 - exit * 0.74,
    transform: `translateX(${bodyShift}px) rotate(${(1 - baseIntro) * direction * 0.9 - exit * direction * 0.7}deg)`,
  };

  const imageStyle: CSSProperties = {
    position: 'absolute',
    ...layout.image,
    background: visualTokens.color.paperWhite,
    border: `2px solid ${visualTokens.color.graphite}`,
    boxShadow: isSpotlight
      ? '18px 20px 0 rgba(21,21,21,0.08), 0 12px 28px rgba(21,21,21,0.12)'
      : '10px 12px 0 rgba(21,21,21,0.09), 0 8px 18px rgba(21,21,21,0.12)',
    overflow: 'hidden',
    clipPath: `inset(0 ${direction === -1 ? `${clipInset}%` : 0} 0 ${
      direction === 1 ? `${clipInset}%` : 0
    })`,
  };

  const headline = props.headline ? (
    <div
      style={{
        position: 'absolute',
        ...layout.headline,
        fontSize: isSpotlight ? 34 : 20,
        lineHeight: 1.12,
        fontWeight: 900,
        letterSpacing: 0,
        fontFamily: visualTokens.fontFamily.display,
        opacity: imageIntro,
        transform: `translateY(${(1 - imageIntro) * 8}px)`,
      }}
    >
      {props.headline}
    </div>
  ) : null;

  return (
    <div style={wrapperStyle}>
      <div
        style={{
          position: 'absolute',
          ...layout.image,
          left: Number(layout.image.left ?? 0) + direction * -14,
          top: Number(layout.image.top ?? 0) + 14,
          background: visualTokens.color.warmGray,
          opacity: baseIntro * 0.9,
          transform: `scaleX(${0.18 + baseIntro * 0.82})`,
          transformOrigin: direction === 1 ? 'right center' : 'left center',
        }}
      />
      {headline}
      <div style={imageStyle}>
        {assetPath ? (
          <Img
            src={staticFile(assetPath)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: fit,
              objectPosition: objectPositionFor(props),
              display: 'block',
              filter: 'saturate(0.94) contrast(1.02)',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: visualTokens.color.graphite,
            }}
          >
            Missing evidence asset
          </div>
        )}
      </div>
      {props.highlights.map((highlight, index) =>
        renderHighlight(highlight, layout.image, index, Math.max(0, markIntro - index * 0.12)),
      )}
      {props.annotations.map((annotation, index) =>
        renderAnnotation(
          annotation,
          layout.image,
          index,
          Math.max(0, markIntro - props.highlights.length * 0.08 - index * 0.14),
          annotationBias,
        ),
      )}
      <div
        style={{
          position: 'absolute',
          ...layout.strip,
          height: isSpotlight ? 32 : 24,
          background: visualTokens.color.warmGray,
          color: visualTokens.color.inkBlack,
          borderLeft: `5px solid ${visualTokens.color.inkBlack}`,
          borderTop: `1px solid ${visualTokens.color.graphite}`,
          fontFamily: visualTokens.fontFamily.mono,
          fontSize: isSpotlight ? 16 : 12,
          lineHeight: isSpotlight ? '32px' : '24px',
          fontWeight: 800,
          letterSpacing: 0,
          padding: '0 11px',
          boxSizing: 'border-box',
          opacity: stripIntro,
          transform: `translateX(${(1 - stripIntro) * direction * -18}px)`,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {props.showReferenceStrip === false ? `REF. / ${props.sourceRefId}` : label}
      </div>
    </div>
  );
};
