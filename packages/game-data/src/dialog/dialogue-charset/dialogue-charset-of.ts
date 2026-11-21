/* @layer shared-game @kind logic */
import { letterTokenOf } from '../latin-letters/table/letter-token-of';
import type { DialogueCharset, ExtraGlyphSlot, LetterSlot } from './dialogue-charset.type';
import { GLYPH_SLOTS } from './dialogue-charset.constants';
import { extraTokenOf } from './extra-token-of';
import { withExtras } from './with-extras';

const withLetters = (codes: string[], letters: readonly LetterSlot[]): string[] => {
  if (letters.length === 0) return codes;
  while (codes.length < GLYPH_SLOTS) codes.push('');
  for (const letter of letters) codes[GLYPH_SLOTS + letter.index] = letterTokenOf(letter.index);
  return codes;
};

const dialogueCharsetOf = (
  alphabet: readonly string[],
  widths: Uint8Array,
  extras: readonly ExtraGlyphSlot[],
  letters: readonly LetterSlot[] = [],
): DialogueCharset => {
  const table = new Uint8Array(GLYPH_SLOTS + letters.length);
  table.set(widths.subarray(0, GLYPH_SLOTS));
  for (const extra of extras) table[extra.slot] = extra.width;
  for (const letter of letters) table[GLYPH_SLOTS + letter.index] = letter.width;
  const codes = withExtras(alphabet, extras, (extra) => extraTokenOf(extra.slot));
  return { alphabet: withLetters(codes, letters), widths: table, extras, letters };
};

export { dialogueCharsetOf };
