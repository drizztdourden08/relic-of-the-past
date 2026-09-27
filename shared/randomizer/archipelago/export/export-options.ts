/* @layer shared-game @kind logic */
/**
 * options.json: the whole option catalog, one row per key the player file may carry, plus the
 * two rows only the package reads: `seed_text`, the profile's seed, and `pre_rolled`, the values
 * and world model the app rolled from it (pre-rolled.ts).
 *
 * A choice row keeps the app's own spelling of each value and a numeric id for Archipelago to
 * store. When every value is a whole number the id IS that number, so a player file that writes
 * `50` and one that writes `"50"` read the same; otherwise the id is the value's position.
 */
import { optionCatalog } from '../../world/options.data';
import type { OptionDef } from '../../world/options.type';
import type { ExportedOption } from './export.type';

const WHOLE = /^\d+$/;

const choicesOf = (option: OptionDef): ExportedOption['choices'] => {
  const values = (option.choices ?? []).map((choice) => choice.value);
  const whole = values.every((value) => WHOLE.test(value));
  const lowered = new Set(values.map((value) => value.toLowerCase()));
  if (lowered.size !== values.length) throw new Error(`choice values differ only by case: ${option.key}`);
  return values.map((value, index) => ({ value, id: whole ? Number(value) : index }));
};

/** The numeric id the package stores for |value| of a choice row; undefined for a value it lacks. */
const choiceIdOf = (option: OptionDef, value: string): number | undefined =>
  choicesOf(option)?.find((choice) => choice.value === value)?.id;

const rowOf = (option: OptionDef): ExportedOption => {
  const base = {
    key: option.key,
    displayName: option.displayName,
    description: option.description,
    default: option.baseline,
    locked: option.locked,
  };
  if (option.kind === 'choice') {
    return { ...base, type: 'choice', choices: choicesOf(option), numeric: typeof option.baseline === 'number' };
  }
  if (option.kind === 'range') return { ...base, type: 'range', range: option.range ?? { min: 0, max: 0 } };
  return { ...base, type: option.kind };
};

const PACKAGE_ROWS: readonly ExportedOption[] = [
  {
    key: 'seed_text', type: 'text', displayName: 'Seed', default: '', locked: false,
    description: 'The profile seed the pre-rolled values were rolled from.',
  },
  {
    key: 'pre_rolled', type: 'dict', displayName: 'Pre-rolled values', default: {}, locked: false,
    description: 'Values and the world the app rolled for this profile. Written by the app.',
  },
];

const exportOptions = (): ExportedOption[] => [...optionCatalog.map(rowOf), ...PACKAGE_ROWS];

export { choiceIdOf, exportOptions };
