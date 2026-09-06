/* @layer shared-game @kind data */
/**
 * The seven pond rows of the option catalog: synthetic, unlocked, group
 * 'items'. Only `pond_mode` is meant to be read on its own; the six value
 * rows sit behind it and the pond block renders them. Every baseline is a row
 * DEFAULT_POND_SETTING writes through the one writer the creation form uses,
 * so a fresh profile and a bare catalog freeze can never disagree.
 * Descriptions merge in from options-descriptions.data.ts like every other row.
 */
import { CURVE_LABELS } from './capacity/curves/curves.data';
import { pondValuesOf } from './pond/pond-from-snapshot';
import { DEFAULT_POND_SETTING } from './pond/pond-profile-defaults';
import { POND_MAX_ITEMS, POND_MAX_THROWS, POND_PRICE_LADDER } from './pond/pond-ladder.data';
import { pondKeyOf } from './pond/pond-option-keys';
import type { PondField } from './pond/pond-option-keys';
import type { ApOptionChoice, ApOptionDef } from './options.type';

type Seed = Omit<ApOptionDef, 'description'>;

const POND_MODE_CHOICES: readonly ApOptionChoice[] = [
  { value: 'capacity', apValue: 0, label: 'Capacity upgrades' },
  { value: 'vanilla-cost', apValue: 1, label: 'Vanilla cost' },
  { value: 'custom', apValue: 2, label: 'Custom' },
  { value: 'gamble', apValue: 3, label: 'Gamble' },
];

const POND_CURVE_CHOICES: readonly ApOptionChoice[] = (
  ['equal', 'front', 'ramp', 'reverse-fib', 'geometric', 'free'] as const
).map((curve, index) => ({ value: curve, apValue: index, label: CURVE_LABELS[curve] }));

const PRICE_CHOICES: readonly ApOptionChoice[] = POND_PRICE_LADDER.map((value) => ({
  value: String(value),
  apValue: value,
  label: value === 0 ? 'free' : `${value} rupees`,
}));

/** The seven rows a fresh profile freezes; each seed below takes its baseline from here. */
const DEFAULT_ROWS = pondValuesOf(DEFAULT_POND_SETTING);

const seedOf = (field: PondField): Seed => {
  const key = pondKeyOf(field);
  const value = DEFAULT_ROWS[key];
  const base = { key, group: 'items' as const, implementation: 'active' as const, locked: false, synthetic: true, apDefault: value, baseline: value };
  switch (field) {
    case 'mode':
      return { ...base, displayName: 'Wishing pond', kind: 'choice', choices: POND_MODE_CHOICES };
    case 'start':
      return { ...base, displayName: 'Pond first price', kind: 'choice', choices: PRICE_CHOICES };
    case 'max':
      return { ...base, displayName: 'Pond final price', kind: 'choice', choices: PRICE_CHOICES };
    case 'throws':
      return { ...base, displayName: 'Pond throws', kind: 'range', range: { min: 1, max: POND_MAX_THROWS } };
    case 'items':
      return { ...base, displayName: 'Pond pool items', kind: 'range', range: { min: 0, max: POND_MAX_ITEMS } };
    case 'curve':
      return { ...base, displayName: 'Pond price curve', kind: 'choice', choices: POND_CURVE_CHOICES };
    case 'jumps':
      return { ...base, displayName: 'Pond price jumps', kind: 'text' };
  }
};

const POND_OPTION_SEEDS: readonly Seed[] =
  (['mode', 'start', 'max', 'throws', 'items', 'curve', 'jumps'] as const).map(seedOf);

export { POND_CURVE_CHOICES, POND_MODE_CHOICES, POND_OPTION_SEEDS, PRICE_CHOICES };
