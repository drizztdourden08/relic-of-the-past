/* @layer shared-game @kind constants */
import { ITEM } from '../world/item-ids.data';
import { REFERENCE_DARK_ROOM_SETTING } from '../world/dark-rooms/dark-room-lights.data';
import { VANILLA_MEDALLIONS } from '../world/item-groups';
import type { ItemId } from '../../game/data/types/ids';
import type { DungeonItemField } from './normal-placement.type';

const ORIGINAL_MEDALLIONS = VANILLA_MEDALLIONS;

const NORMAL_SEED = 'normal';

const NORMAL_DARK_ROOMS = REFERENCE_DARK_ROOM_SETTING;

const DUNGEON_FIELD_OF_GENERIC_ITEM: ReadonlyMap<ItemId, DungeonItemField> = new Map([
  [ITEM.smallKey, 'smallKey' as const],
  [ITEM.bigKey, 'bigKey' as const],
  [ITEM.map, 'map' as const],
  [ITEM.compass, 'compass' as const],
]);

export { DUNGEON_FIELD_OF_GENERIC_ITEM, NORMAL_DARK_ROOMS, NORMAL_SEED, ORIGINAL_MEDALLIONS };
