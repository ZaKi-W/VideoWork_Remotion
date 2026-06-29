import type {ReactNode} from 'react';
import {Sequence, useCurrentFrame} from 'remotion';
import type {EpisodeInputProps, EpisodeScene, TalkVideoBaseProps} from '../schema/episode.types';
import {getStageLayout} from '../stage/stage.config';
import {sceneDurationInFrames, secondsToFrames} from '../shared/timing';
import {SceneRenderer} from '../renderer/SceneRenderer';
import {ShotDirector} from './ShotDirector';
import {ShotSubtitleLayer, ShotTalkVideoLayer} from './ShotTalkVideoLayer';
import type {Shot} from './shot.types';

const transitionTailFrames = 24;

const isTalkVideoScene = (scene: EpisodeScene): scene is EpisodeScene & {content: {kind: 'TalkVideoBase'; props: TalkVideoBaseProps}} =>
  scene.kind === 'TalkVideoBase' && scene.content.kind === 'TalkVideoBase';

const layerSequence = (
  scene: EpisodeScene,
  props: EpisodeInputProps,
  node: ReactNode,
): ReactNode => {
  const fps = props.episode.episode.fps;

  return (
    <Sequence
      from={secondsToFrames(scene.start, fps)}
      durationInFrames={sceneDurationInFrames(scene.start, scene.end, fps) + transitionTailFrames}
    >
      {node}
    </Sequence>
  );
};

const renderSceneLayer = (scene: EpisodeScene | undefined, props: EpisodeInputProps, useSlotWrapper: boolean): ReactNode => {
  if (!scene) {
    return null;
  }

  const width = props.episode.episode.width;
  const height = props.episode.episode.height;
  const rendered = (
    <SceneRenderer
      scene={scene}
      assets={props.assets}
      sources={props.sources}
      fps={props.episode.episode.fps}
      width={width}
      height={height}
    />
  );

  if (!useSlotWrapper) {
    return layerSequence(scene, props, rendered);
  }

  const slotRect = getStageLayout(width, height).slots[scene.slot];
  return layerSequence(
    scene,
    props,
    <div
      style={{
        position: 'absolute',
        left: slotRect.x,
        top: slotRect.y,
        width: slotRect.width,
        height: slotRect.height,
        pointerEvents: 'none',
      }}
    >
      {rendered}
    </div>,
  );
};

const currentShotIndexAt = (shots: Shot[], frame: number): number => {
  const index = shots.findIndex((shot) => frame >= shot.from && frame < shot.to);
  if (index >= 0) {
    return index;
  }

  return shots.length - 1;
};

export const ShotTimelineDirector = (props: EpisodeInputProps) => {
  const frame = useCurrentFrame();
  const shots = [...(props.episode.shots ?? [])].sort((a, b) => a.from - b.from);
  const shotIndex = currentShotIndexAt(shots, frame);
  const shot = shots[shotIndex];
  const previousShot = shotIndex > 0 ? shots[shotIndex - 1] : undefined;
  const talkScene = props.episode.scenes.find(isTalkVideoScene);
  const sceneById = new Map(props.episode.scenes.map((scene) => [scene.id, scene]));

  if (!shot || !talkScene) {
    return null;
  }

  const contentScene = shot.contentId ? sceneById.get(shot.contentId) : undefined;
  const previousContentScene = previousShot?.contentId ? sceneById.get(previousShot.contentId) : undefined;
  const summaryScene = shot.summaryId ? sceneById.get(shot.summaryId) : undefined;
  const previousSummaryScene = previousShot?.summaryId ? sceneById.get(previousShot.summaryId) : undefined;
  const sidecarScene = shot.sidecarId ? sceneById.get(shot.sidecarId) : undefined;
  const previousSidecarScene = previousShot?.sidecarId
    ? sceneById.get(previousShot.sidecarId)
    : undefined;

  return (
    <>
      <ShotDirector
        shot={shot}
        previousShot={previousShot}
        talkVideoLayer={<ShotTalkVideoLayer {...talkScene.content.props} />}
        contentLayer={renderSceneLayer(contentScene, props, false)}
        previousContentLayer={renderSceneLayer(previousContentScene, props, false)}
        summaryLayer={renderSceneLayer(summaryScene, props, true)}
        previousSummaryLayer={renderSceneLayer(previousSummaryScene, props, true)}
        sidecarLayer={renderSceneLayer(sidecarScene, props, true)}
        previousSidecarLayer={renderSceneLayer(previousSidecarScene, props, true)}
        contentTakeoverFullBleed={contentScene?.kind === 'PixelReveal'}
        previousContentTakeoverFullBleed={
          previousContentScene?.kind === 'PixelReveal'
        }
      />
      <ShotSubtitleLayer {...talkScene.content.props} />
    </>
  );
};
