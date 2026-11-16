/* @layer shared-game @kind constants */
import { BUILT_LETTERS } from '../built-letters.constants';
import { DRAWN_CAPITALS_EXT_B } from '../drawn-capitals-ext-b.constants';
import { DRAWN_LETTERS } from '../drawn-letters.constants';
import { DRAWN_SMALL_EXT_B } from '../drawn-small-ext-b.constants';

const LEADING_APOSTROPHE_SHIFT = 2;
const ABOVE_GAP = 1;
const BELOW_GAP = 2;
const PAIR_GAP = 1;
const BELOW_NUDGES: readonly number[] = [0, 1, -1, 2, -2, 3];
const PLAIN_LETTER = /^[A-Za-z]$/u;
const ANY_LETTER = /^\p{L}$/u;
const DRAWN_OF = new Map(
  [...DRAWN_LETTERS, ...DRAWN_CAPITALS_EXT_B, ...DRAWN_SMALL_EXT_B].map((letter) => [letter.char, letter]),
);
const BUILT_OF = new Map(BUILT_LETTERS.map(([char, base, op]) => [char, { base, op }]));

export {
  ABOVE_GAP, ANY_LETTER, BELOW_GAP, BELOW_NUDGES, BUILT_OF, DRAWN_OF, LEADING_APOSTROPHE_SHIFT, PAIR_GAP, PLAIN_LETTER,
};
