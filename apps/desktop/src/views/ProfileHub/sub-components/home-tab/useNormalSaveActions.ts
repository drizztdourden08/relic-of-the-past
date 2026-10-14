/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import { captureStateBuffer, loadStateFromBuffer } from '../../../../game';
import { saveMusicPosition, restoreMusicPosition } from '../../../../game/msu-save-glue';
import { log } from '../../../../log-bus';
import * as savesStore from '@app/storage/saves-store';
import { defaultSaveName } from './default-save-name';
import { ensureGameRunning } from './ensure-game-running';
import { captureCanvasScreenshot } from './capture-canvas-screenshot';
import type { UseNormalSaveActionsParams } from './home-tab.type';

const useNormalSaveActions = (params: UseNormalSaveActionsParams) => {
  const { profileId, isGameRunning, onStartGame, setBusyNormal, setDialog, loadNormalSaves } = params;
  const [newSaveName, setNewSaveName] = useState('');

  const handleCreateNormalSave = useCallback(() => {
    setNewSaveName(defaultSaveName());
    setDialog({ type: 'create' });
  }, [setDialog]);

  const handleConfirmCreate = useCallback(async () => {
    setDialog({ type: null });
    const name = newSaveName.trim() || defaultSaveName();
    setBusyNormal('__creating__');
    log.app(`Creating normal save: "${name}"`);
    const ab = captureStateBuffer();
    if (!ab) { setBusyNormal(null); return; }
    const screenshot = await captureCanvasScreenshot();
    const created = await savesStore.createNormalSave(profileId, name, ab, screenshot);
    if (created.id) await saveMusicPosition(profileId, 'normal', created.id);
    await loadNormalSaves();
    setBusyNormal(null);
  }, [profileId, newSaveName, setDialog, setBusyNormal, loadNormalSaves]);

  const handleLoadNormal = useCallback(async (id: string) => {
    setBusyNormal(id);
    log.app(`Loading normal save: ${id}`);
    const ready = await ensureGameRunning(isGameRunning, onStartGame);
    const buffer = ready ? await savesStore.loadNormalSave(profileId, id) : null;
    if (buffer) {
      loadStateFromBuffer(buffer);
      await restoreMusicPosition(profileId, 'normal', id);
    }
    setBusyNormal(null);
  }, [profileId, isGameRunning, onStartGame, setBusyNormal]);

  const handleRenameNormal = useCallback(async (id: string, newName: string) => {
    await savesStore.renameNormalSave(profileId, id, newName);
    await loadNormalSaves();
  }, [profileId, loadNormalSaves]);

  return { newSaveName, setNewSaveName, handleCreateNormalSave, handleConfirmCreate, handleLoadNormal, handleRenameNormal };
};

export { useNormalSaveActions };
