/* @layer shared-game @kind logic */
import { EXTRA_GLYPHS } from '../../extra-glyphs.constants';
import { isLatinLetter } from '../compose/latin-letter-set';

const DRAWN_SYMBOLS: ReadonlySet<string> = new Set(EXTRA_GLYPHS.map((glyph) => glyph.char));

const isBankChar = (char: string): boolean => isLatinLetter(char) || DRAWN_SYMBOLS.has(char);

export { isBankChar };
