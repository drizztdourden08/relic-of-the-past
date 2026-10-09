/* @layer shared-game @kind types */

type DungeonItemMode =
  | 'original_dungeon'
  | 'own_dungeons'
  | 'own_world'
  | 'any_world'
  | 'different_world'
  | 'start_with'
  | 'universal';

type DungeonItemFamily = 'bigKey' | 'smallKey' | 'compass' | 'map';

type DungeonItemSetting = Readonly<Record<DungeonItemFamily, DungeonItemMode>>;

export type { DungeonItemFamily, DungeonItemMode, DungeonItemSetting };
