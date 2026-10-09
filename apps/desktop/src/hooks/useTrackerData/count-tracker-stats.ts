/* @layer renderer-lib @kind logic */
import type { CheckId, CheckRecord } from '@rotp/game-data';
import type { CheckStatus } from '@rotp/game-data';
import { isListedRow } from '@rotp/game-data';
import type { FilterState, RunContext } from '@rotp/game-data';
import type { TrackerStats } from './use-tracker-data.type';

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
