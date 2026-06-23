import fs from 'node:fs';
import path from 'node:path';
import {
  assetManifestPath,
  episodeAssetsDir,
  episodeDir,
  episodeJsonPath,
  sourcesPath,
} from '../src/editorial/shared/paths';
import {findMissingObsidianAssets, parseObsidianAssetRefs} from './episode-inputs';
import {getArg, readJson} from './episode-utils';
import type {AssetManifest, SourceManifest} from '../src/editorial/schema/episode.types';

const slug = getArg('episode', 'demo-paper-lab');
const dir = episodeDir(slug);
const exists = (name: string) => fs.existsSync(path.join(dir, name));
const storyboard = exists('storyboard.md') ? fs.readFileSync(path.join(dir, 'storyboard.md'), 'utf8') : '';
const script = exists('script.md') ? fs.readFileSync(path.join(dir, 'script.md'), 'utf8') : '';
const status = storyboard.match(/状态：([A-Z_]+)/)?.[1] ?? 'MISSING';
const obsidianAssetRefs = parseObsidianAssetRefs(script);
const missingObsidianAssets = findMissingObsidianAssets(obsidianAssetRefs, episodeAssetsDir(slug));
const assets = fs.existsSync(assetManifestPath(slug))
  ? readJson<AssetManifest>(assetManifestPath(slug)).assets
  : [];
const sources = fs.existsSync(sourcesPath(slug)) ? readJson<SourceManifest>(sourcesPath(slug)).sources : [];
const highMissing = assets.filter((asset) => asset.priority === 'high' && asset.status !== 'ready');
const pendingSources = sources.filter((source) => !['verified', 'captured', 'provided'].includes(source.status));
const blocking = [
  !exists('script.md') ? 'script.md missing' : '',
  !exists('talk.mp4') ? 'talk.mp4 missing' : '',
  !exists('talk.srt') ? 'talk.srt missing' : '',
  status !== 'APPROVED' ? `storyboard not APPROVED (${status})` : '',
  !fs.existsSync(episodeJsonPath(slug)) ? 'episode.json missing' : '',
  ...highMissing.map((asset) => `high priority asset not ready: ${asset.id}`),
  ...missingObsidianAssets.map((asset) => `script asset missing: assets/${asset}`),
].filter(Boolean);

console.log(`Episode: ${slug}`);
console.log(`script.md: ${exists('script.md') ? 'yes' : 'no'}`);
console.log(`talk.mp4: ${exists('talk.mp4') ? 'yes' : 'no'}`);
console.log(`talk.srt: ${exists('talk.srt') ? 'yes' : 'no'}`);
console.log(`assets/: ${fs.existsSync(episodeAssetsDir(slug)) ? 'yes' : 'no'}`);
console.log(`script asset refs: ${obsidianAssetRefs.length}`);
console.log(`script assets missing: ${missingObsidianAssets.length}`);
console.log(`storyboard status: ${status}`);
console.log(`high priority assets pending: ${highMissing.length}`);
console.log(`sources pending: ${pendingSources.length}`);
console.log(`episode.json: ${fs.existsSync(episodeJsonPath(slug)) ? 'yes' : 'no'}`);
console.log(`blocking: ${blocking.length === 0 ? 'none' : blocking.join('; ')}`);
