/* @layer renderer-other @kind logic */
/**
 * Measures the display's refresh rate from frame-callback spacing.
 *
 * The only signal available on every target: the web has no refresh-rate API and
 * mobile reports nothing without a native plugin. Frame callbacks are aligned to
 * the vertical blank, so the gap between them IS the refresh interval. Against a
 * display the OS reported as 120 Hz, this returned 120.00.
 */

/** Discard the first few callbacks; intervals right after a loop starts are noisy. */
const WARMUP_FRAMES = 5;
/** Enough samples to absorb a stray long frame without making the readout feel laggy. */
const SAMPLE_FRAMES = 40;

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Sample frame spacing once and resolve the implied rate, or null if it could not be read.
 * Uses the median, not the mean, so one dropped frame (which doubles a single interval)
 * cannot drag the answer down.
 */
const measureRefreshRate = (): Promise<number | null> => new Promise((resolve) => {
  const intervals: number[] = [];
  let previous = 0;
  let seen = 0;

  const tick = (time: number) => {
    seen++;
    if (seen > WARMUP_FRAMES && previous) intervals.push(time - previous);
    previous = time;
    if (intervals.length >= SAMPLE_FRAMES) {
      const ms = median(intervals);
      resolve(ms > 0 ? 1000 / ms : null);
      return;
    }
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
});

export { measureRefreshRate };
