/* @layer renderer-components @kind logic */
/**
 * Registry of Strategies — the UI half of a field kit.
 *
 * The headless core owns the parts that need no DOM (a predicate, a comparator,
 * a group key) and keeps its own registries for them. What it cannot own is the
 * rendering: which control filters this kind, which control edits it, what a
 * cell looks like. That lives here, keyed by the same `FieldKind`, so a new kind
 * is still one registration rather than an edit in every consumer.
 *
 * The strategies are stored non-generically on purpose. Record values arrive
 * untyped (they are read back out of a dot-path walk over an unknown row), so a
 * kit narrows the value itself rather than claiming a type it cannot prove.
 */
import type { FC, ReactNode } from 'react';
import type { FieldDescriptor, FieldKind } from '../../data/schema/field-descriptor';

interface FilterControlProps {
  field: FieldDescriptor;
  /** An OperatorSpec.id valid for `field.kind`; its arity decides the control. */
  op: string;
  value: unknown;
  onChange: (value: unknown) => void;
}

/** One choosable record in a reference lookup: the id, and what to call it. */
interface IdRefOption {
  value: string;
  label: string;
  /** Shown beside the label and searched with it — the raw id, normally. */
  description?: string;
}

/**
 * The injected half of a reference lookup.
 *
 * A field descriptor already names the collection an id points AT
 * (`targetKind`), and that is as far as this package can go on its own: what
 * that collection holds is domain data it must never import. So the caller
 * supplies the rows, as a function of the target kind, and the kit renders a
 * real picker when it gets something back and its plain text input when it does
 * not. The whole descriptor comes along so the caller can also say "not this
 * one" — a collection's own primary key is an id, but it is not a reference to
 * another record, and only the caller knows which path that is.
 */
type IdRefOptionResolver = (
  targetKind: string,
  field: FieldDescriptor,
) => readonly IdRefOption[];

/**
 * The limits one numeric field accepts, as the caller knows them.
 *
 * Same bargain as the reference lookup: a descriptor says a field holds a
 * number and stops there, because how far a number may go is a fact about the
 * data, not about the schema. Every part is optional — an omitted end is open.
 */
interface NumberBounds {
  min?: number;
  max?: number;
  step?: number;
}

interface EditorControlProps<V = unknown> {
  field: FieldDescriptor;
  value: V;
  onChange: (value: V) => void;
  disabled?: boolean;
  /** Optional: without it every kit behaves exactly as it does standalone. */
  resolveIdRefOptions?: IdRefOptionResolver;
  /** Optional: without it a numeric control is open at both ends. */
  bounds?: NumberBounds;
}

/** Resolves one id's display name, given the collection it names — see `resolveIdRefDisplay` below. */
type ArrayIdRefResolver = (id: string, targetKind?: string) => string | undefined;

/**
 * What a caller may say about ONE cell, over and above the value itself.
 *
 * `display` is text to show INSTEAD of the value, already resolved. A kit is
 * handed the finished string rather than a resolver on purpose: substituting
 * one is a decision about the table (a column was configured that way), and
 * answering what a foreign record is called needs a dataset — neither is
 * something a kit may reach. What stays the kit's own business is that the
 * substitution is cosmetic: the real value still travels on the element, so a
 * reference is followed by its id no matter what is on screen.
 *
 * `resolveIdRefDisplay` is `display`'s per-entry counterpart: an `array` of
 * `idRef` elements holds N ids, not one, so it cannot be resolved to a single
 * finished string ahead of time — `array-kit` calls it once per element
 * instead. Every other kit ignores it exactly as it already ignores `display`
 * when it does not apply.
 */
interface CellRenderOptions {
  display?: string;
  resolveIdRefDisplay?: ArrayIdRefResolver;
}

interface FieldTypeStrategy<V = unknown> {
  kind: FieldKind;
  /** Renders nothing when the operator takes no operand (arity 'none'). */
  FilterControl: FC<FilterControlProps>;
  EditorControl: FC<EditorControlProps<V>>;
  renderCell: (value: V, field: FieldDescriptor, options?: CellRenderOptions) => ReactNode;
}

const kits = new Map<FieldKind, FieldTypeStrategy>();

const registerFieldKit = (strategy: FieldTypeStrategy): void => {
  kits.set(strategy.kind, strategy);
};

/**
 * Undefined only until the built-ins have been imported — `index.ts` registers
 * the `unknown` kit as the universal fallback, so a caller that went through the
 * barrel always resolves something. Typed honestly rather than asserted.
 */
const resolveFieldKit = (kind: FieldKind): FieldTypeStrategy | undefined => kits.get(kind);

const registeredKitKinds = (): readonly FieldKind[] => [...kits.keys()];

export { registerFieldKit, registeredKitKinds, resolveFieldKit };
export type {
  ArrayIdRefResolver, CellRenderOptions, EditorControlProps, FieldTypeStrategy, FilterControlProps,
  IdRefOption, IdRefOptionResolver, NumberBounds,
};
