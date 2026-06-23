import {useCurrentFrame} from 'remotion';
import type {CSSProperties} from 'react';
import type {ComponentRendererProps} from '../registry/component.types';
import type {SectionStampProps} from '../schema/episode.types';
import {editorialExitProgress, editorialProgress} from '../shared/motion';
import {visualTokens} from '../stage/visual-tokens';
import {
  normalizeSectionStampVariant,
  splitSectionStampTitle,
} from './section-stamp-layout';

const getSectionStampProps = (props: ComponentRendererProps): SectionStampProps => {
  if (props.scene.content.kind !== 'SectionStamp') {
    throw new Error(`SectionStamp renderer received ${props.scene.content.kind}`);
  }
  return props.scene.content.props;
};

const renderLine = (
  line: string,
  props: SectionStampProps,
  accentColor: string,
  keyPrefix: string,
) => {
  const emphasis = props.emphasis;
  if (!emphasis || !line.includes(emphasis.text)) {
    return <span key={keyPrefix}>{line}</span>;
  }

  const [before, afterStart] = line.split(emphasis.text);
  const after = afterStart ?? '';
  const mode = emphasis.mode ?? 'highlight-block';
  const emphasisColor = emphasis.color === 'blue' ? visualTokens.color.electricBlue : accentColor;
  const emphasisStyle: CSSProperties = {
    display: 'inline-block',
    position: 'relative',
    color: visualTokens.color.inkBlack,
    fontWeight: 900,
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
  };

  if (mode === 'highlight-block') {
    emphasisStyle.background = emphasisColor;
    emphasisStyle.color = visualTokens.color.inkBlack;
    emphasisStyle.padding = '0 0.12em 0.07em';
    emphasisStyle.margin = '0 -0.015em';
  }
  if (mode === 'underline') {
    emphasisStyle.background = `linear-gradient(to top, ${emphasisColor} 0 26%, transparent 26% 100%)`;
    emphasisStyle.padding = '0 0.04em 0.03em';
  }
  if (mode === 'reverse') {
    emphasisStyle.background = visualTokens.color.graphite;
    emphasisStyle.color = visualTokens.color.paperWhite;
    emphasisStyle.padding = '0 0.13em 0.07em';
  }

  return (
    <span key={keyPrefix}>
      {before}
      <span style={emphasisStyle}>{emphasis.text}</span>
      {after}
    </span>
  );
};

type LayoutSpec = {
  wrapper: CSSProperties;
  block: CSSProperties;
  title: CSSProperties;
  number: CSSProperties;
  meta: CSSProperties;
  subline: CSSProperties;
  align: 'left' | 'right';
  entranceDirection: -1 | 1;
  titleSize: number;
};

const layoutFor = (isEdge: boolean, isRight: boolean): LayoutSpec => {
  if (isEdge && isRight) {
    return {
      wrapper: {width: 980, height: 510},
      block: {right: 0, top: 44, width: 74, height: 348},
      title: {right: 110, top: 86, width: 780, height: 300},
      number: {right: 74, top: 0, fontSize: 126},
      meta: {right: 110, top: 386, width: 620},
      subline: {right: 110, top: 416, width: 620},
      align: 'right',
      entranceDirection: 1,
      titleSize: 94,
    };
  }

  if (isEdge) {
    return {
      wrapper: {width: 980, height: 510},
      block: {left: 0, top: 44, width: 74, height: 348},
      title: {left: 98, top: 78, width: 760, height: 300},
      number: {left: 88, top: 0, fontSize: 126},
      meta: {left: 100, top: 386, width: 600},
      subline: {left: 100, top: 416, width: 600},
      align: 'left',
      entranceDirection: -1,
      titleSize: 112,
    };
  }

  if (isRight) {
    return {
      wrapper: {width: 520, height: 380},
      block: {right: 58, top: 28, width: 54, height: 212},
      title: {right: 130, top: 42, width: 370, height: 222},
      number: {right: 24, top: -8, fontSize: 92},
      meta: {right: 130, top: 282, width: 360},
      subline: {right: 130, top: 312, width: 360},
      align: 'right',
      entranceDirection: 1,
      titleSize: 82,
    };
  }

  return {
    wrapper: {width: 620, height: 390},
    block: {left: 0, top: 30, width: 64, height: 218},
    title: {left: 82, top: 42, width: 430, height: 230},
    number: {left: 84, top: -8, fontSize: 92},
    meta: {left: 84, top: 288, width: 430},
    subline: {left: 84, top: 318, width: 430},
    align: 'left',
    entranceDirection: -1,
    titleSize: 104,
  };
};

