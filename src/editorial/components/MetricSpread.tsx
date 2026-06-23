import {useCurrentFrame} from 'remotion';
import type {CSSProperties} from 'react';
import type {ComponentRendererProps} from '../registry/component.types';
import type {MetricSpreadProps, SourceManifest} from '../schema/episode.types';
import {editorialExitProgress, editorialProgress} from '../shared/motion';
import {visualTokens} from '../stage/visual-tokens';

type MetricSource = SourceManifest['sources'][number];

const getMetricSpreadProps = (props: ComponentRendererProps): MetricSpreadProps => {
  if (props.scene.content.kind !== 'MetricSpread') {
    throw new Error(`MetricSpread renderer received ${props.scene.content.kind}`);
  }
  return props.scene.content.props;
};

const accentFor = (accent: MetricSpreadProps['accent']): string =>
  accent === 'blue' ? visualTokens.color.electricBlue : visualTokens.color.signalOrange;

const sourceLabelFor = (props: MetricSpreadProps, source: MetricSource | undefined): string => {
  if (props.sourceLabel) {
    return `REF. / ${props.sourceLabel}`;
  }
  return `REF. / ${source?.publisher ?? props.sourceRefId}`;
};

type LayoutSpec = {
  wrapper: CSSProperties;
  accentBlock: CSSProperties;
  primary: CSSProperties;
  unit: CSSProperties;
  label: CSSProperties;
  rows: CSSProperties;
  source: CSSProperties;
  ratio: CSSProperties;
  align: 'left' | 'right';
  rowWidth: number;
};

const layoutFor = (placement: MetricSpreadProps['placement'], rowCount: number): LayoutSpec => {
  if (placement === 'screen-primary') {
    return {
      wrapper: {width: 1480, height: 640, left: 18, top: 10},
      accentBlock: {left: 54, top: 72, width: 24, height: 358},
      primary: {left: 112, top: 58, width: 590, height: 230},
      unit: {left: 124, top: 266, width: 350},
      label: {left: 120, top: 334, width: 520},
      rows: {left: 760, top: rowCount > 2 ? 116 : 154, width: 590},
      source: {left: 760, top: 430, width: 310},
      ratio: {left: 760, top: 388, width: 430},
      align: 'left',
      rowWidth: 590,
    };
  }

  if (placement === 'edge-left') {
    return {
      wrapper: {width: 560, height: 560, left: -16, top: 0},
      accentBlock: {left: 18, top: 42, width: 20, height: 330},
      primary: {left: 54, top: 24, width: 430, height: 168},
      unit: {left: 60, top: 180, width: 320},
      label: {left: 58, top: 224, width: 360},
      rows: {left: 54, top: 296, width: 430},
      source: {left: 54, top: 494, width: 260},
      ratio: {left: 54, top: 462, width: 330},
      align: 'left',
      rowWidth: 430,
    };
  }

  return {
    wrapper: {width: 520, height: 360, left: -24, top: -12},
    accentBlock: {left: 44, top: 42, width: 20, height: 168},
    primary: {left: 72, top: 26, width: 330, height: 132},
    unit: {left: 78, top: 146, width: 220},
    label: {left: 76, top: 184, width: 280},
    rows: {left: 74, top: 224, width: 360},
    source: {left: 74, top: 350, width: 230},
    ratio: {left: 74, top: 330, width: 260},
    align: 'left',
    rowWidth: 360,
  };
};

const trendMark = (direction: MetricSpreadProps['primary']['direction']): string => {
  if (direction === 'down') {
    return '↘';
  }
  if (direction === 'up') {
    return '↗';
  }
  return '';
};

const valueStyle = (isEmphasized: boolean, accent: string, fontSize: number): CSSProperties => ({
  fontFamily: visualTokens.fontFamily.mono,
  fontSize,
  lineHeight: 1,
  fontWeight: 900,
  color: isEmphasized ? visualTokens.color.inkBlack : visualTokens.color.graphite,
  background: isEmphasized ? `linear-gradient(to top, ${accent} 0 42%, transparent 42% 100%)` : 'transparent',
  padding: isEmphasized ? '0 3px 3px' : '0 3px',
});

