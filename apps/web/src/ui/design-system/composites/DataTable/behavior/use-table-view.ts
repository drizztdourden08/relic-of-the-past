/* @layer renderer-components @kind hook */
/**
 * The only place the table meets persistence: two guarded effects between the
 * table hook and a keyed view snapshot. Both compare the same canonical
 * signature, so they converge after one pass in either direction. Without a
 * key `useViewState` is in-memory only.
 */
import { useEffect, useMemo } from 'react';
import { defaultColumns, useDataTable } from '../../../data/table/use-data-table';
import { capture, restore } from '../../../data/view-state/snapshot';
import { useViewState } from '../../../data/view-state/use-view-state';
import type { SessionView } from '@app/stores/data-view-store';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';
import type { TableColumn, TableState } from '../../../data/table/types';
import type { DataTableState } from '../../../data/table/use-data-table';
import type { ViewKey } from '../../../data/view-state/snapshot';

interface UseTableViewInput<T> {
  rows: readonly T[];
  schema: readonly FieldDescriptor[];
  viewKey?: ViewKey;
  fallbackColumns?: readonly TableColumn[];
  /** Grouping to open with when this view has nothing saved. */
  fallbackGroupBy?: readonly string[];
}

interface TableView<T> {
  table: DataTableState<T>;
  sessionView: SessionView;
  setSessionView: (next: SessionView) => void;
}

/** Column widths and visual renames count. A snapshot that lost them is a different layout. */
const signatureOf = (state: TableState): string =>
  JSON.stringify([state.columns, state.sort, state.groupBy]);

const useTableView = <T>(input: UseTableViewInput<T>): TableView<T> => {
  const { rows, schema, viewKey, fallbackColumns, fallbackGroupBy } = input;

  // The same list seeds both sides, so a first render never captures a spurious change.
  const initial = useMemo(
    () => fallbackColumns ?? defaultColumns(schema),
    [fallbackColumns, schema],
  );

  // Same for grouping: a default only one side knew about would be captured as a change.
  const table = useDataTable({ rows, schema, initial, initialGroupBy: fallbackGroupBy });
  const view = useViewState(viewKey, schema, initial, fallbackGroupBy);

  const tableSignature = signatureOf(table);
  const snapshotSignature = signatureOf(view.snapshot);
  const inSync = tableSignature === snapshotSignature;

  const { setState } = table;
  const { snapshot, setSnapshot } = view;

  useEffect(() => {
    if (inSync) return;
    setState(restore(snapshot).table);
  }, [snapshotSignature]);

  useEffect(() => {
    if (inSync) return;
    setSnapshot(capture(table, snapshot.filters, snapshot.tab));
  }, [tableSignature]);

  return { table, sessionView: view.sessionView, setSessionView: view.setSessionView };
};

export { signatureOf, useTableView };
export type { TableView, UseTableViewInput };
