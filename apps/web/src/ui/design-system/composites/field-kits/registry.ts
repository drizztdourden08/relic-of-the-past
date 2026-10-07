/* @layer renderer-components @kind logic */
/**
 * Registry of Strategies for the UI half of a field kit.
 *
 * The headless core owns the parts that need no DOM (a predicate, a comparator,
 * a group key). What it cannot own is the rendering: which control filters this
 * kind, which control edits it, what a cell looks like. That lives here, keyed
 * by the same `FieldKind`, so a new kind is one registration, not an edit in
 * every consumer.
 *
 * The strategies are stored non-generically on purpose. Record values arrive
 * untyped (read back out of a dot-path walk over an unknown row), so a kit
 * narrows the value itself instead of claiming a type it cannot prove.
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
  /** Shown beside the label and searched with it. Normally the raw id. */
  description?: string;
}

/**
 * The injected half of a reference lookup.
 *
 * A descriptor names the collection an id points AT (`targetKind`), and that is
 * as far as this package goes: what that collection holds is domain data it must
 * never import. The caller supplies the rows as a function of the target kind,
 * and the kit renders a real picker when it gets something back and a plain text
 * input when it does not. The whole descriptor comes along so the caller can say
 * "not this one", since a collection's own primary key is an id but not a
 * reference to another record, and only the caller knows which path that is.
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
 * data, not about the schema. Every part is optional. An omitted end is open.
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

/** Resolves one id's display name, given the collection it names. See `resolveIdRefDisplay` below. */
type ArrayIdRefResolver = (id: string, targetKind?: string) => string | undefined;

/**
 * What a caller may say about ONE cell, over and above the value itself.
 *
 * `display` is text to show INSTEAD of the value, already resolved. A kit gets
 * the finished string, not a resolver: choosing a substitution is a decision
 * about the table, and naming a foreign record needs a dataset. A kit may reach
 * neither. The substitution stays cosmetic, so the real value still travels on
 * the element and a reference is followed by its id whatever is on screen.
 *
 * `resolveIdRefDisplay` is the per-entry counterpart: an `array` of `idRef`
 * elements holds N ids, so no single finished string can be built ahead of time
 * and `array-kit` calls it once per element. Other kits ignore it as they
 * already ignore `display`.
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
 * Undefined only until the built-ins have been imported. `index.ts` registers
 * the `unknown` kit as the universal fallback, so a caller that went through the
 * barrel always resolves something. Typed honestly, not asserted.
 */
const resolveFieldKit = (kind: FieldKind): FieldTypeStrategy | undefined => kits.get(kind);

const registeredKitKinds = (): readonly FieldKind[] => [...kits.keys()];

export { registerFieldKit, registeredKitKinds, resolveFieldKit };
export type {
  ArrayIdRefResolver, CellRenderOptions, EditorControlProps, FieldTypeStrategy, FilterControlProps,
  IdRefOption, IdRefOptionResolver, NumberBounds,
};
