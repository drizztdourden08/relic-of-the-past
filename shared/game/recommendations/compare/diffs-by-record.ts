/* @layer shared-game @kind logic */
/**
 * Every live FIELD difference across every registered comparison strategy,
 * keyed by record id then by field path — the shape a caller with a record
 * id can look its own differences up from directly, rather than re-deriving
 * them from a strategy's own subject list.
 *
 * Only `runComparison`'s field probes feed this map, never `compareSets`: a
 * set difference (`SetDifference`) describes a whole record that is missing
 * or unbacked, not a field on a record already on screen, so it has no path
 * to key this map by and no row to attach a bracket to — `detector-from-
 * strategy.ts` already turns those into their own create/delete
 * recommendations, which is where that kind of finding belongs.
 */
import type { EntityKind } from '../../data/types';
import { allStrategies } from './strategy-registry';
import { runComparison } from './run-comparison';
import type { ComparisonStrategy } from './probe.types';
import type { Difference } from './difference.types';
import type { DetectionContext } from '../detection-types';

const diffsByRecordFrom = (
  context: DetectionContext,
  strategies: readonly ComparisonStrategy<EntityKind>[] = allStrategies(),
): ReadonlyMap<string, ReadonlyMap<string, Difference>> => {
  const byRecord = new Map<string, Map<string, Difference>>();

  for (const strategy of strategies) {
    const comparisons = runComparison(strategy, context.observations, context.screenId);
    for (const { record, differences } of comparisons) {
      if (differences.length === 0) continue;
      const byPath = byRecord.get(record.id) ?? new Map<string, Difference>();
      for (const difference of differences) byPath.set(difference.path, difference);
      byRecord.set(record.id, byPath);
    }
  }

  return byRecord;
};

export { diffsByRecordFrom };
