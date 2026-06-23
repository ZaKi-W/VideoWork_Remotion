import {parseSrt} from '@remotion/captions';
import type {Caption} from '@remotion/captions';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from 'remotion';
import type {ComponentRendererProps} from '../registry/component.types';
import type {TalkVideoBaseProps} from '../schema/episode.types';
import {visualTokens} from '../stage/visual-tokens';

const getProps = (rendererProps: ComponentRendererProps): TalkVideoBaseProps => {
  if (rendererProps.scene.content.kind !== 'TalkVideoBase') {
    throw new Error(`TalkVideoBase renderer received ${rendererProps.scene.content.kind}`);
  }
  return rendererProps.scene.content.props;
};

const useSrtCaptions = (subtitlePath: string | undefined): Caption[] => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender('Loading talk subtitles'));

  const fetchCaptions = useCallback(async () => {
    if (!subtitlePath) {
      setCaptions([]);
      continueRender(handle);
      return;
    }

    try {
      const response = await fetch(staticFile(subtitlePath));
      const srt = await response.text();
      const parsed = parseSrt({input: srt});
      setCaptions(parsed.captions);
      continueRender(handle);
    } catch (error) {
      cancelRender(error);
    }
  }, [cancelRender, continueRender, handle, subtitlePath]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  return captions;
};

const activeCaptionAt = (captions: Caption[], timeMs: number): Caption | null =>
  captions.find((caption) => caption.startMs <= timeMs && caption.endMs >= timeMs) ?? null;

export const TalkVideoBase = (rendererProps: ComponentRendererProps) => {
  const props = getProps(rendererProps);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const captions = useSrtCaptions(props.subtitlePath);
  const activeCaption = useMemo(() => activeCaptionAt(captions, (frame / fps) * 1000), [captions, fps, frame]);

  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#0b0b0b'}}>
      <OffthreadVideo
        src={staticFile(props.videoPath)}
        muted={!props.audio}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: props.fit ?? 'cover',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.10), transparent 18%, transparent 78%, rgba(0,0,0,0.12))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 46,
          maxWidth: props.subtitleMaxWidth ?? 980,
          minWidth: 520,
          padding: '10px 22px 12px',
          color: '#fff',
          background: activeCaption ? 'rgba(4,5,5,0.86)' : 'rgba(4,5,5,0)',
          boxShadow: activeCaption ? '0 8px 24px rgba(0,0,0,0.26)' : 'none',
          textAlign: 'center',
          fontFamily: visualTokens.fontFamily.body,
          fontSize: 34,
          lineHeight: 1.28,
          fontWeight: 900,
          letterSpacing: 0,
          transform: 'translateX(-50%)',
          opacity: activeCaption ? 1 : 0,
          transition: 'opacity 80ms linear',
          pointerEvents: 'none',
        }}
      >
        {activeCaption?.text ?? ''}
      </div>
    </AbsoluteFill>
  );
};
