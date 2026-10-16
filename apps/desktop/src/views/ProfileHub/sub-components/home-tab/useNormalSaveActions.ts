/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import { captureStateBuffer } from '@app/game';
import { saveMusicPosition } from '@app/game/msu-save-glue';
import { log } from '@app/log-bus';
import * as savesStore from '@app/storage/saves-store';
import { captureCanvasScreenshot } from './capture-canvas-screenshot';
import { defaultSaveName } from './default-save-name';
import { loadStoredSave } from './load-stored-save';
import { offerUndo } from './undo/offer-undo';
import { useUndoableLoad } from './undo/useUndoableLoad';
import { REPLACED_TOAST_ID } from './home-tab.constants';
import type { UseNormalSaveActionsParams } from './home-tab.type';

const useNormalSaveActions = (params: UseNormalSaveActionsParams) => {
  const { profileId, isGameRunning, onStartGame, loadNormalSaves } = params;
  const [busyNormal, setBusyNormal] = useState<string | null>(null);
  const loadWithUndo = useUndoableLoad({ isGameRunning, onStartGame });

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
    await loadWithUndo('Save loaded', () => loadStoredSave(profileId, 'normal', id));
    setBusyNormal(null);
  }, [profileId, loadWithUndo]);

  const handleOverwriteNormal = useCallback(async (id: string) => {
    const state = captureStateBuffer();
    if (!state) return;
    setBusyNormal(id);
    log.app(`Overwriting normal save: ${id}`);
    const ref = { kind: 'normal', id } as const;
    const previous = await savesStore.readSlotContents(profileId, ref);
    await savesStore.overwriteNormalSave(profileId, id, state, await captureCanvasScreenshot());
    await saveMusicPosition(profileId, 'normal', id);
    await loadNormalSaves();
    setBusyNormal(null);
    if (!previous) return;
    offerUndo({
      id: REPLACED_TOAST_ID,
      message: 'Save replaced',
      undo: async () => {
        await savesStore.writeSlotContents(profileId, ref, previous);
        await loadNormalSaves();
      },
    });
  }, [profileId, loadNormalSaves]);

  const handleDeleteNormal = useCallback(async (id: string) => {
    await savesStore.deleteNormalSave(profileId, id);
    await loadNormalSaves();
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
