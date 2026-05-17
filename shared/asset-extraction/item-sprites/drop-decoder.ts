/**
 * Droppable sprite decoder — extracts 3bpp sprites for items dropped by enemies.
 *
 * Uses pre-loaded sprite sheets and lookup tables from the game ROM to decode
 * standard drop sprites, numbered sprites, rupees, big keys, shields, and bombs.
 */
import type { RomData } from '../rom/rom-types';
import type { RGBA } from '../graphics/palette';
import type { SpritePalettes, ReceiptSheets } from './receipt-decoder';
import { decode3bppTile, kReceiveItemGfx } from './receipt-decoder';
import { decompress } from '../compression/lz-decompress';
import { kCompSpritePtrs } from '../data/tables';
import { ImageBuffer } from '../graphics/png-writer';

// ─── Sprite lookup tables from extract-item-sprites.py ───

const kTab1Sprite = [
  200, 0, 107, 0, 0, 0, 0, 0, 0, 203, 0, 8, 10, 11, 0, 0,
  13, 0, 0, 86, 0, 0, 15, 17, 0, 19, 0, 0, 0, 0, 20, 0,
  21, 27, 0, 42, 42, 248, 0, 182, 0, 0, 0, 170, 0, 0, 28, 0,
  0, 0, 0, 0, 0, 0, 0, 243, 243, 0, 187, 39, 0, 0, 66, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 63, 0, 0, 0, 64, 64,
  68, 0, 0, 0, 0, 71, 70, 0, 0, 72, 74, 101, 101, 0, 0, 0,
  0, 0, 143, 0, 0, 76, 78, 78, 78, 78, 0, 48, 36, 50, 56, 60,
  129, 0, 82, 0, 0, 0, 0, 0, 0, 92, 0, 98, 94, 0, 0, 0,
  101, 102, 0, 0, 0, 0, 110, 14, 0, 59, 66, 0, 0, 117, 120, 123,
  0, 0, 207, 0, 132, 141, 141, 141, 141, 0, 148, 117, 160, 0, 0, 162,
  166, 0, 0, 0, 177, 0, 181, 0, 189, 0, 0, 0, 105, 0, 0, 0,
  0, 0, 92, 0, 214, 230, 0, 0, 0, 219, 218, 233, 0, 0, 190, 192,
  106, 0, 249, 215, 0, 0, 0, 216, 0, 0, 222, 227, 0, 0, 0, 235,
  0, 0, 0, 0, 0, 0, 244, 244, 29, 31, 31, 31, 32, 32, 32, 33,
  34, 35, 35, 37, 40, 106, 246, 41, 0, 0, 205, 206,
];

