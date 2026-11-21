/* @layer shared-game @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { EntityKind, EntityRecordMap } from '@rotp/game-data';
import type { DetectionContext, RecommendationDetector } from '../detection-types';
import type { DraftRecommendation } from '../types';
import type { UnresolvableMapper } from './detector-from-strategy.type';
import type { Difference, SetDifference } from './difference.type';
import type { ComparisonStrategy, ErasedSetProbe } from './probe.type';
import { setPath } from './record-path';
import { runComparison } from './run-comparison';

const detectorIdOf = (kind: EntityKind): string => `strategy:${kind}`;

const reasonForField = (difference: Difference): Message => {
  const { label, shown } = difference;
  if (difference.status === 'mismatch') return msg('views-data-inspector:rec.reason.mismatch', { label, dataset: shown.dataset, live: shown.live });
  if (difference.status === 'missing-in-dataset') return msg('views-data-inspector:rec.reason.missing-in-dataset', { label, live: shown.live });
  return msg('views-data-inspector:rec.reason.absent-in-game', { label, dataset: shown.dataset });
};

const draftForField = <K extends EntityKind>(
  strategy: ComparisonStrategy<K>,
  record: EntityRecordMap[K],
  difference: Difference,
  context: DetectionContext,
): DraftRecommendation<K> => ({
  kind: strategy.kind,
  action: 'update',
  targetId: record.id,
  current: record,
  proposed: setPath(record, difference.path, difference.liveValue),
  reason: reasonForField(difference),
  detector: detectorIdOf(strategy.kind),
  evidence: [{ source: difference.source, detail: `${difference.label}: dataset=${difference.shown.dataset}, live=${difference.shown.live}` }],
  confidence: difference.confidence,
  screenId: context.screenId,
  origin: context.origin,
  key: difference.path,
});

const setDraft = <K extends EntityKind>(
  kind: K,
  probe: ErasedSetProbe<K>,
  difference: SetDifference<K>,
  context: DetectionContext,
): DraftRecommendation | null => {
  const key = `${difference.noun}:${difference.key}`;
  const detector = detectorIdOf(kind);
  if (difference.status === 'missing-in-dataset') {
    return {
      kind, action: 'create', targetId: null, current: null, proposed: difference.proposed,
      reason: msg('views-data-inspector:rec.reason.set-create', { noun: difference.noun, key: difference.key }),
      detector,
      evidence: [{ source: probe.source, detail: `live ${difference.noun} key ${difference.key} has no dataset match` }],
      confidence: probe.confidence, screenId: context.screenId, origin: context.origin, key,
    };
  }
  if (difference.status === 'unbacked-in-dataset') {
    return {
      kind, action: 'delete', targetId: difference.record.id, current: difference.record,
      proposed: difference.record,
      reason: msg('views-data-inspector:rec.reason.set-delete', { noun: difference.noun, key: difference.key }),
      detector,
      evidence: [{ source: probe.source, detail: `dataset ${difference.noun} key ${difference.key} has no live match` }],
      confidence: probe.removalConfidence ?? probe.confidence,
      screenId: context.screenId, origin: context.origin, key,
    };
  }
  return null;
};

const draftsForSet = <K extends EntityKind>(
  strategy: ComparisonStrategy<K>,
  context: DetectionContext,
  onUnresolvable: UnresolvableMapper<K> | undefined,
): DraftRecommendation[] => {
  const out: DraftRecommendation[] = [];
  for (const probe of strategy.sets) {
    for (const difference of probe.compare(context.observations, context.screenId)) {
      const draft = difference.status === 'unresolvable'
        ? onUnresolvable?.(difference, context) ?? null
        : setDraft(strategy.kind, probe, difference, context);
      if (draft) out.push(draft);
    }
  }
  return out;
};

const detectorFromStrategy = <K extends EntityKind>(
  strategy: ComparisonStrategy<K>,
  onUnresolvable?: UnresolvableMapper<K>,
): RecommendationDetector => ({
  id: detectorIdOf(strategy.kind),
  kinds: [strategy.kind],
  detect: (context: DetectionContext) => {
    const comparisons = runComparison(strategy, context.observations, context.screenId);
    const fieldDrafts = comparisons.flatMap(({ record, differences }) => (
      differences.map(difference => draftForField(strategy, record, difference, context))
    ));
    return [...fieldDrafts, ...draftsForSet(strategy, context, onUnresolvable)];
  },
});

export { detectorFromStrategy };
