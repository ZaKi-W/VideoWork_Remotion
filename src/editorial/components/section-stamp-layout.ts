import type {SectionStampProps} from '../schema/episode.types';

export type NormalizedSectionStampVariant = 'impact' | 'edge-impact';

export const normalizeSectionStampVariant = (
  variant: SectionStampProps['variant'],
): NormalizedSectionStampVariant => {
  if (variant === 'edge-impact' || variant === 'edge-note') {
    return 'edge-impact';
  }
  return 'impact';
};

const weightedLength = (value: string): number => {
  let total = 0;
  for (const char of value) {
    if (/\s/.test(char)) {
      total += 0.25;
    } else if (/^[A-Za-z0-9]$/.test(char)) {
      total += 0.62;
    } else {
      total += 1;
    }
  }
  return total;
};

const isAsciiWord = (value: string): boolean => /^[A-Za-z0-9_-]+$/.test(value);

const tokenizeTitle = (title: string): string[] => {
  const tokens: string[] = [];
  let currentWord = '';
  for (const char of title.trim()) {
    if (/^[A-Za-z0-9_-]$/.test(char)) {
      currentWord += char;
      continue;
    }
    if (currentWord) {
      tokens.push(currentWord);
      currentWord = '';
    }
    if (!/\s/.test(char)) {
      tokens.push(char);
    }
  }
  if (currentWord) {
    tokens.push(currentWord);
  }
  return tokens;
};

const joinTokens = (tokens: string[]): string => tokens.join('').trim();

const preferredBreakIndex = (value: string): number | null => {
  const phrases = ['才是', '走向', '怎么', '都值得', '不是', '是方法'];
  const minLeft = 2;
  const minRight = 3;
  let best: {index: number; score: number} | null = null;
  for (const phrase of phrases) {
    const index = value.indexOf(phrase);
    if (index <= minLeft || value.length - index < minRight) {
      continue;
    }
    const score = Math.abs(weightedLength(value.slice(0, index)) - weightedLength(value.slice(index)));
    if (!best || score < best.score) {
      best = {index, score};
    }
  }
  return best?.index ?? null;
};

const scoreSplit = (left: string, right: string, emphasisText?: string): number => {
  const leftLength = weightedLength(left);
  const rightLength = weightedLength(right);
  const balancePenalty = Math.abs(leftLength - rightLength) * 2.8;
  const lonelyPenalty = left.length <= 1 || right.length <= 1 ? 80 : 0;
  const emphasisPenalty =
    emphasisText && left.includes(emphasisText) === false && right.includes(emphasisText) === false ? 30 : 0;
  const tinySecondPenalty = rightLength < 3 ? 24 : 0;
  return balancePenalty + lonelyPenalty + emphasisPenalty + tinySecondPenalty;
};

export const splitSectionStampTitle = (title: string, emphasisText?: string): string[] => {
  if (/\r?\n/.test(title)) {
    const explicitLines = title
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (explicitLines.length > 0) {
      return explicitLines.slice(0, 2);
    }
  }

  const normalized = title.trim();
  if (normalized.length <= 5) {
    return [normalized];
  }

  const compact = normalized.replace(/\s+/g, '');
  const preferred = preferredBreakIndex(compact);
  if (preferred !== null) {
    return [compact.slice(0, preferred), compact.slice(preferred)].filter(Boolean);
  }

  const tokens = tokenizeTitle(normalized);
  if (tokens.length <= 1) {
    return [normalized];
  }

  let best: {lines: string[]; score: number} | null = null;
  for (let index = 1; index < tokens.length; index += 1) {
    if (isAsciiWord(tokens[index - 1]) && isAsciiWord(tokens[index])) {
      continue;
    }
    const left = joinTokens(tokens.slice(0, index));
    const right = joinTokens(tokens.slice(index));
    if (!left || !right) {
      continue;
    }
    const score = scoreSplit(left, right, emphasisText);
    if (!best || score < best.score) {
      best = {lines: [left, right], score};
    }
  }

  return best?.lines ?? [normalized];
};
