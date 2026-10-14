/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { loadState, saveState } from '../../../game';
import { log } from '../../../log-bus';

const useSlotActions = (loadSlots: () => Promise<void>, onClose: () => void) => {
  const [busy, setBusy] = useState<number | null>(null);

  const handleSave = useCallback(async (slot: number) => {
    setBusy(slot);
    log.app(`[UI] Save to slot ${slot}`);
    await saveState(slot);
    await loadSlots();
    setBusy(null);
  }, [loadSlots]);

  const handleLoad = useCallback(async (slot: number) => {
    setBusy(slot);
    log.app(`[UI] Load from slot ${slot}`);
    await loadState(slot);
    setBusy(null);
    onClose();
  }, [onClose]);

  return { busy, handleSave, handleLoad };
};

export { useSlotActions };
