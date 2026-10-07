/* @layer renderer-appshell @kind logic */
/** Pure helpers for the --dump-layers debug hook (DOM wait + grid analysis). */

interface DualLayerGrids {
  layer0: number[][];
  layer1: number[][];
}

const GRID_DIM = 64;

/** Resolve when `selector` appears in the DOM, or null after `timeoutMs`. */
const waitForElement = (selector: string, timeoutMs: number): Promise<Element | null> =>
  new Promise((resolve) => {
    const existing = document.querySelector(selector);
    if (existing) { resolve(existing); return; }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeoutMs);
  });

/** Every tile where the two collision layers disagree. */
const findSplitTiles = (grids: DualLayerGrids): Array<{ col: number; row: number; layer0: number; layer1: number }> => {
  const splits: Array<{ col: number; row: number; layer0: number; layer1: number }> = [];
  for (let r = 0; r < GRID_DIM; r++) {
    for (let c = 0; c < GRID_DIM; c++) {
      if (grids.layer0[r][c] !== grids.layer1[r][c]) {
        splits.push({ col: c, row: r, layer0: grids.layer0[r][c], layer1: grids.layer1[r][c] });
      }
    }
  }
  return splits;
};

/**
 * BFS from (row,col) through connected `0x00` tiles on layer1. Returns true when
 * the connected region does NOT touch the grid boundary (i.e. layer1 is an
 * enclosed, reachable interior instead of open to the edge).
 */
const isLayer1Reachable = (grids: DualLayerGrids, row: number, col: number): boolean => {
  const visited = new Set<string>([`${row},${col}`]);
  const queue = [{ row, col }];
  while (queue.length > 0) {
    const { row: qr, col: qc } = queue.shift()!;
    if (qr === 0 || qr === GRID_DIM - 1 || qc === 0 || qc === GRID_DIM - 1) return false; // touches boundary
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

export { waitForElement, findSplitTiles, isLayer1Reachable };
export type { DualLayerGrids };
