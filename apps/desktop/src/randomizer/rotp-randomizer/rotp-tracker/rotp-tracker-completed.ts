/* @layer renderer-app @kind logic */
import { find } from '@rotp/game-data';
import type { CheckRecord } from '@rotp/game-data';
import { getCompletedChecks, getEventStatus } from '@app/game/tracker';
import { firedLocations } from '@app/game/randomizer-client';
import { mergeStatusOnlyChecks } from '@app/hooks/useTrackerData/merge-status-only-checks';

let records: readonly CheckRecord[] | null = null;

const rotpCompleted = (): ReadonlySet<string> => {
  records ??= find('check', () => true);
  return new Set<string>([
    ...mergeStatusOnlyChecks(getCompletedChecks(), records, getEventStatus()),
    ...firedLocations(),
  ]);
};

export { rotpCompleted };
