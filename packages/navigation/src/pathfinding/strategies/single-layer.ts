/* @layer shared-game @kind logic */
import type { TilePassability, GridPos, ReachState } from '@rotp/game-core';
import type { LayerStrategy, BFSCell, BFSExpansionResult, QuadrantBounds } from './layer-strategy';
import { getHookshotTargetTiles } from '../tile-attrs';
import { GRID_SIZE, TRAVERSAL_DIR_OFFSET, STAIRS_TRAVERSAL_STATE } from '../types/grid.constants';
import { bodyTiles } from './body-tiles';
import { getNewTiles } from './new-tiles';
import { canLeaveLedge } from './can-leave-ledge';
import { enterTiles } from './enter-tiles';

class SingleLayerStrategy implements LayerStrategy {
  readonly layerCount = 1 as const;
  private readonly grid: TilePassability[][];
  private readonly rawAttr: number[][];
  private readonly indoors: boolean;

  constructor(grid: TilePassability[][], rawAttr: number[][], indoors: boolean) {
    this.grid = grid;
    this.rawAttr = rawAttr;
    this.indoors = indoors;
  }

  getGrid(_layer: 0 | 1): TilePassability[][] { return this.grid; }
  getRawAttr(_layer: 0 | 1): number[][] { return this.rawAttr; }
  findStartLayer(): 0 | 1 { return 0; }

  expand(
    cell: BFSCell,
    dr: number,
    dc: number,
    inventory: Set<string>,
    bounds: QuadrantBounds,
  ): BFSExpansionResult[] {
    const { row, col, requirements } = cell;
    const nr = row + dr;
    const nc = col + dc;

    if (nr < bounds.minRow || nr + 1 > bounds.maxRow || nc < bounds.minCol || nc + 1 > bounds.maxCol) return [];

    for (const [r, c] of bodyTiles(row, col)) {
      const t = this.grid[r][c];
      if (t.type === 'ledge' && !canLeaveLedge(t.dir, dr, dc)) return [];
    }

    const moved = enterTiles(getNewTiles(nr, nc, dr, dc), this.grid, dr, dc, requirements, inventory);
    return moved ? [{ row: nr, col: nc, layer: 0, requirements: moved }] : [];
  }

  buildTileResult(
    bodyReached: [(Set<string> | null)[][], (Set<string> | null)[][]],
    bounds: QuadrantBounds,
  ): {
    reachable: ReachState[][];
    reachableCount: number;
    reqGrid: string[][];
    hookTargets: GridPos[];
  } {
    const { minRow, maxRow, minCol, maxCol } = bounds;

    const reached: (Set<string> | null)[][] = Array.from(
      { length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(null),
    );

    for (let r = minRow; r < GRID_SIZE - 1 && r <= maxRow; r++) {
      for (let c = minCol; c < GRID_SIZE - 1 && c <= maxCol; c++) {
        const reqs = bodyReached[0][r][c];
        if (reqs === null) continue;
        for (const [tr, tc] of bodyTiles(r, c)) {
          const existing = reached[tr][tc];
          if (existing === null || existing.size > reqs.size) {
            reached[tr][tc] = reqs;
          }
        }
      }
    }

    let reachableCount = 0;
    const reachable: ReachState[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
      Array.from({ length: GRID_SIZE }, (_, c) => {
        if (reached[r][c] === null) return 0;
        const tile = this.grid[r][c];
        if (tile.type === 'blocked') return 0;
        if (tile.type === 'ledge') return TRAVERSAL_DIR_OFFSET[tile.dir];
        if (tile.type === 'stairs') return STAIRS_TRAVERSAL_STATE;
        reachableCount++;
        return 1;
      }),
    );

    const reqGrid: string[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
      Array.from({ length: GRID_SIZE }, (_, c) => {
        const reqs = reached[r][c];
        return reqs && reqs.size > 0 ? [...reqs].join(',') : '';
      }),
    );

    const hookSet = getHookshotTargetTiles(this.indoors);
    const hookTargets: GridPos[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (reachable[r][c] && hookSet.has(this.rawAttr[r][c])) {
          hookTargets.push({ row: r, col: c });
        }
      }
    }

    return { reachable, reachableCount, reqGrid, hookTargets };
  }
}

export { SingleLayerStrategy };
