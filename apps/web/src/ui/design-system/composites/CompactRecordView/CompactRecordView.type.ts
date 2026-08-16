/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { FieldDescriptor, SchemaConfig } from '../../data/schema/field-descriptor';

/**
 * The baseline name for a reference field's id, with no per-field display
 * choice to speak of — this view has no column configuration at all, so this
 * is the only display substitution it offers. `targetKind` is a hint, not a
 * requirement: omitted or unresolvable, the caller is expected to fall back
 * to reading the kind off the id's own prefix (see `defaultIdRefDisplay`).
 */
type CompactIdRefResolver = (id: string, targetKind?: string) => string | undefined;

/**
 * Structurally satisfied by the comparison engine's `Difference`
 * (`shared/game/recommendations/compare/difference.types.ts`), declared
 * locally so this package keeps importing no domain type — same bargain
 * `targetKind` above already makes for a field's reference target. A widget
 * that already has a real `Difference` passes its map straight in; nothing
 * here needs to know that type exists.
 */
interface FieldDifference {
  status: string;
  shown: { dataset: string; live: string };
  source: string;
}

/**
 * Renders one field's whole row in place of the default cell. The caller owns
 * the content, so a field whose value needs domain knowledge to read (an array
 * of objects, say) gets a purpose-built view without this package importing
 * anything domain-side — the same bargain `resolveIdRefDisplay` and
 * `FieldDifference` already make.
 */
type CompactFieldRenderer<T> = (record: T) => ReactNode;

interface CompactRecordViewProps<T> {
  record: T;
  /** Top-level fields; nesting lives in each field's own `children`, same as RecordEditor. */
  schema: readonly FieldDescriptor[];
  /** A diff over the derived schema — layout works fully without it. */
  config?: SchemaConfig;
  /**
   * An optional allow-list, as group ids (from the derived layout) or individual
   * field paths. A listed group id keeps every field it holds; anything else is
   * checked field-by-field, so a caller can show a handful of fields out of a
   * wide group without asking for the rest. Omitted shows everything the
   * derived layout produced.
   */
  groups?: readonly string[];
  /**
   * Shows a reference field's target name instead of its raw id. Omitted, a
   * reference reads as its id — exactly how this view behaved before it had
   * a resolver to ask.
   */
  resolveIdRefDisplay?: CompactIdRefResolver;
  /**
   * Live differences by record path. Fed from the same comparison pass that
   * produced the recommendation cards, so the two can never disagree about
   * whether a field is wrong. Omitted, every field renders exactly as it did
   * before this prop existed.
   */
  diffs?: ReadonlyMap<string, FieldDifference>;
  /**
   * Per-path replacements for the default field row, keyed by the field's own
   * schema path (see `CompactFieldRenderer`). A replaced field keeps its place
   * in the derived layout, group and running order included; a path this map
   * does not carry renders through its field kit as usual.
   */
  fieldRenderers?: ReadonlyMap<string, CompactFieldRenderer<T>>;
}

interface CompactFieldProps {
  /** The whole record — every field path, nested or not, reads off this directly. */
  record: unknown;
  field: FieldDescriptor;
  /** 0 at the top level; a nested object/union's own children sit one deeper. */
  depth: number;
  resolveIdRefDisplay?: CompactIdRefResolver;
  /** Threaded straight through recursion — see `CompactRecordViewProps.diffs`. */
  diffs?: ReadonlyMap<string, FieldDifference>;
}

export type {
  CompactFieldProps, CompactFieldRenderer, CompactIdRefResolver, CompactRecordViewProps, FieldDifference,
};