const kTab2Sprite = [
  0xa0, 0xa2, 0xa0, 0xa2, 0x80, 0x82, 0x80, 0x82, 0xea, 0xec, 0x84, 0x4e, 0x61, 0xbd, 0x8c, 0x20,
  0x22, 0xc0, 0xc2, 0xe6, 0xe4, 0x82, 0xaa, 0x84, 0xac, 0x80, 0xa0, 0xca, 0xaf, 0x29, 0x39, 0xb,
  0x6e, 0x60, 0x62, 0x63, 0x4c, 0xea, 0xec, 0x24, 0x6b, 0x24, 0x22, 0x24, 0x26, 0x20, 0x30, 0x21,
  0x2a, 0x24, 0x86, 0x88, 0x8a, 0x8c, 0x8e, 0xa2, 0xa4, 0xa6, 0xa8, 0xaa, 0x84, 0x80, 0x82, 0x6e,
  0x40, 0x42, 0xe6, 0xe8, 0x80, 0x82, 0xc8, 0x8d, 0xe3, 0xe5, 0xc5, 0xe1, 4, 0x24, 0xe, 0x2e,
  0xc, 0xa, 0x9c, 0xc7, 0xb6, 0xb7, 0x60, 0x62, 0x64, 0x66, 0x68, 0x6a, 0xe4, 0xf4, 2, 2,
  0, 4, 0xc6, 0xcc, 0xce, 0x28, 0x84, 0x82, 0x80, 0xe5, 0x24, 0, 2, 4, 0xa0, 0xaa,
  0xa4, 0xa6, 0xac, 0xa2, 0xa8, 0xa6, 0x88, 0x86, 0x8e, 0xae, 0x8a, 0x42, 0x44, 0x42, 0x44, 0x64,
  0x66, 0xcc, 0xcc, 0xca, 0x87, 0x97, 0x8e, 0xae, 0xac, 0x8c, 0x8e, 0xaa, 0xac, 0xd2, 0xf3, 0x84,
  0xa2, 0x84, 0xa4, 0xe7, 0x8a, 0xa8, 0x8a, 0xa8, 0x88, 0xa0, 0xa4, 0xa2, 0xa6, 0xa6, 0xa6, 0xa6,
  0x7e, 0x7f, 0x8a, 0x88, 0x8c, 0xa6, 0x86, 0x8e, 0xac, 0x86, 0xbb, 0xac, 0xa9, 0xb9, 0xaa, 0xba,
  0xbc, 0x8a, 0x8e, 0x8a, 0x86, 0xa, 0xc2, 0xc4, 0xe2, 0xe4, 0xc6, 0xea, 0xec, 0xff, 0xe6, 0xc6,
  0xcc, 0xec, 0xce, 0xee, 0x4c, 0x6c, 0x4e, 0x6e, 0xc8, 0xc4, 0xc6, 0x88, 0x8c, 0x24, 0xe0, 0xae,
  0xc0, 0xc8, 0xc4, 0xc6, 0xe2, 0xe0, 0xee, 0xae, 0xa0, 0x80, 0xee, 0xc0, 0xc2, 0xbf, 0x8c, 0xaa,
  0x86, 0xa8, 0xa6, 0x2c, 0x28, 6, 0xdf, 0xcf, 0xa9, 0x46, 0x46, 0xea, 0xc0, 0xc2, 0xe0, 0xe8,
  0xe2, 0xe6, 0xe4, 0xb, 0x8e, 0xa0, 0xec, 0xea, 0xe9, 0x48, 0x58,
];

const kAbsTab1 = [0, 1, 1, 1, 2, 2, 2, 0, 1, 1, 2, 2, 1, 2, 2];
const kAbsTab2 = [0, 0, 0, 0, 1, 2, 3, 0, 0, 4, 5, 0, 0, 0, 0, 2, 4, 6, 2];

const kNumChar = [0x6e, 0x6e, 0x68, 0x6e, 0x6e, 0x78, 0x6e, 0x6e, 0x79,
  0x63, 0x73, 0x69, 0x63, 0x73, 0x6a, 0x63, 0x73, 0x73];
