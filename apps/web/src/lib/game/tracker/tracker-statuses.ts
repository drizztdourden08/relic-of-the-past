/* @layer renderer-lib @kind logic */
/**
 * Every check's status, from one engine, for the plain game and for a seed alike.
 *
 * Two readings meet here, and which one answers a row depends on the ROW, never on the mode:
 *
 *  - a row the world holds a location for is answered by the generator, over the placement handed
 *    in. Normal's placement is the one where nothing moved (normal-placement.ts), so the engine
 *    cannot tell the two modes apart;
 *  - a row it holds no location for is answered from the dataset's own record, against the place the
 *    row happens at. That is every event, because an event is a thing that happened and no location
 *    of any world, and it is also the fairy rungs while no pond sells them. On a seed those rungs
 *    ARE locations, so the same sentence sends them to the engine instead. The mode never decides;
 *    the world does.
 *
 * The place comes from the engine too: its reachable regions, named as dataset screens
 * (logic/regions/reachable-screens.ts). So there is one graph, and the second one that used to
 * answer this half is gone.
 */
import { computeRecordStatuses } from '@shared/game/logic/record-statuses';
import { trackerReading } from '../randomizer-client/tracker-availability';
import { grantedInventory, recordRowOverrides } from './record-row-inputs';
import type { CheckId, CheckRecord, ItemId } from '@shared/game/data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { CheckStatus } from '@shared/game/logic';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';

const VIRTUAL_PREFIX = 'check-virtual-';

interface TrackerStatusParams {
  /** The seed's placement, or Normal's own (buildNormalPlacement). */
  placement: Placement;
  /** Every row the tracker shows, item rows and event rows together. */
  checks: readonly CheckRecord[];
  inventory: ReadonlySet<ItemId>;
  completed: ReadonlySet<CheckId>;
  /** Locations the session recorded as taken where no check record could see it. */
  fired?: ReadonlySet<LocationKey>;
  darkRoomsNeedLight?: boolean;
  bigKeyDoors?: boolean;
  /** The Small Keys switch: off reads every small key door as open (world/small-keys.ts). */
  smallKeyDoors?: boolean;
}

/** The rows this world holds no location for, so the engine has nothing to say about them. */
const rowsWithoutALocation = (
  checks: readonly CheckRecord[], placement: Placement,
): CheckRecord[] => checks.filter((check) => !check.id.startsWith(VIRTUAL_PREFIX)
  && placement.locations[check.id] === undefined);

const trackerStatuses = (params: TrackerStatusParams): Map<CheckId, CheckStatus> => {
  const {
    placement, checks, inventory, completed,
    fired = new Set<LocationKey>(), darkRoomsNeedLight = true, bigKeyDoors = true, smallKeyDoors = true,
  } = params;

  const { statuses, reachableScreens } = trackerReading(
    placement, completed, checks, fired, darkRoomsNeedLight, inventory, bigKeyDoors, smallKeyDoors,
  );
  const fromRecords = computeRecordStatuses({
    inventory: grantedInventory({ placement, inventory, darkRoomsNeedLight, bigKeyDoors }),
    completedChecks: completed,
    checks: rowsWithoutALocation(checks, placement),
    reachableScreens,
    checkOverrides: recordRowOverrides(placement),
  });
  for (const [id, status] of fromRecords) statuses.set(id, status);
  return statuses;
};

/** The screens the one engine says the player can stand on, for whoever records them. */
const trackerReachableScreens = (params: TrackerStatusParams): Set<string> => {
  const {
    placement, checks, inventory, completed,
    fired = new Set<LocationKey>(), darkRoomsNeedLight = true, bigKeyDoors = true, smallKeyDoors = true,
  } = params;
  return trackerReading(
    placement, completed, checks, fired, darkRoomsNeedLight, inventory, bigKeyDoors, smallKeyDoors,
  ).reachableScreens;
};

export { trackerReachableScreens, trackerStatuses };
export type { TrackerStatusParams };
