import path from 'node:path';
import {episodeDir} from '../src/editorial/shared/paths';
import {validateEpisodeData} from '../src/editorial/validation/validate-episode';
import {ensureDir, getArg, loadEpisodeBundle, printIssues, publicDir, runRemotion, writePropsFile} from './episode-utils';

const slug = getArg('episode', 'demo-paper-lab');
const bundle = loadEpisodeBundle(slug);
const result = validateEpisodeData(bundle.episode, bundle.assets, bundle.sources, {mode: 'preview', publicDir});
printIssues(result.issues);
if (!result.ok) {
  throw new Error('Preview validation failed');
}
const outDir = path.join(episodeDir(slug), 'output', 'preview');
ensureDir(outDir);
const propsPath = writePropsFile(slug, bundle, false);
runRemotion(['render', 'src/index.ts', 'Episode', path.join(outDir, `${slug}-preview.mp4`), '--props', propsPath, '--scale', '0.5']);
console.log(`Preview written to ${outDir}`);
