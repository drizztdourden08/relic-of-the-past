/* @layer renderer-appshell @kind logic */
import type { DualLayerGrids } from './dump-layers.type';
import { GRID_DIM } from './dump-layers.constants';

const touchesBoundary = (row: number, col: number): boolean =>
  row === 0 || row === GRID_DIM - 1 || col === 0 || col === GRID_DIM - 1;

const isLayer1Reachable = (grids: DualLayerGrids, row: number, col: number): boolean => {
  const visited = new Set<string>([`${row},${col}`]);
  const queue = [{ row, col }];
  while (queue.length > 0) {
    const { row: qr, col: qc } = queue.shift()!;
    if (touchesBoundary(qr, qc)) return false;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = qr + dr, nc = qc + dc;
      if (nr < 0 || nr >= GRID_DIM || nc < 0 || nc >= GRID_DIM) continue;
      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;
      if (grids.layer1[nr]?.[nc] !== 0x00) continue;
      visited.add(key);
      queue.push({ row: nr, col: nc });
    }
  }
  return true;
};

export { isLayer1Reachable };
