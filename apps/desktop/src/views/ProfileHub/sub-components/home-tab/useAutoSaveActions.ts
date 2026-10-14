/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import { loadStateFromBuffer } from '../../../../game';
import { restoreMusicPosition } from '../../../../game/msu-save-glue';
import { log } from '../../../../log-bus';
import * as savesStore from '@app/storage/saves-store';
import { ensureGameRunning } from './ensure-game-running';
import type { UseAutoSaveActionsParams } from './home-tab.type';

const useAutoSaveActions = ({ profileId, isGameRunning, onStartGame, loadAutoSaves }: UseAutoSaveActionsParams) => {
  const [busyAuto, setBusyAuto] = useState<string | null>(null);

  const handleLoadAuto = useCallback(async (id: string) => {
    setBusyAuto(id);
    log.app(`Loading auto-save: ${id}`);
    const ready = await ensureGameRunning(isGameRunning, onStartGame);
    const buffer = ready ? await savesStore.loadAutoSave(profileId, id) : null;
    if (buffer) {
      loadStateFromBuffer(buffer);
      await restoreMusicPosition(profileId, 'auto', id);
    }
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