export const MetricSpread = (rendererProps: ComponentRendererProps) => {
  const frame = useCurrentFrame();
  const props = getMetricSpreadProps(rendererProps);
  const source = rendererProps.sources.sources.find((candidate) => candidate.id === props.sourceRefId);
  const placement = props.placement;
  const accent = accentFor(props.accent);
  const layout = layoutFor(placement, props.rows.length);
  const direction = -1;
  const exit = editorialExitProgress(frame, rendererProps.durationInFrames, 14, 20, 0.18);
  const blockIntro = editorialProgress(frame, rendererProps.durationInFrames, {start: 0, end: 26});
  const numberIntro = editorialProgress(frame, rendererProps.durationInFrames, {start: 8, end: 36});
  const labelIntro = editorialProgress(frame, rendererProps.durationInFrames, {start: 18, end: 44});
  const rowIntro = editorialProgress(frame, rendererProps.durationInFrames, {start: 30, end: 58});
  const ratioIntro = editorialProgress(frame, rendererProps.durationInFrames, {start: 44, end: 68});
  const primaryLength = props.primary.value.length + (props.primary.unit?.length ?? 0);
  const primarySize = placement === 'screen-primary' ? (primaryLength > 6 ? 150 : 188) : primaryLength > 6 ? 86 : 122;
  const bodyShift = (1 - blockIntro) * direction * -72 + exit * direction * 92;
  const compactRows = placement !== 'screen-primary';
  const isScreenPrimary = placement === 'screen-primary';
  const kickerSize = isScreenPrimary ? 18 : 16;
  const unitSize = isScreenPrimary ? 30 : 21;
  const rowLabelSize = isScreenPrimary ? 28 : 24;
  const rowValueSize = isScreenPrimary ? 30 : 26;
  const arrowSize = isScreenPrimary ? 25 : 23;
  const noteSize = isScreenPrimary ? 19 : 17;
  const sourceSize = isScreenPrimary ? 16 : 15;
  const sourceHeight = isScreenPrimary ? 32 : 30;
  const rowPadding = compactRows ? '7px 0 8px' : '11px 0 12px';
  const rowColumnGap = 12;
  const rowBlockHeight = compactRows ? 42 : 56;
  const defaultNoteTop = Number(layout.rows.top ?? 0) + props.rows.length * rowBlockHeight + 8;
  const ratioTop = Number(layout.ratio.top ?? 0);
  const noteTop =
    props.showRatioBar && compactRows && ratioTop > 0 ? Math.max(defaultNoteTop - 18, ratioTop - noteSize - 8) : defaultNoteTop;

  return (
    <div
      style={{
        position: 'relative',
        ...layout.wrapper,
        boxSizing: 'border-box',
        color: visualTokens.color.inkBlack,
        fontFamily: visualTokens.fontFamily.body,
        opacity: 1 - exit * 0.74,
        transform: `translateX(${bodyShift}px) scale(${0.985 + blockIntro * 0.015})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          ...layout.accentBlock,
          background: accent,
          transform: `scaleX(${0.08 + blockIntro * 0.92})`,
          transformOrigin: layout.align === 'right' ? 'right center' : 'left center',
        }}
      />
      {props.kicker ? (
        <div
          style={{
            position: 'absolute',
            left: layout.align === 'right' ? undefined : Number(layout.primary.left ?? 0),
            right: layout.align === 'right' ? Number(layout.primary.right ?? 0) : undefined,
            top: Math.max(0, Number(layout.primary.top ?? 0) - 20),
            width: 280,
            fontFamily: visualTokens.fontFamily.mono,
            fontSize: kickerSize,
            fontWeight: 800,
            color: visualTokens.color.graphite,
            textAlign: layout.align,
            opacity: labelIntro * 0.8,
          }}
        >
          {props.kicker}
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          ...layout.primary,
          overflow: 'hidden',
          clipPath: `inset(0 ${layout.align === 'left' ? `${(1 - numberIntro) * 100}%` : 0} 0 ${
            layout.align === 'right' ? `${(1 - numberIntro) * 100}%` : 0
          })`,
          textAlign: layout.align,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontFamily: visualTokens.fontFamily.display,
            fontSize: primarySize,
            lineHeight: 0.86,
            fontWeight: 900,
            letterSpacing: 0,
            color: visualTokens.color.inkBlack,
            textShadow: `0.018em 0 0 ${visualTokens.color.inkBlack}`,
            transform: `scaleX(${0.9 + numberIntro * 0.07}) translateY(${(1 - numberIntro) * 16}px)`,
            transformOrigin: `${layout.align} top`,
          }}
        >
          {props.primary.value}
        </span>
        {trendMark(props.primary.direction) ? (
          <span
            style={{
              display: 'inline-block',
              marginLeft: 8,
              fontSize: primarySize * 0.28,
              fontWeight: 900,
              color: accent,
              verticalAlign: 'top',
              transform: `translateY(${primarySize * 0.08}px)`,
            }}
          >
            {trendMark(props.primary.direction)}
          </span>
        ) : null}
      </div>
      {props.primary.unit ? (
        <div
          style={{
            position: 'absolute',
            ...layout.unit,
            fontSize: unitSize,
            fontWeight: 800,
            color: visualTokens.color.graphite,
            textAlign: layout.align,
            opacity: labelIntro,
          }}
        >
          {props.primary.unit}
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          ...layout.label,
          fontSize: placement === 'screen-primary' ? 46 : 25,
          lineHeight: 1,
          fontWeight: 900,
          fontFamily: visualTokens.fontFamily.display,
          textAlign: layout.align,
          opacity: labelIntro,
          transform: `translateY(${(1 - labelIntro) * 8}px)`,
        }}
      >
        {props.primary.label}
      </div>
      <div style={{position: 'absolute', ...layout.rows}}>
        {props.rows.map((row, index) => {
          const stagger = Math.max(0, Math.min(1, rowIntro - index * 0.13));
          const hasBeforeAfter = row.before && row.after;
          return (
            <div
              key={`${row.label}-${index}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto',
                columnGap: rowColumnGap,
                alignItems: 'baseline',
                width: layout.rowWidth,
                padding: rowPadding,
                borderTop: index === 0 ? `1px solid ${visualTokens.color.graphite}` : `1px solid ${visualTokens.color.warmGray}`,
                opacity: stagger,
                transform: `translateX(${(1 - stagger) * direction * -28}px)`,
              }}
            >
              <div style={{fontSize: rowLabelSize, fontWeight: 800, color: visualTokens.color.inkBlack}}>{row.label}</div>
              <div
                style={{
                  ...valueStyle(row.emphasis === 'before', accent, rowValueSize),
                  opacity: row.before && !hasBeforeAfter ? 1 : 0.68,
                  textDecoration: row.before && row.after ? 'line-through' : 'none',
                }}
              >
                {row.before ?? '—'}
              </div>
              <div style={{fontSize: arrowSize, fontWeight: 900, color: visualTokens.color.graphite}}>→</div>
              <div style={valueStyle(row.emphasis === 'after' || row.emphasis === 'delta', accent, rowValueSize)}>
                {row.emphasis === 'delta' && row.delta ? row.delta : row.after ?? row.delta ?? '—'}
              </div>
            </div>
          );
        })}
      </div>
      {props.showRatioBar ? (
        <div
          style={{
            position: 'absolute',
            ...layout.ratio,
            height: 10,
            background: visualTokens.color.warmGray,
            opacity: ratioIntro,
          }}
        >
          <div
            style={{
              width: `${Math.round(34 + Math.min(4, props.rows.length) * 12)}%`,
              height: '100%',
              background: accent,
              transform: `scaleX(${ratioIntro})`,
              transformOrigin: layout.align === 'right' ? 'right center' : 'left center',
            }}
          />
        </div>
      ) : null}
      {props.note ? (
        <div
          style={{
            position: 'absolute',
            left: Number(layout.rows.left ?? layout.primary.left ?? 0),
            top: noteTop,
            width: layout.rowWidth,
            fontSize: noteSize,
            fontWeight: 700,
            color: visualTokens.color.graphite,
            opacity: ratioIntro * 0.8,
          }}
        >
          {props.note}
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          ...layout.source,
          height: sourceHeight,
          background: visualTokens.color.warmGray,
          borderLeft: `5px solid ${visualTokens.color.inkBlack}`,
          borderTop: `1px solid ${visualTokens.color.graphite}`,
          fontFamily: visualTokens.fontFamily.mono,
          fontSize: sourceSize,
          lineHeight: `${sourceHeight}px`,
          fontWeight: 800,
          padding: '0 10px',
          boxSizing: 'border-box',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          opacity: ratioIntro,
          transform: `translateY(${(1 - ratioIntro) * 8}px)`,
        }}
      >
        {sourceLabelFor(props, source)}
      </div>
    </div>
  );
};
