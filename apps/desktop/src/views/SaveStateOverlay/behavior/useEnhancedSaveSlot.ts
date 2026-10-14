/* @layer renderer-components @kind hook */
import { useState, useEffect, useCallback, useRef } from 'react';
import { getInputManager } from '../../../game';
import type { HoldState, SaveSlotShortcutState, ShortcutContext, SlotHint } from '../SaveStateOverlay.type';
import { cancelHold } from './cancel-hold';
import { createHoldState } from './create-hold-state';
import { handleFunctionKeyUp } from './handle-function-key-up';
import { registerSlotActions } from './register-slot-actions';
import { resetHold } from './reset-hold';
import { useCancelOnOtherInput } from './useCancelOnOtherInput';

const useEnhancedSaveSlot = (
  enabled: boolean,
  holdDurationSec: number,
  gameRunning: boolean,
): SaveSlotShortcutState => {
  const [open, setOpen] = useState(false);
  const [highlightedSlot, setHighlightedSlot] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [hints, setHints] = useState<SlotHint[]>([]);

  const pendingSlotRef = useRef<number | null>(null);
  const holdRef = useRef<HoldState>(createHoldState());
  const openRef = useRef(false);

  const holdDurationMs = holdDurationSec * 1000;

  const close = useCallback(() => {
    setOpen(false);
    setHighlightedSlot(null);
    setHoldProgress(0);
    setHints([]);
    pendingSlotRef.current = null;
    resetHold(holdRef.current);
    openRef.current = false;
  }, []);

  useEffect(() => { openRef.current = open; }, [open]);

  useEffect(() => {
    if (!gameRunning) close();
  }, [gameRunning, close]);

  useCancelOnOtherInput(open, close);

  useEffect(() => {
    if (!gameRunning) return;

    const inputMgr = getInputManager();
    const ctx: ShortcutContext = {
      enabled,
      holdDurationMs,
      mappings: inputMgr.getFunctionMappings(),
      hold: holdRef.current,
      pending: pendingSlotRef,
      isOpen: openRef,
      setOpen,
      setHighlightedSlot,
      setHoldProgress,
      setHints,
      close,
    };
    const unsubs = registerSlotActions(ctx, inputMgr);
    unsubs.push(inputMgr.onFunctionKeyUp((action) => handleFunctionKeyUp(ctx, action)));

    return () => {
      unsubs.forEach((unsub) => unsub());
      cancelHold(ctx);
    };
  }, [gameRunning, enabled, holdDurationMs, close]);

  return {
    open,
    highlightedSlot,
    holdProgress,
    hints,
    close,
  };
};

export { useEnhancedSaveSlot };
export type { HintAction, SlotHint } from '../SaveStateOverlay.type';
