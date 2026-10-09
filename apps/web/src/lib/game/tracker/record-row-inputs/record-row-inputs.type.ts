/* @layer renderer-lib @kind types */
import type { ItemId } from '@shared/game/data';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';

interface GrantParams {
  placement: Placement;
  inventory: ReadonlySet<ItemId>;
  darkRoomsNeedLight: boolean;
  bigKeyDoors: boolean;
}

export type { GrantParams };
