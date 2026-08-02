/* @layer renderer-components @kind logic */
/**
 * Binds the schema and the strategy registry to the pure sort/group functions.
 *
 * Grouping and sorting compose in one pass: the groupBy paths sort FIRST (so
 * groups come out in their comparator's order), then the sort list orders rows
 * within each group. The invariant that falls out of that is worth relying on —
 * `flattenGroups(groupedRows)` is exactly `sortedRows`.
 */
import type { SchemaIndex } from '../schema/build-schema';
import { getPath } from '../schema/path';
import type { GroupedRow, SortEntry } from './types';
import { groupRows } from './group-rows';
import { sortRows } from './sort-ops';
import { getComparator, getGroupKey } from './strategy-registry';

interface DeriveRowsInput<T> {
  rows: readonly T[];
  schema: SchemaIndex;
  sort: readonly SortEntry[];
  groupBy: readonly string[];
}

interface DerivedRows<T> {
  sortedRows: readonly T[];
  groupedRows: readonly GroupedRow<T>[];
}

const kindAt = (schema: SchemaIndex, path: string) => schema.byPath(path)?.kind ?? 'unknown';

/** groupBy leads, then the explicit sort list; already-sorted paths are not repeated. */
const effectiveSort = (sort: readonly SortEntry[], groupBy: readonly string[]): readonly SortEntry[] => {
  if (!groupBy.length) return sort;
  const leading: readonly SortEntry[] = groupBy.map((path) => ({ path, dir: 'asc' as const }));
  return [...leading, ...sort.filter((entry) => !groupBy.includes(entry.path))];
};

const deriveRows = <T>({ rows, schema, sort, groupBy }: DeriveRowsInput<T>): DerivedRows<T> => {
  const compare = (path: string, a: unknown, b: unknown): number =>
    getComparator(kindAt(schema, path))(a, b);
  const valueAt = (path: string, row: T): unknown => getPath(row, path);
  const groupKeyFor = (path: string, row: T): string =>
    getGroupKey(kindAt(schema, path))(getPath(row, path));

  const sortedRows = sortRows(rows, effectiveSort(sort, groupBy), compare, valueAt);
  return { sortedRows, groupedRows: groupRows(sortedRows, groupBy, groupKeyFor) };
};

export { deriveRows, effectiveSort };
export type { DeriveRowsInput, DerivedRows };
