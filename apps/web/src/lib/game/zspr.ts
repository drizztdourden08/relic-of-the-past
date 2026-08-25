/* @layer bridge-wasm @kind logic */
/**
 * ZSPR — the community custom-sprite container — read into a PlayerSheet.
 *
 * Header, 29 bytes: `"ZSPR"`, a version byte, a four-byte checksum, then (offset, length)
 * for the tile block and for the palette block, a sprite-type word, and six reserved bytes.
 * Three strings follow, in this order: the display name and the author as NUL-terminated
 * UTF-16LE, then the author again as NUL-terminated ASCII for a short in-game credit. The
 * two data blocks sit wherever the header's offsets point, which in practice is just past
 * those strings.
 *
 * The palette block is four outfits of 15 words followed by two glove words. A sheet may
 * ship tiles only; that parses so long as a stock palette is supplied to stand in, which
 * mirrors PlayerSprite_Apply keeping the player on the stock row for a short block.
 */
import { SHEET_BYTES, COLORS_PER_OUTFIT, OUTFIT_IDS } from '@shared/game/data/player-sheet/types';
import type { OutfitId, OutfitPalette, SheetPalette, PlayerSheet } from '@shared/game/data/player-sheet/types';
import { STOCK_GLOVES } from '@shared/game/data/player-sheet/stock-palette';

const HEADER_BYTES = 29;
const OUTFIT_BLOCK = OUTFIT_IDS.length * COLORS_PER_OUTFIT * 2;
const GLOVE_BLOCK = 4;

const word = (b: Uint8Array, i: number): number => b[i] | (b[i + 1] << 8);
const dword = (b: Uint8Array, i: number): number =>
  b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24);

const isZspr = (b: Uint8Array): boolean =>
  b.length >= HEADER_BYTES && b[0] === 0x5a && b[1] === 0x53 && b[2] === 0x50 && b[3] === 0x52;

/** NUL-terminated UTF-16LE, returning the text and the offset just past the terminator. */
const readUtf16 = (b: Uint8Array, at: number): { text: string; next: number } => {
  const units: number[] = [];
  let i = at;
  for (; i + 1 < b.length; i += 2) {
    const u = word(b, i);
    if (u === 0) break;
    units.push(u);
  }
  return { text: String.fromCharCode(...units), next: i + 2 };
};

/** NUL-terminated ASCII, same contract. */
const readAscii = (b: Uint8Array, at: number): { text: string; next: number } => {
  let i = at;
  for (; i < b.length && b[i] !== 0; i++) { /* scan */ }
  return { text: String.fromCharCode(...b.subarray(at, i)), next: i + 1 };
};

const paletteFromBlock = (block: Uint8Array): SheetPalette | null => {
  if (block.length < OUTFIT_BLOCK) return null;
  const outfits = {} as Record<OutfitId, OutfitPalette>;
  OUTFIT_IDS.forEach((id, slot) => {
    const base = slot * COLORS_PER_OUTFIT * 2;
    const colors: number[] = [];
    for (let i = 0; i < COLORS_PER_OUTFIT; i++) colors.push(word(block, base + i * 2));
    outfits[id] = colors;
  });
  const gloves: readonly [number, number] =
    block.length >= OUTFIT_BLOCK + GLOVE_BLOCK
      ? [word(block, OUTFIT_BLOCK), word(block, OUTFIT_BLOCK + 2)]
      : STOCK_GLOVES;
  return { outfits, gloves };
};

/** Parses a ZSPR into a sheet with an empty override layer. Null if the bytes aren't one. */
const parseZspr = (bytes: Uint8Array, stockPalette?: SheetPalette): PlayerSheet | null => {
  if (!isZspr(bytes)) return null;
  const pixelOffs = dword(bytes, 9);
  const pixelLen = word(bytes, 13);
  const palOffs = dword(bytes, 15);
  const palLen = word(bytes, 19);
  if (pixelLen !== SHEET_BYTES) return null;
  if (pixelOffs + pixelLen > bytes.length || palOffs + palLen > bytes.length) return null;

  const name = readUtf16(bytes, HEADER_BYTES);
  const author = readUtf16(bytes, name.next);
  const authorShort = readAscii(bytes, author.next);
  const original = paletteFromBlock(bytes.subarray(palOffs, palOffs + palLen)) ?? stockPalette;
  if (!original) return null;

  return {
    pixels: bytes.slice(pixelOffs, pixelOffs + SHEET_BYTES),
    original,
    override: {},
    meta: { name: name.text, author: author.text, authorShort: authorShort.text },
  };
};

export { parseZspr, isZspr, HEADER_BYTES, OUTFIT_BLOCK, GLOVE_BLOCK };
