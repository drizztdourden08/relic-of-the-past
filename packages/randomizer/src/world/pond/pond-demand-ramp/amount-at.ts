/* @layer shared-game @kind logic */
import { stopIndexOf } from './stop-index-of';
import type { PondAskRange } from '../pond.type';

const amountAt = (range: PondAskRange, position: number): number => {
  const { stops, min, max, ceiling } = range;
  const low = stopIndexOf(stops, Math.min(min, ceiling));
  const high = stopIndexOf(stops, Math.min(max, ceiling));
  const span = Math.max(0, high - low);
  return stops[low + Math.round(position * span)];
};

export { amountAt };
