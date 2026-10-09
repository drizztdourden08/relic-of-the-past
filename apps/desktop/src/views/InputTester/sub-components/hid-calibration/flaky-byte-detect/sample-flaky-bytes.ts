/* @layer renderer-components @kind logic */
import { FLAKY_MIN_RANGE, FLAKY_SAMPLE_INTERVAL_MS, FLAKY_SAMPLE_MS } from './flaky-byte-detect.constants';
import type { FlakyByte } from './flaky-byte-detect.type';

const sampleFlakyBytes = (latestBytesRef: { current: Uint8Array }, excluded: ReadonlySet<number>): Promise<FlakyByte[]> =>
  new Promise((resolve) => {
    const mins: number[] = [];
    const maxs: number[] = [];
    const sample = () => {
      latestBytesRef.current.forEach((value, i) => {
        const min = mins[i];
        const max = maxs[i];
        if (min === undefined || value < min) mins[i] = value;
        if (max === undefined || value > max) maxs[i] = value;
      });
    };
    sample();
    const interval = setInterval(sample, FLAKY_SAMPLE_INTERVAL_MS);
    setTimeout(() => {
      clearInterval(interval);
      const out: FlakyByte[] = [];
      for (let i = 0; i < mins.length; i++) {
        if (excluded.has(i)) continue;
        const range = (maxs[i] ?? 0) - (mins[i] ?? 0);
        if (range >= FLAKY_MIN_RANGE) out.push({ byteIndex: i, range });
      }
      out.sort((a, b) => b.range - a.range);
      resolve(out);
    }, FLAKY_SAMPLE_MS);
  });

export { sampleFlakyBytes };
