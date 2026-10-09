/* @layer shared-game @kind types */
import type { BorderEdge } from '@rotp/game-core';
import type { GridPos, ReachState } from '@rotp/game-core';

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

interface ScreenPath {
  screens: number[];
  crossings: { fromScreen: number; toScreen: number; edge: BorderEdge; borderPos: number }[];
  totalCost: number;
}

interface TilePath {
  tiles: GridPos[];
  cost: number;
  requirements: string[];
}

interface RouteStep {
  screen: number;
  path: GridPos[];
  entryEdge?: BorderEdge;
  exitEdge?: BorderEdge;
}

interface Route {
  steps: RouteStep[];
  totalCost: number;
  screens: number[];
  requirements: string[];
}

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

export type { NavigationResult, NavigationStep, PathfindingOptions, Route, RouteStep, ScreenCoverage, ScreenPath, TilePath, WorldFloodResult };
