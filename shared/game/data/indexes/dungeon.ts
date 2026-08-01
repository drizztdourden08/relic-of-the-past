/* @layer shared-game @kind logic */
/** Reverse gameId -> DungeonRecord lookups, pre-built once per rebuild(). */
import type { DungeonGameId, DungeonRecord } from '../types';

const dungeonByPalaceIndex = new Map<number, DungeonRecord>();

const rebuildDungeonIndex = (records: readonly DungeonRecord[]): void => {
  dungeonByPalaceIndex.clear();
  for (const dungeon of records) {
    if (dungeon.gameId.palaceIndex !== undefined) dungeonByPalaceIndex.set(dungeon.gameId.palaceIndex, dungeon);
  }
};

const dungeonByGameId = (match: Partial<DungeonGameId>): DungeonRecord | undefined =>
  match.palaceIndex !== undefined ? dungeonByPalaceIndex.get(match.palaceIndex) : undefined;

export { rebuildDungeonIndex, dungeonByGameId };
