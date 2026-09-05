/* @layer shared-asset-extraction @kind logic */
/**
 * Decoder for the words baked into the file-select and name-entry screens.
 *
 * Format. Those screens are four prebuilt tilemap uploads in ROM (SNES 0xCE7BF, 0xCE2A8,
 * 0xCE63C, 0xCE456), each a chain of "stripe" runs shaped `[address hi][address lo]
 * [control hi][control lo][payload]`, closed by a byte with bit 7 set. The control word
 * carries the payload length in its low 14 bits (`length + 1` bytes) and a fixed-source flag at
 * 0x4000 (payload is one word repeated). A listed payload is a run of tilemap words, two bytes each.
 *
 * Glyphs. The letters are the dialogue font in its 8x16 arrangement: the tile for character
 * code `c` is `(c & 0x70) * 2 + (c & 0xf)`, lower half 0x10 later. Reading a run inverts that
 * and looks the code up in the language's alphabet. Runs made only of lower halves repeat the
 * row above and are dropped; runs whose tiles fall outside the 256-tile sheet are frame art and
 * are dropped too.
 *
 * A few codes past the end of the alphabet table are supplied here (the sheet has more glyphs
 * than the compressor can encode). Code 0x5f is a narrow bar the roll uses as capital I and the
 * on-screen keyboard reuses as lowercase l; it is read as I.
 *
 * Limits. A run's tile count, read from the control word, is the room the screen gives that line.
 */
import type { RomData } from '../../rom/rom-types';
import type { DecodedLine } from './types';
import { advanceAddress } from '../../rom/snes-address';
import { kLanguages } from '../data/language-data';

/** The four prebuilt tilemaps that carry menu wording, in screen order. */
const MENU_TILEMAPS = [0xce7bf, 0xce2a8, 0xce63c, 0xce456];

/** Bit 7 of a run's first byte closes the chain. */
const STRIPE_END = 0x80;
const CONTROL_FIXED_SOURCE = 0x4000;
const CONTROL_LENGTH_MASK = 0x3fff;

const TILE_INDEX_MASK = 0x3ff;
const FONT_TILE_COUNT = 0x100;
const LOWER_HALF_BIT = 0x10;
const SPACE_TILE = 0xa9;
const MAX_SLUG = 28;

/** Font codes the alphabet table stops short of. */
const EXTRA_GLYPH_BASE = 0x76;
const DIGITS = '0123456789';

const buildExtraGlyphs = (): Record<number, string> => {
  const extra: Record<number, string> = { 0x5f: 'I', 0x60: 'i', 0x61: '!' };
  for (let i = 0; i < DIGITS.length; i++) extra[EXTRA_GLYPH_BASE + i] = DIGITS[i];
  return extra;
};

const EXTRA_GLYPHS = buildExtraGlyphs();

const codeFromTile = (tile: number): number => ((tile & 0xe0) >> 1) | (tile & 0x0f);

const readStripe = (rom: RomData, address: number): number[][] => {
  const runs: number[][] = [];
  let ea = address;
  const next = (): number => {
    const value = rom.getByte(ea);
    ea = advanceAddress(ea);
    return value;
  };

  while ((rom.getByte(ea) & STRIPE_END) === 0) {
    next();
    next();
    const controlHi = next();
    const controlLo = next();
    const control = (controlHi << 8) | controlLo;
    const byteLength = (control & CONTROL_LENGTH_MASK) + 1;

    if ((control & CONTROL_FIXED_SOURCE) !== 0) {
      next();
      next();
      continue;
    }

    const words: number[] = [];
    for (let i = 0; i + 1 < byteLength; i += 2) {
      const lo = next();
      const hi = next();
      words.push(lo | (hi << 8));
    }
    if ((byteLength & 1) !== 0) next();
    runs.push(words);
  }

  return runs;
};

const tileOf = (word: number): number => word & TILE_INDEX_MASK;

/** True when every tile in the run belongs to the font sheet. */
const isGlyphRun = (words: number[]): boolean =>
  words.length > 0 && words.every((word) => tileOf(word) < FONT_TILE_COUNT);

/** True when the run only repeats the lower halves of the row above it. */
const isLowerHalfRun = (words: number[]): boolean => {
  let sawLowerHalf = false;
  for (const word of words) {
    const tile = tileOf(word);
    if (tile === SPACE_TILE) continue;
    if ((tile & LOWER_HALF_BIT) === 0) return false;
    sawLowerHalf = true;
  }
  return sawLowerHalf;
};

const runToText = (words: number[], alphabet: readonly string[]): string => {
  let text = '';
  for (const word of words) {
    const tile = tileOf(word);
    const upperHalf = (tile & LOWER_HALF_BIT) !== 0 ? tile - LOWER_HALF_BIT : tile;
    const code = codeFromTile(upperHalf);
    text += alphabet[code] ?? EXTRA_GLYPHS[code] ?? '?';
  }
  return text;
};

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG)
    .replace(/-+$/, '');

const decodeMenuText = (rom: RomData, langCode: string): DecodedLine[] => {
  const language = kLanguages[langCode];
  if (!language) throw new Error(`Unknown language code: ${langCode}`);

  const lines: DecodedLine[] = [];
  const slugCounts = new Map<string, number>();

  for (const address of MENU_TILEMAPS) {
    for (const words of readStripe(rom, address)) {
      if (!isGlyphRun(words) || isLowerHalfRun(words)) continue;
      const text = runToText(words, language.alphabet);
      const slug = slugify(text);
      if (!slug) continue;

      const seen = (slugCounts.get(slug) ?? 0) + 1;
      slugCounts.set(slug, seen);
      lines.push({
        key: `menu.${seen === 1 ? slug : `${slug}-${seen}`}`,
        text,
        limit: { kind: 'tiles', max: words.length },
      });
    }
  }

  return lines;
};

export { decodeMenuText };
