/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { DoorRecord, SpawnCandidate } from './place-tile.type';

const squaredDistance = (a: GridPos, b: GridPos): number =>
  (a.row - b.row) ** 2 + (a.col - b.col) ** 2;

const matchDoorsToSpawns = <K>(
  spawns: readonly SpawnCandidate<K>[],
  doors: readonly DoorRecord[],
): Map<K, DoorRecord> => {
  const pairs: { key: K; door: DoorRecord; dist: number }[] = [];
  for (const spawn of spawns) {
    for (const door of doors) {
      pairs.push({ key: spawn.key, door, dist: squaredDistance(spawn.tile, { row: door.row, col: door.col }) });
    }
  }
  pairs.sort((a, b) => a.dist - b.dist);
  const claimed = new Map<K, DoorRecord>();
  const usedDoors = new Set<DoorRecord>();
  for (const pair of pairs) {
    if (claimed.has(pair.key) || usedDoors.has(pair.door)) continue;
    claimed.set(pair.key, pair.door);
    usedDoors.add(pair.door);
  }
  return claimed;
};

export { matchDoorsToSpawns };
