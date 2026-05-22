// ─── Entry Point #1: Single Screen Flood Fill ────────────────────────────────
export { floodFillScreen, initEngine, getConnections } from './flood-fill';

// ─── Entry Point #2: Multi-Screen Flood Fill ─────────────────────────────────
export { floodFillWorld } from './flood-fill';

// ─── Entry Point #3: Screen-Level Shortest Path ──────────────────────────────
export { findScreenPath, getAdjacentScreen, clearScreenHopCache } from './screen-hop';

// ─── Entry Point #4: Hub/Region Graph Navigation ─────────────────────────────
export { findShortestPath, findPrecisePath, findUnreachableRegions, getGraphStats } from './hub-navigation';

// ─── Entry Point #5: Tile-Level A* ──────────────────────────────────────────
export { findTilePath, aStarOnGrid } from './point-navigation';

// ─── Entry Point #6: Full Route Planner ──────────────────────────────────────
export { planRoute } from './route-planner';
export type { Location, RoutePlanResult, RoutePlanStep } from './route-planner';

// ─── Types ───────────────────────────────────────────────────────────────────
export type {
  TilePassability, LedgeDir, GridPos, WorldPos,
  CollisionGrid, Map32Tables, OverworldEntrance,
  TransitionPoint, LedgeTraversal, BorderSummary,
  FloodFillResult, ConnectionInfo,
  ScreenCoverage, WorldFloodResult,
  ScreenPath, TilePath, RouteStep, Route,
  NavigationStep, NavigationResult, PathfindingOptions,
  EngineCache,
} from './types';

// ─── Utilities ───────────────────────────────────────────────────────────────
export { classifyTileAttr } from './tile-classification';
export { canPass, isPassableForClearance, unmetRequirements } from './core/inventory';
export { PriorityQueue } from './core/priority-queue';

// ─── Screen Names ────────────────────────────────────────────────────────────
export const SCREEN_NAMES: Record<number, string> = {
  0x00: 'Lost Woods NW', 0x01: 'Lost Woods NE', 0x02: 'Lumberjack Area',
  0x03: 'Death Mountain West', 0x05: 'Death Mountain East', 0x07: 'Turtle Rock Area',
  0x0A: 'Witch Hut', 0x0F: 'Master Sword Grove',
  0x10: 'Kakariko NW', 0x11: 'Kakariko NE', 0x12: 'Graveyard West',
  0x14: 'Graveyard East', 0x18: 'Kakariko SW', 0x19: 'Kakariko SE',
  0x1A: 'Haunted Grove', 0x1B: 'Castle Entrance',
  0x22: 'Hyrule Castle', 0x28: 'Desert NW', 0x29: 'Eastern Palace',
  0x2A: 'Desert North', 0x2B: "Uncle's Estate West", 0x2C: "Uncle's Estate East",
  0x2D: 'Hylia Shore NW', 0x2E: 'Eastern Peninsula',
  0x30: 'Desert SW', 0x32: 'Desert East', 0x33: 'Dam Headwaters',
  0x34: 'Hyrule Wetlands NE', 0x35: 'Lake Hylia NW',
  0x3A: 'South Shore', 0x3B: 'Lake Hylia Island',
};
