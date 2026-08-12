/* @layer renderer-components @kind hook */
/**
 * Gate in front of button capture: samples the idle stream briefly and, if
 * any bytes are still moving with nothing touched, opens a dialog listing
 * only those bytes with their live movement, before letting the user
 * proceed. See flaky-byte-detect.ts for the sampling itself.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { sampleFlakyBytes } from '../flaky-byte-detect';
import type { FlakyByte } from '../flaky-byte-detect';

/** How often the dialog's live movement readout refreshes while it's open. */
const LIVE_REFRESH_MS = 200;

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

  // Refreshes each flagged byte's own range while the dialog stays open, so
  // the user can see whether it is still misbehaving right now, not just at
  // the instant the check ran.
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

  /** Runs the flaky-byte check; calls `onProceed` immediately when nothing is
   *  flagged, or opens the dialog and defers `onProceed` to the user's choice. */
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
