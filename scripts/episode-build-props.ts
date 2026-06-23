import {getArg, loadEpisodeBundle, syncEpisodeAssetsToPublic, writePropsFile} from './episode-utils';

const slug = getArg('episode', 'demo-paper-lab');
const strict = process.argv.includes('--strict');
syncEpisodeAssetsToPublic(slug);
const propsPath = writePropsFile(slug, loadEpisodeBundle(slug), strict);
console.log(propsPath);
