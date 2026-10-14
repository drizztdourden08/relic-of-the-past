/* @layer shared-asset-extraction @kind logic */
import { decompress } from '../../compression/lz-decompress';
import { ImageBuffer } from '../../graphics/png-writer';
import { dungeonBgPalette, overworldBgPalette } from '../bg-palettes';
import { decodeBgTile } from './decode-bg-tile';
import {
  FLIP_X_BIT, FLIP_Y_BIT, PALETTE_ROW_SHIFT, QUADRANTS, TILE_NUMBER_MASK, TILES_PER_SHEET,
} from './bg-tile-decoder.constants';
import type { RomData } from '../../rom/rom-types';
import { itemAt } from '../../checked-read';
import type { BgPaletteRows } from '../bg-palettes';
import type { BgQuadrant, BgTileRequest } from './bg-tile-decoder.type';
import { bgSheetAddress } from '../../data/bg-sheet-address';

const loadSheet = (rom: RomData, id: number): Buffer =>
  decompress(bgSheetAddress(id), (addr) => rom.getByte(addr), false);

const paletteFor = (rom: RomData, req: BgTileRequest): BgPaletteRows => {
  if (req.paletteSet === 'dungeon') return dungeonBgPalette(rom, req.paletteIndex);
  const [aux1 = 0, aux2 = 0, aux3 = 0] = req.paletteAux;
  return overworldBgPalette(rom, { mode: req.paletteIndex, aux1, aux2, aux3 });
};

const pasteQuadrant = (img: ImageBuffer, quadrant: BgQuadrant): void => {
  const { pixels, word, row, base, at } = quadrant;
  const flipX = (word & FLIP_X_BIT) !== 0;
  const flipY = (word & FLIP_Y_BIT) !== 0;
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const value = pixels[(flipY ? 7 - y : y) * 8 + (flipX ? 7 - x : x)] ?? 0;
      if (value === 0) continue;
      img.putPixel(at[0] + x, at[1] + y, itemAt(row, base + value, 'BG palette colour'));
    }
  }
};

const extractBgTile = (rom: RomData, req: BgTileRequest): ImageBuffer | null => {
  const palette = paletteFor(rom, req);
  const upper = new Set(req.upper);
  const sheets = new Map<number, Buffer>();
  const img = new ImageBuffer(16, 16);

  for (const [q, at] of QUADRANTS.entries()) {
    const word = itemAt(req.tiles, q, 'BG tile word');
    const number = word & TILE_NUMBER_MASK;
    const slot = (number / TILES_PER_SHEET) | 0;
    const sheetId = req.sheets[slot];
    if (sheetId === undefined) return null;
    const sheet = sheets.get(slot) ?? loadSheet(rom, sheetId);
    sheets.set(slot, sheet);
    const pixels = decodeBgTile(sheet, number % TILES_PER_SHEET);
    const row = itemAt(palette, (word >>> PALETTE_ROW_SHIFT) & 7, 'BG palette row');
    pasteQuadrant(img, { pixels, word, row, base: upper.has(slot) ? 8 : 0, at });
  }
  return img;
};

export { extractBgTile };
