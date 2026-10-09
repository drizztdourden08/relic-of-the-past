/* @layer renderer-lib @kind logic */
import type { ItemId } from '@rotp/game-data';
import { bigKeyItemIds } from './big-key-item-ids';
import { LAMP } from './record-row-inputs.constants';
import { seesInTheDark } from './sees-in-the-dark';
import type { GrantParams } from './record-row-inputs.type';

const grantedInventory = (params: GrantParams): ReadonlySet<ItemId> => {
  const { placement, inventory, darkRoomsNeedLight, bigKeyDoors } = params;
  const seeing = seesInTheDark(placement, darkRoomsNeedLight, inventory);
  if (bigKeyDoors && !seeing) return inventory;
  const granted = new Set(inventory);
  if (!bigKeyDoors) for (const id of bigKeyItemIds()) granted.add(id);
  if (seeing) granted.add(LAMP);
  return granted;
};

export { grantedInventory };
