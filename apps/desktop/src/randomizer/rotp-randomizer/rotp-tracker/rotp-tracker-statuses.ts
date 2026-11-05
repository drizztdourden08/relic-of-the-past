/* @layer renderer-app @kind logic */
import { find } from '@rotp/game-data';
import type { CheckId, CheckRecord, CheckStatus, ItemId } from '@rotp/game-data';
import { trackerCheckRecords, trackerStatuses } from '@rotp/navigation';
import type { LocationKey, Placement } from '@rotp/randomizer';
import type { LocationStatus, TrackerInput } from '@drizztdourden08/brock-randomizer/tracker';
import { doorsOf } from './rotp-tracker-assumed';
import { trackerLocationOf } from './rotp-tracker-location-of';

const STATUS_OF: Readonly<Record<CheckStatus, LocationStatus>> = {
  completed: 'checked', reachable: 'available', blocked: 'blocked',
};

let allRecords: readonly CheckRecord[] | null = null;
let rosterFor: Placement | null = null;
let roster: readonly CheckRecord[] = [];

const rosterOf = (placement: Placement): readonly CheckRecord[] => {
  allRecords ??= find('check', () => true);
  if (rosterFor !== placement) {
    roster = trackerCheckRecords(allRecords, placement);
    rosterFor = placement;
  }
  return roster;
};

const rotpStatuses = (input: TrackerInput<Placement>): ReadonlyMap<string, LocationStatus> => {
  const { bigKeyDoors, smallKeyDoors, darkRoomsNeedLight } = doorsOf(input.assumed);
  const statuses = trackerStatuses({
    placement: input.placement,
    checks: rosterOf(input.placement),
    inventory: new Set(input.held as readonly ItemId[]),
    completed: input.completed as ReadonlySet<CheckId>,
    fired: input.checked as ReadonlySet<LocationKey>,
    darkRoomsNeedLight,
    bigKeyDoors,
    smallKeyDoors,
  });
  return new Map([...statuses].map(([id, status]) => [trackerLocationOf(id), STATUS_OF[status]]));
};

export { rotpStatuses };
