/* @layer shared-asset-extraction @kind logic */
/**
 * The shop price symbols, in the game itself. A randomized shelf may charge arrows,
 * bombs, hearts or a bottled thing instead of rupees, and the price under the item
 * is bare digits: nothing says what it counts. The nine currency drawings
 * (art/currency-*.svg, the `art` sprites the manifest lists) are reduced to one fixed
 * sprite palette row and encoded as the two 4bpp tiles of a 16x8 strip, 64 B each,
 * 576 B in all, emitted beside the PNGs as `currency-symbols.4bpp`. The core lends
 * each shown symbol a tile row of the substituted-sprite pool and draws it beside
 * the digits with that row (core/game-hooks/shop_symbols.c).
 *
 * The row is 4: the only main sprite row whose colours are identical in both world
 * halves, so a price reads the same on either side of the mirror, and the row the
 * drawings were made from. Three of them are traced from the HUD counters (the
 * arrow, the bomb and the heart) and carry that palette's colours instead; those
 * snap to the nearest of the row like every other binary here, except the arrow's
 * grey, which has no grey to snap to and would come out green: it goes to white.
 * An 8 px wide drawing fills the left tile and leaves the right one blank; the core
 * reads the width off that.
 */
import type { RGBA } from '../graphics/palette';
import { ImageBuffer } from '../graphics/png-writer';
import { encodeIcon, quantizeIcon, SLOT_SIDE, TILE_BYTES } from './fixed-row-tiles';

const CURRENCY_SYMBOLS_FILE = 'currency-symbols.4bpp';

/**
 * The sprite palette row every symbol is quantized to. Mirrored by SYMBOL_PALETTE_ROW
 * in core/game-hooks/shop_symbols.c: change both together.
 */
const CURRENCY_SYMBOL_PALETTE_ROW = 4;

/**
 * The definition file names, in the order the binary holds them. Mirrored by the
 * symbol ids of core/game-hooks/shop_symbols.c: the first four are the currency tags,
 * the five bottled ones follow the bottle-slot values (3 red, 4 green, 5 blue,
 * 6 fairy, 7 bee).
 */
const CURRENCY_SYMBOL_FILES: readonly string[] = [
  'currency-rupee', 'currency-arrow', 'currency-bomb', 'currency-heart',
  'currency-red-potion', 'currency-green-potion', 'currency-blue-potion',
  'currency-fairy', 'currency-bee',
];

/** A strip: two tiles side by side. */
const STRIP_WIDTH = 16;
const STRIP_HEIGHT = 8;
const STRIP_BYTES = 2 * TILE_BYTES;

/**
 * The one colour the row cannot stand in for, and what it becomes before the snap:
 * the HUD's grey has no grey in the row and is nearest its light green, so it goes
 * to white, which keeps the arrow's fletching readable.
 */
const HUD_GREY: RGBA = [0xad, 0xad, 0xad, 255];
const WHITE: RGBA = [0xff, 0xff, 0xff, 255];

const sameColor = (a: RGBA, b: RGBA): boolean => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

/** The drawing in the top-left of a slot-sized frame, the substitution applied. */
const stripFrame = (picture: ImageBuffer): ImageBuffer => {
  const frame = new ImageBuffer(SLOT_SIDE, SLOT_SIDE);
  for (let y = 0; y < picture.height; y++) {
    for (let x = 0; x < picture.width; x++) {
      const pixel = picture.getPixel(x, y);
      if (pixel[3] === 0) continue;
      frame.putPixel(x, y, sameColor(pixel, HUD_GREY) ? WHITE : pixel);
    }
  }
  return frame;
};

const isStripSized = (picture: ImageBuffer): boolean =>
  picture.width <= STRIP_WIDTH && picture.height <= STRIP_HEIGHT;

/** One symbol's 64 B: the strip's left and right tile. */
const symbolBytes = (picture: ImageBuffer, row: readonly RGBA[]): Uint8Array =>
  encodeIcon(quantizeIcon(stripFrame(picture), row).indices).subarray(0, STRIP_BYTES);

/**
 * The 576 B file from the nine pictures (by file name) and the ROM's sprite palette
 * rows; null when one is missing or wider than 16 or taller than 8.
 */
const buildCurrencySymbolsFile = (
  pictures: ReadonlyMap<string, ImageBuffer>, paletteRows: readonly (readonly RGBA[])[],
): Uint8Array | null => {
  const out = new Uint8Array(STRIP_BYTES * CURRENCY_SYMBOL_FILES.length);
  const row = paletteRows[CURRENCY_SYMBOL_PALETTE_ROW];
  for (const [id, file] of CURRENCY_SYMBOL_FILES.entries()) {
    const picture = pictures.get(file);
    if (!picture || !isStripSized(picture)) return null;
    out.set(symbolBytes(picture, row), id * STRIP_BYTES);
  }
  return out;
};

export {
  buildCurrencySymbolsFile, CURRENCY_SYMBOL_FILES, CURRENCY_SYMBOL_PALETTE_ROW, CURRENCY_SYMBOLS_FILE,
  stripFrame,
};
