/* @layer tests @kind helper */
import type { ItemRecord } from '@rotp/game-data';
import type { Sink } from './record-references.type';

const itemReferences = (item: ItemRecord, take: Sink): void => {
  take('dungeon', 'dungeonId', item.dungeonId);
  take('item', 'aliasOf', item.aliasOf);
  take('check', 'usualChestId', item.usualChestId);
  for (const id of item.sharesSlotWith ?? []) take('item', 'sharesSlotWith', id);
};

export { itemReferences };
