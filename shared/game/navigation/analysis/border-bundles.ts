/**
 * Border Bundle Detection — identifies contiguous groups of reachable border tiles
 * and validates two-sided overlap between adjacent screens.
 *
 * A "bundle" is a contiguous run of reachable tiles on one border of a screen.
 * If a cliff splits a border into two walkable gaps, we get two bundles.
 *
 * Overlap = intersection of source border tiles and destination border tiles.
 * Only positions present in BOTH are valid crossing points.
 */

import type { FloodFillResult } from '../types';
import type { ConnectionPointData } from '../plan/navigation-data.types';

export interface BorderBundle {
  /** Unique ID: "lw-{screen:hex}-edge-{dir}-{index}" */
  id: string;
  /** Which border */
  direction: 'n' | 's' | 'e' | 'w';
  /** Tile positions (0–63) that are contiguous and reachable */
  tiles: number[];
  /** Requirements to reach these tiles from the screen interior */
  requirements: string[][];
}

/**
 * Find all border bundles for a flood-filled screen.
 * Groups contiguous reachable border tiles into bundles.
 */
export function findBorderBundles(result: FloodFillResult): BorderBundle[] {
  const screen = result.screenIndex;
  const prefix = `lw-${screen.toString(16).padStart(2, '0')}`;
  const bundles: BorderBundle[] = [];

  // North border: row 0, columns 0–63
  const northTiles = getReachableBorderTiles(result, 'n');
  splitIntoBundles(northTiles, 'n', prefix, bundles);

  // South border: row 63, columns 0–63
  const southTiles = getReachableBorderTiles(result, 's');
  splitIntoBundles(southTiles, 's', prefix, bundles);

  // East border: col 63, rows 0–63
  const eastTiles = getReachableBorderTiles(result, 'e');
  splitIntoBundles(eastTiles, 'e', prefix, bundles);

  // West border: col 0, rows 0–63
  const westTiles = getReachableBorderTiles(result, 'w');
  splitIntoBundles(westTiles, 'w', prefix, bundles);

  return bundles;
}

/**
 * Compute the overlap (intersection) between two tile position arrays.
 * Returns the positions present in BOTH arrays — the valid crossing corridor.
 */
export function computeOverlap(tilesA: number[], tilesB: number[]): number[] {
  const setB = new Set(tilesB);
  return tilesA.filter(t => setB.has(t));
}

/**
 * Given two screens' flood results, build the full two-sided connection data.
 */
export function buildWalkConnection(
  fromResult: FloodFillResult,
  toResult: FloodFillResult,
  direction: 'n' | 's' | 'e' | 'w',
): { fromBundle: BorderBundle; toBundle: BorderBundle; overlapTiles: number[] }[] {
  const fromBundles = findBorderBundles(fromResult).filter(b => b.direction === direction);
  const oppositeDir = oppositeDirection(direction);
  const toBundles = findBorderBundles(toResult).filter(b => b.direction === oppositeDir);

  const connections: { fromBundle: BorderBundle; toBundle: BorderBundle; overlapTiles: number[] }[] = [];

  for (const fb of fromBundles) {
    for (const tb of toBundles) {
      const overlap = computeOverlap(fb.tiles, tb.tiles);
      if (overlap.length > 0) {
        connections.push({ fromBundle: fb, toBundle: tb, overlapTiles: overlap });
      }
    }
  }

  return connections;
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

function getReachableBorderTiles(result: FloodFillResult, direction: 'n' | 's' | 'e' | 'w'): number[] {
  const tiles: number[] = [];
  const grid = result.reachable;

  switch (direction) {
    case 'n':
      for (let col = 0; col < 64; col++) { if (grid[0]?.[col]) tiles.push(col); }
      break;
    case 's':
      for (let col = 0; col < 64; col++) { if (grid[63]?.[col]) tiles.push(col); }
      break;
    case 'e':
      for (let row = 0; row < 64; row++) { if (grid[row]?.[63]) tiles.push(row); }
      break;
    case 'w':
      for (let row = 0; row < 64; row++) { if (grid[row]?.[0]) tiles.push(row); }
      break;
  }

  return tiles;
}

/**
 * Split a sorted array of positions into contiguous bundles.
 * e.g. [3,4,5, 20,21,22,23] → [[3,4,5], [20,21,22,23]]
 */
function splitIntoBundles(
  tiles: number[],
  direction: 'n' | 's' | 'e' | 'w',
  prefix: string,
  output: BorderBundle[],
): void {
  if (tiles.length === 0) return;

  let bundleStart = 0;
  let bundleIndex = 0;

  for (let i = 1; i <= tiles.length; i++) {
    // End of contiguous run?
    if (i === tiles.length || tiles[i] !== tiles[i - 1] + 1) {
      const bundleTiles = tiles.slice(bundleStart, i);
      output.push({
        id: `${prefix}-edge-${direction}-${bundleIndex}`,
        direction,
        tiles: bundleTiles,
        requirements: [], // filled by requirement detector later
      });
      bundleIndex++;
      bundleStart = i;
    }
  }
}

function oppositeDirection(dir: 'n' | 's' | 'e' | 'w'): 'n' | 's' | 'e' | 'w' {
  switch (dir) { case 'n': return 's'; case 's': return 'n'; case 'e': return 'w'; case 'w': return 'e'; }
}
