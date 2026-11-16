/* @layer shared-game @kind logic */
import { BUILT_LETTERS } from '../built-letters.constants';
import { DRAWN_LETTERS } from '../drawn-letters.constants';
import { MARK_OF_COMBINING } from '../latin-letters.constants';
import type { BuiltOp, LetterRecipe, LetterTransform } from '../latin-letters.type';

const DRAWN_OF = new Map(DRAWN_LETTERS.map((letter) => [letter.char, letter]));
const BUILT_OF = new Map(BUILT_LETTERS.map(([char, base, op]) => [char, { base, op }]));

const isTransform = (op: BuiltOp): op is LetterTransform => op === 'mirror' || op === 'turn';

const builtRecipe = (base: string, op: BuiltOp): LetterRecipe =>
  isTransform(op) ? { kind: 'transform', base, transform: op } : { kind: 'overlay', base, overlay: op };

const marksRecipe = (char: string): LetterRecipe | undefined => {
  const [base, ...combining] = [...char.normalize('NFD')];
  if (base === undefined || combining.length === 0) return undefined;
  const marks: string[] = [];
  for (const mark of combining) {
    const id = MARK_OF_COMBINING.get(mark.codePointAt(0) ?? 0);
    if (id === undefined) return undefined;
    marks.push(id);
  }
  return { kind: 'marks', base, marks };
};

const letterRecipe = (char: string): LetterRecipe | undefined => {
  const drawn = DRAWN_OF.get(char);
  if (drawn !== undefined) return { kind: 'drawn', letter: drawn };
  const built = BUILT_OF.get(char);
  if (built !== undefined) return builtRecipe(built.base, built.op);
  return marksRecipe(char);
};

export { letterRecipe };
