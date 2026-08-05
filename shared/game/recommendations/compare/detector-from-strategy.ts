/* @layer shared-game @kind logic */
/**
 * Turns one `ComparisonStrategy` into a `RecommendationDetector`, so the
 * registry (`registry.ts`) never has to know a detector was built from a
 * strategy instead of hand-written.
 *
 * One draft per DIFFERING FIELD PATH, not one lumped "update the record"
 * draft — a reviewer wants to accept "fix the room index" separately from
 * "fix the palace index" even when both come from the same stale record, and
 * a batch accept over `certain` findings would otherwise have to swallow a
 * `likely` one riding along in the same draft.
 */
import type { EntityKind, EntityRecordMap } from '../../data/types';
import type { DetectionContext, RecommendationDetector } from '../detection-types';
import type { DraftRecommendation } from '../types';
import { compareSet } from './compare-sets';
import type { ComparisonStrategy } from './probe.types';
import { runComparison } from './run-comparison';
import type { Difference, SetDifference } from './difference.types';
import { setPath } from './set-path';

/**
 * A strategy that wants an `unresolvable` set finding surfaced supplies this
 * instead of accepting the default (silently dropped). The return type is
 * deliberately the bare `DraftRecommendation` union, NOT `DraftRecommendation<K>`:
 * the connection strategy's own mapper (phase 4, part 2) proposes a `screen`
 * record for an uncatalogued crossing destination, a DIFFERENT kind than the
 * strategy (`connection`) that found it — the one thing an `onUnresolvable`
 * mapper is for is crossing that exact boundary.
 */
type UnresolvableMapper<K extends EntityKind> =
  (difference: Extract<SetDifference<K>, { status: 'unresolvable' }>, context: DetectionContext) => DraftRecommendation | null;

const reasonForField = (difference: Difference): string => {
  const { label, shown } = difference;
  if (difference.status === 'mismatch') {
    return `The record holds ${shown.dataset} for ${label}, but the game reports ${shown.live}.`;
  }
  if (difference.status === 'missing-in-dataset') {
    return `The game reports ${shown.live} for ${label}, but the record does not hold a value.`;
  }
  return `The record holds ${shown.dataset} for ${label}, but the game does not confirm it.`;
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
  detector: `strategy:${strategy.kind}`,
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

  for (const probe of strategy.sets) {
    for (const difference of compareSet(probe, context.observations, context.screenId)) {
      const key = `${difference.noun}:${difference.key}`;
      if (difference.status === 'missing-in-dataset') {
        out.push({
          kind: strategy.kind, action: 'create', targetId: null, current: null, proposed: difference.proposed,
          reason: `The game exposes a ${difference.noun} (${difference.key}) the dataset does not have.`,
          detector: `strategy:${strategy.kind}`,
          evidence: [{ source: probe.source, detail: `live ${difference.noun} key ${difference.key} has no dataset match` }],
          confidence: probe.confidence, screenId: context.screenId, origin: context.origin, key,
        });
      } else if (difference.status === 'unbacked-in-dataset') {
        out.push({
          kind: strategy.kind, action: 'delete', targetId: difference.record.id, current: difference.record,
          // Nothing replaces a deletion — see `connection-remove.ts` for the
          // same convention: the action IS the change, not any field.
          proposed: difference.record,
          reason: `The dataset has a ${difference.noun} (${difference.key}) the game does not confirm.`,
          detector: `strategy:${strategy.kind}`,
          evidence: [{ source: probe.source, detail: `dataset ${difference.noun} key ${difference.key} has no live match` }],
          confidence: probe.confidence, screenId: context.screenId, origin: context.origin, key,
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
  id: `strategy:${strategy.kind}`,
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
export type { UnresolvableMapper };
