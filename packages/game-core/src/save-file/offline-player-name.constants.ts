/* @layer bridge-wasm @kind constants */
const NAME_OFFSET = 0x3d9;
const NAME_LENGTH = 6;
const FIRST_DIGIT_TILE = 0x76;
const DIGIT_TILE_SHIFT = 0x42;
const SPECIAL_TILE_CODES: ReadonlyMap<number, number> = new Map([
  [0x5f, 0x08],
  [0x60, 0x22],
  [0x61, 0x3e],
]);

export { NAME_OFFSET, NAME_LENGTH, FIRST_DIGIT_TILE, DIGIT_TILE_SHIFT, SPECIAL_TILE_CODES };
