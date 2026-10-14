/* @layer bridge-wasm @kind types */
import type { CheckId, CheckRecord, CheckStatus, ItemId } from '@rotp/game-data';
import type { LocationKey } from '../../world/location-key';
import type { Placement } from '../../world/fill/placement.type';

interface TrackerReading {
  statuses: Map<CheckId, CheckStatus>;
  reachableScreens: Set<string>;
}

interface TrackerReadingRequest {
  placement: Placement;
  completedChecks: ReadonlySet<CheckId>;
  checks: readonly CheckRecord[];
  firedLocationKeys?: ReadonlySet<LocationKey>;
  darkRoomsNeedLight?: boolean;
  heldItemIds?: ReadonlySet<ItemId>;
  bigKeyDoors?: boolean;
  smallKeyDoors?: boolean;
}

interface StatusInputs {
  completedChecks: ReadonlySet<CheckId>;
  completedLocations: ReadonlySet<LocationKey>;
  available: ReadonlySet<LocationKey>;
}

type TrackerSnapshotArgs = [
  placement: Placement,
  completedChecks: ReadonlySet<CheckId>,
  checks: readonly CheckRecord[],
  firedLocationKeys?: ReadonlySet<LocationKey>,
  darkRoomsNeedLight?: boolean,
  heldItemIds?: ReadonlySet<ItemId>,
  bigKeyDoors?: boolean,
  smallKeyDoors?: boolean,
];

export type { StatusInputs, TrackerReading, TrackerReadingRequest, TrackerSnapshotArgs };
