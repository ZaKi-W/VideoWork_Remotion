import type {CSSProperties, ReactElement} from 'react';
import {useCurrentFrame} from 'remotion';
import type {ComponentRendererProps} from '../registry/component.types';
import type {EditorialOverlayProps} from '../schema/episode.types';
import {editorialExitProgress, editorialProgress, revealInset} from '../shared/motion';
import {visualTokens} from '../stage/visual-tokens';

type Item = EditorialOverlayProps['items'][number];
type Layout = NonNullable<EditorialOverlayProps['layout']>;
type Placement = EditorialOverlayProps['placement'];

const getEditorialOverlayProps = (props: ComponentRendererProps): EditorialOverlayProps => {
  if (props.scene.content.kind !== 'EditorialOverlay') {
    throw new Error(`EditorialOverlay renderer received ${props.scene.content.kind}`);
  }
  return props.scene.content.props;
};

const accentFor = (accent: EditorialOverlayProps['accent']): string =>
  accent === 'blue' ? visualTokens.color.electricBlue : visualTokens.color.signalOrange;

const isRightPlacement = (placement: Placement): boolean => placement.endsWith('right');

const originFor = (placement: Placement): CSSProperties => {
  if (placement === 'top-right') {
    return {right: 0, top: 0};
  }
  if (placement === 'edge-right') {
    return {right: -6, top: -4};
  }
  if (placement === 'edge-left') {
    return {left: -6, top: -4};
  }
  return {left: 0, top: 0};
};

type PositionSpec = {
  left?: number;
  right?: number;
  top: number;
  width: number;
};

const positionsFor = (layout: Layout, placement: Placement, itemCount: number): PositionSpec[] => {
  const right = isRightPlacement(placement);
  if (layout === 'edge-rail') {
    return Array.from({length: itemCount}, (_, index) => ({
      left: right ? undefined : 24 + index * 9,
      right: right ? 20 + index * 10 : undefined,
      top: 18 + index * 98,
      width: 330,
    }));
  }
  if (layout === 'counterweight') {
    return [
      {left: right ? undefined : 20, right: right ? 28 : undefined, top: 46, width: 340},
      {left: right ? undefined : 78, right: right ? 86 : undefined, top: 230, width: 280},
      {left: right ? undefined : 32, right: right ? 40 : undefined, top: 340, width: 320},
      {left: right ? undefined : 128, right: right ? 136 : undefined, top: 116, width: 220},
    ].slice(0, itemCount);
  }
  if (layout === 'scatter') {
    return [
      {left: right ? undefined : 42, right: right ? 20 : undefined, top: 22, width: 330},
      {left: right ? undefined : 0, right: right ? 110 : undefined, top: 190, width: 290},
    ].slice(0, itemCount);
  }

  return [
    {left: right ? undefined : 16, right: right ? 16 : undefined, top: 18, width: 360},
    {left: right ? undefined : 72, right: right ? 72 : undefined, top: 122, width: 320},
    {left: right ? undefined : 26, right: right ? 28 : undefined, top: 224, width: 330},
    {left: right ? undefined : 146, right: right ? 144 : undefined, top: 82, width: 180},
  ].slice(0, itemCount);
};

const baseItemStyle = (
  intro: number,
  exit: number,
  placement: Placement,
  position: PositionSpec,
  delayIndex: number,
): CSSProperties => {
  const direction = isRightPlacement(placement) ? 1 : -1;
  const localShift = (1 - intro) * direction * 22 + exit * direction * 36;
  return {
    position: 'absolute',
    ...position,
    boxSizing: 'border-box',
    opacity: intro * (1 - exit * 0.82),
    transform: `translateX(${localShift + delayIndex * direction * 1.5}px)`,
    color: visualTokens.color.inkBlack,
    fontFamily: visualTokens.fontFamily.body,
  };
};

