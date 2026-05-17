/**
 * Receipt/chest-getter sprite decoder — extracts 3bpp item sprites
 * shown when Link receives items from chests or NPCs.
 *
 * Uses sheets 0x5A-0x5D (combined) and a decode table + OAM flags
 * to determine tile offset, palette, and size for each receipt item.
 */
import type { RomData } from '../rom/rom-types';
import type { RGBA } from '../graphics/palette';
import { snesToRgba, TRANSPARENT } from '../graphics/palette';
import { decompress } from '../compression/lz-decompress';
import { kCompSpritePtrs } from '../data/tables';
import {
  ADDR_SPRITE_PALETTE_MAIN, ADDR_SPRITE_PALETTE_AUX1,
  ADDR_SPRITE_PALETTE_AUX3, ADDR_SWORD_PALETTE,
  ADDR_SHIELD_PALETTE, ADDR_ARMOR_PALETTE,
} from '../data/constants';
import { ImageBuffer } from '../graphics/png-writer';

// ─── Decode tables from extract-item-sprites.py ───

const kDecodeTab = [
  0x9c0, 0x30, 0x60, 0x90, 0xc0, 0x300, 0x318, 0x330,
  0x348, 0x360, 0x378, 0x390, 0x930, 0x3f0, 0x420, 0x450,
  0x468, 0x600, 0x630, 0x660, 0x690, 0x6c0, 0x6f0, 0x720,
  0x750, 0x768, 0x900, 0x930, 0x960, 0x990, 0x9f0, 0,
  0xf0, 0xa20, 0xa50, 0x660, 0x600, 0x618, 0x630, 0x648,
  0x678, 0x6d8, 0x6a8, 0x708, 0x738, 0x768, 0x960, 0x900,
  0x3c0, 0x990, 0x9a8, 0x9c0, 0x9d8, 0xa08, 0xa38, 0x600, 0x630,
];

const kOamFlags = [
  5, 0xff, 5, 5, 5, 5, 5, 1, 2, 1, 1, 1, 2, 2, 2, 4,
  4, 4, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 4, 4, 2, 1,
  6, 1, 2, 1, 2, 2, 1, 2, 2, 4, 1, 1, 4, 2, 1, 4,
  2, 2, 4, 4, 4, 2, 1, 4, 1, 2, 2, 1, 2, 2, 1, 1,
  4, 4, 1, 2, 2, 4, 4, 4, 2, 5, 2, 1,
];

const kTab1 = [
  0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2,
  2, 2, 2, 0, 2, 0, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2,
  2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2,
  2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  2, 2, 0, 0, 2, 0, 2, 2, 2, 0, 2, 2,
];

export const kReceiveItemGfx = [
  6, 0x18, 0x18, 0x18, 0x2d, 0x20, 0x2e, 9, 9, 0xa, 8, 5, 0x10, 0xb, 0x2c, 0x1b,
  0x1a, 0x1c, 0x14, 0x19, 0xc, 7, 0x1d, 0x2f, 7, 0x15, 0x12, 0xd, 0xd, 0xe, 0x11, 0x17,
  0x28, 0x27, 4, 4, 0xf, 0x16, 3, 0x13, 1, 0x1e, 0x10, 0, 0, 0, 0, 0,
  0, 0x30, 0x22, 0x21, 0x24, 0x24, 0x24, 0x23, 0x23, 0x23, 0x29, 0x2a, 0x2c, 0x2b, 3, 3,
  0x34, 0x35, 0x31, 0x33, 2, 0x32, 0x36, 0x37, 0x2c, 6, 0xc, 0x38,
];

/** Sword/shield palette configurations for receipt ID → [swordType, shieldType] */
const PAL5_CONFIG: Record<number, [number, number]> = {
  0: [0, 0], 1: [1, 0], 2: [2, 0], 3: [3, 0],
  4: [0, 0], 5: [0, 1], 6: [0, 2], 73: [0, 0],
};

/**
 * Sprite palette state — loaded from ROM, mutated for per-sprite overrides.
 */
export interface SpritePalettes {
  palettes: RGBA[][];
}

/**
 * Load all sprite palettes from ROM.
 */
