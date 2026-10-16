/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import { saveState, loadState } from '@app/game';
import { log } from '@app/log-bus';
import * as savesStore from '@app/storage/saves-store';
import { offerUndo } from './undo/offer-undo';
import { useUndoableLoad } from './undo/useUndoableLoad';
import { REPLACED_TOAST_ID } from './home-tab.constants';
import type { UseQuickSaveActionsParams } from './home-tab.type';

const useQuickSaveActions = (params: UseQuickSaveActionsParams) => {
  const { profileId, isGameRunning, onStartGame, loadQuickSlots } = params;
  const [busySlot, setBusySlot] = useState<number | null>(null);
  const loadWithUndo = useUndoableLoad({ isGameRunning, onStartGame });

  const handleQuickSave = useCallback(async (slot: number) => {
    setBusySlot(slot);
    log.app(`Saving state to slot ${slot + 1}`);
    const ref = { kind: 'quick', slot } as const;
    const previous = await savesStore.readSlotContents(profileId, ref);
    const saved = await saveState(slot);
    await loadQuickSlots();
    setBusySlot(null);
    if (!saved) return;
    offerUndo({
      id: REPLACED_TOAST_ID,
      message: `Slot ${slot + 1} saved`,
      undo: async () => {
        await savesStore.writeSlotContents(profileId, ref, previous);
        await loadQuickSlots();
      },
    });
  }, [profileId, loadQuickSlots]);

  const handleQuickLoad = useCallback(async (slot: number) => {
    setBusySlot(slot);
    log.app(`Loading state from slot ${slot + 1}`);
    await loadWithUndo(`Slot ${slot + 1} loaded`, () => loadState(slot));
    setBusySlot(null);
  }, [loadWithUndo]);

  return { busySlot, handleQuickSave, handleQuickLoad };
};

export { useQuickSaveActions };
