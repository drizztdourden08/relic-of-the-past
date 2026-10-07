/* @layer shared-asset-extraction @kind logic */
/**
 * Decodes the 3bpp item sprites shown when the player receives an item. This module loads
 * the sheets and decodes tiles. Decode tables live in receipt-tables.ts, palette loading in
 * receipt-palettes.ts.
 */
import type { RomData } from '../rom/rom-types';
import type { RGBA } from '../graphics/palette';
import { decompress } from '../compression/lz-decompress';
import { kCompSpritePtrs } from '../data/tables';
import { ImageBuffer } from '../graphics/png-writer';
import { kDecodeTab, kOamFlags, kTab1, kReceiveItemGfx, PAL5_CONFIG } from './receipt-tables';
import { loadSpritePalettes, buildPal5 } from './receipt-palettes';
import type { SpritePalettes } from './receipt-palettes';

/** Load receipt sprite sheets (0x5A - 0x5D combined). */
interface ReceiptSheets {
  base: Buffer;     // sheet 0x5A
  sheet5B: Buffer;  // sheet 0x5B
  sheet5C: Buffer;  // sheet 0x5C
  sheet5D: Buffer;  // sheet 0x5D
}

const loadReceiptSheets = (rom: RomData): ReceiptSheets => {
  const getByte = (addr: number) => rom.getByte(addr);
  return {
    base: decompress(kCompSpritePtrs[0x5a], getByte, false),
    sheet5B: decompress(kCompSpritePtrs[0x5b], getByte, false),
    sheet5C: decompress(kCompSpritePtrs[0x5c], getByte, false),
    sheet5D: decompress(kCompSpritePtrs[0x5d], getByte, false),
  };
};

const getCombined = (sheets: ReceiptSheets, gfxSheet: number): Buffer => {
  let secondary: Buffer;
  if (gfxSheet === 0x23 || gfxSheet >= 0x37) {
    secondary = sheets.sheet5D;
  } else if (gfxSheet === 0x0c || gfxSheet >= 0x24) {
    secondary = sheets.sheet5C;
  } else {
    secondary = sheets.sheet5B;
  }
  return Buffer.concat([sheets.base, secondary]);
};

const decode3bppTile = (raw: Buffer, offset: number, palette: RGBA[], high: boolean): ImageBuffer => {
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
};

const extractReceipt16x16 = (raw: Buffer, offset: number, palette: RGBA[]): ImageBuffer => {
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
};

const extractReceipt8x16 = (raw: Buffer, offset: number, palette: RGBA[]): ImageBuffer => {
  const img = new ImageBuffer(16, 16);
  const top = decode3bppTile(raw, offset, palette, true);
  const bot = decode3bppTile(raw, offset + 0x180, palette, true);
  img.paste(top, 4, 0);
  img.paste(bot, 4, 8);
  return img;
};

const extractReceipt = (receiptId: number, rom: RomData, sheets: ReceiptSheets, spritePalettes: SpritePalettes): ImageBuffer | null => {
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
};

const extractReceiptRecolor = (receiptId: number, palIdx: number, rom: RomData, sheets: ReceiptSheets, spritePalettes: SpritePalettes): ImageBuffer | null => {
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
};

export {
  buildPal5,
  decode3bppTile,
  extractReceipt,
  extractReceiptRecolor,
  kReceiveItemGfx,
  loadReceiptSheets,
  loadSpritePalettes,
};
export type { ReceiptSheets, SpritePalettes };
