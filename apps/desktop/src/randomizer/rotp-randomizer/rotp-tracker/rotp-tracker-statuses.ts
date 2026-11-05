/* @layer renderer-app @kind logic */
import { find } from '@rotp/game-data';
import type { CheckId, CheckRecord, ItemId } from '@rotp/game-data';
import { trackerCheckRecords, trackerStatuses } from '@rotp/navigation';
import { BIG_KEY_DOORS, DARK_ROOMS_NEED_LIGHT, SMALL_KEY_DOORS } from '@rotp/randomizer';
import type { LocationKey, Placement } from '@rotp/randomizer';
import type { LocationStatus, TrackerInput } from '@drizztdourden08/brock-randomizer/tracker';
import { trackerLocationOf } from './rotp-tracker-location-of';
import { STATUS_OF } from './rotp-tracker-statuses.constants';

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
  const statuses = trackerStatuses({
    placement: input.placement,
    checks: rosterOf(input.placement),
    inventory: new Set(input.held as readonly ItemId[]),
    completed: input.completed as ReadonlySet<CheckId>,
    fired: input.checked as ReadonlySet<LocationKey>,
    darkRoomsNeedLight: input.assumed.has(DARK_ROOMS_NEED_LIGHT),
    bigKeyDoors: input.assumed.has(BIG_KEY_DOORS),
    smallKeyDoors: input.assumed.has(SMALL_KEY_DOORS),
  });
  return new Map([...statuses].map(([id, status]) => [trackerLocationOf(id), STATUS_OF[status]]));
};

export { rotpStatuses };
