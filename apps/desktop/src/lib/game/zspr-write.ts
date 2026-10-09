/* @layer bridge-wasm @kind logic */
import type { SheetPalette, PlayerSheet } from '@rotp/game-data';
import type { ZsprOptions } from './zspr-write.type';
import { SHEET_BYTES, COLORS_PER_OUTFIT, OUTFIT_IDS } from '@rotp/game-data';
import { HEADER_BYTES, OUTFIT_BLOCK, GLOVE_BLOCK, ZSPR_MAGIC, ZSPR_HEADER } from './zspr';
import { flattenPalette } from './player-sheet/flatten-palette';
import { CHECKSUM_SEED, SPRITE_TYPE_PLAYER, ZSPR_VERSION } from './zspr-write.constants';

const utf16z = (text: string): Uint8Array => {
  const out = new Uint8Array(text.length * 2 + 2);
  for (let i = 0; i < text.length; i++) {
    const u = text.charCodeAt(i);
    out[i * 2] = u & 0xff;
    out[i * 2 + 1] = u >> 8;
  }
  return out;
};

const asciiz = (text: string): Uint8Array => {
  const out = new Uint8Array(text.length + 1);
  for (let i = 0; i < text.length; i++) out[i] = text.charCodeAt(i) & 0x7f;
  return out;
};

const paletteToBytes = (palette: SheetPalette): Uint8Array => {
  const out = new Uint8Array(OUTFIT_BLOCK + GLOVE_BLOCK);
  OUTFIT_IDS.forEach((id, slot) => {
    const colors = palette.outfits[id];
    for (let i = 0; i < COLORS_PER_OUTFIT; i++) {
      const at = (slot * COLORS_PER_OUTFIT + i) * 2;
      out[at] = colors[i] & 0xff;
      out[at + 1] = (colors[i] >> 8) & 0xff;
    }
  });
  const view = new DataView(out.buffer);
  view.setUint16(OUTFIT_BLOCK, palette.gloves[0], true);
  view.setUint16(OUTFIT_BLOCK + 2, palette.gloves[1], true);
  return out;
};

const checksumOf = (bytes: Uint8Array): number => {
  const checksumAt = ZSPR_HEADER.checksum;
  let sum = CHECKSUM_SEED.reduce((a, b) => a + b, 0);
  for (let i = 0; i < bytes.length; i++) {
    if (i >= checksumAt && i < checksumAt + CHECKSUM_SEED.length) continue;
    sum = (sum + bytes[i]) & 0xffff;
  }
  sum &= 0xffff;
  return sum | ((0xffff - sum) << 16);
};

const toZsprBytes = (sheet: PlayerSheet, options: ZsprOptions = {}): Uint8Array => {
  const { layer = 'override' } = options;
  const name = utf16z(sheet.meta.name);
  const author = utf16z(sheet.meta.author);
  const authorShort = asciiz(sheet.meta.authorShort || sheet.meta.author);
  const palette = paletteToBytes(layer === 'original' ? sheet.original : flattenPalette(sheet));
  const pixelOffs = HEADER_BYTES + name.length + author.length + authorShort.length;

  const out = new Uint8Array(pixelOffs + SHEET_BYTES + palette.length);
  const view = new DataView(out.buffer);
  out.set(ZSPR_MAGIC, 0);
  out[ZSPR_HEADER.version] = ZSPR_VERSION;
  view.setUint32(ZSPR_HEADER.pixelOffset, pixelOffs, true);
  view.setUint16(ZSPR_HEADER.pixelLength, SHEET_BYTES, true);
  view.setUint32(ZSPR_HEADER.paletteOffset, pixelOffs + SHEET_BYTES, true);
  view.setUint16(ZSPR_HEADER.paletteLength, palette.length, true);
  view.setUint16(ZSPR_HEADER.spriteType, SPRITE_TYPE_PLAYER, true);
  out.set(name, HEADER_BYTES);
  out.set(author, HEADER_BYTES + name.length);
  out.set(authorShort, HEADER_BYTES + name.length + author.length);
  out.set(sheet.pixels.subarray(0, SHEET_BYTES), pixelOffs);
  out.set(palette, pixelOffs + SHEET_BYTES);
  view.setUint32(ZSPR_HEADER.checksum, checksumOf(out), true);
  return out;
};

export { toZsprBytes };
export type { ZsprOptions } from './zspr-write.type';
