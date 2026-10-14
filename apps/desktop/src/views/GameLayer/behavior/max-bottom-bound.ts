/* @layer renderer-components @kind logic */
import type { ViewportInfo } from '../../../game';
import { TALL_SCREEN_BOTTOM_MAX } from './useEdgeGlowLoop.constants';

const maxBottomBound = (vp: ViewportInfo, tallScreen: boolean): number => {
  if (vp.extraTopBottom > 0) return vp.extraTopBottom;
  return tallScreen ? TALL_SCREEN_BOTTOM_MAX : 0;
};

export { maxBottomBound };
