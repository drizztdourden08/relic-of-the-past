/* @layer shared-game @kind logic */
import { familyOfDungeonItem } from './family-of-dungeon-item';
import type { ItemKey } from '../../item-ids.data';
import type { DungeonItemMode, DungeonItemSetting } from '../dungeon-item.type';

const modeOfDungeonItem = (setting: DungeonItemSetting, item: ItemKey): DungeonItemMode => {
  const family = familyOfDungeonItem(item);
  return family === undefined ? 'original_dungeon' : setting[family];
};

export { modeOfDungeonItem };
