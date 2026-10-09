/* @layer renderer-lib @kind types */
import type { CheckId, CheckRecord, ItemId } from '@rotp/game-data';
import type { LocationKey, Placement } from '@rotp/randomizer';

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
