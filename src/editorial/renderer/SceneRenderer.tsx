import type {EpisodeInputProps, EpisodeScene} from '../schema/episode.types';
import {componentRegistry} from '../registry/component-registry';
import {sceneDurationInFrames} from '../shared/timing';

type Props = {
  scene: EpisodeScene;
  assets: EpisodeInputProps['assets'];
  sources: EpisodeInputProps['sources'];
  fps: number;
  width: number;
  height: number;
};

export const SceneRenderer = ({scene, assets, sources, fps, width, height}: Props) => {
  const item = componentRegistry[scene.kind];
  const assetStatus =
    scene.assetIds.length === 0
      ? '无需素材'
      : scene.assetIds
          .map((assetId) => assets.assets.find((asset) => asset.id === assetId)?.status ?? 'missing')
          .join(', ');

  return (
    <>
      {item.render({
        scene,
        assets,
        sources,
        assetStatus,
        durationInFrames: sceneDurationInFrames(scene.start, scene.end, fps),
        width,
        height,
      })}
    </>
  );
};
