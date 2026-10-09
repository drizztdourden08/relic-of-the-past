/* @layer renderer-lib @kind types */
import type { MsuLayer } from '@rotp/game-data';

interface ResolvedLayer {
  layer: MsuLayer;
  index: number;
  buffers: AudioBuffer[];
}

export type { ResolvedLayer };
