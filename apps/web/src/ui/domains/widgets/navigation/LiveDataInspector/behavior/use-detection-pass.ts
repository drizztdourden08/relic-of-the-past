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
 * Importing the two detector barrels here (rather than at the app's startup
 * path) is what installs the full detector set as a side effect — this hook
 * is the one place in the renderer that actually calls `runDetection`, so it
 * is the natural place to guarantee the registry is populated first.
 */
import { useEffect, useRef } from 'react';
import { applyRecommendationPass } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/recommendation-cache';
import { ENTITY_KINDS } from '@app/ui/domains/app/views/DataInspector/DataInspector.constants';
import { detectorsFor, runDetection } from '@shared/game/recommendations';
import type { DetectionContext } from '@shared/game/recommendations';
import '../../recommendations/detectors';
import '@shared/game/recommendations/detectors';

const PASS_DEBOUNCE_MS = 600;

const signatureOf = (context: DetectionContext): string => {
  const { observations } = context;
  return [
    context.screenId, observations.realAvailable ? 1 : 0,
    observations.unmatchedCrossings.length, observations.existingConnections.length,
    observations.liveSprites?.length ?? -1, observations.grantedItems?.length ?? -1,
    observations.chests?.length ?? -1,
  ].join('|');
};

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
    if (!context.screenId) return undefined;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => runPass(context), PASS_DEBOUNCE_MS);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // Gated on the content signature, not object identity — see the file header.
  }, [signature]);
};

export { useDetectionPass };
