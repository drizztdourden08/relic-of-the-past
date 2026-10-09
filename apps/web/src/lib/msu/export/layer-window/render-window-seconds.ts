/* @layer renderer-lib @kind logic */
import type { ResolvedLayer } from './layer-window.type';
import { MAX_RENDER_SECONDS } from './layer-window.constants';
import { dominantLoopLayer } from './dominant-loop-layer';
import { loopCycleSeconds } from './loop-cycle-seconds';
import { spanSeconds } from './span-seconds';

const renderWindowSeconds = (layers: ResolvedLayer[]): number => {
  const dominant = dominantLoopLayer(layers);
  const raw = dominant ? loopCycleSeconds(dominant) : layers.reduce((max, l) => Math.max(max, spanSeconds(l)), 0);
  return Math.min(MAX_RENDER_SECONDS, Math.max(0, raw));
};

export { renderWindowSeconds };
