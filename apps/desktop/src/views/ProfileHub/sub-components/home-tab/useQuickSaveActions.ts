/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import * as savesStore from '@app/storage/saves-store';
import { saveState, loadState } from '../../../../game';
import { log } from '../../../../log-bus';
import { startForLoad } from './start-for-load';
import type { UseQuickSaveActionsParams } from './home-tab.type';

const useQuickSaveActions = ({ profileId, isGameRunning, onStartGame, loadQuickSlots }: UseQuickSaveActionsParams) => {
  const [busySlot, setBusySlot] = useState<number | null>(null);

  const handleQuickSave = useCallback(async (slot: number) => {
    setBusySlot(slot);
    log.app(`Saving state to slot ${slot + 1}`);
    await saveState(slot);
    await loadQuickSlots();
    setBusySlot(null);
  }, [loadQuickSlots]);

  const handleQuickLoad = useCallback(async (slot: number) => {
    setBusySlot(slot);
    log.app(`Loading state from slot ${slot + 1}`);
    const buffer = await savesStore.readState(profileId, slot);
    if (await startForLoad(buffer, isGameRunning, onStartGame)) await loadState(slot);
    setBusySlot(null);
  }, [profileId, isGameRunning, onStartGame]);

  return { busySlot, handleQuickSave, handleQuickLoad };
};

export { useQuickSaveActions };
