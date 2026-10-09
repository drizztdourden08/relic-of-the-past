/* @layer shared-game @kind logic */
import type { TilePassability, TransitionPoint } from '../types';
import type { LayerStrategy, BFSCell, BFSResult, QuadrantBounds } from '../strategies/layer-strategy';
import type { EntrancePosition } from './bfs-engine.type';
import { GRID_SIZE } from '../types';
import { bodyTiles } from '../strategies/body-tiles';
import { findStartBody } from '../strategies/find-start-body';
import { DIRECTIONS, ENTRANCE_REACH } from './grid.constants';

const bodyStartRequirements = (row: number, col: number, grid: TilePassability[][], inventory: Set<string>): Set<string> => {
  const reqs = new Set<string>();
  for (const [r, c] of bodyTiles(row, col)) {
    const t = grid[r][c];
    if (t.type === 'obstacle' && inventory.has(t.req)) reqs.add(t.req);
    if (t.type === 'water' && inventory.has('flippers')) reqs.add('flippers');
  }
  return reqs;
};

const isNearEntrance = (bodyCenterRow: number, bodyCenterCol: number, ent: EntrancePosition): boolean =>
  bodyCenterRow >= ent.row - ENTRANCE_REACH.before && bodyCenterRow <= ent.row + ENTRANCE_REACH.after
  && bodyCenterCol >= ent.col - ENTRANCE_REACH.before && bodyCenterCol <= ent.col + ENTRANCE_REACH.after;

const recordBorderTransition = (row: number, col: number, requirements: Set<string>, foundBorders: Set<string>, transitions: TransitionPoint[], bounds: QuadrantBounds): void => {
  const { minRow, maxRow, minCol, maxCol } = bounds;
  const record = (key: string, edge: TransitionPoint['edge']): void => {
    if (foundBorders.has(key)) return;
    foundBorders.add(key);
    transitions.push({ row, col, edge, requirements: [...requirements] });
  };
  if (row === minRow) record(`north-${col}`, 'north');
  if (row === maxRow) record(`south-${col}`, 'south');
  if (col === minCol) record(`west-${row}`, 'west');
  if (col === maxCol) record(`east-${row}`, 'east');
};

const runBFS = (strategy: LayerStrategy, startRow: number, startCol: number, entrancePositions: EntrancePosition[], inventory: Set<string>, bounds: QuadrantBounds, extraSeeds?: { row: number; col: number }[]): BFSResult => {
  const { minRow, maxRow, minCol, maxCol } = bounds;
  const startLayer = strategy.findStartLayer();
  const startGrid = strategy.getGrid(startLayer);

  const bodyReached: [(Set<string> | null)[][], (Set<string> | null)[][]] = [
    Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(null)),
    Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(null)),
  ];

  const transitions: TransitionPoint[] = [];
  const foundBorders = new Set<string>();
  const deque: BFSCell[] = [];

  const startBody = findStartBody(startRow, startCol, startGrid, inventory, minRow, maxRow, minCol, maxCol);
  if (startBody) {
    const startReqs = bodyStartRequirements(startBody.row, startBody.col, startGrid, inventory);
    deque.push({ row: startBody.row, col: startBody.col, layer: startLayer, requirements: startReqs });
    bodyReached[startLayer][startBody.row][startBody.col] = startReqs;
  }

  for (const seed of extraSeeds ?? []) {
    const seedBody = findStartBody(seed.row, seed.col, startGrid, inventory, minRow, maxRow, minCol, maxCol);
    if (seedBody && bodyReached[startLayer][seedBody.row][seedBody.col] === null) {
      const seedReqs = bodyStartRequirements(seedBody.row, seedBody.col, startGrid, inventory);
      deque.push({ row: seedBody.row, col: seedBody.col, layer: startLayer, requirements: seedReqs });
      bodyReached[startLayer][seedBody.row][seedBody.col] = seedReqs;
    }
  }

  while (deque.length > 0) {
    const cell = deque.shift()!;
    const { row, col, layer, requirements } = cell;

    const existing = bodyReached[layer][row][col]!;
    if (existing.size < requirements.size) continue;

    for (const [r, c] of bodyTiles(row, col)) {
      recordBorderTransition(r, c, requirements, foundBorders, transitions, bounds);
    }

    for (const ent of entrancePositions) {
      const key = `entrance-${ent.idx}`;
      if (foundBorders.has(key)) continue;
      if (isNearEntrance(row + 1, col + 1, ent)) {
        foundBorders.add(key);
        transitions.push({ row: ent.row, col: ent.col, edge: 'entrance', requirements: [...requirements], entranceIdx: ent.idx });
      }
    }

    for (const [dr, dc] of DIRECTIONS) {
      const results = strategy.expand(cell, dr, dc, inventory, bounds);
      for (const result of results) {
        const existingReqs = bodyReached[result.layer][result.row][result.col];
        if (existingReqs !== null && existingReqs.size <= result.requirements.size) continue;

        bodyReached[result.layer][result.row][result.col] = result.requirements;
        const next = { row: result.row, col: result.col, layer: result.layer, requirements: result.requirements };
        if (result.requirements === requirements) deque.unshift(next);
        else deque.push(next);
      }
    }
  }

  const tileResult = strategy.buildTileResult(bodyReached, bounds, '');

  return {
    reachable: tileResult.reachable,
    transitions,
    reachableCount: tileResult.reachableCount,
    reqGrid: tileResult.reqGrid,
    hookTargets: tileResult.hookTargets,
    tileLayer: tileResult.tileLayer,
    reachableByLayer: tileResult.reachableByLayer,
    ledges: tileResult.ledges,
  };
};

export { runBFS };
