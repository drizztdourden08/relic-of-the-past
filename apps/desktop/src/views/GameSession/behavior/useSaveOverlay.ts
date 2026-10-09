/* @layer renderer-appshell @kind hook */
import { useCallback } from 'react';
import { useEnhancedSaveSlot } from '@app/ui/domains/app/views/SaveStateOverlay/behavior/useEnhancedSaveSlot';
import { useSaveOverlayStore } from '@app/stores/save-overlay-store';

const useSaveOverlay = (saveState: { enhancedSaveSlot: boolean; saveHoldDuration: number }, isRunning: boolean) => {
  const shown = useSaveOverlayStore((s) => s.shown);
  const toggle = useSaveOverlayStore((s) => s.toggle);
  const hide = useSaveOverlayStore((s) => s.hide);
  const enhanced = useEnhancedSaveSlot(saveState.enhancedSaveSlot, saveState.saveHoldDuration, isRunning);

  const open = (shown && isRunning) || enhanced.open;

  const close = useCallback(() => {
    hide();
    enhanced.close();
  }, [enhanced, hide]);

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
