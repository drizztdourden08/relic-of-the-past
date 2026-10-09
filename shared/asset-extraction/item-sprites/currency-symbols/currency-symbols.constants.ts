/* @layer shared-asset-extraction @kind constants */
import { TILE_BYTES } from '../fixed-row-tiles';
import type { RGBA } from '../../graphics/palette';

const CURRENCY_SYMBOLS_FILE = 'currency-symbols.4bpp';

const CURRENCY_SYMBOL_PALETTE_ROW = 4;

const CURRENCY_SYMBOL_FILES: readonly string[] = [
  'currency-rupee', 'currency-arrow', 'currency-bomb', 'currency-heart',
  'currency-red-potion', 'currency-green-potion', 'currency-blue-potion',
  'currency-fairy', 'currency-bee',
];

const STRIP_WIDTH = 16;
const STRIP_HEIGHT = 8;
const STRIP_BYTES = 2 * TILE_BYTES;

const HUD_GREY: RGBA = [0xad, 0xad, 0xad, 255];
const WHITE: RGBA = [0xff, 0xff, 0xff, 255];

export {
  CURRENCY_SYMBOL_FILES, CURRENCY_SYMBOL_PALETTE_ROW, CURRENCY_SYMBOLS_FILE,
  HUD_GREY, STRIP_BYTES, STRIP_HEIGHT, STRIP_WIDTH, WHITE,
};
