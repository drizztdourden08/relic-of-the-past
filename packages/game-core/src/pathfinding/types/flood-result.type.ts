/* @layer shared-game @kind types */
import type { TileReq } from '@rotp/game-data';
import type { GridPos, ReachState } from './grid.type';

type BorderEdge = 'north' | 'south' | 'east' | 'west';

interface OverworldEntrance {
  area: number;
  pos: number;
  id: number;
  gridRow: number;
  gridCol: number;
  roomId: number;
}

interface TransitionPoint {
  row: number;
  col: number;
  edge: BorderEdge | 'entrance';
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

interface ScreenVariant {
  progressTier: number;
  eventOverlay: boolean;
  eventFlags: number;
}

interface FloodFillResult {
  screenIndex: number;
  indoors: boolean;
  startPos: GridPos;
  reachable: ReachState[][];
  transitions: TransitionPoint[];
  reachableCount: number;
  totalTiles: number;
  entrances: OverworldEntrance[];
  ledges: LedgeTraversal[];
  attrGrid?: number[][];
  reqGrid?: string[][];
  items?: readonly TileReq[];
  dynamicBlockerCells?: GridPos[];
  hookTargets?: GridPos[];
  variant?: ScreenVariant;
  tileLayer?: (0 | 1 | 2)[][];
  reachableByLayer?: [ReachState[][], ReachState[][]];
  dualLayerGrids?: { layer0: number[][]; layer1: number[][] };
  staircaseType?: number;
  startLayer?: 0 | 1;
  borders: {
    north: BorderSummary;
    south: BorderSummary;
    east: BorderSummary;
    west: BorderSummary;
  };
}

interface ConnectionInfo {
  edge: BorderEdge;
  targetScreen: number;
  sourceScreen?: number;
  isIntraRoom?: boolean;
  layerToggle?: boolean;
  freeTileCount: number;
  itemTileCount: number;
  positions: number[];
  requirements: string[];
}

export type { BorderEdge, BorderSummary, ConnectionInfo, FloodFillResult, LedgeTraversal, OverworldEntrance, ScreenVariant, TransitionPoint };
