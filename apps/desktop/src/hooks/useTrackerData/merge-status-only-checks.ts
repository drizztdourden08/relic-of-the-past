/* @layer renderer-lib @kind logic */
import type { CheckId, CheckRecord } from '@rotp/game-data';

const mergeStatusOnlyChecks = (
  completedChecks: ReadonlySet<CheckId>,
  checkRecords: readonly CheckRecord[],
  eventStatus: ReadonlyMap<CheckId, boolean>,
): Set<CheckId> => {
  const merged = new Set(completedChecks);
  for (const check of checkRecords) if (check.statusOnly && eventStatus.get(check.id)) merged.add(check.id);
  return merged;
};

export { mergeStatusOnlyChecks };
