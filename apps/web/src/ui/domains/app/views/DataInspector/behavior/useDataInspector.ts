/* @layer renderer-app @kind logic */
/**
 * All of the screen's state, so the component stays a layout. Rows are
 * filtered by a compiled clause list (data, so the filter survives a restart).
 * The durable half lives under the query key only (see the key builders). The
 * recommendations pseudo-collection has no `COLLECTION_SOURCES` entry, so the
 * source is chosen, not looked up.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildSchema, capture, compile, useViewState } from '@ds/data';
import { useDataViewStore } from '@app/stores/data-view-store';
import { COLLECTION_SOURCES } from './collection-sources';
import { RECOMMENDATIONS_KIND, isEntityKind, queryViewKey } from '../DataInspector.constants';
import { recommendationSource } from './recommendations/recommendation-source';
import { useRecommendations } from './recommendations/use-recommendations';
import { useRecordSelection } from './useRecordSelection';
import type { EntityKind } from '@shared/game/data';
import type {
  DetailTab, FilterClause, TableColumn, TableState,
} from '@ds/data';
import type { IdRefTarget, InspectorKind } from '../DataInspector.type';

const DEFAULT_KIND: EntityKind = 'screen';
const DEFAULT_TAB: DetailTab = 'json';
const NO_COLUMNS: readonly TableColumn[] = [];

/** This key stores clauses and the open tab; its table half is deliberately empty. */
const NO_TABLE: TableState = { columns: [], sort: [], groupBy: [] };

const useDataInspector = () => {
  const [kind, setKind] = useState<InspectorKind>(DEFAULT_KIND);
  // The record `openRecord` last asked for; forces the editor tab open for it
  // (see `tab`) and stops applying once `kind`/`selectedId` move on.
  const [editIntent, setEditIntent] = useState<{ kind: EntityKind; id: string } | null>(null);

  const entries = useRecommendations();
  // A real collection's source is stable until the kind changes; the
  // pseudo-collection's is rebuilt whenever a pass or a verdict lands.
  const source = useMemo(
    () => (isEntityKind(kind) ? COLLECTION_SOURCES[kind] : recommendationSource(entries)),
    [kind, entries],
  );
  const schema = useMemo(() => buildSchema(source.rows, source.config), [source]);

  const { snapshot, setSnapshot } = useViewState(queryViewKey(kind), schema, NO_COLUMNS);
  const { selectedId, selectIn } = useRecordSelection(kind);

  const clauses = snapshot.filters;
  // `openRecord` wants its record open in the editor, so a matching
  // `editIntent` wins over the remembered tab for that record only.
  const tab = (editIntent && isEntityKind(kind) && editIntent.kind === kind && editIntent.id === selectedId)
    ? 'editor'
    : snapshot.tab ?? DEFAULT_TAB;
  const detailCollapsed = snapshot.collapsed ?? false;

  const rows = useMemo(() => source.rows.filter(compile(clauses, schema)), [source, clauses, schema]);

  // Looked up in the whole collection, not in `rows`: following a reference
  // must open the record it points at even when the active filter hides it.
  const record = useMemo(
    () => (selectedId ? source.rows.find(row => source.getId(row) === selectedId) : undefined),
    [source, selectedId],
  );

  const setClauses = useCallback((next: readonly FilterClause[]) => {
    setSnapshot(capture(NO_TABLE, next, snapshot.tab, snapshot.collapsed));
  }, [setSnapshot, snapshot.tab, snapshot.collapsed]);

  const setTab = useCallback((next: DetailTab) => {
    // A hand-picked tab retires a pending edit intent; otherwise the override
    // above would force the editor tab straight back open.
    setEditIntent(null);
    setSnapshot(capture(NO_TABLE, snapshot.filters, next, snapshot.collapsed));
  }, [setSnapshot, snapshot.filters, snapshot.collapsed]);

  const selectRecord = useCallback((id: string) => selectIn(kind, id), [selectIn, kind]);

  const clearSelection = useCallback(() => selectIn(kind, null), [selectIn, kind]);

  /** Always keyed to the pseudo-collection, so a verdict can advance the pass. */
  const selectRecommendation = useCallback(
    (id: string | null) => selectIn(RECOMMENDATIONS_KIND, id),
    [selectIn],
  );

  const showKind = useCallback((next: string) => setKind(next as InspectorKind), []);

  const openIdRef = useCallback((target: IdRefTarget) => {
    selectIn(target.kind, target.id);
    setKind(target.kind);
  }, [selectIn]);

  // Persisted per collection like the clauses and the tab, so the fold survives a restart.
  const toggleDetail = useCallback(() => {
    setSnapshot(capture(NO_TABLE, snapshot.filters, snapshot.tab, !detailCollapsed));
  }, [setSnapshot, snapshot.filters, snapshot.tab, detailCollapsed]);

  // A finding requested elsewhere (data-view-store's `openRecommendation`).
  // Consumed on arrival, so coming back does not re-open what was reviewed.
  const pending = useDataViewStore(state => state.pendingRecommendation);
  const clearPending = useDataViewStore(state => state.clearPendingRecommendation);
  useEffect(() => {
    if (!pending) return;
    setKind(RECOMMENDATIONS_KIND);
    selectIn(RECOMMENDATIONS_KIND, pending.id);
    clearPending();
  }, [pending, selectIn, clearPending]);

  // Same handoff for a plain record (data-view-store's `openRecord`). This one
  // also wants the editor tab, hence `editIntent`.
  const pendingRecord = useDataViewStore(state => state.pendingRecord);
  const clearPendingRecord = useDataViewStore(state => state.clearPendingRecord);
  useEffect(() => {
    if (!pendingRecord) return;
    setKind(pendingRecord.kind);
    selectIn(pendingRecord.kind, pendingRecord.id);
    setEditIntent(pendingRecord);
    clearPendingRecord();
  }, [pendingRecord, selectIn, clearPendingRecord]);

  return {
    kind, showKind, source, schema, rows, entries,
    clauses, setClauses, tab, setTab,
    selectedId, record, selectRecord, selectRecommendation, clearSelection, openIdRef,
    detailCollapsed, toggleDetail,
  };
};

export { useDataInspector };
