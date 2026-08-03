/* @layer renderer-components @kind component */
/**
 * Numbers. The comparator is the reason this kit exists at all: the core's
 * generic fallback stringifies, and `'10' < '9'`, so a numeric column sorts
 * wrong until a real comparator is registered here.
 */
import type { ReactNode } from 'react';
import { registerFieldTester } from '../../data/filter/tester-registry';
import { registerComparator } from '../../data/table/strategy-registry';
import { NumberInput } from '../../primitives/NumberInput';
import { Text } from '../../primitives/Text';
import { toNumber, toText } from './coerce';
import { nullsLast } from './compare';
import { registerFieldKit } from './registry';
import { NumberRange } from './sub-components/NumberRange';
import type { EditorControlProps, FieldTypeStrategy, FilterControlProps } from './registry';
import './field-kits.css';

/** Either end may be missing; a missing end is unbounded, and ends may be swapped. */
const testBetween = (subject: number, operand: unknown): boolean => {
  const [rawLow, rawHigh] = Array.isArray(operand) ? operand : [operand, operand];
  const low = toNumber(rawLow);
  const high = toNumber(rawHigh);
  const from = Number.isFinite(low) ? low : -Infinity;
  const to = Number.isFinite(high) ? high : Infinity;
  return subject >= Math.min(from, to) && subject <= Math.max(from, to);
};

/**
 * A row with no number here matches only `is not` — "does not hold 5" is true of
 * a row that holds nothing, while "is greater than 5" is not.
 */
const test = (value: unknown, op: string, operand: unknown): boolean => {
  const subject = toNumber(value);
  if (!Number.isFinite(subject)) return op === 'neq';
  if (op === 'between') return testBetween(subject, operand);
  const target = toNumber(operand);
  if (!Number.isFinite(target)) return true;
  if (op === 'eq') return subject === target;
  if (op === 'neq') return subject !== target;
  if (op === 'gt') return subject > target;
  if (op === 'gte') return subject >= target;
  if (op === 'lt') return subject < target;
  if (op === 'lte') return subject <= target;
  return true;
};

const compare = nullsLast((a, b) => {
  const left = toNumber(a);
  const right = toNumber(b);
  if (!Number.isFinite(left) && !Number.isFinite(right)) return 0;
  if (!Number.isFinite(left)) return 1;
  if (!Number.isFinite(right)) return -1;
  return left - right;
});

const inputValue = (value: unknown): number | string => {
  const parsed = toNumber(value);
  return Number.isFinite(parsed) ? parsed : '';
};

const FilterControl = (props: FilterControlProps) => {
  const { field, op, value, onChange } = props;
  if (op === 'between') return <NumberRange value={value} onChange={onChange} />;
  return (
    <NumberInput
      value={inputValue(value)}
      placeholder={field.label}
      onChange={(entered) => onChange(Number.isNaN(entered) ? null : entered)}
    />
  );
};

/** Bounds are the caller's to supply; with none the field stays open at both ends. */
const EditorControl = (props: EditorControlProps) => {
  const { field, value, onChange, disabled, bounds } = props;
  return (
    <NumberInput
      value={inputValue(value)}
      placeholder={field.label}
      min={bounds?.min}
      max={bounds?.max}
      step={bounds?.step}
      disabled={disabled}
      onChange={(entered) => onChange(Number.isNaN(entered) ? null : entered)}
    />
  );
};

const renderCell = (value: unknown): ReactNode => {
  const text = toText(value);
  return <Text className="field-kit__num" title={text}>{text}</Text>;
};

const numberKit: FieldTypeStrategy = { kind: 'number', FilterControl, EditorControl, renderCell };

registerFieldTester('number', { test });
registerComparator('number', compare);
registerFieldKit(numberKit);

export { numberKit };
