import {Composition} from 'remotion';
import {EpisodeComposition} from './compositions/EpisodeComposition';
import {AcidScrimContactSheet} from './editorial/fixtures/AcidScrimContactSheet';
import {acidStrikeDemos, acidStrikeGallery} from './editorial/fixtures/demo-acid-strike';
import {narrationEchoLayerDemo} from './editorial/fixtures/demo-narration-echo-layer';
import type {EpisodeInputProps} from './editorial/schema/episode.types';
import remotionTalkAssets from '../episodes/RemotionTalk/asset-manifest.json';
import remotionTalkEpisode from '../episodes/RemotionTalk/episode.json';
import remotionTalkSources from '../episodes/RemotionTalk/sources.json';

const remotionTalkProps: EpisodeInputProps = {
  episode: remotionTalkEpisode as EpisodeInputProps['episode'],
  assets: remotionTalkAssets as EpisodeInputProps['assets'],
  sources: remotionTalkSources as EpisodeInputProps['sources'],
  debug: false,
  strict: false,
};

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
        defaultProps={remotionTalkProps}
        calculateMetadata={({props}) => getMetadata(props as EpisodeInputProps)}
      />
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
      <Composition
        id="DemoNarrationEchoLayer"
        component={EpisodeComposition}
        defaultProps={narrationEchoLayerDemo}
        calculateMetadata={({props}) => getMetadata(props as EpisodeInputProps)}
      />
      <Composition
        id="RemotionTalk"
        component={EpisodeComposition}
        defaultProps={remotionTalkProps}
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
