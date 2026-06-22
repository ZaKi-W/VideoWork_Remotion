import fs from 'node:fs';
import path from 'node:path';
import {assetManifestPath, episodeDir, episodeJsonPath, sourcesPath} from '../src/editorial/shared/paths';
import {getArg, readJson} from './episode-utils';
import type {AssetManifest, SourceManifest} from '../src/editorial/schema/episode.types';

const slug = getArg('episode', 'demo-paper-lab');
const dir = episodeDir(slug);
const exists = (name: string) => fs.existsSync(path.join(dir, name));
const storyboard = exists('storyboard.md') ? fs.readFileSync(path.join(dir, 'storyboard.md'), 'utf8') : '';
const status = storyboard.match(/状态：([A-Z_]+)/)?.[1] ?? 'MISSING';
const assets = fs.existsSync(assetManifestPath(slug))
  ? readJson<AssetManifest>(assetManifestPath(slug)).assets
  : [];
const sources = fs.existsSync(sourcesPath(slug)) ? readJson<SourceManifest>(sourcesPath(slug)).sources : [];
const highMissing = assets.filter((asset) => asset.priority === 'high' && asset.status !== 'ready');
const pendingSources = sources.filter((source) => !['verified', 'captured', 'provided'].includes(source.status));
const blocking = [
  !exists('script.md') ? 'script.md missing' : '',
  !exists('talk.srt') ? 'talk.srt missing' : '',
  status !== 'APPROVED' ? `storyboard not APPROVED (${status})` : '',
  !fs.existsSync(episodeJsonPath(slug)) ? 'episode.json missing' : '',
  ...highMissing.map((asset) => `high priority asset not ready: ${asset.id}`),
].filter(Boolean);

console.log(`Episode: ${slug}`);
console.log(`script.md: ${exists('script.md') ? 'yes' : 'no'}`);
console.log(`talk.srt: ${exists('talk.srt') ? 'yes' : 'no'}`);
console.log(`storyboard status: ${status}`);
console.log(`high priority assets pending: ${highMissing.length}`);
console.log(`sources pending: ${pendingSources.length}`);
console.log(`episode.json: ${fs.existsSync(episodeJsonPath(slug)) ? 'yes' : 'no'}`);
console.log(`blocking: ${blocking.length === 0 ? 'none' : blocking.join('; ')}`);
