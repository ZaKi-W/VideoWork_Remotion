import {parseSrt} from '@remotion/captions';
import type {Caption} from '@remotion/captions';
import {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, useCurrentFrame, useVideoConfig} from 'remotion';
import {acidTokens} from './acid-system';

type Phrase = {
  text: string;
  startMs: number;
  endMs: number;
};

type ActiveCue = {
  caption: Caption;
  phrases: Phrase[];
};

export type AcidSrtSubtitleProps = {
  captions: Caption[];
  maxWidth?: number;
};

export type AcidSrtSubtitleDemoProps = {
  srt: string;
};

const phraseSplitPattern = /([^，。！？；、：,.!?;:\n]+[，。！？；、：,.!?;:]?)/g;
const maxPhraseChars = 16;

const cleanText = (text: string): string => text.replace(/\s+/g, ' ').trim();

const splitLongPhrase = (phrase: string): string[] => {
  const normalized = cleanText(phrase);
  if (normalized.length <= maxPhraseChars) {
    return [normalized];
  }

  const chunks: string[] = [];
  for (let index = 0; index < normalized.length; index += maxPhraseChars) {
    chunks.push(normalized.slice(index, index + maxPhraseChars));
  }
  return chunks;
};

export const splitCaptionPhrases = (text: string): string[] => {
  const normalized = cleanText(text);
  if (!normalized) {
    return [];
  }

  const punctuationParts = Array.from(normalized.matchAll(phraseSplitPattern), (match) => match[0].trim()).filter(Boolean);
  const baseParts = punctuationParts.length > 0 ? punctuationParts : [normalized];

  return baseParts.flatMap(splitLongPhrase);
};

const weightedPhrases = (caption: Caption): Phrase[] => {
  const phrases = splitCaptionPhrases(caption.text);
  const durationMs = Math.max(1, caption.endMs - caption.startMs);
  const totalWeight = phrases.reduce((sum, phrase) => sum + Math.max(1, phrase.length), 0) || 1;
  let cursor = caption.startMs;

  return phrases.map((text, index) => {
    const isLast = index === phrases.length - 1;
    const phraseDuration = isLast
      ? caption.endMs - cursor
      : Math.round((durationMs * Math.max(1, text.length)) / totalWeight);
    const startMs = cursor;
    const endMs = isLast ? caption.endMs : Math.min(caption.endMs, cursor + Math.max(1, phraseDuration));
    cursor = endMs;

    return {text, startMs, endMs};
  });
};

const activeCueAt = (captions: Caption[], timeMs: number): ActiveCue | null => {
  const caption = captions.find((candidate) => candidate.startMs <= timeMs && candidate.endMs >= timeMs);
  if (!caption) {
    return null;
  }

  return {
    caption,
    phrases: weightedPhrases(caption),
  };
};

const phraseState = (phrase: Phrase, timeMs: number): 'done' | 'live' | 'future' => {
  if (timeMs < phrase.startMs) {
    return 'future';
  }
  if (timeMs > phrase.endMs) {
    return 'done';
  }
  return 'live';
};

const phraseUnderlineProgress = (phrase: Phrase, timeMs: number, fps: number): number => {
  const framesSincePhraseStart = ((timeMs - phrase.startMs) / 1000) * fps;
  return interpolate(framesSincePhraseStart, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.2, 0.86, 0.2, 1),
  });
};

const flowOffset = (progress: number, offset: number): number => ((progress + offset) % 1) * 240 - 70;

const BorderFlow = ({progress}: {progress: number}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      zIndex: 2,
      pointerEvents: 'none',
      border: `1px solid ${acidTokens.color.acidLine}`,
    }}
  >
    <span
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '34%',
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(217,255,76,0.88), transparent)',
        boxShadow: '0 0 9px rgba(217,255,76,0.36)',
        transform: `translateX(${flowOffset(progress, 0)}%)`,
      }}
    />
    <span
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: 1,
        height: '46%',
        background: 'linear-gradient(180deg, transparent, rgba(217,255,76,0.72), transparent)',
        boxShadow: '0 0 9px rgba(217,255,76,0.28)',
        transform: `translateY(${flowOffset(progress, 0.25)}%)`,
      }}
    />
    <span
      style={{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: '34%',
        height: 1,
        background: 'linear-gradient(270deg, transparent, rgba(217,255,76,0.88), transparent)',
        boxShadow: '0 0 9px rgba(217,255,76,0.36)',
        transform: `translateX(${-flowOffset(progress, 0.5)}%)`,
      }}
    />
    <span
      style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: 1,
        height: '46%',
        background: 'linear-gradient(0deg, transparent, rgba(217,255,76,0.72), transparent)',
        boxShadow: '0 0 9px rgba(217,255,76,0.28)',
        transform: `translateY(${-flowOffset(progress, 0.75)}%)`,
      }}
    />
  </div>
);

