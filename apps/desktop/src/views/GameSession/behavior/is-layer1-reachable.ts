/* @layer renderer-appshell @kind logic */
import type { DualLayerGrids } from './dump-layers.type';
import { GRID_DIM, NEIGHBOUR_STEPS } from './dump-layers.constants';

const touchesBoundary = (row: number, col: number): boolean =>
  row === 0 || row === GRID_DIM - 1 || col === 0 || col === GRID_DIM - 1;

const inGrid = (row: number, col: number): boolean => row >= 0 && row < GRID_DIM && col >= 0 && col < GRID_DIM;

const isLayer1Reachable = (grids: DualLayerGrids, row: number, col: number): boolean => {
  const visited = new Set<string>([`${row},${col}`]);
  const queue = [{ row, col }];
  for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
    const { row: qr, col: qc } = next;
    if (touchesBoundary(qr, qc)) return false;
    for (const [dr, dc] of NEIGHBOUR_STEPS) {
      const nr = qr + dr, nc = qc + dc;
      const key = `${nr},${nc}`;
      if (!inGrid(nr, nc) || visited.has(key) || grids.layer1[nr]?.[nc] !== 0x00) continue;
      visited.add(key);
      queue.push({ row: nr, col: nc });
    }
  }
  return true;
};

export { isLayer1Reachable };
