/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { sampleFlakyBytes } from '../flaky-byte-detect';
import type { FlakyByte } from '../flaky-byte-detect';
import { LIVE_REFRESH_MS } from './useFlakyByteWarning.constants';

const useFlakyByteWarning = (
  latestBytesRef: React.MutableRefObject<Uint8Array>,
  excludedRef: React.MutableRefObject<Set<number>>,
  syncExcludedState: (s: Set<number>) => void,
) => {
  const [open, setOpen] = useState(false);
  const [flakyBytes, setFlakyBytes] = useState<FlakyByte[]>([]);
  const [liveRanges, setLiveRanges] = useState<Record<number, number>>({});
  const proceedRef = useRef<() => void>(() => {});
  const livePeaksRef = useRef<Record<number, { min: number; max: number }>>({});

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      const bytes = latestBytesRef.current;
      for (const { byteIndex } of flakyBytes) {
        const v = bytes[byteIndex] ?? 0;
        const prev = livePeaksRef.current[byteIndex] ?? { min: v, max: v };
        livePeaksRef.current[byteIndex] = { min: Math.min(prev.min, v), max: Math.max(prev.max, v) };
      }
      setLiveRanges(Object.fromEntries(
        Object.entries(livePeaksRef.current).map(([k, { min, max }]) => [k, max - min]),
      ));
    }, LIVE_REFRESH_MS);
    return () => clearInterval(interval);
  }, [open, flakyBytes, latestBytesRef]);

  const checkBeforeStart = useCallback((onProceed: () => void) => {
    sampleFlakyBytes(latestBytesRef, excludedRef.current).then((found) => {
      if (found.length === 0) { onProceed(); return; }
      livePeaksRef.current = {};
      setFlakyBytes(found);
      proceedRef.current = onProceed;
      setOpen(true);
    });
  }, [latestBytesRef, excludedRef]);

  const excludeAndContinue = useCallback((indices: number[]) => {
    const excl = new Set(excludedRef.current);
    for (const byteIndex of indices) excl.add(byteIndex);
    excludedRef.current = excl;
    syncExcludedState(new Set(excl));
    setOpen(false);
    proceedRef.current();
  }, [excludedRef, syncExcludedState]);

  const continueWithoutExcluding = useCallback(() => { setOpen(false); proceedRef.current(); }, []);
  const cancel = useCallback(() => setOpen(false), []);

  return { flakyDialogOpen: open, flakyBytes, liveRanges, checkBeforeStart, excludeAndContinue, continueWithoutExcluding, cancel };
};

export { useFlakyByteWarning };
