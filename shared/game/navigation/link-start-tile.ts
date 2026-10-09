/* @layer shared-game @kind logic */
import type { GridPos } from './types';
import type { LinkStartTileArgs } from './link-start-tile.type';
import { GRID_SIZE } from './types';
import { HITBOX_SIZE_PX, HITBOX_TOP_OFFSET_PX, TILE_PX } from './link-start-tile.constants';

const clampToGrid = (v: number): number => Math.max(0, Math.min(GRID_SIZE - 1, v));

const linkStartTile = ({ linkX, linkY, screenWorldX, screenWorldY }: LinkStartTileArgs): GridPos => {
  const relPixelX = linkX - screenWorldX;
  const relPixelY = (linkY + HITBOX_TOP_OFFSET_PX) - screenWorldY;

  const tileMinCol = Math.floor(relPixelX / TILE_PX);
  const tileMaxCol = Math.floor((relPixelX + HITBOX_SIZE_PX - 1) / TILE_PX);
  const tileMinRow = Math.floor(relPixelY / TILE_PX);
  const tileMaxRow = Math.floor((relPixelY + HITBOX_SIZE_PX - 1) / TILE_PX);

  const centerCol = relPixelX / TILE_PX + 0.5;
  const centerRow = relPixelY / TILE_PX + 0.5;

  let best: GridPos | null = null;
  let bestD2 = Number.POSITIVE_INFINITY;
  for (let r = tileMinRow; r <= tileMaxRow; r++) {
    for (let c = tileMinCol; c <= tileMaxCol; c++) {
      const rr = clampToGrid(r);
      const cc = clampToGrid(c);
      const dr = rr - centerRow;
      const dc = cc - centerCol;
      const d2 = dr * dr + dc * dc;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = { row: rr, col: cc };
      }
    }
  }
  return best ?? { row: clampToGrid(Math.floor(centerRow)), col: clampToGrid(Math.floor(centerCol)) };
};

export { linkStartTile };
export type { LinkStartTileArgs } from './link-start-tile.type';
