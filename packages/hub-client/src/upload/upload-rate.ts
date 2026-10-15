/* @layer site-kit @kind logic */
import { MIN_GAP_MS, MS_PER_S, SMOOTH_MS } from './upload-rate.constants';
import type { RateEstimate } from './upload-rate.type';

const createRate = () => {
  let last: { at: number; sent: number } | null = null;
  let rate: number | null = null;

  const reset = () => {
    last = null;
    rate = null;
  };

  const sample = (sent: number, at: number = performance.now()) => {
    if (!last || sent < last.sent) {
      last = { at, sent };
      return;
    }
    const gap = at - last.at;
    if (gap < MIN_GAP_MS) return;
    const speed = ((sent - last.sent) / gap) * MS_PER_S;
    const share = 1 - Math.exp(-gap / SMOOTH_MS);
    rate = rate === null ? speed : rate + (speed - rate) * share;
    last = { at, sent };
  };

  const estimate = (sent: number, total: number): RateEstimate => {
    if (rate === null || rate <= 0) return { bytesPerSecond: rate, msLeft: null };
    return { bytesPerSecond: rate, msLeft: (Math.max(0, total - sent) / rate) * MS_PER_S };
  };

  return { sample, estimate, reset };
};

export { createRate };
