/* @layer shared-game @kind logic */
import { PLAIN_LETTER } from '../compose/compose.constants';
import { isLatinLetter } from '../compose/is-latin-letter';
import { LATIN_SCRIPT } from './letter-table.constants';

const spelled = (char: string): string => {
  if (PLAIN_LETTER.test(char) || isLatinLetter(char) || !LATIN_SCRIPT.test(char)) return char;
  const parts = char.normalize('NFKD').normalize('NFC');
  if (parts === char) return char;
  return [...parts].every((part) => PLAIN_LETTER.test(part) || isLatinLetter(part)) ? parts : char;
};

const letterText = (text: string): string => [...text.normalize('NFC')].map(spelled).join('');

export { letterText };
