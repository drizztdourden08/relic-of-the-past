/* @layer shared-game @kind logic */
import { GLYPH_SLOTS } from '../../dialogue-charset/dialogue-charset.constants';
import { MAX_DEPTH, TITTLE_BASES } from '../latin-letters.constants';
import type { LetterFont, LetterRecipe, LetterShape } from '../latin-letters.type';
import type { MarksRecipe } from './compose.type';
import { drawnMask } from '../mask/drawn-mask';
import { glyphMask } from '../mask/glyph-mask';
import { MAX_WIDTH } from '../mask/mask.constants';
import { maskWidth } from '../mask/mask-width';
import { transformMask } from '../mask/transform-mask';
import { applyOverlay } from './apply-overlay';
import { letterRecipe } from './letter-recipe';
import { markLetter } from './mark-letter';
import { markSteps } from './mark-steps';

const fontShape = (char: string, font: LetterFont): LetterShape | undefined => {
  const glyph = font.alphabet.indexOf(char);
  if (glyph < 0 || glyph >= GLYPH_SLOTS) return undefined;
  return { mask: glyphMask(font.sheet, glyph), width: font.widths[glyph] ?? MAX_WIDTH, fallback: char };
};

const fontPrefix = (char: string, font: LetterFont): { base: string; used: number } => {
  const parts = [...char.normalize('NFD')];
  for (let used = parts.length - 2; used >= 1; used--) {
    const prefix = parts.slice(0, used + 1).join('').normalize('NFC');
    if ([...prefix].length === 1 && fontShape(prefix, font) !== undefined) return { base: prefix, used };
  }
  return { base: parts[0] ?? char, used: 0 };
};

const markedShape = (char: string, recipe: MarksRecipe, font: LetterFont, depth: number): LetterShape | undefined => {
  const prefix = fontPrefix(char, font);
  const base = letterShape(prefix.base, font, depth + 1);
  const steps = markSteps(recipe.base, recipe.marks.slice(prefix.used));
  if (base === undefined || steps === undefined) return undefined;
  const mask = markLetter(base.mask, steps, prefix.used === 0 && TITTLE_BASES.has(recipe.base));
  return { mask, width: maskWidth(mask, base.width), fallback: base.fallback };
};

const recipeShape = (char: string, recipe: LetterRecipe, font: LetterFont, depth: number): LetterShape | undefined => {
  if (recipe.kind === 'drawn') {
    const mask = drawnMask(recipe.letter);
    return { mask, width: maskWidth(mask, 0), fallback: recipe.letter.fallback };
  }
  if (recipe.kind === 'marks') return markedShape(char, recipe, font, depth);
  const base = letterShape(recipe.base, font, depth + 1);
  if (base === undefined) return undefined;
  if (recipe.kind === 'transform') return { ...base, mask: transformMask(base.mask, recipe.transform) };
  const marked = applyOverlay(base.mask, recipe.overlay);
  if (marked === undefined) return undefined;
  return { mask: marked.mask, width: maskWidth(marked.mask, base.width + marked.shift), fallback: base.fallback };
};

const letterShape = (char: string, font: LetterFont, depth = 0): LetterShape | undefined => {
  const own = fontShape(char, font);
  if (own !== undefined) return own;
  if (depth > MAX_DEPTH) return undefined;
  const recipe = letterRecipe(char);
  return recipe === undefined ? undefined : recipeShape(char, recipe, font, depth);
};

export { letterShape };
