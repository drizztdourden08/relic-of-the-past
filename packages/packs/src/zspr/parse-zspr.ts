/* @layer bridge-wasm @kind logic */
import type { OutfitId, OutfitPalette, SheetPalette, PlayerSheet } from '@rotp/game-data';
import type { ReadString } from './zspr.type';
import { SHEET_BYTES, COLORS_PER_OUTFIT, OUTFIT_IDS, STOCK_GLOVES } from '@rotp/game-data';
import { isZspr } from './is-zspr';
import { BYTES_PER_WORD, GLOVE_BLOCK, HEADER_BYTES, OUTFIT_BLOCK, ZSPR_HEADER } from './zspr.constants';

const word = (b: Uint8Array, i: number): number => b[i] | (b[i + 1] << 8);
const dword = (b: Uint8Array, i: number): number =>
  b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24);

const readUtf16 = (b: Uint8Array, at: number): ReadString => {
  const units: number[] = [];
  let i = at;
  for (; i + 1 < b.length; i += 2) {
    const u = word(b, i);
    if (u === 0) break;
    units.push(u);
  }
  return { text: String.fromCharCode(...units), next: i + 2 };
};

const readAscii = (b: Uint8Array, at: number): ReadString => {
  let i = at;
  while (i < b.length && b[i] !== 0) i++;
  return { text: String.fromCharCode(...b.subarray(at, i)), next: i + 1 };
};

const paletteFromBlock = (block: Uint8Array): SheetPalette | null => {
  if (block.length < OUTFIT_BLOCK) return null;
  const outfits = {} as Record<OutfitId, OutfitPalette>;
  OUTFIT_IDS.forEach((id, slot) => {
    const base = slot * COLORS_PER_OUTFIT * BYTES_PER_WORD;
    const colors: number[] = [];
    for (let i = 0; i < COLORS_PER_OUTFIT; i++) colors.push(word(block, base + i * BYTES_PER_WORD));
    outfits[id] = colors;
  });
  const gloves: readonly [number, number] =
    block.length >= OUTFIT_BLOCK + GLOVE_BLOCK
      ? [word(block, OUTFIT_BLOCK), word(block, OUTFIT_BLOCK + BYTES_PER_WORD)]
      : STOCK_GLOVES;
  return { outfits, gloves };
};

const parseZspr = (bytes: Uint8Array, stockPalette?: SheetPalette): PlayerSheet | null => {
  if (!isZspr(bytes)) return null;
  const pixelOffs = dword(bytes, ZSPR_HEADER.pixelOffset);
  const pixelLen = word(bytes, ZSPR_HEADER.pixelLength);
  const palOffs = dword(bytes, ZSPR_HEADER.paletteOffset);
  const palLen = word(bytes, ZSPR_HEADER.paletteLength);
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

export { parseZspr };
