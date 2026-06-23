import type {AcidComponentProps, EpisodeInputProps, EpisodeScene, NarrationEchoLayerProps} from '../schema/episode.types';

const acidKinds = [
  'MediaWall',
  'Countdown',
  'ChapterIndex',
  'CountryGap',
  'ReleaseTimeline',
  'StatsBoard',
  'Ecosystem',
  'OpenSourceWave',
  'MapFocus',
  'TimeGap',
  'PricePage',
  'TokenBoard',
  'AgentExecution',
] as const;

type AcidKind = (typeof acidKinds)[number];

const talkVideoPath = 'episodes/RemotionTalk/talk.mp4';

const demoSource = {
  id: 'source-acid-demo',
  title: 'Acid Strike demo source placeholder',
  publisher: 'Zaki Video Pipeline',
  url: '',
  publishedAt: '2026-06-23',
  capturedAssetId: '',
  notes: 'local demo source for Acid Strike component previews',
  kind: 'demo' as const,
  status: 'provided' as const,
};

const acidProps = (
  props: Omit<AcidComponentProps, 'items' | 'messages' | 'mediaCount' | 'scrimIntensity'> &
    Partial<Pick<AcidComponentProps, 'items' | 'messages' | 'mediaCount' | 'scrimIntensity'>>,
): AcidComponentProps => ({
  items: [],
  messages: [],
  mediaCount: 48,
  scrimIntensity: 'soft',
  ...props,
});

