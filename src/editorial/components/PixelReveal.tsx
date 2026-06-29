import type {CSSProperties, ReactElement, ReactNode} from 'react';
import {useCurrentFrame} from 'remotion';
import type {ComponentRendererProps} from '../registry/component.types';
import type {PixelRevealProps} from '../schema/episode.types';
import {
  frameRangeProgress,
  orderedGridCells,
  type GridDirection,
} from '../shared/motion';
import {visualTokens} from '../stage/visual-tokens';

export type PixelRevealViewProps = {
  children: ReactNode;
  progress: number;
  columns?: number;
  rows?: number;
  direction?: GridDirection;
  cellGap?: number;
  pixelColor?: string;
  seed?: string;
  style?: CSSProperties;
};

export const pixelTakeoverTiming = {
  revealFrames: 24,
  holdFrames: 45,
  restoreFrames: 12,
} as const;

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export const pixelCellProgress = (
  cellIndex: number,
  cellCount: number,
  progress: number,
): number => {
  const safeCellCount = Math.max(1, Math.floor(cellCount));
  return clamp01(clamp01(progress) * safeCellCount - Math.max(0, cellIndex));
};

export const PixelRevealView = ({
  children,
  progress,
  columns = 12,
  rows = 7,
  direction = 'left-to-right',
  cellGap = 2,
  pixelColor = visualTokens.color.inkBlack,
  seed = 'pixel-reveal',
  style,
}: PixelRevealViewProps): ReactElement => {
  const safeColumns = Math.max(1, Math.floor(columns));
  const safeRows = Math.max(1, Math.floor(rows));
  const cells = orderedGridCells(safeColumns, safeRows, direction, seed);

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div style={{position: 'relative', width: '100%', height: '100%'}}>
        {children}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${safeColumns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${safeRows}, minmax(0, 1fr))`,
          gap: Math.max(0, cellGap),
          pointerEvents: 'none',
        }}
      >
        <i
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: pixelColor,
            opacity: 1 - clamp01(progress * cells.length),
          }}
        />
        {cells.map((cell, orderedIndex) => {
          const reveal = pixelCellProgress(
            orderedIndex,
            cells.length,
            progress,
          );
          return (
            <i
              key={`${cell.column}:${cell.row}`}
              style={{
                gridColumn: cell.column + 1,
                gridRow: cell.row + 1,
                width: '100%',
                height: '100%',
                backgroundColor: pixelColor,
                opacity: 1 - reveal,
                transform: `scale(${1 - reveal * 0.28})`,
                transformOrigin: 'center',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const getProps = (rendererProps: ComponentRendererProps): PixelRevealProps => {
  if (rendererProps.scene.content.kind !== 'PixelReveal') {
    throw new Error(`PixelReveal renderer received ${rendererProps.scene.content.kind}`);
  }
  return rendererProps.scene.content.props;
};

export const PixelReveal = (
  rendererProps: ComponentRendererProps,
): ReactElement => {
  const frame = useCurrentFrame();
  const props = getProps(rendererProps);
  const progress =
    props.progress ??
    frameRangeProgress(
      frame,
      props.startFrame,
      props.startFrame + props.durationInFrames,
    );

  return (
    <PixelRevealView
      progress={progress}
      columns={props.columns}
      rows={props.rows}
      direction={props.direction}
      cellGap={props.cellGap}
      pixelColor={props.pixelColor}
      seed={props.seed}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: `48px ${Math.round(rendererProps.width * 0.06)}px 190px`,
          border: '1px solid rgba(255,255,255,0.28)',
          backgroundColor: '#0b0e0d',
          color: '#ffffff',
          fontFamily: visualTokens.fontFamily.body,
          textShadow:
            '0 2px 16px rgba(0, 0, 0, 0.72), 0 1px 4px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div
          style={{
            color: '#c7ff3d',
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: '0.16em',
          }}
        >
          {props.eyebrow ?? 'SYNTHETIC DEMO DATA'}
        </div>
        <div style={{marginTop: 26, fontSize: 76, fontWeight: 850}}>
          {props.title}
        </div>
        {props.description ? (
          <div
            style={{
              marginTop: 18,
              maxWidth: 760,
              fontSize: 30,
              lineHeight: 1.45,
            }}
          >
            {props.description}
          </div>
        ) : null}
        <div style={{display: 'flex', gap: 18, marginTop: 34}}>
          {props.values.map((value) => (
            <div
              key={`${value.label}:${value.value}`}
              style={{
                minWidth: 220,
                padding: '22px 24px',
                border: '1px solid rgba(199,255,61,0.48)',
              }}
            >
              <div style={{fontSize: 16, letterSpacing: '0.08em'}}>
                {value.label}
              </div>
              <strong
                style={{
                  display: 'block',
                  marginTop: 8,
                  color: '#c7ff3d',
                  fontSize: 42,
                }}
              >
                {value.value}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </PixelRevealView>
  );
};
