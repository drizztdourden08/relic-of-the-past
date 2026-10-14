/* @layer renderer-components @kind logic */
import type { EdgeGlowRenderer } from '@rotp/game-core';
import type { ViewportInfo } from '../../../game';
import { edgeGlowFade } from './edge-glow-fade';
import { glowViewportFlags } from './glow-viewport-flags';
import { maxBottomBound } from './max-bottom-bound';
import type { FadeState } from './useEdgeGlowLoop.type';

const applyGlowViewport = (renderer: EdgeGlowRenderer, vp: ViewportInfo | null, edgeEffectOn: boolean, fade: FadeState): void => {
  if (!vp) {
    renderer.setEnabled(false);
    return;
  }
  const { tallScreen, hasExtended, isOverworld } = glowViewportFlags(vp);
  if (isOverworld && hasExtended && edgeEffectOn) {
    renderer.setEnabled(true);
  } else if (!edgeEffectOn || !isOverworld) {
    renderer.setEnabled(false);
  }
  if (!isOverworld) return;
  renderer.setBlackBounds(vp.blackLeft, vp.blackRight, vp.blackBottom, vp.blackTop);
  renderer.setMaxBounds(vp.extraLeftRight, vp.extraLeftRight, maxBottomBound(vp, tallScreen), vp.extraTopBottom);
  edgeGlowFade.trackOverworldCrossing(fade, vp, hasExtended);
};

export { applyGlowViewport };