const acidPropsByKind = {
  MediaWall: acidProps({
    eyebrow: 'ACID STRIKE / WEEKLY FIELD NOTE',
    title: ['AI 热点', '大事'],
    subtitle: '这一期，我们把最近最重要的 AI 更新放在一张图里看。',
    subtitleEn: 'Here is one visual map of the biggest recent AI updates.',
    mediaCount: 48,
  }),
  Countdown: acidProps({
    topic: 'RECAP',
    topicDetail: 'TIME WINDOW / 2026',
    eyebrow: 'COUNTDOWN',
    title: ['三个月'],
    primaryValue: '90',
    primaryUnit: 'DAYS',
    copy: '从模型、价格到 Agent，变化密度已经远超前一个周期。',
    subtitle: '可能过两周再看，很多结论又得重新写一遍。',
    subtitleEn: 'In two weeks, many conclusions may already need an update.',
  }),
  ChapterIndex: acidProps({
    eyebrow: 'BATTLEGROUNDS / 01',
    title: ['模型战场'],
    items: [
      {label: '模型之争', detail: 'model race'},
      {label: '价格之争', detail: 'price war'},
      {label: '智能体之争', detail: 'agent battle'},
      {label: '多模态之争', detail: 'multimodal'},
      {label: '算力之争', detail: 'compute'},
      {label: '人才与资本', detail: 'talent'},
    ],
    subtitle: '我把整个问题拆成六条主线，后面按顺序讲。',
    subtitleEn: 'I broke the topic into six tracks and will go through them one by one.',
  }),
  CountryGap: acidProps({
    topic: 'BATTLEGROUND / 02',
    topicDetail: 'MODEL GAP',
    title: ['中美代差'],
    items: [
      {label: 'US / 美国', value: '3', detail: '领先模型梯队'},
      {label: 'CN / 中国', value: '10+', detail: '快速追赶模型'},
      {label: 'MODEL A'},
      {label: 'MODEL B'},
      {label: 'MODEL C'},
      {label: 'MODEL D'},
      {label: 'MODEL E'},
      {label: 'MODEL F'},
    ],
    subtitle: '双方都在快速迭代，只是速度和节奏完全不同。',
    subtitleEn: 'Both sides are iterating fast, but with very different cadence.',
  }),
  ReleaseTimeline: acidProps({
    topic: 'OPEN MODELS',
    topicDetail: 'RELEASE TIMELINE',
    eyebrow: 'RELEASE TRACK',
    title: ['模型更新', '密集出现'],
    items: [
      {label: '05.08', value: 'MODEL 5', detail: '推理与长上下文升级'},
      {label: '05.12', value: 'MODEL 5.1', detail: '工具调用与执行能力增强'},
      {label: '05.20', value: 'MODEL 5.2', detail: '多模态与视频理解'},
      {label: '05.27', value: 'MODEL 5.3', detail: '开发者成本策略调整'},
      {label: '06.03', value: 'MODEL 5.5', detail: 'Agent 工作流升级'},
    ],
    source: {
      label: 'Official update',
      code: '05-A',
      meta: 'Release note · captured screenshot',
      title: '这里放真实发布公告、版本日志或官方产品页',
      highlight: '时间线讲到哪一条，右侧就切到对应来源或截图。',
      footer: 'Release note',
      sourceRefId: 'source-acid-demo',
    },
    subtitle: '不是单个模型在升级，是整个发布节奏都在提速。',
    subtitleEn: 'The entire release cadence is accelerating, not just one model.',
  }),
  StatsBoard: acidProps({
    topic: 'BENCHMARK BOARD',
    topicDetail: 'MODEL PERFORMANCE',
    eyebrow: 'KEY METRICS',
    title: ['能力', '跃升'],
    items: [
      {label: '推理能力', value: '+8.4%'},
      {label: '代码能力', value: '+6.2%'},
      {label: '多模态理解', value: '+9.1%'},
      {label: 'Reason', value: '88', percent: 88},
      {label: 'Code', value: '79', percent: 79},
      {label: 'Vision', value: '84', percent: 84},
    ],
    source: {
      label: 'Benchmark report',
      code: '06-B',
      meta: 'Performance report · verified crop',
      title: '右侧放报告原图或 benchmark 页的关键区域',
      highlight: '左侧整理数据，右侧保留原始证据，逻辑就完整了。',
      footer: 'Report page',
      sourceRefId: 'source-acid-demo',
    },
    subtitle: '最明显的变化，是它不只会回答，而是开始稳定地完成任务。',
    subtitleEn: 'The visible shift is from answering to reliably completing tasks.',
  }),
  Ecosystem: acidProps({
    topic: 'ECOSYSTEM',
    topicDetail: 'PRODUCT SURFACE',
    eyebrow: 'ONE PLATFORM / MANY ENTRY POINTS',
    title: ['全家桶', '生态'],
    items: [
      {label: 'MODEL APP', detail: '对话与创作入口'},
      {label: 'VIDEO CREATE', detail: '视频生成与编辑'},
      {label: 'WORKSPACE', detail: '文档与团队协作'},
      {label: 'AGENT API', detail: '面向开发与自动化'},
      {label: 'CLOUD PLATFORM', detail: '模型和算力基础层'},
    ],
    subtitle: '真正有竞争力的，不只是一个模型，而是一整套生态入口。',
    subtitleEn: 'Real advantage comes from an ecosystem, not just one model.',
  }),
  OpenSourceWave: acidProps({
    topic: 'OPEN-SOURCE WAVE',
    topicDetail: 'COMMUNITY MOMENTUM',
    eyebrow: 'OPEN MODELS / COMMUNITY',
    title: ['开源潮', '来了'],
    items: [
      {label: '模型 A 发布', detail: '开放权重，支持本地部署'},
      {label: '模型 B 跟进', detail: '更长上下文与工具调用'},
      {label: '模型 C 上线', detail: '面向开发者的轻量版本'},
      {label: '模型 D 扩展', detail: '生态插件与社区工具'},
      {label: '模型 E 迭代', detail: '更低成本与更高吞吐'},
    ],
    source: {
      label: 'Community page',
      code: '08-C',
      meta: 'Open source release · captured page',
      title: '这里可放模型页、下载页、社区榜单、仓库截图',
      highlight: '左侧用清单讲趋势，右侧用真实页面证明发布确实发生。',
      footer: 'Community source',
      sourceRefId: 'source-acid-demo',
    },
    subtitle: '这波开源潮真正改变的，是普通人获取能力的门槛。',
    subtitleEn: 'The open-source wave changes who can access these capabilities.',
  }),
  MapFocus: acidProps({
    topic: 'GLOBAL ACCESS',
    topicDetail: 'COMPUTE / INFRASTRUCTURE',
    eyebrow: 'COMPUTE DISTRIBUTION',
    title: ['全球进入', '中国'],
    copy: '模型能力最终还要落到算力、部署和用户能不能真正用上。',
    items: [
      {label: '可用区域', value: '500+'},
      {label: '服务节点', value: '200+'},
    ],
    subtitle: '真正的差距，不只看模型，还要看谁能把能力接进真实世界。',
    subtitleEn: 'The gap is not only models, but who can deliver capability to the real world.',
  }),
  TimeGap: acidProps({
    topic: 'GENERATION GAP',
    topicDetail: 'TIME TO FOLLOW',
    title: ['时间差'],
    primaryValue: '6',
    primaryUnit: '个月',
    caption: '误差',
    subtitle: '我个人感觉，模型能力的代差正在被压缩到半年以内。',
    subtitleEn: 'The perceived gap is compressing to within about six months.',
  }),
  PricePage: acidProps({
    topic: 'PRICE WAR',
    topicDetail: 'MODEL COST RESET',
    eyebrow: 'DEVELOPER PRICING',
    title: ['价格屠杀'],
    primaryValue: '2.5',
    primaryUnit: '折',
    items: [
      {label: '输入', detail: '¥0.103', value: '¥0.026'},
      {label: '输出', detail: '¥12.35', value: '¥3.09'},
      {label: '缓存', detail: '¥24.71', value: '¥6.18'},
    ],
    source: {
      label: 'Pricing page',
      code: '11-A',
      meta: 'Public pricing · captured page',
      title: '这里放官方价格页截图，重点裁出价格表本体',
      highlight: '右侧来源越直观，左侧的“价格战”判断就越站得住。',
      footer: 'Price sheet',
      sourceRefId: 'source-acid-demo',
    },
    subtitle: '开发者看价格，最终看的就是能不能把规模跑起来。',
    subtitleEn: 'Developers care about whether the economics can scale.',
  }),
  TokenBoard: acidProps({
    topic: 'TOKEN ECONOMY',
    topicDetail: 'UNIT COST COMPARISON',
    eyebrow: 'COST PER MILLION TOKENS',
    title: ['成本', '打折'],
    primaryValue: '1/35',
    primaryUnit: '原价水平',
    copy: '同样预算下，能跑的调用量和产品空间都被拉大了。',
    items: [
      {label: '旧方案', value: '100', percent: 100},
      {label: '新方案', value: '38', percent: 38},
      {label: '缓存后', value: '12', percent: 12},
    ],
    source: {
      label: 'Pricing source',
      code: '12-A',
      meta: 'Cost sheet · verified crop',
      title: '右侧可放价格明细、调用记录、控制台截图',
      highlight: '数据图只是结论，真实价格页才是观众确认结论的依据。',
      footer: 'Cost source',
      sourceRefId: 'source-acid-demo',
    },
    subtitle: '成本降下来以后，产品形态才有更多可能。',
    subtitleEn: 'Lower cost opens room for entirely different product shapes.',
  }),
  AgentExecution: acidProps({
    topic: 'BATTLEGROUND / AGENT',
    topicDetail: 'EXECUTION MODE',
    eyebrow: 'NOT JUST CHAT',
    title: ['Agent', '能执行'],
    copy: '它不是单纯在聊天框里给你建议，而是能把任务拆开、推进并完成。',
    items: [
      {label: '读文件', value: 'YES'},
      {label: '改文件', value: 'YES'},
      {label: '执行任务', value: 'YES'},
    ],
    messages: [
      {speaker: 'me', text: '帮我把这段视频的素材和字幕整理成一个项目。'},
      {speaker: 'agent', text: '我会先读取目录、检查素材，然后生成分镜配置。'},
      {speaker: 'agent', text: '已完成：素材归类、字幕解析、场景清单生成。'},
      {speaker: 'me', text: '接着把预览也渲染出来。'},
      {speaker: 'agent', text: '任务已提交，正在生成低清预览。'},
    ],
    subtitle: '讲得再厉害，不如它真的把任务替你做完。',
    subtitleEn: 'What matters is not talk, but whether it actually finishes the task.',
  }),
} satisfies Record<AcidKind, AcidComponentProps>;