export function loadSpritePalettes(rom: RomData): SpritePalettes {
  const palettes: RGBA[][] = Array.from({ length: 8 }, () =>
    new Array(16).fill(TRANSPARENT) as RGBA[]
  );

  // Main sprite palettes (1-4): 4 × 15 colors
  const mainSpr = rom.getWords(ADDR_SPRITE_PALETTE_MAIN, 120);
  for (let p = 0; p < 4; p++) {
    for (let i = 0; i < 15; i++) {
      palettes[p + 1][i + 1] = snesToRgba(mainSpr[p * 15 + i]);
    }
  }

  // Auxiliary palette 1 (palettes 5, 6)
  const aux1 = rom.getWords(ADDR_SPRITE_PALETTE_AUX1, 168);
  for (const [sub, ai] of [[5, 0], [6, 7]] as const) {
    for (let i = 0; i < 7; i++) {
      palettes[sub][i + 1] = snesToRgba(aux1[ai * 7 + i]);
    }
  }

  // Palette 6 indices 9-15 (row 6 of kPalette_MiscSprite — light world outdoor default)
  for (let i = 0; i < 7; i++) {
    palettes[6][i + 9] = snesToRgba(aux1[6 * 7 + i]);
  }

  // Sword palette (palette 5, indices 9-11)
  const swordPal = rom.getWords(ADDR_SWORD_PALETTE, 12);
  for (let i = 0; i < 3; i++) {
    palettes[5][9 + i] = snesToRgba(swordPal[i]);
  }

  // Shield palette (palette 5, indices 12-15)
  const shieldPal = rom.getWords(ADDR_SHIELD_PALETTE, 12);
  for (let i = 0; i < 4; i++) {
    palettes[5][12 + i] = snesToRgba(shieldPal[i]);
  }

  // Auxiliary palette 3 (palette 0)
  const aux3 = rom.getWords(ADDR_SPRITE_PALETTE_AUX3, 84);
  for (let i = 0; i < 7; i++) {
    palettes[0][i + 1] = snesToRgba(aux3[i]);
  }

  // Palette 7 = Link's armor (Green Mail = armor 0)
  const armorPal = rom.getWords(ADDR_ARMOR_PALETTE, 15);
  for (let i = 0; i < 15; i++) {
    palettes[7][i + 1] = snesToRgba(armorPal[i]);
  }

  return { palettes };
}

/**
 * Build palette 5 with specific sword/shield type colors.
 */
export function buildPal5(rom: RomData, base: RGBA[], swordType: number, shieldType: number): RGBA[] {
  const pal = [...base];
  const swordPal = rom.getWords(ADDR_SWORD_PALETTE, 12);
  const shieldPal = rom.getWords(ADDR_SHIELD_PALETTE, 12);
  for (let i = 0; i < 3; i++) {
    pal[9 + i] = snesToRgba(swordPal[swordType * 3 + i]);
  }
  for (let i = 0; i < 4; i++) {
    pal[12 + i] = snesToRgba(shieldPal[shieldType * 4 + i]);
  }
  return pal;
}

/**
 * Load receipt sprite sheets (0x5A - 0x5D combined).
 */
export interface ReceiptSheets {
  base: Buffer;     // sheet 0x5A
  sheet5B: Buffer;  // sheet 0x5B
  sheet5C: Buffer;  // sheet 0x5C
  sheet5D: Buffer;  // sheet 0x5D
}

export function loadReceiptSheets(rom: RomData): ReceiptSheets {
  const getByte = (addr: number) => rom.getByte(addr);
  return {
    base: decompress(kCompSpritePtrs[0x5a], getByte, false),
    sheet5B: decompress(kCompSpritePtrs[0x5b], getByte, false),
    sheet5C: decompress(kCompSpritePtrs[0x5c], getByte, false),
    sheet5D: decompress(kCompSpritePtrs[0x5d], getByte, false),
  };
}

function getCombined(sheets: ReceiptSheets, gfxSheet: number): Buffer {
  let secondary: Buffer;
  if (gfxSheet === 0x23 || gfxSheet >= 0x37) {
    secondary = sheets.sheet5D;
  } else if (gfxSheet === 0x0c || gfxSheet >= 0x24) {
    secondary = sheets.sheet5C;
  } else {
    secondary = sheets.sheet5B;
  }
  return Buffer.concat([sheets.base, secondary]);
}

/**
 * Decode a single 8×8 tile from 3bpp format.
 */
