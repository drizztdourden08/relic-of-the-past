/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { decode3bppTile } from '../receipt-decoder/decode-3bpp-tile';
import type { SpriteSource } from '../sources';
import type { SpritePalettes } from '../receipt-palettes';
import { paletteRow } from '../receipt-palettes';

const extractFollowerBomb = (paletteIdx: number, spriteSource: SpriteSource, spritePalettes: SpritePalettes): ImageBuffer => {
  const data = spriteSource.readSheet('spr', 0x58);
  const source = data.subarray(0x300);
  const palette = paletteRow(spritePalettes, paletteIdx);
  const img = new ImageBuffer(16, 16);
  const placed: [number, number, number][] = [[6, 0, 0], [7, 8, 0], [22, 0, 8], [23, 8, 8]];
  for (const [tileId, x, y] of placed) {
    const tile = decode3bppTile(source, tileId * 24, palette, false);
    img.paste(tile, x, y);
  }
  return img;
};

export { extractFollowerBomb };
