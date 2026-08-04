/* @layer renderer-widgets @kind hook */
/**
 * Runs every registered detector against the live context and folds the
 * result into the shared recommendation store — the piece nothing upstream
 * does yet (see the engine's own README: it has a registry and a store, but
 * nothing that calls `runDetection` from the running game).
 *
 * Detection is not free — every kind iterates its own detectors over the
 * whole observation set — so this is gated on a CONTENT signature rather than
 * every render: `context` itself is a fresh object each render (nothing
 * upstream memoises the whole tree), but the signature below only changes
 * when something a detector could actually act on does — the resolved
 * screen, or a count that only moves on a genuine game event (a new
 * crossing, a new sprite type, a new grant). A 600ms debounce on top
 * coalesces the burst of renders a single room transition produces into one
 * pass instead of several.
 *
 * Importing the strategy barrels here (rather than at the app's startup
 * path) is what installs the full detector set as a side effect — this hook
 * is the one place in the renderer that actually calls `runDetection`, so it
 * is the natural place to guarantee the registry is populated first. The
 * strategy barrels must be imported BEFORE `strategy-detectors`, which reads
 * `allStrategies()` once at import time to turn each one into a detector —
 * see that module's own header. Every kind is a strategy now (phase 5
 * ported the last hand-written detectors), so there is no separate
 * `detectors` barrel left to import alongside these.
 *
 * `signatureOf` lives in `./context-signature.ts` rather than here, so
 * `use-comparison.ts`'s own (undebounced) diff memo can gate on the exact
 * same key without a second debounce timer of its own.
 *
 * This runs even when `context.screenId` is null (an unmapped room) — that
 * guard used to short-circuit the whole effect, which made the F3 gap
 * (`strategies/screen/presence.set.ts`) unreachable: nothing ran, so nothing
 * could ever report "the game is on a room with no screen record". Every
 * detector and strategy this pass reaches already tolerates a null
 * `screenId` (most early-return on it, which is correct), and
 * `store.ts`'s `applyPass` scopes reconciliation to
 * `scopedToPass(detectorIds, context.screenId)` — with `screenId: null` that
 * predicate only ever matches a PREVIOUS entry whose own `screenId` is also
 * null, so a null-screen pass can only resolve away a null-screen finding,
 * never touch one that belongs to a real, mapped screen.
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
// mapper-less one the generic pass above just installed — see that file's
// own header for why the two cannot be merged into one import.
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
    // Gated on the content signature, not object identity — see the file header.
  }, [signature]);
};

export { useDetectionPass };
