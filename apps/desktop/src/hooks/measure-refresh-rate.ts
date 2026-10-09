/* @layer renderer-other @kind logic */
import { SAMPLE_FRAMES, WARMUP_FRAMES } from './measure-refresh-rate.constants';

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

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
