/* @layer renderer-lib @kind types */
import type { ItemId } from '@rotp/game-data';
import type { Placement } from '@rotp/randomizer';

interface GrantParams {
  placement: Placement;
  inventory: ReadonlySet<ItemId>;
  darkRoomsNeedLight: boolean;
  bigKeyDoors: boolean;
}

export type { GrantParams };
