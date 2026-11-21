/* @layer shared-game @kind logic */
import { MAX_DEPTH } from '../latin-letters.constants';
import { PLAIN_LETTER } from './compose.constants';
import { letterRecipe } from './letter-recipe';

const resolvesLetter = (char: string, depth: number): boolean => {
  if (PLAIN_LETTER.test(char)) return true;
  if (depth > MAX_DEPTH) return false;
  const recipe = letterRecipe(char);
  if (recipe === undefined) return false;
  return recipe.kind === 'drawn' || resolvesLetter(recipe.base, depth + 1);
};

export { resolvesLetter };
