import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  assetManifestPath,
  episodeDir,
  episodeJsonPath,
  repoRoot,
  sourcesPath,
} from '../src/editorial/shared/paths';
import {
  assetManifestSchema,
  episodeSchema,
  sourceManifestSchema,
} from '../src/editorial/schema/episode.schema';
import type {
  AssetManifest,
  EpisodeConfig,
  EpisodeInputProps,
  SourceManifest,
} from '../src/editorial/schema/episode.types';
import type {ValidationIssue} from '../src/editorial/validation/validation.types';

export const getArg = (name: string, fallback?: string): string => {
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error(`Missing --${name}`);
};

export const readJson = <T>(filePath: string): T => JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;

export const loadEpisodeBundle = (slug: string): EpisodeInputProps => {
  const episode = episodeSchema.parse(readJson<EpisodeConfig>(episodeJsonPath(slug)));
  const assets = assetManifestSchema.parse(readJson<AssetManifest>(assetManifestPath(slug)));
  const sources = sourceManifestSchema.parse(readJson<SourceManifest>(sourcesPath(slug)));
  return {episode, assets, sources};
};

export const ensureDir = (dir: string): void => {
  fs.mkdirSync(dir, {recursive: true});
};

export const writePropsFile = (slug: string, props: EpisodeInputProps, strict: boolean): string => {
  const outDir = path.join(episodeDir(slug), 'output', '.props');
  ensureDir(outDir);
  const propsPath = path.join(outDir, `${strict ? 'strict' : 'preview'}-props.json`);
  fs.writeFileSync(propsPath, JSON.stringify({...props, strict}, null, 2));
  return propsPath;
};

export const printIssues = (issues: ValidationIssue[]): void => {
  if (issues.length === 0) {
    console.log('No validation issues.');
    return;
  }
  for (const issue of issues) {
    const scene = issue.sceneId ? ` [${issue.sceneId}]` : '';
    console.log(`${issue.level.toUpperCase()} ${issue.code}${scene}: ${issue.message}`);
  }
};

export const runRemotion = (args: string[]): void => {
  const result = spawnSync('npx', ['remotion', ...args], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`Remotion command failed: remotion ${args.join(' ')}`);
  }
};

export const publicDir = path.join(repoRoot, 'public');
