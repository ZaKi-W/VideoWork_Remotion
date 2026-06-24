import {parseSrt} from '@remotion/captions';
import type {Caption} from '@remotion/captions';
import {useCallback, useEffect, useState} from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useDelayRender} from 'remotion';
import {AcidSrtSubtitle} from '../components/AcidSrtSubtitle';
import type {TalkVideoBaseProps} from '../schema/episode.types';

const useSrtCaptions = (subtitlePath: string | undefined): Caption[] => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender('Loading shot subtitles'));

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

export const ShotTalkVideoLayer = ({videoPath, audio, fit}: TalkVideoBaseProps) => {
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#0b0b0b'}}>
      <OffthreadVideo
        src={staticFile(videoPath)}
        muted={!audio}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: fit ?? 'cover',
          objectPosition: '50% 38%',
        }}
      />
    </AbsoluteFill>
  );
};

export const ShotSubtitleLayer = ({subtitlePath, subtitleMaxWidth}: TalkVideoBaseProps) => {
  const captions = useSrtCaptions(subtitlePath);
  return <AcidSrtSubtitle captions={captions} maxWidth={subtitleMaxWidth ?? 1040} />;
};
