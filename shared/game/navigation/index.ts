/* @layer shared-game @kind logic */
// ─── Entry Point #1: Single Screen Flood Fill ────────────────────────────────
export { floodFillScreen, getConnections } from './flood-fill';
export type { FloodFillOptions } from './flood-fill';
export type { QuadrantBounds } from './flood-fill';

// ─── Entry Point #2: Multi-Screen Flood Fill ─────────────────────────────────

// ─── Connection destination naming ───────────────────────────────────────────
export { getConnectionDestinationName } from './connection-names';

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

// ─── Crossings (one record for every way on or off a screen) ─────────────────
export type {
  CrossingClass, CrossingOrigin, CrossingSpan, CrossingTarget, ScreenCrossing, ScreenCrossings,
} from './crossing.types';

// ─── Utilities ───────────────────────────────────────────────────────────────
export { classifyTileAttr } from './tile-classification';
export {
  TILE_ATTRS,
  OVERWORLD_TILE_ATTRS,
  tileAttrsFor,
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
export type { TileReq, TileLabel, TilePass, TileCat, TileAttrDef } from './tile-attrs';
export { unmetRequirements } from './core/inventory';
export { PriorityQueue } from './core/priority-queue';

// ─── Screen Bundles ──────────────────────────────────────────────────────────
export { buildScreenBundle } from './screen-bundles';
export type { ScreenBundle } from './screen-bundles';

// ─── Door Gates (door records → BFS gated cells) ─────────────────────────────

// ─── Navigation Data Types (for analysis + pathfinder) ───────────────────────
export type {
  TraversalRequirement, RequirementSet, ConnectionTransitType,
  RegionNavData, ConnectionNavData, ConnectionPointData,
  NavObstacle, NavFeature, NavVariant,
} from './nav-data.types';
export { isEntranceUsable, usableEntrances, usableEntranceTransition } from './flood-fill/entrance-usable';
