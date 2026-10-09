/* @layer shared-game @kind logic */
import type { DungeonRecord } from '../../types';
import { dungeonIndexMaps } from './dungeon-index-maps';

const rebuildDungeonIndex = (records: readonly DungeonRecord[]): void => {
  dungeonIndexMaps.byPalaceIndex.clear();
  for (const dungeon of records) {
    if (dungeon.gameId.palaceIndex !== undefined) dungeonIndexMaps.byPalaceIndex.set(dungeon.gameId.palaceIndex, dungeon);
  }
};

export { rebuildDungeonIndex };
