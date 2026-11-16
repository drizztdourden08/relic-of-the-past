/* @layer shared-game @kind logic */
import { isLatinLetter } from '../compose/latin-letter-set';

const PLAIN = /^[A-Za-z]$/u;
const LATIN = /^\p{Script=Latin}$/u;

const spelled = (char: string): string => {
  if (PLAIN.test(char) || isLatinLetter(char) || !LATIN.test(char)) return char;
  const parts = char.normalize('NFKD').normalize('NFC');
  if (parts === char) return char;
  return [...parts].every((part) => PLAIN.test(part) || isLatinLetter(part)) ? parts : char;
};

const letterText = (text: string): string => [...text.normalize('NFC')].map(spelled).join('');

export { letterText };
