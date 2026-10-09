/* @layer shared-game @kind logic */
import { stopIndexOf } from './stop-index-of';
import type { PondAskRange } from '../pond.type';

const stopsInRange = (range: PondAskRange): readonly number[] => {
  const { stops, min, max, ceiling } = range;
  const low = stopIndexOf(stops, Math.min(min, ceiling));
  const high = stopIndexOf(stops, Math.min(max, ceiling));
  return stops.slice(low, Math.max(low, high) + 1);
};

export { stopsInRange };
