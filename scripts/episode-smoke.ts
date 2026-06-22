import path from 'node:path';
import {episodeDir} from '../src/editorial/shared/paths';
import {validateEpisodeData} from '../src/editorial/validation/validate-episode';
import {ensureDir, loadEpisodeBundle, printIssues, publicDir, runRemotion, writePropsFile} from './episode-utils';

const slug = 'demo-paper-lab';
const bundle = loadEpisodeBundle(slug);
const result = validateEpisodeData(bundle.episode, bundle.assets, bundle.sources, {mode: 'preview', publicDir});
printIssues(result.issues);
if (!result.ok) {
  throw new Error('Smoke validation failed');
}

const smokeDir = path.join(episodeDir(slug), 'output', 'smoke');
ensureDir(smokeDir);
const propsPath = writePropsFile(slug, bundle, false);
runRemotion(['still', 'src/index.ts', 'Episode', path.join(smokeDir, 'smoke-frame.png'), '--props', propsPath, '--frame', '15']);
runRemotion([
  'render',
  'src/index.ts',
  'Episode',
  path.join(smokeDir, 'smoke-preview.mp4'),
  '--props',
  propsPath,
  '--scale',
  '0.25',
]);
console.log('episode:smoke succeeded');
