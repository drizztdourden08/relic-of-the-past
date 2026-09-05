/* @layer renderer-lib @kind logic */
/**
 * Measures the compositor's actual frame cadence by timing animation frames. This
 * is the rate the emulator is being paced against, which can differ from the mode
 * the monitor reports. It may be a 144 Hz panel driven at 60, or a variable-refresh panel
 * settling somewhere in between. Uses the median so one hitch cannot skew it.
 */

const SAMPLE_FRAMES = 12;
// Generous, because a background or occluded window has its frames throttled hard
// and the probe should give up instead of holding the copy button hostage.
const TIMEOUT_MS = 2500;
// A gap this large means the tab was throttled or the compositor stalled, so the
// sample says nothing about the display's cadence.
const MAX_PLAUSIBLE_GAP_MS = 100;

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const probeRefreshRate = (): Promise<number | null> =>
  new Promise((resolve) => {
    const gaps: number[] = [];
    let previous = 0;
    let settled = false;

    const finish = (value: number | null): void => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const timeout = setTimeout(() => finish(null), TIMEOUT_MS);

    const onFrame = (time: number): void => {
      if (previous) gaps.push(time - previous);
      previous = time;
      if (gaps.length < SAMPLE_FRAMES) {
        requestAnimationFrame(onFrame);
        return;
      }
      clearTimeout(timeout);
      const gap = median(gaps.filter((value) => value > 0 && value < MAX_PLAUSIBLE_GAP_MS));
      finish(gap > 0 ? Math.round(1000 / gap) : null);
    };

    requestAnimationFrame(onFrame);
  });

export { probeRefreshRate };
