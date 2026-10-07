/* @layer renderer-components @kind logic */
/**
 * How far the run has come, in checks. The tracker counts them whenever a seed is loaded, the
 * same count the Spoiler tab heads its list with: taken, available now, left out of reach, out
 * of the seed's locations. An Archipelago room that has not handed its locations over yet has
 * no seed here, so its own count stands in, and it only knows taken out of total.
 */
import type { TrackerStats } from '@domains/app/compounds/ChecksTracker';
import type { NetworkProgress } from '@app/lib/game/randomizer-client';

interface CheckCounts {
  taken: number;
  /** Reachable now; null when only the room's count is known. */
  available: number | null;
  /** Still out of reach; null when only the room's count is known. */
  left: number | null;
  total: number;
}

const checkCountsOf = (tracker: TrackerStats | null, room: NetworkProgress | null): CheckCounts | null => {
  if (tracker !== null) {
    return { taken: tracker.completed, available: tracker.reachable, left: tracker.blocked, total: tracker.total };
  }
  if (room !== null && room.total > 0) return { taken: room.checked, available: null, left: null, total: room.total };
  return null;
};

const percentOf = (counts: CheckCounts): number =>
  (counts.total > 0 ? Math.round((counts.taken / counts.total) * 100) : 0);

export { checkCountsOf, percentOf };
export type { CheckCounts };
