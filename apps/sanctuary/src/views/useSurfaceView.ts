/* @layer sanctuary-site @kind hook */
/**
 * Everything a page needs to run FilterBar + DataTable over one surface: the table key
 * to hand the table, the clause list of the query half, the transient search text and
 * the saved views. Applying a saved view bumps the nonce, which changes both keys, so the
 * table and the clauses reload from the storage cache the view was just written to.
 */
import { useCallback, useState } from 'react';
import type { ViewSurface } from '@shared/sanctuary/types';
import { useViewState } from '@ds/data/view-state/use-view-state';
import { capture } from '@ds/data/view-state/snapshot';
import type { SchemaLike } from '@ds/data/schema/build-schema';
import type { FilterClause } from '@ds/data/filter/clause';
import type { TableColumn, TableState } from '@ds/data/table/types';
import { sanctuaryViewStorage } from './sanctuary-view-storage';
import { useSavedViews } from './useSavedViews';
import { viewKeyFor } from './view-keys';

const NO_COLUMNS: readonly TableColumn[] = [];
/** The query half stores clauses only; its table part is deliberately empty. */
const NO_TABLE: TableState = { columns: [], sort: [], groupBy: [] };

const useSurfaceView = (surface: ViewSurface, schema: SchemaLike) => {
  const [nonce, setNonce] = useState(0);
  const reload = useCallback(() => setNonce((n) => n + 1), []);

  const queryKey = viewKeyFor(surface, 'query', nonce);
  const { snapshot, setSnapshot } = useViewState(queryKey, schema, NO_COLUMNS, undefined, sanctuaryViewStorage);
  const clauses = snapshot.filters;
  const setClauses = useCallback((next: readonly FilterClause[]) => {
    setSnapshot(capture(NO_TABLE, next, snapshot.tab, snapshot.collapsed));
  }, [setSnapshot, snapshot.tab, snapshot.collapsed]);

  // The search is a moment's question, never saved: old text silently hiding rows reads as loss.
  const [search, setSearch] = useState('');

  const savedViews = useSavedViews({ surface, onApplied: reload });

  return {
    tableKey: viewKeyFor(surface, 'table', nonce),
    storage: sanctuaryViewStorage,
    clauses,
    setClauses,
    search,
    setSearch,
    savedViews,
  };
};

export { useSurfaceView };
