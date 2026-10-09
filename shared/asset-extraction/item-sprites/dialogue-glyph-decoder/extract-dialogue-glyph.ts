/* @layer shared-asset-extraction @kind logic */
import { decode2bppTile } from '../../graphics/bitplane-decoder';
import { GLYPH_RAMP } from '../../text/data/glyph-ramp';
import { ImageBuffer } from '../../graphics/png-writer';
import { GLYPH_H, GLYPH_W, MAX_GLYPH } from './dialogue-glyph-decoder.constants';

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

const paintGlyph = (img: ImageBuffer, font: Buffer, glyph: number, dx: number): void => {
  if (!Number.isInteger(glyph) || glyph < 0 || glyph > MAX_GLYPH) {
    throw new Error(`Glyph index out of range (0-${MAX_GLYPH}): ${glyph}`);
  }
  const topTile = (glyph >> 4) * 32 + (glyph & 15);
  paintTile(img, font, topTile, dx, 0);
  paintTile(img, font, topTile + 16, dx, 8);
};

const extractDialogueGlyph = (glyph: number, glyphRight: number | undefined, font: Buffer): ImageBuffer => {
  const paired = glyphRight !== undefined;
  const img = new ImageBuffer(paired ? GLYPH_W * 2 : GLYPH_W, GLYPH_H);
  paintGlyph(img, font, glyph, 0);
  if (paired) paintGlyph(img, font, glyphRight, GLYPH_W);
  return img;
};

export { extractDialogueGlyph };
