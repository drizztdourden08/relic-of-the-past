/* @layer shared-game @kind constants */
import type { DungeonItemMode } from './dungeon-item.type';

const KNOWN_DUNGEON_ITEM_MODES: ReadonlySet<string> = new Set<DungeonItemMode>([
  'original_dungeon', 'own_dungeons', 'own_world', 'any_world',
  'different_world', 'start_with', 'universal',
]);

export { KNOWN_DUNGEON_ITEM_MODES };
