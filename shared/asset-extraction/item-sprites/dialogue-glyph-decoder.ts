/* @layer shared-asset-extraction @kind logic */
/**
 * Dialogue-font glyph decoder — cuts the picture characters out of the text font.
 *
 * The dialogue font is 256 tiles of 8x8 2bpp. One character is two stacked tiles
 * making 8x16; for character index `c`:
 *   topTile = (c >> 4) * 32 + (c & 15),  bottomTile = topTile + 16
 * (16 characters per row, each character row spanning two tile rows.)
 *
 * Colour is a deliberate reconstruction, NOT ROM data — see `GLYPH_RAMP`, which
 * is shared with anything else that redraws these characters so a cut file and a
 * live redraw cannot drift apart.
 */
import type { RomData } from '../rom/rom-types';
import { decode2bppTile } from '../graphics/bitplane-decoder';
import { kFontTypes, FONT_TILE_BYTES } from '../text/data/font-data';
import { GLYPH_RAMP } from '../text/data/glyph-ramp';
import { ImageBuffer } from '../graphics/png-writer';

/** One character is 8 wide by 16 tall (two stacked 8x8 tiles). */
const GLYPH_W = 8;
const GLYPH_H = 16;
/** 256 tiles pair up into 128 addressable characters. */
const MAX_GLYPH = 127;

/** The 2bpp glyph sheet of the ROM's own language, read once per extraction run. */
const loadDialogueFont = (rom: RomData): Buffer => {
  const source = kFontTypes[rom.language] ?? kFontTypes.us;
  return rom.getBytes(source.tileAddr, FONT_TILE_BYTES);
};

const paintTile = (img: ImageBuffer, font: Buffer, tileIndex: number, dx: number, dy: number): void => {
  const pixels = decode2bppTile(font, tileIndex * 16);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const value = pixels[y * 8 + x];
      if (value === 0) continue;
      img.putPixel(dx + x, dy + y, GLYPH_RAMP[value]);
    }
  }
};

/** Paint character `glyph` into `img` with its left edge at `dx`. */
const paintGlyph = (img: ImageBuffer, font: Buffer, glyph: number, dx: number): void => {
  if (!Number.isInteger(glyph) || glyph < 0 || glyph > MAX_GLYPH) {
    throw new Error(`Glyph index out of range (0-${MAX_GLYPH}): ${glyph}`);
  }
  const topTile = (glyph >> 4) * 32 + (glyph & 15);
  paintTile(img, font, topTile, dx, 0);
  paintTile(img, font, topTile + 16, dx, 8);
};

/**
 * Decode one picture character. `glyphRight` pairs a second character to its
 * right, for the pictures the font splits across two halves — the pair comes out
 * as a single 16x16 image instead of two 8x16 slivers.
 */
const extractDialogueGlyph = (glyph: number, glyphRight: number | undefined, font: Buffer): ImageBuffer => {
  const paired = glyphRight !== undefined;
  const img = new ImageBuffer(paired ? GLYPH_W * 2 : GLYPH_W, GLYPH_H);
  paintGlyph(img, font, glyph, 0);
  if (paired) paintGlyph(img, font, glyphRight, GLYPH_W);
  return img;
};

export { extractDialogueGlyph, loadDialogueFont, GLYPH_RAMP, MAX_GLYPH };
