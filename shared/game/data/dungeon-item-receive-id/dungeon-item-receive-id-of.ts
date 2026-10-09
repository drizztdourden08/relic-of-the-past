/* @layer shared-game @kind logic */
import {
  DUNGEON_ITEM_KIND_SHIFT, DUNGEON_ITEM_NATIVE_IDS, DUNGEON_ITEM_PALACE_COUNT, DUNGEON_ITEM_VIRT_FIRST,
} from './dungeon-item-receive-id.constants';

const dungeonItemReceiveIdOf = (kind: number, palaceIndex: number): number | undefined => {
  if (kind < 0 || kind >= DUNGEON_ITEM_NATIVE_IDS.length) return undefined;
  if (palaceIndex < 0 || palaceIndex >= DUNGEON_ITEM_PALACE_COUNT) return undefined;
  return DUNGEON_ITEM_VIRT_FIRST | (kind << DUNGEON_ITEM_KIND_SHIFT) | palaceIndex;
};

export { dungeonItemReceiveIdOf };
