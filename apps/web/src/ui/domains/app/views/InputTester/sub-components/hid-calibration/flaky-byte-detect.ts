/* @layer renderer-components @kind logic */
/**
 * Finds bytes that are still changing while nothing is being touched: the
 * single most common cause of a bad button capture, per the wizard's own
 * instructions panel. Used right before button capture starts, so the user
 * can exclude them up front instead of discovering the damage mid-capture.
 * See hooks/useFlakyByteWarning.ts for how the result becomes a dialog.
 */

/** Below this range over the sample window, a byte's wobble reads as normal
 *  ADC noise rather than something worth interrupting the flow for. */
const FLAKY_MIN_RANGE = 3;

/** How long to watch the idle stream before deciding a byte is flaky. */
const FLAKY_SAMPLE_MS = 500;

interface FlakyByte {
  byteIndex: number;
  range: number;
}

/** Samples `latestBytesRef` for FLAKY_SAMPLE_MS and returns every
 *  non-excluded byte whose value still moved by at least FLAKY_MIN_RANGE,
 *  sorted by how much it moved. Excluded bytes are skipped: they are
 *  already out of the capture's way, so warning about them again would
 *  just be noise. */
const sampleFlakyBytes = (latestBytesRef: { current: Uint8Array }, excluded: ReadonlySet<number>): Promise<FlakyByte[]> =>
  new Promise((resolve) => {
    const mins: number[] = [];
    const maxs: number[] = [];
    const sample = () => {
      const bytes = latestBytesRef.current;
      for (let i = 0; i < bytes.length; i++) {
        if (mins[i] === undefined || bytes[i] < mins[i]) mins[i] = bytes[i];
        if (maxs[i] === undefined || bytes[i] > maxs[i]) maxs[i] = bytes[i];
      }
    };
    sample();
    const interval = setInterval(sample, 16);
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

export { FLAKY_MIN_RANGE, FLAKY_SAMPLE_MS, sampleFlakyBytes };
export type { FlakyByte };
