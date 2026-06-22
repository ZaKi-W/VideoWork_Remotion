import path from 'node:path';

export const repoRoot = process.cwd();
export const episodeDir = (slug: string): string => path.join(repoRoot, 'episodes', slug);
export const publicEpisodeAssetsDir = (slug: string): string =>
  path.join(repoRoot, 'public', 'episodes', slug, 'assets');
export const episodeJsonPath = (slug: string): string => path.join(episodeDir(slug), 'episode.json');
export const assetManifestPath = (slug: string): string => path.join(episodeDir(slug), 'asset-manifest.json');
export const sourcesPath = (slug: string): string => path.join(episodeDir(slug), 'sources.json');
