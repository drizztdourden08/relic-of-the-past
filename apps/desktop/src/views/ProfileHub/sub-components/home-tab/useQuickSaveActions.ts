/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import { toast } from '@drizztdourden08/tessera/composites';
import { saveState, loadState } from '@app/game';
import { log } from '@app/log-bus';
import * as savesStore from '@app/storage/saves-store';
import { runQuietly } from './undo/run-quietly';
import { useUndoableLoad } from './undo/useUndoableLoad';
import { REPLACED_TOAST_ID, UNDO_WINDOW_MS } from './home-tab.constants';
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
    toast({
      id: REPLACED_TOAST_ID,
      message: `Slot ${slot + 1} saved`,
      duration: UNDO_WINDOW_MS,
      undo: () => void runQuietly(async () => {
        await savesStore.writeSlotContents(profileId, ref, previous);
        await loadQuickSlots();
      }, 'undo the change'),
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
