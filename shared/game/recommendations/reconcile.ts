/* @layer shared-game @kind logic */
/**
 * Folding a fresh detection pass into what the store already holds.
 *
 * Three rules, and they are the whole reason the module can be re-run on every
 * screen change without turning into a landfill:
 *
 *  1. A finding that reproduces collapses onto its existing entry. Same content,
 *     same id, so it updates in place instead of arriving as a second row.
 *  2. An `open` finding that no longer reproduces becomes `resolved` — the
 *     dataset was fixed, or the game says something different now.
 *  3. A decision is FINAL. `accepted` and `dismissed` are the only two states a
 *     person put there, and neither re-detection nor disappearance moves them.
 *     Without this a dismissed finding would un-dismiss itself the next time the
 *     player walked back onto the screen, which is the failure that makes a
 *     suggestion list worth ignoring.
 *
 * A `resolved` entry is not a decision, so it DOES reopen if the thing comes
 * back — that is the difference between "no longer reproduces" and "reviewed".
 */
import type { EntityKind } from '../data/types';
import { recommendationId } from './id';
import type { DraftRecommendation, Recommendation } from './types';

interface ReconcileOptions {
  /**
   * Which existing entries this pass is entitled to resolve.
   *
   * A pass normally covers ONE screen through a known set of detectors, and the
   * fresh drafts say nothing about anything else. Without a scope, folding that
   * pass in would read every entry about every other screen as "no longer
   * reproduces" and resolve the lot. Defaults to "everything", which is correct
   * only for a pass that really did re-derive the whole collection — use
   * `scopedToPass` for the normal case.
   */
  inScope?: (recommendation: Recommendation) => boolean;
  /** Injectable so a test can assert on `decidedAt` without freezing the clock. */
  now?: number;
}

/**
 * The usual scope: entries this run's detectors own, for the screen this run
 * looked at. An entry from another detector, or about another screen, is left
 * exactly as it was.
 */
const scopedToPass = (
  detectorIds: readonly string[],
  screenId: string | null,
): ((recommendation: Recommendation) => boolean) => {
  const owners = new Set(detectorIds);
  return (recommendation) => owners.has(recommendation.detector) && recommendation.screenId === screenId;
};

/** The payload half of an entry — everything a fresh pass is allowed to refresh. */
const payloadOf = <K extends EntityKind>(draft: DraftRecommendation<K>) => ({
  kind: draft.kind,
  action: draft.action,
  targetId: draft.targetId,
  current: draft.current,
  proposed: draft.proposed,
  reason: draft.reason,
  detector: draft.detector,
  evidence: draft.evidence,
  confidence: draft.confidence,
  screenId: draft.screenId,
  origin: draft.origin,
});

const reconcile = (
  previous: readonly Recommendation[],
  fresh: readonly DraftRecommendation[],
  options: ReconcileOptions = {},
): readonly Recommendation[] => {
  const { inScope = () => true, now = Date.now() } = options;

  const freshById = new Map<string, DraftRecommendation>();
  for (const draft of fresh) freshById.set(recommendationId(draft), draft);

  const kept: Recommendation[] = [];
  const claimed = new Set<string>();

  for (const entry of previous) {
    const match = freshById.get(entry.id);
    if (match) claimed.add(entry.id);

    // A decision outranks everything the pass has to say, including the fact
    // that the finding is still there.
    if (entry.state === 'accepted' || entry.state === 'dismissed') {
      kept.push(entry);
      continue;
    }

    if (!inScope(entry)) {
      kept.push(entry);
      continue;
    }

    if (match) {
      // Identity and first-seen belong to the entry; the rest is re-derived, so
      // a reason or a proposed record that improved between passes shows through.
      kept.push({ ...entry, ...payloadOf(match), state: 'open', decidedAt: null });
      continue;
    }

    kept.push(entry.state === 'open' ? { ...entry, state: 'resolved', decidedAt: now } : entry);
  }

  for (const [id, draft] of freshById) {
    if (claimed.has(id)) continue;
    kept.push({ ...payloadOf(draft), id, state: 'open', firstSeenAt: now, decidedAt: null });
  }

  return kept;
};

export { reconcile, scopedToPass };
export type { ReconcileOptions };
