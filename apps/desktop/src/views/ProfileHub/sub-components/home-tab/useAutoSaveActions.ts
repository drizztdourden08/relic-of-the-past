/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import * as savesStore from '@app/storage/saves-store';
import { loadStoredSave } from './load-stored-save';
import { undoKey } from './undo/undo-key';
import { useUndoableLoad } from './undo/useUndoableLoad';
import type { UseAutoSaveActionsParams } from './home-tab.type';

const useAutoSaveActions = (params: UseAutoSaveActionsParams) => {
  const { profileId, isGameRunning, onStartGame, loadAutoSaves, undo } = params;
  const [busyAuto, setBusyAuto] = useState<string | null>(null);
  const loadWithUndo = useUndoableLoad({ isGameRunning, onStartGame, undo });

  const handleLoadAuto = useCallback(async (id: string) => {
    setBusyAuto(id);
    await loadWithUndo(undoKey('auto', id), () => loadStoredSave(profileId, 'auto', id));
    setBusyAuto(null);
  }, [profileId, loadWithUndo]);

  const handleDeleteAuto = useCallback((id: string) => {
    undo.offer({
      key: undoKey('auto', id),
      kind: 'deleted',
      commit: async () => {
        await savesStore.deleteAutoSave(profileId, id);
        await loadAutoSaves();
      },
    });
  }, [profileId, loadAutoSaves, undo]);

  return { busyAuto, handleLoadAuto, handleDeleteAuto };
};

export { useAutoSaveActions };
