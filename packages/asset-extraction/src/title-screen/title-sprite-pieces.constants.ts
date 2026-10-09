/* @layer shared-asset-extraction @kind constants */
import type { SpritePiece } from './title-tables.type';
import { SWORD_CHARS, SWORD_REST_Y, SWORD_X, SWORD_Y, TRIFORCE_GRID, TRIFORCE_PIECES_AT } from './title-tables';

const SPRITE_SIZE = 16;

const TRIFORCE_GRID_SPAN = 48;

const SWORD_Y_ORIGIN = 8;

const TITLE_SWORD_PIECES: readonly SpritePiece[] = SWORD_CHARS.map((char, i) => ({
  char, x: SWORD_X[i], y: SWORD_REST_Y + SWORD_Y[i] - SWORD_Y_ORIGIN,
}));

const TITLE_TRIFORCE_PIECES: readonly SpritePiece[] = TRIFORCE_PIECES_AT.flatMap(({ x, y, flipX }) =>
  TRIFORCE_GRID.flatMap((row, r) => row.map((char, c) => ({
    char,
    x: x + (flipX ? TRIFORCE_GRID_SPAN - c * SPRITE_SIZE : c * SPRITE_SIZE),
    y: y + r * SPRITE_SIZE,
    flipX,
  }))));

export { TITLE_SWORD_PIECES, TITLE_TRIFORCE_PIECES };
