/* @layer site-kit @kind logic */
/**
 * Upload speed and time left, smoothed so the numbers do not jump with every progress
 * event. Each sample moves the rate towards the speed since the last sample by a share that
 * grows with the time between them (an exponential average over about SMOOTH_MS). Samples
 * closer than MIN_GAP_MS are folded into the next one.
 */
const SMOOTH_MS = 4000;
const MIN_GAP_MS = 400;
const MS_PER_S = 1000;

type RateEstimate = { bytesPerSecond: number | null; msLeft: number | null };

const createRate = () => {
  let last: { at: number; sent: number } | null = null;
  let rate: number | null = null;

  /** Forgets the history, for a job that starts again after a pause. */
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

type UploadRate = ReturnType<typeof createRate>;

export { createRate };
export type { RateEstimate, UploadRate };
