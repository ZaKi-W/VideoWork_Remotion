import {AbsoluteFill} from 'remotion';
import {
  AcidStage,
  DisplayTitle,
  Eyebrow,
  LeftPanel,
  SourceCard,
  TopicLine,
  acidTokens,
} from '../components/acid-system';
import {Timeline} from '../components/AcidComponent';
import type {AcidComponentProps, AssetManifest, SourceManifest} from '../schema/episode.types';
import type {ScrimIntensity} from '../components/acid-system';

const frame = 42;
const durationInFrames = 180;
const panelWidth = 584;
const panelHeight = 329;
const stageScale = panelWidth / 1920;

const sources: SourceManifest = {
  sources: [
    {
      id: 'source-scrim-contact-sheet',
      title: 'Local scrim contact sheet source placeholder',
      publisher: 'Zaki Video Pipeline',
      url: '',
      publishedAt: '2026-06-23',
      capturedAssetId: '',
      notes: 'Local preview source for scrim comparison.',
      kind: 'demo',
      status: 'provided',
    },
  ],
};

const assets: AssetManifest = {
  assets: [],
};

const props: AcidComponentProps = {
  topic: 'SCRIM QC',
  topicDetail: 'WHITE WALL / TALKING HEAD',
  eyebrow: 'RELEASE TRACK',
  title: ['模型更新', '密集出现'],
  items: [
    {label: '05.08', value: 'MODEL 5', detail: '推理与长上下文升级'},
    {label: '05.12', value: 'MODEL 5.1', detail: '工具调用与执行能力增强'},
    {label: '05.20', value: 'MODEL 5.2', detail: '多模态与视频理解'},
    {label: '05.27', value: 'MODEL 5.3', detail: '开发者成本策略调整'},
  ],
  source: {
    label: 'Source card',
    code: 'QC',
    meta: 'Right-side evidence card',
    title: '右侧证据卡保留深色外框',
    highlight: '左侧承托变轻，右侧证据卡不跟着变浅。',
    footer: 'Reference',
    sourceRefId: 'source-scrim-contact-sheet',
  },
  messages: [],
  mediaCount: 48,
  scrimIntensity: 'soft',
  subtitle: '对比同一白墙口播背景下三种左侧承托强度。',
  subtitleEn: 'Same talking-head wall, three left scrim intensities.',
};

const variants: Array<{label: ScrimIntensity; note: string}> = [
  {label: 'soft', note: 'default'},
  {label: 'medium', note: 'dense text only'},
  {label: 'none', note: 'text shadow only'},
];

const PreviewPanel = ({intensity, note}: {intensity: ScrimIntensity; note: string}) => (
  <div>
    <div
      style={{
        height: 40,
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        color: '#11150F',
        fontFamily: acidTokens.font.body,
      }}
    >
      <strong style={{fontSize: 26, lineHeight: 1, fontWeight: 900}}>{intensity}</strong>
      <span style={{color: '#11150F', fontSize: 14, fontWeight: 900}}>{note}</span>
    </div>
    <div
      style={{
        position: 'relative',
        width: panelWidth,
        height: panelHeight,
        overflow: 'hidden',
        background: acidTokens.color.wall,
        border: '1px solid rgba(17,21,15,0.18)',
        boxShadow: '0 18px 38px rgba(17,21,15,0.11)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          transform: `scale(${stageScale})`,
          transformOrigin: 'top left',
        }}
      >
        <AcidStage
          subtitle={props.subtitle}
          subtitleEn={props.subtitleEn}
          frame={frame}
          durationInFrames={durationInFrames}
          scrimIntensity={intensity}
        >
          <TopicLine topic={props.topic} detail={props.topicDetail} />
          <LeftPanel>
            <Eyebrow>{props.eyebrow}</Eyebrow>
            <DisplayTitle lines={props.title} />
            <Timeline items={props.items} progress={1} />
          </LeftPanel>
          <SourceCard
            source={props.source}
            assets={assets}
            sources={sources}
            frame={frame}
            durationInFrames={durationInFrames}
          />
        </AcidStage>
      </div>
    </div>
  </div>
);

export const AcidScrimContactSheet = () => (
  <AbsoluteFill
    style={{
      padding: '54px 58px',
      background: '#F7F7EE',
      fontFamily: acidTokens.font.body,
    }}
  >
    <div style={{display: 'flex', alignItems: 'end', justifyContent: 'space-between'}}>
      <div>
        <div style={{color: acidTokens.color.acid, fontSize: 15, fontWeight: 900, letterSpacing: '0.08em'}}>
          ACID STRIKE SCRIM QC
        </div>
        <h1 style={{margin: '9px 0 0', color: '#11150F', fontSize: 46, lineHeight: 1, fontWeight: 900}}>
          Left support layer comparison
        </h1>
      </div>
      <div style={{maxWidth: 520, color: '#11150F', fontSize: 18, lineHeight: 1.35, fontWeight: 800}}>
        Soft keeps the white wall visible; medium stays below rgba(7,9,6,0.42); none relies on text shadow only.
      </div>
    </div>
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 584px)', gap: 26, marginTop: 42}}>
      {variants.map((variant) => (
        <PreviewPanel key={variant.label} intensity={variant.label} note={variant.note} />
      ))}
    </div>
  </AbsoluteFill>
);
