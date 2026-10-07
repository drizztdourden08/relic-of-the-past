/* @layer shared-asset-extraction @kind logic */
/**
 * Background tile decoder. Cuts one 16x16 ground block from the map's own sheets.
 *
 * A map screen draws from eight compressed 3bpp background sheets of 64 tiles
 * each, loaded into VRAM in a fixed slot order. A tilemap entry is one 16-bit
 * word: bits 0-9 the tile number across all eight sheets (so `number >> 6` picks
 * the sheet), bits 10-12 the palette row, bit 14 a horizontal flip and bit 15 a
 * vertical one. Four of those words, in reading order, make the 16x16 block the
 * map is actually built from, which is exactly one ground tile.
 *
 * `upper` names the sheets whose 3bpp values were widened into the upper half of
 * their palette row; see bg-palettes.ts for why that split exists.
 */
import type { RomData } from '../rom/rom-types';
import type { RGBA } from '../graphics/palette';
import { decompress } from '../compression/lz-decompress';
import { kCompBgPtrs } from '../data/tables';
import { ImageBuffer } from '../graphics/png-writer';
import { dungeonBgPalette, overworldBgPalette, type BgPaletteRows } from './bg-palettes';

/** One authored ground block: its sheets, its four tilemap words, its palette. */
interface BgTileRequest {
  /** Background sheet ids in VRAM slot order. Index `n` backs tiles `n*64` on. */
  sheets: number[];
  /** Sheet indices whose pixel values land in the upper half of a palette row. */
  upper: number[];
  /** Four tilemap words: top-left, top-right, bottom-left, bottom-right. */
  tiles: number[];
  /** Outdoor palettes need a mode plus three auxiliary indices; indoor, one set. */
  paletteSet: 'overworld' | 'dungeon';
  paletteIndex: number;
  paletteAux: number[];
}

const TILE_BYTES = 24;
const TILES_PER_SHEET = 64;
const QUADRANTS: [number, number][] = [[0, 0], [8, 0], [0, 8], [8, 8]];

const loadSheet = (rom: RomData, id: number): Buffer =>
  decompress(kCompBgPtrs[id], (addr) => rom.getByte(addr), false);

/** One 8x8 tile as raw 3bpp pixel values (0-7); 0 means the backdrop shows. */
const decodeBgTile = (sheet: Buffer, index: number): Uint8Array => {
  const offset = index * TILE_BYTES;
  const pixels = new Uint8Array(64);
  for (let y = 0; y < 8; y += 1) {
    const d0 = sheet[offset + y * 2];
    const d1 = sheet[offset + y * 2 + 1];
    const d2 = sheet[offset + 16 + y];
    for (let x = 0; x < 8; x += 1) {
      const bit = 7 - x;
      pixels[y * 8 + x] =
        ((d0 >>> bit) & 1) | (((d1 >>> bit) & 1) << 1) | (((d2 >>> bit) & 1) << 2);
    }
  }
  return pixels;
};

const paletteFor = (rom: RomData, req: BgTileRequest): BgPaletteRows => {
  if (req.paletteSet === 'dungeon') return dungeonBgPalette(rom, req.paletteIndex);
  const [aux1 = 0, aux2 = 0, aux3 = 0] = req.paletteAux;
  return overworldBgPalette(rom, req.paletteIndex, aux1, aux2, aux3);
};

const pasteQuadrant = (
  img: ImageBuffer, pixels: Uint8Array, word: number, row: RGBA[], base: number, at: [number, number],
): void => {
  const flipX = (word & 0x4000) !== 0;
  const flipY = (word & 0x8000) !== 0;
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const value = pixels[(flipY ? 7 - y : y) * 8 + (flipX ? 7 - x : x)];
      if (value === 0) continue;
      img.putPixel(at[0] + x, at[1] + y, row[base + value]);
    }
  }
};

/** Compose the block. Returns null when a tile points outside the given sheets. */
const extractBgTile = (rom: RomData, req: BgTileRequest): ImageBuffer | null => {
  const palette = paletteFor(rom, req);
  const upper = new Set(req.upper);
  const sheets = new Map<number, Buffer>();
  const img = new ImageBuffer(16, 16);

  for (let q = 0; q < 4; q += 1) {
    const word = req.tiles[q];
    const number = word & 0x3ff;
    const slot = (number / TILES_PER_SHEET) | 0;
    if (req.sheets[slot] === undefined) return null;
    if (!sheets.has(slot)) sheets.set(slot, loadSheet(rom, req.sheets[slot]));
    const pixels = decodeBgTile(sheets.get(slot)!, number % TILES_PER_SHEET);
    const row = palette[(word >>> 10) & 7];
    pasteQuadrant(img, pixels, word, row, upper.has(slot) ? 8 : 0, QUADRANTS[q]);
  }
  return img;
};

export { decodeBgTile, extractBgTile };
export type { BgTileRequest };
