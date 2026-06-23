import type {CSSProperties, ReactElement} from 'react';
import {useCurrentFrame} from 'remotion';
import type {ComponentRendererProps} from '../registry/component.types';
import type {ConceptSplitProps} from '../schema/episode.types';
import {editorialExitProgress, editorialProgress} from '../shared/motion';
import {getStageLayout} from '../stage/stage.config';
import {visualTokens} from '../stage/visual-tokens';

type Side = 'left' | 'right';

type TextBlockSpec = {
  x: number;
  y: number;
  width: number;
  align: 'left' | 'right';
  titleSize: number;
  quiet: boolean;
};

type LayoutSpec = {
  canvasWidth: number;
  canvasHeight: number;
  offsetX: number;
  offsetY: number;
  oldBlock: TextBlockSpec;
  newBlock: TextBlockSpec;
  cut: CSSProperties;
  bridge: CSSProperties;
  foldPanel?: CSSProperties;
};

const getConceptSplitProps = (props: ComponentRendererProps): ConceptSplitProps => {
  if (props.scene.content.kind !== 'ConceptSplit') {
    throw new Error(`ConceptSplit renderer received ${props.scene.content.kind}`);
  }
  return props.scene.content.props;
};

const accentFor = (accent: ConceptSplitProps['accent']): string =>
  accent === 'blue' ? visualTokens.color.electricBlue : visualTokens.color.signalOrange;

const bridgeStyleFor = (
  relationship: ConceptSplitProps['relationship'],
  style: ConceptSplitProps['bridge'] extends undefined ? never : NonNullable<ConceptSplitProps['bridge']>['style'],
): 'arrow' | 'vs' | 'not-but' | 'cut' => {
  if (style) {
    return style;
  }
  if (relationship === 'versus') {
    return 'vs';
  }
  if (relationship === 'not-but') {
    return 'not-but';
  }
  return 'arrow';
};

const bridgeLabelFor = (props: ConceptSplitProps): string => {
  if (props.bridge?.label) {
    return props.bridge.label;
  }
  const style = bridgeStyleFor(props.relationship, props.bridge?.style);
  if (style === 'vs') {
    return 'VS';
  }
  if (style === 'not-but') {
    return '不是 / 而是';
  }
  return '→';
};

const isRightSlot = (slot: ComponentRendererProps['scene']['slot']): boolean =>
  slot === 'top-right' || slot === 'edge-right';

const layoutForCrossCut = (
  rendererProps: ComponentRendererProps,
  emphasize: Side,
): LayoutSpec => {
  const layout = getStageLayout(rendererProps.width, rendererProps.height);
  const slot = layout.slots[rendererProps.scene.slot];
  const rightRail = isRightSlot(rendererProps.scene.slot);
  const railX = rightRail ? rendererProps.width * 0.71 : rendererProps.width * 0.07;
  const railWidth = rendererProps.width * 0.22;
  const align = rightRail ? 'left' : 'left';
  const oldQuiet = emphasize !== 'left';
  const newQuiet = emphasize !== 'right';

  return {
    canvasWidth: rendererProps.width,
    canvasHeight: rendererProps.height,
    offsetX: -slot.x,
    offsetY: -slot.y,
    oldBlock: {
      x: railX,
      y: rendererProps.height * 0.17,
      width: railWidth,
      align,
      titleSize: oldQuiet ? 76 : 96,
      quiet: oldQuiet,
    },
    newBlock: {
      x: railX + (rightRail ? 34 : 0),
      y: rendererProps.height * 0.49,
      width: railWidth * 1.12,
      align,
      titleSize: newQuiet ? 82 : 124,
      quiet: newQuiet,
    },
    cut: {
      left: railX - (rightRail ? 46 : 34),
      top: rendererProps.height * 0.35,
      width: 18,
      height: rendererProps.height * 0.31,
      transform: `rotate(${rightRail ? -9 : 9}deg)`,
    },
    bridge: {
      left: railX,
      top: rendererProps.height * 0.39,
    },
  };
};

