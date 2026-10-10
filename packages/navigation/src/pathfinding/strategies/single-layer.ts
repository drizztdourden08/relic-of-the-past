/* @layer shared-game @kind logic */
import type { TilePassability, GridPos, ReachState } from '@rotp/game-core';
import type { LayerStrategy, BFSCell, BFSExpansionResult, QuadrantBounds } from './layer-strategy';
import { getHookshotTargetTiles } from '../tile-attrs';
import { GRID_SIZE } from '../types/grid.constants';
import { cellAt } from '../../checked-access';
import { bodyTiles } from './body-tiles';
import { bodyOutOfBounds } from './body-out-of-bounds';
import { collectHookTargets, filledGrid, joinReqs, reachStateOf, spreadBodyReach } from './tile-result';
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
    step: readonly [number, number],
    inventory: Set<string>,
    bounds: QuadrantBounds,
  ): BFSExpansionResult[] {
    const [dr, dc] = step;
    const { row, col, requirements } = cell;
    const nr = row + dr;
    const nc = col + dc;

    if (bodyOutOfBounds(nr, nc, bounds)) return [];
    if (!this.canLeaveBody(row, col, step)) return [];

    const moved = enterTiles(getNewTiles(nr, nc, dr, dc), this.grid, { dr, dc, requirements, inventory });
    return moved ? [{ row: nr, col: nc, layer: 0, requirements: moved }] : [];
  }

  private canLeaveBody(row: number, col: number, step: readonly [number, number]): boolean {
    return bodyTiles(row, col).every(([r, c]) => {
      const t = cellAt(this.grid, r, c);
      return t.type !== 'ledge' || canLeaveLedge(t.dir, step[0], step[1]);
    });
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
    const reached = filledGrid<Set<string> | null>(null);
    spreadBodyReach(reached, bodyReached[0], bounds);

    let reachableCount = 0;
    const reachable: ReachState[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
      Array.from({ length: GRID_SIZE }, (_, c) => {
        if (cellAt(reached, r, c) === null) return 0;
        const state = reachStateOf(cellAt(this.grid, r, c));
        if (state === 1) reachableCount++;
        return state;
      }),
    );

    const reqGrid: string[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
      Array.from({ length: GRID_SIZE }, (_, c) => joinReqs(cellAt(reached, r, c))),
    );

    const hookTargets = collectHookTargets(reachable, getHookshotTargetTiles(this.indoors), [this.rawAttr]);

    return { reachable, reachableCount, reqGrid, hookTargets };
  }
}

export { SingleLayerStrategy };
