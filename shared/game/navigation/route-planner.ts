import type { RomData } from '../../asset-extraction/rom/rom-types';
import type { Route, RouteStep, GridPos, TilePassability, FloodFillResult } from './types';
import { GRID_SIZE } from './types';
import { findScreenPath, getAdjacentScreen } from './screen-hop';
import { aStarOnGrid } from './point-navigation';
import { floodFillScreen, getEntrances } from './flood-fill';
import { classifyTileAttr } from './tile-classification';
import { getScreenName } from './screen-names';
import { REGION_BY_ID } from '../data/regions';
import { ALL_CONNECTIONS, DUNGEON_CONNECTIONS } from '../data/connections';

// ─── Location Type ───────────────────────────────────────────────────────────

export interface Location {
  /** Region ID (e.g. 'kakariko-shop', 'lw-2c', 'links-house') */
  regionId: string;
  /** Optional tile position (row, col in 64×64 grid). If omitted, uses closest valid tile to center. */
  tile?: GridPos;
}

export interface RoutePlanResult {
  /** Screen-by-screen breakdown */
  steps: RoutePlanStep[];
  /** Total tile steps across all screens */
  totalSteps: number;
  /** Total screens traversed */
  totalScreens: number;
  /** Items required for this route */
  requirements: string[];
}

export interface RoutePlanStep {
  screenIndex: number;
  screenName: string;
  entry: GridPos;
  exit: GridPos;
  tileSteps: number;
}

// ─── Location Resolution ─────────────────────────────────────────────────────

interface ResolvedLocation {
  screenIndex: number;
  tile: GridPos;
}

/**
 * Resolve a Location to a concrete overworld screen + tile position.
 *
 * - Overworld regions (type lightWorld/darkWorld): use inGameIndex directly as screen
 * - Interior regions (type cave/house/shop/dungeon): find the entrance on the overworld
 *   and use that entrance's tile as the position
 */
function resolveLocation(loc: Location, rom: RomData, inventory: Set<string>): ResolvedLocation | null {
  const region = REGION_BY_ID.get(loc.regionId);
  if (!region) return null;

  let screenIndex: number;
  let tile: GridPos | undefined = loc.tile;

  if (region.type === 'lightWorld' || region.type === 'darkWorld') {
    // Overworld screen — inGameIndex IS the screen index
    if (region.inGameIndex === undefined) return null;
    screenIndex = region.inGameIndex;
  } else {
    // Interior region — use connection graph to find the correct overworld screen
    const owScreen = findOverworldScreenFromConnections(loc.regionId);
    if (owScreen === null) return null;
    screenIndex = owScreen;

    // Find entrance tile on this screen (prefer matching roomId, else any entrance)
    if (!tile) {
      const entrances = getEntrances(rom);
      const matchingEntrance = entrances.find(
        e => (e.area & 0x3f) === screenIndex && e.roomId === region.inGameIndex,
      );
      if (matchingEntrance) {
        tile = { row: matchingEntrance.gridRow, col: matchingEntrance.gridCol };
      } else {
        const anyEntrance = entrances.find(e => (e.area & 0x3f) === screenIndex);
        if (anyEntrance) {
          tile = { row: anyEntrance.gridRow, col: anyEntrance.gridCol };
        }
      }
    }
  }

  // If still no tile, flood fill and find closest valid tile to center
  if (!tile) {
    tile = findClosestValidTile(rom, screenIndex, inventory);
  }

  return { screenIndex, tile };
}

/**
 * Use connection graph to find which overworld screen connects to an interior region.
 * Returns the screen index or null.
 */
function findOverworldScreenFromConnections(regionId: string): number | null {
  const allConns = [...ALL_CONNECTIONS, ...DUNGEON_CONNECTIONS];
  // Find a connection FROM an overworld screen TO this region
  for (const conn of allConns) {
    if (conn.to !== regionId) continue;
    const fromRegion = REGION_BY_ID.get(conn.from);
    if (!fromRegion) continue;
    if ((fromRegion.type === 'lightWorld' || fromRegion.type === 'darkWorld') && fromRegion.inGameIndex !== undefined) {
      return fromRegion.inGameIndex;
    }
  }
  return null;
}

/**
 * Flood fill a screen and find the closest reachable tile to center (32,32).
 */
function findClosestValidTile(rom: RomData, screenIndex: number, inventory: Set<string>): GridPos {
  const result = floodFillScreen(rom, screenIndex, inventory);
  const center = { row: 32, col: 32 };

  // If center is reachable, use it
  if (result.reachable[center.row]?.[center.col] === 1) return center;

  // Spiral outward from center
  let best: GridPos = center;
  let bestDist = Infinity;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (result.reachable[r]?.[c] !== 1) continue;
      const dist = Math.abs(r - 32) + Math.abs(c - 32);
      if (dist < bestDist) {
        bestDist = dist;
        best = { row: r, col: c };
      }
    }
  }

  return best;
}