const layoutForFold = (
  rendererProps: ComponentRendererProps,
  emphasize: Side,
): LayoutSpec => {
  const layout = getStageLayout(rendererProps.width, rendererProps.height);
  const slot = layout.slots[rendererProps.scene.slot];
  const width = slot.width;
  const height = slot.height;

  return {
    canvasWidth: width,
    canvasHeight: height,
    offsetX: 0,
    offsetY: 0,
    oldBlock: {
      x: width * 0.1,
      y: height * 0.24,
      width: width * 0.32,
      align: 'left',
      titleSize: emphasize === 'left' ? 104 : 80,
      quiet: emphasize !== 'left',
    },
    newBlock: {
      x: width * 0.56,
      y: height * 0.31,
      width: width * 0.35,
      align: 'left',
      titleSize: emphasize === 'right' ? 128 : 92,
      quiet: emphasize !== 'right',
    },
    cut: {
      left: width * 0.48,
      top: height * 0.12,
      width: 26,
      height: height * 0.68,
      transform: 'rotate(8deg)',
    },
    bridge: {
      left: width * 0.44,
      top: height * 0.48,
    },
    foldPanel: {
      left: width * 0.49,
      top: 0,
      width: width * 0.51,
      height,
      clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)',
    },
  };
};

const layoutForHandoff = (
  rendererProps: ComponentRendererProps,
  emphasize: Side,
): LayoutSpec => {
  const layout = getStageLayout(rendererProps.width, rendererProps.height);
  const slot = layout.slots[rendererProps.scene.slot];
  const width = slot.width;
  const height = slot.height;
  const compact = width < 720;

  return {
    canvasWidth: width,
    canvasHeight: height,
    offsetX: 0,
    offsetY: 0,
    oldBlock: {
      x: compact ? width * 0.08 : width * 0.1,
      y: compact ? height * 0.02 : height * 0.17,
      width: compact ? width * 0.78 : width * 0.32,
      align: 'left',
      titleSize: compact ? 38 : emphasize === 'left' ? 80 : 62,
      quiet: emphasize !== 'left',
    },
    newBlock: {
      x: compact ? width * 0.08 : width * 0.5,
      y: compact ? height * 0.22 : height * 0.24,
      width: compact ? width * 0.84 : width * 0.42,
      align: 'left',
      titleSize: compact ? 56 : emphasize === 'right' ? 104 : 78,
      quiet: emphasize !== 'right',
    },
    cut: {
      left: compact ? width * 0.04 : width * 0.43,
      top: compact ? height * 0.18 : height * 0.16,
      width: compact ? width * 0.62 : 18,
      height: compact ? 12 : height * 0.52,
      transform: compact ? 'rotate(0deg)' : 'rotate(7deg)',
    },
    bridge: {
      left: compact ? width * 0.08 : width * 0.41,
      top: compact ? height * 0.15 : height * 0.43,
    },
  };
};

const textIntroStyle = (intro: number, exit: number, direction: -1 | 1): CSSProperties => ({
  opacity: intro * (1 - exit * 0.72),
  transform: `translateX(${(1 - intro) * direction * 28 + exit * direction * 52}px)`,
  clipPath: `inset(0 ${direction === -1 ? `${(1 - intro) * 100}%` : 0} 0 ${
    direction === 1 ? `${(1 - intro) * 100}%` : 0
  })`,
});

const renderPoints = (
  points: string[] | undefined,
  align: 'left' | 'right',
  color: string,
  intro: number,
): ReactElement | null => {
  if (!points || points.length === 0) {
    return null;
  }
  return (
    <div
      style={{
        display: 'grid',
        gap: 7,
        marginTop: 18,
        justifyItems: align === 'right' ? 'end' : 'start',
        opacity: intro,
      }}
    >
      {points.map((point) => (
        <div
          key={point}
          style={{
            display: 'block',
            fontSize: 24,
            lineHeight: 1.08,
            fontWeight: 760,
            color,
            paddingLeft: 14,
            borderLeft: `6px solid ${visualTokens.color.warmGray}`,
          }}
        >
          {point}
        </div>
      ))}
    </div>
  );
};

