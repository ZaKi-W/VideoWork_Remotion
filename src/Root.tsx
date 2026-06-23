import {Composition} from 'remotion';
import {EpisodeComposition} from './compositions/EpisodeComposition';
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
