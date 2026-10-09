/* @layer renderer-lib @kind types */
import type { CheckId, CheckRecord, ItemId } from '@shared/game/data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';

interface TrackerStatusParams {
  placement: Placement;
  checks: readonly CheckRecord[];
  inventory: ReadonlySet<ItemId>;
  completed: ReadonlySet<CheckId>;
  fired?: ReadonlySet<LocationKey>;
  darkRoomsNeedLight?: boolean;
  bigKeyDoors?: boolean;
  smallKeyDoors?: boolean;
}

export type { TrackerStatusParams };
