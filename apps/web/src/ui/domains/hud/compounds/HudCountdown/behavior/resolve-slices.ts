/* @layer renderer-hud @kind logic */
/**
 * Cuts a countdown into slices and says how many are left. A countdown at least as long as the
 * slice count gets that many equal shares of its time, and a slice leaves each time one share is
 * used up. A shorter one gets one slice per second. No slice is left once the seconds reach zero.
 */
import { SHARE_EPSILON, SLICE_COUNT } from '../HudCountdown.constants';
import type { SliceLayout } from '../HudCountdown.type';

const clamp = (value: number, low: number, high: number): number => Math.min(Math.max(value, low), high);

const resolveSlices = (total: number, remaining: number, fractionLeft: number): SliceLayout => {
  const seconds = Math.max(1, Math.floor(total));
  if (seconds < SLICE_COUNT) return { sliceCount: seconds, slicesLeft: clamp(remaining, 0, seconds) };
  if (remaining <= 0) return { sliceCount: SLICE_COUNT, slicesLeft: 0 };
  const shares = Math.ceil(clamp(fractionLeft, 0, 1) * SLICE_COUNT - SHARE_EPSILON);
  return { sliceCount: SLICE_COUNT, slicesLeft: clamp(shares, 0, SLICE_COUNT) };
};

export { resolveSlices };
