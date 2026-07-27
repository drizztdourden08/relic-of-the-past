/* @layer bridge-wasm @kind logic */
/**
 * Resolves an overworld sprite's AREA-relative spawn coordinate to the screen
 * it actually sits on, and its local tile there. A large (2x2) overworld area
 * shares one sprite table across all four of its screens, and the game reports
 * every spawn's position relative to the area's HEAD screen — so a spawn on
 * the far half of the area carries a row or column past 63 instead of one
 * clipped to a single screen's 64x64 tile grid.
 */
import type { GridPos } from '@shared/game/navigation';

/** Tiles per overworld screen on either axis (the flood grid size). */
const SCREEN_TILE_SPAN = 64;

/** Overworld screens are laid out 8 per row. */
const SCREENS_PER_ROW = 8;

/**
 * Screens in one world (light or dark). The area-head table only covers this
 * many entries and is reused for the other world by masking off a screen
 * index's +64 offset before the lookup, then adding it back to the result.
 */
const WORLD_SCREEN_COUNT = 64;

/** The head screen an overworld screen's area is keyed under, from the game's
 *  own per-world area-head table (`wasmGetAreaHeads`). */
const areaHeadOf = (screenIndex: number, heads: Uint8Array): number => {
  const worldOffset = screenIndex - (screenIndex % WORLD_SCREEN_COUNT);
  return heads[screenIndex % WORLD_SCREEN_COUNT] + worldOffset;
};

/**
 * A row or column past 63 belongs to the screen one row down (`head + 8`) or
 * one column right (`head + 1`) — the only two offsets a 2x2 big area can
 * produce. `screenIndex` is whichever of the area's screens the sprite table
 * was queried through; `heads` is the game's area-head table.
 */
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
