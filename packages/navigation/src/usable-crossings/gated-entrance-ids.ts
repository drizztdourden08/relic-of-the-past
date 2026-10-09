/* @layer bridge-wasm @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import type { TileReq } from '@rotp/game-data';
import { usableEntranceTransition } from '../pathfinding';

const gatedEntranceIds = (result: FloodFillResult, items: readonly TileReq[]): Set<number> => {
  const touched = new Set<number>();
  const open = new Set<number>();
  for (const t of result.transitions) {
    if (t.edge !== 'entrance' || t.entranceIdx == null) continue;
    touched.add(t.entranceIdx);
    if (usableEntranceTransition(result, t, items)) open.add(t.entranceIdx);
  }
  for (const id of open) touched.delete(id);
  return touched;
};

export { gatedEntranceIds };
