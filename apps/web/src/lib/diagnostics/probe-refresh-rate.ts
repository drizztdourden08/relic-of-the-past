/* @layer renderer-lib @kind logic */
import { GIVE_UP_AFTER_MS, MAX_PLAUSIBLE_GAP_MS, SAMPLE_FRAMES } from './probe-refresh-rate.constants';

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

    const timeout = setTimeout(() => finish(null), GIVE_UP_AFTER_MS);

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
