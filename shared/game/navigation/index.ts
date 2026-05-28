// ─── Entry Point #1: Single Screen Flood Fill ────────────────────────────────
export { floodFillScreen, getConnections } from './flood-fill';
export type { FloodFillOptions } from './flood-fill';
export type { QuadrantBounds } from './flood-fill';

// ─── Entry Point #2: Multi-Screen Flood Fill ─────────────────────────────────
export { floodFillWorld } from './flood-fill';

// ─── Entry Point #3: Hub/Region Graph Navigation ─────────────────────────────
export { findShortestPath, findPrecisePath, findUnreachableRegions, getGraphStats } from './hub-navigation';

// ─── Types ───────────────────────────────────────────────────────────────────
export type {
  TilePassability, LedgeDir, GridPos, WorldPos,
  CollisionGrid, Map32Tables, OverworldEntrance,
  TransitionPoint, LedgeTraversal, BorderSummary,
  FloodFillResult, ConnectionInfo,
  ScreenCoverage, WorldFloodResult,
  ScreenPath, TilePath, RouteStep, Route,
  NavigationStep, NavigationResult, PathfindingOptions,
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

// ─── Screen Bundles ──────────────────────────────────────────────────────────
export { buildScreenBundle } from './screen-bundles';
export type { ScreenBundle } from './screen-bundles';

// ─── Navigation Data Types (for analysis + pathfinder) ───────────────────────
export type {
  TraversalRequirement, RequirementSet, ConnectionTransitType,
  RegionNavData, ConnectionNavData, ConnectionPointData,
  NavObstacle, NavFeature, NavVariant,
} from './nav-data.types';

