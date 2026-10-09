/* @layer shared-game @kind logic */
import { familyOfDungeonItem } from '../dungeon-items/dungeon-item-modes';
import type { ItemKey } from '../item-ids';

const isDungeonScopedItem = (item: ItemKey): boolean => familyOfDungeonItem(item) === 'smallKey';

export { isDungeonScopedItem };
