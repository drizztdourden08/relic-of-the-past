/* @layer renderer-app @kind hook */
import { useEffect } from 'react';
import { useDataViewStore } from '@app/stores/data-view-store';
import { RECOMMENDATIONS_KIND } from '../DataInspector.constants';
import type { PendingOpenParams } from '../DataInspector.type';

const usePendingOpen = (params: PendingOpenParams): void => {
  const { setKind, selectIn, setEditIntent } = params;

  const pending = useDataViewStore(state => state.pendingRecommendation);
  const clearPending = useDataViewStore(state => state.clearPendingRecommendation);
  useEffect(() => {
    if (!pending) return;
    setKind(RECOMMENDATIONS_KIND);
    selectIn(RECOMMENDATIONS_KIND, pending.id);
    clearPending();
  }, [pending, setKind, selectIn, clearPending]);

  const pendingRecord = useDataViewStore(state => state.pendingRecord);
  const clearPendingRecord = useDataViewStore(state => state.clearPendingRecord);
  useEffect(() => {
    if (!pendingRecord) return;
    setKind(pendingRecord.kind);
    selectIn(pendingRecord.kind, pendingRecord.id);
    setEditIntent(pendingRecord);
    clearPendingRecord();
  }, [pendingRecord, setKind, selectIn, setEditIntent, clearPendingRecord]);
};

export { usePendingOpen };
