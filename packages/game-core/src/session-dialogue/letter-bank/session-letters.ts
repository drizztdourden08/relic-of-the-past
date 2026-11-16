/* @layer bridge-wasm @kind logic */
import { alphabetChars, bankGlyphOf, letterCapacity, letterText, tableLettersOf } from '@rotp/game-data';
import type { ExtraGlyphSlot, LetterSlot } from '@rotp/game-data';
import type { EmscriptenModule } from '../../types';
import { clearLetterBank } from './clear-letter-bank';
import { coreTakesLetters } from './core-takes-letters';
import type { LetterSource } from './letter-bank.type';
import { loadLetterBank } from './load-letter-bank';

const sessionLetters = (
  mod: EmscriptenModule,
  alphabet: readonly string[],
  widths: Uint8Array,
  extras: readonly ExtraGlyphSlot[],
  source: LetterSource,
): readonly LetterSlot[] => {
  if (!coreTakesLetters(mod)) return [];
  const known = new Set([...alphabetChars(alphabet), ...extras.map((extra) => extra.char), ...source.baked]);
  const room = Math.max(0, letterCapacity(source.eu) - source.baked.length);
  const chars = [...source.baked, ...tableLettersOf(source.texts.map(letterText), known, room)];
  if (chars.length === 0) {
    clearLetterBank(mod);
    return [];
  }
  const font = { sheet: source.sheet, widths, alphabet };
  const firstSlot = Math.max(alphabet.length, widths.length, ...extras.map((extra) => extra.slot + 1));
  return loadLetterBank(mod, chars.map((char) => bankGlyphOf(char, font)), firstSlot);
};

export { sessionLetters };
