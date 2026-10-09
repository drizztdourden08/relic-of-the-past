/* @layer shared-game @kind logic */
import {
  DEFAULT_DUNGEON_ITEM_SETTING, DUNGEON_ITEM_FAMILIES, DUNGEON_ITEM_OPTION_KEYS, REFUSED_MODES,
} from './dungeon-item-modes';
import { KNOWN_DUNGEON_ITEM_MODES } from './dungeon-item-from-snapshot.constants';
import type { RandomizerOptionsSnapshot } from '../options.type';
import type {
  DungeonItemFamily, DungeonItemMode, DungeonItemSetting,
} from './dungeon-item.type';

const modeOfValue = (raw: unknown): DungeonItemMode => {
  if (typeof raw !== 'string' || !KNOWN_DUNGEON_ITEM_MODES.has(raw)) return 'original_dungeon';
  if (raw in REFUSED_MODES) return 'original_dungeon';
  return raw as DungeonItemMode;
};

const dungeonItemSettingFromSnapshot = (snapshot: RandomizerOptionsSnapshot): DungeonItemSetting => {
  const setting = { ...DEFAULT_DUNGEON_ITEM_SETTING } as Record<DungeonItemFamily, DungeonItemMode>;
  for (const family of DUNGEON_ITEM_FAMILIES) {
    setting[family] = modeOfValue(snapshot.values[DUNGEON_ITEM_OPTION_KEYS[family]]);
  }
  return setting;
};

export { dungeonItemSettingFromSnapshot };
