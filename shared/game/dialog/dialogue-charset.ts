/* @layer shared-game @kind logic */
/**
 * What one language's message box can draw: its alphabet, plus the extra glyphs
 * (extra-glyphs.data.ts) laid into the font's spare slots.
 *
 * The sheet holds 128 glyphs, and a language uses the slots its alphabet and its width table
 * cover; the rest are spare. The characters the alphabet lacks take the spare slots in the
 * extra glyphs' priority order, and a character with no slot left falls back
 * (session-dialogue/dialogue-text.ts). A composed line writes an extra glyph as a private-use
 * token that carries its slot, so the encoder can turn it into the core's escape bytes and the
 * wrapper can measure it by its slot like any other glyph.
 */
import { EXTRA_GLYPHS } from './extra-glyphs.data';

/** Glyphs in a dialogue font sheet (core: 256 tiles, a glyph a top and a bottom tile). */
const GLYPH_SLOTS = 128;
/** First private-use code point of the slot tokens; clear of the highlight markup at U+E000. */
const TOKEN_BASE = 0xe100;

interface ExtraGlyphSlot {
  char: string;
  slot: number;
  width: number;
}

interface DialogueCharset {
  /** Glyph code to the text that encodes to it: alphabet entries, then a token per extra slot. */
  alphabet: readonly string[];
  /** Glyph code to pen advance in pixels, every slot. */
  widths: Uint8Array;
  /** The extra glyphs this charset draws, by slot. */
  extras: readonly ExtraGlyphSlot[];
}

const extraTokenOf = (slot: number): string => String.fromCodePoint(TOKEN_BASE + slot);

/** The slot a token names, or undefined for any other character. */
const extraSlotOfToken = (ch: string): number | undefined => {
  const point = ch.codePointAt(0) ?? 0;
  return ch.length === 1 && point >= TOKEN_BASE && point < TOKEN_BASE + GLYPH_SLOTS ? point - TOKEN_BASE : undefined;
};

/** The single characters an alphabet draws (a bracketed entry is a picture, never typed text). */
const alphabetChars = (alphabet: readonly string[]): Set<string> =>
  new Set(alphabet.filter((entry) => entry.length === 1));

/** The extra glyphs a font with |widthCount| widths lays out, in priority order, one spare slot each. */
const extraGlyphSlots = (alphabet: readonly string[], widthCount: number): ExtraGlyphSlot[] => {
  const first = Math.max(alphabet.length, widthCount);
  const drawn = alphabetChars(alphabet);
  return EXTRA_GLYPHS.filter((glyph) => !drawn.has(glyph.char))
    .slice(0, Math.max(0, GLYPH_SLOTS - first))
    .map((glyph, index) => ({ char: glyph.char, slot: first + index, width: glyph.width }));
};

/** The alphabet grown to every slot: an empty entry where no glyph is, |fill| at each extra slot. */
const withExtras = (alphabet: readonly string[], extras: readonly ExtraGlyphSlot[], fill: (extra: ExtraGlyphSlot) => string): string[] => {
  const codes = [...alphabet];
  for (const extra of extras) {
    while (codes.length < extra.slot) codes.push('');
    codes[extra.slot] = fill(extra);
  }
  return codes;
};

const dialogueCharsetOf = (alphabet: readonly string[], widths: Uint8Array, extras: readonly ExtraGlyphSlot[]): DialogueCharset => {
  const table = new Uint8Array(GLYPH_SLOTS);
  table.set(widths.subarray(0, GLYPH_SLOTS));
  for (const extra of extras) table[extra.slot] = extra.width;
  return { alphabet: withExtras(alphabet, extras, (extra) => extraTokenOf(extra.slot)), widths: table, extras };
};

/** The alphabet as a reader sees it: each extra slot holds its own character (the modern font's lookup). */
const displayAlphabetOf = (alphabet: readonly string[], extras: readonly ExtraGlyphSlot[]): string[] =>
  withExtras(alphabet, extras, (extra) => extra.char);

/** Composed |text| as a reader sees it: every slot token back to its character. */
const readableText = (text: string, charset: DialogueCharset): string => {
  const chars = new Map(charset.extras.map((extra) => [extra.slot, extra.char]));
  return [...text].map((ch) => chars.get(extraSlotOfToken(ch) ?? -1) ?? ch).join('');
};

export {
  GLYPH_SLOTS, alphabetChars, dialogueCharsetOf, displayAlphabetOf, extraGlyphSlots, extraSlotOfToken, extraTokenOf,
  readableText,
};
export type { DialogueCharset, ExtraGlyphSlot };
