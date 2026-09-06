/* @layer renderer-components @kind logic */
/**
 * A starting shape for a new element, and real addresses for existing ones.
 * An element descriptor's path (`spawns[].actorId`) addresses nothing; rebasing
 * swaps the prefix for `spawns.3`, after which the dot-path walk handles reads,
 * writes and the dirty check. Only required children are seeded in a blank:
 * inventing an optional value would be written out by the serializer.
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
