/* @layer renderer-components @kind logic */
import type { ViewportInfo } from '../../../game';
import { OVERWORLD_MODULE } from '../GameLayer.constants';
import type { GlowViewportFlags } from './glow-viewport-flags.type';
import { TALL_SNES_HEIGHT } from './useEdgeGlowLoop.constants';

const glowViewportFlags = (vp: ViewportInfo): GlowViewportFlags => {
  const tallScreen = vp.snesHeight === TALL_SNES_HEIGHT;
  return {
    tallScreen,
    hasExtended: vp.extraLeftRight > 0 || vp.extraTopBottom > 0 || tallScreen,
    isOverworld: vp.locationModule === OVERWORLD_MODULE,
  };
};

export { glowViewportFlags };
