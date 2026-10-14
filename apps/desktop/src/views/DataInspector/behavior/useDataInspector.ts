/* @layer renderer-app @kind hook */
import { useCallback, useMemo, useState } from 'react';
import { buildSchema, capture, compile, compileTextSearch, useViewState } from '@drizztdourden08/tessera/data';
import type { DetailTab, FilterClause } from '@drizztdourden08/tessera/data';
import {
  DEFAULT_KIND, DEFAULT_TAB, NO_COLUMNS, NO_TABLE, RECOMMENDATIONS_KIND,
} from '../DataInspector.constants';
import type { EditIntent, IdRefTarget, InspectorKind } from '../DataInspector.type';
import { COLLECTION_SOURCES } from '@app/data-inspector/collection-sources';
import { isEntityKind } from './is-entity-kind';
import { queryViewKey } from './query-view-key';
import { recommendationSource } from '@app/data-inspector/recommendations/recommendation-source';
import { useRecommendations } from '@app/data-inspector/recommendations/use-recommendations';
import { usePendingOpen } from './usePendingOpen';
import { useRecordSelection } from './useRecordSelection';

const useDataInspector = () => {
  const [kind, setKind] = useState<InspectorKind>(DEFAULT_KIND);
  const [editIntent, setEditIntent] = useState<EditIntent | null>(null);

  const entries = useRecommendations();
  const source = useMemo(
    () => (isEntityKind(kind) ? COLLECTION_SOURCES[kind] : recommendationSource(entries)),
    [kind, entries],
  );
  const schema = useMemo(() => buildSchema(source.rows, source.config), [source]);

  const { snapshot, setSnapshot } = useViewState({ key: queryViewKey(kind), schema, fallbackColumns: NO_COLUMNS });
  const { selectedId, selectIn } = useRecordSelection(kind);

  const clauses = snapshot.filters;
  const tab = (editIntent && isEntityKind(kind) && editIntent.kind === kind && editIntent.id === selectedId)
    ? 'editor'
    : snapshot.tab ?? DEFAULT_TAB;
  const detailCollapsed = snapshot.collapsed ?? false;

  const [search, setSearch] = useState('');
  const rows = useMemo(() => {
    const matched = source.rows.filter(compile(clauses, schema));
    const test = compileTextSearch(search);
    return test ? matched.filter(test) : matched;
  }, [source, clauses, schema, search]);

  const record = useMemo(
    () => (selectedId ? source.rows.find(row => source.getId(row) === selectedId) : undefined),
    [source, selectedId],
  );

  const setClauses = useCallback((next: readonly FilterClause[]) => {
    setSnapshot(capture(NO_TABLE, next, snapshot.tab, snapshot.collapsed));
  }, [setSnapshot, snapshot.tab, snapshot.collapsed]);

  const setTab = useCallback((next: DetailTab) => {
    setEditIntent(null);
    setSnapshot(capture(NO_TABLE, snapshot.filters, next, snapshot.collapsed));
  }, [setSnapshot, snapshot.filters, snapshot.collapsed]);

  const selectRecord = useCallback((id: string) => selectIn(kind, id), [selectIn, kind]);

  const clearSelection = useCallback(() => selectIn(kind, null), [selectIn, kind]);

  const selectRecommendation = useCallback(
    (id: string | null) => selectIn(RECOMMENDATIONS_KIND, id),
    [selectIn],
  );

  const showKind = useCallback((next: string) => setKind(next as InspectorKind), []);

  const openIdRef = useCallback((target: IdRefTarget) => {
    selectIn(target.kind, target.id);
    setKind(target.kind);
  }, [selectIn]);

  const setDetailCollapsed = useCallback((next: boolean) => {
    setSnapshot(capture(NO_TABLE, snapshot.filters, snapshot.tab, next));
  }, [setSnapshot, snapshot.filters, snapshot.tab]);

  usePendingOpen({ setKind, selectIn, setEditIntent });

  return {
    kind, showKind, source, schema, rows, entries,
    clauses, setClauses, search, setSearch, tab, setTab,
    selectedId, record, selectRecord, selectRecommendation, clearSelection, openIdRef,
    detailCollapsed, setDetailCollapsed,
  };
};

export { useDataInspector };
