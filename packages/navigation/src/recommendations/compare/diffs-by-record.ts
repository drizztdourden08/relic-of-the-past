/* @layer shared-game @kind logic */
import type { DetectionContext } from '../detection-types';
import type { Difference } from './difference.type';
import type { ErasedStrategy } from './probe.type';
import { allStrategies } from './strategy-registry';

const diffsByRecordFrom = (
  context: DetectionContext,
  strategies: readonly ErasedStrategy[] = allStrategies(),
): ReadonlyMap<string, ReadonlyMap<string, Difference>> => {
  const byRecord = new Map<string, Map<string, Difference>>();

  for (const strategy of strategies) {
    const comparisons = strategy.compare(context.observations, context.screenId);
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
