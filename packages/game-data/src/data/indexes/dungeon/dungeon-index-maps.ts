/* @layer shared-game @kind logic */
import type { DungeonRecord } from '../../types';

const dungeonIndexMaps = {
  byPalaceIndex: new Map<number, DungeonRecord>(),
};

export { dungeonIndexMaps };
