import {parseSrt} from '@remotion/captions';
import type {Caption} from '@remotion/captions';
import {useCallback, useEffect, useState} from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  staticFile,
  useDelayRender,
} from 'remotion';
import {AcidSrtSubtitle} from './AcidSrtSubtitle';
import type {ComponentRendererProps} from '../registry/component.types';
import type {TalkVideoBaseProps} from '../schema/episode.types';

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

export const TalkVideoBase = (rendererProps: ComponentRendererProps) => {
  const props = getProps(rendererProps);
  const captions = useSrtCaptions(props.subtitlePath);

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
      <AcidSrtSubtitle captions={captions} maxWidth={props.subtitleMaxWidth ?? 980} />
    </AbsoluteFill>
  );
};
