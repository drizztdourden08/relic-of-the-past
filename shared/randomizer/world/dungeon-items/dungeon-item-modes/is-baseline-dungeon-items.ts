/* @layer shared-game @kind logic */
import { DEFAULT_DUNGEON_ITEM_SETTING, DUNGEON_ITEM_FAMILIES } from './dungeon-item-modes.constants';
import type { DungeonItemSetting } from '../dungeon-item.type';

const isBaselineDungeonItems = (setting: DungeonItemSetting): boolean =>
  DUNGEON_ITEM_FAMILIES.every((family) => setting[family] === DEFAULT_DUNGEON_ITEM_SETTING[family]);

export { isBaselineDungeonItems };
