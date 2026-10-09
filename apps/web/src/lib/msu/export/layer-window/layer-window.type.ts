/* @layer renderer-lib @kind types */
import type { MsuLayer } from '@shared/types/msu-manifest';

interface ResolvedLayer {
  layer: MsuLayer;
  index: number;
  buffers: AudioBuffer[];
}

export type { ResolvedLayer };
