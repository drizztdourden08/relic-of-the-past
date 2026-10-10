/* @layer renderer-components @kind constants */
import type { FormulaName } from './formula-catalog.type';

const SCOPE_NOTES: Readonly<Record<'index' | 'count' | 'item', string>> = {
  index: 'Which instance this is, from 0 to count−1.',
  count: 'How many instances there are.',
  item: "This instance's own value, from the repeat's item formula.",
};

const OUTSIDE_REPEAT = 'Exists inside a repeat. This node is not in one.';
const NOT_A_TRANSITION = "Exists on a transition's when. This field is not one.";

const DELTA_NOTE = 'How much the bound value just changed by.';

const OPERATORS: readonly FormulaName[] = [
  { name: '+ − * / %', note: 'Arithmetic. ^ is power, not xor.' },
  { name: '== != < <= > >=', note: 'Yields true/false, which reads back as 1/0. Every gate works this way.' },
  { name: 'and', note: 'Both. Never &&, which is a parse error.' },
  { name: 'or', note: 'Either. Never ||, which joins text and answers a wrong number.' },
  { name: 'not', note: 'The opposite.' },
  { name: 'if(test, then, else)', note: 'A choice. Reads better than ? : once nested.' },
];

const FUNCTIONS: readonly FormulaName[] = [
  { name: 'ceil', note: 'Up to the next whole number. This is how a container count is made.' },
  { name: 'floor', note: 'Down to the whole number below.' },
  { name: 'round', note: 'To the nearest whole number.' },
  { name: 'trunc', note: 'Drop the fraction, toward zero.' },
  { name: 'roundTo(x, dp)', note: 'To a given number of decimal places.' },
  { name: 'abs', note: 'Distance from zero.' },
  { name: 'sign', note: '−1, 0 or 1.' },
  { name: 'min(...)', note: 'The smallest. min(max(x, lo), hi) is the clamp idiom.' },
  { name: 'max(...)', note: 'The largest.' },
  { name: 'sqrt', note: 'Square root.' },
  { name: 'pow(a, b)', note: 'a to the power b. Same as a ^ b.' },
];

const CONSTANTS: readonly FormulaName[] = [
  { name: 'PI', note: 'Reserved. A variable may not be called PI.' },
  { name: 'E', note: 'Reserved. A variable may not be called E.' },
  { name: 'true / false', note: 'Reserved, and read back as 1 and 0.' },
];

export {
  CONSTANTS, DELTA_NOTE, FUNCTIONS, NOT_A_TRANSITION, OPERATORS, OUTSIDE_REPEAT, SCOPE_NOTES,
};
