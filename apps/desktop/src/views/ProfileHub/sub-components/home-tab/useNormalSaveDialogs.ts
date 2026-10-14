/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { captureStateBuffer } from '../../../../game';
import { saveMusicPosition } from '../../../../game/msu-save-glue';
import { log } from '../../../../log-bus';
import * as savesStore from '@app/storage/saves-store';
import { captureCanvasScreenshot } from './capture-canvas-screenshot';
import type { UseNormalSaveDialogsParams } from './home-tab.type';

const useNormalSaveDialogs = (params: UseNormalSaveDialogsParams) => {
  const { profileId, dialog, setDialog, normalSaves, setBusyNormal, loadNormalSaves } = params;

  const handleOverwriteNormal = useCallback((id: string) => {
    const save = normalSaves.find((s) => s.id === id);
    setDialog({ type: 'overwrite', targetId: id, targetName: save?.name ?? 'this save' });
  }, [normalSaves, setDialog]);

  const handleConfirmOverwrite = useCallback(async () => {
    const id = dialog.targetId;
    setDialog({ type: null });
    if (!id) return;
    setBusyNormal(id);
    log.app(`Overwriting normal save: ${id}`);
    const ab = captureStateBuffer();
    if (!ab) { setBusyNormal(null); return; }
    const screenshot = await captureCanvasScreenshot();
    await savesStore.overwriteNormalSave(profileId, id, ab, screenshot);
    await saveMusicPosition(profileId, 'normal', id);
    await loadNormalSaves();
    setBusyNormal(null);
  }, [profileId, dialog, setDialog, setBusyNormal, loadNormalSaves]);

  const handleDeleteNormal = useCallback((id: string) => {
    const save = normalSaves.find((s) => s.id === id);
    setDialog({ type: 'delete', targetId: id, targetName: save?.name ?? 'this save' });
  }, [normalSaves, setDialog]);

  const handleConfirmDelete = useCallback(async () => {
    const id = dialog.targetId;
    setDialog({ type: null });
    if (!id) return;
    setBusyNormal(id);
    await savesStore.deleteNormalSave(profileId, id);
    await loadNormalSaves();
    setBusyNormal(null);
  }, [profileId, dialog, setDialog, setBusyNormal, loadNormalSaves]);

  return { handleOverwriteNormal, handleConfirmOverwrite, handleDeleteNormal, handleConfirmDelete };
};

export { useNormalSaveDialogs };
