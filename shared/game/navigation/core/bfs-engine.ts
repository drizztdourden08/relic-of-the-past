import type { TransitionPoint, GridPos } from '../types';
import { GRID_SIZE } from '../types';
import { DIRECTIONS } from '../core';
import type { LayerStrategy, BFSCell, BFSResult, QuadrantBounds } from '../strategies/layer-strategy';
import { bodyTiles, findStartBody } from '../strategies/bfs-helpers';

/**
 * Unified BFS flood-fill engine using strategy injection for layer handling.
 * Operates on a 2×2 body moving through a 64×64 grid.
 */
export function runBFS(
  strategy: LayerStrategy,
  startRow: number,
  startCol: number,
  entrancePositions: { row: number; col: number; idx: number }[],
  inventory: Set<string>,
  bounds: QuadrantBounds,
  extraSeeds?: { row: number; col: number }[],
): BFSResult {
  const { minRow, maxRow, minCol, maxCol } = bounds;
  const startLayer = strategy.findStartLayer();
  const startGrid = strategy.getGrid(startLayer);

  // Body reached state: [layer][row][col]
  const bodyReached: [(Set<string> | null)[][], (Set<string> | null)[][]] = [
    Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(null)),
    Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(null)),
  ];

  const transitions: TransitionPoint[] = [];
  const foundBorders = new Set<string>();
  const deque: BFSCell[] = [];

  // Find starting body position
  const startBody = findStartBody(startRow, startCol, startGrid, inventory, minRow, maxRow, minCol, maxCol);
  if (startBody) {
    const startReqs = new Set<string>();
    for (const [r, c] of bodyTiles(startBody.row, startBody.col)) {
      const t = startGrid[r][c];
      if (t.type === 'obstacle' && inventory.has(t.req!)) startReqs.add(t.req!);
      if (t.type === 'water' && inventory.has('flippers')) startReqs.add('flippers');
    }
    deque.push({ row: startBody.row, col: startBody.col, layer: startLayer, requirements: startReqs });
    bodyReached[startLayer][startBody.row][startBody.col] = startReqs;
  }

  // Add extra seed positions
  if (extraSeeds) {
    for (const seed of extraSeeds) {
      const seedBody = findStartBody(seed.row, seed.col, startGrid, inventory, minRow, maxRow, minCol, maxCol);
      if (seedBody && bodyReached[startLayer][seedBody.row][seedBody.col] === null) {
        const seedReqs = new Set<string>();
        for (const [r, c] of bodyTiles(seedBody.row, seedBody.col)) {
          const t = startGrid[r][c];
          if (t.type === 'obstacle' && inventory.has(t.req!)) seedReqs.add(t.req!);
          if (t.type === 'water' && inventory.has('flippers')) seedReqs.add('flippers');
        }
        deque.push({ row: seedBody.row, col: seedBody.col, layer: startLayer, requirements: seedReqs });
        bodyReached[startLayer][seedBody.row][seedBody.col] = seedReqs;
      }
    }
  }

  // ─── BFS Main Loop ───────────────────────────────────────────────────────────
  while (deque.length > 0) {
    const cell = deque.shift()!;
    const { row, col, layer, requirements } = cell;

    const existing = bodyReached[layer][row][col]!;
    if (existing.size < requirements.size) continue;

    // Record border transitions for all 4 body tiles at quadrant edges
    for (const [r, c] of bodyTiles(row, col)) {
      recordBorderTransition(r, c, requirements, foundBorders, transitions, minRow, maxRow, minCol, maxCol);
    }

    // Record entrance reachability (body center proximity check)
    const bodyCenterRow = row + 1;
    const bodyCenterCol = col + 1;
    for (const ent of entrancePositions) {
      const key = `entrance-${ent.idx}`;
      if (foundBorders.has(key)) continue;
      const nearby =
        bodyCenterRow >= ent.row - 3 && bodyCenterRow <= ent.row + 5 &&
        bodyCenterCol >= ent.col - 3 && bodyCenterCol <= ent.col + 5;
      if (nearby) {
        foundBorders.add(key);
        transitions.push({ row: ent.row, col: ent.col, edge: 'entrance', requirements: [...requirements], entranceIdx: ent.idx });
      }
    }

    // Expand in 4 directions — strategy handles layer transitions
    for (const [dr, dc] of DIRECTIONS) {
      const results = strategy.expand(cell, dr, dc, inventory, bounds);
      for (const result of results) {
        const existingReqs = bodyReached[result.layer][result.row][result.col];
        if (existingReqs !== null && existingReqs.size <= result.requirements.size) continue;

        bodyReached[result.layer][result.row][result.col] = result.requirements;
        if (result.requirements === requirements) {
          deque.unshift({ row: result.row, col: result.col, layer: result.layer, requirements: result.requirements });
        } else {
          deque.push({ row: result.row, col: result.col, layer: result.layer, requirements: result.requirements });
        }
      }
    }
  }

  // ─── Post-BFS: build result ─────────────────────────────────────────────────
  const tileResult = strategy.buildTileResult(bodyReached, bounds, '');

  return {
    reachable: tileResult.reachable,
    transitions,
    reachableCount: tileResult.reachableCount,
    reqGrid: tileResult.reqGrid,
    hookTargets: tileResult.hookTargets,
    tileLayer: tileResult.tileLayer,
    reachableByLayer: tileResult.reachableByLayer,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function recordBorderTransition(
  row: number, col: number,
  requirements: Set<string>,
  foundBorders: Set<string>,
  transitions: TransitionPoint[],
  minR: number, maxR: number, minC: number, maxC: number,
): void {
  if (row === minR) {
    const key = `north-${col}`;
    if (!foundBorders.has(key)) { foundBorders.add(key); transitions.push({ row, col, edge: 'north', requirements: [...requirements] }); }
  }
  if (row === maxR) {
    const key = `south-${col}`;
    if (!foundBorders.has(key)) { foundBorders.add(key); transitions.push({ row, col, edge: 'south', requirements: [...requirements] }); }
  }
  if (col === minC) {
    const key = `west-${row}`;
    if (!foundBorders.has(key)) { foundBorders.add(key); transitions.push({ row, col, edge: 'west', requirements: [...requirements] }); }
  }
  if (col === maxC) {
    const key = `east-${row}`;
    if (!foundBorders.has(key)) { foundBorders.add(key); transitions.push({ row, col, edge: 'east', requirements: [...requirements] }); }
  }
}
