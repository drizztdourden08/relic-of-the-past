/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import { saveState, loadState } from '@app/game';
import { log } from '@app/log-bus';
import * as savesStore from '@app/storage/saves-store';
import { undoKey } from './undo/undo-key';
import { useUndoableLoad } from './undo/useUndoableLoad';
import type { UseQuickSaveActionsParams } from './home-tab.type';

const useQuickSaveActions = (params: UseQuickSaveActionsParams) => {
  const { profileId, isGameRunning, onStartGame, loadQuickSlots, undo } = params;
  const [busySlot, setBusySlot] = useState<number | null>(null);
  const loadWithUndo = useUndoableLoad({ isGameRunning, onStartGame, undo });

  const handleQuickSave = useCallback(async (slot: number) => {
    setBusySlot(slot);
    log.app(`Saving state to slot ${slot + 1}`);
    const ref = { kind: 'quick', slot } as const;
    const previous = await savesStore.readSlotContents(profileId, ref);
    const saved = await saveState(slot);
    await loadQuickSlots();
    setBusySlot(null);
    if (!saved) return;
    undo.offer({
      key: undoKey('quick', slot),
      kind: 'saved',
      undo: async () => {
        await savesStore.writeSlotContents(profileId, ref, previous);
        await loadQuickSlots();
      },
    });
  }, [profileId, loadQuickSlots, undo]);

  const handleQuickLoad = useCallback(async (slot: number) => {
    setBusySlot(slot);
    log.app(`Loading state from slot ${slot + 1}`);
    await loadWithUndo(undoKey('quick', slot), () => loadState(slot));
    setBusySlot(null);
  }, [loadWithUndo]);

  return { busySlot, handleQuickSave, handleQuickLoad };
};

export { useQuickSaveActions };
