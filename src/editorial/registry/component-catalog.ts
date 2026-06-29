export const componentCatalog = [
  {code: 'C01', kind: 'MediaWall'},
  {code: 'C02', kind: 'Countdown'},
  {code: 'C03', kind: 'ChapterIndex'},
  {code: 'C04', kind: 'CountryGap'},
  {code: 'C05', kind: 'ReleaseTimeline'},
  {code: 'C06', kind: 'StatsBoard'},
  {code: 'C07', kind: 'Ecosystem'},
  {code: 'C08', kind: 'OpenSourceWave'},
  {code: 'C09', kind: 'MapFocus'},
  {code: 'C10', kind: 'TimeGap'},
  {code: 'C11', kind: 'PricePage'},
  {code: 'C12', kind: 'TokenBoard'},
  {code: 'C13', kind: 'AgentExecution'},
  {code: 'C16', kind: 'NarrationEchoLayer', category: 'regular', tags: ['summary']},
  {code: 'C21', kind: 'RemotionTalkEffect', category: 'regular', tags: ['summary']},
  {code: 'C22', kind: 'AcidSrtSubtitle'},
  {code: 'C23', kind: 'TrendTotem', category: 'regular', tags: ['summary']},
  {code: 'C24', kind: 'TrendBanner', category: 'regular', tags: ['summary']},
  {code: 'C25', kind: 'TopicSignal', category: 'regular', tags: ['summary']},
  {code: 'C26', kind: 'SideBrief', category: 'regular', tags: ['summary']},
  {code: 'C27', kind: 'ShotDirector', category: 'system', tags: ['layout']},
  {code: 'C28', kind: 'SemanticTextReveal', category: 'primitive', tags: ['text', 'motion']},
  {code: 'C29', kind: 'FocusReticle', category: 'primitive', tags: ['hud', 'focus']},
  {code: 'C30', kind: 'PixelReveal', category: 'primitive', tags: ['transition', 'reveal']},
] as const;

export const systemPreviewCatalog = [{code: 'BASE', kind: 'TalkVideoBase'}] as const;

export type ComponentCatalogKind = (typeof componentCatalog)[number]['kind'];

export const componentCodeFor = (kind: string): string => {
  const entry = componentCatalog.find((candidate) => candidate.kind === kind);
  return entry?.code ?? 'C??';
};

const summaryKinds = new Set(['NarrationEchoLayer', 'RemotionTalkEffect', 'TrendTotem', 'TrendBanner', 'TopicSignal', 'SideBrief']);

export const componentCompositionId = (kind: string): string =>
  `${componentCodeFor(kind)}-${summaryKinds.has(kind) ? 'Summary-' : ''}${kind}`;

export const systemPreviewCompositionId = (kind: string): string => {
  const entry = systemPreviewCatalog.find((candidate) => candidate.kind === kind);
  return `${entry?.code ?? 'SYS'}-${kind}`;
};
