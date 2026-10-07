/* @layer renderer-components @kind component */
/**
 * True or false. Both operators take no operand, so the filter row is the
 * operator and nothing else, with no control to render.
 *
 * Matching is strict: a field that is absent is neither true nor false, and a
 * row that never recorded the flag should not be swept up by `is false`.
 */
import type { ReactNode } from 'react';
import { registerFieldTester } from '../../data/filter/tester-registry';
import { registerComparator, registerGroupKey } from '../../data/table/strategy-registry';
import { Badge } from '../../primitives/Badge';
import { Text } from '../../primitives/Text';
import { Toggle } from '../../primitives/Toggle';
import { isNullish } from './coerce';
import { nullsLast } from './compare';
import { registerFieldKit } from './registry';
import type { EditorControlProps, FieldTypeStrategy } from './registry';
import './field-kits.css';

const YES = 'Yes';
const NO = 'No';
const ABSENT = '-';

const test = (value: unknown, op: string): boolean => {
  if (op === 'isTrue') return value === true;
  if (op === 'isFalse') return value === false;
  return true;
};

const compare = nullsLast((a, b) => Number(a === true) - Number(b === true));

/** Buckets read the same as the cells, so a grouped column stays legible. */
const groupKey = (value: unknown): string => {
  if (isNullish(value)) return '';
  return value === true ? YES : NO;
};

/** Both operators are arity 'none', so this kind never renders a filter control. */
const FilterControl = () => null;

const EditorControl = (props: EditorControlProps) => {
  const { value, onChange, disabled } = props;
  return <Toggle checked={value === true} disabled={disabled} onChange={onChange} />;
};

const renderCell = (value: unknown): ReactNode => {
  if (isNullish(value)) return <Text className="field-kit__muted">{ABSENT}</Text>;
  return <Badge variant={value === true ? 'success' : 'neutral'}>{value === true ? YES : NO}</Badge>;
};

const booleanKit: FieldTypeStrategy = { kind: 'boolean', FilterControl, EditorControl, renderCell };

registerFieldTester('boolean', { test });
registerComparator('boolean', compare);
registerGroupKey('boolean', groupKey);
registerFieldKit(booleanKit);

export { booleanKit };
