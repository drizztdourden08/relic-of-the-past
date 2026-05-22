import type { RomData } from '../../asset-extraction/rom/rom-types';

// ─── Grid Constants ──────────────────────────────────────────────────────────

export const GRID_SIZE = 64;
export const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

// ─── Tile Types ──────────────────────────────────────────────────────────────

export type LedgeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export type TilePassability =
  | { type: 'free' }
  | { type: 'obstacle'; req: string }
  | { type: 'blocked' }
  | { type: 'ledge'; dir: LedgeDir }
  | { type: 'pit' }
  | { type: 'water' };

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
  reachable: boolean[][];
  transitions: TransitionPoint[];
  reachableCount: number;
  totalTiles: number;
  entrances: OverworldEntrance[];
  ledges: LedgeTraversal[];
  attrGrid?: number[][];
  reqGrid?: string[][];
  borders: {
    north: BorderSummary;
    south: BorderSummary;
    east: BorderSummary;
    west: BorderSummary;
  };
}

export interface ConnectionInfo {
  edge: 'north' | 'south' | 'east' | 'west';
  targetScreen: number;
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
  reachable: boolean[][];
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
  entrance: string | null;
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

// ─── Engine Cache ────────────────────────────────────────────────────────────

export interface EngineCache {
  map32: Map32Tables;
  map16ToMap8: Uint16Array;
  map8ToAttr: Uint8Array;
  entrances: OverworldEntrance[];
}
