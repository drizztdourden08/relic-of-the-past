/* @layer shared-game @kind logic */
import { DUNGEON_ITEM_KIND_SHIFT, DUNGEON_ITEM_VIRT_FIRST } from './dungeon-item-receive-id.constants';
import { isDungeonItemReceiveId } from './is-dungeon-item-receive-id';

const dungeonItemKindOfReceiveId = (id: number): number | undefined =>
  (isDungeonItemReceiveId(id) ? (id >> DUNGEON_ITEM_KIND_SHIFT) - (DUNGEON_ITEM_VIRT_FIRST >> DUNGEON_ITEM_KIND_SHIFT) : undefined);

export { dungeonItemKindOfReceiveId };
