/* @layer renderer-widgets @kind hook */
/**
 * Runs every registered detector against the live context and folds the
 * result into the shared recommendation store. Nothing upstream calls
 * `runDetection` from the running game; this hook is the one place that does.
 *
 * Detection iterates every detector over the whole observation set, so it is
 * gated on a content signature (`./context-signature.ts`, shared with
 * `use-comparison.ts`), not on `context` identity, which is a fresh object
 * each render. A 600ms debounce coalesces the burst of renders one room
 * transition produces into a single pass.
 *
 * Importing the strategy barrels here installs the full detector set. They
 * must be imported BEFORE `strategy-detectors`, which reads `allStrategies()`
 * once at import time.
 *
 * This runs even when `context.screenId` is null (an unmapped room): the F3
 * gap (`strategies/screen/presence.set.ts`) is only reachable that way. Every
 * detector tolerates a null `screenId`, and `store.ts`'s `applyPass` scopes
 * reconciliation with `scopedToPass(detectorIds, context.screenId)`, so a
 * null-screen pass can only resolve a null-screen finding.
 */
import { useEffect, useRef } from 'react';
import { applyRecommendationPass } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/recommendation-cache';
import { ENTITY_KINDS } from '@app/ui/domains/app/views/DataInspector/DataInspector.constants';
import { detectorsFor, runDetection } from '@shared/game/recommendations';
import type { DetectionContext } from '@shared/game/recommendations';
import { signatureOf } from './context-signature';
import '../../recommendations/strategies/connection';
import '@shared/game/recommendations/strategies/screen';
import '@shared/game/recommendations/strategies/actor';
import '@shared/game/recommendations/strategies/check';
import '@shared/game/recommendations/strategies/dungeon';
import '@shared/game/recommendations/strategies/item';
import '@shared/game/recommendations/strategy-detectors';
// Must come AFTER `strategy-detectors`: it re-registers the `connection`
// strategy's detector WITH its `onUnresolvable` mapper, overwriting the
// mapper-less one the generic pass above just installed.
import '../../recommendations/strategies/connection/wire-detector';

const PASS_DEBOUNCE_MS = 600;

const runPass = (context: DetectionContext): void => {
  for (const kind of ENTITY_KINDS) {
    if (detectorsFor(kind).length === 0) continue;
    const { detectorIds, drafts } = runDetection(kind, context);
    void applyRecommendationPass(kind, context, detectorIds, drafts);
  }
};

const useDetectionPass = (context: DetectionContext): void => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signature = signatureOf(context);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => runPass(context), PASS_DEBOUNCE_MS);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // Gated on the content signature, not object identity.
  }, [signature]);
};

export { useDetectionPass };