// ─── Grid Extraction ─────────────────────────────────────────────────────────

function getScreenGrid(rom: RomData, screenIndex: number, inventory: Set<string>): TilePassability[][] | null {
  const result = floodFillScreen(rom, screenIndex, inventory);
  if (!result.attrGrid) return null;

  const grid: TilePassability[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    grid[r] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      grid[r][c] = classifyTileAttr(result.attrGrid[r][c]);
    }
  }
  return grid;
}

// ─── Route Planning ──────────────────────────────────────────────────────────

/**
 * Plan the shortest route between two locations.
 * Entry point #6: full route planning.
 *
 * Algorithm:
 * 1. Resolve both locations to (screen, tile)
 * 2. If same screen: A* between tiles
 * 3. If different screens: screen-hop (Dijkstra) for screen path,
 *    then A* within each screen for tile-level routing
 */
export function planRoute(
  rom: RomData,
  source: Location,
  target: Location,
  inventory: Set<string> = new Set(),
): RoutePlanResult | null {
  const from = resolveLocation(source, rom, inventory);
  const to = resolveLocation(target, rom, inventory);
  if (!from || !to) return null;

  const allRequirements = new Set<string>();

  // Same screen — direct A*
  if (from.screenIndex === to.screenIndex) {
    const grid = getScreenGrid(rom, from.screenIndex, inventory);
    if (!grid) return null;

    const tilePath = aStarOnGrid(grid, from.tile, to.tile, inventory);
    const stepCount = tilePath ? tilePath.tiles.length - 1 : manhattan(from.tile, to.tile);

    if (tilePath) {
      for (const r of tilePath.requirements) allRequirements.add(r);
    }

    return {
      steps: [{
        screenIndex: from.screenIndex,
        screenName: getScreenName(from.screenIndex),
        entry: from.tile,
        exit: to.tile,
        tileSteps: stepCount,
      }],
      totalSteps: stepCount,
      totalScreens: 1,
      requirements: [...allRequirements],
    };
  }

  // Multi-screen: get screen path via Dijkstra
  const screenPath = findScreenPath(rom, from.screenIndex, to.screenIndex, inventory);
  if (!screenPath) return null;

  const steps: RoutePlanStep[] = [];
  let totalSteps = 0;

  for (let i = 0; i < screenPath.screens.length; i++) {
    const screenIdx = screenPath.screens[i];
    const grid = getScreenGrid(rom, screenIdx, inventory);
    if (!grid) return null;

    // Determine entry/exit positions
    let startPos: GridPos;
    let endPos: GridPos;

    if (i === 0) {
      startPos = from.tile;
    } else {
      const crossing = screenPath.crossings[i - 1];
      startPos = mirrorBorderPos(crossing.borderPos, crossing.edge);
    }

    if (i === screenPath.screens.length - 1) {
      endPos = to.tile;
    } else {
      const crossing = screenPath.crossings[i];
      endPos = borderExitPos(crossing.borderPos, crossing.edge);
    }

    // A* within this screen
    const tilePath = aStarOnGrid(grid, startPos, endPos, inventory);
    const stepCount = tilePath ? tilePath.tiles.length - 1 : manhattan(startPos, endPos);

    if (tilePath) {
      for (const r of tilePath.requirements) allRequirements.add(r);
    }

    steps.push({
      screenIndex: screenIdx,
      screenName: getScreenName(screenIdx),
      entry: startPos,
      exit: endPos,
      tileSteps: stepCount,
    });
    totalSteps += stepCount;
  }

  return {
    steps,
    totalSteps,
    totalScreens: screenPath.screens.length,
    requirements: [...allRequirements],
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mirrorBorderPos(pos: number, edge: 'north' | 'south' | 'east' | 'west'): GridPos {
  switch (edge) {
    case 'north': return { row: 63, col: pos };
    case 'south': return { row: 0, col: pos };
    case 'west': return { row: pos, col: 63 };
    case 'east': return { row: pos, col: 0 };
  }
}

function borderExitPos(pos: number, edge: 'north' | 'south' | 'east' | 'west'): GridPos {
  switch (edge) {
    case 'north': return { row: 0, col: pos };
    case 'south': return { row: 63, col: pos };
    case 'west': return { row: pos, col: 0 };
    case 'east': return { row: pos, col: 63 };
  }
}

function manhattan(a: GridPos, b: GridPos): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}


