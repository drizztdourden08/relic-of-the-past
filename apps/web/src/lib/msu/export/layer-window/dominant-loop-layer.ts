/* @layer renderer-lib @kind logic */
import type { ResolvedLayer } from './layer-window.type';
import { loopCycleSeconds } from './loop-cycle-seconds';

const dominantLoopLayer = (layers: ResolvedLayer[]): ResolvedLayer | null => {
  let best: ResolvedLayer | null = null;
  for (const resolved of layers) {
    if (resolved.layer.mode.kind !== 'loop' || resolved.buffers.length === 0) continue;
    if (!best || loopCycleSeconds(resolved) > loopCycleSeconds(best)) best = resolved;
  }
  return best;
};

export { dominantLoopLayer };
