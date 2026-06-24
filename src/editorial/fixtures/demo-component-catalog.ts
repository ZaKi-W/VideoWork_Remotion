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
  TrendTotem: baseInput('demo-trend-totem', 'C23 TrendTotem Demo', [
    {
      id: 'demo-trend-totem-main',
      start: 0,
      end: 6,
      track: 'overlay',
      kind: 'TrendTotem',
      stageMode: 'presenter-center',
      slot: 'edge-left',
      content: {
        kind: 'TrendTotem',
        props: {
          kicker: '更前沿 · 更早看见机会',
          label: 'EARLY MOVE',
          title: ['抢先', '布局'],
          copy: '未来新方向 · 适合强调“新机会 / 新趋势 / 值得提前做”的判断句。',
          foot: '左侧摘要 / 大字趋势型',
          emphasis: '布局',
          accent: 'yellow',
          blocks: [],
        },
      },
      assetIds: [],
      sourceRefIds: [],
      status: 'ready',
      notes: 'Standalone TrendTotem demo.',
    },
  ], {durationInSeconds: 6}),
  TrendBanner: baseInput('demo-trend-banner', 'C24 TrendBanner Demo', [
    {
      id: 'demo-trend-banner-main',
      start: 0,
      end: 6,
      track: 'overlay',
      kind: 'TrendBanner',
      stageMode: 'presenter-center',
      slot: 'edge-left',
      content: {
        kind: 'TrendBanner',
        props: {
          kicker: '趋势判断 · 明确看好',
          label: 'NEW DIRECTION',
          title: ['未来大趋势', '值得提前做'],
          copy: '大标题更完整，适合承接口播里的观点句、判断句、结论句。',
          foot: '左侧摘要 / 横向主标题型',
          accent: 'blue',
          blocks: [],
        },
      },
      assetIds: [],
      sourceRefIds: [],
      status: 'ready',
      notes: 'Standalone TrendBanner demo.',
    },
  ], {durationInSeconds: 6}),
  TopicSignal: baseInput('demo-topic-signal', 'C25 TopicSignal Demo', [
    {
      id: 'demo-topic-signal-main',
      start: 0,
      end: 7,
      track: 'overlay',
      kind: 'TopicSignal',
      stageMode: 'presenter-center',
      slot: 'edge-left',
      content: {
        kind: 'TopicSignal',
        props: {
          label: 'AI HOT TRACK',
          kicker: 'FOCUS TOPIC · PRACTICAL ENTRY',
          title: ['TOPIC', '切口'],
          copy: '一句补充说明 · 适合讲这段内容的核心切入点',
          foot: '左侧摘要 / 卡片信息型',
          accent: 'orange',
          blocks: [
            {label: 'NEW SPACE', title: '新机会\n可先占位', icon: '✦', accent: 'cyan'},
            {label: 'UNPACKED', title: '尚未讲透\n适合展开', icon: '●', accent: 'orange'},
            {label: 'JUST DO', title: '行动优先\n先做再说', icon: '↗', accent: 'yellow'},
          ],
        },
      },
      assetIds: [],
      sourceRefIds: [],
      status: 'ready',
      notes: 'Standalone TopicSignal demo.',
    },
  ], {durationInSeconds: 7}),
  SideBrief: baseInput('demo-side-brief', 'C26 SideBrief Demo', [
    {
      id: 'demo-side-brief-main',
      start: 0,
      end: 7,
      track: 'overlay',
      kind: 'SideBrief',
      stageMode: 'presenter-center',
      slot: 'edge-right',
      content: {
        kind: 'SideBrief',
        props: {
          kicker: '关键补充',
          index: '01',
          title: ['默认效果只是起点。', '真正决定内容质感的，', '是你的视觉判断。'],
          copy: '把不属于你的默认感删掉，把真正重要的内容和节奏留下来，画面才会开始有自己的表达。',
          focus: '先判断，再加效果',
          tail: '从右侧建立一个稳定的收束点',
          foot: '右侧补充 / 结论收束',
          emphasis: '视觉判断',
          accent: 'acid',
          blocks: [],
        },
      },
      assetIds: [],
      sourceRefIds: [],
      status: 'ready',
      notes: 'Standalone SideBrief demo.',
    },
  ], {durationInSeconds: 7}),
};
