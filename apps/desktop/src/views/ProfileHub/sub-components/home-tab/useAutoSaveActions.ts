/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import * as savesStore from '@app/storage/saves-store';
import { loadStoredSave } from './load-stored-save';
import { STORED_SAVE_READERS } from './load-stored-save.constants';
import { startForLoad } from './start-for-load';
import type { UseAutoSaveActionsParams } from './home-tab.type';

const useAutoSaveActions = (params: UseAutoSaveActionsParams) => {
  const { profileId, isGameRunning, onStartGame, loadAutoSaves } = params;
  const t = useT();
  const [busyAuto, setBusyAuto] = useState<string | null>(null);

  const handleLoadAuto = useCallback(async (id: string) => {
    setBusyAuto(id);
    const buffer = await STORED_SAVE_READERS.auto(profileId, id);
    if (await startForLoad(buffer, isGameRunning, onStartGame, t) && buffer) await loadStoredSave(profileId, 'auto', id, buffer);
    setBusyAuto(null);
  }, [profileId, isGameRunning, onStartGame, t]);

  const handleDeleteAuto = useCallback(async (id: string) => {
    setBusyAuto(id);
    await savesStore.deleteAutoSave(profileId, id);
    await loadAutoSaves();
    setBusyAuto(null);
  }, [profileId, loadAutoSaves]);

  return { busyAuto, handleLoadAuto, handleDeleteAuto };
};

export { useAutoSaveActions };
