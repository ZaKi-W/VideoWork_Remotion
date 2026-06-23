import {AbsoluteFill, Sequence} from 'remotion';
import {EditorialStage} from '../stage/EditorialStage';
import type {EpisodeInputProps} from '../schema/episode.types';
import {sceneDurationInFrames, secondsToFrames} from '../shared/timing';
import {SceneRenderer} from './SceneRenderer';
import {getStageLayout} from '../stage/stage.config';

const scenesOverlap = (a: {start: number; end: number}, b: {start: number; end: number}): boolean =>
  a.start < b.end && b.start < a.end;

export const EpisodeRenderer = ({episode, assets, sources, debug = false}: EpisodeInputProps) => {
  const layout = getStageLayout(episode.episode.width, episode.episode.height);

  return (
    <>
      {episode.scenes.map((scene) => {
        const hasBaseSceneUnderOverlay =
          scene.track === 'overlay' &&
          episode.scenes.some((candidate) => candidate.track !== 'overlay' && scenesOverlap(scene, candidate));
        const slotRect = layout.slots[scene.slot];

        return (
          <Sequence
            key={scene.id}
            from={secondsToFrames(scene.start, episode.episode.fps)}
            durationInFrames={sceneDurationInFrames(scene.start, scene.end, episode.episode.fps)}
          >
            {hasBaseSceneUnderOverlay ? (
              <AbsoluteFill style={{pointerEvents: 'none'}}>
                <div
                  style={{
                    position: 'absolute',
                    left: slotRect.x,
                    top: slotRect.y,
                    width: slotRect.width,
                    height: slotRect.height,
                  }}
                >
                  <SceneRenderer
                    scene={scene}
                    assets={assets}
                    sources={sources}
                    fps={episode.episode.fps}
                    width={episode.episode.width}
                    height={episode.episode.height}
                  />
                </div>
              </AbsoluteFill>
            ) : (
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
            )}
          </Sequence>
        );
      })}
    </>
  );
};
