/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import { captureStateBuffer } from '@app/game';
import { saveMusicPosition } from '@app/game/msu-save-glue';
import { log } from '@app/log-bus';
import * as savesStore from '@app/storage/saves-store';
import { captureCanvasScreenshot } from './capture-canvas-screenshot';
import { defaultSaveName } from './default-save-name';
import { ensureGameRunning } from './ensure-game-running';
import { loadStoredSave } from './load-stored-save';
import type { UseNormalSaveActionsParams } from './home-tab.type';

const useNormalSaveActions = (params: UseNormalSaveActionsParams) => {
  const { profileId, isGameRunning, onStartGame, loadNormalSaves } = params;
  const [busyNormal, setBusyNormal] = useState<string | null>(null);

  const handleCreateNormalSave = useCallback(async (typed: string): Promise<string | null> => {
    const state = captureStateBuffer();
    if (!state) return null;
    const name = typed.trim() || defaultSaveName();
    log.app(`Creating normal save: "${name}"`);
    const created = await savesStore.createNormalSave(profileId, name, state, await captureCanvasScreenshot());
    await saveMusicPosition(profileId, 'normal', created.id);
    await loadNormalSaves();
    return created.id;
  }, [profileId, loadNormalSaves]);

  const handleLoadNormal = useCallback(async (id: string) => {
    setBusyNormal(id);
    if (await ensureGameRunning(isGameRunning, onStartGame)) await loadStoredSave(profileId, 'normal', id);
    setBusyNormal(null);
  }, [profileId, isGameRunning, onStartGame]);

  const handleOverwriteNormal = useCallback(async (id: string) => {
    const state = captureStateBuffer();
    if (!state) return;
    setBusyNormal(id);
    log.app(`Overwriting normal save: ${id}`);
    await savesStore.overwriteNormalSave(profileId, id, state, await captureCanvasScreenshot());
    await saveMusicPosition(profileId, 'normal', id);
    await loadNormalSaves();
    setBusyNormal(null);
  }, [profileId, loadNormalSaves]);

  const handleDeleteNormal = useCallback(async (id: string) => {
    setBusyNormal(id);
    await savesStore.deleteNormalSave(profileId, id);
    await loadNormalSaves();
    setBusyNormal(null);
  }, [profileId, loadNormalSaves]);

  const handleRenameNormal = useCallback(async (id: string, newName: string) => {
    await savesStore.renameNormalSave(profileId, id, newName);
    await loadNormalSaves();
  }, [profileId, loadNormalSaves]);

  return {
    busyNormal, handleCreateNormalSave, handleLoadNormal, handleOverwriteNormal, handleDeleteNormal, handleRenameNormal,
  };
};

export { useNormalSaveActions };
