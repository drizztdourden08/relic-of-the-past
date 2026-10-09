/* @layer bridge-wasm @kind logic */
import { getScreenGrids } from '../../flood';
import type { RoomFloodRun } from '../flood-room';
import { GRID, OBSTACLE_ATTR, OBSTACLE_ATTR_MIN } from './probe-room.constants';

const cellGlyph = (attr: number, hot: boolean): string => {
  const obstacle = attr >= OBSTACLE_ATTR_MIN || attr === OBSTACLE_ATTR;
  if (obstacle) return hot ? '*' : 'o';
  if (attr === 0x00) return hot ? '#' : ' ';
  return hot ? '+' : '.';
};

const roomMap = (roomId: number, run: RoomFloodRun | null): string[] => {
  const b = getScreenGrids({ isIndoors: true, roomId, owScreenIndex: 0 });
  const grids = [b.rawAttrGrid];
  const rows: string[] = [];
  for (let row = 0; row < GRID; row++) {
    let line = '';
    for (let col = 0; col < GRID; col++) {
      const a = Math.min(...grids.map((g) => g[row]?.[col] ?? 0xff));
      const hot = (run?.result.reachable[row]?.[col] ?? 0) > 0;
      line += cellGlyph(a, hot);
    }
    rows.push(`${String(row).padStart(2)}|${line}`);
  }
  return rows;
};

export { roomMap };
