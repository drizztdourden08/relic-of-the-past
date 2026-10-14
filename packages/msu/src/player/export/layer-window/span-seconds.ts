/* @layer renderer-lib @kind logic */
import type { ResolvedLayer } from './layer-window.type';
import { bufferSeconds } from './buffer-seconds';
import { intervalPoints } from './interval-points';
import { loopCycleSeconds } from './loop-cycle-seconds';

const spanSeconds = (resolved: ResolvedLayer): number => {
  const { layer, buffers } = resolved;
  switch (layer.mode.kind) {
    case 'loop':
      return loopCycleSeconds(resolved);
    case 'interval': {
      const points = intervalPoints(layer.mode.atSeconds);
      return (points[points.length - 1] ?? 0) + bufferSeconds.longest(buffers);
    }
    case 'random':
      return Math.max(0, layer.mode.minDelaySeconds) + bufferSeconds.longest(buffers);
    case 'once':
      return buffers[0]?.duration ?? 0;
  }
};

export { spanSeconds };
