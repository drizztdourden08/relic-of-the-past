/* @layer shared-game @kind logic */
import type { OverworldEntrance } from '@rotp/game-core';
import type { EntrancePosition } from '../core/bfs-engine.type';

const findEntrancePositions = (entrances: OverworldEntrance[], screenIndex: number): { screenEntrances: OverworldEntrance[]; entrancePositions: EntrancePosition[] } => {
  const screenEntrances = entrances.filter(e => e.area === screenIndex);
  const entrancePositions = screenEntrances.map(e => ({ row: e.gridRow, col: e.gridCol, idx: e.id }));
  return { screenEntrances, entrancePositions };
};

export { findEntrancePositions };
