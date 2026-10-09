/* @layer shared-game @kind barrel */
export { floodFillScreen, getConnections } from './flood-fill';
export type { FloodFillOptions, QuadrantBounds } from './flood-fill';
export { getConnectionDestinationName } from './connection-names';
export type { TilePassability, LedgeDir, GridPos, WorldPos, CollisionGrid, Map32Tables, OverworldEntrance, TransitionPoint, LedgeTraversal, BorderSummary, FloodFillResult, ConnectionInfo } from '@rotp/game-core';
export type { ScreenCoverage, WorldFloodResult, ScreenPath, TilePath, RouteStep, Route, NavigationStep, NavigationResult, PathfindingOptions } from './types/route.type';
export type { CrossingClass, CrossingOrigin, CrossingSpan, CrossingTarget, ScreenCrossing, ScreenCrossings } from '@rotp/game-core';
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
export { buildScreenBundle } from './screen-bundles';
export type { ScreenBundleGrid } from './screen-bundles';
export type { TraversalRequirement, RequirementSet, ConnectionTransitType, RegionNavData, ConnectionNavData, ConnectionPointData, NavObstacle, NavFeature, NavVariant } from '@rotp/game-data';
export { isEntranceUsable } from './flood-fill/is-entrance-usable';
export { usableEntrances } from './flood-fill/usable-entrances';
export { usableEntranceTransition } from './flood-fill/usable-entrance-transition';
