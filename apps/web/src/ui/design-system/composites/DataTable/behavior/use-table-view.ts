/* @layer renderer-components @kind hook */
/**
 * The Memento round trip, and the only place the table meets persistence: the
 * headless table hook on one side, a keyed view snapshot on the other, and two
 * guarded effects between them.
 *
 * Both effects compare the SAME canonical signature, so they converge after one
 * pass in either direction: a restored snapshot is pushed into the table and
 * then captures back identically, and a user edit captures out and then
 * restores back identically. Without a key `useViewState` is purely in-memory,
 * so this costs nothing and the table still works with zero persistence setup.
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
}

interface TableView<T> {
  table: DataTableState<T>;
  sessionView: SessionView;
  setSessionView: (next: SessionView) => void;
}

/** Column widths and visual renames count — a snapshot that lost them is not the same layout. */
const signatureOf = (state: TableState): string =>
  JSON.stringify([state.columns, state.sort, state.groupBy]);

const useTableView = <T>(input: UseTableViewInput<T>): TableView<T> => {
  const { rows, schema, viewKey, fallbackColumns } = input;

  // The same list seeds both sides, so a first render never captures a spurious change.
  const initial = useMemo(
    () => fallbackColumns ?? defaultColumns(schema),
    [fallbackColumns, schema],
  );

  const table = useDataTable({ rows, schema, initial });
  const view = useViewState(viewKey, schema, initial);

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
