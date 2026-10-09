/* @layer renderer-lib @kind logic */
import type { CheckId, CheckRecord } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic';
import { isListedRow } from '@shared/game/logic/queries/check-grouping';
import type { FilterState, RunContext } from '@shared/game/logic/queries/check-grouping';
import type { TrackerStats } from './useTrackerData.type';

const countTrackerStats = (
  checks: readonly CheckRecord[],
  filter: FilterState,
  run: RunContext,
  snapshot: ReadonlyMap<CheckId, CheckStatus>,
): TrackerStats => {
  let completed = 0, reachable = 0, blocked = 0, total = 0;
  for (const check of checks) {
    if (!isListedRow(check, filter, run)) continue;
    const status = snapshot.get(check.id);
    total++;
    if (status === 'completed') completed++;
    else if (status === 'reachable') reachable++;
    else blocked++;
  }
  return { completed, reachable, blocked, total };
};

export { countTrackerStats };