export const SectionStamp = (rendererProps: ComponentRendererProps) => {
  const frame = useCurrentFrame();
  const props = getSectionStampProps(rendererProps);
  const variant = normalizeSectionStampVariant(props.variant);
  const accent = props.accent ?? 'orange';
  const accentColor =
    accent === 'blue' ? visualTokens.color.electricBlue : visualTokens.color.signalOrange;
  const isRight = props.placement.endsWith('right');
  const isEdge = variant === 'edge-impact';
  const layout = layoutFor(isEdge, isRight);
  const exit = editorialExitProgress(frame, rendererProps.durationInFrames, 10, 18);
  const blockIntro = editorialProgress(frame, rendererProps.durationInFrames, {start: 0, end: 22});
  const titleIntro = editorialProgress(frame, rendererProps.durationInFrames, {start: 5, end: 30});
  const emphasisIntro = editorialProgress(frame, rendererProps.durationInFrames, {start: 12, end: 36});
  const metaIntro = editorialProgress(frame, rendererProps.durationInFrames, {start: 16, end: 40});
  const titleLines = splitSectionStampTitle(props.title, props.emphasis?.text);
  const clipFromEntry = (1 - titleIntro) * 100;
  const exitShift = layout.entranceDirection * exit * 82;

  const wrapperStyle: CSSProperties = {
    position: 'relative',
    ...layout.wrapper,
    marginLeft: isEdge && isRight ? -520 : 0,
    boxSizing: 'border-box',
    fontFamily: visualTokens.fontFamily.body,
    color: visualTokens.color.inkBlack,
    opacity: blockIntro * (1 - exit * 0.72),
    transform: `translateX(${(1 - blockIntro) * layout.entranceDirection * -38 + exitShift}px)`,
  };

  return (
    <div style={wrapperStyle}>
      <div
        style={{
          position: 'absolute',
          ...layout.number,
          lineHeight: 0.84,
          fontWeight: 900,
          color: visualTokens.color.warmGray,
          opacity: metaIntro * 0.46,
          letterSpacing: 0,
          fontFamily: visualTokens.fontFamily.display,
          transform: `translateX(${(1 - metaIntro) * layout.entranceDirection * -32}px)`,
        }}
      >
        {props.sectionNo}
      </div>

      <div
        style={{
          position: 'absolute',
          ...layout.block,
          background: accentColor,
          transform: `translateX(${(1 - blockIntro) * layout.entranceDirection * -108}px) scaleX(${
            0.1 + blockIntro * 0.9
          })`,
          transformOrigin: isRight ? 'right center' : 'left center',
        }}
      />

      <div
        style={{
          position: 'absolute',
          ...layout.title,
          overflow: 'hidden',
          clipPath: `inset(0 ${isRight ? 0 : `${clipFromEntry}%`} 0 ${isRight ? `${clipFromEntry}%` : 0})`,
          transform: `translateX(${(1 - titleIntro) * layout.entranceDirection * -22}px)`,
        }}
      >
        <div
          style={{
            fontSize: layout.titleSize,
            lineHeight: 0.86,
            fontWeight: 900,
            letterSpacing: 0,
            color: visualTokens.color.inkBlack,
            fontFamily: visualTokens.fontFamily.display,
            fontSynthesis: 'weight',
            textShadow: `0.018em 0 0 ${visualTokens.color.inkBlack}`,
            transform: 'scaleX(0.985) scaleY(1.018)',
            transformOrigin: isRight ? 'right top' : 'left top',
          }}
        >
          {titleLines.map((line, index) => (
            <div
              key={`${line}-${index}`}
              style={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'visible',
                textAlign: layout.align,
              }}
            >
              <span
                style={{
                  opacity: props.emphasis && line.includes(props.emphasis.text) ? emphasisIntro : 1,
                  transform: `translateY(${(1 - titleIntro) * 10}px)`,
                  display: 'inline-block',
                }}
              >
                {renderLine(line, props, accentColor, `${line}-${index}`)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          ...layout.meta,
          fontSize: 14,
          lineHeight: 1.1,
          fontWeight: 650,
          color: visualTokens.color.graphite,
          opacity: metaIntro * 0.72,
          textTransform: 'uppercase',
          letterSpacing: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: layout.align,
          transform: `translateX(${(1 - metaIntro) * layout.entranceDirection * -18}px)`,
        }}
      >
        {[props.brandLabel, props.kicker].filter(Boolean).join(' / ')}
      </div>

      {props.subline && props.subline.length <= 36 ? (
        <div
          style={{
            position: 'absolute',
            ...layout.subline,
            fontSize: 20,
            lineHeight: 1.18,
            fontWeight: 650,
            color: visualTokens.color.graphite,
            opacity: metaIntro * 0.62,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: layout.align,
            transform: `translateX(${(1 - metaIntro) * layout.entranceDirection * -18}px)`,
          }}
        >
          {props.subline}
        </div>
      ) : null}
    </div>
  );
};
