/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import type { JapaneseFont } from './japanese-font.type';
import { decodeGlyph11x16 } from './decode-glyph-11x16';
import { decompressGlyph } from './decompress-glyph';
import { encodeSheetGlyph } from './encode-sheet-glyph';
import {
  FONT_DATA_ADDR, FONT_MASK_ADDR, GLYPH_COUNT, GLYPH_HEIGHT, GLYPH_PIXELS, GLYPH_WIDTH, MASK_BYTES, SHEET_GLYPH_BYTES,
} from './japanese-font.constants';

const extractJapaneseFont = (rom: RomData): JapaneseFont => {
  const masks = new Uint8Array(rom.getBytes(FONT_MASK_ADDR, GLYPH_COUNT * MASK_BYTES));
  const data = new Uint8Array(rom.getBytes(FONT_DATA_ADDR, FONT_MASK_ADDR - FONT_DATA_ADDR));
  const pixels = new Uint8Array(GLYPH_COUNT * GLYPH_PIXELS);
  const sheet = new Uint8Array(GLYPH_COUNT * SHEET_GLYPH_BYTES);
  let read = 0;
  for (let glyph = 0; glyph < GLYPH_COUNT; glyph += 1) {
    const run = decompressGlyph(masks.subarray(glyph * MASK_BYTES, (glyph + 1) * MASK_BYTES), data, read);
    const glyphPixels = decodeGlyph11x16(run.bytes);
    pixels.set(glyphPixels, glyph * GLYPH_PIXELS);
    sheet.set(encodeSheetGlyph(glyphPixels), glyph * SHEET_GLYPH_BYTES);
    read = run.next;
  }
  if (read !== data.length) throw new Error(`extractJapaneseFont: glyph data used ${read} of ${data.length} bytes`);
  return {
    glyphCount: GLYPH_COUNT,
    width: GLYPH_WIDTH,
    height: GLYPH_HEIGHT,
    pixels,
    sheet,
    widths: new Uint8Array(GLYPH_COUNT).fill(GLYPH_WIDTH),
  };
};

export { extractJapaneseFont };
