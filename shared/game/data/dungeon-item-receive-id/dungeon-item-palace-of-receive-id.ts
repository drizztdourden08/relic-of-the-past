/* @layer shared-game @kind logic */
import { DUNGEON_ITEM_PALACE_MASK } from './dungeon-item-receive-id.constants';
import { isDungeonItemReceiveId } from './is-dungeon-item-receive-id';

const dungeonItemPalaceOfReceiveId = (id: number): number | undefined =>
  (isDungeonItemReceiveId(id) ? id & DUNGEON_ITEM_PALACE_MASK : undefined);

export { dungeonItemPalaceOfReceiveId };
