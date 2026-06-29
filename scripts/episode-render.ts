import path from 'node:path';
import {episodeDir} from '../src/editorial/shared/paths';
import {validateEpisodeData} from '../src/editorial/validation/validate-episode';
import {
  ensureDir,
  getArg,
  loadEpisodeBundle,
  printIssues,
  publicDir,
  runRemotion,
  syncEpisodeAssetsToPublic,
  writePropsFile,
} from './episode-utils';

const slug = getArg('episode', 'demo-paper-lab');
syncEpisodeAssetsToPublic(slug);
const bundle = loadEpisodeBundle(slug);
const result = validateEpisodeData(bundle.episode, bundle.assets, bundle.sources, {mode: 'strict', publicDir});
printIssues(result.issues);
if (!result.ok) {
  throw new Error('Strict validation failed');
}
const outDir = path.join(episodeDir(slug), 'output', 'final');
ensureDir(outDir);
const propsPath = writePropsFile(slug, bundle, true);
const scale = getArg('scale', '1');
const extraArgs: string[] = [];
if (scale !== '1') {
  extraArgs.push('--scale', scale);
}
runRemotion(['render', 'src/index.ts', 'Episode', path.join(outDir, `${slug}-final.mp4`), '--props', propsPath, ...extraArgs]);
console.log(`Final render written to ${outDir}`);