const makeScene = (
  kind: AcidKind,
  index: number,
  start: number,
  end: number,
  backgroundVideoPath?: string,
): EpisodeScene => {
  const sourceKinds: AcidKind[] = ['ReleaseTimeline', 'StatsBoard', 'OpenSourceWave', 'PricePage', 'TokenBoard'];

  return {
    id: `scene-acid-${String(index + 1).padStart(2, '0')}-${kind}`,
    start,
    end,
    track: 'primary',
    kind,
    stageMode: 'no-presenter',
    slot: 'full-bleed',
    content: {
      kind,
      props: {
        ...acidPropsByKind[kind],
        backgroundVideoPath,
      },
    },
    assetIds: [],
    sourceRefIds: sourceKinds.includes(kind) ? ['source-acid-demo'] : [],
    status: 'ready',
    notes: 'Acid Strike reusable component demo.',
  } as unknown as EpisodeScene;
};

const narrationEchoProps: NarrationEchoLayerProps = {
  placement: 'edge-left',
  charFrames: 2,
  segmentPauseFrames: 6,
  exitFrames: 12,
  exitAtFrame: 411,
  showSoftener: true,
  backgroundVideoPath: talkVideoPath,
  items: [
    {
      label: 'AI 工作流',
      beat: '01 / 03',
      segments: [
        {text: '真正费神的，'},
        {break: true, pauseFrames: 5},
        {text: '不是'},
        {text: '生成', accent: true},
        {text: '。'},
      ],
      copy: '直出只是起点，真正的工作量在后续视觉和节奏的调整。',
      track: ['默认效果', '视觉调整', '形成风格'],
      activeTrackIndex: 1,
      focus: '视觉表达',
    },
    {
      label: '视觉表达',
      beat: '02 / 03',
      segments: [
        {text: '你要做的，'},
        {break: true, pauseFrames: 5},
        {text: '是把它调成'},
        {text: '你的风格', accent: true},
        {text: '。'},
      ],
      copy: '重点不是多炫，而是让画面语言和口播节奏对得上。',
      track: ['删掉默认感', '保留重点', '建立辨识度'],
      activeTrackIndex: 2,
      focus: '调成自己',
    },
    {
      label: '可复用能力',
      beat: '03 / 03',
      segments: [
        {text: '调好以后，'},
        {break: true, pauseFrames: 5},
        {text: '才能变成'},
        {text: '自己的能力', accent: true},
        {text: '。'},
      ],
      copy: '把判断和视觉规则写进组件，后面才能稳定复用同一套表达。',
      track: ['明确规则', '固化组件', '稳定交付'],
      activeTrackIndex: 1,
      focus: '沉淀成组件',
    },
  ],
};

