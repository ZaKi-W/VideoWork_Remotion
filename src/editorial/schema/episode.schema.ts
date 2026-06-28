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

export const shotModeSchema = z.enum([
  'talk',
  'speaker-left',
  'speaker-right',
  'pip-right',
  'content-full',
  'push-in',
]);

export const shotSchema = z
  .object({
    from: z.number().int().nonnegative(),
    to: z.number().int().positive(),
    mode: shotModeSchema,
    contentId: z.string().trim().min(1).optional(),
    summaryId: z.string().trim().min(1).optional(),
  })
  .strict()
  .superRefine((shot, ctx) => {
    if (shot.to <= shot.from) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'shot to must be greater than from',
        path: ['to'],
      });
    }
  });

export const componentKindSchema = z.enum([
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
  'TrendTotem',
  'TrendBanner',
  'TopicSignal',
  'SideBrief',
  'TalkVideoBase',
  'RemotionTalkEffect',
]);

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
    backgroundStartFromFrame: z.number().int().min(0).optional(),
    hideOverlays: z.boolean().optional(),
  })
  .strict();

const summaryBlockSchema = z
  .object({
    label: z.string().trim().min(1).max(18),
    title: z.string().trim().min(1).max(22),
    icon: z.string().trim().min(1).max(2).optional(),
    accent: z.enum(['acid', 'blue', 'yellow', 'orange', 'red', 'cyan']).optional(),
  })
  .strict();

export const summaryComponentPropsSchema = z
  .object({
    kicker: z.string().trim().min(1).max(24).optional(),
    label: z.string().trim().min(1).max(24).optional(),
    title: z.array(z.string().trim().min(1).max(18)).min(1).max(3),
    copy: z.string().trim().min(1).max(90).optional(),
    foot: z.string().trim().min(1).max(24).optional(),
    index: z.string().trim().min(1).max(6).optional(),
    emphasis: z.string().trim().min(1).max(12).optional(),
    focus: z.string().trim().min(1).max(18).optional(),
    tail: z.string().trim().min(1).max(28).optional(),
    blocks: z.array(summaryBlockSchema).max(3).default([]),
    accent: z.enum(['acid', 'blue', 'yellow', 'orange', 'red', 'cyan']).default('acid'),
  })
  .strict();

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
  z.object({kind: z.literal('TrendTotem'), props: summaryComponentPropsSchema}),
  z.object({kind: z.literal('TrendBanner'), props: summaryComponentPropsSchema}),
  z.object({kind: z.literal('TopicSignal'), props: summaryComponentPropsSchema}),
  z.object({kind: z.literal('SideBrief'), props: summaryComponentPropsSchema}),
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
  shots: z.array(shotSchema).optional(),
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
