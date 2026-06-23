import {Composition} from 'remotion';
import {EpisodeComposition} from './compositions/EpisodeComposition';
import {AcidScrimContactSheet} from './editorial/fixtures/AcidScrimContactSheet';
import {componentDemos} from './editorial/fixtures/demo-component-catalog';
import {acidStrikeDemos, acidStrikeGallery} from './editorial/fixtures/demo-acid-strike';
import {narrationEchoLayerDemo} from './editorial/fixtures/demo-narration-echo-layer';
import {
  componentCatalog,
  componentCompositionId,
  systemPreviewCatalog,
  systemPreviewCompositionId,
} from './editorial/registry/component-catalog';
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
      {componentCatalog.map(({kind}) => {
        const props =
          kind === 'NarrationEchoLayer'
            ? narrationEchoLayerDemo
            : acidStrikeDemos[kind as keyof typeof acidStrikeDemos] ?? componentDemos[kind];
        if (!props) {
          return null;
        }

        return (
          <Composition
            key={componentCompositionId(kind)}
            id={componentCompositionId(kind)}
            component={EpisodeComposition}
            defaultProps={props}
            calculateMetadata={({props: compositionProps}) => getMetadata(compositionProps as EpisodeInputProps)}
          />
        );
      })}
      {systemPreviewCatalog.map(({kind}) => {
        const props = componentDemos[kind];
        if (!props) {
          return null;
        }

        return (
          <Composition
            key={systemPreviewCompositionId(kind)}
            id={systemPreviewCompositionId(kind)}
            component={EpisodeComposition}
            defaultProps={props}
            calculateMetadata={({props: compositionProps}) => getMetadata(compositionProps as EpisodeInputProps)}
          />
        );
      })}
    </>
  );
};
