/* @layer shared-game @kind logic */
import { modeOfDungeonItem, staysInDungeons } from '../../dungeon-items/dungeon-item-modes';
import type { ItemKey } from '../../item-ids.data';
import type { DungeonItemSetting } from '../../dungeon-items/dungeon-item.type';

const partitionDungeonItems = (
  items: readonly ItemKey[], setting: DungeonItemSetting, escaped: ItemKey[],
): ItemKey[] => {
  const kept: ItemKey[] = [];
  for (const item of items) {
    if (staysInDungeons(modeOfDungeonItem(setting, item))) kept.push(item);
    else escaped.push(item);
  }
  return kept;
};

export { partitionDungeonItems };
