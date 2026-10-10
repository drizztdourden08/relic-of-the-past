/* @layer shared-game @kind logic */
import type { CollisionGrid, GridPos, LedgeTraversal } from '@rotp/game-core';
import type { PreparedScreen } from './screen-prep.type';
import { GRID_SIZE } from '../../types/grid.constants';
import { inBounds } from '../../core/in-bounds';
import { cellAt, itemAt } from '../../../checked-access';
import { buildCollisionGridFromRawAttr } from '../../screen-data/collision-grid';
import { processStraightCliffs, processDiagonalCliffs, processSouthCliffs } from '../../screen-data/cliff-preprocessing';
import { CLIFF_TRIGGER_ATTRS } from '../../screen-data/cliff-preprocessing/cliff-preprocessing.constants';
import { BLOCKER_OFFSETS, SOLID_ATTR } from './screen-prep.constants';

const stampBlockers = (grid: CollisionGrid, dynamicBlockers: GridPos[]): GridPos[] => {
  const cells: GridPos[] = [];
  const seen = new Set<string>();
  for (const b of dynamicBlockers) {
    for (const [dr, dc] of BLOCKER_OFFSETS) {
      const rr = b.row + dr;
      const cc = b.col + dc;
      if (!inBounds(rr, cc)) continue;
      itemAt(grid.rawAttr, rr)[cc] = SOLID_ATTR;
      itemAt(grid.tiles, rr)[cc] = { type: 'blocked' };
      const key = `${rr},${cc}`;
      if (seen.has(key)) continue;
      seen.add(key);
      cells.push({ row: rr, col: cc });
    }
  }
  return cells;
};

const freeCliffTriggers = (grid: CollisionGrid): void => {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (CLIFF_TRIGGER_ATTRS.has(cellAt(grid.rawAttr, r, c))) itemAt(grid.tiles, r)[c] = { type: 'free' };
    }
  }
};

const prepareScreen = (rawAttrGrid: number[][], indoors: boolean, dynamicBlockers?: GridPos[], skipCliffs = false): PreparedScreen => {
  const grid = buildCollisionGridFromRawAttr(rawAttrGrid, indoors);
  const dynamicBlockerCells = dynamicBlockers?.length ? stampBlockers(grid, dynamicBlockers) : [];

  const ledges: LedgeTraversal[] = [];
  if (!skipCliffs) {
    processStraightCliffs(grid.tiles, grid.rawAttr, ledges, indoors);
    processDiagonalCliffs(grid.tiles, grid.rawAttr, ledges);
    processSouthCliffs(grid.tiles, grid.rawAttr, ledges);
  } else {
    freeCliffTriggers(grid);
  }

  return { grid, ledges, dynamicBlockerCells };
};

export { prepareScreen };
