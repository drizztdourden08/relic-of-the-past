import type { RomData } from '../../asset-extraction/rom/rom-types';
import type { ScreenPath, GridPos } from './types';
import { PriorityQueue } from './core';
import { floodFillScreen } from './flood-fill';

/**
 * Get the adjacent screen index for a given edge.
 * Overworld is 8x8 grid; LW = 0x00-0x3F, DW = 0x40-0x7F.
 */
export function getAdjacentScreen(screenIdx: number, edge: 'north' | 'south' | 'east' | 'west'): number | null {
  const col = screenIdx & 7;
  const row = (screenIdx >> 3) & 7;
  const world = screenIdx & 0x40;

  switch (edge) {
    case 'north': return row > 0 ? world | ((row - 1) << 3) | col : null;
    case 'south': return row < 7 ? world | ((row + 1) << 3) | col : null;
    case 'west': return col > 0 ? world | (row << 3) | (col - 1) : null;
    case 'east': return col < 7 ? world | (row << 3) | (col + 1) : null;
  }
}

/** Opposite edge for border crossing. */
function oppositeEdge(edge: 'north' | 'south' | 'east' | 'west'): 'north' | 'south' | 'east' | 'west' {
  switch (edge) {
    case 'north': return 'south';
    case 'south': return 'north';
    case 'east': return 'west';
    case 'west': return 'east';
  }
}

interface ScreenNode {
  screen: number;
  cost: number;
}

interface ScreenEdge {
  toScreen: number;
  edge: 'north' | 'south' | 'east' | 'west';
  borderPos: number;
  cost: number;
}

/**
 * Find the shortest sequence of screens from source to target.
 * Entry point #3: screen-level pathfinding.
 *
 * Uses Dijkstra where:
 * - Nodes = overworld screens
 * - Edge cost = 1 per screen transition (could be weighted by border width)
 * - Only crosses borders with free tiles (respects inventory)
 *
 * Builds the screen graph lazily using flood-fill results.
 */
export function findScreenPath(
  rom: RomData,
  fromScreen: number,
  toScreen: number,
  inventory: Set<string>,
): ScreenPath | null {
  if (fromScreen === toScreen) {
    return { screens: [fromScreen], crossings: [], totalCost: 0 };
  }

  // Dijkstra on screen graph
  const dist = new Map<number, number>();
  const parent = new Map<number, { from: number; edge: 'north' | 'south' | 'east' | 'west'; borderPos: number }>();
  const visited = new Set<number>();

  const pq = new PriorityQueue<ScreenNode>((a, b) => a.cost - b.cost);
  dist.set(fromScreen, 0);
  pq.push({ screen: fromScreen, cost: 0 });

  while (!pq.isEmpty) {
    const { screen, cost } = pq.pop()!;
    if (visited.has(screen)) continue;
    visited.add(screen);

    if (screen === toScreen) break;

    // Get connections from this screen
    const edges = getScreenEdges(rom, screen, inventory);
    for (const edge of edges) {
      if (visited.has(edge.toScreen)) continue;
      const newCost = cost + edge.cost;
      const existing = dist.get(edge.toScreen);
      if (existing === undefined || newCost < existing) {
        dist.set(edge.toScreen, newCost);
        parent.set(edge.toScreen, { from: screen, edge: edge.edge, borderPos: edge.borderPos });
        pq.push({ screen: edge.toScreen, cost: newCost });
      }
    }
  }

  if (!parent.has(toScreen) && fromScreen !== toScreen) return null;

  // Reconstruct path
  const screens: number[] = [];
  const crossings: ScreenPath['crossings'] = [];
  let current = toScreen;

  while (current !== fromScreen) {
    screens.unshift(current);
    const p = parent.get(current)!;
    crossings.unshift({ fromScreen: p.from, toScreen: current, edge: p.edge, borderPos: p.borderPos });
    current = p.from;
  }
  screens.unshift(fromScreen);

  return { screens, crossings, totalCost: dist.get(toScreen) ?? 0 };
}

// ─── Graph Building ──────────────────────────────────────────────────────────

/** Cache of screen edges to avoid repeated flood-fills. */
const edgeCache = new Map<string, ScreenEdge[]>();

function getScreenEdges(rom: RomData, screen: number, inventory: Set<string>): ScreenEdge[] {
  const cacheKey = `${screen}:${[...inventory].sort().join(',')}`;
  if (edgeCache.has(cacheKey)) return edgeCache.get(cacheKey)!;

  // Try flood fill from center first, then from border tiles if center is isolated
  let result = floodFillScreen(rom, screen, inventory);

  // If center-start gives poor border coverage, try starting from each border
  const totalBorderFree = result.borders.north.freeTiles.length +
    result.borders.south.freeTiles.length +
    result.borders.east.freeTiles.length +
    result.borders.west.freeTiles.length;

  if (totalBorderFree === 0 && result.reachableCount < 100) {
    // Center is isolated — try border starts
    const borderStarts: { row: number; col: number }[] = [
      { row: 0, col: 32 },  // north
      { row: 63, col: 32 }, // south
      { row: 32, col: 0 },  // west
      { row: 32, col: 63 }, // east
    ];
    for (const startPos of borderStarts) {
      const attempt = floodFillScreen(rom, screen, inventory, startPos);
      const attemptBorders = attempt.borders.north.freeTiles.length +
        attempt.borders.south.freeTiles.length +
        attempt.borders.east.freeTiles.length +
        attempt.borders.west.freeTiles.length;
      if (attemptBorders > totalBorderFree) {
        result = attempt;
        break;
      }
    }
  }

  const edges: ScreenEdge[] = [];
  for (const edge of ['north', 'south', 'east', 'west'] as const) {
    const border = result.borders[edge];
    if (border.freeTiles.length === 0) continue;

    const adjScreen = getAdjacentScreen(screen, edge);
    if (adjScreen === null) continue;

    // Cost: 1 per transition (uniform for now)
    // Use median border position as representative crossing point
    const sorted = [...border.freeTiles].sort((a, b) => a - b);
    const medianPos = sorted[Math.floor(sorted.length / 2)];

    edges.push({ toScreen: adjScreen, edge, borderPos: medianPos, cost: 1 });
  }

  edgeCache.set(cacheKey, edges);
  return edges;
}

/** Clear the screen edge cache (call when inventory changes). */
export function clearScreenHopCache(): void {
  edgeCache.clear();
}
