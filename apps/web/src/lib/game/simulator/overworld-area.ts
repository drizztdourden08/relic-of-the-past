/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@shared/game/navigation';
import { SCREEN_TILE_SPAN, SCREENS_PER_ROW, WORLD_SCREEN_COUNT } from './overworld-area.constants';

const areaHeadOf = (screenIndex: number, heads: Uint8Array): number => {
  const worldOffset = screenIndex - (screenIndex % WORLD_SCREEN_COUNT);
  return heads[screenIndex % WORLD_SCREEN_COUNT] + worldOffset;
};

const resolveAreaSprite = (
  screenIndex: number,
  tile: GridPos,
  heads: Uint8Array,
): { screenIndex: number; tile: GridPos } => {
  const head = areaHeadOf(screenIndex, heads);
  const rowOver = tile.row >= SCREEN_TILE_SPAN ? 1 : 0;
  const colOver = tile.col >= SCREEN_TILE_SPAN ? 1 : 0;
  return {
    screenIndex: head + rowOver * SCREENS_PER_ROW + colOver,
    tile: { row: tile.row - rowOver * SCREEN_TILE_SPAN, col: tile.col - colOver * SCREEN_TILE_SPAN },
  };
};

export { resolveAreaSprite };