const ConceptTextBlock = ({
  content,
  spec,
  intro,
  detailIntro,
  exit,
}: {
  content: ConceptSplitProps[Side];
  spec: TextBlockSpec;
  intro: number;
  detailIntro: number;
  exit: number;
}) => {
  const direction: -1 | 1 = spec.align === 'right' ? 1 : -1;
  const titleLines = content.title.split(/\r?\n/).slice(0, 2);
  const titleColor = spec.quiet ? visualTokens.color.graphite : visualTokens.color.inkBlack;
  const detailColor = spec.quiet ? visualTokens.color.graphite : visualTokens.color.inkBlack;

  return (
    <div
      style={{
        position: 'absolute',
        left: spec.x,
        top: spec.y,
        width: spec.width,
        textAlign: spec.align,
        fontFamily: visualTokens.fontFamily.body,
        ...textIntroStyle(intro, exit, direction),
      }}
    >
      {content.eyebrow ? (
        <div
          style={{
            marginBottom: 10,
            fontFamily: visualTokens.fontFamily.mono,
            fontSize: spec.quiet ? 15 : 17,
            lineHeight: 1,
            fontWeight: 850,
            letterSpacing: 0,
            color: visualTokens.color.graphite,
          }}
        >
          {content.eyebrow}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: visualTokens.fontFamily.display,
          fontSize: spec.titleSize,
          lineHeight: 0.9,
          fontWeight: 900,
          letterSpacing: 0,
          color: titleColor,
          textShadow: spec.quiet ? 'none' : `0.014em 0 0 ${visualTokens.color.inkBlack}`,
        }}
      >
        {titleLines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
      {content.description ? (
        <div
          style={{
            marginTop: 16,
            fontSize: spec.quiet ? 22 : 28,
            lineHeight: 1.12,
            fontWeight: spec.quiet ? 720 : 850,
            color: detailColor,
            opacity: detailIntro,
          }}
        >
          {content.description}
        </div>
      ) : null}
      {renderPoints(content.points, spec.align, detailColor, detailIntro)}
    </div>
  );
};

const Bridge = ({
  props,
  accent,
  style,
  intro,
  exit,
}: {
  props: ConceptSplitProps;
  accent: string;
  style: CSSProperties;
  intro: number;
  exit: number;
}) => {
  const bridgeStyle = bridgeStyleFor(props.relationship, props.bridge?.style);
  const label = bridgeLabelFor(props);

  return (
    <div
      style={{
        position: 'absolute',
        ...style,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        color: visualTokens.color.inkBlack,
        fontFamily: visualTokens.fontFamily.mono,
        fontSize: bridgeStyle === 'vs' ? 26 : 18,
        lineHeight: 1,
        fontWeight: 900,
        opacity: intro * (1 - exit * 0.75),
        transform: `translateY(${(1 - intro) * 10 + exit * 16}px)`,
      }}
    >
      <span>{label}</span>
      {bridgeStyle === 'arrow' ? (
        <span
          style={{
            width: 58,
            height: 8,
            background: accent,
            clipPath: 'polygon(0 34%, 76% 34%, 76% 0, 100% 50%, 76% 100%, 76% 66%, 0 66%)',
          }}
        />
      ) : null}
    </div>
  );
};

export const ConceptSplit = (rendererProps: ComponentRendererProps) => {
  const frame = useCurrentFrame();
  const props = getConceptSplitProps(rendererProps);
  const mode = props.mode ?? 'cross-cut';
  const emphasize = props.emphasize ?? 'right';
  const accent = accentFor(props.accent);
  const exit = editorialExitProgress(frame, rendererProps.durationInFrames, 12, 18);
  const cutIntro = editorialProgress(frame, rendererProps.durationInFrames, {start: 0, end: 24});
  const oldIntro = editorialProgress(frame, rendererProps.durationInFrames, {start: 6, end: 32});
  const newIntro = editorialProgress(frame, rendererProps.durationInFrames, {start: 12, end: 40});
  const detailIntro = editorialProgress(frame, rendererProps.durationInFrames, {start: 20, end: 50});
  const layout =
    mode === 'editorial-fold'
      ? layoutForFold(rendererProps, emphasize)
      : mode === 'handoff'
        ? layoutForHandoff(rendererProps, emphasize)
        : layoutForCrossCut(rendererProps, emphasize);

  return (
    <div
      style={{
        position: 'absolute',
        left: layout.offsetX,
        top: layout.offsetY,
        width: layout.canvasWidth,
        height: layout.canvasHeight,
        overflow: 'hidden',
        color: visualTokens.color.inkBlack,
        transform: `scale(${0.992 + cutIntro * 0.008})`,
      }}
    >
      {layout.foldPanel ? (
        <div
          style={{
            position: 'absolute',
            ...layout.foldPanel,
            background: visualTokens.color.warmGray,
            opacity: 0.56,
          }}
        />
      ) : null}
      {props.showDivider ?? true ? (
        <div
          style={{
            position: 'absolute',
            ...layout.cut,
            background: mode === 'editorial-fold' ? visualTokens.color.inkBlack : accent,
            transform: `${layout.cut.transform ?? ''} scaleY(${cutIntro * (1 - exit * 0.65)})`,
            transformOrigin: 'center top',
          }}
        />
      ) : null}
      <ConceptTextBlock
        content={props.left}
        spec={layout.oldBlock}
        intro={oldIntro}
        detailIntro={detailIntro}
        exit={exit}
      />
      <ConceptTextBlock
        content={props.right}
        spec={layout.newBlock}
        intro={newIntro}
        detailIntro={detailIntro}
        exit={exit}
      />
      <Bridge props={props} accent={accent} style={layout.bridge} intro={detailIntro} exit={exit} />
    </div>
  );
};
