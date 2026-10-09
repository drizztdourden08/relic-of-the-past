/* @layer shared-game @kind logic */
import type { EntityKind } from '../../data/types';
import type { DetectionContext } from '../detection-types';
import type { Difference } from './difference.type';
import type { ComparisonStrategy } from './probe.type';
import { runComparison } from './run-comparison';
import { allStrategies } from './strategy-registry';

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
