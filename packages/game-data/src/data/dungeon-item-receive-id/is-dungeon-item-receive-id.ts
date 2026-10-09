/* @layer shared-game @kind logic */
import {
  DUNGEON_ITEM_PALACE_COUNT, DUNGEON_ITEM_PALACE_MASK, DUNGEON_ITEM_VIRT_FIRST, DUNGEON_ITEM_VIRT_LAST,
} from './dungeon-item-receive-id.constants';

const isDungeonItemReceiveId = (id: number): boolean =>
  Number.isInteger(id) && id >= DUNGEON_ITEM_VIRT_FIRST && id <= DUNGEON_ITEM_VIRT_LAST
  && (id & DUNGEON_ITEM_PALACE_MASK) < DUNGEON_ITEM_PALACE_COUNT;

export { isDungeonItemReceiveId };
