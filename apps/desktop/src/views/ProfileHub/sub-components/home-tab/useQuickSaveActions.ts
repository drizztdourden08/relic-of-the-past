/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import { saveState, loadState } from '../../../../game';
import { log } from '../../../../log-bus';
import { ensureGameRunning } from './ensure-game-running';
import type { UseQuickSaveActionsParams } from './home-tab.type';

const useQuickSaveActions = ({ isGameRunning, onStartGame, loadQuickSlots }: UseQuickSaveActionsParams) => {
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
    if (await ensureGameRunning(isGameRunning, onStartGame)) await loadState(slot);
    setBusySlot(null);
  }, [isGameRunning, onStartGame]);

  return { busySlot, handleQuickSave, handleQuickLoad };
};

export { useQuickSaveActions };
