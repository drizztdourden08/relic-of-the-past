/* @layer renderer-lib @kind logic */
import type { ResolvedLayer } from './layer-window.type';
import { bufferSeconds } from './buffer-seconds';
import { crossfadeWindowSeconds } from './crossfade-window-seconds';
import { loopCrossfadeSeconds } from './loop-crossfade-seconds';

const loopCycleSeconds = (resolved: ResolvedLayer): number => {
  const crossfade = loopCrossfadeSeconds(resolved.layer);
  if (crossfade <= 0) return bufferSeconds.total(resolved.buffers);
  return resolved.buffers.reduce(
    (sum, b) => sum + b.duration - crossfadeWindowSeconds(b.duration, crossfade), 0,
  );
};

export { loopCycleSeconds };
