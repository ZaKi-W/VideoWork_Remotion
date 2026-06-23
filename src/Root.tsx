import {Composition} from 'remotion';
import {EpisodeComposition} from './compositions/EpisodeComposition';
import {AcidScrimContactSheet} from './editorial/fixtures/AcidScrimContactSheet';
import {acidStrikeDemos, acidStrikeGallery} from './editorial/fixtures/demo-acid-strike';
import type {EpisodeInputProps} from './editorial/schema/episode.types';

const getMetadata = (props: EpisodeInputProps) => ({
  width: props.episode.episode.width,
  height: props.episode.episode.height,
  fps: props.episode.episode.fps,
  durationInFrames: Math.ceil(props.episode.episode.durationInSeconds * props.episode.episode.fps),
});

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="AcidStrikeGallery"
        component={EpisodeComposition}
        defaultProps={acidStrikeGallery}
        calculateMetadata={({props}) => getMetadata(props as EpisodeInputProps)}
      />
      <Composition
        id="AcidScrimContactSheet"
        component={AcidScrimContactSheet}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      {Object.entries(acidStrikeDemos).map(([kind, props]) => (
        <Composition
          key={`Demo${kind}`}
          id={`Demo${kind}`}
          component={EpisodeComposition}
          defaultProps={props}
          calculateMetadata={({props: compositionProps}) => getMetadata(compositionProps as EpisodeInputProps)}
        />
      ))}
    </>
  );
};
