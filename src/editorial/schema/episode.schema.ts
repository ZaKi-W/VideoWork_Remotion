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
  'EvidenceClip',
  'MetricSpread',
  'NarrationEchoLayer',
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
  'WorkflowPath',
  'DemoFocusFrame',
  'AssetStack',
  'TalkVideoBase',
  'RemotionTalkEffect',
]);

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

const narrationEchoSegmentSchema = z
  .object({
    text: z.string().trim().min(1).max(18).optional(),
    break: z.boolean().optional(),
    accent: z.boolean().optional(),
    pauseFrames: z.number().int().min(0).max(24).optional(),
  })
  .strict()
  .superRefine((segment, ctx) => {
    if (!segment.text && !segment.break) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'NarrationEchoLayer segment requires text or break',
      });
    }
    if (segment.text && segment.break) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'NarrationEchoLayer segment cannot combine text and break',
      });
    }
    if (segment.accent && !segment.text) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'NarrationEchoLayer accent segment requires text',
        path: ['accent'],
      });
    }
  });

const narrationEchoItemSchema = z
  .object({
    ghost: z.string().trim().min(1).max(8).optional(),
    label: z.string().trim().min(1).max(18),
    beat: z.string().trim().min(1).max(12).optional(),
    counter: z.string().trim().min(1).max(4).optional(),
    progress: z.number().min(0).max(1).optional(),
    segments: z.array(narrationEchoSegmentSchema).min(1).max(8),
    note: z.string().trim().min(1).max(34).optional(),
    copy: z.string().trim().min(1).max(90).optional(),
    track: z.array(z.string().trim().min(1).max(12)).min(1).max(3).optional(),
    activeTrackIndex: z.number().int().min(0).max(2).optional(),
    focus: z.string().trim().min(1).max(16).optional(),
  })
  .strict()
  .superRefine((item, ctx) => {
    const textSegments = item.segments.filter((segment) => segment.text);
    const accentIndexes = textSegments
      .map((segment, index) => (segment.accent ? index : -1))
      .filter((index) => index >= 0);

    if (accentIndexes.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'NarrationEchoLayer allows at most one accent segment per item',
        path: ['segments'],
      });
    }
    if (accentIndexes.length === 1 && accentIndexes[0] !== textSegments.length - 2 && accentIndexes[0] !== textSegments.length - 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'NarrationEchoLayer accent should appear near the end of the line',
        path: ['segments'],
      });
    }
    if (item.activeTrackIndex !== undefined && item.track && item.activeTrackIndex >= item.track.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'NarrationEchoLayer activeTrackIndex must point to an existing track item',
        path: ['activeTrackIndex'],
      });
    }
  });

export const narrationEchoLayerPropsSchema = z
  .object({
    placement: z.enum(['edge-left', 'top-left']).default('edge-left'),
    items: z.array(narrationEchoItemSchema).min(1).max(5),
    charFrames: z.number().int().min(1).max(5).default(2),
    segmentPauseFrames: z.number().int().min(2).max(18).default(6),
    exitFrames: z.number().int().min(10).max(12).default(12),
    exitAtFrame: z.number().int().min(1).optional(),
    showSoftener: z.boolean().default(true),
    backgroundVideoPath: z.string().trim().min(1).max(160).optional(),
    backgroundStartFromFrame: z.number().int().min(0).optional(),
    backgroundAudio: z.boolean().optional(),
  })
  .strict();

const acidSourceCardSchema = z
  .object({
    label: z.string().trim().min(1).max(36).optional(),
    code: z.string().trim().min(1).max(10).optional(),
    meta: z.string().trim().min(1).max(48).optional(),
    title: z.string().trim().min(1).max(64).optional(),
    highlight: z.string().trim().min(1).max(80).optional(),
    footer: z.string().trim().min(1).max(32).optional(),
    assetId: z.string().trim().min(1).optional(),
    sourceRefId: z.string().trim().min(1).optional(),
  })
  .strict();

const acidItemSchema = z
  .object({
    label: z.string().trim().min(1).max(24),
    value: z.string().trim().min(1).max(20).optional(),
    detail: z.string().trim().min(1).max(44).optional(),
    percent: z.number().min(0).max(100).optional(),
  })
  .strict();

const acidMessageSchema = z
  .object({
    speaker: z.enum(['me', 'agent']),
    text: z.string().trim().min(1).max(64),
  })
  .strict();

