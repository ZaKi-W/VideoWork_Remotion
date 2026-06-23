import {
  assetStackPropsSchema,
  conceptSplitPropsSchema,
  demoFocusFramePropsSchema,
  evidenceClipPropsSchema,
  headlineTakeoverPropsSchema,
  metricSpreadPropsSchema,
  sectionStampPropsSchema,
  workflowPathPropsSchema,
} from '../schema/episode.schema';
import {ConceptSplit} from '../components/ConceptSplit';
import {EvidenceClip} from '../components/EvidenceClip';
import {HeadlineTakeover} from '../components/HeadlineTakeover';
import {MetricSpread} from '../components/MetricSpread';
import {PrototypeScene} from '../components/prototype/PrototypeScene';
import {SectionStamp} from '../components/SectionStamp';
import type {ComponentRegistryItem} from './component.types';

const commonStageModes = ['presenter-center', 'presenter-small', 'screen-primary', 'no-presenter'] as const;
const commonSlots = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'edge-left',
  'edge-right',
  'full-bleed',
  'screen-primary',
  'center-overlay',
] as const;

export const componentRegistry = {
  SectionStamp: {
    name: 'SectionStamp',
    purpose: '章节切换 / 话题标记',
    allowedStageModes: ['presenter-center', 'presenter-small', 'screen-primary', 'no-presenter'],
    allowedSlots: ['top-left', 'top-right', 'edge-left', 'edge-right'],
    requiresSource: false,
    implementationStatus: 'ready',
    schema: sectionStampPropsSchema,
    render: SectionStamp,
  },
  HeadlineTakeover: {
    name: 'HeadlineTakeover',
    purpose: '核心观点 / 强势结论 / 转折句',
    allowedStageModes: ['presenter-center', 'presenter-small', 'screen-primary', 'no-presenter'],
    allowedSlots: ['top-left', 'top-right', 'edge-left', 'edge-right', 'full-bleed', 'center-overlay', 'screen-primary'],
    requiresSource: false,
    implementationStatus: 'ready',
    schema: headlineTakeoverPropsSchema,
    render: HeadlineTakeover,
  },
  ConceptSplit: {
    name: 'ConceptSplit',
    purpose: '概念对比、新旧方式切换、认知转折',
    allowedStageModes: [...commonStageModes],
    allowedSlots: ['top-left', 'top-right', 'edge-left', 'edge-right', 'screen-primary', 'full-bleed'],
    requiresSource: false,
    requiresAsset: false,
    implementationStatus: 'ready',
    schema: conceptSplitPropsSchema,
    render: ConceptSplit,
  },
  EvidenceClip: {
    name: 'EvidenceClip',
    purpose: '官方来源、新闻、公告、网页、数据截图等证据展示',
    allowedStageModes: ['presenter-center', 'presenter-small', 'screen-primary', 'no-presenter'],
    allowedSlots: ['top-left', 'top-right', 'edge-left', 'edge-right', 'screen-primary', 'full-bleed'],
    allowedAssetTypes: ['screenshot', 'image', 'chart'],
    requiresSource: true,
    requiresAsset: true,
    implementationStatus: 'ready',
    schema: evidenceClipPropsSchema,
    render: EvidenceClip,
  },
  MetricSpread: {
    name: 'MetricSpread',
    purpose: '价格、成本、性能、速度、比例、时间等关键指标表达',
    allowedStageModes: [...commonStageModes],
    allowedSlots: ['top-left', 'top-right', 'edge-left', 'edge-right', 'screen-primary'],
    requiresSource: true,
    requiresAsset: false,
    implementationStatus: 'ready',
    schema: metricSpreadPropsSchema,
    render: MetricSpread,
  },
  WorkflowPath: {
    name: 'WorkflowPath',
    purpose: '步骤、Agent 流程或自动化路径',
    allowedStageModes: [...commonStageModes],
    allowedSlots: [...commonSlots],
    requiresSource: false,
    implementationStatus: 'prototype',
    schema: workflowPathPropsSchema,
    render: PrototypeScene,
  },
  DemoFocusFrame: {
    name: 'DemoFocusFrame',
    purpose: '软件操作、网页演示或项目演示聚焦',
    allowedStageModes: ['presenter-small', 'screen-primary'],
    allowedSlots: ['screen-primary'],
    requiresSource: false,
    implementationStatus: 'planned',
    schema: demoFocusFramePropsSchema,
    render: PrototypeScene,
  },
  AssetStack: {
    name: 'AssetStack',
    purpose: '案例、图片、成果或多素材展示',
    allowedStageModes: ['presenter-small', 'screen-primary', 'no-presenter'],
    allowedSlots: ['screen-primary', 'full-bleed', 'top-left', 'top-right'],
    requiresSource: false,
    implementationStatus: 'planned',
    schema: assetStackPropsSchema,
    render: PrototypeScene,
  },
} satisfies Record<string, ComponentRegistryItem>;
