import {z} from 'zod';

const stageModeSchema = z.enum([
  'presenter-center',
  'presenter-small',
  'screen-primary',
  'no-presenter',
]);

const slotSchema = z.enum([
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'edge-left',
  'edge-right',
  'full-bleed',
  'screen-primary',
  'center-overlay',
]);

const statusSchema = z.enum(['DRAFT', 'APPROVED', 'IN_PRODUCTION', 'QC', 'FINAL']);

export const componentKindSchema = z.enum([
  'SectionStamp',
  'HeadlineTakeover',
  'ConceptSplit',
  'EvidenceClip',
  'MetricSpread',
  'WorkflowPath',
  'DemoFocusFrame',
  'AssetStack',
]);

export const sectionStampPlacementSchema = z.enum([
  'top-left',
  'top-right',
  'edge-left',
  'edge-right',
]);

export const sectionStampPropsSchema = z.object({
  sectionNo: z.string().min(1).max(12),
  kicker: z.string().min(1).max(48),
  title: z.string().min(1).max(36),
  subline: z.string().max(60).optional(),
  placement: sectionStampPlacementSchema,
  variant: z.enum(['impact', 'edge-impact', 'index-strip', 'edge-note']).default('impact'),
  accent: z.enum(['orange', 'blue']).default('orange'),
  brandLabel: z.string().max(48).optional(),
  emphasis: z
    .object({
      text: z.string().min(1).max(16),
      color: z.enum(['orange', 'blue']).optional(),
      mode: z.enum(['highlight-block', 'underline', 'reverse']).optional(),
    })
    .optional(),
}).superRefine((props, ctx) => {
  if (props.emphasis && !props.title.includes(props.emphasis.text)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'SectionStamp emphasis.text must exist in title',
      path: ['emphasis', 'text'],
    });
  }
});

export const headlineTakeoverPropsSchema = z.object({
  lines: z
    .array(z.string().trim().min(1, 'HeadlineTakeover lines cannot be empty'))
    .min(1, 'HeadlineTakeover requires at least one line')
    .max(3, 'HeadlineTakeover supports at most three lines'),
  emphasis: z
    .object({
      text: z.string().trim().min(1).max(16),
      color: z.enum(['orange', 'blue']).default('orange'),
      mode: z.enum(['highlight-block', 'reverse', 'underline']).default('highlight-block'),
    })
    .strict()
    .optional(),
  mode: z.enum(['punch', 'wrap', 'takeover']).default('punch'),
  placement: z.enum(['left-dominant', 'right-dominant', 'wraparound']).default('left-dominant'),
  alignment: z.enum(['left', 'right', 'center']).optional(),
  allowSubjectOverlay: z.boolean().default(false),
}).strict().superRefine((props, ctx) => {
  const fullTitle = props.lines.join('');
  if (props.emphasis && !fullTitle.includes(props.emphasis.text)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'HeadlineTakeover emphasis.text must exist continuously in lines',
      path: ['emphasis', 'text'],
    });
  }
});

export const conceptSplitPropsSchema = z.object({
  left: z.string(),
  right: z.string(),
  dividerLabel: z.string().optional(),
  comparisonMode: z.enum(['old-new', 'before-after', 'pro-con']),
});

export const evidenceClipPropsSchema = z.object({
  assetId: z.string(),
  sourceRefId: z.string(),
  sourceLabel: z.string(),
  highlights: z.array(z.string()).default([]),
  annotations: z.array(z.string()).default([]),
  placement: slotSchema,
});

export const metricSpreadPropsSchema = z.object({
  primaryMetric: z.string(),
  unit: z.string(),
  label: z.string(),
  comparison: z.string().optional(),
  sourceRefId: z.string().optional(),
});

export const workflowPathPropsSchema = z.object({
  nodes: z.array(z.string()).min(1),
  activeNodeIndexes: z.array(z.number().int().nonnegative()).default([]),
  direction: z.enum(['horizontal', 'vertical']),
  placement: slotSchema,
});

export const demoFocusFramePropsSchema = z.object({
  screenAssetId: z.string(),
  steps: z.array(z.string()).default([]),
  callouts: z.array(z.string()).default([]),
  presenterMode: z.enum(['hidden', 'small', 'center']),
  placement: slotSchema,
});

export const assetStackPropsSchema = z.object({
  items: z.array(z.object({assetId: z.string(), label: z.string().optional()})).min(1),
  mode: z.enum(['stack', 'grid', 'sequence']),
  captions: z.array(z.string()).default([]),
  placement: slotSchema,
});

export const sceneContentSchema = z.discriminatedUnion('kind', [
  z.object({kind: z.literal('SectionStamp'), props: sectionStampPropsSchema}),
  z.object({kind: z.literal('HeadlineTakeover'), props: headlineTakeoverPropsSchema}),
  z.object({kind: z.literal('ConceptSplit'), props: conceptSplitPropsSchema}),
  z.object({kind: z.literal('EvidenceClip'), props: evidenceClipPropsSchema}),
  z.object({kind: z.literal('MetricSpread'), props: metricSpreadPropsSchema}),
  z.object({kind: z.literal('WorkflowPath'), props: workflowPathPropsSchema}),
  z.object({kind: z.literal('DemoFocusFrame'), props: demoFocusFramePropsSchema}),
  z.object({kind: z.literal('AssetStack'), props: assetStackPropsSchema}),
]);

export const sceneSchema = z
  .object({
    id: z.string().min(1),
    start: z.number().nonnegative(),
    end: z.number().positive(),
    track: z.enum(['primary', 'annotation', 'background']),
    kind: componentKindSchema,
    stageMode: stageModeSchema,
    slot: slotSchema,
    content: sceneContentSchema,
    assetIds: z.array(z.string()).default([]),
    sourceRefIds: z.array(z.string()).default([]),
    status: z.enum(['draft', 'approved', 'ready', 'needs-assets']),
    notes: z.string().default(''),
  })
  .superRefine((scene, ctx) => {
    if (scene.end <= scene.start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'scene end must be greater than start',
        path: ['end'],
      });
    }
    if (scene.kind !== scene.content.kind) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'scene kind must match content kind',
        path: ['content', 'kind'],
      });
    }
  });

export const episodeSchema = z.object({
  version: z.literal(1),
  episode: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    fps: z.number().int().positive(),
    durationInSeconds: z.number().positive(),
    status: statusSchema,
  }),
  presenter: z.object({
    mode: z.enum(['placeholder', 'video']),
    videoAssetId: z.string().nullable(),
    subtitleAssetId: z.string().nullable(),
    defaultStageMode: stageModeSchema,
  }),
  scenes: z.array(sceneSchema),
});

export const sourceManifestSchema = z.object({
  sources: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      publisher: z.string(),
      url: z.string(),
      publishedAt: z.string(),
      capturedAssetId: z.string(),
      notes: z.string(),
      status: z.enum(['pending', 'provided', 'captured', 'verified', 'rejected']),
    }),
  ),
});

export const assetManifestSchema = z.object({
  assets: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        'talk-video',
        'subtitle',
        'screenshot',
        'recording',
        'image',
        'logo',
        'generated',
        'chart',
      ]),
      path: z.string(),
      purpose: z.string(),
      sourceRefId: z.string(),
      sceneHints: z.array(z.string()),
      status: z.enum(['missing', 'needed', 'ready', 'rejected']),
      priority: z.enum(['low', 'medium', 'high']).optional(),
    }),
  ),
});