export const acidComponentPropsSchema = z
  .object({
    topic: z.string().trim().min(1).max(44).optional(),
    topicDetail: z.string().trim().min(1).max(44).optional(),
    eyebrow: z.string().trim().min(1).max(44).optional(),
    title: z.array(z.string().trim().min(1).max(14)).min(1).max(3),
    copy: z.string().trim().min(1).max(90).optional(),
    subtitle: z.string().trim().min(1).max(56),
    subtitleEn: z.string().trim().min(1).max(90).optional(),
    primaryValue: z.string().trim().min(1).max(16).optional(),
    primaryUnit: z.string().trim().min(1).max(12).optional(),
    caption: z.string().trim().min(1).max(18).optional(),
    items: z.array(acidItemSchema).max(8).default([]),
    source: acidSourceCardSchema.optional(),
    messages: z.array(acidMessageSchema).max(6).default([]),
    mediaCount: z.number().int().min(12).max(60).default(48),
    scrimIntensity: z.enum(['none', 'soft', 'medium']).default('soft'),
    backgroundVideoPath: z.string().trim().min(1).max(160).optional(),
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

export const talkVideoBasePropsSchema = z
  .object({
    videoPath: z.string().trim().min(1).max(160),
    subtitlePath: z.string().trim().min(1).max(160).optional(),
    audio: z.boolean().default(true),
    fit: z.enum(['cover', 'contain']).default('cover'),
    subtitleMaxWidth: z.number().int().min(420).max(1400).default(980),
  })
  .strict();

export const remotionTalkEffectPropsSchema = z
  .object({
    variant: z.enum(['title', 'steps', 'statement', 'compare', 'handoff', 'outro']),
    eyebrow: z.string().trim().min(1).max(28).optional(),
    title: z.string().trim().min(1).max(28),
    subtitle: z.string().trim().min(1).max(56).optional(),
    accent: z.enum(['lime', 'cyan', 'orange']).default('lime'),
    index: z.string().trim().min(1).max(6).optional(),
    items: z.array(z.string().trim().min(1).max(16)).max(4).default([]),
    left: z.string().trim().min(1).max(16).optional(),
    right: z.string().trim().min(1).max(16).optional(),
    connector: z.string().trim().min(1).max(10).optional(),
  })
  .strict();

export const sceneContentSchema = z.discriminatedUnion('kind', [
  z.object({kind: z.literal('EvidenceClip'), props: evidenceClipPropsSchema}),
  z.object({kind: z.literal('MetricSpread'), props: metricSpreadPropsSchema}),
  z.object({kind: z.literal('NarrationEchoLayer'), props: narrationEchoLayerPropsSchema}),
  z.object({kind: z.literal('MediaWall'), props: acidComponentPropsSchema}),
  z.object({kind: z.literal('Countdown'), props: acidComponentPropsSchema}),
  z.object({kind: z.literal('ChapterIndex'), props: acidComponentPropsSchema}),
  z.object({kind: z.literal('CountryGap'), props: acidComponentPropsSchema}),
  z.object({kind: z.literal('ReleaseTimeline'), props: acidComponentPropsSchema}),
  z.object({kind: z.literal('StatsBoard'), props: acidComponentPropsSchema}),
  z.object({kind: z.literal('Ecosystem'), props: acidComponentPropsSchema}),
  z.object({kind: z.literal('OpenSourceWave'), props: acidComponentPropsSchema}),
  z.object({kind: z.literal('MapFocus'), props: acidComponentPropsSchema}),
  z.object({kind: z.literal('TimeGap'), props: acidComponentPropsSchema}),
  z.object({kind: z.literal('PricePage'), props: acidComponentPropsSchema}),
  z.object({kind: z.literal('TokenBoard'), props: acidComponentPropsSchema}),
  z.object({kind: z.literal('AgentExecution'), props: acidComponentPropsSchema}),
  z.object({kind: z.literal('WorkflowPath'), props: workflowPathPropsSchema}),
  z.object({kind: z.literal('DemoFocusFrame'), props: demoFocusFramePropsSchema}),
  z.object({kind: z.literal('AssetStack'), props: assetStackPropsSchema}),
  z.object({kind: z.literal('TalkVideoBase'), props: talkVideoBasePropsSchema}),
  z.object({kind: z.literal('RemotionTalkEffect'), props: remotionTalkEffectPropsSchema}),
]);

export const sceneSchema = z
  .object({
    id: z.string().min(1),
    start: z.number().nonnegative(),
    end: z.number().positive(),
    track: z.enum(['primary', 'annotation', 'background', 'overlay']),
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
