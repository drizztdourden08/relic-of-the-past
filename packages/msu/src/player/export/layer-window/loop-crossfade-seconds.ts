/* @layer renderer-lib @kind logic */
import type { MsuLayer } from '@rotp/game-data';

const loopCrossfadeSeconds = (layer: MsuLayer): number =>
  (layer.mode.kind === 'loop' ? Math.max(0, layer.mode.crossfadeSeconds ?? 0) : 0);

export { loopCrossfadeSeconds };
