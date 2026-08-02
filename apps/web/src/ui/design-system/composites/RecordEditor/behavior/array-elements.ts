/* @layer renderer-components @kind logic */
/**
 * The two things a list of records needs that a list of values does not: a
 * starting shape for a new element, and real addresses for the element it
 * already holds.
 *
 * ADDRESSES. An element descriptor's path is descriptive — `spawns[].actorId`
 * addresses nothing, because there is no element in general, only element 3.
 * Rebasing swaps that descriptive prefix for a real one (`spawns.3`), and from
 * there every existing part of the form works unchanged: the dot-path walk
 * already indexes arrays by numeric segment, so reads, writes and the dirty
 * check all land on the right element with nothing special threaded through.
 *
 * A STARTING SHAPE. `blankFor` answers per scalar kind; an object element needs
 * the same answer for each of its own children, recursively. Only the required
 * children are seeded — an optional field that starts absent is exactly what
 * the record says it is, and inventing a value for it would be a lie the
 * serializer then writes out.
 */
import { keyOf } from './tag-field';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';

/** Element shapes here are shallow (a spawn is two levels); this guards a pathological one. */
const MAX_BLANK_DEPTH = 4;

/** What a freshly added element starts as, per element kind. */
const blankFor = (element: FieldDescriptor): unknown => {
  if (element.kind === 'number') return 0;
  if (element.kind === 'boolean') return false;
  if (element.kind === 'enum') return element.options?.[0] ?? '';
  if (element.kind === 'array') return [];
  return '';
};

/** `blankFor` plus the object case, which recurses through its required children. */
const blankValue = (field: FieldDescriptor, depth = 0): unknown => {
  if (field.kind !== 'object') return blankFor(field);
  const shape: Record<string, unknown> = {};
  if (depth >= MAX_BLANK_DEPTH) return shape;
  for (const child of field.children ?? []) {
    if (child.optional) continue;
    shape[keyOf(child.path)] = blankValue(child, depth + 1);
  }
  return shape;
};

/**
 * The same descriptor, re-addressed onto one concrete element. Children and a
 * nested element descriptor come along, so a whole subtree is rebased at once.
 */
const rebaseField = (
  field: FieldDescriptor,
  from: string,
  to: string,
): FieldDescriptor => {
  const path = field.path.startsWith(from) ? `${to}${field.path.slice(from.length)}` : field.path;
  const next: FieldDescriptor = { ...field, path };
  if (field.children) next.children = field.children.map((child) => rebaseField(child, from, to));
  if (field.of) next.of = rebaseField(field.of, from, to);
  return next;
};

/** The children of element `index`, each addressing the real record. */
const elementFields = (
  field: FieldDescriptor,
  index: number,
): readonly FieldDescriptor[] => {
  const element = field.of;
  if (!element?.children) return [];
  return element.children.map((child) => rebaseField(child, element.path, `${field.path}.${index}`));
};

/** An immutable reorder, used by every list editor here. */
const moved = (list: readonly unknown[], from: number, to: number): readonly unknown[] => {
  const next = [...list];
  const [lifted] = next.splice(from, 1);
  next.splice(to, 0, lifted);
  return next;
};

export { blankFor, blankValue, elementFields, moved, rebaseField, MAX_BLANK_DEPTH };
