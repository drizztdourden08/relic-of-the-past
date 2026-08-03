/* @layer renderer-components @kind types */
import type { FieldDescriptor, SchemaConfig } from '../../data/schema/field-descriptor';

/**
 * The baseline name for a reference field's id, with no per-field display
 * choice to speak of — this view has no column configuration at all, so this
 * is the only display substitution it offers. `targetKind` is a hint, not a
 * requirement: omitted or unresolvable, the caller is expected to fall back
 * to reading the kind off the id's own prefix (see `defaultIdRefDisplay`).
 */
type CompactIdRefResolver = (id: string, targetKind?: string) => string | undefined;

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
}

interface CompactFieldProps {
  /** The whole record — every field path, nested or not, reads off this directly. */
  record: unknown;
  field: FieldDescriptor;
  /** 0 at the top level; a nested object/union's own children sit one deeper. */
  depth: number;
  resolveIdRefDisplay?: CompactIdRefResolver;
}

export type { CompactFieldProps, CompactIdRefResolver, CompactRecordViewProps };
