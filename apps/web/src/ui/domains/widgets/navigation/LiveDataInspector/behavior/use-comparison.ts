/* @layer renderer-widgets @kind hook */
/**
 * Per-record live field differences, for the widget's inline diff display —
 * the `RecordCard` -> `CompactRecordView` prop that renders a disagreeing
 * field as `260 [0x0104]` instead of just `260`.
 *
 * This is deliberately NOT folded into `useDetectionPass`'s own debounced
 * effect: that effect exists to gate an async, PERSISTED side effect
 * (`applyRecommendationPass`, which round-trips through Electron's main
 * process), so a burst of renders during a room transition only ever writes
 * once. A diff map has no such cost — `diffsByRecordFrom` is a pure,
 * synchronous read over the CURRENT screen's handful of records — so it is
 * memoised instead of debounced, gated on the exact same content signature
 * `useDetectionPass` uses (`./context-signature.ts`) so both recompute in
 * lockstep with no second timer.
 *
 * This does mean `runComparison` runs once more here than it does inside
 * `detectorFromStrategy.detect()` (which the persisted pass above already
 * calls, per strategy, per kind). Sharing that single call would mean
 * `RecommendationDetector.detect` — implemented by hand-written detectors
 * too, and composed many-per-kind with id-based dedup in `registry.ts`
 * (`connection` alone carries three hand-written detectors alongside its
 * strategy) — also had to expose the intermediate `Difference[]` it
 * currently discards, which ripples into a contract every detector
 * implements, not just the strategy-backed ones. Given `runComparison`
 * itself is cheap and pure (a few probes over one screen's records, no IO),
 * that is a larger change than this duplication is worth.
 */
import { useMemo } from 'react';
import { diffsByRecordFrom } from '@shared/game/recommendations';
import type { DetectionContext, Difference } from '@shared/game/recommendations';
import { useContextSignature } from './use-context-signature';

const useComparison = (context: DetectionContext): ReadonlyMap<string, ReadonlyMap<string, Difference>> => {
  const signature = useContextSignature(context);
  // Gated on the content signature, not object identity — see the file header.
  return useMemo(() => diffsByRecordFrom(context), [signature]);
};

export { useComparison };
