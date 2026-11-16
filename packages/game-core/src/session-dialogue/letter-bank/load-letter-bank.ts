/* @layer bridge-wasm @kind logic */
import { letterBankBytes } from '@rotp/game-data';
import type { LetterGlyph, LetterSlot } from '@rotp/game-data';
import type { EmscriptenModule } from '../../types';
import { coreTakesLetters } from './core-takes-letters';
import { letterBankState } from './letter-bank-state';

const loadLetterBank = (mod: EmscriptenModule, glyphs: readonly LetterGlyph[], firstSlot: number): readonly LetterSlot[] => {
  letterBankState.letters = [];
  if (glyphs.length === 0 || !coreTakesLetters(mod)) return [];
  const ptr = mod.ccall('WasmLetterBankTable', 'number', [], []);
  mod.HEAPU8.set(letterBankBytes(glyphs), ptr);
  const taken = mod.ccall('WasmLoadLetterBank', 'number', ['number', 'number'], [glyphs.length, firstSlot]);
  if (taken !== glyphs.length) return [];
  letterBankState.letters = glyphs.map((glyph, index) => ({ char: glyph.char, index, width: glyph.width }));
  return letterBankState.letters;
};

export { loadLetterBank };
