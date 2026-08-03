/* @layer renderer-components @kind component */
/**
 * A `<prefix>-<digits>` value pointing at a record in another collection.
 *
 * Matching is EXACT (trimmed, case-sensitive) — these are machine values, not
 * prose, and the text kind is where forgiving matching belongs.
 *
 * The cell renders the id as a marked reference and publishes what it points at
 * on `data-id-ref` / `data-target-kind`. It deliberately does NOT navigate: this
 * package has no business knowing what collections exist. The screen that owns
 * the data resolves the id to a name and handles the click — see the handoff
 * note on `renderCell` below.
 *
 * Editing is the same handoff in the other direction. Given a resolver the
 * editor becomes a searchable picker over the real target collection; given
 * none — or a target it cannot answer for — it stays the plain input it has
 * always been, so the kit still works with nothing wired to it.
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
import { formatIdRefDisplay } from './id-ref-format';
import { registerFieldKit } from './registry';
import { IdRefSelect } from './sub-components/IdRefSelect';
import type {
  CellRenderOptions, EditorControlProps, FieldTypeStrategy, FilterControlProps,
  IdRefOption, IdRefOptionResolver,
} from './registry';
import type { FieldDescriptor } from '../../data/schema/field-descriptor';
import './field-kits.css';

const ABSENT = '—';

const NO_OPTIONS: readonly IdRefOption[] = [];

const lookup = (
  field: FieldDescriptor,
  resolve: IdRefOptionResolver | undefined,
): readonly IdRefOption[] =>
  resolve && field.targetKind ? resolve(field.targetKind, field) : NO_OPTIONS;

const test = (value: unknown, op: string, operand: unknown): boolean => {
  if (op === 'isEmpty') return isEmptyValue(value);
  if (op === 'isNotEmpty') return !isEmptyValue(value);
  const id = toText(value).trim();
  const target = toText(operand).trim();
  if (!target) return true;
  if (op === 'eq') return id === target;
  if (op === 'neq') return id !== target;
  return true;
};

const IdInput = (props: { placeholder: string; value: unknown; disabled?: boolean; onChange: (value: unknown) => void }) => {
  const { placeholder, value, disabled, onChange } = props;
  return (
    <TextInput
      value={toText(value)}
      placeholder={placeholder}
      disabled={disabled}
      spellCheck={false}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};

const FilterControl = (props: FilterControlProps) => {
  const { field, op, value, onChange } = props;
  if (findOperator(field.kind, op)?.arity === 'none') return null;
  return <IdInput placeholder={field.label} value={value} onChange={onChange} />;
};

const EditorControl = (props: EditorControlProps) => {
  const { field, value, onChange, disabled, resolveIdRefOptions } = props;
  const options = lookup(field, resolveIdRefOptions);
  if (!options.length) {
    return <IdInput placeholder={field.label} value={value} disabled={disabled} onChange={onChange} />;
  }
  return (
    <IdRefSelect
      options={options}
      value={toText(value)}
      placeholder={field.label}
      disabled={disabled}
      onChange={onChange}
    />
  );
};

/**
 * Handoff: the id and its target collection are on the element as
 * `data-id-ref` / `data-target-kind`. A screen that knows the domain wraps this
 * output (or delegates from the row) and reads those attributes to resolve a
 * display name and to open the referenced record.
 *
 * `options.display` only changes the TEXT — `formatIdRefDisplay` turns whatever
 * resolved (or nothing) into `"Name (id)"` or the bare id, the one formatting
 * rule every reference reads through. Both attributes, and the tooltip, keep
 * the real id regardless — what a reference points at is not a matter of how
 * it is being shown, so a cell reading as a name still follows to the same
 * record.
 */
const renderCell = (
  value: unknown,
  field: FieldDescriptor,
  options?: CellRenderOptions,
): ReactNode => {
  const id = toText(value).trim();
  if (!id) return <Text className="field-kit__muted">{ABSENT}</Text>;
  return (
    <Text
      className="field-kit__ref"
      title={field.targetKind ? `${field.targetKind}: ${id}` : id}
      data-id-ref={id}
      data-target-kind={field.targetKind}
    >
      {formatIdRefDisplay(id, options?.display)}
    </Text>
  );
};

const idRefKit: FieldTypeStrategy = { kind: 'idRef', FilterControl, EditorControl, renderCell };

registerFieldTester('idRef', { test });
registerComparator('idRef', nullsLast(naturalTextCompare));
registerFieldKit(idRefKit);

export { idRefKit };