function decode3bppTile(
  raw: Buffer,
  offset: number,
  palette: RGBA[],
  high: boolean,
): ImageBuffer {
  const img = new ImageBuffer(8, 8);
  for (let y = 0; y < 8; y++) {
    const d0 = raw[offset + y * 2];
    const d1 = raw[offset + y * 2 + 1];
    const d2 = raw[offset + 16 + y];
    for (let x = 0; x < 8; x++) {
      const bit = 7 - x;
      const px = ((d0 >>> bit) & 1) | (((d1 >>> bit) & 1) << 1) | (((d2 >>> bit) & 1) << 2);
      if (px === 0) continue;
      const ci = high ? px + 8 : px;
      img.putPixel(x, y, palette[ci]);
    }
  }
  return img;
}

/**
 * Extract a 16×16 receipt sprite (4 tiles in 2×2 grid).
 */
function extractReceipt16x16(raw: Buffer, offset: number, palette: RGBA[]): ImageBuffer {
  const img = new ImageBuffer(16, 16);
  const tl = decode3bppTile(raw, offset, palette, true);
  const tr = decode3bppTile(raw, offset + 0x18, palette, true);
  const bl = decode3bppTile(raw, offset + 0x180, palette, true);
  const br = decode3bppTile(raw, offset + 0x198, palette, true);
  img.paste(tl, 0, 0);
  img.paste(tr, 8, 0);
  img.paste(bl, 0, 8);
  img.paste(br, 8, 8);
  return img;
}

/**
 * Extract an 8×16 receipt sprite (2 tiles stacked, centered in 16×16).
 */
function extractReceipt8x16(raw: Buffer, offset: number, palette: RGBA[]): ImageBuffer {
  const img = new ImageBuffer(16, 16);
  const top = decode3bppTile(raw, offset, palette, true);
  const bot = decode3bppTile(raw, offset + 0x180, palette, true);
  img.paste(top, 4, 0);
  img.paste(bot, 4, 8);
  return img;
}

/**
 * Extract a receipt sprite by ID.
 */
export function extractReceipt(
  receiptId: number,
  rom: RomData,
  sheets: ReceiptSheets,
  spritePalettes: SpritePalettes,
): ImageBuffer | null {
  const gfx = kReceiveItemGfx[receiptId];
  if (gfx >= kDecodeTab.length) return null;

  const offset = kDecodeTab[gfx];
  let palIdx = kOamFlags[receiptId];
  if (palIdx === 0xff) palIdx = 5;

  // Get the working palette
  let palette = spritePalettes.palettes[palIdx];

  // Apply sword/shield override for palette 5
  if (palIdx === 5 && receiptId in PAL5_CONFIG) {
    const [sw, sh] = PAL5_CONFIG[receiptId];
    palette = buildPal5(rom, palette, sw, sh);
  }

  // Crystal (receipt 32) uses palette 6 with static blue gradient
  if (receiptId === 32) {
    palette = [...spritePalettes.palettes[6]];
    palette[9] = [255, 255, 255, 255];
    palette[10] = [90, 130, 220, 255];
    palette[11] = [50, 80, 180, 255];
    palette[12] = [140, 180, 255, 255];
    palette[13] = [20, 40, 100, 255];
    palette[14] = [70, 115, 200, 255];
    palette[15] = [40, 60, 150, 255];
  }

  const combined = getCombined(sheets, gfx);
  const isLarge = kTab1[receiptId] === 2;

  if (isLarge) {
    return extractReceipt16x16(combined, offset, palette);
  } else {
    return extractReceipt8x16(combined, offset, palette);
  }
}

/**
 * Extract a receipt sprite with a different palette (recolor variant).
 */
export function extractReceiptRecolor(
  receiptId: number,
  palIdx: number,
  rom: RomData,
  sheets: ReceiptSheets,
  spritePalettes: SpritePalettes,
): ImageBuffer | null {
  const gfx = kReceiveItemGfx[receiptId];
  if (gfx >= kDecodeTab.length) return null;

  const offset = kDecodeTab[gfx];
  const combined = getCombined(sheets, gfx);
  const palette = spritePalettes.palettes[palIdx];
  const isLarge = kTab1[receiptId] === 2;

  if (isLarge) {
    return extractReceipt16x16(combined, offset, palette);
  } else {
    return extractReceipt8x16(combined, offset, palette);
  }
}

// Re-export decode3bppTile for use by drop-decoder
export { decode3bppTile };
