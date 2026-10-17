/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import * as savesStore from '@app/storage/saves-store';
import { ensureGameRunning } from './ensure-game-running';
import { loadStoredSave } from './load-stored-save';
import type { UseAutoSaveActionsParams } from './home-tab.type';

const useAutoSaveActions = (params: UseAutoSaveActionsParams) => {
  const { profileId, isGameRunning, onStartGame, loadAutoSaves } = params;
  const [busyAuto, setBusyAuto] = useState<string | null>(null);

  const handleLoadAuto = useCallback(async (id: string) => {
    setBusyAuto(id);
    if (await ensureGameRunning(isGameRunning, onStartGame)) await loadStoredSave(profileId, 'auto', id);
    setBusyAuto(null);
  }, [profileId, isGameRunning, onStartGame]);

  const handleDeleteAuto = useCallback(async (id: string) => {
    setBusyAuto(id);
    await savesStore.deleteAutoSave(profileId, id);
    await loadAutoSaves();
    setBusyAuto(null);
  }, [profileId, loadAutoSaves]);

  return { busyAuto, handleLoadAuto, handleDeleteAuto };
};

export { useAutoSaveActions };
