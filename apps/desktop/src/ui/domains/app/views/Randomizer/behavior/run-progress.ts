/* @layer renderer-components @kind logic */
import type { TrackerStats } from '@domains/app/compounds/ChecksTracker';
import type { NetworkProgress } from '@app/lib/game/randomizer-client';
import type { CheckCounts } from './run-progress.type';

const checkCountsOf = (tracker: TrackerStats | null, room: NetworkProgress | null): CheckCounts | null => {
  if (tracker !== null) {
    return { taken: tracker.completed, available: tracker.reachable, left: tracker.blocked, total: tracker.total };
  }
  if (room !== null && room.total > 0) return { taken: room.checked, available: null, left: null, total: room.total };
  return null;
};

export { checkCountsOf };
