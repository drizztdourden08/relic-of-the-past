/* @layer shared-game @kind logic */
import type { DungeonItemMode } from '../dungeon-item.type';

const staysInDungeons = (mode: DungeonItemMode): boolean =>
  mode === 'original_dungeon' || mode === 'own_dungeons';

export { staysInDungeons };
