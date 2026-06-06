/**
 * Droppable sprite decoder — orchestrates extraction of item drop sprites.
 *
 * Uses pre-loaded sprite sheets and lookup tables from the game ROM to decode
 * standard drop sprites, numbered sprites, rupees, big keys, shields, and bombs.
 */
import type { RomData } from '../rom/rom-types';
import type { RGBA } from '../graphics/palette';
import type { SpritePalettes, ReceiptSheets } from './receipt-decoder';
import type { DropSheets } from './drop-sprite-assembly';
import { decode3bppTile } from './receipt-decoder';
import { decompress } from '../compression/lz-decompress';
import { kCompSpritePtrs } from '../data/tables';
import { ImageBuffer } from '../graphics/png-writer';
import { loadDropSheets, getSheetForChar, extractSmallCentered, extractLarge, extractTall } from './drop-sprite-assembly';
import {
  kTab1Sprite, kTab2Sprite, kAbsTab1,
  kNumChar, kNumExt, kNumX, kNumY, kDecodeTab,
} from './drop-tables';

const extractDropStandard = (spriteType: number, paletteIdx: number, spritePalettes: SpritePalettes, dropSheets: DropSheets): ImageBuffer => {
  const idx = spriteType - 0xd8;
  const base = kTab1Sprite[spriteType];
  const cid = kTab2Sprite[base];
  const dm = idx < kAbsTab1.length ? kAbsTab1[idx] : 2;
  const palette = spritePalettes.palettes[paletteIdx];

  if (dm === 0) return extractSmallCentered(cid, palette, dropSheets);
  if (dm === 1) return extractTall(cid, palette, dropSheets);
  return extractLarge(cid, palette, dropSheets);
};

const extractDropNumbered = (_spriteType: number, paletteIdx: number, group: number, spritePalettes: SpritePalettes, dropSheets: DropSheets): ImageBuffer => {
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
};

const extractDropRupee = (paletteIdx: number, spritePalettes: SpritePalettes, dropSheets: DropSheets): ImageBuffer => {
  const palette = spritePalettes.palettes[paletteIdx];
  const img = new ImageBuffer(16, 16);
  const top = decode3bppTile(dropSheets.sheet96, 0, palette, true);
  const bot = decode3bppTile(dropSheets.sheet96, 0x180, palette, true);
  img.paste(top, 4, 0);
  img.paste(bot, 4, 8);
  return img;
};

const extractDropBigkey = (paletteIdx: number, spritePalettes: SpritePalettes, receiptSheets: ReceiptSheets): ImageBuffer => {
  const palette = spritePalettes.palettes[paletteIdx];
  const combined = Buffer.concat([receiptSheets.base, receiptSheets.sheet5B]);
  const offset = kDecodeTab[0x22];
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
};

const extractDropShieldFighters = (sheetId: number, tileIds: number[], paletteIdx: number, spritePalettes: SpritePalettes, dropSheets: DropSheets): ImageBuffer => {
  const sheet = dropSheets.sheets.get(sheetId)!;
  const palette = spritePalettes.palettes[paletteIdx];
  const img = new ImageBuffer(16, 16);
  const top = decode3bppTile(sheet, tileIds[0] * 24, palette, false);
  const bot = decode3bppTile(sheet, tileIds[1] * 24, palette, false);
  img.paste(top, 4, 0);
  img.paste(bot, 4, 8);
  return img;
};

const extractDropShieldFire = (sheetId: number, tileIds: number[], paletteIdx: number, spritePalettes: SpritePalettes, dropSheets: DropSheets): ImageBuffer => {
  const sheet = dropSheets.sheets.get(sheetId)!;
  const palette = spritePalettes.palettes[paletteIdx];
  const img = new ImageBuffer(16, 16);
  const pos: [number, number][] = [[0, 0], [8, 0], [0, 8], [8, 8]];
  for (let i = 0; i < tileIds.length; i++) {
    const tile = decode3bppTile(sheet, tileIds[i] * 24, palette, false);
    img.paste(tile, pos[i][0], pos[i][1]);
  }
  return img;
};

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

export {
  extractDropBigkey,
  extractDropNumbered,
  extractDropRupee,
  extractDropShieldFighters,
  extractDropShieldFire,
  extractDropStandard,
  extractFollowerBomb,
  loadDropSheets,
};
export type { DropSheets };
