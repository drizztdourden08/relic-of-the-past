/* @layer renderer-widgets @kind hook */
/**
 * Runs every registered detector against the live context and folds the
 * result into the shared recommendation store. Nothing upstream calls
 * `runDetectionSweep` from the running game; this hook is the one place that does.
 *
 * Detection iterates every detector over the whole observation set, so it is
 * gated on a content signature, not on `context` identity, which is a fresh
 * object each render. The signature only changes when something a detector could
 * act on does: the resolved screen, a count that moves on a real game event (a
 * new crossing, a new sprite type, a new grant), or a dataset write. A 600ms
 * debounce coalesces the burst of renders one room transition produces into a
 * single pass.
 *
 * Importing the strategy barrels here installs the full detector set. They
 * must be imported BEFORE `strategy-detectors`, which reads `allStrategies()`
 * once at import time.
 *
 * The signature is built in `./context-signature.ts` and subscribed in
 * `./use-context-signature.ts`, so `use-comparison.ts`'s own undebounced diff
 * memo gates on the exact same key without a second debounce timer.
 *
 * This runs even when `context.screenId` is null (an unmapped room), which is
 * what lets `strategies/screen/presence.set.ts` report that the game is on a
 * room with no screen record. Every detector tolerates a null `screenId`, and
 * `store.ts`'s `applyPass` scopes reconciliation with
 * `scopedToPass(detectorIds, context.screenId)`, so a null-screen pass can only
 * resolve a null-screen finding.
 */
import { useEffect, useRef } from 'react';
import { applyRecommendationPass } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/recommendation-cache';
import { ENTITY_KINDS } from '@app/ui/domains/app/views/DataInspector/DataInspector.constants';
import { runDetectionSweep } from '@shared/game/recommendations';
import type { DetectionContext } from '@shared/game/recommendations';
import { useContextSignature } from './use-context-signature';
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
  const { detectorIds, draftsByKind } = runDetectionSweep(ENTITY_KINDS, context);
  // One store write per collection the sweep touched, keyed by the kind each
  // DRAFT names. A finding is decided under its own kind's file, so it has to
  // be persisted there too or accepting it can never close it.
  for (const [kind, drafts] of draftsByKind) {
    void applyRecommendationPass(kind, context, detectorIds, drafts);
  }
};

const useDetectionPass = (context: DetectionContext): void => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signature = useContextSignature(context);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => runPass(context), PASS_DEBOUNCE_MS);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // Gated on the content signature, not object identity.
  }, [signature]);
};

export { useDetectionPass };
