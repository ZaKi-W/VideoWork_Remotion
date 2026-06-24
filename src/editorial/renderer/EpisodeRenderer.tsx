import {AbsoluteFill, Sequence} from 'remotion';
import {EditorialStage} from '../stage/EditorialStage';
import type {EpisodeInputProps} from '../schema/episode.types';
import {sceneDurationInFrames, secondsToFrames} from '../shared/timing';
import {SceneRenderer} from './SceneRenderer';
import {getStageLayout} from '../stage/stage.config';
import {ShotTimelineDirector} from '../shot/ShotTimelineDirector';

const scenesOverlap = (a: {start: number; end: number}, b: {start: number; end: number}): boolean =>
  a.start < b.end && b.start < a.end;

const hasOwnFullCanvasBackground = (scene: EpisodeInputProps['episode']['scenes'][number]): boolean =>
  scene.content.kind === 'NarrationEchoLayer' && Boolean(scene.content.props.backgroundVideoPath);

export const EpisodeRenderer = ({episode, assets, sources, debug = false}: EpisodeInputProps) => {
  if (episode.shots && episode.shots.length > 0) {
    return <ShotTimelineDirector episode={episode} assets={assets} sources={sources} debug={debug} />;
  }

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
            {hasOwnFullCanvasBackground(scene) ? (
              <AbsoluteFill style={{pointerEvents: 'none'}}>
                <SceneRenderer
                  scene={scene}
                  assets={assets}
                  sources={sources}
                  fps={episode.episode.fps}
                  width={episode.episode.width}
                  height={episode.episode.height}
                />
              </AbsoluteFill>
            ) : hasBaseSceneUnderOverlay ? (
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
