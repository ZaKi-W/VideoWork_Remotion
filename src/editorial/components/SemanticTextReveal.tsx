import type {CSSProperties, ReactElement} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {ComponentRendererProps} from '../registry/component.types';
import type {SemanticTextRevealProps} from '../schema/episode.types';
import {frameRangeProgress} from '../shared/motion';
import {getStageLayout} from '../stage/stage.config';

export type SemanticTextRevealMode = 'words' | 'characters' | 'focus';

export type SemanticTextRevealViewProps = {
  text: string;
  mode?: SemanticTextRevealMode;
  emphasis?: string[];
  activeIndex?: number;
  startFrame?: number;
  durationInFrames?: number;
  staggerFrames?: number;
  blurPx?: number;
  accentColor?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  style?: CSSProperties;
};

const punctuationPattern = /^[\p{P}\p{S}]+$/u;
const trailingPunctuationPattern = /[\p{P}\p{S}\s]+$/gu;

const appendToPrevious = (units: string[], value: string): void => {
  if (units.length === 0) {
    units.push(value);
    return;
  }
  units[units.length - 1] += value;
};

export const splitSemanticText = (
  text: string,
  mode: SemanticTextRevealMode,
): string[] => {
  if (text.length === 0) {
    return [];
  }

  if (mode === 'characters') {
    return Array.from(text).reduce<string[]>((units, character) => {
      if (punctuationPattern.test(character) || /^\s+$/u.test(character)) {
        appendToPrevious(units, character);
      } else {
        units.push(character);
      }
      return units;
    }, []);
  }

  const tokens = text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+|[\p{L}\p{N}_'-]+|\s+|[^\p{L}\p{N}\s]+/gu) ?? [];

  return tokens.reduce<string[]>((units, token) => {
    if (/^\s+$/u.test(token) || punctuationPattern.test(token)) {
      appendToPrevious(units, token);
    } else {
      units.push(token);
    }
    return units;
  }, []);
};

const normalizeUnit = (unit: string): string =>
  unit.replace(trailingPunctuationPattern, '');

export const SemanticTextRevealView = ({
  text,
  mode = 'words',
  emphasis = [],
  activeIndex,
  startFrame = 0,
  durationInFrames = 18,
  staggerFrames = 2,
  blurPx = 8,
  accentColor = '#c7ff3d',
  align = 'left',
  className,
  style,
}: SemanticTextRevealViewProps): ReactElement => {
  const frame = useCurrentFrame();
  const units = splitSemanticText(text, mode);
  const safeDuration = Math.max(1, durationInFrames);
  const inferredActiveIndex =
    units.length === 0
      ? -1
      : Math.min(
          units.length - 1,
          Math.max(0, Math.floor((frame - startFrame) / Math.max(1, staggerFrames))),
        );
  const focusedIndex = activeIndex ?? inferredActiveIndex;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        justifyContent:
          align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        color: '#ffffff',
        textAlign: align,
        textShadow:
          '0 2px 16px rgba(0, 0, 0, 0.72), 0 1px 4px rgba(0, 0, 0, 0.6)',
        ...style,
      }}
    >
      {units.map((unit, index) => {
        const unitStart = startFrame + index * staggerFrames;
        const unitProgress = frameRangeProgress(
          frame,
          unitStart,
          unitStart + safeDuration,
        );
        const easedProgress = interpolate(
          unitProgress,
          [0, 1],
          [0, 1],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          },
        );
        const isFocused = mode !== 'focus' || index === focusedIndex;
        const opacity =
          mode === 'focus' ? (isFocused ? 1 : 0.52) : easedProgress;
        const blur =
          mode === 'focus'
            ? isFocused
              ? 0
              : Math.min(blurPx, 3)
            : (1 - easedProgress) * blurPx;
        const translateY = mode === 'focus' ? 0 : (1 - easedProgress) * 10;
        const scale = mode === 'focus' ? 1 : 0.96 + easedProgress * 0.04;
        const normalizedUnit = normalizeUnit(unit);
        const isEmphasized = emphasis.some(
          (candidate) => candidate === normalizedUnit || normalizedUnit.includes(candidate),
        );

        return (
          <span
            key={`${index}-${unit}`}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre-wrap',
              color: isEmphasized ? accentColor : '#ffffff',
              opacity,
              filter: `blur(${blur}px)`,
              transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
              transformOrigin: 'center bottom',
            }}
          >
            {unit}
          </span>
        );
      })}
    </span>
  );
};

const getProps = (rendererProps: ComponentRendererProps): SemanticTextRevealProps => {
  if (rendererProps.scene.content.kind !== 'SemanticTextReveal') {
    throw new Error(
      `SemanticTextReveal renderer received ${rendererProps.scene.content.kind}`,
    );
  }
  return rendererProps.scene.content.props;
};

export const SemanticTextReveal = (
  rendererProps: ComponentRendererProps,
): ReactElement => {
  const props = getProps(rendererProps);
  const layout = getStageLayout(rendererProps.width, rendererProps.height);
  const slot = layout.slots[rendererProps.scene.slot];
  const maxHeight = Math.max(
    0,
    layout.subtitleSafeZone.y - slot.y - Math.round(rendererProps.height * 0.015),
  );

  return (
    <div
      style={{
        width: slot.width,
        maxHeight,
        overflow: 'hidden',
        color: '#ffffff',
        fontFamily: 'Inter, "PingFang SC", "Microsoft YaHei", sans-serif',
        fontSize: Math.max(36, Math.round(rendererProps.width * 0.035)),
        lineHeight: 1.22,
        fontWeight: 800,
      }}
    >
      <SemanticTextRevealView {...props} />
    </div>
  );
};
