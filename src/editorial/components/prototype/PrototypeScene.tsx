import type {ComponentRendererProps} from '../../registry/component.types';
import {visualTokens} from '../../stage/visual-tokens';

export const PrototypeScene = ({scene, assetStatus}: ComponentRendererProps) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: visualTokens.color.paperWhite,
        border: `2px solid ${visualTokens.color.warmGray}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 28,
        color: visualTokens.color.inkBlack,
        fontFamily: visualTokens.fontFamily.body,
      }}
    >
      <div style={{fontSize: 22, color: visualTokens.color.signalOrange, fontWeight: 700}}>
        PROTOTYPE，不可用于正式高清渲染
      </div>
      <div>
        <div style={{fontSize: 52, fontWeight: 800, lineHeight: 1.05}}>{scene.kind}</div>
        <div style={{marginTop: 12, fontSize: 24, color: visualTokens.color.graphite}}>
          {scene.id} / {scene.slot}
        </div>
      </div>
      <div style={{fontSize: 20, color: visualTokens.color.mutedBlue}}>素材状态：{assetStatus}</div>
    </div>
  );
};
