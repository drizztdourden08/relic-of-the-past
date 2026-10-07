/* @layer renderer-components @kind logic */
/** Column labels computed once at the table level. A rename wins over the schema's wording everywhere a path is named. */
import { summarizeSortGroup } from './sort-group-summary';
import type { SortGroupSummary } from './sort-group-summary';
import type { SchemaIndex } from '../../../data/schema/build-schema';
import type { SortEntry, TableColumn } from '../../../data/table/types';

interface ColumnLabelsInput {
  columns: readonly TableColumn[];
  schema: SchemaIndex;
  sort: readonly SortEntry[];
  groupBy: readonly string[];
  /** The column currently in the air, if any. It is named for the drop target. */
  draggingPath: string | null;
}

interface ColumnLabels {
  labelOf: (path: string) => string;
  /** What the whole table is sorted and grouped by, in words. */
  summary: SortGroupSummary;
  /** The carried column's own name; empty while nothing is being dragged. */
  carriedLabel: string;
}

const columnLabelsOf = (input: ColumnLabelsInput): ColumnLabels => {
  const {
    columns, schema, sort, groupBy, draggingPath,
  } = input;

  const labelOf = (path: string): string =>
    columns.find((column) => column.path === path)?.label ?? schema.byPath(path)?.label ?? path;

  return {
    labelOf,
    summary: summarizeSortGroup({ sort, groupBy, labelOf }),
    carriedLabel: draggingPath ? labelOf(draggingPath) : '',
  };
};

export { columnLabelsOf };
export type { ColumnLabels, ColumnLabelsInput };
