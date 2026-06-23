import type {EpisodeInputProps, EpisodeScene} from '../schema/episode.types';

const talkVideoAsset = {
  id: 'talk-video',
  type: 'talk-video' as const,
  path: 'episodes/RemotionTalk/talk.mp4',
  purpose: 'Local talk video for component preview.',
  sourceRefId: 'local-talk-video',
  sceneHints: ['component-demo'],
  status: 'ready' as const,
  priority: 'medium' as const,
};

const talkSubtitleAsset = {
  id: 'talk-subtitle',
  type: 'subtitle' as const,
  path: 'episodes/RemotionTalk/talk.srt',
  purpose: 'Local talk subtitle for component preview.',
  sourceRefId: 'local-talk-subtitle',
  sceneHints: ['component-demo'],
  status: 'ready' as const,
  priority: 'medium' as const,
};

const localTalkSource = {
  id: 'local-talk-video',
  title: 'RemotionTalk local video',
  publisher: 'local',
  url: 'episodes/RemotionTalk/talk.mp4',
  publishedAt: '2026-06-23',
  capturedAssetId: 'talk-video',
  notes: 'Local video for preview only.',
  kind: 'local' as const,
  status: 'captured' as const,
};

const localSubtitleSource = {
  id: 'local-talk-subtitle',
  title: 'RemotionTalk local subtitle',
  publisher: 'local',
  url: 'episodes/RemotionTalk/talk.srt',
  publishedAt: '2026-06-23',
  capturedAssetId: 'talk-subtitle',
  notes: 'Local subtitle for preview only.',
  kind: 'local' as const,
  status: 'captured' as const,
};

const baseInput = (
  id: string,
  title: string,
  scenes: EpisodeScene[],
  options: {
    durationInSeconds?: number;
    assets?: EpisodeInputProps['assets']['assets'];
    sources?: EpisodeInputProps['sources']['sources'];
  } = {},
): EpisodeInputProps => ({
  debug: false,
  strict: false,
  assets: {assets: options.assets ?? []},
  sources: {sources: options.sources ?? []},
  episode: {
    version: 1,
    episode: {
      id,
      title,
      width: 1920,
      height: 1080,
      fps: 30,
      durationInSeconds: options.durationInSeconds ?? 8,
      status: 'QC',
    },
    presenter: {
      mode: 'placeholder',
      videoAssetId: null,
      subtitleAssetId: null,
      defaultStageMode: 'presenter-center',
    },
    scenes,
  },
});

export const componentDemos: Record<string, EpisodeInputProps> = {
  TalkVideoBase: baseInput(
    'demo-talk-video-base',
    'BASE TalkVideoBase Preview',
    [
      {
        id: 'demo-talk-video-base-main',
        start: 0,
        end: 8,
        track: 'background',
        kind: 'TalkVideoBase',
        stageMode: 'no-presenter',
        slot: 'full-bleed',
        content: {
          kind: 'TalkVideoBase',
          props: {
            videoPath: 'episodes/RemotionTalk/talk.mp4',
            subtitlePath: 'episodes/RemotionTalk/talk.srt',
            audio: false,
            fit: 'cover',
            subtitleMaxWidth: 1040,
          },
        },
        assetIds: ['talk-video', 'talk-subtitle'],
        sourceRefIds: ['local-talk-video', 'local-talk-subtitle'],
        status: 'ready',
        notes: 'Standalone TalkVideoBase demo.',
      },
    ],
    {durationInSeconds: 8, assets: [talkVideoAsset, talkSubtitleAsset], sources: [localTalkSource, localSubtitleSource]},
  ),
  RemotionTalkEffect: baseInput('demo-remotion-talk-effect', 'C21 RemotionTalkEffect Demo', [
    {
      id: 'demo-remotion-talk-effect-main',
      start: 0,
      end: 8,
      track: 'overlay',
      kind: 'RemotionTalkEffect',
      stageMode: 'presenter-center',
      slot: 'edge-left',
      content: {
        kind: 'RemotionTalkEffect',
        props: {
          variant: 'handoff',
          eyebrow: 'COMPONENT DEMO',
          title: '自动化视频特效',
          subtitle: '标题打字机、左侧黑底、亮色信息层',
          accent: 'lime',
          index: 'C21',
          left: '素材',
          right: '预览',
          items: ['读素材', '做结构', '进 Studio'],
        },
      },
      assetIds: [],
      sourceRefIds: [],
      status: 'ready',
      notes: 'Standalone RemotionTalkEffect demo.',
    },
  ]),
};
