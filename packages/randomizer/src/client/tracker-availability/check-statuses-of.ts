/* @layer bridge-wasm @kind logic */
import { screensOfRegions } from '@rotp/game-data';
import { locationKeyOfCheck } from '../../world/location-record';
import { VIRTUAL_PREFIX, virtualLocationOf } from '../virtual-locations';
import type { TrackerReading as BrockReading } from '@drizztdourden08/brock-randomizer/tracker';
import type { CheckRecord, CheckStatus, RegionId } from '@rotp/game-data';
import type { StatusInputs, TrackerReading } from './tracker-availability.type';

const statusOf = (check: CheckRecord, seen: StatusInputs, reading: BrockReading): CheckStatus => {
  const isVirtual = check.id.startsWith(VIRTUAL_PREFIX);
  if (!isVirtual && seen.completedChecks.has(check.id)) return 'completed';
  const location = isVirtual ? virtualLocationOf(check.id) : locationKeyOfCheck(check.id);
  if (seen.completedLocations.has(location)) return 'completed';
  return reading.statuses.get(location) === 'available' ? 'reachable' : 'blocked';
};

const checkStatusesOf = (reading: BrockReading, seen: StatusInputs): TrackerReading => ({
  statuses: new Map(seen.checks.map((check) => [check.id, statusOf(check, seen, reading)])),
  reachableScreens: screensOfRegions(reading.reachableRegions as ReadonlySet<RegionId>),
});

export { checkStatusesOf };
