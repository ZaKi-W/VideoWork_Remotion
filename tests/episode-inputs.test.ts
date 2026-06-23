import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {findMissingObsidianAssets, parseObsidianAssetRefs} from '../scripts/episode-inputs';

const tempDirs: string[] = [];

const makeTempDir = (): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'episode-inputs-'));
  tempDirs.push(dir);
  return dir;
};

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, {recursive: true, force: true});
  }
});

describe('episode input helpers', () => {
  it('extracts Obsidian embedded asset filenames and ignores display widths', () => {
    const markdown = [
      '可以看到下图，已经变成了deepseek-v4-pro',
      '![[Pasted image 20260522160436.png|574]]',
      '![[Pasted image 20260522160524.png|581]]',
      '![[demo recording.mp4]]',
    ].join('\n');

    expect(parseObsidianAssetRefs(markdown)).toEqual([
      'Pasted image 20260522160436.png',
      'Pasted image 20260522160524.png',
      'demo recording.mp4',
    ]);
  });

  it('allows scripts without asset embeds', () => {
    const markdown = '这一期只有口播文案，没有任何截图或录屏素材。';

    expect(parseObsidianAssetRefs(markdown)).toEqual([]);
  });

  it('deduplicates references while preserving first-seen order', () => {
    const markdown = '![[same.png|574]]\n![[other.png]]\n![[same.png|581]]';

    expect(parseObsidianAssetRefs(markdown)).toEqual(['same.png', 'other.png']);
  });

  it('reports Obsidian assets missing from the episode assets directory', () => {
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, 'ready.png'), '');

    const missing = findMissingObsidianAssets(['ready.png', 'missing.png'], dir);

    expect(missing).toEqual(['missing.png']);
  });
});
