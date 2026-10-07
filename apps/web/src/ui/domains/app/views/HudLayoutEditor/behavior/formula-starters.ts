/* @layer renderer-components @kind constants */
/**
 * The corpus is ten formulas. Counted, not estimated: across the three built-in
 * layouts and the six presets there are 44 bound expressions and 10 distinct
 * ones, of which 24 occurrences are a bare variable name and the rest are four
 * shapes. Every formula anyone is likely to write next is another instance of
 * one of them, so they are offered as sentences with the formula as the
 * subtitle, so each is legible before it is chosen and learnable after.
 *
 * THE PAIRS ARE GENERATED, NOT LISTED. `variables.ts`'s own `<thing>_current` /
 * `<thing>_max` convention makes "a fraction of its maximum" derivable, so
 * adding a sixth resource to the table adds its fraction here for free.
 *
 * `select` is the substring the field should leave selected after inserting, so
 * the next keystroke REPLACES the part the author still has to decide rather
 * than appending to it.
 */
import { HUD_VARIABLES } from '@shared/hud/data';

interface FormulaStarter {
  /** A sentence, not a formula. The formula is the subtitle. */
  title: string;
  expr: string;
  /** The first part the author has to decide, left selected on insert. */
  select?: string;
}

type StarterRole = 'number' | 'gate';

const pairedNames = (): readonly string[] => HUD_VARIABLES
  .map((entry) => entry.name)
  .filter((name) => name.endsWith('_current'))
  .map((name) => name.slice(0, -'_current'.length))
  .filter((stem) => HUD_VARIABLES.some((entry) => entry.name === `${stem}_max`));

const fractions = (): readonly FormulaStarter[] => pairedNames().map((stem) => ({
  title: `${stem} as a fraction of its maximum`,
  expr: `${stem}_current / ${stem}_max`,
  select: `${stem}_current`,
}));

/** Eighths are a domain constant, not a magic number: one heart is 8, so a
 *  capacity of 160 is 20 containers. */
const CONTAINER_SIZE = 8;

const NUMBER_STARTERS: readonly FormulaStarter[] = [
  {
    title: 'how many containers a capacity is worth',
    expr: `ceil(life_max / ${CONTAINER_SIZE})`,
    select: 'life_max',
  },
  ...fractions(),
];

const REPEAT_NUMBER_STARTERS: readonly FormulaStarter[] = [
  {
    title: "this instance's slice of a total",
    expr: `min(max(life_current - index * ${CONTAINER_SIZE}, 0), ${CONTAINER_SIZE}) / ${CONTAINER_SIZE}`,
    select: 'life_current',
  },
  { title: 'a stagger, in milliseconds per instance', expr: 'index * 80', select: '80' },
];

const GATE_STARTERS: readonly FormulaStarter[] = [
  { title: 'a value is above zero', expr: 'arrow_current > 0', select: 'arrow_current' },
  { title: 'an upgrade is owned', expr: 'silver_arrows > 0', select: 'silver_arrows' },
  {
    title: 'two things at once, joined by and instead of &&',
    expr: 'arrow_current > 0 and silver_arrows > 0',
    select: 'arrow_current',
  },
];

const REPEAT_GATE_STARTERS: readonly FormulaStarter[] = [
  { title: 'this is the last instance', expr: 'index == count - 1' },
  { title: 'this instance is empty', expr: 'item < 1' },
];

/**
 * A `count` is never offered a comparison and a `when` is never offered a
 * fraction. A flat palette of every function cannot do that, and it is the
 * reason the starters beat one.
 */
const formulaStarters = (context: {
  role: StarterRole; insideRepeat: boolean;
}): readonly FormulaStarter[] => {
  const { role, insideRepeat } = context;
  const base = role === 'gate' ? GATE_STARTERS : NUMBER_STARTERS;
  const scoped = role === 'gate' ? REPEAT_GATE_STARTERS : REPEAT_NUMBER_STARTERS;
  return insideRepeat ? [...scoped, ...base] : base;
};

export { formulaStarters };
export type { FormulaStarter, StarterRole };
