/**
 * Drop sprite sheet loading and tile assembly primitives.
 */

import type { RomData } from '../rom/rom-types';
import type { RGBA } from '../graphics/palette';
import { decode3bppTile } from './receipt-decoder';
import { decompress } from '../compression/lz-decompress';
import { kCompSpritePtrs } from '../data/tables';
import { ImageBuffer } from '../graphics/png-writer';

// ── Types ──

interface DropSheets {
  sheets: Map<number, Buffer>;
  sheet96: Buffer;
}

// ── Sheet loading ──

function loadDropSheets(rom: RomData): DropSheets {
  const getByte = (addr: number) => rom.getByte(addr);
  const sheetIds = [0, 6, 7, 10, 27];
  const sheets = new Map<number, Buffer>();

  for (const si of sheetIds) {
    if (si < 12) {
      sheets.set(si, rom.getBytes(kCompSpritePtrs[si], 0x600));
    } else {
      sheets.set(si, decompress(kCompSpritePtrs[si], getByte, false));
    }
  }

  const sheet96 = decompress(kCompSpritePtrs[96], getByte, false);

  return { sheets, sheet96 };
}

// ── Tile lookup ──

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

// ── Sprite assembly ──

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

export { loadDropSheets, getSheetForChar, extractSmallCentered, extractLarge, extractTall };
export type { DropSheets };
