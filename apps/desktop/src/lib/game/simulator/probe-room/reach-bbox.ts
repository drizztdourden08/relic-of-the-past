/* @layer bridge-wasm @kind logic */
import type { RoomFloodRun } from '../flood-room';
import { GRID } from './probe-room.constants';
import type { ReachBox } from './probe-room.type';

const reachBbox = (run: RoomFloodRun): ReachBox => {
  let minRow = 99, maxRow = -1, minCol = 99, maxCol = -1;
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      if ((run.result.reachable[r]?.[c] ?? 0) <= 0) continue;
      if (r < minRow) minRow = r;
      if (r > maxRow) maxRow = r;
      if (c < minCol) minCol = c;
      if (c > maxCol) maxCol = c;
    }
  }
  return { minRow, maxRow, minCol, maxCol };
};

export { reachBbox };
