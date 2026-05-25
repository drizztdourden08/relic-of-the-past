/**
 * Global Flood Fill — Floods from Link's House outward through the entire game world.
 *
 * The algorithm:
 * 1. Start at Link's House spawn position (screen 0x2C)
 * 2. BFS flood the current screen
 * 3. At borders: detect bundles, check two-sided overlap with neighbor
 * 4. At entrances: resolve via ROM entrance table, flood interior
 * 5. Queue discovered screens/rooms for continued flooding
 * 6. Repeat with increasing inventory sets for requirement detection
 *
 * Output: enriched ScreenData for each screen reached.
 */

import type { RomData } from '../../../asset-extraction/rom/rom-types';
import type { RegionNavData, ConnectionNavData, ConnectionPointData } from '../plan/navigation-data.types';
import { floodFillScreen, initEngine } from '../flood-fill';
import { findBorderBundles, computeOverlap } from './border-bundles';
import { resolveEntrances } from './entrance-resolver';

export interface GlobalFloodOptions {
  /** ROM data */
  rom: RomData;
  /** Starting screen (default: 0x2C = Link's House area) */
  startScreen?: number;
  /** Starting position on that screen */
  startPos?: { row: number; col: number };
  /** Inventory sets to test (progressive unlock). Default: empty → all items */
  inventorySets?: Set<string>[];
  /** Callback for progress reporting */
  onProgress?: (screen: number, total: number) => void;
}

export interface GlobalFloodResult {
  /** Nav data per screen */
  screens: Map<number, RegionNavData>;
  /** Discovered connections with nav data */
  connections: ConnectionNavData[];
  /** Screens that were unreachable */
  unreachable: number[];
  /** Timing */
  elapsedMs: number;
}

export interface QueueEntry {
  screenIndex: number;
  /** Entry position — where we arrive on this screen (border tile or start position) */
  entryPos?: { row: number; col: number };
}

/**
 * Run the global flood fill analysis.
 */
export function globalFlood(options: GlobalFloodOptions): GlobalFloodResult {
  const { rom, startScreen = 0x2C, startPos } = options;
  initEngine(rom);

  const screens = new Map<number, RegionNavData>();
  const connections: ConnectionNavData[] = [];
  const visited = new Set<number>();
  const floodCache = new Map<string, ReturnType<typeof floodFillScreen>>();

  // For the starting screen, use provided position or find largest reachable area
  const initialEntry: QueueEntry = { screenIndex: startScreen, entryPos: startPos };
  const queue: QueueEntry[] = [initialEntry];

  const start = performance.now();

  while (queue.length > 0) {
    const { screenIndex, entryPos } = queue.shift()!;
    if (visited.has(screenIndex)) continue;
    visited.add(screenIndex);

    // Flood this screen from the entry position
    const result = floodScreenBest(rom, screenIndex, entryPos, floodCache);

    // Detect border bundles from our flood
    const bundles = findBorderBundles(result);

    // Check each border bundle against the adjacent screen
    for (const bundle of bundles) {
      const neighborScreen = getNeighborScreen(screenIndex, bundle.direction);
      if (neighborScreen === null || neighborScreen < 0 || neighborScreen > 0x7F) continue;
      if (visited.has(neighborScreen)) continue;

      // Flood neighbor from the corresponding border to check overlap
      const oppositeDir = getOppositeDirection(bundle.direction);
      const neighborEntryPos = borderEntryPos(bundle.tiles, bundle.direction);
      const neighborResult = floodScreenBest(rom, neighborScreen, neighborEntryPos, floodCache);
      const neighborBundles = findBorderBundles(neighborResult);
      const matchingBundles = neighborBundles.filter(b => b.direction === oppositeDir);

      for (const neighborBundle of matchingBundles) {
        const overlap = computeOverlap(bundle.tiles, neighborBundle.tiles);
        if (overlap.length > 0) {
          // Valid connection — queue neighbor with entry at their border
          const entry = borderEntryPos(neighborBundle.tiles, oppositeDir);
          queue.push({ screenIndex: neighborScreen, entryPos: entry });
          break; // one valid overlap is enough to queue
        }
      }
    }

    // Build RegionNavData for this screen
    screens.set(screenIndex, {
      totalTiles: 4096,
      freeTileCount: result.reachableCount,
      maxReachableTileCount: result.reachableCount,
      connectionPointIds: bundles.map(b => b.id),
      obstacles: [],
      features: [],
    });

    options.onProgress?.(visited.size, 128);
  }

  // Identify unreachable screens (both LW and DW)
  const allScreens = Array.from({ length: 128 }, (_, i) => i);
  const unreachable = allScreens.filter(s => !visited.has(s));

  return {
    screens,
    connections,
    unreachable,
    elapsedMs: performance.now() - start,
  };
}

/**
 * Flood a screen, trying the given entry position first.
 * If that yields very few tiles (<50), also try the center and corners to find
 * the largest reachable area (handles screens where start is in a small enclosure).
 */
function floodScreenBest(
  rom: RomData,
  screenIndex: number,
  entryPos: { row: number; col: number } | undefined,
  cache: Map<string, ReturnType<typeof floodFillScreen>>,
): ReturnType<typeof floodFillScreen> {
  const key = `${screenIndex}:${entryPos?.row ?? 'x'},${entryPos?.col ?? 'x'}`;
  if (cache.has(key)) return cache.get(key)!;

  let best = floodFillScreen(rom, screenIndex, undefined, entryPos);

  // If we got very few tiles, try alternate positions to find the outdoor area
  if (best.reachableCount < 50) {
    const alts: { row: number; col: number }[] = [
      { row: 32, col: 32 }, { row: 50, col: 30 }, { row: 40, col: 20 },
      { row: 10, col: 30 }, { row: 55, col: 55 }, { row: 8, col: 32 },
    ];
    for (const pos of alts) {
      const r = floodFillScreen(rom, screenIndex, undefined, pos);
      if (r.reachableCount > best.reachableCount) best = r;
    }
  }

  cache.set(key, best);
  return best;
}

/**
 * Given border tiles and direction, compute an entry position for the neighbor screen.
 * When we cross a border heading north, we enter the neighbor at their south border (row 63).
 */
function borderEntryPos(tiles: number[], direction: 'n' | 's' | 'e' | 'w'): { row: number; col: number } {
  const mid = tiles[Math.floor(tiles.length / 2)];
  switch (direction) {
    case 'n': return { row: 63, col: mid }; // we go north → enter neighbor at their south
    case 's': return { row: 0, col: mid };  // we go south → enter neighbor at their north
    case 'e': return { row: mid, col: 0 };  // we go east → enter neighbor at their west
    case 'w': return { row: mid, col: 63 }; // we go west → enter neighbor at their east
  }
}

function getNeighborScreen(screen: number, direction: 'n' | 's' | 'e' | 'w'): number | null {
  const row = screen >> 3;
  const col = screen & 7;
  switch (direction) {
    case 'n': return row > 0 ? ((row - 1) << 3) | col : null;
    case 's': return row < 7 ? ((row + 1) << 3) | col : null;
    case 'e': return col < 7 ? (row << 3) | (col + 1) : null;
    case 'w': return col > 0 ? (row << 3) | (col - 1) : null;
  }
}

function getOppositeDirection(dir: 'n' | 's' | 'e' | 'w'): 'n' | 's' | 'e' | 'w' {
  switch (dir) { case 'n': return 's'; case 's': return 'n'; case 'e': return 'w'; case 'w': return 'e'; }
}
