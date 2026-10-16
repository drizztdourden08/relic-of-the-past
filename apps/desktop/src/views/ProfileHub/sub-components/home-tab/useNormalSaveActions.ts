/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import { captureStateBuffer } from '@app/game';
import { saveMusicPosition } from '@app/game/msu-save-glue';
import { log } from '@app/log-bus';
import * as savesStore from '@app/storage/saves-store';
import { captureCanvasScreenshot } from './capture-canvas-screenshot';
import { defaultSaveName } from './default-save-name';
import { loadStoredSave } from './load-stored-save';
import { undoKey } from './undo/undo-key';
import { useUndoableLoad } from './undo/useUndoableLoad';
import type { UseNormalSaveActionsParams } from './home-tab.type';

const useNormalSaveActions = (params: UseNormalSaveActionsParams) => {
  const { profileId, isGameRunning, onStartGame, loadNormalSaves, undo } = params;
  const [busyNormal, setBusyNormal] = useState<string | null>(null);
  const loadWithUndo = useUndoableLoad({ isGameRunning, onStartGame, undo });

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
    await loadWithUndo(undoKey('normal', id), () => loadStoredSave(profileId, 'normal', id));
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
    undo.offer({
      key: undoKey('normal', id),
      kind: 'saved',
      undo: async () => {
        await savesStore.writeSlotContents(profileId, ref, previous);
        await loadNormalSaves();
      },
    });
  }, [profileId, loadNormalSaves, undo]);

  const handleDeleteNormal = useCallback((id: string) => {
    undo.offer({
      key: undoKey('normal', id),
      kind: 'deleted',
      commit: async () => {
        await savesStore.deleteNormalSave(profileId, id);
        await loadNormalSaves();
      },
    });
  }, [profileId, loadNormalSaves, undo]);

  const handleRenameNormal = useCallback(async (id: string, newName: string) => {
    await savesStore.renameNormalSave(profileId, id, newName);
    await loadNormalSaves();
  }, [profileId, loadNormalSaves]);

  return {
    busyNormal, handleCreateNormalSave, handleLoadNormal, handleOverwriteNormal, handleDeleteNormal, handleRenameNormal,
  };
};

export { useNormalSaveActions };
