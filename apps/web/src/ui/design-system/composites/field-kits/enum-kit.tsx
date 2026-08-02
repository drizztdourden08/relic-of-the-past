/* @layer renderer-components @kind component */
/**
 * A closed set of literals. Filtering asks "is it any of these", so the filter
 * control is a multi-select; editing sets one value, so the editor picks one.
 * Those are two different questions about the same field and the kit
 * deliberately does not conflate them.
 *
 * The editor picks its control by how many options there are, because one
 * control cannot read well across the whole range: a segmented track is a
 * single fixed-width row that stays crisp for a handful of short labels and
 * gets cramped past that; chips wrap, so they carry the rest of what inference
 * is willing to call a closed set; anything wider than that is a list, and a
 * list belongs in a dropdown.
 *
 * All three tiers are closed by construction, and the set they close over is
 * only what inference has seen — so every one of them is wrapped in the same
 * escape hatch rather than any tier being singled out. See `open-set.ts` and
 * `sub-components/OpenSetControl.tsx`; the tier is chosen from the set the
 * control will actually show, so a value entered through the hatch counts
 * towards it like any other.
 */
import type { ReactNode } from 'react';
import { registerFieldTester } from '../../data/filter/tester-registry';
import { ENUM_MAX } from '../../data/schema/infer-kind';
import { Badge } from '../../primitives/Badge';
import { SegmentedControl } from '../../primitives/SegmentedControl';
import { Select } from '../../primitives/Select';
import { Text } from '../../primitives/Text';
import { isNullish, toText } from './coerce';
import { withCurrentValue } from './open-set';
import { registerFieldKit } from './registry';
import { EnumMultiSelect } from './sub-components/EnumMultiSelect';
import { EnumTagSelect } from './sub-components/EnumTagSelect';
import { OpenSetControl } from './sub-components/OpenSetControl';
import type { EditorControlProps, FieldTypeStrategy, FilterControlProps } from './registry';
import type { FieldDescriptor } from '../../data/schema/field-descriptor';
import type { SegmentOption } from '../../primitives/SegmentedControl';
import type { SelectOption } from '../../primitives/Select';
import './field-kits.css';

const ABSENT = '—';

/** Up to this many options fit one segmented track without crowding. */
const SEGMENT_MAX = 4;

/** Chips carry the rest of the closed set — by construction nothing exceeds this. */
const TAG_MAX = ENUM_MAX;

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

const optionsOf = (options: readonly string[] | undefined): SelectOption[] =>
  (options ?? []).map((option) => ({ value: option, label: option }));

const segmentsOf = (options: readonly string[]): SegmentOption[] =>
  options.map((option) => ({ value: option, label: option }));

const FilterControl = (props: FilterControlProps) => {
  const { field, value, onChange } = props;
  return (
    <EnumMultiSelect
      options={field.options ?? []}
      selected={toSelection(value)}
      placeholder={field.label}
      onChange={(selected) => onChange([...selected])}
    />
  );
};

interface ClosedSetProps {
  field: FieldDescriptor;
  /** Already merged with the current value — the tier follows what is shown. */
  options: readonly string[];
  current: string;
  disabled?: boolean;
  onChange: (value: unknown) => void;
}

const closedSetControl = (props: ClosedSetProps): ReactNode => {
  const { field, options, current, disabled, onChange } = props;

  if (options.length > 0 && options.length <= SEGMENT_MAX) {
    return (
      <SegmentedControl
        value={current}
        options={segmentsOf(options)}
        disabled={disabled}
        onChange={onChange}
        // Re-clicking the active segment clears the field — allowed only
        // where the schema says absence is legal, same gate as the chip tier.
        onDeselect={field.optional ? () => onChange('') : undefined}
      />
    );
  }

  if (options.length > 0 && options.length <= TAG_MAX) {
    return (
      <EnumTagSelect
        id={field.path}
        options={options}
        selected={current ? [current] : []}
        disabled={disabled}
        single
        onChange={(selected) => {
          // Re-clicking the active chip clears the field, which the segmented
          // track and the dropdown cannot do — allowed only where the schema
          // says absence is legal.
          const [next] = selected;
          if (next !== undefined || field.optional) onChange(next ?? '');
        }}
      />
    );
  }

  return (
    <Select
      value={current}
      options={optionsOf(options)}
      placeholder={field.label}
      disabled={disabled}
      onChange={onChange}
    />
  );
};

const EditorControl = (props: EditorControlProps) => {
  const { field, value, onChange, disabled } = props;
  const current = toText(value);
  const options = withCurrentValue(field.options ?? [], current);

  return (
    <OpenSetControl
      current={current}
      label={field.label}
      disabled={disabled}
      onSubmit={onChange}
    >
      {closedSetControl({ field, options, current, disabled, onChange })}
    </OpenSetControl>
  );
};

const renderCell = (value: unknown): ReactNode => {
  if (isNullish(value) || value === '') return <Text className="field-kit__muted">{ABSENT}</Text>;
  return <Badge variant="neutral">{toText(value)}</Badge>;
};

const enumKit: FieldTypeStrategy = { kind: 'enum', FilterControl, EditorControl, renderCell };

registerFieldTester('enum', { test });
registerFieldKit(enumKit);

export { enumKit };