const makeNarrationEchoScene = (start: number, end: number): EpisodeScene => ({
  id: 'scene-acid-narration-echo-layer',
  start,
  end,
  track: 'overlay',
  kind: 'NarrationEchoLayer',
  stageMode: 'presenter-center',
  slot: 'edge-left',
  content: {
    kind: 'NarrationEchoLayer',
    props: narrationEchoProps,
  },
  assetIds: [],
  sourceRefIds: [],
  status: 'ready',
  notes: 'Acid Strike gallery demo for ordinary narration filler.',
});

const baseInput = (id: string, title: string, scenes: EpisodeScene[], durationInSeconds: number): EpisodeInputProps => ({
  debug: false,
  strict: false,
  sources: {
    sources: [demoSource],
  },
  assets: {
    assets: [],
  },
  episode: {
    version: 1,
    episode: {
      id,
      title,
      width: 1920,
      height: 1080,
      fps: 30,
      durationInSeconds,
      status: 'DRAFT',
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

export const acidStrikeGallery: EpisodeInputProps = baseInput(
  'demo-acid-strike-gallery',
  'Acid Strike Component Gallery',
  [
    ...acidKinds.map((kind, index) => makeScene(kind, index, index * 6, index * 6 + 6, talkVideoPath)),
    makeNarrationEchoScene(acidKinds.length * 6, acidKinds.length * 6 + 16),
  ],
  acidKinds.length * 6 + 16,
);

export const acidStrikeDemos: Record<AcidKind, EpisodeInputProps> = Object.fromEntries(
  acidKinds.map((kind, index) => [
    kind,
    baseInput(`demo-acid-${kind}`, `Acid Strike / ${kind}`, [makeScene(kind, index, 0, 6)], 6),
  ]),
) as Record<AcidKind, EpisodeInputProps>;
