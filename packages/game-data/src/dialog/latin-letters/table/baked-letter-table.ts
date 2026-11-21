/* @layer shared-game @kind logic */
import { kLanguages, usesNewFormat } from '@rotp/asset-extraction';
import type { GlyphMap } from '@rotp/asset-extraction';
import { alphabetChars } from '../../dialogue-charset/alphabet-chars';
import type { BakedLetterTable } from './letter-table.type';
import { letterCapacity } from './letter-capacity';
import { letterEscapeBytes } from './letter-escape-bytes';
import { letterText } from './letter-text';
import { tableLettersOf } from './table-letters-of';

const bakedLetterTable = (texts: readonly string[], base: string): BakedLetterTable => {
  const eu = usesNewFormat(base);
  const spelled = texts.map(letterText);
  const known = alphabetChars(kLanguages[base]?.alphabet ?? []);
  const letters = tableLettersOf(spelled, known, letterCapacity(eu));
  const glyphs: GlyphMap = Object.fromEntries(letters.map((letter, index) => [letter, letterEscapeBytes(index, eu)]));
  return { texts: spelled, letters, glyphs };
};

export { bakedLetterTable };
