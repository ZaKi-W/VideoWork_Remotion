import {getArg, loadEpisodeBundle, printIssues, publicDir, syncEpisodeAssetsToPublic} from './episode-utils';
import {validateEpisodeData} from '../src/editorial/validation/validate-episode';

const slug = getArg('episode', 'demo-paper-lab');
const strict = process.argv.includes('--strict');
syncEpisodeAssetsToPublic(slug);
const bundle = loadEpisodeBundle(slug);
const result = validateEpisodeData(bundle.episode, bundle.assets, bundle.sources, {
  mode: strict ? 'strict' : 'preview',
  publicDir,
});
printIssues(result.issues);
if (!result.ok) {
  process.exitCode = 1;
}
