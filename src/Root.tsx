import {Composition} from 'remotion';
import {EpisodeComposition} from './compositions/EpisodeComposition';
import {AcidScrimContactSheet} from './editorial/fixtures/AcidScrimContactSheet';
import {AcidSrtSubtitleDemo} from './editorial/components/AcidSrtSubtitle';
import {componentDemos} from './editorial/fixtures/demo-component-catalog';
import {acidGallery, acidStrikeDemos} from './editorial/fixtures/demo-acid-strike';
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

const acidSrtSubtitleDemoSrt = `1
00:00:00,300 --> 00:00:02,950
这是一个只靠 SRT 驱动的底部字幕层，不需要任何关键词配置。

2
00:00:03,050 --> 00:00:06,100
它会自动按中文标点切分短语，然后把当前读到的位置变成酸绿色。

3
00:00:06,250 --> 00:00:09,400
如果单段文字偏长，组件会继续按字数拆分，保持两行以内的轻量阅读节奏。`;

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
        id="AcidGallery"
        component={EpisodeComposition}
        defaultProps={acidGallery}
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
        id={componentCompositionId('AcidSrtSubtitle')}
        component={AcidSrtSubtitleDemo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{srt: acidSrtSubtitleDemoSrt}}
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
