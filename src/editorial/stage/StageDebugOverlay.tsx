import type {StageMode} from './stage.types';
import {getStageLayout} from './stage.config';
import {visualTokens} from './visual-tokens';

type Props = {
  width: number;
  height: number;
  stageMode: StageMode;
};

export const StageDebugOverlay = ({width, height, stageMode}: Props) => {
  const layout = getStageLayout(width, height);

  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', fontFamily: visualTokens.fontFamily.body}}>
      <div
        style={{
          position: 'absolute',
          left: layout.presenterSafeZone.x,
          top: layout.presenterSafeZone.y,
          width: layout.presenterSafeZone.width,
          height: layout.presenterSafeZone.height,
          border: `3px dashed ${visualTokens.color.signalOrange}`,
          color: visualTokens.color.signalOrange,
          fontSize: 22,
          padding: 8,
        }}
      >
        presenter safe
      </div>
      <div
        style={{
          position: 'absolute',
          left: layout.subtitleSafeZone.x,
          top: layout.subtitleSafeZone.y,
          width: layout.subtitleSafeZone.width,
          height: layout.subtitleSafeZone.height,
          background: 'rgba(37, 99, 235, 0.08)',
          borderTop: `3px dashed ${visualTokens.color.electricBlue}`,
          color: visualTokens.color.electricBlue,
          fontSize: 22,
          padding: 8,
        }}
      >
        subtitle safe
      </div>
      {Object.entries(layout.slots).map(([name, slot]) => (
        <div
          key={name}
          style={{
            position: 'absolute',
            left: slot.x,
            top: slot.y,
            width: slot.width,
            height: slot.height,
            border: `1px solid rgba(21, 21, 21, 0.25)`,
            color: visualTokens.color.graphite,
            fontSize: 16,
            padding: 4,
          }}
        >
          {name}
        </div>
      ))}
      <div
        style={{
          position: 'absolute',
          right: 28,
          top: 24,
          background: visualTokens.color.inkBlack,
          color: visualTokens.color.paperWhite,
          padding: '8px 12px',
          fontSize: 20,
        }}
      >
        {stageMode}
      </div>
    </div>
  );
};
