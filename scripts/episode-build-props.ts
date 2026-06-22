import {getArg, loadEpisodeBundle, writePropsFile} from './episode-utils';

const slug = getArg('episode', 'demo-paper-lab');
const strict = process.argv.includes('--strict');
const propsPath = writePropsFile(slug, loadEpisodeBundle(slug), strict);
console.log(propsPath);
