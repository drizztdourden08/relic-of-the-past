/* @layer renderer-components @kind component */
/**
 * Free text. Every comparison here folds case by default, including `is` and
 * `is not`: one rule across the whole kind is easier to predict than a filter
 * where three operators ignore case and two do not.
 *
 * A clause can opt out of the folding one clause at a time (the "match case"
 * modifier in the operator dropdown), which then applies to every text
 * operator for the same reason. Exact matching with no opt-in at all is what
 * the id-reference kind is for, and that is where machine values live.
 */
import type { ReactNode } from 'react';
import { findOperator } from '../../data/filter/operators';
import { registerFieldTester } from '../../data/filter/tester-registry';
import { registerComparator } from '../../data/table/strategy-registry';
import { Text } from '../../primitives/Text';
import { TextInput } from '../../primitives/TextInput';
import { toText } from './coerce';
import { naturalTextCompare, nullsLast } from './compare';
import { isEmptyValue } from './emptiness';
import { registerFieldKit } from './registry';
import type { EditorControlProps, FieldTypeStrategy, FilterControlProps } from './registry';
import type { FilterTestOptions } from '../../data/filter/tester-registry';
import './field-kits.css';

const test = (
  value: unknown,
  op: string,
  operand: unknown,
  options?: FilterTestOptions,
): boolean => {
  if (op === 'isEmpty') return isEmptyValue(value);
  if (op === 'isNotEmpty') return !isEmptyValue(value);
  const fold = (text: string): string => (options?.caseSensitive ? text : text.toLowerCase());
  const text = fold(toText(value));
  const needle = fold(toText(operand));
  if (op === 'contains') return text.includes(needle);
  if (op === 'startsWith') return text.startsWith(needle);
  if (op === 'endsWith') return text.endsWith(needle);
  if (op === 'eq') return text === needle;
  if (op === 'neq') return text !== needle;
  return true;
};

const FilterControl = (props: FilterControlProps) => {
  const { field, op, value, onChange } = props;
  if (findOperator(field.kind, op)?.arity === 'none') return null;
  return (
    <TextInput
      value={toText(value)}
      placeholder={field.label}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};

const EditorControl = (props: EditorControlProps) => {
  const { field, value, onChange, disabled } = props;
  return (
    <TextInput
      value={toText(value)}
      placeholder={field.label}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};

const renderCell = (value: unknown): ReactNode => {
  const text = toText(value);
  return <Text className="field-kit__text" title={text}>{text}</Text>;
};

const stringKit: FieldTypeStrategy = { kind: 'string', FilterControl, EditorControl, renderCell };

registerFieldTester('string', { test });
registerComparator('string', nullsLast(naturalTextCompare));
registerFieldKit(stringKit);

export { stringKit };
