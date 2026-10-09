/* @layer site-kit @kind hook */
import { useCallback, useState } from 'react';
import { useViewState, capture } from '@drizztdourden08/tessera/data';
import type { SchemaLike, FilterClause } from '@drizztdourden08/tessera/data';
import type { SiteViews } from './create-view-storage.type';
import { useSavedViews } from './useSavedViews';
import { NO_COLUMNS, QUERY_HALF_TABLE } from './useSurfaceView.constants';

const useSurfaceView = (views: SiteViews, surface: string, schema: SchemaLike) => {
  const { keys, storage } = views;
  const [nonce, setNonce] = useState(0);
  const reload = useCallback(() => setNonce((n) => n + 1), []);

  const queryKey = keys.keyFor(surface, 'query', nonce);
  const { snapshot, setSnapshot } = useViewState(queryKey, schema, NO_COLUMNS, undefined, storage);
  const clauses = snapshot.filters;
  const setClauses = useCallback((next: readonly FilterClause[]) => {
    setSnapshot(capture(QUERY_HALF_TABLE, next, snapshot.tab, snapshot.collapsed));
  }, [setSnapshot, snapshot.tab, snapshot.collapsed]);

  const [search, setSearch] = useState('');

  const savedViews = useSavedViews({ views, surface, onApplied: reload });

  return {
    tableKey: keys.keyFor(surface, 'table', nonce),
    storage,
    clauses,
    setClauses,
    search,
    setSearch,
    savedViews,
  };
};

export { useSurfaceView };
