/* @layer shared-game @kind logic */
import { DUNGEON_ITEM_NATIVE_IDS } from './dungeon-item-receive-id.constants';
import { dungeonItemKindOfReceiveId } from './dungeon-item-kind-of-receive-id';

const dungeonItemNativeIdOfReceiveId = (id: number): number | undefined => {
  const kind = dungeonItemKindOfReceiveId(id);
  return kind === undefined ? undefined : DUNGEON_ITEM_NATIVE_IDS[kind];
};

export { dungeonItemNativeIdOfReceiveId };
