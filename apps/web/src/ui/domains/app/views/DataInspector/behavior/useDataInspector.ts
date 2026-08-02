/* @layer renderer-app @kind logic */
/**
 * All of the screen's state in one place, so the component stays a layout.
 *
 * Two things are worth naming. The rows are filtered by a compiled clause list
 * rather than by a hand-written predicate — a clause is data, which is what
 * lets the filter survive a restart. And the durable half lives under the
 * query key only: the table owns its own binding under a key of its own, so
 * neither writer can overwrite what the other stores (see the note on the key
 * builders).
 */
import { useCallback, useMemo, useState } from 'react';
import { buildSchema, capture, compile, useViewState } from '@ds/data';
import { COLLECTION_SOURCES } from './collection-sources';
import { queryViewKey } from '../DataInspector.constants';
import { useRecordSelection } from './useRecordSelection';
import type { EntityKind } from '@shared/game/data';
import type {
  DetailTab, FilterClause, TableColumn, TableState,
} from '@ds/data';
import type { IdRefTarget } from '../DataInspector.type';

const DEFAULT_KIND: EntityKind = 'screen';
const DEFAULT_TAB: DetailTab = 'json';
const NO_COLUMNS: readonly TableColumn[] = [];

/** This key stores clauses and the open tab; its table half is deliberately empty. */
const NO_TABLE: TableState = { columns: [], sort: [], groupBy: [] };

const useDataInspector = () => {
  const [kind, setKind] = useState<EntityKind>(DEFAULT_KIND);
  const source = COLLECTION_SOURCES[kind];
  const schema = useMemo(() => buildSchema(source.rows, source.config), [source]);

  const { snapshot, setSnapshot } = useViewState(queryViewKey(kind), schema, NO_COLUMNS);
  const { selectedId, selectIn } = useRecordSelection(kind);

  const clauses = snapshot.filters;
  const tab = snapshot.tab ?? DEFAULT_TAB;

  const rows = useMemo(() => source.rows.filter(compile(clauses, schema)), [source, clauses, schema]);

  // Looked up in the whole collection, not in `rows`: following a reference
  // must open the record it points at even when the active filter hides it.
  const record = useMemo(
    () => (selectedId ? source.rows.find(row => source.getId(row) === selectedId) : undefined),
    [source, selectedId],
  );

  const setClauses = useCallback((next: readonly FilterClause[]) => {
    setSnapshot(capture(NO_TABLE, next, snapshot.tab));
  }, [setSnapshot, snapshot.tab]);

  const setTab = useCallback((next: DetailTab) => {
    setSnapshot(capture(NO_TABLE, snapshot.filters, next));
  }, [setSnapshot, snapshot.filters]);

  const selectRecord = useCallback((id: string) => selectIn(kind, id), [selectIn, kind]);

  // The delete-guard's own success path: once a record is gone, nothing is
  // left to show in the detail pane for its old id.
  const clearSelection = useCallback(() => selectIn(kind, null), [selectIn, kind]);

  const showKind = useCallback((next: string) => setKind(next as EntityKind), []);

  const openIdRef = useCallback((target: IdRefTarget) => {
    selectIn(target.kind, target.id);
    setKind(target.kind);
  }, [selectIn]);

  return {
    kind, showKind, source, schema, rows,
    clauses, setClauses, tab, setTab,
    selectedId, record, selectRecord, clearSelection, openIdRef,
  };
};

export { useDataInspector };
