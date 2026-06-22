import fs from 'node:fs';
import path from 'node:path';
import {episodeDir} from '../src/editorial/shared/paths';
import {secondsToFrames} from '../src/editorial/shared/timing';
import {validateEpisodeData} from '../src/editorial/validation/validate-episode';
import {ensureDir, getArg, loadEpisodeBundle, printIssues, publicDir, runRemotion, writePropsFile} from './episode-utils';

const slug = getArg('episode', 'demo-paper-lab');
const bundle = loadEpisodeBundle(slug);
const result = validateEpisodeData(bundle.episode, bundle.assets, bundle.sources, {mode: 'preview', publicDir});
printIssues(result.issues);
if (!result.ok) {
  throw new Error('Preview validation failed');
}

const outDir = path.join(episodeDir(slug), 'output', 'keyframes');
ensureDir(outDir);
const propsPath = writePropsFile(slug, bundle, false);
const frames = bundle.episode.scenes.flatMap((scene) => {
  const startFrame = secondsToFrames(scene.start + 0.2, bundle.episode.episode.fps);
  const midFrame = secondsToFrames((scene.start + scene.end) / 2, bundle.episode.episode.fps);
  return [
    {scene, label: 'start', frame: startFrame},
    {scene, label: 'mid', frame: midFrame},
  ];
});

const manifest = [];
for (const item of frames) {
  const fileName = `${item.scene.id}-${item.label}-f${item.frame}.png`;
  const output = path.join(outDir, fileName);
  runRemotion(['still', 'src/index.ts', 'Episode', output, '--props', propsPath, '--frame', String(item.frame)]);
  manifest.push({
    sceneId: item.scene.id,
    frame: item.frame,
    time: item.frame / bundle.episode.episode.fps,
    component: item.scene.kind,
    slot: item.scene.slot,
    assetStatus: item.scene.assetIds.length === 0 ? 'none' : item.scene.assetIds.join(', '),
    fileName,
  });
}
fs.writeFileSync(path.join(outDir, 'frames-manifest.json'), JSON.stringify({frames: manifest}, null, 2));
const html = `<!doctype html><html><head><meta charset="utf-8"><title>${slug} keyframes</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;background:#fafaf7;color:#151515}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:20px;padding:24px}.card{border:1px solid #e8e5df;background:white;padding:12px}.card img{width:100%;display:block}.meta{font-size:14px;line-height:1.5;color:#3c3c3c}</style></head><body><main>${manifest
  .map(
    (frame) =>
      `<section class="card"><img src="./${frame.fileName}" alt="${frame.sceneId}"><div class="meta"><b>${frame.sceneId}</b> ${frame.time.toFixed(
        2,
      )}s<br>${frame.component} / ${frame.slot}<br>asset: ${frame.assetStatus}</div></section>`,
  )
  .join('')}</main></body></html>`;
fs.writeFileSync(path.join(outDir, 'contact-sheet.html'), html);
console.log(`Keyframes written to ${outDir}`);
