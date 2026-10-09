/* @layer shared-asset-extraction @kind logic */
import { decompress } from '../../compression/lz-decompress';
import { kCompBgPtrs } from '../../data/tables';
import { ImageBuffer } from '../../graphics/png-writer';
import { dungeonBgPalette, overworldBgPalette } from '../bg-palettes';
import { decodeBgTile } from './decode-bg-tile';
import {
  FLIP_X_BIT, FLIP_Y_BIT, PALETTE_ROW_SHIFT, QUADRANTS, TILE_NUMBER_MASK, TILES_PER_SHEET,
} from './bg-tile-decoder.constants';
import type { RomData } from '../../rom/rom-types';
import type { RGBA } from '../../graphics/palette';
import type { BgPaletteRows } from '../bg-palettes';
import type { BgTileRequest } from './bg-tile-decoder.type';

const loadSheet = (rom: RomData, id: number): Buffer =>
  decompress(kCompBgPtrs[id], (addr) => rom.getByte(addr), false);

const paletteFor = (rom: RomData, req: BgTileRequest): BgPaletteRows => {
  if (req.paletteSet === 'dungeon') return dungeonBgPalette(rom, req.paletteIndex);
  const [aux1 = 0, aux2 = 0, aux3 = 0] = req.paletteAux;
  return overworldBgPalette(rom, req.paletteIndex, aux1, aux2, aux3);
};

const pasteQuadrant = (
  img: ImageBuffer, pixels: Uint8Array, word: number, row: RGBA[], base: number, at: [number, number],
): void => {
  const flipX = (word & FLIP_X_BIT) !== 0;
  const flipY = (word & FLIP_Y_BIT) !== 0;
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const value = pixels[(flipY ? 7 - y : y) * 8 + (flipX ? 7 - x : x)];
      if (value === 0) continue;
      img.putPixel(at[0] + x, at[1] + y, row[base + value]);
    }
  }
};

const extractBgTile = (rom: RomData, req: BgTileRequest): ImageBuffer | null => {
  const palette = paletteFor(rom, req);
  const upper = new Set(req.upper);
  const sheets = new Map<number, Buffer>();
  const img = new ImageBuffer(16, 16);

  for (let q = 0; q < 4; q += 1) {
    const word = req.tiles[q];
    const number = word & TILE_NUMBER_MASK;
    const slot = (number / TILES_PER_SHEET) | 0;
    if (req.sheets[slot] === undefined) return null;
    if (!sheets.has(slot)) sheets.set(slot, loadSheet(rom, req.sheets[slot]));
    const pixels = decodeBgTile(sheets.get(slot)!, number % TILES_PER_SHEET);
    const row = palette[(word >>> PALETTE_ROW_SHIFT) & 7];
    pasteQuadrant(img, pixels, word, row, upper.has(slot) ? 8 : 0, QUADRANTS[q]);
  }
  return img;
};

export { extractBgTile };