const GhostNumber = ({item, intro, accent}: {item: Extract<Item, {type: 'ghost-number'}>; intro: number; accent: string}) => (
  <div
    style={{
      fontFamily: visualTokens.fontFamily.display,
      fontSize: item.value.length > 3 ? 86 : 118,
      lineHeight: 0.82,
      fontWeight: 900,
      letterSpacing: 0,
      color: visualTokens.color.warmGray,
      opacity: 0.6 * intro,
      transform: `scaleX(0.94) translateY(${(1 - intro) * 10}px)`,
      borderLeft: `10px solid ${accent}`,
      paddingLeft: 10,
      width: 'fit-content',
    }}
  >
    {item.value}
  </div>
);

const KeywordStamp = ({item, intro, accent}: {item: Extract<Item, {type: 'keyword'}>; intro: number; accent: string}) => {
  const emphasis = item.emphasis ?? 'none';
  const base: CSSProperties = {
    display: 'inline-block',
    fontFamily: visualTokens.fontFamily.display,
    fontSize: item.text.length > 5 ? 46 : 58,
    lineHeight: 0.96,
    fontWeight: 900,
    letterSpacing: 0,
    color: visualTokens.color.inkBlack,
    transform: `scaleX(0.96) translateY(${(1 - intro) * 8}px)`,
    transformOrigin: 'left top',
    clipPath: `inset(0 ${(1 - intro) * 100}% 0 0)`,
  };

  if (emphasis === 'block') {
    base.background = accent;
    base.padding = '2px 9px 7px';
  }
  if (emphasis === 'reverse') {
    base.background = visualTokens.color.inkBlack;
    base.color = visualTokens.color.paperWhite;
    base.padding = '2px 9px 7px';
  }
  if (emphasis === 'underline') {
    base.background = `linear-gradient(to top, ${accent} 0 24%, transparent 24% 100%)`;
    base.padding = '0 4px 6px';
  }

  return <div style={base}>{item.text}</div>;
};

const MiniList = ({item, intro, accent}: {item: Extract<Item, {type: 'mini-list'}>; intro: number; accent: string}) => (
  <div
    style={{
      width: '100%',
      fontFamily: visualTokens.fontFamily.body,
      transform: `translateY(${(1 - intro) * 8}px)`,
      clipPath: `inset(0 0 ${(1 - intro) * 100}% 0)`,
    }}
  >
    {item.title ? (
      <div
        style={{
          fontFamily: visualTokens.fontFamily.mono,
          fontSize: 17,
          fontWeight: 800,
          color: visualTokens.color.graphite,
          marginBottom: 8,
        }}
      >
        {item.title}
      </div>
    ) : null}
    {item.rows.map((row, index) => {
      const emphasizeLabel = row.emphasis === 'label';
      const emphasizeValue = row.emphasis === 'value';
      return (
        <div
          key={`${row.label}-${index}`}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 9,
            minHeight: 30,
            fontSize: 22,
            fontWeight: emphasizeLabel ? 900 : 720,
            color: emphasizeLabel ? visualTokens.color.inkBlack : visualTokens.color.graphite,
          }}
        >
          <span
            style={{
              width: 18,
              height: 5,
              background: emphasizeLabel || emphasizeValue ? accent : visualTokens.color.warmGray,
              flex: '0 0 auto',
            }}
          />
          <span>{row.label}</span>
          {row.value ? (
            <span
              style={{
                marginLeft: 'auto',
                fontFamily: visualTokens.fontFamily.mono,
                fontWeight: emphasizeValue ? 900 : 750,
                color: emphasizeValue ? accent : visualTokens.color.graphite,
              }}
            >
              {row.value}
            </span>
          ) : null}
        </div>
      );
    })}
  </div>
);

