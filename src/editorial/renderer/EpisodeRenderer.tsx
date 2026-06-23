import {Sequence} from 'remotion';
import {EditorialStage} from '../stage/EditorialStage';
import type {EpisodeInputProps} from '../schema/episode.types';
import {sceneDurationInFrames, secondsToFrames} from '../shared/timing';
import {SceneRenderer} from './SceneRenderer';

export const EpisodeRenderer = ({episode, assets, sources, debug = false}: EpisodeInputProps) => {
  return (
    <>
      {episode.scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={secondsToFrames(scene.start, episode.episode.fps)}
          durationInFrames={sceneDurationInFrames(scene.start, scene.end, episode.episode.fps)}
        >
          <EditorialStage
            width={episode.episode.width}
            height={episode.episode.height}
            stageMode={scene.stageMode}
            slot={scene.slot}
            presenterMode={episode.presenter.mode}
            debug={debug}
          >
            <SceneRenderer
              scene={scene}
              assets={assets}
              sources={sources}
              fps={episode.episode.fps}
              width={episode.episode.width}
              height={episode.episode.height}
            />
          </EditorialStage>
        </Sequence>
      ))}
    </>
  );
};
