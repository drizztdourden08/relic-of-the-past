/* @layer renderer-app @kind hook */
import { useCallback } from 'react';
import { DEFAULT_SESSION_VIEW, useDataViewStore } from '@app/stores/data-view-store';
import type { InspectorKind, RecordSelection } from '../DataInspector.type';
import { queryViewKey } from './query-view-key';

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
