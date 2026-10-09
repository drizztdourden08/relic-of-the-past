/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@shared/game/navigation';
import { GRID, MAX_WALL_DEPTH, NEIGHBOURS, SOLID_ATTR, WALL_ATTRS } from './bombed-walls.constants';
import { cellKey } from './cell-key';
import { isBombableAttr } from './is-bombable-attr';

const isPierceable = (attr: number): boolean => WALL_ATTRS.has(attr) || isBombableAttr(attr);

const markerPatch = (grid: number[][], tile: GridPos): GridPos[] => {
  const seen = new Set<string>([cellKey(tile.row, tile.col)]);
  const patch: GridPos[] = [];
  const queue: GridPos[] = [tile];
  while (queue.length > 0) {
    const cur = queue.shift() as GridPos;
    if (!isBombableAttr(grid[cur.row]?.[cur.col] ?? 0)) continue;
    patch.push(cur);
    for (const [dr, dc] of NEIGHBOURS) {
      const row = cur.row + dr;
      const col = cur.col + dc;
      const key = cellKey(row, col);
      if (row < 0 || row >= GRID || col < 0 || col >= GRID || seen.has(key)) continue;
      seen.add(key);
      queue.push({ row, col });
    }
  }
  return patch;
};

const pierce = (grid: number[][], lanes: number[], start: number, step: number, vertical: boolean): GridPos[] => {
  const cells: GridPos[] = [];
  for (let d = 1; d <= MAX_WALL_DEPTH; d++) {
    const at = start + step * d;
    if (at < 0 || at >= GRID) return [];
    const attrs = lanes.map((lane) => (vertical ? grid[at]?.[lane] : grid[lane]?.[at]) ?? SOLID_ATTR);
    const farSideReached = attrs.every((a) => !isPierceable(a));
    if (farSideReached) return cells;
    for (const lane of lanes) cells.push(vertical ? { row: at, col: lane } : { row: lane, col: at });
  }
  return [];
};

const carve = (grid: number[][], tile: GridPos): GridPos[] => {
  const patch = markerPatch(grid, tile);
  if (patch.length === 0) return [];
  const rows = patch.map((c) => c.row);
  const cols = patch.map((c) => c.col);
  const colLanes = [...new Set(cols)].sort((a, b) => a - b);
  const rowLanes = [...new Set(rows)].sort((a, b) => a - b);
  return [
    ...patch,
    ...pierce(grid, colLanes, Math.min(...rows), -1, true),
    ...pierce(grid, colLanes, Math.max(...rows), +1, true),
    ...pierce(grid, rowLanes, Math.min(...cols), -1, false),
    ...pierce(grid, rowLanes, Math.max(...cols), +1, false),
  ];
};

export { carve };
