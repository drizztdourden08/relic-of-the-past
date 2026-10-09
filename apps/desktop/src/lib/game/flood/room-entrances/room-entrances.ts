/* @layer bridge-wasm @kind logic */
import type { OverworldEntrance } from '@shared/game/navigation';
import { readMapState } from '@rotp/game-core';
import { spawnEntrances } from './spawn-entrances';
import { tableEntrances } from './table-entrances';

const roomEntrances = (roomId: number): OverworldEntrance[] => {
  const live = readMapState();
  const isLive = live?.isIndoors === true && live.roomIndex === roomId;
  const fromSpawns = spawnEntrances(roomId, isLive);
  if (!fromSpawns) return [];
  return [...fromSpawns, ...tableEntrances(roomId, isLive)];
};

export { roomEntrances };
