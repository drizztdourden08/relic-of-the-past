/* @layer shared-asset-extraction @kind constants */
const SLOT_SIDE = 16;
const TILE_BYTES = 32;
const SLOT_BYTES = 4 * TILE_BYTES;
const TILE_ORIGINS: readonly [number, number][] = [[0, 0], [8, 0], [0, 8], [8, 8]];

export { SLOT_BYTES, SLOT_SIDE, TILE_BYTES, TILE_ORIGINS };
