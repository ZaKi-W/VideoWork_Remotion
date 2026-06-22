import {Composition} from 'remotion';
import {EpisodeComposition} from './compositions/EpisodeComposition';
import {componentGallery} from './editorial/fixtures/component-gallery';
import {demoHeadlineTakeover} from './editorial/fixtures/demo-headline-takeover';
import {demoPaperLab} from './editorial/fixtures/demo-paper-lab';
import {demoSectionStamp} from './editorial/fixtures/demo-section-stamp';
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
        id="Episode"
        component={EpisodeComposition}
        defaultProps={demoPaperLab}
        calculateMetadata={({props}) => getMetadata(props as EpisodeInputProps)}
      />
      <Composition
        id="DemoSectionStamp"
        component={EpisodeComposition}
        defaultProps={demoSectionStamp}
        calculateMetadata={({props}) => getMetadata(props as EpisodeInputProps)}
      />
      <Composition
        id="DemoHeadlineTakeover"
        component={EpisodeComposition}
        defaultProps={demoHeadlineTakeover}
        calculateMetadata={({props}) => getMetadata(props as EpisodeInputProps)}
      />
      <Composition
        id="ComponentGallery"
        component={EpisodeComposition}
        defaultProps={componentGallery}
        calculateMetadata={({props}) => getMetadata(props as EpisodeInputProps)}
      />
    </>
  );
};
