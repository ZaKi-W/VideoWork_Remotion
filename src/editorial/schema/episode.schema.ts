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

const conceptSplitSideSchema = z
  .object({
    title: z.string().trim().min(1, 'ConceptSplit title is required').max(18),
    eyebrow: z.string().trim().min(1).max(12).optional(),
    description: z.string().trim().min(1).max(34).optional(),
    points: z.array(z.string().trim().min(1).max(18)).max(2).optional(),
  })
  .strict();

export const conceptSplitPropsSchema = z
  .object({
    mode: z.enum(['cross-cut', 'editorial-fold', 'handoff']).default('cross-cut'),
    relationship: z.enum(['versus', 'from-to', 'not-but']).default('from-to'),
    anchor: z.enum(['left-heavy', 'right-heavy']).default('right-heavy'),
    left: conceptSplitSideSchema,
    right: conceptSplitSideSchema,
    bridge: z
      .object({
        label: z.string().trim().min(1).max(12).optional(),
        style: z.enum(['arrow', 'vs', 'not-but', 'cut']).optional(),
      })
      .strict()
      .optional(),
    accent: z.enum(['orange', 'blue']).default('orange'),
    emphasize: z.enum(['left', 'right']).default('right'),
    showDivider: z.boolean().default(true),
  })
  .strict();

const normalizedCoordinateSchema = z.number().min(0).max(1);

export const evidenceClipPlacementSchema = z.enum([
  'top-left',
  'top-right',
  'edge-left',
  'edge-right',
  'screen-primary',
  'full-bleed',
]);

export const evidenceClipPropsSchema = z
  .object({
    assetId: z.string().trim().min(1, 'EvidenceClip assetId is required'),
    sourceRefId: z.string().trim().min(1, 'EvidenceClip sourceRefId is required'),
    variant: z.enum(['clipping', 'spotlight']).default('clipping'),
    placement: evidenceClipPlacementSchema,
    crop: z
      .object({
        fit: z.enum(['cover', 'contain']).default('cover'),
        focalPoint: z
          .object({
            x: normalizedCoordinateSchema,
            y: normalizedCoordinateSchema,
          })
          .strict()
          .optional(),
        aspectRatio: z.enum(['auto', '4:3', '3:4', '16:9']).default('auto'),
      })
      .strict()
      .optional(),
    sourceLabel: z.string().trim().min(1).max(32).optional(),
    headline: z.string().trim().min(1).max(64).optional(),
    highlights: z
      .array(
        z
          .object({
            kind: z.enum(['marker', 'box', 'underline']),
            x: normalizedCoordinateSchema,
            y: normalizedCoordinateSchema,
            width: normalizedCoordinateSchema,
            height: normalizedCoordinateSchema,
            color: z.enum(['orange', 'blue']).default('orange'),
          })
          .strict()
          .superRefine((highlight, ctx) => {
            if (highlight.width <= 0 || highlight.height <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'EvidenceClip highlight width and height must be greater than 0',
              });
            }
            if (highlight.x + highlight.width > 1 || highlight.y + highlight.height > 1) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'EvidenceClip highlight bounds must stay within 0..1',
              });
            }
          }),
      )
      .max(3, 'EvidenceClip supports at most 3 highlights')
      .default([]),
    annotations: z
      .array(
        z
          .object({
            text: z.string().trim().min(1).max(20),
            x: normalizedCoordinateSchema,
            y: normalizedCoordinateSchema,
            side: z.enum(['left', 'right', 'top', 'bottom']).default('right'),
          })
          .strict(),
      )
      .max(2, 'EvidenceClip supports at most 2 annotations')
      .default([]),
    showReferenceStrip: z.boolean().default(true),
  })
  .strict();

export const metricSpreadPlacementSchema = z.enum([
  'top-left',
  'edge-left',
  'screen-primary',
]);

export const metricSpreadRowSchema = z
  .object({
    label: z.string().trim().min(1).max(16),
    before: z.string().trim().max(16).optional(),
    after: z.string().trim().max(16).optional(),
    delta: z.string().trim().max(16).optional(),
    emphasis: z.enum(['before', 'after', 'delta', 'none']).default('none'),
  })
  .strict()
  .superRefine((row, ctx) => {
    if (!row.before && !row.after && !row.delta) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'MetricSpread row requires before, after, or delta',
        path: ['before'],
      });
    }
  });

export const metricSpreadPropsSchema = z
  .object({
    variant: z.enum(['delta-ledger']).default('delta-ledger'),
    placement: metricSpreadPlacementSchema,
    accent: z.enum(['orange', 'blue']).default('orange'),
    kicker: z.string().trim().min(1).max(28).optional(),
    primary: z
      .object({
        value: z.string().trim().min(1).max(16),
        unit: z.string().trim().min(1).max(12).optional(),
        label: z.string().trim().min(1).max(18),
        direction: z.enum(['up', 'down', 'neutral']).default('neutral'),
      })
      .strict(),
    rows: z.array(metricSpreadRowSchema).min(1).max(4),
    sourceRefId: z.string().trim().min(1, 'MetricSpread sourceRefId is required'),
    sourceLabel: z.string().trim().min(1).max(28).optional(),
    note: z.string().trim().min(1).max(28).optional(),
    showRatioBar: z.boolean().default(true),
  })
  .strict();

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
      kind: z.enum(['external', 'local', 'demo']).default('external'),
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
