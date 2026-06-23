import fs from 'node:fs';
import path from 'node:path';

const obsidianEmbedPattern = /!\[\[([^\]\n]+)\]\]/g;

export const parseObsidianAssetRefs = (markdown: string): string[] => {
  const refs: string[] = [];
  const seen = new Set<string>();

  for (const match of markdown.matchAll(obsidianEmbedPattern)) {
    const filename = match[1].split('|')[0]?.trim();
    if (!filename || seen.has(filename)) {
      continue;
    }
    seen.add(filename);
    refs.push(filename);
  }

  return refs;
};

export const findMissingObsidianAssets = (refs: string[], assetsDir: string): string[] =>
  refs.filter((ref) => !fs.existsSync(path.join(assetsDir, ref)));
