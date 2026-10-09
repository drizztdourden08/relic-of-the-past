/* @layer shared-game @kind logic */
import type { DungeonItemMode } from '../dungeon-item.type';

const staysInOwnDungeon = (mode: DungeonItemMode): boolean => mode === 'original_dungeon';

export { staysInOwnDungeon };