const kNumExt = [2, 2, 0, 2, 2, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const kNumX = [0, 0, 8, 0, 0, 8, 0, 0, 8, 0, 0, 2, 0, 0, 2, 0, 0, 0];
const kNumY = [0, 0, 8, 0, 0, 8, 0, 0, 8, 0, 8, 8, 0, 8, 8, 0, 8, 8];

// Decode table for receipt (reused by drop-bigkey)
const kDecodeTab = [
  0x9c0, 0x30, 0x60, 0x90, 0xc0, 0x300, 0x318, 0x330,
  0x348, 0x360, 0x378, 0x390, 0x930, 0x3f0, 0x420, 0x450,
  0x468, 0x600, 0x630, 0x660, 0x690, 0x6c0, 0x6f0, 0x720,
  0x750, 0x768, 0x900, 0x930, 0x960, 0x990, 0x9f0, 0,
  0xf0, 0xa20, 0xa50, 0x660, 0x600, 0x618, 0x630, 0x648,
  0x678, 0x6d8, 0x6a8, 0x708, 0x738, 0x768, 0x960, 0x900,
  0x3c0, 0x990, 0x9a8, 0x9c0, 0x9d8, 0xa08, 0xa38, 0x600, 0x630,
];

/**
 * Loaded sprite sheet cache for drop sprites.
 */
export interface DropSheets {
  sheets: Map<number, Buffer>;
  sheet96: Buffer;
}

/**
 * Load sprite sheets needed for drop sprite extraction.
 */
export function loadDropSheets(rom: RomData): DropSheets {
  const getByte = (addr: number) => rom.getByte(addr);
  const sheetIds = [0, 6, 7, 10, 27];
  const sheets = new Map<number, Buffer>();

  for (const si of sheetIds) {
    if (si < 12) {
      // Uncompressed sheets (0x600 bytes each)
      sheets.set(si, rom.getBytes(kCompSpritePtrs[si], 0x600));
    } else {
      sheets.set(si, decompress(kCompSpritePtrs[si], getByte, false));
    }
  }

  const sheet96 = decompress(kCompSpritePtrs[96], getByte, false);

  return { sheets, sheet96 };
}

function getSheetForChar(charId: number, dropSheets: DropSheets): { sheet: Buffer; offset: number; high: boolean } {
  const slot = charId >>> 6;
  const tile = charId & 0x3f;
  const offset = tile * 24;

  let sheetId: number;
  let high: boolean;

  if (slot === 0) {
    sheetId = 0; high = true;
  } else if (slot === 1) {
    sheetId = 10; high = true;
  } else if (slot === 2) {
    sheetId = 6; high = false;
  } else {
    sheetId = 7; high = false;
  }

  return { sheet: dropSheets.sheets.get(sheetId)!, offset, high };
}

function extractSmallCentered(charId: number, palette: RGBA[], dropSheets: DropSheets): ImageBuffer {
  const { sheet, offset, high } = getSheetForChar(charId, dropSheets);
  const img = new ImageBuffer(16, 16);
  const tile = decode3bppTile(sheet, offset, palette, high);
  img.paste(tile, 4, 4);
  return img;
}

function extractLarge(charId: number, palette: RGBA[], dropSheets: DropSheets): ImageBuffer {
  const img = new ImageBuffer(16, 16);
  const chars = [charId, charId + 1, charId + 16, charId + 17];
  const pos: [number, number][] = [[0, 0], [8, 0], [0, 8], [8, 8]];
  for (let i = 0; i < 4; i++) {
    const { sheet, offset, high } = getSheetForChar(chars[i] & 0xff, dropSheets);
    if (offset + 24 <= sheet.length) {
      const t = decode3bppTile(sheet, offset, palette, high);
      img.paste(t, pos[i][0], pos[i][1]);
    }
  }
  return img;
}

function extractTall(charId: number, palette: RGBA[], dropSheets: DropSheets): ImageBuffer {
  const img = new ImageBuffer(16, 16);
  const { sheet: s1, offset: o1, high: h1 } = getSheetForChar(charId & 0xff, dropSheets);
  if (o1 + 24 <= s1.length) {
    const t = decode3bppTile(s1, o1, palette, h1);
    img.paste(t, 4, 0);
  }
  const bc = (charId + 0x10) & 0xff;
  const { sheet: s2, offset: o2, high: h2 } = getSheetForChar(bc, dropSheets);
  if (o2 + 24 <= s2.length) {
    const t = decode3bppTile(s2, o2, palette, h2);
    img.paste(t, 4, 8);
  }
  return img;
}

/**
 * Extract a standard drop sprite by sprite type.
 */
export function extractDropStandard(
  spriteType: number,
  paletteIdx: number,
  spritePalettes: SpritePalettes,
  dropSheets: DropSheets,
): ImageBuffer {
  const idx = spriteType - 0xd8;
  const base = kTab1Sprite[spriteType];
  const cid = kTab2Sprite[base];
  const dm = idx < kAbsTab1.length ? kAbsTab1[idx] : 2;
  const palette = spritePalettes.palettes[paletteIdx];

  if (dm === 0) return extractSmallCentered(cid, palette, dropSheets);
  if (dm === 1) return extractTall(cid, palette, dropSheets);
  return extractLarge(cid, palette, dropSheets);
}

/**
 * Extract a numbered drop sprite (e.g., bomb count, arrow count).
 */
export function extractDropNumbered(
  _spriteType: number,
  paletteIdx: number,
  group: number,
  spritePalettes: SpritePalettes,
  dropSheets: DropSheets,
): ImageBuffer {
  const a = (group - 1) * 3;
  const palette = spritePalettes.palettes[paletteIdx];
  const img = new ImageBuffer(16, 16);

  for (let j = 0; j < 3; j++) {
    const ii = a + j;
    const cid = kNumChar[ii];
    const ext = kNumExt[ii];
    const x = kNumX[ii];
    const y = kNumY[ii];
    if (ext === 2) {
      const tileImg = extractLarge(cid, palette, dropSheets);
      img.paste(tileImg, x, y);
    } else {
      const { sheet, offset, high } = getSheetForChar(cid, dropSheets);
      if (offset + 24 <= sheet.length) {
        const t = decode3bppTile(sheet, offset, palette, high);
        img.paste(t, x, y);
      }
    }
  }
  return img;
}

/**
 * Extract a rupee drop sprite from sheet 96.
 */
export function extractDropRupee(
  paletteIdx: number,
  spritePalettes: SpritePalettes,
  dropSheets: DropSheets,
): ImageBuffer {
  const palette = spritePalettes.palettes[paletteIdx];
  const img = new ImageBuffer(16, 16);
  const top = decode3bppTile(dropSheets.sheet96, 0, palette, true);
  const bot = decode3bppTile(dropSheets.sheet96, 0x180, palette, true);
  img.paste(top, 4, 0);
  img.paste(bot, 4, 8);
  return img;
}

/**
 * Extract a big key drop sprite.
 */
export function extractDropBigkey(
  paletteIdx: number,
  spritePalettes: SpritePalettes,
  receiptSheets: ReceiptSheets,
): ImageBuffer {
  const palette = spritePalettes.palettes[paletteIdx];
  // get_combined(0x22): gfxSheet=0x22 < 0x23, not 0x0c → uses sheet5B
  const combined = Buffer.concat([receiptSheets.base, receiptSheets.sheet5B]);
  const offset = kDecodeTab[0x22];
  // 16×16 extraction
  const img = new ImageBuffer(16, 16);
  const tl = decode3bppTile(combined, offset, palette, true);
  const tr = decode3bppTile(combined, offset + 0x18, palette, true);
  const bl = decode3bppTile(combined, offset + 0x180, palette, true);
  const br = decode3bppTile(combined, offset + 0x198, palette, true);
  img.paste(tl, 0, 0);
  img.paste(tr, 8, 0);
  img.paste(bl, 0, 8);
  img.paste(br, 8, 8);
  return img;
}

/**
 * Extract a fighter's shield drop sprite (tall/2-tile from specific sheet).
 */
export function extractDropShieldFighters(
  sheetId: number,
  tileIds: number[],
  paletteIdx: number,
  spritePalettes: SpritePalettes,
  dropSheets: DropSheets,
): ImageBuffer {
  const sheet = dropSheets.sheets.get(sheetId)!;
  const palette = spritePalettes.palettes[paletteIdx];
  const img = new ImageBuffer(16, 16);
  const top = decode3bppTile(sheet, tileIds[0] * 24, palette, false);
  const bot = decode3bppTile(sheet, tileIds[1] * 24, palette, false);
  img.paste(top, 4, 0);
  img.paste(bot, 4, 8);
  return img;
}

/**
 * Extract a fire shield drop sprite (16×16 from 4 tiles).
 */
export function extractDropShieldFire(
  sheetId: number,
  tileIds: number[],
  paletteIdx: number,
  spritePalettes: SpritePalettes,
  dropSheets: DropSheets,
): ImageBuffer {
  const sheet = dropSheets.sheets.get(sheetId)!;
  const palette = spritePalettes.palettes[paletteIdx];
  const img = new ImageBuffer(16, 16);
  const pos: [number, number][] = [[0, 0], [8, 0], [0, 8], [8, 8]];
  for (let i = 0; i < tileIds.length; i++) {
    const tile = decode3bppTile(sheet, tileIds[i] * 24, palette, false);
    img.paste(tile, pos[i][0], pos[i][1]);
  }
  return img;
}

/**
 * Extract the Super Bomb follower sprite.
 */
export function extractFollowerBomb(
  paletteIdx: number,
  rom: RomData,
  spritePalettes: SpritePalettes,
): ImageBuffer {
  const data = decompress(kCompSpritePtrs[0x58], (addr) => rom.getByte(addr), false);
  const source = data.subarray(0x300); // offset into sheet 88 for super bomb
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
}
