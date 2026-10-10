/* @layer shared-game @kind logic */
import type { GridPos, TilePassability, LedgeTraversal } from '@rotp/game-core';
import type { LedgeStep } from '../indoor-ledge-dirs.type';
import type { CliffScan } from './cliff-scan.type';
import { GRID_SIZE } from '../../types/grid.constants';
import { inBounds } from '../../core/in-bounds';
import { cellAt, itemAt } from '../../../checked-access';
import { computeIndoorLedgeDirs } from '../indoor-ledge-dirs';
import { HORIZ_LEDGE_ATTRS, VERT_LEDGE_ATTRS } from '../indoor-ledge-dirs.constants';
import {
  CLIFF_TRIGGER_ATTRS, INDOOR_CLIFF_DIRS, INDOOR_CLIFF_WALL, OUTDOOR_CLIFF_DIRS, OUTDOOR_CLIFF_WALL,
} from './cliff-preprocessing.constants';

const hasPairedTrigger = (scan: CliffScan, indoorDirs: Map<number, LedgeStep>, pos: GridPos, step: LedgeStep): boolean => {
  const { dr, dc, dir } = step;
  const [pr, pc] = dr !== 0 ? [0, 1] : [1, 0];
  const pairs = (r2: number, c2: number): boolean => {
    if (indoorDirs.get(r2 * GRID_SIZE + c2)?.dir !== dir) return false;
    const ar = r2 - dr, ac = c2 - dc;
    return inBounds(ar, ac) && !scan.cliffWall.has(cellAt(scan.rawAttr, ar, ac));
  };
  return pairs(pos.row - pr, pos.col - pc) || pairs(pos.row + pr, pos.col + pc);
};

const hasTwoWideBand = (scan: CliffScan, pos: GridPos, dr: number): boolean => {
  const { row, col } = pos;
  const banded = (r: number, c: number): boolean => {
    const attr = cellAt(scan.rawAttr, r, c);
    return CLIFF_TRIGGER_ATTRS.has(attr) || scan.cliffWall.has(attr);
  };
  if (dr !== 0) return (col > 0 && banded(row, col - 1)) || (col < GRID_SIZE - 1 && banded(row, col + 1));
  return (row > 0 && banded(row - 1, col)) || (row < GRID_SIZE - 1 && banded(row + 1, col));
};

const stepAt = (scan: CliffScan, pos: GridPos, attr: number): LedgeStep | null => {
  const { indoorDirs } = scan;
  if (indoorDirs && (HORIZ_LEDGE_ATTRS.has(attr) || VERT_LEDGE_ATTRS.has(attr))) {
    const step = indoorDirs.get(pos.row * GRID_SIZE + pos.col);
    if (step === undefined) throw new Error(`No indoor ledge direction for tile ${pos.row},${pos.col}`);
    return hasPairedTrigger(scan, indoorDirs, pos, step) ? step : null;
  }
  return scan.cliffDirs[attr] ?? null;
};

const markLedgeRun = (scan: CliffScan, pos: GridPos, step: LedgeStep): void => {
  const { grid, rawAttr, cliffWall, ledges } = scan;
  const { dr, dc, dir } = step;
  itemAt(grid, pos.row)[pos.col] = { type: 'ledge', dir };
  let r = pos.row + dr;
  let c = pos.col + dc;
  while (inBounds(r, c) && cliffWall.has(cellAt(rawAttr, r, c))) {
    itemAt(grid, r)[c] = { type: 'ledge', dir };
    r += dr;
    c += dc;
  }
  ledges.push({ startRow: pos.row, startCol: pos.col, endRow: r, endCol: c });
};

const scanTile = (scan: CliffScan, pos: GridPos): void => {
  const attr = cellAt(scan.rawAttr, pos.row, pos.col);
  if (!CLIFF_TRIGGER_ATTRS.has(attr)) return;
  const step = stepAt(scan, pos, attr);
  if (!step) return;
  if (!scan.isIndoors && !hasTwoWideBand(scan, pos, step.dr)) return;
  markLedgeRun(scan, pos, step);
};

const processStraightCliffs = (grid: TilePassability[][], rawAttr: number[][], ledges: LedgeTraversal[], isIndoors = false): void => {
  const cliffWall = isIndoors ? INDOOR_CLIFF_WALL : OUTDOOR_CLIFF_WALL;
  const scan: CliffScan = {
    grid, rawAttr, ledges, isIndoors, cliffWall,
    cliffDirs: isIndoors ? INDOOR_CLIFF_DIRS : OUTDOOR_CLIFF_DIRS,
    indoorDirs: isIndoors ? computeIndoorLedgeDirs(rawAttr, cliffWall) : null,
  };
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) scanTile(scan, { row, col });
  }
};

export { processStraightCliffs };
