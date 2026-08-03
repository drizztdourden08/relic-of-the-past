/* @layer renderer-components @kind logic */
/**
 * Specification pattern: a filter row is a plain `{path, op, value}` object
 * that compiles to a predicate, and clauses combine with AND. Being data rather
 * than a closure is what lets filter state be persisted, shared and
 * round-tripped — impossible if a filter were a function.
 */
import type { SchemaLike } from '../schema/build-schema';
import { toSchemaIndex } from '../schema/build-schema';
import { getPath } from '../schema/path';
import { getFieldTester } from './tester-registry';
import type { FilterTestOptions } from './tester-registry';

interface FilterClause {
  id: string;
  /** A FieldDescriptor.path. */
  path: string;
  /** An OperatorSpec.id, valid for the field's current kind. */
  op: string;
  /** Shape decided by the operator's arity. */
  value: unknown;
  /** Toggle a clause off without losing the row. */
  enabled: boolean;
  /**
   * Optional modifier, absent on a clause that never asked for it: text
   * comparisons fold case unless this is on. It sits here rather than inside
   * `value` so the operand keeps whatever plain shape its arity calls for, and
   * so a snapshot round-trips it for free.
   */
  caseSensitive?: boolean;
}

type RowPredicate = (row: unknown) => boolean;

const PASS: RowPredicate = () => true;

/**
 * Ids must stay unique FOREVER, not just for the running session: a clause is
 * persisted verbatim (see view-state/snapshot.ts's `capture`) and loaded back
 * on a later launch, at which point a freshly created clause sits in the same
 * array as clauses that survived from a previous session. A per-session
 * counter that restarts at 1 on every launch is guaranteed to collide with
 * whatever a prior session already wrote to disk — and a collision means two
 * clauses share the React key FilterBar renders them under, and the id every
 * `onChange` handler filters/maps by, so acting on one silently acts on both.
 * `crypto.randomUUID()` has no notion of "session" to restart, so it cannot
 * repeat a disk-persisted id.
 */
const createClause = (path: string, op: string, value: unknown = null): FilterClause => ({
  id: crypto.randomUUID(), path, op, value, enabled: true,
});

const clauseToPredicate = (clause: FilterClause, schema: SchemaLike): RowPredicate | undefined => {
  const field = toSchemaIndex(schema).byPath(clause.path);
  if (!field) return undefined;
  const tester = getFieldTester(field.kind);
  if (!tester) return undefined;
  // Built once per clause rather than per row — the predicate runs over every
  // row in the collection.
  const options: FilterTestOptions = { caseSensitive: clause.caseSensitive };
  return (row: unknown) => tester.test(getPath(row, clause.path), clause.op, clause.value, options);
};

/**
 * A clause whose path is gone, or whose kind has no registered tester, is
 * skipped rather than failing every row.
 */
const compile = (clauses: readonly FilterClause[], schema: SchemaLike): RowPredicate => {
  const index = toSchemaIndex(schema);
  const tests = clauses
    .filter((clause) => clause.enabled)
    .map((clause) => clauseToPredicate(clause, index))
    .filter((test): test is RowPredicate => test !== undefined);
  if (!tests.length) return PASS;
  return (row: unknown) => tests.every((test) => test(row));
};

export { compile, createClause };
export type { FilterClause, RowPredicate };
