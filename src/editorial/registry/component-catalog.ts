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
  {code: 'C16', kind: 'NarrationEchoLayer'},
  {code: 'C21', kind: 'RemotionTalkEffect'},
] as const;

export const systemPreviewCatalog = [{code: 'BASE', kind: 'TalkVideoBase'}] as const;

export type ComponentCatalogKind = (typeof componentCatalog)[number]['kind'];

export const componentCodeFor = (kind: string): string => {
  const entry = componentCatalog.find((candidate) => candidate.kind === kind);
  return entry?.code ?? 'C??';
};

export const componentCompositionId = (kind: string): string => `${componentCodeFor(kind)}-${kind}`;

export const systemPreviewCompositionId = (kind: string): string => {
  const entry = systemPreviewCatalog.find((candidate) => candidate.kind === kind);
  return `${entry?.code ?? 'SYS'}-${kind}`;
};
