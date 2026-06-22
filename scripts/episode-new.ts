import fs from 'node:fs';
import path from 'node:path';
import {episodeDir, publicEpisodeAssetsDir, repoRoot} from '../src/editorial/shared/paths';
import {ensureDir, getArg} from './episode-utils';

const slug = getArg('slug');
const destination = episodeDir(slug);
if (fs.existsSync(destination)) {
  throw new Error(`Episode already exists: ${slug}`);
}

fs.cpSync(path.join(repoRoot, 'episodes', '_template'), destination, {recursive: true});
for (const dir of ['screenshots', 'recordings', 'images', 'generated', 'logos']) {
  ensureDir(path.join(publicEpisodeAssetsDir(slug), dir));
  fs.writeFileSync(path.join(publicEpisodeAssetsDir(slug), dir, '.gitkeep'), '');
}
console.log(`Created episode ${slug}`);
