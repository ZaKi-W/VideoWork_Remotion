import fs from 'node:fs';
import path from 'node:path';
import {episodeAssetsDir, episodeDir, repoRoot} from '../src/editorial/shared/paths';
import {ensureDir, getArg} from './episode-utils';

const slug = getArg('slug');
const destination = episodeDir(slug);
if (fs.existsSync(destination)) {
  throw new Error(`Episode already exists: ${slug}`);
}

fs.cpSync(path.join(repoRoot, 'episodes', '_template'), destination, {recursive: true});
ensureDir(episodeAssetsDir(slug));
fs.writeFileSync(path.join(episodeAssetsDir(slug), '.gitkeep'), '');
console.log(`Created episode ${slug}`);
