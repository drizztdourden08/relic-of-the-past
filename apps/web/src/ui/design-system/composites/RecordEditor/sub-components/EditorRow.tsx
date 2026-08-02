/* @layer renderer-components @kind component */
/**
 * One field. A leaf binds the kit's own editor straight to the path; a nested
 * kind renders its children as rows of their own, so this component calls itself
 * and the form goes as deep as the schema does.
 *
 * The two nested kinds differ in one place only. An object shows all of its
 * children, because there is one shape. A union shows the branch the CURRENT
 * value is in, because the schema's children are every branch merged; when no
 * branch resolves, the row falls back to the same one-line summary the kit's
 * cell renderer produces rather than guessing a form.
 *
 * That is also why an ABSENT object still shows its form while an absent union
 * does not: one shape can be created by filling it in (writing a nested path
 * builds the containers on the way down), and a set of branches cannot be
 * created without first knowing which branch was meant.
 *
 * One object shape is recognised rather than merely recursed into: a grid
 * position is edited as a pair, with whatever it holds BESIDES the pair kept as
 * rows of its own.
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
const NO_FIELDS = 'No fields described — shown as recorded.';
const TOO_DEEP = 'Nested too deep to lay out — shown as recorded.';
const NO_BRANCH: Record<string, string> = {
  absent: 'No value set — shown as recorded.',
  'not-object': 'Not a branch shape — shown as recorded.',
  unmatched: 'Unrecognised branch — shown as recorded.',
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

/** Null for a field that renders as a control rather than as a set of rows. */
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
  // A list of VARIANT records — each element is one of several branches
  // (e.g. a requirement expression's `anyOf`/`allOf`) rather than one fixed
  // shape, so it needs a branch-aware editor instead of the object one above.
  if (element.kind === 'union' && element.children?.length) {
    return <VariantArrayEditor field={field} value={value} binding={binding} depth={depth} />;
  }
  // A list of lists of plain values (e.g. an OR-of-AND requirement set) —
  // structurally an array, but one level deeper than the single-value case above.
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
  // The identity field is forced read-only here regardless of the rest of the
  // record's editability — see `identity-field.ts` for why.
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
  const pair = positionPairOf(field);
  const plan: NestedPlan | null = pair
    ? { fields: pair.others }
    : nestedPlanFor(field, value, depth);

  if (!plan) {
    return (
      <Field
        label={labelFor(field)}
        className={dirty ? 'record-editor__row record-editor__row--dirty' : 'record-editor__row'}
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
