import type { TileAttrContext } from './tile-attrs';

// ─── Grid Constants ──────────────────────────────────────────────────────────

export const GRID_SIZE = 64;
export const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

// ─── Tile Types ──────────────────────────────────────────────────────────────

/**
 * BFS reachability state for a tile:
 * - 0: unreachable
 * - 1: reachable (player has full control)
 * - >=2: traversal (uncontrolled pass-through) with encoded direction:
 *   2=s, 3=n, 4=e, 5=w, 6=se, 7=sw, 8=ne, 9=nw
 */
export type ReachState = number;

/** Direction encoding for traversal states (state = 2 + index). */
export const TRAVERSAL_DIRS: readonly LedgeDir[] = ['s', 'n', 'e', 'w', 'se', 'sw', 'ne', 'nw'] as const;
export const TRAVERSAL_DIR_OFFSET: Record<LedgeDir, number> = { s: 2, n: 3, e: 4, w: 5, se: 6, sw: 7, ne: 8, nw: 9 };

export type LedgeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export type TilePassability =
  | { type: 'free' }
  | { type: 'obstacle'; req: string }
  | { type: 'blocked' }
  | { type: 'ledge'; dir: LedgeDir }
  | { type: 'stairs' }
  | { type: 'pit' }
  | { type: 'water' };

/** Traversal state for bidirectional stairs (no fixed direction). */
export const STAIRS_TRAVERSAL_STATE = 10;

// ─── Position ────────────────────────────────────────────────────────────────

export interface GridPos {
  row: number;
  col: number;
}

export interface WorldPos {
  screen: number;
  row: number;
  col: number;
}

// ─── Screen Data ─────────────────────────────────────────────────────────────

export interface CollisionGrid {
  tiles: TilePassability[][];
  rawAttr: number[][];
}

export interface Map32Tables {
  t0: Buffer; t1: Buffer; t2: Buffer; t3: Buffer;
}

// ─── Entrances ───────────────────────────────────────────────────────────────

export interface OverworldEntrance {
  area: number;
  pos: number;
  id: number;
  gridRow: number;
  gridCol: number;
  roomId: number;
}

// ─── Flood Fill ──────────────────────────────────────────────────────────────

export interface TransitionPoint {
  row: number;
  col: number;
  edge: 'north' | 'south' | 'east' | 'west' | 'entrance';
  requirements: string[];
  entranceIdx?: number;
}

export interface LedgeTraversal {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface BorderSummary {
  freeTiles: number[];
  itemTiles: { pos: number; requirements: string[] }[];
}

export interface FloodFillResult {
  screenIndex: number;
  tileContext: TileAttrContext;
  /** Grid position where the BFS started (top-left of Link's 2×2 at flood-fill time) */
  startPos: GridPos;
  reachable: ReachState[][];
  transitions: TransitionPoint[];
  reachableCount: number;
  totalTiles: number;
  entrances: OverworldEntrance[];
  ledges: LedgeTraversal[];
  attrGrid?: number[][];
  reqGrid?: string[][];
  /** Dynamic blocker tiles applied to this BFS snapshot (runtime sprite blockers). */
  dynamicBlockerCells?: GridPos[];
  /** Grid positions of hookshot targets reachable from walked tiles */
  hookTargets?: GridPos[];
  /** Variant state at time of analysis (null = base ROM, no runtime state) */
  variant?: ScreenVariant;
  /** Per-tile layer reached: 0=layer0 only, 1=layer1 only, 2=both. Only for dual-layer indoor rooms. */
  tileLayer?: (0 | 1 | 2)[][];
  /** Tiles where both raw layer grids are passable (for blue border rendering). */
  bothLayersPassable?: boolean[][];
  /** Layer 1 reachability (simple BFS on ground layer). For split-circle rendering. */
  layer1Reachable?: boolean[][];
  /** Raw per-layer attr grids for dual-layer rooms (for tooltip display). */
  dualLayerGrids?: { layer0: number[][]; layer1: number[][] };
  borders: {
    north: BorderSummary;
    south: BorderSummary;
    east: BorderSummary;
    west: BorderSummary;
  };
}

/**
 * Overworld screen variant state.
 * Determined by progress tier + per-screen event flags.
 * Affects tile layout via overlay patches applied to the base tilemap.
 */
export interface ScreenVariant {
  /** sram_progress_indicator: 0=intro, 1=post-uncle, 2=zelda-rescued, 3=agahnim-defeated */
  progressTier: number;
  /** save_ow_event_info[screen] & 0x20 — event overlay applied */
  eventOverlay: boolean;
  /** Full event flags byte for the screen */
  eventFlags: number;
}

export interface ConnectionInfo {
  edge: 'north' | 'south' | 'east' | 'west';
  targetScreen: number;
  /** Screen index this connection originates from (set during aggregation) */
  sourceScreen?: number;
  /** True if this connection is between quadrants of the same room (intra-room scroll boundary). */
  isIntraRoom?: boolean;
  freeTileCount: number;
  itemTileCount: number;
  positions: number[];
  requirements: string[];
}

// ─── Multi-Screen ────────────────────────────────────────────────────────────

export interface ScreenCoverage {
  screenIndex: number;
  entries: GridPos[];
  reachableCount: number;
  reachable: ReachState[][];
  borderFree: { north: Set<number>; south: Set<number>; east: Set<number>; west: Set<number> };
}

export interface WorldFloodResult {
  screens: Map<number, ScreenCoverage>;
  totalReachable: number;
  totalPossible: number;
  elapsedMs: number;
  bfsRuns: number;
}

// ─── Screen Hop ──────────────────────────────────────────────────────────────

export interface ScreenPath {
  screens: number[];
  crossings: { fromScreen: number; toScreen: number; edge: 'north' | 'south' | 'east' | 'west'; borderPos: number }[];
  totalCost: number;
}

// ─── Point Navigation ────────────────────────────────────────────────────────

export interface TilePath {
  tiles: GridPos[];
  cost: number;
  requirements: string[];
}

// ─── Route Planning ──────────────────────────────────────────────────────────

export interface RouteStep {
  screen: number;
  path: GridPos[];
  entryEdge?: 'north' | 'south' | 'east' | 'west';
  exitEdge?: 'north' | 'south' | 'east' | 'west';
}

export interface Route {
  steps: RouteStep[];
  totalCost: number;
  screens: number[];
  requirements: string[];
}

// ─── Hub Navigation ──────────────────────────────────────────────────────────

export interface NavigationStep {
  regionId: string;
  regionName: string;
}

export interface NavigationResult {
  found: boolean;
  path: NavigationStep[];
  distance: number;
  visited: number;
  totalNodes: number;
  totalEdges: number;
}

export interface PathfindingOptions {
  allowGlitches?: boolean;
}

