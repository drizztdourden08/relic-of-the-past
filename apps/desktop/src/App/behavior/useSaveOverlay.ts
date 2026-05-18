import { useState, useCallback } from 'react';
import { useEnhancedSaveSlot } from '../../components/views/SaveStateOverlay/behavior/useEnhancedSaveSlot';

const useSaveOverlay = (saveState: { enhancedSaveSlot: boolean; saveHoldDuration: number }, isRunning: boolean) => {
  const [showSaveStates, setShowSaveStates] = useState(false);
  const enhanced = useEnhancedSaveSlot(saveState.enhancedSaveSlot, saveState.saveHoldDuration, isRunning);

  const open = (showSaveStates && isRunning) || enhanced.open;

  const close = useCallback(() => {
    setShowSaveStates(false);
    enhanced.close();
  }, [enhanced]);

  const toggle = useCallback(() => setShowSaveStates(v => !v), []);

  return {
    open,
    toggle,
    close,
    highlightedSlot: enhanced.highlightedSlot,
    holdProgress: enhanced.holdProgress,
    hints: enhanced.hints,
  };
};

export { useSaveOverlay };
