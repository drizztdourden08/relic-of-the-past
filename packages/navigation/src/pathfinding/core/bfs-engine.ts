/* @layer shared-game @kind logic */
import type { GridPos, TilePassability, TransitionPoint } from '@rotp/game-core';
import type { LayerStrategy, BFSCell, BFSResult } from '../strategies/layer-strategy';
import type { BfsRequest, BfsSearch, EntrancePosition, ReachGrid } from './bfs-engine.type';
import { GRID_SIZE } from '../types/grid.constants';
import { bodyTiles } from '../strategies/body-tiles';
import { findStartBody } from '../strategies/find-start-body';
import { cellAt, itemAt } from '../../checked-access';
import { DIRECTIONS, ENTRANCE_REACH } from './grid.constants';

const newReachGrid = (): ReachGrid =>
  Array.from({ length: GRID_SIZE }, () => new Array<Set<string> | null>(GRID_SIZE).fill(null));

const bodyStartRequirements = (body: GridPos, grid: TilePassability[][], inventory: Set<string>): Set<string> => {
  const reqs = new Set<string>();
  for (const [r, c] of bodyTiles(body.row, body.col)) {
    const t = cellAt(grid, r, c);
    if (t.type === 'obstacle' && inventory.has(t.req)) reqs.add(t.req);
    if (t.type === 'water' && inventory.has('flippers')) reqs.add('flippers');
  }
  return reqs;
};

const isNearEntrance = (bodyCenterRow: number, bodyCenterCol: number, ent: EntrancePosition): boolean =>
  bodyCenterRow >= ent.row - ENTRANCE_REACH.before && bodyCenterRow <= ent.row + ENTRANCE_REACH.after
  && bodyCenterCol >= ent.col - ENTRANCE_REACH.before && bodyCenterCol <= ent.col + ENTRANCE_REACH.after;

const reachAt = (search: BfsSearch, cell: Omit<BFSCell, 'requirements'>): Set<string> | null =>
  cellAt(search.bodyReached[cell.layer], cell.row, cell.col);

const markReached = (search: BfsSearch, cell: BFSCell): void => {
  itemAt(search.bodyReached[cell.layer], cell.row)[cell.col] = cell.requirements;
};

const enqueueSeed = (search: BfsSearch, body: GridPos, layer: 0 | 1, grid: TilePassability[][]): void => {
  const cell: BFSCell = { row: body.row, col: body.col, layer, requirements: bodyStartRequirements(body, grid, search.request.inventory) };
  search.deque.push(cell);
  markReached(search, cell);
};

const seedSearch = (search: BfsSearch, layer: 0 | 1): void => {
  const { start, extraSeeds, inventory, bounds } = search.request;
  const grid = search.strategy.getGrid(layer);
  const startBody = findStartBody(start, grid, inventory, bounds);
  if (startBody) enqueueSeed(search, startBody, layer, grid);
  for (const seed of extraSeeds ?? []) {
    const seedBody = findStartBody(seed, grid, inventory, bounds);
    if (seedBody && reachAt(search, { ...seedBody, layer }) === null) enqueueSeed(search, seedBody, layer, grid);
  }
};

const recordTransition = (search: BfsSearch, key: string, transition: TransitionPoint): void => {
  if (search.foundBorders.has(key)) return;
  search.foundBorders.add(key);
  search.transitions.push(transition);
};

const recordBorderTransition = (search: BfsSearch, tile: GridPos, requirements: Set<string>): void => {
  const { row, col } = tile;
  const { minRow, maxRow, minCol, maxCol } = search.request.bounds;
  const record = (key: string, edge: TransitionPoint['edge']): void => {
    recordTransition(search, key, { row, col, edge, requirements: [...requirements] });
  };
  if (row === minRow) record(`north-${col}`, 'north');
  if (row === maxRow) record(`south-${col}`, 'south');
  if (col === minCol) record(`west-${row}`, 'west');
  if (col === maxCol) record(`east-${row}`, 'east');
};

const recordEntrances = (search: BfsSearch, cell: BFSCell): void => {
  const { row, col, requirements } = cell;
  for (const ent of search.request.entrancePositions) {
    const key = `entrance-${ent.idx}`;
    if (search.foundBorders.has(key) || !isNearEntrance(row + 1, col + 1, ent)) continue;
    recordTransition(search, key, { row: ent.row, col: ent.col, edge: 'entrance', requirements: [...requirements], entranceIdx: ent.idx });
  }
};

const relax = (search: BfsSearch, result: BFSCell, requirements: Set<string>): void => {
  const existingReqs = reachAt(search, result);
  if (existingReqs !== null && existingReqs.size <= result.requirements.size) return;
  const next: BFSCell = { row: result.row, col: result.col, layer: result.layer, requirements: result.requirements };
  markReached(search, next);
  if (result.requirements === requirements) search.deque.unshift(next);
  else search.deque.push(next);
};

const expandCell = (search: BfsSearch, cell: BFSCell): void => {
  const { inventory, bounds } = search.request;
  for (const step of DIRECTIONS) {
    for (const result of search.strategy.expand(cell, step, inventory, bounds)) relax(search, result, cell.requirements);
  }
};

const visitCell = (search: BfsSearch, cell: BFSCell): void => {
  const { row, col, layer, requirements } = cell;
  const existing = reachAt(search, cell);
  if (existing === null) throw new Error(`Queued cell ${row},${col} on layer ${layer} was never reached`);
  if (existing.size < requirements.size) return;
  for (const [r, c] of bodyTiles(row, col)) recordBorderTransition(search, { row: r, col: c }, requirements);
  recordEntrances(search, cell);
  expandCell(search, cell);
};

const runBFS = (strategy: LayerStrategy, request: BfsRequest): BFSResult => {
  const search: BfsSearch = {
    strategy, request,
    bodyReached: [newReachGrid(), newReachGrid()],
    deque: [], foundBorders: new Set<string>(), transitions: [],
  };
  seedSearch(search, strategy.findStartLayer());
  for (let cell = search.deque.shift(); cell !== undefined; cell = search.deque.shift()) visitCell(search, cell);

  const tileResult = strategy.buildTileResult(search.bodyReached, request.bounds, '');
  return {
    reachable: tileResult.reachable,
    transitions: search.transitions,
    reachableCount: tileResult.reachableCount,
    reqGrid: tileResult.reqGrid,
    hookTargets: tileResult.hookTargets,
    tileLayer: tileResult.tileLayer,
    reachableByLayer: tileResult.reachableByLayer,
    ledges: tileResult.ledges,
  };
};

export { runBFS };
