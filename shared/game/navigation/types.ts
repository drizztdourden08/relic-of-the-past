/* @layer shared-game @kind data */
import type { TileReq } from './tile-attrs';

// ─── Grid Constants ──────────────────────────────────────────────────────────

const GRID_SIZE = 64;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

// ─── Tile Types ──────────────────────────────────────────────────────────────

/**
 * BFS reachability state for a tile:
 * - 0: unreachable
 * - 1: reachable (player has full control)
 * - >=2: traversal (uncontrolled pass-through) with encoded direction:
 *   2=s, 3=n, 4=e, 5=w, 6=se, 7=sw, 8=ne, 9=nw
 */
type ReachState = number;

/** Direction encoding for traversal states (state = 2 + index). */
const TRAVERSAL_DIRS: readonly LedgeDir[] = ['s', 'n', 'e', 'w', 'se', 'sw', 'ne', 'nw'] as const;
const TRAVERSAL_DIR_OFFSET: Record<LedgeDir, number> = { s: 2, n: 3, e: 4, w: 5, se: 6, sw: 7, ne: 8, nw: 9 };

type LedgeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

type TilePassability =
  | { type: 'free' }
  | { type: 'obstacle'; req: string }
  | { type: 'blocked' }
  | { type: 'ledge'; dir: LedgeDir }
  | { type: 'stairs' }
  | { type: 'pit' }
  | { type: 'water' };

/** Traversal state for bidirectional stairs (no fixed direction). */
const STAIRS_TRAVERSAL_STATE = 10;

// ─── Position ────────────────────────────────────────────────────────────────

interface GridPos {
  row: number;
  col: number;
}

interface WorldPos {
  screen: number;
  row: number;
  col: number;
}

// ─── Screen Data ─────────────────────────────────────────────────────────────

interface CollisionGrid {
  tiles: TilePassability[][];
  rawAttr: number[][];
}

interface Map32Tables {
  t0: Buffer; t1: Buffer; t2: Buffer; t3: Buffer;
}

// ─── Entrances ───────────────────────────────────────────────────────────────

interface OverworldEntrance {
  area: number;
  pos: number;
  id: number;
  gridRow: number;
  gridCol: number;
  roomId: number;
}

// ─── Flood Fill ──────────────────────────────────────────────────────────────

interface TransitionPoint {
  row: number;
  col: number;
  edge: 'north' | 'south' | 'east' | 'west' | 'entrance';
  requirements: string[];
  entranceIdx?: number;
}

interface LedgeTraversal {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

interface BorderSummary {
  freeTiles: number[];
  itemTiles: { pos: number; requirements: string[] }[];
}

interface FloodFillResult {
  screenIndex: number;
  indoors: boolean;
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
  /**
   * The traversal tokens this flood ran with. Consumers that judge a tile or an
   * entrance ("can Link use it?") need the same inventory the BFS used; without
   * it on the result they either re-derived it or skipped the check entirely.
   */
  items?: readonly TileReq[];
  /** Dynamic blocker tiles applied to this BFS snapshot (runtime sprite blockers). */
  dynamicBlockerCells?: GridPos[];
  /** Grid positions of hookshot targets reachable from walked tiles */
  hookTargets?: GridPos[];
  /** Variant state at time of analysis (null = base ROM, no runtime state) */
  variant?: ScreenVariant;
  /** Per-tile layer reached: 0=layer0 only, 1=layer1 only, 2=both. Only for dual-layer indoor rooms. */
  tileLayer?: (0 | 1 | 2)[][];
  /** Per-layer reachable grids: [layer0, layer1]. For dual-layer indoor rooms. */
  reachableByLayer?: [ReachState[][], ReachState[][]];
  /** Raw per-layer attr grids for dual-layer rooms (for tooltip display). */
  dualLayerGrids?: { layer0: number[][]; layer1: number[][] };
  /** kind_of_in_room_staircase value at BFS time. 2 = layer changes blocked. */
  staircaseType?: number;
  /** Which layer the BFS started on (0=upper/BG2, 1=lower/BG1). */
  startLayer?: 0 | 1;
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
interface ScreenVariant {
  /** sram_progress_indicator: 0=intro, 1=post-mentor, 2=princess-rescued, 3=usurper-defeated */
  progressTier: number;
  /** save_ow_event_info[screen] & 0x20 — event overlay applied */
  eventOverlay: boolean;
  /** Full event flags byte for the screen */
  eventFlags: number;
}

interface ConnectionInfo {
  edge: 'north' | 'south' | 'east' | 'west';
  targetScreen: number;
  /** Screen index this connection originates from (set during aggregation) */
  sourceScreen?: number;
  /** True if this connection is between quadrants of the same room (intra-room scroll boundary). */
  isIntraRoom?: boolean;
  /** True if crossing this edge toggles Link's layer (door type 22 = kDoorType_PlayerBgChange). */
  layerToggle?: boolean;
  freeTileCount: number;
  itemTileCount: number;
  positions: number[];
  requirements: string[];
}

// ─── Multi-Screen ────────────────────────────────────────────────────────────

interface ScreenCoverage {
  screenIndex: number;
  entries: GridPos[];
  reachableCount: number;
  reachable: ReachState[][];
  borderFree: { north: Set<number>; south: Set<number>; east: Set<number>; west: Set<number> };
}

interface WorldFloodResult {
  screens: Map<number, ScreenCoverage>;
  totalReachable: number;
  totalPossible: number;
  elapsedMs: number;
  bfsRuns: number;
}

// ─── Screen Hop ──────────────────────────────────────────────────────────────

interface ScreenPath {
  screens: number[];
  crossings: { fromScreen: number; toScreen: number; edge: 'north' | 'south' | 'east' | 'west'; borderPos: number }[];
  totalCost: number;
}

// ─── Point Navigation ────────────────────────────────────────────────────────

interface TilePath {
  tiles: GridPos[];
  cost: number;
  requirements: string[];
}

// ─── Route Planning ──────────────────────────────────────────────────────────

interface RouteStep {
  screen: number;
  path: GridPos[];
  entryEdge?: 'north' | 'south' | 'east' | 'west';
  exitEdge?: 'north' | 'south' | 'east' | 'west';
}

interface Route {
  steps: RouteStep[];
  totalCost: number;
  screens: number[];
  requirements: string[];
}

// ─── Hub Navigation ──────────────────────────────────────────────────────────

interface NavigationStep {
  screenId: string;
  screenName: string;
}

interface NavigationResult {
  found: boolean;
  path: NavigationStep[];
  distance: number;
  visited: number;
  totalNodes: number;
  totalEdges: number;
}

interface PathfindingOptions {
  allowGlitches?: boolean;
}

export { GRID_SIZE, TOTAL_TILES, TRAVERSAL_DIRS, TRAVERSAL_DIR_OFFSET, STAIRS_TRAVERSAL_STATE };
export type { ReachState, LedgeDir, TilePassability, GridPos, WorldPos, CollisionGrid, Map32Tables, OverworldEntrance, TransitionPoint, LedgeTraversal, BorderSummary, FloodFillResult, ScreenVariant, ConnectionInfo, ScreenCoverage, WorldFloodResult, ScreenPath, TilePath, RouteStep, Route, NavigationStep, NavigationResult, PathfindingOptions };
