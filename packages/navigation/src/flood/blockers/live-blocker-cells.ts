/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import { wasmGetViewportInfo, wasmGetLiveSprites } from '@rotp/game-core';
import { originContaining, overworldOrigin, tileInScreen } from '../world-origin';
import { BLOCKER_SPRITES, UNCLE_SPRITE } from './blockers.constants';
import { footprint } from './footprint';

const liveBlockerCells = (screenIndex: number, skipUncle: boolean): GridPos[] => {
  const vp = wasmGetViewportInfo();
  if (!vp) return [];
  const screenOrigin = overworldOrigin(screenIndex);
  const liveOrigin = originContaining(vp.linkX, vp.linkY);
  if (liveOrigin.x !== screenOrigin.x || liveOrigin.y !== screenOrigin.y) return [];
  const cells: GridPos[] = [];
  for (const s of wasmGetLiveSprites()) {
    if (!BLOCKER_SPRITES.has(s.type)) continue;
    if (s.type === UNCLE_SPRITE && skipUncle) continue;
    const spriteOrigin = originContaining(s.x, s.y);
    if (spriteOrigin.x !== screenOrigin.x || spriteOrigin.y !== screenOrigin.y) continue;
    const t = tileInScreen(s.x, s.y, screenOrigin);
    cells.push(...footprint(t.row, t.col));
  }
  return cells;
};

export { liveBlockerCells };
