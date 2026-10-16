/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import * as savesStore from '@app/storage/saves-store';
import { loadStoredSave } from './load-stored-save';
import { useUndoableLoad } from './undo/useUndoableLoad';
import type { UseAutoSaveActionsParams } from './home-tab.type';

const useAutoSaveActions = (params: UseAutoSaveActionsParams) => {
  const { profileId, isGameRunning, onStartGame, loadAutoSaves } = params;
  const [busyAuto, setBusyAuto] = useState<string | null>(null);
  const loadWithUndo = useUndoableLoad({ isGameRunning, onStartGame });

  const handleLoadAuto = useCallback(async (id: string) => {
    setBusyAuto(id);
    await loadWithUndo('Auto-save loaded', () => loadStoredSave(profileId, 'auto', id));
    setBusyAuto(null);
  }, [profileId, loadWithUndo]);

  const handleDeleteAuto = useCallback(async (id: string) => {
    await savesStore.deleteAutoSave(profileId, id);
    await loadAutoSaves();
  }, [profileId, loadAutoSaves]);

  return { busyAuto, handleLoadAuto, handleDeleteAuto };
};

export { useAutoSaveActions };
