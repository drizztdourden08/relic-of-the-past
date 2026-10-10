/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import { wasmGetIndoorUncleBlockers, wasmGetRoomSpriteSpawns, wasmGetViewportInfo } from '@rotp/game-core';
import { originContaining, tileInScreen } from '../world-origin';
import { BLOCKED_ATTR, UNCLE_SPRITE } from './blockers.constants';
import { uncleCollected } from './uncle-collected';
import { itemAt } from '../../checked-access';
import { footprint } from './footprint';

const uncleCells = (roomId: number, isLiveRoom: boolean): GridPos[] => {
  const cells: GridPos[] = [];
  const vp = isLiveRoom ? wasmGetViewportInfo() : null;
  if (vp) {
    const origin = originContaining(vp.linkX, vp.linkY);
    for (const b of wasmGetIndoorUncleBlockers()) {
      const t = tileInScreen(b.x, b.y, origin);
      cells.push(...footprint(t.row, t.col));
    }
    return cells;
  }
  for (const s of wasmGetRoomSpriteSpawns(roomId) ?? []) {
    if (s.spriteType === UNCLE_SPRITE) cells.push(...footprint(s.row, s.col));
  }
  return cells;
};

const stampIndoorBlockers = (roomId: number, grids: number[][][], isLiveRoom: boolean): void => {
  if (uncleCollected()) return;
  const cells = uncleCells(roomId, isLiveRoom);
  for (const grid of grids) {
    for (const { row, col } of cells) itemAt(grid, row)[col] = BLOCKED_ATTR;
  }
};

export { stampIndoorBlockers };
