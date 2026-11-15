/* @layer shared-asset-extraction @kind logic */
import { glyphPlaceholder } from '../../glyph-map';
import { identifyGlyphs } from '../font';
import type { PatchedWork } from '../patched-language.type';

const readLetters = (work: PatchedWork): string[] => {
  const { config } = work;
  const tiles = work.tiles;
  const reading = tiles
    ? identifyGlyphs({ tiles, references: work.references, alphabet: config.alphabet, glyphLimit: config.commandStart })
    : null;
  work.reading = reading;
  const alphabet = reading?.alphabet ?? config.alphabet;
  const length = Math.max(alphabet.length, config.commandStart);
  return Array.from({ length }, (_, glyph) => alphabet[glyph] ?? glyphPlaceholder(glyph));
};

export { readLetters };
