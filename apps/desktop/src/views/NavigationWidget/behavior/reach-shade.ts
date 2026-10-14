/* @layer renderer-widgets @kind logic */
import { BLOCKED_SHADE, LAYER_SHADES, UNKNOWN_LAYER_SHADE, UNREACHED_SHADE } from '../sub-components/ReachabilityCanvas.constants';

const reachShade = (state: number, layer: 0 | 1 | 2 | undefined): number => {
  if (state === 1) return LAYER_SHADES[layer ?? 2] ?? UNKNOWN_LAYER_SHADE;
  return state >= 2 ? BLOCKED_SHADE : UNREACHED_SHADE;
};

export { reachShade };