const StatTag = ({item, intro, accent}: {item: Extract<Item, {type: 'stat-tag'}>; intro: number; accent: string}) => {
  const active = (item.tone ?? 'neutral') === 'accent';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'flex-end',
        gap: 8,
        border: `2px solid ${active ? accent : visualTokens.color.warmGray}`,
        background: active ? accent : visualTokens.color.softGray,
        color: active ? visualTokens.color.inkBlack : visualTokens.color.graphite,
        padding: '7px 10px 8px',
        borderRadius: 2,
        width: 'fit-content',
        transform: `scale(${0.9 + intro * 0.1})`,
        clipPath: revealInset(intro, -1),
      }}
    >
      <span style={{fontFamily: visualTokens.fontFamily.mono, fontSize: 34, lineHeight: 0.92, fontWeight: 900}}>
        {item.value}
      </span>
      {item.label ? <span style={{fontSize: 16, lineHeight: 1, fontWeight: 820}}>{item.label}</span> : null}
    </div>
  );
};

const Annotation = ({item, intro, accent}: {item: Extract<Item, {type: 'annotation'}>; intro: number; accent: string}) => {
  const direction = item.direction ?? 'left';
  const horizontal = direction === 'left' || direction === 'right';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: direction === 'right' ? 'row-reverse' : 'row',
        gap: 9,
        color: visualTokens.color.graphite,
        fontSize: 20,
        fontWeight: 760,
        lineHeight: 1.14,
        maxWidth: 290,
        opacity: intro,
        transform: `translate(${(1 - intro) * (direction === 'right' ? 14 : -14)}px, ${(1 - intro) * 8}px)`,
      }}
    >
      <span
        style={{
          display: 'block',
          width: horizontal ? 44 : 8,
          height: horizontal ? 5 : 34,
          background: accent,
          flex: '0 0 auto',
          transform: `${direction === 'up' || direction === 'down' ? 'rotate(0deg) ' : ''}scale${horizontal ? 'X' : 'Y'}(${intro})`,
          transformOrigin: direction === 'right' || direction === 'down' ? 'right center' : 'left center',
        }}
      />
      <span>{item.text}</span>
    </div>
  );
};

const renderItem = (item: Item, intro: number, accent: string): ReactElement => {
  if (item.type === 'ghost-number') {
    return <GhostNumber item={item} intro={intro} accent={accent} />;
  }
  if (item.type === 'keyword') {
    return <KeywordStamp item={item} intro={intro} accent={accent} />;
  }
  if (item.type === 'mini-list') {
    return <MiniList item={item} intro={intro} accent={accent} />;
  }
  if (item.type === 'stat-tag') {
    return <StatTag item={item} intro={intro} accent={accent} />;
  }
  return <Annotation item={item} intro={intro} accent={accent} />;
};

export const EditorialOverlay = (rendererProps: ComponentRendererProps) => {
  const frame = useCurrentFrame();
  const props = getEditorialOverlayProps(rendererProps);
  const layout = props.layout ?? 'corner-stack';
  const accent = accentFor(props.accent ?? 'orange');
  const exit = editorialExitProgress(frame, rendererProps.durationInFrames, 10, 18);
  const positions = positionsFor(layout, props.placement, props.items.length);
  const right = isRightPlacement(props.placement);
  const introOffset = layout === 'edge-rail' ? 2 : 1;

  return (
    <div
      style={{
        position: 'relative',
        ...originFor(props.placement),
        width: layout === 'edge-rail' ? 420 : 430,
        height: layout === 'edge-rail' ? 590 : 390,
        fontFamily: visualTokens.fontFamily.body,
        color: visualTokens.color.inkBlack,
        transform: `${right && layout !== 'edge-rail' ? 'translateX(-34px)' : 'none'} scale(1)`,
      }}
    >
      {props.items.map((item, index) => {
        const intro = editorialProgress(frame, rendererProps.durationInFrames, {
          start: index * introOffset,
          end: 22 + index * 4,
          startRatio: 0.22,
          endRatio: 0.5,
        });
        return (
          <div
            key={`${item.type}-${index}`}
            style={baseItemStyle(intro, exit, props.placement, positions[index], index)}
          >
            {renderItem(item, intro, accent)}
          </div>
        );
      })}
    </div>
  );
};
