/* @layer renderer-components @kind logic */
/**
 * Schema drift is the real hazard, not storage. A snapshot stores field paths,
 * and a dataset changes shape underneath them, so restoring must always prune,
 * never throw, and never silently produce an empty table.
 *
 * The filter prune also revalidates each operator against the field's CURRENT
 * kind — a field inferred as an enum last week and a string today would
 * otherwise carry an `anyOf` clause nothing can evaluate any more.
 */
import type { SchemaLike } from '../schema/build-schema';
import { toSchemaIndex } from '../schema/build-schema';
import type { TableColumn } from '../table/types';
import { isOperatorValid } from '../filter/operators';
import type { FilterClause } from '../filter/clause';
import type { ViewSnapshot } from './snapshot';

const prune = (
  snapshot: ViewSnapshot,
  schema: SchemaLike,
  fallbackColumns: readonly TableColumn[],
): ViewSnapshot => {
  const index = toSchemaIndex(schema);
  const has = (path: string): boolean => index.byPath(path) !== undefined;
  const opValid = (clause: FilterClause): boolean => {
    const field = index.byPath(clause.path);
    return field !== undefined && isOperatorValid(field.kind, clause.op);
  };

  const columns = snapshot.columns.filter((column) => has(column.path));
  return {
    ...snapshot,
    // A layout that pruned to nothing falls back to the caller's defaults,
    // never to a table with zero columns.
    columns: columns.length ? columns : fallbackColumns.map((column) => ({ ...column })),
    sort: snapshot.sort.filter((entry) => has(entry.path)),
    groupBy: snapshot.groupBy.filter(has),
    filters: snapshot.filters.filter((clause) => has(clause.path) && opValid(clause)),
  };
};

export { prune };
