/* @layer renderer-lib @kind logic */
import type { CheckId, CheckRecord, CheckStatus } from '@rotp/game-data';
import type { TrackerReading } from '@drizztdourden08/brock-randomizer/tracker';
import { trackerLocationOf } from '@app/randomizer/rotp-randomizer/rotp-tracker/rotp-tracker-location-of';
import { CHECK_STATUS_OF } from './use-tracker-data.constants';

const snapshotOfReading = (records: readonly CheckRecord[], reading: TrackerReading | null): Map<CheckId, CheckStatus> => {
  const snapshot = new Map<CheckId, CheckStatus>();
  for (const record of records) {
    const status = reading?.statuses.get(trackerLocationOf(record.id));
    snapshot.set(record.id, status === undefined ? 'blocked' : CHECK_STATUS_OF[status]);
  }
  return snapshot;
};

export { snapshotOfReading };
