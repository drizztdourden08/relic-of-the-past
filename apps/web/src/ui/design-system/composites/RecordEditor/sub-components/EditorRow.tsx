/* @layer renderer-components @kind component */
/**
 * One field. A leaf binds the kit's editor to the path; a nested kind renders
 * its children as rows, recursively. An object shows all children; a union
 * shows the branch the current value is in, or the kit's summary when none
 * resolves. An absent object still shows its form (writing a nested path
 * builds the containers); an absent union cannot, since the branch is unknown.
 * A grid position is edited as a pair.
 */
import { Box } from '../../../primitives/Box';
import { Field } from '../../../primitives/Field';
import { Text } from '../../../primitives/Text';
import { resolveFieldKit } from '../../field-kits';
import { unknownKit } from '../../field-kits/unknown-kit';
import { detectUnionBranch } from '../behavior/union-branch';
import { isIdentityField } from '../behavior/identity-field';
import { positionPairOf } from '../behavior/position-shape';
import { ArrayFieldEditor } from './ArrayFieldEditor';
import { NestedArrayEditor } from './NestedArrayEditor';
import { ObjectArrayEditor } from './ObjectArrayEditor';
import { PositionFieldEditor } from './PositionFieldEditor';
import { VariantArrayEditor } from './VariantArrayEditor';
import type { ReactNode } from 'react';
import type { FieldDescriptor, FieldKind } from '../../../data/schema/field-descriptor';
import type { EditorBinding, EditorRowProps } from '../RecordEditor.type';
import '../RecordEditor.css';

/** Kinds the kits edit as one value; everything else nests or stays read-only. */
const SINGLE_VALUE_KINDS: readonly FieldKind[] = ['string', 'number', 'boolean', 'enum', 'idRef'];

/** The schema caps its own depth well under this; the guard is against a hand-built one. */
const MAX_NESTING = 12;

const OPTIONAL = 'optional';
const NO_FIELDS = 'No fields described. Shown as recorded.';
const TOO_DEEP = 'Nested too deep to lay out. Shown as recorded.';
const NO_BRANCH: Record<string, string> = {
  absent: 'No value set. Shown as recorded.',
  'not-object': 'Not a branch shape. Shown as recorded.',
  unmatched: 'Unrecognised branch. Shown as recorded.',
};

interface NestedPlan {
  fields: readonly FieldDescriptor[];
  note?: string;
}

/** The registry answers for all nine built-ins; the fallback keeps that typed, not asserted. */
const kitFor = (kind: FieldKind) => resolveFieldKit(kind) ?? unknownKit;

const extraNote = (keys: readonly string[]): string | undefined =>
  (keys.length ? `Also holds, unedited: ${keys.join(', ')}` : undefined);

const unionPlan = (field: FieldDescriptor, value: unknown): NestedPlan => {
  const branch = detectUnionBranch(field, value);
  if (branch.status !== 'resolved') return { fields: [], note: NO_BRANCH[branch.status] };
  return { fields: branch.fields, note: extraNote(branch.extraKeys) };
};

/** Null for a field that renders as a control, not as a set of rows. */
const nestedPlanFor = (field: FieldDescriptor, value: unknown, depth: number): NestedPlan | null => {
  if (field.kind !== 'object' && field.kind !== 'union') return null;
  if (depth >= MAX_NESTING) return { fields: [], note: TOO_DEEP };
  if (field.kind === 'union') return unionPlan(field, value);
  const children = field.children ?? [];
  return children.length ? { fields: children } : { fields: [], note: NO_FIELDS };
};

const labelFor = (field: FieldDescriptor): ReactNode => (
  <>
    {field.label}
    {field.optional && <Text as="span" className="record-editor__optional">{OPTIONAL}</Text>}
  </>
);

const arrayControlFor = (
  field: FieldDescriptor,
  value: unknown,
  binding: EditorBinding,
  depth: number,
): ReactNode | null => {
  const element = field.of;
  if (field.kind !== 'array' || !element) return null;
  if (SINGLE_VALUE_KINDS.includes(element.kind)) {
    return <ArrayFieldEditor field={field} value={value} binding={binding} />;
  }
  if (element.kind === 'object' && element.children?.length) {
    return <ObjectArrayEditor field={field} value={value} binding={binding} depth={depth} />;
  }
  // A list of variant records (e.g. a requirement's `anyOf`/`allOf`) needs a
  // branch-aware editor.
  if (element.kind === 'union' && element.children?.length) {
    return <VariantArrayEditor field={field} value={value} binding={binding} depth={depth} />;
  }
  // A list of lists of plain values (e.g. an OR-of-AND requirement set).
  if (element.kind === 'array') {
    return <NestedArrayEditor field={field} value={value} binding={binding} />;
  }
  return null;
};

const controlFor = (
  field: FieldDescriptor,
  value: unknown,
  binding: EditorBinding,
  depth: number,
): ReactNode => {
  const asList = arrayControlFor(field, value, binding, depth);
  if (asList) return asList;
  const Control = kitFor(field.kind).EditorControl;
  // The identity field is always read-only; see `identity-field.ts`.
  const disabled = binding.disabled || isIdentityField(field.path);
  return (
    <Control
      field={field}
      value={value}
      disabled={disabled}
      resolveIdRefOptions={binding.resolveIdRefOptions}
      bounds={binding.bounds(field.path)}
      onChange={(next) => binding.onChange(field.path, next)}
    />
  );
};

const EditorRow = (props: EditorRowProps) => {
  const { field, binding, depth } = props;
  const value = binding.value(field.path);
  const dirty = binding.isDirty(field.path);
  const changed = binding.isChanged?.(field.path) ?? false;
  const pair = positionPairOf(field);
  const plan: NestedPlan | null = pair
    ? { fields: pair.others }
    : nestedPlanFor(field, value, depth);

  if (!plan) {
    return (
      <Field
        label={labelFor(field)}
        className={`record-editor__row${changed ? ' record-editor__row--changed' : ''}${dirty ? ' record-editor__row--dirty' : ''}`}
      >
        {controlFor(field, value, binding, depth)}
      </Field>
    );
  }

  return (
    <Box className="record-editor__nest" data-depth={depth}>
      <Text as="span" className="record-editor__nest-label">{labelFor(field)}</Text>
      {plan.note != null && <Text className="record-editor__note">{plan.note}</Text>}
      {pair && <PositionFieldEditor field={field} pair={pair} binding={binding} />}
      {plan.fields.length > 0 && (
        <Box className="record-editor__nested">
          {plan.fields.map((child) => (
            <EditorRow key={child.path} field={child} binding={binding} depth={depth + 1} />
          ))}
        </Box>
      )}
      {!pair && plan.fields.length === 0 && (
        <Box className="record-editor__fallback">{kitFor(field.kind).renderCell(value, field)}</Box>
      )}
    </Box>
  );
};

export { EditorRow, SINGLE_VALUE_KINDS };