export const AcidSrtSubtitle = ({captions, maxWidth = 1040}: AcidSrtSubtitleProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const timeMs = (frame / fps) * 1000;
  const activeCue = useMemo(() => activeCueAt(captions, timeMs), [captions, timeMs]);

  if (captions.length === 0) {
    return null;
  }

  const cueFrame = activeCue ? ((timeMs - activeCue.caption.startMs) / 1000) * fps : 0;
  const textEnter = activeCue
    ? interpolate(cueFrame, [0, 7], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.2, 0.86, 0.2, 1),
      })
    : 0;
  const borderFlowProgress = (frame % 120) / 120;

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 34,
        left: '50%',
        bottom: acidTokens.layout.subtitle.bottom,
        width: `min(${acidTokens.layout.subtitle.maxWidth}, ${maxWidth}px)`,
        minWidth: acidTokens.layout.subtitle.minWidth,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '5px 1fr',
          minHeight: 56,
          overflow: 'hidden',
          background: 'rgba(7,9,6,0.82)',
          boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
          opacity: 1,
        }}
      >
        <BorderFlow progress={borderFlowProgress} />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            background: acidTokens.color.acid,
            boxShadow: '0 0 11px rgba(217,255,76,0.38)',
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '10px 18px 12px 17px',
          }}
        >
          <div
            style={{
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              color: acidTokens.color.text,
              textAlign: 'center',
              fontFamily: acidTokens.font.body,
              fontSize: 31,
              lineHeight: 1.33,
              fontWeight: 900,
              letterSpacing: 0,
              opacity: textEnter,
            }}
          >
            {activeCue?.phrases.map((phrase) => {
              const state = phraseState(phrase, timeMs);
              const isLive = state === 'live';
              const color =
                state === 'done'
                  ? acidTokens.color.text
                  : isLive
                    ? interpolateColors(phraseUnderlineProgress(phrase, timeMs, fps), [0, 1], [
                        acidTokens.color.text,
                        acidTokens.color.acid,
                      ])
                    : 'rgba(248,250,239,0.42)';
              const underline = phraseUnderlineProgress(phrase, timeMs, fps);

              return (
                <span
                  key={`${phrase.startMs}-${phrase.text}`}
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    color,
                    textShadow: isLive ? '0 0 10px rgba(217,255,76,0.18)' : undefined,
                  }}
                >
                  {phrase.text}
                  {isLive ? (
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: '-0.14em',
                        height: '0.09em',
                        background: acidTokens.color.acid,
                        boxShadow: '0 0 8px rgba(217,255,76,0.35)',
                        transform: `scaleX(${underline})`,
                        transformOrigin: 'left center',
                      }}
                    />
                  ) : null}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const DemoPresenter = () => (
  <div
    style={{
      position: 'absolute',
      zIndex: 10,
      left: '50%',
      bottom: '7%',
      width: '30%',
      height: '78%',
      transform: 'translateX(-50%)',
      pointerEvents: 'none',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: '-4%',
        width: '116%',
        height: '15%',
        transform: 'translateX(-50%)',
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.35), transparent 70%)',
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
        background:
          'radial-gradient(circle at 34% 27%, rgba(255,255,255,0.40), transparent 20%), linear-gradient(145deg, #d2a28e, #6c4b54 77%)',
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

export const AcidSrtSubtitleDemo = ({srt}: AcidSrtSubtitleDemoProps) => {
  const captions = useMemo(() => parseSrt({input: srt}).captions, [srt]);

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        isolation: 'isolate',
        background:
          'radial-gradient(circle at 50% 18%, rgba(255,255,255,0.96), transparent 31%), linear-gradient(113deg, #dedbd5 0%, #f7f5ef 49%, #e2dfd8 100%)',
        fontFamily: acidTokens.font.body,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 102%, rgba(16,18,24,0.23), transparent 46%), linear-gradient(90deg, rgba(0,0,0,0.06), transparent 15%, transparent 81%, rgba(0,0,0,0.05))',
        }}
      />
      <DemoPresenter />
      <AcidSrtSubtitle captions={captions} maxWidth={1040} />
    </AbsoluteFill>
  );
};
