/* @layer shared-game @kind data */
/**
 * The pond rows of the option catalog: synthetic, unlocked, group 'items', a
 * block per pond under one switch that shares a single block across all three.
 * Only a `pond_<id>_mode` row is meant to be read on its own; the value rows
 * behind it are rendered by that pond's block. Every
 * baseline is a row the pond's own default writes through the one writer the
 * creation form uses, so a fresh profile and a bare catalog freeze can never
 * disagree. Descriptions merge in from options-descriptions.data.ts like
 * every other row.
 */
import { CURVE_LABELS } from './capacity/curves/curves.data';
import { pondValuesOf } from './pond/pond-from-snapshot';
import { POND_INSTANCES } from './pond/pond-instances.data';
import { defaultPondSettingOf } from './pond/pond-profile-defaults';
import { POND_MAX_ITEMS, POND_MAX_THROWS, POND_PRICE_LADDER } from './pond/pond-ladder.data';
import { POND_FIELDS, pondKeyOf } from './pond/pond-option-keys';
import { POND_ASK_BOTTLE_CONTENTS, POND_ASK_ROWS, POND_BOTTLE_ROW } from './pond/pond-ask.data';
import { POND_SHARE_KEY } from './pond/pond-share';
import {
  pondAskBottleContentKeyOf, pondAskBottleKeyOf, pondAskItemKeyOf, pondAskKeyOf,
  pondAskMaxKeyOf, pondAskMinKeyOf,
} from './pond/pond-ask-keys';
import type { PondAskRow } from './pond/pond-ask.data';
import type { PondField } from './pond/pond-option-keys';
import type { PondInstance } from './pond/pond-instance.type';
import type { ApOptionChoice, ApOptionDef, ApOptionValue } from './options.type';

type Seed = Omit<ApOptionDef, 'description'>;

const POND_MODE_CHOICES: readonly ApOptionChoice[] = [
  { value: 'capacity', apValue: 0, label: 'Vanilla grants' },
  { value: 'vanilla-cost', apValue: 1, label: 'Vanilla cost' },
  { value: 'custom', apValue: 2, label: 'Custom' },
];

const POND_CURVE_CHOICES: readonly ApOptionChoice[] = (
  ['equal', 'front', 'ramp', 'reverse-fib', 'geometric', 'free'] as const
).map((curve, index) => ({ value: curve, apValue: index, label: CURVE_LABELS[curve] }));

const PRICE_CHOICES: readonly ApOptionChoice[] = POND_PRICE_LADDER.map((value) => ({
  value: String(value),
  apValue: value,
  label: value === 0 ? 'free' : `${value} rupees`,
}));

/** The seven rows a fresh profile freezes for one pond; each seed takes its baseline from here. */
const defaultRowsOf = (pond: PondInstance): Readonly<Record<string, ApOptionValue>> =>
  pondValuesOf(defaultPondSettingOf(pond.id), pond);

const seedOf = (pond: PondInstance, field: PondField, rows: Readonly<Record<string, ApOptionValue>>): Seed => {
  const key = pondKeyOf(pond, field);
  const value = rows[key];
  const base = { key, group: 'items' as const, implementation: 'active' as const, locked: false, synthetic: true, apDefault: value, baseline: value };
  switch (field) {
    case 'mode':
      return { ...base, displayName: pond.label, kind: 'choice', choices: POND_MODE_CHOICES };
    case 'throws':
      return { ...base, displayName: `${pond.label} throws`, kind: 'range', range: { min: 1, max: POND_MAX_THROWS } };
    case 'items':
      return { ...base, displayName: `${pond.label} pool items`, kind: 'range', range: { min: 0, max: POND_MAX_ITEMS } };
    case 'curve':
      return { ...base, displayName: `${pond.label} price curve`, kind: 'choice', choices: POND_CURVE_CHOICES };
    case 'jumps':
      return { ...base, displayName: `${pond.label} price jumps`, kind: 'text' };
  }
};

/** The amounts one counted demand row offers, as the choice rows spell them. */
const amountChoicesOf = (stops: readonly number[]): readonly ApOptionChoice[] => stops.map((value) => ({
  value: String(value),
  apValue: value,
  label: value === 0 ? 'free' : String(value),
}));

const askToggle = (key: string, displayName: string, value: ApOptionValue): Seed => ({
  key, displayName, group: 'items', kind: 'toggle', implementation: 'active',
  locked: false, synthetic: true, apDefault: value, baseline: value,
});

const askChoice = (
  key: string, displayName: string, choices: readonly ApOptionChoice[], value: ApOptionValue,
): Seed => ({
  key, displayName, group: 'items', kind: 'choice', choices, implementation: 'active',
  locked: false, synthetic: true, apDefault: value, baseline: value,
});

/** The two ends of one counted row, which the curve reads a rung's amount into. */
const rangeSeedsOf = (
  pond: PondInstance, row: PondAskRow, rows: Readonly<Record<string, ApOptionValue>>,
): Seed[] => {
  const { currency, label, stops } = row;
  const choices = currency === 'rupees' ? PRICE_CHOICES : amountChoicesOf(stops);
  const min = pondAskMinKeyOf(pond, currency);
  const max = pondAskMaxKeyOf(pond, currency);
  return [
    askChoice(min, `${pond.label} ${label.toLowerCase()} at the first rung`, choices, rows[min]),
    askChoice(max, `${pond.label} ${label.toLowerCase()} at the last rung`, choices, rows[max]),
  ];
};

/** One pond's ask block: a row per demand she may make, and the range each counted one is drawn from. */
const askSeedsOf = (pond: PondInstance, rows: Readonly<Record<string, ApOptionValue>>): Seed[] => {
  const at = (key: string): ApOptionValue => rows[key];
  const counted = POND_ASK_ROWS.flatMap((row) => [
    askToggle(pondAskKeyOf(pond, row.currency), `${pond.label} asks for ${row.label.toLowerCase()}`,
      at(pondAskKeyOf(pond, row.currency))),
    ...rangeSeedsOf(pond, row, rows),
  ]);
  return [
    ...counted,
    askToggle(pondAskBottleKeyOf(pond), `${pond.label} asks for a bottle`, at(pondAskBottleKeyOf(pond))),
    ...rangeSeedsOf(pond, POND_BOTTLE_ROW, rows),
    ...POND_ASK_BOTTLE_CONTENTS.map(({ content, label }) => askToggle(
      pondAskBottleContentKeyOf(pond, content), `${pond.label} may ask for ${label.toLowerCase()}`,
      at(pondAskBottleContentKeyOf(pond, content)))),
    askToggle(pondAskItemKeyOf(pond), `${pond.label} asks to see an item`, at(pondAskItemKeyOf(pond))),
  ];
};

const seedsOf = (pond: PondInstance): Seed[] => {
  const rows = defaultRowsOf(pond);
  return [...POND_FIELDS.map((field) => seedOf(pond, field, rows)), ...askSeedsOf(pond, rows)];
};

/** The switch belonging to no single pond: all three read the capacity pond's rows. */
const POND_SHARE_SEED: Seed = askToggle(POND_SHARE_KEY, 'Ponds share one setting', false);

const POND_OPTION_SEEDS: readonly Seed[] = [POND_SHARE_SEED, ...POND_INSTANCES.flatMap(seedsOf)];

export { POND_CURVE_CHOICES, POND_MODE_CHOICES, POND_OPTION_SEEDS, PRICE_CHOICES };
