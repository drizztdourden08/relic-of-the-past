/* @layer shared-asset-extraction @kind logic */
import { decompress } from '../../compression/lz-decompress';
import { ImageBuffer } from '../../graphics/png-writer';
import { decode3bppTile } from '../receipt-decoder/decode-3bpp-tile';
import type { RomData } from '../../rom/rom-types';
import type { SpritePalettes } from '../receipt-palettes';
import { spriteSheetAddress } from '../../data/sprite-sheet-address';
import { paletteRow } from '../receipt-palettes';

const extractFollowerBomb = (paletteIdx: number, rom: RomData, spritePalettes: SpritePalettes): ImageBuffer => {
  const data = decompress(spriteSheetAddress(0x58), (addr) => rom.getByte(addr), false);
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
