/* @layer shared-game @kind logic */
import { scopeLockedKeyCounts } from '../scope-locked-key-counts';
import { lockedDropCounts } from './locked-drop-counts';
import { removeCounted } from './remove-counted';
import type { ItemKey } from '../../item-ids.data';
import type { LocationKey } from '../../location-key';
import type { WorldDungeon } from '../../region.type';

const dungeonItemsOf = (
  dungeon: WorldDungeon, keyDropShuffle: boolean, lockedScopeLocations: ReadonlySet<LocationKey>,
): ItemKey[] => {
  const items: ItemKey[] = Array<ItemKey>(dungeon.smallKeyCount).fill(dungeon.smallKey);
  if (dungeon.bigKey !== null) items.push(dungeon.bigKey);
  if (dungeon.map !== null) items.push(dungeon.map);
  if (dungeon.compass !== null) items.push(dungeon.compass);
  if (!keyDropShuffle) removeCounted(items, lockedDropCounts(dungeon), 'drop table');
  removeCounted(items, scopeLockedKeyCounts([dungeon.smallKey], lockedScopeLocations), 'npc-scope table');
  return items;
};

export { dungeonItemsOf };
