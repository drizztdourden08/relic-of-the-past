/* @layer renderer-components @kind hook */
/**
 * Headless table state: visible columns, multi-sort, layered grouping, and the
 * rows those produce. The only file in this package that touches React — every
 * transform it calls is a pure function next door, so the behaviour is testable
 * without a renderer.
 */
import { useCallback, useMemo, useState } from 'react';
import type { FieldDescriptor } from '../schema/field-descriptor';
import { createSchemaIndex } from '../schema/build-schema';
import * as columnOps from './column-ops';
import * as sortOps from './sort-ops';
import { deriveRows } from './derive-rows';
import type {
  ColumnMove, GroupedRow, SortEntry, TableColumn, TableState,
} from './types';

interface UseDataTableInput<T> {
  rows: readonly T[];
  schema: readonly FieldDescriptor[];
  /**
   * Initial column specs, width/mode included; defaults to the schema's
   * visible top level, each opening in the persistent fit-to-content mode.
   */
  initial?: readonly TableColumn[];
}

interface DataTableState<T> extends TableState {
  rows: readonly T[];
  sortedRows: readonly T[];
  groupedRows: readonly GroupedRow<T>[];
  addColumn: (path: string) => void;
  /** The same add at a chosen slot — "add a column before / after this one". */
  insertColumn: (path: string, at: number) => void;
  removeColumn: (path: string) => void;
  moveColumn: (path: string, move: ColumnMove) => void;
  reorderColumn: (path: string, to: number) => void;
  renameColumn: (path: string, label: string) => void;
  /** A measured or dragged pixel width; clears any grow flag on that column. */
  resizeColumn: (path: string, width: number) => void;
  /** "Expand to available space"; clears any fixed width on that column. */
  growColumn: (path: string) => void;
  /** Turns on persistent fit-to-content; clears any fixed width or grow flag. */
  fitColumn: (path: string) => void;
  /** The footer's "fit all to content" — every visible column, at once. */
  fitAllColumns: () => void;
  /**
   * For a reference column: which field of the record it points at to show
   * instead of the id. `undefined` puts the id back.
   */
  setDisplayField: (path: string, displayField: string | undefined) => void;
  resetColumns: () => void;
  /** Header click — replaces the whole sort list, cycling asc → desc → none. */
  setSingleSort: (path: string) => void;
  /** Column menu — adds a level in ONE named direction, or rewrites its own. */
  setSortDir: (path: string, dir: SortEntry['dir']) => void;
  removeSort: (path: string) => void;
  clearSort: () => void;
  addGroupBy: (path: string) => void;
  removeGroupBy: (path: string) => void;
  clearGroupBy: () => void;
  /** Applies a restored snapshot's table half wholesale. */
  setState: (next: TableState) => void;
}

/**
 * The schema's visible top level, each column opening in the persistent
 * fit-to-content mode rather than the automatic range — the sizing default
 * for any column nothing more specific was asked for.
 */
const defaultColumns = (schema: readonly FieldDescriptor[]): readonly TableColumn[] =>
  schema.filter((field) => !field.hidden).map((field) => ({ path: field.path, fit: true }));

const initialState = (schema: readonly FieldDescriptor[], initial?: readonly TableColumn[]): TableState => ({
  columns: initial ?? defaultColumns(schema),
  sort: [],
  groupBy: [],
});

const useDataTable = <T>({ rows, schema, initial }: UseDataTableInput<T>): DataTableState<T> => {
  const [state, setState] = useState<TableState>(() => initialState(schema, initial));

  const index = useMemo(() => createSchemaIndex(schema), [schema]);
  const derived = useMemo(
    () => deriveRows({ rows, schema: index, sort: state.sort, groupBy: state.groupBy }),
    [rows, index, state.sort, state.groupBy],
  );

  const patchColumns = useCallback(
    (transform: (columns: TableState['columns']) => TableState['columns']) =>
      setState((prev) => ({ ...prev, columns: transform(prev.columns) })),
    [],
  );
  const patchSort = useCallback(
    (transform: (sort: TableState['sort']) => TableState['sort']) =>
      setState((prev) => ({ ...prev, sort: transform(prev.sort) })),
    [],
  );
  const patchGroupBy = useCallback(
    (transform: (groupBy: readonly string[]) => readonly string[]) =>
      setState((prev) => ({ ...prev, groupBy: transform(prev.groupBy) })),
    [],
  );

  const addColumn = useCallback((path: string) => patchColumns((c) => columnOps.addColumn(c, path)), [patchColumns]);
  const insertColumn = useCallback(
    (path: string, at: number) => patchColumns((c) => columnOps.insertColumnAt(c, path, at)),
    [patchColumns],
  );
  const removeColumn = useCallback((path: string) => patchColumns((c) => columnOps.removeColumn(c, path)), [patchColumns]);
  const moveColumn = useCallback(
    (path: string, move: ColumnMove) => patchColumns((c) => columnOps.moveColumn(c, path, move)),
    [patchColumns],
  );
  const reorderColumn = useCallback(
    (path: string, to: number) => patchColumns((c) => columnOps.reorderColumn(c, path, to)),
    [patchColumns],
  );
  const renameColumn = useCallback(
    (path: string, label: string) => patchColumns((c) => columnOps.renameColumn(c, path, label)),
    [patchColumns],
  );
  const resizeColumn = useCallback(
    (path: string, width: number) => patchColumns((c) => columnOps.resizeColumn(c, path, width)),
    [patchColumns],
  );
  const growColumn = useCallback(
    (path: string) => patchColumns((c) => columnOps.growColumn(c, path)),
    [patchColumns],
  );
  const fitColumn = useCallback(
    (path: string) => patchColumns((c) => columnOps.fitColumn(c, path)),
    [patchColumns],
  );
  const fitAllColumns = useCallback(
    () => patchColumns((c) => columnOps.fitAllColumns(c)),
    [patchColumns],
  );
  const setDisplayField = useCallback(
    (path: string, displayField: string | undefined) =>
      patchColumns((c) => columnOps.setDisplayField(c, path, displayField)),
    [patchColumns],
  );
  const resetColumns = useCallback(
    () => patchColumns(() => initialState(schema, initial).columns),
    [patchColumns, schema, initial],
  );

  const setSingleSort = useCallback((path: string) => patchSort((s) => sortOps.setSingleSort(s, path)), [patchSort]);
  const setSortDir = useCallback(
    (path: string, dir: SortEntry['dir']) => patchSort((s) => sortOps.setSortDir(s, path, dir)),
    [patchSort],
  );
  const removeSort = useCallback((path: string) => patchSort((s) => sortOps.removeSort(s, path)), [patchSort]);
  const clearSort = useCallback(() => patchSort(() => []), [patchSort]);

  const addGroupBy = useCallback(
    (path: string) => patchGroupBy((g) => (g.includes(path) ? g : [...g, path])),
    [patchGroupBy],
  );
  const removeGroupBy = useCallback(
    (path: string) => patchGroupBy((g) => g.filter((entry) => entry !== path)),
    [patchGroupBy],
  );
  const clearGroupBy = useCallback(() => patchGroupBy(() => []), [patchGroupBy]);

  return {
    ...state, rows, ...derived,
    addColumn, insertColumn, removeColumn, moveColumn, reorderColumn, renameColumn,
    resizeColumn, growColumn, fitColumn, fitAllColumns, setDisplayField, resetColumns,
    setSingleSort, setSortDir, removeSort, clearSort,
    addGroupBy, removeGroupBy, clearGroupBy, setState,
  };
};

export { defaultColumns, initialState, useDataTable };
export type { DataTableState, UseDataTableInput };
