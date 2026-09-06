/* @layer shared-game @kind data */
/**
 * The 22 capacity rows of the option catalog — synthetic, unlocked, group
 * 'items': one generator per family (mode · start · max · count · curve ·
 * jumps; the meter has no curve rows) — behind the master switch that turns
 * the whole feature off, plus the one progressive switch
 * over every Custom family (on for a new profile). The four *_mode rows
 * are what the creation panel renders; the value rows sit behind them. Baselines are the
 * rows DEFAULT_CAPACITY_PROFILE writes through the one snapshot writer the
 * creation form uses, so a fresh profile and a bare catalog freeze can never
 * disagree; a family the profile leaves off Custom carries the values it
 * would start from (the vanilla rung, the ladder top, the family's count).
 * Rung 0, the empty tier, is a choice. Descriptions merge in from
 * options-descriptions.data.ts like every other row.
 */
import { FAMILIES, maxSpanOf } from './capacity/capacity-family';
import { METER_LEVEL_LABELS } from './capacity/capacity-ladders.data';
import { DEFAULT_CAPACITY_PROFILE } from './capacity/capacity-profile-defaults';
import { capacityValuesOf } from './capacity/capacity-profile-from-snapshot';
import {
  CAPACITY_ENABLED_KEY, CAPACITY_PROGRESSIVE_KEY, capacityFieldsOf, capacityKeyOf,
} from './capacity/capacity-option-keys';
import { CURVE_LABELS } from './capacity/curves/curves.data';
import type { CapacityFamily } from './capacity/capacity-family';
import type { CapacityField } from './capacity/capacity-option-keys';
import type { ApOptionChoice, ApOptionDef } from './options.type';

type Seed = Omit<ApOptionDef, 'description'>;

const MODE_CHOICES: readonly ApOptionChoice[] = [
  { value: 'vanilla', apValue: 0, label: 'Vanilla' },
  { value: 'vanilla-in-pool', apValue: 1, label: 'Vanilla in pool' },
  { value: 'custom', apValue: 2, label: 'Custom' },
];

const WALLET_MODE_CHOICES: readonly ApOptionChoice[] = MODE_CHOICES.filter((choice) => choice.value !== 'vanilla-in-pool');

const CURVE_CHOICES: readonly ApOptionChoice[] = (
  ['equal', 'front', 'ramp', 'reverse-fib', 'geometric', 'free'] as const
).map((curve, index) => ({ value: curve, apValue: index, label: CURVE_LABELS[curve] }));

const ladderChoices = (capacityFamily: CapacityFamily): ApOptionChoice[] =>
  capacityFamily.ladder.map((value, index) => ({
    value: String(value),
    apValue: value,
    label: capacityFamily.id === 'meter' ? METER_LEVEL_LABELS[index] : String(value),
  }));

/** The meter's rungs are cost tiers, not a size, so its two range rows say tier. */
const RUNG_NOUN = (family: CapacityFamily): string => (family.id === 'meter' ? 'tier' : 'max');

/** The 22 value rows a fresh profile freezes; each seed below takes its baseline from here. */
const DEFAULT_ROWS = capacityValuesOf(DEFAULT_CAPACITY_PROFILE);

const seedOf = (capacityFamily: CapacityFamily, field: CapacityField): Seed => {
  const { id, label } = capacityFamily;
  const key = capacityKeyOf(id, field);
  const value = DEFAULT_ROWS[key];
  const base = { key, group: 'items' as const, implementation: 'active' as const, locked: false, synthetic: true, apDefault: value, baseline: value };
  switch (field) {
    case 'mode':
      return { ...base, displayName: `${label} upgrades`, kind: 'choice', choices: id === 'wallet' ? WALLET_MODE_CHOICES : MODE_CHOICES };
    case 'start':
      return { ...base, displayName: `${label} starting ${RUNG_NOUN(capacityFamily)}`, kind: 'choice', choices: ladderChoices(capacityFamily) };
    case 'max':
      return { ...base, displayName: `${label} final ${RUNG_NOUN(capacityFamily)}`, kind: 'choice', choices: ladderChoices(capacityFamily) };
    case 'count':
      return { ...base, displayName: `${label} upgrade count`, kind: 'range', range: { min: 1, max: maxSpanOf(capacityFamily) } };
    case 'curve':
      return { ...base, displayName: `${label} upgrade curve`, kind: 'choice', choices: CURVE_CHOICES };
    case 'jumps':
      return { ...base, displayName: `${label} upgrade jumps`, kind: 'text' };
  }
};

const ENABLED_SEED: Seed = {
  key: CAPACITY_ENABLED_KEY, displayName: 'Capacity upgrades', group: 'items', kind: 'toggle',
  implementation: 'active', locked: false, synthetic: true, apDefault: true, baseline: true,
};

const PROGRESSIVE_SEED: Seed = {
  key: CAPACITY_PROGRESSIVE_KEY, displayName: 'Progressive capacity upgrades', group: 'items', kind: 'toggle',
  implementation: 'active', locked: false, synthetic: true, apDefault: true, baseline: true,
};

const CAPACITY_OPTION_SEEDS: readonly Seed[] = [
  ENABLED_SEED,
  ...FAMILIES.flatMap((capacityFamily) =>
    capacityFieldsOf(capacityFamily.id).map((field) => seedOf(capacityFamily, field))),
  PROGRESSIVE_SEED,
];

export { CAPACITY_OPTION_SEEDS };
