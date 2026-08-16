/* @layer renderer-components @kind component */
/**
 * A closed set of literals. Filtering asks "is it any of these", so the filter
 * control is a multi-select; editing sets one value, so the editor picks one.
 * Those are two different questions about the same field and the kit
 * deliberately does not conflate them.
 *
 * Which control the editor offers, and whether it fits the row it lands in,
 * are decided in `closed-set-picker.tsx` — the first from the size of the set,
 * the second by measuring. This file is what the two questions are asked on
 * behalf of: the field, its labels, and the value written back.
 *
 * Every control here is closed by construction, and the set it closes over is
 * only what inference has seen — so all of them are wrapped in the same escape
 * hatch rather than any one being singled out. See `open-set.ts` and
 * `sub-components/OpenSetControl.tsx`; the control is chosen from the set that
 * will actually show, so a value entered through the hatch counts towards the
 * choice like any other.
 */
import type { ReactNode } from 'react';
import { registerFieldTester } from '../../data/filter/tester-registry';
import { Badge } from '../../primitives/Badge';
import { Text } from '../../primitives/Text';
import { hasNarrower, narrowControl, preferredControl, widthSignature } from './closed-set-picker';
import { isNullish, toText } from './coerce';
import { withCurrentValue } from './open-set';
import { registerFieldKit } from './registry';
import { EnumMultiSelect } from './sub-components/EnumMultiSelect';
import { OpenSetControl } from './sub-components/OpenSetControl';
import type { EditorControlProps, FieldTypeStrategy, FilterControlProps } from './registry';
import type { FieldDescriptor } from '../../data/schema/field-descriptor';
import './field-kits.css';

const ABSENT = '—';

const toSelection = (operand: unknown): readonly string[] => {
  if (Array.isArray(operand)) return operand.map(toText);
  return isNullish(operand) || operand === '' ? [] : [toText(operand)];
};

/** An empty selection is no constraint at all — a fresh clause must not hide every row. */
const test = (value: unknown, op: string, operand: unknown): boolean => {
  const selection = toSelection(operand);
  if (!selection.length) return true;
  const present = selection.includes(toText(value));
  if (op === 'anyOf') return present;
  if (op === 'noneOf') return !present;
  return true;
};

/**
 * Display text per option, keyed by the option as text. A declared set carries
 * its own labels; an observed one has nothing but the literal to show.
 */
const labelsOf = (field: FieldDescriptor): Readonly<Record<string, string>> => {
  const labels: Record<string, string> = {};
  for (const option of field.declaredOptions ?? []) labels[String(option.value)] = option.label;
  return labels;
};

/**
 * The chosen option in the type the record holds it in. A declared set is the
 * only place a non-string value can appear, and its own entry is the answer —
 * so a numeric field is written back as a number rather than as its digits.
 */
const valueOf = (field: FieldDescriptor, selected: string): string | number =>
  field.declaredOptions?.find((option) => String(option.value) === selected)?.value ?? selected;

const FilterControl = (props: FilterControlProps) => {
  const { field, value, onChange } = props;
  return (
    <EnumMultiSelect
      options={field.options ?? []}
      selected={toSelection(value)}
      placeholder={field.label}
      labels={labelsOf(field)}
      onChange={(selected) => onChange([...selected])}
    />
  );
};

const EditorControl = (props: EditorControlProps) => {
  const { field, value, onChange, disabled } = props;
  const current = toText(value);
  const options = withCurrentValue(field.options ?? [], current);
  const labels = labelsOf(field);
  // Every control here hands back the option as text, including the escape
  // hatch — so one place turns it back into the value the record holds.
  const commit = (next: unknown) => onChange(next === '' ? '' : valueOf(field, toText(next)));
  const pickerProps = { field, options, labels, current, disabled, onChange: commit };

  return (
    <OpenSetControl
      current={current}
      label={field.label}
      disabled={disabled}
      onSubmit={commit}
      fallback={hasNarrower(options) ? narrowControl(pickerProps) : undefined}
      fitSignature={widthSignature(options, labels)}
    >
      {preferredControl(pickerProps)}
    </OpenSetControl>
  );
};

const renderCell = (value: unknown, field: FieldDescriptor): ReactNode => {
  if (isNullish(value) || value === '') return <Text className="field-kit__muted">{ABSENT}</Text>;
  const text = toText(value);
  return <Badge variant="neutral">{labelsOf(field)[text] ?? text}</Badge>;
};

const enumKit: FieldTypeStrategy = { kind: 'enum', FilterControl, EditorControl, renderCell };

registerFieldTester('enum', { test });
registerFieldKit(enumKit);

export { enumKit };
