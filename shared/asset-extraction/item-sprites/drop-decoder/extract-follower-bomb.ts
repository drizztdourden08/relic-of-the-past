/* @layer shared-asset-extraction @kind logic */
import { decompress } from '../../compression/lz-decompress';
import { kCompSpritePtrs } from '../../data/tables';
import { ImageBuffer } from '../../graphics/png-writer';
import { decode3bppTile } from '../receipt-decoder/decode-3bpp-tile';
import type { RomData } from '../../rom/rom-types';
import type { SpritePalettes } from '../receipt-palettes';

const extractFollowerBomb = (paletteIdx: number, rom: RomData, spritePalettes: SpritePalettes): ImageBuffer => {
  const data = decompress(kCompSpritePtrs[0x58], (addr) => rom.getByte(addr), false);
  const source = data.subarray(0x300);
  const palette = spritePalettes.palettes[paletteIdx];
  const img = new ImageBuffer(16, 16);
  const tiles = [6, 7, 22, 23];
  const pos: [number, number][] = [[0, 0], [8, 0], [0, 8], [8, 8]];
  for (let i = 0; i < 4; i++) {
    const off = tiles[i] * 24;
    const tile = decode3bppTile(source, off, palette, false);
    img.paste(tile, pos[i][0], pos[i][1]);
  }
  return img;
};

export { extractFollowerBomb };
