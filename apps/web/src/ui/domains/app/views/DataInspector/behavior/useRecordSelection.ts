/* @layer renderer-app @kind logic */
/**
 * Which record is open, per collection, for the session only: switching
 * collections and back lands where you were, but yesterday's selection is not
 * worth restoring. Written through the store, not `useViewState`, because
 * following an id reference must select a record in a collection that is not
 * active yet; a hook bound to the current key would need a render in between.
 */
import { useCallback } from 'react';
import { DEFAULT_SESSION_VIEW, useDataViewStore } from '@app/stores/data-view-store';
import { queryViewKey } from '../DataInspector.constants';
import type { InspectorKind } from '../DataInspector.type';

interface RecordSelection {
  selectedId: string | null;
  /** Selects a record in ANY collection, active or not. */
  selectIn: (kind: InspectorKind, id: string | null) => void;
}

const useRecordSelection = (kind: InspectorKind): RecordSelection => {
  const selectedId = useDataViewStore(
    state => (state.views[queryViewKey(kind)] ?? DEFAULT_SESSION_VIEW).selectedId,
  );
  const setSessionView = useDataViewStore(state => state.setSessionView);

  const selectIn = useCallback((target: InspectorKind, id: string | null) => {
    const key = queryViewKey(target);
    const current = useDataViewStore.getState().views[key] ?? DEFAULT_SESSION_VIEW;
    setSessionView(key, { ...current, selectedId: id });
  }, [setSessionView]);

  return { selectedId, selectIn };
};

export { useRecordSelection };
export type { RecordSelection };
