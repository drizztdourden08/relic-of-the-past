/* @layer renderer-widgets @kind hook */
/**
 * Per-record live field differences for the widget's inline diff display
 * (`260 [0x0104]` instead of `260`).
 *
 * Not folded into `useDetectionPass`'s debounced effect: that one gates a
 * persisted, async side effect. This diff map is a pure synchronous read over
 * one screen's records, so it is memoised on the same content signature
 * (`./context-signature.ts`) with no second timer.
 *
 * `runComparison` therefore runs once more here than inside
 * `detectorFromStrategy.detect()`. Sharing that call would force every
 * detector's `detect` to expose the intermediate `Difference[]`; the
 * duplication is cheaper than that contract change.
 */
import { useMemo } from 'react';
import { diffsByRecordFrom } from '@shared/game/recommendations';
import type { DetectionContext, Difference } from '@shared/game/recommendations';
import { signatureOf } from './context-signature';

const useComparison = (context: DetectionContext): ReadonlyMap<string, ReadonlyMap<string, Difference>> => {
  const signature = signatureOf(context);
  // Gated on the content signature, not object identity.
  return useMemo(() => diffsByRecordFrom(context), [signature]);
};

export { useComparison };
