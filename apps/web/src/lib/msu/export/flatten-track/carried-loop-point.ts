/* @layer renderer-lib @kind logic */
import { MSU1_SAMPLE_RATE } from '../../decode/parse-msu1';
import type { ResolvedLayer } from '../layer-window';
import { loopCrossfadeSeconds } from '../layer-window';

const carriedLoopPoint = (dominant: ResolvedLayer | null): number | null => {
  if (!dominant || dominant.buffers.length !== 1) return null;
  if (loopCrossfadeSeconds(dominant.layer) > 0) return null;
  const loopSample = dominant.layer.loopSample ?? 0;
  if (loopSample <= 0) return null;
  const frames = Math.floor(dominant.buffers[0].duration * MSU1_SAMPLE_RATE);
  return loopSample < frames ? loopSample : null;
};

export { carriedLoopPoint };
