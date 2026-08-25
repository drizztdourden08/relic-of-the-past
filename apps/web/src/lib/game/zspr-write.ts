/* @layer bridge-wasm @kind logic */
/**
 * Serialize a PlayerSheet back to ZSPR.
 *
 * Used twice: by the studio's export, and by the boot path — the core only ever reads a
 * ZSPR, so a sheet held in any other container has to be flattened to this before it can
 * be staged into MEMFS.
 *
 * The override layer is folded onto the original here, which is what makes the export
 * lossy in the honest sense: the file carries one palette, so whichever layer the caller
 * asks for is the one that survives.
 */
import { SHEET_BYTES, COLORS_PER_OUTFIT, OUTFIT_IDS } from '@shared/game/data/player-sheet/types';
import type { SheetPalette, PlayerSheet } from '@shared/game/data/player-sheet/types';
import { HEADER_BYTES, OUTFIT_BLOCK, GLOVE_BLOCK } from './zspr';
import { flattenPalette } from './player-sheet/flatten-palette';

const SPRITE_TYPE_PLAYER = 1;
const ZSPR_VERSION = 1;

/** NUL-terminated UTF-16LE — the display name and the author. */
const utf16z = (text: string): Uint8Array => {
  const out = new Uint8Array(text.length * 2 + 2);
  for (let i = 0; i < text.length; i++) {
    const u = text.charCodeAt(i);
    out[i * 2] = u & 0xff;
    out[i * 2 + 1] = u >> 8;
  }
  return out;
};

/** NUL-terminated ASCII — the third string, a short credit line. */
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

/**
 * The spec's checksum: a 16-bit sum of every byte, followed by `0xFFFF - sum` so the two
 * halves always add to 0xFFFF. The four checksum bytes are themselves summed as the seed
 * value `FF FF 00 00` rather than as zero or as whatever they end up holding — which is
 * what makes the result reproduce byte for byte against sheets other tools wrote.
 *
 * Nothing in this project validates it, but a file handed elsewhere should be well formed.
 */
const CHECKSUM_AT = 5;
const CHECKSUM_SEED = [0xff, 0xff, 0x00, 0x00];

const checksumOf = (bytes: Uint8Array): number => {
  let sum = CHECKSUM_SEED.reduce((a, b) => a + b, 0);
  for (let i = 0; i < bytes.length; i++) {
    if (i >= CHECKSUM_AT && i < CHECKSUM_AT + CHECKSUM_SEED.length) continue;
    sum = (sum + bytes[i]) & 0xffff;
  }
  sum &= 0xffff;
  return sum | ((0xffff - sum) << 16);
};

interface ZsprOptions {
  /** 'override' bakes the edits (the default); 'original' writes the palette as imported. */
  layer?: 'override' | 'original';
}

const toZsprBytes = (sheet: PlayerSheet, options: ZsprOptions = {}): Uint8Array => {
  const { layer = 'override' } = options;
  const name = utf16z(sheet.meta.name);
  const author = utf16z(sheet.meta.author);
  const authorShort = asciiz(sheet.meta.authorShort || sheet.meta.author);
  const palette = paletteToBytes(layer === 'original' ? sheet.original : flattenPalette(sheet));
  const pixelOffs = HEADER_BYTES + name.length + author.length + authorShort.length;

  const out = new Uint8Array(pixelOffs + SHEET_BYTES + palette.length);
  const view = new DataView(out.buffer);
  out.set([0x5a, 0x53, 0x50, 0x52], 0);
  out[4] = ZSPR_VERSION;
  view.setUint32(9, pixelOffs, true);
  view.setUint16(13, SHEET_BYTES, true);
  view.setUint32(15, pixelOffs + SHEET_BYTES, true);
  view.setUint16(19, palette.length, true);
  view.setUint16(21, SPRITE_TYPE_PLAYER, true);
  out.set(name, HEADER_BYTES);
  out.set(author, HEADER_BYTES + name.length);
  out.set(authorShort, HEADER_BYTES + name.length + author.length);
  out.set(sheet.pixels.subarray(0, SHEET_BYTES), pixelOffs);
  out.set(palette, pixelOffs + SHEET_BYTES);
  view.setUint32(5, checksumOf(out), true);
  return out;
};

export { toZsprBytes };
export type { ZsprOptions };
