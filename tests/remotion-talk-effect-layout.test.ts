import {describe, expect, it} from 'vitest';
import {getStageLayout} from '../src/editorial/stage/stage.config';
import {getRemotionTalkEffectLayout} from '../src/editorial/components/RemotionTalkEffect';

describe('C21 RemotionTalkEffect layout', () => {
  it('anchors the panel in the upper-left safe region at 1920x1080', () => {
    const layout = getStageLayout(1920, 1080);
    const panel = getRemotionTalkEffectLayout(1920, 1080);

    expect(panel).toEqual({
      left: 48,
      top: 81,
      width: 566,
      minHeight: 788,
      paddingX: 24,
      paddingY: 18,
    });
    expect(panel.left + panel.width).toBeLessThanOrEqual(layout.presenterSafeZone.x);
    expect(panel.top + panel.minHeight).toBeLessThan(layout.subtitleSafeZone.y);
  });
});
