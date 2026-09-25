/* @layer renderer-components @kind constants */
/**
 * What the formula menu offers, and why it does not offer the three names that
 * only sometimes exist.
 *
 * SCOPE IS A UX FACT BEFORE IT IS A VALIDATION RULE. A menu that silently omits
 * `index` outside a repeat leaves an author who saw it yesterday convinced the
 * editor is broken; a menu that offers it there produces a formula that parses,
 * fails no name check the author can see, and resolves to 0 at runtime through
 * `resolve-value.ts`'s NaN fold. It is the worst of the three, because nothing ever
 * says so. So an out-of-scope name is listed, disabled, with its reason.
 *
 * THE OPERATOR LIST EXISTS TO MAKE ONE MISTAKE UNREACHABLE. `and` / `or` /
 * `not` are the logical operators in this grammar. `&&` is a parse error and
 * `||` was, until `concatenate: false` landed, a SILENT WRONG NUMBER. It
 * concatenated, and the numeric coercion downstream turned "1120" into 1120.
 * Neither spelling appears anywhere below, in any group, on purpose.
 *
 * The maths surface is the parser's real one after `assignment`, `fndef`,
 * `array`, `in` and `concatenate` are disabled, MINUS two families that are
 * enabled and useless here: the trigonometry (a HUD is axis-aligned) and the
 * list functions (`length`, `join`, `map`, `filter`, `fold`, `indexOf`, `fac`,
 * `gamma`), every one of which needs a string, an array or a function value
 * and so fails at evaluate time, not parse time. `random()` is refused
 * outright by `compile-expr.ts`.
 */
import { HUD_SCOPE_EXTRAS, HUD_VARIABLES } from '@shared/hud/data';

interface FormulaName {
  name: string;
  note: string;
  /** Absent means "available here"; present is the reason it is not. */
  unavailable?: string;
}

interface FormulaGroup {
  title: string;
  items: readonly FormulaName[];
}

const SCOPE_NOTES: Readonly<Record<string, string>> = {
  index: 'Which instance this is, from 0 to count−1.',
  count: 'How many instances there are.',
  item: "This instance's own value, from the repeat's item formula.",
};

const OUTSIDE_REPEAT = 'Exists inside a repeat. This node is not in one.';
const NOT_A_TRANSITION = "Exists on a transition's when. This field is not one.";

const DELTA_NOTE = 'How much the bound value just changed by.';

const scopeGroup = (insideRepeat: boolean): FormulaGroup => ({
  title: insideRepeat ? 'Inside this repeat' : 'Only inside a repeat',
  items: HUD_SCOPE_EXTRAS.map((name) => ({
    name,
    note: SCOPE_NOTES[name],
    unavailable: insideRepeat ? undefined : OUTSIDE_REPEAT,
  })),
});

const gameGroup = (): FormulaGroup => ({
  title: 'From the game',
  items: HUD_VARIABLES.map((entry) => ({ name: entry.name, note: entry.note })),
});

const deltaGroup = (extraNames: readonly string[]): FormulaGroup => ({
  title: 'On this transition',
  items: [{
    name: 'delta',
    note: DELTA_NOTE,
    unavailable: extraNames.includes('delta') ? undefined : NOT_A_TRANSITION,
  }],
});

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

/** Every group the menu shows, in the order it shows them: what this field can
 *  read first, then what it can do with it. */
const formulaGroups = (context: {
  insideRepeat: boolean; extraNames?: readonly string[];
}): readonly FormulaGroup[] => {
  const extras = context.extraNames ?? [];
  return [
    ...(context.insideRepeat ? [scopeGroup(true)] : []),
    gameGroup(),
    ...(context.insideRepeat ? [] : [scopeGroup(false)]),
    ...(extras.includes('delta') ? [deltaGroup(extras)] : []),
    { title: 'Operators', items: OPERATORS },
    { title: 'Functions', items: FUNCTIONS },
    { title: 'Reserved', items: CONSTANTS },
  ];
};

export { formulaGroups, OUTSIDE_REPEAT };
export type { FormulaGroup, FormulaName };
