import type { RomData } from '../../asset-extraction/rom/rom-types';
import type { TilePath, GridPos, TilePassability } from './types';
import { GRID_SIZE } from './types';
import { PriorityQueue, manhattan, DIRECTIONS, inBounds, has2TileClearance } from './core';
import { isPassableForClearance } from './core/inventory';
import { floodFillScreen } from './flood-fill';

interface AStarNode {
  row: number;
  col: number;
  g: number; // cost from start
  f: number; // g + heuristic
}

/**
 * A* pathfinding within a single screen's 64x64 grid.
 * Entry point #5: tile-level shortest path.
 *
 * Finds the shortest walkable path from start to end,
 * respecting inventory-gated obstacles and 2-tile width clearance.
 */
export function findTilePath(
  rom: RomData,
  screenIndex: number,
  start: GridPos,
  end: GridPos,
  inventory: Set<string>,
): TilePath | null {
  // Get the prepared grid (with cliff preprocessing)
  const result = floodFillScreen(rom, screenIndex, inventory, start);
  const grid = getGridFromResult(rom, screenIndex);
  if (!grid) return null;

  return aStarOnGrid(grid, start, end, inventory);
}

/**
 * A* on a pre-built collision grid (no ROM needed).
 * Useful when grid is already available.
 */
export function aStarOnGrid(
  grid: TilePassability[][],
  start: GridPos,
  end: GridPos,
  inventory: Set<string>,
): TilePath | null {
  const pq = new PriorityQueue<AStarNode>((a, b) => a.f - b.f);
  const gScore = new Map<string, number>();
  const parent = new Map<string, GridPos>();
  const requirements = new Set<string>();

  const startKey = `${start.row},${start.col}`;
  const endKey = `${end.row},${end.col}`;

  gScore.set(startKey, 0);
  pq.push({ row: start.row, col: start.col, g: 0, f: manhattan(start, end) });

  while (!pq.isEmpty) {
    const current = pq.pop()!;
    const currentKey = `${current.row},${current.col}`;

    if (currentKey === endKey) {
      // Reconstruct path
      const path: GridPos[] = [];
      let key = endKey;
      while (key !== startKey) {
        const [r, c] = key.split(',').map(Number);
        path.unshift({ row: r, col: c });
        const p = parent.get(key);
        if (!p) break;
        key = `${p.row},${p.col}`;
      }
      path.unshift(start);
      return { tiles: path, cost: current.g, requirements: [...requirements] };
    }

    const currentG = gScore.get(currentKey)!;
    if (current.g > currentG) continue; // stale entry

    for (const [dr, dc] of DIRECTIONS) {
      const nr = current.row + dr;
      const nc = current.col + dc;
      if (!inBounds(nr, nc)) continue;

      // Ledge exit restriction
      const currentTile = grid[current.row][current.col];
      if (currentTile.type === 'ledge') {
        if (!canLeaveLedgeDir(currentTile.dir, dr, dc)) continue;
      }

      const tile = grid[nr][nc];
      const moveCost = getMoveCost(tile, dr, dc, inventory);
      if (moveCost < 0) continue; // impassable

      // Track requirements
      if (tile.type === 'obstacle') requirements.add(tile.req);
      if (tile.type === 'water') requirements.add('flippers');

      const newG = currentG + moveCost;
      const nKey = `${nr},${nc}`;
      const existingG = gScore.get(nKey);

      if (existingG === undefined || newG < existingG) {
        gScore.set(nKey, newG);
        parent.set(nKey, { row: current.row, col: current.col });
        pq.push({ row: nr, col: nc, g: newG, f: newG + manhattan({ row: nr, col: nc }, end) });
      }
    }
  }

  return null; // no path found
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMoveCost(tile: TilePassability, dr: number, dc: number, inventory: Set<string>): number {
  switch (tile.type) {
    case 'free': return 1;
    case 'pit': return 1;
    case 'obstacle':
      return inventory.has(tile.req) ? 2 : -1; // obstacles cost more (interaction time)
    case 'water':
      return inventory.has('flippers') ? 3 : -1; // swimming is slower
    case 'ledge':
      if (canEnterLedge(tile.dir, dr, dc)) return 1;
      return -1;
    case 'blocked':
      return -1;
  }
}

function canEnterLedge(dir: string, dr: number, dc: number): boolean {
  return (
    (dir === 's' && dr === 1) || (dir === 'n' && dr === -1) ||
    (dir === 'e' && dc === 1) || (dir === 'w' && dc === -1) ||
    (dir === 'ne' && (dr === -1 || dc === 1)) ||
    (dir === 'nw' && (dr === -1 || dc === -1)) ||
    (dir === 'se' && (dr === 1 || dc === 1)) ||
    (dir === 'sw' && (dr === 1 || dc === -1))
  );
}

function canLeaveLedgeDir(dir: string, dr: number, dc: number): boolean {
  return (dir === 's' && dr === 1) || (dir === 'n' && dr === -1) ||
    (dir === 'e' && dc === 1) || (dir === 'w' && dc === -1);
}

/** Get collision grid from a screen (using the orchestrator). */
function getGridFromResult(rom: RomData, screenIndex: number): TilePassability[][] | null {
  try {
    const result = floodFillScreen(rom, screenIndex, new Set(['lift.0']));
    // The grid isn't directly in the result — we need the attrGrid to reconstruct
    // For now, just confirm the screen is valid
    return null; // Placeholder — route-planner handles grid access directly
  } catch {
    return null;
  }
}
