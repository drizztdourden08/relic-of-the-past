/* @layer renderer-app @kind logic */
/**
 * All of the screen's state in one place, so the component stays a layout.
 *
 * Three things are worth naming. The rows are filtered by a compiled clause
 * list rather than by a hand-written predicate — a clause is data, which is
 * what lets the filter survive a restart. The durable half lives under the
 * query key only: the table owns its own binding under a key of its own, so
 * neither writer can overwrite what the other stores (see the note on the key
 * builders). And the active kind can be the recommendations pseudo-collection,
 * which has no `COLLECTION_SOURCES` entry at all — asking for one would throw —
 * so the source is chosen rather than looked up.
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
  // The one record `openRecord` most recently asked for, kept only long enough
  // to force the editor tab open for it — see `tab` below. Self-expiring: it
  // stops applying the moment `kind`/`selectedId` move on to anything else, so
  // it never re-forces the editor tab on an unrelated later visit to the same
  // collection.
  const [editIntent, setEditIntent] = useState<{ kind: EntityKind; id: string } | null>(null);

  const entries = useRecommendations();
  // A real collection's source is a stable object behind a lazy getter, so this
  // memo hands back the same one until the kind changes; the pseudo-collection's
  // is rebuilt whenever a pass or a verdict changed what it holds.
  const source = useMemo(
    () => (isEntityKind(kind) ? COLLECTION_SOURCES[kind] : recommendationSource(entries)),
    [kind, entries],
  );
  const schema = useMemo(() => buildSchema(source.rows, source.config), [source]);

  const { snapshot, setSnapshot } = useViewState(queryViewKey(kind), schema, NO_COLUMNS);
  const { selectedId, selectIn } = useRecordSelection(kind);

  const clauses = snapshot.filters;
  // `openRecord` wants the record it names to open ALREADY in the editor, not
  // merely selected on whatever tab this collection last remembered — so the
  // one matching `editIntent` wins over the durable choice, for exactly the
  // record it was asked for and no longer than that.
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
    // Any tab the user picks by hand retires a still-pending edit intent —
    // otherwise the override above would immediately force the editor tab
    // straight back open on the very next render.
    setEditIntent(null);
    setSnapshot(capture(NO_TABLE, snapshot.filters, next, snapshot.collapsed));
  }, [setSnapshot, snapshot.filters, snapshot.collapsed]);

  const selectRecord = useCallback((id: string) => selectIn(kind, id), [selectIn, kind]);

  // The delete-guard's own success path: once a record is gone, nothing is
  // left to show in the detail pane for its old id.
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

  // Persisted the same way the filter clauses and the open tab are — keyed to
  // this collection, so the fold survives switching collections and reopening
  // the app rather than resetting every time the panel mounts.
  const toggleDetail = useCallback(() => {
    setSnapshot(capture(NO_TABLE, snapshot.filters, snapshot.tab, !detailCollapsed));
  }, [setSnapshot, snapshot.filters, snapshot.tab, detailCollapsed]);

  // Somebody elsewhere asked for a finding to be shown (see data-view-store's
  // `openRecommendation`). The request is consumed the moment it lands, so
  // arriving here again does not re-open what was already reviewed.
  const pending = useDataViewStore(state => state.pendingRecommendation);
  const clearPending = useDataViewStore(state => state.clearPendingRecommendation);
  useEffect(() => {
    if (!pending) return;
    setKind(RECOMMENDATIONS_KIND);
    selectIn(RECOMMENDATIONS_KIND, pending.id);
    clearPending();
  }, [pending, selectIn, clearPending]);

  // Same handoff, for a plain record rather than a finding (see data-view-store's
  // `openRecord`) — a widget's edit button or a reference it renders. Unlike a
  // recommendation this one also wants the editor tab, hence `editIntent`.
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
