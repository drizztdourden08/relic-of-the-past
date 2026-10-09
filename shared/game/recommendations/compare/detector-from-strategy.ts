/* @layer shared-game @kind logic */
import type { EntityKind, EntityRecordMap } from '@rotp/game-data';
import type { DetectionContext, RecommendationDetector } from '../detection-types';
import type { DraftRecommendation } from '../types';
import { compareSet } from './compare-set';
import type { UnresolvableMapper } from './detector-from-strategy.type';
import type { Difference } from './difference.type';
import type { ComparisonStrategy } from './probe.type';
import { setPath } from './record-path';
import { runComparison } from './run-comparison';

const detectorIdOf = (kind: EntityKind): string => `strategy:${kind}`;

const reasonForField = (difference: Difference): string => {
  const { label, shown } = difference;
  if (difference.status === 'mismatch') return `${label}: record ${shown.dataset}, game ${shown.live}.`;
  if (difference.status === 'missing-in-dataset') return `${label}: game ${shown.live}, record empty.`;
  return `${label}: record ${shown.dataset}, absent in game.`;
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

const draftsForSet = <K extends EntityKind>(
  strategy: ComparisonStrategy<K>,
  context: DetectionContext,
  onUnresolvable: UnresolvableMapper<K> | undefined,
): DraftRecommendation[] => {
  const out: DraftRecommendation[] = [];
  const detector = detectorIdOf(strategy.kind);

  for (const probe of strategy.sets) {
    for (const difference of compareSet(probe, context.observations, context.screenId)) {
      const key = `${difference.noun}:${difference.key}`;
      if (difference.status === 'missing-in-dataset') {
        out.push({
          kind: strategy.kind, action: 'create', targetId: null, current: null, proposed: difference.proposed,
          reason: `${difference.noun} ${difference.key}: in game, not in dataset.`,
          detector,
          evidence: [{ source: probe.source, detail: `live ${difference.noun} key ${difference.key} has no dataset match` }],
          confidence: probe.confidence, screenId: context.screenId, origin: context.origin, key,
        });
      } else if (difference.status === 'unbacked-in-dataset') {
        out.push({
          kind: strategy.kind, action: 'delete', targetId: difference.record.id, current: difference.record,
          proposed: difference.record,
          reason: `${difference.noun} ${difference.key}: in dataset, absent in game.`,
          detector,
          evidence: [{ source: probe.source, detail: `dataset ${difference.noun} key ${difference.key} has no live match` }],
          confidence: probe.removalConfidence ?? probe.confidence,
          screenId: context.screenId, origin: context.origin, key,
        });
      } else if (onUnresolvable) {
        const mapped = onUnresolvable(difference, context);
        if (mapped) out.push(mapped);
      }
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
export type { UnresolvableMapper } from './detector-from-strategy.type';
