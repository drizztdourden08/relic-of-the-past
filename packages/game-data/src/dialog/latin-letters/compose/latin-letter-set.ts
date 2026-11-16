/* @layer shared-game @kind logic */
import { IPA_LETTERS, LATIN_RANGES, MAX_DEPTH } from '../latin-letters.constants';
import { letterRecipe } from './letter-recipe';

const PLAIN = /^[A-Za-z]$/u;
const LETTER = /^\p{L}$/u;

const resolves = (char: string, depth: number): boolean => {
  if (PLAIN.test(char)) return true;
  if (depth > MAX_DEPTH) return false;
  const recipe = letterRecipe(char);
  if (recipe === undefined) return false;
  return recipe.kind === 'drawn' || resolves(recipe.base, depth + 1);
};

const candidates = (): string[] => {
  const chars: string[] = [];
  for (const [from, to] of LATIN_RANGES) for (let code = from; code <= to; code++) chars.push(String.fromCodePoint(code));
  return [...chars, ...IPA_LETTERS];
};

const LATIN_LETTERS: readonly string[] = [...new Set(candidates())]
  .filter((char) => LETTER.test(char) && !PLAIN.test(char) && resolves(char, 0))
  .sort((a, b) => (a.codePointAt(0) ?? 0) - (b.codePointAt(0) ?? 0));

const LATIN_LETTER_SET: ReadonlySet<string> = new Set(LATIN_LETTERS);

const latinLetterSet = (): readonly string[] => LATIN_LETTERS;

const isLatinLetter = (char: string): boolean => LATIN_LETTER_SET.has(char);

export { isLatinLetter, latinLetterSet };
