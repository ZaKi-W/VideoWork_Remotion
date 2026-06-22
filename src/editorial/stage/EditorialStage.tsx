import type {ReactNode} from 'react';
import {AbsoluteFill} from 'remotion';
import type {StageMode, StageSlot} from './stage.types';
import {getStageLayout} from './stage.config';
import {StageDebugOverlay} from './StageDebugOverlay';
import {visualTokens} from './visual-tokens';

type Props = {
  width: number;
  height: number;
  stageMode: StageMode;
  slot: StageSlot;
  presenterMode: 'placeholder' | 'video';
  debug?: boolean;
  children: ReactNode;
};

export const EditorialStage = ({
  width,
  height,
  stageMode,
  slot,
  presenterMode,
  debug = false,
  children,
}: Props) => {
  const layout = getStageLayout(width, height);
  const slotRect = layout.slots[slot];
  const showPresenter = stageMode !== 'no-presenter';
  const presenterSmall = stageMode === 'presenter-small' || stageMode === 'screen-primary';

  return (
    <AbsoluteFill
      style={{
        background: visualTokens.color.paperWhite,
        color: visualTokens.color.inkBlack,
        fontFamily: visualTokens.fontFamily.body,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(232,229,223,0.55) 1px, transparent 1px), linear-gradient(180deg, rgba(232,229,223,0.55) 1px, transparent 1px)',
          backgroundSize: '96px 96px',
        }}
      />
      {showPresenter ? (
        <div
          style={{
            position: 'absolute',
            left: presenterSmall ? width - layout.edgeMargin - width * 0.18 : layout.presenterSafeZone.x,
            top: presenterSmall ? height * 0.48 : layout.presenterSafeZone.y,
            width: presenterSmall ? width * 0.18 : layout.presenterSafeZone.width,
            height: presenterSmall ? height * 0.28 : layout.presenterSafeZone.height,
            background: presenterMode === 'placeholder' ? visualTokens.color.warmGray : visualTokens.color.softGray,
            border: `2px solid ${visualTokens.color.graphite}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: presenterSmall ? 18 : 30,
            fontWeight: 700,
          }}
        >
          {presenterMode === 'placeholder' ? 'Presenter Placeholder' : 'Presenter Video'}
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: slotRect.x,
          top: slotRect.y,
          width: slotRect.width,
          height: slotRect.height,
        }}
      >
        {children}
      </div>
      {debug ? <StageDebugOverlay width={width} height={height} stageMode={stageMode} /> : null}
    </AbsoluteFill>
  );
};
