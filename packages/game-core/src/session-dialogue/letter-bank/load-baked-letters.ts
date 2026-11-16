/* @layer bridge-wasm @kind logic */
import { kLanguages } from '@rotp/asset-extraction';
import { bankGlyphOf } from '@rotp/game-data';
import type { LetterSlot } from '@rotp/game-data';
import type { EmscriptenModule } from '../../types';
import { readActiveDialogue } from '../active-dialogue';
import { clearLetterBank } from './clear-letter-bank';
import { loadLetterBank } from './load-letter-bank';

const loadBakedLetters = (mod: EmscriptenModule | null): readonly LetterSlot[] => {
  const dialogue = mod ? readActiveDialogue(mod) : null;
  const alphabet = dialogue ? kLanguages[dialogue.code]?.alphabet : undefined;
  if (!mod || !dialogue || !alphabet || dialogue.bakedLetters.length === 0) {
    clearLetterBank(mod);
    return [];
  }
  const font = { sheet: dialogue.fontSheet, widths: dialogue.fontWidths, alphabet };
  const glyphs = dialogue.bakedLetters.map((char) => bankGlyphOf(char, font));
  return loadLetterBank(mod, glyphs, Math.max(alphabet.length, dialogue.fontWidths.length));
};

export { loadBakedLetters };
