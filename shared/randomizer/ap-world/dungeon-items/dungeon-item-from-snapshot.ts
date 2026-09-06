/* @layer shared-game @kind logic */
/**
 * Snapshot → dungeon-item setting. Every reading of the four option keys goes
 * through here, so the panel's In Pool column and the seed can never disagree
 * about what a snapshot means.
 *
 * A key that is missing (every profile frozen before the engine read these),
 * spelled as something this catalog never offered, or naming a mode this
 * engine refuses (dungeon-item-modes.ts REFUSED_MODES) reads as
 * original_dungeon — the baseline every stored placement was rolled under, so
 * a legacy snapshot keeps its exact meaning and a hand-edited one still
 * produces a playable seed instead of an unfillable one.
 */
import {
  DEFAULT_DUNGEON_ITEM_SETTING, DUNGEON_ITEM_FAMILIES, DUNGEON_ITEM_OPTION_KEYS, REFUSED_MODES,
} from './dungeon-item-modes';
import type { RandomizerOptionsSnapshot } from '../options.type';
import type {
  DungeonItemFamily, DungeonItemMode, DungeonItemSetting,
} from './dungeon-item.type';

const KNOWN_MODES: ReadonlySet<string> = new Set<DungeonItemMode>([
  'original_dungeon', 'own_dungeons', 'own_world', 'any_world',
  'different_world', 'start_with', 'universal',
]);

const modeOfValue = (raw: unknown): DungeonItemMode => {
  if (typeof raw !== 'string' || !KNOWN_MODES.has(raw)) return 'original_dungeon';
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
