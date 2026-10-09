/* @layer shared-game @kind constants */
const ROWS = 16;
const COLUMNS = 8;
const TILE_BYTES = 16;
const PALETTE_ENTRY_OF_PIXEL: Readonly<Record<string, number>> = { ' ': 0, '.': 1, '#': 2 };

export { COLUMNS, PALETTE_ENTRY_OF_PIXEL, ROWS, TILE_BYTES };
