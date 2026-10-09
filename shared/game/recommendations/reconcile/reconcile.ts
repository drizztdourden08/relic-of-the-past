/* @layer shared-game @kind logic */
import type { EntityKind } from '../../data/types';
import { recommendationId } from '../id';
import type { DraftRecommendation, Recommendation } from '../types';
import type { ReconcileOptions } from './reconcile.type';

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

const isDecided = (entry: Recommendation): boolean => entry.state === 'accepted' || entry.state === 'dismissed';

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

    if (isDecided(entry) || !inScope(entry)) {
      kept.push(entry);
      continue;
    }

    if (match) {
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

export { reconcile };
