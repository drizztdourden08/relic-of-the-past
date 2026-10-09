/* @layer renderer-lib @kind logic */
import { DARK_ROOM_LIGHT_FIELDS } from '@shared/randomizer/world/dark-rooms';
import type { ItemId } from '@rotp/game-data';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import { LIGHT_ITEM } from './record-row-inputs.constants';

const seesInTheDark = (
  placement: Placement, darkRoomsNeedLight: boolean, inventory: ReadonlySet<ItemId>,
): boolean => {
  const setting = placement.stats.darkRooms;
  const accepted = DARK_ROOM_LIGHT_FIELDS.filter((field) => setting.lights[field]);
  if (!setting.requireLight || !darkRoomsNeedLight || accepted.length === 0) return true;
  return accepted.some((field) => inventory.has(LIGHT_ITEM[field]));
};

export { seesInTheDark };
