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
export {
  TILE_ATTRS,
  OVERWORLD_TILE_ATTRS,
  INTERIOR_HOUSE_TILE_ATTRS,
  INTERIOR_CAVE_TILE_ATTRS,
  INTERIOR_DUNGEON_TILE_ATTRS,
  getTileAttrsMap,
  getHookshotTargetTiles,
  getAttrLabel,
  getAttrReq,
  isCategory,
  WATER_TILES,
  CLIFF_TRIGGER_TILES,
  CLIFF_FACE_TILES,
  PIT_TILES,
  HOOKSHOT_TARGET_TILES,
} from './tile-attrs';
export type { TileReq, TileLabel, TilePass, TileCat, TileAttrDef, TileAttrContext } from './tile-attrs';
export { canPass, isPassableForClearance, unmetRequirements } from './core/inventory';
export { PriorityQueue } from './core/priority-queue';

// ─── Screen Names ────────────────────────────────────────────────────────────
export { SCREEN_NAMES, getScreenName } from './screen-names';
