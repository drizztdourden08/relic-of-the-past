/* @layer shared-game @kind logic */
import { LATIN_LETTER_SET } from './latin-letter-set.constants';

const isLatinLetter = (char: string): boolean => LATIN_LETTER_SET.has(char);

export { isLatinLetter };
