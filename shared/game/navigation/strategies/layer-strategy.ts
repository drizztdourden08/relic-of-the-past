/* @layer shared-game @kind logic */
import type { TilePassability, TransitionPoint, GridPos, ReachState, LedgeTraversal } from '../types';

// ─── BFS Engine Types ────────────────────────────────────────────────────────

interface BFSCell {
  row: number;
  col: number;
  layer: 0 | 1;
  requirements: Set<string>;
}

interface QuadrantBounds {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
}

interface BFSExpansionResult {
  row: number;
  col: number;
  layer: 0 | 1;
  requirements: Set<string>;
}

interface BFSResult {
  reachable: ReachState[][];
  transitions: TransitionPoint[];
  reachableCount: number;
  reqGrid: string[][];
  hookTargets: GridPos[];
  tileLayer?: (0 | 1 | 2)[][];
  reachableByLayer?: [ReachState[][], ReachState[][]];
  /** Real cross-layer ledge hops the BFS actually landed, keyed by their true
   *  destination. Only a dual-layer strategy produces these (see dual-layer.ts). */
  ledges?: LedgeTraversal[];
}

// ─── Layer Strategy Interface ────────────────────────────────────────────────

/**
 * Defines how the BFS engine handles layer transitions during expansion.
 * Each strategy determines what happens when the body tries to move in a direction.
 */
interface LayerStrategy {
  /** Number of layers tracked by this strategy. */
  readonly layerCount: 1 | 2;

  /** Get the tile grid for a given layer. */
  getGrid(layer: 0 | 1): TilePassability[][];

  /** Get the raw attribute grid for a given layer. */
  getRawAttr(layer: 0 | 1): number[][];

  /**
   * Attempt expansion from `cell` in direction (dr, dc).
   * Returns array of cells to enqueue (may be empty if blocked).
   * May return multiple cells (e.g. ledge landing + stair exit on different layers).
   */
  expand(
    cell: BFSCell,
    dr: number,
    dc: number,
    inventory: Set<string>,
    bounds: QuadrantBounds,
  ): BFSExpansionResult[];

  /**
   * Find a valid starting body position for the given layer.
   */
  findStartLayer(): 0 | 1;

  /**
   * Build the final per-tile reachability result from body-reached state.
   * Called after BFS completes.
   */
  buildTileResult(
    bodyReached: [(Set<string> | null)[][], (Set<string> | null)[][]],
    bounds: QuadrantBounds,
    tileContext: string,
  ): {
    reachable: ReachState[][];
    reachableCount: number;
    reqGrid: string[][];
    hookTargets: GridPos[];
    tileLayer?: (0 | 1 | 2)[][];
    reachableByLayer?: [ReachState[][], ReachState[][]];
    ledges?: LedgeTraversal[];
  };
}

export type { BFSCell, QuadrantBounds, BFSExpansionResult, BFSResult, LayerStrategy };
