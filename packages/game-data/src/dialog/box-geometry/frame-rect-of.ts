/* @layer shared-game @kind logic */
import type { GameRect } from './box-geometry.type';
import { BG3_TILEMAP_BASE, FRAME_COLS, FRAME_ROWS, TILE_PX, TILEMAP_COLS } from './box-geometry.constants';

const frameRectOf = (topleft: number): GameRect => {
  const index = topleft - BG3_TILEMAP_BASE;
  const col = index % TILEMAP_COLS;
  const row = Math.floor(index / TILEMAP_COLS);
  return { x: col * TILE_PX, y: row * TILE_PX, w: FRAME_COLS * TILE_PX, h: FRAME_ROWS * TILE_PX };
};

export { frameRectOf };
