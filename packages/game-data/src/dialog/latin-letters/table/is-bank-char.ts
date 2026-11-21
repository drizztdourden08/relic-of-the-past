/* @layer shared-game @kind logic */
import { isLatinLetter } from '../compose/is-latin-letter';
import { DRAWN_SYMBOLS } from './letter-table.constants';

const isBankChar = (char: string): boolean => isLatinLetter(char) || DRAWN_SYMBOLS.has(char);

export { isBankChar };
