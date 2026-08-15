/* @layer renderer-widgets @kind hook */
/**
 * Runs every registered detector against the live context and folds the
 * result into the shared recommendation store — the piece nothing upstream
 * does yet (see the engine's own README: it has a registry and a store, but
 * nothing that calls `runDetectionSweep` from the running game).
 *
 * Detection is not free — every kind iterates its own detectors over the
 * whole observation set — so this is gated on a CONTENT signature rather than
 * every render: `context` itself is a fresh object each render (nothing
 * upstream memoises the whole tree), but the signature only changes when
 * something a detector could actually act on does — the resolved screen, a
 * count that moves on a genuine game event (a new crossing, a new sprite type,
 * a new grant), or a dataset write. A 600ms debounce on top coalesces the burst
 * of renders a single room transition produces into one pass instead of
 * several.
 *
 * Importing the strategy barrels here (rather than at the app's startup
 * path) is what installs the full detector set as a side effect — this hook
 * is the one place in the renderer that actually runs a sweep, so it
 * is the natural place to guarantee the registry is populated first. The
 * strategy barrels must be imported BEFORE `strategy-detectors`, which reads
 * `allStrategies()` once at import time to turn each one into a detector —
 * see that module's own header. Every kind is a strategy, so there is no
 * separate `detectors` barrel to import alongside these.
 *
 * The signature is built in `./context-signature.ts` and subscribed in
 * `./use-context-signature.ts`, so `use-comparison.ts`'s own (undebounced)
 * diff memo gates on the exact same key without a second debounce timer.
 *
 * This runs even when `context.screenId` is null (an unmapped room), which is
 * what lets `strategies/screen/presence.set.ts` report "the game is on a room
 * with no screen record" at all. Every detector and strategy this pass reaches
 * tolerates a null `screenId` (most early-return on it, which is correct), and
 * `store.ts`'s `applyPass` scopes reconciliation to
 * `scopedToPass(detectorIds, context.screenId)` — with `screenId: null` that
 * predicate only ever matches a PREVIOUS entry whose own `screenId` is also
 * null, so a null-screen pass can only resolve away a null-screen finding,
 * never touch one that belongs to a real, mapped screen.
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
// mapper-less one the generic pass above just installed — see that file's
// own header for why the two cannot be merged into one import.
import '../../recommendations/strategies/connection/wire-detector';

const PASS_DEBOUNCE_MS = 600;

const runPass = (context: DetectionContext): void => {
  const { detectorIds, draftsByKind } = runDetectionSweep(ENTITY_KINDS, context);
  // One store write per collection the sweep touched, keyed by the kind each
  // DRAFT names — a finding is decided under its own kind's file, so it has to
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
    // Gated on the content signature, not object identity — see the file header.
  }, [signature]);
};

export { useDetectionPass };
