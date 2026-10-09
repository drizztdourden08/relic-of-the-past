/* @layer bridge-wasm @kind logic */
import { getScreenGrids } from '../../flood';
import type { RoomFloodRun } from '../flood-room';
import {
  ATTR_COL_FROM, ATTR_COL_TO, ATTR_ROW_FIRST, ATTR_ROW_LAST, REACH_COL_FROM, REACH_COL_TO,
} from './probe-room.constants';
import type { RoomProbe } from './probe-room.type';

const hexRow = (g?: number[][], row?: number): string =>
  g && row != null ? (g[row] ?? []).slice(ATTR_COL_FROM, ATTR_COL_TO).map((v) => v.toString(16).padStart(2, '0')).join(' ') : '';

const attrRows = (roomId: number, run: RoomFloodRun | null): RoomProbe['attrRows'] => {
  const b = getScreenGrids({ isIndoors: true, roomId, owScreenIndex: 0 });
  const out: RoomProbe['attrRows'] = [];
  for (let row = ATTR_ROW_FIRST; row <= ATTR_ROW_LAST; row++) {
    out.push({
      row,
      raw: hexRow(b.rawAttrGrid, row),
      l0: hexRow(b.dualLayerGrids?.layer0, row),
      l1: hexRow(b.dualLayerGrids?.layer1, row),
      reached: (run?.result.reachable[row] ?? []).slice(REACH_COL_FROM, REACH_COL_TO).map((v) => (v > 0 ? '#' : '.')).join(''),
    });
  }
  return out;
};

export { attrRows };
